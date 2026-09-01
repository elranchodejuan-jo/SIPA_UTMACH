# Reporte QA — SIPA V2 multipágina

## Estado del reporte

- **Fecha:** 1 de septiembre de 2026
- **Rama:** `feat/sipa-v2-portal-multipagina`
- **SHA base incluido en el build validado:** `22cfe31`
- **Estado local:** PASS
- **Estado remoto:** pendiente de pull request y checks de GitHub Actions
- **Alcance:** portal institucional multipágina, preservación de Expoferia, generación estática, navegación, accesibilidad, responsive, seguridad de contenido y compatibilidad con GitHub Pages.

El PASS local corresponde al estado integrado posterior a las correcciones visuales y funcionales descritas en este reporte. No implica despliegue ni validación de producción.

## Evidencia final ejecutada

| Control | Comando o método | Resultado |
| --- | --- | --- |
| Instalación reproducible | `npm.cmd ci` | PASS, ejecutado por release sobre el lockfile integrado. |
| Validación integral | `npm.cmd run validate` | PASS, exit code 0, ejecutado después del microfix visual final. |
| Sintaxis JavaScript | `npm.cmd run check:js` | PASS: 52 archivos. |
| Build integrado | `npm.cmd run build` | PASS: TypeScript/Vite de Expoferia, portal multipágina, integración y validación interna. |
| Sitio estático | `npm.cmd run check:site` | PASS: 9 rutas, 11 HTML, 540 referencias y 9 URLs en sitemap. |
| Contratos unitarios | `npm.cmd run test:unit` | PASS: 8/8. |
| Playwright | `npm.cmd run test:e2e` dentro de `validate` | PASS: 41 aprobadas, 33 omitidas intencionalmente por proyecto, 0 fallidas; 1.3 min. |
| Focal posterior al P0 de header | Playwright, un worker | PASS: 27 aprobadas, 27 omitidas intencionalmente, 0 fallidas; 52.6 s. |
| Dependencias | `npm audit --json` | PASS final: 0 vulnerabilidades. No se ejecutó `npm audit fix`. |
| Dependencias runtime | `npm audit --omit=dev --json` | PASS: 0 vulnerabilidades runtime. |
| Whitespace | `git diff --check` | PASS en las revisiones integradas; repetido tras actualizar este reporte. |
| Capturas | Playwright + inspección humana | PASS: 10/10 capturas requeridas revisadas; Contacto fue recapturada después de corregir su icono. |

En Windows, la ejecución final de `validate` utilizó un preview local controlado y `SIPA_BASE_URL=http://127.0.0.1:4173` para evitar dejar un proceso hijo huérfano. El servidor fue detenido explícitamente al terminar. El workflow Linux conserva el servidor administrado por Playwright.

## Cobertura del validador estático

- Todas las rutas publicadas generan su archivo registrado.
- Enlaces internos, fragmentos, CSS y assets resuelven desde cualquier profundidad.
- No existen `href="#"`, referencias vacías ni protocolos ejecutables en el portal.
- Cada página del portal contiene `lang`, un `h1`, IDs únicos, título, descripción, canonical, landmarks, skip link y Volver arriba.
- La página activa se comprueba dentro de la navegación principal.
- Los botones declaran `type`; los enlaces externos publicados usan relaciones seguras.
- Sitemap y rutas publicadas coinciden; Expoferia permanece incluida.
- `robots.txt`, `404.html`, `build-info.json`, `.nojekyll`, manifest e imagen social existen.
- `dist/` no publica plantillas, contenido fuente, configuración interna ni módulos de generación.
- Webinars publicados requieren YouTube válido; redes y formulario publicados requieren destinos válidos.
- La Expoferia se valida como artefacto histórico: existencia, referencias locales y retorno al portal, sin imponerle la plantilla SIPA V2 ni prohibir sus imágenes históricas embebidas.

## Cobertura E2E

- Navegación principal, submenú Webinars, página activa, logo, breadcrumbs, footer, Eventos, Expoferia y 404.
- Menú móvil: apertura, backdrop, Escape, foco, selección de enlace, bloqueo de scroll, acordeones y altura reducida.
- Tema: preferencia del sistema, cambio, etiqueta accesible y persistencia tras recarga/navegación.
- Volver arriba con control real, foco razonable y `scrollY <= 4`, también con movimiento reducido.
- Webinars: estado vacío profesional o iframe diferido en `youtube-nocookie.com`, sin autoplay con sonido.
- Equipo, contacto y footer derivados exclusivamente de contenido publicado.
- Progressive enhancement: páginas y enlaces principales legibles sin JavaScript.
- Axe WCAG A/AA en Inicio, Investigación, Webinars, Equipo, Contacto y menú móvil abierto.
- Consola sin errores, sin excepciones de página, solicitudes fallidas ni recursos 404.
- Sin overflow horizontal, imágenes rotas/deformadas ni objetivos táctiles inferiores a 44 × 44 px en la matriz probada.

## Matriz responsive

| Viewport | Resultado |
| --- | --- |
| 360 × 800 | PASS |
| 390 × 844 | PASS |
| 768 × 1024 | PASS |
| 1024 × 768 | PASS |
| 1366 × 768 | PASS |
| 1440 × 900 | PASS |

También se verificó la costura de breakpoint en 900, 901, 1023 y 1024 px para mantener alineados CSS y JavaScript.

## Capturas inspeccionadas

Directorio temporal no versionado: `tmp/sipa-v2-qa/`.

- `inicio-escritorio.png`
- `inicio-movil.png`
- `menu-movil-abierto.png`
- `sipa.png`
- `investigacion.png`
- `webinars.png`
- `equipo.png`
- `contacto.png`
- `footer.png`
- `modo-oscuro-investigacion.png`

**Resultado visual:** PASS. Se revisaron jerarquía, saturación, alineación, espaciado, header, panel móvil, footer, estados vacíos, iconografía y contraste en tema oscuro. La imagen Open Graph se inspeccionó por separado: identidad SIPA, UTMACH y `SIPAUTMACH.COM` son legibles y el logo corregido está presente.

## Seguridad y dependencias

- La auditoría inicial detectó 2 vulnerabilidades altas y 2 moderadas en la cadena exclusiva de build `vite@6.4.3 → postcss@8.5.20 → nanoid@3.3.16`.
- Release actualizó de forma dirigida las dependencias transitivas del lockfile a PostCSS 8.5.26 y Nano ID 3.3.18, sin ejecutar `npm audit fix` a ciegas.
- La reevaluación final reportó 0 vulnerabilidades totales y 0 de runtime.
- No se encontraron `.env` versionados ni firmas comunes de secretos en el escaneo realizado.
- No se añadieron tokens, claves, endpoints sensibles ni datos personales no confirmados.
- GitHub Pages no permite definir desde este repositorio todos los headers HTTP de seguridad; no se declaran comprobados headers que dependen de la plataforma externa.

## Defectos detectados y corregidos

1. Ruta de imagen social desacoplada del asset real. Se unificó en `assets/images/og-sipa.png` y se reemplazó el marco vacío por el logo SIPA.
2. El validador contaba `aria-current` fuera del menú principal y trataba imágenes `data:` históricas de Expoferia como assets del portal. Se focalizó el menú y se limitó la excepción al artefacto preservado.
3. El breakpoint JavaScript no coincidía con CSS entre 901 y 1023 px. Se alineó a 64 rem y se probó la costura.
4. Contraste insuficiente en un eyebrow oscuro y overflow móvil de Inicio. Se corrigieron y Axe/360/390 quedaron verdes.
5. Objetivos táctiles de navegación medían menos de 44 px en el borde de 1024. Se añadió margen de redondeo y la matriz quedó verde.
6. El panel móvil fue recortado o interceptado por backdrop/header debido a stacking, `overflow` y `backdrop-filter`. Se corrigió y las cuatro interacciones móviles quedaron verdes.
7. En escritorio, `.js .primary-nav` conservaba `height: 100dvh`, expandía el header a 769 px e interceptaba el CTA de Eventos. Se restablecieron ancho, alto y overflow en el breakpoint desktop; la focal posterior quedó verde.
8. El icono externo de Contacto heredaba relleno negro porque el SVG portaba directamente `card__icon`. Se normalizó el selector de trazo, se regeneró `contacto.png` y la inspección focal confirmó el icono azul correcto.
9. Los primeros E2E saturaron Chromium/Vite con seis workers y duplicaron escenarios pesados. La configuración final usa un worker en Windows y dos en CI, serializa pruebas pesadas y conserva la cobertura de ambos proyectos.

## Riesgos residuales y pendientes humanos

- Los nombres completos, cargos, fotografías y perfiles del equipo requieren confirmación institucional.
- Misión y visión oficiales permanecen ocultas hasta su aprobación.
- Correo, WhatsApp y redes sociales adicionales requieren URLs confirmadas.
- La biblioteca de webinars espera sus primeros enlaces, ponentes y metadatos confirmados.
- Los proyectos, publicaciones y producción científica deben incorporarse solo después de validación institucional.
- Los checks del pull request y el despliegue de GitHub Pages se reportan por separado cuando exista el PR; no forman parte del PASS local.

## Criterio de cierre

**QA local: PASS.** Build, validación estática, unitarias, E2E, auditoría de dependencias, seis viewports, consola, enlaces, assets y revisión visual se ejecutaron sobre la implementación integrada. No quedan defectos técnicos P0/P1 conocidos dentro del alcance; el cierre remoto depende de los checks del pull request y no autoriza merge automático.
