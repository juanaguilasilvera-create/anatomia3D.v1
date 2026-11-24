import {nombreAnatomico} from './anatomia.js';
import * as THREE from 'three';
import {infoSistema,escapar} from './catalogo.js';
const n=(v,p=4)=>Number.isFinite(v)?v.toFixed(p):'—';
const vec=v=>`(${n(v.x)}, ${n(v.y)}, ${n(v.z)})`;
function matrixString(M){const e=M.elements;return [0,1,2,3].map(r=>'│ '+[0,1,2,3].map(c=>String(n(e[c*4+r],3)).padStart(9)).join('  ')+' │').join('\n');}
function firstTriangle(mesh){const g=mesh.geometry,idx=g.getIndex(),pos=g.getAttribute('position');
 for(let t=0;t<Math.min(idx.count/3,160);t++){
  const A=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(t*3));const B=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(t*3+1));const C=new THREE.Vector3().fromBufferAttribute(pos,idx.getX(t*3+2));
  const u=new THREE.Vector3().subVectors(B,A),v=new THREE.Vector3().subVectors(C,A),raw=new THREE.Vector3().crossVectors(u,v);
  if(raw.lengthSq()>1e-14)return {A,B,C,u,v,raw,unit:raw.clone().normalize(),t};
 }return null;
}
export function metricas(atlas,api){const p=atlas.selectedPart(),mesh=atlas.selectionMesh;if(!p||!mesh)return null;
 mesh.updateMatrixWorld(true);const triangle=firstTriangle(mesh);const local=triangle?.A||new THREE.Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'),0);
 const transformed=local.clone().applyMatrix4(mesh.matrixWorld);const center=(atlas.selectionCenter||atlas.centers[atlas.selected]).clone();const movedCenter=center.clone().applyMatrix4(mesh.matrixWorld);
 const normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),normalWorld=triangle?.unit.clone().applyMatrix3(normalMatrix).normalize();
 const bounds=new THREE.Box3().setFromObject(mesh);const size=bounds.getSize(new THREE.Vector3());
 return {p,mesh,triangle,local,transformed,center,movedCenter,normalWorld,bounds,size,material:mesh.material,system:infoSistema(p.system),matrix:mesh.matrixWorld.clone(),camera:api.camera,renderer:api.renderer};
}
export function htmlEspecificaciones(atlas,api){const d=metricas(atlas,api);if(!d)return {name:'Sin selección',id:'—',desc:'Selecciona un objeto.',tags:'',grid:'',materials:''};
 const {p,system,mesh,bounds,size,material}=d;const rows=[
 ...(p.numeroMallas?[['MALLAS AGRUPADAS',p.numeroMallas.toLocaleString('es-PE')]]:[]),['VÉRTICES',p.vertexCount.toLocaleString('es-PE')],['TRIÁNGULOS',(p.indexCount/3).toLocaleString('es-PE')],
 ['ÍNDICES',p.indexCount.toLocaleString('es-PE')],['GEOMETRÍA','BufferGeometry'],['DIMENSIONES (m)',size.toArray().map(x=>n(x,3)).join(' × ')],
 ['CENTRO ACTUAL',vec(d.movedCenter)],['CAJA MÍNIMA',vec(bounds.min)],['CAJA MÁXIMA',vec(bounds.max)],
 ['LUCES DE ESCENA','1 hemisférica · 3 direccionales · 1 puntual'],['MATERIAL',material.type]
 ];
 return {name:nombreAnatomico(p).espanol,id:p.id,desc:`${p.numeroMallas?'Conjunto de '+p.numeroMallas+' mallas anatómicas disponibles':'Malla anatómica «'+nombreAnatomico(p).espanol+'»'}, clasificada dentro de ${system.name.toLowerCase()}. ${p.nota||system.description} El modelo procede de ${atlas.sex==='female'?'Human Reference Atlas femenino v1.5':'BodyParts3D 4.0'}.`,tags:`<span class="tag">${escapar(system.name)}</span><span class="tag">${escapar(p.conceptId||'Anatomía')}</span>`,
 grid:rows.map(([k,v])=>`<div class="spec"><small>${escapar(k)}</small><strong>${escapar(v)}</strong></div>`).join(''),
 materials:`<div><span>Color RGB</span><b>#${material.color.getHexString().toUpperCase()}</b></div><div><span>Rugosidad</span><b>${n(material.roughness,2)}</b></div><div><span>Metalizado</span><b>${n(material.metalness,2)}</b></div><div><span>Sombreado</span><b>Material PBR / Three.js</b></div><div><span>Iluminación</span><b>Hemisférica + 3 direccionales + 1 puntual</b></div>`};
}
function operationData(atlas){const t=atlas.transform;const center=atlas.selectionCenter||atlas.centers[atlas.selected],off=atlas.selectionPart?new THREE.Vector3():atlas.offsets[atlas.selected];
 const T=new THREE.Matrix4().makeTranslation(t.tx,t.ty,t.tz),S=new THREE.Matrix4().makeScale(t.sx,t.sy,t.sz);
 const Rx=new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(t.rx));const Ry=new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(t.ry));const Rz=new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(t.rz));
 // Euler XYZ = Rz · Ry · Rx en la composición matemática de las coordenadas.
 const R=Rz.clone().multiply(Ry).multiply(Rx);
 const lift=atlas.floatOffset||new THREE.Vector3();
 const Tcenter=new THREE.Matrix4().makeTranslation(center.x+off.x+lift.x,center.y+off.y+lift.y,center.z+off.z+lift.z);
 const Tnegative=new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z);
 return {T,S,R,Rx,Ry,Rz,Tcenter,Tnegative,t,lift};
}
export function panelMatematico(atlas,api,tab='concepto',module='transformar'){const d=metricas(atlas,api);if(!d)return '<p>Selecciona una pieza anatómica.</p>';
 const {p,local,transformed,triangle,matrix,center,normalWorld}=d;const op=operationData(atlas);

 // Cada módulo analiza la misma geometría REAL con la operación del tema elegido.
 if(module==='mallas'&&triangle){
  const titles='<h4>Producto vectorial · normal real</h4>';
  if(tab==='concepto')return titles+'<p>Los índices de la malla eligen tres vértices. Dos aristas forman un plano; su producto vectorial es perpendicular a ese triángulo.</p>';
  if(tab==='formula')return titles+'<pre>u = B − A\nv = C − A\nN = (u × v) / ||u × v||</pre>';
  if(tab==='pasos')return titles+`<p>A = ${vec(triangle.A)}</p><p>B = ${vec(triangle.B)}</p><p>C = ${vec(triangle.C)}</p><p>u = ${vec(triangle.u)}</p><p>v = ${vec(triangle.v)}</p><p>u×v = ${vec(triangle.raw)}</p>`;
  if(tab==='resultado')return titles+`<pre>Triángulo = ${triangle.t}\nN local = ${vec(triangle.unit)}\nN mundo = ${vec(normalWorld)}</pre>`;
  return titles+'<pre>const u = B.clone().sub(A);\nconst v = C.clone().sub(A);\nconst N = u.cross(v).normalize();</pre>';
 }
 if(module==='rayos'&&triangle){
  const N=normalWorld.clone(),I=new THREE.Vector3(.2,-.9,-.3).normalize();if(I.dot(N)>0)N.negate();const dot=I.dot(N),R=I.clone().addScaledVector(N,-2*dot).normalize();
  if(tab==='concepto')return '<h4>Reflexión geométrica</h4><p>Un rayo incidente se refleja alrededor de la normal a una superficie. Se usa una normal obtenida de los triángulos de la pieza; no hay trazado recursivo ni rebotes físicos.</p>';
  if(tab==='formula')return '<h4>Vector reflejado</h4><pre>R = I − 2 (I · N) N</pre><p>I es incidente y N es la normal unitaria orientada contra el rayo.</p>';
  if(tab==='pasos')return `<h4>Operación paso a paso</h4><p>I = ${vec(I)}</p><p>N = ${vec(N)}</p><p>I · N = ${n(dot,5)}</p><p>R = I − 2(${n(dot,5)})N</p>`;
  if(tab==='resultado')return `<h4>Resultado de reflexión</h4><pre>I = ${vec(I)}\nN = ${vec(N)}\nR = ${vec(R)}</pre>`;
  return '<h4>Código de reflexión</h4><pre>const R = I.clone()\n  .addScaledVector(N,-2*I.dot(N))\n  .normalize();</pre><p>Implementado en <code>js/rayos.js</code>.</p>';
 }
 if(module==='luces'&&normalWorld){
  // Una DirectionalLight tiene rayos paralelos: depende de posición − objetivo, no de cada vértice.
  api.key.updateMatrixWorld(true);api.key.target.updateMatrixWorld(true);
  const L=api.key.getWorldPosition(new THREE.Vector3()).sub(api.key.target.getWorldPosition(new THREE.Vector3())).normalize(),lambert=Math.max(0,normalWorld.dot(L));
  if(tab==='concepto')return '<h4>Luz direccional</h4><p>La intensidad difusa depende del ángulo entre la normal de la superficie y la dirección hacia la luz. El material PBR de Three.js también evalúa otros términos de iluminación.</p>';
  if(tab==='formula')return '<h4>Componente difusa · aproximación</h4><pre>I_diff ≈ I_luz · max(0, N · L)</pre>';
  if(tab==='pasos')return `<h4>Vectores de la iluminación</h4><p>N = ${vec(normalWorld)}</p><p>L = ${vec(L)}</p><p>N · L = ${n(normalWorld.dot(L))}</p>`;
  if(tab==='resultado')return `<h4>Estimación lambertiana</h4><pre>Factor angular = ${n(lambert)}\nIntensidad direccional = ${n(api.key.intensity)}\nProducto = ${n(lambert*api.key.intensity)}</pre><p>Es el término difuso aproximado, no todo el resultado PBR.</p>`;
  return '<h4>Cálculo angular</h4><pre>const L = light.getWorldPosition(new THREE.Vector3())\n .sub(light.target.getWorldPosition(new THREE.Vector3())).normalize();\nconst diffuse = Math.max(0, N.dot(L));</pre>';
 }
 if(module==='render'){
  api.camera.updateMatrixWorld(true);const PV=new THREE.Matrix4().multiplyMatrices(api.camera.projectionMatrix,api.camera.matrixWorldInverse);const MVP=PV.multiply(matrix),clip=new THREE.Vector4(local.x,local.y,local.z,1).applyMatrix4(MVP),ndc=new THREE.Vector3(clip.x/clip.w,clip.y/clip.w,clip.z/clip.w);
  if(tab==='concepto')return '<h4>Pipeline de renderizado</h4><p>La GPU transforma coordenadas locales a mundo, cámara y clip. Tras dividir entre W se obtiene una posición en coordenadas normalizadas del dispositivo (NDC).</p>';
  if(tab==='formula')return '<h4>Proyección perspectiva</h4><pre>P_clip = P_projection · V · M · P_local\nP_ndc = P_clip.xyz / P_clip.w</pre>';
  if(tab==='pasos')return `<h4>Transformación al espacio de clip</h4><p>P_local = ${vec(local)}</p><p>P_mundo = ${vec(transformed)}</p><p>P_clip = (${n(clip.x)}, ${n(clip.y)}, ${n(clip.z)}, ${n(clip.w)})</p>`;
  if(tab==='resultado')return `<h4>Coordenadas de pantalla normalizadas</h4><pre>NDC = ${vec(ndc)}\nCámara fov = ${n(api.camera.fov,1)}°\nAspecto = ${n(api.camera.aspect,3)}</pre>`;
  return '<h4>Código de proyección</h4><pre>const MVP = camera.projectionMatrix.clone()\n .multiply(camera.matrixWorldInverse)\n .multiply(mesh.matrixWorld);\nconst clip = vec4.applyMatrix4(MVP);</pre>';
 }
 if(module==='materiales'){
  const m=d.material;
  if(tab==='concepto')return '<h4>Material físicamente inspirado</h4><p>MeshStandardMaterial utiliza un modelo PBR simplificado. La rugosidad modifica el ancho de la reflexión y el metalizado mezcla comportamiento dieléctrico y conductor.</p>';
  if(tab==='formula')return '<h4>Propiedades PBR</h4><pre>roughness ∈ [0,1]\nmetalness ∈ [0,1]\nF_0 ≈ mix(0.04, color, metalness)</pre><p>La expresión F₀ es una aproximación conceptual del modelo de reflectancia.</p>';
  if(tab==='pasos')return `<h4>Parámetros aplicados</h4><p>Color de base: #${m.color.getHexString()}</p><p>Rugosidad: ${n(m.roughness)}</p><p>Metalizado: ${n(m.metalness)}</p>`;
  if(tab==='resultado')return `<h4>Material del objeto</h4><pre>color = #${m.color.getHexString()}\nroughness = ${n(m.roughness)}\nmetalness = ${n(m.metalness)}</pre>`;
  return '<h4>Modificación real del material</h4><pre>mesh.material.color.set(color);\nmesh.material.roughness = roughness;\nmesh.material.metalness = metalness;</pre>';
 }
 if(module==='modelado'){
  if(tab==='concepto')return `<h4>Malla anatómica de origen</h4><p>La pieza ${escapar(nombreAnatomico(p).espanol)} es una superficie poligonal importada: sus puntos no son primitivas genéricas. Se reconstruye desde el archivo binario del atlas.</p>`;
  if(tab==='formula')return `<h4>Malla + matriz del objeto real</h4><pre>V = {v0, v1, ...}\nF = {(i0,i1,i2), ...}\nN = normalize((B-A)×(C-A))\nP′ = M · P\nM = T(c + e + ℓ) · T(d) · R · S · T(−c)</pre><strong>matrixWorld (actual)</strong><pre>${matrixString(matrix)}</pre>`;
  if(tab==='pasos')return `<h4>Procedimiento sobre la pieza</h4><p>1. Leer posiciones del búfer de la pieza ${escapar(p.id)} (${p.vertexCount} vértices).</p><p>2. Leer ${p.indexCount} índices que forman ${p.indexCount/3} triángulos.</p><p>3. Obtener el primer vértice válido: ${vec(local)}.</p><p>4. Aplicar la matriz de mundo: ${vec(transformed)}.</p><p>5. Desplazamiento de levitación ℓ: ${vec(op.lift)}.</p>`;
  if(tab==='resultado')return `<h4>Geometría y cálculo del órgano</h4><pre>ID: ${escapar(p.id)}\nVértices: ${p.vertexCount}\nTriángulos: ${p.indexCount/3}\nP (local): ${vec(local)}\nℓ (levita): ${vec(op.lift)}\nP′ (mundo): ${vec(transformed)}\nN′ (normal): ${normalWorld?vec(normalWorld):'—'}</pre><strong>MATRIZ REAL (matrixWorld)</strong><pre>${matrixString(matrix)}</pre><p class="result">Datos extraídos de su malla y transformación actual en Three.js.</p>`;
  return '<h4>Reconstrucción del buffer</h4><pre>geometry.setAttribute(\n "position", new THREE.BufferAttribute(vertices,3));\ngeometry.setIndex(indices);\ngeometry.setAttribute("normal",normales);</pre>';
 }
 const title=`<h4>${escapar(nombreAnatomico(p).espanol)} · matemáticas reales</h4>`;
 if(tab==='concepto')return title+`<p><strong>Representación:</strong> una malla tiene vértices <code>position</code>, normales <code>normal</code> e índices triangulares <code>index</code>.</p><p><strong>Transformación:</strong> el punto original se multiplica por la matriz <code>matrixWorld</code> que utiliza Three.js al dibujar esta pieza.</p><p><strong>Orden de composición:</strong> primero desplazamos el objeto al origen de su centro, escalamos, rotamos, trasladamos según los controles y recuperamos el centro anatómico.</p><p><strong>Normal:</strong> calculamos dos aristas de un triángulo y luego el producto vectorial. Para transformarla usamos la matriz inversa transpuesta del bloque lineal.</p>`;
 if(tab==='formula')return title+`<strong>Transformación homogénea</strong><pre>P′ = M · P
M = T(c + e + ℓ) · T(d) · R · S · T(−c)
P = [ x, y, z, 1 ]ᵀ</pre><strong>Traslación T(d)</strong><pre>${matrixString(op.T)}</pre><strong>Escala S</strong><pre>${matrixString(op.S)}</pre><strong>Rotación XYZ</strong><pre>${matrixString(op.R)}</pre><strong>Normal de triángulo</strong><pre>N = normalize((B − A) × (C − A))</pre>`;
 if(tab==='pasos')return title+`<p><b>1.</b> Se extrae un vértice real de la malla: <code>${vec(local)}</code>.</p><p><b>2.</b> Se calcula su centro anatómico: <code>${vec(center)}</code>.</p><p><b>3.</b> Se genera la matriz <code>M = T(c+e+ℓ)·T(d)·R·S·T(−c)</code> con los mismos valores de los deslizadores.</p><p><b>4.</b> Three.js aplica la matriz y el resultado es <code>${vec(transformed)}</code>.</p>${triangle?`<p><b>5.</b> Para el triángulo ${triangle.t}, calculamos <code>B−A = ${vec(triangle.u)}</code> y <code>C−A = ${vec(triangle.v)}</code>.</p><p><b>6.</b> Producto vectorial sin normalizar: <code>${vec(triangle.raw)}</code>.</p>`:''}`;
 if(tab==='resultado')return title+`<strong>MATRIZ REAL DEL OBJETO · matrixWorld</strong><pre>${matrixString(matrix)}</pre><strong>VÉRTICE DE ENTRADA</strong><pre>A = ${vec(local)}</pre><strong>VÉRTICE TRANSFORMADO</strong><pre>A′ = ${vec(transformed)}</pre><strong>NORMAL UNITARIA</strong><pre>N = ${triangle?vec(triangle.unit):'No disponible'}
N′ mundo = ${normalWorld?vec(normalWorld):'No disponible'}</pre><p class="result">Los números cambian al mover, girar o escalar la pieza.</p>`;
 return title+`<strong>Fragmento funcional equivalente al código usado</strong><pre>const M = new THREE.Matrix4()
  .makeTranslation(c.x+e.x+l.x, c.y+e.y+l.y, c.z+e.z+l.z)
  .multiply(new THREE.Matrix4().compose(
    delta, quaternionEulerXYZ, escala))
  .multiply(new THREE.Matrix4()
    .makeTranslation(-c.x,-c.y,-c.z));
mesh.matrix.copy(M);
mesh.updateMatrixWorld(true);
const Pfinal = P.clone().applyMatrix4(mesh.matrixWorld);

const N = B.clone().sub(A)
  .cross(C.clone().sub(A)).normalize();</pre><p>El código de ejecución está en <code>js/atlas.js</code>, método <code>_applyTransform()</code>; el análisis está en <code>js/matematicas.js</code>.</p>`;
}
