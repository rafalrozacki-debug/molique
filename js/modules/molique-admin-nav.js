/**
 * molique - Admin Nav (submenu active state + mobile drill-down)
 *
 * A bit of vanilla JS around the native <details class="admin-nav-submenu">:
 *  - detects the active item from the URL and highlights it and its
 *    branch with the .is-active class (no need for an [open] attribute in the markup),
 *  - on mobile, doesn't let the active branch auto-expand the drill-down
 *    on load (this was the main annoyance: landing on a page meant an
 *    already-open panel),
 *  - animated close (slide down): the native <details> hides its content
 *    instantly, so we delay removing [open] until the CSS animation finishes,
 *  - mutual exclusion: opening one submenu closes the others,
 *  - Esc closes an open drill-down, as does a breakpoint change.
 *
 * Opening and the slide-in are handled by the native <details> + CSS. Zero dependencies.
 */
function initAdminNav() {
  const submenus = Array.from(document.querySelectorAll('.admin-nav-submenu'));
  if (!submenus.length) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const here = normalizePath(location.pathname);

  // Animated close: plays the slide-out (.is-closing), removes [open]
  // once it finishes. Closes instantly on desktop and under reduced-motion.
  const closeAnimated = (details) => {
    if (!details.open) return;
    if (!mobile.matches || reduceMotion.matches) {
      details.open = false;
      return;
    }
    if (details.classList.contains('is-closing')) return;

    const panel = details.querySelector(':scope > .admin-nav-submenu-list');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      // [open]=false first (native hide), only then remove .is-closing -
      // otherwise the slide-in animation would flash in between.
      details.open = false;
      details.classList.remove('is-closing');
    };

    details.classList.add('is-closing');
    if (panel) {
      panel.addEventListener('animationend', finish, { once: true });
      // A safety net in case animationend never fires (e.g. a panel with no animation).
      setTimeout(finish, 400);
    } else {
      finish();
    }
  };

  submenus.forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    const list = details.querySelector(':scope > .admin-nav-submenu-list');
    if (!summary || !list) return;

    // 1. Active state from the URL - highlight the active link and its branch.
    let hasActive = false;
    list.querySelectorAll('.admin-nav-submenu-link').forEach((link) => {
      const raw = link.getAttribute('href');
      if (!raw || raw.charAt(0) === '#') return;

      let linkPath;
      try {
        linkPath = normalizePath(new URL(raw, location.href).pathname);
      } catch (e) {
        return;
      }

      if (linkPath === here) {
        link.classList.add('is-active');
        hasActive = true;
      }
    });
    if (hasActive) {
      summary.classList.add('is-active');
      // On desktop (the tree view) the branch containing the current page
      // should expand itself - without this the user would land on the
      // page with no indication of where it sits in the menu. Step 2
      // below closes this right away on mobile (drill-down) anyway, so
      // there's no need for a viewport check here.
      details.open = true;
    }

    // 2. On mobile, don't auto-expand the drill-down on load. If the
    //    markup renders <details open> for the active branch, we keep the
    //    indication via .is-active, but close the panel (no animation -
    //    this is the starting state).
    if (mobile.matches && details.open) {
      summary.classList.add('is-active');
      details.open = false;
    }

    // 3. Closing via the "Back" bar: we take over the native toggle so we
    //    can play the slide-out. Opening is left to the native <details> (CSS slide-in).
    summary.addEventListener('click', (e) => {
      if (mobile.matches && details.open && !details.classList.contains('is-closing')) {
        e.preventDefault();
        closeAnimated(details);
      }
    });

    // 4. Mutual exclusion (mobile only) - opening one closes the others
    //    (instantly; we don't animate the "other" panel).
    details.addEventListener('toggle', () => {
      if (!details.open || !mobile.matches) return;
      submenus.forEach((other) => {
        if (other !== details && other.open) other.open = false;
      });
    });
  });

  // 5. Esc closes an open drill-down (with the slide-out animation).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    submenus.forEach((details) => {
      if (details.open) closeAnimated(details);
    });
  });

  // 6. Breakpoint change - close any open panel instantly, so we don't
  //    leave a dangling drill-down panel on screen rotation / width change.
  const closeAll = () => submenus.forEach((details) => {
    details.classList.remove('is-closing');
    details.open = false;
  });
  if (mobile.addEventListener) {
    mobile.addEventListener('change', closeAll);
  } else if (mobile.addListener) {
    mobile.addListener(closeAll); // older Safari
  }
}

/* Normalizes a path for comparison: no trailing slash, empty => "/". */
function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

window.initAdminNav = initAdminNav;
