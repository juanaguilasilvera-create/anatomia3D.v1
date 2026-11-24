# Laboratorio Anatómico 3D — V53
## Revisión y corrección de levitación e integridad del proyecto

**Base:** V52, conservando visor Three.js, tutor español, fichas, búsqueda, ojo por capas, sistemas, cálculos, importador GitHub y herramientas.

### Errores comprobados y corregidos

1. **Levitación muy poco perceptible.** En la V52 se aplicaba una elevación fija de aproximadamente 0,012–0,052 m y una oscilación de solo unos milímetros, con independencia de la escala de la estructura. En V53 la altura y el vaivén se calculan con el tamaño del objeto seleccionado, con límites y transiciones suaves.
2. **Preferencia ignorada al seleccionar.** `Atlas3D.select()` y `selectGroup()` activaban la levitación de manera forzosa. Ahora respetan el estado elegido por el usuario, incluso al cambiar de estructura.
3. **Botón confuso.** El mensaje decía que la pieza regresaba a su posición anatómica al apagar la levitación, aunque la pieza permanecía centrada para inspección. Ahora indica que se detiene su movimiento. Ambos controles sincronizan el estado `aria-pressed` y el botón de la barra funciona también antes de seleccionar una pieza.
4. **Levitación sin efecto en modelos externos.** La animación anterior solo corría sobre el atlas local. Se añadió un módulo compartido (`js/levitacionExterna.js`) para modelos profesionales y las mallas importadas desde GitHub; restaura la posición de la malla al deseleccionar o retirar el archivo. Los archivos externos no se clasifican como sistemas anatómicos.
5. **Referencia femenina con grupos ocultos.** Las mallas agrupadas no tenían `userData.capa`, utilizado por la lógica de visibilidad del visor. Se añadió ese dato, y si el modelo femenino no tiene piel se muestra el conjunto de sistemas disponibles, en vez de una vista vacía.
6. **Acceso difícil al botón de levitación.** Antes se ocultaba dentro de herramientas avanzadas. `css/v53.css` lo muestra en la barra principal sin cambiar el tema ni eliminar controles. La barra conserva desplazamiento horizontal en pantallas pequeñas.

### Pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Sintaxis JavaScript de **36 módulos** | Correcta; 0 errores |
| Imports locales de módulos JS | Sin archivos faltantes |
| `index.html`: 223 identificadores | Sin IDs repetidos |
| Hojas y recursos estáticos referenciados desde `index.html` | Sin enlaces locales inexistentes |
| Modelos locales: **15 GZIP**, tamaño descomprimido | Correcto |
| Geometría: **2.234 mallas**, **1.782.519 vértices**, **2.288.268 triángulos** | Índices dentro de rango y cajas de volumen válidas |
| Levitación local: órgano grande y pieza pequeña | Variación vertical comprobada con simulación de la lógica real |
| Levitación local: desactivación, fuerza 0 %, movimiento reducido, reactivación | Correcto en prueba lógica |
| Levitación de mallas GLB/OBJ/STL: varias piezas, selección y restauración | Correcto en prueba lógica con matrices y escalas simuladas |
| Narración: **2.234 fichas** y **18 grupos** | Todos generan texto; ninguna narración contiene términos de malla/vértice/triángulo |
| Maquetación sin motor 3D a 1920×1080, 1366×768, 1024×768, 768×820 y 390×844 | Panel derecho visible y sin desbordamiento horizontal de página |
| Desplegable «Consultas y recorridos» | Apertura y cierre correctos en HTML cargado en Chromium |
| ZIP completo | Verificado al finalizar |

**Límites de las pruebas:** este entorno impidió abrir la aplicación completa tanto en `http://127.0.0.1` como en `file://` (Chromium devuelve `ERR_BLOCKED_BY_ADMINISTRATOR`). Las verificaciones matemáticas, archivos y CSS se realizaron por separado. No fue posible confirmar visualmente WebGL, todos los eventos de ratón, FPS ni la voz real de Windows. Los GLB profesionales opcionales y las descargas de GitHub tampoco pudieron comprobarse contra servidores externos; la animación externa se probó con mallas simuladas, no con una descarga real.

### Cómo comprobar la V53 en Windows

1. Extraer el ZIP; abrir la carpeta en VS Code y ejecutar `index.html` con **Live Server** (Chrome o Edge).
2. Esperar a que desaparezca «Cargando anatomía tridimensional». Si falla Three.js, ejecutar `INSTALAR_DEPENDENCIAS_WINDOWS.bat` una sola vez con internet.
3. Elegir **Sistema respiratorio** y luego una pieza de la lista (por ejemplo, tráquea). Debe aparecer **centrada y flotando suavemente**.
4. Pulsar **Levitación** otra vez: debe **detenerse** sin desaparecer. Volver a pulsarlo: debe reanudarse. Probar intensidad al **0 %** y al **100 %** desde Herramientas.
5. Elegir otra pieza: el estado de levitación debe mantenerse.
6. Verificar los botones **Separar capas**, **Corte**, **Malla**, **Vista 2D**, **Leer ficha** y **Detener voz**, y consultar el panel inferior derecho.
7. Solo si se dispone de archivos GLB adicionales, seleccionar un componente profesional y comprobar el mismo botón. Para GitHub, importar un archivo **público** y comprobar que la malla elegida levita y vuelve a su posición al desactivar la función.

### Pendientes no atribuibles al código local

- Para usar Three.js sin internet, hay que instalar sus librerías locales mediante la herramienta conservada en la carpeta.
- Una voz española debe estar disponible para el navegador (SpeechSynthesis) y la reproducción audible se verifica en Windows.
- La carga de GLB profesionales adicionales y la importación de GitHub requieren que las URLs sean públicas, accesibles y compatibles con CORS y los formatos admitidos.
- Las 2.234 narraciones no significan 2.234 fichas clínicamente revisadas una por una: algunas explican el sistema o tejido al que pertenece la pieza, señalando ese alcance.

**Conclusión técnica:** pasaron todas las pruebas automatizadas ejecutables en este entorno. Queda una validación final de interacción real en el navegador de Windows; no se declara el proyecto completamente libre de errores sin esa prueba.
