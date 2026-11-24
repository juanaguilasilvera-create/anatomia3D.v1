import {auditarCobertura} from './coberturaSistemas.js';
import {capasDisponibles} from './capasCuerpo.js';
import {instalarModoDesarrollador} from './modoDesarrollador.js';
import {CREATURAS_INTEGRADAS, SISTEMAS_INTEGRADOS} from './modelosIntegrados.js';
import {crearImportadorGitHub} from './importadorGitHub.js';
import * as THREE from 'three';
import {iniciarEscena} from './escena.js';
import {Atlas3D} from './atlas.js';
import {AtlasFemenino,URL_HRA} from './atlasFemenino.js';
import {SISTEMAS, MODULOS, infoSistema, escapar} from './catalogo.js';
import {GUIAS, detallePieza, nombreAnatomico} from './anatomia.js';
import {fichaComponente} from './fichasComponentes.js';
import {fichaAnatomicaIdentificada} from './fichasVerificadas.js';
import {traducirNombreAnatomico} from './traduccionAnatomica.js';
import {htmlEspecificaciones, panelMatematico, metricas} from './matematicas.js';
import {crearEstadisticas} from './estadisticas.js';
import {crearRayos} from './rayos.js';
import {crearPreferencias} from './interfaz.js';
import {crearEnfoqueCamara} from './enfoqueCamara.js';
import {crearHerramientasMouse} from './herramientasMouse.js';
import {crearVista2D} from './vista2d.js';
import {crearBuscadorAnatomico,normalizarBusqueda} from './buscadorAnatomico.js';
import {GRUPOS_3D,indicesDeGrupo} from './gruposAnatomicos.js';
import {crearTutorVoz} from './tutorVoz.js';
import {crearInspectorEstudio} from './inspectorEstudio.js';
import {crearOjoDetallado} from './ojoDetallado.js';
import {crearAtlasProfesional} from './atlasProfesional.js';
import {respuestaTutorTema} from './conocimientoTutor.js';
import {crearBibliotecaEspecies} from './bibliotecaEspecies.js';
import {SUBGRUPOS,normalizarClasificacion,subgrupoPieza,coberturaDelGrupo} from './clasificacion.js';

const $=id=>document.getElementById(id);
const $$=sel=>[...document.querySelectorAll(sel)];
let desarrollador;
let api, atlas, atlasMasculino,atlasFemenino,rays,enfoque,preferencias,vista2d,buscador,especies,tutor,profesional;let cargandoGenero=false;let herramientasMouse, ojoDetallado,inspectorEstudio;
let currentModule='modelado',currentMath='resultado',inspectorTab='anatomia';
let mallaActivadaPorModulo=false; // No desactivar una malla encendida manualmente al cerrar el módulo.
let modoCuerpo='piel';
let chosenSystem='integumentary',scopeAll=false,listLimit=70,activeQuery='',subgrupoActivo='todos';
const grupos={whole:SISTEMAS.map(s=>s.id),circulatory:['cardiac','arterial','venous']};
const grupo=id=>grupos[id]||[id];
const pertenece=(p,id)=>grupo(id).includes(p.system);
let spinning=false,cutting=false,wire=false,normals=false,lightsOn=true,rayVisible=false;
let lastMathUpdate=0,lastFrame=0;
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(window.__toastID);window.__toastID=setTimeout(()=>e.classList.remove('show'),2400);}
function fail(message){console.error('[LABORATORIO 3D]',message);$('loading').hidden=true;$('error').hidden=false;$('errorDetail').textContent=String(message);$('sceneStatus').textContent='ERROR';}
const number=n=>Number(n).toLocaleString('es-PE');
function reflejarBotonesModulos(){
 $$('[data-module]').forEach(b=>{
  const activo=b.dataset.module===currentModule;
  b.classList.toggle('active',activo);
  b.setAttribute('aria-pressed',String(activo));
 });
}
function cambiarModulo(id){
 const anterior=currentModule;
 const siguiente=anterior===id?null:id;
 // La segunda pulsación apaga el módulo y restaura el aspecto original del botón.
 if(anterior==='rayos' && siguiente!=='rayos' && rayVisible){
  rayVisible=false;rays?.setVisible(false);
 }
 if(anterior==='mallas' && siguiente!=='mallas' && mallaActivadaPorModulo){
  setWire(false);mallaActivadaPorModulo=false;
 }
 currentModule=siguiente;
 if(siguiente==='rayos'){
  rayVisible=true;rays?.setVisible(true);
  if(atlas?.selectionMesh)rays?.update(atlas.selectionMesh);
 }
 if(siguiente==='mallas'&&!wire){setWire(true);mallaActivadaPorModulo=true;}
 if(['transformar','materiales','luces'].includes(siguiente))openInspector('control');
 reflejarBotonesModulos();
 updateMath();updateAlgorithm();$('app').classList.remove('open-modules');
 toast(siguiente?(MODULOS.find(m=>m.id===siguiente)?.title||siguiente):'Módulo desactivado');
}
function buildModules(){
 $('moduleNav').innerHTML=MODULOS.map((m,i)=>`<button type="button" class="module-item" aria-pressed="false" title="${escapar(m.text)}" data-module="${m.id}"><span class="module-number">${String(i+1).padStart(2,'0')}</span><span class="module-label">${escapar(m.title)}<small>${escapar(m.sub)}</small></span></button>`).join('');
 reflejarBotonesModulos();
 $('moduleNav').addEventListener('click',e=>{
  const el=e.target.closest('[data-module]');if(!el)return;
  cambiarModulo(el.dataset.module);
 });
}
// La geometría profesional es opcional: si un GLB no existe, se usa el modelo local.
function restaurarAtlasLocal(mensaje=''){
 if(!profesional?.activo)return;
 profesional.desactivar();
 const boton=$('cambiarAtlasProfesional');if(boton)boton.textContent='◈ Abrir modelos nuevos';
 const genero=$('genderSelect'),cambio=$('swapGender');if(genero)genero.disabled=false;if(cambio)cambio.disabled=false;
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 vista2d?.setExternalSelection(null);
 resetearCorte();
 atlas.clearSelection();atlas.setVisible(new Set(['integumentary']));
 actualizarOpacidadPiel(1);syncLayers();
 $('sceneStatus').textContent='MODELO LOCAL · RESPALDO';
 $('modelNotice').innerHTML='<strong>Modelo anatómico local · BodyParts3D</strong><p>Geometría incluida en el proyecto; algunos sistemas y órganos tienen cobertura parcial.</p>';
 if(mensaje)toast(mensaje);
 updateStatus();
}
function chooseSystem(system,{show=true,filterScene=true}={}){
 if(system!=='sensory')ojoDetallado?.cerrar();
 desarrollador?.retirar();
 if(system==='whole'){regresarAlCuerpo('todos');return;}
 if(system==='integumentary'){regresarAlCuerpo('piel');return;}
 modoCuerpo=null;resetSeparacion();
 if(show)registrar29({tipo:"sistema",id:system});
 if($('modeloIntegrado')&&SISTEMAS_INTEGRADOS.some(s=>s.id===system))$('modeloIntegrado').value='sistema:'+system;
 if(!GUIAS[system]&&!['circulatory'].includes(system))return;
 if(profesional?.activo){
  chosenSystem=system;$('systemSelect').value=system;
  if(!profesional.verSistema(system)){
   restaurarAtlasLocal('No se instaló la geometría profesional de este sistema. Se muestra el modelo local.');
   return chooseSystem(system,{show,filterScene});
  }
  if(show){openInspector('anatomia');fijarPaneles(false,true);}
  subgrupoActivo='todos';scopeAll=false;listLimit=70;activeQuery='';
  vista2d?.setSystem(system);renderGuide();renderSubgroups();renderPartBrowser();renderRutaAnatomica();return;
 }
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 chosenSystem=system;vista2d?.setSystem(system);subgrupoActivo='todos';scopeAll=false;listLimit=70;activeQuery='';buscador?.cerrar();
 $('systemSelect').value=system;
 $$('[data-quick-system]').forEach(b=>b.classList.toggle('active',b.dataset.quickSystem===system));
 if(show){openInspector('anatomia');fijarPaneles(false,true);}
 if(filterScene&&atlas){
  // Elegir un sistema no cambia solo un texto: también aísla sus mallas 3D.
  const cantidadLocal=atlas.parts.filter(p=>pertenece(p,system)).length;
  if(!cantidadLocal){toast('No hay geometría local para este sistema. Manteniendo el cuerpo visible.');regresarAlCuerpo();return;}
  atlas.setVisible(new Set(grupo(system)));actualizarOpacidadPiel(system==='integumentary'?1:.16);
  $('btnWhole').classList.remove('active');$('btnSkin').classList.remove('active');$('btnIsolate').classList.remove('active');
  $$('[data-preset]').forEach(b=>b.classList.remove('active'));syncLayers();
  // Elegir un sistema no levita órganos; solo una pieza seleccionada lo hace.
  atlas.clearSelection();enfoque?.enfocarSistema(atlas,grupo(system));updateDetails();toast(system==='digestive'?'Sistema digestivo local parcial: faltan superficies completas de algunos órganos.':'Grupo visible: '+(GUIAS[system]?.titulo||infoSistema(system).name));
 }
 vista2d?.setSystem(system);renderGuide();renderSubgroups();renderPartBrowser();renderRutaAnatomica();
}
function solicitarSistemaIntegrado(id){
 if(id==='whole'){regresarAlCuerpo('todos');return;}
 if(id==='integumentary'){regresarAlCuerpo('piel');return;}
 const selector=$('modeloIntegrado');
 if(selector&&SISTEMAS_INTEGRADOS.some(s=>s.id===id)){
  selector.value='sistema:'+id;selector.dispatchEvent(new Event('change',{bubbles:true}));
 }else chooseSystem(id);
}
function buildSystems(){
 $('systemSelect').innerHTML=[{id:'whole',name:'Cuerpo completo'},{id:'circulatory',name:'Sistema cardiovascular'},...SISTEMAS].map(s=>`<option value="${s.id}">${escapar(s.name)}</option>`).join('');
 $('systemSelect').addEventListener('change',e=>solicitarSistemaIntegrado(e.target.value));
 $('systemList').innerHTML=SISTEMAS.map(s=>`<div class="system-line"><input type="checkbox" data-system="${s.id}" id="layer-${s.id}" ${atlas.visible.has(s.id)?'checked':''} aria-label="Mostrar ${escapar(s.name)}"><i class="system-swatch" style="background:${s.color}"></i><span class="sys-name">${escapar(s.name)}</span><span class="system-count" data-count-system="${s.id}">${atlas.parts.filter(p=>p.system===s.id).length}</span><button class="sys-open" data-open-system="${s.id}" title="Leer sobre este sistema">INFO</button></div>`).join('');
 $('systemList').addEventListener('change',e=>{const id=e.target.dataset.system;if(!id)return;modoCuerpo=null;$('btnWhole').classList.remove('active');$('btnSkin').classList.remove('active');atlas.toggleSystem(id,e.target.checked);$$('[data-preset]').forEach(b=>b.classList.remove('active'));updateStatus();});
 $('systemList').addEventListener('click',e=>{const b=e.target.closest('[data-open-system]');if(b)solicitarSistemaIntegrado(b.dataset.openSystem);});
 $$('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>applyPreset(btn.dataset.preset)));
 $('showAllSearch').addEventListener('click',()=>{scopeAll=!scopeAll;listLimit=70;renderPartBrowser();});
 $('moreParts').addEventListener('click',()=>{listLimit+=70;renderPartBrowser();});
 $('subsystemBrowser').addEventListener('click',e=>{
  const b=e.target.closest('[data-subgrupo]');if(!b)return;
  subgrupoActivo=b.dataset.subgrupo;listLimit=70;renderSubgroups();renderPartBrowser();
  if(subgrupoActivo==='todos'){
   if(profesional?.activo)profesional.verSistema(chosenSystem);
   else {atlas.clearSelection();atlas.setVisible(new Set(grupo(chosenSystem)));enfoque?.enfocarSistema(atlas,grupo(chosenSystem));}
   return;
  }
  if(profesional?.activo&&profesional.seleccionarSubgrupo?.(chosenSystem,subgrupoActivo))return;
  if(profesional?.activo){restaurarAtlasLocal();chooseSystem(chosenSystem);subgrupoActivo=b.dataset.subgrupo;renderSubgroups();renderPartBrowser();}
  const indices=atlas.parts.map((p,i)=>pertenece(p,chosenSystem)&&subgrupoPieza(p)===subgrupoActivo?i:-1).filter(i=>i>=0&&atlas.pickMeshes[i]?.geometry);
  if(!indices.length){
   toast('No hay modelo 3D de esta región. Se buscará una referencia ilustrada.');
   if(subgrupoActivo==='rodilla')vista2d?.setExternalSelection({name:'knee meniscus articular cartilage',titulo2d:'Meniscos y cartílago articular de la rodilla',system:'cartilage'});
   return;
  }
  const def=(SUBGRUPOS[chosenSystem]||[]).find(g=>g.id===subgrupoActivo);
  if(atlas.selectGroup('subgrupo-'+subgrupoActivo,def?.nombre||'Región anatómica',indices,'Agrupación de las mallas disponibles en el modelo.')){
   openInspector('anatomia');fijarPaneles(false,true);toast((def?.nombre||'Región')+' · '+indices.length+' estructuras visibles');
  }
 });
 $('rutaAnatomica').addEventListener('click',e=>{const b=e.target.closest('[data-ruta]');if(!b)return;if(b.dataset.ruta==='cuerpo')regresarAlCuerpo();else chooseSystem(chosenSystem);});
 $('partList').addEventListener('click',e=>{
  const nuevo=e.target.closest('[data-pro-id]');if(nuevo){profesional?.seleccionar(Number(nuevo.dataset.proId));return;}
  const el=e.target.closest('[data-part]');if(el)choosePart(Number(el.dataset.part),{zoom:false});
 });
 $('featuredParts').addEventListener('click',e=>{
  const nuevo=e.target.closest('[data-pro-id]');if(nuevo){profesional?.seleccionar(Number(nuevo.dataset.proId));return;}
  const el=e.target.closest('[data-featured]');if(el)choosePart(Number(el.dataset.featured),{zoom:true});
 });
 $('systemSelect').value=chosenSystem;
 $('quickSystems').innerHTML=[['nervous','NERVIOSO'],['respiratory','RESPIRATORIO'],['circulatory','CIRCULATORIO'],['digestive','DIGESTIVO'],['skeletal','ÓSEO'],['muscular','MUSCULAR'],['urinary','URINARIO']].map(([id,label])=>`<button data-quick-system="${id}" class="${chosenSystem===id?'active':''}">${label}</button>`).join('');
 $('quickSystems').addEventListener('click',e=>{const b=e.target.closest('[data-quick-system]');if(b)solicitarSistemaIntegrado(b.dataset.quickSystem);});
}
function refreshSystems(){
 $$('[data-count-system]').forEach(e=>e.textContent=number(atlas.parts.filter(p=>p.system===e.dataset.countSystem).length));
 $('systemSelect').value=chosenSystem;syncLayers();renderGuide();renderSubgroups();renderPartBrowser();updateDetails();renderRutaAnatomica();
}
function syncLayers(){$$('[data-system]').forEach(input=>input.checked=atlas.visible.has(input.dataset.system));}
// El valor del control expresa TRANSPARENCIA, el material usa OPACIDAD.
function actualizarOpacidadPiel(opacidad){
 if(!atlas)return;
 const op=Math.max(0,Math.min(1,Number(opacidad)));
 atlas.setSkinOpacity(op);
 const porcentaje=Math.round((1-op)*100);
 $('skinOpacity').value=String(porcentaje);
 $('skinOpacityValue').textContent=porcentaje+'%';
}
function aplicarMovimientoReducido(reducir){
 atlasMasculino?.setReducedMotion?.(reducir);
 atlasFemenino?.setReducedMotion?.(reducir);
 atlas?.setReducedMotion?.(reducir);
 if(reducir&&api?.controls){spinning=false;api.controls.autoRotate=false;$('btnSpin')?.classList.remove('active');}
}
function resetearCorte(){
 cutting=false;
 atlas?.setCut(false,0,'x',false);
 $('btnCut').classList.remove('active');$('cutAxis').value='x';$('cutInvert').checked=false;
 $('cutOffset').value='0';$('cutValue').textContent='0 cm';
}

function applyPreset(preset){
 if(!atlas)return;
 if(preset==='todos'||preset==='piel'){regresarAlCuerpo(preset==='todos'?'todos':'piel');return;}
 modoCuerpo=null;resetSeparacion();
 if(profesional?.activo){
  if(preset==='piel'||preset==='todos'){
   restaurarAtlasLocal('Vista de cuerpo completo con piel restaurada');
  }else{
   const filtro=preset==='huesos'?'skeletal':preset==='organos'?'visceral':preset==='interno'?'todos':'todos';
   if(profesional.verSistema(filtro))return;
   restaurarAtlasLocal('Falta el archivo GLB de esta capa; usando el modelo local');
  }
 }
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 let set=new Set(SISTEMAS.map(s=>s.id));
 if(preset==='interno')set.delete('integumentary');
 if(preset==='huesos')set=new Set(['skeletal']);
 if(preset==='organos')set=new Set(['cardiac','digestive','respiratory','urinary','reproductive','endocrine','nervous','sensory','lymphatic']);
 if(preset==='piel'||preset==='todos')set=new Set(['integumentary']);
 atlas.setVisible(set);actualizarOpacidadPiel(preset==='piel'||preset==='todos'?1:.16);
 if(atlas.isolated){atlas.setIsolate(false);$('btnIsolate').classList.remove('active');}
 if(atlas.selected>=0)atlas.clearSelection(); // Cambiar capas siempre cierra la inspección.
 $$('[data-preset]').forEach(x=>x.classList.toggle('active',x.dataset.preset===preset));
 $('btnWhole').classList.remove('active');$('btnSkin').classList.remove('active');syncLayers();updateStatus();toast('Capas: '+preset);
}
function renderSubgroups(){
 const wrap=$('subsystemBrowser');const entries=SUBGRUPOS[chosenSystem];
 if(!entries){wrap.innerHTML='<p class="subgrupo-nota">Esta categoría no tiene subdivisiones adicionales verificadas.</p>';return;}
 const counts=profesional?.activo?Object.fromEntries(entries.map(g=>[g.id,profesional.contarSubgrupo?.(chosenSystem,g.id)||0])):coberturaDelGrupo(atlas.parts,chosenSystem);
 wrap.innerHTML=`<div class="subgrupo-botones">${entries.map(g=>`<button type="button" data-subgrupo="${g.id}" class="${subgrupoActivo===g.id?'active':''}" title="${counts[g.id]?'Mostrar estas estructuras en 3D':'Consultar esta región y referencias si hay disponibilidad'}">${escapar(g.nombre)} <b>${counts[g.id]||0}</b></button>`).join('')}</div><p class="subgrupo-nota">${chosenSystem==='cartilage'?'Los meniscos y el cartílago articular de la rodilla existen anatómicamente. Si su contador es cero, esta fuente no tiene la geometría de esa región; se ofrece una lámina de referencia.':'La cobertura depende de las estructuras que contenga el modelo activo. Selecciona una región para mostrarla.'}</p>`;
}
function renderGuide(){
 if(!atlas)return;
 const s=chosenSystem==='whole'?{name:'Cuerpo completo'}:chosenSystem==='circulatory'?{name:'Sistema cardiovascular'}:infoSistema(chosenSystem),g=atlas.sex==='female'&&chosenSystem==='reproductive'?{...GUIAS.reproductive,resumen:'La referencia femenina incluye estructuras del sistema reproductor tales como útero, ovarios, trompas uterinas y vagina, según las mallas disponibles.',funciones:['Los ovarios contienen y maduran ovocitos y producen hormonas sexuales.','Las fimbrias tubáricas pueden captar el ovocito y conducirlo hacia el útero; no hay una unión anatómica directa entre ovario y trompa.','El útero participa en la gestación cuando ocurre.'],recorrido:'El ovocito puede ser captado por las fimbrias tubáricas; la trompa conduce hacia el útero. El cuello uterino se comunica con la vagina.',relaciones:'Se relaciona con los sistemas endocrino, urinario y cardiovascular.'}:GUIAS[chosenSystem],n=profesional?.activo?profesional.contarSistema(chosenSystem):atlas.parts.filter(p=>pertenece(p,chosenSystem)).length;
 $('systemGuide').innerHTML=`<div class="guide-kicker">GRUPO ANATÓMICO · ${escapar(s.name)}</div><h3>${escapar(g.titulo)}</h3><div class="guide-sub">${escapar(g.sub)}</div><p>${escapar(g.resumen)}</p><h4>FUNCIONES PRINCIPALES</h4><ul>${g.funciones.map(v=>`<li>${escapar(v)}</li>`).join('')}</ul><h4>RECORRIDO Y SECUENCIA</h4><p>${escapar(g.recorrido)}</p><h4>RELACIONES CON OTROS SISTEMAS</h4><p>${escapar(g.relaciones)}</p><div class="guide-total">${number(n)} MALLAS DE ESTE GRUPO · ${escapar(s.name.toUpperCase())}</div><div class="guide-note">Síntesis didáctica de anatomía general. Los grupos son categorías de visualización, no necesariamente sistemas fisiológicos independientes; el atlas puede omitir estructuras. <a href="${chosenSystem==='nervous'?'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system':chosenSystem==='cartilage'?'https://openstax.org/books/anatomy-and-physiology-2e/pages/4-3-connective-tissue-supports-and-protects':'https://openstax.org/details/books/anatomy-and-physiology-2e'}" target="_blank" rel="noopener noreferrer">Fuente anatómica: OpenStax</a>.</div>`;
 if(!profesional?.activo){const c=auditarCobertura(atlas.parts,chosenSystem);if(c.estado.length)$('systemGuide').insertAdjacentHTML('beforeend',`<div class="guide-note"><b>Inventario del modelo local (no certifica integridad):</b> ${c.cantidad} mallas. ${c.faltantes.length?'No se encontró una malla nominal para: '+escapar(c.faltantes.join(', ')):'Se localizaron los nombres mínimos de referencia.'}</div>`);}
 if(chosenSystem==='digestive'&&!profesional?.activo)$('systemGuide').insertAdjacentHTML('beforeend','<div class="guide-note"><b>Estado del modelo local:</b> representación parcial: contiene esófago, estómago, intestinos y vías biliares, pero no el hígado completo. El selector carga los modelos nuevos cuando están disponibles.</div>');
 if(chosenSystem==='sensory')$('systemGuide').insertAdjacentHTML('beforeend','<button type="button" class="button primary full" data-abrir-ojo="1">Explorar ojo 3D por capas</button><p class="guide-note">Las mallas del ojo se pueden ver con colores y capas separables, sin perder su ficha anatómica.</p>');
 $('systemPieces').textContent=number(n)+' PIEZAS';
 const cobertura=$('cobertura31');if(cobertura){const c=auditarCobertura(atlas.parts,chosenSystem);cobertura.textContent=profesional?.activo?`Modelos adicionales: ${profesional.capasCargadas.length} de 7 cargados. Algunas estructuras pueden faltar.`:c.faltantes.length?`Vista con ${n} piezas disponibles; algunas estructuras no están modeladas.`:`Vista con ${n} piezas disponibles.`;}
 const quick=[];const included=new Set();
 for(const word of g.explora){const ix=atlas.parts.findIndex((p,i)=>pertenece(p,chosenSystem)&&p.name.toLowerCase().includes(word.toLowerCase())&&!included.has(i));if(ix<0)continue;included.add(ix);const p=atlas.parts[ix],d=detallePieza(p);quick.push(`<button data-featured="${ix}" title="${escapar(nombreAnatomico(p).espanol)}">${escapar(nombreAnatomico(p).espanol)}</button>`);}
 if(profesional?.activo){
  const pro=profesional.listarSistema?.(chosenSystem,'todos','')?.slice(0,10)||[];
  $('featuredParts').innerHTML=pro.length?pro.map(e=>`<button data-pro-id="${e.id}" title="${escapar(e.nombreEs)}">${escapar(e.nombreEs)}</button>`).join(''):'<span class="part-empty">Elige una estructura cuando estén disponibles.</span>';
 }else $('featuredParts').innerHTML=quick.length?quick.join(''):'<span class="part-empty">Elige una estructura de la lista.</span>';
 renderPartGuide();
}
function renderPartGuide(){
 const p=atlas?.selectedPart();
 const bloque=$('partGuide');
 if(!p){bloque.innerHTML='<p class="ficha-sin-seleccion">Selecciona una estructura para descubrir su descripción, función y relaciones anatómicas.</p>';return;}
 const ficha=fichaComponente(p);
 if(p.numeroMallas){
  bloque.innerHTML=`<div class="guide-kicker">CONJUNTO ANATÓMICO</div><h3>${escapar(ficha.nombre)}</h3><p>${escapar(p.nota||'Agrupación visual de componentes originales.')}</p><details class="origen-anatomico"><summary>Datos del modelo</summary><p>Conjunto de ${number(p.numeroMallas)} mallas; no es un órgano adicional.</p></details>`;
  return;
 }
 const fila=(titulo,valor,clase='')=>valor&&(!/^(No especificad|No documentad)/i.test(valor))?`<section class="ficha-seccion ${clase}"><h4>${escapar(titulo)}</h4><p>${escapar(valor)}</p></section>`:'';
 const apartado=(titulo,valor)=>valor?`<div class="ficha-mini"><span>${escapar(titulo)}</span><strong>${escapar(valor)}</strong></div>`:'';
 bloque.innerHTML=`
  <div class="ficha-v51-cabecera"><span class="guide-kicker">INFORMACIÓN ANATÓMICA</span><h3>${escapar(ficha.nombre)}</h3><div class="ficha-claves">${apartado('Sistema',ficha.grupo)}${apartado('Estructura',ficha.tipo)}${apartado('Ubicación',ficha.ubicacion)}</div></div>
  ${fila('Qué es',ficha.descripcion,'ficha-principal')}
  ${fila(ficha.nivel==='general de categoría'?'Función del tipo de estructura':'Qué hace',ficha.funcion,'ficha-funcion')}
  ${fila('Organización',ficha.estructura!==ficha.descripcion?ficha.estructura:'')}
  ${fila('Relaciones anatómicas',ficha.relaciones)}
  <details class="ficha-metadata"><summary>Fuentes, alcance y datos del modelo</summary>
   <p class="ficha-alcance">${escapar(ficha.alcance)}</p>
   <dl><dt>Identificador</dt><dd>${escapar(ficha.id)}</dd><dt>Nombre original</dt><dd>${escapar(ficha.original)}</dd><dt>Geometría</dt><dd>${number(ficha.vertices)} vértices · ${number(ficha.triangulos)} triángulos</dd></dl>
   <p>Geometría y nombres: BodyParts3D 4.0. Consulta educativa, no diagnóstica.</p>
   <a href="https://openstax.org/details/books/anatomy-and-physiology-2e" target="_blank" rel="noopener noreferrer">Referencia de anatomía: OpenStax</a>
   ${ficha.fuentes?.length?'<a href="https://www.ncbi.nlm.nih.gov/books/" target="_blank" rel="noopener noreferrer">Biblioteca anatómica: NCBI Bookshelf</a>':''}
  </details>`;
}

function renderPartBrowser(){
 if(!atlas)return;
 if(profesional?.activo){
  const encontrados=profesional.listarSistema?.(scopeAll?'todos':chosenSystem,scopeAll?'todos':subgrupoActivo,activeQuery)||[];
  $('listCount').textContent=number(encontrados.length)+' ESTRUCTURAS DISPONIBLES';
  $('showAllSearch').textContent=scopeAll?'SOLO ESTE SISTEMA':'VER TODAS';
  const mostradas=encontrados.slice(0,listLimit);
  $('partList').innerHTML=mostradas.length?mostradas.map(e=>`<button class="part-item" data-pro-id="${e.id}"><i></i><span>${escapar(e.nombreEs)}</span><small>${escapar(GUIAS[e.sistema]?.titulo||'Modelo anatómico')}</small></button>`).join(''):'<p class="part-empty">Esta región no tiene mallas 3D identificables en el modelo cargado.</p>';
  $('moreParts').hidden=mostradas.length>=encontrados.length;
  $('moreParts').textContent=`Mostrar más (${number(encontrados.length-mostradas.length)} restantes)`;
  return;
 }
 const q=activeQuery.toLowerCase().trim();const found=[];
 atlas.parts.forEach((p,i)=>{if(!scopeAll&&!pertenece(p,chosenSystem))return;if(!scopeAll&&subgrupoActivo!=='todos'&&subgrupoPieza(p)!==subgrupoActivo)return;if(q&&!p.name.toLowerCase().includes(q)&&!p.id.toLowerCase().includes(q)&&!p.conceptId?.toLowerCase().includes(q)&&!detallePieza(p).titulo.toLowerCase().includes(q)&&!nombreAnatomico(p).espanol.toLowerCase().includes(q))return;found.push(i);});
 $('listCount').textContent=number(found.length)+' ELEMENTOS';$('showAllSearch').textContent=scopeAll?'SOLO ESTE SISTEMA':'VER TODAS';
 const shown=found.slice(0,listLimit);
 $('partList').innerHTML=shown.length?shown.map(i=>{const p=atlas.parts[i],d=detallePieza(p);return `<button class="part-item ${atlas.selected===i?'active':''}" data-part="${i}"><i></i><span>${escapar(nombreAnatomico(p).espanol)}</span><small>${escapar(p.id)}</small></button>`;}).join(''):'<div class="part-empty">No se encontraron piezas. Prueba otro nombre o cambia el sistema.</div>';
 $('moreParts').hidden=shown.length>=found.length;
 $('moreParts').textContent=`Mostrar más (${number(found.length-shown.length)} restantes)`;
}
let historial29=[],actual29=null,restaurando29=false;
function registrar29(item){if(!item||restaurando29)return;if(actual29&&JSON.stringify(actual29)!==JSON.stringify(item))historial29.push(actual29);if(historial29.length>50)historial29.shift();actual29=item;$('historialAnterior').disabled=!historial29.length;}
function openInspector(name){
 if(name==='tutor')name='anatomia'; // V44: el tutor ya esta integrado en la ficha.
 inspectorTab=name;
 $$('[data-itab]').forEach(b=>{
  const active=b.dataset.itab===name;
  b.classList.toggle('active',active);
  b.setAttribute('aria-selected',String(active));
  b.tabIndex=active?0:-1;
 });
 $$('.inspector-pane').forEach(el=>el.hidden=el.id!==`tab-${name}`);
 $('abrirTutorDirecto')?.setAttribute('aria-expanded',String(name==='tutor'));
 // Al cambiar de pestaña, el contenido comienza siempre desde arriba.
 const scroll=$('inspectorContent');if(scroll)scroll.scrollTop=0;
}
function updateStatus(){if(desarrollador?.activo){$('visibleParts').textContent='Modelo importado · geometría sin verificar';return;}if(profesional?.activo){$('visibleParts').textContent=`${number(profesional.seleccion?1:profesional.total)} estructuras del modelo avanzado`;return;}if(!atlas)return;$('visibleParts').textContent=`${number(atlas.visibleCount())} / ${number(atlas.parts.length)}`;}
function mostrarImportado(e){
 if(!e)return;inspectorEstudio?.actualizarExterno({nombre:e.nombre,grupo:'Modelo importado',tipo:'Submalla 3D',descripcion:'Modelo externo de GitHub, sin identificación anatómica validada.',vertices:e.vertices,triangulos:e.triangulos});updateStatus(); $('partName').textContent=e.nombre;$('detalleSistemaActual').textContent='MODELO IMPORTADO';$('selectedId').textContent='GitHub · '+e.id;$('partDescription').textContent='Submalla del archivo importado. Su identidad anatómica no está verificada.';$('partGuide').textContent=$('partDescription').textContent;$('partesSeleccion29').hidden=true;$('partTags').replaceChildren();$('partCallout').hidden=true;$('calloutConnector').hidden=true;$('mathSelectedName').textContent=e.nombre;$('mathPartId').textContent='GitHub';$('mathVertexCount').textContent=number(e.vertices)+' vértices';$('mathFaceCount').textContent=number(e.triangulos)+' triángulos';$('specGrid').textContent=number(e.vertices)+' vértices · '+number(e.triangulos)+' triángulos';vista2d?.setExternalSelection({name:e.nombre,titulo2d:e.nombre,sinReferencias:true},'Modelo importado');tutor?.explicarExterno({seleccion:e.nombre,especie:'GitHub'});openInspector('anatomia');fijarPaneles(false,true);updateMath();updateAlgorithm();
}
function updateMath(){
 if(!currentMath){$('mathDisplay').innerHTML='<p>Selecciona Valores, Matrices, Pasos, Teoría o Código para consultar el análisis.</p>';return;}
 if(!currentModule){$('mathDisplay').innerHTML='<p>Selecciona un módulo de computación para consultar las operaciones asociadas.</p>';return;}
 if(desarrollador?.activo){const e=desarrollador.seleccion;if(!e){$('mathDisplay').textContent='Selecciona una submalla importada.';return;}e.mesh.updateWorldMatrix(true,false);const M=e.mesh.matrixWorld.elements;$('mathDisplay').textContent=`${e.nombre}\nVértices: ${e.vertices} · Triángulos: ${e.triangulos}\nMatriz de mundo 4 × 4 (p′ = M · p):\n`+[0,1,2,3].map(f=>[0,1,2,3].map(c=>M[c*4+f].toFixed(4)).join('   ')).join('\n');return;}
 if(profesional?.activo){
  const e=profesional.seleccion,mesh=e?.mallas[0];
  if(!mesh){$('mathDisplay').textContent='Selecciona una estructura real del modelo avanzado para consultar su geometría y matriz.';return;}
  mesh.updateWorldMatrix(true,false);
  const verts=e.mallas.reduce((a,m)=>a+(m.geometry?.getAttribute('position')?.count||0),0);
  const tri=e.mallas.reduce((a,m)=>a+Math.floor((m.geometry.index?.count||m.geometry.getAttribute('position')?.count||0)/3),0);
  const M=mesh.matrixWorld.elements;
  const matriz=[0,1,2,3].map(f=>[0,1,2,3].map(c=>M[c*4+f].toFixed(3)).join('    ')).join('\n');
  $('mathDisplay').textContent=`${e.nombreEs}\nVértices: ${verts.toLocaleString('es-PE')}\nTriángulos: ${tri.toLocaleString('es-PE')}\nMatriz 4 × 4 real del primer objeto:\n${matriz}`;
  return;
 }
 if(especies?.activo()){
  const mesh=especies.seleccionMesh();
  if(!mesh){$('mathDisplay').textContent='Modelo GLB importado. Selecciona una submalla para obtener sus valores reales.';return;}
  mesh.updateWorldMatrix(true,false);
  const g=mesh.geometry, vertices=g.getAttribute('position')?.count||0;
  const triangulos=Math.floor((g.getIndex()?.count||vertices)/3);
  const matriz=mesh.matrixWorld.elements;
  const filas=[0,1,2,3].map(f=>[0,1,2,3].map(c=>Number(matriz[c*4+f]).toFixed(3)).join('   ')).join('\n');
  const nombre=escapar(traducirNombreAnatomico(mesh.name||'Malla GLB'));
  $('mathDisplay').innerHTML=`<h3>${nombre}</h3><p><b>${number(vertices)} vértices</b> · ${number(triangulos)} triángulos</p><p><b>Matriz 4 × 4 real (mundo)</b></p><pre>${filas}</pre><p>p' = M × p. Esta es la matriz del archivo importado y no una simulación.</p>`;
  return;
 }
 if(!atlas)return;
 $('mathDisplay').innerHTML=panelMatematico(atlas,api,currentMath,currentModule);
}
function mathTab(t){
 // En la segunda pulsación se deselecciona la pestaña y vuelve al color original.
 currentMath=currentMath===t?null:t;
 $$('[data-mtab]').forEach(b=>{
  const activo=b.dataset.mtab===currentMath;
  b.classList.toggle('active',activo);
  b.setAttribute('aria-pressed',String(activo));
 });
 updateMath();
}
function updateAlgorithm(){
 if(!currentModule){$('algorithmCard').innerHTML='<p>Selecciona uno de los siete módulos para ver el algoritmo y sus fórmulas.</p>';return;}
 if(desarrollador?.activo){$('algorithmCard').textContent='Modelo importado: geometría indexada del archivo; pMundo = M × pLocal. Selecciona una malla y consulta su matriz en Matemáticas.';return;}
 if(especies?.activo()){
  const mesh=especies.seleccionMesh();
  const parte=escapar(traducirNombreAnatomico(mesh?.name||'Modelo GLB importado'));
  $('algorithmCard').innerHTML=`<h3>${parte} · geometría importada</h3><p>Las posiciones, los índices y la matriz de mundo proceden del modelo GLB. Las operaciones del atlas BodyParts3D no se aplican automáticamente al archivo externo.</p><pre>const gltf = await loader.loadAsync(url);\nconst mesh = gltf.scene.getObjectByName(nombre);\nmesh.updateWorldMatrix(true, false);\nconst M = mesh.matrixWorld;\n// pMundo = M × pLocal</pre>`;
  return;
 }
 const m=MODULOS.find(x=>x.id===currentModule)||MODULOS[0],p=atlas?.selectedPart(),d=atlas&&api?metricas(atlas,api):null;
 if(!p){$('algorithmCard').innerHTML=`<h3>${escapar(m.title)}</h3><p>${escapar(m.text)}</p><pre>${escapar(m.formula)}</pre>`;return;}
 const scripts={
 modelado:`// Se leen los buffers de ${p.id}\nconst vertices = new Float32Array(\n  bytes, parte.positions, parte.vertexCount*3);\nconst indices = new Uint32Array(\n  bytes, parte.indices, parte.indexCount);\nconst geo = new THREE.BufferGeometry();\ngeo.setAttribute('position',\n new THREE.BufferAttribute(vertices, 3));\ngeo.setIndex(new THREE.BufferAttribute(indices,1));\n// Las normales vienen del atlas optimizado.`,
 mallas:`// Triángulo de la malla seleccionada\nconst A = vector(i0), B = vector(i1);\nconst C = vector(i2);\nconst u = B.clone().sub(A);\nconst v = C.clone().sub(A);\nconst N = u.cross(v).normalize();`,
 transformar:`// Matriz del órgano en escena\nconst M = new THREE.Matrix4()\n .makeTranslation(c.x+e.x+l.x,\n    c.y+e.y+l.y,c.z+e.z+l.z)\n .multiply(new THREE.Matrix4()\n    .compose(delta, rotacion, escala))\n .multiply(new THREE.Matrix4()\n    .makeTranslation(-c.x,-c.y,-c.z));\nmesh.matrix.copy(M);`,
 luces:`// El motor usa luces reales\nkey.position.set(x, y, z);\nkey.intensity = potencia;\n// Ángulo difuso, ejemplo conceptual:\nconst coseno = Math.max(0,N.dot(L));`,
 materiales:`// Material de la pieza seleccionada\nconst mat = mesh.material;\nmat.color.set(color);\nmat.roughness = rugosidad;\nmat.metalness = metalizado;`,
 render:`// Renderizado sobre el canvas WebGL\ncontrols.update();\nrenderer.render(scene, camera);\n// stats: renderer.info.render.triangles\n// FPS: fotogramas / tiempo transcurrido`,
 rayos:`// Reflexión especular matemática\nconst N = normalMundo.normalize();\nconst I = incidente.normalize();\nconst R = I.clone().addScaledVector(\n   N, -2 * I.dot(N)).normalize();\n// Demostración, NO ray tracing físico.`
 };
 if(atlas.sex==='female')scripts.modelado=`// GLB femenino: geometrías originales del HRA\nconst modelo = await loader.loadAsync(url);\nconst geo = mesh.geometry.clone();\ngeo.applyMatrix4(mesh.matrixWorld);\ngeo.scale(factor, factor, factor);`;
 $('algorithmCard').innerHTML=`<h3>${escapar(m.title)} · ${escapar(p.id)}</h3><p><b>ORIGEN:</b> ${p.numeroMallas?'Agrupación temporal de '+p.numeroMallas+' mallas existentes del modelo.':atlas.sex==='female'?'Malla real del Human Reference Atlas, cargada como GLB.':'Malla de referencia BodyParts3D en buffers binarios.'} La aplicación transforma la geometría y no inventa el órgano.</p><div class="algorithm-stat"><b>${number(p.vertexCount)} V</b><b>${number(p.indexCount/3)} △</b><b>BLOQUE ${p.chunk}</b></div><pre>${escapar(scripts[currentModule]||scripts.modelado)}</pre><p><b>MATEMÁTICA:</b> ${escapar(m.formula)}</p>${d?`<p><b>VÉRTICE FINAL (m):</b> ${d.transformed.toArray().map(x=>x.toFixed(4)).join(' · ')}</p>`:''}`;
}
function renderRutaAnatomica(){
 const wrap=$('rutaAnatomica');if(!wrap||!atlas)return;
 const part=atlas.selectedPart(),s=infoSistema(part?.system||chosenSystem);
 wrap.innerHTML=`<button type="button" data-ruta="cuerpo">Cuerpo humano</button><span aria-hidden="true">›</span><button type="button" data-ruta="sistema">${escapar(s.name)}</button>${part?`<span aria-hidden="true">›</span><strong title="${escapar(nombreAnatomico(part).espanol)}">${escapar(nombreAnatomico(part).espanol)}</strong>`:''}`;
}
function updateDetails({renderBrowser=true}={}){
 if(!atlas)return;
 const p=atlas.selectedPart(),d=htmlEspecificaciones(atlas,api);
 $('partName').textContent=p?nombreAnatomico(p).espanol:(GUIAS[chosenSystem]?.titulo||'Cuerpo humano');
 $('detalleSistemaActual').textContent=p?infoSistema(p.system).name:(GUIAS[chosenSystem]?.titulo||'CUERPO HUMANO');
 $('selectedId').textContent=d.id;
 $('partDescription').textContent=p?(p.numeroMallas?(p.nota||'Conjunto de mallas anatómicas.'):fichaComponente(p).resumen):(GUIAS[chosenSystem]?.resumen||'Selecciona una estructura del cuerpo para conocer su ubicación y sus funciones.');
 $('partTags').innerHTML=d.tags;$('specGrid').innerHTML=d.grid;$('materialInfo').innerHTML=d.materials;
 $('mathSelectedName').textContent=p?nombreAnatomico(p).espanol:'Sin selección';$('mathPartId').textContent=d.id;
 $('mathVertexCount').textContent=p?number(p.vertexCount)+' vértices':'— vértices';$('mathFaceCount').textContent=p?number(p.indexCount/3)+' triángulos':'— triángulos';
 $('calloutName').textContent=p?nombreAnatomico(p).espanol:'—';$('calloutSystem').textContent=p?infoSistema(p.system).name:'—';
 if(p&&(chosenSystem==='whole'||!pertenece(p,chosenSystem))){chosenSystem=p.system;scopeAll=false;activeQuery='';listLimit=70;$('systemSelect').value=chosenSystem;renderGuide();}
 renderPartGuide();renderRutaAnatomica();updateMath();updateAlgorithm();updateStatus();
 inspectorEstudio?.actualizarLocal(p&&!p.numeroMallas?fichaComponente(p):p?{id:p.id,nombre:nombreAnatomico(p).espanol,grupo:infoSistema(p.system).name,descripcion:p.nota,funcion:'Conjunto visual de mallas anatómicas; no representa una nueva estructura fisiológica.',tipo:'Grupo visual'}:null,atlas.selected,atlas.sex);
 if(renderBrowser)renderPartBrowser();
 const mat=atlas.selectionMesh?.material;
 if(mat){$('matColor').value='#'+mat.color.getHexString();$('matRoughness').value=Math.round(mat.roughness*100);$('roughValue').textContent=mat.roughness.toFixed(2);$('matMetal').value=Math.round(mat.metalness*100);$('metalValue').textContent=mat.metalness.toFixed(2);}
}
const axes=[['tx','X',-.5,.5,.01],['ty','Y',-.5,.5,.01],['tz','Z',-.5,.5,.01],['rx','X',-180,180,1],['ry','Y',-180,180,1],['rz','Z',-180,180,1],['sx','X',.35,2.5,.05],['sy','Y',.35,2.5,.05],['sz','Z',.35,2.5,.05]];
function buildTransforms(){
 const names={t:'TRASLACIÓN / METROS',r:'ROTACIÓN / GRADOS',s:'ESCALAMIENTO / FACTOR'};
 $('transformControls').innerHTML=['t','r','s'].map(prefix=>`<div class="transform-block"><h4>${names[prefix]}</h4>${axes.filter(a=>a[0].startsWith(prefix)).map(([key,axis,min,max,step])=>`<label class="transform-row"><span>${axis}</span><input type="range" data-transform="${key}" min="${min}" max="${max}" step="${step}" value="${prefix==='s'?1:0}"><output id="value_${key}">${prefix==='s'?'1.00':'0.00'}</output></label>`).join('')}</div>`).join('');
 $('transformControls').addEventListener('input',e=>{const key=e.target.dataset.transform;if(!key||!atlas?.selectionMesh)return;atlas.setTransform(key,e.target.value);$('value_'+key).textContent=Number(e.target.value).toFixed(key.startsWith('r')?0:2);if(rayVisible)rays.update(atlas.selectionMesh);updateDetails({renderBrowser:false});});
 $('resetTransform').addEventListener('click',()=>{if(!atlas?.selectionMesh)return;atlas.resetTransform();syncTransforms();updateDetails({renderBrowser:false});toast('Transformaciones restauradas');});
}
function syncTransforms(){if(!atlas)return;$$('[data-transform]').forEach(input=>{const k=input.dataset.transform;input.value=atlas.transform[k];$('value_'+k).textContent=Number(input.value).toFixed(k.startsWith('r')?0:2);});}
// Solo existe un visor WebGL: seleccionar acerca la cámara, no abre otra ventana.
function seleccionCambiada(part){
 if(part){solicitudModelo++;$('modeloIntegrado').disabled=false;}
 if(part)registrar29(part.numeroMallas&&GRUPOS_3D.some(g=>'conjunto-'+g.id===part.id)?{tipo:'grupo',id:part.id.replace('conjunto-','')}:{tipo:'pieza',id:atlas.selected});
 const partes=$('partesSeleccion29');partes.hidden=!atlas.selectionIndices?.length;partes.innerHTML=atlas.selectionIndices?.length?'<h4>Partes del órgano seleccionado</h4>'+atlas.selectionIndices.map(i=>`<button data-subparte29="${i}">${escapar(nombreAnatomico(atlas.parts[i]).espanol)}</button>`).join(''):'';
 if(part){modoCuerpo=null;resetSeparacion();$('btnWhole').classList.remove('active');$('btnSkin').classList.remove('active');openInspector('anatomia');}
 syncTransforms();updateDetails();
 vista2d?.setSelected(part||null);
 if(part)tutor?.explicarSeleccion(part);
 if(part){
  $('seleccionActivaNombre').textContent=nombreAnatomico(part).espanol;
  $('btnFloat').classList.toggle('active',atlas.liftEnabled);
  $('btnFloat').setAttribute('aria-pressed',String(atlas.liftEnabled));
  $('alternarLevitacion').textContent=atlas.liftEnabled?'Detener levitación':'Activar levitación';
  $('alternarLevitacion').setAttribute('aria-pressed',String(atlas.liftEnabled));
  $('barraSeleccion').hidden=false;
  $('btnIsolate').classList.add('active');
  $('btnIsolate').textContent='◎ Solo pieza';
  enfoque?.enfocar(atlas);
  $('viewName').textContent=atlas.selectionPart?'ÓRGANO · CONJUNTO 3D':'PIEZA SELECCIONADA';
 }else{
  $('barraSeleccion').hidden=true;
  $('btnIsolate').classList.remove('active');
  enfoque?.regresar();
  $('viewName').textContent=modoCuerpo==='piel'?'PIEL Y CABELLO':modoCuerpo==='todos'?'CUERPO COMPLETO':(GUIAS[chosenSystem]?.titulo||'Sistema anatómico').toUpperCase();
 }
}
function resetSeparacion(){
 if(!atlas)return;if(profesional?.activo&&profesional.separacion)profesional.setSeparacion(0,false);if(atlas.explode!==0){atlas.setExplode(0);api.setBodyBounds(atlas.boxes);}$('explode').value='0';$('explodeValue').textContent='0%';$('leyendaSeparacion').hidden=true;$('btnSeparar').classList.remove('active');$('btnSeparar').setAttribute('aria-pressed','false');$('btnSeparar').textContent='Separar capas';
}
function regresarAlCuerpo(modo='todos'){ojoDetallado?.cerrar();
 if(!atlas)return;desarrollador?.retirar();
 solicitudModelo++; if($('modeloIntegrado'))$('modeloIntegrado').disabled=false;document.body.classList.remove('cambiando-modelo');
 modo=modo==='piel'?'piel':'todos';
 registrar29({tipo:'cuerpo',modo});
 if(profesional?.activo)restaurarAtlasLocal();
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 herramientasMouse?.activar('explorar');resetearCorte();resetSeparacion();
 modoCuerpo=modo;chosenSystem=modo==='piel'?'integumentary':'whole';
 subgrupoActivo='todos';scopeAll=false;activeQuery='';listLimit=70;
 atlas.clearSelection();atlas.setVisible(modo==='piel'?new Set(['integumentary']):capasDisponibles(atlas.parts));
 actualizarOpacidadPiel(modo==='piel'?1:.18);syncLayers();
 $('modeloIntegrado').value=modo==='piel'?'piel':'humano';$('systemSelect').value=chosenSystem;
 $('modeloIntegradoEstado').textContent=modo==='piel'?'Piel y cabello · vista externa':'Cuerpo completo · usa Separación para explorar las capas';
 $('barraSeleccion').hidden=true;$('partCallout').hidden=true;$('calloutConnector').hidden=true;
 $('btnIsolate').classList.remove('active');$('btnIsolate').textContent='◎ Solo pieza';
 $('btnWhole').classList.toggle('active',modo==='todos');$('btnSkin').classList.toggle('active',modo==='piel');
 $$('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===modo));
 $$('[data-quick-system]').forEach(b=>b.classList.remove('active'));
 elegidoSinBusqueda();enfoque?.olvidar();api.setBodyBounds(atlas.boxes);api.camView('frente');
 $('viewName').textContent=modo==='piel'?'PIEL Y CABELLO':'CUERPO COMPLETO';
 openInspector('anatomia');vista2d?.setSelected(null);renderGuide();renderSubgroups();updateDetails();
}
function separarCuerpo(valor){
 if(!atlas)return;
 if(desarrollador?.activo||especies?.activo()){toast('La separación requiere capas anatómicas identificadas.');$('explode').value='0';return;}
 if(profesional?.activo){if(!profesional.separacion&&valor>0)profesional.mostrarTodo();profesional.setSeparacion(valor/100);$('explode').value=String(valor);$('explodeValue').textContent=valor+'%';$('btnSeparar').classList.toggle('active',valor>0);$('btnSeparar').setAttribute('aria-pressed',String(valor>0));$('btnSeparar').textContent=valor>0?'Reunir capas':'Separar capas';$('leyendaSeparacion').hidden=true;toast('Separación de las capas profesionales instaladas');return;}
 if(atlas.selected>=0||modoCuerpo!=='todos'||atlas.visible.size!==capasDisponibles(atlas.parts).size){
  // La herramienta es una vista del cuerpo completo, nunca de una sola malla.
  regresarAlCuerpo('todos');
 }
 atlas.setExplode(valor/100);actualizarOpacidadPiel(valor>0?1:.18);
 $('explode').value=String(valor);$('explodeValue').textContent=valor+'%';
 $('leyendaSeparacion').hidden=valor===0;$('btnSeparar').classList.toggle('active',valor>0);$('btnSeparar').setAttribute('aria-pressed',String(valor>0));$('btnSeparar').textContent=valor>0?'Reunir capas':'Separar capas';
 enfoque?.olvidar();api.setBodyBounds(atlas.visibleBounds());api.camView('frente');updateMath();
}
function elegidoSinBusqueda(){
 $('partSearch').value='';buscador?.cerrar();
}
function focusSelected(){if(atlas?.selectionMesh)enfoque?.enfocar(atlas);}
function choosePart(index,{zoom=false,fuenteLocal=false}={}){
 if(!atlas?.parts[index])return;
 solicitudModelo++; $('modeloIntegrado').disabled=false;document.body.classList.remove('cambiando-modelo');
 if(!atlas.pickMeshes[index]&&!profesional?.activo){toast('La estructura no está disponible en la geometría cargada.');return;}
 if(profesional?.activo){
  const r=fuenteLocal?null:profesional.buscar(atlas.parts[index].name).find(e=>normalizarBusqueda(e.nombre)===normalizarBusqueda(atlas.parts[index].name));
  if(r){profesional.seleccionar(r.id);return;}
  restaurarAtlasLocal(fuenteLocal?'Resultado del modelo local seleccionado.':'La pieza no existe con ese nombre exacto en los GLB cargados; se muestra el modelo local.');
 }
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 if(!atlas.visible.has(atlas.parts[index].system)&&!atlas.isolated){atlas.toggleSystem(atlas.parts[index].system,true);syncLayers();}
 if(!atlas.select(index))return;
 if(rayVisible)rays.update(atlas.selectionMesh);
 // La selección siempre enfoca la pieza en la misma escena.
 // La cámara se acerca en seleccionCambiada, tanto al hacer clic como al buscar.
 openInspector('anatomia');syncTransforms();updateDetails();fijarPaneles(false,true);toast('Seleccionado: '+nombreAnatomico(atlas.parts[index]).espanol);
}
function chooseGroup(id,{fuenteLocal=false}={}){
 if(id==='ojos'&&ojoDetallado){if(chosenSystem!=='sensory')chooseSystem('sensory');ojoDetallado.abrir();openInspector('anatomia');fijarPaneles(false,true);return true;}
 if(!atlas)return false;
 ++solicitudModelo;$('modeloIntegrado').disabled=false;document.body.classList.remove('cambiando-modelo');
 if(profesional?.activo){if(!fuenteLocal&&profesional.seleccionarConjunto(id))return true;restaurarAtlasLocal(fuenteLocal?'Conjunto del modelo local seleccionado.':'Esta estructura no está en los GLB instalados; buscando en el modelo local.');}
 const def=GRUPOS_3D.find(g=>g.id===id);if(!def)return false;
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 const indices=indicesDeGrupo(atlas.parts,id);
 if(!indices.length){toast('Este conjunto no dispone de geometría 3D en el atlas actual');return false;}
 if(indices.some(i=>!atlas.pickMeshes[i])){toast('El conjunto no está completamente cargado.');return false;}
 if(!atlas.selectGroup(id,def.nombre,indices,def.nota)){toast('Las mallas todavía no han terminado de cargar');return false;}
 openInspector('anatomia');fijarPaneles(false,true);
 vista2d?.setSelected(atlas.selectionPart||atlas.selectedPart?.()||null);tutor?.explicarSeleccion?.(atlas.selectionPart||atlas.selectedPart?.()||null);
 $('btnIsolate').classList.add('active');$('viewName').textContent=def.nombre.toUpperCase();
 toast(def.nombre+' · '+indices.length+' mallas 3D mostradas');
 // Una búsqueda local no debe cambiar de modelo de manera asíncrona.
 $('modeloIntegradoEstado').textContent='Modelo local · '+def.nombre+' · modelos ampliados disponibles desde el selector si se instalan';
 return true;
}
function setWire(value){wire=Boolean(value);atlas?.showHelpers('wire',wire);$('btnWire').classList.toggle('active',wire);}
function setNormals(value){normals=Boolean(value);atlas?.showHelpers('normals',normals);$('btnNormals').classList.toggle('active',normals);}
function errorFemenino(mensaje){$('femaleHelpText').textContent=mensaje+' Puedes obtener el archivo GLB desde la fuente oficial y abrirlo aquí.';$('femaleHelp').hidden=false;}
async function cambiarModelo(sexo,archivo=null){
 if(cargandoGenero||!atlas)return;
 if(especies?.activo())especies.cambiarHumano();
 if(vista2d?.mode==='2d')vista2d.setMode('3d');
 if((sexo==='male'&&atlas===atlasMasculino)||(sexo==='female'&&atlas===atlasFemenino))return;
 cargandoGenero=true;$('genderSelect').disabled=true;$('loading').hidden=false;$('sceneStatus').textContent='CAMBIANDO REFERENCIA';
 let blobUrl=null,nuevo=null;
 try{
  nuevo=sexo==='male'?atlasMasculino:atlasFemenino;
  if(sexo==='female'&&!nuevo){
   nuevo=new AtlasFemenino(api);if(archivo)blobUrl=URL.createObjectURL(archivo);
   await nuevo.load((progreso,count)=>{$('progress').style.width=progreso+'%';$('progressText').textContent=progreso+'% · '+number(count)+' mallas';},blobUrl||(await fetch('./modelos/profesionales/femenino.glb',{method:'HEAD'}).then(r=>r.ok&&!r.headers.get('content-type')?.includes('text/html')?'./modelos/profesionales/femenino.glb':URL_HRA).catch(()=>URL_HRA)));
   atlasFemenino=nuevo;
  }
  atlas.clearSelection();atlas.setActive(false);atlas=nuevo;atlas.setActive(true);
  atlas.onSelect=seleccionCambiada;atlas.onChange=()=>updateStatus();
  // La referencia femenina puede no incluir piel: evitar dejar el visor vacío.
  const tienePiel=atlas.parts.some(p=>p.system==='integumentary');
  atlas.clearSelection();atlas.setVisible(tienePiel?new Set(['integumentary']):capasDisponibles(atlas.parts));actualizarOpacidadPiel(1);
  resetearCorte();atlas.setExplode(0);$('explode').value='0';$('explodeValue').textContent='0%';
  atlas.setLift($('btnFloat').classList.contains('active'));atlas.setLiftAmount(Number($('floatStrength').value)/100);
  atlas.showHelpers('wire',wire);atlas.showHelpers('normals',normals);
  chosenSystem=tienePiel?'integumentary':'whole';vista2d?.setSystem(chosenSystem);subgrupoActivo='todos';scopeAll=false;activeQuery='';listLimit=70;$('partSearch').value='';buscador?.actualizar();
  $('genderSelect').value=sexo;
  $('modelNotice').innerHTML=sexo==='male'?'<strong>Referencia masculina · BodyParts3D 4.0</strong><p>2.234 mallas anatómicas · Fuente DBCLS · CC BY 4.0.</p>':`<strong>Referencia femenina · Human Reference Atlas v1.5</strong><p>${number(atlas.parts.length)} mallas de referencia. Su cobertura ósea y muscular es parcial y diferente de la masculina. Fuente HuBMAP · CC BY 4.0.</p>`;
  $('btnWhole').classList.add('active');$('btnIsolate').classList.remove('active');actualizarOpacidadPiel(1);aplicarMovimientoReducido(preferencias?.valores.movimiento===true);
  refreshSystems();enfoque?.olvidar();api.setBodyBounds(atlas.boxes);api.camView('frente');$('viewName').textContent='FRENTE';$('femaleHelp').hidden=true;
  $('sceneStatus').textContent='MODELO OPERATIVO';toast('Modelo '+(sexo==='male'?'masculino':'femenino')+' cargado');
 }catch(e){console.warn('No se pudo cargar el modelo:',e);if(sexo==='female'){if(nuevo&&nuevo!==atlasFemenino)nuevo.disposeAtlas();errorFemenino('No se pudo descargar el modelo femenino desde el servidor científico.');} $('genderSelect').value=atlas.sex==='female'?'female':'male';toast('Se mantiene el modelo anterior');}
 finally{if(blobUrl)URL.revokeObjectURL(blobUrl);$('genderSelect').disabled=false;$('loading').hidden=true;cargandoGenero=false;}
}
// Los paneles son cajones superpuestos: nunca vuelven a encoger el visor.
function fijarPaneles(izquierda,derecha){
 const app=$('app'),l=Boolean(izquierda)||Boolean(derecha&&window.innerWidth>=1150&&app.classList.contains('show-left')),r=Boolean(derecha);
 app.classList.toggle('show-left',l);app.classList.toggle('show-right',r);if($('abrirMatematicas'))$('abrirMatematicas').setAttribute('aria-pressed',String(l));
 app.classList.remove('open-modules','open-inspector','hide-panel');
 $('panelScrim').hidden=!(l||r);
 for(const [id,open,side] of [['toggleLeftPanel',l,'Matemáticas'],['toggleRightPanel',r,'Anatomía']]){
  const b=$(id);b.setAttribute('aria-expanded',String(open));
  b.title=(open?'Cerrar ':'Abrir ')+side.toLowerCase();
  b.classList.toggle('is-open',open);
 }
 $('toggleLeftPanel').querySelector('.edge-arrow').textContent=l?'‹':'›';
 $('toggleRightPanel').querySelector('.edge-arrow').textContent=r?'›':'‹';
 $('panelTopLabel').textContent=l||r?'Ocultar paneles':'Mostrar paneles';
}
function setupButtons(){
 // El acceso al tutor abre sus herramientas; la narración solo comienza al pulsar Explicar.
 $('explicarSeleccionDirecto')?.addEventListener('click',()=>{tutor?.explicarActualEnVoz?.();});
 $('systemGuide')?.addEventListener('click',e=>{if(e.target.closest('[data-abrir-ojo]'))ojoDetallado?.abrir();});
 $('historialAnterior').onclick=()=>{const item=historial29.pop();if(!item)return;restaurando29=true;try{if(item.tipo==='pieza')choosePart(item.id);else if(item.tipo==='grupo')chooseGroup(item.id);else if(item.tipo==='sistema')chooseSystem(item.id);else regresarAlCuerpo(item.modo);actual29=item;}finally{restaurando29=false;$('historialAnterior').disabled=!historial29.length;}};
 $('restablecerVista29').onclick=()=>{if(profesional?.activo||especies?.activo()){api.camView('frente');return;}if(atlas?.selectionMesh){atlas.resetTransform();syncTransforms();focusSelected();updateDetails();}else api.camView('frente');};
 $('pantallaCompleta29').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){toast('Pantalla completa no disponible: '+e.message);}};
 $('partesSeleccion29').onclick=e=>{const b=e.target.closest('[data-subparte29]');if(b)choosePart(Number(b.dataset.subparte29));const pro=e.target.closest('[data-subparte-pro]');if(pro)profesional?.seleccionar(Number(pro.dataset.subpartePro));};
 $('abrirMatematicas')?.addEventListener('click',()=>{
  const abrir=!$('app').classList.contains('show-left');
  fijarPaneles(abrir,window.innerWidth>=1150&&$('app').classList.contains('show-right'));
  $('abrirMatematicas').setAttribute('aria-pressed',String(abrir));
 });
 $('togglePanels')?.addEventListener('click',()=>fijarPaneles(window.innerWidth>=1150&&$('app').classList.contains('show-left'),!$('app').classList.contains('show-right')));

 ['btnNormals','btnSpin','mobileModules','mobileInspector'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});
 // El panel de resumen puede plegarse para dejar más espacio a las fichas.
 const btnResumen=$('toggleInspectorOverview');
 btnResumen.addEventListener('click',()=>{
  const plegado=$('rightPanel').classList.toggle('inspector-overview-collapsed');
  btnResumen.setAttribute('aria-expanded',String(!plegado));
  btnResumen.innerHTML=plegado?'Mostrar resumen <span aria-hidden="true">▾</span>':'Reducir resumen <span aria-hidden="true">▴</span>';
 });
 // Se mide la altura real de la barra superior cuando sus controles cambian de fila.
 const barra=document.querySelector('.top');
 const actualizarAltoBarra=()=>document.documentElement.style.setProperty('--topbar-height',Math.ceil(barra.getBoundingClientRect().height)+'px');
 actualizarAltoBarra();
 if('ResizeObserver' in window)new ResizeObserver(actualizarAltoBarra).observe(barra);
 window.addEventListener('resize',actualizarAltoBarra);
 $('genderSelect').addEventListener('change',e=>cambiarModelo(e.target.value));
 $('swapGender').addEventListener('click',()=>cambiarModelo(atlas?.sex==='male'?'female':'male'));
 $('femaleFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)cambiarModelo('female',f);e.target.value='';});
 $('loadFemaleFile').addEventListener('click',()=>{$('femaleHelp').hidden=true;$('femaleFile').click();});
 $('closeFemaleHelp').addEventListener('click',()=>$('femaleHelp').hidden=true);
 $('enfocarSistema').addEventListener('click',()=>{enfoque?.enfocarSistema(atlas,grupo(chosenSystem));toast('Cámara enfocada en el sistema');});
 $('qualitySelect').addEventListener('change',e=>{api.setQuality(e.target.value==='alta');toast('Calidad '+(e.target.value==='alta'?'nítida':'fluida'));});
 $('presetIluminacion').addEventListener('change',e=>{api.setLightingPreset(e.target.value);toast('Iluminación: '+e.target.selectedOptions[0].textContent);});
 $('skinOpacity').addEventListener('input',e=>actualizarOpacidadPiel(1-Number(e.target.value)/100));
 $('mobileModules').addEventListener('click',()=>fijarPaneles(!$('app').classList.contains('show-left'),false));
 $('mobileInspector').addEventListener('click',()=>fijarPaneles(false,!$('app').classList.contains('show-right')));
 $('toggleLeftPanel').addEventListener('click',()=>fijarPaneles(!$('app').classList.contains('show-left'),false));
 $('toggleRightPanel').addEventListener('click',()=>fijarPaneles(false,!$('app').classList.contains('show-right')));
 $('panelScrim').addEventListener('click',()=>fijarPaneles(false,false));
 $('toggleStageTools').addEventListener('click',()=>{
  const v=$('app').classList.toggle('show-advanced');
  $('toggleStageTools').classList.toggle('active',v);
  $('toggleStageTools').setAttribute('aria-expanded',String(v));
 });
 $('toggleCameraViews').addEventListener('click',()=>{const v=$('app').classList.toggle('show-camera-views');$('toggleCameraViews').classList.toggle('active',v);$('toggleCameraViews').setAttribute('aria-expanded',String(v));});
 $('zoomIn').addEventListener('click',()=>api.zoom(.78));
 $('zoomOut').addEventListener('click',()=>api.zoom(1.28));
 $('capture').addEventListener('click',()=>{api.screenshot();toast('Captura guardada');});
 for(const [id,view] of [['cameraFront','frente'],['cameraSide','perfil'],['cameraBack','espalda'],['resetCamera','perspectiva']]){
  $(id).addEventListener('click',()=>{api.camView(view);$('viewName').textContent=view.toUpperCase();});
 }
 $('focusPart').addEventListener('click',()=>{focusSelected();toast('Cámara enfocada en la pieza');});
 $('centerBody').addEventListener('click',regresarAlCuerpo);
 $('volverCuerpo').addEventListener('click',regresarAlCuerpo);
 $('btnWhole').addEventListener('click',()=>regresarAlCuerpo('todos'));
 $('btnSkin').addEventListener('click',()=>regresarAlCuerpo('piel'));
 $('btnSeparar').addEventListener('click',()=>separarCuerpo((profesional?.activo?profesional.separacion:atlas.explode)>0?0:100));
 $('btnSpin').addEventListener('click',()=>{if(preferencias?.valores.movimiento){toast('Desactiva Reducir animaciones para usar el giro');return;}spinning=!spinning;api.controls.autoRotate=spinning;api.controls.autoRotateSpeed=.6;$('btnSpin').classList.toggle('active',spinning);});
 const cambiarLevitacion=()=>{
   if(!atlas)return;
   // Permite preparar el modo incluso antes de seleccionar una estructura.
   atlas.setLift(!atlas.liftEnabled);
   $('btnFloat').classList.toggle('active',atlas.liftEnabled);
   $('btnFloat').setAttribute('aria-pressed',String(atlas.liftEnabled));
   $('alternarLevitacion').textContent=atlas.liftEnabled?'Detener levitación':'Activar levitación';
   $('alternarLevitacion').setAttribute('aria-pressed',String(atlas.liftEnabled));
   if(preferencias?.valores?.movimiento&&atlas.liftEnabled){
    toast('Desactiva «Reducir animaciones» para ver la levitación.');
   }else if(!atlas.selectionMesh&&!profesional?.seleccion&&!desarrollador?.seleccion){
    toast(atlas.liftEnabled?'Levitación preparada: selecciona una estructura':'Levitación desactivada');
   }else{
    toast(atlas.liftEnabled?'La estructura levita suavemente':'Movimiento detenido; la estructura permanece centrada');
   }
 };
 $('btnFloat').addEventListener('click',cambiarLevitacion);
 $('alternarLevitacion').addEventListener('click',cambiarLevitacion);
 $('floatStrength').addEventListener('input',e=>{atlas.setLiftAmount(Number(e.target.value)/100);$('floatValue').textContent=e.target.value+'%';});
 const aplicarCorte=()=>{if(!atlas)return;const args=[cutting,Number($('cutOffset').value)/100,$('cutAxis').value,$('cutInvert').checked];const b=desarrollador?.activo?desarrollador.bounds():profesional?.activo?profesional.boundsVisibles():especies?.activo()?especies.getBounds():null;if(b&&!b.isEmpty())api.setCut(...args,b.getCenter(new THREE.Vector3()));else atlas.setCut(...args);};
 $('btnCut').addEventListener('click',()=>{cutting=!cutting;aplicarCorte();$('btnCut').classList.toggle('active',cutting);toast(cutting?'Plano de corte activo; el corte no rellena las superficies interiores':'Plano de corte desactivado');});
 $('cutOffset').addEventListener('input',e=>{$('cutValue').textContent=e.target.value+' cm';if(cutting)aplicarCorte();});
 $('cutAxis').addEventListener('change',()=>{if(cutting)aplicarCorte();});
 $('cutInvert').addEventListener('change',()=>{if(cutting)aplicarCorte();});
 $('btnWire').addEventListener('click',()=>{
  mallaActivadaPorModulo=false;setWire(!wire);
  if(wire){
   if(currentModule==='rayos'&&rayVisible){rayVisible=false;rays?.setVisible(false);}
   currentModule='mallas';
  }else if(currentModule==='mallas')currentModule=null;
  reflejarBotonesModulos();updateMath();updateAlgorithm();
 });
 $('btnNormals').addEventListener('click',()=>{
  setNormals(!normals);
  if(normals){
   if(currentModule==='rayos'&&rayVisible){rayVisible=false;rays?.setVisible(false);}
   currentModule='mallas';
  }else if(currentModule==='mallas'&&!wire)currentModule=null;
  reflejarBotonesModulos();updateMath();updateAlgorithm();
 });
 $('btnIsolate').addEventListener('click',()=>{if(atlas.selected<0){toast('Selecciona una pieza');return;}atlas.setIsolate(!atlas.isolated);$('btnIsolate').classList.toggle('active',atlas.isolated);$('btnIsolate').textContent=atlas.isolated?'◎ Solo pieza':'◎ Mostrar solo pieza';toast(atlas.isolated?'Vista individual':'Contexto anatómico visible');});
 $('btnLight').addEventListener('click',()=>{lightsOn=!lightsOn;for(const l of [api.key,api.fill,api.point,api.rim,api.hemisphere])l.visible=lightsOn;$('btnLight').classList.toggle('active',lightsOn);});
 $('explode').addEventListener('input',e=>separarCuerpo(Number(e.target.value)));
 $$('[data-itab]').forEach(b=>b.addEventListener('click',()=>openInspector(b.dataset.itab)));
 $$('[data-mtab]').forEach(b=>b.addEventListener('click',()=>mathTab(b.dataset.mtab)));
 $('matColor').addEventListener('input',e=>{if(!atlas.selectionMesh)return;atlas.selectionMesh.material.color.set(e.target.value);updateDetails({renderBrowser:false});});
 $('matRoughness').addEventListener('input',e=>{if(!atlas.selectionMesh)return;atlas.selectionMesh.material.roughness=Number(e.target.value)/100;updateDetails({renderBrowser:false});});
 $('matMetal').addEventListener('input',e=>{if(!atlas.selectionMesh)return;atlas.selectionMesh.material.metalness=Number(e.target.value)/100;updateDetails({renderBrowser:false});});
 $('lightPower').addEventListener('input',e=>{api.key.intensity=Number(e.target.value)/100;$('lightValue').textContent=api.key.intensity.toFixed(2);updateMath();});
 $('lightX').addEventListener('input',e=>{api.key.position.x=Number(e.target.value)/100;$('lightXValue').textContent=api.key.position.x.toFixed(2);updateMath();});
 $('lightY').addEventListener('input',e=>{api.key.position.y=Number(e.target.value)/100;$('lightYValue').textContent=api.key.position.y.toFixed(2);updateMath();});
 document.addEventListener('keydown',e=>{if(e.defaultPrevented||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||preferencias?.abierto())return;if(e.key.toLowerCase()==='f')focusSelected();if(e.key==='Escape'){regresarAlCuerpo();fijarPaneles(false,false);if(atlas.isolated){atlas.setIsolate(false);$('btnIsolate').classList.remove('active');}}});
}
// V12: la etiqueta queda fuera de la silueta 3D y una línea fina apunta
// al borde REAL de la pieza proyectada. No se agrega geometría decorativa.
const _calloutBox=new THREE.Box3(); // initialized lazily below (THREE ya está importado)
function updateCallout(){
 const e=$('partCallout'),svg=$('calloutConnector');
 const externa=especies?.activo()===true;
 const mesh=externa?especies.seleccionMesh():atlas?.selectionMesh;
 if(!mesh||(!externa&&(!atlas.selectedPart()||!atlas.active))){e.hidden=true;svg.hidden=true;return;}
 const shell=$('viewShell'),viewer=$('viewer');
 const shellRect=shell.getBoundingClientRect(),viewRect=viewer.getBoundingClientRect();
 const dx=viewRect.left-shellRect.left,dy=viewRect.top-shellRect.top;
 const w=shell.clientWidth,h=shell.clientHeight;
 const b=externa?_calloutBox.setFromObject(mesh):_calloutBox.copy(atlas.selectionBounds||atlas.boxes[atlas.selected]).applyMatrix4(mesh.matrixWorld);
 const min=b.min,max=b.max;
 const vertices=[
  [min.x,min.y,min.z],[max.x,min.y,min.z],[min.x,max.y,min.z],[max.x,max.y,min.z],
  [min.x,min.y,max.z],[max.x,min.y,max.z],[min.x,max.y,max.z],[max.x,max.y,max.z]
 ];
 let l=Infinity,r=-Infinity,t=Infinity,bt=-Infinity,validos=0;
 for(const [x,y,z] of vertices){
  const v=new THREE.Vector3(x,y,z).project(api.camera);
  if(!Number.isFinite(v.x)||v.z< -1||v.z>1)continue;
  const sx=dx+(v.x*.5+.5)*viewRect.width,sy=dy+(-v.y*.5+.5)*viewRect.height;
  l=Math.min(l,sx);r=Math.max(r,sx);t=Math.min(t,sy);bt=Math.max(bt,sy);validos++;
 }
 if(!validos||r<0||l>w||bt<0||t>h){e.hidden=true;svg.hidden=true;return;}
 e.hidden=false;svg.hidden=false;
 const cardW=e.offsetWidth||192,cardH=e.offsetHeight||76;
 const rightSpace=w-r,leftSpace=l,margin=38;
 let side='right',cx,cy;
 if(rightSpace>=cardW+margin){cx=Math.max(r+margin,w*.64);}
 else if(leftSpace>=cardW+margin){side='left';cx=Math.min(l-cardW-margin,w*.35-cardW);}
 else if(rightSpace>=leftSpace){cx=w-cardW-15;}
 else {side='left';cx=15;}
 cx=THREE.MathUtils.clamp(cx,10,Math.max(10,w-cardW-10));
 const centroY=THREE.MathUtils.clamp((t+bt)/2,70,h-70);
 cy=THREE.MathUtils.clamp(centroY-cardH/2,130,Math.max(130,h-cardH-96));
 e.style.left=cx+'px';e.style.top=cy+'px';
 const anchorX=side==='right'?Math.min(w-8,r):Math.max(8,l);
 const anchorY=THREE.MathUtils.clamp(centroY,8,h-8);
 const cardEdgeX=side==='right'?cx:cx+cardW;
 const cardEdgeY=cy+cardH/2;
 const stroke=$('calloutStroke'),dot=$('calloutDot');
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
 stroke.setAttribute('x1',anchorX);stroke.setAttribute('y1',anchorY);
 stroke.setAttribute('x2',cardEdgeX);stroke.setAttribute('y2',cardEdgeY);
 dot.setAttribute('cx',anchorX);dot.setAttribute('cy',anchorY);
}
async function start(){
 window.__LAB_INICIADO=true;
 $('app').inert=true;$('app').setAttribute('aria-busy','true');
 try{
  buildModules();buildTransforms();updateAlgorithm();
  inspectorEstudio=crearInspectorEstudio({irAPieza:guardado=>{const i=atlas?.parts.findIndex(p=>p.id===guardado.id);if(i<0||atlas.sex!==guardado.sex){toast('Esa pieza no está en el modelo actual. Cambia a la referencia correspondiente.');return;}choosePart(i,{fuenteLocal:true});},avisar:toast});
  api=iniciarEscena($('viewer'));api.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.__LAB_CONTEXT_LOST=true;toast('Contexto WebGL perdido. Recarga la página si no se recupera.');});api.renderer.domElement.addEventListener('webglcontextrestored',()=>{window.__LAB_CONTEXT_LOST=false;toast('Contexto WebGL recuperado');});rays=crearRayos(api.scene);desarrollador=instalarModoDesarrollador(api,{alSeleccionar:mostrarImportado,alImportar:()=>{if(profesional?.activo)restaurarAtlasLocal();if(especies?.activo())especies.cambiarHumano();atlas?.clearSelection();atlas?.setActive(false);},alRetirar:()=>{atlas?.setActive(true);vista2d?.setExternalSelection(null);if(atlas)updateDetails();}});document.addEventListener('pointerdown',e=>{if(e.target.closest('#centerBody,#volverCuerpo,#btnWhole,#btnSkin,#modeloIntegrado'))desarrollador.retirar();},true);
  vista2d=crearVista2D(api,toast,()=>atlas,()=>desarrollador?.activo?desarrollador.bounds(true):profesional?.activo?profesional.boundsVisibles():especies?.getBounds());
  enfoque=crearEnfoqueCamara(api);
  herramientasMouse=crearHerramientasMouse(api,()=>atlas,()=>{syncTransforms();updateDetails({renderBrowser:false});updateMath();},toast,()=>enfoque?.cancelar());
  preferencias=crearPreferencias(({paleta,modo,movimiento})=>{api.setTheme(paleta,modo);aplicarMovimientoReducido(movimiento);});
  const stats=crearEstadisticas(api.renderer,({fps,triangles,draws,geometries,textures})=>{$('topFps').textContent=fps.toFixed(0)+' FPS';$('topTriangles').textContent=number(triangles)+' TRIÁNGULOS';$('footerDraw').textContent='Dibujos: '+draws+' · Geometrías: '+geometries+' · Texturas: '+textures;});
  function frame(now=0){requestAnimationFrame(frame);if(document.hidden||window.__LAB_CONTEXT_LOST){lastFrame=0;return;}const delta=lastFrame?Math.min(.08,(now-lastFrame)/1000):.016;lastFrame=now;
   api.controls.update();api.animateStage(now);especies?.actualizar?.(delta);if(!profesional?.activo&&!desarrollador?.activo)atlas?.animate(now,delta);
   if(profesional?.activo)profesional.actualizarLevitacion(now,delta,atlas?.liftEnabled,atlas?.liftAmount,preferencias?.valores.movimiento);
   if(desarrollador?.activo)desarrollador.actualizarLevitacion(now,delta,atlas?.liftEnabled,atlas?.liftAmount,preferencias?.valores.movimiento);
   enfoque?.actualizar(now);api.renderer.render(api.scene,api.camera);stats.frame();
   if(!profesional?.activo&&!desarrollador?.activo&&(atlas?.selected>=0||especies?.seleccionMesh()) && vista2d?.mode!=='2d'){updateCallout();if(now-lastMathUpdate>360){lastMathUpdate=now;updateMath();if(rayVisible)rays.update(atlas.selectionMesh);}}
  }requestAnimationFrame(frame);
  const response=await fetch('./modelos/atlas.json');if(!response.ok)throw Error('No se encuentra modelos/atlas.json: HTTP '+response.status);
  const manifest=await response.json();for(const p of manifest.parts)normalizarClasificacion(p);atlas=new Atlas3D(api,manifest);atlas.sex='male';atlasMasculino=atlas;window.laboratorioAtlas=atlas;aplicarMovimientoReducido(preferencias?.valores.movimiento===true);actualizarOpacidadPiel(1);
  atlas.onSelect=seleccionCambiada;
  atlas.onChange=()=>{updateStatus();};
  ojoDetallado=crearOjoDetallado({host:$('viewShell'),obtenerAtlas:()=>atlas,avisar:toast,onSeleccionar:i=>{if(atlas?.parts[i])choosePart(i,{zoom:false,fuenteLocal:true});}});
  buildSystems();buscador=crearBuscadorAnatomico({activarDesarrollador:desarrollador.activar,obtenerAtlas:()=>atlas,seleccionar:i=>choosePart(i,{zoom:true,fuenteLocal:true}),verSistema:id=>solicitarSistemaIntegrado(id),verCuerpo:()=>regresarAlCuerpo('todos'),verPiel:()=>regresarAlCuerpo('piel'),verConjunto:id=>chooseGroup(id,{fuenteLocal:true}),contextoExterno:()=>desarrollador?.activo?'importado':profesional?.activo?'profesional':especies?.activo()?'especie':null,buscarExterno:q=>desarrollador?.activo?desarrollador.buscar(q):profesional?.activo?profesional.resultadosBusqueda(q):especies?.activo()?especies.resultadosBusqueda(q):null,seleccionarExterno:i=>{solicitudModelo++;$('modeloIntegrado').disabled=false;document.body.classList.remove('cambiando-modelo');if(desarrollador?.activo)desarrollador.elegir(i);else if(profesional?.activo)profesional.elegir(i);else if(especies?.activo())especies.elegir(i);}});buscador.actualizar();setupButtons();renderGuide();renderSubgroups();renderPartBrowser();
  await atlas.load((pct,count)=>{
   $('progress').style.width=pct+'%';$('progressText').textContent=pct+'% · '+number(count)+' piezas';
   $('sceneStatus').textContent='CARGANDO MODELO '+pct+'%';
  });
  // No habilitar búsquedas ni navegación hasta que todas las mallas locales
  // estén disponibles y los controladores de interfaz hayan sido instalados.
  await atlas.cargaCompleta;
  if(atlas.partCountLoaded!==atlas.parts.length)throw Error('La carga del atlas quedó incompleta.');
  $('sceneStatus').textContent='SISTEMAS LOCALES LISTOS';updateStatus();
  api.setBodyBounds(atlas.boxes);api.camView('frente');
  especies=crearBibliotecaEspecies({api,obtenerAtlas:()=>atlas,avisar:toast,alCambiar:estado=>{
   buscador?.cerrar();
   if(estado.activa){
    if(vista2d?.mode==='2d')vista2d.setMode('3d');
    enfoque?.olvidar();
    $('modelNotice').querySelector('strong').textContent=`Biblioteca externa: ${estado.especie}`;
    $('modelNotice').querySelector('p').textContent=`${estado.modelo||'Modelo 3D'} · ${estado.mallas} mallas. ${estado.seleccion?'Pieza aislada: '+estado.seleccion:'Selecciona una pieza en la lista o en el visor'}.`;
    $('visibleParts').textContent=(estado.seleccion?'1':estado.mallas)+' / '+estado.mallas+' (modelo 3D)';
    $('partName').textContent=traducirNombreAnatomico(estado.seleccion||estado.modelo||'Modelo externo');
    $('detalleSistemaActual').textContent=estado.especie||'Criatura 3D';
    $('partDescription').textContent=estado.seleccion?`Pieza real del modelo 3D: ${traducirNombreAnatomico(estado.seleccion)}. Los nombres pertenecen al autor del archivo; no se asignan sistemas anatómicos.`:'Modelo externo de GitHub, independiente del cuerpo humano. Gíralo, amplíalo y selecciona sus piezas en el visor.';
    vista2d?.setExternalSelection(estado.seleccion?{name:estado.seleccion,system:chosenSystem}:null,estado.especie);
    if(estado.seleccion)tutor?.explicarExterno(estado);
    const glbMesh=especies.seleccionMesh(),g=glbMesh?.geometry;
    const vertices=g?.getAttribute('position')?.count||0;
    const triangulos=Math.floor((g?.getIndex()?.count||vertices)/3);
    $('mathSelectedName').textContent=traducirNombreAnatomico(estado.seleccion||'Modelo 3D');
    $('mathPartId').textContent='Archivo 3D';
    $('mathVertexCount').textContent=g?number(vertices)+' vértices':'— vértices';
    $('mathFaceCount').textContent=g?number(triangulos)+' triángulos':'— triángulos';
    $('selectedId').textContent='Modelo 3D';
    $('partGuide').textContent=estado.seleccion?`Pieza del archivo: ${traducirNombreAnatomico(estado.seleccion)}. Se conserva su nombre original y no se le asigna un sistema anatómico.`:'Selecciona una pieza del archivo 3D para ver sus datos geométricos.';
    $('specGrid').textContent=g?`${number(vertices)} vértices · ${number(triangulos)} triángulos. Geometría real importada.`:'Selecciona una pieza del modelo 3D.';
    $('partTags').replaceChildren();$('materialInfo').textContent='Materiales del archivo original cuando el formato los incluye; STL/OBJ pueden aparecer sin texturas.';
    inspectorEstudio?.actualizarExterno({nombre:traducirNombreAnatomico(estado.seleccion||estado.modelo||'Modelo 3D'),grupo:estado.especie||'Modelo externo',descripcion:$('partDescription').textContent,tipo:'Submalla 3D',vertices,triangulos});
    updateMath();updateAlgorithm();
    if(estado.seleccion){openInspector('anatomia');fijarPaneles(false,true);}
    $('calloutName').textContent=estado.seleccion?traducirNombreAnatomico(estado.seleccion):'—';
    $('calloutSystem').textContent=estado.especie||'Modelo externo';
    $('rutaAnatomica').textContent=`Biblioteca 3D › ${estado.especie||'Especie'} › ${estado.seleccion?traducirNombreAnatomico(estado.seleccion):'Vista general'}`;
    $('partCallout').hidden=!estado.seleccion;$('calloutConnector').hidden=!estado.seleccion;
   }else if(atlas){
    vista2d?.setSelected(atlas.selectedPart());
    $('partCallout').hidden=true;$('calloutConnector').hidden=true;
    $('modelNotice').querySelector('strong').textContent='Referencia humana · BodyParts3D';
    $('modelNotice').querySelector('p').textContent=`${number(atlas.parts.length)} mallas en el modelo activo. Selecciona una pieza para inspeccionarla.`;
    api.setBodyBounds(atlas.boxes);updateDetails();updateStatus();
   }
  }});
  tutor=crearTutorVoz({obtenerContexto:()=>({pieza:profesional?.activo?null:especies?.activo()?null:atlas?.selectedPart(),sistema:chosenSystem,especie:desarrollador?.activo?{seleccion:desarrollador.seleccion?.nombre,especie:'GitHub'}:especies?.activo()?especies.resumen():null,profesional:profesional?.activo?profesional.seleccion:null}),
   acciones:{cuerpo:regresarAlCuerpo,sistema:id=>solicitarSistemaIntegrado(id),buscar:text=>{
    if(especies?.activo())especies.cambiarHumano();
    const input=$('partSearch');input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
   },proyeccion:dir=>{vista2d.setProjection(dir);vista2d.setMode('2d');},vista3d:()=>vista2d.setMode('3d')},avisar:toast});
  profesional=crearAtlasProfesional({api,atlasClasico:()=>atlas,
   alSistemaAusente:f=>{restaurarAtlasLocal('Modelo no instalado para '+f+'. Se usa el modelo disponible.');chooseSystem(GUIAS[f]?f:f==='joints'?'skeletal':f==='visceral'?'digestive':'skeletal');},
   alVolverCuerpo:regresarAlCuerpo,
   alSeleccionar:(e,grupoInfo)=>{
    if(!profesional?.activo)return;
    buscador?.cerrar();
    const sub=$('partesSeleccion29');const piezas=profesional.partesSeleccionadas();if(e){$('explode').value='0';$('explodeValue').textContent='0%';$('btnSeparar').classList.remove('active');$('btnSeparar').setAttribute('aria-pressed','false');$('btnSeparar').textContent='Separar capas';}sub.hidden=!piezas.length;sub.innerHTML=piezas.length?'<h4>Subestructuras disponibles</h4>'+piezas.map(p=>`<button type="button" data-subparte-pro="${p.id}">${escapar(p.nombreEs)}</button>`).join(''):'';
    if(!e){
     if(grupoInfo?.filtro){$('partName').textContent=GUIAS[grupoInfo.filtro]?.titulo||('Sistema '+grupoInfo.filtro);
      $('detalleSistemaActual').textContent='VISTA DEL SISTEMA';
      $('partDescription').textContent=`Se muestran ${grupoInfo.total} submallas de Z-Anatomy disponibles para este grupo. Las estructuras no incluidas no se simulan.`;
      vista2d?.setSystem(grupoInfo.filtro==='todos'?'skeletal':grupoInfo.filtro);}
     $('partCallout').hidden=true;$('calloutConnector').hidden=true;updateMath();updateStatus();return;
    }
    if(GUIAS[e.sistema]){chosenSystem=e.sistema;$('systemSelect').value=chosenSystem;renderGuide();renderSubgroups();renderPartBrowser();}
    const m=e.mallas[0],vertices=e.mallas.reduce((a,o)=>a+(o.geometry?.getAttribute('position')?.count||0),0);
    const tri=e.mallas.reduce((a,o)=>a+Math.floor((o.geometry?.index?.count||o.geometry?.getAttribute('position')?.count||0)/3),0);
    const tema=respuestaTutorTema(e.nombreEs)||respuestaTutorTema(e.nombre);
    $('partName').textContent=e.nombreEs;
    $('detalleSistemaActual').textContent=GUIAS[e.sistema]?.titulo||('Sistema '+e.sistema);
    const verificada=fichaAnatomicaIdentificada(e.nombre)||fichaAnatomicaIdentificada(e.nombreEs);
    const descripcion=verificada?.descripcion||tema?.texto||`Pieza tridimensional identificada como ${e.nombreEs}. Su modelo no incluye datos individuales de función.`;
    $('partDescription').textContent=descripcion;
    if(verificada){
     $('partGuide').innerHTML=`<div class="guide-kicker">INFORMACIÓN ANATÓMICA</div><h3>${escapar(e.nombreEs)}</h3><section class="ficha-seccion"><h4>Qué es</h4><p>${escapar(verificada.descripcion)}</p></section><section class="ficha-seccion"><h4>Ubicación</h4><p>${escapar(verificada.ubicacion)}</p></section><section class="ficha-seccion"><h4>Función</h4><p>${escapar(verificada.funcion)}</p></section><section class="ficha-seccion"><h4>Organización</h4><p>${escapar(verificada.estructura)}</p></section><section class="ficha-seccion"><h4>Relaciones anatómicas</h4><p>${escapar(verificada.relaciones)}</p></section><details class="ficha-metadata"><summary>Fuente y datos del modelo</summary><p>Z-Anatomy · GLB externo. Consulta educativa basada en OpenStax y NCBI Bookshelf.</p></details>`;
    }else $('partGuide').innerHTML=`<div class="guide-kicker">ESTRUCTURA DEL MODELO</div><h3>${escapar(e.nombreEs)}</h3><p>${escapar(descripcion)}</p><details class="ficha-metadata"><summary>Datos técnicos y limitaciones</summary><p>Sin ficha anatómica individual verificada para esta submalla. Fuente geométrica: Z-Anatomy.</p></details>`;
    inspectorEstudio?.actualizarExterno({nombre:e.nombreEs,grupo:GUIAS[e.sistema]?.titulo||e.sistema,tipo:'Estructura del modelo GLB',descripcion,ubicacion:verificada?.ubicacion,funcion:verificada?.funcion,estructura:verificada?.estructura,relaciones:verificada?.relaciones,vertices,triangulos:tri});
    $('partTags').replaceChildren();$('selectedId').textContent='Z-Anatomy';
    $('mathSelectedName').textContent=e.nombreEs;$('mathPartId').textContent='Modelo GLB profesional';
    $('mathVertexCount').textContent=number(vertices)+' vértices';$('mathFaceCount').textContent=number(tri)+' triángulos';
    $('calloutName').textContent=e.nombreEs;$('calloutSystem').textContent='Sistema '+e.sistema;
    $('partCallout').hidden=true;$('calloutConnector').hidden=true;
    $('viewName').textContent='MODELOS AVANZADOS · '+e.nombreEs.toUpperCase();
    vista2d?.setExternalSelection({name:e.nombre,system:e.sistema,titulo2d:e.nombreEs});
    tutor?.explicarProfesional?.(e);
    openInspector('anatomia');fijarPaneles(false,true);updateMath();updateStatus();
   },alEstado:mensaje=>{if(mensaje?.startsWith('Cargando'))$('sceneStatus').textContent='DESCARGANDO NUEVOS GLB';}});
  const botonProfesional=$('cambiarAtlasProfesional');
  botonProfesional?.addEventListener('click',async()=>{
   if(botonProfesional.disabled)return;
   botonProfesional.disabled=true;
   try{
    if(profesional.activo){profesional.desactivar();botonProfesional.textContent='◈ Abrir modelos nuevos';
     $('genderSelect').disabled=false;$('swapGender').disabled=false;
     vista2d?.setSelected(atlas.selectedPart());api.setBodyBounds(atlas.boxes);api.camView('frente');
     $('sceneStatus').textContent='MODELO LOCAL';$('modelNotice').querySelector('strong').textContent='Referencia humana · BodyParts3D';
     $('modelNotice').querySelector('p').textContent=number(atlas.parts.length)+' mallas del modelo original.';updateDetails();updateStatus();}
    else{
     if(especies?.activo())especies.cambiarHumano();
     if(vista2d?.mode==='2d')vista2d.setMode('3d');
     resetearCorte();
     const exito=await profesional.alternar();
     if(exito){botonProfesional.textContent='Volver al modelo local';$('viewName').textContent='CAPAS INTERNAS · Z-ANATOMY SIN PIEL';$('genderSelect').disabled=true;$('swapGender').disabled=true;$('sceneStatus').textContent='Z-ANATOMY GLB';
      $('modelNotice').querySelector('strong').textContent='Modelos nuevos · Z-Anatomy';
      $('modelNotice').querySelector('p').textContent=`${profesional.total} estructuras reales · ${profesional.capasCargadas.length}/7 archivos GLB · ${profesional.capasFaltantes.length} ausentes. Sin modelo de piel externo.`;
      updateStatus();}
     else {$('sceneStatus').textContent='MODELO LOCAL';toast('Modelos profesionales no disponibles; se conserva el cuerpo humano local.');}
    }
   }finally{botonProfesional.disabled=false;}
  });
  $('proSalir')?.addEventListener('click',()=>botonProfesional?.click());
  toast('Laboratorio anatómico: elige un sistema o criatura desde el selector principal');
  // La vista inicial respeta la piel humana. El usuario decide qué sistema observar desde el selector principal.
  configurarModelosIntegrados();
  regresarAlCuerpo('piel');$('loading').hidden=true;$('app').inert=false;$('app').setAttribute('aria-busy','false');
 }catch(e){$('app').inert=false;$('app').setAttribute('aria-busy','false');fail(e?.stack||e?.message||e);}
}
// Selector único: modelos anatómicos, fantasía y enlaces GitHub sin clasificación anatómica.
// Los sistemas humanos aprovechan el atlas Z-Anatomy con respaldo de BodyParts3D.
let solicitudModelo=0;
const modelosGithubImportados=[];
function configurarModelosIntegrados(){
 let ultimaSeleccion='humano';
 const selector=$('modeloIntegrado'),estado=$('modeloIntegradoEstado');
 if(!selector)return;
 selector.replaceChildren();
 const grupoHumano=document.createElement('optgroup');grupoHumano.label='Cuerpo humano';
 grupoHumano.append(new Option('Cuerpo completo · todos los sistemas','humano'));
 grupoHumano.append(new Option('Piel y cabello','piel'));
 for(const e of SISTEMAS_INTEGRADOS)grupoHumano.append(new Option(e.nombre,'sistema:'+e.id));
 selector.add(grupoHumano);
 const grupoCriaturas=document.createElement('optgroup');grupoCriaturas.label='Animales y fantasía · modelos artísticos';
 for(const e of CREATURAS_INTEGRADAS)grupoCriaturas.append(new Option(e.nombre,'criatura:'+e.id));
 selector.add(grupoCriaturas);
 const grupoGitHub=document.createElement('optgroup');grupoGitHub.label='Mis modelos 3D de GitHub';
 selector.add(grupoGitHub);
 selector.add(new Option('＋ Importar modelo desde GitHub…','importar-github'));
 selector.value='humano';
 const mensaje=t=>{if(estado)estado.textContent=t;};
 async function visualizarImportado(datos){
  const solicitud=++solicitudModelo;
  document.body.classList.add('cambiando-modelo');selector.disabled=true;
  try{
   if(profesional?.activo)restaurarAtlasLocal();
   if(desarrollador?.activo)desarrollador.retirar();
   if(vista2d?.mode==='2d')vista2d.setMode('3d');
   ojoDetallado?.cerrar();
   mensaje('Abriendo '+datos.nombre+' en el visor central…');
   const ok=await especies.cargar(datos.url,datos.nombre,'externo');
   if(solicitud!==solicitudModelo)return false;
   if(!ok){mensaje('No se pudo cargar el modelo. Comprueba el enlace y sus dependencias.');return false;}
   let guardado=modelosGithubImportados.find(m=>m.url===datos.url);
   if(!guardado){
    guardado={...datos,id:'github-'+(modelosGithubImportados.length+1)};
    modelosGithubImportados.push(guardado);
    const nombre=datos.nombre.length>35?datos.nombre.slice(0,32)+'…':datos.nombre;
    grupoGitHub.append(new Option(nombre,'externo:'+guardado.id));
   }
   selector.value='externo:'+guardado.id;ultimaSeleccion=selector.value;
   $('viewName').textContent=datos.nombre.toLocaleUpperCase('es');
   $('sceneStatus').textContent='MODELO IMPORTADO · GITHUB';
   mensaje('Modelo 3D listo · '+datos.nombre+' · sin asignar a sistemas anatómicos');
   return true;
  }catch(e){console.error('Modelo GitHub',e);mensaje('Error al mostrar modelo: '+e.message);return false;}
  finally{if(solicitud===solicitudModelo){selector.disabled=false;document.body.classList.remove('cambiando-modelo');}}
 }
 const importador=crearImportadorGitHub({alAbrir:visualizarImportado});
 selector.addEventListener('change',async()=>{
  const valor=selector.value,solicitud=++solicitudModelo;
  selector.disabled=valor.startsWith('criatura:');
  try{
   if(valor==='importar-github'){
    selector.value=ultimaSeleccion;
    importador.abrir();return;
   }
   if(valor.startsWith('externo:')){
    const datos=modelosGithubImportados.find(m=>'externo:'+m.id===valor);
    if(!datos)throw Error('Modelo importado no encontrado. Vuelve a pegar el enlace.');
    await visualizarImportado(datos);return;
   }
   if(valor==='humano'){
    regresarAlCuerpo('todos');ultimaSeleccion='humano';return;
   }
   if(valor==='piel'){regresarAlCuerpo('piel');ultimaSeleccion='piel';return;}
   if(valor.startsWith('criatura:')){
    document.body.classList.add('cambiando-modelo');
    const datos=CREATURAS_INTEGRADAS.find(x=>'criatura:'+x.id===valor);
    if(!datos)throw Error('No existe una criatura asociada a esta opción');
    if(profesional?.activo)restaurarAtlasLocal();
    if(vista2d?.mode==='2d')vista2d.setMode('3d');
    mensaje('Abriendo '+datos.nombre+' desde GitHub…');
    // El archivo local se obtiene automáticamente mediante el servidor del laboratorio.
    // Cuando se abre desde Live Server, se usa la fuente pública como respaldo.
    let ok=await especies.cargar(datos.urlLocal,datos.nombre,datos.tipo);
    if(!ok&&solicitud===solicitudModelo)ok=await especies.cargar(datos.url,datos.nombre,datos.tipo);
    if(solicitud!==solicitudModelo)return;
    if(!ok){regresarAlCuerpo();mensaje(datos.nombre+' no pudo cargarse. El cuerpo humano sigue disponible. Revisa la conexión.');return;}
    $('viewName').textContent=datos.nombre.toUpperCase();
    $('sceneStatus').textContent='MODELO 3D · '+datos.nombre.toUpperCase();
    mensaje(datos.nombre+' listo · '+datos.tipoDescripcion+' · fuente GitHub');ultimaSeleccion=valor;
    return;
   }
   if(valor.startsWith('sistema:')){
    document.body.classList.remove('cambiando-modelo');
    const id=valor.slice('sistema:'.length);
    if(!SISTEMAS_INTEGRADOS.some(x=>x.id===id))throw Error('Sistema no registrado');
    // Mostrar el modelo disponible inmediatamente, luego buscar la capa ampliada.
    if(!profesional?.activo&&GUIAS[id]&&atlas.parts.some(p=>pertenece(p,id)))chooseSystem(id);
    mensaje('Buscando modelo ampliado · '+(infoSistema(id).name)+'…');
    if(especies?.activo())especies.cambiarHumano();
    if(vista2d?.mode==='2d')vista2d.setMode('3d');
    mensaje('Preparando sistema '+id+'…');
    if(atlas.sex==='female'){mensaje('Referencia femenina: se conserva el modelo activo para no mezclar sexos.');return;}
    const listo=await profesional.iniciar(id);
    if(solicitud!==solicitudModelo)return;
    if(listo&&profesional.contarSistema(id)>0&&!profesional.activo){
     enfoque?.olvidar();profesional.activar(id);enfoque?.olvidar();
     $('cambiarAtlasProfesional').textContent='Volver al modelo local';
     $('sceneStatus').textContent='MODELO ANATÓMICO · Z-ANATOMY';
     $('modelNotice').querySelector('strong').textContent='Z-Anatomy · anatomía humana';
     $('modelNotice').querySelector('p').textContent=profesional.capasCargadas.length+' de 7 modelos adicionales cargados. Regresa a Cuerpo completo para ver la piel.';
    }
    const disponible=listo&&profesional.activo&&profesional.verSistema(id);
    if(!disponible){
     restaurarAtlasLocal();
     const local=GUIAS[id]?id:id==='joints'?'skeletal':id==='visceral'?'digestive':null;
     const cantidad=local?atlas.parts.filter(p=>grupo(local).includes(p.system)).length:0;
     if(!cantidad){regresarAlCuerpo();mensaje('No hay geometría disponible de este sistema; se mantiene el cuerpo completo.');return;}
     chooseSystem(local);mensaje('No se obtuvo '+(SISTEMAS_INTEGRADOS.find(x=>x.id===id)?.nombre||id)+' · respaldo: '+(GUIAS[local]?.titulo||local)+'; cobertura parcial');
     selector.value=valor;return;
    }
    chosenSystem=GUIAS[id]?id:(id==='joints'?'skeletal':id==='visceral'?'digestive':chosenSystem);
    $('systemSelect').value=chosenSystem;
    vista2d?.setSystem(id==='visceral'?'digestive':id==='joints'?'skeletal':id);
    renderGuide();renderSubgroups();renderPartBrowser();renderRutaAnatomica();
    openInspector('anatomia');fijarPaneles(false,true);
    mensaje('Sistema '+(SISTEMAS_INTEGRADOS.find(x=>x.id===id)?.nombre||id)+' · modelo Z-Anatomy cargado');
    selector.value=valor;ultimaSeleccion=valor;
    return;
   }
  }catch(e){if(solicitud===solicitudModelo){console.error('Selector modelos:',e);regresarAlCuerpo();mensaje('No se pudo abrir el modelo: '+e.message);}}
  finally{if(solicitud===solicitudModelo){selector.disabled=false;document.body.classList.remove('cambiando-modelo');}}
 });
}
start();
