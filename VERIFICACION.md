# Corrección de doble cara · 5 de noviembre de 2026

## Comportamiento corregido

El doble fondo empieza desactivado. Al activarlo, los colores atraviesan el espesor en las mismas coordenadas XY y cada columna sólida empieza en Z=0. Se eliminó la segunda silueta del modo normal y la construcción de una capa inferior de alturas variables que dejaba regiones suspendidas. El reverso se ve invertido naturalmente por el punto de vista, sin reflejar el archivo.

«Reverso en espejo» conserva la variante reflejada como opción explícita, inicialmente apagada y dependiente de doble cara. Puede crear zonas por encima de la cama y requerir soportes. Al apagar doble cara también se apaga el espejo. La interfaz y sus colores existentes se conservan.

La vista 2D, la vista 3D, la selección y las exportaciones usan los mismos intervalos de material por celda. Los límites Z se redondean a 9 decimales para evitar capas microscópicas causadas por errores de coma flotante. Se conserva el suavizado XY de exportación documentado en la interfaz.

## Comprobaciones

- Patrones asimétricos con dos colores y alturas diferentes; modo alineado, espejo, desactivación y reactivación.
- Secciones verticales de los triángulos reales: una columna continua desde Z=0, sin huecos internos ni una capa inferior flotante en modo alineado. La huella de las capas superiores no agrega columnas sin apoyo debajo.
- Geometría cerrada y orientada, volumen de STL único igual a la suma de las partes, agujeros internos, ojal y pestaña en las cuatro posiciones y con ambas alturas.
- Capas de 0,12 / 0,16 / 0,20 / 0,28 mm, modo plano y relieve, borde y suavizado.
- La paleta informada coincide con los materiales exportados; no muestra una base adicional si el color atraviesa toda la pieza y esa base no se usa.
- Chrome a 1440, 390 y 320 píxeles: frente/reverso, selección de ambos colores en 2D y 3D, edición en vivo, controles dependientes y generación real de STL, ZIP por color y 3MF.
- Lectura independiente de STL binario y XML dentro del 3MF: coincidencia de triángulos con los STL por color, volúmenes y secciones en todas las celdas del patrón. En ese patrón alineado, cero columnas suspendidas; en espejo, se detectan deliberadamente columnas elevadas, confirmando el límite descrito en la interfaz.

## Límites

La captura del Grinch muestra el aviso de Bambu Studio, pero no se dispone de la imagen original ni del 3MF de ese ejemplo. No se reprodujo ese laminado exacto ni se validó una impresión física o el ingreso con credenciales reales. Estas pruebas no equivalen a un laminado aprobado en Bambu Studio ni garantizan ausencia universal de soportes. Las islas ya desconectadas en la imagen pueden seguir siendo piezas separadas.

## Respaldo antes de esta corrección

Commit: `54961ca67faf44de383582433aeed3fe46b83a88`.

Rama: [backup/2026-11-05-antes-continuidad-xy](https://github.com/printaplab3dstore/Printaplab-Llaveros-Web/tree/backup/2026-11-05-antes-continuidad-xy).

Copia local: `backups/Printaplab-antes-continuidad-xy-2026-11-05.zip`.
