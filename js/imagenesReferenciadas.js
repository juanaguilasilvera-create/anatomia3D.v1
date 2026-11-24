/* Imágenes de Commons con metadatos reales de autor, licencia y enlace de origen.
   No se presenta una coincidencia textual como validación anatómica exacta. */
const CACHE=new Map();
const API='https://commons.wikimedia.org/w/api.php';
const limpiarHTML=html=>{const doc=new DOMParser().parseFromString(String(html||''),'text/html');doc.querySelectorAll('script,style,img,iframe,object,video,svg').forEach(el=>el.remove());return doc.body.textContent.replace(/\s+/g,' ').trim();};
const normalizar=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const utilPalabras=s=>normalizar(s).split(/[^a-z0-9]+/).filter(t=>t.length>=3&&!['left','right','human','anatomy','system','structure','part','upper','lower','cavity','body'].includes(t));
function puntuacion(titulo,pieza){
 const texto=normalizar(titulo),palabras=utilPalabras(pieza);
 return palabras.reduce((a,p)=>a+(texto.includes(p)?1:0),0);
}
function consultaBase(texto){
 return String(texto||'').replace(/\b(left|right|izquierdo|izquierda|derecho|derecha)\b/gi,'').replace(/\s+/g,' ').trim();
}
async function consultar(q,{signal}={}){
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:`${q} anatomy`,gsrnamespace:'6',gsrlimit:'18',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'950',format:'json',formatversion:'2',origin:'*'});
 const r=await fetch(`${API}?${params}`,{signal,mode:'cors',credentials:'omit'});
 if(!r.ok)throw Error(`Servicio de imágenes: HTTP ${r.status}`);
 const datos=await r.json();
 if(datos.error)throw Error(datos.error.info||'La biblioteca de imágenes rechazó la búsqueda');
 const paginas=datos.query?.pages||[];
 const imagenes=paginas.flatMap(p=>{
  const info=p.imageinfo?.[0];if(!info?.thumburl||!info?.descriptionurl)return[];
  if(!/^image\/(png|jpeg|svg\+xml|webp)$/i.test(info.mime||''))return[];
  const titulo=p.title.replace(/^File:/i,'');
  const puntaje=puntuacion(titulo,q);if(puntaje===0)return[];
  const ext=info.extmetadata||{};
  const autor=limpiarHTML(ext.Artist?.value||'');
  const licencia=limpiarHTML(ext.LicenseShortName?.value||'');
  return [{titulo,miniatura:info.thumburl,url:info.url||info.thumburl,fuente:info.descriptionurl,autor:autor.slice(0,160)||'Consultar ficha original',licencia:licencia||'Consultar licencia en Commons',puntaje}];
 });
 imagenes.sort((a,b)=>b.puntaje-a.puntaje);
 return imagenes;
}
export async function buscarImagenesReferenciadas(pieza,{signal}={}){
 if(!pieza?.name)return [];
 const clave=JSON.stringify([pieza.name,pieza.titulo2d||'',pieza.system||'']).toLowerCase();
 if(CACHE.has(clave))return CACHE.get(clave);
 const consultas=[];
 const agregar=q=>{q=consultaBase(q);if(q&&!consultas.includes(q))consultas.push(q);};
 agregar(pieza.titulo2d);
 agregar(pieza.name);
 agregar(normalizar(pieza.name).replace(/\b(left|right)\b/g,''));
 const porSistema={skeletal:'human skeleton',muscular:'human muscles',nervous:'human nervous system',cardiac:'human heart',arterial:'human arteries',venous:'human veins',respiratory:'human respiratory system',digestive:'human digestive system',urinary:'human urinary system',sensory:'human eye anatomy',integumentary:'human skin anatomy',endocrine:'human endocrine system',reproductive:'human reproductive system',lymphatic:'human lymphatic system',cartilage:'human cartilage'};
 agregar(porSistema[pieza.system]);
 const acumuladas=[];
 for(const q of consultas){
  try{
   const items=await consultar(q,{signal});
   for(const item of items){
    if(!acumuladas.some(x=>x.fuente===item.fuente))acumuladas.push(item);
   }
   if(acumuladas.length>=5)break;
  }catch(e){if(e.name==='AbortError')throw e;}
 }
 const resultado=acumuladas.sort((a,b)=>b.puntaje-a.puntaje).slice(0,7);
 CACHE.set(clave,resultado);
 return resultado;
}
