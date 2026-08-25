/**
 * molique - tests for the cheat-sheet search
 *
 * Run with:  npm run test:cheatsheet   (or: node tools/tests/cheatsheet-search.test.js)
 * Requires:  node tools/gen-cheatsheet.js to have produced src/partials/cheatsheet*.html
 *
 * TWO SUITES, both against the SHIPPED module - it is loaded into a vm and
 * its own functions are called, so nothing here re-implements the matcher.
 *
 *   1. Tag dictionary. The acceptance case from the cheat-sheet plan: someone
 *      types their problem ("wyśrodkować"), not a class name, and must land on
 *      the five centring classes. Every Polish inflection is checked, plus the
 *      no-diacritics spelling and the EN/DE equivalents - that is the whole
 *      point of storing tags as stems rather than words.
 *
 *   2. Widget behaviour, on a hand-rolled mini DOM (there is no jsdom in this
 *      repo). Covers row hiding, section-header hiding, the result counter,
 *      the empty state and Esc.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE = path.join(ROOT, 'js', 'modules', 'molique-table-search.js');
const PARTIAL = (lang) =>
  path.join(ROOT, 'src', 'partials', lang === 'pl' ? 'cheatsheet.html' : `cheatsheet.${lang}.html`);

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

/* ============================================================ *
 * A minimal DOM - only what the module actually touches
 * ============================================================ */
class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.attrs = {};
    this.dataset = {};
    this.hidden = false;
    this.text = '';
    this._class = new Set();
    this.listeners = {};
  }
  get classList() {
    const s = this._class;
    return { add: (c) => s.add(c), remove: (c) => s.delete(c), contains: (c) => s.has(c) };
  }
  set className(v) {
    this._class = new Set(String(v).split(/\s+/).filter(Boolean));
  }
  get className() {
    return [...this._class].join(' ');
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  getAttribute(k) {
    return k in this.attrs ? this.attrs[k] : null;
  }
  appendChild(c) {
    c.parent = this;
    this.children.push(c);
    return c;
  }
  get firstChild() {
    return this.children[0];
  }
  get textContent() {
    return this.children.length ? this.children.map((c) => c.textContent).join(' ') : this.text;
  }
  set textContent(v) {
    this.text = v;
    this.children = [];
  }
  get nextElementSibling() {
    if (!this.parent) return null;
    return this.parent.children[this.parent.children.indexOf(this) + 1] || null;
  }
  descendants(out = []) {
    for (const c of this.children) {
      out.push(c);
      c.descendants(out);
    }
    return out;
  }
  matchesSimple(sel) {
    return sel.startsWith('.') ? this._class.has(sel.slice(1)) : this.tagName === sel.toUpperCase();
  }
  querySelectorAll(sel) {
    return this.descendants().filter((e) => e.matchesSimple(sel));
  }
  querySelector(sel) {
    if (sel.startsWith(':scope > ')) {
      const rest = sel.slice(':scope > '.length);
      return this.children.find((c) => c.matchesSimple(rest)) || null;
    }
    return this.querySelectorAll(sel)[0] || null;
  }
  addEventListener(type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  }
  dispatch(type, event = {}) {
    (this.listeners[type] || []).forEach((fn) => fn({ target: this, ...event }));
  }
}

/** loads the real module into a vm and returns its context */
function loadModule(documentStub) {
  const sandbox = {
    window: { location: { search: '' } },
    document: documentStub,
    URLSearchParams,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(MODULE, 'utf8'), sandbox);
  return sandbox;
}

/* ============================================================ *
 * Suite 1 - tag dictionary
 * ============================================================ */

const inertDocument = {
  documentElement: { lang: 'pl' },
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (t) => new El(t),
  addEventListener: () => {},
};
const api = loadModule(inertDocument);
const { normalizeTableSearch, tableSearchRowMatches } = api;
if (typeof tableSearchRowMatches !== 'function' || typeof normalizeTableSearch !== 'function')
  throw new Error('molique-table-search.js no longer exposes its matcher - update this test');

function loadRows(lang) {
  const html = fs.readFileSync(PARTIAL(lang), 'utf8');
  const body = html.slice(html.indexOf('<tbody'), html.indexOf('</tbody>'));
  const rows = [];
  const re = /<tr([^>]*)>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[2].includes('cheat-sheet-category')) continue;
    const tagAttr = /data-tags="([^"]*)"/.exec(m[1]);
    rows.push({
      names: [...m[2].matchAll(/class="class-name"[^>]*>([^<]*)</g)].map((x) => x[1].trim()),
      text: normalizeTableSearch(m[2].replace(/<[^>]*>/g, ' ')),
      tags: normalizeTableSearch(tagAttr ? tagAttr[1] : '').split(/\s+/).filter(Boolean),
    });
  }
  return rows;
}

function search(rows, query) {
  const terms = normalizeTableSearch(query).trim().split(/\s+/).filter(Boolean);
  return rows.filter((r) => tableSearchRowMatches(r, terms));
}

/** the five rows the plan's acceptance test demands */
const CENTRING = ['.justify-content-*', '.translate-middle', '.text-center', '.mx-auto'];

const CASES = [
  { lang: 'pl', q: 'wyśrodkować', must: CENTRING },
  { lang: 'pl', q: 'wyśrodkuj', must: CENTRING },
  { lang: 'pl', q: 'wyśrodkowanie', must: CENTRING },
  { lang: 'pl', q: 'wysrodkowac', must: CENTRING }, // keyboard without Polish characters
  { lang: 'en', q: 'center', must: CENTRING },
  { lang: 'en', q: 'centre', must: CENTRING },
  { lang: 'de', q: 'zentrieren', must: CENTRING },
  // problem words that appear in no class name at all
  { lang: 'pl', q: 'przycinanie', must: ['.card', '.data-row-compact-wrap'] },
  { lang: 'pl', q: 'zawijanie', must: ['.data-row-compact-wrap'] },
  { lang: 'pl', q: 'dostępność', must: ['.sr-only', '.tabs', '.btn-icon'] },
  { lang: 'pl', q: 'zero-js', must: ['.accordion', '.mega-menu', '.form-switch'] },
  // an ordinary class search still works
  { lang: 'pl', q: 'btn-glass', must: ['.btn-glass'] },
  // several words = all of them must match
  { lang: 'pl', q: 'mobile nawigacja', must: ['.navbar-offcanvas-toggle'] },
];

console.log('--- tag dictionary ---');
const rowCache = {};
for (const c of CASES) {
  const rows = (rowCache[c.lang] = rowCache[c.lang] || loadRows(c.lang));
  const hits = search(rows, c.q);
  const names = new Set(hits.flatMap((h) => h.names));
  const missing = c.must.filter((n) => !names.has(n));
  check(
    `[${c.lang}] "${c.q}" -> ${hits.length} rows`,
    missing.length === 0,
    missing.length ? 'MISSING: ' + missing.join(', ') : ''
  );
}

/* ============================================================ *
 * Suite 2 - widget behaviour
 * ============================================================ */

console.log('\n--- widget behaviour ---');

const partial = fs.readFileSync(PARTIAL('pl'), 'utf8');
const bodyHtml = partial.slice(partial.indexOf('<tbody'), partial.indexOf('</tbody>'));

const tbody = new El('tbody');
let dataRows = 0;
let categories = 0;
{
  const re = /<tr([^>]*)>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = re.exec(bodyHtml))) {
    const tr = new El('tr');
    const tagAttr = /data-tags="([^"]*)"/.exec(m[1]);
    if (tagAttr) tr.dataset.tags = tagAttr[1];
    const isCategory = m[2].includes('cheat-sheet-category');
    for (const c of m[2].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)) {
      const td = new El('td');
      if (/cheat-sheet-category/.test(c[1])) td.className = 'cheat-sheet-category';
      td.textContent = c[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    isCategory ? categories++ : dataRows++;
  }
}

const input = new El('input');
input.setAttribute('data-search-target', '#cheatSheetBody');
input.setAttribute('data-search-status', '#count');
input.value = '';
const counter = new El('span');

const live = loadModule({
  documentElement: { lang: 'pl' },
  activeElement: null,
  querySelector: (sel) => (sel === '#cheatSheetBody' ? tbody : sel === '#count' ? counter : null),
  querySelectorAll: (sel) => (sel === 'input[data-search-target]' ? [input] : []),
  createElement: (t) => new El(t),
  addEventListener: () => {},
});
live.window.initTableSearch();

const isCategoryRow = (r) => !!r.querySelector(':scope > .cheat-sheet-category');
const visibleData = () =>
  tbody.children.filter((r) => !r.hidden && !r._class.has('table-search-empty') && !isCategoryRow(r)).length;
const visibleCategories = () => tbody.children.filter((r) => !r.hidden && isCategoryRow(r)).length;

check('table parsed', dataRows > 100 && categories > 5, `${dataRows} rows / ${categories} categories`);

input.value = 'wyśrodkować';
input.dispatch('input');
check('a tag search hides everything else', visibleData() === 5, visibleData() + ' rows visible');
check(
  'only the sections with a hit stay',
  visibleCategories() > 0 && visibleCategories() < categories,
  visibleCategories() + ' categories visible'
);
check('counter written', counter.textContent === '5 z ' + dataRows, JSON.stringify(counter.textContent));

input.value = 'qqqqq';
input.dispatch('input');
check('empty state appears', tbody.children.some((r) => r._class.has('table-search-empty') && !r.hidden));
check('every section hidden on zero hits', visibleCategories() === 0);
check('counter shows zero', counter.textContent === '0 z ' + dataRows);

input.dispatch('keydown', { key: 'Escape' });
check(
  'Esc restores every row',
  visibleData() === dataRows && visibleCategories() === categories,
  visibleData() + ' rows / ' + visibleCategories() + ' categories'
);
check('Esc hides the empty state', !tbody.children.some((r) => r._class.has('table-search-empty') && !r.hidden));
check('Esc clears the counter', counter.textContent === '');

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
