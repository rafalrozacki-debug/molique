/**
 * molique - CSS integrity checks
 *
 * Run with:  npm run test:css   (or: node tools/tests/css-integrity.test.js)
 *
 * WHY THIS EXISTS. Twice now a component has shipped
 * `animation: <name>` where `@keyframes <name>` existed in no bundle and no
 * chunk: `fadeInDown` (.dropdown-menu, .custom-select-dropdown,
 * .select-search-menu) and `fadeIn` (.chart .radial-value,
 * .feedback-invalid, .tab-pane). Six dead references in total. Nothing
 * warned: Sass compiles it, the browser ignores an unknown animation name,
 * the console stays clean, and the component just sits there without its
 * entrance effect. The only way anyone noticed was reading the CSS.
 *
 * Both cases had the same root cause: a GENERIC, shared keyframe name with
 * no owning component. Chunks (dist/chunks/molique-*.css) are built PER
 * COMPONENT, so a keyframe that belongs to no component ends up in none of
 * them - and in the full bundle it was simply never written at all.
 *
 * The rule this enforces: every animation name referenced in a stylesheet
 * must have its @keyframes IN THAT SAME stylesheet. That is stricter than
 * "somewhere in the project" on purpose - it is exactly the property that
 * makes a chunk usable standalone.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** CSS-wide keywords that may appear in the `animation` shorthand */
const ANIMATION_KEYWORDS = new Set([
  'none', 'initial', 'inherit', 'unset', 'revert', 'revert-layer',
  'infinite', 'alternate', 'alternate-reverse', 'reverse', 'normal',
  'forwards', 'backwards', 'both', 'running', 'paused',
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end',
]);

/** strip comments and at-rule preludes we do not care about */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function keyframesIn(css) {
  return new Set([...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map((m) => m[1]));
}

/**
 * Animation names actually referenced by declarations. Handles both
 * `animation-name: x` and the `animation:` shorthand, including comma-
 * separated lists, and skips functions like cubic-bezier(...)/steps(...).
 */
function animationNamesIn(css) {
  const names = new Set();

  for (const m of css.matchAll(/animation-name\s*:\s*([^;}]+)/g))
    for (const part of m[1].split(','))
      addCandidate(names, part.trim());

  for (const m of css.matchAll(/(?:^|[;{])\s*animation\s*:\s*([^;}]+)/g)) {
    for (const part of m[1].split(',')) {
      // drop timing functions and any other function call
      const cleaned = part.replace(/[\w-]+\([^)]*\)/g, ' ');
      for (const token of cleaned.trim().split(/\s+/)) addCandidate(names, token);
    }
  }
  return names;
}

function addCandidate(set, token) {
  if (!token) return;
  // a duration/delay/iteration count, a var(), a number - not a name
  if (!/^[a-zA-Z_-][\w-]*$/.test(token)) return;
  if (ANIMATION_KEYWORDS.has(token.toLowerCase())) return;
  set.add(token);
}

/* ---------- collect the stylesheets that ship ---------- */
const sheets = [];
for (const f of fs.readdirSync(path.join(ROOT, 'css')))
  if (f.endsWith('.css')) sheets.push(path.join('css', f));
const chunkDir = path.join(ROOT, 'dist', 'chunks');
if (fs.existsSync(chunkDir))
  for (const f of fs.readdirSync(chunkDir))
    if (f.endsWith('.css')) sheets.push(path.join('dist', 'chunks', f));

if (!sheets.length) {
  console.error('no stylesheets found - compile the bundles first');
  process.exit(1);
}

/* ---------- check ---------- */
let dead = 0;
let checked = 0;
for (const rel of sheets) {
  const css = stripComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  const defined = keyframesIn(css);
  const used = animationNamesIn(css);
  const missing = [...used].filter((n) => !defined.has(n)).sort();
  checked++;
  if (missing.length) {
    dead += missing.length;
    console.log('FAIL  ' + rel + '  ->  ' + missing.join(', '));
  }
}

if (dead) {
  console.log(
    `\n${dead} dead animation reference(s) across ${checked} stylesheet(s).\n` +
      'Define @keyframes in the SAME component file that uses it, and name it\n' +
      'after that component - a shared generic name belongs to no chunk.'
  );
  process.exit(1);
}
console.log(`PASS  ${checked} stylesheets, every animation resolves to a @keyframes in the same file`);
