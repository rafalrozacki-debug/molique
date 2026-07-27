/**
 * molique - przygotowanie zawartosci pakietu npm "molique"
 *
 * Kopiuje juz skompilowane/zrodlowe artefakty (css/*.css, css/scss/**,
 * js/molique-script.js + js/modules/*.js, img/flags/*.svg,
 * purgecss.safelist.cjs, LICENSE, NOTICE) do npm/molique/ - jedynego
 * miejsca, ktore trafia do tarballa `npm publish`. Zero logiki tutaj -
 * czyste kopiowanie + jeden krok tlumaczenia komentarzy, dokladnie ta sama
 * infrastruktura, ktorej tools/build-packages.ps1 uzywa dla ZIP-ow z
 * download.html (tools/i18n-comments/apply-translations.mjs) - zeby nie
 * duplikowac logiki tlumaczenia w drugim miejscu.
 *
 * npm/molique/package.json i README.md sa WERSJONOWANE w repo (pisane
 * recznie) - ten skrypt tylko synchronizuje pole "version" z korzeniem
 * package.json (jedyne zrodlo prawdy numeru wersji, patrz tez
 * tools/sync-version.js). Foldery css/scss/js/img oraz skopiowane
 * LICENSE/NOTICE/purgecss.safelist.cjs sa GITIGNORED - w pelni odtwarzalne
 * tym skryptem z korzenia repo.
 *
 * Uruchomienie:  node tools/build-npm-molique.mjs
 * Wyjscie:       npm/molique/{css,scss,js,img}/**
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
    `\nBrak ${pkgPath}.\nTen plik jest wersjonowany recznie w repo, nie generowany - ` +
      'sprawdz, czy katalog npm/molique/ nie zostal przypadkiem usuniety.\n'
  );
  process.exit(1);
}

/* ---------- 1. Czyszczenie wygenerowanej wczesniej zawartosci ---------- */
// package.json/README.md zostaja - sa wersjonowane recznie, reszta jest
// w pelni odtwarzalna z korzenia repo.

for (const dir of ['css', 'scss', 'js', 'img']) {
  fs.rmSync(path.join(npmDir, dir), { recursive: true, force: true });
}

/* ---------- 2. CSS (skompilowane bundle, bez .map - mapy wskazuja na lokalne sciezki dev) ---------- */

const cssOut = path.join(npmDir, 'css');
fs.mkdirSync(cssOut, { recursive: true });
const cssSrc = path.join(root, 'css');
let copiedCss = 0;
for (const name of fs.readdirSync(cssSrc)) {
  if (!name.endsWith('.css')) continue;
  fs.copyFileSync(path.join(cssSrc, name), path.join(cssOut, name));
  copiedCss++;
}

/* ---------- 2.5. Minifikacja - kazdy bundle tez jako .min.css ---------- */
// repo-owe css/*.css zostaja czytelne (--style=expanded, patrz tools/minify-css.js) -
// npm potrzebuje WERSJI PRODUKCYJNEJ tak samo jak paczki ZIP z download.html
// (tools/build-packages.ps1), wiec rekompilujemy z odpowiadajacego .scss.
// Wywolanie node_modules/sass/sass.js BEZPOSREDNIO (nie `npx sass`) - ta sama
// sztuczka co w tools/minify-css.js/tools/gen-chunks.js (Windows + .cmd + shell).

const sassJs = path.join(root, 'node_modules', 'sass', 'sass.js');
const bundleNames = fs
  .readdirSync(cssOut)
  .filter((n) => n.endsWith('.css'))
  .map((n) => n.replace(/\.css$/, ''));

for (const name of bundleNames) {
  const scssFile = path.join(cssSrc, 'scss', `${name}.scss`);
  if (!fs.existsSync(scssFile)) continue; // bezpiecznik - pomija bundle bez wlasnego pliku .scss
  execFileSync(
    process.execPath,
    [sassJs, scssFile, path.join(cssOut, `${name}.min.css`), '--style=compressed', '--no-source-map', '--quiet'],
    { cwd: root, stdio: 'inherit' }
  );
}

/* ---------- 3. SCSS (zrodla) - bez luster .md (dokumentacja/kontekst AI, nie kod) ---------- */

fs.cpSync(path.join(cssSrc, 'scss'), path.join(npmDir, 'scss'), { recursive: true });
(function stripMarkdown(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) stripMarkdown(p);
    else if (name.endsWith('.md')) fs.rmSync(p);
  }
})(path.join(npmDir, 'scss'));

/* ---------- 4. JS (core + moduly autoloadera) ---------- */

const jsModulesOut = path.join(npmDir, 'js', 'modules');
fs.mkdirSync(jsModulesOut, { recursive: true });
fs.copyFileSync(path.join(root, 'js', 'molique-script.js'), path.join(npmDir, 'js', 'molique-script.js'));
for (const name of fs.readdirSync(path.join(root, 'js', 'modules'))) {
  fs.copyFileSync(path.join(root, 'js', 'modules', name), path.join(jsModulesOut, name));
}

/* ---------- 5. Flagi (Language Switch) ---------- */

const flagsOut = path.join(npmDir, 'img', 'flags');
fs.mkdirSync(flagsOut, { recursive: true });
for (const name of fs.readdirSync(path.join(root, 'img', 'flags'))) {
  fs.copyFileSync(path.join(root, 'img', 'flags', name), path.join(flagsOut, name));
}

/* ---------- 6. Tlumaczenie komentarzy na angielski ---------- */
// Ta sama infrastruktura co ZIP-y z download.html (tools/build-packages.ps1)
// - PL jest oryginalem w repo, EN/DE to podmiana tresci komentarzy w
// skopiowanej kopii. npm celuje w globalny ekosystem JS, wiec EN na stale
// (w odroznieniu od ZIP-ow, ktore oferuja wszystkie trzy jezyki obok siebie).

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

/* ---------- 8. Wersja - korzenny package.json to JEDYNE zrodlo prawdy ---------- */
// (patrz tez tools/sync-version.js) - synchronizujemy tu zamiast recznie
// bumpowac dwa numery wersji osobno przy kazdym wydaniu.

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const npmPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (npmPkg.version !== rootPkg.version) {
  npmPkg.version = rootPkg.version;
  fs.writeFileSync(pkgPath, JSON.stringify(npmPkg, null, 2) + '\n');
  console.log(`[build-npm-molique] Wersja zsynchronizowana: ${rootPkg.version}`);
}

console.log(`[build-npm-molique] Skopiowano ${copiedCss} bundli CSS, scss/, js/, img/flags/ -> ${path.relative(root, npmDir)}`);
