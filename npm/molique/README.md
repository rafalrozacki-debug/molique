# molique

A lightweight, rigorously optimized CSS framework for B2B. Built on native
cascade layers (`@layer`), with zero specificity wars and zero dependencies
(no jQuery).

Full documentation, live examples, and a visual theme editor: **[molique.dev][live]**.
This README covers only npm-specific install/usage details.

[live]: https://molique.dev

## Install

```bash
npm install molique
```

## Quick start

```html
<link rel="stylesheet" href="node_modules/molique/css/molique-style.css" />
...
<script defer src="node_modules/molique/js/molique-script.js"></script>
```

In most setups you won't reference `node_modules/` directly - copy (or let
your bundler copy) `css/molique-style.css` and `js/molique-script.js` +
`js/modules/` into your public/build output, keeping the `js/modules/`
folder next to `molique-script.js` (see "JS autoloader" below).

**Fonts are NOT bundled.** `scss/_root.scss`'s `@font-face` (Poppins)
expects `woff2` files under a `fonts/` folder next to your compiled CSS -
supply your own (e.g. via `@fontsource/poppins`) or point the `@font-face`
`src` at a CDN. Without it, molique degrades gracefully to `system-ui`.

## What's in the package

| Path | Description |
| --- | --- |
| `css/molique-style.css` | Core: reset, base, layout, components, utilities. **Required.** |
| `css/molique-style.min.css` | Minified core (production). |
| `css/molique-style-admin.css` | Admin panel module (layout, sidebar, drill-down). Optional. |
| `css/molique-style-shop.css` | E-commerce module. Optional. |
| `css/molique-style-blog.css` | Blog module. Optional. |
| `css/molique-style-docs.css` | Docs chrome + theme editor. Optional. |
| `css/molique-style-admin/-shop/-blog/-docs/-before-after/-share/-speed-dial.css` | Opt-in modules, each its own file - include only what you use. |
| `js/molique-script.js` | JS core + smart module autoloader. **Not an ES module** - load it via a plain `<script defer>` tag, don't `import`/bundle it (it relies on `document.currentScript` to locate `js/modules/`). |
| `js/modules/*.js` | Micro-modules loaded at runtime (carousel, lightbox, select, theme editor, …). |
| `img/flags/` | SVG flags for the language-switch component. |
| `scss/` | Sass sources - compile your own bundle or `@use` individual partials. |
| `purgecss.safelist.cjs` | Ready-made PurgeCSS safelist (see below). Only needed if you purge your CSS. |

## Optional modules (CSS)

Include only the ones you use - each is its own `css/molique-style-*.css`
file (admin, shop, blog, docs, before-after, share, speed-dial).

## molique-jit (optional)

**[`molique-jit`][jit]** is a companion CLI, published as its own package,
that scans your project's actual markup and generates only the CSS you
use - a more precise, zero-safelist-maintenance alternative to manually
picking modules above or configuring PurgeCSS below.

```bash
npm install --save-dev molique-jit
npx molique-jit init    # creates molique.config.mjs
npx molique-jit build   # scans your project, writes the output CSS
npx molique-jit watch   # rebuilds on file change, for local dev
```

It also ships an interactive scaffolding CLI (`molique-jit make:modal`,
`make:table`, `make:form`, `make:chart`, …) that generates ready-to-use
component markup grounded 1:1 in molique's own source - see the
[`molique-jit` package][jit] for the full command list.

[jit]: https://www.npmjs.com/package/molique-jit

## PurgeCSS (optional)

Some molique classes **don't appear in your HTML** - they're added by JS at
runtime (`.is-*` states, carousel, lightbox, and toast markup). PurgeCSS
can't see them and will strip them without a safelist. That's why the
package ships this file:

```js
// purgecss.config.js
const molique = require('molique/purgecss.safelist.cjs');

module.exports = {
  content: ['./**/*.html', './**/*.php', './js/**/*.js'],
  css: ['./css/molique-style.css'],
  safelist: molique.runtime,   // MINIMUM - without it, components break
  keyframes: true,
  variables: false,            // do NOT strip variables - the theme relies on them
};
```

**Safelist variants:**

| Call | When |
| --- | --- |
| `molique.runtime` | Always. Classes added by molique's JS. |
| `molique.merge('status', 'grid')` | When your **backend concatenates class names** - e.g. `class="badge-<?= $status ?>"` or `col-md-span-<?= $n ?>`. These classes don't exist literally in any file, so they need to be kept explicitly. |
| `molique.all` | All utility families (safest, smallest gain). |

Available groups: `colors`, `grid`, `spacing`, `status`.

## JS autoloader

`molique-script.js` scans the DOM and **only pulls in modules from
`js/modules/` when the matching component exists on the page** - no manual
loading needed. So leave the `js/modules/` folder intact next to
`molique-script.js`.

## Theme

Pick colors, typography, radii, and other variables visually in the
[online theme editor][live], then copy the result as a `:root { … }` block
into your own CSS. Theme variables also live in `scss/_root.scss` if you're
compiling from source.

## Compiling from source

Requires Dart Sass:

```bash
sass node_modules/molique/scss/molique-style.scss css/molique-style.css --style=expanded
sass node_modules/molique/scss/molique-style-admin.scss css/molique-style-admin.css --style=expanded
# ...same pattern for the remaining bundles
```

## License

Apache License 2.0. Copyright 2026 Rafał Różacki. Full text in the
`LICENSE` file, attribution notice in `NOTICE`.
