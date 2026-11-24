/** Paleta anatómica educativa basada en el nombre de las mallas originales.
 * No altera su identificación, escala ni posición real. */
export const PERFILES_OCULARES = Object.freeze({
 'ojo-cornea':{nombre:'Córnea',color:'#c5eaff',roughness:.11,opacity:.46,transparent:true,depthWrite:false,clearcoat:.8},
 'ojo-iris':{nombre:'Iris',color:'#2890b0',roughness:.34,clearcoat:.32},
 'ojo-cristalino':{nombre:'Cristalino',color:'#dfebee',roughness:.13,opacity:.72,transparent:true,depthWrite:false,clearcoat:.5},
 'ojo-retina':{nombre:'Retina',color:'#f08e3a',roughness:.53,side:'double'},
 'ojo-coroides':{nombre:'Coroides',color:'#8f3045',roughness:.48},
 'ojo-esclerotica':{nombre:'Esclerótica',color:'#e8e7df',roughness:.57},
 'ojo-ciliar':{nombre:'Cuerpo ciliar',color:'#bf625b',roughness:.51},
 'ojo-vitreo':{nombre:'Humor vítreo',color:'#a8ddec',roughness:.18,opacity:.24,transparent:true,depthWrite:false},
 'ojo-zonulas':{nombre:'Fibras zonulares',color:'#f0d5ad',roughness:.59},
 'ojo-acuoso':{nombre:'Humor acuoso',color:'#83c8e8',roughness:.16,opacity:.2,transparent:true,depthWrite:false},
 'ojo-lagrimal':{nombre:'Sistema lagrimal',color:'#e8a0be',roughness:.43},
 'ojo-parpado':{nombre:'Estructura palpebral',color:'#cd9c82',roughness:.7},
 'ojo-nervio':{nombre:'Nervio óptico',color:'#e8d9ad',roughness:.64},
 'ojo-otro':{nombre:'Estructura ocular',color:'#ba9184',roughness:.6},
 'sensor-oido':{nombre:'Oído externo',color:'#dda28c',roughness:.52},
 'sensor-otros':{nombre:'Estructura sensorial',color:'#c3a4d7',roughness:.61}
});
export function grupoMaterialOcular(p){
 const n=String(p?.name||'').toLowerCase();
 if(/optic nerve/.test(n))return 'ojo-nervio';
 if(p?.system==='sensory'&&/external ear|auricle|cochlea|semicircular canal|auditory/.test(n))return 'sensor-oido';
 if(p?.system==='sensory'&&/choroid plexus|retinaculum|lacrimal bone/.test(n))return 'sensor-otros';
 if(!/^(left|right)\b/.test(n)&&!/^(optic part of|anterior chamber)/.test(n))return null;
 if(/cornea/.test(n))return 'ojo-cornea';
 if(/\biris\b/.test(n))return 'ojo-iris';
 if(/\blens\b/.test(n))return 'ojo-cristalino';
 if(/retina/.test(n))return 'ojo-retina';
 if(/choroid/.test(n)&&!/plexus/.test(n))return 'ojo-coroides';
 if(/sclera/.test(n))return 'ojo-esclerotica';
 if(/ciliar/.test(n))return 'ojo-ciliar';
 if(/vitreous/.test(n))return 'ojo-vitreo';
 if(/suspensory ligament/.test(n))return 'ojo-zonulas';
 if(/anterior chamber/.test(n))return 'ojo-acuoso';
 if(/lacrimal|nasolacrimal/.test(n))return 'ojo-lagrimal';
 if(/tarsal plate|eyelid/.test(n))return 'ojo-parpado';
 if(/tendinous ring/.test(n))return 'ojo-otro';
 return p?.system==='sensory'?'sensor-otros':null;
}
export const DESCRIPCIONES_OCULARES = Object.freeze({
 'ojo-cornea':'Capa transparente situada delante del iris. Protege el interior del ojo y aporta buena parte de la refracción de la luz.',
 'ojo-iris':'Diafragma pigmentado que regula el tamaño de la pupila y la cantidad de luz que entra.',
 'ojo-cristalino':'Lente biconvexa detrás del iris. Cambia su curvatura para enfocar imágenes a diferentes distancias.',
 'ojo-retina':'Capa sensorial con fotorreceptores que convierten la luz en señales eléctricas.',
 'ojo-coroides':'Capa vascular situada entre la retina y la esclerótica. Nutre tejidos oculares y absorbe luz dispersa.',
 'ojo-esclerotica':'Cubierta externa resistente, generalmente blanca, que da protección y forma al globo ocular.',
 'ojo-ciliar':'Estructuras relacionadas con la acomodación del cristalino y la producción de humor acuoso.',
 'ojo-vitreo':'Gel transparente que ocupa gran parte del interior del ojo y ayuda a conservar su forma.',
 'ojo-zonulas':'Fibras que suspenden el cristalino y transmiten fuerzas desde el cuerpo ciliar.',
 'ojo-acuoso':'Líquido transparente que llena las cámaras anterior y posterior y contribuye a la nutrición de tejidos avasculares.',
 'ojo-nervio':'Conduce información visual desde las células ganglionares retinianas hacia el encéfalo.',
 'ojo-lagrimal':'Estructuras implicadas en la producción, distribución y drenaje de la película lagrimal.',
 'ojo-parpado':'Estructura de soporte del párpado que ayuda a proteger y lubricar el ojo.',
 'ojo-otro':'Estructura de soporte relacionada con los movimientos del globo ocular.',
 'sensor-oido':'Pabellón auditivo que ayuda a recoger y dirigir las ondas sonoras al conducto auditivo externo.',
 'sensor-otros':'Estructura incluida en el grupo de visualización sensorial. Consulta su clasificación original para conocer su función precisa.'
});
export function materialOcular(THREE,grupo,extra={}){
 const c=PERFILES_OCULARES[grupo]||PERFILES_OCULARES['ojo-otro'];
 return new THREE.MeshPhysicalMaterial({
  color:c.color,metalness:0,roughness:c.roughness,clearcoat:c.clearcoat??.12,clearcoatRoughness:.28,
  transparent:!!c.transparent,opacity:c.opacity??1,depthWrite:c.depthWrite!==false,
  side:THREE.DoubleSide,...extra
 });
}
