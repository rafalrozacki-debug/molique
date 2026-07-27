# molique-jit

A JIT CSS engine and component scaffolding CLI for the [molique][live]
framework. Two independent halves in one tool:

1. **JIT engine** (`build`/`watch`/`init`) - scans your project and emits
   only the CSS you actually use, via a pure lookup-table architecture: a
   build-time dictionary is generated once from real, compiled Sass output,
   so the engine never re-implements molique's own SCSS math and can't
   drift from it.
2. **Scaffolding** (`make:*`) - interactive generators that produce
   ready-to-use component markup (grounded 1:1 against molique's real
   source and docs examples), so you don't hand-copy snippets from
   [molique.dev][live].

[live]: https://molique.dev

## Install

```bash
npm install --save-dev molique-jit
```

## JIT engine

```bash
npx molique-jit init     # creates molique.config.mjs
npx molique-jit build    # scans + writes the output CSS
npx molique-jit watch    # rebuilds on file change
```

`molique.config.mjs`:

```js
export default {
  content: ['**/*.html', '**/*.php'],   // files to scan
  output: 'css/molique-jit.css',        // where to write the result
  safelist: [],                         // your own dynamically-built classes (e.g. `badge-<?= $status ?>`)
  minify: true,
  // targets: [{ content: [...], output: '...' }],  // multiple independent outputs from one config
};
```

molique's own runtime classes (toasts, carousel, lightbox, `.is-*` states,
…) are always kept automatically - you only need `safelist` for classes
your own backend concatenates.

## Scaffolding (`make:*`)

| Command | Generates |
| --- | --- |
| `make:modal` | `<dialog>` modal - Standard / Confirm / Context variants |
| `make:layout` | Admin Dashboard / Hero (Simple + Cutout) / Bento Grid |
| `make:nav` | Navbar - offcanvas, 3 background variants, optional Mega Menu / Theme Switch / Language Switch |
| `make:table` | B2B table with automatic mobile `data-label` cards |
| `make:chart` | Radial Bar / Funnel / Pipeline / Stock Bar |
| `make:form` | Floating Labels / Classic fields + optional Searchable Select / Premium Multi Select / Drag & Drop File Upload |
| `make:popover` | `.popover-context` anchored context menu (CSS Anchor Positioning) |
| `make:widget` | Speed Dial / Before-After Slider / Stepper / Share Bar |
| `make:badge` | Status pill (`.badge`) |
| `make:progress` | Labeled progress bar (`.progress`/`.progress-bar`) |
| `make:accordion` | Native `<details>`-based FAQ accordion, zero JS |
| `make:pagination` | Classic / Modern pagination bar |
| `make:component` | Lists all of the above |

Every generator that produces a variable-length list (nav items, table
rows, chart stages, accordion panels, …) accepts `-n, --count <n>` to skip
the "how many?" prompt - the rest of the flow stays interactive.

```bash
npx molique-jit make:modal
npx molique-jit make:table --count 5
```

### Non-interactive mode (`--answers` / `--answers-file`)

Every command also accepts a full set of answers up front, skipping ALL
prompts at once - useful for scripts and CI, where nobody's at a terminal
to answer questions. The JSON shape matches that command's own
`XxxAnswers` TypeScript type (see `cli-spec.md` in the repo for every
command's exact shape).

```bash
npx molique-jit make:badge --answers '{"text":"New","color":"success"}'
npx molique-jit make:table --answers-file ./table.json -o components/table.html
```

- `--answers '<json>'` - inline JSON.
- `--answers-file <path>` - read the JSON from a file instead.
- `-o, --out <path>` - write the result straight to a file (only applies
  together with `--answers`/`--answers-file`; without them, the normal
  interactive "console or file?" prompt still applies). Omit `-o` and the
  generated markup goes straight to stdout - pipe it wherever you like.
- `-n, --count` still works as the lighter, single-question shortcut for
  interactive use - if both are given, `--answers`/`--answers-file` wins
  (it already encodes the count).

## Localization (PL/DE)

Every command and repeatable-count flag has a Polish and German alias -
`molique-jit zrob:modal` / `molique-jit mache:modal`, `--minifikuj` /
`--minifizieren`, and so on. Run `npx molique-jit --help` for the full,
current list.

## License

Apache License 2.0. Copyright 2026 Rafał Różacki. Full text in the
`LICENSE` file, attribution notice in `NOTICE`.
