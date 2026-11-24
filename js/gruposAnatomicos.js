/* Conjuntos 3D ensamblados EXCLUSIVAMENTE con mallas presentes en BodyParts3D.
   Un conjunto no equivale a un modelo clínico integral del órgano. */
export const GRUPOS_3D=[
 {id:'cerebro',nombre:'Cerebro y encéfalo',sistema:'nervous',alias:'cerebro encefalo encefalico cerebrum brain cerebelo lobulos cerebrales',nota:'Encéfalo compuesto a partir de las estructuras encefálicas disponibles. No es una sola malla cerrada del cerebro.'},
 {id:'corazon',nombre:'Corazón · estructuras disponibles',sistema:'cardiac',alias:'corazon cardiaco heart cardiac',nota:'Conjunto de cavidades, paredes y válvulas cardíacas disponibles; no es una superficie externa completa del corazón.'},
 {id:'ojos',nombre:'Ojos · modelo por capas',sistema:'sensory',alias:'ojo ojos eye retina vision cornea iris',nota:'Mallas originales de ambos ojos. Abre la vista por capas para distinguir retina, córnea, iris, cristalino y cubiertas.'},
 {id:'rinones',nombre:'Riñones',sistema:'urinary',alias:'rinon rinones kidneys kidney renal',nota:'Mallas disponibles del riñón izquierdo y derecho.'},
 {id:'bronquios',nombre:'Árbol bronquial (sin pulmones completos)',sistema:'respiratory',alias:'pulmon pulmones bronquio bronquios bronquial respiracion lung lungs',nota:'El modelo incluye vías y ramificaciones bronquiales; no incluye superficies externas completas de ambos pulmones.'},
 {id:'estomago',nombre:'Estómago',sistema:'digestive',alias:'estomago stomach gastrico',nota:'Malla del estómago disponible en la referencia anatómica.'},
 {id:'pancreas',nombre:'Páncreas',sistema:'digestive',alias:'pancreas pancreatic glandula pancreatica',nota:'Malla pancreática y parénquima disponibles, ensamblados para inspección.'},
 {id:'bazo',nombre:'Bazo',sistema:'lymphatic',alias:'bazo spleen',nota:'Representación del bazo disponible en el atlas.'},
 {id:'higado',nombre:'Hígado · estructuras parciales',sistema:'digestive',alias:'higado liver hepatic lobulo caudado',nota:'El atlas solo contiene el lóbulo caudado y un conducto relacionado; NO representa el hígado completo.'},
 {id:'vesicula',nombre:'Vesícula biliar',sistema:'digestive',alias:'vesicula biliar gallbladder',nota:'Malla de la vesícula biliar disponible.'},
 {id:'intestinos',nombre:'Intestinos · segmentos disponibles',sistema:'digestive',alias:'intestino intestinos colon duodeno recto bowel intestine',nota:'Incluye los segmentos intestinales disponibles. No es un tracto digestivo clínico integral.'},
 {id:'aorta',nombre:'Aorta · segmentos disponibles',sistema:'arterial',alias:'aorta arteria aortica',nota:'Incluye los segmentos de la aorta presentes en el atlas.'}
];
const ENCEFALO_FMA50801=new Set(["FJ1730", "FJ1731", "FJ1732", "FJ1733", "FJ1738", "FJ1739", "FJ1740", "FJ1743", "FJ1744", "FJ1745", "FJ1746", "FJ1747", "FJ1748", "FJ1749", "FJ1750", "FJ1751", "FJ1758", "FJ1759", "FJ1760", "FJ1762", "FJ1767", "FJ1769", "FJ1770", "FJ1775", "FJ1779", "FJ1780", "FJ1781", "FJ1783", "FJ1784", "FJ1785", "FJ1786", "FJ1787", "FJ1788", "FJ1789", "FJ1790", "FJ1791", "FJ1792", "FJ1795", "FJ1797", "FJ1798", "FJ1800", "FJ1801", "FJ1806", "FJ1807", "FJ1808", "FJ1810", "FJ1814", "FJ1817", "FJ1822", "FJ1826", "FJ1828", "FJ1830", "FJ1831", "FJ1833", "FJ1834", "FJ1835", "FJ1836", "FJ1841", "FJ1842"]);
export function indicesDeGrupo(parts,id){
 const fuenteBodyParts=parts.some(p=>ENCEFALO_FMA50801.has(p.id));
 const n=p=>String(p.name||'').toLowerCase();
 return parts.flatMap((p,i)=>{
  const name=n(p);
  let ok=false;
  if(id==='cerebro')ok=p.system==='nervous' && (fuenteBodyParts?ENCEFALO_FMA50801.has(p.id):p.bounds?.[0]?.[1]>1.53) && !/(\bnerve\b|\bganglion\b|optic chiasm|optic tract|central canal of spinal)/.test(name);
  else if(id==='corazon')ok=p.system==='cardiac' && !/^(third|fourth|left lateral|right lateral) ventricle$|^interventricular foramen$/.test(name);
  else if(id==='ojos')ok=p.system==='sensory' && /eyeball|choroid|ciliar|cornea|tendinous ring|iris|lacrimal|nasolacrimal|lens|retina|sclera|tarsal plate|vitreous/.test(name) && !/choroid plexus|lacrimal bone|retinaculum/.test(name);
  else if(id==='rinones')ok=p.system==='urinary'&&/^(left|right) kidney$/.test(name);
  else if(id==='bronquios')ok=p.system==='respiratory'&&(/bronch/.test(name)||name==='trachea');
  else if(id==='estomago')ok=name==='stomach';
  else if(id==='pancreas')ok=p.system==='digestive'&&/^(pancreas|parenchyma of pancreas)$/.test(name);
  else if(id==='bazo')ok=name==='spleen';
  else if(id==='higado')ok=/^(caudate lobe of liver|left duct of caudate lobe of liver)$/.test(name);
  else if(id==='vesicula')ok=name==='gallbladder';
  else if(id==='intestinos')ok=p.system==='digestive'&&/(intestin|colon|duodenum|jejunum|ileum|rectum|cecum|caecum)/.test(name)&&!/artery|vein|mesocolon/.test(name);
  else if(id==='aorta')ok=p.system==='arterial'&&/aorta/.test(name);
  return ok?[i]:[];
 });
}
