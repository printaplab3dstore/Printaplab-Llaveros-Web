# Printaplab Llaveros Web

Taller web de llaveros 3D multicolor con acceso Supabase compartido con Android.

## Activar publicación

Settings → Pages → Deploy from a branch → main → / (root) → Save.
El enlace definitivo aparece en Pages después de completar el despliegue.

## Uso

Ingresá con tu cuenta existente, aprobada por el administrador. Los diseños se procesan en tu navegador. Exportá el trabajo antes de cerrar sesión o recargar.

Incluye vista 2D/3D, edición de colores y alturas, agujero para llavero y exportaciones STL y 3MF. Para laminar 3MF en Bambu Studio, seleccioná el perfil oficial de tu impresora y verificá la torre de purga.

Solo contiene archivos para navegador y la clave pública de Supabase. No incluye Android, .env ni credenciales privadas. El código es público: el acceso limita la interfaz oficial, no impide copiar o modificar el motor local.

Pruebas de lógica de acceso: 9 aprobadas el 3 de noviembre de 2026. Pendiente de comprobar visualmente en el sitio publicado e ingresar con una cuenta real.


## Crear un llavero

1. Cargá una imagen (se convierte automáticamente) o usá el ejemplo.
2. Ajustá tamaño, colores y enganche. «Imagen en ambas caras (doble fondo)» es opcional y empieza desactivada. «Ver reverso» permite comprobar la otra cara en 2D y 3D.
3. Descargá 3MF para conservar los colores o abrí Otras descargas para STL y PNG.

## Distribución del color en ambas caras

La opción «Imagen en ambas caras» empieza desactivada. Al activarla podés elegir:

- **Caras finas · Centro de un solo color:** opción sugerida para reducir cambios de filamento en las capas intermedias. Las dos caras son planas y usan la misma cantidad de capas (3 por defecto, editable entre 2 y 5). Su espesor es cantidad de capas × altura de capa de referencia. Entre ambas hay un centro continuo que usa el espesor y color de base. Los controles de relieve no se aplican en este modo.
- **Color en todo el espesor:** conserva el dibujo en cada columna XY de lado a lado y permite editar las alturas de relieve. Tiene cambios de color también en el centro.

Elegí el color del centro en Colores → Color del centro, borde y capas. El modo automático reutiliza el color más oscuro del dibujo; también podés elegir uno independiente.

En ambas modalidades el reverso alineado se ve invertido naturalmente al mirar la misma pieza desde atrás. «Reverso en espejo» es una opción separada, apagada al inicio y disponible solo con doble cara. Refleja deliberadamente la geometría del reverso. Con color en todo el espesor puede crear voladizos y requerir soportes. En caras finas la base ocupa ambas siluetas desde Z=0, sosteniendo las dos superficies.

La vista 2D, la vista 3D y las exportaciones usan los mismos intervalos de material. El suavizado de exportación conserva la misma unión XY entre las partes. Las imágenes con elementos desconectados pueden seguir produciendo piezas separadas. El tiempo y el ahorro final se comprueban al laminar: dependen del diseño, los filamentos y la configuración de impresión.


## Verificaciones locales

- `node tests/double-sided.cjs`: continuidad desde Z=0, secciones de las mallas reales, XY alineado, espejo opcional, transiciones, volúmenes, partes por color, capas, agujeros y enganches.
- `node tests/check-layout.cjs`: prueba en Chrome sin interfaz a 1440, 390 y 320 píxeles; conversión, frente/reverso, edición en vivo y generación de STL/3MF. Si Chrome está en otra ubicación, definir `CHROME_PATH`. Requiere Node 22 o superior.

- `python tests/check-exported-geometry.py`: después de la prueba de navegador, lee los STL, ZIP por color y 3MF generados; compara geometría, volúmenes y secciones en cada celda.
- `node tests/check-published.cjs`: comprueba por HTTPS que HTML y archivos de acceso publicados coinciden con la copia local.

La prueba de navegador genera un documento local de prueba con el acceso oculto; no cambia el acceso de la aplicación. Sus capturas y perfiles quedan excluidos de Git. No valida una sesión real de Supabase ni sustituye la revisión del archivo en Bambu Studio o una impresión física.
