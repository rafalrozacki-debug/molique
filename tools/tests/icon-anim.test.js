/**
 * molique - tests for the animated Phosphor icons module
 *
 * Run with:  npm run test:icon-anim
 *
 * Unlike the vm-based tests next to it, this one needs a real browser: the
 * module parses SVG with DOMParser, reads CSS animations through
 * getAnimations() and depends on :hover and prefers-reduced-motion. It runs
 * the SHIPPED css/molique-style-icon-anim.css and js/modules/molique-icon-anim.js
 * in headless Chromium through Playwright. Playwright is not a dependency of
 * this repo - without it the test prints SKIP and exits 0 instead of failing.
 *
 * Compile the CSS first (see CLAUDE.md - npm run build does not do it).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'molique-style-icon-anim.css'), 'utf8');
const JS = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'molique-icon-anim.js'), 'utf8');

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.log('SKIP  playwright is not installed - npm i -D playwright to run this test');
  process.exit(0);
}

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

const STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"';
// Shapes copied from Phosphor's raw/light set (bell, trash, check), plus a
// duotone bell and a fill bell. The "evil" symbol must lose everything that
// is not a basic shape or a geometry/paint attribute.
const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="ph-bell" viewBox="0 0 256 256"><path d="M96,192a32,32,0,0,0,64,0" ${STROKE}/><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" ${STROKE}/></symbol>
<symbol id="ph-trash" viewBox="0 0 256 256"><line x1="216" y1="56" x2="40" y2="56" ${STROKE}/><line x1="104" y1="104" x2="104" y2="168" ${STROKE}/><line x1="152" y1="104" x2="152" y2="168" ${STROKE}/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" ${STROKE}/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" ${STROKE}/></symbol>
<symbol id="ph-check" viewBox="0 0 256 256"><polyline points="40 144 96 200 224 72" ${STROKE}/></symbol>
<symbol id="ph-bell--duotone" viewBox="0 0 256 256"><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" opacity="0.2"/><path d="M96,192a32,32,0,0,0,64,0" ${STROKE}/><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" ${STROKE}/></symbol>
<symbol id="ph-bell--fill" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06Z"/></symbol>
<symbol id="ph-evil" viewBox="0 0 256 256"><script>window.__pwned = 1</script><path d="M0,0H10" ${STROKE} onmouseover="window.__pwned = 2" style="display:none"/><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject><image href="x" onerror="window.__pwned = 3"/></symbol>
</svg>`;

const icon = (id, extra = '', attrs = '') =>
  `<svg class="icon icon-anim ${extra}" ${attrs} aria-hidden="true"><use href="sprite.svg#${id}"></use></svg>`;

const PAGE = `<!doctype html><html><head><style>${CSS}</style>
<style>svg{width:48px;height:48px;fill:currentColor} body{margin:0}</style></head><body>
<button id="hover-parent" class="icon-anim-hover">${icon('ph-bell', '', 'id="bell"')} Bell</button>
<button id="tap" class="icon-anim-tap">${icon('ph-trash', '', 'id="trash"')}</button>
<span id="loop" class="icon-anim-play icon-anim-loop" data-icon-anim-loop-delay="400">${icon('ph-check', '', 'id="check"')}</span>
${icon('ph-bell--duotone', 'icon-anim-play', 'id="duo" data-icon-anim="draw"')}
${icon('ph-bell--fill', 'icon-anim-play', 'id="fill"')}
${icon('ph-missing', 'icon-anim-play', 'id="missing"')}
${icon('ph-evil', '', 'id="evil"')}
<i id="font" class="ph-bold ph-bell icon-anim icon-anim-play"></i>
<svg id="pasted" class="icon icon-anim icon-anim-play" data-icon="check" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="40 144 96 200 224 72" ${STROKE}/></svg>
<div style="height:3000px"></div>
<div id="view" class="icon-anim-view">${icon('ph-bell')}</div>
<script>${JS}</script><script>initIconAnim()</script></body></html>`;

const names = (page, sel) =>
  page.evaluate(
    (s) =>
      document
        .querySelector(s)
        .getAnimations({ subtree: true })
        .map((a) => `${a.animationName}@${a.effect.target.dataset.part || a.effect.target.localName}:${a.playState}`)
        .sort(),
    sel
  );

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('http://icons.test/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('/sprite.svg')) return route.fulfill({ contentType: 'image/svg+xml', body: SPRITE });
    if (url.endsWith('/')) return route.fulfill({ contentType: 'text/html', body: PAGE });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto('http://icons.test/');
  await page.mouse.move(600, 600); // the pointer starts at 0,0 - right over the first button
  await page.waitForTimeout(300);

  /* ---------- inlining and numbering ---------- */
  const bell = await page.evaluate(() => {
    const s = document.querySelector('#bell');
    return {
      use: !!s.querySelector('use'),
      icon: s.dataset.icon,
      parts: s.dataset.iconParts,
      kids: [...s.children].map((c) => `${c.localName}#${c.dataset.part}:${c.getAttribute('pathLength')}:${c.style.getPropertyValue('--icon-part')}`),
      viewBox: s.getAttribute('viewBox'),
    };
  });
  check('<use> is replaced by the symbol shapes', !bell.use && bell.kids.length === 2, JSON.stringify(bell.kids));
  check('data-icon comes from the symbol id', bell.icon === 'bell');
  check('parts numbered 1..n, pathLength=1, --icon-part 0-based', bell.kids.join() === 'path#1:1:0,path#2:1:1');
  check('viewBox copied from the symbol', bell.viewBox === '0 0 256 256');
  check('stroke icon is marked data-icon-parts="stroke"', bell.parts === 'stroke');

  const duo = await page.evaluate(() => [...document.querySelector('#duo').children].map((c) => (c.hasAttribute('data-layer') ? 'layer' : c.dataset.part)).join());
  check('duotone background is data-layer, outside the numbering', duo === 'layer,1,2', duo);

  const fill = await page.evaluate(() => document.querySelector('#fill').dataset.iconParts);
  check('fill weight is marked "solid"', fill === 'solid');

  const pasted = await page.evaluate(() => {
    const s = document.querySelector('#pasted');
    return [...s.children].map((c) => c.localName + '#' + c.dataset.part).join();
  });
  check('pasted SVG: bounding <rect fill="none"> removed, parts numbered', pasted === 'polyline#1', pasted);

  const font = await page.evaluate(() => document.querySelector('#font').dataset.icon);
  check('web font: name read from ph-bell, weight class ignored', font === 'bell', font);

  /* ---------- sanitising ---------- */
  const evil = await page.evaluate(() => ({
    pwned: window.__pwned || 0,
    html: document.querySelector('#evil').innerHTML,
  }));
  check('sprite cannot inject <script>, event attributes, <foreignObject>, <image>', evil.pwned === 0 && !/script|onmouseover|foreignObject|<image|display:\s*none/i.test(evil.html), evil.html);

  /* ---------- fallbacks ---------- */
  const missing = await page.evaluate(() => ({ use: !!document.querySelector('#missing use'), icon: document.querySelector('#missing').dataset.icon }));
  const missingAnims = await names(page, '#missing');
  check('missing symbol keeps <use> and still animates as a whole', missing.use && missing.icon === 'missing' && missingAnims.join() === 'iconAnimPop@svg:running', missingAnims.join());

  const fillAnims = await names(page, '#fill');
  check('fill weight: bell preset moves the whole icon, no parts', fillAnims.join() === 'iconAnimRing@svg:running', fillAnims.join());

  /* ---------- triggers ---------- */
  check('no trigger, no animation', (await names(page, '#bell')).length === 0);
  await page.hover('#hover-parent');
  await page.waitForTimeout(50);
  const hovered = await names(page, '#bell');
  check('hover on an ancestor runs the preset on the root and the clapper', hovered.join() === 'iconAnimPartSway@1:running,iconAnimRing@svg:running', hovered.join());
  await page.mouse.move(600, 600);
  await page.waitForTimeout(50);
  check('leaving cancels it', (await names(page, '#bell')).length === 0);

  const draw = await names(page, '#duo');
  check('draw: strokes draw, duotone layer fades, root stays', draw.join() === 'iconAnimLayerFade@path:running,iconAnimPartDraw@1:running,iconAnimPartDraw@2:running', draw.join());

  await page.click('#tap');
  await page.waitForTimeout(50);
  const tapped = await page.evaluate(() => document.querySelector('#tap').classList.contains('is-tapped'));
  const tapAnims = await names(page, '#trash');
  check('tap adds .is-tapped and lifts the lid (parts 1 and 5)', tapped && tapAnims.join() === 'iconAnimPartLift@1:running,iconAnimPartLift@5:running', tapAnims.join());
  await page.waitForTimeout(1000);
  check('tap: .is-tapped removed once the animation has finished', !(await page.evaluate(() => document.querySelector('#tap').classList.contains('is-tapped'))));

  await page.waitForTimeout(250); // check-draw lap is 0.55s, delay 400ms
  const looping = await names(page, '#check');
  check('loop delay pauses between laps', looping.join() === 'iconAnimPartDraw@1:paused', looping.join());

  check('icon-anim-view waits until scrolled in', (await names(page, '#view')).length === 0);
  await page.evaluate(() => document.querySelector('#view').scrollIntoView());
  await page.waitForTimeout(150);
  check('icon-anim-view plays when scrolled in', await page.evaluate(() => document.querySelector('#view').classList.contains('is-in-view')));

  /* ---------- dynamic content and API ---------- */
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.innerHTML = '<svg id="late" class="icon icon-anim"><use href="sprite.svg#ph-check"></use></svg>';
    document.body.prepend(d);
  });
  await page.waitForTimeout(150);
  check('icons added later are picked up', await page.evaluate(() => !document.querySelector('#late use') && document.querySelector('#late').dataset.iconParts === 'stroke'));
  await page.evaluate(() => window.moliqueIconAnim.play(document.querySelector('#late')));
  const played = await names(page, '#late');
  check('moliqueIconAnim.play() runs one lap', played.join() === 'iconAnimPartDraw@1:running', played.join());
  await page.waitForTimeout(800);
  check('... and removes .icon-anim-play afterwards', !(await page.evaluate(() => document.querySelector('#late').classList.contains('icon-anim-play'))));

  /* ---------- reduced motion ---------- */
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(50);
  const still = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName && a.animationName.startsWith('iconAnim')).length);
  check('prefers-reduced-motion: reduce stops every icon animation', still === 0, String(still));

  check('no page errors', errors.length === 0, errors.join(' | '));
} finally {
  await browser.close();
}

if (failed) {
  console.log(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nall checks passed');
