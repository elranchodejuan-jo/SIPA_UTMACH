import { expect, test } from '@playwright/test';
import { expectRuntimeClean, gotoPortal, watchRuntime } from './helpers/qa.mjs';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1366', 'La biblioteca se cubre una sola vez en escritorio.');
});

test('la biblioteca renderiza un estado vacío profesional o reproductores diferidos válidos', async ({ page }) => {
  const runtime = await gotoPortal(page, '/divulgacion/webinars/', watchRuntime(page));
  const library = page.locator('[data-webinar-library]');
  await expect(library).toBeVisible();

  const players = library.locator('[data-webinar-player]');
  const publishedCount = await players.count();

  if (publishedCount === 0) {
    await expect(library.locator('iframe')).toHaveCount(0);
    await expect(library).toContainText(/aparecerán|incorporar|progresivamente|próxim/i);
  } else {
    await expect(library.locator('iframe[data-youtube-embed]')).toHaveCount(0);
    const firstPlayer = players.first();
    const playButton = firstPlayer.locator('[data-webinar-play]');
    await expect(playButton).toContainText(/ver webinar/i);
    await playButton.click();
    const iframe = page.locator('iframe[data-youtube-embed]').first();
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('title', /\S+/);
    await expect(iframe).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}/);
    await expect(iframe).not.toHaveAttribute('src', /(?:\?|&)autoplay=1(?:&|$)/);

    const youtubeLink = firstPlayer.locator('..').getByRole('link', { name: /ver en YouTube/i });
    await expect(youtubeLink).toHaveAttribute('href', /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//);
    await expect(youtubeLink).toHaveAttribute('target', '_blank');
    await expect(youtubeLink).toHaveAttribute('rel', /noopener/);
  }

  expectRuntimeClean(runtime);
});
