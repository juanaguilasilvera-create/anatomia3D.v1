/* Catálogo fijo de modelos autorizados. El servidor incluido descarga y guarda
   los archivos automáticamente la primera vez que se eligen. Sin importación manual.
   Si el usuario abre Live Server, se conservan URL de respaldo online. */
export const SISTEMAS_INTEGRADOS=Object.freeze([
 {id:'nervous',nombre:'Sistema nervioso'},
 {id:'respiratory',nombre:'Sistema respiratorio'},
 {id:'circulatory',nombre:'Sistema cardiovascular'},
 {id:'digestive',nombre:'Sistema digestivo'},
 {id:'skeletal',nombre:'Sistema óseo'},
 {id:'cartilage',nombre:'Cartílagos'},
 {id:'connective',nombre:'Tejido conectivo'},
 {id:'cardiac',nombre:'Corazón y válvulas'},
 {id:'muscular',nombre:'Sistema muscular'},
 {id:'urinary',nombre:'Sistema urinario'},
 {id:'lymphatic',nombre:'Sistema linfático'},
 {id:'endocrine',nombre:'Sistema endocrino'},
 {id:'reproductive',nombre:'Sistema reproductor'},
 {id:'sensory',nombre:'Sistema sensorial'},
 {id:'joints',nombre:'Articulaciones y ligamentos'},
 {id:'arterial',nombre:'Arterias'},
 {id:'venous',nombre:'Venas'},
 {id:'visceral',nombre:'Órganos internos'}
]);
export const CREATURAS_INTEGRADAS=Object.freeze([
 {id:'dragon',nombre:'Dragón de fantasía',tipo:'dragon',tipoDescripcion:'figura artística de fantasía, no anatomía científica',urlLocal:'./modelos/criaturas/dragon.glb',url:'https://raw.githubusercontent.com/3dloom/3dloom-sample-models/main/models/dragon.glb',licencia:'CC BY 4.0',fuente:'https://github.com/3dloom/3dloom-sample-models'},
 {id:'zorro',nombre:'Zorro animado',tipo:'zorro',tipoDescripcion:'animal animado, representación artística',urlLocal:'./modelos/criaturas/zorro.glb',url:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb',licencia:'CC0 para la malla; CC BY 4.0 para rigging, animación y conversión',fuente:'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox'}
]);
