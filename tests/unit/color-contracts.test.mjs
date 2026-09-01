import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { SITE_CONFIG } from '../../portal/config/site.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tokensPath = path.join(rootDir, 'portal/assets/css/tokens.css');
const logoPath = path.join(rootDir, 'portal/assets/images/logo-sipa-original.png');
const ogPath = path.join(rootDir, 'portal/assets/images/og-sipa.png');

const APPROVED_LIGHT_BRAND = Object.freeze({
  950: '#07170D',
  900: '#0A2817',
  800: '#0D4827',
  700: '#116A38',
  600: '#158144',
  500: '#209653',
  400: '#4EAD74',
  300: '#83C49A',
  200: '#B9DEC5',
  100: '#DCEFE2',
  50: '#F3FAF5',
});

const APPROVED_DARK_BRAND = Object.freeze({
  950: '#061B0D',
  900: '#0A2F18',
  800: '#104421',
  700: '#65C889',
  600: '#82DBA2',
  500: '#A1E7B8',
  400: '#B9EFCA',
  300: '#CDEED7',
  200: '#244B31',
  100: '#193B25',
  50: '#102B1A',
});

const LEGACY_BLUE_LITERALS = Object.freeze([
  '#03233D', '#06385F', '#004F86', '#005B9F', '#087FBA', '#2B9ED4',
  '#A9D8ED', '#DCEFF8', '#EFF8FC', '#006D77', '#087F8C', '#D8F1F0',
  '#0B1B27', '#075D91', '#27B4B1', '#22A6E8', '#8BDCFF', '#1AA0E4', '#9EE4FF',
  '#63BDEA', '#79C9EE', '#8DD3F2', '#39718D', '#203E4E', '#142B36',
  '#54C3C0', '#6BD0CD', '#173C3D', '#F2F7FA', '#D4E0E6', '#BBC9D2',
  '#0D1B23', '#12232B', '#182830', '#20333C', '#31444D', '#4A626D',
  '#DCECF4', '#C9DBE4', '#B5CCD7', '#BFD3DD', '#A9C1CC', '#9ED8F2',
  '#B5CBD5', '#EAF5FA', '#F5F8FA', '#102A3A', '#ECF5F8', '#061923',
]);

const EXCLUDED_HISTORICAL_PATHS = Object.freeze([
  'index.html',
  'src/',
  'public/',
  'dist/eventos/expoferia-nutricion-animal-2026/',
]);

const SCANNED_SOURCE_ROOTS = Object.freeze([
  'portal',
  'scripts/build-portal.mjs',
]);

const hexToRgb = value => {
  const hex = value.replace('#', '');
  return [0, 2, 4].map(index => Number.parseInt(hex.slice(index, index + 2), 16));
};

const linearize = channel => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = color => {
  const [red, green, blue] = hexToRgb(color).map(linearize);
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const contrast = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const declarationsFrom = block => Object.fromEntries(
  [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim().toUpperCase()]),
);

const resolveColor = (declarations, value, seen = new Set()) => {
  const token = value?.match(/^VAR\((--[\w-]+)\)$/i)?.[1]?.toLowerCase();
  if (!token) return value;
  assert.ok(!seen.has(token), `referencia circular de token: ${token}`);
  assert.ok(declarations[token], `token no resuelto: ${token}`);
  return resolveColor(declarations, declarations[token], new Set([...seen, token]));
};

const colorDeclarations = async () => {
  const source = await readFile(tokensPath, 'utf8');
  const darkStart = source.indexOf(":root[data-theme='dark']");
  assert.notEqual(darkStart, -1, 'tokens.css debe declarar los overrides oscuros');
  return {
    source,
    light: declarationsFrom(source.slice(0, darkStart)),
    dark: declarationsFrom(source.slice(darkStart)),
  };
};

const relative = filePath => path.relative(rootDir, filePath).replaceAll('\\', '/');

const isTextAsset = entry => /\.(?:css|m?js|svg|html)$/i.test(entry);

const collectTextFiles = async target => {
  const absolute = path.join(rootDir, target);
  const stats = await (await import('node:fs/promises')).stat(absolute);
  if (stats.isFile()) return isTextAsset(absolute) ? [absolute] : [];
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => collectTextFiles(path.join(target, entry.name))));
  return nested.flat();
};

const saturatedBlueOrCyan = (red, green, blue) => {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;
  if (chroma < 26 || maximum === 0) return false;
  const saturation = chroma / maximum;
  if (saturation < 0.22) return false;
  let hue;
  if (maximum === red) hue = 60 * (((green - blue) / chroma) % 6);
  else if (maximum === green) hue = 60 * (((blue - red) / chroma) + 2);
  else hue = 60 * (((red - green) / chroma) + 4);
  if (hue < 0) hue += 360;
  return hue >= 175 && hue <= 260;
};

const visibleColorLiterals = source => {
  const hexes = [...source.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi)].map(match => {
    const hex = match[1].length === 3 ? [...match[1]].map(value => value.repeat(2)).join('') : match[1];
    return hexToRgb(`#${hex}`);
  });
  const rgb = [...source.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)]
    .map(([, red, green, blue]) => [Number(red), Number(green), Number(blue)]);
  const hsl = [...source.matchAll(/hsla?\(\s*(-?\d+(?:\.\d+)?)\s*(?:deg)?\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/gi)]
    .map(([, hue, saturation, lightness]) => ({ hue: Number(hue), saturation: Number(saturation) / 100, lightness: Number(lightness) / 100 }));
  return { rgb: [...hexes, ...rgb], hsl };
};

const saturatedBlueOrCyanHsl = ({ hue, saturation, lightness }) => {
  const normalizedHue = ((hue % 360) + 360) % 360;
  return saturation >= 0.22 && lightness > 0.04 && lightness < 0.96 && normalizedHue >= 175 && normalizedHue <= 260;
};

test('la escala verde SIPA aprobada existe en ambos temas', async () => {
  const { light, dark } = await colorDeclarations();
  for (const [level, value] of Object.entries(APPROVED_LIGHT_BRAND)) {
    assert.equal(light[`--color-brand-${level}`], value, `brand-${level} claro debe conservar el valor aprobado`);
  }
  for (const [level, value] of Object.entries(APPROVED_DARK_BRAND)) {
    assert.equal(dark[`--color-brand-${level}`], value, `brand-${level} oscuro debe conservar el valor aprobado`);
  }
  for (const role of ['--color-link', '--color-action-primary', '--color-on-brand', '--color-focus']) {
    assert.ok(light[role], `falta el rol claro ${role}`);
    assert.ok(dark[role], `falta el rol oscuro ${role}`);
  }
});

test('los roles esenciales cumplen WCAG AA y los rechazos conocidos no se reutilizan', async () => {
  const { light, dark } = await colorDeclarations();
  const pairs = [
    ['footer claro', light['--color-on-strong-muted'], light['--color-brand-950'], 4.5],
    ['navegacion activa claro', light['--color-link'], light['--color-surface'], 4.5],
    ['dropdown claro', light['--color-text'], light['--color-surface-raised'], 4.5],
    ['menu movil claro', light['--color-text'], light['--color-surface'], 4.5],
    ['breadcrumb claro', light['--color-muted'], light['--color-surface'], 4.5],
    ['estado vacio claro', light['--color-muted'], light['--color-surface-soft'], 4.5],
    ['badge claro', light['--color-muted'], light['--color-surface-soft'], 4.5],
    ['exito claro', light['--color-success'], light['--color-surface'], 4.5],
    ['advertencia claro', light['--color-warning'], light['--color-surface'], 4.5],
    ['error claro', light['--color-danger'], light['--color-surface'], 4.5],
    ['informacion claro', light['--color-info'], light['--color-surface'], 4.5],
    ['footer oscuro', dark['--color-on-strong-muted'], dark['--color-brand-950'], 4.5],
    ['navegacion activa oscuro', dark['--color-link'], dark['--color-surface'], 4.5],
    ['dropdown oscuro', dark['--color-text'], dark['--color-surface-raised'], 4.5],
    ['menu movil oscuro', dark['--color-text'], dark['--color-surface'], 4.5],
    ['breadcrumb oscuro', dark['--color-muted'], dark['--color-surface'], 4.5],
    ['estado vacio oscuro', dark['--color-muted'], dark['--color-surface-soft'], 4.5],
    ['badge oscuro', dark['--color-muted'], dark['--color-surface-soft'], 4.5],
    ['exito oscuro', dark['--color-success'], dark['--color-surface'], 4.5],
    ['advertencia oscuro', dark['--color-warning'], dark['--color-surface'], 4.5],
    ['error oscuro', dark['--color-danger'], dark['--color-surface'], 4.5],
    ['informacion oscuro', dark['--color-info'], dark['--color-surface'], 4.5],
    ['texto claro', light['--color-ink'], light['--color-surface'], 4.5],
    ['texto secundario claro', light['--color-text'], light['--color-surface'], 4.5],
    ['link claro', light['--color-link'], light['--color-surface'], 4.5],
    ['botón claro', light['--color-on-brand'], light['--color-action-primary'], 4.5],
    ['foco claro', light['--color-focus'], light['--color-surface'], 3],
    ['texto oscuro', dark['--color-ink'], dark['--color-surface'], 4.5],
    ['texto secundario oscuro', dark['--color-text'], dark['--color-surface'], 4.5],
    ['link oscuro', dark['--color-link'], dark['--color-surface'], 4.5],
    ['botón oscuro', dark['--color-on-brand'], dark['--color-action-primary'], 4.5],
    ['foco oscuro', dark['--color-focus'], dark['--color-surface'], 3],
  ];
  for (const [name, foreground, background, minimum] of pairs) {
    const declarations = name.includes('oscuro') ? dark : light;
    const resolvedForeground = resolveColor(declarations, foreground);
    const resolvedBackground = resolveColor(declarations, background);
    assert.match(resolvedForeground, /^#[0-9A-F]{6}$/, `${name}: color de primer plano hexadecimal requerido`);
    assert.match(resolvedBackground, /^#[0-9A-F]{6}$/, `${name}: color de fondo hexadecimal requerido`);
    assert.ok(contrast(resolvedForeground, resolvedBackground) >= minimum, `${name}: ${contrast(resolvedForeground, resolvedBackground).toFixed(2)}:1 debe ser al menos ${minimum}:1`);
  }
  assert.ok(contrast('#FFFFFF', '#209653') < 4.5, 'blanco sobre brand-500 debe permanecer rechazado');
  assert.ok(contrast('#116A38', '#09110C') < 4.5, 'brand-700 claro no puede convertirse en link oscuro');
});

test('no quedan tokens warm ni literales azules heredados en las fuentes controladas del portal', async () => {
  const files = (await Promise.all(SCANNED_SOURCE_ROOTS.map(collectTextFiles))).flat();
  const forbidden = new RegExp(LEGACY_BLUE_LITERALS.join('|'), 'i');
  assert.ok(files.length > 0, 'el contrato debe inspeccionar fuentes reales del portal');
  for (const filePath of files) {
    const originalSource = await readFile(filePath, 'utf8');
    const source = originalSource.toUpperCase();
    assert.doesNotMatch(source, /--COLOR-WARM-/i, `${relative(filePath)} no puede reintroducir tokens warm obsoletos`);
    assert.doesNotMatch(source, forbidden, `${relative(filePath)} contiene un azul/cian heredado`);
    assert.doesNotMatch(source, /\b(?:AQUA|BLUE|CYAN|DEEPSKYBLUE|DODGERBLUE|ROYALBLUE|SKYBLUE|STEELBLUE|TEAL|TURQUOISE)\b/, `${relative(filePath)} contiene un nombre de color azul/cian`);
    const colors = visibleColorLiterals(originalSource);
    const blueOrCyan = colors.rgb.some(([red, green, blue]) => saturatedBlueOrCyan(red, green, blue))
      || colors.hsl.some(saturatedBlueOrCyanHsl);
    assert.equal(blueOrCyan, false, `${relative(filePath)} contiene un azul/cian saturado no autorizado`);
  }
});

test('la exclusión de Expoferia es explícita y su fuente no entra al escaneo cromático', async () => {
  assert.deepEqual(EXCLUDED_HISTORICAL_PATHS, [
    'index.html',
    'src/',
    'public/',
    'dist/eventos/expoferia-nutricion-animal-2026/',
  ]);
  for (const excludedPath of EXCLUDED_HISTORICAL_PATHS) {
    assert.ok(!SCANNED_SOURCE_ROOTS.some(sourceRoot => sourceRoot.startsWith(excludedPath)), `${excludedPath} debe quedar fuera del contrato cromático`);
  }
});

test('el logo original y los metadatos verdes conservan sus contratos', async () => {
  const logo = await readFile(logoPath);
  assert.equal(createHash('sha256').update(logo).digest('hex').toUpperCase(), '72FB48B8CCA7DEDBD643469D43B5B4140C15E2DEAD65E0E2A56F983F6C7DBAE3');
  assert.deepEqual(SITE_CONFIG.themeColors, {
    light: '#F3FAF5',
    dark: '#09110C',
    primary: '#158144',
  });
  const runtimeScript = await readFile(path.join(rootDir, 'portal/assets/js/site.js'), 'utf8');
  assert.match(runtimeScript, /isDark \? '#09110C' : '#158144'/);
});

test('la imagen Open Graph publicada conserva el formato y tamano requeridos', async () => {
  const og = await readFile(ogPath);
  assert.deepEqual([...og.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'og-sipa.png debe ser un PNG');
  assert.equal(og.subarray(12, 16).toString('ascii'), 'IHDR', 'og-sipa.png debe contener cabecera IHDR');
  assert.equal(og.readUInt32BE(16), 1200, 'og-sipa.png debe medir 1200 px de ancho');
  assert.equal(og.readUInt32BE(20), 630, 'og-sipa.png debe medir 630 px de alto');
});

test('los estados de contacto comunican resultado con icono, texto y rol semantico', async () => {
  const runtimeScript = await readFile(path.join(rootDir, 'portal/assets/js/site.js'), 'utf8');
  assert.match(runtimeScript, /status\.dataset\.state = 'success'/);
  assert.match(runtimeScript, /status\.dataset\.state = 'error'/);
  assert.ok(runtimeScript.includes(`${String.fromCodePoint(0x2713)} Mensaje enviado correctamente.`));
  assert.ok(runtimeScript.includes(`${String.fromCodePoint(0x26A0)} No fue posible enviar el mensaje.`));
});
