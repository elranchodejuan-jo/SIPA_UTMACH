import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { renderIcon } from '../../portal/templates/partials/icons.mjs';

const root = new URL('../../', import.meta.url);
const iconDir = new URL('portal/assets/icons/', root);
const helpers = { assetHref: value => `/${value}` };

test('el sprite Lucide se reproduce sin red y verifica la integridad de sus fuentes oficiales', () => {
  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/generate-icons.mjs', root)), '--check'], {
    cwd: fileURLToPath(root),
    stdio: 'pipe',
  });
});

test('todos los iconos del portal tienen un símbolo local único y licencia conservada', async () => {
  const [sprite, manifestText, license] = await Promise.all([
    readFile(new URL('sipa-icons.svg', iconDir), 'utf8'),
    readFile(new URL('manifest.json', iconDir), 'utf8'),
    readFile(new URL('LUCIDE-LICENSE.txt', iconDir), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestText);
  const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'No deben existir IDs duplicados en el sprite.');
  assert.deepEqual(new Set(ids), new Set([...Object.keys(manifest.icons), ...manifest.local]));
  assert.match(license, /ISC License/);
  assert.match(license, /MIT License/);
  assert.match(manifest.commit, /^[a-f\d]{40}$/);
  for (const id of ['bovine', 'swine', 'poultry', 'instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp']) {
    assert.ok(manifest.local.includes(id), `${id} conserva su identidad, sin atribuirse a Lucide.`);
    assert.equal(manifest.icons[id], undefined);
  }
});

test('los iconos decorativos no agregan ruido al lector de pantalla y conservan geometría sin CSS', () => {
  const icon = renderIcon('arrow-right', helpers);
  assert.match(icon, /aria-hidden="true"/);
  assert.match(icon, /focusable="false"/);
  assert.match(icon, /width="24" height="24" viewBox="0 0 24 24"/);
  assert.match(icon, /fill="none" stroke="currentColor" stroke-width="2"/);
  assert.match(icon, /href="\/assets\/icons\/sipa-icons\.svg#arrow-right"/);
  assert.doesNotMatch(icon, /<title>|role="img"/);
});

test('los iconos con significado tienen un nombre accesible y escapan los atributos', () => {
  const icon = renderIcon('mail', helpers, { className: 'card__icon', label: 'Correo <SIPA> & contacto' });
  assert.match(icon, /class="card__icon"/);
  assert.match(icon, /role="img"/);
  assert.match(icon, /aria-label="Correo &lt;SIPA&gt; &amp; contacto"/);
  assert.match(icon, /<title>Correo &lt;SIPA&gt; &amp; contacto<\/title>/);
  assert.doesNotMatch(icon, /aria-hidden="true"/);
});
