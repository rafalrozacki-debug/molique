/**
 * molique - tests for the popover anchor shim
 *
 * Run with:  npm run test:popover-anchor
 *
 * The shim exists because Chrome/Edge 125-132 support anchor() but create no
 * implicit anchor between a [popovertarget] button and its popover, and no
 * CSS feature query can tell that band apart from a browser that does. These
 * checks run the SHIPPED module in a vm against a hand-rolled mini DOM (there
 * is no jsdom here), so what is verified is the real listener, not a copy.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE = path.join(ROOT, 'js', 'modules', 'molique-popover-anchor.js');

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

/* ---------- mini DOM ---------- */
class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.attrs = {};
    this.dataset = {};
    this.styleProps = {};
    this._class = new Set();
    this.style = {
      setProperty: (k, v) => {
        this.styleProps[k] = v;
      },
    };
  }
  set className(v) {
    this._class = new Set(String(v).split(/\s+/).filter(Boolean));
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
  /** only the selector shapes the module actually uses */
  matches(selector) {
    return selector.split(',').some((part) => {
      const s = part.trim();
      const cls = s.match(/^\.([\w-]+)/);
      if (!cls) return false;
      if (!this._class.has(cls[1])) return false;
      if (s.includes('[popover]')) return 'popover' in this.attrs;
      return true;
    });
  }
  closest(selector) {
    const attr = selector.match(/^\[([\w-]+)\]$/);
    let node = this;
    while (node) {
      if (attr ? attr[1] in node.attrs : node.matches(selector)) return node;
      node = node.parent;
    }
    return null;
  }
  querySelectorAll(selector) {
    const attr = selector.match(/^\[([\w-]+)\]$/);
    const out = [];
    const walk = (n) => {
      for (const c of n.children) {
        if (attr ? attr[1] in c.attrs : c.matches(selector)) out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
}

function makeWorld({ supportsAnchor = true } = {}) {
  const byId = new Map();
  const root = new El('body');
  const listeners = [];

  const document = {
    documentElement: { lang: 'en' },
    getElementById: (id) => byId.get(id) || null,
    querySelectorAll: (sel) => root.querySelectorAll(sel),
    addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
  };

  const sandbox = {
    window: {},
    document,
    CSS: { supports: () => supportsAnchor },
    getComputedStyle: (el) => ({
      getPropertyValue: (prop) => el.styleProps[prop] || el.authored?.[prop] || '',
    }),
  };
  sandbox.window.CSS = sandbox.CSS;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(MODULE, 'utf8'), sandbox);

  return {
    sandbox,
    root,
    byId,
    listeners,
    /** builds a trigger + menu pair */
    pair(id, menuClass, { authoredAnchorName, authoredPositionAnchor } = {}) {
      const trigger = new El('button');
      trigger.setAttribute('popovertarget', id);
      if (authoredAnchorName) trigger.authored = { 'anchor-name': authoredAnchorName };
      const menu = new El('div');
      menu.className = menuClass;
      menu.setAttribute('popover', '');
      menu.attrs.id = id;
      if (authoredPositionAnchor) menu.authored = { 'position-anchor': authoredPositionAnchor };
      root.appendChild(trigger);
      root.appendChild(menu);
      byId.set(id, menu);
      return { trigger, menu };
    },
    click(el) {
      for (const l of listeners) if (l.type === 'click') l.fn({ target: el });
    },
  };
}

/* ---------- 1. the basic case ---------- */
{
  const w = makeWorld();
  const { trigger, menu } = w.pair('m1', 'dropdown-menu');
  w.sandbox.window.initPopoverAnchor();
  w.click(trigger);

  const name = trigger.styleProps['anchor-name'];
  check('trigger gets an anchor-name', !!name && name.startsWith('--molique-anchor-'), name);
  check('menu points at it', menu.styleProps['position-anchor'] === name, menu.styleProps['position-anchor']);
}

/* ---------- 2. all four anchored components, and nothing else ---------- */
{
  const w = makeWorld();
  const ok = ['dropdown-menu', 'popover-context', 'select-search-menu', 'custom-select-dropdown'];
  w.sandbox.window.initPopoverAnchor();
  ok.forEach((cls, i) => {
    const { trigger, menu } = w.pair('ok' + i, cls);
    w.click(trigger);
    check('links .' + cls, !!menu.styleProps['position-anchor']);
  });

  const foreign = w.pair('other', 'my-own-popover');
  w.click(foreign.trigger);
  check(
    'leaves a non-molique popover alone',
    !foreign.menu.styleProps['position-anchor'] && !foreign.trigger.styleProps['anchor-name']
  );

  const mega = w.pair('mega', 'mega-menu-content');
  w.click(mega.trigger);
  check('leaves .mega-menu-content alone (it has its own anchor)', !mega.menu.styleProps['position-anchor']);
}

/* ---------- 3. an author-chosen anchor is respected ---------- */
{
  const w = makeWorld();
  w.sandbox.window.initPopoverAnchor();

  const named = w.pair('n1', 'dropdown-menu', { authoredAnchorName: '--project-trigger' });
  w.click(named.trigger);
  check(
    'reuses an anchor-name the project set',
    named.menu.styleProps['position-anchor'] === '--project-trigger' &&
      !named.trigger.styleProps['anchor-name'],
    named.menu.styleProps['position-anchor']
  );

  const pinned = w.pair('n2', 'dropdown-menu', { authoredPositionAnchor: '--project-anchor' });
  w.click(pinned.trigger);
  check(
    'never overwrites a position-anchor the project set',
    pinned.menu.styleProps['position-anchor'] === undefined
  );
}

/* ---------- 4. one menu shared by several triggers ---------- */
{
  const w = makeWorld();
  w.sandbox.window.initPopoverAnchor();
  const { trigger: first, menu } = w.pair('shared', 'dropdown-menu');

  const second = new El('button');
  second.setAttribute('popovertarget', 'shared');
  w.root.appendChild(second);

  w.click(first);
  const afterFirst = menu.styleProps['position-anchor'];
  w.click(second);
  const afterSecond = menu.styleProps['position-anchor'];

  check('first trigger anchors the shared menu', afterFirst === first.styleProps['anchor-name']);
  check(
    'second trigger re-points it to itself',
    afterSecond === second.styleProps['anchor-name'] && afterSecond !== afterFirst,
    afterFirst + ' -> ' + afterSecond
  );
}

/* ---------- 5. does nothing without anchor positioning ---------- */
{
  const w = makeWorld({ supportsAnchor: false });
  const { trigger, menu } = w.pair('nope', 'dropdown-menu');
  w.sandbox.window.initPopoverAnchor();
  w.click(trigger);
  check(
    'no-ops where anchor positioning is unsupported (the CSS fallback handles it)',
    !menu.styleProps['position-anchor'] && w.listeners.length === 0
  );
}

/* ---------- 6. eager API for programmatically opened menus ---------- */
{
  const w = makeWorld();
  const { menu } = w.pair('eager', 'select-search-menu');
  w.sandbox.window.initPopoverAnchor();
  w.sandbox.window.MoliquePopoverAnchor.apply();
  check('MoliquePopoverAnchor.apply() links without a click', !!menu.styleProps['position-anchor']);
}

/* ---------- 7. init is idempotent ---------- */
{
  const w = makeWorld();
  w.sandbox.window.initPopoverAnchor();
  w.sandbox.window.initPopoverAnchor();
  w.sandbox.window.initPopoverAnchor();
  check('binds exactly one document listener', w.listeners.length === 1, w.listeners.length + ' listeners');
  check('binds it in the capture phase', w.listeners[0] && w.listeners[0].capture === true);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
