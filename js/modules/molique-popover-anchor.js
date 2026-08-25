/**
 * molique - explicit anchors for popover menus
 *
 * WHY THIS EXISTS. Four components position themselves against the button
 * that opens them, using the IMPLICIT anchor a browser creates between a
 * [popovertarget] button and its popover: .dropdown-menu[popover],
 * .popover-context, .select-search-menu, .custom-select-dropdown.
 *
 * That implicit anchor is Chrome/Edge 133+. CSS Anchor Positioning itself is
 * older (Chrome 125), and the two are separate features - so in the
 * Chrome/Edge 125-132 band anchor() parses fine, the
 * `@supports not (top: anchor(bottom))` fallback does NOT fire, and there is
 * no anchor to resolve against: the menus open in the wrong place. No CSS
 * feature query can tell those two apart, which is why this has to be done
 * in JS.
 *
 * WHAT IT DOES. Gives the trigger an explicit `anchor-name` and points the
 * menu's `position-anchor` at it. That is the same thing .mega-menu does in
 * pure CSS - it can afford to, because it has a wrapper to scope a single
 * shared name to. The popover variants deliberately have no wrapper ("any
 * button, two attributes"), and CSS cannot generate a unique name per pair,
 * so a pair-by-pair assignment is the only way.
 *
 * Harmless where the implicit anchor already works: an explicit anchor
 * resolves to the same element.
 *
 * SET ON CLICK, NOT AT LOAD. The listener is delegated from document, so
 * menus added to the DOM later (an AJAX table, a rendered row) need no
 * re-initialisation - and a menu shared by SEVERAL triggers anchors to the
 * one actually used, which a static assignment could not do.
 */

/* Menus that rely on the implicit anchor. .mega-menu and .tour-tooltip are
   deliberately absent: the first has an explicit anchor-name in CSS, the
   second gets one from molique-tour.js. */
const POPOVER_ANCHOR_TARGETS =
  '.dropdown-menu, .popover-context, .select-search-menu, .custom-select-dropdown';

const POPOVER_ANCHOR_PREFIX = '--molique-anchor-';
let popoverAnchorCounter = 0;

/** A value that means "no author-chosen anchor", so we may set our own. */
function popoverAnchorIsUnset(value) {
  const v = String(value || '').trim();
  return v === '' || v === 'auto' || v === 'normal' || v === 'none';
}

/**
 * Ensures the trigger carries an anchor-name and returns it.
 * A name the project set itself is respected and reused, never overwritten.
 */
function popoverAnchorNameFor(trigger) {
  const existing = trigger.dataset.moliqueAnchor;
  if (existing) return existing;

  const authored = getComputedStyle(trigger).getPropertyValue('anchor-name');
  if (!popoverAnchorIsUnset(authored)) {
    trigger.dataset.moliqueAnchor = authored.trim();
    return trigger.dataset.moliqueAnchor;
  }

  const name = POPOVER_ANCHOR_PREFIX + ++popoverAnchorCounter;
  trigger.style.setProperty('anchor-name', name);
  trigger.dataset.moliqueAnchor = name;
  return name;
}

/** Links one trigger/menu pair, unless the project anchored the menu itself. */
function popoverAnchorLink(trigger, menu) {
  const authored = getComputedStyle(menu).getPropertyValue('position-anchor');
  const ours = menu.dataset.moliqueAnchorSet === '1';
  if (!ours && !popoverAnchorIsUnset(authored)) return;

  menu.style.setProperty('position-anchor', popoverAnchorNameFor(trigger));
  menu.dataset.moliqueAnchorSet = '1';
}

function popoverAnchorHandleActivation(event) {
  const trigger = event.target.closest && event.target.closest('[popovertarget]');
  if (!trigger) return;

  const menu = document.getElementById(trigger.getAttribute('popovertarget'));
  if (!menu || !menu.matches(POPOVER_ANCHOR_TARGETS)) return;

  popoverAnchorLink(trigger, menu);
}

function initPopoverAnchor() {
  // Nothing to do where anchor positioning is unsupported: there the CSS
  // `@supports not (top: anchor(bottom))` fallback opens the menu as a
  // centred panel, which works on its own.
  if (!window.CSS || !CSS.supports || !CSS.supports('anchor-name', '--molique-probe')) return;

  if (initPopoverAnchor.bound) return;
  // Capture phase: this must run before the popover's own activation
  // behaviour shows it, so the first paint is already anchored.
  document.addEventListener('click', popoverAnchorHandleActivation, true);
  initPopoverAnchor.bound = true;
}

window.initPopoverAnchor = initPopoverAnchor;

/**
 * Eager linking, for the rare case where a menu is opened from code
 * (showPopover()) instead of by clicking its trigger.
 * MoliquePopoverAnchor.apply()          - the whole document
 * MoliquePopoverAnchor.apply(container) - one subtree
 */
window.MoliquePopoverAnchor = {
  apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[popovertarget]').forEach((trigger) => {
      const menu = document.getElementById(trigger.getAttribute('popovertarget'));
      if (menu && menu.matches(POPOVER_ANCHOR_TARGETS)) popoverAnchorLink(trigger, menu);
    });
  },
};
