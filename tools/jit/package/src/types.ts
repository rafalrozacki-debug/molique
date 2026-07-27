/**
 * molique-jit - wspolne typy danych
 *
 * Ksztalty ponizej musza zgadzac sie 1:1 z tym, co zapisuja skrypty w
 * repozytorium molique (tools/gen-jit-utilities.js, tools/gen-chunks.js,
 * tools/gen-jit-package-data.js) do tools/jit/package/data/. molique-jit
 * NIGDY nie liczy tych danych samodzielnie - tylko je czyta.
 */

/** Pojedyncza skompilowana regula CSS nalezaca do jednej klasy narzedziowej. */
export interface UtilityRule {
  /** Pelny tekst selektora, np. ".text-hover-primary:hover". */
  selector: string;
  /**
   * Warunki opakowujace regule, od zewnetrznego do wewnetrznego, np.
   * ["@media (min-width: 768px)", "@supports (animation-timeline: view())"].
   * Pusta tablica = brak warunku.
   */
  wrappers: string[];
  /** Deklaracje CSS (bez selektora i klamer), np. "color:var(--primary) !important". */
  css: string;
}

/** Fragment CSS bez zadnej klasy w selektorze (np. @keyframes, @property) - zawsze dolaczany. */
export interface AlwaysIncludeEntry {
  /** Kompletny, juz opakowany fragment CSS, gotowy do wklejenia verbatim. */
  raw: string;
}

export interface UtilitiesDictionary {
  generated: string;
  sources: string[];
  classCount: number;
  ruleCount: number;
  alwaysIncludeCount: number;
  classes: Record<string, UtilityRule[]>;
  alwaysInclude: AlwaysIncludeEntry[];
}

/** Klasa CSS -> ID chunka komponentu (np. "card" -> "cards"). */
export interface ClassIndex {
  generated: string;
  classes: Record<string, string>;
}

/** Klasy zawsze wlaczane, niezaleznie od tego, co zeskanowano (tier "runtime" z purgecss.safelist.cjs). */
export interface Safelist {
  standard: string[];
}

export interface BuildOptions {
  /** Globy fast-glob wskazujace pliki projektu do zeskanowania (HTML/PHP/JS). */
  content: string[];
  /** Katalog, wzgledem ktorego rozwiazywane sa globy z `content`. */
  cwd: string;
  /** Sciezka pliku wyjsciowego CSS. */
  outFile: string;
  verbose?: boolean;
}

export interface BuildResult {
  css: string;
  matchedUtilityClasses: string[];
  matchedComponents: string[];
  unmatchedTokenCount: number;
}
