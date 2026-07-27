🇬🇧 **English** · 🇵🇱 [Polski](README.pl.md) · 🇩🇪 [Deutsch](README.de.md)

# molique

A lightweight, rigorously optimized CSS framework for B2B. Built on native
cascade layers (`@layer`), with zero specificity wars and zero dependencies
(no jQuery). Version: **1.7.7**.

## Repository structure

This repo contains two distinct things:

- **The framework itself** - `css/`, `js/`, `fonts/`, `starter.html`. This
  is the actual "product": the `dist/*.zip` packages (see [Releases][releases])
  are exactly these folders, zipped up and ready to drop into any project.
  The rest of this README covers only this part.
- **The source of [molique.dev][live]** - all the docs, examples,
  and module demos (`src/`), built with Vite (`npm run dev` /
  `npm run build`, configuration in `vite.config.js`, tooling in `tools/`).
  This is NOT part of the downloadable package - it's just our own site,
  built using molique. If you want to fix a typo in the docs or add a
  component example, this is the right place - the whole page is already
  publicly visible via "View Source" in the browser anyway, so there's
  nothing hidden here.

[releases]: https://github.com/rafalrozacki-debug/molique/releases
[live]: https://molique.dev

## Quick start

1. Copy the `css/`, `js/`, and `fonts/` folders into your project
   (`fonts/` is required by the built-in `@font-face` - Poppins;
   without it, molique degrades gracefully to `system-ui`).
2. In `<head>`, include the core, and the JS at the end of `<body>` with
   the `defer` attribute:

```html
<link rel="stylesheet" href="css/molique-style.css" />
...
<script defer src="js/molique-script.js"></script>
```

3. Done. See `starter.html` as a starting point.

## What's in the package

| Path | Description |
| --- | --- |
| `css/molique-style.css` | Core: reset, base, layout, components, utilities. **Required.** |
| `css/molique-style.min.css` | Minified core (production). |
| `css/molique-style-admin.css` | Admin panel module (layout, sidebar, drill-down). Optional. |
| `css/molique-style-shop.css` | E-commerce module. Optional. |
| `css/molique-style-blog.css` | Blog module. Optional. |
| `css/molique-style-docs.css` | Docs chrome + theme editor. Optional. |
| `js/molique-script.js` | JS core + smart module autoloader. |
| `js/modules/*.js` | Micro-modules loaded at runtime (carousel, lightbox, select, theme editor, …). |
| `fonts/` | `woff2` files (Poppins). Used by the `@font-face` built into `molique-style.css` - copy this folder next to `css/`. |
| `img/flags/` | SVG flags for the language-switch component. |
| `starter.html` | Minimal starter template. |
| `purgecss.safelist.cjs` | Ready-made PurgeCSS safelist (see below). Only needed if you purge your CSS. |
| `scss/` | *(Source package only)* Sass sources for compiling your own. |

## Optional modules (CSS)

Include only the ones you use - each is its own `css/molique-style-*.css`
file (admin, shop, blog, docs, before-after, share, speed-dial).

## PurgeCSS (optional)

Some molique classes **don't appear in your HTML** - they're added by JS at
runtime (`.is-*` states, carousel, lightbox, and toast markup). PurgeCSS
can't see them and will strip them without a safelist. That's why the
package ships this file:

```js
// purgecss.config.js
const molique = require('./purgecss.safelist.cjs');

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

**Effect on a real page** (navbar + card + buttons): `277 KB → 68 KB` (−75%),
while keeping everything JS adds.

> **Note:** before reaching for PurgeCSS, check whether picking the right
> modules above is enough - that's a reduction with zero risk. `variables: true`
> will break the theme (dozens of CSS variables, full list in
> `docs-variables.html`), and `keyframes: true` is safe **only** with the
> safelist.

## JS autoloader

`molique-script.js` scans the DOM and **only pulls in modules from
`js/modules/` when the matching component exists on the page** - no manual
loading needed. So leave the `js/modules/` folder intact next to
`molique-script.js`.

## Theme (Theme Editor)

Pick colors, typography, radii, and other variables visually in the theme
editor (`theme-editor.html` in the online version), then copy the result as
a `:root { … }` block into your own CSS.

## Compiling from source (Source package)

Requires Dart Sass:

```bash
sass css/scss/molique-style.scss css/molique-style.css --style=expanded
sass css/scss/molique-style-admin.scss css/molique-style-admin.css --style=expanded
# ...same pattern for the remaining bundles
```

Theme variables (colors, spacing, radius, typography) live in
`scss/_root.scss`.

## License

Apache License 2.0. Copyright 2026 Rafał Różacki. Full text in the
`LICENSE` file, attribution notice in `NOTICE`.
