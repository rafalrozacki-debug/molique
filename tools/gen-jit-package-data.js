/**
 * molique - prepares the data for the molique-jit package
 *
 * Copies already-generated artifacts (utilities.json from
 * gen-jit-utilities.js, class-index.json + the compiled component chunks
 * from gen-chunks.js, the base safelist from purgecss.safelist.cjs) into
 * tools/jit/package/data/ - the only place the package's engine actually
 * reads at runtime. Zero logic here - this is pure copying, so the
 * package can be published and used without access to this monorepo/Sass.
 *
 * Run with:  node tools/gen-jit-package-data.js   (requires having already
 *            run node tools/gen-chunks.js && node tools/gen-jit-utilities.js)
 * Output:    tools/jit/package/data/**
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunksDir = path.join(root, 'dist', 'chunks');
const utilitiesSrc = path.join(root, 'tools', 'jit', 'dist-data', 'utilities.json');
const classIndexSrc = path.join(chunksDir, 'class-index.json');
const dataDir = path.join(root, 'tools', 'jit', 'package', 'data');
const componentsOut = path.join(dataDir, 'components');

function requireFile(p, hint) {
  if (!fs.existsSync(p)) {
    console.error(`\nMissing ${p}.\n${hint}\n`);
    process.exit(1);
  }
}

requireFile(utilitiesSrc, 'Run first:  node tools/gen-jit-utilities.js');
requireFile(classIndexSrc, 'Run first:  node tools/gen-chunks.js');

fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(componentsOut, { recursive: true });

/* ---------- 1. utilities.json + class-index.json (1:1 copy) ---------- */

fs.copyFileSync(utilitiesSrc, path.join(dataDir, 'utilities.json'));
fs.copyFileSync(classIndexSrc, path.join(dataDir, 'class-index.json'));

/* ---------- 2. Component chunks used in class-index.json ---------- */

const classIndex = JSON.parse(fs.readFileSync(classIndexSrc, 'utf8'));
const componentIds = new Set(Object.values(classIndex.classes));

let copiedComponents = 0;
for (const id of componentIds) {
  const from = path.join(chunksDir, `molique-${id}.css`);
  requireFile(from, `No compiled chunk for component "${id}" - run node tools/gen-chunks.js.`);
  fs.copyFileSync(from, path.join(componentsOut, `molique-${id}.css`));
  copiedComponents++;
}

/* ---------- 3. Theme variables + reset/base - always needed ---------- */
// "root" (:root variables + dark mode) and "base" (reset, base typography,
// .container/.container-fluid) are both marked "mandatory: true" in
// gen-chunks.js - the configurator won't even let you uncheck them, since
// the framework doesn't render correctly without them. molique-jit treats
// them the same way: always included, regardless of the scanned classes.

for (const id of ['root', 'base']) {
  const chunk = path.join(chunksDir, `molique-${id}.css`);
  requireFile(chunk, `Missing dist/chunks/molique-${id}.css - run node tools/gen-chunks.js.`);
  fs.copyFileSync(chunk, path.join(dataDir, `molique-${id}.css`));
}

/* ---------- 4. Base safelist - from purgecss.safelist.cjs, not by hand ---------- */
// Only the "runtime.standard" tier (classes created/toggled by molique's
// OWN JS - toasts, lightbox, carousel, sidebar, etc.) - the same set
// purgecss.safelist.cjs marks as "mandatory". The "families" tier in that
// file covers dynamic classes ASSEMBLED BY THE CONSUMER'S OWN BACKEND
// (e.g. `badge-<?= $status ?>`) - specific to each project, so it's not
// included here by default; the consumer adds their own in
// molique.config.mjs (Phase 5).
const require = createRequire(import.meta.url);
const safelistSrc = require(path.join(root, 'purgecss.safelist.cjs'));
fs.writeFileSync(
  path.join(dataDir, 'safelist.json'),
  JSON.stringify(
    {
      note:
        'AUTO-GENERATED FILE - do not edit by hand. ' +
        'Source: tools/gen-jit-package-data.js, data from purgecss.safelist.cjs (runtime.standard tier).',
      standard: safelistSrc.runtime.standard,
    },
    null,
    2
  ) + '\n'
);

console.log('Copied components (+ buttons/grid/layout): ' + copiedComponents);
console.log('Copied: utilities.json, class-index.json, molique-root.css, molique-base.css, safelist.json');
console.log('Written to: ' + path.relative(root, dataDir));
