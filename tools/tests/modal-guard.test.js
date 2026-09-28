/**
 * molique - tests for the modal safety net
 *
 * Run with:  npm run test:modal-guard
 *
 * The guard exists because a modal that fails to paint leaves an inert page
 * behind a dimmed backdrop, with nothing to click or close. The real failure
 * only reproduces on real iOS Safari, so a browser test on a dev machine
 * passes on broken code too. These checks therefore drive the decision
 * logic directly: the SHIPPED module runs in a vm against a hand-rolled mini
 * DOM (there is no jsdom here), with a fake clock for requestAnimationFrame
 * and setTimeout, and each dialog reports whatever size and opacity the test
 * dictates for the first and the second look.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE = path.join(ROOT, 'js', 'modules', 'molique-modal-guard.js');

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

const VISIBLE = { width: 600, height: 300, opacity: '1', visibility: 'visible' };
const TRANSPARENT = { ...VISIBLE, opacity: '0' };
const COLLAPSED = { ...VISIBLE, height: 0 };

/* ---------- mini DOM ---------- */
class Dialog {
  constructor(className, world) {
    this.world = world;
    this._class = new Set(className.split(/\s+/).filter(Boolean));
    this.open = false;
    this.modal = false;
    // What the device "paints" at the first look (rAF) and the second (timeout).
    this.paint = [VISIBLE, VISIBLE];
    this.looks = 0;
    this.classList = {
      add: (c) => this._class.add(c),
      remove: (c) => this._class.delete(c),
      contains: (c) => this._class.has(c),
    };
  }
  matches(selector) {
    if (selector === ':modal') return this.open && this.modal;
    const cls = selector.match(/^\.([\w-]+)$/);
    return !!cls && this._class.has(cls[1]);
  }
  current() {
    return this.paint[Math.min(this.looks, this.paint.length - 1)];
  }
  getBoundingClientRect() {
    const p = this.current();
    this.looks++;
    return { width: p.width, height: p.height };
  }
  /* The browser sets the `open` attribute on both paths - JS showModal()
     and the declarative command="show-modal" - so both are one mutation. */
  showModal() {
    const old = this.open ? '' : null;
    this.open = true;
    this.modal = true;
    this.world.mutate(this, old);
  }
  show() {
    const old = this.open ? '' : null;
    this.open = true;
    this.modal = false;
    this.world.mutate(this, old);
  }
  close() {
    this.open = false;
    this.modal = false;
    this.world.mutate(this, '');
  }
}

function makeWorld() {
  const dialogs = [];
  const frames = [];
  const timers = [];
  let observer = null;
  let observeOptions = null;

  const world = {
    mutate(target, oldValue) {
      // MutationObserver callbacks are async; the queue is flushed by tick().
      world.pending.push({ target, oldValue, attributeName: 'open' });
    },
    pending: [],
    tick() {
      if (world.pending.length && observer) {
        const records = world.pending.splice(0);
        observer(records);
      }
    },
    frame() {
      world.tick();
      frames.splice(0).forEach((fn) => fn());
    },
    wait(ms) {
      world.tick();
      timers.filter((t) => t.ms <= ms).forEach((t) => {
        timers.splice(timers.indexOf(t), 1);
        t.fn();
      });
    },
    dialog(className, paint) {
      const d = new Dialog(className, world);
      if (paint) d.paint = paint;
      dialogs.push(d);
      return d;
    },
    get observeOptions() {
      return observeOptions;
    },
  };

  const sandbox = {
    window: {},
    document: {
      documentElement: {},
      querySelectorAll: (sel) => dialogs.filter((d) => d.matches(sel)),
    },
    HTMLDialogElement: function HTMLDialogElement() {},
    MutationObserver: function (fn) {
      observer = fn;
      this.observe = (_target, opts) => {
        observeOptions = opts;
      };
    },
    requestAnimationFrame: (fn) => frames.push(fn),
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
    getComputedStyle: (d) => {
      const p = d.current();
      return { opacity: p.opacity, visibility: p.visibility };
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(MODULE, 'utf8'), sandbox);
  world.init = () => sandbox.window.initModalGuard();
  return world;
}

const fallback = (d) => d.classList.contains('is-fallback');

/* ---------- 1. a healthy modal is left alone ---------- */
{
  const w = makeWorld();
  w.init();
  const d = w.dialog('modal-dialog');
  d.showModal();
  w.frame();
  w.wait(1000);
  check('healthy modal gets no fallback', !fallback(d));
}

/* ---------- 2. never painted -> fallback after the second look ---------- */
for (const [label, paint] of [['transparent', TRANSPARENT], ['zero-height', COLLAPSED], ['visibility: hidden', { ...VISIBLE, visibility: 'hidden' }]]) {
  const w = makeWorld();
  w.init();
  const d = w.dialog('modal-dialog', [paint, paint]);
  d.showModal();
  w.frame();
  check(`${label}: no verdict at the first frame`, !fallback(d));
  w.wait(1000);
  check(`${label}: fallback after the second look`, fallback(d));
}

/* ---------- 3. the molique trap: transparent first frame, visible later ---------- */
{
  const w = makeWorld();
  w.init();
  const d = w.dialog('modal-dialog', [TRANSPARENT, VISIBLE]);
  d.showModal();
  w.frame();
  w.wait(1000);
  check('an opening animation (transparent first frame) is NOT a failure', !fallback(d));
}

/* ---------- 4. the threshold is 40px, not "> 0" ---------- */
{
  const w = makeWorld();
  w.init();
  const tiny = { ...VISIBLE, height: 12 };
  const d = w.dialog('modal-dialog', [tiny, tiny]);
  d.showModal();
  w.frame();
  w.wait(1000);
  check('a 12px sliver counts as not painted', fallback(d));
}

/* ---------- 5. only .modal-dialog, only modal ---------- */
{
  const w = makeWorld();
  w.init();
  const overlays = ['onboarding-dialog', 'tour-dialog', 'lightbox-overlay', 'my-own-dialog'].map((c) =>
    w.dialog(c, [TRANSPARENT, TRANSPARENT])
  );
  overlays.forEach((d) => d.showModal());
  const nonModal = w.dialog('modal-dialog', [TRANSPARENT, TRANSPARENT]);
  nonModal.show();
  w.frame();
  w.wait(1000);
  check('transparent-by-design overlays are never touched', overlays.every((d) => !fallback(d)));
  check('show() (non-modal) is not guarded', !fallback(nonModal));
}

/* ---------- 6. closed before the verdict -> no verdict ---------- */
{
  const w = makeWorld();
  w.init();
  const d = w.dialog('modal-dialog', [TRANSPARENT, TRANSPARENT]);
  d.showModal();
  w.frame();
  d.close();
  w.wait(1000);
  check('a check scheduled for a closed opening does nothing', !fallback(d));
}

/* ---------- 7. the class resets on the next opening ---------- */
{
  const w = makeWorld();
  w.init();
  const d = w.dialog('modal-dialog', [TRANSPARENT, TRANSPARENT]);
  d.showModal();
  w.frame();
  w.wait(1000);
  const first = fallback(d);
  d.close();
  w.tick();
  d.paint = [VISIBLE, VISIBLE];
  d.looks = 0;
  d.showModal();
  w.tick();
  check('fallback of a previous opening is removed on the next one', first && !fallback(d));
}

/* ---------- 8. a modal already open when the module loads ---------- */
{
  const w = makeWorld();
  const d = w.dialog('modal-dialog', [TRANSPARENT, TRANSPARENT]);
  d.open = true;
  d.modal = true;
  w.init();
  w.frame();
  w.wait(1000);
  check('a modal opened before the module loaded is still checked', fallback(d));
}

/* ---------- 9. observes the attribute, init is idempotent ---------- */
{
  const w = makeWorld();
  w.init();
  w.init();
  const o = w.observeOptions;
  check(
    'observes the `open` attribute on the whole document, with old values',
    o && o.subtree && o.attributes && o.attributeOldValue && o.attributeFilter.join() === 'open'
  );
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
