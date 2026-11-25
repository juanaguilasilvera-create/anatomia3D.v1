import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizarClasificacion} from '../js/clasificacion.js';
import {GRUPOS_3D,indicesDeGrupo} from '../js/gruposAnatomicos.js';
import {prepararBusqueda,puntuarBusqueda} from '../js/motorBusqueda.js';
import {crearBuscadorAnatomico} from '../js/buscadorAnatomico.js';
const parts=JSON.parse(fs.readFileSync(new URL('../modelos/atlas.json',import.meta.url))).parts;parts.forEach(normalizarClasificacion);
const ids=indicesDeGrupo(parts,'cerebro');assert.equal(ids.length,58);assert(ids.every(i=>parts[i].system==='nervous'&&!/eye|ear|eyeball|cornea|retina/i.test(parts[i].name)));
assert(puntuarBusqueda(prepararBusqueda('cerebro'),'Cerebro y encéfalo',{difusa:false})>0);
assert.equal(puntuarBusqueda(prepararBusqueda('external ear'),'cerebro',{difusa:false}),0);
// Simulated DOM: drive the real search handlers including Enter and a misleading external result.
const mk=()=>({value:'',hidden:true,innerHTML:'',handlers:{},setAttribute(){},removeAttribute(){},addEventListener(k,f){this.handlers[k]=f;},querySelector(){return null;},querySelectorAll(){return [];}});
const input=mk(),panel=mk(),clear=mk();globalThis.document={getElementById:id=>({partSearch:input,searchResults:panel,limpiarBusqueda:clear}[id]),activeElement:input,addEventListener(){}};
let selected=null;const b=crearBuscadorAnatomico({obtenerAtlas:()=>({parts}),seleccionar:i=>{selected=parts[i].name;},verSistema:()=>{},verConjunto:id=>{selected=id;return true;},contextoExterno:()=> 'profesional',buscarExterno:()=>[{i:1,nombre:'External ear',aproximado:true}],seleccionarExterno:()=>{selected='external';}});b.actualizar();
for(const q of ['cerebro','encéfalo','brain','Cerebro y encéfalo','cerebro completo']){input.value=q;input.handlers.input();assert(panel.innerHTML.includes('Cerebro y encéfalo'));input.handlers.keydown({key:'Enter',preventDefault(){}});assert.equal(selected,'cerebro',q);}
input.value='ojo';input.handlers.input();input.handlers.keydown({key:'Enter',preventDefault(){}});assert.equal(selected,'ojos');
console.log('Búsqueda: 5 consultas cerebrales, consulta ocular, prioridad de conjunto y 58 mallas encefálicas correctas.');
