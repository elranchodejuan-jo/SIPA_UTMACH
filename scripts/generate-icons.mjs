import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const iconDir = new URL('../portal/assets/icons/', import.meta.url);
// Git on Windows may check text out with CRLF; upstream hashes use LF.
const readText = async url => (await readFile(url, 'utf8')).replace(/\r\n/g, '\n');
const manifest = JSON.parse(await readText(new URL('manifest.json', iconDir)));
const symbols = [];

// Offline generation: upstream files and their hashes are retained in the repository.
for (const [id, source] of Object.entries(manifest.icons)) {
  const svg = await readText(new URL(`lucide/${source.name}.svg`, iconDir));
  const hash = createHash('sha256').update(svg).digest('hex');
  if (hash !== source.sha256) throw new Error(`La fuente Lucide ${source.name} no coincide con su SHA-256.`);
  const content = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1].trim();
  if (!content || !svg.includes('viewBox="0 0 24 24"')) {
    throw new Error(`La fuente Lucide ${source.name} no es un SVG de 24 × 24 válido.`);
  }
  symbols.push(`  <symbol id="${id}" viewBox="0 0 24 24" data-lucide="${source.name}">\n${content.split('\n').map(line => `    ${line.trim()}`).join('\n')}\n  </symbol>`);
}

const local = await readText(new URL('sipa-local.svg', iconDir));
for (const id of manifest.local) {
  const symbol = local.match(new RegExp(`  <symbol id="${id}"[^>]*>[\\s\\S]*?<\\/symbol>`))?.[0];
  if (!symbol) throw new Error(`Falta el símbolo local ${id}.`);
  symbols.push(symbol);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg">\n  <!-- UI: Lucide ${manifest.commit}; ISC / Feather MIT; see LUCIDE-LICENSE.txt. -->\n  <!-- Species and social marks: existing SIPA artwork, not Lucide. -->\n${symbols.join('\n')}\n</svg>\n`;
const output = new URL('sipa-icons.svg', iconDir);
if (process.argv.includes('--check')) {
  if (await readText(output) !== sprite) {
    throw new Error('El sprite no coincide con sus fuentes. Ejecuta node scripts/generate-icons.mjs.');
  }
  console.log(`Sprite verificado: ${symbols.length} símbolos locales y fuentes Lucide íntegras.`);
} else {
  await writeFile(output, sprite);
  console.log(`Sprite generado: ${fileURLToPath(output)} (${symbols.length} símbolos).`);
}
