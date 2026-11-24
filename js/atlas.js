import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SISTEMAS,infoSistema} from './catalogo.js';
import {desplazamientoCapa} from './capasCuerpo.js';
import {PERFILES_OCULARES,grupoMaterialOcular,materialOcular} from './ojoColor.js';

// BodyParts3D empaquetado en bloques GZIP; geometría real con vértices, índices y normales.
export class Atlas3D {
 constructor(api,manifest){
  this.api=api;this.active=true;this.manifest=manifest;this.parts=manifest.parts;this.partById=new Map(this.parts.map((p,i)=>[p.id,i]));
  this.visible=new Set(['integumentary']);this.selected=-1;this.isolated=false;this.explode=0;
  this.data=new Float32Array(Math.pow(2,Math.ceil(Math.log2(Math.max(1,this.parts.length))))*4);this.texWidth=this.data.length/4;
  this.stateTexture=new THREE.DataTexture(this.data,this.texWidth,1,THREE.RGBAFormat,THREE.FloatType);this.stateTexture.magFilter=THREE.NearestFilter;this.stateTexture.minFilter=THREE.NearestFilter;this.stateTexture.needsUpdate=true;
  this.boxes=this.parts.map(p=>new THREE.Box3(new THREE.Vector3(...p.bounds[0]),new THREE.Vector3(...p.bounds[1])));
  this.centers=this.boxes.map(b=>b.getCenter(new THREE.Vector3()));this.pickMeshes=new Array(this.parts.length);
  this.combined=[];this.sourceGeos=[];this.systemMats=new Map();this.offsets=new Array(this.parts.length).fill(null).map(()=>new THREE.Vector3());this.onSelect=()=>{};this.onChange=()=>{};
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.tmpBox=new THREE.Box3();this.hitPoint=new THREE.Vector3();
  this.selectionPart=null;this.selectionBounds=null;this.selectionCenter=null;this.selectionIndices=null;this.selectionOwnGeometry=false;
  this.selectionMesh=null;this.selectionGhost=null;this.selectionRing=null;this.selectionLink=null;this.selectionBloom=null;this.wire=null;this.normalArrows=[];this.showWire=false;this.showNormals=false;
  this._materialesAntesDeSeleccion=null;this.returning=false;this.liftEnabled=true;this.liftAmount=.56;this.reducedMotion=false;this.liftProgress=0;this.floatOffset=new THREE.Vector3();this.floatTarget=new THREE.Vector3();
  // V12: la pieza aislada se traslada al CENTRO del escenario (sin copias ni anillos).
  this.inspectionCenter=new THREE.Vector3(0,.9,0);this.inspectionProgress=0;
  this.transform={tx:0,ty:0,tz:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1};this.partCountLoaded=0;this.pickerMaterial=new THREE.MeshBasicMaterial();
  this._setMaterials();this._setPickEvents();
 }
 _setMaterials(){
  for(const s of [...SISTEMAS,{id:'hair',color:'#302833'},...Object.entries(PERFILES_OCULARES).map(([id,p])=>({id,...p}))]){
   const isSkin=s.id==='integumentary';const ocular=Boolean(PERFILES_OCULARES[s.id]);const mat=ocular?materialOcular(THREE,s.id):new THREE.MeshPhysicalMaterial({color:s.color,roughness:isSkin?.81:s.id==='hair'?.9:['cardiac','respiratory','digestive'].includes(s.id)?.52:s.id==='muscular'?.68:.75,metalness:0,clearcoat:isSkin?.055:['cardiac','respiratory'].includes(s.id)?.1:.025,clearcoatRoughness:.62,side:THREE.DoubleSide,transparent:false,opacity:1,depthWrite:true});
   mat.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:this.stateTexture};shader.uniforms.partWidth={value:this.texWidth};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform float partWidth; varying float vPartVisible;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec2 stateUv = vec2((partIndex + 0.5) / partWidth, 0.5);
      vec4 transformState = texture2D(partState, stateUv);
      transformed += transformState.xyz;
      vPartVisible = transformState.w;`);
    shader.fragmentShader='varying float vPartVisible;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
      if (vPartVisible < 0.5) discard;`);
   };
   this.systemMats.set(s.id,mat);
  }
 }
 // Primera pantalla rápida: cargar la geometría exterior antes de las capas internas.
 // El resto se carga en segundo plano mientras el usuario ya puede mover el modelo.
 async load(onProgress){
  const chunks=this.manifest.chunks;
  const exteriores=[...new Set(this.parts.filter(p=>p.system==='integumentary').map(p=>p.chunk))];
  const resto=chunks.map((_,i)=>i).filter(i=>!exteriores.includes(i));
  let terminados=0;const totalTareas=chunks.length;
  const registrar=()=>{terminados++;onProgress?.(Math.round(terminados/totalTareas*100),this.partCountLoaded);};
  // Leer cada bloque una sola vez, incluso si contiene piel y órganos.
  await Promise.all(exteriores.map(async i=>{await this._loadChunk(i);registrar();}));
  this.recompute();this.primeraVistaLista=true;
  this.cargaCompleta=(async()=>{
   let cursor=0;
   const worker=async()=>{while(cursor<resto.length){const i=resto[cursor++];await this._loadChunk(i);registrar();}};
   await Promise.all(Array.from({length:2},worker));
   this.recompute();return true;
  })();
  return this;
 }
 async _loadChunk(ci,{soloPiel=false}={}){
  const c=this.manifest.chunks[ci];
  if(typeof DecompressionStream==='undefined')throw Error('El navegador no admite DecompressionStream. Abre la aplicación con Chrome o Edge reciente.');
  const response=await fetch(c.gzip);if(!response.ok)throw Error(`Error HTTP ${response.status} al cargar ${c.gzip}`);
  let bytes;
  try{
   const raw=await response.arrayBuffer(),head=new Uint8Array(raw,0,Math.min(2,raw.byteLength));
   // Algunos servidores descomprimen automáticamente el gzip HTTP; ambos casos son válidos.
   bytes=head[0]===0x1f&&head[1]===0x8b
    ?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
    :raw;
  }catch(e){throw Error('No se pudo descomprimir la geometría: '+e.message);}
  if(bytes.byteLength!==c.bytes)throw Error(`Bloque ${ci}: tamaño de geometría incorrecto (${bytes.byteLength}/${c.bytes}).`);
  const batches=new Map();
  for(let i=0;i<this.parts.length;i++){
   const p=this.parts[i];if(p.chunk!==ci||soloPiel&&p.system!=='integumentary'||this.pickMeshes[i])continue;
   const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(bytes,p.positions,p.vertexCount*3),3));
   g.setAttribute('normal',new THREE.BufferAttribute(new Int16Array(bytes,p.normals,p.vertexCount*3),3,true));
   g.setIndex(new THREE.BufferAttribute(new Uint32Array(bytes,p.indices,p.indexCount),1));
   g.setAttribute('partIndex',new THREE.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
   g.boundingBox=this.boxes[i].clone();g.computeBoundingSphere();this.sourceGeos.push(g);
   const picker=new THREE.Mesh(g,this.pickerMaterial);picker.matrixAutoUpdate=false;picker.updateMatrix();picker.updateMatrixWorld(true);this.pickMeshes[i]=picker;
   const materialGroup=grupoMaterialOcular(p)||(p.system==='integumentary'&&/hair|eyebrow|eyelash/i.test(p.name)?'hair':p.system);
   if(!batches.has(materialGroup))batches.set(materialGroup,[]);batches.get(materialGroup).push(g);this.partCountLoaded++;
  }
  for(const [system,geos] of batches){const geom=mergeGeometries(geos,false);if(!geom)throw Error('Error al unir las geometrías de '+system);
   const mesh=new THREE.Mesh(geom,this.systemMats.get(system));mesh.name=infoSistema(system==='hair'?'integumentary':system).name;mesh.userData.capa=system;mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=true;this.api.scene.add(mesh);this.combined.push(mesh);
   this.api.applyClipping(mesh.material);
  }
  this.recompute();
 }
 _setPickEvents(){
  const el=this.api.renderer.domElement;let down=null;
  this._down=e=>{if(!this.active||e.button!==0)return;down={x:e.clientX,y:e.clientY,time:performance.now(),pointerId:e.pointerId};};el.addEventListener('pointerdown',this._down);
  this._up=e=>{if(!this.active||e.button!==0||!down||down.pointerId!==e.pointerId||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;const rect=el.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);const part=this.pick(this.pointer);if(part>=0 && (this.selectionPart||part!==this.selected))this.select(part);};el.addEventListener('pointerup',this._up);this._cancel=()=>{down=null;};el.addEventListener('pointercancel',this._cancel);el.addEventListener('pointerleave',this._cancel);
 }
 pick(pointer){
  this.raycaster.setFromCamera(pointer,this.api.camera);let best=-1,minDist=Infinity;
  if(this.selectionIndices&&this.selectionMesh){const hit=this.raycaster.intersectObject(this.selectionMesh,false).find(v=>!this.api.cut||this.api.plane.distanceToPoint(v.point)>=-.0001);if(!hit)return -1;let fin=0;for(const i of this.selectionIndices){const g=this.pickMeshes[i].geometry;fin+=Math.floor((g.index?.count||g.attributes.position.count)/3);if(hit.faceIndex<fin)return i;}return -1;}
  // Primero AABB: evita raycasting exacto sobre miles de triángulos innecesarios.
  const skipSkin=this.explode===0&&this.visible.size>1&&this.visible.has('integumentary')&&this.systemMats.get('integumentary').opacity<.99;
  for(let i=0;i<this.parts.length;i++){
   const p=this.parts[i],mesh=this.pickMeshes[i];if(!mesh)continue;
   if(i!==this.selected&&(this.isolated||this.selectionIndices?.includes(i)||!this.visible.has(p.system)||skipSkin&&p.system==='integumentary'))continue;
   const tested=i===this.selected?this.selectionMesh:mesh;if(!tested)continue;
   if(i===this.selected){this.tmpBox.copy(this.selectionBounds||this.boxes[i]).applyMatrix4(tested.matrixWorld);}else{this.tmpBox.copy(this.boxes[i]).translate(this.offsets[i]);}
   if(!this.raycaster.ray.intersectBox(this.tmpBox,this.hitPoint))continue;
   const hits=this.raycaster.intersectObject(tested,false);
   const h=hits.find(v=>!this.api.cut||this.api.plane.distanceToPoint(v.point)>=-.0001);
   if(h&&h.distance<minDist){minDist=h.distance;best=i;}
  }
  return best;
 }
 select(idOrIndex){
  const next=typeof idOrIndex==='string'?this.partById.get(idOrIndex):idOrIndex;
  if(next===undefined||next<0||!this.pickMeshes[next])return false;
  if(this.selectionMesh){this._restaurarCapas();this._descartarSeleccionVisual();}
  this.selectionPart=null;this.selectionIndices=null;this.selectionBounds=null;this.selectionCenter=null;this.selectionOwnGeometry=false;
  // Conservar la preferencia de levitación al cambiar de componente.
  this.selected=next;this.isolated=true;this.inspectionProgress=0;this.transform={tx:0,ty:0,tz:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1};
  const part=this.parts[next];const esCabello=part.system==='integumentary'&&/hair|eyebrow|eyelash/i.test(part.name);
  const color=esCabello?'#302833':infoSistema(part.system).color;
  const humedo=['cardiac','respiratory','digestive','urinary','reproductive'].includes(part.system);
  const rugosidad=esCabello?.92:part.system==='skeletal'?.76:part.system==='muscular'?.62:humedo?.42:.66;
  const ocular=grupoMaterialOcular(part);const mat=ocular?materialOcular(THREE,ocular):new THREE.MeshPhysicalMaterial({color,metalness:0,roughness:rugosidad,clearcoat:humedo?.14:.025,clearcoatRoughness:.48,side:THREE.DoubleSide});
  this.api.applyClipping(mat);
  this.selectionMesh=new THREE.Mesh(this.pickMeshes[next].geometry,mat);this.selectionMesh.name=part.name;this.selectionMesh.castShadow=true;this.selectionMesh.receiveShadow=true;
  this.selectionMesh.matrixAutoUpdate=false;this.selectionMesh.frustumCulled=false;this.selectionMesh.renderOrder=2;this.api.scene.add(this.selectionMesh);
  this.returning=false;this.liftProgress=0;this.floatOffset.set(0,0,0);
  // Ocultar de verdad TODO el cuerpo: el shader de las mallas combinadas
  // descarta las piezas ocultas. No mostrar fantasmas semitransparentes.
  this._applyTransform();this._buildHelpers();this.recompute();this.onSelect(part,next);this.onChange();return true;
 }
 /* Ensambla un órgano a partir de varias geometrías REALES y lo aísla en el mismo visor.
    La malla combinada es temporal, nunca sustituye los archivos del atlas. */
 selectGroup(id,nombre,indices,nota=''){
  const elegidos=[...new Set(indices)].filter(i=>Number.isInteger(i)&&i>=0&&i<this.parts.length&&this.pickMeshes[i]?.geometry);
  if(!elegidos.length)return false;
  const geometry=mergeGeometries(elegidos.map(i=>this.pickMeshes[i].geometry),false);
  if(!geometry)return false;
  const bounds=new THREE.Box3();for(const i of elegidos)bounds.union(this.boxes[i]);
  if(this.selectionMesh){this._restaurarCapas();this._descartarSeleccionVisual();}
  this.selected=elegidos[0];this.selectionIndices=elegidos;this.selectionBounds=bounds;this.selectionCenter=bounds.getCenter(new THREE.Vector3());this.selectionOwnGeometry=true;
  this.selectionPart={id:'conjunto-'+id,name:nombre,system:this.parts[elegidos[0]].system,chunk:'varios',conceptId:'Conjunto · '+elegidos.length+' mallas',
   vertexCount:elegidos.reduce((acc,i)=>acc+this.parts[i].vertexCount,0),indexCount:elegidos.reduce((acc,i)=>acc+this.parts[i].indexCount,0),
   bounds:[bounds.min.toArray(),bounds.max.toArray()],nota,numeroMallas:elegidos.length};
  this.isolated=true;this.returning=false;this.inspectionProgress=0;this.liftProgress=0;
  this.floatOffset.set(0,0,0);this.transform={tx:0,ty:0,tz:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1};
  const material=new THREE.MeshPhysicalMaterial({color:infoSistema(this.selectionPart.system).color,roughness:.64,metalness:0,side:THREE.DoubleSide,clearcoat:.05});
  this.api.applyClipping(material);
  this.selectionMesh=new THREE.Mesh(geometry,material);this.selectionMesh.name=nombre;
  this.selectionMesh.matrixAutoUpdate=false;this.selectionMesh.frustumCulled=false;this.selectionMesh.castShadow=true;this.selectionMesh.receiveShadow=true;this.selectionMesh.renderOrder=2;
  this.api.scene.add(this.selectionMesh);this._applyTransform();this._buildHelpers();this.recompute();this.onSelect(this.selectionPart,this.selected);this.onChange();return true;
 }
 _descartarSeleccionVisual(){
  if(!this.selectionMesh)return;
  const mesh=this.selectionMesh;this.api.scene.remove(mesh);this._clearHelpers();this._removeSelectionFX();mesh.material.dispose();
  if(this.selectionOwnGeometry)mesh.geometry.dispose();this.selectionMesh=null;
 }
 _applyTransform(){if(!this.selectionMesh||this.selected<0)return;
  const t=this.transform,center=this.selectionCenter||this.centers[this.selected],offset=this.selectionPart?new THREE.Vector3():this.offsets[this.selected];
  const R=new THREE.Euler(THREE.MathUtils.degToRad(t.rx),THREE.MathUtils.degToRad(t.ry),THREE.MathUtils.degToRad(t.rz),'XYZ');
  const q=new THREE.Quaternion().setFromEuler(R);
  const middle=new THREE.Matrix4().compose(new THREE.Vector3(t.tx,t.ty,t.tz),q,new THREE.Vector3(t.sx,t.sy,t.sz));
  const M=new THREE.Matrix4().makeTranslation(center.x+offset.x+this.floatOffset.x,center.y+offset.y+this.floatOffset.y,center.z+offset.z+this.floatOffset.z)
    .multiply(middle).multiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));
  this.selectionMesh.matrix.copy(M);this.selectionMesh.matrixWorld.copy(M);this.selectionMesh.updateMatrixWorld(true);
 }

 // El órgano elevado usa exactamente esta traslación en su matriz real. No se
 // simulan desplazamientos únicamente con CSS.
 // Atenuar el resto del cuerpo sin sustituir los materiales anatómicos.
 // La pieza seleccionada conserva su propio material físico con su color original.
 _apagarCapasParaInspeccion(){
  this._restaurarCapas();
  this._materialesAntesDeSeleccion=new Map();
  const actual=this.parts[this.selected]?.system;
  for(const [id,mat] of this.systemMats){
   this._materialesAntesDeSeleccion.set(id,{opacity:mat.opacity,transparent:mat.transparent,depthWrite:mat.depthWrite});
   mat.transparent=true;
   mat.opacity=id==='integumentary'?.055:(id===actual?.19:.105);
   mat.depthWrite=false;
   mat.needsUpdate=true;
  }
 }
 _restaurarCapas(){
  if(!this._materialesAntesDeSeleccion)return;
  for(const [id,antes] of this._materialesAntesDeSeleccion){
   const mat=this.systemMats.get(id);if(!mat)continue;
   mat.opacity=antes.opacity;mat.transparent=antes.transparent;mat.depthWrite=antes.depthWrite;mat.needsUpdate=true;
  }
  this._materialesAntesDeSeleccion=null;
 }
 setReducedMotion(enabled){this.reducedMotion=Boolean(enabled);if(this.reducedMotion)this.inspectionProgress=1;}
 setLift(enabled){this.liftEnabled=Boolean(enabled);}
 setLiftAmount(amount){this.liftAmount=THREE.MathUtils.clamp(Number(amount),0,1);}
 returnSelection(){if(this.selected<0)return;this.clearSelection();}
 // V12: sin geometría decorativa (anillos, enlaces holográficos o fantasmas).
 _createSelectionFX(){}
 _removeSelectionFX(){}
 animate(now,delta=.016){
  if(!this.active||this.selected<0||!this.selectionMesh)return;
  const dt=Math.min(.08,Math.max(.001,delta));
  this.inspectionProgress=this.reducedMotion?1:THREE.MathUtils.damp(this.inspectionProgress,1,7.4,dt);
  // Mantener la inspección centrada, independientemente de la levitación.
  const centroOriginal=this.selectionCenter||this.centers[this.selected];
  const offsetOriginal=this.selectionPart?new THREE.Vector3():this.offsets[this.selected];
  this.floatTarget.copy(this.inspectionCenter).sub(centroOriginal).sub(offsetOriginal);
  this.floatOffset.copy(this.floatTarget).multiplyScalar(this.inspectionProgress);

  // La fuerza es una fracción real de la elevación. A 0 %, no hay movimiento.
  // Usar el tamaño del órgano evita un desplazamiento casi invisible en piezas grandes
  // y uno excesivo en elementos diminutos. Transición suave al activar/desactivar.
  const fuerza=THREE.MathUtils.clamp(Number(this.liftAmount)||0,0,1);
  const habilitada=this.liftEnabled&&!this.reducedMotion&&fuerza>0;
  this.liftProgress=THREE.MathUtils.damp(this.liftProgress,habilitada?1:0,5.5,dt);
  if(this.liftProgress>0.0001){
   const bounds=this.selectionBounds||this.boxes[this.selected];
   const tam=bounds.getSize(this._liftSize||(this._liftSize=new THREE.Vector3()));
   const escala=Math.max(tam.x,tam.y,tam.z,.01);
   const altura=THREE.MathUtils.clamp(escala*.18,.014,.12)*fuerza;
   const oscilacion=THREE.MathUtils.clamp(escala*.05,.007,.035)*fuerza;
   // La oscilación se aplica a la matriz 3D, no al panel HTML.
   this.floatOffset.y+=(altura+oscilacion*Math.sin(now*.0026))*this.liftProgress*this.inspectionProgress;
  }
  this._applyTransform();
 }
 clearSelection(){
  if(this.selectionMesh)this._descartarSeleccionVisual();
  this.selectionPart=null;this.selectionIndices=null;this.selectionBounds=null;this.selectionCenter=null;this.selectionOwnGeometry=false;
  this._restaurarCapas();
  this.selected=-1;this.returning=false;this.isolated=false;this.liftProgress=0;this.inspectionProgress=0;this.floatOffset.set(0,0,0);this.recompute();this.onSelect(null,-1);
 }
 setActive(on){this.active=!!on;this.recompute();if(this.selectionMesh)this.selectionMesh.visible=this.active;for(const v of [this.selectionGhost,this.selectionRing,this.selectionLink])if(v)v.visible=this.active;}
 disposeAtlas(){this.active=false;const el=this.api.renderer.domElement;el.removeEventListener('pointerdown',this._down);el.removeEventListener('pointerup',this._up);el.removeEventListener('pointercancel',this._cancel);el.removeEventListener('pointerleave',this._cancel);this.clearSelection();this.combined.forEach(m=>{this.api.scene.remove(m);m.geometry.dispose();});this.sourceGeos.forEach(g=>g.dispose());for(const m of this.systemMats.values())m.dispose();this.stateTexture.dispose();}
 setTransform(key,value){if(!(key in this.transform))return;this.transform[key]=Number(value);this._applyTransform();this.onChange();}
 resetTransform(){for(const k of Object.keys(this.transform))this.transform[k]=k.startsWith('s')?1:0;this._applyTransform();this.onChange();}
 setVisible(set){this.visible=new Set(set);this.isolated=false;this.recompute();}
 toggleSystem(system,enabled){if(enabled)this.visible.add(system);else this.visible.delete(system);this.recompute();}
 setIsolate(enabled){if(this.selected<0)return;this.isolated=Boolean(enabled);this.recompute();}
 visibleBounds(){return this.boxes.flatMap((b,i)=>this.pickMeshes[i]&&this.visible.has(this.parts[i].system)?[b.clone().translate(this.offsets[i])]:[]);}
 setExplode(value){this.explode=Math.max(0,Math.min(1,value));this.recompute();}
 recompute(){
  const seleccionados=this.selectionIndices?new Set(this.selectionIndices):null;
  for(let i=0;i<this.parts.length;i++){
   const p=this.parts[i];
   const off=this.offsets[i];off.set(...desplazamientoCapa(p.system,this.explode));
   this.data[i*4]=off.x;this.data[i*4+1]=off.y;this.data[i*4+2]=off.z;
   // Si un conjunto temporal está dibujado, ocultar TODAS sus fuentes.
   // En contexto (isolate=false) no debe aparecer doble geometría.
   const perteneceAlConjunto=seleccionados?.has(i)===true;
   const visible=this.isolated?false:(this.visible.has(p.system)||i===this.selected);
   this.data[i*4+3]=visible&&i!==this.selected&&!perteneceAlConjunto?1:0;
   const mesh=this.pickMeshes[i];if(mesh){mesh.position.copy(off);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
  }
  this.stateTexture.needsUpdate=true;
  // No enviar a la GPU los grupos ocultos: mejora FPS y evita mostrar músculos
  // por encima de la piel en la vista exterior.
  for(const mesh of this.combined){
   const capa=mesh.userData.capa;
   const visibleCapa=capa==='hair'?this.visible.has('integumentary'):this.visible.has(capa);
   mesh.visible=this.active&&!this.isolated&&visibleCapa;
  }
  this._applyTransform();
  if(this.selectionMesh)this.selectionMesh.visible=this.active;
  this.onChange();
 }
 _clearHelpers(){if(this.wire){this.wire.geometry.dispose();this.wire.material.dispose();}for(const arrow of this.normalArrows){arrow.line.geometry.dispose();arrow.line.material.dispose();arrow.cone.geometry.dispose();arrow.cone.material.dispose();}this.wire=null;this.normalArrows=[];}
 _buildHelpers(){
  const mesh=this.selectionMesh;if(!mesh)return;const geo=mesh.geometry,ids=geo.getIndex(),pos=geo.getAttribute('position'),n=geo.getAttribute('normal');
  // Muestreo real de aristas para no saturar la GPU en superficies grandes.
  const verts=[];const tris=ids.count/3,step=Math.max(1,Math.ceil(tris/4500));
  for(let t=0;t<tris;t+=step){let a=ids.getX(t*3),b=ids.getX(t*3+1),c=ids.getX(t*3+2);for(const [i,j] of [[a,b],[b,c],[c,a]]){verts.push(pos.getX(i),pos.getY(i),pos.getZ(i),pos.getX(j),pos.getY(j),pos.getZ(j));}}
  const wgeo=new THREE.BufferGeometry();wgeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  this.wire=new THREE.LineSegments(wgeo,new THREE.LineBasicMaterial({color:0xb8a7ff,transparent:true,opacity:.8,depthTest:false}));this.wire.visible=this.showWire;this.wire.renderOrder=5;this.api.applyClipping(this.wire.material);mesh.add(this.wire);
  const arrows=Math.min(30,Math.ceil(pos.count/500));for(let i=0;i<arrows;i++){
   const index=Math.floor(i*pos.count/arrows),p=new THREE.Vector3().fromBufferAttribute(pos,index),normal=new THREE.Vector3().fromBufferAttribute(n,index).normalize();if(normal.lengthSq()<.1)continue;
   const arrow=new THREE.ArrowHelper(normal,p,.048,0xffd27d,.011,.006);arrow.visible=this.showNormals;mesh.add(arrow);this.normalArrows.push(arrow);
  }
 }
 showHelpers(type,v){if(type==='wire'){this.showWire=v;if(this.wire)this.wire.visible=v;}if(type==='normals'){this.showNormals=v;this.normalArrows.forEach(a=>a.visible=v);}}
 setCut(on,offset=0,axis='x',invert=false){const center=this.selectionMesh?new THREE.Box3().setFromObject(this.selectionMesh).getCenter(new THREE.Vector3()):this.api.getBodyCenter();this.api.setCut(on,offset,axis,invert,center);for(const mat of this.systemMats.values())this.api.applyClipping(mat);if(this.selectionMesh)this.api.applyClipping(this.selectionMesh.material);if(this.selectionGhost)this.api.applyClipping(this.selectionGhost.material);if(this.wire)this.api.applyClipping(this.wire.material);}
 setSkinOpacity(n){const m=this.systemMats.get('integumentary');if(!m)return;const anterior=this._materialesAntesDeSeleccion?.get('integumentary');if(anterior){anterior.opacity=n;anterior.transparent=n<.999;anterior.depthWrite=n>=.999;}m.opacity=n;m.transparent=n<.999;m.depthWrite=n>=.999;m.needsUpdate=true;}
 selectedPart(){return this.selectionPart||this.parts[this.selected]||null;}
 selectedCounts(){return this.selectedPart()?{vertices:this.selectedPart().vertexCount,triangles:this.selectedPart().indexCount/3}:null;}
 visibleCount(){
  const visibles=this.parts.reduce((sum,p,i)=>sum+(this.data[i*4+3]>.5?1:0),0);
  return visibles+(this.selectionMesh?(this.selectionIndices?.length||1):0);
 }
}
