import {descubrirModelosGitHub,LIMITE_MODELO,validarModeloRemoto} from './repositoriosGitHub.js';
/** Diálogo para traer archivos 3D públicos al visor de criaturas; NO los clasifica por sistema. */
export function crearImportadorGitHub({alAbrir=async()=>false}={}){
 const capa=document.createElement('div');capa.className='github-overlay';capa.hidden=true;
 capa.innerHTML=`<section class="github-modal" role="dialog" aria-modal="true" aria-labelledby="githubTitulo">
 <header class="github-head"><div><span class="github-eyebrow">BIBLIOTECA EXTERNA 3D</span><h2 id="githubTitulo">Importar modelo desde GitHub</h2></div><button type="button" id="githubCerrar" aria-label="Cerrar importación">Cerrar</button></header>
 <p>Introduce un repositorio público o el enlace a un archivo 3D. El modelo se abrirá en el <strong>visor central, igual que el dragón de fantasía</strong>, sin asignarlo a ningún sistema del cuerpo.</p>
 <label for="githubRepositorio">Enlace de GitHub</label><div class="github-entrada"><input type="url" id="githubRepositorio" spellcheck="false" autocomplete="off" placeholder="https://github.com/usuario/repositorio"><button type="button" id="githubBuscar">Buscar modelos</button></div>
 <div class="github-resultados" id="githubResultados" hidden><label for="githubArchivo">Archivo 3D encontrado</label><select id="githubArchivo" size="5" aria-label="Seleccionar archivo 3D"></select><button type="button" id="githubMostrar">Mostrar en el visor 3D</button></div>
 <p class="github-ayuda">Compatibles: GLB, glTF, OBJ y STL. Repositorios públicos; hasta 50 MB por modelo. GLB conserva mejor los materiales. Los OBJ/STL pueden carecer de texturas.</p>
 <p id="githubEstado" role="status" aria-live="polite">Pega el enlace de un repositorio.</p></section>`;
 document.body.append(capa);
 const $=s=>capa.querySelector(s),input=$('#githubRepositorio'),estado=$('#githubEstado'),archivos=$('#githubArchivo'),resultados=$('#githubResultados');
 const buscar=$('#githubBuscar'),mostrar=$('#githubMostrar');
 let candidatos=[],ocupado=false,ultimoEnlace='',cerrarFoco=null;
 const cambiarEstado=(mensaje,error=false)=>{estado.textContent=mensaje;estado.classList.toggle('error',error);};
 function cerrar(){if(ocupado)return;capa.hidden=true;cerrarFoco?.focus?.();}
 function abrir(){cerrarFoco=document.activeElement;capa.hidden=false;input.focus();}
 function bloquear(valor){ocupado=valor;buscar.disabled=mostrar.disabled=valor;input.disabled=valor;archivos.disabled=valor;$('#githubCerrar').disabled=valor;}
 async function buscarModelos(){
  if(ocupado)return;
  const valor=input.value.trim();if(!valor){cambiarEstado('Pega primero el enlace del repositorio.',true);return;}
  bloquear(true);cambiarEstado('Consultando los archivos públicos de GitHub…');resultados.hidden=true;
  try{
   candidatos=await descubrirModelosGitHub(valor);
   if(!candidatos.length)throw Error('No se encontraron archivos GLB, glTF, OBJ o STL.');
   archivos.replaceChildren();for(let i=0;i<candidatos.length;i++){
    const m=candidatos[i],peso=m.size==null?'tamaño desconocido':`${(m.size/1e6).toFixed(1)} MB`;
    const op=new Option(`${m.path} (${peso})`,String(i));op.disabled=m.size>LIMITE_MODELO;archivos.add(op);
   }
   const primero=candidatos.findIndex(m=>m.size==null||m.size<=LIMITE_MODELO);
   if(primero<0)throw Error('Los archivos exceden los 50 MB permitidos.');
   archivos.value=String(primero);ultimoEnlace=valor;resultados.hidden=false;
   cambiarEstado(`${candidatos.length} modelo(s) encontrados. Selecciona el archivo que quieres abrir.`);
  }catch(e){cambiarEstado(e.message||String(e),true);}
  finally{bloquear(false);}
 }
 async function abrirModelo(){
  if(ocupado)return;
  const model=candidatos[Number(archivos.value)];if(!model)return cambiarEstado('Selecciona un archivo primero.',true);
  try{validarModeloRemoto(model.url);}catch(e){return cambiarEstado(e.message,true);}
  bloquear(true);cambiarEstado('Cargando '+model.nombre+' en el visor 3D…');
  try{const ok=await alAbrir(model);if(!ok)throw Error('El archivo no se pudo representar. Revisa si utiliza texturas externas o un formato válido.');capa.hidden=true;}
  catch(e){cambiarEstado(e.message||String(e),true);}
  finally{bloquear(false);}
 }
 buscar.onclick=buscarModelos;mostrar.onclick=abrirModelo;
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();buscarModelos();}});
 $('#githubCerrar').onclick=cerrar;
 capa.addEventListener('click',e=>{if(e.target===capa)cerrar();});
 capa.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar();});
 return {abrir,cerrar,get abierto(){return !capa.hidden;},get ultimoEnlace(){return ultimoEnlace;}};
}
