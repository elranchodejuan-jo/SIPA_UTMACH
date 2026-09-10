import { expect, test } from '@playwright/test';
import {
  EXPO_ROUTE,
  PORTAL_ROOT_PATHNAME,
  expectNoHorizontalOverflow,
  expectRuntimeClean,
  watchRuntime,
} from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La Expoferia preservada se carga una sola vez.');
});

test('la Expoferia histórica carga y su retorno vuelve al portal', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('main')).toBeVisible();

  const returnLink = page.getByRole('link', { name: /volver (al portal )?SIPA/i });
  await expect(returnLink).toBeVisible();
  const href = await returnLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href.startsWith('/')).toBe(false);
  expect(new URL(href, page.url()).pathname).toBe(PORTAL_ROOT_PATHNAME);
  await returnLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('header.site-header')).toBeVisible();
  expectRuntimeClean(runtime);
});

test('la Expoferia conserva perfiles, orden, contenido y retratos nuevos e históricos', async ({ page }) => {
  const runtime = watchRuntime(page);
  const response = await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  expect(response?.status()).toBeLessThan(400);

  const teamContainer = page.locator('#team-container');
  await teamContainer.scrollIntoViewIfNeeded();
  await expect(teamContainer.locator('.team-card')).toHaveCount(4);
  await expect(teamContainer.locator('.team-card__name')).toHaveText([
    'Angel Roberto Sánchez Quinche',
    'Carolina Cajamarca',
    'Juan José Bajaña',
    'Robinson Macas',
  ]);
  await expect(teamContainer.locator(':scope > .team-card--teacher')).toHaveCount(1);
  await expect(teamContainer.locator(':scope > .team-grid > .team-card')).toHaveCount(3);

  const teacher = teamContainer.locator(':scope > .team-card--teacher');
  await expect(teacher).toContainText('Doctor en Medicina Veterinaria y Zootecnia · Máster Universitario en Producción Animal · Doctor en Ciencias Veterinarias');
  await expect(teacher).toContainText('Docente-Investigador de la UTMACH');
  await expect(teacher).toContainText('Nutrición Animal');
  await expect(teacher).toContainText('Salud en la Producción Porcina');
  await expect(teacher.locator('.teacher-bio__text')).toContainText('Desde 2013, combina su labor docente e investigadora');

  const memberCards = teamContainer.locator(':scope > .team-grid > .team-card');
  await expect(memberCards.locator('.team-card__career')).toHaveText([
    'Medicina Veterinaria · Cuarto semestre',
    'Medicina Veterinaria · Cuarto semestre',
    'Medicina Veterinaria · Cuarto semestre',
  ]);
  await expect(memberCards.locator('.team-card__topic')).toHaveText([
    'Nutrición Animal',
    'Nutrición Animal',
    'Nutrición Animal',
  ]);
  await expect(memberCards.locator('.team-card__role')).toHaveText([
    'Exponente',
    'Desarrollador Web',
    'Master Solver',
  ]);

  const portraits = teamContainer.locator('img.team-card__image');
  await expect(portraits).toHaveCount(4);
  const portraitSources = [];
  for (let index = 0; index < 4; index += 1) {
    const portrait = portraits.nth(index);
    await portrait.scrollIntoViewIfNeeded();
    await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    portraitSources.push(await portrait.getAttribute('src'));
  }
  expect(portraitSources).toEqual([
    '../../assets/images/people/angel-sanchez.png',
    '../../assets/images/people/carolina-cajamarca.png?v=2',
    '../../assets/images/people/juan-bajana.jpg?v=2',
    '../../assets/images/people/robinson-macas.jpeg?v=2',
  ]);

  const newPortraitUrls = portraitSources.map(source => new URL(source, page.url()).href);
  const legacyPortraitUrls = [
    'images/angel-sanchez.png',
    'images/carolina-cajamarca.png?v=2',
    'images/juan-bajana.jpg?v=2',
    'images/robinson-macas.jpeg?v=2',
  ].map(source => new URL(source, page.url()).href);
  for (const portraitUrl of [...newPortraitUrls, ...legacyPortraitUrls]) {
    const portraitResponse = await page.request.get(portraitUrl);
    expect(portraitResponse.status(), portraitUrl).toBeLessThan(400);
    expect(portraitResponse.headers()['content-type'], portraitUrl).toMatch(/^image\//);
  }

  expectRuntimeClean(runtime);
});

test('el equipo de Expoferia conserva recortes y breakpoints responsive', async ({ page }) => {
  const runtime = watchRuntime(page);

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(EXPO_ROUTE, { waitUntil: 'load' });
  const teamContainer = page.locator('#team-container');
  await teamContainer.scrollIntoViewIfNeeded();
  await expect(teamContainer.locator('.team-card')).toHaveCount(4);
  await expectNoHorizontalOverflow(page);

  const mobileTeacherImage = teamContainer.locator(':scope > .team-card--teacher .team-card__image');
  const mobileTeacherStyle = await mobileTeacherImage.evaluate(image => {
    const box = image.getBoundingClientRect();
    return { width: box.width, height: box.height, objectFit: getComputedStyle(image).objectFit };
  });
  expect(mobileTeacherStyle).toEqual({ width: 160, height: 160, objectFit: 'cover' });
  const mobileColumns = await teamContainer.locator(':scope > .team-grid').evaluate(
    element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(mobileColumns).toBe(1);

  await page.setViewportSize({ width: 1440, height: 900 });
  const desktopTeacherStyle = await mobileTeacherImage.evaluate(image => {
    const box = image.getBoundingClientRect();
    return { width: box.width, height: box.height, objectFit: getComputedStyle(image).objectFit };
  });
  expect(desktopTeacherStyle).toEqual({ width: 200, height: 200, objectFit: 'cover' });
  const desktopColumns = await teamContainer.locator(':scope > .team-grid').evaluate(
    element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(desktopColumns).toBe(4);
  expectRuntimeClean(runtime);
});
