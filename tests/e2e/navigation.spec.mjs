import { expect, test } from '@playwright/test';
import {
  EXPO_ROUTE,
  MAIN_ROUTES,
  expectRuntimeClean,
  gotoPortal,
  openPrimaryNavigation,
  watchRuntime,
} from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La navegación compartida se cubre una sola vez en escritorio.');
});

test('todas las rutas principales cargan con header y footer compartidos', async ({ page }) => {
  const runtime = watchRuntime(page);

  for (const route of MAIN_ROUTES) {
    await gotoPortal(page, route.path, runtime);
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/SIPA|Semillero/i);
  }

  expectRuntimeClean(runtime);
});

test('el menú principal abre cada página y marca la ruta activa', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));

  for (const route of MAIN_ROUTES.filter(item => item.path !== '/' && item.path !== '/divulgacion/webinars/')) {
    const navigation = await openPrimaryNavigation(page);
    const link = navigation.getByRole('link', { name: route.label, exact: true }).first();
    if (!await link.isVisible()) {
      const submenu = link.locator('xpath=ancestor::*[@data-submenu][1]');
      const submenuId = await submenu.getAttribute('id');
      expect(submenuId, `No se encontró el submenú que contiene ${route.label}`).toBeTruthy();
      await navigation.locator(`[data-submenu-toggle][aria-controls="${submenuId}"]`).click();
    }
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${route.path.replaceAll('/', '\\/')}(?:[?#].*)?$`));

    const currentLink = page
      .locator('nav[aria-label="Navegación principal"]')
      .getByRole('link', { name: route.label, exact: true })
      .first();
    await expect(currentLink).toHaveAttribute('aria-current', 'page');
  }

  expectRuntimeClean(runtime);
});

test('el submenú de Divulgación abre Webinars y mantiene Divulgación activa', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const navigation = await openPrimaryNavigation(page);
  const toggle = navigation.locator('[data-submenu-toggle][aria-controls="submenu-outreach"]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const webinarLink = navigation.locator('#submenu-outreach').getByRole('link', { name: 'Webinars', exact: true });
  await expect(webinarLink).toBeVisible();
  await webinarLink.click();
  await expect(page).toHaveURL(/\/divulgacion\/webinars\/$/);
  await expect(
    page.locator('nav[aria-label="Navegación principal"]').getByRole('link', { name: 'Divulgación', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  expectRuntimeClean(runtime);
});

test('el logo regresa al inicio desde una página interna', async ({ page }) => {
  const runtime = await gotoPortal(page, '/investigacion/', watchRuntime(page));
  await page.locator('a.brand').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main h1')).toBeVisible();
  expectRuntimeClean(runtime);
});

test('los breadcrumbs de páginas internas enlazan al inicio', async ({ page }) => {
  const runtime = await gotoPortal(page, '/divulgacion/webinars/', watchRuntime(page));
  const breadcrumb = page.getByRole('navigation', { name: /ruta de navegación|migas|breadcrumb/i });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute('href', /.+/);
  expectRuntimeClean(runtime);
});

test('Eventos enlaza a la Expoferia histórica', async ({ page }) => {
  const runtime = await gotoPortal(page, '/eventos/', watchRuntime(page));
  const expoLink = page.getByRole('link', { name: 'Abrir experiencia', exact: true });
  await expect(expoLink).toBeVisible();
  const href = await expoLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href.startsWith('/')).toBe(false);
  expect(new URL(href, page.url()).pathname).toBe(EXPO_ROUTE);
  await expoLink.click();
  await expect(page).toHaveURL(new RegExp(`${EXPO_ROUTE.replaceAll('/', '\\/')}$`));
  expectRuntimeClean(runtime);
});

test('el footer no contiene destinos falsos y usa rel seguro', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const footer = page.locator('footer.site-footer');
  await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  await expect(footer.locator('a:not([href]), a[href=""]')).toHaveCount(0);

  const unsafeExternalLinks = await footer.locator('a[target="_blank"]').evaluateAll(links => links
    .filter(link => {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/));
      return !rel.has('noopener') || !rel.has('noreferrer');
    })
    .map(link => link.getAttribute('href')));
  expect(unsafeExternalLinks).toEqual([]);
  expectRuntimeClean(runtime);
});
