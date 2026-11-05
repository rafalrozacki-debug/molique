/**
 * molique - .command-palette, in a browser, through the autoloader.
 *
 * Server results are the risky part: answers arrive out of order, a query goes
 * stale, and a record's name is not trusted text. So the fake backend here answers
 * when the test says so, and hands back a name that is an attack.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:palette
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

const palette = (id, attrs = '') => `<dialog class="command-palette" id="${id}" ${attrs}>
  <div class="command-palette-header"><input class="command-palette-input" placeholder="Szukaj"></div>
  <div class="command-palette-list">
    <div class="command-palette-group" id="${id}-pages">
      <div class="command-palette-group-label">Strony</div>
      <a class="command-palette-item" id="${id}-clients" href="#klienci" data-tags="kontrahen firm">Klienci</a>
      <a class="command-palette-item" id="${id}-orders" href="#zlecenia">Zlecenia</a>
    </div>
    <div class="command-palette-group" id="${id}-actions">
      <div class="command-palette-group-label">Akcje</div>
      <button class="command-palette-item" id="${id}-new" type="button" data-value="new">Nowe zlecenie</button>
      <button class="command-palette-item" id="${id}-export" type="button" data-value="export">Eksportuj faktury</button>
    </div>
  </div>
</dialog>`;

// The listener goes in before molique-script.js on purpose: an integrator should
// not have to wait for the module.
const PAGE = `<!doctype html><html lang="pl"><head><link rel="stylesheet" href="/css/molique-style.css"></head><body>
<script>
  window.searches = [];
  window.selected = [];
  window.blockNext = false;
  document.addEventListener('command:search', (e) => {
    const call = { query: e.detail.query, signal: e.detail.signal, respond: e.detail.respond };
    window.searches.push(call);
  });
  document.addEventListener('command:select', (e) => {
    window.selected.push({ value: e.detail.value, label: e.detail.label, query: e.detail.query, result: e.detail.result });
    if (window.blockNext) e.preventDefault();
  });
</script>
<button id="opener" data-command-palette-open="#p">Szukaj</button>
${palette('p', 'data-command-palette-hotkey="k" data-command-palette-debounce="30"')}
<dialog id="other"><button id="close-other">x</button></dialog>
<div id="editor" contenteditable="true">tekst</div>
<script src="/js/molique-script.js"></script>
</body></html>`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
const page = await context.newPage();
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
const isOpen = () => page.evaluate(() => document.querySelector('#p').open);
const focused = () => page.evaluate(() => document.activeElement.className || document.activeElement.id);
const visible = () =>
  page.evaluate(() => [...document.querySelectorAll('#p .command-palette-item')].filter((i) => i.offsetParent !== null).map((i) => i.textContent.trim()));
const active = () =>
  page.evaluate(() => {
    const el = document.querySelector('#p .command-palette-item.is-active');
    return el ? el.textContent.trim() : '';
  });
const message = () =>
  page.evaluate(() => {
    const el = document.querySelector('#p .command-palette-empty');
    return el && !el.hidden ? el.textContent : '';
  });
const type = async (text) => {
  await page.fill('#p .command-palette-input', text);
  await page.waitForTimeout(90);
};
const searches = () => page.evaluate(() => window.searches.length);
const answer = (index, list) => page.evaluate(([i, l]) => window.searches[i].respond(l), [index, list]);
const reset = async () => {
  if (await isOpen()) await press('Escape');
  await page.evaluate(() => {
    window.searches.length = 0;
    window.selected.length = 0;
    window.blockNext = false;
    window.location.hash = '';
  });
};

try {
  await page.goto('http://palette.test/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.MoliqueCombobox && window.MoliqueCommandPalette, null, { timeout: 3000 });

  /* ---------- opening and closing ---------- */
  check('a closed palette is not on the page', !(await page.isVisible('#p')));
  await page.click('#opener');
  await page.waitForTimeout(60);
  check('the opener opens it as a modal', await page.evaluate(() => document.querySelector('#p').matches(':modal')));
  check('focus lands in the field', (await focused()) === 'command-palette-input');
  check('the field is a combobox over a listbox', await page.evaluate(() => {
    const input = document.querySelector('#p .command-palette-input');
    const list = document.querySelector('#p .command-palette-list');
    return input.getAttribute('role') === 'combobox' && input.getAttribute('aria-controls') === list.id && list.getAttribute('role') === 'listbox';
  }));
  check('groups are labelled for a screen reader', await page.evaluate(() => {
    const group = document.querySelector('#p-pages');
    return group.getAttribute('role') === 'group' && document.getElementById(group.getAttribute('aria-labelledby')).textContent === 'Strony';
  }));
  check('the first item starts highlighted', (await active()) === 'Klienci');
  check('the highlighted item counts as selected', (await page.getAttribute('#p-clients', 'aria-selected')) === 'true');
  await press('Escape');
  check('Esc closes it', !(await isOpen()));
  check('focus returns to the opener', (await focused()) === 'opener');

  await page.keyboard.press('Control+k');
  await page.waitForTimeout(60);
  check('Ctrl+K opens it', await isOpen());
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(60);
  check('Ctrl+K closes it again', !(await isOpen()));
  await page.keyboard.press('Meta+k');
  await page.waitForTimeout(60);
  check('Cmd+K works too', await isOpen());
  await press('Escape');

  await page.focus('#editor');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(60);
  check('the shortcut leaves a rich text editor alone', !(await isOpen()));

  await page.evaluate(() => document.querySelector('#other').showModal());
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(60);
  check('the shortcut does not stack on another open dialog', !(await isOpen()));
  await page.evaluate(() => document.querySelector('#other').close());

  await page.click('#opener');
  await page.waitForTimeout(40);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(40);
  check('a click on the backdrop closes it', !(await isOpen()));
  await page.click('#opener');
  await page.waitForTimeout(40);
  await page.click('#p .command-palette-header');
  await page.waitForTimeout(40);
  check('a click inside does not', await isOpen());

  /* ---------- filtering ---------- */
  await type('zlec');
  check('typing filters by text', (await visible()).join() === 'Zlecenia,Nowe zlecenie', (await visible()).join());
  await type('kontrahenci');
  check('tags match by stem', (await visible()).join() === 'Klienci', (await visible()).join());
  check('a group with nothing left goes', !(await page.isVisible('#p-actions')) && (await page.isVisible('#p-pages')));
  await type('eksportuj faktury');
  check('every word has to match', (await visible()).join() === 'Eksportuj faktury');
  await type('zlecenia');
  check('the highlight moves to the first hit', (await active()) === 'Zlecenia');
  await type('qqqqq');
  check('nothing found says what was searched for', (await message()) === 'Brak wyników dla "qqqqq"', await message());
  check('the empty list is out of the way', !(await page.isVisible('#p .command-palette-list')));
  await type('');
  check('an empty field brings everything back', (await visible()).length === 4 && (await message()) === '');

  /* ---------- keyboard ---------- */
  await press('ArrowDown');
  check('Down moves the highlight', (await active()) === 'Zlecenia');
  await press('End');
  check('End jumps to the last, across groups', (await active()) === 'Eksportuj faktury');
  await press('ArrowDown');
  check('Down wraps', (await active()) === 'Klienci');
  await press('ArrowUp');
  check('Up wraps', (await active()) === 'Eksportuj faktury');

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await press('ArrowDown');
  await press('Enter');
  check('Enter follows a link', (await page.evaluate(() => window.location.hash)) === '#zlecenia');
  check('... and closes the palette', !(await isOpen()));
  check('... after announcing the choice', await page.evaluate(() => window.selected[0].label === 'Zlecenia'));

  await reset();
  await page.evaluate(() => (window.blockNext = true));
  await page.click('#opener');
  await page.waitForTimeout(40);
  await page.click('#p-clients');
  await page.waitForTimeout(40);
  check('preventDefault() keeps the link from being followed', (await page.evaluate(() => window.location.hash)) === '');
  check('the palette still closes', !(await isOpen()));

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('nowe');
  await press('Enter');
  check('a button item reports its value', await page.evaluate(() => window.selected[0].value === 'new' && window.selected[0].query === 'nowe'));

  /* ---------- server ---------- */
  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('a');
  check('below the minimum length nobody is asked', (await searches()) === 0);
  await page.fill('#p .command-palette-input', 'ab');
  await page.fill('#p .command-palette-input', 'abc');
  await page.waitForTimeout(100);
  check('fast typing asks once, for the last text', (await searches()) === 1 && (await page.evaluate(() => window.searches[0].query)) === 'abc');

  await answer(0, [
    { label: 'Kowalski', href: '#klient-12', meta: 'NIP 123', group: 'Klienci', value: 12 },
    { label: 'Nowak', href: '#klient-13', group: 'Klienci' },
    { label: 'FV 1/2026', href: '#faktura-1', group: 'Faktury' },
  ]);
  await page.waitForTimeout(40);
  check('results arrive in the list', (await visible()).join('|') === 'KowalskiNIP 123|Nowak|FV 1/2026', (await visible()).join('|'));
  check('... grouped', await page.evaluate(() => [...document.querySelectorAll('#p .command-palette-remote .command-palette-group-label')].map((l) => l.textContent).join() === 'Klienci,Faktury'));
  check('the first result is highlighted', (await active()).startsWith('Kowalski'));
  check('results are options like any other', (await page.getAttribute('#p .command-palette-remote .command-palette-item', 'role')) === 'option');
  check('the count is announced', await page.evaluate(() => document.querySelector('#p [role="status"]').textContent === 'Wyniki: 3'));

  await press('Enter');
  check('a chosen result carries its data', await page.evaluate(() => window.selected[0].value === '12' && window.selected[0].result.meta === 'NIP 123'));
  check('... and its link is followed', (await page.evaluate(() => window.location.hash)) === '#klient-12');

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('stare');
  await type('nowe zapytanie');
  check('a newer query cancels the older one', await page.evaluate(() => window.searches[0].signal.aborted && !window.searches[1].signal.aborted));
  await answer(1, [{ label: 'Świeże' }]);
  await answer(0, [{ label: 'Spóźnione' }]);
  await page.waitForTimeout(40);
  check('a late answer to an old query is ignored', !(await visible()).includes('Spóźnione') && (await visible()).includes('Świeże'), (await visible()).join());
  await page.evaluate(() => window.searches[0].respond(new Promise(() => {})));
  await page.waitForTimeout(40);
  check('... and it cannot start the waiting state either', !(await page.getAttribute('#p', 'class')).includes('is-loading'));

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('pierwsze');
  await page.evaluate(() => {
    window.release = null;
    window.searches[0].respond(new Promise((resolve) => (window.release = resolve)));
  });
  await type('drugie zapytanie');
  await answer(1, [{ label: 'Aktualne' }]);
  await page.waitForTimeout(40);
  await page.evaluate(() => window.release([{ label: 'Przeterminowane' }]));
  await page.waitForTimeout(40);
  check('a Promise that resolves after a newer query is ignored', (await visible()).includes('Aktualne') && !(await visible()).includes('Przeterminowane'), (await visible()).join());

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('zzzz');
  await page.evaluate(() => {
    window.release = null;
    window.searches[0].respond(new Promise((resolve) => (window.release = resolve)));
  });
  await page.waitForTimeout(40);
  check('a Promise shows the waiting state', (await message()) === 'Szukam...' && (await page.getAttribute('#p', 'class')).includes('is-loading'), await message());
  await page.evaluate(() => window.release([{ label: 'Doszło' }]));
  await page.waitForTimeout(40);
  check('... until it resolves', (await visible()).join() === 'Doszło' && !(await page.getAttribute('#p', 'class')).includes('is-loading'));

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('yyyy');
  await page.evaluate(() => window.searches[0].respond(Promise.reject(new Error('500'))));
  await page.waitForTimeout(40);
  check('a failed request says so', (await message()) === 'Nie udało się pobrać wyników', await message());

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('xxxx');
  await page.evaluate(() => window.searches[0].respond(Promise.reject(new DOMException('stop', 'AbortError'))));
  await page.waitForTimeout(40);
  check('an aborted request is not an error', (await message()) !== 'Nie udało się pobrać wyników', await message());

  /* ---------- untrusted data ---------- */
  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('wwww');
  await answer(0, [
    { label: '<img src=x onerror="window.pwned=1">', meta: '<b>x</b>', group: '<i>g</i>', href: '#ok' },
    { label: 'Link', href: 'javascript:window.pwned=2' },
    { label: 'Data', href: 'data:text/html,<script>window.pwned=3</script>' },
  ]);
  await page.waitForTimeout(60);
  check('markup in a result stays text', await page.evaluate(() => !document.querySelector('#p .command-palette-remote img, #p .command-palette-remote b, #p .command-palette-remote i')));
  check('a javascript: link is not a link', await page.evaluate(() => [...document.querySelectorAll('#p .command-palette-remote a')].every((a) => /^https?:/.test(a.href))));
  await page.click('#p .command-palette-remote .command-palette-item:nth-of-type(2)');
  await page.waitForTimeout(60);
  check('... and clicking it runs nothing', !(await page.evaluate(() => window.pwned)));

  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('<img src=x onerror=window.pwned=4>');
  await answer(0, []);
  await page.waitForTimeout(60);
  check('the query in the empty state stays text', !(await page.evaluate(() => window.pwned)) && !(await page.locator('#p .command-palette-empty img').count()));

  /* ---------- clean start ---------- */
  await reset();
  await page.click('#opener');
  await page.waitForTimeout(40);
  await type('klienci');
  await page.evaluate(() => window.searches[0] && window.searches[0].respond([{ label: 'Stary wynik' }]));
  await page.waitForTimeout(40);
  await press('Escape');
  await page.click('#opener');
  await page.waitForTimeout(40);
  check('the next opening starts clean', (await page.inputValue('#p .command-palette-input')) === '' && (await visible()).length === 4);

  /* ---------- a palette that arrives later ---------- */
  await reset();
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button id="late-open" data-command-palette-open="#late">x</button><dialog class="command-palette" id="late"><input class="command-palette-input"><div class="command-palette-list"><a class="command-palette-item" href="#a">Ala</a><a class="command-palette-item" href="#b">Ola</a></div></dialog>'
    );
  });
  await page.click('#late-open');
  await page.waitForTimeout(60);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(40);
  check('a palette added later works', await page.evaluate(() => document.querySelector('#late .is-active').textContent === 'Ola'));
  await press('Escape');

  /* ---------- a long list ---------- */
  await page.evaluate(() => {
    const items = Array.from({ length: 80 }, (_, i) => `<a class="command-palette-item" href="#${i}">Pozycja ${i}</a>`).join('');
    document.body.insertAdjacentHTML(
      'beforeend',
      `<button id="long-open" data-command-palette-open="#long">x</button><dialog class="command-palette" id="long"><input class="command-palette-input"><div class="command-palette-list">${items}</div></dialog>`
    );
  });
  await page.click('#long-open');
  await page.waitForTimeout(60);
  await press('End');
  check('the list scrolls to keep the highlight in sight', await page.evaluate(() => {
    const list = document.querySelector('#long .command-palette-list').getBoundingClientRect();
    const item = document.querySelector('#long .is-active').getBoundingClientRect();
    return item.top >= list.top && item.bottom <= list.bottom + 1;
  }));
  check('... and the palette stays inside the screen', await page.evaluate(() => {
    const r = document.querySelector('#long').getBoundingClientRect();
    return r.bottom <= innerHeight && r.height <= innerHeight * 0.75;
  }));
  await press('Escape');

  /* ---------- layout ---------- */
  await page.click('#opener');
  await page.waitForTimeout(40);
  check('a keyboard does not need the close button', !(await page.isVisible('#p .command-palette-close')));
  await press('Escape');

  await page.setViewportSize({ width: 390, height: 780 });
  await page.click('#opener');
  await page.waitForTimeout(260); // past the entrance animation, which moves it
  check('a phone has a way out: no Esc, no backdrop', await page.isVisible('#p .command-palette-close'));
  check('... that says what it does', (await page.textContent('#p .command-palette-close')) === 'Zamknij');
  await page.click('#p .command-palette-close');
  await page.waitForTimeout(40);
  check('... and closes the palette', !(await isOpen()));
  check('... handing focus back', (await focused()) === 'opener');
  await page.click('#opener');
  await page.waitForTimeout(260);
  check('on a phone it takes the whole screen', await page.evaluate(() => {
    const r = document.querySelector('#p').getBoundingClientRect();
    return r.width === innerWidth && r.height === innerHeight && r.top === 0;
  }));
  await press('Escape');
  await page.setViewportSize({ width: 1000, height: 800 });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.click('#opener');
  await page.waitForTimeout(40);
  check('reduced motion: no entrance animation', await page.evaluate(() => getComputedStyle(document.querySelector('#p')).animationName === 'none'));
  await press('Escape');

  check('no page errors', errors.length === 0, errors.join(' | '));
} catch (err) {
  check('the run reached the end', false, err.message);
} finally {
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
