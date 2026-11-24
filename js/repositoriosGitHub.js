/* Importación de modelos artísticos públicos: GitHub -> visor 3D. Sin sistema anatómico. */
const FORMATOS = /\.(glb|gltf|obj|stl)$/i;
export const LIMITE_MODELO = 50_000_000;
const segmentoValido = s => /^[A-Za-z\d_.-]+$/.test(s) && !['.','..'].includes(s);
const encodePath = path => path.split('/').map(encodeURIComponent).join('/');
function validarBase(texto){
 let u;try{u=new URL(String(texto||'').trim());}catch{throw Error('Pega una dirección HTTPS de GitHub válida.');}
 if(u.protocol!=='https:'||u.port||u.username||u.password)throw Error('Solo se aceptan enlaces públicos HTTPS.');
 if(!['github.com','raw.githubusercontent.com'].includes(u.hostname.toLowerCase()))throw Error('Solo se aceptan enlaces de github.com.');
 if(u.search||u.hash)throw Error('Utiliza el enlace limpio, sin parámetros adicionales.');
 return u;
}
export function interpretarEnlaceGitHub(texto){
 const u=validarBase(texto),v=u.pathname.split('/').filter(Boolean);
 if(v.length<2||!segmentoValido(v[0])||!segmentoValido(v[1]))throw Error('El enlace debe contener usuario y repositorio.');
 const owner=v[0],repo=v[1].replace(/\.git$/i,'');
 if(!segmentoValido(repo))throw Error('Nombre de repositorio no válido.');
 if(u.hostname==='raw.githubusercontent.com'){
  if(v.length<4||!FORMATOS.test(v.join('/')))throw Error('Enlace directo sin archivo 3D compatible.');
  return {tipo:'archivo',owner,repo,url:u.href,nombre:decodeURIComponent(v[v.length-1])};
 }
 if(v.length===2)return {tipo:'repositorio',owner,repo,carpeta:''};
 if(v[2]==='blob'&&v.length>=5){
  const ref=v[3],path=v.slice(4).join('/');
  if(!FORMATOS.test(path))throw Error('El archivo debe ser GLB, glTF, OBJ o STL.');
  return {tipo:'archivo',owner,repo,url:`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${encodePath(path)}`,nombre:decodeURIComponent(v[v.length-1])};
 }
 if(v[2]==='tree'&&v.length>=4)return {tipo:'repositorio',owner,repo,carpeta:v.slice(3).join('/')};
 throw Error('Pega el enlace del repositorio o de un archivo 3D dentro de GitHub.');
}
async function obtenerJSON(url,solicitud=fetch){
 let r;try{r=await solicitud(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(18000)});}catch{throw Error('No se pudo acceder a GitHub. Revisa tu conexión.');}
 if(r.status===403||r.status===429)throw Error('GitHub limitó las consultas temporalmente. Prueba con el enlace directo al GLB.');
 if(r.status===404)throw Error('Repositorio público no encontrado.');
 if(!r.ok)throw Error('GitHub respondió con HTTP '+r.status);
 return r.json();
}
export async function descubrirModelosGitHub(entrada,{solicitud=fetch}={}){
 const info=typeof entrada==='string'?interpretarEnlaceGitHub(entrada):entrada;
 if(info.tipo==='archivo')return [{nombre:info.nombre,path:info.nombre,url:info.url,size:null,formato:info.nombre.split('.').pop().toLowerCase(),owner:info.owner,repo:info.repo}];
 const root=`https://api.github.com/repos/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}`;
 const repo=await obtenerJSON(root,solicitud);
 const branch=repo.default_branch;
 if(!branch||typeof branch!=='string')throw Error('No se encontró la rama principal.');
 const tree=await obtenerJSON(`${root}/git/trees/${encodeURIComponent(branch)}?recursive=1`,solicitud);
 if(!Array.isArray(tree.tree))throw Error('GitHub no devolvió los archivos del repositorio.');
 if(tree.truncated)throw Error('Repositorio demasiado grande para enumerarlo. Pega el enlace directo del archivo GLB.');
 let filtro='';
 if(info.carpeta){
  // GitHub permite URLs /tree/<rama>/carpeta. Mostramos únicamente la rama predeterminada.
  if(info.carpeta===branch)filtro='';
  else if(info.carpeta.startsWith(branch+'/'))filtro=info.carpeta.slice(branch.length+1)+'/';
  else throw Error(`Para carpetas, utiliza la rama principal «${branch}» o pega un enlace de archivo.`);
 }
 const peso={glb:0,gltf:1,obj:2,stl:3};
 return tree.tree.filter(f=>f.type==='blob'&&FORMATOS.test(f.path)&&(!filtro||f.path.startsWith(filtro))).map(f=>({
  nombre:f.path.split('/').pop(),path:f.path,size:f.size??null,owner:info.owner,repo:info.repo,
  formato:f.path.split('.').pop().toLowerCase(),
  url:`https://raw.githubusercontent.com/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/${encodeURIComponent(branch)}/${encodePath(f.path)}`
 })).sort((a,b)=>peso[a.formato]-peso[b.formato]||a.path.localeCompare(b.path,'es')).slice(0,300);
}
export function validarModeloRemoto(url){
 const u=validarBase(url);
 if(u.hostname!=='raw.githubusercontent.com'||!FORMATOS.test(u.pathname))throw Error('Archivo 3D no autorizado.');
 return u.href;
}
