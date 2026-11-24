# Laboratorio Anatómico 3D · V53 — Levitación revisada y pruebas

Actualización correctiva sobre V52. La levitación de piezas se hace perceptible y reversible, conserva el estado del botón al cambiar de estructura y funciona también en piezas seleccionadas de modelos profesionales o importados desde GitHub. Se corrige la visibilidad de capas femeninas y se deja el botón Levitación accesible desde la barra del visor. No se elimina ningún modelo o módulo anatómico.

**Abrir:** `index.html` con Live Server. La voz española usa el navegador y no requiere Kokoro ni eSpeak NG. La primera ejecución puede requerir conexión a Three.js; como alternativa, ejecuta `INSTALAR_DEPENDENCIAS_WINDOWS.bat`.

**Pruebas y límites:** consulta `documentacion/VERIFICACION_V53_Y_CORRECCIONES.md`. Los modelos originales se verificaron; las interacciones reales con WebGL en Windows siguen pendientes.

---

# Laboratorio Anatómico 3D · V50

La pestaña inferior derecha **Anatomía** ahora incluye herramientas compactas de estudio: resumen contextual, copiar ficha, favoritos persistidos en este navegador, lista de selecciones recientes y comparación de dos estructuras. **Comparar** fija la pieza inicial: después selecciona otra en el visor; pulsa el mismo botón para finalizar. Para visitar un guardado abre «Favoritos y consultas recientes» y elige la pieza. Los favoritos funcionan con el modelo humano local; los archivos externos solo permiten consultar/copiar sus metadatos, nunca se reclasifican como anatomía.

El contenido procede de las fichas y mallas ya presentes. Las funciones generales orientativas siguen sin equivaler a datos clínicos individuales verificados. Las vistas Matemáticas y Herramientas, voz española, importación GitHub, ojo por capas y modelos existentes se conservan.

# Laboratorio Anatómico 3D · V49

**Novedad: importar desde GitHub directamente al visor 3D, igual que el dragón de fantasía y sin asignar modelos a sistemas anatómicos.** Desde el selector superior «Modelo 3D», elige «＋ Importar modelo desde GitHub…», pega el enlace público de un repositorio, pulsa «Buscar modelos», elige el archivo y pulsa «Mostrar en el visor 3D». El modelo importado se añade al selector para poder abrirlo otra vez durante la sesión.

Consulta `documentacion/IMPORTAR_GITHUB_V49.md` para formatos, límites y solución de problemas.

# Laboratorio Anatómico 3D · V48

Para explorar el ojo humano con materiales y despiece 3D, selecciona **Sistema sensorial** y después **Explorar ojo 3D por capas**. Consulta `documentacion/MEJORAS_V48_OJO_SENSORIAL.md` para los pasos y límites técnicos.

# Laboratorio Anatómico 3D · Versión V47

**Abrir:** extrae este ZIP y abre `index.html` desde Live Server de VS Code, preferiblemente en Microsoft Edge o Chrome. Si Three.js no puede cargar sin internet, ejecuta `INSTALAR_DEPENDENCIAS_WINDOWS.bat` para preparar las librerías locales.

## Fichas para todas las 2.234 mallas locales

1. Selecciona cualquier pieza del cuerpo en el visor o desde la lista de un sistema.
2. Lee su resumen en **Ficha anatómica + tutor** y sus datos detallados en la pestaña inferior derecha **Anatomía**.
3. Pulsa **Leer ficha** para escuchar en español su descripción, tipo, región, lateralidad, organización y función.
4. Pulsa **Detener** para cortar la narración; seleccionar otra estructura cancela la lectura de la anterior.

Las piezas disponen de registros individualizados por su identificador original. **Algunas funciones son generales del tipo de estructura**, no datos clínicos individualmente revisados; esto se indica de forma explícita. Los datos de malla (vértices y triángulos) son del modelo digital, no de tejido real.

## Voz e interfaz

Se usa una única voz española del navegador, sin Kokoro ni eSpeak NG ni API externa. Windows debe tener una voz española accesible al navegador; su disponibilidad se indica en el tutor. Si no se escucha, revisa Configuración de Windows > Hora e idioma > Voz y el volumen del sistema.

Se sustituyeron símbolos decorativos incompatibles por SVG en el archivo `index.html`. La ficha y el tutor comparten un único panel, mientras el inspector de Matemáticas / Anatomía / Herramientas conserva su zona de desplazamiento. Los botones de Matemáticas y Módulos recuperan su estado original si vuelves a pulsarlos.

## Archivos que NO debes borrar

`modelos/atlas.json`, `modelos/body-*.bin.gz`, `js/fichasComponentes.js`, el resto de `js/`, las hojas `css/`, `creditos/` y las herramientas de preparación conservadas. La ficha necesita `js/fichasComponentes.js`; el visor 3D necesita los archivos binarios del atlas.

Consulta `documentacion/MEJORAS_Y_PENDIENTES_V47.md` para comprender la cobertura real de fichas y lo que aún falta.


## Versión V51 — Tutor y fichas anatómicas
- Panel del tutor más compacto, sin texto técnico del proveedor de voz. El narrador utiliza la voz española que encuentre en el sistema (Web Speech API).
- La narración lee una ficha estructurada y **no muestra la transcripción de voz** en pantalla.
- Abajo, en Anatomía, se muestran descripción, función, ubicación, organización y relaciones cuando se conocen. Créditos/IDs/advertencias quedan en un apartado desplegable.
- `js/fichasVerificadas.js` incorpora descripciones más específicas para estructuras reconocibles por el nombre original; las demás conservan datos de categoría y un límite de certeza explícito. No se afirma haber verificado individualmente todas las 2.234 mallas.
- No se eliminaron modelos ni herramientas necesarias. Continúan búsqueda, importación GitHub, ojo 3D, favoritos y matemáticas.

Instrucciones y alcance: `documentacion/GUIA_V51_TUTOR_Y_FICHAS.md`.

## Versión V52 — Narración anatómica completa

El tutor utiliza la información anatómica de `js/narracionAnatomica.js` para leer **sistemas y componentes**. Ya no narra el texto abreviado del visor ni habla de mallas y triángulos. Se mantiene la voz española del navegador sin instalaciones adicionales. Para conocer los cambios, límites de precisión y pruebas, consulta `documentacion/NARRACION_V52.md`.
