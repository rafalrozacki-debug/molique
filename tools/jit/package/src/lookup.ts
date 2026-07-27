/**
 * molique-jit - Lookup
 *
 * Zero matematyki. Klasy narzedziowe molique sa skonczonym, w pelni
 * wyliczalnym zbiorem (petle @each nad stalymi mapami Sass) - caly ten
 * zbior zostal juz raz skompilowany przez prawdziwego Sassa i splaszczony
 * do utilities.json (patrz tools/gen-jit-utilities.js w repo molique).
 * Ten modul robi wylacznie odpytanie mapy: token -> gotowa regula CSS.
 * Zadnej reimplementacji `$space-amounts`, `-md-`, wariantow hover itd. -
 * to jedyny sposob, w jaki ten silnik nigdy nie moze rozjechac sie z
 * frameworkiem.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UtilitiesDictionary, ClassIndex, Safelist } from './types.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Po kompilacji ten plik siedzi w dist/lookup.js, a dane w ../data - czyli
// wzgledem package/ jest to zawsze "obok dist/", niezaleznie od tego, czy
// uruchamiamy zrodlo (ts-node) czy skompilowany JS.
const dataDir = path.resolve(here, '..', 'data');

export interface LoadedData {
  utilities: UtilitiesDictionary;
  classIndex: ClassIndex;
  safelist: Safelist;
  componentsDir: string;
  rootCssPath: string;
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) {
    throw new Error(
      `molique-jit: brak pliku danych "${file}". ` +
        'Ten pakiet nie jest kompletny bez tools/jit/package/data/ - ' +
        'w repo molique uruchom "npm run gen:jit-package-data" po gen:chunks i gen:jit-utilities.'
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
  };
}

export interface ResolveResult {
  matchedUtilityClasses: string[];
  matchedComponentIds: string[];
  unmatchedTokenCount: number;
}

/**
 * Dopasowuje zeskanowane tokeny do slownika. Token moze jednoczesnie trafic
 * w klase narzedziowa I byc wyzwalaczem komponentu (rzadkie, ale nie
 * wykluczone nazewniczo) - oba dopasowania sa wtedy uwzgledniane. Token bez
 * zadnego trafienia to po prostu klasa spoza molique (bootstrap, wlasny BEM
 * itd.) - nie jest to blad.
 */
export function resolve(tokens: Set<string>, data: LoadedData): ResolveResult {
  const effectiveTokens = new Set(tokens);
  for (const s of data.safelist.standard) effectiveTokens.add(s);

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
