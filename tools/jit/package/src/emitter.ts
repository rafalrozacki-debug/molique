/**
 * molique-jit - Emitter
 *
 * Assembles the matched fragments into a finished CSS stylesheet,
 * preserving the framework's layer order (reset, base, layout,
 * components, modules, utilities). Theme variables (:root +
 * [data-theme="dark"]) are ALWAYS included, regardless of what was
 * scanned - filtering them would risk silently breaking dark mode /
 * anti-FOUC for the consumer, and their cost (a few KB) is negligible
 * compared to that risk.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { LoadedData } from './lookup.js';

const LAYER_DECLARATION = '@layer reset, base, layout, components, modules, utilities;';

// Every chunk in dist/chunks/ carries its OWN copy of LAYER_DECLARATION at
// the start of the file (gen-chunks.js adds it to each one so it also
// works when used standalone, outside this emitter) - when concatenating
// multiple chunks it has to be stripped from ALL but the one we add
// ourselves above. Exactly the same rule and regex as in the configurator
// (src/builder.js, LAYER_DECL) - see also the note in
// dist/chunks/manifest.json: "When concatenating, keep the layer
// declaration ONLY ONCE (the first)." Without this, a typical build would
// duplicate it dozens of times (once per chunk).
const LAYER_DECL_RE = /@layer\s+reset\s*,\s*base\s*,\s*layout\s*,\s*components\s*,\s*modules\s*,\s*utilities\s*;/g;

function stripLayerDeclaration(css: string): string {
  return css.replace(LAYER_DECL_RE, '');
}

export function emit(data: LoadedData, matchedUtilityClasses: string[], matchedComponentIds: string[]): string {
  const parts: string[] = [LAYER_DECLARATION];

  parts.push(stripLayerDeclaration(fs.readFileSync(data.rootCssPath, 'utf8')));
  // "base" (reset, base typography, .container/.container-fluid) is just
  // as "mandatory" as the theme variables - without it the page won't
  // render correctly no matter which classes were scanned.
  parts.push(stripLayerDeclaration(fs.readFileSync(data.baseCssPath, 'utf8')));

  // Components as WHOLE, already-compiled chunk files (the exact same
  // content that tools/gen-chunks.js produces today) - we don't try to
  // cut out individual rules, because components contain composite
  // selectors dependent on DOM structure (e.g. ":has()", element
  // adjacency) that a plain class scan cannot safely reconstruct
  // partially.
  for (const id of matchedComponentIds) {
    const file = path.join(data.componentsDir, `molique-${id}.css`);
    if (fs.existsSync(file)) parts.push(stripLayerDeclaration(fs.readFileSync(file, 'utf8')));
  }

  parts.push('@layer utilities{' + utilitiesLayerBody(data, matchedUtilityClasses) + '}');

  return parts.join('');
}

function utilitiesLayerBody(data: LoadedData, matchedUtilityClasses: string[]): string {
  // Grouping by identical condition set (wrappers), so that e.g. 30
  // matched "-md-" classes land in a SINGLE @media block, not 30
  // repeated blocks.
  const groups = new Map<string, { wrappers: string[]; body: string[] }>();

  for (const cls of matchedUtilityClasses) {
    for (const rule of data.utilities.classes[cls] ?? []) {
      const key = JSON.stringify(rule.wrappers);
      let group = groups.get(key);
      if (!group) {
        group = { wrappers: rule.wrappers, body: [] };
        groups.set(key, group);
      }
      group.body.push(`${rule.selector}{${rule.css}}`);
    }
  }

  let inner = '';
  for (const { wrappers, body } of groups.values()) {
    const joined = body.join('');
    inner += wrappers.length ? wrappers.reduceRight((acc, head) => head + '{' + acc + '}', joined) : joined;
  }

  for (const entry of data.utilities.alwaysInclude) inner += entry.raw;

  return inner;
}
