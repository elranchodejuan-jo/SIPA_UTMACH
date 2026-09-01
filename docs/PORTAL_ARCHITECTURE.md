# Arquitectura del portal SIPA V2

## Alcance

SIPA V2 es un portal HTML multipágina generado estáticamente. No es una SPA y no sustituye la Expoferia histórica de la raíz del repositorio. El build mantiene dos productos:

```text
portal/ + scripts/build-portal.mjs            -> dist/ (portal institucional)
index.html + src/ + public/ + Vite            -> dist-expo/ (Expoferia)
dist-expo/                                     -> dist/eventos/expoferia-nutricion-animal-2026/
```

La raíz `index.html`, `src/` y `public/` pertenecen exclusivamente a la Expoferia. Sus datos personales, redes, imágenes y formularios no son automáticamente contenido institucional del portal SIPA.

## Registro canónico de rutas

[`portal/config/routes.mjs`](../portal/config/routes.mjs) es la única fuente de verdad para las rutas públicas. Registra páginas generadas y la Expoferia como artefacto preservado. Cada registro contiene ruta pública, archivo de salida, SEO, relación jerárquica, navegación, secciones de página y política de sitemap.

Las derivaciones viven en [`portal/config/navigation.mjs`](../portal/config/navigation.mjs):

- `getPrimaryNavigation(fromRouteId)` genera menú y submenús;
- `getFooterNavigation(fromRouteId)` genera las columnas de rutas del footer;
- `getBreadcrumbs(routeId)` recorre `parentId`;
- `getSitemapRoutes()` devuelve exclusivamente rutas publicadas e incluidas;
- `getActiveNavigationId(routeId)` resuelve la opción principal activa.

No se debe mantener una lista independiente de rutas en plantillas, footer, sitemap, pruebas o scripts de validación. La columna de conexión social del footer se deriva aparte de la configuración central de redes, porque no representa rutas internas.

## Generación por página

Cada módulo de `portal/pages/` produce únicamente el contenido de `<main>`. `portal/templates/layout.mjs` compone el documento completo con header, navegación, breadcrumb, SEO, JSON-LD, contenido, footer, tema temprano y JavaScript progresivo.

El contexto de render esperado es:

```js
{
  route,
  routes,
  site,
  content,
  build: { version, date, sha, cacheKey },
  href,
  asset,
  escapeHtml,
  escapeAttribute,
  safeJson,
}
```

La versión no forma parte de `site.mjs`: `package.json` es su fuente exclusiva y el orquestador la entrega como metadato de build.

## Enlaces relativos y GitHub Pages

[`portal/lib/urls.mjs`](../portal/lib/urls.mjs) calcula enlaces con `path.posix.relative()` entre directorios de salida. No usa `<base>` ni asume que el sitio vive en la raíz del host.

Ejemplos:

| Origen | Destino | Resultado |
| --- | --- | --- |
| `/` | `/sipa/` | `./sipa/` |
| `/sipa/` | `/` | `../` |
| `/divulgacion/webinars/` | `/divulgacion/` | `../` |
| `/divulgacion/webinars/` | asset compartido | `../../assets/...` |

Así, el mismo HTML funciona en `https://sipautmach.com/`, en `https://elranchodejuan-jo.github.io/SIPA_UTMACH/` y en preview local. Solo canonicales, Open Graph y sitemap usan URLs absolutas de `https://sipautmach.com/`.

Las plantillas deben obtener helpers con `createRouteHelpers(route.id)` y evitar rutas internas que empiecen por `/`.

## Seguridad de contenido

[`portal/lib/html.mjs`](../portal/lib/html.mjs) escapa texto y atributos y serializa JSON seguro para scripts JSON-LD. Todo texto procedente de colecciones editables debe pasar por esos helpers.

[`portal/lib/content.mjs`](../portal/lib/content.mjs) aplica las reglas de publicación. Un elemento solo aparece cuando `published === true`; los estados `draft` y `hidden` permanecen fuera del HTML público.

[`portal/lib/urls.mjs`](../portal/lib/urls.mjs) valida URLs externas, correo y WhatsApp. No se publican `href="#"`, protocolos ejecutables, credenciales embebidas ni contactos no confirmados.

[`portal/lib/youtube.mjs`](../portal/lib/youtube.mjs) acepta IDs y URLs `watch`, `youtu.be`, `embed` y `shorts`, normaliza el enlace público y genera el embed con `youtube-nocookie.com`. Los webinars publicados deben superar `assertValidPublishedWebinars()` durante el build.

## Build integrado

El flujo de producción esperado es:

1. Verificar que solo se limpiarán `dist/` y `dist-expo/`.
2. Leer versión desde `package.json` y SHA desde CI o Git.
3. Construir la Expoferia mediante el mecanismo existente compatible con Windows.
4. Generar las páginas del portal y copiar únicamente assets públicos.
5. Copiar la Expoferia a su ruta registrada.
6. Añadir su barra de retorno relativa, sin reescribir la experiencia.
7. Generar `404.html`, `robots.txt`, `sitemap.xml`, `build-info.json` y `.nojekyll`.
8. Validar rutas, enlaces, assets, metadatos, IDs y colecciones publicadas.
9. Eliminar `dist-expo/` temporal.

La ejecución Windows existente con `execFileSync`, `ComSpec`/`cmd.exe` y sin `shell: true` es un contrato protegido. El directorio raíz `public/` no se copia al portal: Vite lo reserva para la Expoferia.

## Incorporación de contenido

Las colecciones de `portal/content/` son datos editoriales; las plantillas no contienen tarjetas copiadas manualmente. Los campos ausentes no se renderizan. Contenido institucional no confirmado permanece `draft`, `hidden` o sin publicar.

La Expoferia es un evento educativo, no un proyecto científico. Sus integrantes y canales solo pueden incorporarse a `team.mjs` o `socials.mjs` tras confirmación institucional específica.

## Validación arquitectónica

El validador estático debe importar `getPublishedRoutes()` y `getSitemapRoutes()` en lugar de duplicar rutas. Por cada página comprueba archivo generado, un único `h1`, metadatos, canonical, IDs, enlaces y assets. También debe confirmar que el sitemap coincide exactamente con el registro y que la Expoferia conserva su salida histórica.

Las pruebas E2E complementan, pero no sustituyen, esta validación. Deben cubrir navegación, menú móvil, tema, volver arriba, estado vacío de webinars, consola, responsive y al menos un escenario servido bajo un prefijo equivalente a `/SIPA_UTMACH/`.
