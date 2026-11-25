/**
 * molique - which sidebar entry lights up for the current address
 * (molique-admin-nav.js + molique-admin-nav-active.js), in a real browser.
 *
 * Until 1.7.53 only an identical path counted: on a record's card deeper than
 * the menu (/app/rentals/contract/12/) nothing in the sidebar was lit, not
 * even the module's name. And the flat-link module skipped every absolute
 * URL, so a sidebar rendered with full addresses (WordPress) never got lit
 * by it at all. Both checked here on the real autoloader, under real paths.
 *
 * The two modules each carry a copy of the matching function, because they
 * load in any order and each marks only its own half. Checked here three
 * ways: the copies are textually the same, and both load orders give the
 * same marks.
 *
 * MOLIQUE_TEST_ROOT=<dir> serves css/ and js/ from another copy (the files
 * from before the fix): the new claims must FAIL there.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:admin-nav
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASSETS = process.env.MOLIQUE_TEST_ROOT ? path.resolve(process.env.MOLIQUE_TEST_ROOT) : ROOT;
const require = createRequire(import.meta.url);
const SHOTS = process.env.MOLIQUE_SHOT_DIR || '';

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.log('SKIP  Playwright is not installed');
  process.exit(0);
}

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};
const eq = (name, got, want) => check(name, got === want, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);

/* ---- 0. the two copies of the matcher are the same code ---- */
{
  const body = (file, name) => {
    const src = fs.readFileSync(path.join(ASSETS, 'js/modules', file), 'utf8');
    const start = src.indexOf(`function ${name}(`);
    if (start < 0) return null;
    const end = src.indexOf('\n}\n', start);
    return src.slice(start, end + 2)
      .replace(name, 'MATCH')
      .replace(/normalizeAdminNavPath\(|normalizePath\(/g, 'NORM(');
  };
  const a = body('molique-admin-nav.js', 'adminNavSubmenuMatch');
  const b = body('molique-admin-nav-active.js', 'adminNavActiveMatch');
  check('obie kopie funkcji dopasowania istnieja', a !== null && b !== null);
  check('obie kopie sa identyczne (poza nazwami)', a !== null && a === b);
}

const ORIGIN = 'https://cc.local';

/* A panel in a subfolder, like WordPress: some links absolute, some
   relative, one external with a path that would otherwise match exactly. */
const NAV = `
<div class="admin-layout">
<aside class="admin-sidebar">
<nav class="admin-nav" id="nav">
  <a class="admin-nav-link" id="home" href="${ORIGIN}/briko/">Pulpit</a>
  <a class="admin-nav-link" id="stock" href="${ORIGIN}/briko/magazyn/">Magazyn</a>
  <a class="admin-nav-link" id="clients" href="/briko/klienci/">Klienci</a>
  <details class="admin-nav-submenu" id="rent">
    <summary class="admin-nav-link" id="rentSum">Najem</summary>
    <div class="admin-nav-submenu-list">
      <a class="admin-nav-submenu-link" id="rentContracts" href="/briko/najem/umowy/">Umowy</a>
      <a class="admin-nav-submenu-link" id="rentInvestors" href="${ORIGIN}/briko/najem/inwestorzy/">Inwestorzy</a>
    </div>
  </details>
  <details class="admin-nav-submenu" id="fin">
    <summary class="admin-nav-link" id="finSum">Finanse</summary>
    <div class="admin-nav-submenu-list">
      <a class="admin-nav-submenu-link" id="finInvoices" href="/briko/faktury/">Faktury</a>
      <a class="admin-nav-submenu-link" id="finCosts" href="/briko/koszty/">Koszty</a>
    </div>
  </details>
  <a class="admin-nav-link" id="ext" href="https://example.com/briko/magazyn/x/">Zewnętrzny</a>
  <a class="admin-nav-link" id="mail" href="mailto:biuro@example.com">Poczta</a>
  <a class="admin-nav-link" id="hash" href="#top">Kotwica</a>
  <a class="admin-nav-link mobile-only-nav-item" id="stock2" href="/briko/magazyn/">Magazyn (pasek)</a>
</nav>
</aside>
<main class="admin-main"><h1 class="text-6">Strona</h1></main>
</div>`;

/* A site at the domain root: the root link is "/". */
const NAV_ROOT = `
<nav class="admin-nav">
  <a class="admin-nav-link" id="rHome" href="/">Start</a>
  <a class="admin-nav-link" id="rBlog" href="/blog/">Blog</a>
  <a class="admin-nav-link" id="rContact" href="/kontakt/">Kontakt</a>
</nav>`;

const pageHtml = (nav, scripts) => `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/molique-style.css">
<link rel="stylesheet" href="/css/molique-style-admin.css"></head>
<body>${nav}${scripts}</body></html>`;

const AUTO = '<script src="/js/molique-script.js"></script>';

const serve = async (page, html) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.fulfill({ status: 404, body: '' });
    if (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/')) {
      const file = path.join(ASSETS, url.pathname);
      if (fs.existsSync(file)) {
        return route.fulfill({
          contentType: `${url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript'}; charset=utf-8`,
          body: fs.readFileSync(file, 'utf8'),
        });
      }
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  });
};

/* Everything marked, plus which branches are open - the whole picture, so an
   extra mark anywhere fails the comparison, not just a missing one. */
const marks = (page) =>
  page.evaluate(() => ({
    active: [...document.querySelectorAll('.is-active')].map((e) => e.id).sort().join(','),
    open: [...document.querySelectorAll('details[open]')].map((e) => e.id).sort().join(','),
  }));

const waitForModules = (page, both = true) =>
  page.waitForFunction((b) => typeof window.initAdminNavActive === 'function' && (!b || typeof window.initAdminNav === 'function'), both, { timeout: 5000 })
    .then(() => page.waitForTimeout(80))
    .catch(() => {});

const browser = await chromium.launch();
console.log(ASSETS === ROOT ? '(pliki z repo)' : `(pliki z ${ASSETS})`);

const CASES = [
  // [path, active ids, open ids, label]
  ['/briko/', 'home', '', 'pulpit: tylko on'],
  ['/briko/magazyn/', 'stock,stock2', '', 'dokladny adres: oba wystapienia, takze link bezwzgledny'],
  ['/briko/magazyn/material/5/', 'stock,stock2', '', 'karta w glebi modulu: link modulu'],
  ['/briko/magazyn/x/', 'stock,stock2', '', 'link do innej domeny z ta sama sciezka nie wygrywa'],
  ['/briko/magazynek/', '', '', 'granica segmentu: /magazynek to nie /magazyn'],
  ['/briko/profil/', '', '', 'nieznana strona: pulpit (korzen) NIE swieci'],
  ['/briko/klienci/', 'clients', '', 'link wzgledny, dokladny adres'],
  ['/briko/najem/umowy/', 'rentContracts,rentSum', 'rent', 'pozycja podmenu: link + galaz, galaz otwarta'],
  ['/briko/najem/umowa/12/', 'rentSum', 'rent', 'karta pod sekcja galezi: sama galaz, bez linku'],
  ['/briko/faktury/77/', 'finInvoices,finSum', 'fin', 'karta pod linkiem z podmenu: link + galaz'],
  ['/briko/koszty/', 'finCosts,finSum', 'fin', 'galaz bez wspolnej sekcji: dziala dokladny adres'],
];

/* ================= 1. THROUGH THE AUTOLOADER, DESKTOP ================= */
for (const [p, active, open, label] of CASES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await serve(page, pageHtml(NAV, AUTO));
  await page.goto(ORIGIN + p);
  await waitForModules(page);
  const m = await marks(page);
  eq(`${p}  ${label}`, m.active, active);
  eq(`${p}  otwarte galezie`, m.open, open);
  if (errors.length) check(`${p}  zero bledow JS`, false, errors.join(' | '));
  if (SHOTS && p === '/briko/najem/umowa/12/') await page.screenshot({ path: path.join(SHOTS, 'admin-nav-desktop.png') });
  await page.close();
}

/* ================= 2. PHONE: the branch is lit but NOT opened ================= */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await serve(page, pageHtml(NAV, AUTO));
  await page.goto(ORIGIN + '/briko/najem/umowa/12/');
  await waitForModules(page);
  const m = await marks(page);
  eq('telefon: karta pod sekcja - galaz podswietlona', m.active, 'rentSum');
  eq('telefon: drill-down NIE wjezdza sam', m.open, '');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'admin-nav-phone.png') });
  await page.close();
}

/* ================= 3. SITE AT THE DOMAIN ROOT ================= */
for (const [p, active, label] of [
  ['/', 'rHome', 'strona glowna: tylko start'],
  ['/blog/wpis-1/', 'rBlog', 'wpis: link bloga'],
  ['/inne/', '', 'nieznana: "/" nie swieci'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await serve(page, pageHtml(NAV_ROOT, AUTO));
  await page.goto(ORIGIN + p);
  await waitForModules(page, false);
  eq(`korzen "/": ${p}  ${label}`, (await marks(page)).active, active);
  await page.close();
}

/* ================= 4. LOAD ORDER DOES NOT MATTER ================= */
const results = [];
for (const order of [['molique-admin-nav.js', 'molique-admin-nav-active.js'], ['molique-admin-nav-active.js', 'molique-admin-nav.js']]) {
  const scripts = order.map((f) => `<script src="/js/modules/${f}"></script>`).join('')
    + `<script>${order.map((f) => (f.includes('active') ? 'initAdminNavActive();' : 'initAdminNav();')).join('')}</script>`;
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await serve(page, pageHtml(NAV, scripts));
  await page.goto(ORIGIN + '/briko/faktury/77/');
  await page.waitForTimeout(80);
  const m = await marks(page);
  results.push(`${m.active}|${m.open}`);
  await page.close();
}
eq('kolejnosc ladowania nie zmienia wyniku', results[0], results[1]);
eq('i wynik jest wlasciwy', results[0], 'finInvoices,finSum|fin');

console.log(failed ? `\n${failed} nie przeszlo` : '\nadmin-nav: wszystko przeszlo');
const done = await Promise.race([browser.close().then(() => 'c'), new Promise((x) => setTimeout(() => x('t'), 3000))]);
if (done === 't') console.log('(close zawisl)');
process.exit(failed ? 1 : 0);
