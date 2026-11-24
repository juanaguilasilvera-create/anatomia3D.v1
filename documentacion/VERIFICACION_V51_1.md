# Verificación técnica V51.1 — Laboratorio Anatómico 3D

## Cambio realizado

Se corrigió exclusivamente el marcador de lista del desplegable «Consultas y recorridos» mediante CSS en `css/v51.css`. No se modificaron los archivos JavaScript ni los modelos originales. El elemento HTML `<details>` conserva su apertura y cierre nativos.

## Pruebas realizadas (24 de noviembre de 2026)

- **JavaScript:** 34 módulos sin errores de sintaxis (`node --check`).
- **Importaciones:** 96 referencias analizadas en el código; ninguna importación relativa a un módulo local faltante.
- **HTML:** 223 identificadores, sin duplicados. Todos los controles `aria-controls` y las etiquetas `for` apuntan a elementos existentes.
- **CSS:** 8 hojas CSS analizadas; sin errores de análisis y sin referencias a hojas inexistentes.
- **Recursos referenciados en HTML:** sin enlaces locales rotos.
- **Geometría:** 15 archivos `body-*.bin.gz` se descomprimieron correctamente y coincidieron con los tamaños definidos en `atlas.json`.
- **Validación profunda de mallas:** 2.234 mallas; 1.782.519 vértices y 2.288.268 triángulos. Sin índices fuera de rango, offsets fuera de los bloques, coordenadas no finitas, tamaños de triángulos no múltiplos de 3 ni límites geométricos inconsistentes.
- **Fichas:** las 2.234 entradas generaron una narración no vacía y ninguna lanzó excepciones. Esto comprueba la integridad técnica, no la validación clínica individual de su contenido.
- **Interfaz de «Consultas y recorridos»:** en una prueba aislada con Chromium el marcador pasó de `list-style:auto; display:list-item` a `list-style:none; display:block`; se comprobó su apertura y cierre tras la corrección.
- **Servidor HTTP local:** `index.html`, los CSS y JS principales, `atlas.json` y los archivos de geometría consultados respondieron HTTP 200 en la prueba de servidor estático.

## Límites de la verificación

**No se puede certificar el funcionamiento integral del visor y de la voz en Windows desde este entorno.** El navegador automatizado rechazó el acceso al servidor local (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). Por ello no se verificaron el renderizado real completo de WebGL, la selección 3D, la importación en vivo desde GitHub, la navegación de todas las interfaces ni la síntesis audible con la voz del sistema.

La carpeta `vendor/three/` no se incluye en esta versión. Si no se instalaron las librerías locales mediante el procedimiento opcional del proyecto, la aplicación necesita internet para cargar Three.js desde jsDelivr. Las voces en español dependen de los servicios y voces disponibles en el navegador/Windows.

## Cómo comprobar en el equipo del usuario

1. Extraer el ZIP y abrir la carpeta con VS Code.
2. Abrir `index.html` mediante Live Server. Verificar que se cargue el cuerpo completo y que no aparezca error de Three.js.
3. En la ficha lateral, pulsar «Consultas y recorridos»: no debe aparecer el `0.` y debe poder abrirse/cerrarse repetidamente.
4. Elegir un órgano, pulsar «Leer ficha» y comprobar audio, pausa por «Detener» y actualización del panel inferior.
5. Probar al menos sistema óseo, muscular, sensorial, ojo por capas, búsqueda y las pestañas Matemáticas/Herramientas.
6. Abrir consola de desarrollador con F12 para comprobar que no haya errores de scripts, carga de recursos o WebGL.
