import {desplazamientoCapa} from './capasCuerpo.js';
import {crearLevitacionExterna} from './levitacionExterna.js';
/* Atlas profesional . Fuente GLB: Z-Anatomy / nqwrc/3d-anatomy.
   Las mallas se obtienen del proyecto original (en línea o instaladas); no se
   crean falsas estructuras. Esta vista usa las siete capas en el mismo sistema
   de coordenadas, con control de errores y respaldo al atlas local. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {traducirNombreAnatomico} from './traduccionAnatomica.js';
import {normalizarBusqueda,prepararBusqueda,ordenarBusqueda,puntuarBusqueda} from './motorBusqueda.js';

export const MODELOS_PROFESIONALES=Object.freeze([
 {id:'skeletal',nombre:'Óseo',archivo:'skeletal.glb',color:'#e3d8c2'},
 {id:'joints',nombre:'Articulaciones y ligamentos',archivo:'joints.glb',color:'#84b8b6'},
 {id:'muscular',nombre:'Muscular',archivo:'muscular.glb',color:'#d06461'},
 {id:'cardiovascular',nombre:'Cardiovascular',archivo:'cardiovascular.glb',color:'#df524f'},
 {id:'lymphatic',nombre:'Linfático',archivo:'lymphatic.glb',color:'#8bcb76'},
 {id:'nervous',nombre:'Nervioso y órganos de los sentidos',archivo:'nervous.glb',color:'#f2c64d'},
 {id:'visceral',nombre:'Órganos internos',archivo:'visceral.glb',color:'#d6a18e'}
]);
const ORIGEN='https://nqwrc.github.io/3d-anatomy/models/';
const CDN='https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/';
export const SISTEMAS_VISUALES=[
 ['todos','Cuerpo anatómico'],['nervous','Nervioso'],['respiratory','Respiratorio'],
 ['cardiac','Corazón'],['arterial','Arterias'],['venous','Venas'],
 ['skeletal','Óseo'],['muscular','Muscular'],['digestive','Digestivo'],
 ['urinary','Urinario'],['lymphatic','Linfático'],['sensory','Sensorial'],
 ['endocrine','Endocrino'],['reproductive','Reproductor'],['other_visceral','Otros órganos'],['joints','Articulaciones y ligamentos']
];
// El sistema fisiológico se infiere del nombre real del nodo y del archivo
// de origen. No se afirma que un sistema esté completo si faltan mallas.
export function clasificarMalla(origen,nombre){
 const n=normalizarBusqueda(nombre);
 if(origen==='cardiovascular')return /vein|\bvena\b|sinus venos|azyg|cava|venous/.test(n)?'venous':/\barter(y|ies)\b|aorta|arterial/.test(n)?'arterial':/heart|atrium|ventric|valve|myocard|pericard|cardiac/.test(n)?'cardiac':'other_cardiovascular';
 if(origen==='visceral'){
  if(/gall\s?bladder|biliary|cholecyst/.test(n))return 'digestive';
  if(/lung|bronch|trache|laryn|pharyn|nasal|alveol|pulmon|pleura|epiglott|diaphragm/.test(n))return 'respiratory';
  if(/heart|atrium|ventric|myocard|pericard/.test(n))return 'cardiac';
  if(/thyroid|pituitary|pineal|adrenal|parathyroid/.test(n))return 'endocrine';
  if(/kidney|\brenal\b|ureter|\bbladder\b|urethra|nephron/.test(n))return 'urinary';
  if(/testis|penis|ovary|uter|vagina|prostate|seminal|spermatic|epididym/.test(n))return 'reproductive';
  if(/spleen|thymus|lymph|tonsil/.test(n))return 'lymphatic';
  // El digestivo requiere un nombre identificado, no es la clasificación por defecto.
  if(/mouth|oral|tongue|saliva|parotid|submandib|esoph|oesoph|stomach|gastr|duoden|jejun|ileum|ileal|small intestine|large intestine|intestin|colon|cecum|caecum|rectum|rectal|anus|anal canal|mesenter|appendix|liver|hepatic|gallbladder|bile|pancrea|peritone/.test(n))return 'digestive';
  return 'other_visceral';
 }
 if(origen==='nervous')return /eye|eyeball|retina|cornea|\blens\b|\biris\b|cochlea|auditory|\bear\b|tympanic|vestibule/.test(n)?'sensory':'nervous';
 if(origen==='lymphatic')return 'lymphatic';
 return origen;
}
export const COLORES_PRO={
 skeletal:'#e4dbc5',joints:'#8db8bd',muscular:'#c86862',cardiac:'#c85a55',
 arterial:'#d84946',venous:'#4b8dd4',nervous:'#e0ba4a',sensory:'#89b6d8',
 respiratory:'#d897ac',digestive:'#d6a271',urinary:'#c9958a',endocrine:'#bb92c8',
 reproductive:'#a889c7',lymphatic:'#95c878',other_visceral:'#cbb9a5'
};
export function colorDeEstructura(sistema,nombre){
 const n=normalizarBusqueda(nombre);
 if(sistema==='nervous'){
  if(/brain|cerebr|cortex|telenceph|gyrus/.test(n))return '#d8a2a9';
  if(/cerebell/.test(n))return '#cf867f';
  if(/spinal cord|medulla/.test(n))return '#edc47b';
  return /plexus/.test(n)?'#f0c14b':'#e6ba3c';
 }
 if(sistema==='respiratory')return /bronch|trache/.test(n)?'#e6bd91':/laryn|pharyn/.test(n)?'#ad83b0':'#d996ab';
 if(sistema==='muscular')return /tendon|aponeurosis/.test(n)?'#e0b99f':/deep|profund/.test(n)?'#b95357':'#cb7770';
 if(sistema==='skeletal')return /cartilage/.test(n)?'#a9c5ca':'#e6ddc9';
 return COLORES_PRO[sistema]||'#c5b6aa';
}
export function etiquetaEspanola(nombre){
 const limpio=String(nombre||'').replace(/_/g,' ').replace(/\.(l|r)(\.\d+)?$/i,(_all,l)=>l==='l'?' izquierdo':' derecho').trim();
 return traducirNombreAnatomico(limpio)||limpio;
}
export function coincideFiltro(entrada,filtro){
 if(filtro==='todos')return true;
 if(filtro==='circulatory')return ['cardiac','arterial','venous','other_cardiovascular'].includes(entrada.sistema);
 if(filtro==='integumentary')return false;
 if(filtro==='cartilage')return /cartilage|menisc|fibrocartilag|articular disc/i.test(entrada.nombre);
 if(filtro==='connective')return /ligament|tendon|fascia|aponeurosis|retinaculum/i.test(entrada.nombre);
 return entrada.sistema===filtro||(['visceral','cardiovascular','joints'].includes(filtro)&&entrada.origen===filtro);
}
function urls(archivo){return [`./modelos/profesionales/${archivo}`,ORIGEN+archivo,CDN+archivo,'https://raw.githubusercontent.com/nqwrc/3d-anatomy/master/public/models/'+archivo];}
export function crearAtlasProfesional({api,atlasClasico,alSeleccionar,alEstado,alSistemaAusente=()=>{},alVolverCuerpo=()=>{}}){
 const draco=new DRACOLoader();draco.setDecoderPath((window.__LAB_THREE_BASE||'https://cdn.jsdelivr.net/npm/three@0.178.0/')+'examples/jsm/libs/draco/gltf/');
 const loader=new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
 const root=new THREE.Group();root.name='ATLAS PROFESIONAL Z-Anatomy';api.scene.add(root);root.visible=false;
 const entradas=[],indices=new Map(),capas=new Map(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let activo=false,cargando=false,cargado=false,seleccion=null,filtro='todos',errores=[],token=0;
 const flotacion=crearLevitacionExterna();
 let camaraAnterior=null, separacion=0;
 const posiciones=new WeakMap();
 const ui=document.getElementById('proPanel'),estado=document.getElementById('proEstado'),lista=document.getElementById('proLista'),input=document.getElementById('proBuscar');
 const setEstado=texto=>{if(estado)estado.textContent=texto;alEstado?.(texto);};
 const sanitizar=t=>String(t).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
 function centrado(box,completo=false){
  if(!box||box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const vFov=THREE.MathUtils.degToRad(api.camera.fov);const ratio=Math.max(.35,api.camera.aspect);
  const dist=Math.max(size.y/(2*Math.tan(vFov/2)),Math.max(size.x,size.z)/(2*Math.tan(vFov/2)*ratio))*(completo?1.25:1.55)+Math.max(.13,size.z*.3);
  const orient=new THREE.Vector3(.12,.04,1).normalize();
  const distancia=Math.max(.0001,dist);
  api.controls.minDistance=Math.max(.00001,distancia*.025);api.controls.maxDistance=Math.max(14,distancia*12);
  api.controls.target.copy(center);api.camera.position.copy(center).addScaledVector(orient,distancia);
  api.camera.near=Math.max(.000001,distancia/1000);api.camera.far=Math.max(100,distancia*25);api.camera.updateProjectionMatrix();api.controls.update();
 }
 async function cargarUno(conf){
  let causa='archivo no disponible',gltf=null;
  for(const url of urls(conf.archivo)){
   try{
    gltf=await loader.loadAsync(url);if(!gltf?.scene)throw Error('El archivo GLB no contiene escena');
    break;
   }catch(e){causa=e.message;}
  }
  if(!gltf)throw Error(conf.archivo+': '+causa);
  const grupo=gltf.scene;grupo.name='Sistema '+conf.nombre;root.add(grupo);capas.set(conf.id,grupo);
  // Z-Anatomy conserva estructuras en jerarquías: si ocultamos un padre,
  // las mallas hijas también desaparecen. Desanidamos cada malla sin moverla
  // de su posición real para garantizar aislamiento y selección independiente.
  const preMallas=[];
  grupo.updateMatrixWorld(true);
  const mallasAnidadas=[];
  grupo.traverse(obj=>{if(obj.isMesh&&obj.geometry?.getAttribute('position'))mallasAnidadas.push(obj);});
  for(const obj of mallasAnidadas){
   // Conservamos el identificador de Z-Anatomy antes de aplanar la jerarquía.
   let p=obj,original='';
   while(p&&p!==grupo){if(p.userData?.za_name){original=p.userData.za_name;break;}p=p.parent;}
   original=original||obj.name||obj.parent?.name||'Estructura sin nombre';
   if(/\.(j|g)$/i.test(original)||((obj.geometry.index?.count||obj.geometry.getAttribute('position')?.count||0)<6)){obj.visible=false;continue;}
   grupo.attach(obj);posiciones.set(obj,obj.position.clone());

   const clave=conf.id+':'+original;
   let entrada=indices.get(clave);
   if(!entrada){entrada={id:entradas.length,origen:conf.id,nombre:original,nombreEs:etiquetaEspanola(original),sistema:clasificarMalla(conf.id,original),mallas:[]};entradas.push(entrada);indices.set(clave,entrada);}
   entrada.mallas.push(obj);obj.userData.atlasProId=entrada.id;
   const materialesAntes=Array.isArray(obj.material)?obj.material:[obj.material];
   const usaArray=Array.isArray(obj.material);
   const color=colorDeEstructura(entrada.sistema,original);
   const materialesNuevos=materialesAntes.map(m=>{
    const nuevo=new THREE.MeshStandardMaterial({color,roughness:.76,metalness:0,side:THREE.DoubleSide,transparent:false});
    api.applyClipping(nuevo);return nuevo;
   });
   obj.material=usaArray?materialesNuevos:materialesNuevos[0];
   obj.castShadow=false;obj.receiveShadow=true;preMallas.push(obj);
  }
  if(!preMallas.length){root.remove(grupo);capas.delete(conf.id);throw Error(conf.archivo+': sin mallas seleccionables');}
  return preMallas.length;
 }
 function ajustarEscala(){
  setSeparacion(0,false);
  // No convertir un órgano aislado en un cuerpo de 1,73 m. Usar el esqueleto como referencia cuando exista.
  root.scale.setScalar(1);root.position.set(0,0,0);root.updateMatrixWorld(true);
  if(!capas.has('skeletal'))return;
  const b=new THREE.Box3().setFromObject(capas.get('skeletal'));if(b.isEmpty())throw Error('Los archivos descargados no contienen geometría');
  const h=b.getSize(new THREE.Vector3()).y;if(h<1e-6)throw Error('Los modelos carecen de altura válida');
  const factor=1.73/h;root.scale.setScalar(factor);
  const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x*factor,-b.min.y*factor,-c.z*factor);
  root.updateMatrixWorld(true);
 }
 // Cargar solo la fuente necesaria del sistema elegido; no descargar siete capas juntas.
 // Los modelos siguen compartiendo coordenadas y se conservan en memoria.
 function fuentesDeSistema(id){
  if(id==='todos')return MODELOS_PROFESIONALES;
  const origen={nervous:'nervous',sensory:'nervous',respiratory:'visceral',digestive:'visceral',
   urinary:'visceral',endocrine:'visceral',reproductive:'visceral',visceral:'visceral',
   skeletal:'skeletal',muscular:'muscular',joints:'joints',cartilage:'joints',connective:'joints',lymphatic:'lymphatic',
   circulatory:'cardiovascular',cardiac:'cardiovascular',arterial:'cardiovascular',venous:'cardiovascular'}[id];
  return MODELOS_PROFESIONALES.filter(conf=>conf.id===origen);
 }
 let colaCarga=Promise.resolve();
 function iniciar(sistema='todos'){const tarea=colaCarga.then(()=>iniciarInterno(sistema));colaCarga=tarea.catch(()=>false);return tarea;}
 async function iniciarInterno(sistema='todos'){
  if(cargando)return false;
  const pendientes=fuentesDeSistema(sistema).filter(conf=>!capas.has(conf.id));
  if(!pendientes.length)return fuentesDeSistema(sistema).some(conf=>capas.has(conf.id));
  cargando=true;errores=[];setEstado(`Verificando ${pendientes.length} capas anatómicas pendientes…`);
  let i=0,realizadas=0;
  const trabajo=async()=>{while(i<pendientes.length){const conf=pendientes[i++];try{await cargarUno(conf);}catch(e){errores.push(e.message);console.warn('Atlas profesional:',e);}realizadas++;setEstado(`Capas revisadas: ${realizadas}/${pendientes.length} · ${entradas.length} estructuras cargadas`);}};
  await Promise.all([trabajo(),trabajo()]);cargando=false;
  if(!entradas.length){setEstado('No se pudieron obtener modelos profesionales; se conserva el atlas humano incluido. Comprueba la conexión.');return false;}
  try{ajustarEscala();root.updateMatrixWorld(true);}catch(e){setEstado('Problema de escala: '+e.message);return false;}
  cargado=true;setEstado(`${entradas.length} estructuras del nuevo atlas · ${capas.size}/7 capas disponibles${errores.length?' · faltan '+errores.length:''}`);return fuentesDeSistema(sistema).some(conf=>capas.has(conf.id));
 }
 function activar(filtroInicial='todos'){
  if(!cargado||!contarSistema(filtroInicial))return false;
  if(!activo)camaraAnterior={min:api.controls.minDistance,max:api.controls.maxDistance,near:api.camera.near,far:api.camera.far};
  activo=true;atlasClasico()?.clearSelection();atlasClasico()?.setActive(false);
  root.visible=true;ui.hidden=true;seleccion=null;verGrupo(filtroInicial);
  api.setBodyBounds([new THREE.Box3().setFromObject(root)]);
  return true;
 }
 function desactivar(){
  if(!activo)return;flotacion.restaurar();setSeparacion(0,false);activo=false;root.visible=false;ui.hidden=true;seleccion=null;
  if(camaraAnterior){api.controls.minDistance=camaraAnterior.min;api.controls.maxDistance=camaraAnterior.max;api.camera.near=camaraAnterior.near;api.camera.far=camaraAnterior.far;api.camera.updateProjectionMatrix();camaraAnterior=null;}
  atlasClasico()?.setActive(true);alSeleccionar?.(null);setEstado('Atlas anterior restaurado');
 }
 async function alternar(){
  if(activo){desactivar();return false;}
  const ok=await iniciar();if(ok){activar();return true;}return false;
 }
 function aplicarVisibilidad(){
  if(!activo)return;
  for(const m of entradas){
   const v=seleccion?(seleccion.ids?seleccion.ids.has(m.id):m===seleccion):coincideFiltro(m,filtro);
   for(const obj of m.mallas)obj.visible=v;
  }
  root.updateMatrixWorld(true);
 }
 function boundsVisibles(){const b=new THREE.Box3();root.updateMatrixWorld(true);for(const e of entradas)for(const obj of e.mallas)if(obj.visible)b.expandByObject(obj);return b;}
 function setSeparacion(valor,encuadrar=true){
  separacion=Math.max(0,Math.min(1,Number(valor)||0));
  root.updateMatrixWorld(true);
  for(const e of entradas){const sistema=e.sistema==='other_cardiovascular'?'cardiac':e.sistema==='joints'?'connective':e.sistema==='other_visceral'?'digestive':e.sistema;
   const delta=new THREE.Vector3(...desplazamientoCapa(sistema,separacion));
   for(const obj of e.mallas){const base=posiciones.get(obj);if(!base)continue;const origen=obj.parent.worldToLocal(new THREE.Vector3());const local=obj.parent.worldToLocal(delta.clone()).sub(origen);obj.position.copy(base).add(local);obj.updateMatrix();}}
  root.updateMatrixWorld(true);if(encuadrar&&activo)centrado(boundsVisibles(),true);return separacion;
 }
 function partesSeleccionadas(){return seleccion?.ids?[...seleccion.ids].map(i=>entradas[i]).filter(Boolean):[];}
 function inventario(){return entradas.map(e=>({name:e.nombre,system:e.sistema}));}
 function contarSistema(f){return entradas.filter(e=>coincideFiltro(e,f)).reduce((n,e)=>n+e.mallas.length,0);}
 function verGrupo(f){
  if(!activo)return false;
  // No borrar la vista si una capa GLB falta o no trae estructuras clasificadas.
  const disponibles=contarSistema(f);
  if(!disponibles){setEstado('No se encontró geometría para '+f+'. Se mostrará el atlas de respaldo si está disponible.');return false;}
  flotacion.restaurar();setSeparacion(0,false);seleccion=null;filtro=f;aplicarVisibilidad();
  const filtroUI=document.getElementById('proFiltrar');if(filtroUI&&[...filtroUI.options].some(o=>o.value===f))filtroUI.value=f;
  const b=new THREE.Box3();let n=0;
  for(const e of entradas)if(coincideFiltro(e,f))for(const obj of e.mallas){b.expandByObject(obj);n++;}
  if(n)centrado(b,true);
  alSeleccionar?.(null,{filtro:f,total:n});actualizarLista();return n>0;
 }
 function mostrarTodo(){return verGrupo('todos');}
 function verSistema(f){return verGrupo(f);}
 function seleccionar(id){
  const e=entradas[id];if(!e||!activo)return false;
  setSeparacion(0,false);seleccion=e;filtro='todos';aplicarVisibilidad();
  const b=new THREE.Box3();for(const obj of e.mallas)b.expandByObject(obj);
  centrado(b);flotacion.seleccionar(e.mallas);alSeleccionar?.(e);actualizarLista();return true;
 }
 // Selección anatómica compuesta: cerebro, pulmones, corazón, etc. agrupa
 // todas las mallas reales disponibles y no solo la primera coincidencia.
 function patronSubgrupo(sub){return {
   costal:/costal cartilage/i,laringe:/thyroid cartilage|cricoid|arytenoid|corniculate|cuneiform/i,
   nasal:/nasal cartilage|alar cartilage/i,
   rodilla:/menisc|knee cartilage|articular cartilage of knee|patellar cartilage|tibial cartilage/i,
   encefalo:/brain|cerebr|cortex|cerebell|gyrus|thalam/i,
   periferico:/nerve|ganglion|plexus/i,
   liquido:/ventric|aqueduct|choroid plexus/i
  }[sub]||null;}
 function listarSistema(sistema,sub='todos',q=''){
  const regex=sub==='todos'?null:patronSubgrupo(sub);
  const t=normalizarBusqueda(q);
  return entradas.filter(e=>coincideFiltro(e,sistema)&&(!regex||regex.test(e.nombre))&&(!t||normalizarBusqueda(e.nombre).includes(t)||normalizarBusqueda(e.nombreEs).includes(t)));
 }
 function contarSubgrupo(sistema,sub='todos'){return listarSistema(sistema,sub,'').length;}
 function seleccionarSubgrupo(sistema,sub){
  if(!activo)return false;
  const expr=patronSubgrupo(sub);
  if(!expr)return false;
  const encontrados=listarSistema(sistema,sub);
  if(!encontrados.length)return false;
  const ids=new Set(encontrados.map(e=>e.id)),mallas=encontrados.flatMap(e=>e.mallas);
  seleccion={id:-1,ids,mallas,nombre:sub,nombreEs:sub==='rodilla'?'Cartílago articular y meniscos de rodilla':sub+' · estructuras',sistema,origen:'Z-Anatomy'};
  filtro='todos';aplicarVisibilidad();
  const bounds=new THREE.Box3();for(const obj of mallas)bounds.expandByObject(obj);
  centrado(bounds);flotacion.seleccionar(mallas);alSeleccionar?.(seleccion);actualizarLista();return true;
 }
 function datosConjunto(nombre){
  const claves={
   cerebro:{rotulo:'Cerebro y encéfalo',pat:/brain|cerebr|cortex|gyrus|sulcus|thalam|hypothalam|hippocamp|amygdal|cerebell|pons|mesenceph|brainstem|basal ganglia/i,fil:'nervous'},
   bronquios:{rotulo:'Pulmones y vías respiratorias disponibles',pat:/lung|bronch|trache|pleura|alveol|pulmonary/i,fil:'respiratory'},
   corazon:{rotulo:'Corazón y sus partes',pat:/heart|atrium|ventric|valve|myocard|pericard|septum|papillary muscle/i,fil:'cardiac'},
   rinones:{rotulo:'Riñones y vías urinarias',pat:/kidney|renal|ureter|bladder|nephron/i,fil:'urinary'},
   ojos:{rotulo:'Ojos y estructuras visuales',pat:/eye|eyeball|retina|cornea|iris|lens|optic/i,fil:'sensory'},
   estomago:{rotulo:'Estómago y sus partes',pat:/stomach|gastr|pylor|cardia of stomach/i,fil:'digestive'},
   pancreas:{rotulo:'Páncreas y sus partes',pat:/pancreas|pancreatic/i,fil:'digestive'},
   intestinos:{rotulo:'Intestinos y sus partes',pat:/intestin|colon|duoden|jejun|ileum|rectum/i,fil:'digestive'},
   higado:{rotulo:'Hígado y estructuras asociadas',pat:/liver|hepatic/i,fil:'digestive'}
  };
  const d=claves[normalizarBusqueda(nombre)];if(!d)return null;
  return {d,halladas:entradas.filter(e=>e.sistema===d.fil&&d.pat.test(e.nombre))};
 }
 function tieneConjunto(nombre){return Boolean(datosConjunto(nombre)?.halladas.length);}
 function seleccionarConjunto(nombre){
  if(!activo)return false;const datos=datosConjunto(nombre);if(!datos?.halladas.length)return false;const {d,halladas}=datos;
  setSeparacion(0,false);const ids=new Set(halladas.map(e=>e.id)),mallas=halladas.flatMap(e=>e.mallas);
  seleccion={id:-1,ids,mallas,nombre:nombre,nombreEs:d.rotulo,sistema:d.fil,origen:'Z-Anatomy'};
  filtro='todos';aplicarVisibilidad();
  const b=new THREE.Box3();for(const obj of mallas)b.expandByObject(obj);
  centrado(b);flotacion.seleccionar(mallas);alSeleccionar?.(seleccion);actualizarLista();return true;
 }
 const indiceBusqueda=new WeakMap();
 function buscar(q){
  if(!normalizarBusqueda(q))return entradas.slice(0,70);
  const registros=entradas.map(e=>{if(!indiceBusqueda.has(e))indiceBusqueda.set(e,prepararBusqueda(e.nombreEs,e.nombre));return {e,nombre:e.nombreEs,campos:indiceBusqueda.get(e)};});
  const directos=ordenarBusqueda(registros,q,{difusa:false});return (directos.length?directos:ordenarBusqueda(registros,q)).map(x=>x.e);
 }
 function resultadosBusqueda(q){
  const term=normalizarBusqueda(q);
  const grupos=[['cerebro','cerebro','encefalo','brain','cerebro completo'],['bronquios','pulmon','pulmones','lung','lungs','bronquios'],['corazon','corazon','heart'],['rinones','rinon','rinones','kidney','kidneys'],['ojos','ojo','ojos','eye','eyes'],['higado','higado','liver'],['estomago','estomago','stomach'],['pancreas','pancreas'],['intestinos','intestino','intestinos','intestine','intestines']].flatMap(([id,...alias])=>{
   const puntos=puntuarBusqueda(prepararBusqueda(...alias),term,{difusa:false});const datos=puntos>=190?datosConjunto(id):null;
   return datos?.halladas.length?[{i:'grupo:'+id,nombre:datos.d.rotulo,sub:`${datos.halladas.length} estructuras · Z-Anatomy · cobertura no certificada`}]:[];
  });
  return [...grupos,...buscar(q).map(e=>{const aproximado=!puntuarBusqueda(indiceBusqueda.get(e)||prepararBusqueda(e.nombreEs,e.nombre),term,{difusa:false});return {i:e.id,nombre:e.nombreEs,sub:`${e.sistema} · geometría Z-Anatomy${aproximado?' · coincidencia aproximada':''}`,aproximado};})];
 }
 function actualizarLista(){
  if(!lista)return;const resultados=buscar(input?.value||'');lista.replaceChildren();
  const fragment=document.createDocumentFragment();
  for(const e of resultados.slice(0,70)){
   const b=document.createElement('button');b.type='button';b.className='pro-elemento'+(seleccion===e?' elegido':'');
   b.dataset.id=String(e.id);b.textContent=e.nombreEs;
   const s=document.createElement('small');s.textContent=' · '+e.sistema;b.append(s);fragment.append(b);
  }
  lista.append(fragment);document.getElementById('proContador').textContent=`${resultados.length} coincidencias${resultados.length>70?' · primeras 70':''}`;
 }
 const clickHandler=e=>{
  if(!activo||e.button!==0||!root.visible)return;
  if((e.target?.closest?.('#proPanel'))||e.target?.closest?.('.tutor-dock'))return;
  const rect=api.renderer.domElement.getBoundingClientRect();if(!rect.width||!rect.height)return;
  pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-(e.clientY-rect.top)/rect.height*2+1;
  ray.setFromCamera(pointer,api.camera);const hits=ray.intersectObjects([...capas.values()],true);
  const hit=hits.find(h=>h.object?.visible&&Number.isInteger(h.object.userData.atlasProId)&&(!api.cut||api.plane.distanceToPoint(h.point)>=-.0001));
  if(hit)seleccionar(hit.object.userData.atlasProId);
 };
 let pointerDown=null;
 api.renderer.domElement.addEventListener('pointerdown',e=>{if(!activo||e.button!==0)return;pointerDown={x:e.clientX,y:e.clientY};});
 api.renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown)return;const d=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);pointerDown=null;if(d<7)clickHandler(e);});
 lista?.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)seleccionar(Number(b.dataset.id));});
 input?.addEventListener('input',actualizarLista);
 input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const r=buscar(input.value);if(r.length)seleccionar(r[0].id);}});
 document.getElementById('proFiltrar')?.addEventListener('change',e=>{if(!verSistema(e.target.value))alSistemaAusente(e.target.value);});
 document.getElementById('proCuerpo')?.addEventListener('click',alVolverCuerpo);
 // El cierre se gestiona desde main.js para restaurar todos los controles.
  return {inventario,setSeparacion,boundsVisibles,partesSeleccionadas,actualizarLevitacion:flotacion.actualizar,get separacion(){return separacion;},iniciar,activar,desactivar,alternar,mostrarTodo,verSistema,seleccionar,seleccionarConjunto,tieneConjunto,seleccionarSubgrupo,listarSistema,contarSubgrupo,elegir:id=>typeof id==='string'&&id.startsWith('grupo:')?seleccionarConjunto(id.slice(6)):seleccionar(id),resultadosBusqueda,buscar,contarSistema,
  get activo(){return activo;},get cargado(){return cargado;},get seleccion(){return seleccion;},get errores(){return errores.slice();},get total(){return entradas.length;},get capasCargadas(){return [...capas.keys()];},get capasFaltantes(){return MODELOS_PROFESIONALES.filter(m=>!capas.has(m.id)).map(m=>m.archivo);}};
}
