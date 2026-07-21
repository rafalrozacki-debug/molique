/**
 * molique - generator safelisty dla PurgeCSS
 *
 * Skanuje zrodla (css/*.css + js/**\/*.js) i wypisuje purgecss.safelist.cjs.
 * Uruchomienie:  node tools/gen-safelist.js
 *
 * Po co generator, a nie recznie utrzymywana lista: klasy dodawane przez JS
 * molique sa niewidoczne w HTML, wiec PurgeCSS by je wyciely. Lista pisana
 * recznie rozjechalaby sie przy pierwszym nowym module - ta odtwarza sie
 * z kodu.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- 1. Uniwersum: klasy i keyframes z wszystkich bundli CSS ---------- */

const cssFiles = fs.readdirSync(path.join(root, 'css')).filter((f) => f.endsWith('.css'));
const cssText = cssFiles.map((f) => fs.readFileSync(path.join(root, 'css', f), 'utf8')).join('\n');

const cssClasses = new Set();
for (const m of cssText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) cssClasses.add(m[1]);

const keyframesDefined = [...new Set([...cssText.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))];

/* ---------- 2. Zrodla JS ---------- */

function walkJs(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkJs(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const jsText = walkJs(path.join(root, 'js')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

/* ---------- 3. Klasy, ktorych PurgeCSS nie zobaczy w HTML ---------- */

const found = new Set();
const addIfReal = (name) => {
  if (name && cssClasses.has(name)) found.add(name);
};

// a) przelaczane: classList.add/remove/toggle('x')
for (const m of jsText.matchAll(/classList\.(?:add|remove|toggle)\(\s*['"]([\w-]+)['"]/g)) addIfReal(m[1]);

// b) przypisywane: className = 'a b c'
for (const m of jsText.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g)) m[1].split(/\s+/).forEach(addIfReal);

// c) markup budowany w JS: class="a b c"
for (const m of jsText.matchAll(/class=["']([^"']+)["']/g)) m[1].split(/\s+/).forEach(addIfReal);

// d) literaly w mapach/stalych (np. TOAST_TYPE) - tylko nazwy z mysnikiem,
//    zeby nie lapac zwyklych slow ('input', 'js') uzywanych w innym kontekscie.
for (const m of jsText.matchAll(/['"]([a-zA-Z][\w]*-[\w-]+)['"]/g)) addIfReal(m[1]);

// e) keyframes uzywane WYLACZNIE z JS (zadna regula CSS ich nie wola)
const keyframesOnlyJs = keyframesDefined.filter(
  (k) => jsText.includes(k) && !new RegExp(`animation[^;}]*\\b${k}\\b`).test(cssText)
);

// Klasy stanu (.is-*) pokrywamy patternem, wiec nie duplikujemy ich literalnie.
const standard = [...found].filter((c) => !c.startsWith('is-')).sort();
const isStateCount = [...cssClasses].filter((c) => c.startsWith('is-')).length;

/* ---------- 4. Zapis pliku ---------- */

const stamp = new Date().toISOString().slice(0, 10);
const list = (arr) => arr.map((v) => `    '${v}',`).join('\n');

const out = `/**
 * molique - safelista dla PurgeCSS
 *
 * PLIK GENEROWANY AUTOMATYCZNIE - nie edytuj recznie.
 * Zrodlo: tools/gen-safelist.js   |   Regeneracja: node tools/gen-safelist.js
 * Wygenerowano: ${stamp}
 *
 * PO CO TO: czesc klas molique nie wystepuje w HTML - dodaje je JS w czasie
 * dzialania strony (stany, markup karuzeli/lightboxa/toastow). PurgeCSS ich
 * nie widzi i by je wyciely, psujac komponenty.
 *
 * UZYCIE (purgecss.config.js albo postcss.config.js):
 *
 *   const molique = require('./purgecss.safelist.cjs');
 *
 *   safelist: molique.runtime        // MINIMUM - bez tego molique sie psuje
 *   safelist: molique.all            // runtime + wszystkie rodziny utilities
 *   safelist: molique.merge('colors', 'grid')   // runtime + wybrane rodziny
 */

/* =========================================================================
   TIER 1 - RUNTIME (obowiazkowe)
   Klasy tworzone/przelaczane przez JS molique. Pominiecie = zepsute komponenty.
   ========================================================================= */

const runtime = {
  standard: [
${list(standard)}
  ],
  // Konwencja stanow molique. Pattern zamiast listy literalow, bo chroni takze
  // klasy przelaczane z WLASNEGO kodu uzytkownika (np. .step.is-completed).
  // Pokrywa ${isStateCount} klas .is-* w CSS.
  greedy: [/^is-/],
  // Animacja odpalana ze stylu inline w JS - zadna regula CSS jej nie wola,
  // wiec opcja keyframes:true by ja usunela.
  keyframes: [
${list(keyframesOnlyJs)}
  ],
};

/* =========================================================================
   TIER 2 - RODZINY UTILITIES (opcjonalne, wybierz swoje)
   Molique NIE wie, czy Twoj backend sklada nazwy klas dynamicznie - np.
   class="opacity-<?= $x ?>" albo status z pola w bazie. Takich klas nie ma
   w zadnym pliku, wiec PurgeCSS je wytnie. Wlacz TYLKO te grupy, ktore
   faktycznie generujesz dynamicznie - kazda wlaczona grupa to mniejszy zysk.
   ========================================================================= */

const families = {
  // .bg-*, .text-*, .border-* - kolory/rozmiary sterowane z CMS
  colors: [/^bg-/, /^text-/, /^border-/],
  // .col-span-*, .col-md-span-*, .offset-*, .grid-cols-* - layout z pola CMS
  grid: [/^col-/, /^offset-/, /^grid-cols-/],
  // marginesy/paddingi/gapy skladane w petli
  spacing: [/^m[trblxy]?-/, /^p[trblxy]?-/, /^gap-/],
  // statusy z enuma w bazie: .badge-*, .status-*, .stock-bar-*, .opacity-*
  status: [/^badge-/, /^status-/, /^stock-bar-/, /^overlay-/, /^opacity-/],
};

/* ---------- Skladanie ---------- */

function merge(...groups) {
  const greedy = [...runtime.greedy];
  for (const g of groups) {
    if (!families[g]) throw new Error('Nieznana grupa safelisty: ' + g);
    greedy.push(...families[g]);
  }
  return { standard: runtime.standard, greedy, keyframes: runtime.keyframes };
}

const all = merge(...Object.keys(families));

module.exports = { runtime, families, merge, all };
`;

fs.writeFileSync(path.join(root, 'purgecss.safelist.cjs'), out);

console.log('purgecss.safelist.cjs zapisany');
console.log('  Tier 1 standard : ' + standard.length + ' klas');
console.log('  Tier 1 greedy   : /^is-/ (pokrywa ' + isStateCount + ' klas)');
console.log('  Tier 1 keyframes: ' + (keyframesOnlyJs.join(', ') || '(brak)'));
console.log('  Tier 2 grup     : 4 (colors, grid, spacing, status)');
