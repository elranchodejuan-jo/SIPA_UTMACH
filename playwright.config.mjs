import { defineConfig } from '@playwright/test';

const baseURL = process.env.SIPA_BASE_URL || 'http://127.0.0.1:4173';
const workers = process.env.CI ? 2 : process.platform === 'win32' ? 1 : 2;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tmp/playwright-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers,
  timeout: 45_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: './tmp/playwright-report', open: 'never' }],
  ],
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL,
    locale: 'es-EC',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: process.env.SIPA_BASE_URL
    ? undefined
    : {
        command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'desktop-1366',
      use: {
        browserName: 'chromium',
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'mobile-360',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 800 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
