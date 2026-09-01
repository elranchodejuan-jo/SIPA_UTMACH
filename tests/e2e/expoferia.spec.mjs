import { expect, test } from '@playwright/test';
import { EXPO_ROUTE, expectRuntimeClean, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La Expoferia preservada se carga una sola vez.');
});

test('la Expoferia histórica carga y su retorno vuelve al portal', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('main')).toBeVisible();

  const returnLink = page.getByRole('link', { name: /volver (al portal )?SIPA/i });
  await expect(returnLink).toBeVisible();
  const href = await returnLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href.startsWith('/')).toBe(false);
  expect(new URL(href, page.url()).pathname).toBe('/');
  await returnLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('header.site-header')).toBeVisible();
  expectRuntimeClean(runtime);
});
