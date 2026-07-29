/**
 * molique - CSS variable table generator for docs-variables.html
 *
 * Reads SCSS as the SOURCE OF TRUTH (light + dark values, files, usages),
 * attaches descriptions from tools/variables-doc.data.js, and assembles
 * the finished HTML fragment.
 *
 * Run with:  node tools/gen-variables-doc.js
 * Output:    src/partials/variables-global.html
 *            src/partials/variables-component.html
 *            src/partials/variables-input.html
 * Three files instead of one, so prose can be inserted BETWEEN the
 * tables on the page - each of the three categories needs a different
 * introduction.
 *
 * Three variable categories - the distinction matters here because each
 * has a different contract with the user:
 *   GLOBAL    - declared in :root (_root.scss). Theme-aware. You override it globally.
 *   COMPONENT - declared in a component file (or via @property).
 *   INPUT     - NEVER declared, only read. A pure input from markup.
 *
 * The generator ABORTS on a mismatch between SCSS and the descriptions -
 * that's the only safeguard against documentation that lies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUPS, GLOBAL, COMPONENT, INPUT } from './variables-doc.data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const partialsDir = path.join(root, 'src', 'partials');

/* ---------- 1. Reading the sources ---------- */

function scssFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return scssFiles(p);
    return e.isFile() && e.name.endsWith('.scss') ? [p] : [];
  });
}

const files = scssFiles(scssDir).map((p) => ({
  // Module name shown in the "Used in" column: components/_tables.scss -> tables
  name: path.relative(scssDir, p).replace(/\\/g, '/').replace(/(^|\/)_/, '$1').replace(/\.scss$/, ''),
  path: p,
  text: fs.readFileSync(p, 'utf8'),
}));

const rootFile = files.find((f) => f.name === 'root');
if (!rootFile) throw new Error('css/scss/_root.scss not found');

/* ---------- 2. Parsing the (:root / [data-theme="dark"]) block ---------- */

// Declaration: start of line, name, value up to the semicolon, optional comment.
const DECL = /^[ \t]*(--[\w-]+)[ \t]*:[ \t]*([^;]+);/;

function blockOf(text, selector) {
  const start = text.indexOf(selector + ' {');
  if (start === -1) throw new Error('Block ' + selector + ' not found in _root.scss');
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i);
  }
  throw new Error('Unclosed block ' + selector);
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

/* ---------- 3. Component variables ---------- */

// Declaration in a component file. The FIRST occurrence counts - later
// ones are typically overrides in variants (.table-sm etc.), not the
// default value.
const component = new Map(); // name -> { value, file }

for (const f of files) {
  if (f.name === 'root') continue;
  for (const line of f.text.split(/\r?\n/)) {
    const m = line.match(DECL);
    if (m && !light.has(m[1]) && !component.has(m[1])) {
      component.set(m[1], { value: m[2].trim(), file: f.name });
    }
  }
  // @property registers the variable so it can be animated. The default
  // value lives in initial-value, not in an ordinary declaration.
  for (const m of f.text.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
    if (light.has(m[1]) || component.has(m[1])) continue;
    const init = m[2].match(/initial-value\s*:\s*([^;]+)/);
    component.set(m[1], { value: init ? init[1].trim() : '-', file: f.name });
  }
}

/* ---------- 4. Pure inputs (used, never declared) ---------- */

const fallbacks = new Map(); // name -> fallback value from var(--x, FALLBACK)
const usedIn = new Map();    // name -> Set(module)

for (const f of files) {
  if (f.name.startsWith('molique-style')) continue; // compiled bundles, not rule sources
  for (const m of f.text.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
    if (!usedIn.has(m[1])) usedIn.set(m[1], new Set());
    usedIn.get(m[1]).add(f.name);
  }
  // Fallback value: var(--x, ...) - take the text up to the closing paren.
  for (const m of f.text.matchAll(/var\(\s*(--[\w-]+)\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
    if (!fallbacks.has(m[1])) fallbacks.set(m[1], m[2].trim());
  }
}

const input = new Map();
for (const [name, mods] of usedIn) {
  if (light.has(name) || component.has(name)) continue;
  input.set(name, { fallback: fallbacks.get(name) || null, files: mods });
}

/* ---------- 5. Checking for SCSS <-> descriptions drift ---------- */

const problems = [];
const check = (found, described, label) => {
  for (const n of found) if (!described[n]) problems.push(`${label}: ${n} is in SCSS but has no description in variables-doc.data.js`);
  for (const n of Object.keys(described)) if (!found.has(n)) problems.push(`${label}: ${n} has a description but is no longer in SCSS (dead entry)`);
};

check(new Set(light.keys()), GLOBAL, 'GLOBAL');
check(new Set(component.keys()), COMPONENT, 'COMPONENT');
check(new Set(input.keys()), INPUT, 'INPUT');

for (const [name, [group]] of Object.entries(GLOBAL).map(([k, v]) => [k, v])) {
  if (!GROUPS.some((g) => g.id === group)) problems.push(`GLOBAL: ${name} points to a nonexistent group "${group}"`);
}

// Numbers in the page's PROSE (section headings, meta description, the
// dark-mode sentence) come from {{ __globalVarsCount }} etc. (locals
// injected by vite.config.js), not hand-typed text. This generator is the
// only source of these numbers - it writes them to variables-counts.json below.

// THEME EDITOR and --x / --x-rgb pairs.
// A color control that has a matching -rgb variable in :root MUST compute
// that pair via data-te-rgb. Otherwise the user changes the color and the
// transparency variants stay on the old one - exactly pitfall #2 from
// docs-variables. This is precisely how --bg-surface drifted out of sync
// once --bg-surface-rgb was added.
const editorPath = path.join(root, 'src', 'theme-editor.html');
if (fs.existsSync(editorPath)) {
  const editor = fs.readFileSync(editorPath, 'utf8');
  for (const m of editor.matchAll(/<input[^>]*data-te-var="(--[\w-]+)"[^>]*>/g)) {
    const [tag, name] = m;
    if (!tag.includes('data-te-type="color"')) continue;
    // The pair's name is sometimes shortened: --bg-body -> --body-rgb, --sidebar-bg -> --sidebar-rgb.
    const candidates = [
      name + '-rgb',
      name.replace(/^--bg-/, '--') + '-rgb',
      name.replace(/-bg$/, '') + '-rgb',
    ];
    const pair = candidates.find((c) => light.has(c));
    if (pair && !tag.includes(`data-te-rgb="${pair}"`)) {
      problems.push(
        `theme-editor.html: the ${name} control doesn't compute the ${pair} pair ` +
        `(missing data-te-rgb) - transparency variants will stay on the old color`
      );
    }
  }
}

if (problems.length) {
  console.error('\nVariables generator ABORTED - the documentation has drifted from the source:\n');
  for (const p of problems) console.error('  - ' + p);
  console.error('\nUpdate tools/variables-doc.data.js and run again.\n');
  process.exit(1);
}

/* ---------- 6. Render ---------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Descriptions in data.js deliberately contain <code> and <strong> - pass them through unchanged.
const val = (v) => `<code>${esc(v)}</code>`;

// "Used in" column: three modules + a counter for the rest. The full list
// can run to 20 items and stretches the table more than it helps.
function usage(name) {
  const mods = [...(usedIn.get(name) || [])].filter((m) => m !== 'root').sort();
  if (!mods.length) return '<span class="text-muted">-</span>';
  const shown = mods.slice(0, 3).map((m) => `<code>${esc(m)}</code>`).join(' ');
  return shown + (mods.length > 3 ? ` <span class="text-muted">+${mods.length - 3}</span>` : '');
}

let out = [];
const w = (s) => out.push(s);

const HEADER = [
  '<!-- GENERATED FILE - do not edit by hand.',
  '     Value source:       css/scss/_root.scss and component files.',
  '     Description source: tools/variables-doc.data.js',
  '     Regenerate with:    node tools/gen-variables-doc.js -->',
];

fs.mkdirSync(partialsDir, { recursive: true });

// Flushes the collected lines to the partial and clears the buffer for the next table.
function flush(name) {
  fs.writeFileSync(path.join(partialsDir, name), HEADER.concat(out).join('\n') + '\n');
  out = [];
}

/* --- 6a. Global variables, by group --- */

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

/* --- 6b. Component variables, by component --- */

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

/* --- 6c. Pure inputs --- */

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
console.log('Global variables (:root): ' + light.size + '  (overridden in dark mode: ' + withDark + ')');
console.log('Component variables:      ' + component.size);
console.log('Pure inputs from markup:  ' + input.size);
console.log('Total documented:         ' + (light.size + component.size + input.size));
console.log('Wrote 3 partials to src/partials/variables-*.html');

// The only source of the numbers for {{ __globalVarsCount }} etc. in
// vite.config.js - docs-variables.html/.en/.de read them from here, zero
// manual syncing.
fs.writeFileSync(
  path.join(root, 'tools', 'variables-counts.json'),
  JSON.stringify({
    global: light.size,
    component: component.size,
    input: input.size,
    darkOverrides: withDark,
  }, null, 2) + '\n'
);
console.log('Wrote tools/variables-counts.json');
