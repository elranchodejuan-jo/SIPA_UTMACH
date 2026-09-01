import { expect, test } from '@playwright/test';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`Volver arriba deja scrollY <= 4 con movimiento ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const runtime = await gotoPortal(page, '/investigacion/', watchRuntime(page));
    await page.locator('footer.site-footer').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

    const control = page.locator('[data-back-to-top]');
    await control.click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 }).toBeLessThanOrEqual(4);
    await expect(page.locator('#page-top')).toBeFocused();
    expectRuntimeClean(runtime);
  });
}
