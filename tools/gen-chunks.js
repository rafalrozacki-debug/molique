/**
 * molique - generator chunkow CSS + manifest dla konfiguratora paczki
 *
 * Dla kazdego modulu SCSS kompiluje samodzielny plik CSS (chunk) i opisuje go
 * w manifescie: rozmiar, warstwa, kategoria, opis i WYKRYTE ZALEZNOSCI.
 *
 * Uruchomienie:  node tools/gen-chunks.js
 * Wyjscie:       dist/chunks/molique-*.css  +  dist/chunks/manifest.json
 *
 * Prefiks molique- w nazwach plikow jest ta sama konwencja co w js/modules/:
 * skrypt synchronizujacy framework do cudzego projektu ma podmieniac WYLACZNIE
 * pliki molique i nie ruszac kodu uzytkownika. Chunki laduja u niego w projekcie
 * (konfigurator paczki je pobiera), wiec dotyczy ich dokladnie tak samo.
 *
 * Dlaczego chunki mozna sklejac w dowolnej kolejnosci: molique deklaruje
 * kolejnosc warstw z gory (@layer reset, base, ... ), wiec o precedencji
 * decyduje deklaracja, a nie kolejnosc wklejenia. Kazdy chunk niesie te
 * deklaracje + wlasny blok @layer.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CORE_LABELS, DESCRIPTIONS, CATEGORIES } from './builder-i18n.data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const outDir = path.join(root, 'dist', 'chunks');
// Lokalny sass (devDependency) uruchamiany PRZEZ NODE, a nie przez .bin/sass.cmd:
// Node 24 odmawia spawnowania plikow .cmd bez shell:true, a shell:true daje
// ostrzezenie o bezpieczenstwie. Wywolanie sass.js omija problem calkowicie.
const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');
const tmpDir = path.join(root, '.chunktmp');

const LAYERS = '@layer reset, base, layout, components, modules, utilities;';

// Nazwa pliku chunka. ID zostaje bez prefiksu - na nim opieraja sie kategorie,
// wykrywanie zaleznosci i stan zaznaczenia w konfiguratorze.
const fileOf = (id) => 'molique-' + id + '.css';

/* ---------- 1. Definicja chunkow ---------- */

// Warstwy bazowe. mandatory = konfigurator nie pozwoli odznaczyc.
const core = [
  { id: 'root',      file: 'root',      layer: 'reset',     cat: 'Podstawy', mandatory: true,  label: 'Zmienne motywu (:root)' },
  { id: 'fonts',     file: 'fonts',     layer: 'reset',     cat: 'Podstawy', mandatory: false, label: 'Fonty (@font-face)' },
  { id: 'base',      file: 'base',      layer: 'base',      cat: 'Podstawy', mandatory: true,  label: 'Reset i typografia bazowa' },
  { id: 'a11y',      file: 'a11y',      layer: 'base',      cat: 'Podstawy', mandatory: false, label: 'Dostępność (focus, reduced-motion)' },
  { id: 'eink',      file: 'eink',      layer: 'base',      cat: 'Podstawy', mandatory: false, label: 'Tryb e-ink / druk' },
  { id: 'grid',      file: 'grid',      layer: 'layout',    cat: 'Layout',   mandatory: false, label: 'Grid i kontenery' },
  { id: 'layout',    file: 'layout',    layer: 'layout',    cat: 'Layout',   mandatory: false, label: 'Layout: sekcje, flex, pozycjonowanie' },
  { id: 'buttons',   file: 'buttons',   layer: 'components',cat: 'Podstawy', mandatory: false, label: 'Przyciski' },
  { id: 'utilities', file: 'utilities', layer: 'utilities', cat: 'Utilities',mandatory: false, label: 'Klasy narzędziowe' },
  // optIn = poza presetem "Wszystko" i poza zaznaczaniem calej kategorii.
  // Ten modul generuje odstepy dla PIECIU progow (sm/md/lg/xl + baza), wiec
  // sam wazy tyle, co kilka komponentow. Wlaczasz go swiadomie albo wcale -
  // dlatego nie moze wjechac do paczki przy kliknieciu "zaznacz wszystko".
  { id: 'utilities-extended', file: 'utilities-extended', layer: 'utilities', cat: 'Utilities', mandatory: false, optIn: true, label: 'Odstępy na wszystkich progach (sm/lg/xl)' },
];

// Kategoria wg nazwy pliku komponentu (dla UI konfiguratora).
const CAT = [
  [/^(navbar|mega-menu|dropdown|breadcrumbs|pagination|topbar|scroll-to-top|reading-progress|language-switch)$/, 'Nawigacja'],
  [/^(form-|theme-switch)/,                                    'Formularze'],
  [/^(badges|alerts|toasts|status-|stock-bar|tooltips)/,        'Feedback'],
  [/^(tables|data-row|list-|counters|grid-expand)/,             'Dane'],
  [/^(pricing|progress|timeline|stepper|testimonials|word-rotator|nav-filters)/, 'Biznes'],
  [/^(modal|lightbox|context-menu|accordion|tabs|carousel)/,    'Okna i media'],
  [/^(cards|hero|code-preview|charts|chart-)/,                  'Prezentacja'],
  [/^(admin-|dashboard)/,                                       'Panel admina'],
  [/^theme-editor$/,                                            'Narzędzia'],
];
const catOf = (id) => (CAT.find(([re]) => re.test(id)) || [null, 'Inne'])[1];

// Ladny label z id: "form-select-search" -> "Form select search"
const labelOf = (id) => id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const components = fs
  .readdirSync(path.join(scssDir, 'components'))
  .filter((f) => f.endsWith('.scss'))
  .map((f) => f.replace(/^_/, '').replace(/\.scss$/, ''))
  .sort()
  .map((id) => ({
    id,
    file: 'components/' + id,
    layer: 'components',
    cat: catOf(id),
    mandatory: false,
    label: labelOf(id),
  }));

const chunks = core.concat(components);

/* ---------- 2. Opis z naglowka pliku (// molique - ...) ---------- */

// W projekcie sa dwie konwencje naglowka: ciche "// molique - X" (pliki po
// rozbiciu) oraz glosne "/** \n * molique - X". Obslugujemy obie.
function descOf(file) {
  const p = path.join(scssDir, path.dirname(file), '_' + path.basename(file) + '.scss');
  if (!fs.existsSync(p)) return '';
  const head = fs.readFileSync(p, 'utf8').split(/\r?\n/).slice(0, 6);
  for (const line of head) {
    const m = line.match(/^\s*(?:\/\/|\*)\s*molique\s*[--]\s*(.+?)\s*$/);
    if (m) return m[1];
  }
  return '';
}

/* ---------- 3. Kompilacja chunkow ---------- */

fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });
// Czyscimy katalog wyjsciowy, zeby po zmianie konwencji nazw nie zostawaly
// osierocone pliki z poprzedniego przebiegu (np. bez prefiksu molique-).
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const gzip = (s) => zlib.gzipSync(Buffer.from(s, 'utf8')).length;

// Jeden plik wejsciowy na chunk...
for (const c of chunks) {
  // Nazwa pliku wejsciowego decyduje o nazwie wyjsciowej (sass w trybie
  // katalogowym), wiec prefiks nadajemy juz tutaj.
  fs.writeFileSync(
    path.join(tmpDir, 'molique-' + c.id + '.scss'),
    // Jawna sciezka wzgledna, a NIE samo "root" - inaczej plik wejsciowy
    // .chunktmp/root.scss zaimportowalby sam siebie (Sass szuka najpierw
    // w katalogu importujacego) i sass zglasza "Module loop".
    `@use "sass:meta";\n${LAYERS}\n@layer ${c.layer} {\n  @include meta.load-css("../css/scss/${c.file}");\n}\n`
  );
}

// ...i JEDNO wywolanie sass w trybie katalogowym (66 osobnych procesow trwaloby
// kilkadziesiat sekund).
execFileSync(
  process.execPath,
  [sassJs, '--load-path=' + scssDir, tmpDir + ':' + outDir,
   '--style=compressed', '--no-source-map', '--quiet'],
  { cwd: root, stdio: 'pipe' }
);

for (const c of chunks) {
  const css = fs.readFileSync(path.join(outDir, fileOf(c.id)), 'utf8');
  c.bytes = Buffer.byteLength(css, 'utf8');
  c.gzip = gzip(css);
  c.desc = descOf(c.file);
  c._css = css;
}

/* ---------- 4. Wykrywanie zaleznosci ---------- */
// definiuje: klasa wystepujaca jako PIERWSZY czlon selektora
// uzywa:     kazda inna klasa w selektorze (potomek / zlozenie)

// UWAGA na wzorzec: klasa CSS musi zaczynac sie od litery/_/-, inaczej regex
// lapie ulamki z minifikatu (".5rem" -> "5", "1.08" -> "08") i produkuje
// fikcyjne zaleznosci miedzy losowymi chunkami.
const IDENT = '(-?[_a-zA-Z][\\w-]*)';
const firstOf = (css) => [...css.matchAll(new RegExp('(?:^|[,{}])\\s*\\.' + IDENT, 'g'))].map((m) => m[1]);
const allOf = (css) => [...css.matchAll(new RegExp('\\.' + IDENT, 'g'))].map((m) => m[1]);

// Wlasciciel klasy: chunk, ktorego id pasuje do nazwy klasy (np. .dropdown-menu
// -> chunk "dropdown"). Bez tego wlasnosc trafialaby do chunka przetworzonego
// jako pierwszy - np. _eink ma regule druku dla .dropdown-menu i "przejmowal"
// ja od wlasciwego modulu. Gdy nazwa nie pasuje - decyduje liczba wystapien.
const counts = new Map(); // klasa -> Map(chunkId -> ile)
for (const c of chunks) {
  for (const cls of firstOf(c._css)) {
    if (!counts.has(cls)) counts.set(cls, new Map());
    const m = counts.get(cls);
    m.set(c.id, (m.get(c.id) || 0) + 1);
  }
}

const defines = new Map();
for (const [cls, m] of counts) {
  const byName = [...m.keys()]
    .filter((id) => cls === id || cls.startsWith(id + '-'))
    .sort((a, b) => b.length - a.length)[0];
  defines.set(cls, byName || [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
}

for (const c of chunks) {
  const own = new Set(firstOf(c._css));
  const deps = new Set();
  for (const cls of new Set(allOf(c._css))) {
    // .is-* to konwencja stanu wspoldzielona przez wiele komponentow,
    // a nie osobny modul - nie tworzy zaleznosci.
    if (cls.startsWith('is-') || own.has(cls)) continue;
    const owner = defines.get(cls);
    if (owner && owner !== c.id) deps.add(owner);
  }
  c.deps = [...deps].sort();
  delete c._css;
}

/* ---------- 5. Tlumaczenia EN/DE (konfigurator paczki, builder.html) ---------- */
// Etykiety modulow komponentow (labelOf()) sa auto-generowane z angielskich
// nazw plikow i NIE wymagaja wpisu w CORE_LABELS - czytelne we wszystkich
// jezykach bez zmian. Opis (desc) i core.label wymagaja wpisu zawsze -
// bez niego builder.js po angielsku/niemiecku pokazalby polski tekst.
const missingI18n = [];
for (const c of chunks) {
  if (!DESCRIPTIONS[c.id]) missingI18n.push(`${c.id}: brak wpisu w DESCRIPTIONS`);
  if (core.some((k) => k.id === c.id) && !CORE_LABELS[c.id]) {
    missingI18n.push(`${c.id}: brak wpisu w CORE_LABELS`);
  }
  if (!CATEGORIES[c.cat]) missingI18n.push(`${c.id}: kategoria "${c.cat}" brak w CATEGORIES`);
}
if (missingI18n.length) {
  console.error('\nGenerator chunkow PRZERWANY - brakuje tlumaczen w tools/builder-i18n.data.js:\n');
  for (const m of missingI18n) console.error('  - ' + m);
  console.error('\nUzupelnij i uruchom ponownie.');
  process.exit(1);
}

/* ---------- 6. Manifest ---------- */

const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  note: 'Chunki mozna sklejac w dowolnej kolejnosci - o precedencji decyduje deklaracja @layer na gorze kazdego pliku. Sklejajac, zostaw deklaracje warstw TYLKO RAZ (pierwsza) i pomin @charset.',
  layerOrder: ['reset', 'base', 'layout', 'components', 'modules', 'utilities'],
  chunks: chunks.map((c) => ({
    id: c.id,
    label: c.label,
    labelEn: CORE_LABELS[c.id]?.en ?? c.label,
    labelDe: CORE_LABELS[c.id]?.de ?? c.label,
    desc: c.desc,
    descEn: DESCRIPTIONS[c.id].en,
    descDe: DESCRIPTIONS[c.id].de,
    cat: c.cat,
    catEn: CATEGORIES[c.cat].en,
    catDe: CATEGORIES[c.cat].de,
    layer: c.layer,
    mandatory: c.mandatory, optIn: c.optIn === true,
    file: fileOf(c.id), bytes: c.bytes, gzip: c.gzip, deps: c.deps,
  })),
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

/* ---------- 7. Class index dla molique-jit (klasa -> chunk "wyzwalany klasa") ---------- */
// WLASNE liczenie wlasnosci, ograniczone do `classIndexSources` (komponenty +
// trzy chunki core zachowujace sie jak komponenty, patrz nizej) - celowo NIE
// reuzywa "defines" z sekcji 4. Ten "defines" liczy pierwszenstwo
// klas przez WSZYSTKIE chunki (rowniez core: root/a11y/eink/grid/...), a przy
// remisie liczby wystapien wygrywa kolejnosc przetwarzania (kolejnosc w
// tablicy `chunks`) - dla samego pola "deps" w manifescie to nieszkodliwe
// (tylko informacyjne), ale tutaj byloby to zrodlem cichych bledow: np.
// ".card" wystepuje jako pierwszy token TAKZE w _eink.scss (warianty pod
// druk), z tym samym licznikiem co w _cards.scss - a poniewaz "eink" jest w
// core i przetwarzany wczesniej, `defines.get('card')` wskazuje na "eink",
// czyli NIE-komponent, i klasa "card" po prostu znika z indeksu. Liczac
// wlasnosc od nowa, tylko na podstawie `components`, taki fantomowy remis
// z plikami core nigdy nie powstaje.
// Trzy chunki core, ktore mimo etykiety "core" zachowuja sie jak komponenty
// z perspektywy JIT-a: uzytkownik "wlacza" je przez UZYCIE konkretnej klasy
// (.btn-primary, .col-span-6, .d-flex), a nie przez sama obecnosc frameworka.
// Reszta core (root/fonts/base/a11y/eink/utilities*) albo jest zawsze
// potrzebna (base wlaczany oddzielnie nizej, patrz baseCssPath), albo nie
// jest wyzwalana pojedyncza klasa (fonts/a11y/eink) - poza zakresem na razie.
const CLASS_TRIGGERED_CORE_IDS = ['buttons', 'grid', 'layout'];
const classIndexSources = components.concat(core.filter((c) => CLASS_TRIGGERED_CORE_IDS.includes(c.id)));

const classIndex = {};
{
  const compCounts = new Map(); // klasa -> Map(id -> ile)
  for (const c of classIndexSources) {
    const css = fs.readFileSync(path.join(outDir, fileOf(c.id)), 'utf8');
    for (const cls of firstOf(css)) {
      if (!compCounts.has(cls)) compCounts.set(cls, new Map());
      const m = compCounts.get(cls);
      m.set(c.id, (m.get(c.id) || 0) + 1);
    }
  }
  for (const [cls, m] of compCounts) {
    const byName = [...m.keys()]
      .filter((id) => cls === id || cls.startsWith(id + '-'))
      .sort((a, b) => b.length - a.length)[0];
    classIndex[cls] = byName || [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
}
fs.writeFileSync(
  path.join(outDir, 'class-index.json'),
  JSON.stringify(
    {
      generated: manifest.generated,
      note:
        'PLIK GENEROWANY AUTOMATYCZNIE - nie edytuj recznie. Zrodlo: tools/gen-chunks.js. ' +
        'Mapuje klase CSS na ID chunka komponentu (dist/chunks/molique-<id>.css), ' +
        'ktory molique-jit ma dolaczyc w calosci po zeskanowaniu tej klasy w projekcie.',
      classes: classIndex,
    },
    null,
    2
  ) + '\n'
);

fs.rmSync(tmpDir, { recursive: true, force: true });

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('Chunkow: ' + chunks.length);
console.log('Suma (min): ' + kb(chunks.reduce((s, c) => s + c.bytes, 0)) +
            '  | gzip: ' + kb(chunks.reduce((s, c) => s + c.gzip, 0)));
console.log('Z zaleznosciami: ' + chunks.filter((c) => c.deps.length).length);
console.log('Bez opisu: ' + chunks.filter((c) => !c.desc).map((c) => c.id).join(', '));
