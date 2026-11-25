/* Nomenclatura visible en español: los identificadores originales no se alteran.
   Esta traducción se etiqueta como orientativa, no como validación Terminologia Anatomica. */
const TERMINOS={
 'artery':'arteria','arteries':'arterias','vein':'vena','veins':'venas','nerve':'nervio','nerves':'nervios','muscle':'músculo','muscles':'músculos','bone':'hueso','bones':'huesos','cartilage':'cartílago','ligament':'ligamento','tendon':'tendón','duct':'conducto','gland':'glándula','glands':'glándulas','lobe':'lóbulo','lobes':'lóbulos','lobule':'lobulillo','ventricle':'ventrículo','atrium':'aurícula','chamber':'cámara','cavity':'cavidad','chambers':'cámaras','branch':'rama','branches':'ramas','division':'división','head':'cabeza','belly':'vientre','body':'cuerpo','neck':'cuello','wall':'pared','part':'parte','portion':'porción','segment':'segmento','segments':'segmentos','segmental':'segmentaria','surface':'superficie','layer':'capa','ring':'anillo','arch':'arco','root':'raíz','trunk':'tronco','plexus':'plexo','nucleus':'núcleo','ganglion':'ganglio','gyrus':'giro','sulcus':'surco','fissure':'fisura','sinus':'seno','foramen':'agujero','fossa':'fosa','foramina':'agujeros','capsule':'cápsula','membrane':'membrana','sheath':'vaina','septum':'tabique','fascia':'fascia','valve':'válvula','leaflet':'valva','vessel':'vaso','vessels':'vasos','tract':'tracto','canal':'canal','canaliculus':'canalículo','cortex':'corteza','nodule':'nódulo','tubercle':'tubérculo','tuberosity':'tuberosidad','process':'apófisis','notch':'escotadura','ridge':'cresta','angle':'ángulo','joint':'articulación','space':'espacio','band':'banda','fibers':'fibras','fiber':'fibra','tissue':'tejido','region':'región','area':'área','organ':'órgano',
 'left':'izquierdo','right':'derecho','upper':'superior','lower':'inferior','anterior':'anterior','posterior':'posterior','superior':'superior','inferior':'inferior','lateral':'lateral','medial':'medial','middle':'media','central':'central','inner':'interna','outer':'externa','internal':'interna','external':'externa','deep':'profunda','superficial':'superficial','common':'común','proper':'propia','proximal':'proximal','distal':'distal','transverse':'transversal','vertical':'vertical','horizontal':'horizontal','ascending':'ascendente','descending':'descendente','recurrent':'recurrente','oblique':'oblicua','long':'larga','short':'corta','major':'mayor','minor':'menor','greater':'mayor','lesser':'menor','small':'pequeña','large':'grande','first':'primera','second':'segunda','third':'tercera','fourth':'cuarta','fifth':'quinta','sixth':'sexta','seventh':'séptima','eighth':'octava','ninth':'novena','tenth':'décima','accessory':'accesoria','terminal':'terminal','intermediate':'intermedia','interventricular':'interventricular','intrahepatic':'intrahepática','intercostal':'intercostal','segmentary':'segmentaria',
 'bronchial':'bronquial','bronchus':'bronquio','bronchi':'bronquios','bronchiole':'bronquiolo','tree':'árbol','set':'conjunto','pulmonary':'pulmonar','lung':'pulmón','lungs':'pulmones','trachea':'tráquea','diaphragm':'diafragma','larynx':'laringe','pharynx':'faringe','nasal':'nasal','septal':'septal','rib':'costilla','ribs':'costillas','costal':'costal','sternum':'esternón','thoracic':'torácica','lumbar':'lumbar','cervical':'cervical','sacral':'sacra','vertebral':'vertebral','vertebra':'vértebra','vertebrae':'vértebras','spinal':'espinal','intervertebral':'intervertebral','disk':'disco','disc':'disco',
 'cerebral':'cerebral','cerebellar':'cerebelosa','brain':'encéfalo','cerebellum':'cerebelo','forebrain':'prosencéfalo','midbrain':'mesencéfalo','spinalcord':'médula espinal','optic':'óptica','ocular':'ocular','eye':'ojo','eyeball':'globo ocular','iris':'iris','retina':'retina','cornea':'córnea','choroid':'coroides','sclera':'esclerótica','lens':'cristalino','lacrimal':'lagrimal','ciliary':'ciliar','palpebrae':'párpado','orbital':'orbitaria','ophthalmic':'oftálmica','nasolacrimal':'nasolagrimal',
 'cardiac':'cardíaca','coronary':'coronaria','aorta':'aorta','aortic':'aórtica','arterial':'arterial','venous':'venosa','portal':'porta','caval':'cava','hepatic':'hepática','hepatovenous':'hepática venosa','gastric':'gástrica','renal':'renal','kidney':'riñón','ureter':'uréter','urinary':'urinaria','bladder':'vejiga','spleen':'bazo','splenic':'esplénica','liver':'hígado','stomach':'estómago','intestine':'intestino','intestines':'intestinos','smallintestine':'intestino delgado','colon':'colon','colic':'cólica','duodenum':'duodeno','jejunum':'yeyuno','ileum':'íleon','biliary':'biliar','pancreatic':'pancreática','appendix':'apéndice','rectum':'recto','esophagus':'esófago','gallbladder':'vesícula biliar',
 'femoral':'femoral','femur':'fémur','tibial':'tibial','fibular':'fibular','humeral':'humeral','brachial':'braquial','radial':'radial','ulnar':'cubital','iliac':'ilíaca','carotid':'carótida','jugular':'yugular','subclavian':'subclavia','axillary':'axilar','popliteal':'poplítea','saphenous':'safena','digital':'digital','interosseous':'interósea','plantar':'plantar','palmar':'palmar','dorsal':'dorsal','occipital':'occipital','temporal':'temporal','frontal':'frontal','parietal':'parietal','scapular':'escapular','acromial':'acromial','tibiofibular':'tibioperonea','fibula':'peroné','radius':'radio','ulna':'cúbito','humerus':'húmero','scapula':'escápula','pelvis':'pelvis','mandible':'mandíbula','maxilla':'maxilar','skull':'cráneo',
 'foot':'pie','feet':'pies','hand':'mano','finger':'dedo de la mano','fingers':'dedos de la mano','toe':'dedo del pie','toes':'dedos del pie','thumb':'pulgar','index':'índice','little':'meñique','phalanx':'falange','phalanges':'falanges','metacarpal':'metacarpiana','metatarsal':'metatarsiana','carpal':'carpiana','tarsal':'tarsiana',
 'flexor':'flexor','extensor':'extensor','adductor':'aductor','abductor':'abductor','levator':'elevador','depressor':'depresor','rotator':'rotador','rectus':'recto','oblique':'oblicuo','gastrocnemius':'gastrocnemio','soleus':'sóleo','biceps':'bíceps','triceps':'tríceps','deltoid':'deltoides','pectoralis':'pectoral','gluteus':'glúteo','quadriceps':'cuádriceps','lumbrical':'lumbrical','serratus':'serrato','trapezius':'trapecio','longus':'largo','brevis':'corto','digitorum':'de los dedos','pollicis':'del pulgar','hallucis':'del dedo gordo','digiti':'del dedo','minimi':'meñique','brachii':'braquial','femoris':'femoral','capitis':'de la cabeza','cervicis':'del cuello','thoracis':'del tórax','radialis':'radial','carpi':'del carpo','intermedius':'intermedio','maximus':'máximo','minimus':'mínimo','vastus':'vasto','psoas':'psoas','majoris':'mayor','minoris':'menor',
 'gingiva':'encía','jaw':'mandíbula','tooth':'diente','teeth':'dientes','incisor':'incisivo','molar':'molar','premolar':'premolar','canine':'canino','secondary':'permanente','central':'central','circumflex':'circunfleja','marginal':'marginal','perforating':'perforante','genicular':'genicular','phrenic':'frénica','cephalic':'cefálica','basilic':'basílica','lingular':'lingular','apical':'apical','basal':'basal','dorsalis':'dorsal','tubular':'tubular','atrial':'auricular','ventricular':'ventricular','interlobar':'interlobar','subsegmental':'subsegmentaria',
 'communicating':'comunicante','tributary':'afluente','tendinous':'tendinoso','main':'principal','penis':'pene','nasociliary':'nasociliar','oculomotor':'oculomotor','subcostal':'subcostal','musculophrenic':'musculofrénica','phrenic':'frénica','ciliary':'ciliar','choroidal':'coroidea','choroid':'coroides','ethmoidal':'etmoidal','insular':'insular','caudate':'caudado','hemiazygos':'hemiácigos','zygos':'ácigos','cavernous':'cavernosa','posterolateral':'posterolateral','anterolateral':'anterolateral','glans':'glande','labial':'labial','appendicular':'apendicular','lingual':'lingual','tongue':'lengua','epiglottis':'epiglotis','eyebrow':'ceja','skin':'piel','lip':'labio','pubic':'púbico','hair':'vello','urethra':'uretra','iliac':'ilíaca','ileocecal':'ileocecal','junction':'unión','pharyngeal':'faríngea','raphe':'rafe','abdominal':'abdominal','vena':'vena','cava':'cava','posterior':'posterior',
 'of':'de','the':'','and':'y','with':'con','to':'a','from':'desde','between':'entre','at':'en','or':'o','in':'en','for':'para','by':'por',
};
const GENERO_FEM=new Set(['artery','vein','gland','branch','division','cavity','surface','layer','membrane','capsule','fascia','valve','phalanx','vertebra','gingiva','cornea','retina','scapula','choroid','fascia']);
const CABEZAS={
 'bronchial tree':['árbol bronquial',false], 'artery':['arteria',true], 'arteries':['arterias',true],
 'vein':['vena',true], 'veins':['venas',true],'nerve':['nervio',false], 'branch':['rama',true],
 'part':['parte',true], 'tributary':['tributaria',true], 'tree':['árbol',false], 'head':['cabeza',true],
 'tooth':['diente',false], 'bone':['hueso',false], 'phalanx':['falange',true],
 'set':['conjunto',false], 'bronchus':['bronquio',false], 'trunk':['tronco',false],
 'cartilage':['cartílago',false], 'gyrus':['giro',false], 'rib':['costilla',true], 'disk':['disco',false],
 'vertebra':['vértebra',true], 'arch':['arco',false], 'ligament':['ligamento',false],
 'division':['división',true], 'muscle':['músculo',false], 'duct':['conducto',false],
 'gland':['glándula',true], 'lobe':['lóbulo',false], 'leaflet':['valva',true],
 'chamber':['cámara',true], 'ganglion':['ganglio',false], 'ring':['anillo',false],
 'ventricle':['ventrículo',false], 'cavity':['cavidad',true], 'surface':['superficie',true],
 'sulcus':['surco',false], 'segment':['segmento',false], 'body':['cuerpo',false],
 'tendon':['tendón',false], 'valve':['válvula',true], 'wall':['pared',true],
 'membrane':['membrana',true], 'plate':['placa',true], 'tract':['tracto',false],
 'gastrocnemius':['gastrocnemio',false]
};
function capitalizar(s){return s? s[0].toLocaleUpperCase('es')+s.slice(1):s;}
function lado(v,femenino=false){return v.toLowerCase()==='left'?(femenino?'izquierda':'izquierdo'):(femenino?'derecha':'derecho');}
function simple(n){return String(n).split(/\s+/).filter(Boolean).map(t=>TERMINOS[t.toLowerCase()]||t.toLowerCase()).filter(Boolean).join(' ').replace(/\bde el\b/g,'del').replace(/\s+/g,' ').trim();}
function ajustar(adjetivos,femenino=false){
 const t=String(adjetivos).split(/\s+/).filter(Boolean);
 // El núcleo se especifica primero (arteria cerebral anterior, rama temporal superior).
 const pos=new Set(['anterior','posterior','superior','inferior','middle','medial','lateral','proximal','distal','deep','superficial','internal','external','first','second','third','fourth','fifth','sixth','seventh']);
 const principal=t.filter(x=>!pos.has(x.toLowerCase()));const posiciones=t.filter(x=>pos.has(x.toLowerCase()));
 let tokens=[...principal,...posiciones].map(x=>TERMINOS[x.toLowerCase()]||x.toLowerCase());
 if(femenino)tokens=tokens.map(v=>({'medio':'media','profunda':'profunda','propia':'propia','interna':'interna','externa':'externa','corto':'corta','largo':'larga','izquierdo':'izquierda','derecho':'derecha','recto':'recta','oblicuo':'oblicua'}[v]||v));
 return tokens.join(' ');
}
function frase(entrada){
 const n=entrada.trim();if(!n)return '';
 const m=n.match(/^(.*?)\s+of\s+((?:the\s+)?(?:left\s+|right\s+)?.+)$/i);
 if(m){
  const a=frase(m[1]),b=frase(m[2]);
  return `${a} ${/^(el|la|los|las)\b/i.test(b)?'de':'de'} ${b}`.replace(/\bde el\b/gi,'del').replace(/\bde la el\b/gi,'del');
 }
 const lm=n.match(/^(left|right)\s+(.+)$/i);
 if(lm){const z=frase(lm[2]);const palabra=lm[2].split(/\s+/).at(-1).toLowerCase();const fem=Boolean(CABEZAS[palabra]?.[1])||GENERO_FEM.has(palabra)||/^(cornea|retina|iris|gingiva|scapula|phalanx|vertebra|vein|artery)/i.test(lm[2]);return `${z} ${lado(lm[1],fem)}`;}
 const key=Object.keys(CABEZAS).sort((a,b)=>b.length-a.length).find(k=>n.toLowerCase()===k||n.toLowerCase().endsWith(' '+k));
 if(key){const [cabeza,fem]=CABEZAS[key];const mods=n.slice(0,n.length-key.length).trim();return mods?`${cabeza} ${ajustar(mods,fem)}`:cabeza;}
 return simple(n);
}
/** Traduce etiquetas, sin modificar el nombre de origen; devuelve traducción orientativa. */
export function traducirNombreAnatomico(nombre){
 if(/^external ear$/i.test(String(nombre).trim()))return "Oído externo";
 const n=String(nombre||'').trim();if(!n)return '';
 let m=n.match(/^(Medial|Lateral) head of (right|left) gastrocnemius$/i);
 if(m)return `Cabeza ${m[1].toLowerCase()} del gastrocnemio ${lado(m[2])}`;
 m=n.match(/^(left|right) (upper|lower) (first|second) secondary (molar|premolar) tooth$/i);
 if(m)return `${m[3].toLowerCase()==='first'?'Primer':'Segundo'} ${m[4].toLowerCase()} permanente ${m[2].toLowerCase()==='upper'?'superior':'inferior'} ${lado(m[1])}`;
 m=n.match(/^(left|right) (upper|lower) (central|lateral) secondary incisor tooth$/i);
 if(m)return `Incisivo permanente ${m[3].toLowerCase()} ${m[2].toLowerCase()==='upper'?'superior':'inferior'} ${lado(m[1])}`;
 m=n.match(/^(left|right) (upper|lower) secondary canine tooth$/i);
 if(m)return `Canino permanente ${m[2].toLowerCase()==='upper'?'superior':'inferior'} ${lado(m[1])}`;
 m=n.match(/^gingiva of (upper|lower) jaw$/i);
 if(m)return `Encía del maxilar ${m[1].toLowerCase()==='upper'?'superior':'inferior'}`;
 m=n.match(/^(left|right) (inferior|superior|medial|lateral) (rectus|oblique)$/i);
 if(m)return `${m[3].toLowerCase()==='rectus'?'Recto':'Oblicuo'} ${m[2].toLowerCase()} ${lado(m[1])}`;
 const result=frase(n).replace(/\bde superior mandíbula\b/g,'del maxilar superior').replace(/\bde inferior mandíbula\b/g,'del maxilar inferior');
 return capitalizar(result);
}
