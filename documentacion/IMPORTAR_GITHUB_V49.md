# V49 — Importación de archivos 3D desde repositorios GitHub públicos

## Uso
1. Abre el proyecto con **Live Server**.
2. En la parte superior, abre el selector **Modelo 3D**.
3. Elige **＋ Importar modelo desde GitHub…**.
4. Pega la URL de un repositorio público como `https://github.com/usuario/repositorio`, una carpeta de su rama principal o la URL directa de un archivo compatible.
5. Pulsa **Buscar modelos**. El importador enumera hasta 300 archivos candidatos. Si hay varios, selecciona uno.
6. Pulsa **Mostrar en el visor 3D**. El archivo reemplaza visualmente al cuerpo humano, exactamente como la vista del dragón de fantasía. El modelo no se clasifica, no se mezcla y no se asigna a sistemas anatómicos.
7. Usa los controles existentes para girar, ampliar y explorar el modelo. Para regresar, elige **Cuerpo completo** en el selector. Los archivos importados con éxito aparecen en «Mis modelos 3D de GitHub» mientras la página permanezca abierta.

## Compatibilidad
- GLB (preferido): admite escenas con jerarquías y materiales integrados, y conserva animaciones compatibles.
- glTF: admite recursos externos relativos si el navegador puede descargarlos desde el repositorio; es preferible exportar GLB.
- OBJ: carga la geometría, pero no archivos MTL externos ni sus texturas.
- STL: carga la geometría, usando un material neutro sin textura.
- Cada archivo 3D debe pesar hasta 50 MB; los archivos mucho más complejos pueden superar la capacidad gráfica del equipo.
- Se requiere internet para consultar GitHub y cargar los archivos. Solo repositorios públicos HTTPS (sin tokens). GitHub puede limitar temporalmente sus consultas a la API.
- Un **repositorio** puede tener varios archivos: se selecciona un archivo por vez. El importador no convierte ni fusiona todo el repositorio.
- No ejecuta código del repositorio ni modifica los modelos anatómicos incluidos en la aplicación.

## Limitaciones de prueba
La sintaxis y el filtrado de repositorios se probaron localmente. La renderización final depende del navegador, de la disponibilidad del repositorio público, de Three.js y de los recursos referenciados por el modelo. Para comprobar un caso real, pega un repositorio que contenga un GLB menor de 50 MB.
