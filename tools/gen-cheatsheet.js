/**
 * molique - cheat-sheet table generator for docs-classes.{html,en.html,de.html}
 *
 * Reads tools/cheatsheet.data.js (one entry per row, all three languages)
 * and writes src/partials/cheatsheet.html / .en.html / .de.html.
 *
 * Run with:  node tools/gen-cheatsheet.js
 * Output:    src/partials/cheatsheet.html
 *            src/partials/cheatsheet.en.html
 *            src/partials/cheatsheet.de.html
 * All three are gitignored and rebuilt in predev/prebuild, exactly like the
 * variable tables from tools/gen-variables-doc.js.
 *
 * WHY A GENERATOR: the same table used to be maintained by hand in three
 * files, and had already drifted - one row existed only in Polish, two range
 * markers ("do") were missing from EN/DE, and three rows were malformed
 * markup that browsers silently repaired. Class names now come from ONE
 * language-independent list, so a translation can no longer change them.
 *
 * COVERAGE GATE: every class in the shipped bundles must be reachable from a
 * data entry - a literal token, a range, a family pattern, or an explicit
 * `internal: true`. A class in the CSS with no entry FAILS THE BUILD, and so
 * does an entry for a class that no longer exists. That second direction is
 * what caught `.form-pill-group` and `.h1`-`.h6`: documented in three
 * languages, present in no bundle.
 *
 * Set CHEATSHEET_GATE=warn to downgrade it to a warning while working.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONNECTOR, HEAD, TAGS, CATEGORIES } from './cheatsheet.data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partialsDir = path.join(root, 'src', 'partials');

const LANGS = [
  { code: 'pl', file: 'cheatsheet.html' },
  { code: 'en', file: 'cheatsheet.en.html' },
  { code: 'de', file: 'cheatsheet.de.html' },
];

/* ---------- 1. Rendering ---------- */

const chip = (name) => `<span class="class-name">${name}</span>`;

/**
 * One line of the first cell. Tokens: a class name, '..' for the localised
 * range word, '/' for a literal slash.
 */
function renderLine(tokens, lang) {
  return tokens
    .map((t) => (t === '..' ? CONNECTOR[lang] : t === '/' ? '/' : chip(t)))
    .join(' ');
}

function renderClasses(lines, lang) {
  return lines.map((l) => renderLine(l, lang)).join('<br />');
}

function pick(value, lang) {
  return typeof value === 'string' ? value : value[lang];
}

/**
 * Tag stems for one row, in one language. They ride on data-tags instead of a
 * visible column: a fourth column would be noise, but the words are exactly
 * what someone types when they know the problem and not the class name.
 */
function renderTags(row, lang) {
  if (!row.tags || !row.tags.length) return '';
  const stems = row.tags.flatMap((key) => {
    if (!TAGS[key]) throw new Error(`row "${row.id}": unknown tag key "${key}"`);
    // one stem per language, or several when a concept has real synonyms
    const stem = TAGS[key][lang];
    return Array.isArray(stem) ? stem : [stem];
  });
  return ' data-tags="' + [...new Set(stems)].join(' ') + '"';
}

function renderRow(row, lang) {
  const demoAttrs = row.demoAttrs ? ' ' + row.demoAttrs : '';
  return [
    '                <tr' + renderTags(row, lang) + '>',
    '                  <td>' + renderClasses(row.classes, lang) + '</td>',
    '                  <td class="text-muted">' + pick(row.desc, lang) + '</td>',
    '                  <td' + demoAttrs + '>' + pick(row.demo, lang) + '</td>',
    '                </tr>',
  ].join('\n');
}

function renderCategory(cat, index, lang) {
  // The number is added HERE, not stored in the title - it used to be typed
  // into three files by hand, so inserting a section renumbered nothing.
  return [
    '                <tr id="cat-' + cat.id + '">',
    '                  <td colspan="3" class="cheat-sheet-category">',
    '                    ' + (index + 1) + '. ' + cat.title[lang],
    '                  </td>',
    '                </tr>',
  ].join('\n');
}

function renderTable(lang) {
  const head = HEAD[lang];
  const out = [
    '<!-- GENERATED FILE - do not edit by hand.',
    '     Content source:  tools/cheatsheet.data.js',
    '     Regenerate with: node tools/gen-cheatsheet.js -->',
    '<div class="table-wrapper shadow-sm border-0">',
    '  <table class="table table-lg table-hover cheat-sheet-table">',
    '    <thead>',
    '      <tr>',
    `        <th style="width: 30%">${head[0]}</th>`,
    `        <th style="width: 40%">${head[1]}</th>`,
    `        <th style="width: 30%">${head[2]}</th>`,
    '      </tr>',
    '    </thead>',
    '    <tbody id="cheatSheetBody">',
  ];
  CATEGORIES.forEach((cat, i) => {
    out.push(renderCategory(cat, i, lang));
    for (const row of cat.rows) out.push(renderRow(row, lang));
  });
  out.push('    </tbody>');
  out.push('  </table>');
  out.push('</div>');
  return out.join('\n') + '\n';
}

/* ---------- 2. Coverage gate ---------- */

/**
 * Everything the data claims to document.
 *   exact     literal class names, ranges expanded
 *   prefixes  '.btn-outline-*' -> 'btn-outline-' (a documented family)
 */
function documentedClasses(compiled) {
  const exact = new Set();
  const prefixes = [];
  for (const cat of CATEGORIES) {
    for (const row of cat.rows) {
      if (row.internal) continue;
      for (const line of row.classes) {
        for (let i = 0; i < line.length; i++) {
          const t = line[i];
          if (t === '..') {
            // range: previous token .. next token, e.g. '.m-0' .. '.m-5'
            expandRange(line[i - 1], line[i + 1], compiled).forEach((c) => exact.add(c));
            continue;
          }
          if (t === '/' || !t.startsWith('.')) continue;
          const name = t.slice(1);
          if (name.endsWith('*')) prefixes.push(name.slice(0, -1));
          else exact.add(name);
        }
      }
    }
  }
  return {
    exact,
    prefixes,
    has: (c) => exact.has(c) || prefixes.some((p) => p && c.startsWith(p)),
    size: exact.size + prefixes.length,
  };
}

/**
 * '.m-0' .. '.m-5'         -> m-0 … m-5
 * '.grid-cols-1' .. '-12'  -> grid-cols-1 … grid-cols-12
 *
 * The result is INTERSECTED with the compiled set, because a scale is not
 * always contiguous - .opacity-0 .. .opacity-100 means 0/25/50/75/100, not
 * a hundred and one classes. Claiming the gaps would fill the "documented"
 * set with names that do not exist and make the stale-entry check useless.
 * The endpoints are always claimed, so a typo in either still surfaces.
 */
function expandRange(from, to, compiled) {
  if (!from || !to) return [];
  const a = from.replace(/^\./, '');
  const b = to.replace(/^\./, '');
  const mA = a.match(/^(.*?)(\d+)$/);
  const mB = b.match(/^(.*?)(\d+)$/);
  if (!mA || !mB) return [a, b].filter(Boolean);
  const prefix = mB[1] === '' || mB[1] === '-' ? mA[1] : mB[1];
  const lo = Number(mA[2]);
  const hi = Number(mB[2]);
  if (hi < lo) return [a, b];
  const out = [a, prefix + hi];
  for (let n = lo; n <= hi; n++) {
    const name = prefix + n;
    if (!compiled || compiled.has(name)) out.push(name);
  }
  return out;
}

/**
 * Classes present in the shipped bundles. molique-style-docs.css is excluded
 * on purpose - it styles molique.dev itself (.class-name, .cheat-sheet-*),
 * it is not part of the framework's public surface.
 */
function compiledClasses() {
  const cssDir = path.join(root, 'css');
  const bundles = fs
    .readdirSync(cssDir)
    .filter((f) => /^molique-style.*\.css$/.test(f) && !f.includes('-docs'));
  if (!bundles.length) return null;
  const found = new Set();
  for (const file of bundles) {
    const css = fs.readFileSync(path.join(cssDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /[{}]/g;
    let m;
    let last = 0;
    while ((m = re.exec(css))) {
      if (m[0] === '{') {
        const prelude = css.slice(last, m.index).replace(/^[\s\S]*[;}]/, '').trim();
        if (!prelude.startsWith('@'))
          for (const c of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) found.add(c[1]);
      }
      last = m.index + 1;
    }
  }
  return found;
}

function runGate() {
  const compiled = compiledClasses();
  if (!compiled) {
    console.warn('[cheatsheet] css/molique-style.css missing - coverage gate skipped');
    return;
  }
  const documented = documentedClasses(compiled);
  const missing = [...compiled].filter((c) => !documented.has(c)).sort();

  // A row may declare cssless: true - a class that is only a hook for JS and
  // has no CSS rule at all (.btn-magnetic is pure inline transform). Without
  // this, the stale check would keep reporting a genuinely public class.
  const cssless = new Set();
  for (const cat of CATEGORIES)
    for (const row of cat.rows)
      if (row.cssless)
        for (const line of row.classes)
          for (const t of line) if (t.startsWith('.')) cssless.add(t.slice(1));

  const stale = [...documented.exact]
    .filter((c) => !compiled.has(c) && !cssless.has(c))
    .sort();

  const problems = [];
  if (stale.length)
    problems.push(
      `${stale.length} documented class(es) do not exist in any bundle ` +
        `(add cssless: true if the class is a JS-only hook): ` +
        stale.slice(0, 20).join(', ') +
        (stale.length > 20 ? ', …' : '')
    );
  if (missing.length)
    problems.push(
      `${missing.length} of ${compiled.size} classes have no entry ` +
        `(${documented.size} documented). First 20: ` +
        missing.slice(0, 20).join(', ') +
        (missing.length > 20 ? ', …' : '')
    );

  if (!problems.length) {
    console.log(`[cheatsheet] coverage complete: ${compiled.size}/${compiled.size} classes`);
    return;
  }
  const msg = problems.map((p) => '[cheatsheet] ' + p).join('\n');
  if (process.env.CHEATSHEET_GATE === 'warn') {
    console.warn(msg);
    return;
  }
  throw new Error(msg + '\n[cheatsheet] set CHEATSHEET_GATE=warn to continue anyway');
}

/* ---------- 3. Write ---------- */

fs.mkdirSync(partialsDir, { recursive: true });
for (const { code, file } of LANGS) {
  fs.writeFileSync(path.join(partialsDir, file), renderTable(code), 'utf8');
}

const rowCount = CATEGORIES.reduce((s, c) => s + c.rows.length, 0);
console.log(
  `[cheatsheet] ${CATEGORIES.length} categories, ${rowCount} rows -> ` +
    LANGS.map((l) => 'src/partials/' + l.file).join(', ')
);
runGate();
