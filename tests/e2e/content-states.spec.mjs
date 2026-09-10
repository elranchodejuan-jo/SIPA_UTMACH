import { expect, test } from '@playwright/test';

import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../../portal/content/socials.mjs';
import { teamMembers } from '../../portal/content/team.mjs';
import { filterPublished } from '../../portal/lib/content.mjs';
import { expectNoHorizontalOverflow, expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'Los estados editoriales se cubren una sola vez.');
});

test('Equipo publica solo perfiles confirmados o un único estado editorial', async ({ page }) => {
  const runtime = await gotoPortal(page, '/equipo/', watchRuntime(page));
  const published = teamMembers.filter(member => member.published === true && member.status === 'confirmed');
  const cards = page.locator('main .team-card');
  expect(published).toHaveLength(4);
  await expect(cards).toHaveCount(published.length);

  await expect(cards.locator('h3')).toHaveText([
    'Angel Roberto Sánchez Quinche',
    'Robinson Macas',
    'Alison Machuca',
    'Juan José Bajaña',
  ]);
  await expect(cards.locator('.team-card__role')).toHaveText([
    'Miembro de SIPA',
    'Miembro de SIPA',
    'Miembro de SIPA',
    'Miembro de SIPA',
  ]);
  await expect(page.locator('main .team-group > h3')).toHaveText([
    'Docentes y dirección académica',
    'Ayudantías académicas y de campo',
    'Comunicación y desarrollo digital',
  ]);
  expect(await page.locator('main .team-group').evaluateAll(groups => groups.map(group => group.id))).toEqual([
    'docentes',
    'ayudantias',
    'comunicacion-digital',
  ]);
  await expect(page.locator('#estudiantes')).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText(/perfiles en actualización/i);
  await expect(page.locator('main')).not.toContainText(/Cuarto semestre|Exponente|Desarrollador Web|Master Solver/);
  await expect(page.locator('main')).not.toContainText(/Jimmy|Abigail/);

  const angelCard = page.locator('[data-person-id="angel-sanchez"]');
  const robinsonCard = page.locator('[data-person-id="robinson-macas"]');
  const alisonCard = page.locator('[data-person-id="allison-machuca"]');
  const juanCard = page.locator('[data-person-id="juan-bajana"]');
  await expect(angelCard.locator('.team-card__badges li')).toHaveText(['Docente']);
  await expect(robinsonCard.locator('.team-card__badges li')).toHaveText(['Ayudante de cátedra']);
  await expect(alisonCard.locator('.team-card__badges li')).toHaveText(['Ayudante de campo']);
  await expect(alisonCard).toContainText('Medicina Veterinaria');
  await expect(juanCard.locator('.team-card__badges li')).toHaveText(['Desarrollo web', 'Administración de redes']);
  await expect(juanCard).toHaveCount(1);

  const academicDetails = angelCard.locator('details.team-card__academic');
  const academicSummary = academicDetails.locator('summary');
  await expect(academicSummary).toContainText('Ver perfil académico');
  await expect(academicDetails).not.toHaveAttribute('open', '');
  await academicSummary.focus();
  await expect(academicSummary).toBeFocused();
  expect(await academicSummary.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
  await academicSummary.press('Enter');
  await expect(academicDetails).toHaveAttribute('open', '');
  await expect(academicDetails).toContainText('Universitat Politècnica de València');
  await expect(academicDetails).toContainText('Universidad del Zulia');
  await page.keyboard.press('Space');
  await expect(academicDetails).not.toHaveAttribute('open', '');

  await expect(angelCard.locator('.team-card__contacts a')).toHaveCount(0);
  for (const [card, href] of [
    [juanCard, 'https://www.instagram.com/elranchodejuan_jo'],
    [robinsonCard, 'https://www.instagram.com/macasrobin?igsh=MXJpMGo4OXVvcWFrNQ=='],
    [alisonCard, 'https://www.instagram.com/aymo_8a?stkn=N2Q3dnM5aXN0OHpz&utm_source=qr'],
  ]) {
    const instagram = card.locator(`a[href="${href}"]`);
    await expect(instagram).toHaveCount(1);
    await expect(instagram).toHaveAttribute('target', '_blank');
    await expect(instagram).toHaveAttribute('rel', /(?=.*\bnoopener\b)(?=.*\bnoreferrer\b)/);
    const box = await instagram.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  const institutionalContact = page.locator('.team-contact-section');
  await expect(institutionalContact.getByRole('heading', { name: 'Contactar con SIPA' })).toBeVisible();
  await expect(institutionalContact.locator('a[href="mailto:sipautmach@gmail.com"]')).toHaveCount(1);
  await expect(page.locator('a[href*="wa.me/"]')).toHaveCount(0);

  const portraits = cards.locator('img');
  await expect(portraits).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const portrait = portraits.nth(index);
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute('src', /assets\/images\/people\//);
    await expect.poll(() => portrait.evaluate(image => (
      Boolean(image.alt) && image.complete && image.naturalWidth > 0
    ))).toBe(true);
  }
  expectRuntimeClean(runtime);
});

test('Equipo mantiene escala, proporción y composición a 360, 768 y 1440 px', async ({ page }) => {
  const runtime = watchRuntime(page);
  for (const viewport of [
    { width: 360, height: 800, teacherSize: 160, horizontalTeacher: false },
    { width: 768, height: 1024, teacherSize: 160, horizontalTeacher: false },
    { width: 1440, height: 900, teacherSize: 200, horizontalTeacher: true },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoPortal(page, '/equipo/', runtime);
    await expectNoHorizontalOverflow(page);

    const teacherCard = page.locator('.team-card--featured');
    const teacherPortrait = teacherCard.locator('.team-card__portrait img');
    await teacherPortrait.scrollIntoViewIfNeeded();
    const teacherBox = await teacherPortrait.boundingBox();
    expect(Math.round(teacherBox?.width || 0)).toBe(viewport.teacherSize);
    expect(Math.round(teacherBox?.height || 0)).toBe(viewport.teacherSize);
    const teacherColumns = await teacherCard.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
    expect(teacherColumns).toBe(viewport.horizontalTeacher ? 2 : 1);

    const memberCards = page.locator('.team-card--member');
    await expect(memberCards).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const card = memberCards.nth(index);
      const portrait = card.locator('.team-card__portrait img');
      await portrait.scrollIntoViewIfNeeded();
      const [cardBox, portraitBox, objectFit] = await Promise.all([
        card.boundingBox(),
        portrait.boundingBox(),
        portrait.evaluate(image => getComputedStyle(image).objectFit),
      ]);
      expect(Math.abs((portraitBox?.width || 0) - (portraitBox?.height || 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((portraitBox?.width || 0) - (cardBox?.width || 0))).toBeLessThanOrEqual(2.5);
      expect(cardBox?.width || 0).toBeLessThanOrEqual(384);
      expect(objectFit).toBe('cover');
      await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }
  }
  expectRuntimeClean(runtime);
});

test('Contacto muestra únicamente canales publicados y no simula un formulario', async ({ page }) => {
  const runtime = await gotoPortal(page, '/contacto/', watchRuntime(page));
  const published = filterPublished([...contactChannels, ...socialLinks, ...institutionalLinks])
    .filter(item => item.url);
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
  const published = filterPublished([...socialLinks, ...contactChannels])
    .filter(item => item.url);
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
