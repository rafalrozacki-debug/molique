/**
 * molique-jit - Lookup
 *
 * Zero math. molique's utility classes are a finite, fully enumerable set
 * (@each loops over fixed Sass maps) - that entire set has already been
 * compiled once by real Sass and flattened into utilities.json (see
 * tools/gen-jit-utilities.js in the molique repo). This module does
 * nothing but query the map: token -> ready-made CSS rule. No
 * reimplementation of `$space-amounts`, `-md-`, hover variants, etc. -
 * this is the only reason this engine can never drift from the framework.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UtilitiesDictionary, ClassIndex, Safelist } from './types.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// After compilation this file lives in dist/lookup.js, and the data in
// ../data - so relative to package/ it's always "next to dist/",
// regardless of whether we're running the source (ts-node) or the
// compiled JS.
const dataDir = path.resolve(here, '..', 'data');

export interface LoadedData {
  utilities: UtilitiesDictionary;
  classIndex: ClassIndex;
  safelist: Safelist;
  componentsDir: string;
  /** Theme variables (:root + dark mode) - "mandatory" in gen-chunks.js, always included. */
  rootCssPath: string;
  /** Reset, base typography, .container/.container-fluid - also "mandatory", always included. */
  baseCssPath: string;
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) {
    throw new Error(
      `molique-jit: missing data file "${file}". ` +
        'This package is not complete without tools/jit/package/data/ - ' +
        'in the molique repo run "npm run gen:jit-package-data" after gen:chunks and gen:jit-utilities.'
    );
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function loadData(): LoadedData {
  return {
    utilities: readJson<UtilitiesDictionary>(path.join(dataDir, 'utilities.json')),
    classIndex: readJson<ClassIndex>(path.join(dataDir, 'class-index.json')),
    safelist: readJson<Safelist>(path.join(dataDir, 'safelist.json')),
    componentsDir: path.join(dataDir, 'components'),
    rootCssPath: path.join(dataDir, 'molique-root.css'),
    baseCssPath: path.join(dataDir, 'molique-base.css'),
  };
}

export interface ResolveResult {
  matchedUtilityClasses: string[];
  matchedComponentIds: string[];
  unmatchedTokenCount: number;
}

/**
 * Matches scanned tokens against the dictionary. A token can hit a
 * utility class AND be a component trigger at the same time (rare, but
 * not ruled out by naming) - both matches are then taken into account. A
 * token with no match at all is simply a class outside molique
 * (Bootstrap, a project's own BEM, etc.) - not an error.
 */
export function resolve(tokens: Set<string>, data: LoadedData, extraSafelist: string[] = []): ResolveResult {
  const effectiveTokens = new Set(tokens);
  for (const s of data.safelist.standard) effectiveTokens.add(s);
  for (const s of extraSafelist) effectiveTokens.add(s);

  const matchedUtilityClasses: string[] = [];
  const matchedComponentIds = new Set<string>();
  let unmatchedTokenCount = 0;

  for (const token of effectiveTokens) {
    let found = false;
    if (data.utilities.classes[token]) {
      matchedUtilityClasses.push(token);
      found = true;
    }
    const componentId = data.classIndex.classes[token];
    if (componentId) {
      matchedComponentIds.add(componentId);
      found = true;
    }
    if (!found) unmatchedTokenCount++;
  }

  return {
    matchedUtilityClasses,
    matchedComponentIds: [...matchedComponentIds].sort(),
    unmatchedTokenCount,
  };
}
