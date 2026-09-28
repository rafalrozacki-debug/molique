/**
 * molique - modal safety net
 *
 * WHY THIS EXISTS. A <dialog> opened with showModal() makes the rest of the
 * page inert. If the dialog itself then fails to paint, the user sees the
 * dimmed ::backdrop and nothing else: nothing to click, nothing to close,
 * the only way out is a reload. That exact symptom reached production three
 * times on iOS Safari, each time with a different diagnosis, each time
 * reported by a user rather than caught by a test. Fixing the known causes
 * (see _modal.scss) does not protect against the next unknown one - this
 * module does: after every opening it asks the device whether the window
 * actually has a size and is visible, and if not, adds .is-fallback, which
 * redraws the modal as a plain block (see "SAFETY NET" in _modal.scss).
 *
 * WHICH DIALOGS. Only .modal-dialog. The framework knows which dialogs are
 * its own, so it recognises them by class instead of guessing by content.
 * .onboarding-dialog and .tour-dialog are transparent overlays by design
 * (only their position: fixed children are visible) - a fallback that gave
 * them a box would cover the page. .lightbox-overlay paints its own
 * full-screen background, so "dimmed with nothing on it" cannot happen there.
 *
 * WHY A MUTATION OBSERVER on the `open` attribute, not a click listener and
 * not a patched HTMLDialogElement.prototype.showModal. Modals are opened
 * from many places, some of them inline onclick="" in markup - a listener
 * would miss those. A patched prototype catches every JS call, but NOT the
 * declarative path: <button command="show-modal" commandfor="..."> runs the
 * "show a modal dialog" algorithm directly and never touches the JS method.
 * Every path, JS or declarative, ends by setting the `open` attribute, so
 * observing that attribute is the one hook no opening can bypass. Whether
 * the dialog is modal is read from :modal, so show() (non-modal) is left
 * alone.
 *
 * WHY TWO MEASUREMENTS. The first runs in requestAnimationFrame - before the
 * first paint getBoundingClientRect() has nothing meaningful to report and
 * every dialog would look invisible. If that first look fails, it is NOT
 * yet a failure: an opening animation (a project's own @starting-style
 * with opacity: 0, a slower transition) can legitimately leave the dialog
 * transparent for a few frames. So the verdict waits for a second look,
 * GUARD_SECOND_LOOK_MS later - longer than the slowest opening transition
 * in the bundle (--transition-speed-slower, 0.4s) - and only then applies
 * the fallback.
 *
 * WHAT COUNTS AS "PAINTED". Width and height of at least GUARD_MIN_SIZE_PX,
 * a computed opacity above zero, visibility other than hidden. The question
 * is "did it paint at all", not "does it look right" - hence a threshold
 * and not "> 0". Note
 * for testing: a modal without a card or padding can be genuinely smaller
 * than the threshold and then rightly gets the fallback.
 */

const GUARD_SELECTOR = '.modal-dialog';
const GUARD_FALLBACK_CLASS = 'is-fallback';
const GUARD_MIN_SIZE_PX = 40;
const GUARD_SECOND_LOOK_MS = 450;

/* Per-dialog token of the current opening. A check scheduled for an
   opening that has since been closed (or closed and reopened) must not
   judge the new state. */
const modalGuardOpenings = new WeakMap();

function modalGuardIsPainted(dialog) {
  const rect = dialog.getBoundingClientRect();
  if (rect.width < GUARD_MIN_SIZE_PX || rect.height < GUARD_MIN_SIZE_PX) return false;
  const style = getComputedStyle(dialog);
  return style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
}

function modalGuardIsCurrent(dialog, token) {
  return modalGuardOpenings.get(dialog) === token && dialog.open && dialog.matches(':modal');
}

function modalGuardCheck(dialog) {
  if (!dialog.matches(':modal')) return;

  // A fresh opening starts from the normal layout - the fallback of a
  // previous opening must not become permanent.
  dialog.classList.remove(GUARD_FALLBACK_CLASS);

  const token = {};
  modalGuardOpenings.set(dialog, token);

  requestAnimationFrame(() => {
    if (!modalGuardIsCurrent(dialog, token) || modalGuardIsPainted(dialog)) return;

    setTimeout(() => {
      if (!modalGuardIsCurrent(dialog, token) || modalGuardIsPainted(dialog)) return;
      dialog.classList.add(GUARD_FALLBACK_CLASS);
    }, GUARD_SECOND_LOOK_MS);
  });
}

function modalGuardHandleMutations(records) {
  records.forEach((record) => {
    const dialog = record.target;
    if (record.oldValue === null && dialog.open && dialog.matches(GUARD_SELECTOR)) {
      modalGuardCheck(dialog);
    }
  });
}

function initModalGuard() {
  if (initModalGuard.bound) return;
  if (typeof MutationObserver !== 'function' || typeof HTMLDialogElement !== 'function') return;

  new MutationObserver(modalGuardHandleMutations).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
    attributeOldValue: true,
  });
  initModalGuard.bound = true;

  // The autoloader injects this module after DOMContentLoaded, so a modal
  // opened before that (a welcome notice shown on load) was never observed.
  document.querySelectorAll(GUARD_SELECTOR).forEach((dialog) => {
    if (dialog.open) modalGuardCheck(dialog);
  });
}

window.initModalGuard = initModalGuard;
