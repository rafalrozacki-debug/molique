/**
 * molique - keyboard and ARIA of .select-search and .custom-select, in a browser.
 *
 * The markup is the documented one: .select-search-option is a <div>, which a
 * keyboard cannot reach by itself. Everything goes through the autoloader, the way
 * a real page gets these modules.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:combobox
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

const option = (value, label) => `<div class="select-search-option" data-value="${value}">${label}</div>`;
const box = (id, label) =>
  `<label class="custom-select-option"><div class="flex-1">${label}</div><input id="${id}" type="checkbox" class="form-check-input"></label>`;

const PAGE = `<!doctype html><html lang="pl"><head><link rel="stylesheet" href="/css/molique-style.css"></head><body>
<form id="form" onsubmit="window.submits = (window.submits || 0) + 1; return false">
  <div class="select-search" id="s">
    <button type="button" id="trigger" class="input select-search-trigger" popovertarget="menu"><span>Wybierz</span></button>
    <div class="select-search-menu" popover id="menu">
      <input type="text" class="input select-search-input" id="field" placeholder="Szukaj">
      <div class="select-search-list" id="options">${option(1, 'Łódź')}${option(2, 'Kraków')}${option(3, 'Gdańsk')}${option(4, 'Poznań')}</div>
    </div>
    <input type="hidden" class="select-search-hidden" id="value">
  </div>

  <div class="select-search" id="plain">
    <button type="button" id="plain-trigger" class="input select-search-trigger" popovertarget="plain-menu"><span>Wybierz</span></button>
    <div class="select-search-menu" popover id="plain-menu">
      <div class="select-search-list">${option('a', 'Alfa')}${option('b', 'Beta')}</div>
    </div>
    <input type="hidden" class="select-search-hidden" id="plain-value">
  </div>

  <div class="custom-select" id="c">
    <button type="button" id="c-trigger" class="custom-select-trigger" popovertarget="c-menu">Wybierz</button>
    <div class="custom-select-dropdown" popover id="c-menu">
      <div class="custom-select-search"><input type="text" class="input" id="c-field" placeholder="Szukaj"></div>
      <div class="custom-select-list">
        <div class="custom-select-category" id="cat-back">Backend</div>
        ${box('php', 'PHP')}${box('go', 'Go')}
        <div class="custom-select-category" id="cat-front">Frontend</div>
        ${box('css', 'CSS')}${box('js', 'Zażółć')}
      </div>
    </div>
  </div>

  <div class="custom-select" id="c2">
    <button type="button" id="c2-trigger" class="custom-select-trigger" popovertarget="c2-menu">Wybierz</button>
    <div class="custom-select-dropdown" popover id="c2-menu">
      <div class="custom-select-list">${box('one', 'Jeden')}${box('two', 'Dwa')}</div>
    </div>
  </div>
  <input id="after">
  <button type="submit" id="send">Zapisz</button>
</form>
<script src="/js/molique-script.js"></script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: PAGE });
  if (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/')) {
    const file = path.join(ROOT, url.pathname);
    if (fs.existsSync(file)) {
      return route.fulfill({ contentType: `${url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript'}; charset=utf-8`, body: fs.readFileSync(file, 'utf8') });
    }
  }
  return route.fulfill({ status: 404, body: '' });
});

const press = async (key) => {
  await page.keyboard.press(key);
  await page.waitForTimeout(40);
};
const focused = () => page.evaluate(() => document.activeElement.id);
const isOpen = (id) => page.evaluate((i) => document.getElementById(i).matches(':popover-open'), id);
const highlighted = (root) =>
  page.evaluate((r) => {
    const el = document.querySelector(`${r} .select-search-option.is-active`);
    return el ? el.textContent : '';
  }, root);
const attr = (sel, name) => page.evaluate(([s, n]) => document.querySelector(s).getAttribute(n), [sel, name]);
const visibleOptions = () =>
  page.evaluate(() => [...document.querySelectorAll('#options .select-search-option')].filter((o) => o.offsetParent !== null).map((o) => o.textContent));

try {
  await page.goto('http://combobox.test/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.MoliqueCombobox && window.MoliqueSelectSearch, null, { timeout: 3000 });

  /* ---------- .select-search with a field ---------- */
  await page.focus('#trigger');
  await press('Enter');
  check('Enter on the trigger opens the menu and moves focus to the field', (await isOpen('menu')) && (await focused()) === 'field');
  check('the field is a combobox', (await attr('#field', 'role')) === 'combobox' && (await attr('#field', 'aria-expanded')) === 'true');
  check('the field points at the list', (await attr('#field', 'aria-controls')) === (await attr('#options', 'id')) && (await attr('#options', 'role')) === 'listbox');
  check('options have the option role', (await attr('#options .select-search-option', 'role')) === 'option');
  check('the first option starts highlighted', (await highlighted('#s')) === 'Łódź');
  check('the highlight is announced', (await attr('#field', 'aria-activedescendant')) === (await attr('#options .select-search-option.is-active', 'id')));

  await press('ArrowDown');
  check('Down moves the highlight', (await highlighted('#s')) === 'Kraków');
  check('focus stays in the field, so typing still works', (await focused()) === 'field');
  await press('ArrowUp');
  await press('ArrowUp');
  check('Up wraps from the first to the last', (await highlighted('#s')) === 'Poznań');
  await press('ArrowDown');
  check('Down wraps from the last to the first', (await highlighted('#s')) === 'Łódź');
  await press('End');
  check('End jumps to the last while the field is empty', (await highlighted('#s')) === 'Poznań');
  await press('Home');
  check('Home jumps to the first', (await highlighted('#s')) === 'Łódź');

  await page.keyboard.type('a');
  await page.waitForTimeout(40);
  await press('ArrowDown');
  const before = await highlighted('#s');
  await press('End');
  check('with text in the field End belongs to the caret', (await highlighted('#s')) === before);
  await page.fill('#field', '');
  await page.waitForTimeout(40);
  await page.keyboard.type('an');
  await page.waitForTimeout(40);
  check('the arrow keys skip filtered options', (await visibleOptions()).join() === 'Gdańsk,Poznań' && (await highlighted('#s')) === 'Gdańsk', (await visibleOptions()).join());
  await press('ArrowDown');
  await press('ArrowDown');
  check('... and wrap among the ones left', (await highlighted('#s')) === 'Gdańsk');
  await page.fill('#field', '');
  await page.waitForTimeout(40);
  await press('ArrowDown');
  await press('ArrowDown');
  check('a position is reached with the arrows', (await highlighted('#s')) === 'Gdańsk');
  await page.keyboard.type('a');
  await page.waitForTimeout(40);
  check('a new query goes back to the top of the list', (await highlighted('#s')) === 'Kraków');
  await page.fill('#field', '');
  await page.waitForTimeout(40);
  await page.keyboard.type('a b');
  await page.waitForTimeout(40);
  check('Space in the field is a space, not a choice', (await page.inputValue('#field')) === 'a b' && (await isOpen('menu')));
  await page.fill('#field', '');
  await page.waitForTimeout(40);

  await page.keyboard.type('lodz');
  await page.waitForTimeout(40);
  check('filtering ignores diacritics', (await visibleOptions()).join() === 'Łódź', (await visibleOptions()).join());
  check('the highlight follows the filter', (await highlighted('#s')) === 'Łódź');
  await press('Enter');
  check('Enter picks the option', (await page.inputValue('#value')) === '1');
  check('... closes the menu and hands focus back', !(await isOpen('menu')) && (await focused()) === 'trigger');
  check('... and does not submit the form', (await page.evaluate(() => window.submits || 0)) === 0);

  await press('Enter');
  check('the filter does not survive the closing', (await visibleOptions()).length === 4);
  check('reopening highlights the chosen option', (await highlighted('#s')) === 'Łódź');
  check('the chosen option is marked for a screen reader', (await attr('#options .select-search-option', 'aria-selected')) === 'true');

  await page.keyboard.type('zzz');
  await page.waitForTimeout(40);
  await press('Enter');
  check('Enter with nothing to pick still does not submit the form', (await page.evaluate(() => window.submits || 0)) === 0 && (await isOpen('menu')));
  await page.fill('#field', '');

  await press('Escape');
  check('Esc closes the menu', !(await isOpen('menu')) && (await focused()) === 'trigger');
  await press('ArrowDown');
  check('Down on the closed trigger opens the menu', await isOpen('menu'));
  await press('Tab');
  check('Tab closes it and moves on', !(await isOpen('menu')) && (await focused()) !== 'field', await focused());

  await page.focus('#trigger');
  await press('Enter');
  await page.evaluate(() => document.querySelector('#options').insertAdjacentHTML('beforeend', '<div class="select-search-option" data-value="5">Dosypana</div>'));
  await press('End');
  check('an option added later can be reached', (await highlighted('#s')) === 'Dosypana');
  await page.hover('#options .select-search-option:nth-child(2)');
  await page.waitForTimeout(40);
  check('the pointer moves the highlight too', (await highlighted('#s')) === 'Kraków');
  await press('Escape');

  /* ---------- .select-search without a field ---------- */
  await page.focus('#plain-trigger');
  await press('ArrowDown');
  check('no field: Down opens the menu', await isOpen('plain-menu'));
  check('no field: the trigger is the combobox', (await attr('#plain-trigger', 'role')) === 'combobox' && (await focused()) === 'plain-trigger');
  await press('ArrowDown');
  check('no field: Down moves the highlight', (await highlighted('#plain')) === 'Beta');
  await press('Enter');
  check('no field: Enter picks, and does not just close the menu', (await page.inputValue('#plain-value')) === 'b' && !(await isOpen('plain-menu')));
  await page.focus('#plain-trigger');
  await press('ArrowDown');
  await press('ArrowUp');
  await press(' ');
  check('no field: Space picks too', (await page.inputValue('#plain-value')) === 'a');

  /* ---------- .custom-select ---------- */
  const checked = (id) => page.evaluate((i) => document.getElementById(i).checked, id);
  const shown = (id) => page.evaluate((i) => !document.getElementById(i).hidden, id);

  await page.focus('#c-trigger');
  await press('Enter');
  check('custom: opening moves focus to the field', (await focused()) === 'c-field');
  await page.keyboard.type('zazolc');
  await page.waitForTimeout(40);
  check('custom: the search field filters', !(await page.isVisible('label:has(#php)')) && (await page.isVisible('label:has(#js)')));
  check('custom: a heading with nothing below it goes', !(await shown('cat-back')) && (await shown('cat-front')));
  await press('Enter');
  check('custom: Enter in the field toggles the first match', await checked('js'));
  check('custom: ... without submitting or closing', (await page.evaluate(() => window.submits || 0)) === 0 && (await isOpen('c-menu')));
  await page.fill('#c-field', '');
  await page.waitForTimeout(40);
  check('custom: an empty field shows everything again', (await shown('cat-back')) && (await page.isVisible('label:has(#php)')));

  await press('ArrowDown');
  check('custom: Down goes to the first checkbox', (await focused()) === 'php');
  await press('ArrowDown');
  check('custom: Down goes on', (await focused()) === 'go');
  await press('End');
  check('custom: End jumps to the last', (await focused()) === 'js');
  await press('Home');
  check('custom: Home jumps to the first', (await focused()) === 'php');
  await press('ArrowUp');
  check('custom: Up from the first returns to the field', (await focused()) === 'c-field');
  await press('ArrowUp');
  check('custom: Up from the field goes to the last', (await focused()) === 'js');
  await press('ArrowUp');
  await press('Enter');
  check('custom: Enter toggles the checkbox', await checked('css'));
  await press(' ');
  check('custom: so does Space, natively', !(await checked('css')));
  check('custom: the menu stays open for the next choice', await isOpen('c-menu'));
  check('custom: checkboxes keep their own role', (await attr('#php', 'role')) === null);

  await page.fill('#c-field', 'php');
  await press('Escape');
  await page.focus('#c-trigger');
  await press('Enter');
  check('custom: the filter does not survive the closing', (await page.inputValue('#c-field')) === '' && (await page.isVisible('label:has(#css)')));
  await press('Escape');

  await page.focus('#c2-trigger');
  await press('ArrowDown');
  check('custom without a field: focus lands on the first checkbox', (await isOpen('c2-menu')) && (await focused()) === 'one');
  await press('ArrowDown');
  check('custom without a field: arrows move between checkboxes', (await focused()) === 'two');
  await press('ArrowDown');
  check('custom without a field: they wrap', (await focused()) === 'one');
  await press('Escape');

  check('no page errors', errors.length === 0, errors.join(' | '));
} catch (err) {
  check('the run reached the end', false, err.message);
} finally {
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
