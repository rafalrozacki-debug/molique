/**
 * molique - PurgeCSS safelist generator
 *
 * Scans the sources (css/*.css + js/**\/*.js) and writes purgecss.safelist.cjs.
 * Run with:  node tools/gen-safelist.js
 *
 * Why a generator instead of a hand-maintained list: classes added by
 * molique's own JS are invisible in the HTML, so PurgeCSS would strip
 * them. A hand-written list would drift out of sync the moment a new
 * module shipped - this one rebuilds itself from the code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- 1. Universe: classes and keyframes from every CSS bundle ---------- */

const cssFiles = fs.readdirSync(path.join(root, 'css')).filter((f) => f.endsWith('.css'));
const cssText = cssFiles.map((f) => fs.readFileSync(path.join(root, 'css', f), 'utf8')).join('\n');

const cssClasses = new Set();
for (const m of cssText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) cssClasses.add(m[1]);

const keyframesDefined = [...new Set([...cssText.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))];

/* ---------- 2. JS sources ---------- */

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

/* ---------- 3. Classes PurgeCSS won't see in the HTML ---------- */

const found = new Set();
const addIfReal = (name) => {
  if (name && cssClasses.has(name)) found.add(name);
};

// a) toggled: classList.add/remove/toggle('x')
for (const m of jsText.matchAll(/classList\.(?:add|remove|toggle)\(\s*['"]([\w-]+)['"]/g)) addIfReal(m[1]);

// b) assigned: className = 'a b c'
for (const m of jsText.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g)) m[1].split(/\s+/).forEach(addIfReal);

// c) markup built in JS: class="a b c"
for (const m of jsText.matchAll(/class=["']([^"']+)["']/g)) m[1].split(/\s+/).forEach(addIfReal);

// d) literals in maps/constants (e.g. TOAST_TYPE) - only hyphenated names,
//    so it doesn't catch ordinary words ('input', 'js') used in another context.
for (const m of jsText.matchAll(/['"]([a-zA-Z][\w]*-[\w-]+)['"]/g)) addIfReal(m[1]);

// e) keyframes used ONLY from JS (no CSS rule references them)
const keyframesOnlyJs = keyframesDefined.filter(
  (k) => jsText.includes(k) && !new RegExp(`animation[^;}]*\\b${k}\\b`).test(cssText)
);

// State classes (.is-*) are covered by the pattern, so we don't duplicate them literally.
const standard = [...found].filter((c) => !c.startsWith('is-')).sort();
const isStateCount = [...cssClasses].filter((c) => c.startsWith('is-')).length;

/* ---------- 4. Write the file ---------- */

const stamp = new Date().toISOString().slice(0, 10);
const list = (arr) => arr.map((v) => `    '${v}',`).join('\n');

const out = `/**
 * molique - PurgeCSS safelist
 *
 * AUTO-GENERATED FILE - do not edit by hand.
 * Source: tools/gen-safelist.js   |   Regenerate with: node tools/gen-safelist.js
 * Generated: ${stamp}
 *
 * WHY THIS EXISTS: some molique classes never appear in the HTML - they're
 * added by JS at runtime (states, carousel/lightbox/toast markup).
 * PurgeCSS can't see them and would strip them, breaking the components.
 *
 * USAGE (purgecss.config.js or postcss.config.js):
 *
 *   const molique = require('./purgecss.safelist.cjs');
 *
 *   safelist: molique.runtime        // MINIMUM - molique breaks without this
 *   safelist: molique.all            // runtime + every utility family
 *   safelist: molique.merge('colors', 'grid')   // runtime + selected families
 */

/* =========================================================================
   TIER 1 - RUNTIME (mandatory)
   Classes created/toggled by molique's own JS. Skipping this = broken components.
   ========================================================================= */

const runtime = {
  standard: [
${list(standard)}
  ],
  // molique's state-class convention. A pattern instead of a literal list,
  // since it also protects classes toggled by YOUR OWN code (e.g.
  // .step.is-completed).
  // Covers ${isStateCount} .is-* classes in the CSS.
  greedy: [/^is-/],
  // Animation triggered from an inline style in JS - no CSS rule
  // references it, so the keyframes:true option would remove it.
  keyframes: [
${list(keyframesOnlyJs)}
  ],
};

/* =========================================================================
   TIER 2 - UTILITY FAMILIES (optional, pick your own)
   molique has NO WAY of knowing whether your backend assembles class names
   dynamically - e.g. class="opacity-<?= $x ?>" or a status from a database
   field. Such classes don't exist in any file, so PurgeCSS will strip
   them. Enable ONLY the groups you actually generate dynamically - every
   enabled group is a smaller win.
   ========================================================================= */

const families = {
  // .bg-*, .text-*, .border-* - colors/sizes driven from a CMS
  colors: [/^bg-/, /^text-/, /^border-/],
  // .col-span-*, .col-md-span-*, .offset-*, .grid-cols-* - layout from a CMS field
  grid: [/^col-/, /^offset-/, /^grid-cols-/],
  // margins/paddings/gaps assembled in a loop
  spacing: [/^m[trblxy]?-/, /^p[trblxy]?-/, /^gap-/],
  // statuses from a database enum: .badge-*, .status-*, .stock-bar-*, .opacity-*
  status: [/^badge-/, /^status-/, /^stock-bar-/, /^overlay-/, /^opacity-/],
};

/* ---------- Assembly ---------- */

function merge(...groups) {
  const greedy = [...runtime.greedy];
  for (const g of groups) {
    if (!families[g]) throw new Error('Unknown safelist group: ' + g);
    greedy.push(...families[g]);
  }
  return { standard: runtime.standard, greedy, keyframes: runtime.keyframes };
}

const all = merge(...Object.keys(families));

module.exports = { runtime, families, merge, all };
`;

fs.writeFileSync(path.join(root, 'purgecss.safelist.cjs'), out);

console.log('purgecss.safelist.cjs written');
console.log('  Tier 1 standard : ' + standard.length + ' classes');
console.log('  Tier 1 greedy   : /^is-/ (covers ' + isStateCount + ' classes)');
console.log('  Tier 1 keyframes: ' + (keyframesOnlyJs.join(', ') || '(none)'));
console.log('  Tier 2 groups   : 4 (colors, grid, spacing, status)');
