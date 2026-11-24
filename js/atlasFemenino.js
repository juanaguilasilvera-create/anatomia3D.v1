import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Atlas3D} from './atlas.js';
import {SISTEMAS,infoSistema} from './catalogo.js';

// Modelo científico femenino, no una deformación del masculino. CC BY 4.0.
export const URL_HRA='https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb';
const reglas=[
 ['reproductive',/uterus|uterine|ovar|fallopian|cervix|vagin|vulva|clitoris|placenta|mammary|breast/i],
 ['cartilage',/cartilag|meniscus|intervertebral disc/i],['cardiac',/heart|atrium|ventric|myocard|cardiac/i],
 ['arterial',/arter|aorta/i],['venous',/vein|vena cava|venous/i],
 ['lymphatic',/lymph|spleen|thymus|tonsil/i],
 ['nervous',/nerve|brain|spinal cord|cerebr|cerebell|ganglion/i],
 ['skeletal',/bone|\brib\b|vertebr|sternum|skull|mandib|humer|femur|pelvi|phalan|clavic|scapul|tibia|ulna|fibula|sacrum|cranium/i],
 ['muscular',/muscle|biceps|triceps|quadriceps|deltoid|tendon|ligament|gluteal/i],
 ['respiratory',/lung|trachea|bronch|larynx|pharynx|diaphragm/i],
 ['digestive',/liver|stomach|intestin|colon|rectum|appendix|gallbladder|pancreas|esophagus|duodenum|jejunum|ileum/i],
 ['urinary',/kidney|bladder|ureter|urethra|renal/i],
 ['endocrine',/thyroid|adrenal|pituitary|hypothalam/i],
 ['sensory',/eye|retina|cochlea|cornea|ear|lens/i],
 ['integumentary',/skin|epidermis|dermis|body surface|whole body|hair/i]
];
function sistema(s){for(const [id,re] of reglas)if(re.test(s))return id;return 'connective';}
function rutaNombre(m){let terms=[m.name,m.userData?.label,m.userData?.name];let par=m.parent;for(let i=0;par&&i<3;i++,par=par.parent)terms.push(par.name);return terms.filter(Boolean).join(' | ');}
export class AtlasFemenino extends Atlas3D{
 constructor(api){super(api,{parts:[],chunks:[]});this.sex='female';this.loaded=false;}
 async load(onProgress,source=URL_HRA){
  const gltf=await new Promise((resolve,reject)=>new GLTFLoader().load(source,resolve,ev=>{if(ev.total)onProgress?.(Math.round(ev.loaded/ev.total*75),0);},reject));
  const root=gltf.scene;root.updateMatrixWorld(true);
  const raw=new THREE.Box3().setFromObject(root),size=raw.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.y)||size.y<=0)throw Error('Geometría femenina inválida');
  const factor=1.75/size.y,ctr=raw.getCenter(new THREE.Vector3()),shift=new THREE.Vector3(-ctr.x*factor,-raw.min.y*factor,-ctr.z*factor);
  const meshes=[];root.traverse(o=>{if(o.isMesh&&o.geometry?.getAttribute('position'))meshes.push(o);});
  if(meshes.length<5)throw Error('No se encontraron órganos en el GLB femenino');
  const bySystem=new Map();this.parts=[];this.sourceGeos=[];this.boxes=[];this.centers=[];this.pickMeshes=[];this.offsets=[];
  for(let k=0;k<meshes.length;k++){
   const src=meshes[k],old=src.geometry,positions=old.getAttribute('position');if(positions.count<3)continue;
   const i=this.parts.length,name=String(src.userData?.name||src.name||`Estructura ${k+1}`),sys=sistema(rutaNombre(src));
   const geo=new THREE.BufferGeometry();
   const points=new Float32Array(positions.count*3);
   for(let j=0;j<positions.count;j++){points[j*3]=positions.getX(j);points[j*3+1]=positions.getY(j);points[j*3+2]=positions.getZ(j);}
   geo.setAttribute('position',new THREE.BufferAttribute(points,3));
   const originalIndex=old.getIndex();let ids;
   if(originalIndex)ids=new Uint32Array(originalIndex.array);
   else {ids=new Uint32Array(positions.count);for(let j=0;j<ids.length;j++)ids[j]=j;}
   geo.setIndex(new THREE.BufferAttribute(ids,1));
   const n=old.getAttribute('normal');if(n&&n.count===positions.count){const a=new Float32Array(points.length);for(let j=0;j<n.count;j++){a[j*3]=n.getX(j);a[j*3+1]=n.getY(j);a[j*3+2]=n.getZ(j);}geo.setAttribute('normal',new THREE.BufferAttribute(a,3));}else geo.computeVertexNormals();
   geo.applyMatrix4(src.matrixWorld);geo.scale(factor,factor,factor);geo.translate(shift.x,shift.y,shift.z);geo.computeBoundingBox();geo.computeBoundingSphere();
   if(!Number.isFinite(geo.boundingSphere.radius))continue;
   const bounds=geo.boundingBox.clone();geo.setAttribute('partIndex',new THREE.BufferAttribute(new Float32Array(positions.count).fill(i),1));
   const p={id:`HRA-F-${String(i+1).padStart(4,'0')}`,name,conceptId:'',system:sys,chunk:'GLB',vertexCount:positions.count,indexCount:ids.length,bounds:[bounds.min.toArray(),bounds.max.toArray()]};
   this.parts.push(p);this.boxes.push(bounds);this.centers.push(bounds.getCenter(new THREE.Vector3()));this.offsets.push(new THREE.Vector3());this.sourceGeos.push(geo);
   const picker=new THREE.Mesh(geo,this.pickerMaterial);picker.matrixAutoUpdate=false;picker.updateMatrixWorld(true);this.pickMeshes.push(picker);
   if(!bySystem.has(sys))bySystem.set(sys,[]);bySystem.get(sys).push(geo);
   if(k%50===0)onProgress?.(75+Math.round(k/meshes.length*15),i);
  }
  this.partById=new Map(this.parts.map((p,i)=>[p.id,i]));this.stateTexture.dispose();
  this.data=new Float32Array(2**Math.ceil(Math.log2(Math.max(1,this.parts.length)))*4);this.texWidth=this.data.length/4;
  this.stateTexture=new THREE.DataTexture(this.data,this.texWidth,1,THREE.RGBAFormat,THREE.FloatType);
  this.stateTexture.magFilter=THREE.NearestFilter;this.stateTexture.minFilter=THREE.NearestFilter;this.stateTexture.needsUpdate=true;
  for(const [system,geos] of bySystem){for(let j=0;j<geos.length;j+=48){
   const merged=mergeGeometries(geos.slice(j,j+48),false);if(!merged)throw Error('Falló combinación de mallas: '+system);
   const mesh=new THREE.Mesh(merged,this.systemMats.get(system));mesh.name=infoSistema(system).name;mesh.userData.capa=system;mesh.frustumCulled=false;mesh.receiveShadow=true;
   this.api.scene.add(mesh);this.api.applyClipping(mesh.material);this.combined.push(mesh);
  }}
  this.partCountLoaded=this.parts.length;this.loaded=true;this.recompute();onProgress?.(100,this.parts.length);
 }
}
