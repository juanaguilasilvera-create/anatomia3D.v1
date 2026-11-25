/** Ojo 3D de estudio: despiece educativo de mallas originales BodyParts3D.
 * NO se sustituye la anatomía local ni se afirma precisión clínica aumentada.
 * La subdivisión interpola triángulos originales, sin crear estructuras inventadas.
 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {grupoMaterialOcular,PERFILES_OCULARES,DESCRIPCIONES_OCULARES,materialOcular} from './ojoColor.js';

const ORDEN=['ojo-cornea','ojo-acuoso','ojo-iris','ojo-ciliar','ojo-zonulas','ojo-cristalino','ojo-vitreo','ojo-retina','ojo-coroides','ojo-esclerotica','ojo-nervio','ojo-lagrimal','ojo-parpado','ojo-otro'];
function indiceCapa(grupo){return Math.max(0,ORDEN.indexOf(grupo));}
function eyeItems(parts,side){
 const prefijo=side==='derecho'?'right':'left';
 const elegidos=[];
 for(let i=0;i<parts.length;i++){
  const p=parts[i],n=String(p.name||'').toLowerCase();
  const lado=n.startsWith(prefijo+' ') || n.startsWith('optic part of '+prefijo+' ')
   || n.startsWith('anterior chamber of '+prefijo+' ');
  if(!lado)continue;
  const grupo=grupoMaterialOcular(p);
  if(!grupo||!grupo.startsWith('ojo-'))continue;
  // No mezclar estructuras neurológicas de nombre similar (p. ej. plexo coroideo cerebral).
  if(!(/cornea|iris|choroid|ciliar|lens|retina|sclera|vitreous|lacrimal|tarsal|tendinous|suspensory ligament|eyelid|optic nerve|anterior chamber/.test(n)))continue;
  elegidos.push({index:i,part:p,grupo});
 }
 return elegidos.sort((a,b)=>indiceCapa(a.grupo)-indiceCapa(b.grupo));
}
function texturizarIris(geometria){
 // Variaciones radiales de pigmento en vértices: material original sin textura externa.
 const pos=geometria.getAttribute('position');if(!pos)return;
 const caja=geometria.boundingBox||new THREE.Box3().setFromBufferAttribute(pos);
 const c=caja.getCenter(new THREE.Vector3()),tam=caja.getSize(new THREE.Vector3());
 const radio=Math.max(tam.x,tam.y)*.5||1;
 const colores=new Float32Array(pos.count*3),color=new THREE.Color();
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i)-c.x,y=pos.getY(i)-c.y,angulo=Math.atan2(y,x),r=Math.hypot(x,y)/radio;
  const rayas=Math.sin(angulo*74+r*14)*.08+Math.sin(angulo*129-r*19)*.05;
  const h=THREE.MathUtils.clamp(.52+rayas*.32,.45,.58);
  const l=THREE.MathUtils.clamp(.35+rayas+Math.min(.3,r)*.16,.2,.58);
  color.setHSL(h,.53,l);colores[3*i]=color.r;colores[3*i+1]=color.g;colores[3*i+2]=color.b;
 }
 geometria.setAttribute('color',new THREE.Float32BufferAttribute(colores,3));
}
function subdividirUnaVez(original){
 const source=original.getAttribute('position'),idx=original.getIndex();
 if(!source||!idx||idx.count>45000)return original.clone();
 const positions=Array.from(source.array); // Float32Array de origen
 const normals=original.getAttribute('normal');
 const normalData=[];
 if(normals){for(let i=0;i<normals.count;i++)normalData.push(normals.getX(i),normals.getY(i),normals.getZ(i));}
 const middle=new Map(),newIndices=[];
 function midpoint(a,b){
  const key=a<b?`${a}_${b}`:`${b}_${a}`;
  const prev=middle.get(key);if(prev!==undefined)return prev;
  const j=positions.length/3;
  for(let k=0;k<3;k++)positions.push((positions[3*a+k]+positions[3*b+k])*.5);
  if(normalData.length){const x=normalData[3*a]+normalData[3*b],y=normalData[3*a+1]+normalData[3*b+1],z=normalData[3*a+2]+normalData[3*b+2],l=Math.hypot(x,y,z)||1;normalData.push(x/l,y/l,z/l);}
  middle.set(key,j);return j;
 }
 for(let i=0;i<idx.count;i+=3){
  const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);
  const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);
  newIndices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);
 }
 const out=new THREE.BufferGeometry();
 out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 out.setIndex(newIndices);
 if(normalData.length===positions.length)out.setAttribute('normal',new THREE.Float32BufferAttribute(normalData,3));
 else out.computeVertexNormals();
 out.computeBoundingBox();out.computeBoundingSphere();return out;
}
export function crearOjoDetallado({host,obtenerAtlas,avisar,onSeleccionar,onLimpiar,obtenerFondo,obtenerLevitacion}){
 let root=null,renderer=null,scene=null,camera=null,controls=null,grupo=null,observer=null,animacion=0;
 let lado='izquierdo',separacion=72,items=[],selected=-1,construyendo=false,solicitudOcular=0;
 const wrapper=document.createElement('section');wrapper.className='visor-ojo-detalle';wrapper.hidden=true;
 wrapper.setAttribute('aria-label','Modelo ocular 3D por capas');
 wrapper.innerHTML=`
 <div class="ojo-detalle-encabezado"><div><small>MODELO ANATÓMICO DETALLADO</small><strong>Ojo humano · estudio por capas</strong><span>Geometría de referencia BodyParts3D con materiales diferenciados</span></div><button class="ojo-cerrar" type="button" aria-label="Cerrar el modelo ocular">← Volver al atlas</button></div>
 <div class="ojo-vista"></div>
 <div class="ojo-detalle-controles"><label>Ojo <select class="ojo-lado"><option value="izquierdo">Izquierdo</option><option value="derecho">Derecho</option></select></label><label>Separación de capas <input class="ojo-separacion" aria-label="Separar capas oculares" type="range" min="0" max="100" value="72"><output class="ojo-nivel">72%</output></label></div>
 <div class="ojo-detalle-pie"><div class="ojo-detalle-info" role="status"><strong>Selecciona una capa</strong><p>Haz clic en una pieza o en su nombre. La ficha mostrará sus datos y podrás usar «Leer ficha».</p></div><div class="ojo-lista" aria-label="Capas oculares disponibles"></div></div>
 <small class="ojo-aviso">Vista educativa de estructuras disponibles; la subdivisión mejora el suavizado visual sin añadir precisión anatómica. No es un dispositivo médico.</small>`;
 host.appendChild(wrapper);
 const $=s=>wrapper.querySelector(s);
 const vista=$('.ojo-vista'),lista=$('.ojo-lista'),info=$('.ojo-detalle-info');
 const ojoActual=()=>obtenerAtlas();
 function updateInfo(item){
  if(!item){info.querySelector('strong').textContent='Selecciona una capa';info.querySelector('p').textContent='Haz clic en una pieza para consultar sus detalles en la ficha de la derecha.';return;}
  info.querySelector('strong').textContent=PERFILES_OCULARES[item.grupo]?.nombre||item.part.name;
  info.querySelector('p').textContent=DESCRIPCIONES_OCULARES[item.grupo]||'Estructura ocular del modelo original.';
 }
 function seleccionar(item){
  if(!item)return;
  selected=item.index;
  for(const t of items){const destacado=t.index===selected;const ms=t.malla?.material;if(ms){ms.emissive?.set(destacado?'#285248':'#000000');ms.emissiveIntensity=destacado?.20:0;}}
  lista.querySelectorAll('[data-ojo-parte]').forEach(b=>{const activo=Number(b.dataset.ojoParte)===selected;b.classList.toggle('active',activo);b.setAttribute('aria-pressed',String(activo));});
  updateInfo(item);
  onSeleccionar?.(item.index);
 }
 function render(now=0){animacion=requestAnimationFrame(render);const l=obtenerLevitacion?.();for(const t of items){const objetivo=t.index===selected&&l?.activa&&!l.reducida?(0.12+0.06*Math.sin(now*.0026))*Number(l.fuerza||0):0;t.malla.position.y=THREE.MathUtils.lerp(t.malla.position.y,objetivo,.12);t.malla.updateMatrixWorld(true);}const fondo=obtenerFondo?.();if(fondo?.isColor)scene.background.copy(fondo);controls?.update();renderer?.render(scene,camera);}
 function disposeView(){
  if(animacion)cancelAnimationFrame(animacion);animacion=0;
  observer?.disconnect();observer=null;controls?.dispose();controls=null;
  if(grupo){grupo.traverse(obj=>{if(obj.isMesh){obj.geometry.dispose();obj.material.dispose();}});scene?.remove(grupo);grupo=null;}
  renderer?.dispose();renderer?.domElement?.remove();renderer=null;scene=null;camera=null;items=[];lista.replaceChildren();
 }
 function separation(){
  for(const t of items){
   const rango=indiceCapa(t.grupo);
   // La posición original permanece reconocible; el despiece es didáctico y reversible.
   t.malla.position.x=(rango-6)*.31*(separacion/100);
  }
  $('.ojo-nivel').textContent=separacion+'%';
 }
 function buildForSide(){
  if(!renderer)return;
  if(grupo){grupo.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(grupo);}
  grupo=new THREE.Group();scene.add(grupo);items=[];lista.replaceChildren();selected=-1;
  const atlas=ojoActual();const fuente=eyeItems(atlas.parts,lado);
  const esclera=fuente.find(x=>x.grupo==='ojo-esclerotica');
  const centro=esclera?atlas.boxes[esclera.index].getCenter(new THREE.Vector3()):new THREE.Vector3(0,1.6,.1);
  const escala=12;
  for(const item of fuente){
   const original=atlas.pickMeshes[item.index]?.geometry;
   if(!original)continue;
   const refine=['ojo-cornea','ojo-cristalino','ojo-retina','ojo-esclerotica','ojo-iris','ojo-coroides','ojo-vitreo'].includes(item.grupo);
   const geo=refine?subdividirUnaVez(original):original.clone();
   // Trasladar el sistema original al origen, conservando distancias relativas de las mallas.
   geo.translate(-centro.x,-centro.y,-centro.z);geo.scale(escala,escala,escala);
   if(item.grupo==='ojo-iris')texturizarIris(geo);
   const mat=materialOcular(THREE,item.grupo,item.grupo==='ojo-iris'?{vertexColors:true,color:'#ffffff'}:{});
   const mesh=new THREE.Mesh(geo,mat);mesh.userData.eyeIndex=item.index;mesh.name=item.part.name;
   mesh.frustumCulled=false;mesh.renderOrder=item.grupo==='ojo-cornea'?9:item.grupo==='ojo-vitreo'?8:1;
   grupo.add(mesh);item.malla=mesh;items.push(item);
  }
  separation();
  const counts=new Map();
  lista.innerHTML=items.map(item=>{
   const nombre=PERFILES_OCULARES[item.grupo]?.nombre||item.part.name;
   const ix=(counts.get(item.grupo)||0)+1;counts.set(item.grupo,ix);
   const repeated=fuente.filter(x=>x.grupo===item.grupo).length>1;
   return `<button type="button" data-ojo-parte="${item.index}" aria-pressed="false"><i style="background:${PERFILES_OCULARES[item.grupo]?.color||'#ccc'}"></i>${nombre}${repeated?' '+ix:''}</button>`;
  }).join('');
  updateInfo(null);
  grupo.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(grupo);
  if(!bounds.isEmpty()){const centro=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const radio=size.length()/2;const d=radio/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*Math.max(1,1/camera.aspect)*1.12;controls.target.copy(centro);camera.position.copy(centro).add(new THREE.Vector3(0,0,Math.max(.1,d)));controls.minDistance=Math.max(.01,radio*.15);controls.maxDistance=Math.max(10,d*5);controls.update();}
 }
 function startView(){
  scene=new THREE.Scene();scene.background=obtenerFondo?.()?.clone()||new THREE.Color('#000000');
  camera=new THREE.PerspectiveCamera(39,1,.02,100);camera.position.set(2.1,1.1,5.3);
  const hemi=new THREE.HemisphereLight(0xffffff,0x25324c,2.25);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(-3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb9cfff,1.8);rim.position.set(2,1,-3);scene.add(rim);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));vista.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.enablePan=true;controls.minDistance=1.1;controls.maxDistance=10;controls.update();
  function resize(){const w=Math.max(1,vista.clientWidth),h=Math.max(1,vista.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  observer=new ResizeObserver(resize);observer.observe(vista);resize();buildForSide();render();
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;
   down=null;const rect=renderer.domElement.getBoundingClientRect();
   const ptr=new THREE.Vector2(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
   const raycaster=new THREE.Raycaster();raycaster.setFromCamera(ptr,camera);
   const hit=raycaster.intersectObjects(grupo.children,false)[0];
   if(hit)seleccionar(items.find(x=>x.index===hit.object.userData.eyeIndex));
  });
 }
 async function abrir(){
  if(!wrapper.hidden)return;
  if(construyendo)return;construyendo=true;const solicitud=++solicitudOcular;
  try{
   const atlas=ojoActual();if(!atlas){avisar?.('El modelo anatómico todavía no está disponible');return;}
   if(atlas.cargaCompleta)await atlas.cargaCompleta;
   if(solicitud!==solicitudOcular||atlas!==ojoActual())return;
   if(!eyeItems(atlas.parts,lado).some(x=>atlas.pickMeshes[x.index])){avisar?.('Las mallas del ojo no están disponibles en este modelo');return;}
   onLimpiar?.();wrapper.hidden=false;startView();
  }catch(e){console.error('Detalle ocular:',e);avisar?.('No se pudo abrir el ojo detallado: '+e.message);cerrar();}
  finally{construyendo=false;}
 }
 function cerrar(){solicitudOcular++;if(wrapper.hidden)return;wrapper.hidden=true;disposeView();onLimpiar?.();}
 $('.ojo-cerrar').addEventListener('click',cerrar);
 $('.ojo-lado').addEventListener('change',e=>{lado=e.target.value;onLimpiar?.();if(renderer)buildForSide();});
 $('.ojo-separacion').addEventListener('input',e=>{separacion=Number(e.target.value);separation();});
 lista.addEventListener('click',e=>{const b=e.target.closest('[data-ojo-parte]');if(!b)return;seleccionar(items.find(x=>x.index===Number(b.dataset.ojoParte)));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!wrapper.hidden)cerrar();});
 return {abrir,cerrar,activo:()=>!wrapper.hidden,seleccionMesh:()=>items.find(x=>x.index===selected)?.malla,camara:()=>camera,elementoVista:()=>vista};
}
