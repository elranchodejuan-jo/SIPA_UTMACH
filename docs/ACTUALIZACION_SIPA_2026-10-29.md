# SIPA Web 2.1.0

Fecha: 29 de octubre de 2026. Base: `a616c69`.

## Resultado

Integra los cambios visuales de `sipa_utmach_mejorado.zip` sobre la versión
vigente del repositorio. El ZIP publicable se usa como referencia; la publicación
se reconstruye desde las fuentes y el workflow existente de GitHub Pages.

- Logo, familia de favicons e imagen social aportados en el paquete.
- Iconografía ampliada en navegación, secciones, fichas y tarjetas. El sprite
  contiene 41 iconos de interfaz y conserva los ocho símbolos locales.
- Superficies, gradientes, encabezados y estados de interacción renovados,
  manteniendo la paleta salvia del modo oscuro y los roles cromáticos existentes.
- Fondos ambientales con una animación inicial de 4,5 segundos; se respeta
  `prefers-reduced-motion`. El aislamiento del lienzo permite ver el fondo sin
  tapar el contenido ni los controles.
- Nueva caché de Expoferia para renovar los recursos de identidad en visitas
  recurrentes. Su limpieza elimina exclusivamente versiones de Expoferia.
- Versión centralizada en `package.json`: 2.1.0.

Las fichas, afiches, personas, contactos, fechas y rutas mantienen los datos ya
publicados. No se incorporan publicaciones científicas ni grabaciones nuevas.

## Procedencia y compatibilidad

Los hashes de logo y fuente maestra favicon se actualizan a los archivos del
paquete aportado. Los 14 SVG añadidos identifican ese paquete como procedencia
en el manifiesto; no se presume que fueron verificados contra la revisión
upstream usada para los 27 SVG anteriores. Se conservan las licencias existentes.

La vista previa admite únicamente el hostname adicional `terminal.local`.
La compilación sigue siendo estática, compatible con Windows y Linux, y no
requiere nuevas dependencias, cambios de DNS ni otro proveedor de alojamiento.

## Validación

- Sintaxis: 63 archivos JavaScript válidos.
- Pruebas unitarias: 42 aprobadas, incluida renovación y aislamiento de cachés.
- Compilación integrada con TypeScript y Vite: aprobada.
- Auditoría del sitio: 11 rutas, 13 HTML, 1021 referencias y 11 URLs en sitemap.
- Inspección visual en navegador: portada clara y oscura, presentación del equipo,
  anchos de marco de 360, 390 y 1024 px y escritorio; apertura, cierre con Escape
  y navegación del menú; sin desbordamiento horizontal en las vistas revisadas.
- La suite E2E y la auditoría automática de accesibilidad se ejecutan en GitHub
  Actions antes de publicar; su resultado se consulta en la ejecución asociada
  al commit. Esta nota no presupone su aprobación.

Los scripts auxiliares de publicación de los adjuntos no se incorporan: el
repositorio ya dispone de un flujo de validación y publicación por GitHub Pages.
