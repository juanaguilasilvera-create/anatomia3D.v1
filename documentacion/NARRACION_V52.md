# V52 — Corrección de narración anatómica

## Qué se ha corregido

El botón **Leer ficha** ya no lee el resumen corto de `partDescription` ni datos geométricos de las mallas. Ahora utiliza `js/narracionAnatomica.js`, que se conecta a `js/tutorVoz.js`.

- **Sistema seleccionado sin pieza:** la narración incluye función, componentes, procesos y relaciones anatómicas del grupo elegido. Por ejemplo, el sistema respiratorio explica tráquea, bronquios, bronquiolos, alvéolos, ventilación, diafragma y pleura.
- **Pieza seleccionada:** prioriza el nombre original y los detalles anatómicos identificables. Si hay una ficha más concreta, se utiliza; si no, la voz explica las funciones del tipo de tejido y el contexto del sistema **sin atribuir una función individual inventada**.
- **Agrupaciones:** se presentan como conjuntos de estructuras y se explica su sistema correspondiente; no se interpretan como un nuevo órgano.
- **Modelo externo:** no se atribuyen funciones humanas a un objeto 3D importado sin evidencia.
- **Preguntas del tutor:** «explica esta pieza» y las preguntas explícitas sobre sistemas reutilizan el narrador anatómico.

## Cobertura y limitaciones

El catálogo local tiene 2.234 piezas y 15 categorías presentes en el modelo. Se prepararon explicaciones de 18 grupos de estudio de la aplicación, incluidos grupos educativos que no son sistemas fisiológicos independientes. Las piezas que tengan un nombre concreto reconocible aprovechan explicaciones específicas ya presentes en `fichasVerificadas.js` y las reglas complementarias. Las demás reciben datos anatómicos de su categoría y del sistema correspondiente; **eso no equivale a 2.234 investigaciones anatómicas individuales**.

La voz usa la síntesis de habla del navegador (`speechSynthesis`) y **requiere una voz española disponible en Windows/Edge/Chrome**. No se necesita Kokoro ni eSpeak. La pronunciación audible real depende de tu dispositivo.

## Fuentes de consulta

- OpenStax. *Anatomy and Physiology 2e*. https://openstax.org/details/books/anatomy-and-physiology-2e
- OpenStax. *22.1 Organs and Structures of the Respiratory System*. https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system
- OpenStax. *22.2 The Lungs*. https://openstax.org/books/anatomy-and-physiology-2e/pages/22-2-the-lungs
- OpenStax. *1.2 Structural Organization of the Human Body*. https://openstax.org/books/anatomy-and-physiology/pages/1-2-structural-organization-of-the-human-body

## Pruebas de la versión

- Generación de narraciones para 2.234 piezas sin errores.
- Narraciones extensas para 18 grupos educativos.
- No se encontraron menciones de mallas, vértices o triángulos en las narraciones.
- Prueba de recorrido de botón con síntesis de voz **simulada**: sistema respiratorio, bronquio principal e iris.
- Comprobación de sintaxis JavaScript e integridad de ZIP.

No se verificó la salida acústica real de la voz de Windows ni el renderizado completo del visor WebGL dentro de Live Server.
