# Iconografía del portal SIPA

La interfaz usa un sprite SVG local; no descarga librerías, fuentes de iconos ni
scripts desde un CDN. Los iconos se incluyen en el HTML estático con `renderIcon`.

## Procedencia

- Fuente oficial: [lucide-icons/lucide](https://github.com/lucide-icons/lucide).
- Revisión fijada: `dab294f313897bacaa968b725b3259fa37c17bd1` (13 de octubre de 2026).
- Descarga: 14 de octubre de 2026.
- `lucide/` conserva los SVG oficiales sin modificar.
- `manifest.json` registra el nombre original y el SHA-256 de cada archivo.
- `LUCIDE-LICENSE.txt` conserva la licencia completa ISC y la atribución MIT
  correspondiente a los iconos derivados de Feather.
- `sipa-local.svg` conserva los símbolos previos de bovinos, porcinos, aves y redes
  sociales. No son iconos Lucide y no se atribuyen a ese proyecto.

Los alias del portal conservan compatibilidad con el contenido existente:
`learning` → `graduation-cap`, `research` → `microscope`, `outreach` → `megaphone`,
`shield` → `shield-check`, `article` → `file-text`, `resource` → `book-open`,
`news` → `newspaper`, `gallery` → `images`, `calendar` → `calendar-days`,
`people` → `users-round`, `location` → `map-pin`, `external` → `external-link`,
`close` → `x`, `check-circle` → `circle-check` y `alert-triangle` → `triangle-alert`.
Los otros nombres coinciden con los originales de Lucide.

## Mantenimiento

```sh
node scripts/generate-icons.mjs
node scripts/generate-icons.mjs --check
```

La generación funciona sin red y comprueba las sumas antes de escribir (normaliza
los saltos CRLF de Windows a LF para comparar). El segundo
comando no modifica archivos; lo ejecuta la suite unitaria del portal para evitar
que el sprite se desvincule de las fuentes y su atribución. Al actualizar Lucide,
actualizar los SVG, las sumas, la revisión y la licencia juntos, y regenerar.

Los iconos decorativos usan `aria-hidden="true"`; si el icono lleva significado
sin texto contiguo, pasar `label` a `renderIcon`. Los controles conservan nombres
accesibles y texto visible cuando corresponda.
