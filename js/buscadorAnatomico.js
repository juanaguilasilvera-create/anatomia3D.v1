/* V12 · Búsqueda jerárquica real: cuerpo → sistema → familia → estructura.
   No promete órganos inexistentes: todas las hojas provienen del atlas cargado. */
import {nombreAnatomico} from './anatomia.js';
import {SISTEMAS,infoSistema,escapar} from './catalogo.js';
import {GRUPOS_3D,indicesDeGrupo} from './gruposAnatomicos.js';
const $=id=>document.getElementById(id);
import {normalizarBusqueda,distanciaEdicion,prepararBusqueda,puntuarBusqueda,ordenarBusqueda,tokensBusqueda} from './motorBusqueda.js';
export {normalizarBusqueda,distanciaEdicion} from './motorBusqueda.js';
export function puntaje(haystack,consulta){return puntuarBusqueda(prepararBusqueda(haystack),consulta);}
const FAMILIAS=[
 {id:'corazon',nombre:'Corazón',sistemas:['cardiac'],terminos:'heart cardiac ventricle atrium aortic mitral tricuspid pulmonary valve',alias:'corazon cardiaco cardiovascular'},
 {id:'pulmones',nombre:'Pulmones y vías respiratorias',sistemas:['respiratory'],terminos:'lung bronch trachea respiratory alveol',alias:'pulmon pulmones respiracion bronquios'},
 {id:'cerebro',nombre:'Encéfalo',sistemas:['nervous'],terminos:'brain cerebrum cerebell midbrain forebrain cerebral encephalon',alias:'cerebro encefalo cerebelo'},
 {id:'ojos',nombre:'Ojos y visión',sistemas:['sensory'],terminos:'eye eyeball retina optic cornea lens iris vitreous choroid sclera lacrimal',alias:'ojo ojos vision retina cornea'},
 {id:'higado',nombre:'Hígado y vías biliares',sistemas:['digestive'],terminos:'liver hepatic biliary gallbladder',alias:'higado vesicula'},
 {id:'intestino',nombre:'Intestinos',sistemas:['digestive'],terminos:'intestin colon ileum jejunum duodenum rectum',alias:'intestino colon recto'},
 {id:'rinones',nombre:'Riñones y vías urinarias',sistemas:['urinary'],terminos:'kidney renal ureter bladder',alias:'rinon rinones vejiga'},
 {id:'huesos',nombre:'Huesos',sistemas:['skeletal'],terminos:'femur tibia skull bone vertebra rib humerus phalanx',alias:'hueso huesos esqueleto femur'},
 {id:'musculos',nombre:'Músculos',sistemas:['muscular'],terminos:'muscle femoris biceps triceps deltoid',alias:'musculo musculos muslo'},
 {id:'vasos',nombre:'Vasos sanguíneos',sistemas:['arterial','venous'],terminos:'artery vein aorta cava vascular',alias:'arteria vena vasos circulacion'}
];
const ALIAS_GRUPO={cerebro:['cerebro','encefalo','brain','cerebro completo'],corazon:['corazon','heart','corazon completo'],ojos:['ojo','ojos','eye','eyes'],rinones:['rinones','rinon','kidneys','kidney'],bronquios:['pulmon','pulmones','lung','lungs','bronquios','arbol bronquial'],estomago:['estomago','stomach'],pancreas:['pancreas'],bazo:['bazo','spleen'],higado:['higado','liver'],vesicula:['vesicula','vesicula biliar','gallbladder'],intestinos:['intestino','intestinos','bowel','intestines'],aorta:['aorta']};
const ALIAS_SISTEMA={skeletal:['sistema oseo','esqueleto','huesos','sistema esqueletico'],cartilage:['cartilagos'],muscular:['musculos','musculatura'],cardiac:['sistema cardiaco'],arterial:['arterias'],venous:['venas'],nervous:['nervios','sistema nervioso'],respiratory:['sistema respiratorio','aparato respiratorio'],digestive:['sistema digestivo','aparato digestivo'],urinary:['sistema urinario','aparato urinario','sistema renal'],reproductive:['sistema reproductor','aparato reproductor'],lymphatic:['sistema linfatico'],endocrine:['sistema endocrino'],sensory:['sentidos','sistema sensorial'],connective:['tejido conectivo','ligamentos y tendones'],integumentary:['sistema tegumentario','sistema integumentario'],circulatory:['sistema circulatorio','sistema cardiovascular','aparato circulatorio','circulacion']};
const FALTANTES=[[/^(?:pulmon|lung) (?:izquierdo|derecho|izquierda|derecha|left|right)$|^(?:izquierdo|derecho|left|right) (?:pulmon|lung)$/,'No hay una superficie completa de ese pulmón en el atlas local.'],[/^(?:tiroides|thyroid gland|glandula tiroides|paratiroides|glandula paratiroides|parathyroid gland|medula espinal|spinal cord|menisco(?:s)?|ganglios linfaticos|vasos linfaticos|nervio ciatico|sciatic nerve|utero|ovarios?|ovary|uterus|oido interno)$/,'No se identificó una malla general de esta estructura en el atlas local de referencia.']];
function coincideFamilia(f,r){return f.sistemas.includes(r.p.system)&&f.terminos.split(' ').some(t=>r.original.includes(t));}
export function crearBuscadorAnatomico({obtenerAtlas,seleccionar,verSistema,verCuerpo=()=>{},verPiel=()=>{},verConjunto=()=>{},buscarExterno=()=>null,contextoExterno=()=>null,seleccionarExterno=()=>{},activarDesarrollador=()=>{}}){
 const input=$('partSearch'),panel=$('searchResults'),limpiar=$('limpiarBusqueda');
 let registros=[],conjuntosIndex=[],opciones=[],activo=-1,familiaAbierta=null,mas=false,limite=0;
 function construir(){
  registros=(obtenerAtlas()?.parts||[]).map((p,i)=>{
   const nombre=nombreAnatomico(p),sistema=infoSistema(p.system).name;
   return {tipo:'pieza',i,p,nombre:nombre.espanol,sistema,
    es:normalizarBusqueda(nombre.espanol),cient:normalizarBusqueda(nombre.cientifico),
    original:normalizarBusqueda(p.name),codigo:normalizarBusqueda(`${p.id} ${p.conceptId||''}`),campos:prepararBusqueda(nombre.espanol,p.name,nombre.cientifico,p.id,p.conceptId)};
  });
  const repetidos=new Map();for(const r of registros){const k=r.original;repetidos.set(k,(repetidos.get(k)||0)+1);}for(const r of registros)r.homonimos=repetidos.get(r.original);
  conjuntosIndex=GRUPOS_3D.map(g=>({...g,tipo:'conjunto',cantidad:indicesDeGrupo(obtenerAtlas()?.parts||[],g.id).length,campos:prepararBusqueda(...(ALIAS_GRUPO[g.id]||[]))})).filter(g=>g.cantidad>0);
 }
 function cerrar(){panel.hidden=true;opciones=[];activo=-1;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function mostrar(html){panel.innerHTML=html;panel.hidden=false;input.setAttribute('aria-expanded','true');}
 function boton(item,indice){
  const k=item.tipo,nombre=item.nombre,
   secundario=k==='pieza'?`${item.sistema} · ${item.p?.id||''} · Atlas local${item.homonimos>1?' · '+item.homonimos+' registros con este nombre':''}`:item.sub||'';
  return `<button id="sugerencia-${indice}" type="button" role="option" aria-selected="false" class="resultado-busqueda resultado-${k}" data-indice="${indice}"><span class="resultado-icono">${k==='pieza'?'◌':k==='sistema'?'▤':k==='cuerpo'?'◉':'◎'}</span><span class="resultado-texto"><strong>${escapar(nombre)}</strong><small>${escapar(secundario)}</small>${item.nota?`<small class="resultado-nota">${escapar(item.nota)}</small>`:''}</span><span class="resultado-enlace">${k==='pieza'||k==='conjunto'||k==='externo'?'Ver 3D':'Explorar'}</span></button>`;
 }
 function seccion(titulo,items){
  if(!items.length)return '';
  return `<div class="buscador-seccion-titulo">${escapar(titulo)}</div>`+items.map(x=>{const i=opciones.push(x)-1;return boton(x,i);}).join('');
 }
 function raiz(){
  opciones=[];familiaAbierta=null;activo=-1;
  const cuerpo={tipo:'cuerpo',nombre:'Cuerpo completo · todos los sistemas',sub:'Mostrar todas las capas del atlas'};
  const piel={tipo:'piel',nombre:'Piel y cabello',sub:'Vista externa del cuerpo humano'};
  const systems=[{id:'circulatory',name:'Sistema cardiovascular'},...SISTEMAS].map(s=>({tipo:'sistema',id:s.id,nombre:s.name,sub:`${registros.filter(r=>s.id==='circulatory'?['cardiac','arterial','venous'].includes(r.p.system):r.p.system===s.id).length} estructuras disponibles`}));
  mostrar(`<div class="buscador-resultados-titulo">Explorar anatomía <span>De lo general a lo particular</span></div>${seccion('CUERPO', [cuerpo,piel])}${seccion('SISTEMAS ANATÓMICOS',systems)}<p class="buscador-ayuda">Selecciona un sistema o escribe el nombre de un órgano</p>`);
 }
 function resolverFamilia(f){
  return registros.filter(r=>coincideFamilia(f,r)).sort((a,b)=>a.nombre.length-b.nombre.length||a.nombre.localeCompare(b.nombre,'es'));
 }
 function verFamilia(f){
  familiaAbierta=f;opciones=[];activo=-1;
  const items=resolverFamilia(f);
  const primeras=items.slice(0,mas?Math.max(70,limite):16);
  mostrar(`<div class="buscador-resultados-titulo"><button type="button" class="buscador-volver" data-volver="1">← Volver</button><span>${escapar(f.nombre)} · ${items.length} estructuras</span></div>
   <div class="buscador-camino">Cuerpo humano › ${escapar(infoSistema(f.sistemas[0]).name)} › ${escapar(f.nombre)}</div>
   ${seccion('VISTA GENERAL',[{tipo:'sistema',id:f.sistemas[0],nombre:infoSistema(f.sistemas[0]).name,sub:'Mostrar las estructuras disponibles en 3D'}])}
   ${seccion('ESTRUCTURAS ESPECÍFICAS',primeras)}
   ${items.length>primeras.length?`<button type="button" class="buscador-mas" data-mas="1">Ver más estructuras (${items.length-primeras.length} restantes)</button>`:''}
   <p class="buscador-ayuda">Selecciona una estructura para aislarla en el centro del visor.</p>`);
 }
 function resultados(texto){
  const q=normalizarBusqueda(texto);
  if(q==='1234'){opciones=[];cerrar();return;}
  if(/^(piel( y (cabello|pelo)| mas cabello)?|cabello y piel|cuerpo con piel)$/.test(q)){opciones=[];activo=-1;mostrar(seccion('VISTA EXTERNA',[{tipo:'piel',nombre:'Piel y cabello',sub:'Mostrar la superficie del cuerpo'}]));return;}
  if(/^(cuerpo( humano)?( completo)?|humano|anatomia|todo(s)?( los sistemas)?|general)$/.test(q)){
   opciones=[];activo=-1;familiaAbierta=null;mostrar(`<div class="buscador-resultados-titulo">Navegación anatómica</div>${seccion('VISTA GENERAL',[{tipo:'cuerpo',nombre:'Cuerpo completo · todos los sistemas',sub:'Todos los sistemas del atlas'},{tipo:'piel',nombre:'Piel y cabello',sub:'Vista externa'}])}${seccion('SISTEMAS',SISTEMAS.map(s=>({tipo:'sistema',id:s.id,nombre:s.name,sub:'Explorar estructuras'})))}`);
   return;
  }
  if(!q){raiz();return;}
  opciones=[];activo=-1;familiaAbierta=null;
  const contexto=contextoExterno();const externos=buscarExterno(texto)||[];
  const ext=externos.map(x=>({tipo:'externo',i:x.i,nombre:x.nombre,sub:x.sub,fuente:contexto,aproximado:x.aproximado===true}));
  const cupo=mas?Math.max(30,limite):12;
  let contenido=`<div class="buscador-resultados-titulo">Resultados de «${escapar(texto)}»</div>`;
  if(contexto==='especie'||contexto==='importado'){
   contenido+=seccion('MODELO EXTERNO ACTIVO',ext.slice(0,cupo));
   if(!ext.length)contenido+='<p class="sin-resultados">Sin coincidencias en el modelo externo. Regresa al cuerpo humano para buscar en el atlas humano.</p>';
   if(ext.length>cupo)contenido+=`<button type="button" class="buscador-mas" data-mas="1">Ver más (${ext.length-cupo})</button>`;
   mostrar(contenido);return;
  }
  const conjuntos=ordenarBusqueda(conjuntosIndex,q).filter(g=>g.puntos>=76 && tokensBusqueda(q).length<=2).map(g=>({...g,sub:`${g.cantidad} mallas locales · ${['cerebro','corazon','bronquios','higado','intestinos'].includes(g.id)?'Cobertura parcial':'Ver conjunto'}`}));
  const sistemas=ordenarBusqueda([...SISTEMAS,{id:'circulatory',name:'Sistema cardiovascular'}].map(s=>({tipo:'sistema',id:s.id,nombre:s.name,sub:'Explorar el sistema · atlas disponible',campos:prepararBusqueda(s.name,...(ALIAS_SISTEMA[s.id]||[]))})),q).filter(x=>x.puntos>=76);
  const familias=FAMILIAS.filter(f=>puntuarBusqueda(prepararBusqueda(f.nombre,...f.alias.split(' ')),q,{difusa:false})>=120&&resolverFamilia(f).length).map(f=>({tipo:'familia',f,nombre:f.nombre,sub:`${resolverFamilia(f).length} estructuras relacionadas`}));
  const piezas=ordenarBusqueda(registros,q,{difusa:false});const aproximadas=!piezas.length&&!conjuntos.length&&!ext.length?ordenarBusqueda(registros,q):[];
  const esSistema=sistemas[0]?.puntos>=190&&!conjuntos.some(g=>g.puntos>=190);
  const falta=!piezas.some(p=>p.puntos>=190)?FALTANTES.find(([re])=>re.test(q)):null;
  if(falta&&!ext.length)contenido+=`<p class="buscador-aviso">${escapar(falta[1])} Las coincidencias relacionadas no sustituyen esa estructura.</p>`;
  if(esSistema)contenido+=seccion('SISTEMAS ANATÓMICOS',sistemas.slice(0,5));
  contenido+=seccion('MODELOS PROFESIONALES CARGADOS',ext.slice(0,cupo));
  contenido+=seccion('CONJUNTOS DEL ATLAS LOCAL',conjuntos.slice(0,5));
  contenido+=seccion(`ESTRUCTURAS LOCALES · ${piezas.length}`,piezas.slice(0,cupo));
  if(!esSistema)contenido+=seccion('SISTEMAS ANATÓMICOS',sistemas.slice(0,5));
  contenido+=seccion('EXPLORAR POR FAMILIA',familias.slice(0,5));
  if(!piezas.length&&!conjuntos.length&&!esSistema&&!ext.length&&aproximadas.length)contenido+=seccion('POSIBLES COINCIDENCIAS · REVISAR NOMBRE',aproximadas.slice(0,cupo));
  if(Math.max(piezas.length,ext.length,(!piezas.length&&!conjuntos.length&&!esSistema&&!ext.length)?aproximadas.length:0)>cupo)contenido+=`<button type="button" class="buscador-mas" data-mas="1">Ver más resultados</button>`;
  if(!opciones.length)contenido+='<p class="sin-resultados">No hay coincidencias disponibles. Prueba otro nombre, un sistema o un término más corto.</p>';
  contenido+='<p class="buscador-ayuda">↑ ↓ para elegir · Enter para abrir · Esc para cerrar</p>';
  mostrar(contenido);
 }
 function elegir(i){
  const r=opciones[i];if(!r||panel.hidden)return;
  if(r.tipo==='externo'){if(r.fuente!==contextoExterno()){resultados(input.value);return;}seleccionarExterno(r.i);input.value=r.nombre;cerrar();return;}
  if(r.tipo==='conjunto'){if(verConjunto(r.id)){input.value=r.nombre;cerrar();}return;}
  if(r.tipo==='familia'){mas=false;limite=0;verFamilia(r.f);return;}
  if(r.tipo==='sistema'){input.value='';verSistema(r.id);cerrar();return;}
  if(r.tipo==='cuerpo'||r.tipo==='piel'){input.value='';(r.tipo==='piel'?verPiel:verCuerpo)();cerrar();return;}
  input.value=r.nombre;seleccionar(r.i);cerrar();
 }
 function actualizarTeclado(){
  panel.querySelectorAll('[data-indice]').forEach(el=>{const on=Number(el.dataset.indice)===activo;el.classList.toggle('seleccion-teclado',on);el.setAttribute('aria-selected',String(on));});
  if(activo<0){input.removeAttribute('aria-activedescendant');return;}
  input.setAttribute('aria-activedescendant',`sugerencia-${activo}`);
  panel.querySelector(`#sugerencia-${activo}`)?.scrollIntoView({block:'nearest'});
 }
 input.addEventListener('input',()=>{mas=false;limite=0;resultados(input.value);});
 input.addEventListener('focus',()=>resultados(input.value));
 input.addEventListener('keydown',e=>{
  if(e.isComposing)return;
  if(e.key==='Enter'&&input.value.trim()==='1234'){e.preventDefault();e.stopImmediatePropagation();input.value='';opciones=[];cerrar();activarDesarrollador();return;}
  if(e.key==='Escape'){cerrar();input.blur();return;}
  if(['ArrowDown','ArrowUp'].includes(e.key)){
   e.preventDefault();if(panel.hidden)resultados(input.value);
   if(!opciones.length)return;activo=Math.max(0,Math.min(opciones.length-1,activo+(e.key==='ArrowDown'?1:-1)));
   actualizarTeclado();
  }
  if(e.key==='Enter'&&!panel.hidden&&opciones.length){e.preventDefault();if(activo>=0)elegir(activo);else if(!opciones[0]?.aproximado&&!panel.querySelector('.buscador-aviso')&&!panel.querySelector('.buscador-seccion-titulo')?.textContent.startsWith('POSIBLES'))elegir(0);else{activo=0;actualizarTeclado();}}
 });
 panel.addEventListener('click',e=>{
  if(e.target.closest('[data-volver]')){mas=false;limite=0;resultados(input.value);return;}
  if(e.target.closest('[data-mas]')){mas=true;limite+=70;familiaAbierta?verFamilia(familiaAbierta):resultados(input.value);return;}
  const b=e.target.closest('[data-indice]');if(b)elegir(Number(b.dataset.indice));
 });
 limpiar?.addEventListener('click',()=>{input.value='';cerrar();input.focus();});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#buscadorGlobal'))cerrar();});
 document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select();}
  else if(e.key==='/'&&!e.ctrlKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();input.focus();}
 });
 return {actualizar(){construir();if(document.activeElement===input)resultados(input.value);else cerrar();input.placeholder='Buscar cuerpo, sistema, órgano o parte…';},cerrar};
}
