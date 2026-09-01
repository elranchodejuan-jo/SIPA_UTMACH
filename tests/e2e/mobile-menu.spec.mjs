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

test('los grupos y submenús conservan un flujo vertical minimalista', async ({ page }) => {
  const runtime = watchRuntime(page);
  await page.reload({ waitUntil: 'load' });
  await page.locator('[data-menu-toggle]').click();

  const toggles = page.locator('[data-submenu-toggle]');
  const firstToggle = toggles.nth(0);
  const secondToggle = toggles.nth(1);
  await firstToggle.click();

  const controlledId = await firstToggle.getAttribute('aria-controls');
  const group = firstToggle.locator('xpath=ancestor::li[1]');
  const row = group.locator(':scope > .nav-item__row');
  const submenu = page.locator(`#${controlledId}`);
  const [groupBox, rowBox, submenuBox, firstSubmenuLinkBox] = await Promise.all([
    group.boundingBox(),
    row.boundingBox(),
    submenu.boundingBox(),
    submenu.locator('a').first().boundingBox(),
  ]);

  expect(groupBox).not.toBeNull();
  expect(rowBox).not.toBeNull();
  expect(submenuBox).not.toBeNull();
  expect(firstSubmenuLinkBox).not.toBeNull();
  expect(Math.abs((groupBox?.width ?? 0) - (rowBox?.width ?? 0))).toBeLessThanOrEqual(1);
  expect(submenuBox?.y ?? 0).toBeGreaterThanOrEqual((rowBox?.y ?? 0) + (rowBox?.height ?? 0) - 1);
  expect((firstSubmenuLinkBox?.x ?? 0) - (groupBox?.x ?? 0)).toBeGreaterThanOrEqual(16);
  expect((firstSubmenuLinkBox?.x ?? 0) - (groupBox?.x ?? 0)).toBeLessThanOrEqual(24);
  expect((submenuBox?.x ?? 0) + (submenuBox?.width ?? 0)).toBeLessThanOrEqual((groupBox?.x ?? 0) + (groupBox?.width ?? 0) + 1);

  const toggleStyle = await firstToggle.evaluate(element => {
    const style = getComputedStyle(element);
    const iconBox = element.querySelector('svg')?.getBoundingClientRect();
    return {
      backgroundColor: style.backgroundColor,
      borderTopWidth: style.borderTopWidth,
      boxShadow: style.boxShadow,
      height: element.getBoundingClientRect().height,
      iconWidth: iconBox?.width ?? 0,
    };
  });
  expect(toggleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(toggleStyle.borderTopWidth).toBe('0px');
  expect(toggleStyle.boxShadow).toBe('none');
  expect(toggleStyle.height).toBeGreaterThanOrEqual(44);
  expect(toggleStyle.height).toBeLessThanOrEqual(46);
  expect(toggleStyle.iconWidth).toBeGreaterThanOrEqual(14);
  expect(toggleStyle.iconWidth).toBeLessThanOrEqual(16);

  await secondToggle.click();
  await expect(firstToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(submenu).toBeHidden();
  await expect(secondToggle).toHaveAttribute('aria-expanded', 'true');
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
