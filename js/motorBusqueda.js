/* Motor independiente del DOM. Nombres originales conservados; equivalencias de búsqueda, no diagnósticos. */
export const normalizarBusqueda=v=>String(v??'').replace(/([a-z])([A-Z])/g,'$1 $2').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const equivalencias=[
 'izquierdo izquierda izquierdos izquierdas left izq','derecho derecha derechos derechas right der',
 'arteria arterias artery arteries','vena venas vein veins','nervio nervios nerve nerves','musculo musculos muscle muscles','hueso huesos bone bones','ligamento ligamentos ligament ligaments','tendon tendones tendons','cartilago cartilagos cartilage cartilages','glandula glandulas gland glands','lobulo lobulos lobe lobes','ventriculo ventriculos ventricle ventricles','auricula auriculas atrium atria','valvula valvulas valve valves','conducto conductos duct ducts','rama ramas branch branches','ganglio ganglios ganglion ganglia node nodes','linfatico linfatica linfaticos linfaticas lymph lymphatic',
 'carotida carotidas carotid','ciatico ciatica sciatic','radial','cubital ulnar','femoral','renal','hepatico hepatica hepatic','pulmonar pulmonary','cerebral','coronaria coronario coronary',
 'corazon heart cardiaco cardiaca cardiac','cerebro encefalo brain cerebrum encephalon','cerebelo cerebellum','pulmon pulmones lung lungs','rinon rinones kidney kidneys','estomago stomach','higado liver','pancreas pancreatic','bazo spleen','vejiga bladder','ureter ureteres ureters','uretra urethra','intestino intestinos intestine intestines bowel','colon','duodeno duodenum','yeyuno jejunum','ileo ileum','recto rectum','esofago esophagus oesophagus','traquea trachea','bronquio bronquios bronchus bronchi','diafragma diaphragm','ojo ojos eye eyes eyeball','cornea','retina','oido ear','coclea cochlea','piel skin','cabello pelo hair','craneo skull cranium','rotula patella','femur','tibia','perone fibula','omoplato escapula scapula','clavicula clavicle','costilla costillas rib ribs','vertebra vertebras vertebrae','columna spine','medula medulla','espinal spinal','hipofisis pituitaria pituitary','tiroides thyroid','paratiroides parathyroid','suprarrenal suprarrenales adrenal','pineal','utero uterus','ovario ovarios ovary ovaries','prostata prostate','testiculo testiculos testis testes','menisco meniscos meniscus menisci','aorta','biceps','triceps','superior upper','inferior lower','interna interno internal','externa externo external','comun common','frontal','temporal','occipital','parietal','ascendente ascending','descendente descending','transverso transversa transverse'
];
const vocab=new Map();for(const e of equivalencias){const [key,...terms]=e.split(' ');for(const t of [key,...terms])vocab.set(t,key);}
const stop=new Set('el la los las un una de del al en y e a of the and in for mostrar ver buscar quiero encontrar donde esta cual es parte partes organo organos'.split(' '));
export function tokensBusqueda(v){return normalizarBusqueda(v).split(' ').filter(t=>t&&!stop.has(t)).map(t=>vocab.get(t)||t).filter((t,i,a)=>a.indexOf(t)===i);}
export function distanciaEdicion(a,b){let p=Array.from({length:b.length+1},(_,i)=>i),pp=p;for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++){c[j]=Math.min(c[j-1]+1,p[j]+1,p[j-1]+Number(a[i-1]!==b[j-1]));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])c[j]=Math.min(c[j],pp[j-2]+1);}pp=p;p=c;}return p[b.length];}
export function prepararBusqueda(...campos){return campos.filter(Boolean).map(c=>({texto:normalizarBusqueda(c),tokens:tokensBusqueda(c)}));}
const lados=new Set(['izquierdo','derecho']);
function coincidencia(t,w,ultimo,difusa){if(t===w)return 100;if(lados.has(t)||lados.has(w))return 0;if(ultimo&&t.length>=3&&w.startsWith(t))return 76;if(difusa&&t.length>=4&&Math.abs(t.length-w.length)<=1&&distanciaEdicion(t,w)<=1)return 50;return 0;}
export function puntuarBusqueda(campos,consulta,{difusa=true}={}){
 const q=normalizarBusqueda(consulta),qt=tokensBusqueda(q);if(!qt.length||qt.length>16||q.length>180)return 0;
 let best=0;
 for(let i=0;i<campos.length;i++){const c=campos[i];if(!c.tokens.length)continue;
  if(q===c.texto){best=Math.max(best,220-i*4);continue;}
  if(qt.some(t=>lados.has(t)&&!c.tokens.includes(t)))continue;
  let total=0,ok=true;const usados=new Set();
  for(let j=0;j<qt.length;j++){let m=0,kBest=-1;for(let k=0;k<c.tokens.length;k++){if(usados.has(k))continue;const s=coincidencia(qt[j],c.tokens[k],j===qt.length-1,difusa);if(s>m){m=s;kBest=k;}}if(!m){ok=false;break;}usados.add(kBest);total+=m;}
  if(ok){const exactos=qt.length===c.tokens.length&&total===100*qt.length;best=Math.max(best,(exactos?200:total/qt.length+40)-Math.min(25,Math.max(0,c.tokens.length-qt.length)*3)-i*2);}
 }
 return best;
}
export function ordenarBusqueda(registros,consulta,{difusa=true}={}){return registros.map(r=>({...r,puntos:puntuarBusqueda(r.campos,consulta,{difusa})})).filter(r=>r.puntos>0).sort((a,b)=>b.puntos-a.puntos||String(a.nombre).length-String(b.nombre).length||String(a.nombre).localeCompare(String(b.nombre),'es'));}
