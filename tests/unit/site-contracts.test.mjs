import assert from 'node:assert/strict';
import test from 'node:test';

import { SITE_CONFIG } from '../../portal/config/site.mjs';
import {
  getBreadcrumbs,
  getFooterNavigation,
  getPrimaryNavigation,
  getSitemapRoutes,
} from '../../portal/config/navigation.mjs';
import { getPublishedRoutes } from '../../portal/config/routes.mjs';
import { escapeAttribute, escapeHtml, safeJson } from '../../portal/lib/html.mjs';
import {
  assetHref,
  canonicalHref,
  isSafePublicHref,
  normalizeEmailHref,
  normalizeExternalUrl,
  normalizeWhatsAppHref,
  routeHref,
} from '../../portal/lib/urls.mjs';
import {
  assertValidPublishedWebinars,
  normalizeWebinar,
  parseYouTubeId,
  youtubeEmbedUrl,
} from '../../portal/lib/youtube.mjs';

const EXPECTED_PATHS = [
  '/',
  '/sipa/',
  '/investigacion/',
  '/divulgacion/',
  '/divulgacion/webinars/',
  '/eventos/',
  '/eventos/expoferia-nutricion-animal-2026/',
  '/equipo/',
  '/contacto/',
];

test('el registro publica exactamente las rutas aprobadas con salidas index.html únicas', () => {
  const routes = getPublishedRoutes();
  assert.deepEqual(routes.map(route => route.path), EXPECTED_PATHS);
  assert.equal(new Set(routes.map(route => route.id)).size, routes.length);
  assert.equal(new Set(routes.map(route => route.output)).size, routes.length);
  for (const route of routes) assert.match(route.output, /(?:^|\/)index\.html$/);
});

test('la navegación primaria y el sitemap se derivan del registro', () => {
  assert.deepEqual(
    getPrimaryNavigation('home').map(item => item.label),
    ['Inicio', 'SIPA', 'Investigación', 'Divulgación', 'Eventos', 'Equipo', 'Contacto'],
  );
  assert.deepEqual(getSitemapRoutes().map(item => item.path), EXPECTED_PATHS);
  assert.ok(getFooterNavigation('home').every(group => group.items.length > 0));
});

test('breadcrumbs conserva la jerarquía Inicio > Divulgación > Webinars', () => {
  const breadcrumbs = getBreadcrumbs('webinars');
  assert.deepEqual(breadcrumbs.map(item => item.label), ['Inicio', 'Divulgación', 'Webinars']);
  assert.equal(breadcrumbs.at(-1).current, true);
});

test('todos los enlaces relativos resuelven en dominio raíz y GitHub Pages', () => {
  const routes = getPublishedRoutes();
  for (const from of routes) {
    for (const to of routes) {
      const href = routeHref(from, to);
      assert.equal(new URL(href, `https://example.test${from.path}`).pathname, to.path);
      assert.equal(new URL(href, `https://example.test/SIPA_UTMACH${from.path}`).pathname, `/SIPA_UTMACH${to.path}`);
    }

    const asset = assetHref(from, 'assets/css/tokens.css');
    assert.equal(new URL(asset, `https://example.test${from.path}`).pathname, '/assets/css/tokens.css');
    assert.equal(new URL(asset, `https://example.test/SIPA_UTMACH${from.path}`).pathname, '/SIPA_UTMACH/assets/css/tokens.css');
  }
});

test('canonicales son absolutas, técnicas y en minúsculas', () => {
  for (const route of getPublishedRoutes()) {
    assert.equal(canonicalHref(route), new URL(route.path, `${SITE_CONFIG.canonicalOrigin}/`).href);
    assert.equal(canonicalHref(route), canonicalHref(route).toLowerCase());
  }
});

test('helpers de URL rechazan protocolos, credenciales y rutas peligrosas', () => {
  assert.equal(normalizeExternalUrl('https://www.utmachala.edu.ec/'), 'https://www.utmachala.edu.ec/');
  assert.equal(normalizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(normalizeExternalUrl('https://user:secret@example.com/'), null);
  assert.equal(normalizeEmailHref('contacto@example.edu.ec'), 'mailto:contacto@example.edu.ec');
  assert.equal(normalizeEmailHref('correo inválido'), null);
  assert.equal(normalizeWhatsAppHref('+593 99 123 4567'), 'https://wa.me/593991234567');
  assert.equal(isSafePublicHref('#'), false);
  assert.equal(isSafePublicHref('javascript:alert(1)'), false);
  assert.throws(() => assetHref('home', '../secreto.txt'), /asset inválida/i);
});

test('YouTube normaliza watch, youtu.be, embed y shorts sin cargar videos ficticios', () => {
  const id = 'AbCdEf123_4';
  for (const value of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
  ]) assert.equal(parseYouTubeId(value), id);

  assert.equal(parseYouTubeId('https://example.com/watch?v=AbCdEf123_4'), null);
  assert.equal(youtubeEmbedUrl(id), `https://www.youtube-nocookie.com/embed/${id}`);
  const webinar = normalizeWebinar({ id: 'prueba-unitaria', youtubeUrl: `https://youtu.be/${id}`, published: true });
  assert.equal(webinar.youtubeId, id);
  assert.equal(webinar.videoValid, true);
  assert.throws(
    () => assertValidPublishedWebinars([{ id: 'invalido', published: true, youtubeUrl: 'https://example.com/video' }]),
    /Webinar publicado inválido/,
  );
});

test('escape HTML y JSON neutraliza contenido editable', () => {
  assert.equal(escapeHtml('<script>"x" & y</script>'), '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
  assert.equal(escapeAttribute("' onfocus='alert(1)"), '&#39; onfocus=&#39;alert(1)');
  assert.doesNotMatch(safeJson({ value: '</script>&' }), /<\/script>/);
});
