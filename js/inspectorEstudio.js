/* V50: utilidades reales del inspector inferior derecho.
   No crea fichas anatómicas; reutiliza exclusivamente las existentes. */
const CLAVE='laboratorio3d:favoritos:v50';
const $=id=>document.getElementById(id);
function limpiar(valor){return String(valor??'').trim();}
function crearElemento(tag,clase,texto){const e=document.createElement(tag);if(clase)e.className=clase;if(texto!==undefined)e.textContent=limpiar(texto);return e;}
function guardarLocal(lista){try{localStorage.setItem(CLAVE,JSON.stringify(lista));}catch{/* El navegador puede bloquear almacenamiento */}}
function cargarLocal(){try{const raw=JSON.parse(localStorage.getItem(CLAVE)||'[]');return Array.isArray(raw)?raw.filter(e=>e&&typeof e.id==='string'&&typeof e.nombre==='string'&&typeof e.sex==='string').slice(0,60):[];}catch{return [];}}
function descripcion(e){return [e.nombre,e.grupo&&`Sistema: ${e.grupo}`,e.tipo&&`Tipo: ${e.tipo}`,e.ubicacion&&`Ubicación: ${e.ubicacion}`,e.lado&&`Lateralidad: ${e.lado}`,e.descripcion&&`Descripción: ${e.descripcion}`,e.estructura&&`Organización: ${e.estructura}`,e.relaciones&&`Relaciones anatómicas: ${e.relaciones}`,e.funcion&&`Función: ${e.funcion}`,e.vertices!=null&&`Vértices del modelo: ${e.vertices}`,e.triangulos!=null&&`Triángulos del modelo: ${e.triangulos}`,e.nota&&`Alcance: ${e.nota}`].filter(Boolean).join('\n');}
export function crearInspectorEstudio({irAPieza,avisar}){
 let actual=null,ancla=null,recientes=[],favoritos=cargarLocal();
 const botonGuardar=$('estudioGuardar'),botonComparar=$('estudioComparar'),botonCopiar=$('estudioCopiar');
 const panel=$('estudioResumen'),comparacion=$('estudioComparacion'),estado=$('estudioEstado');
 const total=$('estudioTotal');
 function esLocal(e){return Boolean(e?.id&&e?.sex&&Number.isInteger(e?.indice)&&e.indice>=0);}
 function identificado(e){return e?(String(e.id||e.nombre||'')+'|'+String(e.sex||e.grupo||'')):'';}
 function actualizar(){
  const valida=Boolean(actual?.nombre);
  estado.textContent=valida?'Información vinculada al modelo seleccionado':'Selecciona una estructura para estudiar sus datos';
  panel.replaceChildren();
  if(valida){
   const etiquetas=[['Sistema',actual.grupo||'Sin clasificación'],['Tipo',actual.tipo||'Sin especificar'],['Ubicación',actual.ubicacion||'No documentada'],['Función',actual.funcion||'Pendiente de documentar']];
   for(const [nombre,valor] of etiquetas){const caja=crearElemento('div','estudio-dato');caja.append(crearElemento('span','estudio-dato-titulo',nombre),crearElemento('span','estudio-dato-valor',valor));panel.append(caja);}
  }else panel.append(crearElemento('p','estudio-vacio','Al seleccionar una pieza verás su clasificación y función, si están documentadas.'));
  botonGuardar.disabled=!esLocal(actual);botonComparar.disabled=!valida;botonCopiar.disabled=!valida;
  const favorito=esLocal(actual)&&favoritos.some(v=>identificado(v)===identificado(actual));
  botonGuardar.textContent=favorito?'Guardado':'Guardar';botonGuardar.setAttribute('aria-pressed',String(Boolean(favorito)));
  botonGuardar.title=esLocal(actual)?'Añadir o quitar de favoritos':'Favoritos disponibles para piezas del modelo humano local';
  botonComparar.textContent=ancla?'Terminar comparación':'Comparar';botonComparar.setAttribute('aria-pressed',String(Boolean(ancla)));
  comparacion.hidden=!ancla;
  comparacion.replaceChildren();
  if(ancla){
   comparacion.append(crearElemento('h4','', 'Comparación anatómica'));
   if(!valida||identificado(ancla)===identificado(actual))comparacion.append(crearElemento('p','estudio-vacio','Selecciona otra estructura del visor para comparar sus características.'));
   else{
    const dos=crearElemento('div','estudio-comparador');
    for(const e of [ancla,actual]){const carta=crearElemento('div','estudio-comparador-ficha');carta.append(crearElemento('strong','',e.nombre));for(const [lab,val] of [['Grupo',e.grupo],['Ubicación',e.ubicacion],['Función',e.funcion]]){const fila=crearElemento('p');fila.append(crearElemento('b','',lab+': '),document.createTextNode(limpiar(val)||'No documentada'));carta.append(fila);}dos.append(carta);}
    comparacion.append(dos);
   }
  }
  pintarColeccion();
 }
 function pintarLista(target,elementos){
  target.replaceChildren();if(!elementos.length){target.append(crearElemento('p','estudio-vacio','Todavía no hay estructuras.'));return;}
  for(const e of elementos){const b=crearElemento('button','estudio-referencia',e.nombre);b.type='button';b.dataset.estudioId=e.id;b.dataset.estudioSex=e.sex;b.title='Mostrar esta pieza en el visor 3D';target.append(b);}
 }
 function pintarColeccion(){pintarLista($('estudioFavoritos'),favoritos);pintarLista($('estudioRecientes'),recientes);total.textContent=String(favoritos.length);}
 function poner(e){
  if(e?.nombre){const nuevo=identificado(e);if(nuevo!==identificado(actual)&&esLocal(e))recientes=[{id:e.id,sex:e.sex,nombre:e.nombre,indice:e.indice},...recientes.filter(x=>identificado(x)!==nuevo)].slice(0,7);}
  actual=e||null;actualizar();
 }
 botonGuardar.addEventListener('click',()=>{
  if(!esLocal(actual))return;
  const key=identificado(actual),i=favoritos.findIndex(v=>identificado(v)===key);
  if(i>=0){favoritos.splice(i,1);avisar('Eliminado de favoritos');}
  else{favoritos.unshift({id:actual.id,sex:actual.sex,nombre:actual.nombre,indice:actual.indice});favoritos=favoritos.slice(0,60);avisar('Estructura guardada en favoritos');}
  guardarLocal(favoritos);actualizar();
 });
 botonComparar.addEventListener('click',()=>{
  if(ancla){ancla=null;avisar('Comparación finalizada');}
  else if(actual){ancla={...actual};avisar('Selecciona otra estructura para comparar');}
  actualizar();
 });
 botonCopiar.addEventListener('click',async()=>{
  if(!actual)return;
  const contenido=descripcion(actual);try{
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(contenido);}
   else{const t=document.createElement('textarea');t.value=contenido;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();if(!document.execCommand('copy'))throw Error('No se pudo copiar');t.remove();}
   avisar('Ficha copiada al portapapeles');
  }catch{avisar('El navegador bloqueó la copia. Comprueba los permisos.');}
 });
 $('estudioColeccion').addEventListener('click',e=>{
  const b=e.target.closest('button[data-estudio-id]');if(!b)return;
  const id=b.dataset.estudioId,sex=b.dataset.estudioSex;
  const encontrado=[...favoritos,...recientes].find(x=>x.id===id&&x.sex===sex);
  if(encontrado)irAPieza(encontrado);
 });
 actualizar();
 return {actualizarLocal(p,indice,sex){if(!p){poner(null);return;}poner({...p,indice,sex});},actualizarExterno(datos){poner(datos?.nombre?{...datos,sex:null,indice:null,id:null}:null);},limpiar(){poner(null);}};
}
