/**
 * molique - the module autoloader in js/molique-script.js, in a real browser.
 *
 * A component can arrive after the start of the page, in a fragment fetched
 * later. Its module has to follow, or the component silently does nothing. And
 * a module the page already carries must not be loaded twice: a classic script
 * dies on its top-level const with a SyntaxError.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:autoloader
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

const SHELL = (head = '', body = '') => `<!doctype html><html lang="en"><head>${head}</head><body>
${body}
<script src="/js/molique-script.js"></script>
</body></html>`;

const PAGES = {
  '/start.html': SHELL('', '<main><section id="slot"></section></main>'),
  '/already-there.html': SHELL(
    '',
    `<button aria-describedby="t">x</button><div class="tooltip-popover" id="t" popover="hint">Hi</div>
     <script src="/js/modules/molique-tooltip-popover.js" defer></script>`
  ),
  '/from-the-start.html': SHELL('', '<div class="tooltip-popover" id="t" popover="hint"></div>'),
};

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (PAGES[url.pathname]) return route.fulfill({ contentType: 'text/html', body: PAGES[url.pathname] });
  if (url.pathname.startsWith('/js/')) {
    const file = path.join(ROOT, url.pathname);
    if (fs.existsSync(file)) return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(file, 'utf8') });
  }
  return route.fulfill({ status: 404, body: '' });
});

const copies = (name) =>
  page.evaluate((n) => [...document.scripts].filter((s) => s.src.includes(n)).length, name);
// Deep in the page on purpose: a real fragment lands in a modal or a table.
const add = (html) =>
  page.evaluate((h) => document.querySelector('#slot').insertAdjacentHTML('beforeend', h), html);
const open = (file) => page.goto(`http://autoload.test/${file}`, { waitUntil: 'load' });

try {
  await open('start.html');
  check('nothing is loaded for a component that is not there', (await copies('molique-tooltip-popover')) === 0);

  await add('<button aria-describedby="late">x</button><div id="late" class="tooltip-popover" popover="hint">Hi</div>');
  await page.waitForFunction(() => typeof window.MoliqueTooltipPopover !== 'undefined', null, { timeout: 2000 }).catch(() => {});
  check('a component added later brings its module', (await copies('molique-tooltip-popover')) === 1);
  check('... which is initialised', await page.evaluate(() => typeof window.MoliqueTooltipPopover !== 'undefined'));

  await page.hover('[aria-describedby="late"]');
  await page.waitForTimeout(300);
  check('... and works', await page.evaluate(() => document.querySelector('#late').matches(':popover-open')));

  await page.evaluate(() => {
    window.initCalls = 0;
    const real = window.initTooltipPopover;
    window.initTooltipPopover = () => {
      window.initCalls++;
      real();
    };
  });
  await add('<div class="tooltip-popover" popover="hint">Again</div>');
  await page.waitForTimeout(250);
  check('a second one does not load it again', (await copies('molique-tooltip-popover')) === 1);
  check('... nor initialise it again', (await page.evaluate(() => window.initCalls)) === 0, String(await page.evaluate(() => window.initCalls)));

  await add('<div data-tour="1" data-tour-text="x">Tour</div><div data-onboarding="1">Welcome</div>');
  await page.waitForTimeout(250);
  check('a fragment cannot start a guided tour', (await copies('molique-tour')) === 0 && (await copies('molique-onboarding')) === 0);

  await open('from-the-start.html');
  await page.waitForFunction(() => typeof window.MoliqueTooltipPopover !== 'undefined', null, { timeout: 2000 }).catch(() => {});
  check('a component present from the start loads as before', (await copies('molique-tooltip-popover')) === 1);

  errors.length = 0;
  await open('already-there.html');
  await page.waitForTimeout(300);
  check('a module already on the page is not loaded twice', (await copies('molique-tooltip-popover')) === 1, String(await copies('molique-tooltip-popover')));
  check('... so there is no SyntaxError', errors.length === 0, errors.join(' | '));
  await page.hover('[aria-describedby="t"]');
  await page.waitForTimeout(300);
  check('... and it is still initialised: the component works', await page.evaluate(() => document.querySelector('#t').matches(':popover-open')));
} catch (err) {
  check('the run reached the end', false, err.message);
} finally {
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
