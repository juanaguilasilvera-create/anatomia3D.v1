import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export function iniciarEscena(host){
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.setSize(host.clientWidth,host.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;
 host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();let environment=null;
 scene.background=new THREE.Color('#000000');
 try{const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();}catch(e){console.warn('Se continúa sin mapa de entorno PBR',e);}
 scene.fog=new THREE.FogExp2('#10111b',.017);
 const camera=new THREE.PerspectiveCamera(36,Math.max(.1,host.clientWidth/host.clientHeight),.005,100);camera.position.set(1.15,1.18,3.5);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.88,0);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=.13;controls.maxDistance=14;controls.enablePan=true;controls.screenSpacePanning=true;controls.zoomToCursor=true;controls.zoomSpeed=1.12;controls.panSpeed=1;controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};controls.maxPolarAngle=Math.PI*.975;
 const hemisphere=new THREE.HemisphereLight(0xffffff,0x39344c,1.8);scene.add(hemisphere);
 const key=new THREE.DirectionalLight(0xfff7f0,2.45);key.position.set(-2,4,3);scene.add(key);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2.4;key.shadow.camera.right=2.4;key.shadow.camera.top=2.7;key.shadow.camera.bottom=-1.4;key.shadow.camera.near=.1;key.shadow.camera.far=14;key.shadow.bias=-.0004;
 const fill=new THREE.DirectionalLight(0xe9e6ff,1.8);fill.position.set(2,1,-3);scene.add(fill);
 const point=new THREE.PointLight(0xffffff,10,5,2);point.position.set(1.6,2.2,1);scene.add(point);
 const rim=new THREE.DirectionalLight(0xb49aff,1.35);rim.position.set(-2,.8,-3);scene.add(rim);
 // fondo neutro de estudio. Se eliminan los círculos holográficos
 // y la plataforma para que la pieza anatómica sea el único protagonista.
 const platform=new THREE.Group();scene.add(platform);
 const grid=new THREE.Group();scene.add(grid);
 const scan=new THREE.Group();scene.add(scan);
 const arcs=[];
 function animateStage(){}
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.104;floor.receiveShadow=true;scene.add(floor);
 const plane=new THREE.Plane(new THREE.Vector3(1,0,0),0);let cut=false;
 let activeCutAxis='x',activeCutInvert=false;
 function applyClipping(material){
  if(Array.isArray(material)){material.forEach(applyClipping);return;}
  if(!material)return;
  const alreadyClipped=Boolean(material.clippingPlanes?.length);
  material.clippingPlanes=cut?[plane]:[];
  // Reconstruir el shader solo si pasamos de usar clipping a no usarlo, o al revés.
  if(alreadyClipped!==cut)material.needsUpdate=true;
 }
 function setCut(enabled,offset=0,axis='x',invert=false,center=null){
  const previous=cut;cut=Boolean(enabled);
  activeCutAxis=['x','y','z'].includes(axis)?axis:'x';activeCutInvert=Boolean(invert);
  const direction=activeCutInvert?-1:1;
  plane.normal.set(activeCutAxis==='x'?direction:0,activeCutAxis==='y'?direction:0,activeCutAxis==='z'?direction:0);
  const origin=center instanceof THREE.Vector3?center:bodyBounds.getCenter(new THREE.Vector3());
  plane.constant=-plane.normal.dot(origin)-Number(offset||0);
  // Modelos externos también reciben los nuevos planos, no solo BodyParts3D.
  if(previous!==cut){scene.traverse(obj=>{
   if(!obj.isMesh||obj===floor||obj.userData?.excludeAnatomyClip)return;
   applyClipping(obj.material);
  });}
  return cut;
 }
 // Ajuste real: encuadrar la geometría disponible, no una distancia fija.
 let bodyBounds=new THREE.Box3(
  new THREE.Vector3(-.335,0,-.15),new THREE.Vector3(.335,1.73,.15)
 );
 function setBodyBounds(boxes){
  const bounds=new THREE.Box3();
  for(const box of boxes||[])if(box&&!box.isEmpty())bounds.union(box);
  if(!bounds.isEmpty())bodyBounds.copy(bounds);
 }
 function camView(view='frente'){
  const dirs={frente:[0,.01,1],perfil:[1,.01,0],espalda:[0,.01,-1],perspectiva:[.28,.04,1]};
  const direction=new THREE.Vector3(...(dirs[view]||dirs.frente)).normalize();
  const center=bodyBounds.getCenter(new THREE.Vector3());
  const size=bodyBounds.getSize(new THREE.Vector3());
  const vfov=THREE.MathUtils.degToRad(camera.fov);
  const hfov=2*Math.atan(Math.tan(vfov/2)*Math.max(.1,camera.aspect));
  // El cuerpo completo ocupará aproximadamente el 83 % de la altura del visor.
  const halfH=Math.max(size.y/2,.2);
  const halfW=Math.max(size.x,size.z)/2;
  const dist=Math.max(halfH/Math.tan(vfov/2),halfW/Math.tan(hfov/2))*1.20+Math.max(size.z,.08)*.12;
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(direction,dist);
  camera.lookAt(center);
  controls.update();
 }
 // Los botones + y - respetan los límites de la cámara. La rueda se maneja
 // directamente por OrbitControls.zoomToCursor y acerca hacia el puntero.
 function zoom(factor){
  const distance=camera.position.distanceTo(controls.target);
  const next=THREE.MathUtils.clamp(distance*factor,controls.minDistance,controls.maxDistance);
  camera.position.sub(controls.target).multiplyScalar(next/distance).add(controls.target);
  camera.updateProjectionMatrix();controls.update();
 }
 let highQuality=true;
 const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,highQuality?(w<700?1.5:2):(w<700?1:1.15)));renderer.setSize(w,h,true);};
 function setQuality(high){highQuality=Boolean(high);key.shadow.mapSize.set(highQuality?2048:1024,highQuality?2048:1024);if(key.shadow.map)key.shadow.map.dispose();key.shadow.map=null;resize();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 // Cambia también el fondo del canvas WebGL; no es solamente CSS.
 // La apariencia gráfica sigue el modo Día/Noche de la interfaz.
 // Las cuatro paletas conservan su color de acento en los botones,
 // pero el visor usa fondos neutros para no alterar la lectura anatómica.
 let presetIluminacion='estudio';
 let modoActual='dia';
 const valoresLuz={
  estudio:{hemisphere:1.35,key:2.00,fill:.95,rim:.62,point:1.6,exposure:1.08},
  clinica:{hemisphere:1.7,key:1.85,fill:1.45,rim:.35,point:.95,exposure:1.10},
  suave:{hemisphere:1.7,key:1.35,fill:1.18,rim:.22,point:.75,exposure:1.02},
  contraste:{hemisphere:.85,key:2.9,fill:.48,rim:1.1,point:1.7,exposure:1.02}
 };
 function ajustarLuces(){
  const o=valoresLuz[presetIluminacion],noche=modoActual==='noche',factor=noche?.93:1;
  hemisphere.intensity=o.hemisphere*factor;key.intensity=o.key*factor;fill.intensity=o.fill*factor;
  rim.intensity=o.rim*factor;point.intensity=o.point*factor;renderer.toneMappingExposure=o.exposure*(noche?1.03:1);
 }
 function setLightingPreset(nombre){if(!valoresLuz[nombre])return; presetIluminacion=nombre;ajustarLuces();}
 function setTheme(paleta='real',modo='dia'){
  modoActual=modo;
  const dia=modo==='dia';
  const fondo=dia?'#e9ecef':'#000000';
  scene.background.set(fondo);scene.fog.color.set(fondo);
  renderer.toneMappingExposure=dia?1.12:1.20;
  hemisphere.intensity=dia?1.45:1.72;
  hemisphere.groundColor.set(dia?'#7d8795':'#434a55');
  key.color.set('#ffffff');key.intensity=dia?2.30:2.48;
  fill.color.set('#e6edff');fill.intensity=dia?1.25:1.55;
  rim.color.set('#dee6ff');rim.intensity=dia?.85:1.05;
  point.intensity=dia?4.0:5.5;
  ajustarLuces();
 }
 function screenshot(){renderer.render(scene,camera);const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='laboratorio-3d-anatomia.png';document.body.append(a);a.click();a.remove();}
 function cleanup(){observer.disconnect();controls.dispose();environment?.dispose();renderer.dispose();renderer.domElement.remove();}
 return {THREE,renderer,scene,camera,controls,host,key,fill,point,rim,hemisphere,platform,plane,setCut,applyClipping,getBodyCenter:()=>bodyBounds.getCenter(new THREE.Vector3()),camView,zoom,setBodyBounds,animateStage,setQuality,setTheme,setLightingPreset,screenshot,cleanup,get cut(){return cut;}};
}
