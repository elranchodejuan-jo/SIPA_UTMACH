import { expect, test } from '@playwright/test';
import { MAIN_ROUTES } from './helpers/qa.mjs';

test('el contenido y los enlaces principales funcionan sin JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();

  for (const route of MAIN_ROUTES) {
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
  }

  await context.close();
});

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La mejora progresiva se cubre una sola vez.');
});
