import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SITE_CONFIG } from '../../portal/config/site.mjs';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const auditedRoutes = ['/', '/investigacion/', '/divulgacion/webinars/', '/equipo/', '/contacto/'];

for (const route of auditedRoutes) {
  test(`WCAG AA sin violaciones automáticas en ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1366', 'La auditoría de páginas se cubre una sola vez.');
    const runtime = await gotoPortal(page, route, watchRuntime(page));
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      results.violations,
      results.violations.map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`).join('\n'),
    ).toEqual([]);
    expectRuntimeClean(runtime);
  });
}

test('Equipo en modo oscuro y con perfil académico abierto conserva WCAG AA', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La auditoría oscura de Equipo se cubre una sola vez.');
  await page.addInitScript(storageKey => localStorage.setItem(storageKey, 'dark'), SITE_CONFIG.storageKeys.theme);
  const runtime = await gotoPortal(page, '/equipo/', watchRuntime(page));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const details = page.locator('[data-person-id="angel-sanchez"] details');
  await details.locator('summary').press('Enter');
  await expect(details).toHaveAttribute('open', '');

  const results = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations,
    results.violations.map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`).join('\n'),
  ).toEqual([]);
  expectRuntimeClean(runtime);
});

test('el menú móvil abierto mantiene accesibilidad automática', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'Auditoría específica del menú móvil.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await page.locator('[data-menu-toggle]').click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations,
    results.violations.map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`).join('\n'),
  ).toEqual([]);
  expectRuntimeClean(runtime);
});

test('el skip link lleva el foco al contenido principal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'El flujo de teclado se cubre una sola vez.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: /saltar al contenido/i });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expectRuntimeClean(runtime);
});
