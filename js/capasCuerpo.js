// Distribución didáctica por familias; todos los elementos de una familia
// comparten la misma traslación para conservar sus relaciones anatómicas.
export const FAMILIAS_CAPAS = [
 {nombre:'Piel y cabello', sistemas:['integumentary'], x:-1.05,y:1.02},
 {nombre:'Musculatura', sistemas:['muscular'], x:0,y:1.02},
 {nombre:'Huesos y tejidos de unión', sistemas:['skeletal','cartilage','connective'], x:1.05,y:1.02},
 {nombre:'Cardiovascular', sistemas:['cardiac','arterial','venous'], x:-1.05,y:-1.02},
 {nombre:'Nervioso y sensorial', sistemas:['nervous','sensory'], x:0,y:-1.02},
 {nombre:'Órganos y glándulas', sistemas:['respiratory','digestive','urinary','reproductive','endocrine','lymphatic'], x:1.05,y:-1.02}
];
export function desplazamientoCapa(sistema,valor){
 const f=FAMILIAS_CAPAS.find(f=>f.sistemas.includes(sistema));
 const t=Math.max(0,Math.min(1,Number(valor)||0));
 return f?[f.x*t,f.y*t,0]:[0,0,0];
}
export function capasDisponibles(partes){return new Set(partes.map(p=>p.system));}
