import { expect, test } from '@playwright/test';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const offset = page => page.locator('[data-science-background]').evaluate(element => Number.parseFloat(element.style.getPropertyValue('--science-x')) || 0);
const networkPaint = page => page.locator('[data-science-network]').evaluate(canvas => {
  const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  const words = new Uint32Array(pixels.buffer);
  let fingerprint = 0;
  let paintedPixels = 0;
  for (let i = 0; i < words.length; i++) {
    fingerprint = (Math.imul(fingerprint, 31) + words[i]) >>> 0;
    if (pixels[i * 4 + 3]) paintedPixels++;
  }
  return { fingerprint, paintedPixels };
});

test('la red se anima en reposo, responde al mouse y permite usar los enlaces', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Interacción con puntero fino.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const background = page.locator('[data-science-background]');
  await expect(background).toHaveAttribute('data-interactive', 'true');
  await expect(background).toHaveAttribute('aria-hidden', 'true');
  await expect(background).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('[data-science-network]')).toBeVisible();
  const initial = await networkPaint(page);
  expect(initial.paintedPixels).toBeGreaterThan(1000);
  await expect.poll(async () => (await networkPaint(page)).fingerprint).not.toBe(initial.fingerprint);
  expect(await page.locator('[data-science-network]').evaluate(canvas => canvas.width <= Math.ceil(canvas.clientWidth * 1.5))).toBe(true);
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
  const pausedFrame = await networkPaint(page);
  await page.mouse.move(1250, 300);
  await page.waitForTimeout(150);
  expect((await networkPaint(page)).fingerprint).toBe(pausedFrame.fingerprint);
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
  const reducedFrame = await networkPaint(page);
  await page.waitForTimeout(150);
  expect((await networkPaint(page)).fingerprint).toBe(reducedFrame.fingerprint);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-science-toggle]')).toBeVisible();
});

test('la versión táctil es estática y no bloquea el menú ni desborda', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'Versión táctil.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await expect(page.locator('[data-science-background]')).toHaveAttribute('data-interactive', 'false');
  await expect(page.locator('[data-science-toggle]')).toBeHidden();
  await expect(page.locator('.science-dna')).toBeVisible();
  const stillFrame = await networkPaint(page);
  expect(stillFrame.paintedPixels).toBeGreaterThan(100);
  await page.waitForTimeout(150);
  expect((await networkPaint(page)).fingerprint).toBe(stillFrame.fingerprint);
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expectRuntimeClean(runtime);
});

test('la red actualiza sus colores al cambiar de tema incluso estando pausada', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Actualización de paleta.');
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await page.locator('[data-science-toggle]').click();
  const light = await networkPaint(page);
  await page.locator('[data-theme-toggle]').click();
  await expect.poll(async () => (await networkPaint(page)).fingerprint).not.toBe(light.fingerprint);
  await expect(page.locator('[data-science-background]')).toHaveAttribute('data-interactive', 'false');
  expectRuntimeClean(runtime);
});

test('si Canvas no está disponible queda una red estática y la navegación funciona', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Alternativa sin contexto de dibujo.');
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === '2d' ? null : original.call(this, type, ...args);
    };
  });
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await expect(page.locator('.science-network-fallback')).toBeVisible();
  await expect(page.locator('[data-science-network]')).toBeHidden();
  await page.getByRole('link', { name: 'Conocer SIPA', exact: true }).click();
  await expect(page).toHaveURL(/\/sipa\/$/);
  expectRuntimeClean(runtime);
});
