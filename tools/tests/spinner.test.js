/**
 * molique - loading spinner in a real browser (.spinner, .is-loading, aria-busy).
 *
 * This component is pure CSS, so "it compiled" proves nothing: a keyframe name
 * that belongs to no file still serialises into animation-name and the element
 * simply stands still, with a clean console. Every claim here is therefore
 * measured on the live element - getAnimations() returns NOTHING when the
 * keyframes are missing, which is the only reliable way to catch that trap.
 *
 * Every trap has a negative control, including one that proves the test itself
 * can fail (an animation pointing at keyframes that really do not exist).
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:spinner
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
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

const PAGE = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/molique-style.css"></head>
<body style="padding:24px">

<h2 class="text-4">Spinner sam</h2>
<p id="ctxBase" style="font-size:16px">
  <span class="spinner" id="s1" aria-hidden="true"></span>
  <span class="spinner spinner-sm" id="sSm" aria-hidden="true"></span>
  <span class="spinner spinner-lg" id="sLg" aria-hidden="true"></span>
  <span class="spinner spinner-xl" id="sXl" aria-hidden="true"></span>
</p>
<!-- the same class, twice the font-size: the em claim -->
<p id="ctxBig" style="font-size:32px"><span class="spinner" id="s2" aria-hidden="true"></span></p>
<!-- colour comes from the text colour, nothing else -->
<p style="color:rgb(255,0,0)"><span class="spinner" id="sRed" aria-hidden="true"></span></p>
<p style="color:rgb(0,0,255)"><span class="spinner" id="sBlue" aria-hidden="true"></span></p>

<!-- NEGATIVE CONTROLS: no .spinner, and an animation whose keyframes do not exist -->
<span id="notSpinner"></span>
<span id="fakeAnim" style="animation: thisKeyframeDoesNotExist 1s linear infinite"></span>

<h2 class="text-4">Przyciski</h2>
<div class="d-flex gap-2 align-items-center" style="flex-wrap:wrap">
  <button class="btn-primary" id="bIdle">Zapisz zmiany</button>
  <button class="btn-primary is-loading" id="bLoad" disabled>Zapisz zmiany</button>
  <button class="btn-outline-danger" aria-busy="true" id="bBusy" disabled>Usuń</button>
  <button class="btn-secondary is-loading" id="bIcon" disabled>
    <svg class="icon" id="bIconSvg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"/></svg>
    Z ikoną
  </button>
  <button class="btn-sm btn-success is-loading" id="bSm" disabled>Mały</button>
  <!-- NEGATIVE CONTROL: .is-loading on something that is not a button -->
  <span class="is-loading" id="notBtn">nie przycisk</span>
</div>

<h2 class="text-4">Nakładka</h2>
<div class="grid-md-cols-3 gap-3">
  <div class="card" id="cardBusy" aria-busy="true">
    <div class="spinner-overlay" id="ovBusy">
      <span class="spinner spinner-lg" aria-hidden="true"></span>
      <span>Wczytuję dane…</span>
    </div>
    <div class="card-body"><p>Treść pod spodem zostaje widoczna.</p><p>Druga linia.</p></div>
  </div>
  <!-- NEGATIVE CONTROL: overlay present, container NOT busy -->
  <div class="card" id="cardIdle" aria-busy="false">
    <div class="spinner-overlay" id="ovIdle"><span class="spinner" aria-hidden="true"></span></div>
    <div class="card-body"><p>Nie ładuje się.</p></div>
  </div>
  <!-- NEGATIVE CONTROL: busy, but no overlay - must NOT get a positioning context -->
  <div class="card" id="cardNoOverlay" aria-busy="true">
    <div class="card-body"><p>Zajęta bez nakładki.</p></div>
  </div>
</div>

<h2 class="text-4">Paleta poleceń</h2>
<div class="command-palette is-loading" id="cp" style="position:static;margin:0">
  <div class="command-palette-header" id="cpHead">
    <input class="command-palette-input" value="faktur" readonly>
  </div>
  <div class="command-palette-list"></div>
</div>
<!-- NEGATIVE CONTROL: the same palette, not loading -->
<div class="command-palette" id="cpIdle" style="position:static;margin:0">
  <div class="command-palette-header" id="cpIdleHead">
    <input class="command-palette-input" value="faktur" readonly>
  </div>
</div>
</body></html>`;

const serve = async (page) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: PAGE });
    if (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/')) {
      const file = path.join(ROOT, url.pathname);
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

/* Animations are read from the document, because a ::after animation is not
   reachable from the element's own getAnimations() in every engine. */
const animOf = (page, id, pseudo = null) =>
  page.evaluate(
    ([i, p]) => {
      const el = document.getElementById(i);
      const list = document.getAnimations().filter((a) => {
        const e = a.effect;
        return e && e.target === el && (e.pseudoElement || null) === p;
      });
      return list.map((a) => a.animationName || (a.effect.getKeyframes ? 'unnamed' : '?'));
    },
    [id, pseudo]
  );

const styleOf = (page, id, props, pseudo = null) =>
  page.evaluate(
    ([i, ps, p]) => {
      const cs = getComputedStyle(document.getElementById(i), p);
      const out = {};
      for (const k of ps) out[k] = cs[k];
      return out;
    },
    [id, props, pseudo]
  );

const rectOf = (page, id) =>
  page.evaluate((i) => {
    const r = document.getElementById(i).getBoundingClientRect();
    return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, x: Math.round(r.x), y: Math.round(r.y) };
  }, id);

const browser = await chromium.launch();

/* ================= 1. NORMAL MOTION ================= */
{
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await serve(page);
  await page.goto('https://cc.local/');
  await page.waitForTimeout(120);

  check('zero bledow JS', errors.length === 0, errors.join(' | '));

  /* --- the keyframes actually resolve (the per-file chunk trap) --- */
  eq('.spinner ma dzialajaca animacje', (await animOf(page, 's1')).join(','), 'spinnerRotate');
  eq('KONTROLA UJEMNA: brakujace keyframes = zero animacji', (await animOf(page, 'fakeAnim')).length, 0);
  eq('KONTROLA UJEMNA: element bez .spinner nie animuje', (await animOf(page, 'notSpinner')).length, 0);

  /* --- and it really advances, not frozen on frame 0 --- */
  const moved = await page.evaluate(async () => {
    const el = document.getElementById('s1');
    const a = document.getAnimations().find((x) => x.effect && x.effect.target === el);
    if (!a) return null;
    const t0 = a.currentTime;
    await new Promise((r) => setTimeout(r, 160));
    return Number(a.currentTime) > Number(t0);
  });
  check('obrot postepuje w czasie', moved === true, String(moved));

  /* --- only transform is animated (the GPU rule) --- */
  const kf = await page.evaluate(() => {
    const el = document.getElementById('s1');
    const a = document.getAnimations().find((x) => x.effect && x.effect.target === el);
    const props = new Set();
    for (const f of a.effect.getKeyframes()) for (const k of Object.keys(f)) props.add(k);
    for (const m of ['offset', 'computedOffset', 'easing', 'composite']) props.delete(m);
    return [...props].sort();
  });
  eq('animuje WYLACZNIE transform', kf.join(','), 'transform');

  /* --- size is relative to the surrounding font --- */
  const base = await rectOf(page, 's1');
  const big = await rectOf(page, 's2');
  check('rozmiar skaluje sie z font-size (16->32px)', Math.abs(big.w - base.w * 2) < 0.6, `${base.w} -> ${big.w}`);
  check('kolo jest kwadratowe (pierscien, nie owal)', Math.abs(base.w - base.h) < 0.6, JSON.stringify(base));

  const sm = await rectOf(page, 'sSm');
  const lg = await rectOf(page, 'sLg');
  const xl = await rectOf(page, 'sXl');
  check('warianty rozmiaru rosna sm < baza < lg < xl', sm.w < base.w && base.w < lg.w && lg.w < xl.w, `${sm.w} ${base.w} ${lg.w} ${xl.w}`);

  /* --- it is a ring: the mask survived compilation --- */
  const ring = await styleOf(page, 's1', ['maskImage', 'borderRadius', 'backgroundImage']);
  check('maska jest obecna (pierscien, nie dysk)', /radial-gradient/.test(ring.maskImage), ring.maskImage.slice(0, 60));
  check('pelne zaokraglenie', ring.borderRadius === '50%', ring.borderRadius);
  check('ogon to conic-gradient', /conic-gradient/.test(ring.backgroundImage), ring.backgroundImage.slice(0, 50));

  /* --- colour follows the text colour, not a baked-in value --- */
  const red = (await styleOf(page, 'sRed', ['backgroundImage'])).backgroundImage;
  const blue = (await styleOf(page, 'sBlue', ['backgroundImage'])).backgroundImage;
  check('kolor idzie z currentColor (rozny dla roznych rodzicow)', red !== blue, `${red.slice(0, 40)} vs ${blue.slice(0, 40)}`);
  check('czerwony spinner zawiera czerwien', /255,\s*0,\s*0|currentcolor/i.test(red), red.slice(0, 70));

  /* ================= 2. BUTTON ================= */
  const idle = await rectOf(page, 'bIdle');
  const load = await rectOf(page, 'bLoad');
  check('PRZYCISK NIE ZMIENIA SZEROKOSCI przy ladowaniu', Math.abs(idle.w - load.w) < 0.6, `${idle.w} vs ${load.w}`);
  check('nie zmienia tez wysokosci', Math.abs(idle.h - load.h) < 0.6, `${idle.h} vs ${load.h}`);

  /* KONTROLA UJEMNA for the measurement itself: a real extra child DOES grow
     the button, so the comparison above is sensitive enough to notice. */
  const grew = await page.evaluate(() => {
    const b = document.getElementById('bIdle');
    const before = b.getBoundingClientRect().width;
    const s = document.createElement('span');
    s.className = 'spinner';
    b.prepend(s);
    const after = b.getBoundingClientRect().width;
    s.remove();
    return after - before;
  });
  check('KONTROLA UJEMNA: dodane dziecko ROSNIE przycisk (pomiar czuly)', grew > 8, `+${grew}px`);

  const bl = await styleOf(page, 'bLoad', ['webkitTextFillColor', 'color', 'position', 'pointerEvents']);
  check('etykieta niewidoczna przez text-fill', /rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(bl.webkitTextFillColor), bl.webkitTextFillColor);
  check('ale color ZOSTAJE realny (spinner ma czym swiecic)', !/rgba\(0,\s*0,\s*0,\s*0\)/.test(bl.color), bl.color);
  eq('przycisk dostaje kontekst pozycjonowania', bl.position, 'relative');
  eq('mysz zablokowana', bl.pointerEvents, 'none');

  const blAfter = await styleOf(page, 'bLoad', ['content', 'backgroundImage', 'position'], '::after');
  check('::after istnieje', blAfter.content === '""' || blAfter.content === 'normal', blAfter.content);
  check('::after ma pierscien w kolorze przycisku', /conic-gradient/.test(blAfter.backgroundImage), blAfter.backgroundImage.slice(0, 50));
  eq('spinner przycisku ma dzialajaca animacje', (await animOf(page, 'bLoad', '::after')).join(','), 'btnLoadingSpin');

  const idleAfter = await styleOf(page, 'bIdle', ['content'], '::after');
  check('KONTROLA UJEMNA: przycisk bez stanu nie ma ::after', idleAfter.content === 'none', idleAfter.content);

  /* the .btn implication: a colour class alone must be covered */
  eq('aria-busy dziala tak samo jak .is-loading', (await animOf(page, 'bBusy', '::after')).join(','), 'btnLoadingSpin');
  eq('.btn-sm .btn-success tez objety', (await animOf(page, 'bSm', '::after')).join(','), 'btnLoadingSpin');
  const notBtnAfter = await styleOf(page, 'notBtn', ['content'], '::after');
  check('KONTROLA UJEMNA: .is-loading na nie-przycisku nic nie robi', notBtnAfter.content === 'none', notBtnAfter.content);

  const svgOp = (await styleOf(page, 'bIconSvg', ['opacity'])).opacity;
  eq('ikona w przycisku jest ukryta (nie stoi obok spinnera)', svgOp, '0');

  /* ================= 3. OVERLAY ================= */
  eq('nakladka widoczna, gdy aria-busy=true', (await styleOf(page, 'ovBusy', ['display'])).display, 'grid');
  eq('KONTROLA UJEMNA: aria-busy=false chowa nakladke', (await styleOf(page, 'ovIdle', ['display'])).display, 'none');
  eq('kontener z nakladka dostaje position: relative', (await styleOf(page, 'cardBusy', ['position'])).position, 'relative');
  eq('KONTROLA UJEMNA: zajety kontener BEZ nakladki zostaje static', (await styleOf(page, 'cardNoOverlay', ['position'])).position, 'static');
  eq('KONTROLA UJEMNA: niezajety kontener z nakladka tez static', (await styleOf(page, 'cardIdle', ['position'])).position, 'static');

  /* Against the card's PADDING box, not its bounding rect. `inset: 0` resolves
     against the padding box, so .card's 1px border stays visible around the
     overlay - measured, and it is the better behaviour: the card keeps its own
     frame instead of the overlay painting over it. Comparing bounding rects
     reported a 2px gap and sent me looking for a bug that was not there. */
  const cover = await page.evaluate(() => {
    const c = document.getElementById('cardBusy');
    const o = document.getElementById('ovBusy').getBoundingClientRect();
    return {
      dw: Math.abs(c.clientWidth - o.width),
      dh: Math.abs(c.clientHeight - o.height),
      inner: c.clientWidth,
      overlay: Math.round(o.width),
    };
  });
  check(
    'nakladka przykrywa cale wnetrze kontenera',
    cover.dw < 1.5 && cover.dh < 1.5,
    `wnetrze ${cover.inner} nakladka ${cover.overlay} (dw ${cover.dw.toFixed(2)} dh ${cover.dh.toFixed(2)})`
  );
  check('nakladka jest nad trescia', Number((await styleOf(page, 'ovBusy', ['zIndex'])).zIndex) >= 1, 'z-index');

  /* z-index alone proves nothing about what the user can actually reach.
     Hit-testing a point over the card's own text must return the overlay,
     not the paragraph underneath - otherwise the panel looks covered and
     is still clickable. */
  const hit = await page.evaluate(() => {
    const p = document.querySelector('#cardBusy .card-body p');
    const r = p.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + 10, r.y + r.height / 2);
    const ov = document.getElementById('ovBusy');
    return { onTop: !!(el && (el === ov || ov.contains(el))), got: el ? el.className || el.tagName : null };
  });
  check('nakladka faktycznie przykrywa tresc (hit-test)', hit.onTop, String(hit.got));

  /* ================= 4. COMMAND PALETTE (dead hook closed) ================= */
  const cpAfter = await styleOf(page, 'cpHead', ['content'], '::after');
  check('paleta: .is-loading rysuje spinner', cpAfter.content === '""', cpAfter.content);
  eq('paleta: animacja dziala', (await animOf(page, 'cpHead', '::after')).join(','), 'commandPaletteSpin');
  const cpIdleAfter = await styleOf(page, 'cpIdleHead', ['content'], '::after');
  check('KONTROLA UJEMNA: paleta bez .is-loading bez spinnera', cpIdleAfter.content === 'none', cpIdleAfter.content);

  if (SHOTS) {
    await page.screenshot({ path: path.join(SHOTS, 'spinner-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 1500 });
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(SHOTS, 'spinner-390.png'), fullPage: true });
  }
  await page.close();
}

/* ================= 5. REDUCED MOTION ================= */
{
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, reducedMotion: 'reduce' });
  await serve(page);
  await page.goto('https://cc.local/');
  await page.waitForTimeout(120);

  eq('reduced motion: spinner oddycha, nie wiruje', (await animOf(page, 's1')).join(','), 'spinnerBreathe');
  eq('reduced motion: przycisk tez', (await animOf(page, 'bLoad', '::after')).join(','), 'btnLoadingBreathe');
  eq('reduced motion: paleta tez', (await animOf(page, 'cpHead', '::after')).join(','), 'commandPaletteBreathe');

  /* The tail must go, or a non-rotating ring reads as a half-drawn circle. */
  const bg = (await styleOf(page, 's1', ['backgroundImage'])).backgroundImage;
  check('reduced motion: ogon zniknal (pelny pierscien)', !/conic-gradient/.test(bg), bg.slice(0, 50));

  /* and it still animates SOMETHING - stopping dead would look broken */
  const breathes = await page.evaluate(async () => {
    const el = document.getElementById('s1');
    const a = document.getAnimations().find((x) => x.effect && x.effect.target === el);
    if (!a) return 'brak animacji';
    const t0 = a.currentTime;
    await new Promise((r) => setTimeout(r, 160));
    return Number(a.currentTime) > Number(t0);
  });
  check('reduced motion: nadal daje znak zycia', breathes === true, String(breathes));

  const kf = await page.evaluate(() => {
    const el = document.getElementById('s1');
    const a = document.getAnimations().find((x) => x.effect && x.effect.target === el);
    const props = new Set();
    for (const f of a.effect.getKeyframes()) for (const k of Object.keys(f)) props.add(k);
    for (const m of ['offset', 'computedOffset', 'easing', 'composite']) props.delete(m);
    return [...props].sort();
  });
  eq('reduced motion: animuje WYLACZNIE opacity', kf.join(','), 'opacity');

  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'spinner-reduced.png'), fullPage: true });
  await page.close();
}

console.log(failed ? `\n${failed} nie przeszlo` : '\nspinner: wszystko przeszlo');
const r = await Promise.race([browser.close().then(() => 'c'), new Promise((x) => setTimeout(() => x('t'), 3000))]);
if (r === 't') console.log('(close zawisl)');
process.exit(failed ? 1 : 0);
