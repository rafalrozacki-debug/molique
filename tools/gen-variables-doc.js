/**
 * molique - generator tabel zmiennych CSS dla docs-variables.html
 *
 * Czyta SCSS jako ZRODLO PRAWDY (wartosci light + dark, pliki, uzycia),
 * doklada opisy z tools/variables-doc.data.js i sklada gotowy fragment HTML.
 *
 * Uruchomienie:  node tools/gen-variables-doc.js
 * Wyjscie:       src/partials/variables-global.html
 *                src/partials/variables-component.html
 *                src/partials/variables-input.html
 * Trzy pliki, a nie jeden, zeby na stronie dalo sie wstawic proze MIEDZY
 * tabele - kazda z trzech kategorii wymaga innego wprowadzenia.
 *
 * Trzy kategorie zmiennych - rozroznienie jest tu istotne, bo kazda ma inny
 * kontrakt z uzytkownikiem:
 *   GLOBAL    - zadeklarowane w :root (_root.scss). Motyw. Nadpisujesz globalnie.
 *   COMPONENT - zadeklarowane w pliku komponentu (lub przez @property).
 *   INPUT     - NIGDY nie zadeklarowane, tylko czytane. Czyste wejscie z markupu.
 *
 * Generator PRZERYWA prace przy rozjezdzie miedzy SCSS a opisami - to jedyne
 * zabezpieczenie przed dokumentacja, ktora klamie.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUPS, GLOBAL, COMPONENT, INPUT } from './variables-doc.data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const partialsDir = path.join(root, 'src', 'partials');

/* ---------- 1. Wczytanie zrodel ---------- */

function scssFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return scssFiles(p);
    return e.isFile() && e.name.endsWith('.scss') ? [p] : [];
  });
}

const files = scssFiles(scssDir).map((p) => ({
  // Nazwa modulu widoczna w kolumnie "Uzywana w": components/_tables.scss -> tables
  name: path.relative(scssDir, p).replace(/\\/g, '/').replace(/(^|\/)_/, '$1').replace(/\.scss$/, ''),
  path: p,
  text: fs.readFileSync(p, 'utf8'),
}));

const rootFile = files.find((f) => f.name === 'root');
if (!rootFile) throw new Error('Nie znaleziono css/scss/_root.scss');

/* ---------- 2. Parsowanie bloku (:root / [data-theme="dark"]) ---------- */

// Deklaracja: poczatek linii, nazwa, wartosc do sredkina, opcjonalny komentarz.
const DECL = /^[ \t]*(--[\w-]+)[ \t]*:[ \t]*([^;]+);/;

function blockOf(text, selector) {
  const start = text.indexOf(selector + ' {');
  if (start === -1) throw new Error('Nie znaleziono bloku ' + selector + ' w _root.scss');
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i);
  }
  throw new Error('Niedomkniety blok ' + selector);
}

function declsOf(block) {
  const out = new Map();
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(DECL);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

const light = declsOf(blockOf(rootFile.text, ':root'));
const dark = declsOf(blockOf(rootFile.text, '[data-theme="dark"]'));

/* ---------- 3. Zmienne komponentow ---------- */

// Deklaracja w pliku komponentu. Liczy sie PIERWSZE wystapienie - kolejne to
// zwykle nadpisania w wariantach (.table-sm itd.), a nie wartosc domyslna.
const component = new Map(); // nazwa -> { value, file }

for (const f of files) {
  if (f.name === 'root') continue;
  for (const line of f.text.split(/\r?\n/)) {
    const m = line.match(DECL);
    if (m && !light.has(m[1]) && !component.has(m[1])) {
      component.set(m[1], { value: m[2].trim(), file: f.name });
    }
  }
  // @property rejestruje zmienna, zeby dalo sie ja animowac. Wartosc domyslna
  // siedzi w initial-value, a nie w zwyklej deklaracji.
  for (const m of f.text.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
    if (light.has(m[1]) || component.has(m[1])) continue;
    const init = m[2].match(/initial-value\s*:\s*([^;]+)/);
    component.set(m[1], { value: init ? init[1].trim() : '-', file: f.name });
  }
}

/* ---------- 4. Czyste wejscia (uzywane, nigdy deklarowane) ---------- */

const fallbacks = new Map(); // nazwa -> wartosc zapasowa z var(--x, FALLBACK)
const usedIn = new Map();    // nazwa -> Set(modul)

for (const f of files) {
  if (f.name.startsWith('molique-style')) continue; // pliki kompilacyjne, nie zrodla regul
  for (const m of f.text.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
    if (!usedIn.has(m[1])) usedIn.set(m[1], new Set());
    usedIn.get(m[1]).add(f.name);
  }
  // Wartosc zapasowa: var(--x, ...) - bierzemy tekst do domykajacego nawiasu.
  for (const m of f.text.matchAll(/var\(\s*(--[\w-]+)\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
    if (!fallbacks.has(m[1])) fallbacks.set(m[1], m[2].trim());
  }
}

const input = new Map();
for (const [name, mods] of usedIn) {
  if (light.has(name) || component.has(name)) continue;
  input.set(name, { fallback: fallbacks.get(name) || null, files: mods });
}

/* ---------- 5. Kontrola rozjazdu SCSS <-> opisy ---------- */

const problems = [];
const check = (found, described, label) => {
  for (const n of found) if (!described[n]) problems.push(`${label}: ${n} jest w SCSS, ale nie ma opisu w variables-doc.data.js`);
  for (const n of Object.keys(described)) if (!found.has(n)) problems.push(`${label}: ${n} ma opis, ale nie ma go juz w SCSS (martwy wpis)`);
};

check(new Set(light.keys()), GLOBAL, 'GLOBAL');
check(new Set(component.keys()), COMPONENT, 'COMPONENT');
check(new Set(input.keys()), INPUT, 'INPUT');

for (const [name, [group]] of Object.entries(GLOBAL).map(([k, v]) => [k, v])) {
  if (!GROUPS.some((g) => g.id === group)) problems.push(`GLOBAL: ${name} wskazuje na nieistniejaca grupe "${group}"`);
}

// Liczby w PROZIE strony (naglowki sekcji, opis meta, zdanie o dark mode)
// pochodza z {{ __globalVarsCount }} itd. (locals wstrzykiwane przez
// vite.config.js), nie z recznie wpisanego tekstu. Ten generator jest
// jedynym zrodlem tych liczb - zapisuje je do variables-counts.json ponizej.

// EDYTOR MOTYWU a pary --x / --x-rgb.
// Kontrolka koloru, ktorej odpowiada zmienna -rgb w :root, MUSI wyliczac te
// pare przez data-te-rgb. Inaczej uzytkownik zmienia kolor, a przezroczystosci
// zostaja w starym - dokladnie pulapka nr 2 z docs-variables. Tak wlasnie
// rozjechal sie --bg-surface, gdy dosla --bg-surface-rgb.
const editorPath = path.join(root, 'src', 'theme-editor.html');
if (fs.existsSync(editorPath)) {
  const editor = fs.readFileSync(editorPath, 'utf8');
  for (const m of editor.matchAll(/<input[^>]*data-te-var="(--[\w-]+)"[^>]*>/g)) {
    const [tag, name] = m;
    if (!tag.includes('data-te-type="color"')) continue;
    // Nazwa pary bywa skrocona: --bg-body -> --body-rgb, --sidebar-bg -> --sidebar-rgb.
    const candidates = [
      name + '-rgb',
      name.replace(/^--bg-/, '--') + '-rgb',
      name.replace(/-bg$/, '') + '-rgb',
    ];
    const pair = candidates.find((c) => light.has(c));
    if (pair && !tag.includes(`data-te-rgb="${pair}"`)) {
      problems.push(
        `theme-editor.html: kontrolka ${name} nie wylicza pary ${pair} ` +
        `(brak data-te-rgb) - przezroczystosci zostana w starym kolorze`
      );
    }
  }
}

if (problems.length) {
  console.error('\nGenerator zmiennych PRZERWANY - dokumentacja rozjechala sie ze zrodlem:\n');
  for (const p of problems) console.error('  - ' + p);
  console.error('\nUzupelnij tools/variables-doc.data.js i uruchom ponownie.\n');
  process.exit(1);
}

/* ---------- 6. Render ---------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Opisy w data.js celowo zawieraja <code> i <strong> - przepuszczamy je bez zmian.
const val = (v) => `<code>${esc(v)}</code>`;

// Kolumna "Uzywana w": trzy moduly + licznik reszty. Pelna lista bywa 20-elementowa
// i rozpycha tabele bardziej, niz pomaga.
function usage(name) {
  const mods = [...(usedIn.get(name) || [])].filter((m) => m !== 'root').sort();
  if (!mods.length) return '<span class="text-muted">-</span>';
  const shown = mods.slice(0, 3).map((m) => `<code>${esc(m)}</code>`).join(' ');
  return shown + (mods.length > 3 ? ` <span class="text-muted">+${mods.length - 3}</span>` : '');
}

let out = [];
const w = (s) => out.push(s);

const HEADER = [
  '<!-- PLIK GENEROWANY - nie edytuj recznie.',
  '     Zrodlo wartosci: css/scss/_root.scss i pliki komponentow.',
  '     Zrodlo opisow:   tools/variables-doc.data.js',
  '     Regeneracja:     node tools/gen-variables-doc.js -->',
];

fs.mkdirSync(partialsDir, { recursive: true });

// Zrzuca zebrane linie do partiala i czysci bufor pod kolejna tabele.
function flush(name) {
  fs.writeFileSync(path.join(partialsDir, name), HEADER.concat(out).join('\n') + '\n');
  out = [];
}

/* --- 6a. Zmienne globalne, grupami --- */

for (const g of GROUPS) {
  const names = Object.keys(GLOBAL).filter((n) => GLOBAL[n][0] === g.id);
  const anyDark = names.some((n) => dark.has(n));

  w(`<section class="mb-5" id="vars-${g.id}">`);
  w(`  <h3 class="text-6 fw-bold mb-2">${g.title} <span class="badge badge-secondary">${names.length}</span></h3>`);
  w(`  <p class="text-muted mb-3">${g.intro}</p>`);
  w('  <div class="table-wrapper mb-3">');
  w('    <table class="table table-sm table-hover table-cards">');
  w('      <thead class="thead-light">');
  w('        <tr>');
  w('          <th>Zmienna</th>');
  w('          <th>Wartość</th>');
  if (anyDark) w('          <th>Dark mode</th>');
  w('          <th>Co steruje</th>');
  w('          <th>Używana w</th>');
  w('        </tr>');
  w('      </thead>');
  w('      <tbody>');

  for (const n of names) {
    w('        <tr>');
    w(`          <td data-label="Zmienna"><code class="fw-bold">${esc(n)}</code></td>`);
    w(`          <td data-label="Wartość">${val(light.get(n))}</td>`);
    if (anyDark) {
      w(`          <td data-label="Dark mode">${dark.has(n) ? val(dark.get(n)) : '<span class="text-muted">bez zmian</span>'}</td>`);
    }
    w(`          <td data-label="Co steruje">${GLOBAL[n][1]}</td>`);
    w(`          <td data-label="Używana w" class="text-xs">${usage(n)}</td>`);
    w('        </tr>');
  }

  w('      </tbody>');
  w('    </table>');
  w('  </div>');
  w('</section>');
}

flush('variables-global.html');

/* --- 6b. Zmienne komponentow, wg komponentu --- */

const byComponent = new Map();
for (const [n, [comp]] of Object.entries(COMPONENT)) {
  if (!byComponent.has(comp)) byComponent.set(comp, []);
  byComponent.get(comp).push(n);
}

w('<div class="table-wrapper mb-3">');
w('  <table class="table table-sm table-hover table-cards">');
w('    <thead class="thead-light">');
w('      <tr>');
w('        <th>Komponent</th>');
w('        <th>Zmienna</th>');
w('        <th>Domyślnie</th>');
w('        <th>Rodzaj</th>');
w('        <th>Co steruje</th>');
w('      </tr>');
w('    </thead>');
w('    <tbody>');

for (const [comp, names] of [...byComponent].sort((a, b) => a[0].localeCompare(b[0], 'pl'))) {
  names.forEach((n, i) => {
    const [, kind, desc] = COMPONENT[n];
    const badge = kind === 'api'
      ? '<span class="badge badge-success">markup</span>'
      : '<span class="badge badge-secondary">wewnętrzna</span>';
    w('      <tr>');
    w(`        <td data-label="Komponent">${i === 0 ? `<strong>${esc(comp)}</strong>` : ''}</td>`);
    w(`        <td data-label="Zmienna"><code class="fw-bold">${esc(n)}</code></td>`);
    w(`        <td data-label="Domyślnie">${val(component.get(n).value)}</td>`);
    w(`        <td data-label="Rodzaj">${badge}</td>`);
    w(`        <td data-label="Co steruje">${desc}</td>`);
    w('      </tr>');
  });
}

w('    </tbody>');
w('  </table>');
w('</div>');

flush('variables-component.html');

/* --- 6c. Czyste wejscia --- */

w('<div class="table-wrapper mb-3">');
w('  <table class="table table-sm table-hover table-cards">');
w('    <thead class="thead-primary">');
w('      <tr>');
w('        <th>Zmienna</th>');
w('        <th>Obszar</th>');
w('        <th>Gdy nie ustawisz</th>');
w('        <th>Co ustawia</th>');
w('      </tr>');
w('    </thead>');
w('    <tbody>');

for (const [n, [area, desc]] of Object.entries(INPUT)) {
  const fb = input.get(n).fallback;
  w('      <tr>');
  w(`        <td data-label="Zmienna"><code class="fw-bold">${esc(n)}</code></td>`);
  w(`        <td data-label="Obszar">${esc(area)}</td>`);
  w(`        <td data-label="Gdy nie ustawisz">${fb ? val(fb) : '<span class="badge badge-warning">wymagana</span>'}</td>`);
  w(`        <td data-label="Co ustawia">${desc}</td>`);
  w('      </tr>');
}

w('    </tbody>');
w('  </table>');
w('</div>');

flush('variables-input.html');

const withDark = Object.keys(GLOBAL).filter((n) => dark.has(n)).length;
console.log('Zmienne globalne (:root): ' + light.size + '  (nadpisane w dark mode: ' + withDark + ')');
console.log('Zmienne komponentow:      ' + component.size);
console.log('Czyste wejscia z markupu: ' + input.size);
console.log('Razem udokumentowanych:   ' + (light.size + component.size + input.size));
console.log('Zapisano 3 partiale do src/partials/variables-*.html');

// Jedyne zrodlo liczb dla {{ __globalVarsCount }} itd. w vite.config.js -
// docs-variables.html/.en/.de czytaja je stamtad, zero recznej synchronizacji.
fs.writeFileSync(
  path.join(root, 'tools', 'variables-counts.json'),
  JSON.stringify({
    global: light.size,
    component: component.size,
    input: input.size,
    darkOverrides: withDark,
  }, null, 2) + '\n'
);
console.log('Zapisano tools/variables-counts.json');
