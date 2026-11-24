import * as THREE from 'three';

// El control usa las transformaciones de la malla seleccionada y no crea geometría adicional.
// E: explorar / G: trasladar / R: rotar / S: escalar. Arrastre izquierdo en modo edición.
export function crearHerramientasMouse(api, obtenerAtlas, alCambiar, avisar, cancelarEnfoque=()=>{}){
  let modo='explorar', arrastre=null;
  const lienzo=api.renderer.domElement;
  const botones=[...document.querySelectorAll('[data-gesto]')];
  const estado=document.getElementById('gestoEstado');
  const etiquetas={explorar:'Explorar el cuerpo',mover:'Trasladar pieza · arrastrar',rotar:'Rotar pieza · arrastrar',escalar:'Escalar pieza · arrastrar'};
  const raycaster=new THREE.Raycaster();
  const puntero=new THREE.Vector2();
  const normal=new THREE.Vector3();
  const plano=new THREE.Plane();
  function posicionMundo(e){
    const rect=lienzo.getBoundingClientRect();
    puntero.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
    raycaster.setFromCamera(puntero,api.camera);
    return raycaster.ray.intersectPlane(plano,new THREE.Vector3());
  }
  function activar(siguiente){
    if(!(siguiente in etiquetas))return;
    if(siguiente!=='explorar'&&!obtenerAtlas()?.selectionMesh){avisar('Primero selecciona una estructura del cuerpo');return;}
    modo=siguiente;arrastre=null;api.controls.enabled=true;
    botones.forEach(b=>{const activo=b.dataset.gesto===modo;b.classList.toggle('active',activo);b.setAttribute('aria-pressed',String(activo));});
    estado.textContent=etiquetas[modo];
    lienzo.style.cursor=modo==='explorar'?'grab':modo==='mover'?'move':modo==='rotar'?'crosshair':'ns-resize';
  }
  function comenzar(e){
    if(modo==='explorar'||e.button!==0)return;
    const atlas=obtenerAtlas();if(!atlas?.selectionMesh)return activar('explorar');
    e.preventDefault();e.stopImmediatePropagation();
    const centro=atlas.centers[atlas.selected].clone().applyMatrix4(atlas.selectionMesh.matrixWorld);
    normal.set(0,0,1).applyQuaternion(api.camera.quaternion);
    plano.setFromNormalAndCoplanarPoint(normal,centro);
    cancelarEnfoque();
    arrastre={id:e.pointerId,x:e.clientX,y:e.clientY,inicio:{...atlas.transform},mundo:posicionMundo(e)};
    api.controls.enabled=false;
    lienzo.setPointerCapture?.(e.pointerId);
  }
  function mover(e){
    if(!arrastre||arrastre.id!==e.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();
    const atlas=obtenerAtlas();if(!atlas?.selectionMesh){terminar(e);return;}
    const dx=e.clientX-arrastre.x,dy=e.clientY-arrastre.y;
    const base=arrastre.inicio;
    if(modo==='mover'){
      const actual=posicionMundo(e);
      if(actual&&arrastre.mundo){
        const d=actual.sub(arrastre.mundo);
        atlas.transform.tx=THREE.MathUtils.clamp(base.tx+d.x,-.5,.5);
        atlas.transform.ty=THREE.MathUtils.clamp(base.ty+d.y,-.5,.5);
        atlas.transform.tz=THREE.MathUtils.clamp(base.tz+d.z,-.5,.5);
      }
    } else if(modo==='rotar'){
      atlas.transform.ry=THREE.MathUtils.clamp(base.ry+dx*.36,-180,180);
      atlas.transform.rx=THREE.MathUtils.clamp(base.rx+dy*.36,-180,180);
    } else if(modo==='escalar'){
      const factor=Math.exp((dx-dy)*.008);
      for(const eje of ['sx','sy','sz'])atlas.transform[eje]=THREE.MathUtils.clamp(base[eje]*factor,.35,2.5);
    }
    atlas._applyTransform();atlas.onChange();alCambiar();
  }
  function terminar(e){
    if(!arrastre||arrastre.id!==e.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();
    arrastre=null;api.controls.enabled=true;
    if(lienzo.hasPointerCapture?.(e.pointerId))lienzo.releasePointerCapture(e.pointerId);
  }
  lienzo.addEventListener('pointerdown',comenzar,true);
  lienzo.addEventListener('pointermove',mover,true);
  lienzo.addEventListener('pointerup',terminar,true);
  lienzo.addEventListener('pointercancel',terminar,true);
  botones.forEach(b=>b.addEventListener('click',()=>activar(b.dataset.gesto)));
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(!document.getElementById('menuPreferencias')?.hidden)return;
    const mapa={e:'explorar',g:'mover',r:'rotar',s:'escalar'};
    const accion=mapa[e.key.toLowerCase()];if(accion){activar(accion);e.preventDefault();}
  });
  activar('explorar');
  return {activar,get modo(){return modo;}};
}
