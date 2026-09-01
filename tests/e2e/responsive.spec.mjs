import { expect, test } from '@playwright/test';
import {
  MAIN_ROUTES,
  VIEWPORTS,
  expectImagesLoaded,
  expectNoHorizontalOverflow,
  expectRuntimeClean,
  expectTouchTargets,
  gotoPortal,
  watchRuntime,
} from './helpers/qa.mjs';

for (const viewport of VIEWPORTS) {
  test(`responsive ${viewport.width} × ${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1366', 'La matriz responsive se ejecuta una sola vez.');
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const runtime = watchRuntime(page);

    for (const route of MAIN_ROUTES) {
      await gotoPortal(page, route.path, runtime);
      await expectNoHorizontalOverflow(page);
      await expectImagesLoaded(page);
      await expectTouchTargets(page);

      const headerBox = await page.locator('header.site-header').boundingBox();
      expect(headerBox).not.toBeNull();
      expect(headerBox?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((headerBox?.x ?? 0) + (headerBox?.width ?? 0)).toBeLessThanOrEqual(viewport.width + 1);

      const overflowingHeadings = await page.locator('h1, h2, h3').evaluateAll(headings => headings
        .filter(heading => heading.scrollWidth > heading.clientWidth + 1)
        .map(heading => heading.textContent?.trim()));
      expect(overflowingHeadings, `Títulos desbordados en ${route.path}`).toEqual([]);
    }

    expectRuntimeClean(runtime);
  });
}

test('el breakpoint del menú coincide entre CSS y JavaScript', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La costura responsive se ejecuta una sola vez.');
  const runtime = watchRuntime(page);

  for (const width of [900, 901, 1023, 1024]) {
    await page.setViewportSize({ width, height: 768 });
    await gotoPortal(page, '/', runtime);
    const toggle = page.locator('[data-menu-toggle]');
    if (width < 1024) {
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.locator('[data-mobile-panel]')).toBeVisible();
      await page.keyboard.press('Escape');
    } else {
      await expect(toggle).toBeHidden();
      await expect(page.locator('nav[aria-label="Navegación principal"]')).toBeVisible();
    }
  }

  expectRuntimeClean(runtime);
});
