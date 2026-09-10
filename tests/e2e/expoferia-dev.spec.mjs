import { expect, test } from '@playwright/test';

import { expectRuntimeClean, watchRuntime } from './helpers/qa.mjs';

const expoDevUrl = process.env.SIPA_EXPO_DEV_URL;

test.describe('Expoferia en el servidor de desarrollo', () => {
  test.skip(!expoDevUrl, 'Requiere SIPA_EXPO_DEV_URL y un servidor dev:expo activo.');

  test('conserva perfiles, adaptadores y retratos compartidos', async ({ page }) => {
    const runtime = watchRuntime(page);
    const response = await page.goto(expoDevUrl, { waitUntil: 'networkidle' });

    expect(response?.ok()).toBe(true);

    const profileNames = page.locator('.teacher-card__name, .team-card__name');
    await expect(profileNames).toHaveText([
      'Angel Roberto Sánchez Quinche',
      'Carolina Cajamarca',
      'Juan José Bajaña',
      'Robinson Macas',
    ]);

    await expect(page.locator('.team-card__role')).toHaveText([
      'Docente-Investigador de la UTMACH',
      'Exponente',
      'Desarrollador Web',
      'Master Solver',
    ]);

    const portraits = page.locator('img.team-card__image');
    await expect(portraits).toHaveCount(4);
    expect(await portraits.evaluateAll(images => images.map(image => image.getAttribute('src')))).toEqual([
      './assets/images/people/angel-sanchez.png',
      './assets/images/people/carolina-cajamarca.png?v=2',
      './assets/images/people/juan-bajana.jpg?v=2',
      './assets/images/people/robinson-macas.jpeg?v=2',
    ]);

    for (let index = 0; index < 4; index += 1) {
      const portrait = portraits.nth(index);
      await portrait.scrollIntoViewIfNeeded();
      await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }

    const loadedPortraits = await portraits.evaluateAll((images) =>
      images.map((image) => ({
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        src: image.currentSrc,
      })),
    );

    for (const portrait of loadedPortraits) {
      expect(portrait.complete).toBe(true);
      expect(portrait.naturalWidth).toBeGreaterThan(0);

      const portraitResponse = await page.request.get(portrait.src);
      expect(portraitResponse.ok()).toBe(true);
      expect(portraitResponse.headers()['content-type']).toMatch(/^image\//);
    }

    expectRuntimeClean(runtime);
  });
});
