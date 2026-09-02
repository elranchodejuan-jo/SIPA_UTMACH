import { expect, test } from '@playwright/test';
import { EXPO_ROUTE, expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const EXPO_ICONS = [
  { rel: 'icon', sizes: '64x64', width: 64, height: 64 },
  { rel: 'icon', sizes: '48x48', width: 48, height: 48 },
  { rel: 'icon', sizes: '32x32', width: 32, height: 32 },
  { rel: 'icon', sizes: '24x24', width: 24, height: 24 },
  { rel: 'icon', sizes: '16x16', width: 16, height: 16 },
  { rel: 'apple-touch-icon', sizes: '180x180', width: 180, height: 180 },
];

const expectExpoFaviconSuite = async page => {
  for (const icon of EXPO_ICONS) {
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
    expect.objectContaining({ sizes: '1024x1024', type: 'image/png' }),
  ]));
};

const PORTAL_ICONS = [
  { rel: 'icon', sizes: '16x16', file: 'favicon-16x16.png', width: 16, height: 16 },
  { rel: 'icon', sizes: '32x32', file: 'favicon-32x32.png', width: 32, height: 32 },
  { rel: 'icon', sizes: '48x48', file: 'favicon-48x48.png', width: 48, height: 48 },
  { rel: 'icon', sizes: '96x96', file: 'favicon-96x96.png', width: 96, height: 96 },
  { rel: 'apple-touch-icon', sizes: '180x180', file: 'apple-touch-icon.png', width: 180, height: 180 },
];

const expectImageDimensions = async (page, href, width, height) => {
  const dimensions = await page.evaluate(async source => {
    const image = new Image();
    image.src = source;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, href);
  expect(dimensions).toEqual({ width, height });
};

const expectPortalFaviconSuite = async page => {
  const ico = page.locator('link[rel="icon"][sizes="any"]');
  await expect(ico).toHaveCount(1);
  const icoHref = await ico.getAttribute('href');
  expect(icoHref).toBeTruthy();
  expect(new URL(icoHref, page.url())).toMatchObject({ pathname: '/favicon.ico', search: '' });
  const icoResponse = await page.evaluate(async source => {
    const response = await fetch(source);
    return { ok: response.ok, contentType: response.headers.get('content-type') };
  }, icoHref);
  expect(icoResponse.ok).toBe(true);
  expect(icoResponse.contentType).toMatch(/^image\/(?:vnd\.microsoft\.icon|x-icon)/i);

  for (const icon of PORTAL_ICONS) {
    const link = page.locator(`link[rel="${icon.rel}"][sizes="${icon.sizes}"]`);
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(new URL(href, page.url())).toMatchObject({ pathname: `/${icon.file}`, search: '' });
    await expectImageDimensions(page, href, icon.width, icon.height);
  }

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveCount(1);
  const manifestHref = await manifestLink.getAttribute('href');
  expect(manifestHref).toBeTruthy();
  expect(new URL(manifestHref, page.url())).toMatchObject({ pathname: '/manifest.webmanifest', search: '' });
  const manifest = await page.evaluate(async source => (await fetch(source)).json(), manifestHref);
  expect(manifest.icons).toEqual([
    expect.objectContaining({ src: './android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }),
    expect.objectContaining({ src: './android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }),
  ]);
};

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La identidad del navegador se verifica una sola vez.');
});

test('el portal publica favicon HD estable y Expoferia conserva su suite histórica', async ({ page }) => {
  const runtime = watchRuntime(page);

  await gotoPortal(page, '/', runtime);
  await expectPortalFaviconSuite(page);

  await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  await expectExpoFaviconSuite(page);

  expectRuntimeClean(runtime);
});
