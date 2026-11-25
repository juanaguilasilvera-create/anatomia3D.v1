import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fichaComponente} from '../js/fichasComponentes.js';
import {normalizarClasificacion} from '../js/clasificacion.js';
import {grupoMaterialOcular} from '../js/ojoColor.js';
const parts=JSON.parse(fs.readFileSync(new URL('../modelos/atlas.json',import.meta.url))).parts;
const counts={};
for(const p of parts){normalizarClasificacion(p);const f=fichaComponente(p);assert(f.nombre&&f.descripcion&&f.funcion&&f.estructura,p.name);counts[p.system]=(counts[p.system]||0)+1;}
for(const lado of ['left','right']){const piezas=parts.filter(p=>new RegExp('^(?:optic part of |anterior chamber of )?'+lado+' ').test(p.name.toLowerCase())&&grupoMaterialOcular(p)?.startsWith('ojo-'));assert(piezas.length>0);assert(piezas.some(p=>p.name.toLowerCase()===lado+' corona ciliaris'));console.log(lado,piezas.length,'candidatos oculares');}
console.log('Fichas comprobadas:',parts.length,counts);
