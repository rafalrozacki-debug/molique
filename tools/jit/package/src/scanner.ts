/**
 * molique-jit - Scanner
 *
 * Wydobywa surowe tokeny (kandydatow na klasy molique) z plikow projektu.
 * Bezkontekstowy regex - celowo: molique zabrania sklejania nazw klas w JS
 * ("NIGDY nie sklejaj nazw klas dynamicznie", molique.md), wiec kazda
 * realna klasa istnieje gdzies jako literalny string. Cache per-plik
 * (`Map<sciezka, Set<token>>`) jest tu od razu, mimo ze tryb watch to
 * dopiero kolejna faza - przebudowa jednego pliku w watchu ma polegac na
 * podmianie jednego wpisu w tej mapie, a nie ponownym skanowaniu wszystkiego.
 */

import fs from 'node:fs';
import fg from 'fast-glob';

const TOKEN_RE = /[a-zA-Z0-9_:-]+/g;

export interface ScanOptions {
  content: string[];
  cwd: string;
}

export interface ScanResult {
  /** Suma tokenow ze wszystkich zeskanowanych plikow. */
  tokens: Set<string>;
  /** Token cache per plik - podstawa pod przyszly tryb watch. */
  fileCache: Map<string, Set<string>>;
}

function tokensOf(text: string): Set<string> {
  const set = new Set<string>();
  for (const m of text.matchAll(TOKEN_RE)) set.add(m[0]);
  return set;
}

export async function scan(options: ScanOptions): Promise<ScanResult> {
  const files = await fg(options.content, {
    cwd: options.cwd,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  const fileCache = new Map<string, Set<string>>();
  const tokens = new Set<string>();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const found = tokensOf(text);
    fileCache.set(file, found);
    for (const t of found) tokens.add(t);
  }

  return { tokens, fileCache };
}

/** Reskanuje POJEDYNCZY plik i zwraca zaktualizowany zbior tokenow - do uzycia w przyszlym trybie watch. */
export function rescanFile(file: string, fileCache: Map<string, Set<string>>): Set<string> {
  const text = fs.readFileSync(file, 'utf8');
  const found = tokensOf(text);
  fileCache.set(file, found);
  return found;
}

/** Sumuje wszystkie tokeny z aktualnego stanu cache - wywolywane po kazdej zmianie w trybie watch. */
export function unionTokens(fileCache: Map<string, Set<string>>): Set<string> {
  const tokens = new Set<string>();
  for (const set of fileCache.values()) {
    for (const t of set) tokens.add(t);
  }
  return tokens;
}
