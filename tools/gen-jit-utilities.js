/**
 * molique - utility-class dictionary generator for molique-jit
 *
 * Does NOT compile CSS from the Sass sources a second time. Reads the
 * already-compiled chunks `dist/chunks/molique-utilities.css` and
 * `dist/chunks/molique-utilities-extended.css` (produced by
 * `tools/gen-chunks.js` via real Sass) and flattens them into a class ->
 * list-of-CSS-rules map. This keeps exactly ONE place that runs Sass
 * (gen-chunks.js) - this script only consumes its output, so the spacing/
 * color math can never drift apart between the SCSS and the JIT engine.
 *
 * Run with:  node tools/gen-jit-utilities.js   (requires having already
 *            run node tools/gen-chunks.js - otherwise aborts with a message)
 * Output:    tools/jit/dist-data/utilities.json
 *
 * Class-ownership rule for compound selectors (e.g.
 * `[data-theme="dark"] .bg-glass` or `.stacking-container-snap .section-stacked`):
 * the LAST class in the selector owns the entry. This is a safe
 * simplification - at worst a compound rule gets included without its
 * parent class being scanned (a harmless "dead" CSS fragment, since the
 * descendant selector won't match any element without the parent in the
 * DOM anyway), never the other way around (it will never drop a rule that
 * should have been included).
 *
 * Rules with NO class at all in their selector (e.g. @keyframes,
 * @property, ::view-transition-*) can't be tied to a specific scanned
 * token - they go into a separate "alwaysInclude" pool, which the JIT
 * engine always includes regardless of what was scanned. This is the same
 * pattern as the existing "keyframes" tier in purgecss.safelist.cjs -
 * small, global fragments that are cheaper to always include than to
 * track which class uses them.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunksDir = path.join(root, 'dist', 'chunks');
const outDir = path.join(root, 'tools', 'jit', 'dist-data');
const outFile = path.join(outDir, 'utilities.json');

const SOURCES = ['molique-utilities.css', 'molique-utilities-extended.css'];

/* ---------- 1. Reading the chunks ---------- */

for (const name of SOURCES) {
  const p = path.join(chunksDir, name);
  if (!fs.existsSync(p)) {
    console.error(
      `\nMissing ${p}.\nRun first:  node tools/gen-chunks.js\n` +
      'This generator does NOT compile SCSS itself - it reads gen-chunks.js\'s output,' +
      ' so the utility-class math has one single source of truth.'
    );
    process.exit(1);
  }
}

/* ---------- 2. Generic CSS block walker ---------- */

// Finds the first "@name params{" block (tolerates no whitespace between
// tokens - Sass's --style=compressed doesn't insert any) and returns its
// content between the braces (without them).
function firstBlock(text, matchAtStart) {
  const m = matchAtStart.exec(text);
  if (!m) return null;
  const braceIdx = text.indexOf('{', m.index + m[0].length - 1);
  if (braceIdx === -1) throw new Error('Unclosed brace after "' + m[0] + '"');
  let depth = 0;
  for (let i = braceIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) {
      return { params: m[1] ? m[1].trim() : '', body: text.slice(braceIdx + 1, i) };
    }
  }
  throw new Error('Unclosed block "' + m[0] + '"');
}

// Splits the TOP-LEVEL content of a block into its statements (CSS rules
// or nested at-rules), respecting brace depth.
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

// classes: class name -> array of { selector, wrappers, css, source }
// alwaysInclude: fragments with no class at all - { raw, source } (already
// fully wrapped in every conditional @media/@supports, ready to paste
// verbatim). The "source" field (the chunk file's name) lets consumers
// (e.g. the parity test) distinguish classes from the default bundle from
// classes in the opt-in "utilities-extended" module - that second module
// is DELIBERATELY excluded from css/molique-style.css (see the "OPT-IN
// module" comment in _utilities-extended.scss), so comparing it against
// the full site build was always a flawed assumption, not real drift.
function walkRules(body, wrappers, source, classes, alwaysInclude, unmatchedLog) {
  for (const stmt of splitTopLevel(body)) {
    if (stmt.head.startsWith('@media') || stmt.head.startsWith('@supports')) {
      walkRules(stmt.body, [...wrappers, stmt.head], source, classes, alwaysInclude, unmatchedLog);
      continue;
    }
    if (stmt.head.startsWith('@layer')) {
      // A nested @layer utilities{...} (double-wrapped by gen-chunks.js +
      // the source file's own @layer) - transparent, the same effective
      // layer, adds no condition.
      walkRules(stmt.body, wrappers, source, classes, alwaysInclude, unmatchedLog);
      continue;
    }
    if (stmt.head.startsWith('@keyframes') || stmt.head.startsWith('@property')) {
      // Wrap it whole - do NOT recurse into it (percentage selectors like
      // "10%, 90%{...}" inside @keyframes aren't CSS classes).
      alwaysInclude.push({ raw: wrapRaw(stmt.head + '{' + stmt.body + '}', wrappers), source });
      unmatchedLog.push(stmt.head + ' (alwaysInclude)');
      continue;
    }
    if (stmt.head.startsWith('@')) {
      alwaysInclude.push({ raw: wrapRaw(stmt.head + '{' + stmt.body + '}', wrappers), source });
      unmatchedLog.push(stmt.head + ' (unrecognized at-rule, alwaysInclude)');
      continue;
    }
    for (const rawSelector of stmt.head.split(',')) {
      const selector = rawSelector.trim();
      if (!selector) continue;
      const owner = ownerOf(selector);
      if (!owner) {
        alwaysInclude.push({ raw: wrapRaw(selector + '{' + stmt.body + '}', wrappers), source });
        unmatchedLog.push(selector + ' (no class, alwaysInclude)');
        continue;
      }
      if (!classes[owner]) classes[owner] = [];
      classes[owner].push({ selector, wrappers, css: stmt.body.trim(), source });
    }
  }
}

/* ---------- 3. Processing both chunks ---------- */

const classes = {};
const alwaysInclude = [];
const unmatchedLog = [];

for (const name of SOURCES) {
  const text = fs.readFileSync(path.join(chunksDir, name), 'utf8');
  const layer = firstBlock(text, /@layer\s+utilities(?![\w-])/);
  if (!layer) {
    console.error(
      `\n${name}: "@layer utilities{...}" block not found.\n` +
      'The shape of the compiled CSS changed in a way this generator ' +
      'doesn\'t understand - fix the parser before trusting its output.'
    );
    process.exit(1);
  }
  walkRules(layer.body, [], name, classes, alwaysInclude, unmatchedLog);
}

// Deduplicate identical class entries (in case both chunks produced the
// exact same rule for the same class). "source" is deliberately OUTSIDE
// the key - an identical rule from two chunks is still one entry, the
// first hit decides the assigned source.
for (const cls of Object.keys(classes)) {
  const seen = new Set();
  classes[cls] = classes[cls].filter((entry) => {
    const key = entry.selector + '|' + entry.wrappers.join('>') + '|' + entry.css;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Deduplicate alwaysInclude by content (e.g. if both chunks had the same
// @property - not the case today, but safe for the future).
const dedupedAlways = [...new Map(alwaysInclude.map((e) => [e.raw, e])).values()];

/* ---------- 4. Write the file ---------- */

fs.mkdirSync(outDir, { recursive: true });

const classCount = Object.keys(classes).length;
const ruleCount = Object.values(classes).reduce((sum, arr) => sum + arr.length, 0);

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  note:
    'AUTO-GENERATED FILE - do not edit by hand. ' +
    'Source: tools/gen-jit-utilities.js, data from dist/chunks/molique-utilities*.css. ' +
    'Regenerate with: node tools/gen-chunks.js && node tools/gen-jit-utilities.js',
  sources: SOURCES,
  classCount,
  ruleCount,
  alwaysIncludeCount: dedupedAlways.length,
  classes,
  alwaysInclude: dedupedAlways,
};

fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n');

console.log('Utility classes indexed: ' + classCount);
console.log('Total CSS rules: ' + ruleCount);
console.log('Class-less fragments (alwaysInclude): ' + dedupedAlways.length);
if (unmatchedLog.length) {
  console.log('\nDetails (what went into alwaysInclude and why):');
  for (const s of [...new Set(unmatchedLog)]) console.log('  - ' + s);
}
console.log('\nWritten to: ' + path.relative(root, outFile));
