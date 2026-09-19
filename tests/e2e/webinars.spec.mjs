import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { webinars } from '../../portal/content/webinars.mjs';
import { createRouteHelpers } from '../../portal/lib/urls.mjs';
import { normalizeWebinarRecord } from '../../portal/lib/webinars.mjs';
import { renderWebinarCard } from '../../portal/templates/components.mjs';
import {
  WEBINAR_DETAIL_ROUTE,
  expectImageNaturalSize,
  expectRuntimeClean,
  gotoPortal,
  resolveTestRoute,
  watchRuntime,
} from './helpers/qa.mjs';

const TITLE = 'GANADERÍA 4.0: ¿Estamos tomando decisiones o solo reaccionando?';
const POSTER_PATH = '/assets/images/webinars/ganaderia-4-0-2026.jpg';
const JOIN_URL = 'https://cedia.zoom.us/j/89751728629';
const REGISTRATION_URL = 'https://forms.gle/4iFLS8PSa4wsgHFa6';
const webinar = webinars.find(item => item.slug === WEBINAR_DETAIL_ROUTE.slug);

const expectSafeExternalLink = async (link, expectedHref) => {
  await expect(link).toHaveAttribute('href', expectedHref);
  await expect(link).toHaveAttribute('target', '_blank');
  const rel = new Set(((await link.getAttribute('rel')) || '').split(/\s+/));
  expect(rel.has('noopener')).toBe(true);
  expect(rel.has('noreferrer')).toBe(true);
};

const expectRelativeHrefAtRootAndPrefix = (href, fromPath, targetPath) => {
  expect(href).toBeTruthy();
  expect(href.startsWith('/')).toBe(false);
  expect(new URL(href, `https://example.test${fromPath}`).pathname).toBe(targetPath);
  expect(new URL(href, `https://example.test/SIPA_UTMACH${fromPath}`).pathname).toBe(`/SIPA_UTMACH${targetPath}`);
};

const getStructuredEvent = async page => page.locator('script[type="application/ld+json"]').evaluateAll(scripts => {
  const entries = scripts.flatMap(script => {
    const data = JSON.parse(script.textContent || 'null');
    return Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
  });
  return entries.find(entry => entry?.['@type'] === 'Event') || null;
});

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La biblioteca se cubre una sola vez en escritorio.');
});

test('Inicio, biblioteca y Eventos reutilizan una sola invitación upcoming sin video', async ({ page }) => {
  const runtime = watchRuntime(page);

  for (const route of ['/', '/divulgacion/webinars/', '/eventos/']) {
    await gotoPortal(page, route, runtime);
    const card = page.locator(`[data-webinar-card][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(TITLE);
    await expect(card).toContainText('Pablo Roberto Marini');
    await expect(card.locator('[data-webinar-player], iframe')).toHaveCount(0);
    await expect(card.locator('a[href*="youtube.com"], a[href*="youtu.be"]')).toHaveCount(0);

    const poster = card.locator('.webinar-card__poster img');
    await expect(poster).toHaveAttribute('alt', webinar.thumbnailAlt);
    await expectImageNaturalSize(poster, { width: 1254, height: 1254 });

    const detailHref = await card.locator('a[href]').evaluateAll((links, suffix) => links
      .map(link => link.getAttribute('href'))
      .find(href => href && new URL(href, document.baseURI).pathname.endsWith(suffix)) || null, WEBINAR_DETAIL_ROUTE.path);
    expectRelativeHrefAtRootAndPrefix(detailHref, route, WEBINAR_DETAIL_ROUTE.path);
  }

  expectRuntimeClean(runtime);
});

test('la ficha pública muestra los datos confirmados, enlaces seguros y afiche completo', async ({ page }) => {
  const runtime = await gotoPortal(page, WEBINAR_DETAIL_ROUTE.path, watchRuntime(page));
  const detail = page.locator(`[data-webinar-detail][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`);

  await expect(detail).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await expect(detail).toContainText('Webinar gratuito');
  await expect(detail).toContainText('Pablo Roberto Marini');
  await expect(detail).toContainText('Médico Veterinario | Doctor en Ciencias Veterinarias');
  await expect(detail).toContainText(/miércoles.*16 de septiembre de 2026/i);
  await expect(detail).toContainText(/18:00.*Ecuador/i);
  await expect(detail).toContainText(/20:00.*Argentina/i);
  await expect(detail).toContainText('Zoom');
  await expect(detail).toContainText('Maestría en Producción Animal');

  const meetingId = detail.locator('[data-webinar-meeting-id]');
  await expect(meetingId).toHaveText('897 5172 8629');
  expect(await meetingId.evaluate(element => getComputedStyle(element).userSelect)).not.toBe('none');

  const poster = detail.locator('[data-webinar-poster]');
  await expect(poster).toHaveAttribute('alt', webinar.thumbnailAlt);
  await expect(poster).toHaveAttribute('width', '1254');
  await expect(poster).toHaveAttribute('height', '1254');
  await expectImageNaturalSize(poster, { width: 1254, height: 1254 });
  const posterSrc = await poster.getAttribute('src');
  expectRelativeHrefAtRootAndPrefix(posterSrc, WEBINAR_DETAIL_ROUTE.path, POSTER_PATH);

  const actions = detail.locator('[data-webinar-actions]');
  await expectSafeExternalLink(actions.getByRole('link', { name: /^Inscripción gratuita/ }), REGISTRATION_URL);
  await expectSafeExternalLink(actions.getByRole('link', { name: /^Unirse por Zoom/ }), JOIN_URL);
  await expect(detail.locator('[data-webinar-player], iframe')).toHaveCount(0);
  await expect(detail.locator('a[href*="youtube.com"], a[href*="youtu.be"]')).toHaveCount(0);

  const breadcrumb = page.getByRole('navigation', { name: /ruta de navegación|migas|breadcrumb/i });
  await expect(breadcrumb).toContainText('Inicio');
  await expect(breadcrumb).toContainText('Divulgación');
  await expect(breadcrumb).toContainText('Webinars');
  await expect(breadcrumb).toContainText(/Ganadería 4\.0/i);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://sipautmach.com${WEBINAR_DETAIL_ROUTE.path}`,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `https://sipautmach.com${POSTER_PATH}`,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    `https://sipautmach.com${POSTER_PATH}`,
  );

  const event = await getStructuredEvent(page);
  expect(event).toMatchObject({
    '@type': 'Event',
    name: TITLE,
    url: `https://sipautmach.com${WEBINAR_DETAIL_ROUTE.path}`,
    startDate: '2026-09-16T18:00:00-05:00',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    isAccessibleForFree: true,
    location: { '@type': 'VirtualLocation', url: JOIN_URL },
  });
  expect(event.endDate).toBeUndefined();
  expect(JSON.stringify(event)).not.toContain('VideoObject');
  expect(JSON.stringify(event)).not.toContain('uploadDate');
  expectRuntimeClean(runtime);
});

test('la etiqueta temporal nunca infiere directo o final y cambia al día siguiente en Ecuador', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-16T23:30:00.000Z') });
  const runtime = await gotoPortal(page, WEBINAR_DETAIL_ROUTE.path, watchRuntime(page));
  const temporal = page.locator('[data-webinar-temporal]');

  await expect(temporal).toBeVisible();
  await expect(temporal).toHaveAttribute('data-webinar-start', '2026-09-16T18:00:00-05:00');
  await expect(temporal).toHaveAttribute('data-webinar-time-zone', 'America/Guayaquil');
  await expect(temporal).not.toContainText(/en vivo|finalizado|realizado|mañana/i);

  await page.clock.setFixedTime(new Date('2026-09-17T05:01:00.000Z'));
  await page.reload({ waitUntil: 'load' });
  await expect(temporal).toHaveText(/fecha transcurrida/i);
  await expect(temporal).not.toContainText(/en vivo|finalizado|realizado/i);

  await gotoPortal(page, '/', runtime);
  await expect(page.locator('[data-home-webinar-featured]')).toBeHidden();
  await expect(page.locator('[data-home-webinar-past]')).toBeVisible();
  await expect(page.locator('[data-home-webinar-heading]')).toHaveText('Biblioteca de webinars');
  await expect(page.getByRole('link', { name: /abrir biblioteca de webinars/i })).toBeVisible();
  expectRuntimeClean(runtime);
});

test('la ficha y sus acciones esenciales funcionan sin JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto(resolveTestRoute(WEBINAR_DETAIL_ROUTE.path), { waitUntil: 'domcontentloaded' });

  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await expectSafeExternalLink(page.getByRole('link', { name: /^Inscripción gratuita/ }), REGISTRATION_URL);
  await expectSafeExternalLink(page.getByRole('link', { name: /^Unirse por Zoom/ }), JOIN_URL);
  await expect(page.locator('[data-webinar-poster]')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);

  await context.close();
});

test('una grabación available conserva el reproductor diferido sin autoplay', async ({ page }) => {
  const youtubeId = 'AbCdEf123_4';
  const available = normalizeWebinarRecord({
    ...webinar,
    status: 'available',
    youtubeId,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    recordingPublishedAt: '2026-09-17',
  });
  const html = renderWebinarCard(available, createRouteHelpers('webinars'));

  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Video de prueba</title>',
  }));
  await page.setContent(html);
  await page.addScriptTag({ path: fileURLToPath(new URL('../../portal/assets/js/site.js', import.meta.url)) });

  const player = page.locator('[data-webinar-player]');
  await expect(player.locator('iframe')).toHaveCount(0);
  await player.locator('[data-webinar-play]').click();
  const iframe = player.locator('iframe[data-youtube-embed]');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('title', /Ganadería 4\.0/i);
  await expect(iframe).toHaveAttribute('src', new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${youtubeId}\\?rel=0$`));
  await expect(iframe).not.toHaveAttribute('src', /(?:\?|&)autoplay=1(?:&|$)/);
});
