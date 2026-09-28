/**
 * molique - tests for the tooltip popover
 *
 * Run with:  npm run test:tooltip-popover
 *
 * The SHIPPED module runs in a vm against a hand-rolled mini DOM (there is
 * no jsdom here), with a fake clock for setTimeout. What is checked is the
 * decision logic - when a bubble opens and closes, which bubble a trigger
 * names, how it is anchored - plus the pure viewport placement used where
 * CSS Anchor Positioning is missing. Whether the browser then paints the
 * bubble in the top layer is the browser's job and is not simulated.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE = path.join(ROOT, 'js', 'modules', 'molique-tooltip-popover.js');

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

/* ---------- mini DOM ---------- */
class El {
  constructor(world, { id, className = '', describedby, popover } = {}) {
    this.world = world;
    this.id = id;
    this.parent = null;
    this.attrs = {};
    if (describedby) this.attrs['aria-describedby'] = describedby;
    if (popover) this.attrs.popover = popover;
    this._class = new Set(className.split(/\s+/).filter(Boolean));
    this.classList = { contains: (c) => this._class.has(c) };
    this.dataset = {};
    this.props = {}; // style.setProperty
    this.style = {
      setProperty: (k, v) => (this.props[k] = v),
    };
    this.authored = {}; // what getComputedStyle reports before we touch it
    this.open = false;
    this.focusVisible = true;
    this.rect = { top: 300, bottom: 330, left: 400, width: 100, height: 30 };
    if (id) world.byId[id] = this;
  }
  getAttribute(n) {
    return n in this.attrs ? this.attrs[n] : null;
  }
  matches(sel) {
    if (sel === ':focus-visible') return this.focusVisible;
    const cls = sel.match(/^\.([\w-]+)$/);
    return !!cls && this._class.has(cls[1]);
  }
  closest(sel) {
    for (let n = this; n; n = n.parent) {
      if (sel === '[aria-describedby]' ? n.getAttribute('aria-describedby') !== null : n.matches(sel)) return n;
    }
    return null;
  }
  contains(other) {
    for (let n = other; n; n = n.parent) if (n === this) return true;
    return false;
  }
  append(child) {
    child.parent = this;
    return child;
  }
  showPopover() {
    if (!('popover' in this.attrs)) throw new Error('NotSupportedError');
    if (this.open) throw new Error('InvalidStateError');
    this.open = true;
  }
  hidePopover() {
    if (!this.open) throw new Error('InvalidStateError');
    this.open = false;
  }
  getBoundingClientRect() {
    return this.rect;
  }
}

function makeWorld({ anchor = true } = {}) {
  const docListeners = {};
  const winListeners = {};
  let timers = [];
  let now = 0;
  let timerSeq = 0;

  const world = {
    byId: {},
    el: (opts) => new El(world, opts),
    fire(type, init) {
      const list = docListeners[type] || [];
      list.forEach((fn) => fn(init));
    },
    fireWindow(type, init = {}) {
      (winListeners[type] || []).forEach((fn) => fn(init));
    },
    /* One timer at a time, earliest first, re-reading the queue after each:
       a timer that clears another must actually prevent it, as in a real
       event loop. (Collecting all due timers up front hid a real bug.) */
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0];
        if (!next) break;
        timers = timers.filter((t) => t !== next);
        now = next.at;
        next.fn();
      }
      now = end;
    },
  };

  const sandbox = {
    window: {
      innerWidth: 1000,
      innerHeight: 800,
      addEventListener: (t, fn) => (winListeners[t] = winListeners[t] || []).push(fn),
    },
    document: {
      getElementById: (id) => world.byId[id] || null,
      addEventListener: (t, fn) => (docListeners[t] = docListeners[t] || []).push(fn),
    },
    HTMLElement: Object.assign(function HTMLElement() {}, { prototype: { showPopover() {} } }),
    CSS: { supports: () => anchor },
    getComputedStyle: (el) => ({ getPropertyValue: (p) => (p in el.props ? el.props[p] : el.authored[p] || '') }),
    setTimeout: (fn, ms) => {
      const t = { fn, at: now + ms, id: ++timerSeq };
      timers.push(t);
      return t.id;
    },
    clearTimeout: (id) => {
      timers = timers.filter((t) => t.id !== id);
    },
  };
  sandbox.window.CSS = sandbox.CSS;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(MODULE, 'utf8'), sandbox);
  sandbox.window.initTooltipPopover();
  world.api = sandbox.window.MoliqueTooltipPopover;
  world.place = sandbox.tooltipPopoverPlace;
  world.window = sandbox.window;
  return world;
}

/* A trigger + bubble pair, plus an unrelated element to move the pointer to. */
function scene(opts) {
  const w = makeWorld(opts);
  const tip = w.el({ id: 'tip-1', className: 'tooltip-popover', popover: 'hint' });
  const trigger = w.el({ className: 'btn', describedby: 'tip-1' });
  const icon = trigger.append(w.el({ className: 'icon' }));
  const outside = w.el({ className: 'elsewhere' });
  return { w, tip, trigger, icon, outside };
}

const mouse = (target, relatedTarget = null) => ({ target, relatedTarget, pointerType: 'mouse' });

/* ---------- 1. pure placement (no anchor positioning) ---------- */
{
  const place = makeWorld().place;
  const view = { width: 1000, height: 800 };
  const size = { width: 200, height: 40 };
  const mid = { top: 300, bottom: 330, left: 400, width: 100 };

  let p = place(mid, size, view, false);
  check('placement: above, centred on the trigger', p.top === 300 - 8 - 40 && p.left === 350, JSON.stringify(p));

  p = place({ ...mid, top: 20, bottom: 50 }, size, view, false);
  check('placement: flips below when there is no room above', p.top === 58, JSON.stringify(p));

  p = place(mid, size, view, true);
  check('placement: -bottom prefers below', p.top === 338, JSON.stringify(p));

  p = place({ ...mid, top: 760, bottom: 790 }, size, view, true);
  check('placement: -bottom flips above near the bottom edge', p.top === 760 - 8 - 40, JSON.stringify(p));

  p = place({ ...mid, left: 0, width: 20 }, size, view, false);
  check('placement: clamped to the left edge', p.left === 8, JSON.stringify(p));

  p = place({ ...mid, left: 980, width: 20 }, size, view, false);
  check('placement: clamped to the right edge', p.left === 1000 - 8 - 200, JSON.stringify(p));

  p = place(mid, { width: 1200, height: 40 }, view, false);
  check('placement: wider than the window starts at the left edge', p.left === 8, JSON.stringify(p));
}

/* ---------- 2. hover opens after a delay, anchored to the trigger ---------- */
{
  const { w, tip, trigger, icon } = scene();
  w.fire('pointerover', mouse(icon));
  check('hover: nothing before the delay', !tip.open);
  w.advance(150);
  check('hover: opens after 150ms', tip.open);
  check(
    'hover: bubble anchored to the trigger',
    trigger.props['anchor-name'] && tip.props['position-anchor'] === trigger.props['anchor-name'],
    `${trigger.props['anchor-name']} / ${tip.props['position-anchor']}`
  );
}

/* ---------- 3. leaving closes, moving onto the bubble does not ---------- */
{
  const { w, tip, trigger, outside } = scene();
  w.fire('pointerover', mouse(trigger));
  w.advance(150);
  w.fire('pointerout', mouse(trigger, tip));
  w.advance(500);
  check('pointer moving onto the bubble keeps it open (hoverable)', tip.open);
  w.fire('pointerout', mouse(tip, outside));
  w.advance(119);
  check('leaving: still open within the grace period', tip.open);
  w.advance(1);
  check('leaving: closed after 120ms', !tip.open);
}
{
  const { w, tip, trigger, icon, outside } = scene();
  w.fire('pointerover', mouse(trigger));
  w.advance(100);
  w.fire('pointerout', mouse(trigger, outside));
  w.advance(500);
  check('a pass-over shorter than the delay opens nothing', !tip.open);
  w.fire('pointerover', mouse(trigger));
  w.advance(150);
  w.fire('pointerout', mouse(trigger, icon));
  w.advance(500);
  check('moving between children of the trigger keeps it open', tip.open);
}

{
  // Regression (found in real Chrome): the delayed close of A used to
  // clear ALL timers - including the pending open of B the pointer had
  // just moved onto - so going straight from one trigger to the next
  // showed nothing.
  const { w, tip, trigger } = scene();
  const tip2 = w.el({ id: 'tip-2', className: 'tooltip-popover', popover: 'hint' });
  const trigger2 = w.el({ describedby: 'tip-2' });
  w.fire('pointerover', mouse(trigger));
  w.advance(150);
  w.fire('pointerout', mouse(trigger, trigger2));
  w.fire('pointerover', mouse(trigger2, trigger));
  w.advance(500);
  check('moving straight from one trigger to the next opens the next bubble', !tip.open && tip2.open);
}

/* ---------- 4. keyboard ---------- */
{
  const { w, tip, trigger, outside } = scene();
  w.fire('focusin', { target: trigger });
  check('keyboard focus opens at once', tip.open);
  w.fire('keydown', { key: 'Escape' });
  check('Escape closes', !tip.open);
  w.fire('focusin', { target: trigger });
  w.fire('focusout', { target: trigger, relatedTarget: outside });
  check('focus leaving closes', !tip.open);
  trigger.focusVisible = false;
  w.fire('focusin', { target: trigger });
  check('mouse focus (not :focus-visible) opens nothing by itself', !tip.open);
}

/* ---------- 5. one bubble at a time ---------- */
{
  const { w, tip, trigger } = scene();
  const tip2 = w.el({ id: 'tip-2', className: 'tooltip-popover', popover: 'hint' });
  const trigger2 = w.el({ describedby: 'tip-2' });
  w.fire('focusin', { target: trigger });
  w.fire('focusin', { target: trigger2 });
  check('opening a second bubble closes the first', !tip.open && tip2.open);
}

/* ---------- 6. touch ---------- */
{
  const { w, tip, trigger, outside } = scene();
  w.fire('pointerover', { target: trigger, pointerType: 'touch' });
  check('touch: opens at once', tip.open);
  w.fire('pointerout', { target: trigger, relatedTarget: null, pointerType: 'touch' });
  w.advance(500);
  check('touch: lifting the finger does not close it', tip.open);
  w.fire('pointerdown', { target: outside });
  check('touch: a tap elsewhere closes it', !tip.open);
}

/* ---------- 7. which element is the bubble ---------- */
{
  const w = makeWorld();
  w.el({ id: 'hint-text', className: 'form-text' });
  const tip = w.el({ id: 'tip-x', className: 'tooltip-popover', popover: 'hint' });
  const trigger = w.el({ describedby: 'hint-text tip-x' });
  w.fire('focusin', { target: trigger });
  check('aria-describedby with several ids: the .tooltip-popover one opens', tip.open);

  const plain = w.el({ id: 'plain', className: 'form-text' });
  const other = w.el({ describedby: 'plain' });
  let threw = false;
  try {
    w.fire('focusin', { target: other });
  } catch (e) {
    threw = true;
  }
  check('a trigger describing an ordinary element is ignored', !threw && !plain.open && tip.open);
}

/* ---------- 8. no anchor positioning: placed by hand, closed on scroll ---------- */
{
  const { w, tip, trigger } = scene({ anchor: false });
  tip.rect = { width: 200, height: 40 };
  w.fire('focusin', { target: trigger });
  check('no anchor: no anchor-name is set', !('anchor-name' in trigger.props));
  check(
    'no anchor: inline top/left from the placement, margin reset',
    tip.style.top === '252px' && tip.style.left === '350px' && tip.style.margin === '0',
    `${tip.style.top} ${tip.style.left} ${tip.style.margin}`
  );
  w.fireWindow('scroll');
  check('no anchor: scrolling closes the bubble', !tip.open);
}
{
  const { w, tip, trigger } = scene();
  w.fire('focusin', { target: trigger });
  w.fireWindow('scroll');
  check('with anchor positioning the bubble follows, scrolling does not close it', tip.open);
}

/* ---------- 9. author anchors are respected ---------- */
{
  const { w, tip, trigger } = scene();
  trigger.authored['anchor-name'] = '--my-anchor';
  w.fire('focusin', { target: trigger });
  check(
    'an authored anchor-name is reused, not overwritten',
    !('anchor-name' in trigger.props) && tip.props['position-anchor'] === '--my-anchor',
    tip.props['position-anchor']
  );
}

/* ---------- 10. closed by the browser, state stays in step ---------- */
{
  const { w, tip, trigger } = scene();
  w.fire('focusin', { target: trigger });
  tip.open = false; // light dismiss of a "hint"
  w.fire('toggle', { target: tip, newState: 'closed' });
  let threw = false;
  try {
    w.fire('focusin', { target: trigger });
  } catch (e) {
    threw = true;
  }
  check('after a native close the same trigger opens it again', !threw && tip.open);
}

/* ---------- 11. API ---------- */
{
  const { w, tip, trigger } = scene();
  w.api.show(trigger);
  check('MoliqueTooltipPopover.show(trigger) opens its bubble', tip.open);
  w.api.hide();
  check('MoliqueTooltipPopover.hide() closes it', !tip.open);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
