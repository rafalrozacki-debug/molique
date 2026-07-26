/**
 * molique - minifikacja CSS w buildzie strony (_site/)
 *
 * vite-plugin-static-copy kopiuje css/*.css do _site/ 1:1 (patrz
 * assetDirs w vite.config.js) - nie minifikuje, bo to statyczne assety,
 * nie modul JS przechodzacy przez pipeline Vite. Bez tego kroku strona
 * serwuje deweloperski, czytelny CSS produkcyjnie (Lighthouse: "Minify
 * CSS", ~28 KiB do zaoszczedzenia na samym molique-style.css).
 *
 * Repo-owe css/*.css ZOSTAJA czytelne (--style=expanded) celowo - to
 * ten sam plik, ktory tools/build-packages.ps1 kopiuje 1:1 jako wariant
 * "Pelna CSS (czytelna)" paczki do pobrania. Ten skrypt nadpisuje
 * WYLACZNIE skompilowany build w _site/ (gitignored), rekompilujac
 * bundle od nowa z --style=compressed - nigdy nie dotyka repo-owych
 * css/*.css.
 *
 * Uruchomienie:  node tools/minify-css.js   (postbuild, po `vite build`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scssDir = path.join(root, 'css', 'scss');
const outDir = path.join(root, '_site', 'css');
// Patrz tools/gen-chunks.js - ten sam powod (Node 24 + .cmd + shell:true).
const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');

if (!fs.existsSync(outDir)) {
  console.log('minify-css: brak _site/css - pomijam (uruchom po `vite build`)');
  process.exit(0);
}

// Katalogowy tryb sass kompiluje tylko pliki bez wiodacego "_" (partiale sa
// pomijane automatycznie), wiec trafiaja tu wylacznie faktyczne bundle -
// dokladnie te same 8 plikow, ktore static-copy juz skopiowal 1:1.
execFileSync(
  process.execPath,
  [sassJs, '--load-path=' + scssDir, scssDir + ':' + outDir, '--style=compressed', '--no-source-map', '--quiet'],
  { cwd: root, stdio: 'inherit' }
);

console.log('minify-css: bundle w _site/css/ zminifikowane (--style=compressed)');
