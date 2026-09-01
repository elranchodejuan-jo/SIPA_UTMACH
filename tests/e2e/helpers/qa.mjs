import { expect } from '@playwright/test';

export const MAIN_ROUTES = [
  { path: '/', label: 'Inicio' },
  { path: '/sipa/', label: 'SIPA' },
  { path: '/investigacion/', label: 'Investigación' },
  { path: '/divulgacion/', label: 'Divulgación' },
  { path: '/divulgacion/webinars/', label: 'Webinars' },
  { path: '/eventos/', label: 'Eventos' },
  { path: '/equipo/', label: 'Equipo' },
  { path: '/contacto/', label: 'Contacto' },
];

export const EXPO_ROUTE = '/eventos/expoferia-nutricion-animal-2026/';

export const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'landscape-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

export const watchRuntime = page => {
  const state = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    notFoundResponses: [],
  };

  page.on('console', message => {
    if (message.type() === 'error') state.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => state.pageErrors.push(error.message));
  page.on('requestfailed', request => {
    state.failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'sin detalle'}`);
  });
  page.on('response', response => {
    if (response.status() === 404) state.notFoundResponses.push(response.url());
  });

  return state;
};

export const expectRuntimeClean = state => {
  expect(state.consoleErrors, `Errores de consola:\n${state.consoleErrors.join('\n')}`).toEqual([]);
  expect(state.pageErrors, `Excepciones de página:\n${state.pageErrors.join('\n')}`).toEqual([]);
  expect(state.failedRequests, `Solicitudes fallidas:\n${state.failedRequests.join('\n')}`).toEqual([]);
  expect(state.notFoundResponses, `Recursos 404:\n${state.notFoundResponses.join('\n')}`).toEqual([]);
};

export const gotoPortal = async (page, path, state = watchRuntime(page)) => {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `La ruta ${path} no produjo respuesta`).not.toBeNull();
  expect(response?.status(), `Estado HTTP inesperado en ${path}`).toBeLessThan(400);
  await page.waitForLoadState('load');
  await expect(page.locator('main')).toBeVisible();
  return state;
};

export const openPrimaryNavigation = async page => {
  const toggle = page.locator('[data-menu-toggle]');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  return page.locator('nav[aria-label="Navegación principal"]');
};

export const expectNoHorizontalOverflow = async page => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.scrollWidth,
    `Overflow horizontal: scrollWidth=${dimensions.scrollWidth}, clientWidth=${dimensions.clientWidth}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
};

export const expectTouchTargets = async page => {
  const undersized = await page
    .locator('button:visible, a.button:visible, a.back-to-top:visible, .nav-link:visible, .submenu a:visible')
    .evaluateAll(elements => elements
    .map(element => {
      const rect = element.getBoundingClientRect();
      return {
        label: element.getAttribute('aria-label') || element.textContent?.trim() || '<sin etiqueta>',
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    })
    .filter(button => button.width < 44 || button.height < 44));

  expect(undersized, `Botones menores de 44 × 44 px: ${JSON.stringify(undersized)}`).toEqual([]);
};

export const expectImagesLoaded = async page => {
  const failures = await page.locator('img:visible').evaluateAll(images => images
    .filter(image => !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0)
    .map(image => image.currentSrc || image.getAttribute('src') || '<sin src>'));
  expect(failures, `Imágenes que no cargaron: ${failures.join(', ')}`).toEqual([]);
};
