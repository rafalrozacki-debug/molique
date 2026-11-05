/**
 * molique - selective SVG sprite generator for the Phosphor icons
 *
 * Instead of an icon font (hundreds of glyphs in one file, including
 * unused ones) or a separate <img> per icon (one HTTP request each),
 * builds ONE img/icons-sprite.svg file containing ONLY the icons actually
 * used in src/*.html - a <symbol> referenced via <use>, zero JS at runtime.
 *
 * Icon source (not in the repo - too large, ~1500 files per weight), path
 * to the <weight>/<name>-<weight>.svg directory via MOLIQUE_PHOSPHOR_DIR
 * (see below) - without that variable and without the author's local
 * directory, the script simply skips regeneration (see the existsSync
 * check below). Default weight is "light" (matching what the rest of the
 * site uses).
 *
 * HTML usage syntax:
 *   <svg class="icon"><use href="img/icons-sprite.svg#ph-lightning"></use></svg>
 *
 * Run with:  node tools/gen-icon-sprite.js
 * Output:    img/icons-sprite.svg, plus one img/icons-<name>.svg per other
 *            sprite name referenced in src/*.html (repo root - copied into _site/img/ by
 *            the already-existing "img" entry in assetDirs in
 *            vite.config.js, zero extra Vite config needed)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const imgDir = path.join(root, 'img');

// The source Phosphor SVGs are local (not in the repo, ~1500 files per
// weight) - we let the path be given via an environment variable, with a
// fallback to the directory on the author's machine. Contributors cloning
// the public repo have neither one nor the other - see the existsSync
// check below, which in that case skips regeneration instead of blowing
// up the whole `npm run dev`/`npm run build` command (img/icons-sprite.svg
// is already generated and committed, so the build works fine on what's
// already there).
const PHOSPHOR_DIR =
  process.env.MOLIQUE_PHOSPHOR_DIR || 'C:/Praca/Materiały/Ikony/phosphor-icons/SVGs';
const DEFAULT_WEIGHT = 'light';

if (!existsSync(PHOSPHOR_DIR)) {
  console.log(
    'gen-icon-sprite: local Phosphor icon source not found (' +
      PHOSPHOR_DIR +
      ') - skipping regeneration, img/icons-sprite.svg stays unchanged.\n' +
      'To add/change an icon, download the SVGs from phosphoricons.com and ' +
      'point MOLIQUE_PHOSPHOR_DIR at their directory.'
  );
  process.exit(0);
}

/* ---------- 1. Scan src/*.html for icons actually used ---------- */

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) htmlFiles(p, out);
    else if (name.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// img/icons-sprite.svg#ph-lightning or ...#ph-lightning--bold (optional
// weight suffix). Every img/icons-*.svg is its own sprite with only the
// icons referenced to IT: icons-sprite.svg is the site-wide one (every page
// loads it), icons-anim-demo.svg holds the demos of docs-icon-anim.html and
// examples-icon-anim.html, and icons-anim-all.svg the gallery of every icon,
// which only that one page fetches (940 KB, 89 KB gzip). The gallery comes from
// a generated partial, so tools/gen-icon-gallery.js has to run before this.
const ICON_REF = /img\/(icons-[a-z0-9-]+)\.svg#ph-([a-z0-9-]+?)(?:--(thin|light|regular|bold|fill|duotone))?"/g;

const sprites = new Map(); // "icons-sprite" -> Map("weight/name" -> { name, weight })
for (const file of htmlFiles(srcDir)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(ICON_REF)) {
    const [, sprite, name] = m;
    const weight = m[3] || DEFAULT_WEIGHT;
    if (!sprites.has(sprite)) sprites.set(sprite, new Map());
    sprites.get(sprite).set(`${weight}/${name}`, { name, weight });
  }
}

if (sprites.size === 0) {
  console.log('gen-icon-sprite: no Phosphor icons used in src/*.html - skipping.');
  process.exit(0);
}

/* ---------- 2. Load and repackage every icon that's used ---------- */

const missing = [];
const outputs = [];

for (const [sprite, used] of [...sprites].sort(([a], [b]) => a.localeCompare(b))) {
  const symbols = [];
  for (const { name, weight } of [...used.values()].sort((a, b) => a.name.localeCompare(b.name) || a.weight.localeCompare(b.weight))) {
    // raw/ in phosphor-icons/core names the regular weight without a
    // suffix (regular/bell.svg), the other weights with one (light/bell-light.svg).
    let svgPath = path.join(PHOSPHOR_DIR, weight, `${name}-${weight}.svg`);
    if (!existsSync(svgPath) && weight === 'regular') svgPath = path.join(PHOSPHOR_DIR, weight, `${name}.svg`);
    // The local source names this one book-user in thin and regular only.
    if (!existsSync(svgPath) && name === 'book-open-user') {
      svgPath = path.join(PHOSPHOR_DIR, weight, weight === 'regular' ? 'book-user.svg' : `book-user-${weight}.svg`);
    }
    if (!existsSync(svgPath)) {
      missing.push(`${name} (weight: ${weight}) - file not found: ${svgPath}`);
      continue;
    }
    const raw = readFileSync(svgPath, 'utf8');

    // Extract the original's viewBox and just its content (without the
    // wrapping <svg> and without the decorative <rect fill="none"/> that
    // Phosphor appends to every icon as an invisible bounding box - it's
    // redundant inside a <symbol>).
    const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 256 256';
    const inner = raw
      .replace(/^<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/<rect[^>]*fill="none"[^>]*\/>/, '')
      .trim();

    const id = weight === DEFAULT_WEIGHT ? `ph-${name}` : `ph-${name}--${weight}`;
    symbols.push(`  <symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`);
  }
  outputs.push({ sprite, symbols });
}

if (missing.length) {
  console.error('\ngen-icon-sprite: source files not found for:');
  for (const m of missing) console.error('  - ' + m);
  console.error('Check the icon names for typos (phosphoricons.com) and run again.\n');
  process.exit(1);
}

/* ---------- 3. Write the sprites ---------- */

for (const { sprite, symbols } of outputs) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' +
    symbols.join('\n') +
    '\n</svg>\n';
  writeFileSync(path.join(imgDir, `${sprite}.svg`), svg, 'utf8');
  console.log(`gen-icon-sprite: ${symbols.length} Phosphor icons -> img/${sprite}.svg`);
}
