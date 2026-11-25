/**
 * molique - Character counter (data-char-count)
 *
 *   <textarea class="input" maxlength="200" data-char-count></textarea>
 *   <input class="input" maxlength="60" data-char-count="{remaining} znaków do końca">
 *
 * THE LIMIT IS NATIVE. This module never enforces anything - maxlength does,
 * in the browser, with or without JavaScript. The counter only shows where the
 * user stands, so a field without maxlength gets a console warning and nothing
 * else: a counter with no limit to count towards has nothing to say.
 *
 * IT COUNTS WHAT THE BROWSER COUNTS, which is NOT "characters". maxlength is
 * specified in UTF-16 code units, and that is measurable: into maxlength="10"
 * the browser accepts exactly five "😀" (ten units, five code points), and a
 * paste of six is cut to five. So this module uses value.length and not
 * [...value].length - the second one looks more correct and would quietly
 * disagree with the limit the browser actually applies, telling the user two
 * characters are left at the moment typing stops working. For the same reason
 * an emoji costs 2 and a Polish diacritic costs 1: that is the real price.
 * A newline inside a textarea costs 1 (measured; Chromium normalises CRLF).
 *
 * A VALUE SET FROM CODE IS NOT SUBJECT TO maxlength and does not even make the
 * field invalid: assigning 12 units to a maxlength="10" field leaves
 * validity.tooLong false (measured). Server-rendered content can therefore
 * arrive over the limit, so the counter renders negative remaining honestly
 * and marks the field at-limit instead of clamping the number and hiding it.
 *
 * NOT A LIVE REGION. The count is linked to the field through
 * aria-describedby, so a screen reader reads it when the field is focused.
 * It deliberately does NOT announce on every keystroke: a polite live region
 * that fires per character turns a long textarea into a stream of numbers and
 * is the usual reason people switch the counter off. The limit itself is
 * announced by the browser when input stops being accepted.
 *
 * Autoloaded by molique-script.js on [data-char-count] (initCharCount). The
 * update is delegated from document, so a field arriving later (AJAX, modal)
 * counts without re-initialisation; call MoliqueCharCount.apply(root) for such
 * a field to also get its counter element and the aria link, and
 * MoliqueCharCount.update(field) after setting .value from code, because an
 * assignment fires no input event.
 */

/* SCOPE. Modules are classic scripts and share the global scope, so generic
   top-level names (`ready`, `apply`, `onInput`) collide across modules and the
   second script to load dies on a SyntaxError, taking its component with it
   and leaving a clean-looking page. That is not hypothetical: this file and
   molique-mask.js collided on exactly those three names. Everything lives in a
   closure; only the two documented globals are published at the end. */
(function () {
const COUNTER_CLASS = 'char-count';
const NEAR = 'is-near-limit';
const AT = 'is-at-limit';

const ready = new WeakSet();
const counters = new WeakMap();

/* ---------- 1. Reading the configuration ---------- */

// The limit comes from the field, never from an attribute of our own: two
// sources for one number drift apart, and only the native one is enforced.
function limitOf(field) {
  const max = field.maxLength;
  return Number.isInteger(max) && max > 0 ? max : 0;
}

// Remaining characters below which the counter starts warning. Proportional by
// default, because a fixed 10 would mean "half the field" on a short input.
function thresholdOf(field, max) {
  const raw = field.dataset.charCountThreshold;
  if (raw !== undefined && raw !== '') {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) return n;
    console.warn(`[molique-char-count] data-char-count-threshold="${raw}" is not a number`, field);
  }
  return Math.max(1, Math.ceil(max * 0.1));
}

// An empty attribute means the neutral "used/max". Anything else is a template,
// which is how the counter gets a language without this module shipping one.
function render(template, used, max) {
  if (!template) return `${used}/${max}`;
  return template
    .replace(/\{used\}/g, String(used))
    .replace(/\{remaining\}/g, String(max - used))
    .replace(/\{max\}/g, String(max));
}

/* ---------- 2. The counter element ---------- */

let seq = 0;

function elementFor(field) {
  const known = counters.get(field);
  if (known && known.isConnected) return known;

  // An element written by hand wins, so the integrator keeps control of where
  // the counter sits; only its text and state classes are managed here.
  //
  // The search is deliberately narrow: the next sibling, or the field's own
  // .form-floating wrapper. Searching the whole parent looks friendlier and is
  // wrong - fields share one <form>, so the first counter on the page was
  // adopted by every field at once (measured: seven fields, one element, each
  // keystroke overwriting someone else's count).
  let el = null;
  const next = field.nextElementSibling;
  if (next && next.classList.contains(COUNTER_CLASS)) {
    el = next;
  } else {
    const wrap = field.closest('.form-floating');
    if (wrap) el = wrap.querySelector('.' + COUNTER_CLASS);
  }

  if (!el) {
    el = document.createElement('div');
    el.className = COUNTER_CLASS;
    field.insertAdjacentElement('afterend', el);
  }

  if (!el.id) el.id = `molique-char-count-${++seq}`;

  // Described-by, not a live region - see the note at the top of the file.
  const described = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  if (!described.includes(el.id)) {
    described.push(el.id);
    field.setAttribute('aria-describedby', described.join(' '));
  }

  counters.set(field, el);
  return el;
}

/* ---------- 3. Updating ---------- */

function update(field) {
  if (!field || field.dataset.charCount === undefined) return;
  const max = limitOf(field);
  if (!max) return;

  const el = elementFor(field);
  // value.length, not [...value].length - the unit maxlength is specified in.
  const used = field.value.length;
  const remaining = max - used;

  el.textContent = render(field.dataset.charCount, used, max);
  el.classList.toggle(AT, remaining <= 0);
  el.classList.toggle(NEAR, remaining > 0 && remaining <= thresholdOf(field, max));
}

/* ---------- 4. Setup ---------- */

function apply(root = document) {
  const scope = root instanceof Element || root instanceof Document ? root : document;
  const fields = [
    ...(scope instanceof Element && scope.matches && scope.matches('[data-char-count]') ? [scope] : []),
    ...scope.querySelectorAll('[data-char-count]'),
  ];

  for (const field of fields) {
    if (ready.has(field)) continue;
    ready.add(field);

    if (!limitOf(field)) {
      console.warn(
        '[molique-char-count] the field has no maxlength, so there is nothing to count ' +
          'towards. Add maxlength - it is also what actually enforces the limit, ' +
          'with or without this module.',
        field
      );
      continue;
    }
    update(field);
  }
}

/* ---------- 5. Delegated behaviour ---------- */

function onInput(event) {
  const field = event.target;
  if (!field || !field.dataset || field.dataset.charCount === undefined) return;
  if (!ready.has(field)) apply(field);
  update(field);
}

function initCharCount() {
  apply(document);
  if (window.__moliqueCharCountBound) return;
  window.__moliqueCharCountBound = true;
  document.addEventListener('input', onInput, true);
}

window.initCharCount = initCharCount;

window.MoliqueCharCount = {
  apply,
  update,
};
})();
