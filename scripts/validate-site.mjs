import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { SITE_CONFIG } from '../portal/config/site.mjs';
import { getSitemapRoutes } from '../portal/config/navigation.mjs';
import { getPublishedRoutes } from '../portal/config/routes.mjs';
import { events } from '../portal/content/events.mjs';
import { researchProjects } from '../portal/content/research.mjs';
import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../portal/content/socials.mjs';
import { teamMembers } from '../portal/content/team.mjs';
import { webinars, webinarStatuses } from '../portal/content/webinars.mjs';
import { isValidExternalUrl, normalizeEmailHref } from '../portal/lib/urls.mjs';
import { validateWebinarVideo } from '../portal/lib/youtube.mjs';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const executableProtocols = /^(?:javascript|data|vbscript):/i;
const externalProtocols = /^(?:https?:|mailto:|tel:)/i;
const placeholderPattern = /__[A-Z][A-Z0-9_]+__/g;
const mojibakePattern = /(?:�|Ã.|Â.|â(?:€|†|€”|€¦))/;
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pngIendChunk = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

const fileExists = async file => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const readPngDimensions = async file => {
  const contents = await readFile(file);
  if (contents.length < 24 || !contents.subarray(0, 8).equals(pngSignature)) {
    throw new Error('no es un PNG válido');
  }
  if (!contents.subarray(-pngIendChunk.length).equals(pngIendChunk)) {
    throw new Error('es un PNG incompleto o corrupto');
  }
  return { width: contents.readUInt32BE(16), height: contents.readUInt32BE(20) };
};

const walk = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
};

const decodeHtmlAttribute = value => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

const parseAttributes = tag => {
  const attributes = new Map();
  const source = tag.replace(/^<\/?[A-Za-z][^\s/>]*/, '').replace(/\/?\s*>$/, '');
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    attributes.set(match[1].toLowerCase(), decodeHtmlAttribute(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attributes;
};

const getTags = (html, namePattern = '[A-Za-z][A-Za-z0-9:-]*') =>
  [...html.matchAll(new RegExp(`<(${namePattern})\\b[^>]*>`, 'gi'))]
    .map(match => ({ name: match[1].toLowerCase(), source: match[0], attributes: parseAttributes(match[0]) }));

const getTagsByName = (html, name) => getTags(html, name);

const getMetaContents = (html, name) => getTagsByName(html, 'meta')
  .filter(tag => tag.attributes.get('name')?.toLowerCase() === name.toLowerCase())
  .map(tag => tag.attributes.get('content')?.trim() || '');

const getPropertyContents = (html, property) => getTagsByName(html, 'meta')
  .filter(tag => tag.attributes.get('property')?.toLowerCase() === property.toLowerCase())
  .map(tag => tag.attributes.get('content')?.trim() || '');

const getCanonicals = html => getTagsByName(html, 'link')
  .filter(tag => (tag.attributes.get('rel') || '').split(/\s+/).map(value => value.toLowerCase()).includes('canonical'))
  .map(tag => tag.attributes.get('href')?.trim() || '');

const idsFromHtml = html => getTags(html)
  .map(tag => tag.attributes.get('id'))
  .filter(Boolean);

const normalizeLocalTarget = async ({ distDir, fromFile, rawUrl }) => {
  const withoutFragment = rawUrl.split('#', 1)[0];
  const withoutQuery = withoutFragment.split('?', 1)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    return { error: 'usa codificación URL inválida' };
  }

  const absolute = path.resolve(path.dirname(fromFile), decoded || path.basename(fromFile));
  const relative = path.relative(distDir, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return { error: 'sale del directorio dist' };

  let target = absolute;
  if (await fileExists(target)) {
    const targetStat = await stat(target);
    if (targetStat.isDirectory()) target = path.join(target, 'index.html');
  } else if (decoded.endsWith('/')) {
    target = path.join(target, 'index.html');
  }

  return { target, exists: await fileExists(target) };
};

const validateContentCollections = errors => {
  const assertUniqueIds = (items, label) => {
    const ids = new Set();
    for (const item of items) {
      if (!item?.id) errors.push(`${label}: existe un elemento sin id.`);
      else if (ids.has(item.id)) errors.push(`${label}: id duplicado ${item.id}.`);
      else ids.add(item.id);
    }
  };

  assertUniqueIds(webinars, 'Webinars');
  assertUniqueIds(socialLinks, 'Redes sociales');
  assertUniqueIds(institutionalLinks, 'Enlaces institucionales');
  assertUniqueIds(contactChannels, 'Canales de contacto');
  assertUniqueIds(researchProjects, 'Proyectos');
  assertUniqueIds(events, 'Eventos');
  assertUniqueIds(teamMembers, 'Equipo');

  for (const webinar of webinars) {
    if (!webinarStatuses.includes(webinar.status)) errors.push(`Webinar ${webinar.id}: estado no permitido ${webinar.status}.`);
    if (webinar.published === true) {
      const validation = validateWebinarVideo(webinar);
      if (!validation.valid) errors.push(`Webinar ${webinar.id}: ${validation.errors.join('; ')}.`);
    }
  }

  for (const [label, items] of [
    ['Red social', socialLinks],
    ['Enlace institucional', institutionalLinks],
  ]) {
    for (const item of items.filter(item => item.published === true)) {
      if (!isValidExternalUrl(item.url, { allowedProtocols: ['https:'] })) {
        errors.push(`${label} ${item.id}: URL publicada inválida o no HTTPS.`);
      }
    }
  }
  for (const item of contactChannels.filter(item => item.published === true)) {
    const validHttps = isValidExternalUrl(item.url, { allowedProtocols: ['https:'] });
    const validMailto = typeof item.url === 'string'
      && /^mailto:/i.test(item.url)
      && normalizeEmailHref(item.url.replace(/^mailto:/i, '')) === item.url;
    if (!validHttps && !validMailto) errors.push(`Canal de contacto ${item.id}: URL publicada inválida.`);
  }

  if (contactContent.form?.published === true
    && !isValidExternalUrl(contactContent.form.endpoint, { allowedProtocols: ['https:'] })) {
    errors.push('Formulario de contacto: un formulario publicado requiere endpoint HTTPS válido.');
  }

  for (const project of researchProjects.filter(item => item.published === true && item.externalUrl)) {
    if (!isValidExternalUrl(project.externalUrl, { allowedProtocols: ['https:'] })) {
      errors.push(`Proyecto ${project.id}: externalUrl publicada inválida o no HTTPS.`);
    }
  }
};

const singleValue = ({ values, label, prefix, errors }) => {
  if (values.length !== 1 || !values[0]) {
    errors.push(`${prefix}: ${label} debe aparecer una sola vez y no estar vacío; encontrados ${values.length}.`);
    return null;
  }
  return values[0];
};

const validateAbsoluteUrl = ({ value, label, prefix, errors, expectedOrigin = null }) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') {
      errors.push(`${prefix}: ${label} debe usar HTTPS.`);
      return null;
    }
    if (expectedOrigin && url.origin !== expectedOrigin) {
      errors.push(`${prefix}: ${label} debe usar ${expectedOrigin}.`);
      return null;
    }
    return url;
  } catch {
    errors.push(`${prefix}: ${label} debe ser una URL absoluta válida.`);
    return null;
  }
};

const validateStructuredData = ({ html, prefix, errors }) => {
  const pattern = /<script\b[^>]*\btype\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(pattern)];
  if (!matches.length) {
    errors.push(`${prefix}: falta JSON-LD.`);
    return;
  }

  const validateUrls = value => {
    if (Array.isArray(value)) {
      value.forEach(validateUrls);
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['url', '@id', 'item'].includes(key) && typeof child === 'string' && /^https?:/i.test(child)) {
        const url = validateAbsoluteUrl({ value: child, label: `JSON-LD ${key}`, prefix, errors });
        if (url?.hostname === SITE_CONFIG.technicalDomain && url.origin !== SITE_CONFIG.canonicalOrigin) {
          errors.push(`${prefix}: JSON-LD ${key} debe usar ${SITE_CONFIG.canonicalOrigin}.`);
        }
      }
      validateUrls(child);
    }
  };

  for (const match of matches) {
    try {
      const data = JSON.parse(match[2]);
      if (data?.['@context'] !== 'https://schema.org') errors.push(`${prefix}: JSON-LD debe declarar @context https://schema.org.`);
      validateUrls(data);
    } catch (error) {
      errors.push(`${prefix}: JSON-LD no es JSON válido: ${error.message}.`);
    }
  }
};

const assertUniqueMetadata = ({ value, label, prefix, values, errors }) => {
  if (!value) return;
  const firstLocation = values.get(value);
  if (firstLocation) errors.push(`${prefix}: ${label} duplica el de ${firstLocation}.`);
  else values.set(value, prefix);
};

const validateIndexableMetadata = async ({ html, route, relativeFile, distDir, errors, metadata }) => {
  const prefix = `${route.path} (${relativeFile})`;
  const expectedCanonical = new URL(route.path, `${SITE_CONFIG.canonicalOrigin}/`).href;
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) errors.push(`${prefix}: falta title no vacío.`);
  assertUniqueMetadata({ value: title, label: 'title', prefix, values: metadata.titles, errors });
  const description = singleValue({ values: getMetaContents(html, 'description'), label: 'meta description', prefix, errors });
  assertUniqueMetadata({ value: description, label: 'meta description', prefix, values: metadata.descriptions, errors });

  const canonical = singleValue({ values: getCanonicals(html), label: 'canonical', prefix, errors });
  if (canonical && canonical !== expectedCanonical) errors.push(`${prefix}: canonical ${canonical}; esperada ${expectedCanonical}.`);

  const robots = singleValue({ values: getMetaContents(html, 'robots'), label: 'meta robots', prefix, errors });
  if (robots?.toLowerCase() !== 'index,follow') errors.push(`${prefix}: meta robots debe ser index,follow.`);

  const openGraph = {
    'og:type': singleValue({ values: getPropertyContents(html, 'og:type'), label: 'og:type', prefix, errors }),
    'og:site_name': singleValue({ values: getPropertyContents(html, 'og:site_name'), label: 'og:site_name', prefix, errors }),
    'og:title': singleValue({ values: getPropertyContents(html, 'og:title'), label: 'og:title', prefix, errors }),
    'og:description': singleValue({ values: getPropertyContents(html, 'og:description'), label: 'og:description', prefix, errors }),
    'og:url': singleValue({ values: getPropertyContents(html, 'og:url'), label: 'og:url', prefix, errors }),
    'og:image': singleValue({ values: getPropertyContents(html, 'og:image'), label: 'og:image', prefix, errors }),
  };
  if (openGraph['og:type'] && openGraph['og:type'] !== 'website') errors.push(`${prefix}: og:type debe ser website.`);
  if (openGraph['og:url'] && openGraph['og:url'] !== expectedCanonical) errors.push(`${prefix}: og:url debe coincidir con la canonical.`);
  if (openGraph['og:url']) validateAbsoluteUrl({ value: openGraph['og:url'], label: 'og:url', prefix, errors, expectedOrigin: SITE_CONFIG.canonicalOrigin });
  if (openGraph['og:image']) {
    const imageUrl = validateAbsoluteUrl({ value: openGraph['og:image'], label: 'og:image', prefix, errors, expectedOrigin: SITE_CONFIG.canonicalOrigin });
    if (imageUrl) {
      const imagePath = path.join(distDir, ...decodeURIComponent(imageUrl.pathname).split('/').filter(Boolean));
      if (!await fileExists(imagePath)) errors.push(`${prefix}: og:image apunta a un archivo inexistente: ${imageUrl.href}.`);
    }
  }

  const twitter = {
    'twitter:card': singleValue({ values: getMetaContents(html, 'twitter:card'), label: 'twitter:card', prefix, errors }),
    'twitter:title': singleValue({ values: getMetaContents(html, 'twitter:title'), label: 'twitter:title', prefix, errors }),
    'twitter:description': singleValue({ values: getMetaContents(html, 'twitter:description'), label: 'twitter:description', prefix, errors }),
    'twitter:image': singleValue({ values: getMetaContents(html, 'twitter:image'), label: 'twitter:image', prefix, errors }),
  };
  if (twitter['twitter:card'] && twitter['twitter:card'] !== 'summary_large_image') errors.push(`${prefix}: twitter:card debe ser summary_large_image.`);
  if (twitter['twitter:image']) validateAbsoluteUrl({ value: twitter['twitter:image'], label: 'twitter:image', prefix, errors, expectedOrigin: SITE_CONFIG.canonicalOrigin });

  validateStructuredData({ html, prefix, errors });
};

const validateNonIndexableDocument = ({ html, relativeFile, errors }) => {
  const prefix = `/${relativeFile}`;
  const robots = singleValue({ values: getMetaContents(html, 'robots'), label: 'meta robots', prefix, errors });
  if (robots && !/(?:^|[\s,])noindex(?:[\s,]|$)/i.test(robots)) errors.push(`${prefix}: debe declarar noindex.`);
  if (getCanonicals(html).length) errors.push(`${prefix}: no debe declarar canonical.`);
};

const validatePortalDocument = ({ html, route, relativeFile, errors }) => {
  const prefix = `${route.path} (${relativeFile})`;
  const htmlTag = getTagsByName(html, 'html')[0];
  if (htmlTag?.attributes.get('lang') !== SITE_CONFIG.locale) errors.push(`${prefix}: lang debe ser ${SITE_CONFIG.locale}.`);

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${prefix}: debe contener exactamente un h1; encontrados ${h1Count}.`);

  for (const landmark of ['header', 'nav', 'main', 'footer']) {
    if (!new RegExp(`<${landmark}\\b`, 'i').test(html)) errors.push(`${prefix}: falta landmark <${landmark}>.`);
  }
  if (!html.includes('class="skip-link"')) errors.push(`${prefix}: falta skip link.`);
  if (!html.includes('data-back-to-top')) errors.push(`${prefix}: falta control Volver arriba.`);

  const ids = idsFromHtml(html);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${prefix}: IDs duplicados: ${duplicates.join(', ')}.`);

  for (const button of getTagsByName(html, 'button')) {
    if (!button.attributes.get('type')) errors.push(`${prefix}: existe un botón sin type.`);
  }

  const primaryNavigationHtml = html.match(/<nav\b[^>]*aria-label="Navegación principal"[^>]*>[\s\S]*?<\/nav>/i)?.[0] ?? '';
  const currentLinks = getTagsByName(primaryNavigationHtml, 'a').filter(tag => tag.attributes.get('aria-current') === 'page');
  if (currentLinks.length !== 1) errors.push(`${prefix}: debe existir un enlace con aria-current="page"; encontrados ${currentLinks.length}.`);

  if (/species-theme\.css|hero-produccion-animal\.svg|team-orbit|IntersectionObserver[^\n]+data-nav/i.test(html)) {
    errors.push(`${prefix}: conserva referencias visuales o de navegación obsoletas.`);
  }
};

const validateReferences = async ({ html, route, file, distDir, errors, summary }) => {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  const portalPage = route.kind === 'page';
  const tags = getTags(html);
  const ids = new Set(idsFromHtml(html));

  for (const tag of tags) {
    for (const attributeName of ['href', 'src', 'poster']) {
      if (!tag.attributes.has(attributeName)) continue;
      const rawUrl = tag.attributes.get(attributeName)?.trim() ?? '';
      const reference = `${relativeFile}: <${tag.name}> ${attributeName}`;

      if (!rawUrl) {
        if (portalPage) errors.push(`${reference} está vacío.`);
        continue;
      }
      summary.references += 1;
      if (rawUrl.startsWith('data:') && route.kind === 'artifact' && attributeName !== 'href' && /^data:image\//i.test(rawUrl)) {
        continue;
      }
      if (executableProtocols.test(rawUrl)) {
        errors.push(`${reference} usa un protocolo ejecutable inseguro.`);
        continue;
      }
      if (rawUrl === '#') {
        errors.push(`${reference} usa href="#".`);
        continue;
      }
      if (rawUrl.startsWith('//')) {
        if (portalPage) errors.push(`${reference} usa URL sin protocolo.`);
        continue;
      }
      if (externalProtocols.test(rawUrl)) {
        if (/^https?:/i.test(rawUrl) && !isValidExternalUrl(rawUrl)) errors.push(`${reference} contiene una URL externa inválida.`);
        if (tag.name === 'a' && tag.attributes.get('target') === '_blank') {
          const rel = new Set((tag.attributes.get('rel') || '').split(/\s+/));
          if (!rel.has('noopener') || !rel.has('noreferrer')) errors.push(`${reference} abre otra pestaña sin rel="noopener noreferrer".`);
        }
        continue;
      }
      if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(rawUrl)) {
        errors.push(`${reference} usa un protocolo no permitido.`);
        continue;
      }
      if (portalPage && rawUrl.startsWith('/')) {
        errors.push(`${reference} usa ruta absoluta local y rompería GitHub Pages: ${rawUrl}.`);
        continue;
      }
      if (rawUrl.includes('\\')) {
        errors.push(`${reference} usa separadores de Windows.`);
        continue;
      }

      const fragment = rawUrl.includes('#') ? rawUrl.slice(rawUrl.indexOf('#') + 1) : '';
      if (rawUrl.startsWith('#')) {
        if (fragment && !ids.has(fragment)) errors.push(`${reference} apunta al fragmento inexistente #${fragment}.`);
        continue;
      }

      const resolved = await normalizeLocalTarget({ distDir, fromFile: file, rawUrl });
      if (resolved.error) errors.push(`${reference} ${resolved.error}: ${rawUrl}.`);
      else if (!resolved.exists) errors.push(`${reference} apunta a un archivo inexistente: ${rawUrl}.`);
      else if (fragment && resolved.target.endsWith('.html')) {
        const targetHtml = await readFile(resolved.target, 'utf8');
        if (!new Set(idsFromHtml(targetHtml)).has(fragment)) errors.push(`${reference} apunta al fragmento inexistente ${rawUrl}.`);
      }
    }

    if (tag.attributes.has('srcset')) {
      const rawSrcset = tag.attributes.get('srcset').trim();
      if (route.kind === 'artifact' && /^data:image\//i.test(rawSrcset)) continue;
      if (/^data:/i.test(rawSrcset)) {
        errors.push(`${relativeFile}: srcset usa datos embebidos fuera del artefacto histórico.`);
        continue;
      }
      for (const candidate of rawSrcset.split(',').map(value => value.trim().split(/\s+/, 1)[0]).filter(Boolean)) {
        if (/^(?:data:|https?:)/i.test(candidate)) continue;
        const resolved = await normalizeLocalTarget({ distDir, fromFile: file, rawUrl: candidate });
        if (resolved.error || !resolved.exists) errors.push(`${relativeFile}: srcset apunta a un archivo inexistente: ${candidate}.`);
      }
    }
  }
};

const validateCssReferences = async ({ file, css, distDir, errors, summary }) => {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    const rawUrl = match[2].trim();
    if (!rawUrl || rawUrl.startsWith('#') || /^(?:data:|https?:)/i.test(rawUrl)) continue;
    summary.references += 1;
    const resolved = await normalizeLocalTarget({ distDir, fromFile: file, rawUrl });
    if (resolved.error || !resolved.exists) errors.push(`${relativeFile}: url() apunta a un asset inexistente: ${rawUrl}.`);
  }
};

const validateSitemap = async ({ distDir, errors, summary }) => {
  const sitemapFile = path.join(distDir, 'sitemap.xml');
  if (!await fileExists(sitemapFile)) {
    errors.push('Falta sitemap.xml.');
    return;
  }

  const xml = await readFile(sitemapFile, 'utf8');
  if (!/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\s*\?>\s*<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>\s*$/i.test(xml)) {
    errors.push('sitemap.xml no tiene una estructura XML de sitemap válida.');
  }
  const openUrlTags = (xml.match(/<url>/gi) || []).length;
  const closeUrlTags = (xml.match(/<\/url>/gi) || []).length;
  if (openUrlTags !== closeUrlTags) errors.push('sitemap.xml tiene etiquetas <url> sin cierre.');
  const actual = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match => decodeHtmlAttribute(match[1]));
  const expected = getSitemapRoutes().map(route => route.loc);
  const duplicates = actual.filter((value, index) => actual.indexOf(value) !== index);
  if (duplicates.length) errors.push(`sitemap.xml contiene URLs duplicadas: ${[...new Set(duplicates)].join(', ')}.`);
  if (actual.length !== expected.length || actual.some(value => !expected.includes(value)) || expected.some(value => !actual.includes(value))) {
    errors.push(`sitemap.xml no coincide con el registro publicado. Esperado: ${expected.join(', ')}. Actual: ${actual.join(', ')}.`);
  }
  for (const loc of actual) {
    const url = validateAbsoluteUrl({ value: loc, label: 'sitemap loc', prefix: 'sitemap.xml', errors, expectedOrigin: SITE_CONFIG.canonicalOrigin });
    if (url && (url.search || url.hash)) errors.push(`sitemap.xml no debe incluir query ni fragment en ${loc}.`);
  }
  summary.sitemapRoutes = actual.length;
};

const validateBuildArtifacts = async ({ distDir, files, errors }) => {
  for (const required of ['404.html', 'robots.txt', 'sitemap.xml', 'build-info.json', '.nojekyll']) {
    if (!await fileExists(path.join(distDir, required))) errors.push(`Falta artefacto requerido: ${required}.`);
  }
  if (!await fileExists(path.join(distDir, SITE_CONFIG.socialImage))) {
    errors.push(`Falta la imagen social configurada: ${SITE_CONFIG.socialImage}.`);
  }

  const faviconAssets = [
    ['favicon/favicon-16x16.png', 16],
    ['favicon/favicon-24x24.png', 24],
    ['favicon/favicon-32x32.png', 32],
    ['favicon/favicon-48x48.png', 48],
    ['favicon/favicon-64x64.png', 64],
    ['favicon/apple-touch-icon.png', 180],
    ['favicon/favicon-192x192.png', 192],
    ['favicon/favicon-512x512.png', 512],
    ['favicon/favicon-1024x1024.png', 1024],
  ];
  if (!await fileExists(path.join(distDir, 'favicon.ico'))) errors.push('Falta favicon.ico.');
  for (const [relativePath, expectedSize] of faviconAssets) {
    const file = path.join(distDir, relativePath);
    if (!await fileExists(file)) {
      errors.push(`Falta el favicon requerido: ${relativePath}.`);
      continue;
    }
    try {
      const dimensions = await readPngDimensions(file);
      if (dimensions.width !== expectedSize || dimensions.height !== expectedSize) {
        errors.push(`${relativePath} debe medir ${expectedSize} × ${expectedSize} px; mide ${dimensions.width} × ${dimensions.height} px.`);
      }
    } catch (error) {
      errors.push(`${relativePath} ${error.message}.`);
    }
  }

  const forbiddenDirectories = ['config', 'content', 'pages', 'templates'];
  for (const directory of forbiddenDirectories) {
    if (await fileExists(path.join(distDir, directory))) errors.push(`dist contiene fuentes internas no publicables: ${directory}/.`);
  }
  for (const file of files) {
    if (['.mjs', '.ts', '.map'].includes(path.extname(file).toLowerCase())) {
      errors.push(`dist contiene un archivo fuente innecesario: ${path.relative(distDir, file).replaceAll('\\', '/')}.`);
    }
  }

  const robotsFile = path.join(distDir, 'robots.txt');
  if (await fileExists(robotsFile)) {
    const robots = await readFile(robotsFile, 'utf8');
    const expected = `Sitemap: ${SITE_CONFIG.canonicalOrigin}/sitemap.xml`;
    const lines = robots.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.includes('User-agent: *')) errors.push('robots.txt debe declarar User-agent: *.');
    if (!lines.includes('Allow: /')) errors.push('robots.txt debe permitir el rastreo con Allow: /.');
    if (!robots.includes(expected)) errors.push(`robots.txt no declara ${expected}.`);
    if (lines.filter(line => line.toLowerCase().startsWith('sitemap:')).length !== 1) errors.push('robots.txt debe declarar un único sitemap.');
  }

  const buildInfoFile = path.join(distDir, 'build-info.json');
  if (await fileExists(buildInfoFile)) {
    try {
      const buildInfo = JSON.parse(await readFile(buildInfoFile, 'utf8'));
      for (const field of ['version', 'buildDate', 'buildSha']) {
        if (!buildInfo[field] || String(buildInfo[field]).includes('__')) errors.push(`build-info.json no contiene ${field} válido.`);
      }
      if (Number.isNaN(Date.parse(buildInfo.buildDate))) errors.push('build-info.json contiene buildDate inválida.');
    } catch (error) {
      errors.push(`build-info.json no es JSON válido: ${error.message}.`);
    }
  }

  const manifestFile = path.join(distDir, 'manifest.webmanifest');
  if (!await fileExists(manifestFile)) {
    errors.push('Falta manifest.webmanifest.');
  } else {
    try {
      const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
      if (!manifest.name || !manifest.short_name) errors.push('manifest.webmanifest requiere name y short_name.');
      for (const icon of manifest.icons ?? []) {
        const resolved = await normalizeLocalTarget({ distDir, fromFile: manifestFile, rawUrl: icon.src ?? '' });
        if (!icon.src || resolved.error || !resolved.exists) errors.push(`manifest.webmanifest referencia un icono inexistente: ${icon.src ?? '<vacío>'}.`);
      }
    } catch (error) {
      errors.push(`manifest.webmanifest no es JSON válido: ${error.message}.`);
    }
  }
};

export const validateSite = async ({ distDir = path.join(rootDir, 'dist') } = {}) => {
  const resolvedDist = path.resolve(distDir);
  const errors = [];
  const summary = { routes: 0, htmlFiles: 0, files: 0, references: 0, sitemapRoutes: 0 };
  const metadata = { titles: new Map(), descriptions: new Map() };

  if (!await fileExists(resolvedDist)) throw new AggregateError([new Error(`No existe el directorio de build: ${resolvedDist}`)], 'Sitio inválido');

  validateContentCollections(errors);
  const routes = getPublishedRoutes();
  summary.routes = routes.length;
  const routeByOutput = new Map(routes.map(route => [route.output.replaceAll('\\', '/'), route]));

  for (const route of routes) {
    const output = path.join(resolvedDist, route.output);
    if (!await fileExists(output)) errors.push(`La ruta ${route.path} no generó ${route.output}.`);
  }

  const files = await walk(resolvedDist);
  summary.files = files.length;
  await validateBuildArtifacts({ distDir: resolvedDist, files, errors });
  await validateSitemap({ distDir: resolvedDist, errors, summary });

  for (const file of files) {
    const relativeFile = path.relative(resolvedDist, file).replaceAll('\\', '/');
    const extension = path.extname(file).toLowerCase();
    if (extension === '.html') {
      summary.htmlFiles += 1;
      const html = await readFile(file, 'utf8');
      const placeholders = [...new Set(html.match(placeholderPattern) || [])];
      if (placeholders.length) errors.push(`${relativeFile}: placeholders sin reemplazar: ${placeholders.join(', ')}.`);
      if (mojibakePattern.test(html)) errors.push(`${relativeFile}: contiene posibles caracteres mojibake o de reemplazo.`);

      const route = routeByOutput.get(relativeFile);
      if (route && route.sitemap?.include !== false) {
        await validateIndexableMetadata({ html, route, relativeFile, distDir: resolvedDist, errors, metadata });
      }
      if (route?.kind === 'page') validatePortalDocument({ html, route, relativeFile, errors });
      if (relativeFile === '404.html' || relativeFile === 'eventos/expoferia-nutricion-animal-2026/offline.html') {
        validateNonIndexableDocument({ html, relativeFile, errors });
      }
      await validateReferences({
        html,
        route: route ?? { id: relativeFile, kind: 'system' },
        file,
        distDir: resolvedDist,
        errors,
        summary,
      });
    } else if (extension === '.css') {
      await validateCssReferences({ file, css: await readFile(file, 'utf8'), distDir: resolvedDist, errors, summary });
    }
  }

  const expoRoute = routes.find(route => route.kind === 'artifact');
  if (expoRoute) {
    const expoFile = path.join(resolvedDist, expoRoute.output);
    if (await fileExists(expoFile)) {
      const expoHtml = await readFile(expoFile, 'utf8');
      const returnTag = getTagsByName(expoHtml, 'a').find(tag => tag.attributes.has('data-sipa-return'));
      if (!returnTag) errors.push('La Expoferia no contiene la barra de retorno a SIPA.');
      else {
        const resolved = await normalizeLocalTarget({ distDir: resolvedDist, fromFile: expoFile, rawUrl: returnTag.attributes.get('href') });
        if (!resolved.exists || path.resolve(resolved.target) !== path.join(resolvedDist, 'index.html')) {
          errors.push('El enlace Volver a SIPA de la Expoferia no resuelve a la portada.');
        }
      }
    }
  }

  if (errors.length) throw new AggregateError(errors.map(message => new Error(message)), `Validación estática fallida: ${errors.length} problema(s)`);
  return Object.freeze(summary);
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const summary = await validateSite();
    console.log(`Sitio válido: ${summary.routes} rutas, ${summary.htmlFiles} HTML, ${summary.references} referencias y ${summary.sitemapRoutes} URLs en sitemap.`);
  } catch (error) {
    console.error(error.message);
    for (const item of error.errors ?? [error]) console.error(`- ${item.message}`);
    process.exitCode = 1;
  }
}
