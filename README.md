# SIPA UTMACH

Portal institucional del **Semillero de Investigación en Producción Animal (SIPA)** de la Universidad Técnica de Machala.

La Versión 1 establece una identidad visual relacionada con UTMACH y organiza el ecosistema digital del semillero en investigación, divulgación científica, eventos, equipo y contacto. El trabajo actual se presenta alrededor de bovinos, porcinos y aves.

## Estructura

- `portal/`: página pública principal de SIPA.
- `src/` y `public/`: experiencia original de la Expoferia de Nutrición Animal.
- `scripts/build-sipa.mjs`: compila el portal y preserva la expoferia dentro de `eventos/expoferia-nutricion-animal-2026/`.
- `.github/workflows/deploy-pages.yml`: publicación automática en GitHub Pages después de cada actualización de `main`.

## Desarrollo

```bash
npm install
npm run dev
```

Para abrir la experiencia histórica de la expoferia durante el desarrollo:

```bash
npm run dev:expo
```

## Compilación completa

```bash
npm run build
npm run preview
```

La compilación genera en `dist/`:

- El portal principal de SIPA.
- La Expoferia de Nutrición Animal 2026 en su ruta de evento.
- Información automática de versión, fecha de actualización y commit.
- Una página `404.html` y la configuración necesaria para GitHub Pages.

## Publicación

Cada fusión a `main` ejecuta el flujo **Deploy SIPA UTMACH**, valida JavaScript, compila el portal y publica `dist/` en la rama `gh-pages`.

Sitio público:

`https://elranchodejuan-jo.github.io/SIPA_UTMACH/`

## Principios de contenido

- **Divulgación científica:** artículos explicados, infografías, fichas técnicas, resultados y recursos permanentes.
- **Eventos:** páginas creadas para expoferias, casas abiertas, talleres y presentaciones.
- **Investigación:** memoria de proyectos, metodologías, avances, resultados y publicaciones.

## Estado

**SIPA v1.0.0 — Portal institucional inicial.**

Los nombres oficiales de autoridades, integrantes, misión, visión, correo y redes se incorporarán cuando sean confirmados por la dirección del semillero.
