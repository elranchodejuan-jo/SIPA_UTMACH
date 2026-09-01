import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, expectRuntimeClean, expectTouchTargets, gotoPortal, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'Interacciones exclusivas del menú móvil.');
  await gotoPortal(page, '/');
});

test('abre, bloquea el body y cierra con Escape restaurando el foco', async ({ page }) => {
  const runtime = watchRuntime(page);
  await page.reload({ waitUntil: 'load' });
  const toggle = page.locator('[data-menu-toggle]');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-mobile-panel]')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/menu-open/);
  await expect.poll(() => page.locator('body').evaluate(element => getComputedStyle(element).overflow)).toBe('hidden');
  await expectTouchTargets(page);

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
  await expect(toggle).toBeFocused();
  expectRuntimeClean(runtime);
});

test('cierra con backdrop y al seleccionar un enlace', async ({ page }) => {
  const runtime = watchRuntime(page);
  await page.reload({ waitUntil: 'load' });
  const toggle = page.locator('[data-menu-toggle]');

  await toggle.click();
  await page.locator('[data-menu-backdrop]').click({ position: { x: 8, y: 8 } });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await page
    .locator('nav[aria-label="Navegación principal"]')
    .getByRole('link', { name: 'Equipo', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/equipo\/$/);
  await expect(page.locator('body')).not.toHaveClass(/menu-open/);
  expectRuntimeClean(runtime);
});

test('los submenús usan controles separados y estados accesibles', async ({ page }) => {
  const runtime = watchRuntime(page);
  await page.reload({ waitUntil: 'load' });
  await page.locator('[data-menu-toggle]').click();

  const submenuToggle = page.locator('[data-submenu-toggle]').first();
  await expect(submenuToggle).toBeVisible();
  await expect(submenuToggle).toHaveAttribute('aria-expanded', 'false');
  const controlledId = await submenuToggle.getAttribute('aria-controls');
  expect(controlledId).toBeTruthy();

  await submenuToggle.click();
  await expect(submenuToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(`#${controlledId}`)).toBeVisible();
  await expect(submenuToggle.locator('..').getByRole('link').first()).toBeVisible();
  expectRuntimeClean(runtime);
});

test('el panel puede desplazarse en pantallas de poca altura y no desborda horizontalmente', async ({ page }) => {
  const runtime = watchRuntime(page);
  await page.setViewportSize({ width: 360, height: 480 });
  await page.reload({ waitUntil: 'load' });
  await page.locator('[data-menu-toggle]').click();

  const panel = page.locator('[data-mobile-panel]');
  const overflowY = await panel.evaluate(element => getComputedStyle(element).overflowY);
  expect(['auto', 'scroll']).toContain(overflowY);
  await expectNoHorizontalOverflow(page);
  expectRuntimeClean(runtime);
});
