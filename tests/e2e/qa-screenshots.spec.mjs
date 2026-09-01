import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { expect, test } from '@playwright/test';
import { expectRuntimeClean, watchRuntime } from './helpers/qa.mjs';

const captureDir = path.join(process.cwd(), 'tmp', 'sipa-green-qa');

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

const visit = async (page, route, { width, height, theme = 'light' }) => {
  await page.setViewportSize({ width, height });
  await page.goto(route, { waitUntil: 'load' });
  await expect(page.locator('main')).toBeVisible();
  const currentTheme = await page.locator('html').getAttribute('data-theme');
  if (currentTheme !== theme) await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
};

const captureDropdown = async (page, name, theme) => {
  await visit(page, '/', { width: 1366, height: 768, theme });
  const toggle = page.locator('[data-submenu-toggle][aria-controls="submenu-outreach"]');
  await toggle.click();
  await expect(page.locator('#submenu-outreach')).toBeVisible();
  await capture(page, name, { fullPage: false });
};

const captureMobileMenu = async (page, name, theme) => {
  await visit(page, '/', { width: 360, height: 800, theme });
  await page.locator('[data-menu-toggle]').click();
  await expect(page.locator('[data-mobile-panel]')).toBeVisible();
  await capture(page, name, { fullPage: false });
};

test.beforeAll(async () => {
  await mkdir(captureDir, { recursive: true });
});

test('genera el juego mínimo de capturas para inspección humana', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Las capturas se generan una sola vez.');
  const runtime = watchRuntime(page);

  await visit(page, '/', { width: 1440, height: 900, theme: 'light' });
  await capture(page, 'light-home-desktop');

  await visit(page, '/', { width: 390, height: 844, theme: 'light' });
  await capture(page, 'light-home-mobile');

  await captureDropdown(page, 'light-dropdown-open', 'light');
  await captureMobileMenu(page, 'light-mobile-menu-open', 'light');

  for (const [name, route, width, height] of [
    ['light-sipa', '/sipa/', 1024, 768],
    ['light-research', '/investigacion/', 1366, 768],
    ['light-outreach', '/divulgacion/', 768, 1024],
    ['light-webinars', '/divulgacion/webinars/', 1366, 768],
    ['light-events', '/eventos/', 1024, 768],
    ['light-team', '/equipo/', 1366, 768],
    ['light-contact', '/contacto/', 1366, 768],
  ]) {
    await visit(page, route, { width, height, theme: 'light' });
    await capture(page, name);
  }

  await visit(page, '/', { width: 1440, height: 900, theme: 'light' });
  await page.locator('footer.site-footer').scrollIntoViewIfNeeded();
  await capture(page, 'light-footer', { fullPage: false });

  await page.goto('/404.html', { waitUntil: 'load' });
  await expect(page.getByRole('heading', { name: /p.gina no encontrada/i })).toBeVisible();
  await capture(page, 'light-404');

  await page.setViewportSize({ width: 1200, height: 630 });
  const ogResponse = await page.goto('/assets/images/og-sipa.png', { waitUntil: 'load' });
  expect(ogResponse?.status()).toBeLessThan(400);
  await capture(page, 'open-graph');

  await visit(page, '/', { width: 1440, height: 900, theme: 'dark' });
  await capture(page, 'dark-home-desktop');

  await visit(page, '/', { width: 390, height: 844, theme: 'dark' });
  await capture(page, 'dark-home-mobile');

  await captureDropdown(page, 'dark-dropdown-open', 'dark');
  await captureMobileMenu(page, 'dark-mobile-menu-open', 'dark');

  for (const [name, route, width, height] of [
    ['dark-research', '/investigacion/', 1024, 768],
    ['dark-webinars', '/divulgacion/webinars/', 1366, 768],
    ['dark-team', '/equipo/', 768, 1024],
    ['dark-contact', '/contacto/', 1366, 768],
  ]) {
    await visit(page, route, { width, height, theme: 'dark' });
    await capture(page, name);
  }

  await visit(page, '/', { width: 1440, height: 900, theme: 'dark' });
  await page.locator('footer.site-footer').scrollIntoViewIfNeeded();
  await capture(page, 'dark-footer', { fullPage: false });

  expectRuntimeClean(runtime);
});
