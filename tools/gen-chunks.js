/**
 * molique - CSS chunk generator + manifest for the package configurator
 *
 * For every SCSS module, compiles a standalone CSS file (chunk) and
 * describes it in the manifest: size, layer, category, description, and
 * DETECTED DEPENDENCIES.
 *
 * Run with:  node tools/gen-chunks.js
 * Output:    dist/chunks/molique-*.css  +  dist/chunks/manifest.json
 *
 * The molique- prefix on file names is the same convention as in
 * js/modules/: a script syncing the framework into someone else's project
 * should replace ONLY molique's own files and never touch the user's
 * code. Chunks end up in the user's project too (the package configurator
 * downloads them), so the same rule applies to them.
 *
 * Why chunks can be concatenated in any order: molique declares the layer
 * order up front (@layer reset, base, ... ), so precedence is decided by
 * that declaration, not by paste order. Every chunk carries that
 * declaration plus its own @layer block.
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
// Local sass (devDependency) run VIA NODE, not via .bin/sass.cmd:
// Node 24 refuses to spawn .cmd files without shell:true, and shell:true
// triggers a security warning. Calling sass.js directly sidesteps the
// problem entirely.
const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');
const tmpDir = path.join(root, '.chunktmp');

const LAYERS = '@layer reset, base, layout, components, modules, utilities;';

// Chunk file name. The ID stays prefix-free - categories, dependency
// detection, and the configurator's checked state all key off it.
const fileOf = (id) => 'molique-' + id + '.css';

/* ---------- 1. Chunk definitions ---------- */

// Base layers. mandatory = the configurator won't let you uncheck it.
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
  // optIn = excluded from the "Everything" preset and from "select whole
  // category". This module generates spacing for FIVE breakpoints (sm/md/
  // lg/xl + base), so it alone weighs as much as several components. You
  // opt into it deliberately or not at all - that's why it can't sneak
  // into the package via "select all".
  { id: 'utilities-extended', file: 'utilities-extended', layer: 'utilities', cat: 'Utilities', mandatory: false, optIn: true, label: 'Odstępy na wszystkich progach (sm/lg/xl)' },
];

// Category by component file name (for the configurator's UI).
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

// A pretty label from the id: "form-select-search" -> "Form select search"
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

/* ---------- 2. Description from the file header (// molique - ...) ---------- */

// The project uses two header conventions: the quiet "// molique - X"
// (files after a split) and the loud "/** \n * molique - X". We handle both.
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

/* ---------- 3. Compiling the chunks ---------- */

fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });
// Clear the output directory so a naming-convention change doesn't leave
// orphaned files from a previous run (e.g. missing the molique- prefix).
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const gzip = (s) => zlib.gzipSync(Buffer.from(s, 'utf8')).length;

// One input file per chunk...
for (const c of chunks) {
  // The input file's name decides the output name (Sass in directory
  // mode), so we apply the prefix right here.
  fs.writeFileSync(
    path.join(tmpDir, 'molique-' + c.id + '.scss'),
    // An explicit relative path, NOT just "root" - otherwise the input
    // file .chunktmp/root.scss would import itself (Sass looks in the
    // importing directory first) and sass would report "Module loop".
    `@use "sass:meta";\n${LAYERS}\n@layer ${c.layer} {\n  @include meta.load-css("../css/scss/${c.file}");\n}\n`
  );
}

// ...and ONE sass invocation in directory mode (66 separate processes
// would take tens of seconds).
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

/* ---------- 4. Dependency detection ---------- */
// defines: a class appearing as the FIRST part of a selector
// uses:    every other class in the selector (descendant / compound)

// Watch the pattern: a CSS class must start with a letter/_/-, otherwise
// the regex catches fractions from the minified output (".5rem" -> "5",
// "1.08" -> "08") and produces fake dependencies between random chunks.
const IDENT = '(-?[_a-zA-Z][\\w-]*)';
const firstOf = (css) => [...css.matchAll(new RegExp('(?:^|[,{}])\\s*\\.' + IDENT, 'g'))].map((m) => m[1]);
const allOf = (css) => [...css.matchAll(new RegExp('\\.' + IDENT, 'g'))].map((m) => m[1]);

// Class owner: the chunk whose id matches the class name (e.g.
// .dropdown-menu -> chunk "dropdown"). Without this, ownership would go to
// whichever chunk got processed first - e.g. _eink has a print rule for
// .dropdown-menu and would "steal" it from the real module. When the name
// doesn't match - the occurrence count decides.
const counts = new Map(); // class -> Map(chunkId -> count)
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
    // .is-* is a state convention shared across many components, not a
    // separate module - it doesn't create a dependency.
    if (cls.startsWith('is-') || own.has(cls)) continue;
    const owner = defines.get(cls);
    if (owner && owner !== c.id) deps.add(owner);
  }
  c.deps = [...deps].sort();
  delete c._css;
}

/* ---------- 5. EN/DE translations (package configurator, builder.html) ---------- */
// Component module labels (labelOf()) are auto-generated from the
// English file names and need NO entry in CORE_LABELS - they read fine in
// every language unchanged. The description (desc) and core.label always
// need an entry - without it builder.js in English/German would show
// Polish text.
const missingI18n = [];
for (const c of chunks) {
  if (!DESCRIPTIONS[c.id]) missingI18n.push(`${c.id}: missing entry in DESCRIPTIONS`);
  if (core.some((k) => k.id === c.id) && !CORE_LABELS[c.id]) {
    missingI18n.push(`${c.id}: missing entry in CORE_LABELS`);
  }
  if (!CATEGORIES[c.cat]) missingI18n.push(`${c.id}: category "${c.cat}" missing in CATEGORIES`);
}
if (missingI18n.length) {
  console.error('\nChunk generator ABORTED - missing translations in tools/builder-i18n.data.js:\n');
  for (const m of missingI18n) console.error('  - ' + m);
  console.error('\nFill them in and run again.');
  process.exit(1);
}

/* ---------- 6. Manifest ---------- */

const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  note: 'Chunks can be concatenated in any order - precedence is decided by the @layer declaration at the top of each file. When concatenating, keep the layer declaration ONLY ONCE (the first one) and skip @charset.',
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

/* ---------- 7. Class index for molique-jit (class -> chunk "triggered by class") ---------- */
// OUR OWN ownership counting, scoped to `classIndexSources` (components +
// three core chunks that behave like components, see below) - deliberately
// does NOT reuse "defines" from section 4. That "defines" counts class
// precedence across ALL chunks (including core: root/a11y/eink/grid/...),
// and on a tie in occurrence count, processing order wins (the order in
// the `chunks` array) - harmless for the "deps" field in the manifest
// alone (purely informational), but here it would be a source of silent
// bugs: e.g. ".card" appears as the first token ALSO in _eink.scss (print
// variants), with the same count as in _cards.scss - and since "eink" is
// in core and processed earlier, `defines.get('card')` points to "eink",
// i.e. a NON-component, and the class "card" simply vanishes from the
// index. By counting ownership from scratch, based only on `components`,
// this kind of phantom tie with core files can never happen.
// Three core chunks that, despite their "core" label, behave like
// components from the JIT's perspective: the user "opts into" them by
// USING a specific class (.btn-primary, .col-span-6, .d-flex), not merely
// by the framework's presence. The rest of core (root/fonts/base/a11y/
// eink/utilities*) is either always needed (base is included separately
// below, see baseCssPath) or isn't triggered by a single class (fonts/
// a11y/eink) - out of scope for now.
const CLASS_TRIGGERED_CORE_IDS = ['buttons', 'grid', 'layout'];
const classIndexSources = components.concat(core.filter((c) => CLASS_TRIGGERED_CORE_IDS.includes(c.id)));

const classIndex = {};
{
  const compCounts = new Map(); // class -> Map(id -> count)
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
        'AUTO-GENERATED FILE - do not edit by hand. Source: tools/gen-chunks.js. ' +
        'Maps a CSS class to the component chunk ID (dist/chunks/molique-<id>.css) ' +
        'that molique-jit should include in full once that class is scanned in a project.',
      classes: classIndex,
    },
    null,
    2
  ) + '\n'
);

fs.rmSync(tmpDir, { recursive: true, force: true });

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('Chunks: ' + chunks.length);
console.log('Total (min): ' + kb(chunks.reduce((s, c) => s + c.bytes, 0)) +
            '  | gzip: ' + kb(chunks.reduce((s, c) => s + c.gzip, 0)));
console.log('With dependencies: ' + chunks.filter((c) => c.deps.length).length);
console.log('Without a description: ' + chunks.filter((c) => !c.desc).map((c) => c.id).join(', '));
