import { expect, test } from '@playwright/test';
import { expectRuntimeClean, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La página 404 se cubre una sola vez.');
});

test('404 mantiene identidad, ofrece retorno y no redirige en bucle', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto('/404.html', { waitUntil: 'load' });
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/Página no encontrada.*SIPA/i);
  await expect(page.getByRole('heading', { name: /página no encontrada/i })).toBeVisible();

  const homeLink = page.getByRole('link', { name: /ir al inicio/i });
  const href = await homeLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(new URL(href, page.url()).pathname).toBe('/');
  await homeLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('header.site-header')).toBeVisible();
  expectRuntimeClean(runtime);
});
