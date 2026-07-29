/**
 * molique - combined SCSS context generator for AI
 *
 * Concatenates every source file under css/scss/ into one _AI_CONTEXT_scss.md.
 * Run with:  node tools/gen-scss-context.js
 *
 * Why this exists: the file is a full dump of the sources, so it drifts out
 * of sync after EVERY SCSS file split. A hand-maintained version starts
 * lying (stale sections for deleted files, missing new ones) - and that's
 * exactly the context an AI relies on.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const outFile = path.join(scssDir, '_AI_CONTEXT_scss.md');

/* Collect every .scss file: subdirectories first (alphabetically), then root. */
function collect(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.scss'))
    .map((e) => e.name)
    .sort();

  let out = [];
  for (const d of dirs) out = out.concat(collect(path.join(dir, d), prefix + d + '/'));
  for (const f of files) out.push(prefix + f);
  return out;
}

const subdirs = fs
  .readdirSync(scssDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

let files = [];
for (const d of subdirs) files = files.concat(collect(path.join(scssDir, d), d + '/'));
files = files.concat(
  fs
    .readdirSync(scssDir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.scss'))
    .map((e) => e.name)
    .sort()
);

const parts = [
  '# Combined project context for AI',
  '',
  '**Root folder:** `scss`',
  '**Files in this bundle:** ' + files.length,
  '',
  '## File structure:',
  ...files.map((f) => '- `' + f + '`'),
  '',
];

for (const f of files) {
  const body = fs.readFileSync(path.join(scssDir, f), 'utf8').replace(/\s+$/, '');
  parts.push('## File: `' + f + '`', '', '```scss', body, '```', '');
}

fs.writeFileSync(outFile, parts.join('\n') + '\n');

console.log('_AI_CONTEXT_scss.md regenerated');
console.log('  SCSS files: ' + files.length);
console.log('  size: ' + (fs.statSync(outFile).size / 1024).toFixed(1) + ' KB');
