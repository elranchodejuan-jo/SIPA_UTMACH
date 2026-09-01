import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { SITE_CONFIG } from '../portal/config/site.mjs';
import { getPublishedRoutes, getRouteById } from '../portal/config/routes.mjs';
import { getSitemapRoutes } from '../portal/config/navigation.mjs';
import { normalizeEmailHref, normalizeExternalUrl } from '../portal/lib/urls.mjs';
import { assertValidPublishedWebinars } from '../portal/lib/youtube.mjs';
import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../portal/content/socials.mjs';
import { teamCategories, teamMembers } from '../portal/content/team.mjs';
import { webinars, webinarStatuses } from '../portal/content/webinars.mjs';
import { events } from '../portal/content/events.mjs';
import { renderLayout } from '../portal/templates/layout.mjs';
import { renderHomePage } from '../portal/pages/home.mjs';
import { renderSipaPage } from '../portal/pages/sipa.mjs';
import { renderResearchPage } from '../portal/pages/research.mjs';
import { renderOutreachPage } from '../portal/pages/outreach.mjs';
import { renderWebinarsPage } from '../portal/pages/webinars.mjs';
import { renderEventsPage } from '../portal/pages/events.mjs';
import { renderTeamPage } from '../portal/pages/team.mjs';
import { renderContactPage } from '../portal/pages/contact.mjs';

const pageRenderers = Object.freeze({
  home: renderHomePage,
  sipa: renderSipaPage,
  research: renderResearchPage,
  outreach: renderOutreachPage,
  webinars: renderWebinarsPage,
  events: renderEventsPage,
  team: renderTeamPage,
  contact: renderContactPage,
});

const exists = async filePath => {
  try { await stat(filePath); return true; } catch { return false; }
};

const readPackageVersion = async rootDir => {
  const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));
  if (typeof packageJson.version !== 'string' || !packageJson.version.trim()) throw new Error('package.json no contiene una versión válida');
  return packageJson.version;
};

const getLocalSha = rootDir => {
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'local';
  }
};

const validateContent = () => {
  assertValidPublishedWebinars(webinars);
  for (const webinar of webinars.filter(item => item.published)) {
    for (const field of ['id', 'slug', 'title', 'speaker', 'date', 'summary']) {
      if (typeof webinar[field] !== 'string' || !webinar[field].trim()) throw new Error(`El webinar publicado ${webinar.id || '(sin id)'} requiere ${field}`);
    }
    if (!webinarStatuses.includes(webinar.status)) throw new Error(`Estado inválido en el webinar ${webinar.id}: ${webinar.status}`);
  }
  for (const item of [...socialLinks, ...institutionalLinks]) {
    if (item.published !== true) continue;
    if (!normalizeExternalUrl(item.url, { allowedProtocols: ['https:'] })) throw new Error(`URL pública HTTPS inválida en ${item.id || item.label}: ${item.url || '(vacía)'}`);
  }
  for (const item of contactChannels) {
    if (item.published !== true) continue;
    const mailto = typeof item.url === 'string' && item.url.toLowerCase().startsWith('mailto:')
      ? normalizeEmailHref(item.url.slice(7))
      : null;
    if (!normalizeExternalUrl(item.url, { allowedProtocols: ['https:'] }) && mailto !== item.url) throw new Error(`Canal público inválido en ${item.id || item.label}: ${item.url || '(vacía)'}`);
  }
  if (contactContent.form.published && !normalizeExternalUrl(contactContent.form.endpoint, { allowedProtocols: ['https:'] })) {
    throw new Error('El formulario de contacto publicado requiere un endpoint HTTPS válido');
  }
  for (const member of teamMembers.filter(item => item.published)) {
    if (!member.id || !member.name) throw new Error('Cada integrante publicado requiere id y nombre');
    if (!teamCategories.some(category => category.id === member.category)) throw new Error(`Categoría inválida en el perfil ${member.id}: ${member.category}`);
    if (member.email && !normalizeEmailHref(member.email)) throw new Error(`Correo inválido en el perfil ${member.id}`);
    for (const field of ['orcid', 'googleScholar', 'linkedin', 'instagram']) {
      if (member[field] && !normalizeExternalUrl(member[field])) throw new Error(`URL ${field} inválida en el perfil ${member.id}`);
    }
  }
  for (const event of events.filter(item => item.published)) {
    if (event.externalUrl && !normalizeExternalUrl(event.externalUrl)) throw new Error(`URL externa inválida en el evento ${event.id}`);
  }
};

const writeOutput = async (distDir, relativePath, contents, generatedFiles) => {
  const destination = path.join(distDir, ...relativePath.split('/'));
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents, 'utf8');
  generatedFiles.push(relativePath);
};

const copyPortalAssets = async (rootDir, distDir, generatedFiles) => {
  const portalDir = path.join(rootDir, 'portal');
  const directories = ['assets/css', 'assets/js', 'assets/icons', 'assets/images'];
  const files = ['assets/logo-sipa.svg', 'favicon.svg'];

  for (const relativePath of directories) {
    const source = path.join(portalDir, ...relativePath.split('/'));
    if (!await exists(source)) continue;
    const destination = path.join(distDir, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, force: true });
    generatedFiles.push(`${relativePath}/`);
  }
  for (const relativePath of files) {
    const source = path.join(portalDir, ...relativePath.split('/'));
    if (!await exists(source)) throw new Error(`Asset obligatorio inexistente: ${relativePath}`);
    const destination = path.join(distDir, ...relativePath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { force: true });
    generatedFiles.push(relativePath);
  }
};

const renderSitemap = () => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${getSitemapRoutes().map(route => `  <url>\n    <loc>${route.loc}</loc>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;

const renderNotFound = metadata => `<!doctype html>
<html lang="es-EC" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#075d91"><title>Página no encontrada | SIPA UTMACH</title>
<script>(()=>{try{const s=localStorage.getItem('sipa-theme');const t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch{}})();</script>
<style>:root{color-scheme:light;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f5f8fa;color:#102a3a}html[data-theme=dark]{color-scheme:dark;background:#0b1b27;color:#ecf5f8}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(145deg,rgba(7,93,145,.12),transparent 55%)}main{width:min(680px,100%);padding:clamp(28px,7vw,64px);border:1px solid rgba(7,93,145,.22);border-radius:20px;background:color-mix(in srgb,Canvas 94%,#075d91 6%);box-shadow:0 24px 70px rgba(0,25,45,.12)}.mark{display:inline-grid;place-items:center;width:64px;height:64px;border-radius:18px;background:#075d91;color:white;font-weight:800;letter-spacing:.06em}p{line-height:1.7}h1{font-size:clamp(2rem,7vw,4rem);line-height:1.05;margin:.8em 0 .3em}a{display:inline-flex;min-height:44px;align-items:center;margin-top:14px;padding:10px 18px;border-radius:10px;background:#075d91;color:#fff;font-weight:700;text-decoration:none}a:focus-visible{outline:3px solid #27b4b1;outline-offset:4px}.domain{font-size:.78rem;letter-spacing:.12em;font-weight:800;color:#075d91}</style></head>
<body><main class="not-found"><span class="mark" aria-hidden="true">SIPA</span><p class="domain">${SITE_CONFIG.visualDomain}</p><h1>Página no encontrada</h1><p>La dirección solicitada no existe o cambió de ubicación. Puedes volver al inicio del portal institucional SIPA.</p><a href="${SITE_CONFIG.canonicalOrigin}/" data-home-link>Ir al inicio</a><p><small>Versión ${metadata.version}</small></p></main><script>(()=>{const a=document.querySelector('[data-home-link]');if(!a)return;const h=location.hostname;const parts=location.pathname.split('/').filter(Boolean);a.href=h.endsWith('.github.io')&&parts.length?'/'+parts[0]+'/':'/';})();</script></body></html>`;

export async function buildPortal(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const distDir = path.resolve(options.distDir || path.join(rootDir, 'dist'));
  const version = options.version || await readPackageVersion(rootDir);
  const buildDate = options.buildDate || new Date().toISOString();
  const buildSha = options.buildSha || process.env.GITHUB_SHA?.slice(0, 7) || getLocalSha(rootDir);
  const metadata = Object.freeze({ version, buildDate, buildSha, cacheKey: `${version}-${buildSha}` });
  const generatedFiles = [];
  const generatedRoutes = [];

  validateContent();
  await mkdir(distDir, { recursive: true });
  await copyPortalAssets(rootDir, distDir, generatedFiles);

  for (const route of getPublishedRoutes().filter(item => item.kind === 'page')) {
    const renderer = pageRenderers[route.page];
    if (!renderer) throw new Error(`No existe renderer para la ruta ${route.id}`);
    const helpers = (await import('../portal/lib/urls.mjs')).createRouteHelpers(route.id);
    const page = renderer({ route, helpers, metadata });
    const html = renderLayout({ route, page, metadata });
    await writeOutput(distDir, route.output, html, generatedFiles);
    generatedRoutes.push(route.id);
  }

  const manifest = {
    name: `${SITE_CONFIG.shortName} · ${SITE_CONFIG.fullName}`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: SITE_CONFIG.themeColors.light,
    theme_color: SITE_CONFIG.themeColors.primary,
    lang: SITE_CONFIG.locale,
    icons: [{ src: './favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
  };
  await writeOutput(distDir, 'manifest.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`, generatedFiles);
  await writeOutput(distDir, 'robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_CONFIG.canonicalOrigin}/sitemap.xml\n`, generatedFiles);
  await writeOutput(distDir, 'sitemap.xml', renderSitemap(), generatedFiles);
  await writeOutput(distDir, '404.html', renderNotFound(metadata), generatedFiles);
  await writeOutput(distDir, 'build-info.json', `${JSON.stringify({ version, buildDate, buildSha }, null, 2)}\n`, generatedFiles);
  await writeOutput(distDir, '.nojekyll', '', generatedFiles);

  const expectedPageRoutes = getPublishedRoutes().filter(route => route.kind === 'page').map(route => route.id);
  if (generatedRoutes.length !== expectedPageRoutes.length) throw new Error('No se generaron todas las páginas registradas');
  if (!getRouteById('expoferia')) throw new Error('La ruta histórica de Expoferia no está registrada');

  return Object.freeze({ distDir, generatedRoutes: Object.freeze(generatedRoutes), generatedFiles: Object.freeze(generatedFiles), metadata });
}

const parseCliOptions = argv => {
  const options = {};
  const outIndex = argv.indexOf('--out-dir');
  if (outIndex >= 0) {
    if (!argv[outIndex + 1]) throw new Error('Falta el valor de --out-dir');
    options.distDir = path.resolve(argv[outIndex + 1]);
  }
  return options;
};

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const result = await buildPortal(parseCliOptions(process.argv.slice(2)));
  console.log(`Portal SIPA v${result.metadata.version}: ${result.generatedRoutes.length} páginas generadas en ${result.distDir}`);
}
