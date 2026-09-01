import { expect, test } from '@playwright/test';

import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../../portal/content/socials.mjs';
import { teamMembers } from '../../portal/content/team.mjs';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Los estados editoriales se cubren una sola vez.');
});

test('Equipo publica solo perfiles confirmados o un único estado editorial', async ({ page }) => {
  const runtime = await gotoPortal(page, '/equipo/', watchRuntime(page));
  const published = teamMembers.filter(member => member.published === true);
  const cards = page.locator('main .team-card');
  await expect(cards).toHaveCount(published.length);

  if (published.length === 0) {
    await expect(page.locator('main')).toContainText(/perfiles en actualización/i);
    await expect(page.locator('main .team-card img')).toHaveCount(0);
  } else {
    for (const member of published) await expect(page.getByRole('heading', { name: member.name, exact: true })).toBeVisible();
    const brokenPortraits = await cards.locator('img').evaluateAll(images => images
      .filter(image => !image.alt || !image.complete || image.naturalWidth === 0)
      .map(image => image.getAttribute('src')));
    expect(brokenPortraits).toEqual([]);
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

test('el footer deriva exactamente los canales publicados', async ({ page }) => {
  const runtime = await gotoPortal(page, '/', watchRuntime(page));
  const published = [...socialLinks, ...contactChannels, ...institutionalLinks]
    .filter(item => item.published === true && item.url);
  const links = page.locator('footer.site-footer .social-list a');
  await expect(links).toHaveCount(published.length);
  const hrefs = await links.evaluateAll(elements => elements.map(element => element.href));
  assertSameUrls(hrefs, published.map(item => item.url));
  expectRuntimeClean(runtime);
});

function assertSameUrls(actual, expected) {
  expect(actual.map(value => new URL(value).href).sort()).toEqual(expected.map(value => new URL(value).href).sort());
}
