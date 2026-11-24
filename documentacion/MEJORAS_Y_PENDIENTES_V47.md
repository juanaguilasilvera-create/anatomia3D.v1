# V47: cobertura de fichas, interfaz y pendientes comprobados

## Cambios incorporados

- Para las 2.234 mallas locales de `modelos/atlas.json` se creó un registro de ficha en `js/fichasComponentes.js`, indexado por el ID original de BodyParts3D 4.0. No se alteran las mallas ni las fuentes científicas incluidas.
- La ficha inferior derecha muestra el nombre traducido, grupo, tipo, región anatómica orientativa, lateralidad, descripción, organización, función y metadatos de la malla (FMA, ID de pieza, vértices y triángulos).
- El tutor y la ficha siguen unificados. El botón `Leer ficha` narra estos datos mediante una única voz española disponible en el navegador. No se requieren Kokoro, eSpeak NG ni ElevenLabs.
- El `index.html` usa iconos SVG para evitar cuadros o símbolos extraños causados por fuentes incompatibles. Se conserva el diseño adaptativo y las pestañas inferiores.
- Se dio prioridad correcta a las cavidades ventriculares del encéfalo: cinco elementos están agrupados como `cardiac` en el inventario de origen, pero se describen como cavidades encefálicas cuando se consultan.

## Qué significa que las 2.234 mallas tengan ficha

Todas las mallas tienen datos de identificación, tipología y geometría; función/ubicación indicativa se deduce de la denominación y clasificación. La existencia de ficha NO significa que se verificaron clínicamente 2.234 descripciones individualizadas: ciertas piezas (ramas arteriales, venas, músculos pequeños, regiones de un órgano) reciben una explicación **general de su categoría**, expresamente rotulada. Algunas ubicaciones no pueden establecerse solo con el nombre, por lo que se declaran como no confirmadas. El usuario puede revisar el ID FMA y el nombre científico original para investigación posterior.

## Qué faltaría para un atlas aún más completo

1. **Revisión bibliográfica por cada malla**: comprobar ubicación exacta, trayecto, relaciones, vascularización, inervación y bibliografía a nivel de pieza, especialmente en los más de mil vasos/ramas.
2. **Modelos faltantes**: cobertura 3D del atlas original es parcial; un sistema puede contener estructuras omitidas y el cuerpo femenino depende de modelos externos opcionales. No es correcto generar geometrías inventadas para ocultar esos vacíos.
3. **Pruebas end-to-end en Windows**: abrir Live Server y verificar movimiento, búsqueda, lectura, selección, pestañas y cambios de tamaño con Three.js cargado. La voz española dependerá de las voces disponibles en Windows y el navegador.
4. **Dependencias 3D offline**: instalar localmente Three.js mediante `INSTALAR_DEPENDENCIAS_WINDOWS.bat` para no depender del CDN al abrir el laboratorio desconectado.
5. **Información anatómica para los GLB externos**: poseen metadatos variables; sin una base validada con identificadores, se muestran su nombre y datos geométricos, pero no se afirma disponer de fichas clínicas individuales.

## Comprobaciones estáticas

El catálogo cubre 2.234 IDs únicos, sin fichas vacías; se validó UTF-8 del `index.html`, ausencia de IDs HTML duplicados, y la sintaxis de todos los módulos JavaScript. Las comprobaciones con navegador real no pudieron completarse en este entorno porque bloquea conexiones locales; esto no es una garantía de funcionamiento visual o de audio en Windows.
