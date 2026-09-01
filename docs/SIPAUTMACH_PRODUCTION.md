# Producción de SIPA en SIPAUTMACH.COM

## Estado y alcance

Este documento prepara el portal institucional de SIPA para su URL canónica:

`https://sipautmach.com/`

No configura DNS, certificados, proveedores externos ni producción. Esas acciones siguen requiriendo una persona con acceso administrativo al dominio y al repositorio.

## Arquitectura actual comprobada

El repositorio contiene dos productos estáticos que el build ensambla en un solo artefacto:

```text
portal/                                  -> dist/ (portal SIPA)
index.html + src/ + public/              -> dist-expo/ (Expoferia Vite)
dist-expo/                               -> dist/eventos/expoferia-nutricion-animal-2026/
```

- `portal/` es la portada institucional estática de SIPA.
- La raíz Vite/TypeScript es la Expoferia histórica de Nutrición Animal; no es la portada de SIPA.
- `scripts/build-sipa.mjs` ejecuta TypeScript y Vite, copia la portada al raíz de `dist/`, y conserva la Expoferia en la ruta de evento.
- El build usa `execFileSync` y, en Windows, `cmd.exe`/`ComSpec` para `npm run build:expo`. Esa compatibilidad se mantiene sin `shell: true`.

El artefacto histórico es intencionalmente grande: su HTML contiene imágenes embebidas y queda alrededor de 1.45 MB sin comprimir. No se reescribió durante esta fase para preservar el contenido; es una optimización futura independiente.

## Arquitectura objetivo

```text
https://sipautmach.com/
├── Portal institucional SIPA
├── /robots.txt
├── /sitemap.xml
├── /404.html
└── /eventos/expoferia-nutricion-animal-2026/
    └── Archivo histórico de Expoferia de Nutrición Animal
```

La portada y el evento usan rutas relativas para sus recursos locales. Las canonicales y los metadatos sociales usan URLs absolutas de `https://sipautmach.com/`. El 404 generado no conserva el hardcode de `/SIPA_UTMACH/`: resuelve el retorno de forma compatible tanto con el dominio raíz como con la URL temporal de proyecto de GitHub Pages.

## SEO y assets

La portada entrega:

- `lang="es-EC"`, title y descripción de SIPA;
- canonical `https://sipautmach.com/`;
- Open Graph, Twitter/X card y JSON-LD `WebSite`;
- favicon y manifest existentes;
- `robots.txt` con sitemap absoluto;
- sitemap para portada y Expoferia histórica.

La Expoferia mantiene su propia canonical:

`https://sipautmach.com/eventos/expoferia-nutricion-animal-2026/`

La marca visible del dominio en el portal es `SIPAUTMACH.COM`. La URL técnica permanece en minúsculas.

## Hosting, build y CI/CD

GitHub Pages es adecuado para esta fase: el producto es estático, no necesita servidor, ya tiene una publicación por workflow y GitHub Pages ofrece dominio personalizado y HTTPS. No se identificó una limitación técnica que justifique migrar de proveedor.

El único workflow de publicación es `.github/workflows/deploy.yml`:

1. En pull requests a `main`, instala dependencias, valida JavaScript y construye sin publicar.
2. En `push` a `main` o ejecución manual, además configura Pages, sube `dist/` como artifact y publica con `actions/deploy-pages`.

Se retiró el workflow heredado que volvía a compilar y hacía force-push a `gh-pages`. GitHub Pages está configurado para publicar desde un workflow, por lo que el flujo oficial por artifact es el publicador efectivo y evita despliegues competidores.

El estado remoto auditado antes de esta preparación era:

- URL temporal: `https://elranchodejuan-jo.github.io/SIPA_UTMACH/`
- publicación: workflow de GitHub Pages;
- custom domain: no configurado;
- HTTPS: forzado para la URL temporal.

## Dominio, www y HTTPS

El dominio principal deseado es `sipautmach.com`; `www.sipautmach.com` debe redirigir al apex. GitHub Pages realiza ese redireccionamiento cuando el apex se configura como custom domain y los registros de apex y `www` son correctos.

No se añade un archivo `CNAME` al repositorio. GitHub documenta que, cuando Pages se publica desde un workflow personalizado de GitHub Actions, el archivo CNAME se ignora y no es necesario. La fuente de verdad del custom domain será Settings → Pages del repositorio.

## Configuración DNS pendiente

Primero, una persona administradora debe registrar `sipautmach.com` en **Settings → Pages → Custom domain**. Después debe configurar DNS en el proveedor del dominio. GitHub recomienda hacerlo en ese orden para reducir el riesgo de toma del subdominio.

Registros DNS recomendados para GitHub Pages:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `elranchodejuan-jo.github.io` |

No debe añadirse `/SIPA_UTMACH/` al valor de `www`.

IPv6 es opcional; si se habilita, añadir además:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Tras la propagación, verificar el dominio en Pages, esperar la emisión del certificado y mantener **Enforce HTTPS** activo. No crear registros wildcard para este fin. El registro TXT de verificación de dominio, si se usa, debe copiarse desde GitHub cuando se inicie esa verificación: no tiene un valor estático que pueda declararse aquí.

Fuente: [GitHub Docs: administrar un dominio personalizado de Pages](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) y [HTTPS en GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Pasos posteriores y validación externa

1. Fusionar esta rama mediante pull request.
2. Configurar el custom domain y los registros DNS indicados, sin eliminar registros existentes hasta compararlos con la tabla.
3. Esperar propagación y certificado de GitHub Pages.
4. Confirmar `https://sipautmach.com/`, el redireccionamiento de `https://www.sipautmach.com/`, HTTPS, canonicales, `/robots.txt`, `/sitemap.xml`, favicon y la ruta de Expoferia.
5. Actualizar, si se autoriza, la descripción pública del repositorio de GitHub, que aún presenta la Expoferia como identidad principal.

## Rollback

El rollback de código consiste en revertir el commit de esta fase desde un pull request; no requiere borrar datos ni forzar historia. Antes de tocar DNS, registrar sus valores actuales. Si una configuración de dominio falla, retirar sólo los registros nuevos tras comprobar su propiedad y volver a la URL temporal de GitHub Pages.

## Riesgos y pendientes humanos

- La propagación DNS y la emisión del certificado dependen de infraestructura externa y no se ejecutaron en esta fase.
- La Expoferia preserva HTML con imágenes embebidas; su optimización requiere una iniciativa separada y revisión visual del archivo histórico.
- Las imágenes sociales existentes son SVG; si se requiere compatibilidad ampliada de previews sociales, se necesita un asset raster institucional aprobado, no inventado.
- La URL temporal de proyecto sigue incluyendo `/SIPA_UTMACH/`; no es la URL canónica y se mantendrá sólo hasta que el dominio externo esté configurado.
