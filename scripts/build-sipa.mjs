import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const portalDir = path.join(root, 'portal');
const distDir = path.join(root, 'dist');
const expoDistDir = path.join(root, 'dist-expo');
const eventDir = path.join(distDir, 'eventos', 'expoferia-nutricion-animal-2026');
const buildDate = new Date().toISOString();
const buildSha = (process.env.GITHUB_SHA || 'local').slice(0, 7);
const version = '1.1.1';
const cacheKey = `${version}-${buildSha}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const walk = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
};

const injectBuildMetadata = async directory => {
  const files = await walk(directory);
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const source = await readFile(file, 'utf8');
    const output = source
      .replaceAll('__BUILD_DATE__', buildDate)
      .replaceAll('__BUILD_SHA__', buildSha)
      .replaceAll('__BUILD_VERSION__', version);
    await writeFile(file, output, 'utf8');
  }
};

await rm(distDir, { recursive: true, force: true });
await rm(expoDistDir, { recursive: true, force: true });

console.log('1/5 Construyendo la experiencia histórica de la expoferia...');
execFileSync(npmCommand, ['run', 'build:expo'], { cwd: root, stdio: 'inherit' });

console.log('2/5 Preparando el portal institucional SIPA...');
await cp(portalDir, distDir, { recursive: true });
await mkdir(path.dirname(eventDir), { recursive: true });
await cp(expoDistDir, eventDir, { recursive: true });

console.log('3/5 Asegurando la paleta multiespecie y rompiendo caché...');
const portalIndexPath = path.join(distDir, 'index.html');
let portalIndex = await readFile(portalIndexPath, 'utf8');
portalIndex = portalIndex
  .replace(
    '<link rel="stylesheet" href="./assets/styles.css">',
    `<link rel="stylesheet" href="./assets/styles.css?v=${cacheKey}">\n  <link rel="stylesheet" href="./assets/species-theme.css?v=${cacheKey}">`
  )
  .replace(
    '<script src="./assets/app.js" defer></script>',
    `<script src="./assets/app.js?v=${cacheKey}" defer></script>`
  )
  .replaceAll('./assets/hero-produccion-animal.svg', `./assets/hero-produccion-animal.svg?v=${cacheKey}`);
await writeFile(portalIndexPath, portalIndex, 'utf8');

const eventIndexPath = path.join(eventDir, 'index.html');
let eventIndex = await readFile(eventIndexPath, 'utf8');
const returnBar = `\n<style id="sipa-return-style">.sipa-return{position:fixed;z-index:9999;left:16px;top:16px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(255,255,255,.35);border-radius:12px;background:rgba(3,35,61,.9);color:#fff!important;font:700 13px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 12px 28px rgba(0,0,0,.28);backdrop-filter:blur(12px);transition:transform .2s}.sipa-return:hover{transform:translateY(-2px)}@media(max-width:600px){.sipa-return{top:auto;bottom:14px;left:14px;padding:9px 12px;font-size:12px}}</style><a class="sipa-return" href="../../" aria-label="Volver al portal SIPA">← Volver a SIPA</a>\n`;
if (!eventIndex.includes('class="sipa-return"')) {
  eventIndex = eventIndex.replace(/<body([^>]*)>/i, `<body$1>${returnBar}`);
  await writeFile(eventIndexPath, eventIndex, 'utf8');
}

console.log('4/5 Inyectando fecha, versión y commit de despliegue...');
await injectBuildMetadata(distDir);

const notFound = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Redirigiendo a SIPA</title><meta http-equiv="refresh" content="0;url=./"><script>location.replace('/SIPA_UTMACH/');</script><body>Redirigiendo al portal SIPA…</body></html>`;
await writeFile(path.join(distDir, '404.html'), notFound, 'utf8');
await writeFile(path.join(distDir, 'build-info.json'), JSON.stringify({ version, buildDate, buildSha }, null, 2), 'utf8');
await writeFile(path.join(distDir, '.nojekyll'), '', 'utf8');

console.log('5/5 Limpiando archivos temporales...');
await rm(expoDistDir, { recursive: true, force: true });
console.log(`SIPA v${version} listo en dist/ — ${buildDate} (${buildSha})`);
