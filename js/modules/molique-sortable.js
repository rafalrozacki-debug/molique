/**
 * molique - Sortable List (drag via Pointer Events + up/down buttons)
 *
 * Two equal, parallel ways to reorder - not drag with buttons as a
 * fallback afterthought: dragging the handle, and clicking/pressing
 * Enter on the up/down buttons (the only path for keyboard and
 * screen-reader users, and for input devices that can't drag precisely).
 * Both funnel through the same moveItem(), so DOM update, the
 * aria-live announcement, and the "sortable:update" event are identical
 * regardless of which path triggered the move.
 *
 * Deliberately built on Pointer Events, not the native HTML5 Drag and
 * Drop API: draggable="true"/dragstart/dragover has no real touch
 * support (notably iOS Safari), which rules it out for an admin
 * component that has to work on a tablet. Pointer Events unify mouse/
 * touch/pen in one API and let the dragged item track the pointer via
 * transform (GPU-only, per project convention).
 *
 * Sibling reflow while dragging uses the FLIP technique: the DOM move
 * happens immediately (so drop-position logic always reads live layout),
 * then displaced siblings are snapped to their PREVIOUS visual position
 * with transitions disabled and immediately released back to their
 * natural position with transitions enabled - the CSS transition on
 * .sortable-item's own `transform` (see _sortable-list.scss) does the
 * animating, not JS.
 *
 * Usage:
 *  Declarative: <ul data-sortable> with .sortable-item children, each
 *  optionally carrying data-sortable-id (used in the emitted order) and
 *  a .sortable-handle + [data-sortable-up]/[data-sortable-down] buttons.
 *  Every [data-sortable] element present at module-load time is wired up
 *  automatically.
 *
 *  Imperative: window.MoliqueSortable.init(containerOrSelector) - for
 *  markup added after the page loaded (AJAX-inserted lists). Safe to
 *  call twice on the same container; the second call is a no-op.
 *
 *  Listen for changes: container.addEventListener('sortable:update', (e) => {
 *    e.detail.order  // data-sortable-id values (null where absent)
 *    e.detail.items  // the .sortable-item elements, in the new order
 *  }) - molique has no backend of its own (like the carousel/lightbox),
 *  so persisting the new order is left entirely to the consuming app.
 */
// .split('-')[0]: document.documentElement.lang isn't always a bare
// 2-letter code - WordPress (and BCP 47 generally) often renders the
// full tag with a region, e.g. "pl-PL" - an un-split lookup against
// SORTABLE_STRINGS.pl would silently miss and fall back to English (the
// aria-live announcement after a reorder is where this actually showed up).
const SORTABLE_LANG = document.documentElement.lang.split('-')[0];
const SORTABLE_STRINGS = {
  pl: {
    moved: (pos, total) => `Element przeniesiony na pozycję ${pos} z ${total}.`,
  },
  de: {
    moved: (pos, total) => `Element auf Position ${pos} von ${total} verschoben.`,
  },
  en: {
    moved: (pos, total) => `Item moved to position ${pos} of ${total}.`,
  },
};
const sortableT = (key) => (SORTABLE_STRINGS[SORTABLE_LANG] || SORTABLE_STRINGS.en)[key];

/* Adapted from the classic "getDragAfterElement" reorder algorithm:
   given the pointer's current Y, finds the item whose vertical midpoint
   the pointer has just crossed - the dragged item should land BEFORE
   that element (null = it belongs at the very end). Comparing against
   every other item (not just immediate neighbors) means a fast drag that
   skips several rows in one pointermove still lands in the right spot. */
function findItemAfter(candidates, dragged, pointerY) {
  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
  for (const el of candidates) {
    if (el === dragged) continue;
    const box = el.getBoundingClientRect();
    const offset = pointerY - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: el };
    }
  }
  return closest.element;
}

function initSortable(containerOrSelector) {
  const container =
    typeof containerOrSelector === 'string' ? document.querySelector(containerOrSelector) : containerOrSelector;
  if (!container || container.dataset.sortableInit) return;
  container.dataset.sortableInit = '1';

  const announcer = document.createElement('div');
  announcer.className = 'sortable-announcer';
  announcer.setAttribute('aria-live', 'polite');
  container.insertAdjacentElement('afterend', announcer);

  const items = () => Array.from(container.children).filter((el) => el.classList.contains('sortable-item'));

  function updateButtonStates() {
    const list = items();
    list.forEach((item, index) => {
      const up = item.querySelector('[data-sortable-up]');
      const down = item.querySelector('[data-sortable-down]');
      if (up) up.disabled = index === 0;
      if (down) down.disabled = index === list.length - 1;
    });
  }

  function announceMove(item) {
    const list = items();
    const position = list.indexOf(item) + 1;
    announcer.textContent = sortableT('moved')(position, list.length);
  }

  function emitUpdate() {
    const list = items();
    container.dispatchEvent(
      new CustomEvent('sortable:update', {
        bubbles: true,
        detail: {
          order: list.map((item) => item.dataset.sortableId || null),
          items: list,
        },
      })
    );
  }

  /* Snaps `el` to the visual position described by `firstRect`, then
     releases it back to its natural (post-DOM-move) position with the
     stylesheet's own transition - the FLIP technique's "invert" +
     "play" steps. */
  function flipFrom(el, firstRect) {
    const lastRect = el.getBoundingClientRect();
    const deltaY = firstRect.top - lastRect.top;
    if (!deltaY) return;
    el.style.transition = 'none';
    el.style.transform = `translateY(${deltaY}px)`;
    void el.offsetHeight; // eslint-disable-line no-unused-expressions -- forces the browser to apply the jump above before the transition is re-enabled, or it would animate FROM the natural position instead of TO it.
    el.style.transition = '';
    el.style.transform = '';
  }

  function moveItem(item, direction) {
    const list = items();
    const index = list.indexOf(item);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const firstRects = new Map();
    list.forEach((el) => {
      if (el !== item) firstRects.set(el, el.getBoundingClientRect());
    });

    const sibling = list[targetIndex];
    if (direction < 0) container.insertBefore(item, sibling);
    else container.insertBefore(item, sibling.nextSibling);

    firstRects.forEach((rect, el) => flipFrom(el, rect));

    updateButtonStates();
    announceMove(item);
    emitUpdate();
  }

  /* --- Up/down buttons --- */
  container.addEventListener('click', (e) => {
    const upBtn = e.target.closest('[data-sortable-up]');
    const downBtn = e.target.closest('[data-sortable-down]');
    if (!upBtn && !downBtn) return;
    const item = (upBtn || downBtn).closest('.sortable-item');
    if (!item) return;
    moveItem(item, upBtn ? -1 : 1);
  });

  /* --- Keyboard on the handle itself (in addition to the buttons) --- */
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const handle = e.target.closest('.sortable-handle');
    if (!handle) return;
    const item = handle.closest('.sortable-item');
    if (!item) return;
    e.preventDefault();
    moveItem(item, e.key === 'ArrowUp' ? -1 : 1);
    handle.focus();
  });

  /* --- Drag (Pointer Events) --- */
  let drag = null;

  container.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const handle = e.target.closest('.sortable-handle');
    if (!handle) return;
    const item = handle.closest('.sortable-item');
    if (!item) return;

    handle.setPointerCapture(e.pointerId);
    const itemRect = item.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      item,
      // Where within the item (vertically) the pointer grabbed it - kept
      // constant for the whole drag so that exact point stays glued to
      // the pointer, regardless of where in the DOM the item ends up.
      grabOffsetY: e.clientY - itemRect.top,
      translateY: 0,
      originalOrder: items(),
    };
    item.classList.add('is-dragging');
    // A fast drag can otherwise select nearby text on the page (the
    // browser's default text-selection gesture doesn't know a drag is
    // in progress) - restored in endDrag()/the Escape handler below.
    document.body.style.userSelect = 'none';
  });

  container.addEventListener(
    'pointermove',
    (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;

      const list = items();
      const firstRects = new Map();
      list.forEach((el) => {
        if (el !== drag.item) firstRects.set(el, el.getBoundingClientRect());
      });

      const afterElement = findItemAfter(list, drag.item, e.clientY);
      const currentNext = drag.item.nextElementSibling;
      if (afterElement !== drag.item && afterElement !== currentNext) {
        if (afterElement == null) container.appendChild(drag.item);
        else container.insertBefore(drag.item, afterElement);
        firstRects.forEach((rect, el) => flipFrom(el, rect));
      }

      // Recomputed FRESH every move, from the item's CURRENT natural
      // (untransformed) position - never accumulated. Accumulating
      // e.movementY drifted further away from the cursor on every swap
      // above: insertBefore/appendChild change the item's natural
      // position in the flow, but an accumulator has no way to know
      // that happened, so the old transform kept adding on top of an
      // already-shifted layout instead of being re-based on it.
      const prevTransform = drag.item.style.transform;
      drag.item.style.transform = 'none';
      const naturalTop = drag.item.getBoundingClientRect().top;
      drag.item.style.transform = prevTransform;
      drag.translateY = e.clientY - drag.grabOffsetY - naturalTop;
      drag.item.style.transform = `translateY(${drag.translateY}px)`;
    },
    { passive: true }
  );

  function endDrag() {
    if (!drag) return;
    const item = drag.item;
    item.style.transition = 'none';
    item.style.transform = `translateY(${drag.translateY}px)`;
    void item.offsetHeight; // eslint-disable-line no-unused-expressions
    item.classList.remove('is-dragging');
    item.style.transition = '';
    item.style.transform = '';
    document.body.style.userSelect = '';
    drag = null;
    updateButtonStates();
    announceMove(item);
    emitUpdate();
  }

  container.addEventListener('pointerup', (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    endDrag();
  });
  container.addEventListener('pointercancel', (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    endDrag();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !drag) return;
    e.preventDefault();
    const item = drag.item;
    drag.originalOrder.forEach((el) => container.appendChild(el));
    item.style.transition = 'none';
    item.style.transform = '';
    item.classList.remove('is-dragging');
    void item.offsetHeight; // eslint-disable-line no-unused-expressions
    item.style.transition = '';
    document.body.style.userSelect = '';
    drag = null;
    updateButtonStates();
  });

  updateButtonStates();
}

window.MoliqueSortable = { init: initSortable };

document.querySelectorAll('[data-sortable]').forEach((container) => initSortable(container));
