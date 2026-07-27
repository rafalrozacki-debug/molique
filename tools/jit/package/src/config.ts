/**
 * molique-jit - Konfiguracja (molique.config.mjs)
 *
 * Schemat pliku konfiguracyjnego uzytkownika - nigdzie wczesniej formalnie
 * nie zdefiniowany (oryginalny cli-spec.md tylko o nim wspominal). Plik jest
 * zwyklym modulem ESM z domyslnym eksportem obiektu {@link MoliqueConfig}.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Jeden niezalezny cel budowania: wlasny zestaw plikow zrodlowych i wlasny plik wyjsciowy. */
export interface ConfigTarget {
  content: string[];
  output: string;
}

export interface MoliqueConfig {
  /** Globy (wzgledem lokalizacji pliku konfiguracyjnego) do zeskanowania. */
  content?: string[];
  /** Sciezka pliku wyjsciowego CSS (wzgledem lokalizacji pliku konfiguracyjnego). */
  output?: string;
  /**
   * Wlasne, dynamicznie skladane klasy (np. backend PHP:
   * `badge-<?= $status ?>`), ktorych sam skan literalow nie znajdzie.
   * Klasy runtime'owe SAMEGO molique (toasty, karuzela, lightbox itd.) sa
   * dolaczane automatycznie i NIE trzeba ich tu dublowac - to lista TYLKO
   * na klasy specyficzne dla projektu konsumenta.
   */
  safelist?: string[];
  /**
   * Kompresja wyjscia. Domyslnie true - dane zrodlowe (chunki komponentow,
   * warstwa utilities) sa juz kompresowane u zrodla (gen-chunks.js,
   * --style=compressed), wiec w praktyce ta flaga dzis niczego dodatkowo
   * nie ubija - zostaje w schemacie dla zgodnosci z cli-spec.md i na
   * wypadek przyszlych zrodel danych, ktore moglyby nie byc juz skompresowane.
   */
  minify?: boolean;
  /**
   * Kilka niezaleznych celow z jednego configu (np. osobny, mniejszy plik
   * CSS na kazda landing page kampanii). Gdy podane i niepuste, ZASTEPUJE
   * pola `content`/`output` powyzej - kazdy target ma wlasny komplet.
   */
  targets?: ConfigTarget[];
}

export const DEFAULT_CONFIG_FILE = 'molique.config.mjs';
export const DEFAULT_CONTENT = ['**/*.html', '**/*.php'];
export const DEFAULT_OUTPUT = 'css/molique-jit.css';

/** Rozwija config do listy konkretnych celow - zawsze co najmniej jeden. */
export function resolveTargets(config: MoliqueConfig): ConfigTarget[] {
  if (config.targets && config.targets.length > 0) return config.targets;
  return [
    {
      content: config.content ?? DEFAULT_CONTENT,
      output: config.output ?? DEFAULT_OUTPUT,
    },
  ];
}

export async function loadConfig(configPath: string): Promise<MoliqueConfig> {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Brak pliku konfiguracyjnego: ${resolved}\nUruchom "molique-jit init" (lub "molique-jit start"), zeby go utworzyc.`
    );
  }
  const mod = (await import(pathToFileURL(resolved).href)) as { default?: MoliqueConfig };
  if (!mod.default) {
    throw new Error(`${resolved} nie ma domyslnego eksportu (export default { ... }).`);
  }
  return mod.default;
}

export const INIT_TEMPLATE = `export default {
  // Pliki projektu do zeskanowania w poszukiwaniu klas molique.
  content: ${JSON.stringify(DEFAULT_CONTENT)},

  // Gdzie zapisac wygenerowany CSS.
  output: ${JSON.stringify(DEFAULT_OUTPUT)},

  // Wlasne, dynamicznie skladane klasy (np. backend PHP:
  // \`badge-<?= $status ?>\`), ktorych skaner nie znajdzie jako literalu.
  // Klasy runtime'owe SAMEGO molique (toasty, karuzela, lightbox itd.)
  // dolaczane sa automatycznie - tej listy NIE trzeba nimi dublowac.
  safelist: [],

  // Kompresja wyjscia (patrz komentarz w dokumentacji - dane sa juz
  // skompresowane u zrodla).
  minify: true,

  // Opcjonalnie: kilka niezaleznych plikow CSS z jednego configu, np.
  // osobny, dedykowany plik dla landing page kampanii reklamowej. Gdy
  // podane, ZASTEPUJE pola content/output powyzej.
  // targets: [
  //   { content: ['landing-kampania.html'], output: 'css/landing-kampania.css' },
  // ],
};
`;
