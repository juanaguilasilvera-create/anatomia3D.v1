# Laboratorio Anatómico 3D — V51

## Cambios aplicados

- El tutor utiliza solo la voz española de Web Speech API; no depende de Kokoro, ElevenLabs ni eSpeak NG.
- El nombre de la voz del sistema ya no aparece visualmente. Los avisos de error de reproducción sí se mantienen.
- La función «Leer ficha» utiliza el catálogo de datos anatómicos, no el texto truncado del panel; la transcripción completa permanece oculta.
- La pestaña de Anatomía muestra «Qué es», «Qué hace», «Ubicación», «Organización» y «Relaciones anatómicas» cuando hay datos identificados con seguridad.
- Fuentes, identificadores, límites de la información y datos de triángulos se encuentran en un bloque desplegable.
- Se unificó la información para el lector y la ficha local y se añadieron fichas para estructuras identificables de modelos GLB adicionales.
- El indicador de modelos adicionales explica cuántos están cargados de siete; los recursos que falten requieren instalación y descarga.
- Se mantuvieron los importadores GitHub, matemáticas, búsqueda, modelos 3D, explorador ocular y favoritos.

## Alcance de datos

El catálogo base incluye 2234 registros con nomenclatura y geometría. `js/fichasVerificadas.js` añade 139 temas de anatomía general identificables por coincidencia restringida con el nombre original, y en el catálogo actual se corresponden con 464 mallas. **No equivale a 2234 fichas individualmente verificadas**. Las mallas restantes conservan información descriptiva limitada a su clasificación y los datos de origen cuando los tienen. Si una malla corresponde a una cabeza o parte de un músculo, la función del conjunto no se presenta como una función exclusiva de esa subparte.

## Fuentes para ampliar y revisar

- OpenStax, *Anatomy and Physiology 2e* (CC BY 4.0): https://openstax.org/details/books/anatomy-and-physiology-2e
- NCBI Bookshelf / StatPearls (textos de anatomía general): https://www.ncbi.nlm.nih.gov/books/
- Datos de identificación y geometría: BodyParts3D y créditos incluidos en `/creditos/`.

Las explicaciones añadidas son síntesis educativas redactadas para este programa. No son diagnósticos ni una revisión clínica individual de cada objeto. Para añadir nuevas fichas específicas, usa el nombre original de la malla y verifica la anatomía con las referencias apropiadas.

## Uso

1. Descomprime el ZIP y abre `index.html` con Live Server en VS Code.
2. Selecciona una estructura desde el visor 3D o el buscador.
3. En el panel derecho, pulsa «Leer ficha» para narrar la descripción completa. «Detener» cancela la lectura.
4. En la pestaña inferior «Anatomía», consulta los apartados específicos. Abre «Fuentes, alcance y datos del modelo» solo cuando necesites detalles técnicos.
5. Si no hay voz en español, instala una voz española en Windows y abre el laboratorio en Edge o Chrome.

## Pruebas de esta versión

- Sintaxis de los 33+ módulos JavaScript comprobada con Node.js.
- Para las 2234 mallas se generó un texto narrable con función y descripción no vacías.
- Se comprobaron los identificadores HTML duplicados y que los binarios originales se conservaron.
- **No fue posible efectuar una prueba visual con Chromium en este entorno**, que rechazó el acceso a localhost y a archivos locales. Recomendado probar con Live Server en Windows.
