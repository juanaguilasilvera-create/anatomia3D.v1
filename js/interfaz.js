// Preferencias completamente independientes de la anatomía: 4 paletas × Día/Noche.
const PALETAS=new Set(['real']);
const POR_DEFECTO={paleta:'real',modo:'noche',texto:100,movimiento:false};
const CLAVE='laboratorio3d_v25_apariencia';
const $=id=>document.getElementById(id);
export function crearPreferencias(onChange=()=>{}){
 let prefs={...POR_DEFECTO};
 try {const read=JSON.parse(localStorage.getItem(CLAVE)||'null');if(read&&typeof read==='object'){
  if(PALETAS.has(read.paleta))prefs.paleta=read.paleta;
  if(['dia','noche'].includes(read.modo))prefs.modo=read.modo;
  if(Number.isFinite(read.texto))prefs.texto=Math.min(135,Math.max(100,Math.round(read.texto/5)*5));
  prefs.movimiento=Boolean(read.movimiento);
 }}catch(e){console.warn('No se pudieron recuperar preferencias; se usarán los valores iniciales.',e);}
 const modal=$('menuPreferencias'),fondo=$('fondoMenu'),abrir=$('abrirMenu');
 let focoAnterior=null;
 function aplicar(){
  document.body.dataset.palette=prefs.paleta;
  document.body.dataset.mode=prefs.modo;
  document.body.classList.toggle('reducir-movimiento',prefs.movimiento);
  document.body.style.setProperty('--escala-texto',String(prefs.texto/100));
  document.documentElement.style.colorScheme=prefs.modo==='dia'?'light':'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',prefs.modo==='dia'?'#e9edf2':'#0c1119');
  document.querySelectorAll('[data-paleta]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paleta===prefs.paleta)));
  $('tamanoTexto').value=String(prefs.texto);$('tamanoTextoValor').textContent=prefs.texto+'%';
  $('reducirAnimaciones').checked=prefs.movimiento;
  $('alternarDia').innerHTML=prefs.modo==='noche'?'☀ <span>Modo Día</span>':'☾ <span>Modo Noche</span>';
  $('alternarDia').setAttribute('aria-label',prefs.modo==='noche'?'Activar modo Día':'Activar modo Noche');
  onChange({...prefs});
  try{localStorage.setItem(CLAVE,JSON.stringify(prefs));}catch(e){/* el tema sigue funcionando sin almacenamiento */}
 }
 function actualizar(parcial){prefs={...prefs,...parcial};aplicar();}
 function abrirMenu(){focoAnterior=document.activeElement;modal.hidden=false;fondo.hidden=false;abrir.setAttribute('aria-expanded','true');$('cerrarMenu').focus();}
 function cerrarMenu(){modal.hidden=true;fondo.hidden=true;abrir.setAttribute('aria-expanded','false');(focoAnterior||abrir).focus();}
 abrir.addEventListener('click',()=>modal.hidden?abrirMenu():cerrarMenu());$('cerrarMenu').addEventListener('click',cerrarMenu);fondo.addEventListener('click',cerrarMenu);
 document.querySelectorAll('[data-paleta]').forEach(b=>b.addEventListener('click',()=>actualizar({paleta:b.dataset.paleta})));
 $('alternarDia').addEventListener('click',()=>actualizar({modo:prefs.modo==='dia'?'noche':'dia'}));
 $('tamanoTexto').addEventListener('input',e=>actualizar({texto:Number(e.target.value)}));
 $('reducirAnimaciones').addEventListener('change',e=>actualizar({movimiento:e.target.checked}));
 $('restablecerPreferencias').addEventListener('click',()=>actualizar(POR_DEFECTO));
 document.addEventListener('keydown',e=>{if(modal.hidden)return;
  if(e.key==='Escape'){e.preventDefault();cerrarMenu();}
  if(e.key==='Tab'){const enabled=[...modal.querySelectorAll('button,input,select')].filter(x=>!x.disabled);if(!enabled.length)return;const first=enabled[0],last=enabled[enabled.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
 aplicar();
 return {get valores(){return {...prefs};},set:actualizar,cerrar:cerrarMenu,abierto:()=>!modal.hidden};
}
