/**
 * molique - input masks in a real browser (data-mask).
 *
 * Everything here is measured, not read from the source: a caret, an undo
 * stack and a keyboard deleting a separator are not visible in the code. Each
 * trap that this module exists to avoid has a NEGATIVE CONTROL next to it - an
 * unmasked field, or a value the rule must leave alone - because a mask test
 * passes just as happily when the mask does nothing at all.
 *
 * Everything goes through the autoloader, the way a real page gets the module.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the test
 * skips. Install it elsewhere and point NODE_PATH at it. npm run test:mask
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

const field = (id, mask, extra = '') =>
  `<input id="${id}" type="tel" class="input" data-mask="${mask}" ${extra}>`;

const PAGE = `<!doctype html><html lang="pl"><head><meta charset="utf-8"></head><body>
<form id="form" onsubmit="return false">
  ${field('phone', 'phone-pl')}
  ${field('phone2', 'phone-pl')}
  ${field('phone3', 'phone-pl')}
  ${field('mid', 'phone-pl')}
  ${field('del', 'phone-pl')}
  ${field('postal', 'postal-pl')}
  ${field('postalde', 'postal-de')}
  ${field('nip', 'nip-pl')}
  ${field('card', 'card')}
  ${field('amex', 'card')}
  ${field('expiry', 'card-expiry')}
  ${field('nrb', 'nrb-pl')}
  <input id="iban" type="text" class="input" data-mask="iban">
  <input id="custom" type="text" class="input" data-mask="### ##-##">
  <input id="hidden" type="tel" class="input" data-mask="nip-pl" data-mask-unmasked-name="nip_raw">
  <input id="authored" type="tel" class="input" data-mask="phone-pl" inputmode="tel" pattern="\\d{9}" maxlength="9">
  <input id="prefilled" type="tel" class="input" data-mask="nrb-pl" value="12123456789012345678901234">
  <input id="badtype" type="number" class="input" data-mask="phone-pl">
  <input id="unknown" type="tel" class="input" data-mask="phone-PL">

  <!-- NEGATIVE CONTROLS: same markup, no mask -->
  <input id="plain" type="tel" class="input" value="481 234">
  <input id="plain2" type="tel" class="input">
</form>
<div id="late"></div>
<script src="/js/molique-script.js"></script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
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

await page.goto('https://mask.local/');
await page.waitForFunction(() => typeof window.MoliqueMask === 'object', null, { timeout: 5000 });

const val = (id) => page.evaluate((i) => document.getElementById(i).value, id);
const caret = (id) => page.evaluate((i) => document.getElementById(i).selectionStart, id);
const attr = (id, name) => page.evaluate(([i, n]) => document.getElementById(i).getAttribute(n), [id, name]);
const type = async (id, text) => {
  await page.focus('#' + id);
  await page.keyboard.type(text, { delay: 12 });
  await page.waitForTimeout(40);
};
const paste = async (id, text) => {
  await page.focus('#' + id);
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
  await page.keyboard.press('Control+v');
  await page.waitForTimeout(60);
};
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

/* ---------- 1. Formatting as you type ---------- */

await type('phone', '123456789');
eq('phone-pl formats while typing', await val('phone'), '123 456 789');

await type('postal', '00950');
eq('postal-pl inserts the dash', await val('postal'), '00-950');

await type('postalde', '10115');
eq('postal-de stays bare digits', await val('postalde'), '10115');

await type('nip', '1234567890');
eq('nip-pl groups 3-3-2-2', await val('nip'), '123-456-78-90');

await type('expiry', '0527');
eq('card-expiry inserts the slash', await val('expiry'), '05/27');

await type('nrb', '12123456789012345678901234');
eq('nrb-pl groups 2 + 6x4', await val('nrb'), '12 1234 5678 9012 3456 7890 1234');

await type('custom', '12345678');
eq('custom literal pattern', await val('custom'), '123 45-67');

/* ---------- 2. Letters are filtered, IBAN keeps and uppercases them ---------- */

await type('iban', 'pl61109010140000071219812874');
eq('iban groups by 4 and uppercases', await val('iban'), 'PL61 1090 1014 0000 0712 1981 2874');

await type('phone2', '12ab34cd56ef78gh9');
eq('phone-pl drops letters', await val('phone2'), '123 456 789');

/* ---------- 3. Card: Amex is not 4-4-4-4 ---------- */

await type('card', '4111111111111111');
eq('visa 4-4-4-4', await val('card'), '4111 1111 1111 1111');

await type('amex', '371449635398431');
eq('amex 4-6-5 (negative control: not truncated to 16)', await val('amex'), '3714 496353 98431');

/* ---------- 4. Caret when editing inside the value ---------- */

await page.evaluate(() => {
  const el = document.getElementById('mid');
  el.value = '481 234 567';
  el.focus();
  el.setSelectionRange(4, 4);
});
await page.keyboard.type('9');
await page.waitForTimeout(40);
eq('insert in the middle shifts the rest', await val('mid'), '481 923 456');
eq('caret follows the typed digit', await caret('mid'), 5);

/* ---------- 5. Backspace on a separator - with a negative control ---------- */

await page.evaluate(() => {
  const el = document.getElementById('del');
  el.value = '481 234';
  el.focus();
  el.setSelectionRange(4, 4);
});
await page.keyboard.press('Backspace');
await page.waitForTimeout(40);
// "481 234" with the caret just past the space: the digit before the caret is
// the 3rd one, so it goes and the rest closes up.
eq('Backspace past a separator removes a digit', await val('del'), '482 34');
eq('caret sits after the surviving digits', await caret('del'), 2);

// NEGATIVE CONTROL: the same keystroke on an unmasked field eats the space.
await page.evaluate(() => {
  const el = document.getElementById('plain');
  el.focus();
  el.setSelectionRange(4, 4);
});
await page.keyboard.press('Backspace');
await page.waitForTimeout(40);
eq('control: unmasked field deletes the space itself', await val('plain'), '481234');

/* ---------- 6. Paste: country code stripped, nine digits left alone ---------- */

await paste('phone3', '+48 601 234 567');
eq('paste strips a pasted country code', await val('phone3'), '601 234 567');

// NEGATIVE CONTROL: nine digits that merely START with 48 must survive intact.
await page.evaluate(() => { document.getElementById('phone3').value = ''; });
await paste('phone3', '481234567');
eq('control: 9 digits starting with 48 are untouched', await val('phone3'), '481 234 567');

// NEGATIVE CONTROL for the EXACT-LENGTH condition, which the test above cannot
// reach (nine digits never overflow, so the rule is not even consulted). Ten
// digits starting with 48 DO overflow, but by one - not by a country code - so
// the prefix must stay and the tail must be the thing that goes.
await page.evaluate(() => { document.getElementById('phone3').value = ''; });
await paste('phone3', '4812345678');
eq('control: an overflow that is not a country code is truncated, not stripped', await val('phone3'), '481 234 567');

/* ---------- 7. Undo keeps its steps (execCommand path) ---------- */

await page.evaluate(() => { const e = document.getElementById('phone2'); e.value = ''; e.focus(); });
await type('phone2', '481234');
const undoStart = await val('phone2');
await page.keyboard.press('Control+z');
await page.waitForTimeout(40);
const undo1 = await val('phone2');
await page.keyboard.press('Control+z');
await page.waitForTimeout(40);
const undo2 = await val('phone2');
check(
  'undo peels one character at a time',
  undoStart === '481 234' && undo1 !== undoStart && undo2 !== undo1 && undo1.length > undo2.length,
  `typed ${JSON.stringify(undoStart)} -> ${JSON.stringify(undo1)} -> ${JSON.stringify(undo2)}`
);

/* ---------- 8. The input event reaches the page ---------- */

// execCommand is forced to refuse, so this really exercises the .value path -
// where the module has to dispatch the input event itself, because its own
// preventDefault() means the browser will not.
const fallback = await page.evaluate(async () => {
  const el = document.getElementById('phone2');
  el.value = '';
  el.focus();
  let n = 0;
  el.addEventListener('input', () => n++);
  const real = document.execCommand;
  document.execCommand = () => false;
  el.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: '5', bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 30));
  document.execCommand = real;
  return { n, value: el.value };
});
check('fallback path writes the value', fallback.value === '5', JSON.stringify(fallback));
check('fallback path announces it with an input event', fallback.n >= 1, JSON.stringify(fallback));

/* ---------- 9. Hidden field with the clean value ---------- */

await type('hidden', '1234567890');
const hiddenState = await page.evaluate(() => {
  const h = document.querySelector('[data-mask-unmasked]');
  return h ? { name: h.name, value: h.value } : null;
});
eq('hidden field is named as asked', hiddenState && hiddenState.name, 'nip_raw');
eq('hidden field carries digits only', hiddenState && hiddenState.value, '1234567890');
eq('visible field keeps the mask', await val('hidden'), '123-456-78-90');

/* ---------- 10. Attributes: filled in, never overwritten ---------- */

eq('inputmode set from the preset', await attr('phone', 'inputmode'), 'numeric');
eq('autocomplete set from the preset', await attr('phone', 'autocomplete'), 'tel');
eq('maxlength derived from the mask', await attr('phone', 'maxlength'), '11');
check('pattern set from the preset', (await attr('phone', 'pattern')) === '\\d{3} ?\\d{3} ?\\d{3}', await attr('phone', 'pattern'));

// NEGATIVE CONTROL: the author's own attributes win.
eq('control: authored inputmode kept', await attr('authored', 'inputmode'), 'tel');
eq('control: authored pattern kept', await attr('authored', 'pattern'), '\\d{9}');
eq('control: authored maxlength kept', await attr('authored', 'maxlength'), '9');

/* ---------- 11. pattern accepts the value with AND without separators ---------- */

const validity = await page.evaluate(() => {
  const el = document.getElementById('phone');
  const out = {};
  el.value = '123 456 789';
  out.masked = el.checkValidity();
  el.value = '123456789';
  out.bare = el.checkValidity();
  el.value = '12345';
  out.tooShort = el.checkValidity();
  return out;
});
check('pattern accepts the masked value', validity.masked === true, JSON.stringify(validity));
check('pattern accepts the bare value (no-JS user)', validity.bare === true, JSON.stringify(validity));
check('control: pattern still rejects a short value', validity.tooShort === false, JSON.stringify(validity));

/* ---------- 12. Server-rendered value is formatted on init ---------- */

eq('prefilled value formatted on init', await val('prefilled'), '12 1234 5678 9012 3456 7890 1234');

/* ---------- 13. Refusals are loud, not silent ---------- */

// Typed into, not just left alone: a number field that the mask DID engage on
// goes empty, because assigning "123 456 789" to type=number is rejected by the
// browser and silently clears it. So this asserts the refusal really took hold.
await type('badtype', '123456789');
eq('control: type=number behaves like a plain field', await val('badtype'), '123456789');
check(
  'type=number warns instead of throwing',
  warnings.some((w) => w.includes('cannot carry a caret')),
  JSON.stringify(warnings)
);
check(
  'a misspelled preset warns',
  warnings.some((w) => w.includes('unknown mask "phone-PL"')),
  JSON.stringify(warnings)
);
await type('unknown', '123456789');
eq('control: misspelled preset installs no mask', await val('unknown'), '123456789');

/* ---------- 14. A field added after start formats through delegation ---------- */

await page.evaluate(() => {
  document.getElementById('late').innerHTML =
    '<input id="ajax" type="tel" class="input" data-mask="postal-pl">';
});
await page.waitForTimeout(150);
await type('ajax', '31001');
eq('field added later still formats', await val('ajax'), '31-001');

/* ---------- 15. No page errors at all ---------- */

check('no page errors', errors.length === 0, errors.join(' | '));

/* ---------- done ---------- */

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');

const raced = await Promise.race([
  browser.close().then(() => 'closed'),
  new Promise((r) => setTimeout(() => r('timeout'), 3000)),
]);
if (raced === 'timeout') console.log('(browser.close() hung - exiting anyway)');
process.exit(failed ? 1 : 0);
