import * as THREE from 'three';
// Reflexión ideal de un rayo en un plano tangente. No es path tracing ni ray tracing fotorrealista.
export function crearRayos(scene){
 const group=new THREE.Group();scene.add(group);group.visible=false;
 const incoming=new THREE.ArrowHelper(new THREE.Vector3(.4,-.8,.7).normalize(),new THREE.Vector3(),.45,0xfbbb70,.10,.045);
 const outgoing=new THREE.ArrowHelper(new THREE.Vector3(.2,.8,.4).normalize(),new THREE.Vector3(),.45,0x5697ff,.10,.045);
 const surfaceNormal=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.25,0xffe48a,.07,.03);
 const spot=new THREE.Mesh(new THREE.SphereGeometry(.013,12,8),new THREE.MeshBasicMaterial({color:0xffffff}));group.add(incoming,outgoing,surfaceNormal,spot);
 function update(mesh){if(!mesh)return;mesh.updateMatrixWorld(true);const geo=mesh.geometry,idx=geo.getIndex(),a=geo.getAttribute('position');if(!idx||idx.count<3)return;
  let A,B,C,N;
  // Misma elección que el centro matemático: primera cara NO degenerada.
  for(let t=0;t<Math.min(idx.count/3,160);t++){
   const x=new THREE.Vector3().fromBufferAttribute(a,idx.getX(t*3));
   const y=new THREE.Vector3().fromBufferAttribute(a,idx.getX(t*3+1));
   const z=new THREE.Vector3().fromBufferAttribute(a,idx.getX(t*3+2));
   const normal=y.clone().sub(x).cross(z.clone().sub(x));
   if(normal.lengthSq()>1e-14){A=x;B=y;C=z;N=normal.normalize();break;}
  }
  if(!N)return;
  const normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  N.applyMatrix3(normalMatrix).normalize();
  A.applyMatrix4(mesh.matrixWorld);B.applyMatrix4(mesh.matrixWorld);C.applyMatrix4(mesh.matrixWorld);
  const point=A.clone().add(B).add(C).divideScalar(3);
  const I=new THREE.Vector3(.2,-.9,-.3).normalize();if(I.dot(N)>0)N.negate();const R=I.clone().addScaledVector(N,-2*I.dot(N)).normalize();
  incoming.position.copy(point).addScaledVector(I,-.39);incoming.setDirection(I);outgoing.position.copy(point);outgoing.setDirection(R);surfaceNormal.position.copy(point);surfaceNormal.setDirection(N);spot.position.copy(point);return {I,N,R};
 }
 return {group,update,setVisible:v=>group.visible=v};
}
