// El inventario existe incluso cuando no se han instalado modelos opcionales.
// No se comprueba la existencia de un GLB mediante peticiones que causan 404.
export function ordenarRutasOpcionales(inventario,local,remotas=[]){
 const ruta=local.replace(/^\.\//,'');
 const disponible=inventario?.descargaAutomatica===true || (Array.isArray(inventario?.archivos)&&inventario.archivos.includes(ruta));
 return [...new Set([...(disponible?[local]:[]),...remotas])];
}
export async function rutasModeloOpcional(local,remotas=[],obtener=globalThis.fetch){
 let inventario=null;
 try{const respuesta=await obtener(new URL('../modelos/disponibles.json',import.meta.url),{cache:'no-store'});if(respuesta.ok)inventario=await respuesta.json();}catch{/* Si el inventario no está accesible, no solicitar archivos locales opcionales. */}
 return ordenarRutasOpcionales(inventario,local,remotas);
}
