import * as THREE from 'three';
// Acercamiento interpolado dentro del ÚNICO visor principal; no crea canvas ni ventana.
export function crearEnfoqueCamara(api){
 let animacion=null,anterior=null;
 const v3=()=>new THREE.Vector3();
 const ease=t=>1-Math.pow(1-t,3);
 function animar(target,position,duracion=780){
  animacion={inicio:performance.now(),duracion,desdeTarget:api.controls.target.clone(),desdeCamara:api.camera.position.clone(),haciaTarget:target.clone(),haciaCamara:position.clone()};
 }
 function enfocar(atlas){
  if(!atlas?.selectionMesh||atlas.selected<0)return;
  if(!anterior)anterior={target:api.controls.target.clone(),position:api.camera.position.clone()};
  const bounds=atlas.selectionBounds||atlas.boxes[atlas.selected],size=bounds.getSize(v3());
  // Enfoca la posición final de inspección, no la localización original del órgano.
  const centro=atlas.inspectionCenter?.clone()||bounds.getCenter(v3());
  const direccion=api.camera.position.clone().sub(api.controls.target);
  if(direccion.lengthSq()<.0001)direccion.set(0,0,1);
  direccion.normalize();
  const fov=THREE.MathUtils.degToRad(api.camera.fov);
  const horizontal=2*Math.atan(Math.tan(fov/2)*api.camera.aspect);
  // Cabe en altura y ancho; no cortar los huesos largos.
  const dY=Math.max(size.y,.035)/(2*Math.tan(fov/2));
  const dX=Math.max(size.x,size.z,.035)/(2*Math.tan(horizontal/2));
  const distancia=THREE.MathUtils.clamp(Math.max(dY,dX)*1.65,api.controls.minDistance,6.0);
  animar(centro,centro.clone().addScaledVector(direccion,distancia),720);
 }
 function enfocarSistema(atlas, sistemas){
  if(!atlas?.parts?.length)return;
  const visibles=atlas.parts.filter(p=>sistemas.includes(p.system));
  if(!visibles.length)return;
  const box=new THREE.Box3();
  for(const p of visibles){const i=atlas.partById.get(p.id);if(i!==undefined)box.union(atlas.boxes[i]);}
  if(box.isEmpty())return;
  const centro=box.getCenter(v3()),tam=box.getSize(v3());
  const dir=api.camera.position.clone().sub(api.controls.target).normalize();
  const vertical=THREE.MathUtils.degToRad(api.camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*api.camera.aspect);
  const distancia=THREE.MathUtils.clamp(Math.max(tam.y/(2*Math.tan(vertical/2)),Math.max(tam.x,tam.z)/(2*Math.tan(horizontal/2)))*1.7,.3,4.2);
  animar(centro,centro.clone().addScaledVector(dir,distancia),850);
 }
 function regresar(){
  if(!anterior)return;
  animar(anterior.target,anterior.position,870);
  anterior=null;
 }
 function cancelar(){animacion=null;}
 api.renderer.domElement.addEventListener('pointerdown',cancelar,{passive:true});
 api.renderer.domElement.addEventListener('wheel',cancelar,{passive:true});
 function actualizar(ahora){
  if(!animacion)return;
  const a=animacion,t=THREE.MathUtils.clamp((ahora-a.inicio)/a.duracion,0,1),v=ease(t);
  api.controls.target.copy(a.desdeTarget).lerp(a.haciaTarget,v);
  api.camera.position.copy(a.desdeCamara).lerp(a.haciaCamara,v);
  api.controls.update();
  if(t>=1)animacion=null;
 }
 function olvidar(){animacion=null;anterior=null;}
 return {enfocar,enfocarSistema,regresar,cancelar,actualizar,olvidar};
}
