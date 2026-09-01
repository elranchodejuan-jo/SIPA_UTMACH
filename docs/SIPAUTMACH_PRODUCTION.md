# Producción de SIPA en SIPAUTMACH.COM

## Estado comprobado

Estado auditado el 1 de septiembre de 2026 mediante la API de GitHub Pages y una solicitud HTTPS de solo lectura:

- repositorio: `elranchodejuan-jo/SIPA_UTMACH`;
- publicación: GitHub Pages mediante GitHub Actions (`build_type: workflow`);
- dominio personalizado: `sipautmach.com`;
- URL pública: `https://sipautmach.com/`;
- HTTPS forzado: activo;
- estado reportado por Pages: `built`;
- respuesta del dominio al auditarlo: HTTP 200.

La configuración externa vigente no se modificó durante SIPA V2. El código utiliza `https://sipautmach.com/` para canonicales y `SIPAUTMACH.COM` como representación visual.

La última publicación de `main` observada antes de iniciar SIPA V2 correspondía al commit `22cfe31`. Por tanto, un build local o un pull request de SIPA V2 no demuestra que V2 esté en producción; solo un push posterior a `main`, un workflow remoto verde y una verificación pública pueden confirmarlo.

## Arquitectura de publicación

El repositorio conserva dos productos estáticos:

```text
portal/config + content + pages + templates + assets
    └── scripts/build-portal.mjs
        └── dist/                                  Portal SIPA multipágina

index.html + src/ + public/ + vite.config.ts
    └── npm run build:expo
        └── dist-expo/                             Expoferia Vite
            └── dist/eventos/expoferia-nutricion-animal-2026/
```

`scripts/build-sipa.mjs` es el orquestador integrado:

1. elimina únicamente `dist/` y `dist-expo/`, que son directorios generados;
2. construye la Expoferia con TypeScript y Vite;
3. genera el portal multipágina directamente en `dist/`;
4. copia la Expoferia a su ruta histórica;
5. añade su enlace accesible de retorno a SIPA;
6. valida rutas, enlaces, metadatos, contenido y assets;
7. elimina `dist-expo/` incluso si el proceso falla.

El generador publica solamente HTML generado y assets necesarios. Plantillas, configuración, colecciones editoriales y scripts de generación permanecen fuera de `dist/`.

## Compatibilidad Windows y Linux

El desarrollo local usa Node.js 24.x en Windows; GitHub Actions usa Node.js 24 en Linux.

La construcción de la Expoferia conserva la solución compatible ya aprobada:

- Windows: `execFileSync` invoca `process.env.ComSpec || 'cmd.exe'` con `npm run build:expo`.
- Linux: `execFileSync` invoca `npm` directamente.
- No se utiliza `shell: true`.

Esta implementación evita depender de `npm.ps1`, conserva la salida del proceso hijo y no interpola secretos en comandos.

## URLs y GitHub Pages

Las canonicales y metadatos sociales siempre usan URLs absolutas de `https://sipautmach.com/`. Los enlaces internos y assets usan rutas relativas calculadas por profundidad.

Este diseño permite servir el mismo `dist/` desde:

- `https://sipautmach.com/`;
- `https://elranchodejuan-jo.github.io/SIPA_UTMACH/`;
- `npm run preview`.

Cada ruta pública se genera como un directorio con `index.html`. La Expoferia conserva:

`/eventos/expoferia-nutricion-animal-2026/`

El build genera automáticamente `404.html`, `robots.txt`, `sitemap.xml`, `build-info.json` y `.nojekyll`. El sitemap deriva del registro central de rutas e incluye la Expoferia. La versión procede exclusivamente de `package.json`; la fecha y el SHA se calculan durante el build.

## CI/CD

El único publicador es `.github/workflows/deploy.yml`.

### Pull requests hacia `main`

El job de validación:

1. usa checkout y Node.js 24;
2. ejecuta `npm ci`;
3. valida JavaScript;
4. construye portal y Expoferia;
5. audita el sitio generado;
6. ejecuta pruebas unitarias;
7. instala Chromium de Playwright;
8. ejecuta pruebas E2E.

No configura Pages, no genera un artifact de publicación y no despliega.

### Ejecución manual

`workflow_dispatch` ejecuta las mismas validaciones, pero no publica. Esto permite diagnosticar CI sin convertir una ejecución manual en una liberación.

### Push a `main`

Solo después de que las validaciones terminan correctamente:

1. el job de build conserva `dist/` como artifact temporal;
2. el job de despliegue descarga exactamente ese artifact validado;
3. configura Pages;
4. lo empaqueta con `actions/upload-pages-artifact`;
5. publica mediante `actions/deploy-pages`.

Los permisos generales son `contents: read`. `pages: write` e `id-token: write` existen únicamente en el job de despliegue condicionado a un push a `main`. La concurrencia se separa por referencia, evitando que un pull request cancele una publicación de `main`.

No se usa force push, no se publica mediante una rama `gh-pages` y el pull request no se fusiona automáticamente.

## Dominio, CNAME y HTTPS

El dominio personalizado y HTTPS ya están activos en GitHub Pages. No forman parte del cambio de código de SIPA V2.

No se añade un archivo `CNAME`: con publicación mediante un workflow personalizado, la fuente de verdad del dominio es la configuración de GitHub Pages. Tampoco se modifican desde el repositorio:

- registros DNS;
- certificados;
- `Enforce HTTPS`;
- redirects externos;
- configuración del dominio en Settings → Pages.

Cualquier ajuste futuro de esos elementos requiere autorización específica y una copia previa de la configuración vigente.

## Validación de una liberación

Mantener separadas estas evidencias:

1. **Local:** `npm run validate`, `git diff --check` y árbol controlado.
2. **CI:** todos los jobs del pull request concluyen en verde.
3. **PR:** rama publicada, revisión disponible y PR sin fusionar automáticamente.
4. **Producción:** workflow de push a `main` verde y comprobación posterior del sitio público.

Después de una fusión autorizada, comprobar al menos:

- portada y siete secciones principales;
- Expoferia y su retorno a SIPA;
- `404.html`, `robots.txt`, `sitemap.xml` y `build-info.json`;
- canonicales y metadatos sociales;
- assets sin 404;
- HTTPS y redirección del host configurado por Pages;
- versión y SHA de la publicación.

## Rollback

Un rollback de código debe hacerse mediante un commit de reversión en una rama y otro pull request. No requiere reescribir historia, forzar pushes ni borrar datos.

Si el problema pertenece exclusivamente a SIPA V2, se revierte su commit y se deja que el workflow publique nuevamente desde `main` después de las validaciones. Los cambios de DNS, dominio o certificados quedan fuera de este procedimiento y nunca deben revertirse desde el repositorio.

## Riesgos y pendientes humanos

- La publicación de SIPA V2 depende de revisión y fusión humana del pull request.
- Los datos oficiales de integrantes, misión, visión, contactos, redes y webinars requieren confirmación institucional.
- La Expoferia contiene un artefacto HTML pesado con imágenes embebidas; se preserva sin reestructurarlo.
- La ausencia de protección remota de `main` observada durante la auditoría hace especialmente importante mantener el flujo operativo por pull request. Configurar protección de rama es una acción externa separada y no se realizó.
