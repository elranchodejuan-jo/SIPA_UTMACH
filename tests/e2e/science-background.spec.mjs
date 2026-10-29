import { expect, test } from '@playwright/test';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const offset = page => page.locator('[data-science-background]').evaluate(element => Number.parseFloat(element.style.getPropertyValue('--science-x')) || 0);

test('el fondo responde al mouse, se asienta y permite usar los enlaces', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Interacción con puntero fino.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const background = page.locator('[data-science-background]');
  await expect(background).toHaveAttribute('data-interactive', 'true');
  await expect(background).toHaveAttribute('aria-hidden', 'true');
  await expect(background).toHaveCSS('pointer-events', 'none');
  await page.mouse.move(120, 220);
  await expect.poll(() => offset(page)).toBeLessThan(-10);
  await page.mouse.move(1200, 420);
  await expect.poll(() => offset(page)).toBeGreaterThan(10);
  // Esperamos el destino exacto: no hay deriva después del movimiento.
  const target = Number(((1200 / 1366 - 0.5) * 44).toFixed(2));
  await expect.poll(() => offset(page)).toBe(target);
  await page.waitForTimeout(150);
  expect(await offset(page)).toBe(target);
  await page.getByRole('link', { name: 'Conocer SIPA', exact: true }).click();
  await expect(page).toHaveURL(/\/sipa\/$/);
  expectRuntimeClean(runtime);
});

test('la pausa se conserva al navegar y puede reactivarse con el teclado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Control de movimiento con mouse y teclado.');
  await gotoPortal(page, '/');
  const toggle = page.locator('[data-science-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.move(1250, 300);
  expect(await offset(page)).toBe(0);
  await gotoPortal(page, '/investigacion/');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-science-background]')).toHaveAttribute('data-interactive', 'false');
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(120, 220);
  await expect.poll(() => offset(page)).toBeLessThan(-10);
});

test('movimiento reducido detiene el efecto inmediatamente y conserva las ilustraciones', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Preferencia de accesibilidad en vivo.');
  await gotoPortal(page, '/');
  await page.mouse.move(120, 220);
  await expect.poll(() => offset(page)).toBeLessThan(-10);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-science-background]')).toHaveAttribute('data-interactive', 'false');
  await expect(page.locator('[data-science-toggle]')).toBeHidden();
  expect(await offset(page)).toBe(0);
  await expect(page.locator('.science-dna')).toBeVisible();
  await page.reload();
  await page.mouse.move(1100, 300);
  expect(await offset(page)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-science-toggle]')).toBeVisible();
});

test('la versión táctil es estática y no bloquea el menú ni desborda', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'Versión táctil.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await expect(page.locator('[data-science-background]')).toHaveAttribute('data-interactive', 'false');
  await expect(page.locator('[data-science-toggle]')).toBeHidden();
  await expect(page.locator('.science-dna')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expectRuntimeClean(runtime);
});
