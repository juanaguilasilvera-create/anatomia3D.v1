// Paleta y descripciones curadas para las mallas BodyParts3D (no se alteran los IDs originales).
export const SISTEMAS=[
{id:'skeletal',name:'Grupo óseo y dentario',color:'#e8ddbd',description:'Huesos, dientes, encías y estructuras esqueléticas catalogadas en la fuente.'},
{id:'cartilage',name:'Cartílagos',color:'#86a9da',description:'Cartílagos de vías aéreas, nariz y región costal identificados en el atlas.'},
{id:'muscular',name:'Sistema muscular',color:'#cd6d66',description:'Músculos esqueléticos y sus inserciones.'},
{id:'cardiac',name:'Corazón y válvulas',color:'#ea7774',description:'Cavidades, válvulas y paredes cardíacas (no ventrículos del encéfalo).' },
{id:'arterial',name:'Sistema arterial',color:'#d85248',description:'Arterias que distribuyen sangre hacia los tejidos.'},
{id:'venous',name:'Sistema venoso',color:'#4d95d8',description:'Red venosa que devuelve sangre al corazón.'},
{id:'nervous',name:'Sistema nervioso',color:'#e5c270',description:'Encéfalo, nervios y estructuras relacionadas.'},
{id:'respiratory',name:'Respiratorio',color:'#ce9da8',description:'Pulmones, vías aéreas y estructuras de respiración.'},
{id:'digestive',name:'Digestivo',color:'#d69c6c',description:'Esófago, estómago, intestinos, vías biliares y fragmentos del hígado. El modelo local NO contiene el hígado completo.'},
{id:'urinary',name:'Urinario',color:'#d9b0a2',description:'Riñones y vías urinarias.'},
{id:'reproductive',name:'Reproductor',color:'#b795cf',description:'Órganos reproductores del modelo de referencia masculino.'},
{id:'lymphatic',name:'Linfático',color:'#acd06c',description:'Estructuras relacionadas con el sistema linfático.'},
{id:'endocrine',name:'Endocrino',color:'#dcacdb',description:'Glándulas y estructuras de regulación hormonal.'},
{id:'sensory',name:'Órganos sensoriales',color:'#799fe6',description:'Ojo, oído y estructuras sensoriales.'},
{id:'connective',name:'Tejido conectivo',color:'#b6a6cb',description:'Tejidos conectivos y estructuras de unión.'},
{id:'integumentary',name:'Piel y cabello',color:'#e2bc9e',description:'Piel, labios, cejas y cabello de la malla original.'}
];
export const MODULOS=[
 {id:'modelado',title:'Modelado anatómico',sub:'Mallas de anatomía real',formula:'V = {v₀, v₁, …, vₙ}\nF = {(i₀, i₁, i₂), …}',text:'Cada estructura se representa con vértices, índices triangulares y normales. Su volumen se aproxima mediante una superficie poligonal.'},
 {id:'mallas',title:'Polígonos y normales',sub:'Topología · producto vectorial',formula:'u = B − A\nv = C − A\nN = (u × v) / ||u × v||',text:'La orientación de un triángulo se obtiene con un producto vectorial de sus aristas. Para mantener los FPS se dibuja una muestra de las aristas y normales del objeto, no la totalidad.'},
 {id:'transformar',title:'Transformaciones 3D',sub:'Traslación · giro · escala',formula:'P′ = M · P\nM = T(c) · T(d) · R · S · T(−c)',text:'Las transformaciones actúan sobre una malla REAL alrededor de su centro. El panel muestra la matriz y un vértice efectivamente transformado.'},
 {id:'luces',title:'Luz y sombreado',sub:'Directional · Hemisphere · Point',formula:'I_d ∝ max(0, N · L)\nI = I_amb + I_d + I_spec',text:'La luz y el material MeshPhysicalMaterial calculan la apariencia. Puedes mover la luz y cambiar su intensidad.'},
 {id:'materiales',title:'Materiales PBR',sub:'Color · metalizado · rugosidad',formula:'f_r = f_diffuse + f_specular\nroughness ∈ [0,1]',text:'Cada sistema tiene un color distinto. Modifica las propiedades ópticas de la pieza seleccionada.'},
 {id:'render',title:'Renderizado WebGL',sub:'Cámara · rasterización · FPS',formula:'p_clip = P · V · M · p\nFPS = fotogramas / segundos',text:'Three.js envía las mallas a WebGL. Las métricas del encabezado se toman del renderizador durante la ejecución.'},
 {id:'rayos',title:'Rayos y reflexión',sub:'Demostración geométrica',formula:'R = I − 2 (I · N) N',text:'Demostración visual de reflexión especular calculada con vectores. NO es un trazador de rayos físico completo.'},
];
export function infoSistema(id){if(id==='whole')return {id,name:'Cuerpo completo',color:'#e2bc9e',description:'Todas las capas disponibles'};return SISTEMAS.find(x=>x.id===id)||{id,name:id,color:'#417bd8',description:'Estructura anatómica.'};}
export function escapar(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
