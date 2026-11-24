import {traducirNombreAnatomico} from './traduccionAnatomica.js';
// Guía educativa curada: conceptos de anatomía general. Los IDs, límites y
// geometrías exactas se obtienen del manifiesto BodyParts3D, no de este archivo.
export const GUIAS={
 whole:{titulo:'Cuerpo completo',sub:'Todas las capas anatómicas disponibles',resumen:'Explora los sistemas corporales incluidos en el modelo local. Usa Separación para ver seis familias de capas y selecciona una estructura para estudiarla.',funciones:['Protección y soporte','Movimiento y coordinación','Transporte, intercambio y regulación'],recorrido:'De la vista general a los sistemas y sus estructuras.',relaciones:'Los sistemas colaboran entre sí; la separación es una representación didáctica.',explora:['stomach','femur','midbrain','kidney','skin']},
 cartilage:{titulo:'Cartílagos',sub:'Tejido de soporte flexible',resumen:'El cartílago es un tejido conectivo firme y flexible que protege superficies articulares, amortigua cargas y da forma a estructuras como la nariz y laringe.',funciones:['Favorece el deslizamiento de superficies articulares.','Amortigua fuerzas en determinadas articulaciones.','Mantiene la forma de ciertas estructuras.'],recorrido:'Ejemplos generales: cartílago hialino (vías aéreas y superficies articulares), fibrocartílago (meniscos y discos) y elástico (epiglotis y pabellón auricular). Este modelo solo contiene las mallas de cartílago identificables en el archivo; no representa todos esos ejemplos.',relaciones:'Se relaciona con huesos, articulaciones, ligamentos y tejido conectivo.',explora:['Cricoid cartilage','Thyroid cartilage','Costal cartilage','Nasal cartilage']},
 circulatory:{titulo:'Sistema cardiovascular',sub:'Corazón · arterias · venas',resumen:'El sistema cardiovascular está formado por corazón y vasos sanguíneos: arterias, arteriolas, capilares, vénulas y venas. Transporta oxígeno, nutrientes, hormonas y productos de desecho.',funciones:['Impulsar la sangre desde el corazón.','Distribuir sangre por las arterias.','Retornar sangre por las venas.'],recorrido:'Circulación sistémica: ventrículo izquierdo → arterias → capilares → venas → aurícula derecha. Circulación pulmonar: ventrículo derecho → arterias pulmonares → pulmones → venas pulmonares → aurícula izquierda.',relaciones:'Se vincula con respiración, metabolismo y todos los órganos.',explora:['Aorta','Cavity of left ventricle','Femoral artery','Vena cava']},
 skeletal:{titulo:'Sistema óseo',sub:'Sostén · protección · movimiento',resumen:'El esqueleto humano adulto tiene habitualmente 206 huesos, aunque existen variaciones anatómicas. Los huesos sostienen el organismo, protegen órganos y permiten el movimiento junto a músculos y articulaciones. Este grupo de visualización también incluye dientes y encías catalogados con el esqueleto; no todos sus elementos son huesos.',funciones:['Sostiene el peso del cuerpo y define su forma.','Protege encéfalo, médula espinal y órganos torácicos.','Actúa junto a músculos y articulaciones para producir movimiento.','La médula ósea participa en la formación de células sanguíneas; el tejido óseo almacena minerales.'],recorrido:'Cráneo → columna vertebral → caja torácica → cintura escapular y pelvis → extremidades.',relaciones:'Los tendones unen músculos con huesos; los ligamentos conectan estructuras articulares. El esqueleto axial incluye cráneo, columna y tórax; el apendicular, cinturas y extremidades.',explora:['Skull','Frontal bone','Mandible','Vertebra','Rib','Sternum','Humerus','Radius','Ulna','Femur','Tibia','Fibula','Pelvis']},
 muscular:{titulo:'Sistema muscular',sub:'Contracción · postura · movimiento',resumen:'Los músculos esqueléticos están formados por fibras capaces de contraerse. Su acción coordinada transforma la energía química en fuerza y desplazamiento.',funciones:['Permite desplazamientos, expresiones faciales y movimientos finos.','Estabiliza articulaciones y mantiene la postura.','Participa en la respiración, la deglución y el control de movimientos.','Produce calor como consecuencia de la actividad metabólica.'],recorrido:'Señal nerviosa → unión neuromuscular → contracción de fibras → tracción sobre tendón y hueso.',relaciones:'Muchos músculos trabajan como pares agonistas-antagonistas. Los tendones transmiten la fuerza a los huesos; la irrigación aporta oxígeno y nutrientes.',explora:['Deltoid','Pectoralis','Biceps','Triceps','Rectus abdominis','Quadriceps','Gastrocnemius','Gluteus']},
 cardiac:{titulo:'Corazón y cavidades',sub:'Bombeo · válvulas · circulación',resumen:'El corazón es una bomba muscular de cuatro cavidades. Sus válvulas dirigen el flujo sanguíneo y reducen el retroceso entre cámaras y grandes vasos.',funciones:['La aurícula derecha recibe sangre venosa; el ventrículo derecho la impulsa hacia los pulmones.','La aurícula izquierda recibe sangre oxigenada; el ventrículo izquierdo la impulsa hacia el cuerpo.','Sus válvulas ayudan a mantener un flujo en una dirección.'],recorrido:'Venas cavas → aurícula derecha → ventrículo derecho → pulmones → aurícula izquierda → ventrículo izquierdo → aorta.',relaciones:'El miocardio se contrae de manera coordinada mediante señales eléctricas. El sistema arterial y venoso completa el circuito.',explora:['Cavity of left ventricle','Cavity of right ventricle','Cavity of left atrium','Cavity of right atrium','Mitral valve','Tricuspid valve','Aortic valve']},
 arterial:{titulo:'Sistema arterial',sub:'Distribución · presión · perfusión',resumen:'Las arterias llevan sangre desde el corazón hacia los tejidos. La mayoría transporta sangre oxigenada; las arterias pulmonares constituyen una excepción importante.',funciones:['Distribuye sangre a órganos y músculos.','Participa en la regulación de la resistencia vascular y presión arterial.','Se ramifica en vasos cada vez más pequeños hasta el lecho capilar.'],recorrido:'Circulación sistémica: ventrículo izquierdo → aorta → arterias → arteriolas → capilares. La circulación pulmonar parte del ventrículo derecho.',relaciones:'Las arterias comparten territorios con venas y nervios. La perfusión tisular depende de la presión y de la resistencia vascular.',explora:['Aorta','Carotid artery','Coronary artery','Femoral artery','Brachial artery','Cerebral artery']},
 venous:{titulo:'Sistema venoso',sub:'Retorno · válvulas · drenaje',resumen:'Las venas recogen sangre de los capilares y la devuelven al corazón. Muchas venas de las extremidades tienen válvulas que favorecen el retorno venoso.',funciones:['Conduce sangre de retorno hacia las aurículas.','Participa como reservorio de volumen sanguíneo.','Drena regiones profundas y superficiales de los tejidos.'],recorrido:'Circulación sistémica: capilares → vénulas → venas → venas cavas → aurícula derecha. Las venas pulmonares desembocan en la aurícula izquierda.',relaciones:'La contracción muscular y los cambios de presión torácica contribuyen al retorno venoso. Las venas pulmonares transportan sangre oxigenada.',explora:['Vena cava','Jugular vein','Femoral vein','Hepatic portal vein','Saphenous vein']},
 nervous:{titulo:'Sistema nervioso',sub:'Integración · impulsos · respuesta',resumen:'La red nerviosa detecta estímulos, integra información y coordina acciones. Incluye encéfalo y médula espinal, además de nervios periféricos.',funciones:['Recibe señales sensitivas del entorno y del propio cuerpo.','Procesa información y genera respuestas motoras.','Coordina funciones automáticas como respiración y ritmo cardíaco.','Permite memoria, aprendizaje, lenguaje y atención.'],recorrido:'Receptor → neurona sensitiva → sistema nervioso central → neurona motora → efector.',relaciones:'Las vías nerviosas conectan músculos, órganos de los sentidos y vísceras. Los vasos sanguíneos aportan oxígeno al tejido nervioso.',explora:['Cerebellum','Thalamus','Pons','Medulla oblongata','Optic nerve','Oculomotor nerve','Third ventricle']},
 respiratory:{titulo:'Sistema respiratorio',sub:'Ventilación · intercambio gaseoso',resumen:'Conduce aire hacia los pulmones y permite el intercambio de oxígeno y dióxido de carbono en los alvéolos, que no siempre se distinguen en estas mallas macroscópicas.',funciones:['Conduce, filtra y humidifica el aire inspirado.','Permite intercambio de gases entre aire alveolar y sangre.','Participa en la regulación del equilibrio ácido-base.','Colabora en la fonación mediante el flujo de aire.'],recorrido:'Nariz y faringe → laringe → tráquea → bronquios → bronquiolos → alvéolos.',relaciones:'El diafragma y los músculos intercostales modifican el volumen torácico. Los capilares pulmonares realizan el intercambio de gases.',explora:['Left lung','Right lung','Trachea','Main bronchus','Larynx','Diaphragm']},
 digestive:{titulo:'Sistema digestivo',sub:'Ingestión · digestión · absorción',resumen:'El sistema digestivo transforma los alimentos en sustancias que pueden absorberse y elimina residuos. Incluye el tubo digestivo y órganos accesorios.',funciones:['Realiza digestión mecánica y química.','Absorbe nutrientes, agua y electrolitos.','Transporta el contenido intestinal mediante movimientos coordinados.','El hígado procesa nutrientes y produce bilis; el páncreas aporta enzimas digestivas.'],recorrido:'Boca → faringe → esófago → estómago → duodeno → yeyuno e íleon → colon → recto → ano.',relaciones:'El hígado, la vesícula biliar y el páncreas descargan sustancias en el sistema digestivo. La irrigación intestinal conecta con la circulación portal.',explora:['Stomach','Esophagus','Duodenum','Jejunum','Ileum','Liver','Gallbladder','Pancreas','Ascending colon','Transverse colon','Rectum','Appendix']},
 urinary:{titulo:'Sistema urinario',sub:'Filtración · equilibrio interno',resumen:'Los riñones filtran la sangre y ajustan la composición del líquido corporal. La orina viaja por los uréteres hasta la vejiga, desde donde se elimina.',funciones:['Elimina productos metabólicos a través de la orina.','Regula agua, electrolitos y equilibrio ácido-base.','Participa en el control de la presión arterial.','Colabora en funciones endocrinas, incluida la producción de eritropoyetina.'],recorrido:'Riñones → uréteres → vejiga urinaria → uretra.',relaciones:'Las arterias renales aportan sangre para filtración; la vejiga almacena la orina antes de la micción.',explora:['Left kidney','Right kidney','Left ureter','Right ureter','Urinary bladder','Urethra']},
 reproductive:{titulo:'Sistema reproductor',sub:'Gametos · hormonas · reproducción',resumen:'Este modelo anatómico de referencia es masculino; las estructuras visibles incluyen testículos, conductos deferentes, vesículas seminales, próstata y pene.',funciones:['Los testículos producen espermatozoides y testosterona.','El epidídimo participa en la maduración y almacenamiento espermático.','Los conductos y glándulas contribuyen al transporte y composición del semen.'],recorrido:'Testículo → epidídimo → conducto deferente → conducto eyaculador → uretra.',relaciones:'Se relaciona estrechamente con el sistema urinario a través de la uretra masculina. El control hormonal involucra el eje hipotálamo-hipófisis-gónadas.',explora:['Testis','Epididymis','Prostate','Deferent duct','Seminal vesicle','Glans penis']},
 lymphatic:{titulo:'Sistema linfático',sub:'Defensa · drenaje · inmunidad',resumen:'El sistema linfático recoge exceso de líquido intersticial y participa en la vigilancia inmunológica. La selección de mallas disponible aquí representa solo algunas de sus estructuras.',funciones:['Contribuye a devolver líquido de los tejidos a la circulación.','Participa en respuestas inmunitarias.','El bazo filtra sangre y ayuda a responder a patógenos.','El timo tiene una función importante en maduración de linfocitos T.'],recorrido:'Líquido intersticial → vasos linfáticos → ganglios → grandes conductos linfáticos → venas.',relaciones:'Interacciona con el sistema circulatorio e inmunitario. No todos los vasos y ganglios están presentes en el modelo.',explora:['Spleen','Thymus']},
 endocrine:{titulo:'Sistema endocrino',sub:'Señales hormonales · regulación',resumen:'Las glándulas endocrinas secretan hormonas que actúan sobre órganos diana. Los efectos pueden ser locales o producirse a distancia a través de la sangre.',funciones:['Regula crecimiento y metabolismo mediante señales químicas.','Participa en respuesta al estrés y equilibrio hidroelectrolítico.','Coordina procesos de desarrollo, reproducción y ritmos biológicos.'],recorrido:'Estímulo → glándula endocrina → hormona en sangre → receptor de órgano diana → respuesta.',relaciones:'La hipófisis se relaciona con el hipotálamo; las suprarrenales se sitúan sobre los riñones. La representación endocrina del atlas masculino es parcial y no contiene todas las glándulas.',explora:['Pituitary gland','Pineal body','Adrenal gland']},
 sensory:{titulo:'Órganos sensoriales',sub:'Visión · audición · percepción',resumen:'Los receptores sensoriales convierten estímulos físicos y químicos en señales que el sistema nervioso puede interpretar.',funciones:['La retina transforma luz en señales nerviosas.','La córnea y el cristalino contribuyen al enfoque de luz.','El oído participa en audición y equilibrio.'],recorrido:'Estímulo → receptor → nervio aferente → centros nerviosos → percepción.',relaciones:'La anatomía del ojo está representada por múltiples superficies individuales; algunos elementos de otros sentidos pueden faltar.',explora:['Cornea','Iris','Lens','Retina','Sclera','Cochlea']},
 connective:{titulo:'Tejido conectivo',sub:'Unión · transmisión · soporte',resumen:'Agrupa tejidos y estructuras que sujetan, envuelven o conectan regiones anatómicas, incluidos tendones, ligamentos y membranas.',funciones:['Conecta tejidos y transmite cargas mecánicas.','Estabiliza algunas articulaciones.','Organiza compartimentos y envolturas de órganos y músculos.'],recorrido:'Fuerza muscular → tendón → inserción ósea; otras estructuras limitan y estabilizan movimientos.',relaciones:'La orientación de fibras y la composición de cada tejido determinan su respuesta mecánica.',explora:['Calcaneal tendon','Plantar ligament','Interosseous membrane','Linea alba']},
 integumentary:{titulo:'Piel y cabello',sub:'Barrera · temperatura · sensibilidad',resumen:'La piel recubre el cuerpo y participa en protección, sensibilidad y regulación térmica. Este atlas incluye superficies externas y estructuras pilosas.',funciones:['Actúa como barrera física contra agentes externos.','Posee receptores asociados al tacto, presión, dolor y temperatura.','Participa en regulación del calor mediante sudoración y flujo cutáneo.','El cabello cumple funciones de protección y sensibilidad.'],recorrido:'Epidermis → dermis → tejido subcutáneo (capas histológicas no separadas por este modelo superficial).',relaciones:'Interactúa con vasos, nervios y glándulas cutáneas. El atlas no permite observar todas las capas microscópicas.',explora:['Skin','Hair of head','Eyebrow','Lip','Pubic hair']}
};

// Buscar detalles por patrones anatómicos del archivo ORIGINAL, sin asumir que
// un nombre ambiguo representa otro órgano no disponible en la malla.
const DETALLES=[
 [/\b(third ventricle|fourth ventricle|lateral ventricle|interventricular foramen)\b/i,'Sistema ventricular cerebral','Cavidad intracraneal que forma parte del sistema de circulación del líquido cefalorraquídeo. El nombre «ventrículo» aquí no hace referencia a una cavidad cardíaca.','Ventrículos encefálicos interconectados.','Circulación y contención del líquido cefalorraquídeo.'],
 [/\b(stomach)\b/i,'Estómago','Órgano muscular hueco que recibe el bolo alimenticio. Sus paredes mezclan el contenido con secreciones gástricas y lo envían progresivamente al duodeno.','Cardias, fondo, cuerpo, antro y píloro.','Digestión mecánica y comienzo importante de la digestión de proteínas.'],
 [/\b(pancreas)\b/i,'Páncreas','Glándula mixta situada detrás del estómago. Su porción exocrina produce enzimas digestivas; su porción endocrina secreta hormonas como insulina y glucagón.','Cabeza, cuerpo, cola y conductos pancreáticos.','Participa en digestión y control de la glucosa.'],
 [/\b(liver|hepatic lobe)\b/i,'Hígado','Órgano abdominal que participa en metabolismo, síntesis de proteínas plasmáticas, almacenamiento y procesamiento de sustancias. Produce bilis, que ayuda a manejar lípidos.','Lóbulos, vasos hepáticos y vías biliares.','Metabolismo de nutrientes, producción de bilis y detoxificación.'],
 [/\b(gallbladder)\b/i,'Vesícula biliar','Almacena y concentra bilis producida por el hígado y puede liberarla al duodeno durante la digestión.','Fondo, cuerpo y cuello.','Almacenamiento y liberación de bilis.'],
 [/\b(esophagus)\b/i,'Esófago','Tubo muscular que transporta el bolo alimenticio desde la faringe hasta el estómago mediante movimientos peristálticos.','Segmentos cervical, torácico y abdominal.','Transporte alimentario.'],
 [/\b(duodenum)\b/i,'Duodeno','Primera porción del intestino delgado; recibe quimo gástrico, bilis y secreción pancreática.','Cuatro porciones anatómicas.','Neutralización y digestión química del contenido intestinal.'],
 [/\b(jejunum|ileum)\b/i,'Intestino delgado','El yeyuno y el íleon completan gran parte de la digestión y absorción. La superficie intestinal cuenta con pliegues, vellosidades y microvellosidades microscópicas.','Asas delgadas y mesenterio asociado.','Absorción de nutrientes y transporte del quimo.'],
 [/\b(colon|rectum|cecum|appendix)\b/i,'Intestino grueso','Incluye ciego, colon, recto y apéndice. Interviene en recuperación de agua y sales y formación/almacenamiento de heces.','Colon ascendente, transverso, descendente, sigmoide y recto.','Absorción de agua, tránsito y eliminación.'],
 [/\b(kidney)\b/i,'Riñón','Órgano retroperitoneal que recibe sangre por las arterias renales y forma orina mediante filtración glomerular y procesos tubulares.','Corteza, médula, pelvis renal y nefronas microscópicas.','Regula agua, electrolitos y eliminación de desechos.'],
 [/\b(ureter)\b/i,'Uréter','Conducto muscular que transporta orina desde la pelvis renal hasta la vejiga mediante peristalsis.','Porciones abdominal y pélvica.','Conducción de orina.'],
 [/\b(urinary bladder)\b/i,'Vejiga urinaria','Órgano muscular elástico que almacena orina. Durante la micción el músculo detrusor se contrae y se coordina con los esfínteres.','Cúpula, cuerpo, base, cuello y trígono vesical.','Almacenamiento y expulsión de orina.'],
 [/\b(lung|pulmonary parenchyma)\b/i,'Pulmón','Órgano respiratorio en el que el aire llega a alvéolos para intercambiar oxígeno y dióxido de carbono con la sangre capilar.','Pulmón derecho generalmente con tres lóbulos; izquierdo, con dos.','Intercambio gaseoso.'],
 [/\b(trachea)\b/i,'Tráquea','Conducto respiratorio reforzado por cartílagos que conduce aire hacia los bronquios principales.','Anillos cartilaginosos y pared membranosa posterior.','Conducción de aire.'],
 [/\b(bronch)\b/i,'Bronquio','Ramificación aérea que distribuye el flujo hacia distintas regiones del pulmón. Las divisiones continúan hasta bronquiolos y alvéolos.','Bronquios principales, lobares y segmentarios.','Distribución del aire pulmonar.'],
 [/\b(diaphragm)\b/i,'Diafragma','Músculo respiratorio principal: al contraerse desciende y aumenta el volumen de la cavidad torácica.','Cúpulas derecha e izquierda y centro tendinoso.','Inspiración y control de presión toracoabdominal.'],
 [/\b(ventricle|atrium|mitral valve|tricuspid valve|aortic valve|pulmonary valve)\b/i,'Cavidad o válvula cardíaca','Parte del corazón que interviene en el llenado, la contracción o la orientación del flujo. Las válvulas impiden el retroceso sanguíneo significativo.','Aurículas, ventrículos, válvulas auriculoventriculares o semilunares.','Impulsión o control del flujo sanguíneo.'],
 [/\b(cerebrum|cerebellum|brain|cerebral cortex|frontal lobe|temporal lobe)\b/i,'Encéfalo','Conjunto de estructuras nerviosas que integran información, coordinan movimientos, cognición y diversas funciones vitales.','Hemisferios, corteza, conexiones profundas y cerebelo (según pieza).','Procesamiento de señales y control del organismo.'],
 [/\b(spinal cord)\b/i,'Médula espinal','Estructura nerviosa dentro del canal vertebral que transmite señales entre encéfalo y cuerpo y participa en reflejos.','Sustancia gris y blanca, raíces nerviosas.','Conducción y coordinación refleja.'],
 [/\b(nerve|ganglion)\b/i,'Nervio o ganglio','Estructura de transmisión de impulsos entre el sistema nervioso y tejidos. Un nervio contiene conjuntos de axones; un ganglio contiene agrupaciones de cuerpos neuronales periféricos.','Fascículos nerviosos o agrupación neuronal, según estructura.','Comunicación nerviosa.'],
 [/\b(vertebra|sacrum|coccyx)\b/i,'Vértebra','Hueso de la columna que contribuye a sostener el cuerpo y proteger la médula. La forma varía entre segmentos cervical, torácico y lumbar.','Cuerpo vertebral, arco y procesos óseos, según región.','Sostén, movimiento vertebral y protección medular.'],
 [/\b(rib|sternum)\b/i,'Costilla o esternón','Hueso de la caja torácica que protege órganos torácicos y sirve de inserción para músculos respiratorios.','Costillas verdaderas, falsas y flotantes; esternón.','Protección del tórax y mecánica ventilatoria.'],
 [/\b(femur)\b/i,'Fémur','Hueso largo del muslo, esencial para soportar carga y transmitir fuerza entre cadera y rodilla.','Cabeza, cuello, diáfisis y cóndilos.','Locomoción y soporte de peso.'],
 [/\b(humerus)\b/i,'Húmero','Hueso largo del brazo que participa en las articulaciones del hombro y codo.','Cabeza, tubérculos, diáfisis y cóndilo humeral.','Movimiento del miembro superior.'],
 [/\b(cranium|skull|mandible|frontal bone|parietal bone)\b/i,'Hueso del cráneo','Elemento del esqueleto craneofacial que protege estructuras nerviosas o conforma la cara y la cavidad bucal.','Depende del hueso seleccionado.','Protección y soporte de estructuras craneofaciales.'],
 [/\b(tibia|fibula)\b/i,'Hueso de la pierna','La tibia transmite gran parte de la carga; la fíbula participa en estabilidad lateral e inserciones musculares.','Epífisis proximal, diáfisis y extremo distal.','Soporte y estabilidad de la pierna.'],
 [/\b(prostate)\b/i,'Próstata','Glándula reproductora masculina que rodea una porción de la uretra y contribuye con secreciones al líquido seminal.','Zonas glandulares y estroma fibromuscular.','Producción de secreción prostática.'],
 [/\b(testis)\b/i,'Testículo','Gónada masculina que produce espermatozoides y hormonas sexuales.','Túbulos seminíferos y tejido intersticial.','Espermatogénesis y secreción hormonal.'],
 [/\b(spleen)\b/i,'Bazo','Órgano linfoide que filtra sangre y participa en respuestas inmunes y reciclaje de componentes sanguíneos.','Pulpa roja y pulpa blanca.','Filtración sanguínea e inmunidad.'],
 [/\b(pituitary gland)\b/i,'Hipófisis','Glándula endocrina en la base del encéfalo que libera hormonas reguladoras y está conectada funcionalmente con el hipotálamo.','Adenohipófisis y neurohipófisis.','Regulación hormonal.'],
 [/\b(adrenal gland)\b/i,'Glándula suprarrenal','Glándula situada sobre el riñón que produce, entre otras, hormonas relacionadas con estrés y equilibrio de sales.','Corteza y médula suprarrenal.','Regulación metabólica y respuesta al estrés.'],
 [/\b(cornea|retina|iris|lens|sclera)\b/i,'Estructura del ojo','Parte del sistema óptico o neurosensorial ocular. La córnea y el cristalino refractan luz; la retina realiza fototransducción.','Capas y estructuras específicas según malla.','Enfoque de luz y visión.'],
 [/\b(hair of head|eyebrow|skin|pubic hair)\b/i,'Piel o cabello','Superficie externa que contribuye a la barrera corporal o estructuras pilosas asociadas a protección y sensibilidad.','Estructura de la superficie cutánea o pilosa.','Protección, sensibilidad y regulación térmica.'],
 [/\b(artery)\b/i,'Arteria','Vaso que lleva sangre desde el corazón hacia tejidos, con capas de pared especializadas para soportar la presión del flujo.','Túnicas íntima, media y adventicia.','Distribución de sangre arterial.'],
 [/\b(vein)\b/i,'Vena','Vaso que conduce sangre desde tejidos al corazón. Algunas venas presentan válvulas para facilitar el retorno.','Túnicas íntima, media y adventicia.','Retorno sanguíneo.'],
 [/\b(muscle|pectoralis|biceps|triceps|deltoid|gluteus|rectus|oblique)\b/i,'Músculo','Tejido contráctil que genera fuerza mediante la interacción de filamentos de actina y miosina; puede accionar segmentos corporales.','Fascículos y fibras musculares (no separados en esta superficie).','Contracción, movimiento y estabilidad.']
];
export function detallePieza(p){
 const original=String(p.name||'');
 const mostrado=nombreAnatomico(p).espanol;
 // Una subestructura no hereda sin reservas la función del órgano completo.
 // Ej.: «arteria renal» no equivale a «riñón», ni «rama del nervio óptico» al nervio entero.
 const vascular=/\b(artery|vein|arteriole|venule)\b/i.test(original);
 const nervioso=/\b(nerve|ganglion|commissure)\b/i.test(original);
 if(p.system==='cartilage')return {titulo:'Estructura cartilaginosa',descripcion:`${mostrado}: cartílago anatómico identificable en el conjunto de mallas. Los cartílagos tienen funciones diferentes según su ubicación; esta ficha no atribuye una función individual que no esté documentada.`,estructura:'Tejido conectivo cartilaginoso representado a escala macroscópica.',funcion:'Sostén flexible y/o recubrimiento, según región.',especifico:false};
 if(vascular){const arterial=/\b(artery|arteriole)\b/i.test(original);return {titulo:arterial?'Arteria':'Vena',descripcion:`${mostrado}: vaso catalogado en el modelo. ${arterial?'Las arterias conducen sangre desde el corazón.':'Las venas llevan sangre en dirección al corazón.'} Las ramas y territorios precisos requieren revisar la nomenclatura del elemento.`,estructura:'Superficie de vaso sanguíneo de escala macroscópica.',funcion:arterial?'Conducción arterial.':'Retorno venoso.',especifico:false};}
 if(nervioso){return {titulo:'Estructura nerviosa',descripcion:`${mostrado}: estructura nerviosa identificada en el modelo. La función exacta varía de un nervio, ganglio o rama a otro y no se atribuye sin validación individual.`,estructura:'Superficie nerviosa; no se resuelven axones microscópicos.',funcion:'Transmisión o procesamiento de información nerviosa según estructura.',especifico:false};}
 // Los ventrículos encefálicos están clasificados en «cardiac» en el archivo fuente;
 // priorizar su identidad anatómica antes del patrón genérico de ventrículos cardíacos.
 if(/^(third ventricle|fourth ventricle|left lateral ventricle|right lateral ventricle|interventricular foramen)$/i.test(original))
  return {titulo:'Sistema ventricular encefálico',descripcion:'Cavidad o comunicación intracraneal relacionada con la circulación del líquido cefalorraquídeo. No pertenece al corazón.',estructura:'Estructura macroscópica del sistema ventricular del encéfalo.',funcion:'Contener o comunicar líquido cefalorraquídeo.',especifico:true};
 // Descripciones macroscópicas aplicables a órganos, no a ramas, vasos, lóbulos ni paredes.
 const subparte=/\b(branch|leaflet|wall|part of|lobe|lobule|cavity|segment|duct of|surface|capsule|layer|fossa|sulcus|gyrus|foramen)\b/i.test(original);
 const m=DETALLES.find(([re])=>re.test(original));
 const incompatible=(p.system==='skeletal'&&m&&!/hueso|vértebra|fémur|húmero|costilla|cráneo/i.test(m[1])) ||(p.system==='cardiac'&&m&&!/cavidad|válvula/i.test(m[1]));
 if(m&&!subparte&&!incompatible)return {titulo:m[1],descripcion:m[2],estructura:m[3],funcion:m[4],especifico:true};
 if(/^(third ventricle|fourth ventricle|left lateral ventricle|right lateral ventricle|interventricular foramen)$/i.test(original))return {titulo:'Sistema ventricular encefálico',descripcion:'Cavidad o comunicación intracraneal relacionada con la circulación del líquido cefalorraquídeo. No es una cavidad del corazón.',estructura:'Estructura macroscópica del sistema ventricular encefálico.',funcion:'Permite contener y comunicar el líquido cefalorraquídeo.',especifico:true};
 return {titulo:mostrado,descripcion:`«${mostrado}» es una estructura identificada por el nombre e ID del modelo. No se dispone de una ficha anatómica individual verificada para esta pieza.`,estructura:'Malla macroscópica de la fuente. Puede representar una parte de un órgano y no el órgano completo.',funcion:'Consulta el funcionamiento general de su grupo anatómico; no se atribuye una función específica no documentada.',especifico:false};
}

// Nomenclatura conservadora: únicamente se presenta latín cuando el término
// corresponde realmente a toda la estructura. FMA de origen permanece visible.
const IDENTIFICADOS=[
 [/^heart$/i,'Corazón','Cor'],[/^brain$/i,'Encéfalo','Encephalon'],
 [/^liver$/i,'Hígado','Hepar'],[/^stomach$/i,'Estómago','Gaster'],
 [/^femur$/i,'Fémur','Femur'],[/^kidney$/i,'Riñón','Ren'],
 [/^lung$/i,'Pulmón','Pulmo'],[/^mandible$/i,'Mandíbula','Mandibula'],
 [/^skull$/i,'Cráneo','Cranium'],[/^pancreas$/i,'Páncreas','Pancreas'],
 [/^spleen$/i,'Bazo','Lien'],[/^uterus$/i,'Útero','Uterus'],
 [/^ovary$/i,'Ovario','Ovarium'],[/^prostate$/i,'Próstata','Prostata'],
 [/^testis$/i,'Testículo','Testis'],[/^trachea$/i,'Tráquea','Trachea'],
 [/^aorta$/i,'Aorta','Aorta'],[/^spinal cord$/i,'Médula espinal','Medulla spinalis'],
 [/^cerebellum$/i,'Cerebelo','Cerebellum'],[/^thyroid cartilage$/i,'Cartílago tiroides','Cartilago thyroidea'],
 [/^cricoid cartilage$/i,'Cartílago cricoides','Cartilago cricoidea'],
 [/^third ventricle$/i,'Tercer ventrículo cerebral','Ventriculus tertius'],
 [/^fourth ventricle$/i,'Cuarto ventrículo cerebral','Ventriculus quartus'],
 [/^interventricular foramen$/i,'Agujero interventricular cerebral','Foramen interventriculare']
];
const MULTILATERAL=[
 [/^(left|right) lateral ventricle$/i,'Ventrículo lateral','Ventriculus lateralis'],
 [/^(left|right) kidney$/i,'Riñón','Ren'],
 [/^(left|right) lung$/i,'Pulmón','Pulmo'],
 [/^(left|right) adrenal gland$/i,'Glándula suprarrenal','Glandula suprarenalis'],
 [/^(left|right) testis$/i,'Testículo','Testis'],
 [/^(left|right) ovary$/i,'Ovario','Ovarium'],
 [/^(left|right) ureter$/i,'Uréter','Ureter'],
 [/^(left|right) femoral artery$/i,'Arteria femoral','Arteria femoralis'],
 [/^(left|right) femoral vein$/i,'Vena femoral','Vena femoralis'],
 [/^(left|right) optic nerve$/i,'Nervio óptico','Nervus opticus']
];
function lado(t,femenino=false){return /^left\b/i.test(t)?(femenino?' izquierda':' izquierdo'):/^right\b/i.test(t)?(femenino?' derecha':' derecho'):'';}
const SIMPLE=[
 [/^(left|right) (\d+|first|second|third|fourth|fifth|sixth|seventh) costal cartilage$/i,'cartílago costal'],
 [/^((left|right) )?(femoral|brachial|radial|ulnar|carotid|coronary|axillary|pulmonary|cerebral|renal|vertebral|hepatic|subclavian|iliac|aortic|popliteal|digital|internal|external|common|deep|superficial) artery$/i,'arteria'],
 [/^((left|right) )?(femoral|brachial|jugular|pulmonary|renal|hepatic|saphenous|cephalic|basilic|caval|iliac|vertebral|subclavian|popliteal) vein$/i,'vena']
];
const TRADPAL=[['femoral','femoral'],['brachial','braquial'],['radial','radial'],['ulnar','cubital'],['carotid','carótida'],['coronary','coronaria'],['axillary','axilar'],['pulmonary','pulmonar'],['cerebral','cerebral'],['renal','renal'],['vertebral','vertebral'],['hepatic','hepática'],['subclavian','subclavia'],['iliac','ilíaca'],['aortic','aórtica'],['popliteal','poplítea'],['digital','digital'],['internal','interna'],['external','externa'],['common','común'],['deep','profunda'],['superficial','superficial'],['jugular','yugular'],['saphenous','safena'],['cephalic','cefálica'],['basilic','basílica']];
// Traducciones curadas para las piezas del sistema nervioso y cartilaginoso.
// Se conserva el nombre original del atlas en la ficha técnica para trazabilidad.
const MAPA_PARTES={
 'cricoid cartilage':['Cartílago cricoides','Cartilago cricoidea'],
 'thyroid cartilage':['Cartílago tiroides','Cartilago thyroidea'],
 'septal nasal cartilage':['Cartílago del tabique nasal',''],
 'major alar cartilage':['Cartílago alar mayor',''],
 'lateral nasal cartilage':['Cartílago nasal lateral',''],
 'cuneiform cartilage':['Cartílago cuneiforme',''],
 'corniculate cartilage':['Cartílago corniculado',''],
 'arytenoid cartilage':['Cartílago aritenoides',''],
 'optic nerve':['Nervio óptico','Nervus opticus'],
 'trochlear nerve':['Nervio troclear','Nervus trochlearis'],
 'ophthalmic nerve':['Nervio oftálmico','Nervus ophthalmicus'],
 'oculomotor nerve':['Nervio oculomotor','Nervus oculomotorius'],
 'frontal nerve':['Nervio frontal',''],
 'lacrimal nerve':['Nervio lagrimal',''],
 'nasociliary nerve':['Nervio nasociliar',''],
 'infratrochlear nerve':['Nervio infratroclear',''],
 'supra-orbital nerve':['Nervio supraorbitario',''],
 'supratrochlear nerve':['Nervio supratroclear',''],
 'anterior ethmoidal nerve':['Nervio etmoidal anterior',''],
 'posterior ethmoidal nerve':['Nervio etmoidal posterior',''],
 'long ciliary nerve':['Nervio ciliar largo',''],
 'short ciliary nerve':['Nervio ciliar corto',''],
 'ciliary ganglion':['Ganglio ciliar','Ganglion ciliare'],
 'thalamus':['Tálamo','Thalamus'],
 'hypothalamus':['Hipotálamo','Hypothalamus'],
 'hippocampus':['Hipocampo','Hippocampus'],
 'amygdala':['Amígdala cerebral',''],
 'insula':['Ínsula','Insula'],
 'pons':['Puente del tronco encefálico','Pons'],
 'medulla oblongata':['Bulbo raquídeo','Medulla oblongata'],
 'midbrain':['Mesencéfalo','Mesencephalon'],
 'corpus callosum':['Cuerpo calloso','Corpus callosum'],
 'cerebral aqueduct':['Acueducto cerebral','Aqueductus mesencephali'],
 'central canal of spinal cord':['Conducto central de la médula espinal','Canalis centralis'],
 'optic chiasm':['Quiasma óptico','Chiasma opticum'],
 'optic tract':['Tracto óptico','Tractus opticus'],
 'cerebellum':['Cerebelo','Cerebellum'],
 'globus pallidus':['Globo pálido','Globus pallidus'],
 'putamen':['Putamen','Putamen'],
 'caudate nucleus':['Núcleo caudado','Nucleus caudatus'],
 'superior colliculus':['Colículo superior','Colliculus superior'],
 'inferior colliculus':['Colículo inferior','Colliculus inferior'],
 'angular gyrus':['Giro angular','Gyrus angularis'],
 'cingulate gyrus':['Giro cingulado','Gyrus cinguli'],
 'fusiform gyrus':['Giro fusiforme','Gyrus fusiformis'],
 'postcentral gyrus':['Giro poscentral','Gyrus postcentralis'],
 'precentral gyrus':['Giro precentral','Gyrus precentralis'],
 'inferior frontal gyrus':['Giro frontal inferior',''],
 'middle frontal gyrus':['Giro frontal medio',''],
 'superior frontal gyrus':['Giro frontal superior',''],
 'inferior temporal gyrus':['Giro temporal inferior',''],
 'middle temporal gyrus':['Giro temporal medio',''],
 'occipital lobe':['Lóbulo occipital','Lobus occipitalis'],
 'internal capsule':['Cápsula interna','Capsula interna'],
 'choroid plexus of cerebral hemisphere':['Plexo coroideo del hemisferio cerebral','Plexus choroideus'],
 'tentorium cerebelli':['Tienda del cerebelo','Tentorium cerebelli'],
 'anterior commissure':['Comisura anterior','Commissura anterior'],
 'posterior commissure':['Comisura posterior','Commissura posterior'],
 'lamina terminalis':['Lámina terminal','Lamina terminalis'],
 'mammillary body':['Cuerpo mamilar','Corpus mamillare'],
 'lateral geniculate body':['Cuerpo geniculado lateral',''],
 'medial geniculate body':['Cuerpo geniculado medial',''],
 'stria terminalis':['Estría terminal','Stria terminalis'],
 'septum of telencephalon':['Tabique del telencéfalo',''],
 'habenula':['Habénula','Habenula']
};
function nombreNeuroCartilago(p,n){
 const side=n.match(/^(Left|Right)\s+/i);const root=side?n.slice(side[0].length):n;
 const lower=root.toLowerCase();
 let entry=MAPA_PARTES[lower];
 if(!entry&&p.system==='cartilage'&&/costal cartilage$/i.test(root)){
  const m=root.match(/^(first|second|third|fourth|fifth|sixth|seventh) costal cartilage$/i);
  if(m){const ord={first:'Primer',second:'Segundo',third:'Tercer',fourth:'Cuarto',fifth:'Quinto',sixth:'Sexto',seventh:'Séptimo'};entry=[`${ord[m[1].toLowerCase()]} cartílago costal`,''];}
 }
 if(!entry&&p.system==='nervous'){
  const branch=root.match(/^(Superior|Inferior) branch of (.*)$/i);
  if(branch){const inner=MAPA_PARTES[branch[2].toLowerCase()];if(inner)entry=[`Rama ${branch[1].toLowerCase()} del ${inner[0].toLowerCase()}`,''];}
  const white=root.match(/^White matter of (left|right) cerebral hemisphere$/i);
  if(white)entry=[`Sustancia blanca del hemisferio cerebral ${white[1].toLowerCase()==='left'?'izquierdo':'derecho'}`,''];
  const plex=root.match(/^Choroid plexus of cerebral hemisphere$/i);
  if(plex)entry=MAPA_PARTES['choroid plexus of cerebral hemisphere'];
 }
 if(!entry)return null;
 const femenino=/^(Amígdala|Ínsula|Cápsula|Sustancia|Comisura|Lámina|Estría|Tienda|Habénula|Rama)/i.test(entry[0]);
 const esp=side?entry[0]+(side[1].toLowerCase()==='left'?(femenino?' izquierda':' izquierdo'):(femenino?' derecha':' derecho')):entry[0];
 // Es una traducción del nombre de la malla; no equivale a validación clínica individual.
 return {espanol:esp,cientifico:entry[1],verificado:!!entry[1]};
}
export function nombreAnatomico(p){
 const n=String(p?.name||'').trim();
 if(p?.system==='cartilage'||p?.system==='nervous'){const t=nombreNeuroCartilago(p,n);if(t)return t;}
 for(const [re,es,latin] of IDENTIFICADOS)if(re.test(n))return {espanol:es,cientifico:latin,verificado:true};
 for(const [re,es,latin] of MULTILATERAL)if(re.test(n))return {espanol:es+lado(n,/^(Arteria|Vena|Glándula)/.test(es)),cientifico:latin,verificado:true};
 for(const [re,tipo] of SIMPLE)if(re.test(n)){
  if(tipo==='cartílago costal'){
   const ordinal={first:'Primer',second:'Segundo',third:'Tercer',fourth:'Cuarto',fifth:'Quinto',sixth:'Sexto',seventh:'Séptimo'};
   const parts=n.match(/^(left|right) (\w+) costal cartilage$/i);
   const ord=parts?ordinal[parts[2].toLowerCase()]||parts[2]:'';
   return {espanol:`${ord} cartílago costal${lado(n)}`,cientifico:'',verificado:false};
  }
  let root=n.replace(/^(left|right) /i,'').replace(/ (artery|vein)$/i,'').toLowerCase();
  const translated=TRADPAL.find(v=>v[0]===root)?.[1];if(translated)return {espanol:`${tipo==='arteria'?'Arteria':'Vena'} ${translated}${lado(n,true)}`,cientifico:'',verificado:false};
 }
 return {espanol:traducirNombreAnatomico(n),cientifico:'',verificado:false};
}
