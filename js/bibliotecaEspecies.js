import {prepararBusqueda,puntuarBusqueda,ordenarBusqueda} from './motorBusqueda.js';
import {traducirNombreAnatomico} from './traduccionAnatomica.js';
/* Biblioteca multiespecie extensible. No inventa archivos 3D: importa GLB reales
   del usuario y conserva jerarquías, mallas y materiales. Modo humano alternativo
   opcional desde repositorio abierto publicado (solo con conexión a Internet). */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {LIMITE_MODELO,validarModeloRemoto} from './repositoriosGitHub.js';
const $=id=>document.getElementById(id);
const NOMBRES={zorro:'Zorro animado',perro:'Perro',gato:'Gato',caballo:'Caballo',ave:'Ave',dragon:'Dragón (fantasía)',alien:'Extraterrestre (ficción)',depredador:'Depredador (ficción)',otro:'Otra especie',humano:'Cuerpo humano alternativo'};
const normalizarNombre=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

// Equivalencias de búsqueda, no traducciones científicas inventadas.
// Los nombres originales del autor se conservan en todas las fichas.
export const ALIAS_MODELOS_3D={
 cerebro:'brain cerebrum cerebellum encephalon cerebral',
 encefalo:'brain cerebrum cerebellum encephalon',
 corazon:'heart cardiac ventricle atrium myocardium',
 pulmon:'lung lungs pulmonary bronch bronchi trachea',
 pulmones:'lung lungs pulmonary bronch bronchi trachea',
 rinon:'kidney kidneys renal',rinones:'kidney kidneys renal',
 higado:'liver hepatic',estomago:'stomach gastric',
 hueso:'bone skeletal skeleton',huesos:'bone skeletal skeleton',
 musculo:'muscle muscular',musculos:'muscle muscular',
 ojo:'eye eyeball retina optic sclera cornea',ojos:'eye eyeball retina optic sclera cornea',
 piel:'skin epidermis dermis',nervio:'nerve nervous',nervios:'nerve nervous',
 arteria:'artery arteries aorta',arterias:'artery arteries aorta',
 vena:'vein veins vascular',venas:'vein veins vascular',
 intestino:'intestine colon ileum jejunum duodenum',
 vejiga:'bladder urinary',craneo:'skull cranium',columna:'spine spinal vertebra',
 esqueleto:'skeleton skeletal bone',traquea:'trachea bronch',
 cerebrocompleto:'brain cerebrum' // término extendido opcional
};
export function coincideNombre3D(texto,consulta){
 return !normalizarNombre(consulta)||puntuarBusqueda(prepararBusqueda(traducirNombreAnatomico(texto),texto),consulta)>0;
}

async function descargarModelo(url){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
 try{
  const r=await fetch(url,{mode:'cors',credentials:'omit',signal:controller.signal});
  if(!r.ok)throw Error('HTTP '+r.status+' al obtener el modelo.');
  if(Number(r.headers.get('content-length'))>LIMITE_MODELO)throw Error('Modelo demasiado grande (máximo 50 MB).');
  const reader=r.body?.getReader();if(!reader){const b=await r.arrayBuffer();if(b.byteLength>LIMITE_MODELO)throw Error('Modelo demasiado grande.');return b;}
  const partes=[];let tam=0;
  while(true){const {value,done}=await reader.read();if(done)break;tam+=value.byteLength;
   if(tam>LIMITE_MODELO){await reader.cancel();throw Error('Modelo demasiado grande (máximo 50 MB).');}partes.push(value);}
  const b=new Uint8Array(tam);let i=0;for(const part of partes){b.set(part,i);i+=part.byteLength;}return b.buffer;
 }finally{clearTimeout(timer);}
}
export function crearBibliotecaEspecies({api,obtenerAtlas,avisar=()=>{},alCambiar=()=>{}}){
 const draco=new DRACOLoader();draco.setDecoderPath((window.__LAB_THREE_BASE||'https://cdn.jsdelivr.net/npm/three@0.178.0/')+'examples/jsm/libs/draco/gltf/');
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco);
 const lista=$('especiePiezas'),estado=$('especieEstado'),filtro=$('especieFiltro'),toolbar=$('bibliotecaBar');
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let holder=null,root=null,mallas=[],nombre='',seleccion=null,nombreEspecie='',anterior=null,token=0,down=null,mixer=null;
 let posiciones=new Map(),genero='',grupoActivo=null,limiteLista=120;
 let grupos=new Map();
 const activo=()=>Boolean(holder);
 function resumen(){return {activa:activo(),especie:nombreEspecie,modelo:nombre,seleccion:seleccion?.name||null,grupo:grupoActivo,mallas:mallas.length};}
 function updateUI(){
  toolbar.hidden=!activo();
  estado.textContent=activo()?`${nombreEspecie} · ${mallas.length} mallas 3D · ${seleccion?'estructura: '+traducirNombreAnatomico(seleccion.name||'sin nombre'):'vista general'}`:'Elige una especie o criatura en el selector superior. El cuerpo humano permanece disponible.';
  alCambiar(resumen());
 }
 function dispose(){
  ++token;if(!holder)return;
  if(mixer){mixer.stopAllAction();mixer.uncacheRoot(root);mixer=null;}
  api.scene.remove(holder);
  const geos=new Set(),mats=new Set();root.traverse(o=>{if(o.isMesh){geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);}});
  geos.forEach(x=>x?.dispose());mats.forEach(x=>x?.dispose());holder=null;root=null;mallas=[];seleccion=null;grupoActivo=null;grupos.clear();posiciones.clear();
 }
 function enfocar(box,frente=true){
  if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const halfAngle=THREE.MathUtils.degToRad(api.camera.fov/2),aspect=Math.max(.5,api.camera.aspect);
  const distance=Math.max(size.y/2/Math.tan(halfAngle),Math.max(size.x,size.z)/2/(Math.tan(halfAngle)*aspect),.05)*1.45;
  api.controls.target.copy(center);api.camera.position.copy(center).add(new THREE.Vector3(frente?.08:0,.08,Math.max(.45,distance)));
  api.camera.lookAt(center);api.controls.update();
 }
 async function cargar(origen,nombreVisual='Modelo importado',tipo='otro'){
  const t=++token,anteriorAtlas=obtenerAtlas();const remote=typeof origen==='string';
  estado.textContent='Cargando archivo 3D y sus materiales…';
  let scene=null;
  try{
   if(typeof origen!=='string')throw Error('Enlace de modelo no válido.');
   if(origen.startsWith('https://'))validarModeloRemoto(origen);
   else if(!/^\.\/modelos\/criaturas\/[a-z-]+\.glb$/i.test(origen))throw Error('Modelo no incluido en el catálogo');
   const extension=new URL(origen,location.href).pathname.split('.').pop().toLowerCase();
   const data=await descargarModelo(origen);
   let gltf;
   if(extension==='obj'){
    scene=new OBJLoader().parse(new TextDecoder().decode(data));gltf={scene,animations:[]};
   }else if(extension==='stl'){
    const geometry=new STLLoader().parse(data);scene=new THREE.Group();
    scene.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xb5c3cd,roughness:.68,metalness:.02,side:THREE.DoubleSide})));
    gltf={scene,animations:[]};
   }else{
    const path=origen.slice(0,origen.lastIndexOf('/')+1);
    gltf=await loader.parseAsync(extension==='gltf'?new TextDecoder().decode(data):data,path);scene=gltf.scene;
   }
   if(t!==token){scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();}});return false;}
   const found=[];scene.traverse(o=>{if(o.isMesh&&o.geometry){found.push(o);o.castShadow=true;o.receiveShadow=true;api.applyClipping(o.material);}});
   if(!found.length)throw Error('No se encontraron mallas dentro de este archivo');
   const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());
   if(!Number.isFinite(size.y)||Math.max(size.x,size.y,size.z)<1e-8)throw Error('Dimensiones de la malla inválidas');
   dispose(); // liberar la especie anterior solo después de validar la nueva
   // `dispose` incrementa token, pero aquí no hay más esperas; la carga es válida.
   const factor=1.74/Math.max(.00001,size.y);holder=new THREE.Group();holder.name='Biblioteca · '+nombreVisual;root=scene;
   holder.add(root);holder.scale.setScalar(factor);
   holder.position.set(-(bounds.min.x+bounds.max.x)*.5*factor,-bounds.min.y*factor,-(bounds.min.z+bounds.max.z)*.5*factor);
   anterior=holder.position.clone();filtro.value='';limiteLista=120;mallas=found;posiciones=new Map(mallas.map(m=>[m,m.visible]));seleccion=null;grupoActivo=null;
   grupos=new Map();for(const m of mallas){
    const ruta=[];let padre=m.parent;
    while(padre&&padre!==root){if(padre.name?.trim())ruta.unshift(padre.name.trim());padre=padre.parent;}
    const categoria=tipo==='externo'?'Piezas del archivo 3D':(ruta.find(n=>/skin|skelet|muscl|organ|vessel|nerve|joint|bone|circula|respirat|digest|nerv|hues|pulmon|fascia|lymph/i.test(n))||ruta[ruta.length-1]||'Estructuras sin sistema identificado');
    if(!grupos.has(categoria))grupos.set(categoria,[]);grupos.get(categoria).push(m);
   }
   nombre=nombreVisual;nombreEspecie=NOMBRES[tipo]||nombreVisual;genero=tipo;
   if(gltf.animations?.length){mixer=new THREE.AnimationMixer(root);const clip=gltf.animations.find(a=>/walk|survey|idle/i.test(a.name))||gltf.animations[0];mixer.clipAction(clip).play();}
   api.scene.add(holder);anteriorAtlas?.clearSelection();anteriorAtlas?.setActive(false);
   renderLista();updateUI();enfocar(new THREE.Box3().setFromObject(holder));
   avisar(`Modelo 3D cargado: ${nombreVisual} · ${mallas.length} mallas`);return true;
  }catch(e){if(scene&&scene!==root){const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.isMesh){geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);}});geos.forEach(g=>g?.dispose());mats.forEach(m=>m?.dispose());}if(t===token)estado.textContent='No se pudo cargar el modelo: '+e.message;avisar('Error al cargar modelo 3D: '+e.message);console.warn('Modelo especie',e);return false;}

 }
 function cambiarHumano(){dispose();obtenerAtlas()?.setActive(true);renderLista();updateUI();api.camView('frente');}
 function renderLista(){
  lista.replaceChildren();if(!mallas.length)return;
  const q=normalizarNombre(filtro.value);
  const bread=document.createElement('p');bread.className='especie-ruta';bread.textContent=grupoActivo?`Cuerpo → ${grupoActivo} → piezas`:'Cuerpo → sistemas → piezas';lista.append(bread);
  if(!q&&!grupoActivo){
   for(const [nombreGrupo,items] of grupos){
    const b=document.createElement('button');b.type='button';b.className='especie-pieza';b.dataset.grupo=nombreGrupo;
    b.textContent=`▸ ${traducirNombreAnatomico(nombreGrupo)} (${items.length})`;lista.append(b);
   }
   return;
  }
  const filtradas=mallas.map((m,i)=>({m,i})).filter(({m})=>(!grupoActivo||grupos.get(grupoActivo)?.includes(m))&&(!q||coincideNombre3D([m.name,...(function(){const v=[];let n=m.parent;while(n&&n!==root){v.push(n.name);n=n.parent;}return v;})()].join(' '),q)));
  const p=document.createElement('p');p.textContent=`${filtradas.length} mallas en este nivel. Selecciona una para aislarla.`;lista.append(p);
  for(const {m,i} of filtradas.slice(0,limiteLista)){
   const b=document.createElement('button');b.type='button';b.dataset.indice=String(i);b.className='especie-pieza';b.classList.toggle('active',m===seleccion);
   b.textContent=traducirNombreAnatomico(m.name?.trim()||`Malla ${i+1}`);lista.append(b);
  }
  if(filtradas.length>limiteLista){const mas=document.createElement('button');mas.type='button';mas.className='especie-pieza';mas.dataset.masEspecie='1';mas.textContent=`Mostrar más (${filtradas.length-limiteLista} mallas restantes)`;lista.append(mas);}
 }
 function mostrarGrupo(nombreGrupo){
  if(!holder||!grupos.has(nombreGrupo))return;
  holder.position.copy(anterior);grupoActivo=nombreGrupo;seleccion=null;limiteLista=120;
  const items=grupos.get(nombreGrupo);mallas.forEach(m=>m.visible=items.includes(m)&&posiciones.get(m)!==false);
  const box=new THREE.Box3().setFromObject(holder);enfocar(box);renderLista();updateUI();
 }
 function aislar(mesh){
  if(!holder)return;
  holder.position.copy(anterior);mallas.forEach(m=>m.visible=(grupoActivo?grupos.get(grupoActivo)?.includes(m):true)&&posiciones.get(m)!==false);
  if(!mesh){seleccion=null;grupoActivo=null;limiteLista=120;mallas.forEach(m=>m.visible=posiciones.get(m)!==false);enfocar(new THREE.Box3().setFromObject(holder));renderLista();updateUI();return;}
  const box=new THREE.Box3().setFromObject(mesh);if(box.isEmpty())return;
  mallas.forEach(m=>m.visible=m===mesh);seleccion=mesh;
  // Aislamiento solo del objeto elegido: situarlo en el centro visual, sin anillos.
  const center=box.getCenter(new THREE.Vector3());holder.position.add(new THREE.Vector3(-center.x,.9-center.y,-center.z));
  enfocar(new THREE.Box3().setFromObject(mesh));renderLista();updateUI();
 }
 function getBounds(){if(!holder)return null;return seleccion?new THREE.Box3().setFromObject(seleccion):new THREE.Box3().setFromObject(holder);}
 function rutaNombre(m){
  const partes=[m.name||''];let nodo=m.parent;
  while(nodo&&nodo!==root){partes.push(nodo.name||'');nodo=nodo.parent;}
  return partes.join(' ');
 }
 function resultadosBusqueda(consulta){
  if(!holder)return null;
  const registros=mallas.map((m,i)=>{const nombre=traducirNombreAnatomico(m.name?.trim()||`Malla ${i+1}`);return {i,nombre,sub:nombreEspecie+' · modelo GLB',campos:prepararBusqueda(nombre,m.name,rutaNombre(m))};});
  if(!normalizarNombre(consulta))return registros;
  const directos=ordenarBusqueda(registros,consulta,{difusa:false});return directos.length?directos:ordenarBusqueda(registros,consulta).map(r=>({...r,aproximado:true,sub:r.sub+' · coincidencia aproximada'}));
 }
 function buscar(consulta){if(!holder)return 0;grupoActivo=null;limiteLista=120;filtro.value=consulta||'';renderLista();return mallas.filter(m=>coincideNombre3D(rutaNombre(m),consulta)).length;}
 function seleccionMesh(){return seleccion;}
 function elegir(indice){const m=mallas[indice];if(m)aislar(m);}
 const canvas=api.renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{if(!activo()||e.button!==0)return;down={x:e.clientX,y:e.clientY,id:e.pointerId};});
 canvas.addEventListener('pointerup',e=>{
  if(!activo()||!down||down.id!==e.pointerId||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}
  down=null;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  holder.updateMatrixWorld(true);raycaster.setFromCamera(pointer,api.camera);const hit=raycaster.intersectObjects(mallas.filter(m=>m.visible),false)[0];if(hit)aislar(hit.object);
 });
 $('especieRegresar').addEventListener('click',()=>aislar(null));
 lista.addEventListener('click',e=>{const grupo=e.target.closest('[data-grupo]');if(grupo){mostrarGrupo(grupo.dataset.grupo);return;}if(e.target.closest('[data-mas-especie]')){limiteLista+=120;renderLista();return;}const b=e.target.closest('[data-indice]');if(b)elegir(Number(b.dataset.indice));});
 filtro.addEventListener('input',()=>{limiteLista=120;renderLista();});
 updateUI();return {cargar,cambiarHumano,aislar,getBounds,buscar,resultadosBusqueda,elegir,seleccionMesh,resumen,activo,updateUI,actualizar(dt){if(holder&&mixer)mixer.update(Math.min(.08,Math.max(0,Number(dt)||0)));}};
}
