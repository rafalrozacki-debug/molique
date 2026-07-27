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

// Kazdy chunk w dist/chunks/ niesie WLASNA kopie LAYER_DECLARATION na
// poczatku pliku (gen-chunks.js dopisuje ja do kazdego, zeby dzialal tez
// uzyty samodzielnie, poza tym emitterem) - przy sklejaniu wielu chunkow
// trzeba ja usunac ze WSZYSTKICH oprocz jednej, ktora sama dopisujemy
// wyzej. Dokladnie ta sama zasada i regex co w konfiguratorze
// (src/builder.js, LAYER_DECL) - patrz tez notatka w dist/chunks/manifest.json:
// "Sklejajac, zostaw deklaracje warstw TYLKO RAZ (pierwsza)". Bez tego
// typowy build dublowal ja dziesiatki razy (raz na chunk).
const LAYER_DECL_RE = /@layer\s+reset\s*,\s*base\s*,\s*layout\s*,\s*components\s*,\s*modules\s*,\s*utilities\s*;/g;

function stripLayerDeclaration(css: string): string {
  return css.replace(LAYER_DECL_RE, '');
}

export function emit(data: LoadedData, matchedUtilityClasses: string[], matchedComponentIds: string[]): string {
  const parts: string[] = [LAYER_DECLARATION];

  parts.push(stripLayerDeclaration(fs.readFileSync(data.rootCssPath, 'utf8')));
  // "base" (reset, typografia bazowa, .container/.container-fluid) jest tak
  // samo "mandatory" jak zmienne motywu - bez niego strona nie renderuje sie
  // poprawnie niezaleznie od tego, jakie klasy zostaly zeskanowane.
  parts.push(stripLayerDeclaration(fs.readFileSync(data.baseCssPath, 'utf8')));

  // Komponenty jako CALE, juz skompilowane pliki chunkow (dokladnie ta sama
  // tresc, ktora dzis produkuje tools/gen-chunks.js) - nie probujemy wycinac
  // pojedynczych regul, bo komponenty zawieraja selektory zlozone i
  // zalezne od struktury DOM (np. ":has()", sasiedztwo elementow), ktorych
  // sam skan klas nie potrafi bezpiecznie odtworzyc czesciowo.
  for (const id of matchedComponentIds) {
    const file = path.join(data.componentsDir, `molique-${id}.css`);
    if (fs.existsSync(file)) parts.push(stripLayerDeclaration(fs.readFileSync(file, 'utf8')));
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
