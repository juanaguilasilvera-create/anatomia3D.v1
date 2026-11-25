/**
 * fuente única de narración anatómica en español.
 * Contenido fisiológico educativo independiente de las mallas del visor.
 * Las fichas individuales se priorizan; no se deducen funciones exclusivas de una
 * pieza a partir de su proximidad ni se presentan generalizaciones como diagnóstico.
 * Referencia principal: OpenStax Anatomy & Physiology 2e, CC BY 4.0.
 * https://openstax.org/details/books/anatomy-and-physiology-2e
 */
import {GUIAS} from './anatomia.js';
import {fichaComponente} from './fichasComponentes.js';
import {fichaAnatomicaIdentificada} from './fichasVerificadas.js';
import {respuestaTutorTema} from './conocimientoTutor.js';

const DATOS_SISTEMA = {
 whole: 'El cuerpo humano funciona gracias a la cooperación de sus sistemas. El sistema nervioso y el endocrino coordinan respuestas; el respiratorio obtiene oxígeno y elimina dióxido de carbono; el cardiovascular distribuye sustancias; el digestivo incorpora nutrientes; el urinario regula líquidos y elimina desechos; el musculoesquelético sostiene y mueve el cuerpo. Cada órgano puede contener distintos tejidos que colaboran para cumplir una función.',
 cartilage: 'El cartílago contiene células llamadas condrocitos y una matriz extracelular resistente. Su composición varía entre cartílago hialino, elástico y fibrocartílago. No tiene irrigación sanguínea directa en su interior, por lo que su reparación suele ser limitada. El cartílago articular facilita el movimiento de las superficies óseas; otras variedades contribuyen a mantener la forma de la nariz, oreja y vías respiratorias.',
 circulatory: 'El corazón impulsa la sangre por dos circuitos. En el pulmonar, la sangre llega a los pulmones para intercambiar gases; en el sistémico, distribuye oxígeno y nutrientes a los tejidos. Las arterias se ramifican en arteriolas y capilares, donde se intercambian sustancias. Las venas recogen el retorno hacia el corazón. La sangre también transporta células de defensa, hormonas y sustancias de desecho.',
 skeletal: 'El esqueleto se divide en axial, que incluye cráneo, columna y caja torácica, y apendicular, que comprende miembros y sus cinturas. El tejido óseo se remodela constantemente mediante células que forman y reabsorben matriz. Las articulaciones conectan huesos y permiten distintos grados de movimiento; los cartílagos amortiguan las superficies de contacto. La médula ósea roja participa en la producción de células sanguíneas.',
 muscular: 'El músculo esquelético está formado por fibras con proteínas contráctiles, principalmente actina y miosina. Un impulso de la neurona motora desencadena la contracción, que puede transmitirse a los huesos mediante tendones. Los músculos actúan en grupos: unos producen el movimiento y otros estabilizan o realizan la acción contraria. También existen músculo cardíaco y músculo liso, con funciones diferentes a las del músculo esquelético.',
 cardiac: 'El corazón tiene dos aurículas que reciben sangre y dos ventrículos que la impulsan. La válvula tricúspide comunica aurícula y ventrículo derechos; la mitral comunica las cavidades izquierdas. Las válvulas pulmonar y aórtica regulan la salida hacia sus respectivas arterias. El sistema de conducción eléctrica coordina el latido y el músculo cardíaco transforma esa señal en contracción mecánica.',
 arterial: 'La pared de las arterias grandes contiene capas de tejido elástico y músculo liso capaces de soportar variaciones de presión. Las arterias medianas distribuyen sangre hacia regiones corporales y las arteriolas modulan la resistencia vascular antes de los capilares. La dirección del flujo, desde el corazón hacia los tejidos o hacia los pulmones, define a una arteria; no es correcto clasificarlas únicamente por el contenido de oxígeno.',
 venous: 'La sangre procedente de capilares pasa a vénulas y venas. La presión venosa suele ser menor que la arterial, y el retorno desde las extremidades se beneficia de la contracción muscular y, en determinadas venas, de las válvulas. Las venas cavas llegan a la aurícula derecha; las venas pulmonares llevan sangre oxigenada a la aurícula izquierda. Las venas también actúan como reservorio sanguíneo.',
 nervous: 'El sistema nervioso central incluye encéfalo y médula espinal. El sistema periférico está formado por nervios y ganglios que llevan información sensitiva hacia centros de integración y órdenes motoras hacia los efectores. Las neuronas transmiten señales eléctricas y químicas, mientras que las células gliales contribuyen a su soporte. La actividad nerviosa participa en percepción, pensamiento, postura, movimiento y regulación automática de órganos.',
 respiratory: 'El recorrido del aire comienza en la nariz o la boca, continúa por faringe y laringe, desciende por la tráquea y llega a los bronquios. Estos se ramifican en conductos cada vez menores, hasta bronquiolos y regiones alveolares. En los alvéolos, el oxígeno atraviesa una barrera muy delgada hacia los capilares y el dióxido de carbono pasa de la sangre al aire para ser espirado. El pulmón derecho suele tener tres lóbulos y el izquierdo dos, con espacio para el corazón. El diafragma es el músculo principal de la inspiración: al contraerse, aumenta el volumen torácico y entra aire. La pleura facilita el deslizamiento de los pulmones durante la respiración.',
 digestive: 'La digestión comienza en la boca mediante masticación y saliva. El esófago conduce el bolo al estómago, donde se mezcla con secreciones y se transforma en quimo. En el intestino delgado actúan enzimas pancreáticas y bilis; allí se absorbe gran parte de los nutrientes. El intestino grueso recupera agua y forma las heces. El hígado procesa nutrientes y produce bilis, y el páncreas también libera hormonas que regulan la glucosa.',
 urinary: 'Cada riñón contiene unidades llamadas nefronas que filtran plasma y ajustan la cantidad de agua, sales y otras sustancias que se eliminan. Mediante reabsorción y secreción tubular se forma la orina definitiva. Esta pasa por los uréteres a la vejiga y sale por la uretra durante la micción. Los riñones también participan en la regulación de la presión arterial, el equilibrio ácido-base y la producción de eritropoyetina.',
 reproductive: 'El sistema reproductor comprende órganos que producen células reproductivas y hormonas sexuales, así como estructuras que intervienen en la fecundación y, en el aparato reproductor femenino, la gestación. Los ovarios producen ovocitos y hormonas; las trompas uterinas conducen el ovocito hacia el útero. Los testículos producen espermatozoides, que maduran en el epidídimo y son transportados por vías espermáticas. La anatomía representada en el visor puede variar con el modelo seleccionado.',
 lymphatic: 'El sistema linfático devuelve parte del líquido intersticial a la circulación, transporta grasas absorbidas en el intestino y participa en la vigilancia inmunitaria. Los vasos linfáticos conducen linfa y los ganglios contienen células inmunitarias que examinan su contenido. El bazo filtra sangre y el timo participa en la maduración de linfocitos T. El sistema linfático colabora estrechamente con la circulación sanguínea.',
 endocrine: 'Las glándulas endocrinas liberan hormonas a la sangre para coordinar funciones en tejidos distantes. La hipófisis participa en el control de otras glándulas y en el crecimiento; la tiroides regula aspectos del metabolismo; las suprarrenales producen hormonas relacionadas con el estrés y el equilibrio de sales. El páncreas endocrino regula glucosa sanguínea y las gónadas participan en la regulación reproductiva.',
 sensory: 'Los órganos sensoriales transforman estímulos físicos y químicos en señales nerviosas. En el ojo, la córnea y el cristalino enfocan la luz sobre la retina, cuyos fotorreceptores originan señales que recorren el nervio óptico. En el oído, estructuras especializadas convierten vibraciones en información auditiva y participan en el equilibrio. Receptores de piel, olfato y gusto proporcionan otras modalidades de percepción. La integración final depende del sistema nervioso.',
 connective: 'El tejido conectivo da soporte, une y protege estructuras. Los tendones transmiten la fuerza de los músculos a los huesos y los ligamentos contribuyen a la estabilidad de las articulaciones. Otros tejidos conectivos rodean nervios, vasos y órganos. Su resistencia y elasticidad dependen de la organización de fibras de colágeno y otros componentes de su matriz.',
 integumentary: 'La piel posee epidermis, dermis y tejido subcutáneo asociado. La epidermis ayuda a formar una barrera frente al medio; la dermis aporta resistencia, irrigación y sensibilidad. Glándulas sudoríparas y vasos cutáneos participan en la regulación térmica, mientras que receptores especializados detectan presión, temperatura y dolor. Cabello y uñas son estructuras anexas con funciones protectoras.'
};

// Complementos dirigidos por el nombre ORIGINAL de las estructuras del archivo 3D.
// Se usan únicamente en coincidencias anatómicas inequívocas, no por proximidad.
const DETALLES_ESPECIFICOS = [
 [/(?:suspensory ligament of .* lens|zonule|zonula ciliaris)/i, 'Fibras zonulares', 'Fibras que sostienen el cristalino y lo conectan con la región del cuerpo ciliar.', 'En torno al borde del cristalino.', 'Transmiten la tensión de los tejidos ciliares y participan en los cambios de forma del cristalino durante la acomodación.', 'Se relacionan con el cristalino y el músculo ciliar.'],
 [/(?:leaflet of (?:mitral|tricuspid) valve|cusp of (?:aortic|pulmonary) valve)/i, 'Valva cardíaca', 'Una de las partes móviles de una válvula del corazón.', 'En el orificio valvular al que pertenece.', 'Colabora con las otras valvas para evitar el retroceso de sangre durante el ciclo cardíaco.', 'No es toda la válvula; las valvas trabajan como conjunto.'],
 [/(?:choroid plexus|plexo coroideo)/i, 'Plexo coroideo', 'Tejido vascular especializado localizado dentro de los ventrículos encefálicos.', 'En regiones del sistema ventricular del encéfalo.', 'Participa en la producción de líquido cefalorraquídeo.', 'Se relaciona con epéndimo y cavidades ventriculares del encéfalo.'],
 [/(?:anterior chamber of .* eyeball|camara anterior del ojo)/i, 'Cámara anterior del ojo', 'Espacio lleno de humor acuoso en la parte delantera del globo ocular.', 'Entre córnea e iris.', 'Permite la circulación del humor acuoso y contribuye al mantenimiento de la presión intraocular.', 'Se comunica con otras estructuras del segmento anterior del ojo.'],
 [/(?:vitreous body|humor vitreo|cuerpo vitreo)/i, 'Cuerpo vítreo', 'Sustancia transparente y gelatinosa que llena gran parte del globo ocular.', 'Detrás del cristalino y por delante de la retina.', 'Ayuda a conservar la forma del ojo y permite el paso de luz hacia la retina.', 'Se encuentra en contacto con la superficie interna retiniana.'],
 [/(?:sclera|esclerotica)/i, 'Esclerótica', 'Cubierta externa resistente y blanquecina del ojo.', 'Rodea la mayor parte del globo ocular.', 'Protege estructuras internas y aporta soporte para la inserción de músculos oculares.', 'Se continúa anteriormente con la córnea.'],
 [/(?:choroid|coroides)/i, 'Coroides', 'Capa vascular pigmentada del ojo.', 'Entre retina y esclerótica.', 'Nutre capas externas de la retina y ayuda a absorber luz dispersa.', 'Forma parte de la úvea junto al iris y al cuerpo ciliar.'],
 [/(?:lacrimal gland|glandula lagrimal)/i, 'Glándula lagrimal', 'Glándula exocrina que produce la parte acuosa de la película lagrimal.', 'Región superior y externa de la órbita.', 'Humedece la superficie ocular y ayuda a proteger córnea y conjuntiva.', 'La lágrima llega al aparato de drenaje lagrimal.'],
 [/(?:nasolacrimal duct|conducto nasolagrimal)/i, 'Conducto nasolagrimal', 'Conducto de drenaje de lágrimas hacia la cavidad nasal.', 'Desde saco lagrimal hacia meato nasal inferior.', 'Transporta lágrimas que drenan desde la superficie del ojo.', 'Se relaciona con saco lagrimal y cornete nasal inferior.'],
 [/(?:lacrimal sac|saco lagrimal)/i, 'Saco lagrimal', 'Reservorio corto del sistema de drenaje lagrimal.', 'En el ángulo interno del ojo.', 'Recibe lágrimas desde los canalículos y las dirige hacia el conducto nasolagrimal.', 'Forma parte de la vía de evacuación lagrimal.'],
 [/(?:lacrimal canaliculus|canaliculo lagrimal)/i, 'Canalículo lagrimal', 'Conducto pequeño que recoge lágrimas de los puntos lagrimales.', 'Borde medial de los párpados.', 'Permite el drenaje hacia el saco lagrimal.', 'Se relaciona con los puntos lagrimales y el saco lagrimal.'],
 [/(?:tarsal plate|tarso palpebral)/i, 'Placa tarsal', 'Lámina de tejido conectivo denso del párpado.', 'Dentro de los párpados superior o inferior.', 'Aporta consistencia y forma al párpado.', 'Se relaciona con glándulas tarsales y borde palpebral.'],
 [/(?:external ear|oido externo)/i, 'Oído externo', 'Parte del oído formada por pabellón auricular y conducto auditivo externo.', 'A ambos lados de la cabeza.', 'Capta y dirige ondas sonoras hacia la membrana timpánica.', 'Se continúa con las estructuras del oído medio.'],
 [/(?:segmental bronchial tree|bronchial tree)/i, 'Ramas bronquiales segmentarias', 'Estas ramificaciones forman parte del árbol bronquial que distribuye aire dentro de los segmentos del pulmón.', 'En el pulmón correspondiente, dentro del territorio broncopulmonar indicado por su nombre.', 'Conducen aire hacia ramas menores que terminarán en la región respiratoria; el intercambio gaseoso ocurre principalmente en los alvéolos, no en estas ramas de conducción.', 'Los bronquios segmentarios se distribuyen por segmentos broncopulmonares y se acompañan de vasos pulmonares.'],
 [/(?:main bronchus|bronquio principal)/i, 'Bronquio principal', 'Es una de las dos ramas en que se divide la tráquea.', 'Entra al pulmón derecho o izquierdo por su hilio.', 'Conduce aire hacia bronquios lobares y segmentarios. Sus paredes contienen cartílago y epitelio de limpieza mucociliar.', 'El bronquio derecho suele ser más corto, ancho y vertical que el izquierdo.'],
 [/(?:bronchiole|bronquiolo)/i, 'Bronquiolo', 'Conducto aéreo pequeño sin anillos de cartílago en su pared.', 'Dentro del árbol respiratorio pulmonar.', 'Conduce y regula el flujo de aire; los bronquiolos respiratorios ya se asocian a la región de intercambio gaseoso.', 'Sus paredes contienen músculo liso y se continúan con vías aéreas cada vez menores.'],
 [/(?:alveol|alveol)/i, 'Alvéolo pulmonar', 'Pequeño saco de pared delgada donde se realiza la mayor parte del intercambio de gases.', 'En la región respiratoria del pulmón.', 'Permite el paso de oxígeno hacia la sangre capilar y de dióxido de carbono en sentido contrario.', 'Está rodeado por capilares; los neumocitos tipo dos producen surfactante, que ayuda a impedir el colapso alveolar.'],
 [/(?:trachea|traquea)/i, 'Tráquea', 'Tubo de conducción aérea sostenido por cartílagos en forma de C.', 'Desde la laringe hacia su bifurcación en los bronquios principales.', 'Transporta aire inspirado y espirado; el moco y los cilios contribuyen a retirar partículas.', 'Se localiza delante del esófago y termina en la carina traqueal.'],
 [/(?:epiglottis|epiglotis)/i, 'Epiglotis', 'Cartílago elástico recubierto de mucosa situado en la entrada de la laringe.', 'Región superior de la laringe, detrás de la base de la lengua.', 'Contribuye, junto con otros movimientos laríngeos, a proteger la vía aérea durante la deglución.', 'Se relaciona con faringe, lengua y entrada laríngea.'],
 [/(?:pharyngeal constrictor|constrictor de la faringe)/i, 'Músculo constrictor faríngeo', 'Músculo de la pared faríngea que participa en la fase faríngea de la deglución.', 'Pared lateral y posterior de la faringe.', 'Se contrae de manera coordinada para desplazar el bolo alimenticio hacia el esófago.', 'Los constrictores superior, medio e inferior actúan en secuencia durante la deglución.'],
 [/(?:palatopharyngeus|palatofaringeo)/i, 'Palatofaríngeo', 'Músculo relacionado con paladar blando y pared lateral de la faringe.', 'Entre el paladar blando y la región faríngea.', 'Participa en el movimiento de faringe y paladar durante deglución y fonación.', 'Se relaciona con la elevación y estrechamiento de la faringe.'],
 [/(?:salpingopharyngeus|salpingofaringeo)/i, 'Salpingofaríngeo', 'Pequeño músculo que desciende desde la región de la trompa auditiva.', 'Pared lateral de la nasofaringe.', 'Contribuye a elevar la pared faríngea durante la deglución.', 'Se integra con músculos longitudinales de la faringe.'],
 [/(?:stylopharyngeus|estilofaringeo)/i, 'Estilofaríngeo', 'Músculo longitudinal de la faringe que nace de la apófisis estiloides.', 'Desde la región temporal hacia la pared faríngea.', 'Eleva la faringe durante la deglución.', 'Recibe inervación motora del nervio glosofaríngeo.'],
 [/(?:inferior nasal concha|cornete nasal inferior)/i, 'Cornete nasal inferior', 'Lámina ósea curvada que sobresale de la pared lateral de la cavidad nasal.', 'Dentro de la cavidad nasal, por debajo del cornete medio.', 'Aumenta la superficie de la mucosa para calentar, humedecer y filtrar el aire.', 'Debajo se sitúa el meato nasal inferior, donde desemboca el conducto nasolagrimal.'],
 [/(?:lateral nasal cartilage|cartilago nasal lateral)/i, 'Cartílago nasal lateral', 'Cartílago que participa en la estructura de la parte externa de la nariz.', 'Región lateral del dorso nasal.', 'Ayuda a mantener la forma y permeabilidad de la entrada nasal.', 'Se relaciona con los huesos nasales y otros cartílagos de la nariz.'],
 [/(?:septal nasal cartilage|cartilago del tabique nasal)/i, 'Cartílago del tabique nasal', 'Porción cartilaginosa del tabique que divide las fosas nasales.', 'Zona anterior del tabique nasal.', 'Contribuye al soporte de la nariz y separa las vías de entrada de aire derecha e izquierda.', 'Se continúa con componentes óseos del tabique.'],
 [/(?:larynx|laringe)/i, 'Laringe', 'Órgano situado entre faringe y tráquea que contiene las cuerdas vocales.', 'Parte anterior del cuello.', 'Permite el paso de aire, participa en la fonación y protege la vía respiratoria al tragar.', 'Incluye cartílagos tiroides, cricoides, aritenoides y otros componentes.'],
 [/(?:diaphragm|diafragma)/i, 'Diafragma', 'Músculo ancho con forma de cúpula que separa las cavidades torácica y abdominal.', 'Base del tórax, por debajo de los pulmones.', 'Es el músculo principal de la inspiración: al contraerse desciende y aumenta el volumen torácico.', 'Se relaciona con pulmones, pleura, corazón, hígado y estómago.'],
 [/(?:pleura|pleura)/i, 'Pleura', 'Membrana serosa de dos hojas que recubre los pulmones y la pared torácica interna.', 'En torno a cada pulmón.', 'Facilita el deslizamiento de los pulmones respecto a la pared torácica durante la respiración.', 'Entre las hojas existe una fina película de líquido pleural.'],
 [/(?:lung|pulmon)/i, 'Pulmón', 'Órgano respiratorio esponjoso que contiene las vías aéreas y la región de intercambio gaseoso.', 'Dentro de la cavidad torácica a ambos lados del mediastino.', 'Permite oxigenar la sangre pulmonar y eliminar dióxido de carbono mediante los alvéolos.', 'El pulmón derecho tiene normalmente tres lóbulos y el izquierdo dos.'],
 [/(?:pulmonary valve|valvula pulmonar)/i, 'Válvula pulmonar', 'Válvula semilunar situada en la salida del ventrículo derecho.', 'Entre ventrículo derecho y tronco pulmonar.', 'Reduce el retroceso de sangre desde el tronco pulmonar durante la relajación ventricular.', 'Tiene tres valvas o cúspides.'],
 [/(?:mitral valve|valvula mitral)/i, 'Válvula mitral', 'Válvula auriculoventricular izquierda.', 'Entre aurícula izquierda y ventrículo izquierdo.', 'Favorece el flujo hacia el ventrículo y evita el reflujo a la aurícula durante la contracción.', 'Sus valvas se vinculan con cuerdas tendinosas y músculos papilares.'],
 [/(?:tricuspid valve|valvula tricuspide)/i, 'Válvula tricúspide', 'Válvula auriculoventricular derecha.', 'Entre aurícula derecha y ventrículo derecho.', 'Evita el reflujo hacia la aurícula derecha durante la contracción ventricular.', 'Generalmente presenta tres valvas sostenidas por cuerdas tendinosas.'],
 [/(?:aortic valve|valvula aortica)/i, 'Válvula aórtica', 'Válvula semilunar situada a la salida del ventrículo izquierdo.', 'Entre ventrículo izquierdo y aorta.', 'Reduce el retorno de sangre de la aorta al ventrículo durante la relajación cardíaca.', 'Presenta tres cúspides semilunares.'],
 [/(?:lateral ventricle|third ventricle|fourth ventricle|ventriculo cerebral)/i, 'Ventrículo encefálico', 'Cavidad del encéfalo que contiene líquido cefalorraquídeo.', 'Dentro del sistema ventricular del encéfalo.', 'Interviene en la circulación del líquido cefalorraquídeo, que amortigua y protege el sistema nervioso central.', 'No debe confundirse con los ventrículos del corazón.'],
 [/(?:optic nerve|nervio optico)/i, 'Nervio óptico', 'Conjunto de axones de células ganglionares de la retina.', 'Desde la retina hacia el quiasma óptico.', 'Transporta información visual hacia centros encefálicos.', 'La señal viaja desde fotorreceptores retinianos a otras neuronas y luego al nervio óptico.'],
 [/(?:cornea|cornea)/i, 'Córnea', 'Capa transparente anterior del globo ocular.', 'Superficie anterior del ojo.', 'Aporta gran parte de la refracción necesaria para enfocar la luz y ayuda a proteger el ojo.', 'Es avascular y se continúa en el borde con la esclerótica.'],
 [/(?:retina|retina)/i, 'Retina', 'Tejido nervioso que recubre la parte posterior interna del ojo.', 'Pared posterior del globo ocular.', 'Sus fotorreceptores convierten luz en señales que se procesan y transmiten al sistema nervioso.', 'Contiene bastones, conos y varias capas neuronales.'],
 [/(?:iris|iris)/i, 'Iris', 'Anillo pigmentado situado delante del cristalino.', 'Parte anterior del ojo alrededor de la pupila.', 'Modifica el diámetro pupilar para regular la entrada de luz.', 'Posee músculos esfínter y dilatador de la pupila.'],
 [/(?:lens|cristalino)/i, 'Cristalino', 'Lente transparente y elástica suspendida detrás del iris.', 'En el interior del ojo entre iris y humor vítreo.', 'Cambia de curvatura durante la acomodación visual para enfocar objetos a distintas distancias.', 'Se vincula con fibras zonulares y el cuerpo ciliar.'],
 [/(?:cochlea|coclea)/i, 'Cóclea', 'Estructura espiral del oído interno.', 'Dentro del hueso temporal.', 'Convierte vibraciones mecánicas en señales nerviosas de audición.', 'Contiene órganos sensoriales especializados en un sistema de conductos con líquido.'],
 [/(?:spleen|bazo)/i, 'Bazo', 'Órgano linfoide que examina la sangre y participa en la respuesta inmunitaria.', 'Parte superior izquierda del abdomen.', 'Retira células sanguíneas envejecidas y participa en defensa inmunitaria.', 'Tiene pulpa roja y pulpa blanca.'],
 [/(?:thymus|timo)/i, 'Timo', 'Órgano linfoide especialmente activo durante la infancia.', 'Mediastino anterior.', 'Participa en la maduración y selección de linfocitos T.', 'Posee lóbulos y lobulillos con corteza y médula.']
];

function normalizar(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function limpio(texto){return String(texto||'').replace(/\s+/g,' ').replace(/\s*→\s*/g,'; luego hacia ').trim();}
function campoClinico(texto,sistema){
 const valor=limpio(texto);
 if(!/\b(malla|mallas|triangulo|triangulos|geometria|modelo tridimensional)\b/i.test(normalizar(valor)))return valor;
 const alternativas={
  nervous:'Estructura de tejido nervioso que participa en la transmisión y procesamiento de señales.',
  arterial:'Vaso sanguíneo que conduce sangre desde el corazón hacia distintos territorios del cuerpo.',
  venous:'Vaso sanguíneo que recoge sangre de los tejidos y contribuye al retorno hacia el corazón.',
  respiratory:'Parte de las vías respiratorias que participa en la conducción del aire o el funcionamiento de la respiración.',
  skeletal:'Estructura de soporte que se relaciona con la protección y el movimiento corporal.',
  muscular:'Tejido contráctil que contribuye al movimiento o la estabilización de regiones corporales.',
  cardiac:'Parte del corazón que interviene en el ciclo de bombeo sanguíneo.',
  sensory:'Estructura relacionada con la recepción o conducción de información sensorial.',
  digestive:'Estructura que participa en alguno de los procesos de digestión o transporte de nutrientes.',
  urinary:'Estructura relacionada con la formación, transporte, almacenamiento o eliminación de orina.',
  reproductive:'Estructura relacionada con las funciones del sistema reproductor.',
  endocrine:'Estructura relacionada con la producción o regulación de señales hormonales.',
  lymphatic:'Estructura relacionada con el sistema linfático y la inmunidad.',
  integumentary:'Parte de la cubierta corporal que contribuye a protección y sensibilidad.',
  connective:'Estructura de tejido conectivo con funciones de unión, sostén o resistencia.'
 };
 return alternativas[sistema]||'';
}
function resumenDeSistema(texto){
 return limpio(String(texto||'').replace(/, que no siempre se distinguen en estas mallas macrosc[oó]picas/gi,'').split(/(?<=\.)\s+/).filter(frase=>!/\b(malla|mallas|modelo 3d|modelo local)\b/i.test(frase)).join(' '));
}
function distinto(a,b){return normalizar(a)!==normalizar(b);}
function componer(nombre,campos){
 const segmentos=[nombre];
 for(const [titulo,texto] of campos){if(texto&&limpio(texto))segmentos.push(`${titulo}. ${limpio(texto)}`);}
 return limpio(segmentos.join('. ').replace(/\.\./g,'.'));
}
export function narracionSistema(id){
 const g=GUIAS[id]||GUIAS.whole;
 const detalles=DATOS_SISTEMA[id]||DATOS_SISTEMA.whole;
 return componer(g.titulo,[
  ['Qué es y para qué sirve',resumenDeSistema(g.resumen)],
  ['Funciones principales',(g.funciones||[]).join(' ')],
  ['Estructuras y funcionamiento',detalles],
  ['Recorrido fisiológico',resumenDeSistema(g.recorrido)],
  ['Relaciones con otras estructuras',g.relaciones]
 ]);
}
export function detallePorNombre(nombre){
 const n=String(nombre||'');
 const fila=DETALLES_ESPECIFICOS.find(([patron])=>patron.test(n));
 if(!fila)return null;
 const [,titulo,descripcion,ubicacion,funcion,relaciones]=fila;
 return {titulo,descripcion,ubicacion,funcion,relaciones};
}
function ladoTexto(original){const n=normalizar(original);return /\b(left|izquierd)/.test(n)?'Corresponde al lado izquierdo.':/\b(right|derech)/.test(n)?'Corresponde al lado derecho.':'';}
function regionBronquial(original){
 const n=normalizar(original);
 if(!/segmental bronchial tree/.test(n))return '';
 const lugar=[['apical','apical'],['anterior','anterior'],['posterior','posterior'],['superior','superior'],['inferior','inferior'],['lateral basal','basal lateral'],['medial basal','basal medial'],['posterior basal','basal posterior'],['anterior basal','basal anterior'],['lingular','de la língula']].filter(([q])=>n.includes(q)).map(([,v])=>v).join(', ');
 return lugar?`El nombre original identifica una rama segmentaria correspondiente al territorio ${lugar}.`:'El nombre original señala una ramificación segmentaria del árbol bronquial.';
}
export function narracionPieza(p){
 if(!p)return '';
 if(p.numeroMallas){
  const g=GUIAS[p.system];
  return componer(p.name||g?.titulo||'Conjunto anatómico',[
   ['Componentes',`Este conjunto reúne varias estructuras de un mismo territorio anatómico.`],
   ['Contexto del sistema',g?.resumen],['Funciones',(g?.funciones||[]).join(' ')],
   ['Cómo funciona',DATOS_SISTEMA[p.system]],['Relaciones',g?.relaciones]
  ]);
 }
 const ficha=fichaComponente(p);
 if(!ficha)return '';
 const esp=detallePorNombre(ficha.original);
 const verificada=fichaAnatomicaIdentificada(ficha.original);
 const informacion=esp||verificada||null;
 const descripcion=campoClinico(informacion?.descripcion||ficha.descripcion,p.system);
 const ubicacion=informacion?.ubicacion||(!/no especificada|no documentada/i.test(ficha.ubicacion)?ficha.ubicacion:'');
 const funcion=campoClinico(informacion?.funcion||ficha.funcion,p.system);
 const estructura=campoClinico(verificada?.estructura||ficha.estructura,p.system);
 const relaciones=campoClinico(informacion?.relaciones||ficha.relaciones,p.system);
 const g=GUIAS[p.system];
 // Para piezas con descripción específica, su explicación es prioritaria.
 // Para las demás se narra su categoría y la fisiología GENERAL del sistema,
 // identificando claramente que no corresponde a una función individual inferida.
 const especifica=Boolean(informacion||ficha.especifico);
 const contexto=especifica?'':`Esta pieza pertenece al conjunto de estructuras del ${g?.titulo||ficha.grupo}. ${resumenDeSistema(g?.resumen)} ${DATOS_SISTEMA[p.system]||''}`;
 const observacion=regionBronquial(ficha.original);
 const alcance=especifica?'':'La función descrita para este tipo de tejido es general; una función individual distinta solo puede confirmarse con información anatómica adicional.';
 return componer(ficha.nombre,[
  ['Identificación',`${ficha.tipo||'Estructura anatómica'}. ${ladoTexto(ficha.original)} ${observacion}`],
  ['Descripción',descripcion],['Ubicación',ubicacion],['Función',funcion],
  ['Organización',estructura&&distinto(estructura,descripcion)?estructura:''],
  ['Relaciones anatómicas',relaciones],
  ['Contexto funcional del sistema',contexto],
  ['Alcance de la explicación',alcance]
 ]);
}
export function narracionProfesional(e){
 if(!e)return '';
 const n=e.nombreEs||e.nombre||'Estructura';
 const f=fichaAnatomicaIdentificada(e.nombre)||fichaAnatomicaIdentificada(n);
 const c=detallePorNombre(e.nombre)||detallePorNombre(n);
 const g=GUIAS[e.sistema];
 if(c||f){const v=c||f;return componer(n,[['Descripción',v.descripcion],['Ubicación',v.ubicacion],['Función',v.funcion],['Organización',v.estructura],['Relaciones anatómicas',v.relaciones]]);}
 const tema=respuestaTutorTema(n);
 return tema?`${n}. ${tema.texto}`:componer(n,[['Sistema al que pertenece',g?.titulo||e.sistema],['Descripción general',resumenDeSistema(g?.resumen)],['Funciones generales',(g?.funciones||[]).join(' ')],['Funcionamiento',DATOS_SISTEMA[e.sistema]],['Aclaración','Esta explicación se refiere al sistema o tipo de estructura, no a una función individual confirmada.']]);
}
export function narracionSeleccion(ctx={}){
 if(ctx.especie?.seleccion&&!ctx.pieza&&!ctx.profesional){return `Modelo externo: ${ctx.especie.seleccion}. El nombre procede del archivo importado. No existe una ficha anatómica verificable para atribuirle funciones biológicas.`;}
 if(ctx.profesional)return narracionProfesional(ctx.profesional);
 if(ctx.pieza)return narracionPieza(ctx.pieza);
 if(ctx.sistema&&ctx.sistema!=='whole')return narracionSistema(ctx.sistema);
 return '';
}
export const SISTEMAS_NARRABLES=Object.keys(DATOS_SISTEMA);
