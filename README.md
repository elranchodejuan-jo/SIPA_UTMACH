# SIPA UTMACH

Portal institucional multipágina del **Semillero de Investigación en Producción Animal (SIPA)** de la Universidad Técnica de Machala.

SIPA V2 utiliza generación estática con Node.js, módulos ESM, HTML semántico, CSS moderno y JavaScript progresivo. No es una SPA. El portal y la Expoferia histórica son productos distintos que se ensamblan en un único artefacto de GitHub Pages.

Sitio institucional: [SIPAUTMACH.COM](https://sipautmach.com/)

## Identidad cromática SIPA

La identidad del portal se basa en el verde medido del logo institucional (`#158144`), con escala bosque, hoja, salvia y menta. `portal/assets/css/tokens.css` es la única fuente de verdad: los componentes deben consumir roles (`--color-link`, `--color-action-primary`, `--color-focus`, superficies y texto), no introducir hexadecimales de marca.

El modo claro combina blanco verdoso, carbón y verde institucional; el oscuro usa negro verdoso, superficies verde-carbón y menta accesible para enlaces y foco. El contrato unitario rechaza la reintroducción de azules/cianes institucionales y de `--color-warm-*`, y comprueba contrastes esenciales. Los estados de error, advertencia e información conservan semántica propia y siempre requieren texto o icono además de color.

Expoferia histórica conserva su identidad: `index.html`, `src/**`, `public/**` y su artefacto generado están explícitamente fuera de esta migración. El PNG `portal/assets/images/logo-sipa-original.png` no se recolorea ni modifica.

Consulta [docs/SIPA_GREEN_COLOR_MAP.md](docs/SIPA_GREEN_COLOR_MAP.md) para la escala, contrastes, excepciones y reglas de futuras extensiones.

## Rutas públicas

- `/`: inicio.
- `/sipa/`: identidad, propósito, objetivos e historia.
- `/investigacion/`: áreas, metodología, proyectos y producción científica.
- `/divulgacion/`: centro de divulgación.
- `/divulgacion/webinars/`: biblioteca de webinars.
- `/eventos/`: próximos eventos y archivo histórico.
- `/eventos/expoferia-nutricion-animal-2026/`: experiencia histórica de la Expoferia.
- `/equipo/`: integrantes publicados del semillero.
- `/contacto/`: canales institucionales confirmados.

## Arquitectura

```text
portal/
├── config/       # identidad, registro de rutas y navegación
├── content/      # colecciones editoriales
├── lib/          # helpers de HTML, URLs y validación de datos
├── pages/        # composición de cada página
├── templates/    # layout, header, footer y componentes compartidos
└── assets/       # CSS, JavaScript, iconos e imágenes publicables

scripts/
├── build-portal.mjs   # genera el portal multipágina
├── build-sipa.mjs     # ensambla portal + Expoferia
├── check-js.mjs       # verifica JavaScript y módulos ESM
└── validate-site.mjs  # audita el contenido estático generado
```

La raíz Vite/TypeScript (`index.html`, `src/` y `public/`) pertenece a la Expoferia, no a la portada institucional. `scripts/build-sipa.mjs` preserva esa experiencia en `dist/eventos/expoferia-nutricion-animal-2026/`.

El registro central de rutas alimenta navegación, página activa, breadcrumbs, footer y sitemap. Los enlaces locales se generan de forma relativa para funcionar tanto en `https://sipautmach.com/` como en la URL temporal de proyecto de GitHub Pages.

## Requisitos

- Node.js 24.x.
- npm 11 o posterior.
- Chromium de Playwright para las pruebas E2E.

En Windows/PowerShell usa `npm.cmd` cuando la política local bloquee `npm.ps1`.

## Desarrollo y preview

```powershell
npm.cmd ci
npm.cmd run dev
```

`npm run dev` realiza una compilación completa y abre el preview de Vite. La Expoferia también puede ejecutarse de manera aislada con:

```powershell
npm.cmd run dev:expo
```

Para construir y revisar el resultado manualmente:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Validación

```powershell
npm.cmd run check:js
npm.cmd run check:site
npm.cmd run test:unit
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run validate
npm.cmd audit --json
```

`npm run validate` ejecuta comprobación de JavaScript, build integrado, auditoría estática, pruebas unitarias y pruebas E2E. El build ya valida el sitio antes de finalizar; `check:site` permanece disponible como gate independiente para CI y diagnóstico.

El artefacto final se genera en `dist/` e incluye únicamente páginas HTML publicadas, assets necesarios, Expoferia, `404.html`, `robots.txt`, `sitemap.xml`, `build-info.json` y `.nojekyll`. La versión se obtiene exclusivamente de `package.json`.

## Gestión de contenido

Las colecciones de webinars, integrantes, eventos, proyectos y redes se editan en `portal/content/`. Los elementos con `published: false` no se generan para producción. No deben añadirse personas, cargos, contactos, publicaciones ni enlaces sin confirmación institucional.

Consulta [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) para los procedimientos editoriales y [docs/PORTAL_ARCHITECTURE.md](docs/PORTAL_ARCHITECTURE.md) para el diseño técnico.

## CI/CD y publicación

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. En pull requests hacia `main`, instala dependencias, valida, construye y ejecuta pruebas sin publicar.
2. En ejecución manual, valida sin publicar.
3. Únicamente después de un push a `main`, reutiliza el artefacto validado y publica mediante el mecanismo oficial de GitHub Pages.

No se usa force push a `gh-pages`, no se versiona `dist/` y no se incluye un archivo `CNAME`; el dominio personalizado se administra desde GitHub Pages.

El estado comprobado del dominio y los límites operativos se documentan en [docs/SIPAUTMACH_PRODUCTION.md](docs/SIPAUTMACH_PRODUCTION.md).

## Estado editorial

**SIPA v2.0.0 — portal institucional multipágina.**

Los datos institucionales pendientes permanecen ocultos hasta ser confirmados por la dirección del semillero.
