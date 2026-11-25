/**
 * molique - three panel fixes from 1.7.54, measured in a real browser:
 *
 *  1. position: sticky works inside .admin-main (overflow-x: clip, not hidden),
 *  2. a disabled button looks disabled (:disabled, aria-disabled, fieldset),
 *  3. .border-<colour> colours the frame of .border.
 *
 * All three failed SILENTLY before: valid HTML, clean console, wrong picture.
 * So every claim is read from the live element, and each has a control that
 * proves the measurement can fail (a sticky element inside a box with
 * overflow-x: hidden, a span with aria-disabled, a plain .border).
 *
 * MOLIQUE_TEST_ROOT=<dir> serves css/ and js/ from another copy - point it at
 * the files from before the fix and every new claim must FAIL. That is the
 * negative control of the whole file, run before each release.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:panel-states
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

const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'surface', 'body'];
const TOKEN = { surface: '--bg-surface', body: '--bg-body' };

const PANEL = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/molique-style.css">
<link rel="stylesheet" href="/css/molique-style-admin.css"></head>
<body>
<div class="admin-layout">
  <aside class="admin-sidebar"><nav class="admin-nav"><a class="admin-nav-link" href="#">Pulpit</a></nav></aside>
  <main class="admin-main" id="main">
    <div class="grid-md-cols-12 gap-3">
      <div class="col-md-span-8">
        <div style="height:2400px" class="card"><div class="card-body">Długa treść</div></div>
      </div>
      <div class="col-md-span-4">
        <div class="card position-sticky" id="stuck" style="top:16px"><div class="card-body">Kolejka</div></div>
      </div>
    </div>
    <!-- a table wider than the column: must still be cut, not widen the page -->
    <div id="wide" style="width:3000px;height:40px;background:var(--primary)"></div>
    <!-- CONTROL: the same sticky card inside a box with overflow-x: hidden.
         It must NOT stick - proves the measurement can tell the two apart. -->
    <div id="trap" style="overflow-x:hidden">
      <div style="height:1600px">
        <div class="card position-sticky" id="trapped" style="top:16px"><div class="card-body">W pułapce</div></div>
      </div>
    </div>
  </main>
</div>
</body></html>`;

const STATES = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/molique-style.css"></head>
<body style="padding:24px">
<div class="d-flex gap-2" style="flex-wrap:wrap">
  <button class="btn-primary" id="bOn">Zapisz</button>
  <button class="btn-primary" id="bOff" disabled>Zapisz</button>
  <button class="btn btn-icon" id="bIcon" disabled aria-label="Usuń">x</button>
  <button class="btn-action" id="bAction" disabled>Edytuj</button>
  <a class="btn-secondary" id="aOff" href="#klik" aria-disabled="true" tabindex="-1">Link</a>
  <a class="btn-secondary" id="aOn" href="#klik">Link aktywny</a>
  <button class="btn-primary is-loading" id="bLoad" disabled>Zapisuję</button>
  <button class="btn-outline-danger" id="bBusy" aria-busy="true" disabled>Usuwam</button>
  <!-- CONTROLS: not buttons, must not fade -->
  <span id="spanOff" aria-disabled="true">tekst</span>
  <span class="badge badge-primary" id="badgeOff" aria-disabled="true">3</span>
  <input class="input" id="inOff" disabled value="pole">
</div>
<form><fieldset disabled id="fs">
  <button class="btn-outline-danger" id="bFs" type="button">W zablokowanym fieldsecie</button>
</fieldset></form>

<div id="frames" class="d-flex gap-2" style="flex-wrap:wrap;margin-top:16px">
  ${COLORS.map((c) => `<div class="border border-${c} p-2" id="f-${c}">${c}<span id="probe-${c}" style="color:var(${TOKEN[c] || '--' + c})"></span></div>`).join('\n  ')}
  <div class="border p-2" id="fPlain">plain</div>
  <div class="border-danger p-2" id="fNoWidth">bez .border</div>
  <div class="border-top border-success p-2" id="fTop">góra</div>
  <div class="border border-danger p-2" id="fParent"><div class="border p-1" id="fChild">dziecko</div></div>
  <div class="border border-danger border-hover-primary p-2" id="fHover">hover</div>
  <div class="card border-warning" id="fCard"><div class="card-body">karta</div></div>
  <span id="probe-border" style="color:var(--border-color)"></span>
</div>
</body></html>`;

const serve = async (page, html) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    if (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/')) {
      const file = path.join(ASSETS, url.pathname);
      if (fs.existsSync(file)) {
        return route.fulfill({
          contentType: `${url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript'}; charset=utf-8`,
          body: fs.readFileSync(file, 'utf8'),
        });
      }
    }
    return route.fulfill({ status: 404, body: '' });
  });
};

const css = (page, id, prop) => page.evaluate(([i, p]) => getComputedStyle(document.getElementById(i))[p], [id, prop]);
const top = (page, id) => page.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);

const browser = await chromium.launch();
console.log(ASSETS === ROOT ? '(pliki z repo)' : `(pliki z ${ASSETS})`);

/* ================= 1. STICKY INSIDE .admin-main ================= */
for (const [label, width] of [['komputer', 1280], ['telefon', 390]]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await serve(page, PANEL);
  await page.goto('https://cc.local/');

  eq(`${label}: .admin-main nie jest kontenerem przewijania (overflow-y)`, await css(page, 'main', 'overflowY'), 'visible');
  eq(`${label}: .admin-main tnie w poziomie`, await css(page, 'main', 'overflowX'), 'clip');

  // molique sets scroll-behavior: smooth on html, so every scroll here is
  // 'instant' - a measurement taken mid-animation proves nothing.
  const start = await top(page, 'stuck');
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await page.waitForTimeout(50);
  const after = await top(page, 'stuck');
  if (width >= 768) {
    // On a phone the 12-column grid is one column, so the card stands below
    // the long one and has nothing to stick through - measured on desktop.
    check(`${label}: karta sticky zostaje 16 px od gory okna`, after === 16, `start ${start}, po przewinieciu ${after}`);
  }

  // The control: overflow-x: hidden on an ancestor kills sticky, as it used to.
  await page.evaluate(() => {
    const y = document.getElementById('trap').getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y + 600, behavior: 'instant' });
  });
  await page.waitForTimeout(50);
  const trapped = await top(page, 'trapped');
  check(`${label}: kontrola - sticky pod overflow-x:hidden odjezdza`, trapped <= -500, `top ${trapped}`);

  // Cutting still works: the 3000 px strip does not widen the page.
  const widths = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
    main: Math.round(document.getElementById('main').getBoundingClientRect().right),
  }));
  check(`${label}: szeroki element nadal przyciety (strona nie szersza niz okno)`, widths.doc <= widths.win, JSON.stringify(widths));
  check(`${label}: kolumna .admin-main nie wyszla poza okno`, widths.main <= widths.win, JSON.stringify(widths));
  check(`${label}: zero bledow JS`, errors.length === 0, errors.join(' | '));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `panel-sticky-${label}.png`) });
  await page.close();
}

/* ================= 2. DISABLED BUTTONS ================= */
{
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await serve(page, STATES);
  await page.goto('https://cc.local/');

  eq('aktywny .btn-primary: pelne krycie', await css(page, 'bOn', 'opacity'), '1');
  eq('disabled .btn-primary: przygaszony', await css(page, 'bOff', 'opacity'), '0.5');
  eq('disabled .btn-primary: mysz go nie dotyka', await css(page, 'bOff', 'pointerEvents'), 'none');
  eq('disabled .btn.btn-icon: przygaszony', await css(page, 'bIcon', 'opacity'), '0.5');
  eq('disabled .btn-action: przygaszony', await css(page, 'bAction', 'opacity'), '0.5');
  eq('<a aria-disabled> jako przycisk: przygaszony', await css(page, 'aOff', 'opacity'), '0.5');
  eq('<a> aktywny obok: pelne krycie', await css(page, 'aOn', 'opacity'), '1');
  eq('przycisk w <fieldset disabled>: przygaszony bez klasy', await css(page, 'bFs', 'opacity'), '0.5');
  eq('.is-loading + disabled: NIE przygaszony (spinner ma byc widac)', await css(page, 'bLoad', 'opacity'), '1');
  eq('aria-busy + disabled: NIE przygaszony', await css(page, 'bBusy', 'opacity'), '1');
  eq('kontrola: <span aria-disabled> bez zmian', await css(page, 'spanOff', 'opacity'), '1');
  eq('kontrola: .badge aria-disabled bez zmian', await css(page, 'badgeOff', 'opacity'), '1');

  // A real click on the disabled link must not reach it.
  await page.evaluate(() => { location.hash = ''; });
  const box = await page.evaluate(() => { const r = document.getElementById('aOff').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(box.x, box.y);
  eq('klik myszy w <a aria-disabled> nie nawiguje', await page.evaluate(() => location.hash), '');
  const box2 = await page.evaluate(() => { const r = document.getElementById('aOn').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(box2.x, box2.y);
  eq('kontrola: klik w aktywny <a> nawiguje', await page.evaluate(() => location.hash), '#klik');

  // Hover: the enabled one changes colour, the disabled one does not.
  const bgOf = (id) => css(page, id, 'backgroundColor');
  const restOn = await bgOf('bOn');
  const restOff = await bgOf('bOff');
  const hover = async (id) => {
    const r = await page.evaluate((i) => { const b = document.getElementById(i).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, id);
    await page.mouse.move(r.x, r.y);
    await page.waitForTimeout(400);
  };
  await hover('bOn');
  check('kontrola: aktywny zmienia tlo na hover', (await bgOf('bOn')) !== restOn, `${restOn} -> ${await bgOf('bOn')}`);
  await hover('bOff');
  eq('disabled nie reaguje na hover', await bgOf('bOff'), restOff);

  // The token works.
  await page.evaluate(() => document.documentElement.style.setProperty('--btn-disabled-opacity', '0.3'));
  eq('--btn-disabled-opacity zmienia krycie', await css(page, 'bOff', 'opacity'), '0.3');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'panel-disabled.png') });
  await page.close();
}

/* ================= 3. BORDER COLOURS ================= */
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await serve(page, STATES);
  await page.goto('https://cc.local/');
  if (theme === 'dark') await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

  for (const c of COLORS) {
    const want = await css(page, `probe-${c}`, 'color');
    eq(`${theme}: .border.border-${c} ma kolor ${c}`, await css(page, `f-${c}`, 'borderTopColor'), want);
  }
  const grey = await css(page, 'probe-border', 'color');
  eq(`${theme}: kontrola - sama .border zostaje szara`, await css(page, 'fPlain', 'borderTopColor'), grey);
  check(`${theme}: kontrola - szary rozni sie od danger`, grey !== (await css(page, 'probe-danger', 'color')));
  eq(`${theme}: .border-danger bez .border nie rysuje ramki`, await css(page, 'fNoWidth', 'borderTopStyle'), 'none');
  eq(`${theme}: .border-top.border-success - gora zielona`, await css(page, 'fTop', 'borderTopColor'), await css(page, 'probe-success', 'color'));
  eq(`${theme}: .border-top.border-success - dol bez ramki`, await css(page, 'fTop', 'borderBottomStyle'), 'none');
  eq(`${theme}: dziecko w czerwonej ramce ma szara .border (token nie dziedziczy sie)`, await css(page, 'fChild', 'borderTopColor'), grey);
  eq(`${theme}: .card.border-warning wygrywa z ramka karty`, await css(page, 'fCard', 'borderTopColor'), await css(page, 'probe-warning', 'color'));

  const r = await page.evaluate(() => { const b = document.getElementById('fHover').getBoundingClientRect(); return { x: b.x + 5, y: b.y + 5 }; });
  await page.mouse.move(r.x, r.y);
  await page.waitForTimeout(400);
  eq(`${theme}: .border-hover-primary wygrywa na hover`, await css(page, 'fHover', 'borderTopColor'), await css(page, 'probe-primary', 'color'));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `panel-borders-${theme}.png`) });
  await page.close();
}

/* ================= 4. .shake UNDER REDUCED MOTION ================= */
const SHAKE = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<link rel="stylesheet" href="/css/molique-style.css"></head>
<body style="padding:24px">
  <div class="card p-3" id="box">Odrzucone</div>
  <input class="input" id="mail" type="email" required>
  <div id="still">kontrola</div>
</body></html>`;

const animNames = (page, id) =>
  // CSS animations only: .input also runs transitions, which have no animationName.
  page.evaluate((i) => document.getElementById(i).getAnimations().filter((a) => a.animationName).map((a) => a.animationName).join(','), id);
const animProps = (page, id) =>
  page.evaluate((i) => {
    const a = document.getElementById(i).getAnimations()[0];
    if (!a) return '';
    const props = new Set();
    for (const f of a.effect.getKeyframes()) for (const k of Object.keys(f)) props.add(k);
    for (const m of ['offset', 'computedOffset', 'easing', 'composite']) props.delete(m);
    return [...props].sort().join(',');
  }, id);
const invalidate = async (page) => {
  await page.click('#mail');
  await page.keyboard.type('nie-mail');
  await page.click('#still');
};

for (const motion of ['no-preference', 'reduce']) {
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  await page.emulateMedia({ reducedMotion: motion });
  await serve(page, SHAKE);
  await page.goto('https://cc.local/');
  const ended = page.evaluate(() => new Promise((r) => {
    document.getElementById('box').addEventListener('animationend', () => r(true), { once: true });
    setTimeout(() => r(false), 2000);
  }));
  await page.evaluate(() => document.getElementById('box').classList.add('shake'));
  const want = motion === 'reduce' ? 'shakeReducedAnim' : 'shakeAnim';
  eq(`${motion}: .shake gra ${want}`, await animNames(page, 'box'), want);
  eq(`${motion}: .shake animuje ${motion === 'reduce' ? 'wylacznie opacity' : 'transform'}`, await animProps(page, 'box'), motion === 'reduce' ? 'opacity' : 'transform');
  await invalidate(page);
  eq(`${motion}: .input:user-invalid gra ${want}`, await animNames(page, 'mail'), want);
  eq(`${motion}: kontrola - element bez .shake stoi`, await animNames(page, 'still'), '');
  check(`${motion}: animationend przychodzi (strona moze zdjac .shake)`, (await ended) === true);
  await page.close();
}

console.log(failed ? `\n${failed} nie przeszlo` : '\npanel-states: wszystko przeszlo');
const done = await Promise.race([browser.close().then(() => 'c'), new Promise((x) => setTimeout(() => x('t'), 3000))]);
if (done === 't') console.log('(close zawisl)');
process.exit(failed ? 1 : 0);
