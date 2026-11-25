# Comprobaciones del proyecto

- Sintaxis de los módulos JavaScript: correcta.
- Prueba del buscador con DOM simulado: cerebro, encéfalo, brain, cerebro y encéfalo, cerebro completo; una coincidencia externa incorrecta no desplaza el conjunto cerebral. La consulta ojo selecciona el conjunto ocular.
- 58 mallas encefálicas: sistema nervioso, vértices finitos, índices válidos y límites contenidos en los del manifiesto con tolerancia de 1 mm.
- 2.234 registros de fichas: campos básicos presentes; esto no certifica su exactitud clínica individual.
- HTML: un único botón de levitación, una hoja de estilos, sin identificadores duplicados y favicon local.
- La vista ocular cancela aperturas pendientes al salir, comparte el estado de levitación y no sustituye la selección del nuevo órgano.

Ejecutar las pruebas con Node.js 22 o posterior desde la carpeta del proyecto:

```
node --experimental-default-type=module pruebas/verificar_busqueda.mjs
node --experimental-default-type=module pruebas/verificar_fichas.mjs
```

Pendiente: pruebas visuales reales con Three.js, WebGL y Live Server en Windows. El ZIP no incluye la biblioteca Three.js local; utilizar el instalador o la carga CDN prevista. Las comprobaciones anteriores no garantizan la animación visual ni todos los escenarios de interacción.
