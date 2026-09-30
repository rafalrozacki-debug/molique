/**
 * molique - tests for MoliqueToast
 *
 * Run with:  npm run test:toast
 *
 * The SHIPPED js/molique-script.js runs in a vm against a hand-rolled mini
 * DOM (there is no jsdom here). The page is empty, so every other section of
 * the script finds nothing and does nothing - only the toast is exercised.
 *
 * What is checked is the one thing that went wrong up to 1.7.36: the message
 * used to be pasted into a template through `innerHTML`, so any text coming
 * from outside the code (a URL parameter, a server response, a file name)
 * was parsed as HTML. In Briko a link with `?briko_notice=<img onerror=...>`
 * executed script in the admin panel. The mini DOM records every
 * `innerHTML` write, so "the message never reached innerHTML" is a fact the
 * test can see, not a guess.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'js', 'molique-script.js');

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

/* ---------- mini DOM ---------- */
const innerHtmlWrites = [];

class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.attrs = {};
    this.className = '';
    this._text = '';
    this.listeners = {};
    this.style = { cssText: '', animation: '' };
    this.popoverOpen = false;
    this.classList = {
      add: (c) => { this.className = (this.className + ' ' + c).trim(); },
      contains: (c) => this.className.split(/\s+/).includes(c),
    };
  }
  get childNodes() { return this.children; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this._text = String(v); }
  set innerHTML(v) {
    innerHtmlWrites.push({ el: this, html: String(v) });
    this.children = [];
    this._text = '';
    this.parsedHtml = String(v);
    // Just enough "parsing" for the pre-1.7.37 template to reach the
    // assertions (it looks its close button up after the innerHTML write),
    // so the negative control fails on the real reason, not on a crash.
    if (String(v).includes('toast-close')) {
      const button = new El('button');
      button.className = 'toast-close';
      this.appendChild(button);
    }
  }
  get innerHTML() { return this.parsedHtml ?? ''; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  showPopover() { this.popoverOpen = true; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, ev = {}) { (this.listeners[type] || []).forEach((fn) => fn(ev)); }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...cs) { cs.forEach((c) => this.appendChild(c)); }
  prepend(c) { c.parent = this; this.children.unshift(c); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; }
  matches(sel) {
    const classes = sel.split('.').filter(Boolean);
    return classes.every((c) => this.classList.contains(c));
  }
  querySelector(sel) {
    for (const c of this.children) {
      if (c.matches(sel)) return c;
      const deep = c.querySelector(sel);
      if (deep) return deep;
    }
    return null;
  }
  all() { return this.children.flatMap((c) => [c, ...c.all()]); }
}

const body = new El('body');
const documentListeners = {};
const timers = [];

const document = {
  currentScript: null,
  body,
  documentElement: new El('html'),
  createElement: (tag) => new El(tag),
  getElementById: () => null,
  querySelector: (sel) => body.querySelector(sel),
  querySelectorAll: () => [],
  addEventListener: (type, fn) => { (documentListeners[type] ||= []).push(fn); },
};

const window = {
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {},
  scrollY: 0,
  CSS: { supports: () => false },
};

const context = vm.createContext({
  window,
  document,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: {},
  CSS: window.CSS,
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
  clearTimeout: () => {},
  console,
});
window.document = document;

vm.runInContext(fs.readFileSync(SCRIPT, 'utf8'), context, { filename: 'molique-script.js' });
(documentListeners.DOMContentLoaded || []).forEach((fn) => fn());

const Toast = window.MoliqueToast;
check('MoliqueToast is defined after DOMContentLoaded', !!Toast && typeof Toast.show === 'function');

// Top positions PREPEND, so the newest toast is not the last node. Each
// inspected call starts from an empty page instead - one toast, no guessing.
const show = (options) => { body.children = []; Toast.show(options); };
const lastToast = () => body.all().find((el) => el.classList.contains('toast'));
const messageOf = (toast) => toast.all().find((el) => el.tagName === 'SPAN');

/* ---------- 1. the message is text, never HTML ---------- */
const PAYLOAD = '<img src="x" onerror="window.__xss = 1"><b>bold</b>';
innerHtmlWrites.length = 0;
show({ message: PAYLOAD, type: 'danger' });
let toast = lastToast();
let span = toast && messageOf(toast);

check('a toast was built (otherwise nothing below proves anything)', !!toast && !!span);
check('the message is the exact text, markup included', span && span.textContent === PAYLOAD, span && span.textContent);
check('no innerHTML write at all for a plain message', 0 === innerHtmlWrites.length, JSON.stringify(innerHtmlWrites.map((w) => w.html)));
check('nothing inside the toast was created from the message', toast && !toast.all().some((el) => el.tagName === 'IMG' || el.tagName === 'B'));

/* ---------- 2. text that used to lose its tail ---------- */
show({ message: 'Value must be > 0 & < 100' });
check('"<" does not cut the sentence', messageOf(lastToast()).textContent === 'Value must be > 0 & < 100');

/* ---------- 3. HTML only on explicit opt-in ---------- */
innerHtmlWrites.length = 0;
show({ message: 'Saved <strong>3</strong> rows', html: true });
check('html: true renders through innerHTML', 1 === innerHtmlWrites.length && innerHtmlWrites[0].html === 'Saved <strong>3</strong> rows');
check('... on the message span, not on the whole toast', innerHtmlWrites[0] && innerHtmlWrites[0].el.tagName === 'SPAN');

innerHtmlWrites.length = 0;
show({ message: '<b>x</b>', html: 'yes' });
check('only boolean true opts in (a truthy string does not)', 0 === innerHtmlWrites.length);

/* ---------- 4. the rest of the toast still works ---------- */
toast = lastToast();
const close = toast.querySelector('.toast-close');
check('close button is there, with the x sign', !!close && close.textContent === '×');
check('type class applied, unknown type falls back to info', toast.classList.contains('toast-info'));

show({ message: 'x', type: 'success', position: 'bottom-left', duration: 1500 });
toast = lastToast();
const progress = toast.querySelector('.toast-progress');
check('progress bar animates for the given duration', !!progress && progress.style.animation === 'toastProgressAnim 1500ms linear forwards', progress && progress.style.animation);
check('auto-close is scheduled for the given duration', 1500 === timers.at(-1).ms);
check('bottom position goes to its own container', !!body.querySelector('.toast-container.toast-bottom-left'));

show({ message: 'x', duration: '<script>' });
check('a non-number duration falls back to 4000 ms', 4000 === timers.at(-1).ms);

show({});
check('no message -> the default label', messageOf(lastToast()).textContent === 'Powiadomienie');

show({ message: 42 });
check('a number message is shown as text', messageOf(lastToast()).textContent === '42');

close.dispatch('click');
check('clicking close starts the exit animation', close.parent.parent.classList.contains('is-closing'));

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
