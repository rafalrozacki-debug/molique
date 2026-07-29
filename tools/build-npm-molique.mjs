/**
 * molique - prepares the contents of the npm package "molique"
 *
 * Copies already-compiled/source artifacts (css/*.css, css/scss/**,
 * js/molique-script.js + js/modules/*.js, img/flags/*.svg,
 * purgecss.safelist.cjs, LICENSE, NOTICE) into npm/molique/ - the only
 * place that goes into the `npm publish` tarball. Zero logic here - pure
 * copying plus one comment-translation step, the exact same
 * infrastructure tools/build-packages.ps1 uses for the download.html ZIPs
 * (tools/i18n-comments/apply-translations.mjs) - so the translation logic
 * isn't duplicated in a second place.
 *
 * npm/molique/package.json and README.md are VERSIONED in the repo
 * (hand-written) - this script only syncs the "version" field from the
 * root package.json (the single source of truth for the version number,
 * see also tools/sync-version.js). The css/scss/js/img folders and the
 * copied LICENSE/NOTICE/purgecss.safelist.cjs are GITIGNORED - fully
 * reproducible by this script from the repo root.
 *
 * Run with:  node tools/build-npm-molique.mjs
 * Output:    npm/molique/{css,scss,js,img}/**
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmDir = path.join(root, 'npm', 'molique');
const pkgPath = path.join(npmDir, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error(
    `\nMissing ${pkgPath}.\nThis file is hand-versioned in the repo, not generated - ` +
      'check whether the npm/molique/ directory was accidentally deleted.\n'
  );
  process.exit(1);
}

/* ---------- 1. Clearing previously generated content ---------- */
// package.json/README.md stay - they're hand-versioned, everything else
// is fully reproducible from the repo root.

for (const dir of ['css', 'scss', 'js', 'img']) {
  fs.rmSync(path.join(npmDir, dir), { recursive: true, force: true });
}

/* ---------- 2. CSS (compiled bundles, no .map - the maps point to local dev paths) ---------- */

const cssOut = path.join(npmDir, 'css');
fs.mkdirSync(cssOut, { recursive: true });
const cssSrc = path.join(root, 'css');
let copiedCss = 0;
for (const name of fs.readdirSync(cssSrc)) {
  if (!name.endsWith('.css')) continue;
  fs.copyFileSync(path.join(cssSrc, name), path.join(cssOut, name));
  copiedCss++;
}

/* ---------- 2.5. Minification - every bundle also as .min.css ---------- */
// The repo's own css/*.css stays readable (--style=expanded, see
// tools/minify-css.js) - npm needs a PRODUCTION VERSION just like the ZIP
// packages from download.html (tools/build-packages.ps1), so we recompile
// from the matching .scss. Calling node_modules/sass/sass.js DIRECTLY
// (not `npx sass`) - the same trick as in tools/minify-css.js/
// tools/gen-chunks.js (Windows + .cmd + shell).

const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');
const bundleNames = fs
  .readdirSync(cssOut)
  .filter((n) => n.endsWith('.css'))
  .map((n) => n.replace(/\.css$/, ''));

for (const name of bundleNames) {
  const scssFile = path.join(cssSrc, 'scss', `${name}.scss`);
  if (!fs.existsSync(scssFile)) continue; // safety net - skips a bundle with no matching .scss file
  execFileSync(
    process.execPath,
    [sassJs, scssFile, path.join(cssOut, `${name}.min.css`), '--style=compressed', '--no-source-map', '--quiet'],
    { cwd: root, stdio: 'inherit' }
  );
}

/* ---------- 3. SCSS (sources) - without the .md mirrors (documentation/AI context, not code) ---------- */

fs.cpSync(path.join(cssSrc, 'scss'), path.join(npmDir, 'scss'), { recursive: true });
(function stripMarkdown(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) stripMarkdown(p);
    else if (name.endsWith('.md')) fs.rmSync(p);
  }
})(path.join(npmDir, 'scss'));

/* ---------- 4. JS (core + autoloader modules) ---------- */

const jsModulesOut = path.join(npmDir, 'js', 'modules');
fs.mkdirSync(jsModulesOut, { recursive: true });
fs.copyFileSync(path.join(root, 'js', 'molique-script.js'), path.join(npmDir, 'js', 'molique-script.js'));
for (const name of fs.readdirSync(path.join(root, 'js', 'modules'))) {
  fs.copyFileSync(path.join(root, 'js', 'modules', name), path.join(jsModulesOut, name));
}

/* ---------- 5. Flags (Language Switch) ---------- */

const flagsOut = path.join(npmDir, 'img', 'flags');
fs.mkdirSync(flagsOut, { recursive: true });
for (const name of fs.readdirSync(path.join(root, 'img', 'flags'))) {
  fs.copyFileSync(path.join(root, 'img', 'flags', name), path.join(flagsOut, name));
}

/* ---------- 6. Translating comments to English ---------- */
// The same infrastructure as the download.html ZIPs (tools/build-packages.ps1)
// - PL is the original in the repo, EN/DE swap the comment text in the
// copied copy. npm targets the global JS ecosystem, so it's always EN
// (unlike the ZIPs, which offer all three languages side by side).

execFileSync(
  process.execPath,
  [path.join(root, 'tools', 'i18n-comments', 'apply-translations.mjs'), 'en', npmDir],
  { stdio: 'inherit' }
);

/* ---------- 7. LICENSE / NOTICE / safelist ---------- */

for (const f of ['LICENSE', 'NOTICE', 'purgecss.safelist.cjs']) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(npmDir, f));
}

/* ---------- 8. Version - the root package.json is the ONLY source of truth ---------- */
// (see also tools/sync-version.js) - synced here instead of hand-bumping
// two version numbers separately on every release.

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const npmPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (npmPkg.version !== rootPkg.version) {
  npmPkg.version = rootPkg.version;
  fs.writeFileSync(pkgPath, JSON.stringify(npmPkg, null, 2) + '\n');
  console.log(`[build-npm-molique] Version synced: ${rootPkg.version}`);
}

console.log(`[build-npm-molique] Copied ${copiedCss} CSS bundles, scss/, js/, img/flags/ -> ${path.relative(root, npmDir)}`);
