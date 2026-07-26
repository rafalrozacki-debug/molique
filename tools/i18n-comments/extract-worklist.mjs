// molique - generuje worklist unikalnych tresci komentarzy do przetlumaczenia.
//
// Skanuje css/scss/**/*.scss, css/*.css (pelne, nie .min.css) oraz js/**/*.js,
// wyciaga akapity tresci (patrz comments-lib.mjs) i grupuje je wg unikalnego,
// znormalizowanego tekstu. Wyjscie: JSON { text -> { count, files: [...] } },
// posortowany wg pliku/kolejnosci wystapienia - do recznego/agentowego
// tlumaczenia na dict.en.json / dict.de.json.
//
// Uzycie: node tools/i18n-comments/extract-worklist.mjs [--filter=<substr>]

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractBlocks, blockParagraphs, normalizeKey } from './comments-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(name))) out.push(p);
  }
  return out;
}

const targets = [
  ...walk(resolve(root, 'css/scss'), ['.scss']),
  ...walk(resolve(root, 'js'), ['.js']),
  ...readdirSync(resolve(root, 'css'))
    .filter((f) => f.endsWith('.css') && !f.endsWith('.min.css'))
    .map((f) => resolve(root, 'css', f)),
];

const filterArg = process.argv.find((a) => a.startsWith('--filter='));
const filter = filterArg ? filterArg.slice('--filter='.length) : null;

const worklist = new Map();

for (const file of targets) {
  if (filter && !file.includes(filter)) continue;
  const rel = relative(root, file).replace(/\\/g, '/');
  const ext = extname(file).slice(1);
  const content = readFileSync(file, 'utf8');
  const { blocks } = extractBlocks(content, ext);
  for (const block of blocks) {
    for (const { text } of blockParagraphs(block)) {
      if (!text) continue;
      const key = normalizeKey(text);
      if (!key || key.length < 2) continue;
      if (!worklist.has(key)) worklist.set(key, { count: 0, files: [] });
      const entry = worklist.get(key);
      entry.count++;
      if (entry.files.length < 3 && !entry.files.includes(rel)) entry.files.push(rel);
    }
  }
}

const sorted = Object.fromEntries(
  [...worklist.entries()].sort((a, b) => b[1].count - a[1].count)
);

const outPath = resolve(__dirname, 'worklist.json');
writeFileSync(outPath, JSON.stringify(sorted, null, 2), 'utf8');

console.log(`Przeskanowano ${targets.length} plikow.`);
console.log(`Unikalnych fraz do przetlumaczenia: ${Object.keys(sorted).length}`);
console.log(`Zapisano: ${relative(root, outPath)}`);
