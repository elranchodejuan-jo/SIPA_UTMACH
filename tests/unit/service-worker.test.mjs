import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

test('actualizar Expoferia renueva sus assets sin borrar cachés de otras aplicaciones', async () => {
  const source = await readFile(new URL('../../public/sw.js', import.meta.url), 'utf8');
  const handlers = new Map();
  const deleted = [];
  let currentCache;
  let installedAssets;
  runInNewContext(source, {
    URL,
    self: {
      location: { href: 'https://sipautmach.com/eventos/expoferia-nutricion-animal-2026/sw.js' },
      addEventListener: (type, handler) => handlers.set(type, handler),
      skipWaiting() {},
      clients: { claim() {} },
    },
    caches: {
      async open(name) {
        currentCache = name;
        return { async addAll(assets) { installedAssets = [...assets]; } };
      },
      async keys() {
        return [currentCache, 'sipa-expoferia-2026-v3', 'suite-vet-cache', 'other-app-cache'];
      },
      async delete(name) { deleted.push(name); return true; },
    },
  });
  let pending;
  const event = { waitUntil(promise) { pending = promise; } };
  handlers.get('install')(event);
  await pending;
  assert.notEqual(currentCache, 'sipa-expoferia-2026-v3', 'La nueva identidad requiere renovar la caché anterior.');
  assert.ok(installedAssets.includes('https://sipautmach.com/eventos/expoferia-nutricion-animal-2026/favicon.ico'));
  assert.ok(installedAssets.every(url => url.startsWith('https://sipautmach.com/eventos/expoferia-nutricion-animal-2026/')));
  handlers.get('activate')(event);
  await pending;
  assert.deepEqual(deleted, ['sipa-expoferia-2026-v3']);
});
