/**
 * molique - przygotowanie danych dla pakietu molique-jit
 *
 * Kopiuje juz wygenerowane artefakty (utilities.json z gen-jit-utilities.js,
 * class-index.json + skompilowane chunki komponentow z gen-chunks.js,
 * podstawowa safelist z purgecss.safelist.cjs) do tools/jit/package/data/ -
 * jedynego miejsca, ktore silnik pakietu naprawde czyta w czasie dzialania.
 * Zero logiki tutaj - to czysto kopiowanie, zeby pakiet mogl byc
 * opublikowany i uzywany bez dostepu do tego monorepo/Sassa.
 *
 * Uruchomienie:  node tools/gen-jit-package-data.js   (wymaga wczesniejszego
 *                node tools/gen-chunks.js && node tools/gen-jit-utilities.js)
 * Wyjscie:       tools/jit/package/data/**
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunksDir = path.join(root, 'dist', 'chunks');
const utilitiesSrc = path.join(root, 'tools', 'jit', 'dist-data', 'utilities.json');
const classIndexSrc = path.join(chunksDir, 'class-index.json');
const dataDir = path.join(root, 'tools', 'jit', 'package', 'data');
const componentsOut = path.join(dataDir, 'components');

function requireFile(p, hint) {
  if (!fs.existsSync(p)) {
    console.error(`\nBrak ${p}.\n${hint}\n`);
    process.exit(1);
  }
}

requireFile(utilitiesSrc, 'Uruchom najpierw:  node tools/gen-jit-utilities.js');
requireFile(classIndexSrc, 'Uruchom najpierw:  node tools/gen-chunks.js');

fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(componentsOut, { recursive: true });

/* ---------- 1. utilities.json + class-index.json (kopia 1:1) ---------- */

fs.copyFileSync(utilitiesSrc, path.join(dataDir, 'utilities.json'));
fs.copyFileSync(classIndexSrc, path.join(dataDir, 'class-index.json'));

/* ---------- 2. Chunki komponentow uzyte w class-index.json ---------- */

const classIndex = JSON.parse(fs.readFileSync(classIndexSrc, 'utf8'));
const componentIds = new Set(Object.values(classIndex.classes));

let copiedComponents = 0;
for (const id of componentIds) {
  const from = path.join(chunksDir, `molique-${id}.css`);
  requireFile(from, `Brak skompilowanego chunka dla komponentu "${id}" - uruchom node tools/gen-chunks.js.`);
  fs.copyFileSync(from, path.join(componentsOut, `molique-${id}.css`));
  copiedComponents++;
}

/* ---------- 3. Zmienne motywu (:root + dark mode) - zawsze potrzebne ---------- */

const rootChunk = path.join(chunksDir, 'molique-root.css');
requireFile(rootChunk, 'Brak dist/chunks/molique-root.css - uruchom node tools/gen-chunks.js.');
fs.copyFileSync(rootChunk, path.join(dataDir, 'molique-root.css'));

/* ---------- 4. Bazowa safelist - z purgecss.safelist.cjs, nie ręcznie ---------- */
// Tylko tier "runtime.standard" (klasy tworzone/przelaczane przez WLASNY JS
// molique - toasty, lightbox, karuzela, sidebar itd.) - to samo, co
// purgecss.safelist.cjs oznacza jako "obowiazkowe". Tier "families" w tamtym
// pliku dotyczy dynamicznych klas SKLADANYCH PRZEZ BACKEND KONSUMENTA
// (np. `badge-<?= $status ?>`) - specyficzne dla kazdego projektu, wiec nie
// wchodzi tutaj jako domyslne; konsument dopisuje wlasne w molique.config.mjs
// (Faza 5).
const require = createRequire(import.meta.url);
const safelistSrc = require(path.join(root, 'purgecss.safelist.cjs'));
fs.writeFileSync(
  path.join(dataDir, 'safelist.json'),
  JSON.stringify(
    {
      note:
        'PLIK GENEROWANY AUTOMATYCZNIE - nie edytuj recznie. ' +
        'Zrodlo: tools/gen-jit-package-data.js, dane z purgecss.safelist.cjs (tier runtime.standard).',
      standard: safelistSrc.runtime.standard,
    },
    null,
    2
  ) + '\n'
);

console.log('Skopiowano komponentow: ' + copiedComponents);
console.log('Skopiowano: utilities.json, class-index.json, molique-root.css, safelist.json');
console.log('Zapisano do: ' + path.relative(root, dataDir));
