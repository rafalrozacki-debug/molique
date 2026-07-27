/**
 * molique-jit - Emitter
 *
 * Skleja dopasowane fragmenty w gotowy arkusz CSS, zachowujac kolejnosc
 * warstw frameworka (reset, base, layout, components, modules, utilities).
 * Zmienne motywu (:root + [data-theme="dark"]) sa dolaczane ZAWSZE, bez
 * wzgledu na to, co zostalo zeskanowane - filtrowanie ich ryzykowaloby
 * ciche zepsucie dark mode / anti-FOUC u konsumenta, a ich koszt (kilka KB)
 * jest znikomy w porownaniu do tego ryzyka.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { LoadedData } from './lookup.js';

const LAYER_DECLARATION = '@layer reset, base, layout, components, modules, utilities;';

export function emit(data: LoadedData, matchedUtilityClasses: string[], matchedComponentIds: string[]): string {
  const parts: string[] = [LAYER_DECLARATION];

  parts.push(fs.readFileSync(data.rootCssPath, 'utf8'));
  // "base" (reset, typografia bazowa, .container/.container-fluid) jest tak
  // samo "mandatory" jak zmienne motywu - bez niego strona nie renderuje sie
  // poprawnie niezaleznie od tego, jakie klasy zostaly zeskanowane.
  parts.push(fs.readFileSync(data.baseCssPath, 'utf8'));

  // Komponenty jako CALE, juz skompilowane pliki chunkow (dokladnie ta sama
  // tresc, ktora dzis produkuje tools/gen-chunks.js) - nie probujemy wycinac
  // pojedynczych regul, bo komponenty zawieraja selektory zlozone i
  // zalezne od struktury DOM (np. ":has()", sasiedztwo elementow), ktorych
  // sam skan klas nie potrafi bezpiecznie odtworzyc czesciowo.
  for (const id of matchedComponentIds) {
    const file = path.join(data.componentsDir, `molique-${id}.css`);
    if (fs.existsSync(file)) parts.push(fs.readFileSync(file, 'utf8'));
  }

  parts.push('@layer utilities{' + utilitiesLayerBody(data, matchedUtilityClasses) + '}');

  return parts.join('');
}

function utilitiesLayerBody(data: LoadedData, matchedUtilityClasses: string[]): string {
  // Grupowanie po identycznym zestawie warunkow (wrappers), zeby np. 30
  // dopasowanych klas "-md-" wylladowalo w JEDNYM @media, a nie w 30
  // powtorzonych blokach.
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
