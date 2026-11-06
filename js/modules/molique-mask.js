/**
 * molique - Input masks (data-mask)
 *
 * Formats a field as it is typed: phone, postal code, tax id, payment card,
 * card expiry, IBAN, Polish bank account number - plus any literal pattern
 * the integrator writes by hand.
 *
 *   <input type="tel" class="input" data-mask="phone-pl">
 *   <input type="text" class="input" data-mask="### ##-##">
 *
 * WITHOUT THIS MODULE the field stays a fully usable .input. The module sets
 * inputmode / autocomplete / pattern / maxlength on init, but those are plain
 * HTML attributes: the no-JS field still raises the right keyboard (when the
 * author wrote them by hand) and still validates through :user-invalid. That is
 * why every shipped pattern accepts the value BOTH with and without separators
 * - a pattern demanding spaces would mark a no-JS user typing bare digits as
 * invalid, which is worse than no mask at all.
 *
 * TYPE MATTERS, AND IT IS NOT A STYLE CHOICE. selectionStart/setSelectionRange
 * are specified only for text, search, tel, url and password. On number and
 * email, Chromium RETURNS null for a read and THROWS InvalidStateError on a
 * write (measured). A mask cannot place a caret there at all, so those types
 * are refused loudly instead of silently dropping the caret to position 0.
 *
 * WRITING THE VALUE: document.execCommand('insertText'). It is formally
 * deprecated, but it is the only path that keeps the browser's own undo stack -
 * measured, typing 481234 into "### ###" then undoing: execCommand peels
 * 481 23 / 481 2 / 481 and redo works, while assigning .value (and, contrary to
 * the usual claim, setRangeText too) collapses to a single step. When
 * execCommand is unavailable, refuses, or the field is not focused, the module
 * falls back to .value silently - and then DISPATCHES the input event itself,
 * because preventDefault() on beforeinput means the page would otherwise never
 * hear that the value changed.
 *
 * TWO ENTRY POINTS ON PURPOSE. beforeinput is cancelable and carries the whole
 * pasted string in e.data (measured: inputType insertFromPaste), so typing,
 * pasting and single-character deletion are handled there - that is what buys
 * the caret and the undo stack. Everything else (IME composition, swipe typing,
 * autocorrect, word-delete) cannot be intercepted reliably: on Android a
 * composition beforeinput may not be cancelable at all. Those land in the
 * reformat() safety net on the input event instead, which re-renders the mask
 * and restores the caret by counting significant characters. Removing either
 * tier leaves a keyboard that silently corrupts the field.
 *
 * Autoloaded by molique-script.js on [data-mask] (initMask). The behaviour is
 * delegated from document, so a field arriving later (AJAX, modal) formats
 * without re-initialisation; call MoliqueMask.apply(root) for such a field to
 * also receive inputmode/autocomplete/pattern/maxlength, which have to be in
 * place BEFORE the field is first focused.
 */

/* ---------- 1. Tokens and presets ---------- */

// A mask is a literal string. These characters are slots; everything else is a
// separator printed as-is.
const TOKENS = {
  '#': /[0-9]/,
  A: /[A-Za-z]/,
  '*': /[0-9A-Za-z]/,
};

const isToken = (ch) => Object.prototype.hasOwnProperty.call(TOKENS, ch);

// Groups a run of slots into blocks, e.g. group('*', 34, 4) -> "**** **** ...".
const group = (token, total, size) =>
  token
    .repeat(total)
    .replace(new RegExp(`(.{${size}})(?=.)`, 'g'), '$1 ');

const PRESETS = {
  'phone-pl': {
    mask: '### ### ###',
    inputmode: 'numeric',
    autocomplete: 'tel',
    // 9 digits, separators optional - the no-JS field must validate too.
    pattern: '\\d{3} ?\\d{3} ?\\d{3}',
    // Pasting from a signature or a CRM usually brings a country code. Stripped
    // ONLY when that is the sole reason the value overflows, so a nine-digit
    // number that happens to start with 48 is never mangled.
    trimPrefixes: ['0048', '48'],
  },
  'postal-pl': {
    mask: '##-###',
    inputmode: 'numeric',
    autocomplete: 'postal-code',
    pattern: '\\d{2}-?\\d{3}',
  },
  'postal-de': {
    // No separator at all - the mask contributes a digits-only filter and a
    // length limit, nothing more. It exists so the German documentation can
    // show a German postal code instead of a Polish one.
    mask: '#####',
    inputmode: 'numeric',
    autocomplete: 'postal-code',
    pattern: '\\d{5}',
  },
  'nip-pl': {
    mask: '###-###-##-##',
    inputmode: 'numeric',
    pattern: '\\d{3}-?\\d{3}-?\\d{2}-?\\d{2}',
  },
  card: {
    // American Express is 15 digits in 4-6-5, not 16 in 4-4-4-4. A card mask
    // that forces four groups of four drops the last digit of every Amex card,
    // which surfaces as a declined payment rather than as a visible bug.
    mask: '#### #### #### ####',
    maskFor: (chars) => (/^3[47]/.test(chars) ? '#### ###### #####' : '#### #### #### ####'),
    inputmode: 'numeric',
    autocomplete: 'cc-number',
    pattern: '\\d{4} ?\\d{4} ?\\d{4} ?\\d{4}|\\d{4} ?\\d{6} ?\\d{5}',
  },
  'card-expiry': {
    mask: '##/##',
    inputmode: 'numeric',
    autocomplete: 'cc-exp',
    pattern: '\\d{2}/?\\d{2}',
  },
  iban: {
    // Up to 34 alphanumeric characters, grouped by four from the left. Letters
    // are part of the value (the country code), so this mask cannot be
    // digits-only - hence the '*' token and uppercase.
    mask: group('*', 34, 4),
    uppercase: true,
    pattern: '[A-Za-z]{2}[0-9]{2}[A-Za-z0-9 ]{11,38}',
  },
  'nrb-pl': {
    // Polish NRB: 26 digits printed as 2 + six groups of 4.
    mask: '## ' + group('#', 24, 4),
    inputmode: 'numeric',
    pattern: '\\d{2} ?\\d{4} ?\\d{4} ?\\d{4} ?\\d{4} ?\\d{4} ?\\d{4}',
  },
};

// Only these can carry a caret - see the note at the top of the file.
const SAFE_TYPES = new Set(['text', 'tel', 'search', 'url', 'password']);

// inputTypes handled by interception. Everything else falls to the safety net.
const INSERTS = new Set(['insertText', 'insertFromPaste', 'insertFromDrop']);
const DELETES = new Set(['deleteContentBackward', 'deleteContentForward']);

/* ---------- 2. Resolving a definition ---------- */

const registry = Object.create(null);
const defs = new WeakMap();
const composing = new WeakSet();
const ready = new WeakSet();
let busy = false;

function resolve(spec) {
  if (!spec) return null;
  const named = registry[spec] || PRESETS[spec];
  if (named) return named;
  // Not a known name. A literal pattern has to contain at least one slot;
  // anything else is a typo in a preset name and would otherwise install a mask
  // made entirely of separators, i.e. a field that swallows every keystroke.
  if ([...spec].some(isToken)) return { mask: spec };
  console.warn(
    `[molique-mask] unknown mask "${spec}" - not a preset and not a pattern ` +
      `(a pattern needs at least one of # A *). Known presets: ` +
      Object.keys({ ...PRESETS, ...registry }).join(', ')
  );
  return null;
}

const maskOf = (def, chars) => (def.maskFor ? def.maskFor(chars) : def.mask);

// Number of slots in a mask - the most significant characters it can hold.
const capacityOf = (mask) => [...mask].filter(isToken).length;

// Union of the token classes used by a mask. Every shipped preset uses a single
// token type, so this is exact for them; build() validates per position anyway.
function acceptorOf(mask) {
  const classes = [...new Set([...mask].filter(isToken))].map((t) => TOKENS[t]);
  if (!classes.length) return /[\s\S]/;
  return {
    test: (ch) => classes.some((re) => re.test(ch)),
  };
}

/* ---------- 3. The pure engine ---------- */

// Significant characters of a displayed value, separators dropped.
function significant(value, def) {
  const accept = acceptorOf(maskOf(def, '') || def.mask);
  let out = '';
  for (const ch of value) if (accept.test(ch)) out += ch;
  return def.uppercase ? out.toUpperCase() : out;
}

// Fits chars into the mask's capacity, trying a prefix strip first so that a
// pasted country code is removed instead of the trailing digits being cut.
function clamp(chars, def) {
  const cap = capacityOf(maskOf(def, chars));
  if (chars.length <= cap) return chars;
  for (const prefix of def.trimPrefixes || []) {
    if (chars.length === prefix.length + cap && chars.startsWith(prefix)) {
      return chars.slice(prefix.length);
    }
  }
  return chars.slice(0, cap);
}

// Renders significant characters through the mask. A trailing separator is NOT
// emitted: "12" under "##-###" stays "12", never "12-".
function build(chars, def) {
  const mask = maskOf(def, chars);
  let out = '';
  let ci = 0;
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i];
    if (!isToken(ch)) {
      if (ci >= chars.length) break;
      out += ch;
      continue;
    }
    const cls = TOKENS[ch];
    while (ci < chars.length && !cls.test(chars[ci])) ci++;
    if (ci >= chars.length) break;
    out += chars[ci++];
  }
  return out;
}

// How many significant characters sit in value.slice(0, end). A displayed value
// is always formatted, so it aligns position-for-position with its mask.
function countBefore(value, def, end) {
  const mask = maskOf(def, significant(value, def));
  let n = 0;
  const limit = Math.min(end, value.length, mask.length);
  for (let i = 0; i < limit; i++) if (isToken(mask[i])) n++;
  return n;
}

// Caret index just after the nth significant character of a formatted value.
function caretAfter(value, def, n) {
  if (n <= 0) return 0;
  const mask = maskOf(def, significant(value, def));
  let seen = 0;
  for (let i = 0; i < value.length && i < mask.length; i++) {
    if (!isToken(mask[i])) continue;
    seen++;
    if (seen >= n) return i + 1;
  }
  return value.length;
}

/* ---------- 4. Writing back ---------- */

function setCaret(input, pos) {
  try {
    input.setSelectionRange(pos, pos);
  } catch {
    // A type outside SAFE_TYPES slipped through - nothing sensible to do.
  }
}

// Replaces the whole value, keeping the native undo stack where possible.
// Returns true when the browser emitted the input event for us.
function write(input, value) {
  if (input.value === value) return true;
  busy = true;
  let native = false;
  try {
    if (value !== '' && document.activeElement === input && document.execCommand) {
      input.select();
      native = document.execCommand('insertText', false, value) && input.value === value;
    }
  } catch {
    native = false;
  } finally {
    if (!native) input.value = value;
    busy = false;
  }
  return native;
}

function announce(input) {
  input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
}

function syncHidden(input, def) {
  const name = input.dataset.maskUnmaskedName;
  if (!name) return;
  let hidden = input.parentElement && input.parentElement.querySelector('[data-mask-unmasked]');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.setAttribute('data-mask-unmasked', '');
    input.insertAdjacentElement('afterend', hidden);
  }
  hidden.name = name;
  hidden.value = significant(input.value, def);
}

/* ---------- 5. Applying a new value ---------- */

function commit(input, def, chars, targetCount) {
  const fitted = clamp(chars, def);
  const formatted = build(fitted, def);
  const count = Math.min(targetCount, fitted.length);
  const native = write(input, formatted);
  setCaret(input, caretAfter(formatted, def, count));
  syncHidden(input, def);
  if (!native) announce(input);
}

// The safety net: re-render whatever ended up in the field and put the caret
// back where its significant characters say it belongs.
function reformat(input, def) {
  const chars = clamp(significant(input.value, def), def);
  const formatted = build(chars, def);
  const count = countBefore(input.value, def, input.selectionStart ?? input.value.length);
  if (formatted !== input.value) {
    const native = write(input, formatted);
    setCaret(input, caretAfter(formatted, def, count));
    if (!native) announce(input);
  }
  syncHidden(input, def);
}

/* ---------- 6. Setup ---------- */

function definitionFor(input) {
  if (defs.has(input)) return defs.get(input);
  const def = resolve(input.dataset.mask);
  defs.set(input, def);
  return def;
}

function apply(root = document) {
  const scope = root instanceof Element || root instanceof Document ? root : document;
  const fields = [
    ...(scope instanceof Element && scope.matches && scope.matches('[data-mask]') ? [scope] : []),
    ...scope.querySelectorAll('[data-mask]'),
  ];
  for (const input of fields) {
    if (ready.has(input)) continue;
    ready.add(input);

    if (!SAFE_TYPES.has(input.type)) {
      console.warn(
        `[molique-mask] type="${input.type}" cannot carry a caret, so it cannot ` +
          `be masked (selectionStart is null and setSelectionRange throws on ` +
          `number and email). Use type="text" or type="tel" with inputmode.`,
        input
      );
      defs.set(input, null);
      continue;
    }

    const def = definitionFor(input);
    if (!def) continue;

    // Author-written attributes always win - the preset only fills the gaps.
    if (def.inputmode && !input.hasAttribute('inputmode')) input.setAttribute('inputmode', def.inputmode);
    if (def.autocomplete && !input.hasAttribute('autocomplete')) input.setAttribute('autocomplete', def.autocomplete);
    if (def.pattern && !input.hasAttribute('pattern')) input.setAttribute('pattern', def.pattern);
    // maxlength is deliberately derived, not asked for: the masked string is
    // longer than the raw one, so a hand-written limit would be wrong in one of
    // the two states. Without JS there is no limit, and pattern still validates.
    const maskLength = maskOf(def, significant(input.value, def)).length;
    if (!input.hasAttribute('maxlength')) {
      input.setAttribute('maxlength', String(maskLength));
    } else if (input.maxLength > 0 && input.maxLength < maskLength) {
      // maxlength clips what execCommand inserts, so a limit shorter than the
      // mask truncates the field with no error anywhere. Loud, because the
      // symptom (a value one character short) reads as a backend problem.
      console.warn(
        `[molique-mask] maxlength="${input.maxLength}" is shorter than the mask ` +
          `("${maskOf(def, significant(input.value, def))}" needs ${maskLength}), so the value ` +
          `will be cut. Leave maxlength out - the module derives it from the mask.`,
        input
      );
    }

    // Server-rendered values arrive unformatted.
    if (input.value) reformat(input, def);
    else syncHidden(input, def);
  }
}

/* ---------- 7. Delegated behaviour ---------- */

function fieldOf(event) {
  const el = event.target;
  if (!el || !el.dataset || el.dataset.mask === undefined) return null;
  if (!ready.has(el)) apply(el);
  const def = definitionFor(el);
  return def ? { el, def } : null;
}

function onBeforeInput(event) {
  if (busy || event.isComposing) return;
  const found = fieldOf(event);
  if (!found) return;
  const { el, def } = found;
  if (composing.has(el)) return;

  const type = event.inputType;
  if (!INSERTS.has(type) && !DELETES.has(type)) return;

  const value = el.value;
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? start;
  const chars = significant(value, def);
  const before = countBefore(value, def, start);
  const inside = countBefore(value, def, end) - before;

  if (INSERTS.has(type)) {
    const incoming = significant(event.data || '', def);
    event.preventDefault();
    if (!incoming) return;
    commit(el, def, chars.slice(0, before) + incoming + chars.slice(before + inside), before + incoming.length);
    return;
  }

  // Deletion. With a selection, drop the significant characters it covers.
  event.preventDefault();
  if (inside > 0) {
    commit(el, def, chars.slice(0, before) + chars.slice(before + inside), before);
    return;
  }
  // No selection: step over any separator so Backspace removes a character
  // instead of a space the mask would immediately put back.
  if (type === 'deleteContentBackward') {
    if (before === 0) return;
    commit(el, def, chars.slice(0, before - 1) + chars.slice(before), before - 1);
  } else {
    if (before >= chars.length) return;
    commit(el, def, chars.slice(0, before) + chars.slice(before + 1), before);
  }
}

function onInput(event) {
  if (busy || event.isComposing) return;
  const found = fieldOf(event);
  if (!found) return;
  const { el, def } = found;
  if (composing.has(el)) return;
  // Undo and redo hand back a value this module already formatted. Re-rendering
  // it would be a no-op at best and a fight with the history stack at worst.
  if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
    syncHidden(el, def);
    return;
  }
  reformat(el, def);
}

function onCompositionStart(event) {
  const found = fieldOf(event);
  if (found) composing.add(found.el);
}

function onCompositionEnd(event) {
  const found = fieldOf(event);
  if (!found) return;
  composing.delete(found.el);
  reformat(found.el, found.def);
}

function initMask() {
  apply(document);
  if (window.__moliqueMaskBound) return;
  window.__moliqueMaskBound = true;
  document.addEventListener('beforeinput', onBeforeInput, true);
  document.addEventListener('input', onInput, true);
  document.addEventListener('compositionstart', onCompositionStart, true);
  document.addEventListener('compositionend', onCompositionEnd, true);
}

window.initMask = initMask;

window.MoliqueMask = {
  apply,
  // Pure formatter for values coming from a server, with no field involved.
  format(value, spec) {
    const def = resolve(spec);
    if (!def) return value;
    return build(clamp(significant(String(value), def), def), def);
  },
  // The value without separators - what a backend usually wants to store.
  value(input) {
    const def = definitionFor(input);
    return def ? significant(input.value, def) : input.value;
  },
  register(name, definition) {
    registry[name] = definition;
  },
  presets: PRESETS,
};
