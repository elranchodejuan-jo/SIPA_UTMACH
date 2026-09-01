# Mapa cromático SIPA — Fase cromática 1

**Estado:** análisis y planificación; no aplica cambios visuales.

**Baseline auditado:** `6767a1c` en `feat/sipa-green-identity`.

## 1. Resumen ejecutivo

El portal institucional SIPA tiene una deuda cromática predominantemente azul: la escala `brand`, los acentos científicos, sombras, neutrales fríos, SVGs, metadatos, 404 y la imagen social todavía proceden de la identidad de construcción. El logo original, en cambio, contiene un verde propio medible y será la única fuente visual de la nueva marca.

El inventario reproducible recorrió 77 archivos de texto institucionales y registró 226 apariciones de color o composición, con 127 literales distintos. Detectó 88 apariciones azul/cian en 56 valores; tres apariciones del único valor `#143B63` pertenecen exclusivamente a recursos de Expoferia y se excluyen. La deuda institucional candidata a resolver es, por tanto, de **85 apariciones azul/cian en 55 valores**, de las cuales cuatro corresponden al `portal/favicon.svg` huérfano (no llega al runtime). Además hay 19 neutrales gris-azulados que deben volverse verde-carbón, no tratarse como color de marca.

La Fase 2 debe migrar por roles, no mediante un reemplazo global: una escala y tokens semánticos explícitos evitarán que un verde para links se use accidentalmente como fondo de botón en modo oscuro. No se modifica en esta fase ningún CSS, HTML, asset de producción, logo, Expoferia ni salida `dist/`.

## 2. Fuente visual autorizada y método de extracción

La única fuente visual utilizada para definir la marca es `portal/assets/images/logo-sipa-original.png`. No se usaron capturas, miniaturas ni versiones de mensajería.

| Dato | Resultado comprobado |
|---|---|
| Formato | PNG RGBA de 8 bits |
| Dimensiones | 502 × 282 px; 141.564 píxeles |
| Alfa | 111.432 píxeles opacos, 30.132 transparentes, 0 semitransparentes |
| Integridad | SHA-256 `72FB48B8CCA7DEDBD643469D43B5B4140C15E2DEAD65E0E2A56F983F6C7DBAE3` |
| Clasificación opaca | 98.392 blancos, 3.395 negros, 8.042 grises, 1.540 verdes y 63 otros |

Se leyó el PNG píxel a píxel, se descartaron transparencia, blanco/negro/gris y transiciones de baja saturación, y se aplicó una máscara verde estricta: HSL 80–170°, saturación mínima 45 % y luminosidad 12–60 %. Esa máscara conservó 711 píxeles de trazo, no los bordes aclarados horneados en RGB.

| Métrica | Resultado |
|---|---|
| Promedio de la máscara | RGB(21,15; 128,71; 67,97) |
| Mediana de la máscara | RGB(21; 129; 68) = `#158144` |
| HSL aproximado | 146,1°; 72,0 %; 29,4 % |
| Modo exacto del archivo | `#0F8040`, solo 3 píxeles; no es representativo por compresión raster |
| Cluster de trazo vivo | `#128B46`, 344 px |
| Cluster de trazo oscuro | `#15753F`, 298 px |
| Borde suavizado | `#358559`, 157 px; no usar como token |

Una segunda medición más amplia encontró el bin RGB `#184` y el modo `#0F8040`, por lo que la hipótesis inicial `#118040` es una normalización visualmente próxima. Se documenta pero no se adopta: su diferencia frente a la mediana estricta es ΔRGB (−4, −1, −4), mientras que el borde `#358559` se aleja aproximadamente ΔE76 12. Elegir `#158144` evita inventar una aproximación donde el asset sí ofrece una medida representativa.

```text
verde_original_medido:    #158144
verde_base_recomendado:   #158144
normalización alternativa: #118040 (no seleccionada)
```

## 3. Alcance protegido: Expoferia

| Ámbito | Tratamiento |
|---|---|
| `index.html`, `src/**`, `public/**`, `images/**` | **EXCLUIDO — IDENTIDAD HISTÓRICA PROTEGIDA** |
| `dist/eventos/expoferia-nutricion-animal-2026/**` | **EXCLUIDO — artefacto generado, no fuente de verdad** |
| `scripts/generate-qr.mjs:57,69` y `favicon.svg:2` | **EXCLUIDO — recursos de Expoferia** |
| Barra `data-sipa-return` de `scripts/build-sipa.mjs:76-86` | **EXCLUIDO — identidad histórica protegida** |
| `public/favicon/**` y `public/favicon.ico` | **EXCLUIDO — dependencia compartida, no recolorear** |

La excepción técnica de favicon es relevante: `scripts/build-portal.mjs:119-126` copia `public/favicon/**` al portal, mientras `scripts/build-sipa.mjs:52-67` lo inyecta en Expoferia y `tests/e2e/favicon.spec.mjs` exige que ambos productos lo publiquen. El favicon 512 actual es negro/blanco/verde; no tiene deuda azul que justifique tocar la fuente protegida. Si en el futuro hiciera falta un favicon verde exclusivo SIPA, debe añadirse una fuente aislada del portal y adaptar ensamblaje y pruebas con una autorización explícita, nunca mutar `public/**`.

## 4. Inventario y fuentes cromáticas

El script temporal `tmp/sipa-green-audit/audit-colors.mjs` genera `color-inventory.json` y `color-inventory.md`, ambos ignorados por Git. Busca hexadecimal corto/largo, RGB/RGBA, HSL/HSLA, palabras de color, `color-mix`, gradientes, sombras, `fill` y `stroke`. El build integrado se ejecutó sobre el baseline para comprobar la salida heredada; confirmó que los valores alcanzan CSS publicado, 404, manifest, `theme-color` y SVGs del portal.

| Fuente | Hallazgo | Clasificación |
|---|---|---|
| `portal/assets/css/tokens.css` | 36 apariciones azul/cian; escala, ciencia, foco, neutrales y sombras | A, B y C |
| `base.css`, `components.css`, `layout.css`, `pages.css` | Roles heredados, CTA, footer, overlays, gradientes y hardcodes | A, B, C y D |
| `responsive.css` | No introduce tinta institucional; `CanvasText`/`Highlight` de forced-colors se conservan | C — conservar OS |
| `portal/assets/images/hero-sipa.svg` | 14 apariciones azul/cian en panel, ciencia, trazos y sombra | A, B, C y E |
| `portal/assets/logo-sipa.svg` | Logo alterno azul usado por el footer | A — sustituir/reconstruir en Fase 2 |
| `portal/assets/images/og-sipa.png` | 1731 × 909 RGB, SHA-256 `CC997B261CC21D3DD4235A78C6C4AA1A6F0A7A1678C74FFF7C2BEA5F01663355`; 1.471.874 de 1.573.479 píxeles son azul/cian dominantes | A — recrear manualmente |
| `portal/favicon.svg` | Azul, pero no lo copia `copyPortalAssets` ni lo referencia el layout | A — huérfano; eliminar o migrar solo tras verificar referencias |
| `portal/assets/images/logo-sipa-original.png` | Logo verde autorizado del header | Conservar, byte por byte |
| `portal/config/site.mjs`, `layout.mjs`, `site.js` | `theme-color` estático y dinámico, manifest y OG | A |
| `scripts/build-portal.mjs` | 404 autocontenida, manifest y color de navegador | A, B y C |
| `tests/e2e/*.mjs` | Verifican formato/presencia de colores, no hex azul fijo | Actualizar contratos, no relajarlos |
| `QA_REPORT.md:119` | Menciona “icono azul correcto” como hecho histórico | Deuda documental; actualizar en Fase 2 |

`portal/assets/icons/sipa-icons.svg` no porta tinta fija; emplea `currentColor` y se migrará al cambiar los roles que lo alimentan. `portal/templates/partials/header.mjs:27` usa el PNG original, pero `portal/templates/partials/footer.mjs:17` usa el SVG alterno azul: esa diferencia debe cerrarse en Fase 2.

## 5. Paleta objetivo

### 5.1 Escala institucional clara

| Token | Valor | Rol permitido |
|---|---|---|
| `--color-brand-950` | `#07170D` | negro bosque, footer y superficies de máxima jerarquía |
| `--color-brand-900` | `#0A2817` | bosque profundo |
| `--color-brand-800` | `#0D4827` | hover oscuro y fondos de alto contraste |
| `--color-brand-700` | `#116A38` | link y acción clara con blanco |
| `--color-brand-600` | `#158144` | verde SIPA medido; detalle, foco y acento |
| `--color-brand-500` | `#209653` | bloque decorativo grande; no texto blanco/normal |
| `--color-brand-400` | `#4EAD74` | fondo/acento con texto oscuro; acción oscura |
| `--color-brand-300` | `#83C49A` | menta con texto oscuro; link/foco oscuro |
| `--color-brand-200` | `#B9DEC5` | panel menta y texto oscuro |
| `--color-brand-100` | `#DCEFE2` | realce suave |
| `--color-brand-50` | `#F3FAF5` | blanco verdoso de fondo |

### 5.2 Modo oscuro y roles

El modo oscuro no debe invertir literalmente la escala clara. Mantiene superficies verde-negras y crea roles explícitos para que los consumidores actuales de `brand-700` no fallen en contraste:

| Token/rol futuro | Valor oscuro | Uso |
|---|---|---|
| `--color-surface` | `#09110C` | canvas negro verdoso |
| `--color-surface-soft` | `#101C14` | superficie base |
| `--color-surface-raised` | `#17271B` | tarjeta elevada |
| `--color-ink` | `#F3F8F4` | texto principal |
| `--color-text` | `#C2CEC5` | texto secundario |
| `--color-line` / `--color-line-strong` | `#2C3A30` / `#647C6A` | bordes perceptibles sin brillo |
| `--color-link` | `#83C49A` | link subrayado y estado activo |
| `--color-focus` | `#83C49A` | anillo de foco sobre fondo oscuro |
| `--color-action-primary` | `#4EAD74` | botón primario con `--color-on-brand: #07170D` |
| override heredado `--color-brand-700` | `#83C49A` | transición segura de links existentes |
| override heredado `--color-brand-600` | `#4EAD74` | transición de acción/acento |
| override heredado `--color-brand-500` | `#B9DEC5` | hover/CTA de alto contraste |

La implementación debe añadir aliases por función (`--color-link`, `--color-action-primary`, `--color-on-brand`) y migrar los consumidores. No puede conservar `brand-700` como `#116A38` en fondo oscuro: su ratio es 2,86:1.

### 5.3 Ciencia, neutrales y sombras

| Familia | Valores propuestos | Regla |
|---|---|---|
| Ciencia salvia | `#3B634A`, `#527963`, `#6F987B`, `#AFC9B5`, `#E7F0E8` | Mantener `--color-science-*` por claridad; sin azul/turquesa |
| Neutrales claros | `#FFFFFF`, `#F6F8F5`, `#CAD2CB`, texto `#142018`, secundario `#4B554D` | Blanco y piedra con subtono verde |
| Neutrales oscuros | `#09110C`, `#101C14`, `#17271B`, borde `#2C3A30` | Negro verdoso y superficies elevadas, no verde plano |
| Sombras claras | `rgba(7, 23, 13, .08/.12)` | Sustituir `rgba(3,35,61,…)` azulada |
| Sombras oscuras | negro neutro de baja opacidad | Conservar profundidad sin halo azul |

`--color-warm-*` no debe sobrevivir por compatibilidad. En Fase 2 se evaluará cada consumidor: si aporta una llamada de atención semántica se renombrará `--color-accent-*`; si solo decora, se sustituirá por ciencia/marca. No se elimina el token hasta que no haya referencias.

## 6. Semántica y especies

| Función | Claro | Regla accesible |
|---|---|---|
| Éxito | `#2B6B45` | No confundir con marca: icono, texto y contexto obligatorios |
| Advertencia | `#8A4B00` | Ámbar controlado, no naranja decorativo |
| Error | `#B42318` | Conservar rojo accesible y mensaje textual |
| Información | `#426758` | Verde-gris, no azul; icono y texto |
| Bovinos | `#7A5622` | Solo chip, leyenda o marcador con etiqueta |
| Porcinos | `#7A455E` | Solo chip, leyenda o marcador con etiqueta |
| Aves | `#716316` | Solo chip, leyenda o marcador con etiqueta |

Los acentos actuales de especies ya se limitan a iconos, bordes y chips de `pages.css`; deben conservar ese alcance. En páginas que no comparen especies, el acento es decoración heredada y debe desaparecer a favor del verde SIPA. Ningún color de especie se usa como fondo grande, navegación o CTA.

## 7. Matriz de contraste WCAG

Los ratios se calcularon con luminancia relativa WCAG 2.x; texto normal requiere 4,5:1, texto grande 3:1 y foco/componente 3:1.

| Combinación/uso | Ratio | Resultado y decisión |
|---|---:|---|
| `#142018` sobre `#FFFFFF` | 16,81:1 | PASS; texto normal claro |
| `#4B554D` sobre `#FFFFFF` | 7,76:1 | PASS; texto secundario claro |
| Link `#116A38` sobre `#FFFFFF` | 6,68:1 | PASS; subrayar además |
| Botón claro blanco sobre `#116A38` | 6,68:1 | PASS; principal y navegación activa |
| Hover claro blanco sobre `#0D4827` | 10,64:1 | PASS |
| Secundario `#116A38` sobre `#F3FAF5` | 6,30:1 | PASS |
| Foco claro `#158144` sobre blanco | 4,93:1 | PASS; anillo doble con separación `brand-50` |
| Texto oscuro `#142018` sobre `#B9DEC5` | 11,46:1 | PASS; menta/panel |
| Texto principal oscuro `#F3F8F4` sobre `#09110C` | 17,81:1 | PASS |
| Texto secundario oscuro `#C2CEC5` sobre `#09110C` | 11,78:1 | PASS |
| Link/foco oscuro `#83C49A` sobre `#09110C` | 9,41:1 | PASS; link subrayado |
| Botón oscuro `#07170D` sobre `#4EAD74` | 6,64:1 | PASS |
| Footer `#F3F8F4` sobre `#07170D` | 17,18:1 | PASS |
| Éxito/advertencia/error/info sobre blanco | 6,38 / 6,80 / 6,57 / 6,34:1 | PASS; nunca color como única señal |
| Blanco sobre `#209653` | 3,78:1 | RECHAZADO; no texto blanco |
| `#142018` sobre `#209653` | 4,44:1 | RECHAZADO para texto normal |
| Blanco sobre `#4EAD74` / `#83C49A` | 2,78 / 2,03:1 | RECHAZADO |
| `#116A38` sobre `#09110C` | 2,86:1 | RECHAZADO; no link/foco oscuro |

Decisiones de componente: blanco solo sobre `brand-700`/`brand-600`/más oscuro en claro; texto negro-verdoso sobre `brand-400` a `brand-100`; botón oscuro con fondo `#4EAD74` y texto `#07170D`; link oscuro `#83C49A` subrayado; foco doble con anillo claro `#158144` y anillo oscuro `#83C49A`.

## 8. Tabla de migración completa

La columna “valor actual” enumera todos los azules/cianes detectados por grupo, incluidas repeticiones funcionales. Los valores de Expoferia se separan al final y no entran en la deuda SIPA.

| Archivo | Línea o selector | Valor actual | Uso | Clasificación | Token futuro | Valor propuesto | Acción |
|---|---|---|---|---|---|---|---|
| `portal/assets/css/tokens.css` | 5–16 | `#03233D #06385F #004F86 #005B9F #087FBA #2B9ED4 #A9D8ED #DCEFF8 #EFF8FC` | escala brand clara | A | `--color-brand-950…50` | escala §5.1 | Reemplazar y añadir 400/300 |
| `portal/assets/css/tokens.css` | 14–16 | `#006D77 #087F8C #D8F1F0` | ciencia cian | B | `--color-science-*` | salvia §5.3 | Migrar sin turquesa |
| `portal/assets/css/tokens.css` | 29–37, 40 | `#172B3A #324957 #526875 #D8E2E8 #B9C9D2 #005B9F` | tinta, texto, líneas y foco | C/A | neutrales/`--color-focus` | §5.3 y §7 | Convertir a carbón verde |
| `portal/assets/css/tokens.css` | 80–82 | `rgba(3,35,61,.08/.12)` | sombras azules | C | `--shadow-*` | `rgba(7,23,13,…)` | Migrar opacidades |
| `portal/assets/css/tokens.css` | 97–105 | `#63BDEA #79C9EE #8DD3F2 #39718D #203E4E #142B36 #54C3C0 #6BD0CD #173C3D` | escala/ciencia oscura | A/B/C | roles oscuros | §5.2–5.3 | Sustituir por overrides seguros |
| `portal/assets/css/tokens.css` | 115–126 | `#D4E0E6 #BBC9D2 #0D1B23 #12232B #182830 #20333C #31444D #4A626D #79C9EE #061923` | neutrales/foco/on-brand oscuro | C/A | roles oscuros | §5.2 | Migrar; `on-brand` oscuro `#07170D` |
| `portal/assets/css/base.css` | 68–79, 102–107, 203 | aliases brand/science | links, headings, foco | A/B | aliases de función | §5.1–5.2 | Remapear consumidores |
| `portal/assets/css/base.css` | 185, 194 | `#FFFFFF` | texto sobre fondo profundo | C | `--color-on-brand` | blanco | Conservar |
| `portal/assets/css/base.css` | 236–239 | `#D8B45A #5B430C #FFF5D8` | aviso ámbar | D | `--color-warning-*` | semántica §6 | Conservar con token explícito |
| `portal/assets/css/components.css` | 39, 86, 91 | `#061923 #FFFFFF #EAF5FA` | hover/fondo de botón | C | roles superficie/on-brand | §5.2–5.3 | Eliminar azul directo |
| `portal/assets/css/components.css` | 107,119,239,312 | `currentColor` | iconos SVG | C | hereda roles | n/a | No hardcodear; validar herencia |
| `portal/assets/css/components.css` | 281–283 | `color-mix(--color-success…)` | badge éxito | D | éxito semántico | §6 | Conservar mezcla, migrar token |
| `portal/assets/css/components.css` | 333–344 | `#DCECF4 #8ED8D5 #FFFFFF` | CTA oscuro/eyebrow | A/B/C | texto/acento oscuro | §5.2 | Migrar a menta/ink |
| `portal/assets/css/layout.css` | 10, 414–423 | `#DCECF4 #8ED8D5 #FFFFFF` | barra institucional y sección ink | A/B/C | texto/acento oscuro | §5.2 | Migrar |
| `portal/assets/css/layout.css` | 234 | `rgba(3,20,31,.58)` | backdrop | C | overlay bosque | `rgba(7,23,13,.58)` | Migrar |
| `portal/assets/css/layout.css` | 452–551 | `#C9DBE4 #B5CCD7 #BFD3DD #A9C1CC #9ED8F2 #B5CBD5` | footer y dominio | A/C | footer roles | §5.2 | Sustituir por blanco/menta/secondary |
| `portal/assets/css/layout.css` | 460 | gradiente `brand-500 → science-600` | divisor footer | A/B | brand/science | verde → salvia | Migrar, sin cian |
| `portal/assets/css/layout.css` | 534, 563, 566, 573 | blanco RGBA | bordes/superficies translúcidas | C | mismo rol | blanco RGBA | Conservar; verificar contraste |
| `portal/assets/css/pages.css` | 54–55 | gradiente ciencia/brand | hero de página | A/B | brand/science | verde/salvia | Migrar |
| `portal/assets/css/pages.css` | 346–395 | `rgba(3,35,61,.88/.92) #FFFFFF` | overlay de vídeo | C | overlay bosque | `rgba(7,23,13,…)` | Migrar tintas; conservar blanco |
| `portal/assets/css/pages.css` | 637 | `#8ED8D5` | marcador de checklist | B | ciencia/éxito | salvia accesible | Migrar |
| `portal/assets/css/responsive.css` | 373,378 | `CanvasText`/`Highlight` | forced-colors | C | OS | OS | Conservar |
| `portal/assets/images/hero-sipa.svg` | 6–29, 71, 75–77 | `#F8FCFE #E9F5F8 #087FBA #004F86 #03233D #C5DCE7 #A9D8ED #D8F1F0 #006D77 #7B9BAA #A9C7D5 #A8DFE0 #005B9F` | panel, trazos, ciencia y sombra | A/B/C | brand/science/neutrales | §5 | Redibujar colores; conservar especies |
| `portal/assets/images/hero-sipa.svg` | 36–61 | bovino/porcino/aves | iconos de especies | E | species | §6 | Conservar solo como acento |
| `portal/assets/logo-sipa.svg` | 3, 7 | `#22A6E8 #004F86 #8BDCFF` | logo azul alterno del footer | A | asset de marca | verde/menta | Sustituir o redibujar; no tocar PNG original |
| `portal/assets/images/og-sipa.png` | raster completo | azul/cian dominante | Open Graph | A | asset OG | composición verde SIPA | Recrear y revisar legibilidad |
| `portal/favicon.svg` | 1 | `#1AA0E4 #004F86 #9EE4FF` | SVG azul no publicado | A | n/a | n/a | Confirmar huérfano; borrar o migrar solo Fase 2 |
| `portal/config/site.mjs` | 31–35 | `#0B1B27 #075D91` | `themeColors` | A/C | `theme-color` roles | claro `#116A38`, oscuro `#09110C` | Actualizar |
| `portal/templates/layout.mjs` | 70, 87–96 | `theme-color` y favicons compartidos | metadatos | A / excluido | configuración | §5.2 | Actualizar meta; no mutar favicon compartido |
| `portal/assets/js/site.js` | 121 | `#0B1B27 #075D91` | cambio runtime de `theme-color` | A/C | theme roles | §5.2 | Consumir configuración/roles |
| `scripts/build-portal.mjs` | 133, 135 | `#075D91 #0B1B27 #102A3A #27B4B1`, RGBAs azules | 404, foco y sombra | A/B/C | 404 propia | §5–7 | Reescribir inline; no depende de tokens |
| `scripts/build-portal.mjs` | 162–178 | manifest generado | `theme_color`, browser chrome | A | theme roles | §5.2 | Derivar de `SITE_CONFIG` actualizado |
| `tests/e2e/theme.spec.mjs`, `navigation.spec.mjs`, `mobile-menu.spec.mjs`, `favicon.spec.mjs` | tema/favicons/color computado | contratos | A/C | contratos verdes | §7 | Añadir assertions de color/contraste, no relajar |
| `QA_REPORT.md` | 119 | “icono azul correcto” | relato de QA histórico | A documental | texto vigente | identidad verde | Corregir en Fase 2 |
| `scripts/build-sipa.mjs` | 76–86 | `rgba(20,59,99,.94)` | retorno Expoferia | F | n/a | n/a | **EXCLUIDO — no tocar** |
| `favicon.svg`, `scripts/generate-qr.mjs` | 2; 57,69 | `#143B63` | favicon/QR Expoferia | F | n/a | n/a | **EXCLUIDO — no contar ni tocar** |

## 9. Archivos afectados en Fase 2

Cambiar, después de revisión visual y contractual: `portal/assets/css/tokens.css`, `base.css`, `components.css`, `layout.css`, `pages.css`; `portal/assets/images/hero-sipa.svg`, `portal/assets/logo-sipa.svg`, `portal/assets/images/og-sipa.png`; `portal/config/site.mjs`; `portal/assets/js/site.js`; `scripts/build-portal.mjs`; layout/footer si se cambia la referencia de logo; y las pruebas de tema, navegación, favicon y capturas que declaren los nuevos contratos.

Revisar sin modificar por defecto: `portal/favicon.svg` (huérfano), `QA_REPORT.md` (deuda histórica) y la configuración de `--color-warm-*` antes de renombrarla. Mantener sin cambios: logo PNG original, `index.html`, `src/**`, `public/**`, Expoferia y su barra de retorno.

## 10. Riesgos y criterios de aceptación para Fase 2

1. Migrar solo `tokens.css` dejaría azul visible en 404, SVG, OG, JS y metadatos.
2. Un reemplazo global de azul por verde reutilizaría el verde de marca como éxito y perdería semántica; usar icono y texto para todos los estados.
3. Un verde claro con texto blanco falla; los tonos 500, 400 y 300 tienen restricciones obligatorias de §7.
4. El footer usa el SVG azul alterno aunque el header use el PNG verde; ambas representaciones deben quedar coherentes.
5. `og-sipa.png` no se corrige con CSS: necesita una pieza raster nueva, revisada en la tarjeta social.
6. Los favicon de `public/**` son compartidos/protegidos: crear una ruta aislada si se aprobara una identidad de navegador diferente.

La Fase 2 se acepta solamente si: no queda azul/cian visible en el portal SIPA fuera de recursos explícitamente excluidos; no se aplica verde neón, militar ni superficies verdes completas; todos los colores hardcodeados y compuestos de la tabla tienen acción ejecutada; texto normal y controles cumplen las ratios de §7; los estados semánticos no dependen solo del color; el logo original conserva el SHA-256 anterior; Expoferia y `public/**` permanecen intactos; y build, chequeos, pruebas, revisión visual claro/oscuro y `git diff --check` pasan.

## 11. Vista previa temporal y evidencia

La prueba cromática existe únicamente en `tmp/sipa-green-audit/`, ruta ignorada:

- `palette-light.html` y `palette-light.png`;
- `palette-dark.html` y `palette-dark.png`;
- matriz de combinaciones, botón principal/secundario, link, navegación activa, tarjeta, footer y focus ring dentro de cada HTML;
- `audit-colors.mjs`, `color-inventory.json` y `color-inventory.md` para reproducir el inventario.

Las vistas se inspeccionaron como muestras de paleta, no se copiaron a `dist/` ni modifican el portal.
