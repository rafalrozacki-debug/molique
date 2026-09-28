/**
 * molique - tooltip popover (.tooltip-popover)
 *
 * WHY THIS EXISTS. .tooltip-element is pure CSS, and that is exactly why a
 * table, a card or a modal body cuts it off: its bubble is a pseudo-element
 * inside the trigger. .tooltip-popover is a real element with the popover
 * attribute, so once shown it sits in the top layer, above every overflow.
 * The price is this module: a popover does not open on hover by itself.
 *
 * THE LINK IS aria-describedby. The trigger names the bubble in the
 * attribute a screen reader needs anyway, so there is no second attribute
 * to keep in sync - and a trigger without the a11y wiring simply opens
 * nothing. The attribute may hold several ids; the one pointing at a
 * .tooltip-popover wins.
 *
 * popover="hint" OR ITS FALLBACK. Where "hint" is supported, the bubble does
 * not close an open popover="auto" (a dropdown) when it appears. Where it is
 * not, the attribute's invalid-value default is "manual" - no light dismiss,
 * no Escape. Everything below therefore closes the bubble itself (pointer
 * leaving, focus leaving, Escape, a tap elsewhere) and never relies on the
 * browser to do it. Only one bubble is open at a time, in both cases.
 *
 * POSITION. Where CSS Anchor Positioning exists, the trigger gets an
 * explicit anchor-name and the bubble points its position-anchor at it (the
 * implicit anchor only comes from popovertarget, which would open the bubble
 * on click). A name the project set itself is respected. Without anchor
 * positioning the bubble is placed here, against the viewport: above,
 * flipped below when there is no room, clamped to the window edges - and
 * closed on scroll, since nothing would move it along.
 *
 * DELEGATED FROM document, so bubbles and triggers rendered later (AJAX
 * rows) work without re-initialisation.
 */

const TIP_SELECTOR = '.tooltip-popover';
const TIP_SHOW_DELAY_MS = 150; // hover only - focus and touch open at once
const TIP_HIDE_DELAY_MS = 120; // time to move the pointer onto the bubble (WCAG 1.4.13: hoverable)
const TIP_GAP_PX = 8; // same gap as the CSS margins
const TIP_EDGE_PX = 8; // minimum distance from the window edge
const TIP_ANCHOR_PREFIX = '--molique-tip-';

let tipAnchorCounter = 0;
let tipOpen = null; // { trigger, tip }
let tipShowTimer = 0;
let tipHideTimer = 0;

/* ---------- finding the pair ---------- */

function tooltipPopoverTipOf(trigger) {
  const ids = (trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.matches(TIP_SELECTOR)) return el;
  }
  return null;
}

/** The trigger/bubble pair an event target belongs to, or null. */
function tooltipPopoverPairFrom(target) {
  const trigger = target && target.closest ? target.closest('[aria-describedby]') : null;
  if (!trigger) return null;
  const tip = tooltipPopoverTipOf(trigger);
  return tip ? { trigger, tip } : null;
}

function tooltipPopoverInsideOpen(node) {
  return !!(tipOpen && node && (tipOpen.trigger.contains(node) || tipOpen.tip.contains(node)));
}

/* ---------- position ---------- */

function tooltipPopoverAnchorSupported() {
  return !!(window.CSS && CSS.supports && CSS.supports('anchor-name', '--molique-probe'));
}

function tooltipPopoverIsUnset(value) {
  const v = String(value || '').trim();
  return v === '' || v === 'auto' || v === 'normal' || v === 'none';
}

function tooltipPopoverAnchor(trigger, tip) {
  let name = trigger.dataset.moliqueAnchor;
  if (!name) {
    const authored = getComputedStyle(trigger).getPropertyValue('anchor-name');
    name = tooltipPopoverIsUnset(authored) ? TIP_ANCHOR_PREFIX + ++tipAnchorCounter : authored.trim();
    if (tooltipPopoverIsUnset(authored)) trigger.style.setProperty('anchor-name', name);
    trigger.dataset.moliqueAnchor = name;
  }
  const ours = tip.dataset.moliqueAnchorSet === '1';
  if (!ours && !tooltipPopoverIsUnset(getComputedStyle(tip).getPropertyValue('position-anchor'))) return;
  // Set on every opening: one bubble may be shared by several triggers.
  tip.style.setProperty('position-anchor', name);
  tip.dataset.moliqueAnchorSet = '1';
}

/**
 * Viewport placement for browsers without anchor positioning. Pure, so it is
 * testable: trigger rect, bubble size, viewport size, preferred side.
 */
function tooltipPopoverPlace(rect, size, view, preferBelow) {
  const above = rect.top - TIP_GAP_PX - size.height;
  const below = rect.bottom + TIP_GAP_PX;
  const fitsAbove = above >= TIP_EDGE_PX;
  const fitsBelow = below + size.height <= view.height - TIP_EDGE_PX;
  const useBelow = preferBelow ? fitsBelow || !fitsAbove : !fitsAbove && fitsBelow;

  const centred = rect.left + rect.width / 2 - size.width / 2;
  const maxLeft = Math.max(TIP_EDGE_PX, view.width - TIP_EDGE_PX - size.width);
  return {
    top: useBelow ? below : above,
    left: Math.min(Math.max(centred, TIP_EDGE_PX), maxLeft),
  };
}

function tooltipPopoverPlaceManually(trigger, tip) {
  const place = tooltipPopoverPlace(
    trigger.getBoundingClientRect(),
    tip.getBoundingClientRect(),
    { width: window.innerWidth, height: window.innerHeight },
    tip.classList.contains('tooltip-popover-bottom')
  );
  tip.style.margin = '0';
  tip.style.top = place.top + 'px';
  tip.style.left = place.left + 'px';
}

/* ---------- open / close ---------- */

function tooltipPopoverClearTimers() {
  clearTimeout(tipShowTimer);
  clearTimeout(tipHideTimer);
  tipShowTimer = 0;
  tipHideTimer = 0;
}

/* Closes the open bubble and nothing else. The delayed close of the
   previous trigger runs this - it must NOT cancel a pending open, or moving
   straight from one trigger to the next would show nothing. */
function tooltipPopoverClose() {
  clearTimeout(tipHideTimer);
  tipHideTimer = 0;
  if (!tipOpen) return;
  const { tip } = tipOpen;
  tipOpen = null;
  try {
    tip.hidePopover();
  } catch (e) {
    /* already closed, or removed from the DOM */
  }
}

/* Closes everything, pending open included: Escape, focus leaving, a tap
   elsewhere, the public hide(). */
function tooltipPopoverHide() {
  tooltipPopoverClearTimers();
  tooltipPopoverClose();
}

function tooltipPopoverShow(trigger, tip) {
  tooltipPopoverClearTimers();
  if (tipOpen && tipOpen.trigger === trigger && tipOpen.tip === tip) return;
  tooltipPopoverClose();

  const anchored = tooltipPopoverAnchorSupported();
  if (anchored) tooltipPopoverAnchor(trigger, tip);
  try {
    tip.showPopover();
  } catch (e) {
    return; // not connected, or not a popover
  }
  tipOpen = { trigger, tip };
  if (!anchored) tooltipPopoverPlaceManually(trigger, tip);
}

function tooltipPopoverScheduleHide() {
  clearTimeout(tipShowTimer);
  tipShowTimer = 0;
  clearTimeout(tipHideTimer);
  tipHideTimer = setTimeout(tooltipPopoverClose, TIP_HIDE_DELAY_MS);
}

/* ---------- events ---------- */

function tooltipPopoverOnPointerOver(event) {
  // Back on the open trigger, or onto its bubble: keep it, show nothing new.
  if (tooltipPopoverInsideOpen(event.target)) {
    clearTimeout(tipHideTimer);
    tipHideTimer = 0;
    return;
  }
  const pair = tooltipPopoverPairFrom(event.target);
  if (!pair) return;
  if (event.pointerType === 'touch') {
    tooltipPopoverShow(pair.trigger, pair.tip);
    return;
  }
  clearTimeout(tipShowTimer);
  tipShowTimer = setTimeout(() => tooltipPopoverShow(pair.trigger, pair.tip), TIP_SHOW_DELAY_MS);
}

function tooltipPopoverOnPointerOut(event) {
  // A lifted finger always "leaves" - touch closes on a tap elsewhere instead.
  if (event.pointerType === 'touch') return;
  const pair = tooltipPopoverPairFrom(event.target);
  const fromOpen = tooltipPopoverInsideOpen(event.target);
  if (!pair && !fromOpen) return;
  if (tooltipPopoverInsideOpen(event.relatedTarget)) return;
  if (pair && pair.trigger.contains(event.relatedTarget)) return;
  tooltipPopoverScheduleHide();
}

function tooltipPopoverOnFocusIn(event) {
  const pair = tooltipPopoverPairFrom(event.target);
  if (!pair) return;
  let visible = true;
  try {
    visible = pair.trigger.matches(':focus-visible');
  } catch (e) {
    /* :focus-visible unsupported - treat every focus as keyboard focus */
  }
  if (visible) tooltipPopoverShow(pair.trigger, pair.tip);
}

function tooltipPopoverOnFocusOut(event) {
  if (!tipOpen || !tipOpen.trigger.contains(event.target)) return;
  if (tooltipPopoverInsideOpen(event.relatedTarget)) return;
  tooltipPopoverHide();
}

function tooltipPopoverOnKeyDown(event) {
  if (event.key === 'Escape' && tipOpen) tooltipPopoverHide();
}

function tooltipPopoverOnPointerDown(event) {
  if (tipOpen && !tooltipPopoverInsideOpen(event.target)) tooltipPopoverHide();
}

function tooltipPopoverOnViewportChange() {
  if (tipOpen && !tooltipPopoverAnchorSupported()) tooltipPopoverHide();
}

/* The browser may close a "hint" by itself (light dismiss, Escape, another
   hint opening) - keep our record in step. `toggle` does not bubble, hence
   the capture listener. */
function tooltipPopoverOnToggle(event) {
  if (tipOpen && event.target === tipOpen.tip && event.newState === 'closed') {
    tooltipPopoverClearTimers();
    tipOpen = null;
  }
}

function initTooltipPopover() {
  if (initTooltipPopover.bound) return;
  if (typeof HTMLElement !== 'function' || typeof HTMLElement.prototype.showPopover !== 'function') return;

  document.addEventListener('pointerover', tooltipPopoverOnPointerOver);
  document.addEventListener('pointerout', tooltipPopoverOnPointerOut);
  document.addEventListener('pointerdown', tooltipPopoverOnPointerDown, true);
  document.addEventListener('focusin', tooltipPopoverOnFocusIn);
  document.addEventListener('focusout', tooltipPopoverOnFocusOut);
  document.addEventListener('keydown', tooltipPopoverOnKeyDown);
  document.addEventListener('toggle', tooltipPopoverOnToggle, true);
  window.addEventListener('scroll', tooltipPopoverOnViewportChange, true);
  window.addEventListener('resize', tooltipPopoverOnViewportChange);
  initTooltipPopover.bound = true;
}

window.initTooltipPopover = initTooltipPopover;

/**
 * Opening from code, e.g. to point at a field after a failed save:
 * MoliqueTooltipPopover.show(trigger) - the bubble named in its aria-describedby
 * MoliqueTooltipPopover.hide()
 */
window.MoliqueTooltipPopover = {
  show(trigger) {
    const tip = trigger ? tooltipPopoverTipOf(trigger) : null;
    if (tip) tooltipPopoverShow(trigger, tip);
  },
  hide: tooltipPopoverHide,
};
