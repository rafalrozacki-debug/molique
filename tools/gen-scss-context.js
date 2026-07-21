/**
 * molique - generator zbiorczego kontekstu SCSS dla AI
 *
 * Skleja wszystkie zrodla z css/scss/ w jeden plik _AI_CONTEXT_scss.md.
 * Uruchomienie:  node tools/gen-scss-context.js
 *
 * Po co generator: plik jest pelnym zrzutem zrodel, wiec po KAZDYM podziale
 * pliku SCSS rozjezdza sie z rzeczywistoscia. Recznie utrzymywany zaczyna
 * klamac (zostaja sekcje po skasowanych plikach, brakuje nowych) - a to
 * wlasnie kontekst, z ktorego korzysta AI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const outFile = path.join(scssDir, '_AI_CONTEXT_scss.md');

/* Zbierz wszystkie .scss: najpierw podkatalogi (alfabetycznie), potem korzen. */
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
  '# Zbiorczy kontekst projektu dla AI',
  '',
  '**Folder glowny:** `scss`',
  '**Liczba plikow w paczce:** ' + files.length,
  '',
  '## Struktura plikow:',
  ...files.map((f) => '- `' + f + '`'),
  '',
];

for (const f of files) {
  const body = fs.readFileSync(path.join(scssDir, f), 'utf8').replace(/\s+$/, '');
  parts.push('## Plik: `' + f + '`', '', '```scss', body, '```', '');
}

fs.writeFileSync(outFile, parts.join('\n') + '\n');

console.log('_AI_CONTEXT_scss.md zregenerowany');
console.log('  plikow SCSS: ' + files.length);
console.log('  rozmiar: ' + (fs.statSync(outFile).size / 1024).toFixed(1) + ' KB');
