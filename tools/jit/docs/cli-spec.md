# Molique CLI Specification

> State after Phase 5: implemented and manually verified end-to-end
> (`tools/jit/package/src/cli.ts`, `bin: molique-jit`). In practice this
> specification turned out to be very close to the original plan - the
> commands and aliases below correspond exactly to what was built. The only
> addition was the previously missing `molique.config.mjs` schema (section 4)
> and a clarification of the localization mechanism (section 5).

This document describes a Node.js-based command line interface. It serves as the main engine that builds the stylesheet, with a file-watching mode (Watch). The tool natively supports multilingual environments.

Binary name: `molique-jit` (not just `molique`) - matching the npm package
name, to avoid a collision with any other tools that might use a shorter
name.

## 1. Main Commands and Aliases

| English (Standard)   | Polish Alias       | German Alias          | Action                                              |
| :-------------------- | :----------------- | :--------------------- | :--------------------------------------------------- |
| `molique init`       | `molique start`    | `molique start`      | Creates the base configuration file                |
| `molique build`      | `molique buduj`    | `molique bauen`      | Compiles CSS to the output file                    |
| `molique watch`      | `molique obserwuj` | `molique beobachten` | Watches for changes live                           |
| `molique help`       | `molique pomoc`    | `molique hilfe`      | Prints help (for the whole CLI or a single command) |
| `--minify` / `-m`    | `--minifikuj`      | `--minifizieren`     | Compression (removes whitespace)                   |
| `--config` / `-c`    | `--konfiguracja`   | `--konfiguration`    | Points to a custom `.config` file                  |
| `--version` / `-V`   | *(no alias - universal shorthand)* | *(same)* | Prints the installed package version |

## 2. Command behavior

### `init` / `start`

- **Behavior:** Drops a `molique.config.mjs` file in the root folder with a sample configuration and a predefined safelist for the framework (needed for JS).

### `build` / `buduj` / `bauen`

- **Behavior:** Scans the entire glob given in the `content` section of the config file. Loads the modules, generates the final CSS, optionally runs it through the minifier, and writes it to disk. Output standard: Exit Code 0 (success) / 1 (error).

### `watch` / `obserwuj` / `beobachten`

- **Behavior:** A developer mode that watches for file modifications (based on the `chokidar` library, version 3.x - v4 removed native glob support, which is needed here). The JIT performs a _Debounce_ (~50ms) before rebuilding, re-scans only the changed file and updates the Context Cache, generating the final file in milliseconds. It runs for all `targets` from the config simultaneously (a separate watcher for each), and shuts down on `Ctrl+C`.

## 3. Usage Examples

All commands can be freely combined with each other in the chosen language:

```bash
# Standard
npx molique-jit build --minify
npx molique-jit watch --config ./custom.config.mjs

# Polish
npx molique-jit buduj --minifikuj
npx molique-jit obserwuj --konfiguracja ./custom.config.mjs

# German
npx molique-jit bauen --minifizieren
npx molique-jit beobachten
```

## 4. `molique.config.mjs` Schema

A plain ESM module with a default object export (source of truth:
`tools/jit/package/src/config.ts`):

```typescript
export interface ConfigTarget {
  content: string[];
  output: string;
}

export interface MoliqueConfig {
  content?: string[]; // defaults to ['**/*.html', '**/*.php']
  output?: string; // defaults to 'css/molique-jit.css'
  safelist?: string[]; // the consumer project's OWN dynamic classes (e.g. `badge-<?= $status ?>`)
  minify?: boolean; // see note below
  targets?: ConfigTarget[]; // see "Multiple targets" below
}
```

- **`safelist`** is a list containing ONLY classes specific to the consumer
  project. molique's own runtime classes (toasts, carousel, lightbox,
  sidebar, etc.) are included automatically from the package's built-in
  safelist (tier `runtime.standard` from `purgecss.safelist.cjs`) - this
  list does NOT need to be duplicated.
- **`minify`**: effectively a no-op in the current implementation - the
  source data (component chunks, the utilities layer) is already compressed
  at the source (`tools/gen-chunks.js`, `--style=compressed`), so there's no
  additional whitespace to remove. The field stays in the schema for
  consistency with this specification and in case of future data sources.
- **Multiple targets (`targets`)**: when provided and non-empty, it
  REPLACES the `content`/`output` fields above. Each entry is an independent
  build - a typical case: a separate, dedicated (small) CSS file for an ad
  campaign landing page, alongside the site's main file:

  ```javascript
  export default {
    targets: [
      { content: ['src/**/*.html'], output: 'css/molique-jit.css' },
      { content: ['landing-kampania.html'], output: 'css/landing-kampania.css' },
    ],
  };
  ```

  `molique-jit build`/`watch` build/watch EVERY target independently -
  the `landing-kampania.css` file contains only the classes used in
  `landing-kampania.html`, not the rest of the site.

`molique-jit init` (alias `start`) creates a starter file with comments
explaining each field (`INIT_TEMPLATE` in `config.ts`) - it refuses to
overwrite if `molique.config.mjs` already exists.

## 5. Localization Mechanism (implementation)

The PL/DE aliases for commands and flags are NOT implemented through the
CLI library's (Commander) built-in alias mechanism - different names per
language for the SAME flag is awkward gymnastics with its API. Instead,
`process.argv` is TRANSLATED into canonical English command/flag names
BEFORE being passed to Commander (`translateArgv()` in `cli.ts`) - the
library only knows a single, English variant of each command and flag.
Simpler, and easier to unit test, than relying on Commander's internal
alias handling.

## 6. Scaffolding Commands (`make:*`)

> Section expanded incrementally, one command at a time, as each
> `src/cli/make-*.ts` file is reworked into the collect/render shape (CLI
> development plan, Stage B/C). Replaces `scaffolding-spec.md`, whose
> description of `make:page`/`make:component`-with-sub-modes was abandoned
> in favor of one separate command per component family.

Every scaffolding command supports THREE independent modes for collecting
answers, which can be combined:

1. **Interactive** (default) - questions in the terminal (`@inquirer/prompts`).
2. **`-n, --count <number>`** - where the command generates a variable-length
   list, it skips ONLY the "how many?" question; the rest of the questions
   remain interactive. Implementation: `promptCount()` in `cli/prompts.ts`.
3. **`--answers <json>` / `--answers-file <path>`** - skips ALL the
   questions at once, by supplying a ready-made answers object (the shape is
   documented per command below). The result goes to stdout, unless
   `-o, --out <path>` was added - in that case it's written to a file
   without asking "console or file?". When both `-n/--count` and
   `--answers`/`--answers-file` are given, the JSON wins (it already encodes
   the number of items). An error in the JSON (from `--answers` or a file
   from `--answers-file`) produces a readable message pointing out WHICH
   flag failed, not a bare `SyntaxError` from V8. Implementation:
   `loadAnswers()` in `cli/answers.ts`, `outputResult()` in `cli/output.ts`.

PL/DE aliases for these flags (fully consistent with the command aliases
from Section 1):

| English | Polish | German |
| :-- | :-- | :-- |
| `--count` / `-n` | `--liczba` | `--anzahl` |
| `--answers` | `--odpowiedzi` | `--antworten` |
| `--answers-file` | `--plik-odpowiedzi` | `--antwortdatei` |
| `--out` / `-o` | `--wyjscie` | `--ausgabe` |

The short variants (`-n`, `-o`) do NOT have separate PL/DE aliases - they
are single letters, identical regardless of language.

### `make:table` (aliases: `zrob:tabele`, `mache:tabelle`)

Generates a B2B table (`.table-wrapper > table.table[...] > thead + tbody`)
with automatic `data-label` on cells (the `.table-cards` mobile-first
mechanism).

```typescript
interface TableAnswers {
  columns: string[]; // column names, in order
  rowCount: number; // number of sample rows (0 = empty tbody)
  size: '' | 'table-sm' | 'table-lg';
  theadVariant: '' | 'thead-light' | 'thead-dark' | 'thead-primary';
  striped: boolean; // .table-striped
  hover: boolean; // .table-hover
  mobileMode: 'table-cards' | 'table-cards-always' | ''; // '' = classic scroll, no cards
}
```

```bash
npx molique-jit make:table -n 5
npx molique-jit make:table --answers '{"columns":["Name","Status"],"rowCount":2,"size":"","theadVariant":"thead-dark","striped":true,"hover":true,"mobileMode":"table-cards"}'
npx molique-jit make:table --answers-file ./table.json -o components/table.html
```

### `make:popover` (aliases: `zrob:popover`, `mache:popover`)

Generates a `.popover-context` context menu (CSS Anchor Positioning +
Popover API, auto-flip above the button near the bottom edge, and a bottom
sheet on mobile - zero extra markup needed for either). `triggerColor`
already implies `.btn` in the framework - the base class isn't added
separately.

```typescript
interface PopoverAnswers {
  triggerLabel: string;
  triggerColor: 'btn-secondary' | 'btn-primary' | 'btn-light' | 'btn-outline-primary btn-outline-soft';
  triggerIcon: string; // icon name from img/icons-sprite.svg, '' = none
  id: string; // popover ID (unique on the page) - ANCHOR_NAME is derived from it automatically
  items: Array<{
    label: string;
    icon: string; // '' = no icon
    danger: boolean; // destructive action - gets .text-danger + a dividing <hr> before it (once, before the FIRST such item)
  }>;
}
```

```bash
npx molique-jit make:popover -n 5
npx molique-jit make:popover --answers '{"triggerLabel":"Options","triggerColor":"btn-secondary","triggerIcon":"ph-gear","id":"ctxMenu1","items":[{"label":"View","icon":"ph-eye","danger":false},{"label":"Delete","icon":"ph-trash","danger":true}]}'
```

### `make:modal` (aliases: `zrob:modal`, `mache:modal`)

Generates a native `<dialog class="modal-dialog">` + a trigger button
(`showModal()`, zero custom JS). Three VARIANTS, each with its own answer
shape (the `"type"` field in the JSON selects the variant) - all three
share the `triggerLabel`/`triggerVariant` fields (the trigger button).

```typescript
type ModalAnswers =
  | { type: 'standard'; id: string; title: string; body: string; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' }
  | { type: 'confirm'; id: string; title: string; message: string; cancelLabel: string; confirmLabel: string; confirmVariant: 'btn-danger' | 'btn-primary' | 'btn-success'; icon: 'ph-warning' | 'ph-question' | 'ph-trash' | 'ph-info'; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' }
  | { type: 'context'; id: string; title: string; action1Label: string; action1Icon: string; action2Label: string; action2Icon: string; action2Danger: boolean; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' };
```

```bash
npx molique-jit make:modal --answers '{"type":"standard","id":"myModal","title":"Title","body":"Content...","triggerLabel":"Open","triggerVariant":"btn-primary"}'
npx molique-jit make:modal --answers '{"type":"confirm","id":"delModal","title":"Are you sure?","message":"This cannot be undone.","cancelLabel":"Cancel","confirmLabel":"Delete","confirmVariant":"btn-danger","icon":"ph-trash","triggerLabel":"Delete","triggerVariant":"btn-danger"}'
```

### `make:chart` (aliases: `zrob:wykres`, `mache:diagramm`)

Four VARIANTS (the `"type"` field): Radial Bar, Funnel (vertical funnel),
Pipeline (horizontal CRM process), Stock Bar. `-n/--count` applies ONLY to
the Stock Bar variant (number of filled segments, 0-5).

```typescript
type ChartAnswers =
  | { type: 'radial'; value: number; color: 'primary' | 'success' | 'danger' | 'warning' | 'info' }
  | { type: 'funnel'; labels: string[] }
  | { type: 'pipeline'; steps: string[]; activeLabel: string } // '' = no active step
  | { type: 'stock-bar'; filled: number; variant: '' | 'stock-bar-success' | 'stock-bar-warning' | 'stock-bar-danger'; ariaLabel: string };
```

```bash
npx molique-jit make:chart --answers '{"type":"radial","value":75,"color":"success"}'
npx molique-jit make:chart --answers '{"type":"funnel","labels":["Visits","Signups","Purchases"]}'
npx molique-jit make:chart --answers '{"type":"pipeline","steps":["New","Contact","Contract"],"activeLabel":"Contact"}'
npx molique-jit make:chart -n 4   # Stock Bar - asks interactively for the rest, "how many segments?" skipped
```

### `make:widget` (aliases: `zrob:widget`, `mache:widget`)

Four UNRELATED widgets under one command: Speed Dial, Before/After Slider,
Stepper, Share Bar. `-n/--count` applies ONLY to the number of actions in
Speed Dial.

```typescript
type WidgetAnswers =
  | { type: 'speed-dial'; mainSymbol: string; actions: Array<{ label: string; icon: string }> }
  | { type: 'before-after'; afterImg: string; afterAlt: string; beforeImg: string; beforeAlt: string; maxWidth: string; aspectRatio: string }
  | { type: 'stepper'; variant: 'classic' | 'numbered'; labels: string[]; activeLabel: string }
  | { type: 'share-bar'; networks: string[] }; // subset of 'facebook'|'twitter'|'linkedin'|'whatsapp'|'native', in any order
```

```bash
npx molique-jit make:widget -n 5   # Speed Dial - "how many actions?" skipped
npx molique-jit make:widget --answers '{"type":"stepper","variant":"numbered","labels":["Wymiary","Konstrukcja","Dach"],"activeLabel":"Konstrukcja"}'
npx molique-jit make:widget --answers '{"type":"share-bar","networks":["facebook","native"]}'
```

### `make:layout` (aliases: `zrob:uklad`, `mache:layout`)

Four FLAT variants (even though in interactive mode Hero has its own
Simple/Cutout sub-choice, in `--answers` you pick the target type
directly): `admin`, `hero-simple`, `hero-cutout`, `bento`. `-n/--count`
applies to menu items (`admin`) / breadcrumb (`hero-simple`) / tiles
(`bento`) - `hero-cutout` has no variable-length list.

```typescript
type LayoutAnswers =
  | { type: 'admin'; floating: boolean; logo: string; items: string[] } // the FIRST item gets .is-active automatically
  | { type: 'hero-simple'; title: string; imageUrl: string; overlayColorClass: string; overlayOpacityClass: string; breadcrumbLabels: string[] } // the LAST one = current page, auto is-active + aria-current
  | { type: 'hero-cutout'; title: string; message: string; imageUrl: string; imageAlt: string; cutoutVariant: 'cutout-md-br' | 'cutout-md-bl' | 'cutout-md-tr' | 'cutout-md-tl' }
  | { type: 'bento'; tiles: Array<{ label: string; size: 'normal' | 'wide' | 'tall' | 'big' }> };
```

```bash
npx molique-jit make:layout -n 5   # Admin Dashboard - "how many menu items?" skipped
npx molique-jit make:layout --answers '{"type":"bento","tiles":[{"label":"Tile 1","size":"big"},{"label":"Tile 2","size":"wide"}]}'
npx molique-jit make:layout --answers '{"type":"hero-cutout","title":"Build it","message":"Description","imageUrl":"img/hero-bg.jpg","imageAlt":"Background","cutoutVariant":"cutout-md-br"}'
```

### `make:form` (aliases: `zrob:formularz`, `mache:formular`)

Unlike the other commands - NO discriminated union of variants. One flat
`FormAnswers`: the basic fields style + the field list + up to THREE
independently toggleable modules (an `undefined`/omitted field = module not
added). `-n/--count` applies to the number of basic fields.

```typescript
interface FormAnswers {
  style: 'floating' | 'classic';
  fields: Array<{ label: string; type: 'text' | 'email' | 'number' | 'tel' | 'textarea'; required: boolean }>;
  selectSearch?: { label: string; placeholder: string; fieldName: string; options: string[] };
  customSelect?: { label: string; placeholder: string; categories: Array<{ name: string; items: string[] }> };
  fileUpload?: { animated: boolean; title: string; subtitle: string; fieldName: string };
  submitLabel: string;
}
```

```bash
npx molique-jit make:form -n 5
npx molique-jit make:form --answers '{"style":"floating","fields":[{"label":"Name","type":"text","required":true}],"fileUpload":{"animated":true,"title":"Drop a file","subtitle":"or click","fieldName":"file"},"submitLabel":"Send"}'
```

### `make:nav` (aliases: `zrob:nawigacje`, `mache:nav`) - the last of the 8 basic commands

One flat `NavAnswers`: background variant (Standard/Transparent/Pill - they
differ ONLY in the class/`style` attribute on the same `<nav>`, one stub) +
menu items + up to THREE independently toggleable modules (Mega Menu /
Theme Switch / Language Switch). `-n/--count` applies ONLY to regular menu
items (not Mega Menu).

```typescript
interface NavAnswers {
  variant: 'standard' | 'transparent' | 'pill';
  pillBg?: string;          // only for variant === 'pill', after adjusting colors
  pillBgScrolled?: string;  // same as above, optional even then
  brand: string;
  toggleId: string;         // offcanvas checkbox ID - MUST be unique on the page
  items: string[];
  megaMenu?: { title: string; groups: Array<{ title: string; links: string[] }> };
  themeSwitch: boolean;
  languageSwitch?: { languages: Array<{ flagCode: string; label: string }> }; // the FIRST language = active
}
```

```bash
npx molique-jit make:nav -n 5
npx molique-jit make:nav --answers '{"variant":"pill","pillBg":"#123456","brand":"Logo","toggleId":"navToggle","items":["Start"],"themeSwitch":true,"languageSwitch":{"languages":[{"flagCode":"pl","label":"Polski"},{"flagCode":"gb","label":"English"}]}}'
```

---

**All 8 originally planned `make:*` commands now have the `collect`/
`render` split, the `--answers`/`--answers-file` mode, and their own test
file in `tools/jit/tests/scaffolding-*.test.mjs`** - Stage B of the CLI
development plan is complete. The next generators (Stage C: `make:badge`,
`make:progress`, `make:accordion`, `make:pagination`) get added to the list
below as they're built.

### `make:badge` (aliases: `zrob:odznake`, `mache:abzeichen`)

Generates a single status pill (`.badge.badge-<color>`). The simplest of
the generators - one stub, no lists, built directly in its target shape
(Stage C).

```typescript
interface BadgeAnswers {
  text: string;
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
}
```

```bash
npx molique-jit make:badge --answers '{"text":"New","color":"success"}'
```

### `make:progress` (aliases: `zrob:pasek-postepu`, `mache:fortschritt`)

Generates a progress bar with a label (`.progress-label` + `.progress >
.progress-bar`). The color has NO dedicated component classes - a generic
`bg-<color>` utility class is appended (exactly like the real example in
`examples-progress-bars.html`); `primary` is already the default color
built into the `.progress-bar` base, so it doesn't get any extra class.

```typescript
interface ProgressAnswers {
  label: string;
  value: number; // 0-100
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
}
```

```bash
npx molique-jit make:progress --answers '{"label":"Optymalizacja SEO","value":60,"color":"success"}'
```

### `make:accordion` (aliases: `zrob:akordeon`, `mache:akkordeon`)

Generates an FAQ accordion on native `<details>`/`<summary>` - zero JS, no
`open` attribute by default (as in the real example). `-n/--count` applies
to the number of panels.

```typescript
interface AccordionAnswers {
  groupName: string; // the "name" attribute - groups panels (the browser enforces "only one open at a time")
  panels: Array<{ question: string; answer: string }>;
}
```

```bash
npx molique-jit make:accordion -n 5
npx molique-jit make:accordion --answers '{"groupName":"faq","panels":[{"question":"How do I install it?","answer":"Link the CSS."}]}'
```

### `make:pagination` (aliases: `zrob:paginacje`, `mache:seitenzahlen`) - the last of the first wave (Stage C)

Generates a pagination bar (`.pagination` + optionally `.pagination-modern`
ALONGSIDE it, not instead of it). "Previous"/"Next" are regular `.page-item`
elements, automatically `is-disabled` at the edge of the page range.
`-n/--count` applies to the total number of pages (limit 12 - the real
component has no truncation/ellipsis pattern for a larger number).

```typescript
interface PaginationAnswers {
  modern: boolean;
  totalPages: number;
  currentPage: number; // 1-based
  prevLabel: string;
  nextLabel: string;
}
```

```bash
npx molique-jit make:pagination -n 8
npx molique-jit make:pagination --answers '{"modern":true,"totalPages":5,"currentPage":3,"prevLabel":"Previous","nextLabel":"Next"}'
```

### `make:tooltip` (aliases: `zrob:podpowiedz`, `mache:tooltip`)

Generates a 100% CSS tooltip bubble (`.tooltip-element`, bubble content
from `attr(data-tooltip)`, zero JS).

```typescript
interface TooltipAnswers {
  text: string;    // visible text
  tooltip: string; // bubble content
}
```

```bash
npx molique-jit make:tooltip --answers '{"text":"PUM","tooltip":"Powierzchnia Uzytkowa Mieszkalna"}'
```

### `make:alert` (aliases: `zrob:komunikat`, `mache:hinweis`)

Generates a static message inline in the page content (`.alert.alert-
<color>`). WITHOUT a close button and WITHOUT JS - `.toast` is the one that
disappears automatically, `.alert` has no such mechanism at all (the real
example's documentation explicitly distinguishes between the two).

```typescript
interface AlertAnswers {
  message: string;
  color: 'info' | 'success' | 'danger' | 'warning';
}
```

```bash
npx molique-jit make:alert --answers '{"message":"Zmiany zostaly zapisane pomyslnie.","color":"success"}'
```

### `make:dropdown` (aliases: `zrob:rozwijane`, `mache:dropdown`)

Two STRUCTURALLY different versions (the `"type"` field): Classic based on
`<details>`/`<summary>` (navbar) and a top-layer Popover (recommended
outside the navbar - tables, cards, modals, not clipped by `overflow`).
`.dropdown-menu-end` (right alignment) works identically in both.
`triggerClass` is JUST the color class (e.g. `btn-outline-dark`) - it
already implies `.btn` in the framework (`_buttons.scss`, "`.btn`
IMPLICATION"), so the base class isn't added separately.

```typescript
type DropdownAnswers =
  | { type: 'details'; triggerLabel: string; triggerClass: string; alignEnd: boolean; items: Array<{ label: string; danger: boolean }> }
  | { type: 'popover'; triggerLabel: string; triggerClass: string; alignEnd: boolean; id: string; items: Array<{ label: string; danger: boolean }> };
```

```bash
npx molique-jit make:dropdown -n 5
npx molique-jit make:dropdown --answers '{"type":"popover","triggerLabel":"Options","triggerClass":"btn-outline-dark","alignEnd":false,"id":"pop-menu-1","items":[{"label":"Edit","danger":false},{"label":"Delete","danger":true}]}'
```

### `make:tabs` (aliases: `zrob:zakladki`, `mache:tabs`)

Tabs based on the Radio Hack (hidden `input[radio].tab-input` control the
visibility of `.tab-pane` via positional `:nth-of-type()`, zero JS). The
two variants (`type`) have an IDENTICAL answer shape (they only differ in
rendering - `pill` gets `.tabs-pill`, `style="--tab-count"` and an empty
`.tabs-pill-indicator`). IMPORTANT: `.tabs-pill` has its OWN, smaller limit
in SCSS (max 8 tabs), lower than the classic variant (max 10) -
`-n/--count` respects the appropriate limit depending on the selected
variant.

```typescript
interface TabsAnswers {
  type: 'classic' | 'pill';
  groupName: string; // the "name" attribute shared by all input[radio]
  tabs: Array<{ label: string; content: string }>;
}
```

```bash
npx molique-jit make:tabs -n 3
npx molique-jit make:tabs --answers '{"type":"pill","groupName":"my-pill-tabs","tabs":[{"label":"Dzien","content":"Statystyki z dnia."},{"label":"Tydzien","content":"Statystyki z tygodnia."}]}'
```

### `make:status-dot` (aliases: `zrob:kropke-statusu`, `mache:statuspunkt`)

Generates a status dot (`.status-dot.status-<state>`), optionally with a
pulsing ring (`.status-ping`, the same layer as Stock Bar in
`make:chart`).

```typescript
interface StatusDotAnswers {
  text: string;
  status: 'draft' | 'pending' | 'done' | 'danger';
  ping: boolean;
}
```

```bash
npx molique-jit make:status-dot --answers '{"text":"Live","status":"done","ping":true}'
```

### `make:counter` (aliases: `zrob:licznik`, `mache:zaehler`)

Generates an animated counter (`.counter > .counter-value + .counter-
title`). The content of `.counter-value` is JUST the target number -
`js/modules/molique-counters.js` parses it with `parseFloat()` and animates
counting up from 0 once it enters the viewport (IntersectionObserver).
Optional `data-prefix`/`data-suffix` (e.g. "$"/"+") get appended to the
result without changing the counting logic. There is no dedicated examples
page for `.counter` alone - the ground truth is the SCSS + the actual JS
behavior.

```typescript
interface CounterAnswers {
  value: number;
  title: string;
  prefix: string; // '' = none
  suffix: string; // '' = none
}
```

```bash
npx molique-jit make:counter --answers '{"value":1500,"title":"Zadowolonych klientow","prefix":"","suffix":"+"}'
```

### `make:timeline` (aliases: `zrob:os-czasu`, `mache:zeitleiste`)

Three STRUCTURALLY different variants (the `"type"` field): `large`
(icons/letters in `.timeline-badge`), `numbered` (CSS ITSELF adds the
number via `counter()`, zero extra markup), `labeled` (CSS Grid, date on
the left - `.timeline-line` on the last item is hidden by CSS alone via
`:last-child`, the generator always generates it for every item).

```typescript
type TimelineAnswers =
  | { type: 'large'; items: Array<{ badge: string; title: string; description: string }> }
  | { type: 'numbered'; items: Array<{ title: string; description: string }> }
  | { type: 'labeled'; items: Array<{ dateLabel: string; timeLabel: string; nodeColor: '' | 'primary' | 'success' | 'danger'; title: string; description: string }> };
```

```bash
npx molique-jit make:timeline -n 4
npx molique-jit make:timeline --answers '{"type":"labeled","items":[{"dateLabel":"30.06.2026","timeLabel":"16:44","nodeColor":"success","title":"Rafal Rozacki","description":"Przyjecie towaru."}]}'
```

### `make:carousel` (aliases: `zrob:karuzele`, `mache:karussell`)

Two STRUCTURALLY different variants (the `"type"` field): Basic (cards with
text, background color per slide) and Hero/Background Sync (background
under the slide via `data-bg`, with a darkening overlay). Native
`scroll-snap` - zero JS for the scrolling itself. IMPORTANT: the pagination
dots (`.carousel-dots`) are generated by `js/modules/molique-carousel.js`
ITSELF, when there's more than 1 slide - the generator does NOT add them
(they're absent from the real example's source, even though they're
visible in the rendered preview).

```typescript
type CarouselAnswers =
  | { type: 'basic'; maxWidth: string; slides: Array<{ title: string; text: string; color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' }> }
  | { type: 'bg-sync'; height: string; slides: Array<{ bg: string; heading: string }> };
```

```bash
npx molique-jit make:carousel -n 4
npx molique-jit make:carousel --answers '{"type":"bg-sync","height":"400px","slides":[{"bg":"img/architektura.jpg","heading":"Architektura"}]}'
```

### `make:lightbox` (aliases: `zrob:lightbox`, `mache:lightbox`)

The entire modal (`.lightbox-overlay`, arrows, counter) is BUILT by
`js/modules/molique-lightbox.js` - the generator only adds `data-lightbox`
+ `data-gallery` to regular links with images, zero modal markup.

```typescript
interface LightboxAnswers {
  gallery: string; // the data-gallery attribute - groups images into one gallery
  items: Array<{ thumbImg: string; fullImg: string; alt: string }>;
}
```

```bash
npx molique-jit make:lightbox -n 5
npx molique-jit make:lightbox --answers '{"gallery":"realizacje","items":[{"thumbImg":"img/m1.jpg","fullImg":"img/p1.jpg","alt":"Foto 1"}]}'
```

### `make:card` (aliases: `zrob:karte`, `mache:karte`)

Five STRUCTURALLY different variants (the `"type"` field, flattened to
top-level following the convention from `make:layout`/`make:timeline`/
`make:carousel`): Classic (header/body/footer), Featured Box (a product
feature with an icon; the primary color adds neither `style` nor a color
class - only variants other than primary get `style="border-top-color:
var(--<color>)"` + `bg-<color> text-white` on the icon), Thumb Info Center
(image + a centered overlay, magnifying-glass icon, `text-6`), and Thumb
Info Bottom (overlay at the bottom, optional `.badge` tag, `text-7`, an
optional `.thumb-info-light` variant instead of the default dark gradient)
- these are TWO SEPARATE stubs, since they have different inner content,
not one with a flag - and Interactive (`.card p-4 text-center` + a hover
effect: spring+GPU shadow OR `.tilt-card` on a dark background; NOTE: for
`tilt`, the description uses `text-white opacity-50` instead of
`text-muted`, because on `bg-dark` `text-muted` is unreadable - verified
against the real example).

```typescript
type CardAnswers =
  | { type: 'classic'; title: string; body: string; footerButtonLabel: string }
  | { type: 'featured-box'; icon: string; title: string; description: string; accentColor: 'primary' | 'success' | 'danger' | 'warning' | 'info' }
  | { type: 'thumb-info-center'; imageUrl: string; imageAlt: string; title: string }
  | { type: 'thumb-info-bottom'; imageUrl: string; imageAlt: string; title: string; light: boolean; badge: string }
  | { type: 'interactive'; icon: string; title: string; description: string; effect: 'spring-shadow' | 'tilt' };
```

```bash
npx molique-jit make:card
npx molique-jit make:card --answers '{"type":"featured-box","icon":"ph-rocket-launch","title":"Performance","description":"The framework is extremely lightweight.","accentColor":"success"}'
```

### `make:data-row` (aliases: `zrob:wiersz-danych`, `mache:datenzeile`)

Two STRUCTURALLY different variants (the `"type"` field): Grid CRM
(`.data-row` - CSS Grid, 5 fixed columns, its own `margin-bottom` - the
generator does NOT add any wrapper, rows stack one below another as plain
block elements, exactly as in the real example) and Compact
(`.data-row-compact` - Flexbox, separated via `border-bottom` +
`:last-child` - REQUIRES a shared parent, the generator wraps them in
`.card border-0 shadow-sm` following the recommended pattern from the real
example). In the Grid CRM variant, when there is more than one action
label, the LAST one automatically gets `text-danger` (the Edit/Delete
pattern from the real example) - a single action never gets this color
automatically.

**Two independent corrections relative to the real example** (the same
discipline as with `make:carousel`): (1) the "Compact Rows" section there
uses `class="icon-file-text"`/`class="icon-x"` - an old icon-font system
with NO support in SCSS whatsoever (confirmed via grep - zero `@font-face`
or `.icon-*` rules), a forgotten migration to the current SVG-sprite system
(`<svg class="icon"><use href="img/icons-sprite.svg#ph-...">`), which the
generator uses consistently; (2) the helper text in the same section has
`class="... m-r-2"` - this class doesn't exist in `utilities/_spacing.scss`
(the correct one is `mr-2`, without the extra hyphen), the generator uses
`mr-2`. Additionally, `.btn-action` there has a redundant `btn ` prefix
(this class has its OWN complete definition, it never needed `.btn`) - the
generator consistently omits this prefix, the same way the first section of
that same file already correctly does.

```typescript
type DataRowAnswers =
  | { type: 'row'; rows: Array<{ title: string; subtitle: string; value: string; statusText: string; statusState: 'draft' | 'pending' | 'done' | 'danger'; actionLabels: string[] }> }
  | { type: 'compact'; items: Array<{ icon: string; iconColor: '' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark'; iconSquare: boolean; title: string; details: string; leadingText: string; actionIcon: string; actionAriaLabel: string }> };
```

```bash
npx molique-jit make:data-row -n 3
npx molique-jit make:data-row --answers '{"type":"compact","items":[{"icon":"ph-user","iconColor":"primary","iconSquare":false,"title":"James Brown","details":"james@alignui.com","leadingText":"Can view","actionIcon":"ph-caret-down","actionAriaLabel":"Change access level"}]}'
```

### `make:pricing-table` (aliases: `zrob:cennik`, `mache:preisliste`)

Two STRUCTURALLY different variants (the `"type"` field): Pricing Cards
(`.pricing-table` - its own header, a feature list with optional
strikethrough via `.is-disabled`, a button; the `.is-featured` highlight
adds `text-primary` to the title and `btn-primary w-100 hover-spring`
instead of `btn-outline-primary w-100` on the button - the "Popularne"
ribbon is done PURELY in CSS via `content: 'Popularne'` on `::before`, the
generator does NOT add it to the markup) and Horizontal List with Dots
(`.pricing-list` - li > `.pricing-list-title` + an empty `.pricing-list-
dots` (decorative dotted line, pure CSS) + `.pricing-list-price`). The
number of columns in the plans grid (`grid-md-cols-<N>`) is automatically
matched to the number of plans.

`.pricing-list` has NO dedicated `examples-*.html` page (the only mentions
are a row in the class table in `docs-classes.html` and the bundle list in
`builder.js`) - built directly from `_pricing-list.scss`, the same
exception as with `make:counter`.

Correction relative to the real Pricing Cards example: the buttons there
have a redundant `btn ` prefix (`class="btn btn-outline-primary w-100"`) -
the same convention already established in this session (`.btn-<color>`
implies `.btn`), the generator uses just `btn-outline-primary w-100` /
`btn-primary w-100 hover-spring`.

```typescript
type PricingTableAnswers =
  | { type: 'table'; plans: Array<{ title: string; price: string; priceSuffix: string; featured: boolean; features: Array<{ text: string; disabled: boolean }>; buttonLabel: string }> }
  | { type: 'list'; items: Array<{ title: string; price: string }> };
```

```bash
npx molique-jit make:pricing-table -n 3
npx molique-jit make:pricing-table --answers '{"type":"table","plans":[{"title":"Pro","price":"99","priceSuffix":"$ / mo","featured":true,"features":[{"text":"Unlimited Projects","disabled":false}],"buttonLabel":"Choose Pro"}]}'
```

### `make:list-group` (aliases: `zrob:liste-grupowa`, `mache:listengruppe`)

One shape: `.list-group` > `.list-group-item` (link or button), the current
item gets `.is-active`. `.list-group` has NO dedicated `examples-*.html`
page (the only real usage is the third section "Simple List" in
`src/examples-data-rows.html`), but the markup there is complete and
directly reproducible.

```typescript
interface ListGroupAnswers {
  items: Array<{ label: string; href: string; active: boolean }>;
}
```

```bash
npx molique-jit make:list-group -n 4
npx molique-jit make:list-group --answers '{"items":[{"label":"Account Settings","href":"#","active":true},{"label":"Notifications","href":"#","active":false}]}'
```

### `make:testimonial` (aliases: `zrob:referencje`, `mache:referenz`)

One shape (a single testimonial card, no `-n/--count` - like
`make:badge`/`make:progress`): `.testimonial` > `.testimonial-stars` +
`.testimonial-quote` + `.testimonial-author` > `.testimonial-avatar` +
name/role.

Correction relative to the real example: the page's LIVE PREVIEW renders
the stars as SVG (`ph-star--fill`), but the copied code block on the same
page shows the literal text "★★★★★" - two different representations of
the same component in one file. The generator uses the SVG sprite,
consistent with the rest of the framework (cards, lightbox, data-row,
pricing-table), repeated exactly as many times as the number of stars
chosen (0-5), with no separator - exactly like the live preview.

```typescript
interface TestimonialAnswers {
  starCount: number; // 0-5
  quote: string;
  avatarUrl: string;
  avatarAlt: string;
  name: string;
  role: string;
}
```

```bash
npx molique-jit make:testimonial
npx molique-jit make:testimonial --answers '{"starCount":5,"quote":"Swietny framework!","avatarUrl":"img/avatar.jpg","avatarAlt":"Klient","name":"Jan Kowalski","role":"Dyrektor"}'
```

### `make:toast` (aliases: `zrob:powiadomienie`, `mache:benachrichtigung`)

The only component in the molique family entirely driven by JS - there's no
persistent markup to fill in (`.toast-container`/`.toast` is built by
`window.MoliqueToast.show()` in `js/molique-script.js` on the fly). The
generator therefore returns a COMPLETE, working example: a trigger button +
an API call, verified against the signature
`MoliqueToast.show({ message, type, position, duration })` (default values
in JS: `message='Powiadomienie'`, `type='info'`, `position='top-right'`,
`duration=4000`).

The real example calls the API via an inline `onclick="..."` on the button
(acceptable in the documentation site's demo, but not to be replicated in
production code) - its OWN "Copy code" block on the same page shows the
correct pattern instead (`<script>` + an API call), which the generator
follows, adding `addEventListener` instead of inline `onclick`. The trigger
button's color is matched to the notification type (`btn-<type>` -
success/danger/warning/info are also valid theme button colors), just like
in the real example.

```typescript
interface ToastAnswers {
  triggerId: string;
  triggerLabel: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration: number; // ms
}
```

```bash
npx molique-jit make:toast
npx molique-jit make:toast --answers '{"triggerId":"toast-trigger","triggerLabel":"Save changes","message":"Saved successfully!","type":"success","position":"top-right","duration":4000}'
```

### `make:breadcrumb` (aliases: `zrob:okruszki`, `mache:brotkrumen`)

`.breadcrumb` > `.breadcrumb-item`, the "/" separator is pure CSS
(`.breadcrumb-item + .breadcrumb-item::before`), the current item gets
`.is-active` + `aria-current="page"` and is plain text (not a link).

`.breadcrumb` has NO dedicated `examples-*.html` page (the only real usage
is the Hero Simple variant in `make:layout`, where the links are
`text-white opacity-75`, since it sits on a darkened image - an unsuitable
context for standalone use above a page title). The generator reuses the
SAME `_breadcrumb-item.stub.html` as `make:layout` (the element is
generic), but computes `INNER` without the overlay classes - a plain link
in the default `--primary` color from SCSS. Wrapper
`<nav aria-label="breadcrumb"><ol class="breadcrumb">` - the WAI-ARIA
"breadcrumb" pattern, the same one `layout-hero-simple.stub.html` already
uses.

```typescript
interface BreadcrumbAnswers {
  items: Array<{ label: string; href: string }>; // last item: href is ignored, rendered as text
}
```

```bash
npx molique-jit make:breadcrumb -n 3
npx molique-jit make:breadcrumb --answers '{"items":[{"label":"Home","href":"/"},{"label":"Blog","href":"/blog"},{"label":"Current page","href":""}]}'
```

### `make:status-icon` (aliases: `zrob:ikone-statusu`, `mache:statussymbol`)

Two STRUCTURALLY different variants (the `"type"` field): Static (pure CSS,
`<span class="status-icon status-icon-add">` or `status-icon-success`) and
zero-JS Interactive (`.status-checkbox` > `input[checkbox]` +
`<span class="status-icon-toggle">`, a Plus->Checkmark animation driven by
native `:checked`). The generator scaffolds ONLY these two variants, which
are actually used in `src/examples-status-feedback.html` - NOT a standalone
`<button class="status-icon-toggle">` without a `<label>`, which the SCSS
itself describes as a "documented limitation" (no free pseudo-element left
to enlarge the hit area to 44px).

Correction relative to the "copy" code block in the real example: there,
`<input type="checkbox">` has no `aria-label`, even though the adjacent
`.status-icon-toggle` is a purely decorative `<span>` with no text -
without `aria-label` such a checkbox is inaccessible to screen readers (no
accessible name). The live preview on the same page already correctly has
`aria-label="Zaznacz mnie"` - the generator follows this more complete
variant and always requires `aria-label`.

```typescript
type StatusIconAnswers =
  | { type: 'static'; state: 'add' | 'success' }
  | { type: 'checkbox'; name: string; value: string; ariaLabel: string };
```

```bash
npx molique-jit make:status-icon
npx molique-jit make:status-icon --answers '{"type":"checkbox","name":"premium_option","value":"1","ariaLabel":"Zaznacz mnie"}'
```

### `make:code-preview` (aliases: `zrob:podglad-kodu`, `mache:codevorschau`)

`.component-showcase` > `.component-preview` + `.component-code` >
`.btn-copy` + `<pre><code>` - EXACTLY the "preview + code" pattern that
EVERY `src/examples-*.html` page in the whole repo uses (moved from the
docs module into the SCSS core precisely so it works everywhere).
`.btn-copy` requires NO per-instance JS - copying is handled globally by
`js/molique-script.js` ("BULLETPROOF CODE COPYING",
`document.querySelectorAll('.btn-copy')`), so the generator only outputs
markup.

Practical purpose: wrapping the output of ANOTHER `make:*` command in a
standard showcase for your own style page (e.g. an internal style guide).
The FIRST generator in the whole family that requires real HTML escaping -
`.component-code` shows the code as TEXT (`&amp;`/`&lt;`/`&gt;` inside
`<pre><code>`), while `.component-preview` renders the SAME markup LIVE
(without escaping) - two different purposes, one data source.

Limitation: `input()` from `@inquirer/prompts` is single-line - for
multi-line fragments (e.g. a whole card or modal) use
`--answers`/`--answers-file` instead of interactive mode.

```typescript
interface CodePreviewAnswers {
  html: string; // raw component HTML
  previewExtraClass: string; // e.g. "w-100 bg-surface", empty = none
}
```

```bash
npx molique-jit make:code-preview --answers '{"html":"<span class=\"badge badge-primary\">New</span>","previewExtraClass":"w-100 bg-surface"}'
```

---

**The first wave of new generators (Stage C) is complete: `make:badge`,
`make:progress`, `make:accordion`, `make:pagination`** - each built
directly in its target shape (collect/render, `--answers`/
`--answers-file`, its own test file).

**The second (small) wave is also complete: `make:tooltip`, `make:alert`,
`make:dropdown`, `make:tabs`** - the same pattern.

**The third wave is also complete: `make:status-dot`, `make:counter`,
`make:timeline`, `make:carousel`** - the same pattern.

**The fourth wave is also complete: `make:lightbox`, `make:card`,
`make:data-row`, `make:pricing-table`** - the same pattern.

**The fifth (small) wave is also complete: `make:list-group`,
`make:testimonial`, `make:toast`** - the same pattern.

**The sixth wave is also complete: `make:breadcrumb`, `make:status-icon`,
`make:code-preview`** - the same pattern. **29 `make:*` commands** in
total. All of molique's single/small components now have their own
scaffolding command. E-commerce and blog (large, multi-part families) were
deliberately deferred to a future planning wave (at the user's request).
