import * as THREE from 'three';

// Anima la pieza real de un GLB/OBJ/STL sin duplicarla ni modificar la geometría.
// Reutilizado por el visor profesional y el importador de GitHub.
export function crearLevitacionExterna(){
 let piezas=[],bases=[],dimension=.1,progreso=0;
 function restaurar(){
  piezas.forEach((pieza,i)=>{if(pieza?.parent&&bases[i]){pieza.position.copy(bases[i]);pieza.updateMatrix();pieza.updateMatrixWorld(true);}});
  piezas=[];bases=[];progreso=0;
 }
 function seleccionar(lista){
  restaurar();
  piezas=(lista||[]).filter(p=>p?.isMesh&&p.parent);
  bases=piezas.map(p=>p.position.clone());
  if(!piezas.length)return;
  const box=new THREE.Box3();
  for(const p of piezas){p.updateMatrixWorld(true);box.expandByObject(p);}
  const size=box.getSize(new THREE.Vector3());
  dimension=Math.max(size.x,size.y,size.z,.01);
 }
 function actualizar(ahora,dt,activada,fuerza=.56,reducido=false){
  if(!piezas.length)return;
  const intensidad=THREE.MathUtils.clamp(Number(fuerza)||0,0,1);
  progreso=THREE.MathUtils.damp(progreso,activada&&!reducido&&intensidad>0?1:0,5.5,Math.min(.08,Math.max(.001,dt)));
  const altura=THREE.MathUtils.clamp(dimension*.18,.014,.12)*intensidad;
  const vaiven=THREE.MathUtils.clamp(dimension*.05,.007,.035)*intensidad;
  const desplazamiento=(altura+vaiven*Math.sin(ahora*.0026))*progreso;
  const localPorPadre=new WeakMap();
  for(let i=0;i<piezas.length;i++){
   const pieza=piezas[i],padre=pieza.parent;if(!padre)continue;
   let delta=localPorPadre.get(padre);
   if(!delta){
    padre.updateWorldMatrix(true,false);
    const origen=padre.worldToLocal(new THREE.Vector3());
    delta=padre.worldToLocal(new THREE.Vector3(0,desplazamiento,0)).sub(origen);
    localPorPadre.set(padre,delta);
   }
   pieza.position.copy(bases[i]).add(delta);
   pieza.updateMatrix();pieza.updateMatrixWorld(true);
  }
 }
 return {seleccionar,restaurar,actualizar,get disponible(){return piezas.length>0;}};
}
