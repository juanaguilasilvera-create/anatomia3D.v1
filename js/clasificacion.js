// Subgrupos anatómicos conservadores: se basan en nombres reales del manifiesto.
// No convierte conocimiento de anatomía en mallas 3D inexistentes.
export const SUBGRUPOS={
 cartilage:[
  {id:'todos',nombre:'Todos los cartílagos'},
  {id:'costal',nombre:'Cartílagos costales'},
  {id:'laringe',nombre:'Cartílagos laríngeos'},
  {id:'nasal',nombre:'Cartílagos nasales'},
  {id:'rodilla',nombre:'Rodilla: cartílago y meniscos (si disponibles)'}
 ],
 nervous:[
  {id:'todos',nombre:'Todo el tejido nervioso'},
  {id:'encefalo',nombre:'Encéfalo y conexiones'},
  {id:'periferico',nombre:'Nervios craneales y ganglios'},
  {id:'liquido',nombre:'Sistema ventricular y LCR'}
 ]
};
export function normalizarClasificacion(p){
 const n=String(p.name||'').trim();
 // Reglas exactas antes de las reglas generales: se conserva el ID de origen.
 if(/^(left|right) lacrimal bone$|^(left|right) inferior nasal concha$/i.test(n))p.system='skeletal';
 if(/^flexor retinaculum of (left|right) wrist$/i.test(n))p.system='connective';
 if(/^(left|right) (inferior pharyngeal constrictor|middle pharyngeal constrictor|superior pharyngeal constrictor|palatopharyngeus|salpingopharyngeus|stylopharyngeus|tensor fasciae latae)$/i.test(n))p.system='muscular';
 if(/cartilage/i.test(n)||/^epiglottis$/i.test(n))p.system='cartilage';
 if(/^(third ventricle|fourth ventricle|interventricular foramen|left lateral ventricle|right lateral ventricle)$/i.test(n))p.system='nervous';
 if(/choroid plexus of cerebral hemisphere/i.test(n))p.system='nervous';
 return p;
}
export function subgrupoPieza(p){
 const n=String(p.name||'').toLowerCase();
 if(p.system==='cartilage'){
  if(/costal cartilage/.test(n))return 'costal';
  if(/cricoid|arytenoid|thyroid cartilage|corniculate|cuneiform/.test(n))return 'laringe';
  if(/nasal|alar cartilage/.test(n))return 'nasal';
  if(/meniscus|menisci|articular cartilage|cartilage of knee|knee cartilage/.test(n))return 'rodilla';
  return 'otros';
 }
 if(p.system==='nervous'){
  if(/(ventricle|interventricular foramen|choroid plexus|cerebral aqueduct|central canal)/.test(n))return 'liquido';
  if(/(nerve|ganglion)/.test(n))return 'periferico';
  return 'encefalo';
 }
 return 'todos';
}
export function coberturaDelGrupo(parts,id){
 const sub=SUBGRUPOS[id];if(!sub)return null;
 const counts=Object.fromEntries(sub.map(e=>[e.id,0]));
 for(const p of parts){if(p.system!==id)continue;counts.todos++;const key=subgrupoPieza(p);if(key in counts)counts[key]++;}
 return counts;
}
