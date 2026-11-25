/**
 * molique - character counter in a real browser (data-char-count).
 *
 * The point of this component is to agree with the browser about one number,
 * so the tests compare the counter against what maxlength ACTUALLY allows
 * rather than against what "characters" intuitively means. Each trap has a
 * negative control: an unmasked expectation ([...str].length) that would pass
 * a naive implementation, and a field the module must leave alone.
 *
 * Everything goes through the autoloader, the way a real page gets the module.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:char-count
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
const eq = (name, got, want) => check(name, got === want, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);

const PAGE = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<link rel="stylesheet" href="/css/molique-style.css"></head><body>
<form id="form">
  <textarea id="plain" class="input" maxlength="20" data-char-count></textarea>
  <textarea id="tpl" class="input" maxlength="50" data-char-count="Pozostało {remaining} z {max}"></textarea>
  <input id="emoji" class="input" type="text" maxlength="10" data-char-count>
  <input id="thresh" class="input" type="text" maxlength="100" data-char-count data-char-count-threshold="5">
  <input id="over" class="input" type="text" maxlength="10" data-char-count value="">
  <input id="own" class="input" type="text" maxlength="30" data-char-count>
  <div class="char-count" id="ownCounter">zastąp mnie</div>

  <!-- NEGATIVE CONTROLS -->
  <textarea id="nolimit" class="input" data-char-count></textarea>
  <textarea id="untouched" class="input" maxlength="20"></textarea>
</form>
<div id="late"></div>
<script src="/js/molique-script.js"></script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const warnings = [];
page.on('console', (m) => {
  if (m.type() === 'warning') warnings.push(m.text());
});

await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: PAGE });
  if (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/')) {
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

await page.goto('https://cc.local/');
await page.waitForFunction(() => typeof window.MoliqueCharCount === 'object', null, { timeout: 5000 });

const counterOf = (id) =>
  page.evaluate((i) => {
    const f = document.getElementById(i);
    const el = document.getElementById(f.getAttribute('aria-describedby'));
    return el ? { text: el.textContent, cls: el.className } : null;
  }, id);
const type = async (id, text) => {
  await page.focus('#' + id);
  await page.keyboard.type(text, { delay: 8 });
  await page.waitForTimeout(40);
};

/* ---------- 1. Default format and counting up ---------- */

// The aria link is what makes the count reachable by a screen reader at all,
// and every later assertion resolves the counter through it - so it is checked
// first and explicitly, otherwise its absence surfaces as a crash.
const linked = await page.evaluate(() => {
  const f = document.getElementById('plain');
  const id = f.getAttribute('aria-describedby');
  return { id, points: id ? !!document.getElementById(id) : false };
});
check('the field is linked to its counter via aria-describedby', linked.points, JSON.stringify(linked));

eq('starts at 0 of the limit', (await counterOf('plain')).text, '0/20');
await type('plain', 'Dzień dobry');
eq('counts what was typed', (await counterOf('plain')).text, '11/20');

/* ---------- 2. The unit is UTF-16, which is what maxlength enforces ---------- */

// Six emoji is twelve code units; maxlength="10" accepts five (measured).
await type('emoji', '😀😀😀😀😀😀');
const emojiState = await page.evaluate(() => {
  const f = document.getElementById('emoji');
  return { value: f.value, units: f.value.length, codePoints: [...f.value].length };
});
check('browser stopped at 10 units = 5 emoji', emojiState.units === 10 && emojiState.codePoints === 5, JSON.stringify(emojiState));
eq('counter agrees with the browser (10/10)', (await counterOf('emoji')).text, '10/10');
// NEGATIVE CONTROL: the intuitive implementation would say 5/10 here and claim
// five characters are left while typing has already stopped working.
check(
  'control: counting code points would have shown 5/10',
  emojiState.codePoints === 5 && (await counterOf('emoji')).text !== '5/10',
  JSON.stringify(emojiState)
);
check('at the limit the counter says so', (await counterOf('emoji')).cls.includes('is-at-limit'));

/* ---------- 3. A newline costs 1, not 2 ---------- */

await page.evaluate(() => { document.getElementById('plain').value = ''; });
await page.focus('#plain');
await page.keyboard.type('ab');
await page.keyboard.press('Enter');
await page.keyboard.type('cd');
await page.waitForTimeout(40);
eq('newline in a textarea costs one', (await counterOf('plain')).text, '5/20');

/* ---------- 4. Template gives the counter a language ---------- */

await type('tpl', 'abcde');
eq('template is filled in', (await counterOf('tpl')).text, 'Pozostało 45 z 50');

/* ---------- 5. Thresholds ---------- */

// threshold=5, so 94 typed leaves 6 remaining - one outside the threshold.
// NEGATIVE CONTROL for off-by-one: the warning must NOT be on yet.
await type('thresh', 'x'.repeat(94));
const justOutside = await counterOf('thresh');
check('control: one character outside the threshold stays neutral', justOutside.cls.trim() === 'char-count', JSON.stringify(justOutside));

// THE BOUNDARY: remaining exactly equal to the threshold must already warn.
// Without this step a < / <= slip passes the whole suite unnoticed (it did).
await type('thresh', 'x'); // 95 typed, 5 remaining == threshold
const boundary = await counterOf('thresh');
check('exactly at the threshold it already warns', boundary.cls.includes('is-near-limit'), JSON.stringify(boundary));

await type('thresh', 'x'); // 96 typed, 4 remaining
const near = await counterOf('thresh');
check('within the threshold it warns', near.cls.includes('is-near-limit') && !near.cls.includes('is-at-limit'), JSON.stringify(near));

await type('thresh', 'xxxx'); // 100 typed, 0 remaining
const atLimit = await counterOf('thresh');
check('at the limit it switches state', atLimit.cls.includes('is-at-limit') && !atLimit.cls.includes('is-near-limit'), JSON.stringify(atLimit));

// NEGATIVE CONTROL: the default threshold is proportional, so a field that is
// only half full must stay neutral.
const plainState = await counterOf('plain');
check('control: a half-empty field has no state class', plainState.cls.trim() === 'char-count', JSON.stringify(plainState));

/* ---------- 6. A value set from code escapes maxlength entirely ---------- */

const overState = await page.evaluate(() => {
  const f = document.getElementById('over');
  f.value = 'ABCDEFGHIJKLMNOPQR'; // 18 units into maxlength="10"
  window.MoliqueCharCount.update(f);
  const el = document.getElementById(f.getAttribute('aria-describedby'));
  return { text: el.textContent, cls: el.className, tooLong: f.validity.tooLong, len: f.value.length };
});
check('a programmatic value really does exceed the limit', overState.len === 18, JSON.stringify(overState));
check('control: the browser does NOT call it invalid', overState.tooLong === false, JSON.stringify(overState));
eq('the counter reports it honestly', overState.text, '18/10');
check('and marks it at-limit', overState.cls.includes('is-at-limit'), JSON.stringify(overState));

/* ---------- 7. A hand-written counter is adopted, not duplicated ---------- */

await type('own', 'test');
const ownState = await page.evaluate(() => {
  const f = document.getElementById('own');
  return {
    describedBy: f.getAttribute('aria-describedby'),
    text: document.getElementById('ownCounter').textContent,
    howMany: document.querySelectorAll('.char-count').length,
    allFields: document.querySelectorAll('[data-char-count]').length,
  };
});
eq('the authored element is used', ownState.describedBy, 'ownCounter');
eq('and gets the text', ownState.text, '4/30');
check(
  'no duplicate counters anywhere',
  ownState.howMany === ownState.allFields - 1, // #nolimit is refused, so it has none
  JSON.stringify(ownState)
);

/* ---------- 8. Refusals and fields left alone ---------- */

check(
  'a field with no maxlength warns',
  warnings.some((w) => w.includes('no maxlength')),
  JSON.stringify(warnings)
);
const noLimit = await page.evaluate(() => {
  const f = document.getElementById('nolimit');
  return { describedBy: f.getAttribute('aria-describedby'), sibling: f.nextElementSibling?.className || null };
});
check('control: no counter is created for it', noLimit.describedBy === null && noLimit.sibling !== 'char-count', JSON.stringify(noLimit));

const untouched = await page.evaluate(() => {
  const f = document.getElementById('untouched');
  return { describedBy: f.getAttribute('aria-describedby'), sibling: f.nextElementSibling?.className || null };
});
check('control: a field without the attribute is untouched', untouched.describedBy === null, JSON.stringify(untouched));

/* ---------- 9. Not a live region ---------- */

const live = await page.evaluate(() => {
  const el = document.querySelector('.char-count');
  return { live: el.getAttribute('aria-live'), role: el.getAttribute('role') };
});
check('the counter does not announce on every keystroke', live.live === null && live.role === null, JSON.stringify(live));

/* ---------- 10. A field added after start ---------- */

await page.evaluate(() => {
  document.getElementById('late').innerHTML =
    '<input id="ajax" class="input" type="text" maxlength="15" data-char-count>';
});
await page.waitForTimeout(150);
await type('ajax', 'later');
eq('a field added later counts too', (await counterOf('ajax')).text, '5/15');

/* ---------- 11. The stylesheet really carries the states ---------- */

const painted = await page.evaluate(() => {
  const el = document.getElementById(document.getElementById('emoji').getAttribute('aria-describedby'));
  const neutral = document.getElementById(document.getElementById('plain').getAttribute('aria-describedby'));
  const danger = getComputedStyle(document.documentElement).getPropertyValue('--danger-text').trim();
  // Resolve the token through a throwaway element, so the comparison is made
  // on computed colours rather than on the raw var() text.
  const probe = document.createElement('span');
  probe.style.color = danger;
  document.body.appendChild(probe);
  const dangerColor = getComputedStyle(probe).color;
  probe.remove();
  return {
    atColor: getComputedStyle(el).color,
    neutralColor: neutral ? getComputedStyle(neutral).color : null,
    dangerColor,
    tabular: getComputedStyle(el).fontVariantNumeric,
  };
});
check('neutral counter resolved at all', painted.neutralColor !== null, JSON.stringify(painted));
check('at-limit is painted differently than neutral', painted.atColor !== painted.neutralColor, JSON.stringify(painted));
check('at-limit really uses --danger-text', painted.atColor === painted.dangerColor, JSON.stringify(painted));
check('digits do not jitter (tabular-nums)', painted.tabular.includes('tabular-nums'), JSON.stringify(painted));

/* ---------- 12. Coexistence with other modules ---------- */

// Modules are classic scripts sharing one global scope, so two of them
// declaring the same top-level name make the second die on a SyntaxError and
// take its component with it - on a page that otherwise looks fine. That is
// how this module silently killed molique-mask.js, and neither suite caught it
// because each test page carried only its own component. This page carries
// both, which is what a real form looks like.
const BOTH = `<!doctype html><html lang="pl"><head><meta charset="utf-8"></head><body>
<input id="bMask" class="input" type="tel" data-mask="phone-pl">
<textarea id="bCount" class="input" maxlength="40" data-char-count></textarea>
<script src="/js/molique-script.js"></script>
</body></html>`;

const second = await browser.newPage({ viewport: { width: 900, height: 700 } });
const bothErrors = [];
second.on('pageerror', (e) => bothErrors.push(String(e)));
await second.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: BOTH });
  if (url.pathname.startsWith('/js/')) {
    const file = path.join(ROOT, url.pathname);
    if (fs.existsSync(file))
      return route.fulfill({ contentType: 'text/javascript; charset=utf-8', body: fs.readFileSync(file, 'utf8') });
  }
  return route.fulfill({ status: 404, body: '' });
});
await second.goto('https://both.local/');
await second.waitForTimeout(1200);

const globals = await second.evaluate(() => ({
  mask: typeof window.MoliqueMask,
  count: typeof window.MoliqueCharCount,
}));
check('both modules survive on one page', globals.mask === 'object' && globals.count === 'object', JSON.stringify(globals));
check('no SyntaxError from a shared global name', bothErrors.length === 0, bothErrors.join(' | '));

await second.focus('#bMask');
await second.keyboard.type('601234567', { delay: 8 });
await second.focus('#bCount');
await second.keyboard.type('abc', { delay: 8 });
await second.waitForTimeout(60);
const together = await second.evaluate(() => {
  const m = document.getElementById('bMask');
  const c = document.getElementById('bCount');
  const el = document.getElementById(c.getAttribute('aria-describedby'));
  return { mask: m.value, count: el ? el.textContent : null };
});
check('the mask still formats with the counter present', together.mask === '601 234 567', JSON.stringify(together));
check('the counter still counts with the mask present', together.count === '3/40', JSON.stringify(together));
await second.close();

/* ---------- done ---------- */

check('no page errors', errors.length === 0, errors.join(' | '));
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');

const raced = await Promise.race([
  browser.close().then(() => 'closed'),
  new Promise((r) => setTimeout(() => r('timeout'), 3000)),
]);
if (raced === 'timeout') console.log('(browser.close() hung - exiting anyway)');
process.exit(failed ? 1 : 0);
