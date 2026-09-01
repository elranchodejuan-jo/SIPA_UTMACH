import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourceRoots = ['portal', 'scripts', 'tests'];
const rootFiles = ['playwright.config.mjs'];
const extensions = new Set(['.js', '.mjs', '.cjs']);

const collectJavaScript = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectJavaScript(absolutePath));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
};

const files = [];
for (const sourceRoot of sourceRoots) {
  files.push(...await collectJavaScript(path.join(root, sourceRoot)));
}
files.push(...rootFiles.map(file => path.join(root, file)));
files.sort((left, right) => left.localeCompare(right, 'en'));

const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    failures.push({
      file: path.relative(root, file),
      output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
    });
  }
}

if (failures.length > 0) {
  console.error(`Falló la sintaxis JavaScript en ${failures.length} archivo(s):`);
  for (const failure of failures) {
    console.error(`\n- ${failure.file}\n${failure.output}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Sintaxis JavaScript válida: ${files.length} archivo(s).`);
}
