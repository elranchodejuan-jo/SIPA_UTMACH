import { expect, test } from '@playwright/test';
import { EXPO_ROUTE, expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const EXPECTED_ICONS = [
  { rel: 'icon', sizes: '48x48', width: 48, height: 48 },
  { rel: 'icon', sizes: '32x32', width: 32, height: 32 },
  { rel: 'icon', sizes: '16x16', width: 16, height: 16 },
  { rel: 'apple-touch-icon', sizes: '180x180', width: 180, height: 180 },
];

const expectFaviconSuite = async page => {
  for (const icon of EXPECTED_ICONS) {
    const link = page.locator(`link[rel="${icon.rel}"][sizes="${icon.sizes}"]`);
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();

    const dimensions = await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, href);
    expect(dimensions).toEqual({ width: icon.width, height: icon.height });
  }

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBeTruthy();
  const manifest = await page.evaluate(async source => (await fetch(source)).json(), manifestHref);
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192', type: 'image/png' }),
    expect.objectContaining({ sizes: '512x512', type: 'image/png' }),
  ]));
};

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La identidad del navegador se verifica una sola vez.');
});

test('el portal y la Expoferia publican el favicon institucional de SIPA', async ({ page }) => {
  const runtime = watchRuntime(page);

  await gotoPortal(page, '/', runtime);
  await expectFaviconSuite(page);

  await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  await expectFaviconSuite(page);

  expectRuntimeClean(runtime);
});
