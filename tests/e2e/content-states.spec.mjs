import { expect, test } from '@playwright/test';

import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../../portal/content/socials.mjs';
import { teamMembers } from '../../portal/content/team.mjs';
import { expectNoHorizontalOverflow, expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Los estados editoriales se cubren una sola vez.');
});

test('Equipo publica solo perfiles confirmados o un único estado editorial', async ({ page }) => {
  const runtime = await gotoPortal(page, '/equipo/', watchRuntime(page));
  const published = teamMembers.filter(member => member.published === true);
  const cards = page.locator('main .team-card');
  expect(published).toHaveLength(3);
  await expect(cards).toHaveCount(published.length);

  await expect(cards.locator('h3')).toHaveText([
    'Angel Roberto Sánchez Quinche',
    'Juan José Bajaña',
    'Robinson Macas',
  ]);
  await expect(cards.locator('.card__meta')).toHaveText([
    'Miembro de SIPA',
    'Miembro de SIPA',
    'Miembro de SIPA',
  ]);
  await expect(page.locator('main')).not.toContainText(/perfiles en actualización/i);
  await expect(page.locator('main')).not.toContainText(/Cuarto semestre|Exponente|Desarrollador Web|Master Solver/);

  const portraits = cards.locator('img');
  await expect(portraits).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const portrait = portraits.nth(index);
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute('src', /assets\/images\/people\//);
    await expect.poll(() => portrait.evaluate(image => (
      Boolean(image.alt) && image.complete && image.naturalWidth > 0
    ))).toBe(true);
  }
  expectRuntimeClean(runtime);
});

test('Equipo conserva una columna móvil sin desbordar sus retratos', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const runtime = await gotoPortal(page, '/equipo/', watchRuntime(page));
  const cards = page.locator('main .team-card');
  await expect(cards).toHaveCount(3);
  await expectNoHorizontalOverflow(page);

  const studentGrid = page.locator('main .team-group#estudiantes .team-grid');
  const columns = await studentGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/));
  expect(columns).toHaveLength(1);

  const portraits = cards.locator('img');
  for (let index = 0; index < 3; index += 1) {
    const portrait = portraits.nth(index);
    await portrait.scrollIntoViewIfNeeded();
    await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  }
  expectRuntimeClean(runtime);
});

test('Contacto muestra únicamente canales publicados y no simula un formulario', async ({ page }) => {
  const runtime = await gotoPortal(page, '/contacto/', watchRuntime(page));
  const published = [...contactChannels, ...socialLinks, ...institutionalLinks]
    .filter(item => item.published === true && item.url);
  await expect(page.locator('main .contact-card')).toHaveCount(published.length);

  for (const item of published) {
    const link = page.locator(`main a[href="${item.url}"]`).first();
    await expect(link).toBeVisible();
    if (/^https?:/i.test(item.url)) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /(?=.*\bnoopener\b)(?=.*\bnoreferrer\b)/);
    } else {
      await expect(link).not.toHaveAttribute('target', '_blank');
    }
  }

  const form = page.locator('main form');
  if (contactContent.form.published === true) {
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute('action', contactContent.form.endpoint);
    await expect(form.getByRole('button', { name: /enviar/i })).toBeVisible();
  } else {
    await expect(form).toHaveCount(0);
    await expect(page.locator('main button[type="submit"]')).toHaveCount(0);
  }
  expectRuntimeClean(runtime);
});

test('el footer muestra únicamente iconos de redes y contacto publicados', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const published = [...socialLinks, ...contactChannels]
    .filter(item => item.published === true && item.url);
  const links = page.locator('footer.site-footer .social-list a');
  await expect(links).toHaveCount(published.length);
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.href));
  assertSameUrls(hrefs, published.map(item => item.url));

  for (const item of published) {
    const link = page.locator(`footer.site-footer .social-list a[href="${item.url}"]`).first();
    await expect(link).toHaveAttribute('aria-label', `${item.label} de SIPA`);
    await expect(link.locator('svg')).toHaveCount(1);
    await expect(link.locator(':scope > span:not(.visually-hidden)')).toHaveCount(0);
  }

  await expect(page.locator('footer.site-footer .social-list a[href="https://www.utmachala.edu.ec/"]')).toHaveCount(0);
  expectRuntimeClean(runtime);
});

function assertSameUrls(actual, expected) {
  expect(actual.map(value => new URL(value).href).sort()).toEqual(expected.map(value => new URL(value).href).sort());
}
