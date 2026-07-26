// molique - scala batch-N-en.json/batch-N-de.json (wyniki rownoleglych
// agentow tlumaczacych) w finalne dict.en.json/dict.de.json, waliduje
// pokrycie wzgledem worklist.json (wszystkie unikalne frazy musza miec
// tlumaczenie w obu jezykach - w przeciwnym razie build cicho zostawi
// polski oryginal, co ma byc WYJATKIEM, nie regula).
//
// Uzycie: node tools/i18n-comments/merge-batches.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const batchesDir = resolve(__dirname, 'batches');
const N = 6;

function loadDict(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
}

for (const lang of ['en', 'de']) {
  const dictPath = resolve(__dirname, `dict.${lang}.json`);
  const merged = loadDict(dictPath);
  const before = Object.keys(merged).length;

  for (let i = 1; i <= N; i++) {
    const batchPath = resolve(batchesDir, `batch-${i}-${lang}.json`);
    if (!existsSync(batchPath)) {
      console.warn(`[${lang}] BRAK PLIKU: batch-${i}-${lang}.json (agent ${i} jeszcze nie skonczyl?)`);
      continue;
    }
    const batch = JSON.parse(readFileSync(batchPath, 'utf8'));
    let added = 0;
    let overwritten = 0;
    for (const [key, value] of Object.entries(batch)) {
      if (key in merged && merged[key] !== value) overwritten++;
      else if (!(key in merged)) added++;
      merged[key] = value;
    }
    console.log(`[${lang}] batch-${i}: +${added} nowych${overwritten ? `, ${overwritten} nadpisanych` : ''}`);
  }

  writeFileSync(dictPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`[${lang}] dict.${lang}.json: ${before} -> ${Object.keys(merged).length} wpisow\n`);
}

// Walidacja pokrycia wzgledem pelnej worklisty
const worklist = JSON.parse(readFileSync(resolve(__dirname, 'worklist.json'), 'utf8'));
const allKeys = Object.keys(worklist);
for (const lang of ['en', 'de']) {
  const dict = loadDict(resolve(__dirname, `dict.${lang}.json`));
  const missing = allKeys.filter((k) => !(k in dict));
  console.log(`[${lang}] Pokrycie: ${allKeys.length - missing.length}/${allKeys.length} unikalnych fraz.`);
  if (missing.length) {
    console.log(`[${lang}] BRAKUJE ${missing.length}:`);
    missing.slice(0, 20).forEach((k) => console.log(`  - ${JSON.stringify(k.slice(0, 80))}`));
    if (missing.length > 20) console.log(`  ... i ${missing.length - 20} wiecej`);
  }
}
