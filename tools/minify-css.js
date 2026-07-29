/**
 * molique - CSS minification for the site build (_site/)
 *
 * vite-plugin-static-copy copies css/*.css into _site/ 1:1 (see assetDirs
 * in vite.config.js) - it doesn't minify, because these are static
 * assets, not a JS module going through Vite's pipeline. Without this
 * step the site would serve the readable, dev-style CSS in production
 * (Lighthouse: "Minify CSS", ~28 KiB to save on molique-style.css alone).
 *
 * The repo's own css/*.css files STAY readable (--style=expanded) on
 * purpose - it's the same file that tools/build-packages.ps1 copies 1:1
 * as the "Full CSS (readable)" variant of the download package. This
 * script overwrites ONLY the compiled build in _site/ (gitignored),
 * recompiling the bundles from scratch with --style=compressed - it
 * never touches the repo's own css/*.css.
 *
 * Run with:  node tools/minify-css.js   (postbuild, after `vite build`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const outDir = path.join(root, '_site', 'css');
// See tools/gen-chunks.js - same reason (Node 24 + .cmd + shell:true).
const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');

if (!fs.existsSync(outDir)) {
  console.log('minify-css: no _site/css - skipping (run after `vite build`)');
  process.exit(0);
}

// Sass's directory mode only compiles files without a leading "_"
// (partials are skipped automatically), so only the actual bundles land
// here - the exact same 8 files static-copy already copied 1:1.
execFileSync(
  process.execPath,
  [sassJs, '--load-path=' + scssDir, scssDir + ':' + outDir, '--style=compressed', '--no-source-map', '--quiet'],
  { cwd: root, stdio: 'inherit' }
);

console.log('minify-css: bundles in _site/css/ minified (--style=compressed)');
