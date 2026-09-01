import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { expect, test } from '@playwright/test';

const captureDir = path.join(process.cwd(), 'tmp', 'sipa-v2-qa');

const capture = async (page, name, { fullPage = true } = {}) => {
  await page.evaluate(() => {
    document.documentElement.classList.remove('reveal-ready');
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  });
  await page.screenshot({
    path: path.join(captureDir, `${name}.png`),
    fullPage,
    animations: 'disabled',
  });
};

test.beforeAll(async () => {
  await mkdir(captureDir, { recursive: true });
});

test('genera el juego mínimo de capturas para inspección humana', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Las capturas se generan una sola vez.');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'load' });
  await capture(page, 'inicio-escritorio');
  await page.locator('[data-submenu-toggle][aria-controls="submenu-outreach"]').click();
  await expect(page.locator('#submenu-outreach')).toBeVisible();
  await capture(page, 'header-escritorio-dropdown', { fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'load' });
  await capture(page, 'inicio-movil');
  await page.locator('[data-menu-toggle]').click();
  await expect(page.locator('[data-mobile-panel]')).toBeVisible();
  await capture(page, 'menu-movil-abierto', { fullPage: false });
  await page.locator('[data-submenu-toggle][aria-controls="submenu-outreach"]').click();
  await expect(page.locator('#submenu-outreach')).toBeVisible();
  await capture(page, 'menu-movil-submenu-abierto', { fullPage: false });

  await page.setViewportSize({ width: 1366, height: 768 });
  for (const [name, route] of [
    ['sipa', '/sipa/'],
    ['investigacion', '/investigacion/'],
    ['webinars', '/divulgacion/webinars/'],
    ['equipo', '/equipo/'],
    ['contacto', '/contacto/'],
  ]) {
    await page.goto(route, { waitUntil: 'load' });
    await capture(page, name);
  }

  await page.goto('/', { waitUntil: 'load' });
  await page.locator('footer.site-footer').scrollIntoViewIfNeeded();
  await capture(page, 'footer', { fullPage: false });

  await page.goto('/investigacion/', { waitUntil: 'load' });
  const theme = page.locator('[data-theme-toggle]');
  if (await page.locator('html').getAttribute('data-theme') !== 'dark') await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await capture(page, 'modo-oscuro-investigacion');
});
