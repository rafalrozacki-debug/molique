/**
 * molique - smart positioning for the context menu (.popover-context)
 * Flips the menu above the button when there's no room below it (e.g. near the bottom of the screen).
 */

function initContextMenu() {
  const popovers = document.querySelectorAll('.popover-context');
  if (popovers.length === 0) return;

  const invokerMap = new Map();
  document.querySelectorAll('[popovertarget]').forEach(btn => {
    invokerMap.set(btn.getAttribute('popovertarget'), btn);
  });

  popovers.forEach(popover => {
    popover.addEventListener('toggle', (e) => {
      if (e.newState !== 'open') {
        popover.classList.remove('is-flipped');
        return;
      }

      const invoker = invokerMap.get(popover.id);
      if (!invoker) return;

      const anchorRect = invoker.getBoundingClientRect();
      const menuHeight = popover.offsetHeight;
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      popover.classList.toggle('is-flipped', spaceBelow < menuHeight && spaceAbove > spaceBelow);
    });
  });
}

window.initContextMenu = initContextMenu;
