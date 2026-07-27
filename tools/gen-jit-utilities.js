/**
 * molique - generator slownika klas narzedziowych dla molique-jit
 *
 * NIE liczy CSS z map Sass drugi raz. Czyta juz skompilowane chunki
 * `dist/chunks/molique-utilities.css` i `dist/chunks/molique-utilities-extended.css`
 * (produkuje je `tools/gen-chunks.js` przez prawdziwego Sassa) i rozbija je
 * na plaska mape klasa -> lista regul CSS. Dzieki temu jest dokladnie JEDNO
 * miejsce, ktore uruchamia Sass (gen-chunks.js) - ten skrypt tylko go
 * konsumuje, wiec matematyka odstepow/kolorow nie moze sie nigdy rozjechac
 * miedzy SCSS a silnikiem JIT.
 *
 * Uruchomienie:  node tools/gen-jit-utilities.js   (wymaga wczesniejszego
 *                node tools/gen-chunks.js - inaczej przerywa z komunikatem)
 * Wyjscie:       tools/jit/dist-data/utilities.json
 *
 * Zasada wlasciciela klasy przy selektorach zlozonych (np.
 * `[data-theme="dark"] .bg-glass` albo `.stacking-container-snap .section-stacked`):
 * OSTATNIA klasa w selektorze jest wlascicielem wpisu. To bezpieczne
 * uproszczenie - w najgorszym razie regula zlozona zostanie dolaczona bez
 * uzycia klasy-rodzica (nieszkodliwy, "martwy" fragment CSS, bo selektor
 * potomny i tak nie trafi w zaden element bez rodzica w DOM), nigdy odwrotnie
 * (nigdy nie zgubi reguly, ktora powinna byla zostac dolaczona).
 *
 * Reguly BEZ zadnej klasy w selektorze (np. @keyframes, @property,
 * ::view-transition-*) nie da sie przypisac do konkretnego zeskanowanego
 * tokenu - trafiaja do osobnej puli "alwaysInclude", ktora silnik JIT ma
 * dolaczac zawsze, niezaleznie od tego, co zostalo zeskanowane. To ten sam
 * wzorzec, co juz istniejacy tier "keyframes" w purgecss.safelist.cjs -
 * male, globalne fragmenty, tansze do zawsze-wlaczenia niz do sledzenia
 * ktora klasa ich uzywa.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunksDir = path.join(root, 'dist', 'chunks');
const outDir = path.join(root, 'tools', 'jit', 'dist-data');
const outFile = path.join(outDir, 'utilities.json');

const SOURCES = ['molique-utilities.css', 'molique-utilities-extended.css'];

/* ---------- 1. Wczytanie chunkow ---------- */

for (const name of SOURCES) {
  const p = path.join(chunksDir, name);
  if (!fs.existsSync(p)) {
    console.error(
      `\nBrak ${p}.\nUruchom najpierw:  node tools/gen-chunks.js\n` +
      'Ten generator NIE kompiluje SCSS sam - czyta wynik gen-chunks.js,' +
      ' zeby matematyka klas narzedziowych mialy jedno zrodlo prawdy.'
    );
    process.exit(1);
  }
}

/* ---------- 2. Generyczny walker blokow CSS ---------- */

// Znajduje pierwszy blok "@nazwa parametry{" (dopuszcza brak spacji miedzy
// tokenami - Sass --style=compressed nie wstawia bialych znakow) i zwraca
// jego zawartosc miedzy klamrami (bez nich).
function firstBlock(text, matchAtStart) {
  const m = matchAtStart.exec(text);
  if (!m) return null;
  const braceIdx = text.indexOf('{', m.index + m[0].length - 1);
  if (braceIdx === -1) throw new Error('Niedomknieta klamra po "' + m[0] + '"');
  let depth = 0;
  for (let i = braceIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) {
      return { params: m[1] ? m[1].trim() : '', body: text.slice(braceIdx + 1, i) };
    }
  }
  throw new Error('Niedomkniety blok "' + m[0] + '"');
}

// Dzieli TOP-LEVEL zawartosc bloku na kolejne instrukcje (reguly CSS albo
// zagniezdzone at-rules), respektujac glebokosc klamer.
function splitTopLevel(body) {
  const stmts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '{') {
      if (depth === 0) stmts.push({ head: body.slice(start, i).trim(), bodyStart: i + 1 });
      depth++;
    } else if (body[i] === '}') {
      depth--;
      if (depth === 0) stmts[stmts.length - 1].bodyEnd = i;
      start = i + 1;
    }
  }
  return stmts.map((s) => ({ head: s.head, body: body.slice(s.bodyStart, s.bodyEnd) }));
}

const OWNER_CLASS = /\.([A-Za-z_-][\w-]*)/g;

function ownerOf(selector) {
  let m;
  let last = null;
  OWNER_CLASS.lastIndex = 0;
  while ((m = OWNER_CLASS.exec(selector))) last = m[1];
  return last;
}

const wrapRaw = (raw, wrappers) =>
  wrappers.reduceRight((inner, head) => head + '{' + inner + '}', raw);

// classes: nazwa klasy -> tablica { selector, wrappers, css }
// alwaysInclude: fragmenty bez zadnej klasy - { raw } (juz w pelni opakowane
// we wszystkie warunkowe @media/@supports, gotowe do wklejenia verbatim)
function walkRules(body, wrappers, classes, alwaysInclude, unmatchedLog) {
  for (const stmt of splitTopLevel(body)) {
    if (stmt.head.startsWith('@media') || stmt.head.startsWith('@supports')) {
      walkRules(stmt.body, [...wrappers, stmt.head], classes, alwaysInclude, unmatchedLog);
      continue;
    }
    if (stmt.head.startsWith('@layer')) {
      // Zagniezdzony @layer utilities{...} (podwojne opakowanie z
      // gen-chunks.js + wlasny @layer w pliku zrodlowym) - przezroczysty,
      // ta sama efektywna warstwa, nie dolicza warunku.
      walkRules(stmt.body, wrappers, classes, alwaysInclude, unmatchedLog);
      continue;
    }
    if (stmt.head.startsWith('@keyframes') || stmt.head.startsWith('@property')) {
      // Opakowanie opaczne - NIE wchodzimy w srodek (selektory procentowe
      // "10%, 90%{...}" wewnatrz @keyframes nie sa klasami CSS).
      alwaysInclude.push({ raw: wrapRaw(stmt.head + '{' + stmt.body + '}', wrappers) });
      unmatchedLog.push(stmt.head + ' (alwaysInclude)');
      continue;
    }
    if (stmt.head.startsWith('@')) {
      alwaysInclude.push({ raw: wrapRaw(stmt.head + '{' + stmt.body + '}', wrappers) });
      unmatchedLog.push(stmt.head + ' (nierozpoznany at-rule, alwaysInclude)');
      continue;
    }
    for (const rawSelector of stmt.head.split(',')) {
      const selector = rawSelector.trim();
      if (!selector) continue;
      const owner = ownerOf(selector);
      if (!owner) {
        alwaysInclude.push({ raw: wrapRaw(selector + '{' + stmt.body + '}', wrappers) });
        unmatchedLog.push(selector + ' (brak klasy, alwaysInclude)');
        continue;
      }
      if (!classes[owner]) classes[owner] = [];
      classes[owner].push({ selector, wrappers, css: stmt.body.trim() });
    }
  }
}

/* ---------- 3. Przetworzenie obu chunkow ---------- */

const classes = {};
const alwaysInclude = [];
const unmatchedLog = [];

for (const name of SOURCES) {
  const text = fs.readFileSync(path.join(chunksDir, name), 'utf8');
  const layer = firstBlock(text, /@layer\s+utilities(?![\w-])/);
  if (!layer) {
    console.error(
      `\n${name}: nie znaleziono bloku "@layer utilities{...}".\n` +
      'Ksztalt skompilowanego CSS zmienil sie w sposob, ktorego ten generator ' +
      'nie rozumie - popraw parser zanim polegniesz na wyniku.'
    );
    process.exit(1);
  }
  walkRules(layer.body, [], classes, alwaysInclude, unmatchedLog);
}

// Deduplikacja identycznych wpisow klas (na wypadek, gdyby oba chunki
// wygenerowaly dokladnie ta sama regule dla tej samej klasy).
for (const cls of Object.keys(classes)) {
  const seen = new Set();
  classes[cls] = classes[cls].filter((entry) => {
    const key = entry.selector + '|' + entry.wrappers.join('>') + '|' + entry.css;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Deduplikacja alwaysInclude po tresci (np. gdyby oba chunki mialy ten sam
// @property - nie w tym przypadku, ale bezpiecznie na przyszlosc).
const dedupedAlways = [...new Map(alwaysInclude.map((e) => [e.raw, e])).values()];

/* ---------- 4. Zapis ---------- */

fs.mkdirSync(outDir, { recursive: true });

const classCount = Object.keys(classes).length;
const ruleCount = Object.values(classes).reduce((sum, arr) => sum + arr.length, 0);

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  note:
    'PLIK GENEROWANY AUTOMATYCZNIE - nie edytuj recznie. ' +
    'Zrodlo: tools/gen-jit-utilities.js, dane z dist/chunks/molique-utilities*.css. ' +
    'Regeneracja: node tools/gen-chunks.js && node tools/gen-jit-utilities.js',
  sources: SOURCES,
  classCount,
  ruleCount,
  alwaysIncludeCount: dedupedAlways.length,
  classes,
  alwaysInclude: dedupedAlways,
};

fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n');

console.log('Klas narzedziowych zindeksowanych: ' + classCount);
console.log('Regul CSS lacznie: ' + ruleCount);
console.log('Fragmentow bez klasy (alwaysInclude): ' + dedupedAlways.length);
if (unmatchedLog.length) {
  console.log('\nSzczegoly (co trafilo do alwaysInclude i dlaczego):');
  for (const s of [...new Set(unmatchedLog)]) console.log('  - ' + s);
}
console.log('\nZapisano: ' + path.relative(root, outFile));
