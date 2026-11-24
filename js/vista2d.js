/* Proyecciones ORTOGRÁFICAS reales del atlas Three.js y láminas con referencias.
   Cada captura se renderiza con OrthographicCamera; nunca es una simple fotografía
   de la cámara en perspectiva. No modifica el encuadre 3D del usuario. */
import * as THREE from 'three';
import {buscarImagenesReferenciadas} from './imagenesReferenciadas.js';
import {nombreAnatomico} from './anatomia.js';
import {infoSistema} from './catalogo.js';
const $=id=>document.getElementById(id);
const VISTAS={
 frente:{nombre:'Frontal',direccion:[0,0,1],up:[0,1,0],ejes:'X-Y'},
 espalda:{nombre:'Posterior',direccion:[0,0,-1],up:[0,1,0],ejes:'X-Y'},
 izquierda:{nombre:'Lateral izquierda',direccion:[-1,0,0],up:[0,1,0],ejes:'Z-Y'},
 derecha:{nombre:'Lateral derecha',direccion:[1,0,0],up:[0,1,0],ejes:'Z-Y'},
 superior:{nombre:'Superior',direccion:[0,1,0],up:[0,0,-1],ejes:'X-Z'},
 inferior:{nombre:'Inferior',direccion:[0,-1,0],up:[0,0,1],ejes:'X-Z'}
};
export function crearVista2D(api,avisar=()=>{},obtenerAtlas=()=>null,obtenerCajaExterna=()=>null){
 const vista=$('vista2d'),imagen=$('laminaImagen'),marco=$('laminaMarco'),titulo=$('laminaTitulo');
 const descripcion=$('laminaDescripcion'),tipo=$('tipoLamina'),aviso=$('laminaAviso'),fuente=$('laminaFuente');
 const opciones=$('laminasOpciones'),archivo=$('fotoLocal'),zoom=$('laminaZoom'),zoomValor=$('laminaZoomValor');
 const estado=$('estadoBusqueda2D'),vistas=$('proyecciones2d'),ecuacion=$('formula2d');
 let modo='3d',sistema='skeletal',seleccion=null,referencias=[],captura='',localURL=null,revision=0,consulta=null;
 let origen='captura',indiceExterno=-1,scale=1,x=0,y=0,drag=null,vistaActual='frente';
 const rapida=$('referenciasRapidas2D'),rapidaNombre=$('refRapidaNombre'),rapidaCaptura=$('refRapidaCaptura'),rapidaGaleria=$('refRapidaGaleria'),rapidaEstado=$('refRapidaEstado');
 let rapidaAbort=null,rapidaToken=0,refsRapidas=[],rapidaClave='',externoActivo=false;
 let rapidaOculta=false;
 const nombre=()=>seleccion?(seleccion.titulo2d||nombreAnatomico(seleccion).espanol):infoSistema(sistema).name;
 function pantalla(texto='',mostrar=false){aviso.textContent=texto;aviso.hidden=!mostrar;}
 function transformar(){imagen.style.transform=`translate(${x}px,${y}px) scale(${scale})`;zoom.value=String(Math.round(scale*100));zoomValor.textContent=Math.round(scale*100)+'%';}
 function resetZoom(){scale=1;x=0;y=0;transformar();}
 function boundsActuales(){
  const externo=obtenerCajaExterna();if(externo&&!externo.isEmpty())return externo;
  const atlas=obtenerAtlas(),bounds=new THREE.Box3();
  if(atlas?.selectionMesh&&atlas.selected>=0){atlas.selectionMesh.updateMatrixWorld(true);return bounds.setFromObject(atlas.selectionMesh);}
  if(atlas?.parts?.length){
   for(let i=0;i<atlas.parts.length;i++){
    const part=atlas.parts[i];if(!atlas.visible.has(part.system))continue;
    if(atlas.boxes[i])bounds.union(atlas.boxes[i]);
   }
  }
  return bounds.isEmpty()?new THREE.Box3(new THREE.Vector3(-.4,0,-.25),new THREE.Vector3(.4,1.8,.25)):bounds;
 }
 function tomarCaptura(){
  // Captura de alta resolución. No altera la cámara 3D ni el tamaño CSS del visor.
  const oldSize=api.renderer.getSize(new THREE.Vector2());
  let resized=false;
  try{
   const bounds=boundsActuales(),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
   const view=VISTAS[vistaActual],dir=new THREE.Vector3(...view.direccion),up=new THREE.Vector3(...view.up);
   const oldAspect=Math.max(.25,marco.clientWidth/Math.max(1,marco.clientHeight));
   const pixelRatio=api.renderer.getPixelRatio();
   const widthPx=Math.min(2048,Math.max(1200,Math.round(oldSize.x*pixelRatio)));
   const heightPx=Math.max(1,Math.round(widthPx/oldAspect));
   const aspect=widthPx/heightPx;
   const horizontal=Math.max(.001,vistaActual==='izquierda'||vistaActual==='derecha'?size.z:size.x);
   const vertical=Math.max(.001,['superior','inferior'].includes(vistaActual)?size.z:size.y);
   const halfH=Math.max(.0001,vertical*.56,horizontal*.56/aspect);
   const cam=new THREE.OrthographicCamera(-halfH*aspect,halfH*aspect,halfH,-halfH,.001,100);
   cam.up.copy(up);cam.position.copy(center).addScaledVector(dir,Math.max(2,size.length()*2));cam.lookAt(center);cam.updateProjectionMatrix();
   api.renderer.setSize(Math.ceil(widthPx/pixelRatio),Math.ceil(heightPx/pixelRatio),false);resized=true;
   api.renderer.render(api.scene,cam);
   captura=api.renderer.domElement.toDataURL('image/png');
   ecuacion.textContent=`Proyección ${view.nombre.toLowerCase()} · ${view.ejes} · imagen ${api.renderer.domElement.width} × ${api.renderer.domElement.height} px · x′ = s·(r·(P−C)), y′ = s·(u·(P−C)). No es una radiografía ni muestra tejidos ausentes.`;
  }catch(e){captura='';console.warn('No se pudo crear la proyección ortográfica:',e);pantalla('No se pudo generar la proyección: '+e.message,true);}
  finally{
   if(resized)api.renderer.setSize(oldSize.x,oldSize.y,false);
   api.renderer.render(api.scene,api.camera);
  }
 }
 function llenarBotones(){
  opciones.replaceChildren();
  const btn=document.createElement('button');btn.type='button';btn.textContent=`Modelo · ${VISTAS[vistaActual].nombre}`;btn.classList.toggle('active',origen==='captura');btn.addEventListener('click',mostrarCaptura);opciones.append(btn);
  referencias.forEach((ref,i)=>{
   const b=document.createElement('button');b.type='button';b.className='lamina-referencia';b.classList.toggle('active',origen==='externa'&&indiceExterno===i);b.title=ref.titulo;
   const img=document.createElement('img');img.src=ref.miniatura;img.alt='Miniatura de referencia';img.loading='lazy';
   const txt=document.createElement('span');txt.textContent=`Referencia ${i+1}: ${nombre()}`;b.append(img,txt);b.addEventListener('click',()=>mostrarReferencia(i));opciones.append(b);
  });
 }
 function mostrarCaptura(){
  origen='captura';indiceExterno=-1;resetZoom();llenarBotones();
  titulo.textContent=`${VISTAS[vistaActual].nombre} · ${seleccion?nombre():obtenerCajaExterna()?'Especie importada':'Cuerpo humano'}`;
  tipo.textContent='Proyección ortográfica de geometría 3D';
  descripcion.textContent='Proyección geométrica real con cámara ortográfica. Conserva las dimensiones relativas; no es una fotografía clínica ni muestra tejidos ausentes del modelo.';
  fuente.hidden=true;pantalla();
  if(captura)imagen.src=captura;else{imagen.removeAttribute('src');pantalla('Regresa a la vista 3D y vuelve a generar la proyección.',true);}
 }
 function mostrarReferencia(i){
  const ref=referencias[i];if(!ref)return;origen='externa';indiceExterno=i;resetZoom();llenarBotones();pantalla();
  titulo.textContent=`Ilustración: ${nombre()}`;tipo.textContent='Referencia externa — Wikimedia Commons';
  descripcion.textContent=`Original: ${ref.titulo}. Autor: ${ref.autor}. Licencia: ${ref.licencia}. Verifica la correspondencia anatómica.`;
  fuente.href=ref.fuente;fuente.textContent='Ver origen, autor y licencia';fuente.hidden=false;imagen.src=ref.miniatura;
 }
 async function cargarReferencias(){
  const token=++revision;consulta?.abort();consulta=new AbortController();referencias=[];origen='captura';indiceExterno=-1;
  if(modo!=='2d')return;llenarBotones();mostrarCaptura();
  if(!seleccion){estado.textContent='Selecciona un órgano en 3D para buscar láminas relacionadas.';return;}
  if(seleccion.sinReferencias){estado.textContent='Modelo sin identificación anatómica verificada. Solo se ofrece su proyección real.';return;}
  estado.textContent=`Buscando referencias de ${nombre()}…`;
  try{
   const items=rapidaClave===seleccion.name&&refsRapidas.length?refsRapidas:await buscarImagenesReferenciadas(seleccion,{signal:consulta.signal});if(token!==revision||modo!=='2d')return;
   referencias=items;llenarBotones();estado.textContent=items.length?`${items.length} imágenes con fuente. Elige una referencia.`:'No se encontraron imágenes verificables; la proyección ortográfica sigue disponible.';
  }catch(e){if(e?.name==='AbortError'||token!==revision)return;estado.textContent='No se pudieron obtener imágenes externas. La proyección local sigue disponible.';}
 }
 function setProjection(name){
  if(!VISTAS[name])return;vistaActual=name;
  vistas.querySelectorAll('[data-proyeccion]').forEach(b=>{b.classList.toggle('active',b.dataset.proyeccion===name);b.setAttribute('aria-pressed',String(b.dataset.proyeccion===name));});
  if(modo==='2d'){tomarCaptura();mostrarCaptura();}
 }
 function activarRapida(p){
  const token=++rapidaToken;rapidaAbort?.abort();rapidaAbort=new AbortController();
  refsRapidas=[];rapidaClave=p?.name||'';
  rapida.hidden=!p||rapidaOculta;if(!p)return;
  rapidaNombre.textContent=nombre();rapidaGaleria.replaceChildren();
  rapidaEstado.textContent='Cargando referencias con fuente…';
  // Captura verificable de la geometría existente, incluso sin acceso a Commons.
  if(modo==='3d'){
   tomarCaptura();
   if(captura){rapidaCaptura.src=captura;rapidaCaptura.alt='Proyección frontal ortográfica de '+nombre();}
   else rapidaCaptura.removeAttribute('src');
  }
  if(p.sinReferencias){rapidaEstado.textContent='Proyección real de modelo importado; sin referencias anatómicas verificadas.';return;}
  buscarImagenesReferenciadas(p,{signal:rapidaAbort.signal}).then(items=>{
   if(token!==rapidaToken)return;
   refsRapidas=items;rapidaGaleria.replaceChildren();
   for(const [i,ref] of items.slice(0,3).entries()){
    const b=document.createElement('button');b.type='button';b.title='Abrir referencia '+(i+1)+' con su licencia';
    const img=document.createElement('img');img.src=ref.miniatura;img.alt='Imagen relacionada: '+nombre();img.loading='lazy';
    b.append(img);b.addEventListener('click',()=>{
     setMode('2d');referencias=refsRapidas;llenarBotones();mostrarReferencia(i);
    });rapidaGaleria.append(b);
   }
   rapidaEstado.textContent=items.length?`${items.length} ilustraciones relacionadas; revisa la correspondencia en su fuente.`:'No se hallaron ilustraciones específicas. Se muestra la proyección del modelo real.';
   if(modo==='2d'&&seleccion?.name===rapidaClave){referencias=items;llenarBotones();estado.textContent=items.length?`${items.length} referencias con fuente.`:'Proyección local disponible.';}
  }).catch(e=>{if(token!==rapidaToken||e.name==='AbortError')return;rapidaEstado.textContent='Sin conexión a Commons. La proyección local continúa disponible.';});
 }
 function setExternalSelection(p,especie='Modelo importado'){
  externoActivo=!!p;
  seleccion=p?{...p,system:p.system||sistema}:null;
  if(p){rapidaOculta=false;activarRapida(seleccion);}
  else {rapidaToken++;rapidaAbort?.abort();rapida.hidden=true;}
  if(modo==='2d'){tomarCaptura();cargarReferencias();}
 }
 function setMode(nuevo){
  if(!['2d','3d'].includes(nuevo)||nuevo===modo)return;
  modo=nuevo;vista.hidden=nuevo!=='2d';api.controls.enabled=nuevo==='3d';document.body.classList.toggle('modo-2d',nuevo==='2d');
  document.querySelectorAll('[data-vista]').forEach(b=>{const activo=b.dataset.vista===nuevo;b.classList.toggle('active',activo);b.setAttribute('aria-pressed',String(activo));});
  if(nuevo==='2d'){tomarCaptura();cargarReferencias();}else{consulta?.abort();revision++;}
 }
 function setSystem(s){
  sistema=s;
  const ingles={skeletal:'human skeleton',muscular:'human muscles',nervous:'human nervous system',cardiac:'human heart',arterial:'human arteries',venous:'human veins',respiratory:'human respiratory system',digestive:'human digestive system',urinary:'human urinary system',sensory:'human eye',integumentary:'human skin',connective:'human connective tissue',endocrine:'human endocrine system',reproductive:'human reproductive system',lymphatic:'human lymphatic system',cartilage:'human cartilage',circulatory:'human cardiovascular system'};
  // El grupo es un contexto ilustrativo, no una estructura individual.
  seleccion={name:ingles[s]||infoSistema(s).name,system:s,titulo2d:infoSistema(s).name+' · grupo'};
  rapidaOculta=false;activarRapida(seleccion);
  if(modo==='2d'){tomarCaptura();cargarReferencias();}
 }
 function setSelected(p){
  externoActivo=false;seleccion=p||null;
  if(seleccion){sistema=seleccion.system||sistema;rapidaOculta=false;activarRapida(seleccion);}
  else {rapidaToken++;rapidaAbort?.abort();rapida.hidden=true;refsRapidas=[];}
  if(modo==='2d'){tomarCaptura();cargarReferencias();}
 }
 vistas.addEventListener('click',e=>{const b=e.target.closest('[data-proyeccion]');if(b)setProjection(b.dataset.proyeccion);});
 document.querySelectorAll('[data-vista]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.vista)));
 $('volver3d').addEventListener('click',()=>setMode('3d'));
 $('cerrarReferenciasRapidas')?.addEventListener('click',()=>{rapidaOculta=true;rapida.hidden=true;});
 $('refRapidaProyeccion')?.addEventListener('click',()=>{setMode('2d');mostrarCaptura();});
 $('verTodasReferencias2D')?.addEventListener('click',()=>setMode('2d'));
 $('capturarVista2d').addEventListener('click',()=>{tomarCaptura();mostrarCaptura();avisar('Proyección ortográfica actualizada');});
 $('descargarProyeccion2d')?.addEventListener('click',()=>{if(!captura){avisar('Genera primero una proyección ortográfica');return;}const a=document.createElement('a');a.href=captura;a.download=`proyeccion-anatomica-${vistaActual}.png`;document.body.append(a);a.click();a.remove();});
 $('abrirFoto').addEventListener('click',()=>archivo.click());
 archivo.addEventListener('change',()=>{
  const f=archivo.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){avisar('El archivo no es una imagen');return;}
  if(localURL)URL.revokeObjectURL(localURL);localURL=URL.createObjectURL(f);
  origen='local';resetZoom();llenarBotones();imagen.src=localURL;titulo.textContent=f.name;
  descripcion.textContent='Imagen propia importada; su origen y contenido no están verificados.';tipo.textContent='Imagen local';fuente.hidden=true;pantalla();archivo.value='';
 });
 marco.addEventListener('dblclick',()=>{if(modo!=='2d'||!seleccion)return;const texto=seleccion.descripcion||seleccion.description||'Esta imagen representa la estructura seleccionada. Para explorar subestructuras independientes, regresa a la vista 3D y selecciónalas en el atlas.';aviso.textContent=`${nombre()}: ${texto}`;aviso.hidden=false;});
 imagen.title='Doble clic para consultar la estructura seleccionada; no es un mapa interactivo de subpartes';
 imagen.addEventListener('error',()=>pantalla('No se pudo mostrar esta imagen. Elige otra vista o referencia.',true));
 zoom.addEventListener('input',()=>{scale=Number(zoom.value)/100;transformar();});
 $('laminaRestablecerZoom').addEventListener('click',resetZoom);
 marco.addEventListener('wheel',e=>{if(modo!=='2d')return;e.preventDefault();scale=Math.max(1,Math.min(5,scale*(e.deltaY<0?1.13:1/1.13)));transformar();},{passive:false});
 marco.addEventListener('pointerdown',e=>{if(modo!=='2d'||e.button!==0)return;drag={id:e.pointerId,px:e.clientX,py:e.clientY,x,y};marco.setPointerCapture(e.pointerId);});
 marco.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.x+e.clientX-drag.px;y=drag.y+e.clientY-drag.py;transformar();});
 const soltar=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;if(marco.hasPointerCapture(e.pointerId))marco.releasePointerCapture(e.pointerId);};
 marco.addEventListener('pointerup',soltar);marco.addEventListener('pointercancel',soltar);
 return {setMode,setSystem,setSelected,setExternalSelection,tomarCaptura,setProjection,get mode(){return modo;},get projection(){return vistaActual;}};
}
