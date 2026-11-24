/* Tutor guiado en español: comandos reales y explicación basada en fichas del modelo.
   No afirma ser un LLM ni inventa anatomía ausente. La lectura puede activarse
   automáticamente al seleccionar una estructura o un sistema. */
import {SISTEMAS,infoSistema} from './catalogo.js';
import {GUIAS,detallePieza,nombreAnatomico} from './anatomia.js';
import {normalizarBusqueda} from './buscadorAnatomico.js';
import {respuestaTutorTema} from './conocimientoTutor.js';
import {traducirNombreAnatomico} from './traduccionAnatomica.js';
import {fichaComponente} from './fichasComponentes.js';
import {fichaAnatomicaIdentificada} from './fichasVerificadas.js';
import {narracionSeleccion,narracionSistema,narracionPieza,narracionProfesional} from './narracionAnatomica.js';
const $=id=>document.getElementById(id);
const ALIAS_SYSTEM=[
 [/circulatorio|cardiovascular|arterias|venas|vasos/, 'circulatory'],
 [/muscul|musculos|musculo/,'muscular'],[/esqueleto|oseo|huesos/,'skeletal'],
 [/nervioso|nervios|encefalo/,'nervous'],[/digestivo|intestinos/,'digestive'],
 [/respiratorio|pulmones|pulmon/,'respiratory'],[/urinario|rinones/,'urinary'],
 [/endocrino/,'endocrine'],[/reproductor/,'reproductive'],[/sensorial|sentidos/,'sensory'],
 [/piel|tegumentario/,'integumentary'],[/linfatico/,'lymphatic']
];
export function crearTutorVoz({obtenerContexto,acciones,avisar=()=>{}}){
 const input=$('tutorTexto'),respuesta=$('tutorRespuesta'),estado=$('tutorEstado'),micro=$('tutorMicro'),enviar=$('tutorEnviar');
 const activarIA=$('tutorIALocal'),estadoIA=$('tutorIAEstado');
 // Una sola voz española del navegador. Sin motores de voz externos, APIs ni servidores de audio.
 const sintesis=('speechSynthesis' in window)?window.speechSynthesis:null;
 let locucionActual=null, versionLocucion=0, narrando=false;
 const disponible=$('tutorVozDisponibilidad');
 function informar(mensaje){if(estado)estado.textContent=mensaje;}
 function vozEspanola(){
  if(!sintesis)return null;
  const voces=sintesis.getVoices();
  const es=voces.filter(v=>/^es(?:[-_]|$)/i.test(v.lang));
  // Priorizar un acento de España, después cualquier variante española instalada.
  es.sort((a,b)=>{
   const puntuar=v=>(/^es[-_]ES$/i.test(v.lang)?100:0)+
     (/microsoft|google/i.test(v.name)?20:0)+(/online|natural/i.test(v.name)?5:0);
   return puntuar(b)-puntuar(a);
  });
  return es[0]||null;
 }
 function comprobarVoz(){
  if(!sintesis||!('SpeechSynthesisUtterance' in window)){
   if(disponible)disponible.textContent='La lectura no está disponible en este navegador.';
   informar('Voz no disponible en este navegador.');return;
  }
  const voz=vozEspanola();
  if(disponible)disponible.textContent=voz?'Narrador en español listo.':'Se necesita una voz española en el sistema.';
  if(!narrando)informar(voz?'Listo para leer':'Comprueba la voz española de Windows');
 }
 if(sintesis){
  sintesis.addEventListener?.('voiceschanged',comprobarVoz);
  comprobarVoz();
 }
 function detenerAudio(){
  versionLocucion++;narrando=false;
  if(locucionActual){locucionActual.onend=null;locucionActual.onerror=null;locucionActual=null;}
  if(sintesis){try{sintesis.cancel();}catch{}}
 }
 // Fragmentos breves evitan cortes de la síntesis del navegador con fichas largas.
 function dividirTexto(texto){
  // Prioriza pausas entre oraciones, sin superar fragmentos largos del motor Web Speech.
  const limite=205,partes=[];let actual='';
  const enviar=()=>{if(actual.trim())partes.push(actual.trim());actual='';};
  const oraciones=String(texto||'').trim().match(/[^.!?;]+[.!?;]?/g)||[];
  for(const oracion of oraciones){
   const frase=oracion.trim();if(!frase)continue;
   if(frase.length>limite){
    enviar();
    for(const palabra of frase.split(/\s+/)){
     if(actual&&actual.length+palabra.length+1>limite)enviar();
     actual=actual?`${actual} ${palabra}`:palabra;
    }
    enviar();continue;
   }
   if(actual&&actual.length+frase.length+1>limite)enviar();
   actual=actual?`${actual} ${frase}`:frase;
  }
  enviar();return partes;
 }
 function reproducirAudio(frase,fin){
  detenerAudio();
  if(!sintesis||!('SpeechSynthesisUtterance' in window)){
   informar('Tu navegador no admite voz. Abre el laboratorio en Edge o Chrome.');return;
  }
  const voces=sintesis.getVoices(),voz=vozEspanola();
  if(voces.length&&!voz){
   informar('No hay voz española instalada. Agrega una voz en español desde Configuración de Windows.');return;
  }
  const partes=dividirTexto(frase);
  if(!partes.length){informar('No hay información para leer.');return;}
  const version=versionLocucion;
  let indice=0;
  narrando=true;
  function siguiente(){
   if(version!==versionLocucion)return;
   if(indice>=partes.length){narrando=false;locucionActual=null;informar('Lectura finalizada.');fin?.();return;}
   const u=new SpeechSynthesisUtterance(partes[indice++]);
   u.lang=voz?.lang||'es-ES';
   if(voz)u.voice=voz;
   u.rate=0.98;u.pitch=1;u.volume=1;
   locucionActual=u;
   u.onstart=()=>{if(version===versionLocucion)informar('Leyendo ficha en español…');};
   u.onend=()=>{if(version===versionLocucion)siguiente();};
   u.onerror=e=>{if(version!==versionLocucion||e.error==='interrupted'||e.error==='canceled')return;
    narrando=false;locucionActual=null;
    informar('No se pudo reproducir la voz ('+(e.error||'error')+'). Comprueba las voces instaladas en Windows.');
   };
   try{sintesis.speak(u);}catch(e){narrando=false;informar('Error de reproducción: '+e.message);}
  }
  siguiente();
 }
 // La ficha es la fuente de verdad; cambiar de selección cancela la lectura anterior.
 const tituloFicha=$('partName'),textoFicha=$('partDescription');
 if(tituloFicha&&textoFicha){
  const observador=new MutationObserver(()=>{
   if(narrando){detenerRecorrido();detenerAudio();informar('Nueva selección. Pulsa «Leer ficha» para escuchar sus detalles.');}
  });
  observador.observe(tituloFicha,{childList:true,characterData:true,subtree:true});
  observador.observe(textoFicha,{childList:true,characterData:true,subtree:true});
 }
 let historial=[];
 let enEscucha=false,recognition=null;
 let recorrido=null,pasoRecorrido=0,tokenRecorrido=0,esperaRecorrido=null;
 const Engine=window.SpeechRecognition||window.webkitSpeechRecognition;
 // Recorridos redactados explícitamente: solo se describen los contenidos que
 // puede mostrar el atlas; no se generan afirmaciones clínicas automáticas.
 const RECORRIDOS={
  general:[
   {accion:'cuerpo',texto:'Bienvenido al laboratorio anatómico. Comenzamos con el cuerpo humano completo. Puedes girarlo y acercarte con la rueda del ratón.'},
   {accion:'sistema',valor:'skeletal',texto:'Este es el sistema esquelético. Proporciona soporte, protección y puntos de inserción para los músculos. Selecciona un hueso para estudiarlo solo.'},
   {accion:'sistema',valor:'muscular',texto:'Ahora observamos el sistema muscular. La contracción de los músculos esqueléticos produce movimiento y ayuda a mantener la postura.'},
   {accion:'sistema',valor:'nervous',texto:'El sistema nervioso recibe información, la procesa y participa en la coordinación de funciones corporales.'},
   {accion:'sistema',valor:'respiratory',texto:'Por último, vemos el sistema respiratorio y sus vías aéreas. Puedes comenzar una exploración especializada de los pulmones si has instalado su archivo GLB.'}
  ],
  corazon:[
   {accion:'sistema',valor:'cardiac',texto:'Comenzamos el recorrido del corazón. Está situado en el tórax, entre los pulmones, ligeramente desplazado hacia la izquierda.'},
   {accion:'buscar',valor:'corazon',texto:'El buscador presenta primero el corazón como conjunto y después las estructuras identificadas en el modelo. El corazón posee dos aurículas y dos ventrículos.'},
   {accion:'sistema',valor:'arterial',texto:'Las arterias conducen sangre desde el corazón. La aorta distribuye sangre hacia la circulación sistémica.'},
   {accion:'sistema',valor:'venous',texto:'Las venas devuelven sangre hacia el corazón. La circulación pulmonar lleva sangre entre el corazón y los pulmones.'},
   {accion:'proyeccion',valor:'frente',texto:'Terminamos con una proyección frontal ortográfica. Esta vista no utiliza perspectiva y ayuda a comparar proporciones geométricas.'}
  ],
  cerebro:[
   {accion:'sistema',valor:'nervous',texto:'Estudiaremos el encéfalo dentro del sistema nervioso.'},
   {accion:'buscar',valor:'cerebro',texto:'Busca el cerebro y explora sus regiones disponibles. El cerebro participa en la percepción, el movimiento, la memoria y otras funciones.'},
   {accion:'proyeccion',valor:'superior',texto:'Esta es la proyección superior del modelo. No debe confundirse con una tomografía clínica.'},
   {accion:'vista3d',texto:'Regresamos a la vista tridimensional. Puedes seleccionar cada estructura del modelo para estudiarla por separado.'}
  ],
  pulmones:[
   {accion:'sistema',valor:'respiratory',texto:'Ahora estudiamos el sistema respiratorio. El aire entra por las vías respiratorias y llega a los pulmones.'},
   {accion:'buscar',valor:'pulmones',texto:'Los pulmones contienen ramificaciones bronquiales y unidades de intercambio gaseoso. El detalle real visible depende del modelo instalado.'},
   {accion:'proyeccion',valor:'frente',texto:'Una vista frontal ortográfica ayuda a comparar los dos lados.'},
   {accion:'vista3d',texto:'Regresamos a tres dimensiones para rotar y aislar las estructuras.'}
  ],
  ojos:[
   {accion:'sistema',valor:'sensory',texto:'Los ojos pertenecen al sistema sensorial. Vamos a estudiar las estructuras que intervienen en la visión.'},
   {accion:'buscar',valor:'ojo',texto:'La córnea y el cristalino contribuyen al enfoque de la luz, y la retina transforma la energía luminosa en señales nerviosas.'},
   {accion:'proyeccion',valor:'derecha',texto:'La proyección lateral ayuda a estudiar las relaciones espaciales, si las mallas necesarias existen en el modelo.'}
  ],
  esqueleto:[
   {accion:'sistema',valor:'skeletal',texto:'El esqueleto adulto suele describirse con aproximadamente doscientos seis huesos; el número puede variar por la forma de contarlos.'},
   {accion:'buscar',valor:'femur',texto:'El fémur es el hueso del muslo. Puedes seleccionar las piezas identificadas y acercarte para observar la geometría.'},
   {accion:'proyeccion',valor:'derecha',texto:'La proyección lateral permite observar la forma sin distorsión de perspectiva.'}
  ]
 };
 const estadoRecorrido=$('tutorRecorridoEstado');
 const botonSiguiente=$('tutorRecorridoSiguiente');
 const botonParar=$('tutorRecorridoParar');
 function detenerRecorrido(cancelar=true){
  tokenRecorrido++;if(esperaRecorrido)clearTimeout(esperaRecorrido);esperaRecorrido=null;
  recorrido=null;pasoRecorrido=0;if(cancelar)detenerAudio();
  if(estadoRecorrido)estadoRecorrido.textContent='Recorrido detenido. Puedes iniciar otro o hacer una pregunta.';
  if(botonSiguiente)botonSiguiente.disabled=true;
 }
 function ejecutarPaso(p){
  if(p.accion==='cuerpo')acciones.cuerpo();
  else if(p.accion==='sistema')acciones.sistema(p.valor);
  else if(p.accion==='buscar')acciones.buscar(p.valor);
  else if(p.accion==='proyeccion')acciones.proyeccion(p.valor);
  else if(p.accion==='vista3d')acciones.vista3d();
 }
 function avanzarRecorrido(){
  if(!recorrido)return;const pasos=RECORRIDOS[recorrido];
  if(pasoRecorrido>=pasos.length){
   const final='Recorrido completado. Puedes explorar cualquier estructura o comenzar otra guía.';
   detenerRecorrido(false);decir(final);return;
  }
  const paso=pasos[pasoRecorrido++],version=tokenRecorrido;
  ejecutarPaso(paso);estadoRecorrido.textContent=`${recorrido.toUpperCase()} · Paso ${pasoRecorrido} de ${pasos.length}`;
  decir(paso.texto,()=>{if(recorrido&&version===tokenRecorrido)esperaRecorrido=setTimeout(avanzarRecorrido,850);});
 }
 function iniciarRecorrido(tema){
  const clave=RECORRIDOS[tema]?tema:'general';detenerRecorrido();recorrido=clave;pasoRecorrido=0;
  botonSiguiente.disabled=false;avanzarRecorrido();
 }
 $('tutorRecorridoIniciar')?.addEventListener('click',()=>iniciarRecorrido($('tutorRecorridoTema')?.value||'general'));
 botonSiguiente?.addEventListener('click',()=>{if(!recorrido)return;if(esperaRecorrido)clearTimeout(esperaRecorrido);detenerAudio();avanzarRecorrido();});


 function mostrar(frase){respuesta.textContent=frase;respuesta.hidden=false;}
 function decir(frase,fin){mostrar(frase);reproducirAudio(frase,fin);}
 async function consultarIA(texto,ctx){
  const pieza=ctx.pieza||null;
  const detalle=pieza?detallePieza(pieza):null;
  const nombre=pieza?nombreAnatomico(pieza):null;
  const guia=GUIAS[ctx.sistema]||null;
  const contexto={
   sistema:infoSistema(ctx.sistema==='circulatory'?'cardiac':ctx.sistema).name,
   pieza:pieza?{nombre:nombre.espanol,nombreOriginal:pieza.name,id:pieza.id,descripcion:detalle.descripcion,funcion:detalle.funcion,fuente:'BodyParts3D'}:null,
   especie:ctx.especie?{nombre:ctx.especie.especie,seleccion:ctx.especie.seleccion,origen:'Modelo GLB externo; anatomía no validada'}:null,
   resumenSistema:guia?.resumen||''
  };
  const controlador=new AbortController();
  const timeout=setTimeout(()=>controlador.abort(),35000);
  estadoIA.textContent='Consultando la IA local...';
  try{
   const r=await fetch('http://127.0.0.1:8765/api/tutor',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({pregunta:texto,contexto,historial:historial.slice(-6)}),signal:controlador.signal
   });
   const j=await r.json();if(!r.ok)throw Error(j.error||'Respuesta HTTP '+r.status);
   const contenido=String(j.respuesta||'').trim();if(!contenido)throw Error('La IA no devolvió texto');
   historial.push({pregunta:texto,respuesta:contenido});historial=historial.slice(-6);
   estadoIA.textContent='IA local conectada · '+(j.modelo||'Ollama');
   decir(contenido);return true;
  }catch(e){
   estadoIA.textContent='IA no disponible ('+(e.name==='AbortError'?'tiempo agotado':e.message)+'). Se usa el tutor básico.';
   return false;
  }finally{clearTimeout(timeout);}
 }
 async function responder(texto){
  const q=normalizarBusqueda(texto),ctx=obtenerContexto();
  if(!q){decir('Escribe una pregunta o pulsa el micrófono.');return;}
  if(/^(deten|silencio|calla|parar|stop)/.test(q)){detenerRecorrido();mostrar('Lectura detenida.');return;}
  if(/^(siguiente|continua|continuar|proximo paso)/.test(q)&&recorrido){if(esperaRecorrido)clearTimeout(esperaRecorrido);detenerAudio();avanzarRecorrido();return;}
  if(/recorrido|guia guiada|visita guiada/.test(q)){const tema=/corazon|cardiaco/.test(q)?'corazon':/cerebro|encefalo/.test(q)?'cerebro':/pulmon|respirat/.test(q)?'pulmones':/ojos|vision|retina/.test(q)?'ojos':/esqueleto|hueso/.test(q)?'esqueleto':'general';iniciarRecorrido(tema);return;}
  if(/ayuda|que puedes hacer|instrucciones/.test(q)){
   decir('Puedo mostrar sistemas anatómicos, abrir el buscador, centrar una pieza, cambiar a dos dimensiones, regresar al cuerpo y explicar la estructura seleccionada. Prueba: busca corazón, muestra el esqueleto o explica esta pieza.');return;
  }
  if(/volver|vuelve|regresa|restaura|al cuerpo|cuerpo completo|mostrar todo/.test(q)){
   acciones.cuerpo();decir('He restaurado la vista general del cuerpo humano.');return;
  }
  if(/vista (2d|dos d|dos dimensiones)|proyeccion|ortografica|frontal|posterior|lateral|superior|inferior/.test(q)){
   const vista=/posterior|espalda/.test(q)?'espalda':/izquierda/.test(q)?'izquierda':/derecha/.test(q)?'derecha':/lateral|perfil/.test(q)?'derecha':/superior/.test(q)?'superior':/inferior/.test(q)?'inferior':'frente';
   acciones.proyeccion(vista);decir(`He abierto la proyección ortográfica ${vista}. Puedes usar las otras vistas en el panel 2D.`);return;
  }
  if(/vista 3d|tres dimensiones|regresa al 3d/.test(q)){acciones.vista3d();decir('Regresamos al visor tridimensional.');return;}
  if(/iluminacion|modo dia|modo noche/.test(q)){decir('Puedes cambiar entre día y noche con el control superior. La iluminación del modelo usa materiales y luces de estudio.');return;}
  // Para preguntas abiertas usa un modelo local, cuando el usuario lo habilita.
  // Las órdenes de navegación anteriores siguen siendo deterministas.
  const preguntaAbierta=/^(por que|como|cual|cuando|donde|que|explica|describe|compar|funcion|dime|hablame|cuentame)/.test(q)||q.includes('?');
  if(activarIA?.checked&&preguntaAbierta){
   if(await consultarIA(texto,ctx))return;
   // Si Ollama no responde, continúa con la guía local sin bloquear el laboratorio.
  }
  // Una pregunta explícita sobre un sistema obtiene la explicación completa,
  // en lugar de una ficha breve obtenida por coincidencia de palabras.
  if(/^(que|como|cual|por que|explica|describe|hablame|informacion|funcion|dime|cuentame)/.test(q)){
   const pedido=ALIAS_SYSTEM.find(([exp])=>exp.test(q));
   if(pedido&&/sistema|aparato|respiratorio|circulatorio|cardiovascular|digestivo|nervioso|urinario|muscular|oseo|endocrino|sensorial|reproductor|linfatico|venoso|arterial/.test(q)){
    decir(narracionSistema(pedido[1]));return;
   }
  }
  const tema=respuestaTutorTema(q);
  // Un tema solicitado por nombre tiene preferencia sobre la pieza anterior.
  if(tema&&(/^(que|como|cual|por que|explica|dime|hablame|describe|cuentame|informacion|funcion)/.test(q)||q.includes('?'))){
   decir(`${tema.titulo}. ${tema.texto} Fuente general: ${tema.fuente}.`);return;
  }
  if(ctx.profesional&&/explica|que es|que hace|funcion|descripcion|como funciona|informacion|detalle|dime|hablame/.test(q)){
   decir(narracionProfesional(ctx.profesional));return;
  }
  if(/explica|que es|que hace|funcion|descripcion|como funciona|informacion|detalle|matematica/.test(q)){
   if(ctx.especie){
    decir(`Modelo externo: ${ctx.especie.seleccion||ctx.especie.especie}. No dispone de información anatómica validada en este proyecto.`);return;
   }
   if(ctx.pieza){
    if(/matematica/.test(q)){
     const ficha=fichaComponente(ctx.pieza);
     decir(`La estructura ${ficha.nombre} tiene ${ficha.vertices} vértices y ${ficha.triangulos} triángulos en este modelo tridimensional.`);
    }else decir(narracionPieza(ctx.pieza));
    return;
   }
   if(GUIAS[ctx.sistema]){decir(narracionSistema(ctx.sistema));return;}
   decir('Selecciona una estructura o un sistema para escuchar su explicación anatómica.');return;
  }
  const frase=q.replace(/^(busca|buscar|muestrame|muestra|ensename|abre|ver|selecciona|quiero ver|llevame a)\s*/,'').replace(/^(el|la|los|las|un|una|mi|del)\s+/,'');
  for(const [regex,id] of ALIAS_SYSTEM){
   if(regex.test(frase)&&/sistema|esqueleto|musculos|huesos|nervios|arterias|venas|pulmones|circulatorio|digestivo|respiratorio|nervioso/.test(frase)){
    acciones.sistema(id);decir(`Mostrando ${infoSistema(id==='circulatory'?'cardiac':id).name}. Puedes elegir una estructura o pedirme que la busque.`);return;
   }
  }
  // Preguntas abiertas desconocidas no deben confundirse con búsquedas anatómicas.
  if(preguntaAbierta){
   const g=GUIAS[ctx.sistema];
   if(g&&/sistema|este grupo|que hace/.test(q)){decir(`${g.titulo}. ${g.resumen} ${g.funciones.join(' ')}`);return;}
   decir('Esa pregunta necesita información adicional. Puedes consultar la ficha de un órgano, o activar IA conversacional local con Ollama para preguntas abiertas. No voy a inventar una respuesta.');return;
  }
  if(frase){acciones.buscar(frase);decir(`He buscado «${frase}» en el modelo. Elige una estructura para inspeccionarla y ver sus referencias 2D.`);return;}
  decir('No he podido interpretar esa instrucción. Prueba con «muestra esqueleto» o «busca corazón».');
 }
 function enviarTexto(){const v=input.value.trim();if(v){void responder(v);input.value='';}}
 enviar.addEventListener('click',enviarTexto);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();enviarTexto();}});
 if(!Engine){micro.disabled=true;micro.title='El navegador no admite reconocimiento de voz. Usa el cuadro de texto.';estado.textContent='El micrófono no está disponible en este navegador; puedes escribir las preguntas.';}
 else{
  recognition=new Engine();recognition.lang='es-PE';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
  recognition.onstart=()=>{enEscucha=true;micro.classList.add('active');estado.textContent='Escuchando… habla ahora.';};
  recognition.onend=()=>{enEscucha=false;micro.classList.remove('active');if(estado.textContent==='Escuchando… habla ahora.')estado.textContent='Pulsa el micrófono para dictar una pregunta.';};
  recognition.onresult=e=>{const texto=e.results?.[0]?.[0]?.transcript||'';estado.textContent=`Reconocido: ${texto}`;void responder(texto);};
  recognition.onerror=e=>{estado.textContent=`No se reconoció la voz (${e.error}). Puedes escribir tu pregunta.`;};
  micro.addEventListener('click',()=>{if(enEscucha){recognition.stop();return;}try{detenerAudio();recognition.start();}catch(e){estado.textContent='No fue posible activar el micrófono: '+e.message;}});
 }
 activarIA?.addEventListener('change',()=>{estadoIA.textContent=activarIA.checked?'IA local habilitada. Inicia servidor_ia_local.py y Ollama para preguntas abiertas.':'Tutor básico activo · sin conexión a IA.';});
 $('tutorSilencio').addEventListener('click',()=>{detenerRecorrido();if(recognition&&enEscucha)recognition.stop();estado.textContent='Lectura detenida.';});
 function explicarActualEnVoz(){
  detenerRecorrido();
  const ctx=obtenerContexto()||{};
  // El contenido hablado se construye a partir del órgano o sistema elegido,
  // nunca de la descripción reducida visible ni de los datos de la malla 3D.
  const frase=narracionSeleccion(ctx);
  if(!frase){
   informar('Selecciona una estructura o un sistema para escuchar su explicación.');
   return;
  }
  reproducirAudio(frase);
 }

 function explicarSeleccion(p){
  if(!p)return;
  const ficha=fichaComponente(p);
  mostrar(`${ficha.nombre}. ${ficha.descripcion} Función: ${ficha.funcion}. Región: ${ficha.ubicacion}. ${ficha.especifico?'':'La función pertenece a una categoría general y no está verificada individualmente.'}`);
 }
 function explicarSistema(id){
  if(!id)return;
  const g=GUIAS[id]||null;
  const titulo=g?.titulo||traducirNombreAnatomico(id)||id;
  const resumen=g?.resumen||`Has abierto ${titulo}. Puedes explorar sus estructuras, ver referencias bidimensionales y seleccionar una pieza para estudiarla en detalle.`;
  mostrar(`${titulo}. ${resumen}`);
 }
 function hablarSiCorresponde(texto){
  if(!texto)return;
  mostrar(texto);
 }
 function explicarProfesional(e){
  if(!e)return;
  const tema=respuestaTutorTema(e.nombreEs)||respuestaTutorTema(e.nombre);
  const intro=tema?.texto||`Has seleccionado ${e.nombreEs}, del sistema ${e.sistema}. Puedes observar su ubicación y relaciones anatómicas, y consultar las referencias bidimensionales vinculadas. No tengo información individual validada sobre todas sus funciones.`;
  mostrar(`${e.nombreEs}. ${intro}`);
 }
 function explicarExterno(info){
  if(!info?.seleccion)return;
  mostrar(`${traducirNombreAnatomico(info.seleccion)}. Esta pieza pertenece al archivo de ${info.especie}. El modelo aporta una forma 3D pero no contiene una descripción anatómica validada de esta estructura.`);
 }
 return {responder,iniciarRecorrido,detenerRecorrido,explicarActualEnVoz,explicarSeleccion,explicarProfesional,explicarExterno,explicarSistema,hablarSiCorresponde,explicarActual(){responder('Explica la estructura seleccionada');},detener(){detenerRecorrido();recognition?.abort();detenerAudio();}};
}
