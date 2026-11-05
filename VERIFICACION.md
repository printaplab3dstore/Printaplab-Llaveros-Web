# Caras finas con centro de un solo color · 5 de noviembre de 2026

## Comportamiento

Se conserva la doble cara opcional, apagada al inicio. Al activarla se ofrece «Caras finas · Centro de un solo color» y la modalidad anterior «Color en todo el espesor». El espejo sigue siendo una opción separada.

Caras finas crea dos superficies planas con el mismo espesor, 3 capas por defecto y entre 2 y 5 a elección. El centro tiene el espesor y el color de base. La cara inferior empieza en Z=0. En modo espejo, los espacios sin dibujo en cada lado se completan con el color de base dentro de la silueta combinada, de modo que no se recrea una capa inferior suspendida. Las regiones transparentes fuera de la base siguen vacías.

Los controles de relieve se desactivan en caras finas y se conservan sus valores para volver a color completo. El grupo de orientación se oculta si no corresponde. La interfaz informa milímetros por cara según la altura de capa y dónde elegir el color del centro. Las descargas distinguen caras finas y color completo en el nombre.

## Verificaciones

- Mallas reales de un patrón asimétrico con diferentes colores y alturas. Color completo alineado, color completo con espejo, caras finas alineadas y caras finas con espejo.
- Partes cerradas y orientadas, suma de volúmenes igual al STL único, continuidad de las secciones verticales y ausencia de nuevas columnas suspendidas en caras finas.
- Núcleo de un solo material en todo el intervalo intermedio y dos caras de igual espesor con 2, 3 y 5 capas; alturas de capa de 0,12 / 0,16 / 0,20 / 0,28 mm.
- Conservación de color completo, relieve y modo plano, suavizado, agujero, ojal y pestaña.
- Chrome a 1440, 390 y 320 píxeles: controles dependientes, transiciones entre opciones, selección 2D y 3D desde ambas caras, edición en vivo y generación real de STL, ZIP por color y 3MF.
- Lectura independiente del STL binario y de la geometría XML en los cuatro 3MF: triángulos, volúmenes y secciones en cada celda coinciden con los STL por color y la distribución elegida.

## Límites

No se midió una reducción de tiempo con el laminado del Grinch en Bambu Studio ni se probó una impresión física. La estructura reduce los cambios de color dentro del centro, pero el ahorro final depende del laminador y de la configuración. No se dispone de la imagen o 3MF original del Grinch. La cantidad de capas debe corresponder con la altura de capa configurada en el laminador; no se valida color u opacidad real de los filamentos.

## Respaldo previo

Commit: `9d59084d5bc78f8a98bbe6f7b31a5c6d167ebb47`.

Rama: [backup/2026-11-05-antes-caras-finas](https://github.com/printaplab3dstore/Printaplab-Llaveros-Web/tree/backup/2026-11-05-antes-caras-finas).

Copia local: `backups/Printaplab-antes-caras-finas-2026-11-05.zip`.
