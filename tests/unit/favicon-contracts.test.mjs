import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const masterPath = path.join(rootDir, 'public', 'favicon', 'favicon-1024x1024.png');
const faviconDir = path.join(rootDir, 'portal', 'assets', 'favicon');
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const expectedPngs = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['favicon-48x48.png', 48],
  ['favicon-96x96.png', 96],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
];

const assertPng = (contents, size, label) => {
  assert.ok(contents.subarray(0, 8).equals(pngSignature), `${label} debe ser PNG`);
  assert.equal(contents.readUInt32BE(16), size, `${label} debe tener ancho ${size}`);
  assert.equal(contents.readUInt32BE(20), size, `${label} debe tener alto ${size}`);
  assert.equal(contents[25], 6, `${label} debe conservar RGBA`);
};

test('la familia favicon HD conserva la fuente maestra SIPA y sus tamaños públicos', async () => {
  const master = await readFile(masterPath);
  assert.equal(createHash('sha256').update(master).digest('hex').toUpperCase(), 'E4EDF50DEFE58950442C79FD89609E092BA38FEBCC42A8D2B62DDA45193B2120');
  assertPng(master, 1024, 'fuente maestra');

  for (const [name, size] of expectedPngs) {
    assertPng(await readFile(path.join(faviconDir, name)), size, name);
  }
});

test('favicon.ico incluye PNGs de 16, 32 y 48 px a 32 bits', async () => {
  const ico = await readFile(path.join(faviconDir, 'favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0, 'favicon.ico debe tener reserved=0');
  assert.equal(ico.readUInt16LE(2), 1, 'favicon.ico debe ser de tipo icono');
  const count = ico.readUInt16LE(4);
  assert.equal(count, 3, 'favicon.ico debe contener exactamente 16, 32 y 48 px');
  const entries = Array.from({ length: count }, (_, index) => {
    const offset = 6 + (index * 16);
    const size = ico[offset] || 256;
    const payloadSize = ico.readUInt32LE(offset + 8);
    const payloadOffset = ico.readUInt32LE(offset + 12);
    return {
      size,
      planes: ico.readUInt16LE(offset + 4),
      bits: ico.readUInt16LE(offset + 6),
      payload: ico.subarray(payloadOffset, payloadOffset + payloadSize),
    };
  });
  assert.deepEqual(entries.map(entry => entry.size), [16, 32, 48]);
  for (const entry of entries) {
    assert.equal(entry.planes, 1);
    assert.equal(entry.bits, 32);
    assert.ok(entry.payload.subarray(0, 8).equals(pngSignature), `entrada ${entry.size} debe contener PNG`);
  }
});
