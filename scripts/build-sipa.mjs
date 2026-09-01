import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { buildPortal } from './build-portal.mjs';
import { validateSite } from './validate-site.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = path.join(root, 'dist');
const expoDistDir = path.join(root, 'dist-expo');
const eventDir = path.join(distDir, 'eventos', 'expoferia-nutricion-animal-2026');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = packageJson.version;
const buildDate = new Date().toISOString();

if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error('package.json debe declarar una versión semántica válida.');
}

const resolveBuildSha = () => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);

  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
};

const buildSha = resolveBuildSha();

const buildExpo = () => {
  const command = process.platform === 'win32'
    ? (process.env.ComSpec || 'cmd.exe')
    : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm run build:expo']
    : ['run', 'build:expo'];

  execFileSync(command, args, {
    cwd: root,
    stdio: 'inherit',
  });
};

const addPortalReturn = async () => {
  const eventIndexPath = path.join(eventDir, 'index.html');
  const eventIndex = await readFile(eventIndexPath, 'utf8');

  if (eventIndex.includes('data-sipa-return')) return;

  const returnBar = `
<style id="sipa-return-style">
  .sipa-return{position:fixed;z-index:9999;left:16px;top:16px;display:inline-flex;min-height:44px;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(255,255,255,.35);border-radius:12px;background:rgba(20,59,99,.94);color:#fff!important;font:700 13px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 12px 28px rgba(0,0,0,.24);backdrop-filter:blur(12px);transition:transform .2s,background-color .2s}
  .sipa-return:hover{transform:translateY(-2px);background:#315e35}
  .sipa-return:focus-visible{outline:3px solid #fff;outline-offset:3px}
  @media(max-width:600px){.sipa-return{top:auto;bottom:14px;left:14px;padding:9px 12px;font-size:12px}}
  @media(prefers-reduced-motion:reduce){.sipa-return{transition:none}.sipa-return:hover{transform:none}}
</style>
<a class="sipa-return" data-sipa-return href="../../" aria-label="Volver al portal SIPA">← Volver a SIPA</a>
`;
  const output = eventIndex.replace(/<body([^>]*)>/i, `<body$1>${returnBar}`);

  if (output === eventIndex) {
    throw new Error('No se encontró <body> en la Expoferia construida.');
  }

  await writeFile(eventIndexPath, output, 'utf8');
};

await rm(distDir, { recursive: true, force: true });
await rm(expoDistDir, { recursive: true, force: true });

try {
  console.log('1/5 Construyendo la experiencia histórica de la Expoferia…');
  buildExpo();

  console.log('2/5 Generando el portal institucional multipágina…');
  await buildPortal({ rootDir: root, distDir, version, buildDate, buildSha });

  console.log('3/5 Integrando la Expoferia en su ruta histórica…');
  await mkdir(path.dirname(eventDir), { recursive: true });
  await cp(expoDistDir, eventDir, { recursive: true });
  await addPortalReturn();

  console.log('4/5 Validando rutas, enlaces, contenido y assets…');
  await validateSite({ distDir });

  console.log(`5/5 SIPA v${version} listo en dist/ — ${buildDate} (${buildSha})`);
} finally {
  await rm(expoDistDir, { recursive: true, force: true });
}
