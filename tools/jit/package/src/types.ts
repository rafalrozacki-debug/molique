/**
 * molique-jit - shared data types
 *
 * The shapes below must match 1:1 what the scripts in the molique
 * repository (tools/gen-jit-utilities.js, tools/gen-chunks.js,
 * tools/gen-jit-package-data.js) write to tools/jit/package/data/.
 * molique-jit NEVER computes this data itself - it only reads it.
 */

/** A single compiled CSS rule belonging to one utility class. */
export interface UtilityRule {
  /** Full selector text, e.g. ".text-hover-primary:hover". */
  selector: string;
  /**
   * Conditions wrapping the rule, from outermost to innermost, e.g.
   * ["@media (min-width: 768px)", "@supports (animation-timeline: view())"].
   * Empty array = no condition.
   */
  wrappers: string[];
  /** CSS declarations (without selector and braces), e.g. "color:var(--primary) !important". */
  css: string;
  /** Name of the source chunk, e.g. "molique-utilities-extended.css" (opt-in module). */
  source: string;
}

/** A CSS fragment with no class in its selector (e.g. @keyframes, @property) - always included. */
export interface AlwaysIncludeEntry {
  /** Complete, already-wrapped CSS fragment, ready to be inserted verbatim. */
  raw: string;
  source: string;
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

/** CSS class -> component chunk ID (e.g. "card" -> "cards"). */
export interface ClassIndex {
  generated: string;
  classes: Record<string, string>;
}

/** Classes always included, regardless of what was scanned (the "runtime" tier from purgecss.safelist.cjs). */
export interface Safelist {
  standard: string[];
}

export interface BuildOptions {
  /** fast-glob patterns pointing to the project files to scan (HTML/PHP/JS). */
  content: string[];
  /** Directory the `content` globs are resolved against. */
  cwd: string;
  /** Output CSS file path. */
  outFile: string;
  /** Extra, always-included classes (from molique.config.mjs -> safelist) - on top of molique's built-in runtime safelist. */
  safelist?: string[];
  verbose?: boolean;
}

export interface BuildResult {
  css: string;
  matchedUtilityClasses: string[];
  matchedComponents: string[];
  unmatchedTokenCount: number;
}
