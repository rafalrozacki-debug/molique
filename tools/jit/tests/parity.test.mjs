/**
 * molique-jit - parity test (Phase 3)
 *
 * The only safety net the "lookup table" architecture needs:
 * tools/jit/dist-data/utilities.json does NOT compute CSS itself, it only
 * copies already-compiled declarations from dist/chunks/molique-utilities*.css.
 * This test checks whether what's in utilities.json actually matches an
 * INDEPENDENTLY compiled css/molique-style.css (a full site build, a
 * separate Sass compilation) - the only way this could "not match" is if
 * someone changed the SCSS and forgot to run
 * `npm run gen:chunks && npm run gen:jit-utilities` (or the other way
 * around - css/molique-style.css is stale).
 *
 * DELIBERATELY its own, second implementation of CSS rule extraction (not
 * an import from tools/gen-jit-utilities.js) - if the test used the SAME
 * function as the production generator, it would be tautological and
 * would never catch a bug in that function.
 *
 * Run:  node --test tools/jit/tests/
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const utilitiesPath = path.join(root, 'tools', 'jit', 'dist-data', 'utilities.json');
const siteStylesheetPath = path.join(root, 'css', 'molique-style.css');

/* ---------- Normalization (evens out compressed/pretty formatting differences) ---------- */

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
// @media declarations/conditions: whitespace has no semantic meaning - strip it entirely.
// Sass compression (--style=compressed, used by gen-chunks.js) additionally:
//  - shortens "0.4" to ".4" (lossless, cosmetic),
//  - lowercases hex codes (#14162B -> #14162b, also cosmetic),
//  - replaces the "transparent" keyword with "rgba(0,0,0,0)" (documented
//    Dart Sass compressed behavior - avoids a known interpolation bug
//    where "transparent" is treated as black in older browsers;
//    semantically the same color, not a real divergence).
// The "pretty" css/molique-style.css doesn't do any of these three things,
// so they need to be evened out on both sides of the comparison.
const norm = (s) =>
  s
    .replace(/\s+/g, '')
    .replace(/(?<![\d.])0+(\.\d+)/g, '$1')
    .replace(/#[0-9A-Fa-f]{3,8}\b/g, (m) => m.toLowerCase())
    // Sass compression shortens a six-digit hex to three digits when
    // possible (#ffffff -> #fff) - the same color, just a shorter notation.
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/g, '#$1$2$3')
    .replace(/\btransparent\b/g, 'rgba(0,0,0,0)')
    // Dart Sass compressed picks hsla() as the canonical form for pure
    // white with alpha - rgba(255,255,255,x) in "pretty" is the same color.
    .replace(/rgba\(255,255,255,/g, 'hsla(0,0%,100%,');
// Selectors: a space can be a DESCENDANT COMBINATOR (".bg-video img" != ".bg-videoimg")
// - it's fine to collapse multiple spaces into one, but not to remove them entirely.
// A TRAP caught in the wild: ownerOf() MUST receive this variant, not norm() -
// otherwise ".bg-video img" loses its space and the merged "bg-videoimg" gets
// read as a single (false) class token.
// The ">"/"+"/"~"  combinators, on the other hand, have PURELY cosmetic spacing
// ("input:checked + .x" == "input:checked+.x") - Sass compression removes it,
// so it needs to be done on both sides of the comparison, otherwise it's a false alarm.
const normSelector = (s) =>
  s
    .trim()
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\s+/g, ' ');

/* ---------- Mini-walker (its own copy, not an import - see the comment above) ---------- */

function firstBlock(text, matchAtStart) {
  const m = matchAtStart.exec(text);
  if (!m) return null;
  const braceIdx = text.indexOf('{', m.index + m[0].length - 1);
  if (braceIdx === -1) throw new Error('Unclosed brace after "' + m[0] + '"');
  let depth = 0;
  for (let i = braceIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(braceIdx + 1, i);
  }
  throw new Error('Unclosed block "' + m[0] + '"');
}

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

/**
 * class||selector(norm.)||wrappers(norm., joined by '>') -> a list of declaration
 * variants (a Set per occurrence). A LIST, not a single entry - some
 * selectors (e.g. ".hover-opacity-100" in _helpers.scss) are defined in
 * SCSS MORE THAN ONCE with different declarations (the second, later
 * version with !important wins the cascade) - "first match wins" would
 * lose that second, correctly-winning version and falsely accuse
 * utilities.json (which correctly stores BOTH variants) of a mismatch.
 */
function extractReference(cssText) {
  const clean = stripComments(cssText);
  const body = firstBlock(clean, /@layer\s+utilities(?![\w-])/);
  assert.ok(body, '"@layer utilities{...}" not found in css/molique-style.css - the file format changed, fix the test.');

  const reference = new Map();

  function walk(content, wrappers) {
    for (const stmt of splitTopLevel(content)) {
      if (/^@media\b/.test(stmt.head) || /^@supports\b/.test(stmt.head)) {
        walk(stmt.body, [...wrappers, norm(stmt.head)]);
        continue;
      }
      if (/^@layer\b/.test(stmt.head)) {
        walk(stmt.body, wrappers);
        continue;
      }
      if (stmt.head.startsWith('@')) continue; // @keyframes/@property/other - out of scope for this test (alwaysInclude)
      for (const rawSelector of stmt.head.split(',')) {
        const selector = normSelector(rawSelector);
        if (!selector) continue;
        const owner = ownerOf(selector);
        if (!owner) continue;
        const key = owner + '||' + selector + '||' + wrappers.join('>');
        if (!reference.has(key)) reference.set(key, []);
        reference.get(key).push(new Set(norm(stmt.body).split(';').filter(Boolean)));
      }
    }
  }

  walk(body, []);
  return reference;
}

/* ---------- Test ---------- */

test('utilities.json matches an independently compiled css/molique-style.css', async (t) => {
  assert.ok(fs.existsSync(utilitiesPath), `Missing ${utilitiesPath} - run npm run gen:jit-utilities.`);
  assert.ok(fs.existsSync(siteStylesheetPath), `Missing ${siteStylesheetPath}.`);

  const utilities = JSON.parse(fs.readFileSync(utilitiesPath, 'utf8'));
  const reference = extractReference(fs.readFileSync(siteStylesheetPath, 'utf8'));

  // "utilities-extended" is an OPT-IN module (see the header of
  // _utilities-extended.scss: "not included in the default bundle") -
  // css/molique-style.css (the site bundle) DELIBERATELY doesn't include
  // it, so comparing these classes against this file would always end in
  // a false alarm. For them we do a lighter sanity check (non-empty
  // content), not a full comparison against an independent source.
  const EXTENDED_SOURCE = 'molique-utilities-extended.css';

  let checkedAgainstSite = 0;
  let checkedExtendedOnly = 0;

  for (const [className, rules] of Object.entries(utilities.classes)) {
    await t.test(className, () => {
      for (const rule of rules) {
        if (rule.source === EXTENDED_SOURCE) {
          assert.ok(rule.css.trim().length > 0, `Empty rule for "${rule.selector}" (utilities-extended).`);
          checkedExtendedOnly++;
          continue;
        }
        const key = className + '||' + normSelector(rule.selector) + '||' + rule.wrappers.map(norm).join('>');
        const refDecls = reference.get(key);
        assert.ok(
          refDecls,
          `Missing "${rule.selector}" (conditions: ${rule.wrappers.join(' > ') || 'none'}) in css/molique-style.css - ` +
            'utilities.json is stale relative to the SCSS. Run: npm run gen:chunks && npm run gen:jit-utilities.'
        );
        const myDecls = [...new Set(norm(rule.css).split(';').filter(Boolean))].sort();
        const matches = refDecls.some((set) => {
          const sorted = [...set].sort();
          return sorted.length === myDecls.length && sorted.every((v, i) => v === myDecls[i]);
        });
        assert.ok(
          matches,
          `Declarations for "${rule.selector}" don't match any of the ${refDecls.length} variants in css/molique-style.css.\n` +
            `  utilities.json: ${myDecls.join(';')}\n` +
            refDecls.map((s, i) => `  variant ${i}: ${[...s].sort().join(';')}`).join('\n')
        );
        checkedAgainstSite++;
      }
    });
  }

  assert.ok(
    checkedAgainstSite > 500,
    `Suspiciously few rules verified against css/molique-style.css (${checkedAgainstSite}).`
  );
  assert.ok(checkedExtendedOnly > 0, 'No rules found from the opt-in "utilities-extended" module - check the test\'s scope.');
});
