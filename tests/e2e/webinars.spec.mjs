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
const webinar = webinars.find(item => item.slug === WEBINAR_DETAIL_ROUTE.slug);

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

test('Inicio no destaca el webinar archivado y Biblioteca/Eventos conservan su ficha', async ({ page }) => {
  const runtime = watchRuntime(page);

  await gotoPortal(page, '/', runtime);
  await expect(page.locator(`[data-webinar-card][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`)).toHaveCount(0);
  await expect(page.locator('[data-home-webinar-heading]')).toHaveText('Biblioteca de webinars');
  await expect(page.getByRole('link', { name: /abrir biblioteca de webinars/i })).toBeVisible();

  await gotoPortal(page, '/divulgacion/webinars/', runtime);
  const libraryCard = page.locator(`[data-webinar-library] [data-webinar-card][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`);
  await expect(libraryCard).toHaveCount(1);
  await expect(libraryCard).toContainText(TITLE);
  await expect(libraryCard).toContainText('Pablo Roberto Marini');
  await expect(libraryCard).toContainText('Archivo');
  await expect(libraryCard.locator('[data-webinar-player], iframe')).toHaveCount(0);
  await expect(libraryCard.locator('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="zoom.us"], a[href*="forms.gle"]')).toHaveCount(0);

  const poster = libraryCard.locator('.webinar-card__poster img');
  await expect(poster).toHaveAttribute('alt', webinar.thumbnailAlt);
  await expectImageNaturalSize(poster, { width: 1254, height: 1254 });

  const detailHref = await libraryCard.locator('a[href]').evaluateAll((links, suffix) => links
    .map(link => link.getAttribute('href'))
    .find(href => href && new URL(href, document.baseURI).pathname.endsWith(suffix)) || null, WEBINAR_DETAIL_ROUTE.path);
  expectRelativeHrefAtRootAndPrefix(detailHref, '/divulgacion/webinars/', WEBINAR_DETAIL_ROUTE.path);

  await gotoPortal(page, '/eventos/', runtime);
  await expect(page.locator(`[data-webinar-agenda-list] [data-webinar-card][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`)).toHaveCount(0);
  const archive = page.locator('[data-webinar-past-section]');
  await expect(archive).toBeVisible();
  const archiveCard = archive.locator(`[data-webinar-card][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`);
  await expect(archiveCard).toHaveCount(1);
  await expect(archiveCard).toContainText(TITLE);
  await expect(archiveCard).toContainText('Archivo');
  await expect(archiveCard.locator('[data-webinar-player], iframe')).toHaveCount(0);

  expectRuntimeClean(runtime);
});

test('la ficha histórica conserva datos, afiche y SEO sin inscripción ni Zoom activo', async ({ page }) => {
  const runtime = await gotoPortal(page, WEBINAR_DETAIL_ROUTE.path, watchRuntime(page));
  const detail = page.locator(`[data-webinar-detail][data-webinar-slug="${WEBINAR_DETAIL_ROUTE.slug}"]`);

  await expect(detail).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await expect(detail).toContainText('Webinar gratuito');
  await expect(detail).toContainText('Archivo');
  await expect(detail).toContainText('Información del encuentro');
  await expect(detail).not.toContainText('Participa en este encuentro');
  await expect(detail).toContainText('Pablo Roberto Marini');
  await expect(detail).toContainText('Médico Veterinario | Doctor en Ciencias Veterinarias');
  await expect(detail).toContainText(/miércoles.*16 de septiembre de 2026/i);
  await expect(detail).toContainText(/18:00.*Ecuador/i);
  await expect(detail).toContainText(/20:00.*Argentina/i);
  await expect(detail).toContainText('Zoom');
  await expect(detail).toContainText('Maestría en Producción Animal');

  await expect(detail.locator('[data-webinar-actions]')).toHaveCount(0);
  await expect(detail.locator('[data-webinar-meeting-id]')).toHaveCount(0);
  await expect(detail.locator('a[href*="zoom.us"], a[href*="forms.gle"]')).toHaveCount(0);
  await expect(detail.locator('[data-webinar-temporal]')).toHaveCount(0);

  const poster = detail.locator('[data-webinar-poster]');
  await expect(poster).toHaveAttribute('alt', webinar.thumbnailAlt);
  await expect(poster).toHaveAttribute('width', '1254');
  await expect(poster).toHaveAttribute('height', '1254');
  await expectImageNaturalSize(poster, { width: 1254, height: 1254 });
  const posterSrc = await poster.getAttribute('src');
  expectRelativeHrefAtRootAndPrefix(posterSrc, WEBINAR_DETAIL_ROUTE.path, POSTER_PATH);

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
  });
  expect(event.location).toBeUndefined();
  expect(event.eventStatus).toBeUndefined();
  expect(event.endDate).toBeUndefined();
  expect(JSON.stringify(event)).not.toContain('VideoObject');
  expect(JSON.stringify(event)).not.toContain('uploadDate');
  expectRuntimeClean(runtime);
});

test('la ficha archivada oculta accesos vencidos incluso sin JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto(resolveTestRoute(WEBINAR_DETAIL_ROUTE.path), { waitUntil: 'domcontentloaded' });

  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await expect(page.getByText('Archivo', { exact: true })).toBeVisible();
  await expect(page.locator('[data-webinar-actions], [data-webinar-meeting-id]')).toHaveCount(0);
  await expect(page.locator('a[href*="zoom.us"], a[href*="forms.gle"]')).toHaveCount(0);
  await expect(page.locator('[data-webinar-poster]')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);

  await context.close();
});

test('una invitación upcoming futura mantiene estado programado y no inventa directo', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-09-16T22:30:00.000Z') });
  const upcoming = normalizeWebinarRecord({
    ...webinar,
    date: '2027-09-16',
    startDate: '2027-09-16T18:00:00-05:00',
    status: 'upcoming',
    featured: true,
    joinUrl: 'https://example.com/acceso',
    registrationUrl: 'https://example.com/registro',
  });
  const html = renderWebinarCard(upcoming, createRouteHelpers('webinars'));
  await page.setContent(html);
  await page.addScriptTag({ path: fileURLToPath(new URL('../../portal/assets/js/site.js', import.meta.url)) });

  const temporal = page.locator('[data-webinar-temporal]');
  await expect(temporal).toHaveText('Fecha programada');
  await expect(temporal).not.toContainText(/en vivo|finalizado|realizado|mañana/i);
  await expect(page.locator('[data-webinar-player], iframe')).toHaveCount(0);
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
