# Laboratorio Anatómico 3D

## 1. Instalación y ejecución
Extrae el ZIP. Ejecuta `INSTALAR_DEPENDENCIAS_WINDOWS.bat` y abre `index.html` con Live Server en VS Code. Los modelos adicionales son opcionales.

## 2. Anatomía y búsqueda
Busca órganos, sistemas o partes en español. Los conjuntos locales tienen prioridad; selecciona sus subestructuras desde la ficha. La cobertura de algunos órganos es parcial.

## 3. Exploración tridimensional
Usa el único botón Levitación del visor, las herramientas de elevación, separación, corte y cámara. El estudio ocular se cierra con Volver al atlas o Escape.

## 4. Fichas y matemáticas
La ficha describe la selección y permite consultar datos geométricos, referencias y narración bajo demanda. La información de categoría no equivale a validación clínica individual.

## 5. Modelos, mantenimiento y pruebas
Conserva `modelos/`, `js/`, `css/app.css`, `creditos/` y `herramientas/`. Consulta `documentacion/GUIA.md` y `documentacion/PRUEBAS.md`.

Los GLB profesionales no se incluyen en el ZIP. `INSTALAR_MODELOS_ANATOMICOS.bat` descarga los archivos disponibles y actualiza `modelos/disponibles.json`. Si copias un GLB manualmente, ejecuta `python herramientas/instalar_modelos.py --verificar` para actualizar ese inventario. Live Server solo intenta rutas locales registradas; si no hay GLB, se usan fuentes remotas y, si no están disponibles, el atlas incluido. El servidor de `INICIAR_LABORATORIO_WINDOWS.bat` también puede descargarlos bajo demanda.
