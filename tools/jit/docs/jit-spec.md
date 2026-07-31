# Molique JIT - Specification (actual state after Phases 1-5)

> This document originally described the intended architecture (an engine
> computing CSS on the fly from mathematical dictionaries). After
> implementation it turned out that a better, safer approach was possible -
> see "Key architectural change" below. This file describes the architecture
> AS IT ACTUALLY TURNED OUT, not the original plan.

Molique JIT (npm package `molique-jit`, `tools/jit/package/`) analyzes the
consumer project's files, extracts the tokens used (candidates for molique
classes) and generates only the CSS that's needed. The engine is written in
Node.js/TypeScript.

## 0. Key architectural change: lookup table instead of a mathematical engine

Molique's utility classes (`.pb-md-4`, `.text-hover-primary` etc.) are **not
arbitrary** like in Tailwind (`w-[137px]`) - they're a finite, fully
enumerable set, defined by `@each` loops over fixed Sass maps. Instead of
reimplementing this math in a second place (which the original plan called
for - see `ast-schema.md`, historical section), the engine **doesn't compute
CSS on the fly at all**. Instead:

1. **In this repository** (once, on every SCSS change) the scripts
   `tools/gen-chunks.js` (already existing, produces compiled chunks
   `dist/chunks/molique-*.css` via real Sass) and
   `tools/gen-jit-utilities.js` (new) flatten the `utilities` layer into a
   flat map of `class-name -> ready-made CSS rule`
   (`tools/jit/dist-data/utilities.json`, committed to git just like
   `purgecss.safelist.cjs`).
2. `tools/gen-jit-package-data.js` packages this dictionary + the
   class-to-component map (`dist/chunks/class-index.json`, also produced by
   `gen-chunks.js`) + the compiled component files + the theme variables into
   the package data (`tools/jit/package/data/`, gitignored, reproducible at
   any time).
3. **In the `molique-jit` package** the engine does nothing but: scan ->
   match the token against the map (O(1) lookup, zero math) -> copy the
   ready-made CSS verbatim.

The result: zero reimplementation of `$space-amounts`, hover variants, or the
`-md-`/`-lg-` infix logic - if the SCSS changes, you just re-run the
generators and the JIT engine automatically reflects the change. The safety
of this approach is guaranteed by an automated parity test
(`tools/jit/tests/parity.test.mjs`, `npm run test:jit-parity`) - for every
class in the dictionary it compares it against the independently compiled
`css/molique-style.css`.

## 1. Pipeline architecture

### 1.1 Generators (in this repository, not in the package)

- **`tools/gen-chunks.js`** (extended in Phase 1) - besides its
  original role (CSS chunks for the `builder.html` configurator) it now also
  generates `dist/chunks/class-index.json`: a `class -> chunk ID` map, for
  components (`css/scss/components/*.scss`) AND three core chunks that
  behave like components (`buttons`, `grid`, `layout` - triggered by a
  single class, unlike `root`/`base`/`fonts`/`a11y`/`eink`, which are either
  always needed or never triggered by a class at all).
- **`tools/gen-jit-utilities.js`** (new) - reads the already compiled
  `dist/chunks/molique-utilities.css` + `molique-utilities-extended.css`,
  splits them into `tools/jit/dist-data/utilities.json`. A manual (no new
  dependency) block-level CSS parser - brace-depth matching, the same way
  `gen-variables-doc.js` does it for `_root.scss`.
- **`tools/gen-jit-package-data.js`** (new) - copies both of the above +
  the compiled component files + `molique-root.css`/`molique-base.css`
  (both "mandatory", always included) + the safelist extracted from
  `purgecss.safelist.cjs` (tier `runtime.standard`) into
  `tools/jit/package/data/`.

All three are wired into `predev`/`prebuild` in dependency order
(`gen:chunks` -> `gen:jit-utilities` -> `gen:jit-package-data`).

### 1.2 Scanner (`tools/jit/package/src/scanner.ts`)

As per the original plan: a context-free regular expression
`/[a-zA-Z0-9_:-]+/g` over the files matched by `content` (glob via
`fast-glob`). A `Map<path, Set<token>>` cache per file - the basis for watch
mode (re-scanning only the changed file, `rescanFile`/`unionTokens`).

### 1.3 Lookup (`tools/jit/package/src/lookup.ts`)

Replaces the originally planned "Rule Parser". No logic at all - `resolve()`
queries the loaded data (`utilities.json`, `class-index.json`) by key
(exact match of the token against the class name) and returns a list of
matched utility classes + component IDs. A token with no match is simply a
class outside molique - not an error. The default safelist
(`purgecss.safelist.cjs` -> `runtime.standard`) and `molique.config.mjs` ->
`safelist` (classes specific to the consumer project) are always included,
regardless of the scan.

### 1.4 Emitter (`tools/jit/package/src/emitter.ts`)

Assembles the final CSS while preserving layer order
(`@layer reset, base, layout, components, modules, utilities;`):

1. Theme variables (`molique-root.css`) + reset/base typography/
   `.container` (`molique-base.css`) - ALWAYS, verbatim.
2. Matched components as WHOLE, already compiled chunk files - never
   sliced partially (components have selectors that depend on DOM
   structure, e.g. `:has()`, element adjacency, which a plain class scan
   cannot safely reconstruct in fragments).
3. Matched utility classes, grouped by identical sets of conditions
   (`@media`/`@supports`) - so that, e.g., 30 matched `-md-` classes end up
   in ONE `@media` block, not 30 separate ones.
4. The `alwaysInclude` pool from `utilities.json` (fragments with no class
   in the selector: `@keyframes`, `@property`, `::view-transition-*`) -
   always included, since it can't be tied to a specific token.

### 1.5 Build / Watch (`build.ts` / `watch.ts`)

`build()` - a one-off run of the whole pipeline, writing to a file.
`watch()` - an immediate first build, then `chokidar` (v3 - v4 removed
native glob support) watches the same `content` patterns. After a file
change: `rescanFile()` refreshes only its entry in the cache, a 50ms
debounce, then a rebuild from the full `unionTokens()`.

## 2. CLI

See `cli-spec.md` (updated with the actual `molique.config.mjs` schema and
how commands are localized).

## 3. Data management (not an in-memory "cache" between processes)

Unlike the original plan (a Context Cache as the sole mechanism), the
dictionary data lives as **files on disk** (`tools/jit/package/data/*.json` +
compiled CSS), generated once in this repository and distributed together
with the npm package. The in-memory cache (`Map<path, Set<token>>` in the
Scanner) applies only to the RESULTS OF SCANNING the consumer's files in
watch mode, not to the molique class dictionary itself.
