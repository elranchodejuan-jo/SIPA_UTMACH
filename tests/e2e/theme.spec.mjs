import { expect, test } from '@playwright/test';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

const clearTheme = async page => {
  await page.evaluate(() => localStorage.removeItem('sipa-theme'));
};

test('cambia a oscuro y persiste tras recargar y navegar', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await clearTheme(page);
  await page.reload({ waitUntil: 'load' });

  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-label', /modo claro/i);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sipa-theme'))).toBe('dark');

  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/investigacion/', { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expectRuntimeClean(runtime);
});

test('respeta la preferencia oscura del sistema sin una selección guardada', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  await clearTheme(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload({ waitUntil: 'load' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /#[0-9a-f]{6}/i);
  expectRuntimeClean(runtime);
});


test('sigue el sistema en vivo y conserva la elección manual', async ({ page }) => {
  await gotoPortal(page, '/');
  await clearTheme(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.theme-toggle__sun')).toBeVisible();
  await expect(page.locator('.theme-toggle__moon')).toBeHidden();
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.theme-toggle__moon')).toBeVisible();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('sincroniza la elección de tema entre pestañas', async ({ page, context }) => {
  await gotoPortal(page, '/');
  const secondPage = await context.newPage();
  await gotoPortal(secondPage, '/contacto/');
  await page.locator('[data-theme-toggle]').click();
  await expect(secondPage.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(secondPage.locator('[data-theme-toggle]')).toHaveAttribute('aria-label', /modo claro/i);
  await secondPage.close();
});
