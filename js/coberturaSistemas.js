// Requisitos mínimos de inspección, no certificación de completitud anatómica.
export const REQUISITOS = {
 respiratory:[['Pulmón izquierdo',/^left lung$/i],['Pulmón derecho',/^right lung$/i],['Tráquea',/^trachea$/i],['Bronquio izquierdo',/^left main bronchus/i],['Bronquio derecho',/^right main bronchus/i]],
 digestive:[['Hígado',/^liver$/i],['Estómago',/^stomach$/i],['Esófago',/^esophagus$/i],['Páncreas',/^pancreas$/i],['Vesícula biliar',/^gallbladder$/i],['Intestino delgado',/jejunum|ileum|duodenum/i],['Colon',/ascending colon|descending colon|transverse colon/i]],
 nervous:[['Encéfalo (malla general)',/^brain$|^encephalon$/i],['Cerebelo',/^cerebellum$/i],['Médula espinal',/^spinal cord$/i],['Nervios',/\bnerve\b/i]],
 cardiac:[['Corazón (malla general)',/^heart$/i],['Válvulas',/valve/i],['Aurículas',/atrium/i],['Ventrículos',/ventricl/i]],
 endocrine:[['Tiroides',/^thyroid gland$/i],['Paratiroides',/parathyroid gland/i],['Hipófisis',/^pituitary gland$/i],['Pineal',/^pineal body$/i],['Suprarrenales',/adrenal gland/i]],
 lymphatic:[['Bazo',/^spleen$/i],['Timo',/thymus/i],['Ganglios linfáticos',/lymph node/i],['Vasos linfáticos',/lymphatic vessel|lymphatic trunk|thoracic duct/i]],
 urinary:[['Riñón izquierdo',/^left kidney$/i],['Riñón derecho',/^right kidney$/i],['Uréteres',/ureter/i],['Vejiga',/^urinary bladder$/i],['Uretra',/^urethra$/i]],
 sensory:[['Retina',/retina/i],['Córnea',/cornea/i],['Oído interno',/cochlea|semicircular canal/i]],
 reproductive:[['Testículos',/testis/i],['Próstata',/^prostate$/i],['Vesículas seminales',/seminal vesicle/i]],
 skeletal:[['Cráneo',/frontal bone|parietal bone/i],['Columna',/vertebra/i],['Fémur',/femur/i]],
 muscular:[['Bíceps',/biceps brachii/i],['Cuádriceps',/rectus femoris/i],['Diafragma',/diaphragm/i]],
 arterial:[['Aorta',/aorta/i],['Carótida',/carotid/i]],venous:[['Venas cavas',/vena cava/i],['Yugular',/jugular/i]],
 cartilage:[['Cartílago costal',/costal cartilage/i],['Meniscos',/menisc/i]],connective:[['Ligamentos',/ligament/i],['Tendones',/tendon/i]],integumentary:[['Piel',/^skin$/i],['Cabello',/hair/i]]
};
export function auditarCobertura(partes,sistema){
 const locales=partes.filter(p=>p.system===sistema||(sistema==='circulatory'&&['cardiac','arterial','venous'].includes(p.system))||sistema==='whole');
 const requisitos=sistema==='circulatory'?[...REQUISITOS.cardiac,...REQUISITOS.arterial,...REQUISITOS.venous]:(REQUISITOS[sistema]||[]);
 const estado=requisitos.map(([nombre,pat])=>({nombre,presente:locales.some(p=>pat.test(p.name))}));
 return {cantidad:locales.length,estado,faltantes:estado.filter(e=>!e.presente).map(e=>e.nombre)};
}
