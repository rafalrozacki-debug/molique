/**
 * molique - component behaviour that only a real layout engine can show.
 *
 * Each check reproduces a symptom reported from production: a divider after the
 * last visible button, a menu taller than the screen, a pill claiming the width
 * of the row, a badge with no background. Sass compiles all of these without a
 * word and the console stays clean, so they are measured, not read from the CSS.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:components
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);

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

const CSS = ['molique-style.css', 'molique-style-admin.css', 'molique-style-shop.css']
  .map((file) => fs.readFileSync(path.join(process.env.MOLIQUE_TEST_CSS_DIR || path.join(ROOT, 'css'), file), 'utf8'))
  .join('\n');

const items = (n) => '<a class="dropdown-item" href="#">Item</a>'.repeat(n);
const tile = (attrs, content = 'Tile') =>
  `<label class="selection-tile"><input type="radio" name="t" ${attrs}><div class="tile-content p-3">${content}</div></label>`;

const PAGE = `<!doctype html><html lang="en"><head><style>${CSS}</style></head><body style="margin:0;padding:0 200px">
<div id="row" class="d-flex gap-3" style="width:700px">
  <div id="switcher" class="tabs tabs-pill" style="--tab-count:2">
    <input class="tab-input" type="radio" name="a" id="a1" checked><input class="tab-input" type="radio" name="a" id="a2">
    <div class="tabs-header"><span class="tabs-pill-indicator"></span><label class="tab-label" for="a1">List</label><label class="tab-label" for="a2">Calendar</label></div>
  </div>
  <button class="btn-primary">Add</button>
</div>
<div id="with-panels" class="tabs tabs-pill" style="--tab-count:2;width:700px">
  <input class="tab-input" type="radio" name="b" id="b1" checked><input class="tab-input" type="radio" name="b" id="b2">
  <div class="tabs-header"><span class="tabs-pill-indicator"></span><label class="tab-label" for="b1">One</label><label class="tab-label" for="b2">Two</label></div>
  <div class="tabs-content"><div class="tab-pane">Panel</div><div class="tab-pane">Panel</div></div>
</div>

<div class="btn-action-group with-dividers">
  <button id="first" class="btn-action">A</button>
  <button id="last-visible" class="btn-action" popovertarget="group-menu">B</button>
  <div id="group-menu" class="dropdown-menu" popover>${items(2)}</div>
</div>
<div class="btn-action-group with-dividers">
  <button id="plain-first" class="btn-action">A</button>
  <button id="plain-last" class="btn-action">B</button>
</div>
<div class="btn-action-group with-dividers">
  <button id="two-menus" class="btn-action" popovertarget="m1">A</button>
  <div id="m1" class="dropdown-menu" popover>${items(1)}</div>
  <button id="two-menus-last" class="btn-action" popovertarget="m2">B</button>
  <div id="m2" class="dropdown-menu" popover>${items(1)}</div>
</div>

<span id="bare" class="badge">3</span>
<span id="on-utility" class="badge bg-success">3</span>
<span id="light" class="badge badge-light">3</span>
<span id="variant" class="badge badge-danger">3</span>

<button id="long-trigger" popovertarget="long-menu">Open</button>
<div id="long-menu" class="dropdown-menu" popover>${items(60)}</div>
<button id="short-trigger" popovertarget="short-menu">Open</button>
<div id="short-menu" class="dropdown-menu" popover><div id="menu-header" class="dropdown-header">Move to</div><a id="menu-item" class="dropdown-item" href="#">Item</a></div>

<span id="tip" class="tooltip-element tooltip-element-start" data-tooltip="A long sentence explaining why this field is locked">?</span>
<span id="tip-center" class="tooltip-element" data-tooltip="Centred">?</span>

<div id="tiles" style="width:300px">
  ${tile('id="tile-plain"')}
  ${tile('id="tile-disabled" disabled')}
  ${tile('id="tile-disabled-checked" disabled checked')}
  <fieldset disabled style="border:0;padding:0;margin:0">${tile('id="tile-in-fieldset"')}</fieldset>
</div>

<div id="nowrap" class="text-nowrap" style="width:30px">one two three</div>
<div class="card" style="width:400px"><div id="card-row" class="card-body flex-row"><span>a</span><span>b</span></div></div>
<div id="card-md-row" class="card flex-column flex-md-row" style="width:400px"><span>a</span><span>b</span></div>
<div id="row-then-column" class="d-flex flex-row flex-md-column"><span>a</span><span>b</span></div>
<div class="d-flex" style="width:100px"><span id="no-shrink" class="flex-shrink-0" style="width:150px">a</span><span>some text that needs the room</span></div>

<label class="form-switch"><input id="sw" type="checkbox" class="form-switch-input"><span class="form-switch-label">Timed</span></label>
<div id="opens" class="grid-expand"><div class="grid-expand-inner"><p>Hours</p></div></div>
<div id="closes" class="grid-expand grid-expand-unchecked"><div class="grid-expand-inner"><p>All day</p></div></div>
<section><div id="no-switch" class="grid-expand grid-expand-unchecked"><div class="grid-expand-inner"><p>Open</p></div></div></section>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const style = (sel, prop, pseudo) =>
  page.evaluate(([s, p, ps]) => getComputedStyle(document.querySelector(s), ps || null)[p], [sel, prop, pseudo]);
const rect = (sel) =>
  page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
  }, sel);
// A pseudo-element with no content reports a display of its own, so both count.
const dividerShown = async (sel) =>
  (await style(sel, 'display', '::after')) !== 'none' && !['none', 'normal'].includes(await style(sel, 'content', '::after'));

try {
  await page.setContent(PAGE);

  /* ---------- tabs ---------- */
  const row = await rect('#switcher');
  const pill = await rect('#switcher .tabs-header');
  check('a pill with no panels is as wide as the pill it draws', Math.abs(row.width - pill.width) < 2, `${Math.round(row.width)} vs ${Math.round(pill.width)}`);
  check('a pill with panels keeps the full width for them', (await rect('#with-panels')).width === 700, String((await rect('#with-panels')).width));

  /* ---------- dividers ---------- */
  check('dividers: the button before a menu shows none', !(await dividerShown('#last-visible')));
  check('dividers: the button after it keeps its own', await dividerShown('#first'));
  check('dividers: a plain group still drops only the last one', (await dividerShown('#plain-first')) && !(await dividerShown('#plain-last')));
  check('dividers: a menu between two buttons does not remove the divider', await dividerShown('#two-menus'));
  check('dividers: nor does a menu at the end leave one', !(await dividerShown('#two-menus-last')));
  check('dividers: the menu itself takes no divider', !(await dividerShown('#group-menu')));

  /* ---------- badge ---------- */
  const noColour = 'rgba(0, 0, 0, 0)';
  const secondary = await page.evaluate(() => {
    const el = document.createElement('span');
    el.className = 'badge badge-secondary';
    document.body.appendChild(el);
    const bg = getComputedStyle(el).backgroundColor;
    el.remove();
    return bg;
  });
  check('a badge with no variant has a background', (await style('#bare', 'backgroundColor')) === secondary, await style('#bare', 'backgroundColor'));
  check('a background utility still beats it', ![noColour, secondary].includes(await style('#on-utility', 'backgroundColor')));
  check('a variant still beats it', (await style('#variant', 'backgroundColor')) !== secondary);
  const lightBadge = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('#light'));
    return { bg: cs.backgroundColor, fg: cs.color };
  });
  check('.badge-light is dark text on a light background', lightBadge.bg !== noColour && lightBadge.bg !== lightBadge.fg, JSON.stringify(lightBadge));

  /* ---------- dropdown ---------- */
  await page.click('#long-trigger');
  const menu = await rect('#long-menu');
  check('a long menu stays inside the screen', menu.top >= 0 && menu.bottom <= 800 && menu.height > 100, `${Math.round(menu.top)}-${Math.round(menu.bottom)}`);
  const lastItem = await page.evaluate(() => {
    const m = document.querySelector('#long-menu');
    m.scrollTop = m.scrollHeight;
    const r = m.lastElementChild.getBoundingClientRect();
    return document.elementFromPoint(r.left + 4, r.top + 4) === m.lastElementChild;
  });
  check('its last item can be reached and clicked', lastItem);
  await page.keyboard.press('Escape');

  await page.click('#short-trigger');
  const headerText = await page.evaluate(() => {
    const padding = (s) => parseFloat(getComputedStyle(document.querySelector(s)).paddingLeft);
    return [padding('#menu-header'), padding('#menu-item')];
  });
  check('.dropdown-header lines up with the items', headerText[0] === headerText[1], headerText.join(' / '));
  check('a short menu is not stretched', (await rect('#short-menu')).height < 120, String((await rect('#short-menu')).height));
  await page.keyboard.press('Escape');

  /* ---------- tooltip ---------- */
  await page.hover('#tip');
  await page.waitForTimeout(350);
  const tipLeft = await page.evaluate(() => {
    const trigger = document.querySelector('#tip');
    const cs = getComputedStyle(trigger, '::after');
    const box = new DOMMatrix(cs.transform);
    return trigger.getBoundingClientRect().left + parseFloat(cs.left) + box.m41 - trigger.getBoundingClientRect().left;
  });
  check('.tooltip-element-start opens from the left edge of its trigger', Math.abs(tipLeft) < 1, String(tipLeft));
  await page.mouse.move(0, 0);

  /* ---------- selection tile ---------- */
  const opacity = (id) => page.evaluate((i) => getComputedStyle(document.getElementById(i).nextElementSibling).opacity, id);
  const cursor = (id) => page.evaluate((i) => getComputedStyle(document.getElementById(i).closest('.selection-tile')).cursor, id);
  check('a tile has a border without the .border class', (await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('tile-plain').nextElementSibling).borderTopWidth))) === 1);
  check('an enabled tile is not dimmed', (await opacity('tile-plain')) === '1' && (await cursor('tile-plain')) === 'pointer');
  check('a disabled tile is dimmed', (await opacity('tile-disabled')) === '0.5' && (await cursor('tile-disabled')) === 'not-allowed');
  check('a tile in <fieldset disabled> is dimmed too', (await opacity('tile-in-fieldset')) === '0.5');
  check('a disabled but chosen tile stays readable as chosen', (await opacity('tile-disabled-checked')) === '1');

  /* ---------- utilities ---------- */
  check('.text-nowrap keeps text on one line', (await rect('#nowrap')).height < 30, String((await rect('#nowrap')).height));
  check('.flex-row beats .card-body', (await style('#card-row', 'flexDirection')) === 'row');
  check('.flex-md-row beats .card from md up', (await style('#card-md-row', 'flexDirection')) === 'row');
  check('.flex-md-column beats .flex-row from md up', (await style('#row-then-column', 'flexDirection')) === 'column');
  check('.flex-shrink-0 keeps its width', (await rect('#no-shrink')).width === 150, String((await rect('#no-shrink')).width));

  /* ---------- grid-expand ---------- */
  const open = async (sel) => (await rect(sel)).height > 5;
  await page.addStyleTag({ content: '.grid-expand { transition: none !important; }' });
  check('switch off: the unchecked panel is open', (await open('#closes')) && !(await open('#opens')));
  await page.check('#sw', { force: true });
  check('switch on: the panels trade places', !(await open('#closes')) && (await open('#opens')));
  check('with no switch before it the panel stays open', await open('#no-switch'));

  /* ---------- admin ---------- */
  await page.setContent(`<!doctype html><html><head><style>${CSS}</style></head><body><div class="admin-layout"><main id="main" class="admin-main">x</main></div></body></html>`);
  const padding = () => style('#main', 'paddingLeft');
  check('.admin-main keeps 32 px on a desktop', (await padding()) === '32px', await padding());
  await page.setViewportSize({ width: 390, height: 800 });
  check('.admin-main gives the width back on a phone', parseFloat(await padding()) <= 16, await padding());
  check('... and keeps the room above the mobile nav', parseFloat(await style('#main', 'paddingBottom')) >= 80, await style('#main', 'paddingBottom'));
} catch (err) {
  check('the run reached the end', false, err.message);
} finally {
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
