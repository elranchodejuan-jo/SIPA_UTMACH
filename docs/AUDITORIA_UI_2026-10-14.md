# Auditoría y mejora de interfaz de SIPA Web

Fecha: 14 de octubre de 2026. Base auditada: `0c8df45`.
Dominio: https://sipautmach.com. Repositorio: `elranchodejuan-jo/SIPA_UTMACH`.

## Alcance y resultado

Revisión del portal estático completo: Inicio, SIPA, Investigación, Divulgación,
Webinars y sus dos fichas, Eventos, Equipo, Contacto, navegación y página 404.
También se revisó el código de la experiencia histórica de Expoferia para
identificar oportunidades, conservando su diseño y contenido en esta entrega.

Se inspeccionaron arquitectura, HTML generado, iconografía, paletas, estados de
interacción, accesibilidad, adaptación móvil, SEO, recursos, contenido y CI/CD.
La publicación en `main` fue autorizada expresamente por el propietario.

## Cambios implementados

| Hallazgo | Solución |
| --- | --- |
| Fondo oscuro casi negro y poca separación visual entre superficies. | Paleta salvia con cuatro niveles de luminosidad, bordes más visibles, textos y acciones contrastados. |
| Iconos UI dibujados de forma independiente y flechas de texto. | 27 símbolos Lucide oficiales en sprite local, flechas y enlaces externos coherentes, geometría SVG explícita y tamaño uniforme. |
| Iconos de especies y redes con identidad propia. | Se conservan ocho símbolos locales, diferenciados de Lucide en manifiesto y documentación. |
| Sol/luna no coincidían con la acción anunciada por el botón. | Luna para activar oscuro; sol para activar claro. |
| Tema sin actualización ante cambios del sistema o de otra pestaña. | Sincronización con ambas fuentes, respetando siempre la elección manual guardada. |
| Selección de texto oscura con colores poco distinguibles. | Roles específicos de selección con contraste verificado. |
| Algunos estados CSS podían sustituir la sombra de foco. | Contorno de foco explícito, independiente de sombras de hover/activo. |
| Página 404 conservaba fondo y tarjeta casi negros. | Fondo alineado con la nueva paleta, tarjeta más clara y color del navegador sincronizado. |
| Inicio mostraba un mensaje genérico con dos webinars ya publicados. | Se muestran las dos fichas de archivo más recientes y su enlace a la biblioteca. |
| Inicio describía el equipo y los contactos como contenidos futuros. | Texto breve que conduce a los perfiles y canales que ya existen. |
| Auditoría automática oscura limitada a Equipo y una ficha. | Matriz claro/oscuro para siete rutas, ambos temas en menú móvil y nuevas pruebas de sincronización. |

No se incorporan datos institucionales, eventos, grabaciones, cargos ni resultados
científicos que no estén confirmados en las fuentes del proyecto.

## Paleta y contraste

| Rol oscuro | Antes | Después |
| --- | --- | --- |
| Fondo principal | `#09110C` | `#202D26` |
| Secciones suaves | `#101C14` | `#293A30` |
| Tarjetas y menús | `#17271B` | `#34483C` |
| Superficie fuerte | `#244B31` | `#3B5645` |
| Pie y bloques institucionales | `#061B0D` | `#253D2E` |
| Texto principal | `#F3F8F4` | `#F2F6F2` |
| Texto secundario | `#C2CEC5` | `#D0DAD3` |
| Texto auxiliar | `#A9B8AD` | `#BBC9BF` |
| Enlaces | `#83C49A` | `#A1DCB4` |

Ratios WCAG calculados con luminancia relativa sRGB:

- Texto principal sobre fondo: **13,14:1**.
- Texto secundario sobre fondo: **10,00:1**.
- Texto auxiliar sobre tarjeta: **5,72:1**.
- Enlace sobre tarjeta: **6,27:1**.
- Texto de botón primario: **7,77:1**.
- Borde fuerte de control sobre tarjeta: **3,86:1**.

Las pruebas protegen texto AA (4,5:1), foco/controles (3:1), especies, selección,
estados semánticos y las distintas superficies. Los colores base del tema claro
se conservan. La verificación automática no equivale a una certificación integral.

## Lucide: procedencia y mantenimiento

Los SVG originales, su revisión upstream, licencia y hashes están en
`portal/assets/icons/`. Se generan sin red mediante `scripts/generate-icons.mjs`.
El portal no necesita un CDN, una fuente de iconos ni una librería JS adicional.
Los iconos decorativos quedan fuera del árbol accesible; los botones conservan
nombre y función. Se retienen los logotipos, los afiches y las ilustraciones.

## Mejoras siguientes priorizadas

| Prioridad | Área | Evidencia y siguiente paso |
| --- | --- | --- |
| Alta editorial | Investigación | Proyectos, publicaciones y producción científica siguen vacíos en `portal/content/research.mjs`. Publicar fichas reales con responsables, estado y fuente. |
| Alta editorial | Divulgación | Hay cuatro colecciones sin material en `portal/content/outreach.mjs`. Incorporar artículos y recursos aprobados; priorizar lo disponible al presentar navegación. |
| Media | Fotografías | Carolina ocupa 932.809 bytes y Juan 388.579 bytes. Preparar derivados WebP/AVIF y `srcset`, conservando los originales. |
| Media | Expoferia | Dos JPEG base64 suman 1.317.408 bytes dentro de `index.html`. Extraer recursos responsivos y cacheables sin alterar la experiencia histórica. |
| Media | Caché de Expoferia | `public/sw.js` elimina todos los cachés del origen al activarse. Restringir la limpieza a su prefijo y verificar actualización/offline por separado. |
| Baja | Navegación accesible | La rama Divulgación usa `aria-current="page"` también en fichas hijas. Reservar ese valor al destino exacto y ajustar estilos/pruebas de rama activa. |
| Posterior | Rendimiento real | Medir LCP, CLS e INP en dispositivos y redes reales después de optimizar imágenes. No se presenta una puntuación Lighthouse sin medición. |

## Bases técnicas conservadas

Once rutas registradas; navegación derivada de un registro; canonical, sitemap,
Open Graph y JSON-LD; HTML estático; escape de contenido; enlaces externos con
`noopener noreferrer`; video YouTube cargado por interacción; navegación por
teclado, Escape y restauración de foco; contenido principal sin JavaScript.

## Verificación

- Compilación TypeScript/Vite del portal y Expoferia: aprobada.
- Sitio generado: **11 rutas, 13 HTML, 880 referencias, 11 URLs en sitemap**.
- Pruebas unitarias: **41/41**, incluidos contratos cromáticos, favicon y Lucide.
- Integridad de afiches, logo y favicon: protegida por pruebas existentes.
- Navegador: **70 casos activos verificados** (57 escritorio y 13 móvil), con
  60 omisiones explícitas de la matriz para no duplicar escenarios por proyecto.
  Las correcciones se verificaron en bloques: matriz de escritorio, cierre de
  tema/webinars/capturas y proyecto móvil completo.
- Responsive: seis anchos (360, 390, 768, 1024, 1366 y 1440 px).
- Treinta capturas generadas; inspección visual de vistas representativas en ambos
  temas, menús, investigación, webinars y 404. Los afiches con carga diferida se
  verifican tras entrar en pantalla, sin forzar su descarga anticipada en producción.
- Capturas: presupuesto de 120 s para el caso que recorre treinta combinaciones;
  los criterios de accesibilidad, contenido y navegación se mantienen.
- QA local: Chromium 153; el navegador estándar de Playwright se vuelve a ejecutar
  en GitHub Actions antes de que el flujo permita publicar GitHub Pages.
- CI y despliegue: su resultado queda asociado al commit de entrega en Actions.

## Límites

La auditoría cubre el repositorio y el comportamiento público del frontend.
No incluye certificación con lectores de pantalla, matriz Safari/Firefox, pruebas
de penetración, infraestructura privada, DNS, certificados, acceso desde
la red de UTMACH/FortiGuard ni administración de cuentas sociales. No se alteran
esos servicios ni se agregan costos o dependencias de ejecución.
