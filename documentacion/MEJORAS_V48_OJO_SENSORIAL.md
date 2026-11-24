# V48 · Ojo y representación sensorial

## Objetivo de la actualización

En la interfaz se usa **Laboratorio Anatómico 3D** / **Exploración anatómica** en lugar de «Atlas». Los términos `atlas.json`, `Atlas3D`, `BodyParts3D`, `Z-Anatomy` y Human Reference Atlas pueden permanecer en rutas, comentarios técnicos o créditos porque son nombres de archivos, clases y fuentes que no se deben falsear ni romper.

## Vista detallada del ojo

1. Elegir el **Sistema sensorial** en el panel de anatomía.
2. Pulsar **Explorar ojo 3D por capas**. También se puede buscar **ojos** y abrir el conjunto.
3. Elegir ojo izquierdo o derecho. Arrastrar el modelo para girarlo, usar la rueda para ampliar y el control **Separación de capas** para mostrar los componentes separados como en una lámina de estudio.
4. Pulsar una pieza o su nombre de la lista. La ficha común del tutor se actualiza con sus datos; desde allí pulsar **Leer ficha** para escucharla en español si Windows/navegador dispone de una voz en español.
5. Pulsar **Cerrar** para regresar al visor corporal. Al elegir otro sistema o volver al cuerpo completo también se cierra la vista ocular.

## Materiales visuales

Córnea (azul claro translúcido), iris (azul con pigmentación radial procedural), cristalino (gris perla translúcido), retina (naranja), coroides (rojo oscuro), esclerótica (blanco marfil), fibras zonulares (crema), cuerpo ciliar (rosado), humor vítreo (azul translúcido) y nervio óptico (dorado pálido). El oído externo, cuando existe, recibe una coloración independiente. Los colores son didácticos; no representan coloración microscópica universal ni datos individuales del paciente.

## Geometría y límites

- La fuente original **BodyParts3D 4.0** (2.234 mallas) permanece intacta.
- En la nueva vista detallada, varias superficies del ojo se subdividen una vez: cada triángulo se interpola en cuatro sin modificar los vértices de la malla original. Esta operación suaviza la presentación, pero NO incorpora detalle anatómico que la fuente no tenía. No se hace una simulación óptica fisiológica ni una reconstrucción clínica.
- Las piezas no presentes en los modelos no se inventan. Algunas estructuras, como los nervios ópticos, pueden aparecer en más de una malla de origen.
- El resto de herramientas (sistemas, modo 2D, tutor, matemáticas y controles 3D) se conserva.

## Verificación y requisitos

- Se verificó la sintaxis de todos los módulos JS con Node, la integridad del manifiesto (2.234 mallas) y los identificadores HTML sin duplicados.
- El editor funciona en Live Server. Three.js 0.178.0 debe estar disponible de la instalación local `vendor/three/` o desde la CDN; usar `INSTALAR_DEPENDENCIAS_WINDOWS.bat` si se desea uso sin internet.
- Esta entrega no dispone de una prueba de renderizado completa en Chromium porque el navegador del entorno de prueba bloqueó el servidor local. Revisar en Chrome o Edge: ojo izquierdo, ojo derecho, materiales, clics de lista, ficha, cierre, regreso al cuerpo, modo día/noche y rendimiento del equipo.

## Archivos cambiados

`index.html`, `css/v48.css`, `js/ojoColor.js`, `js/ojoDetallado.js`, `js/atlas.js`, `js/main.js`, `js/gruposAnatomicos.js`, `js/fichasComponentes.js` y textos breves de interfaz. No se eliminaron licencias ni modelos.
