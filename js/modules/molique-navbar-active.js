/**
 * molique - Navbar Active (highlights the current page based on the URL)
 *
 * The top navbar is shared across pages (one markup), so the active item
 * can't be marked statically in the HTML. This module reads the URL and
 * adds .is-active to the current page's link AND to the trigger of the
 * dropdown/mega-menu it lives inside.
 *
 * When a page is listed in several menus at once (e.g. in both the
 * "Examples" dropdown and the "Components" mega menu), every occurrence
 * gets highlighted.
 *
 * Zero dependencies. Auto-loaded by molique-script.js when .navbar-menu is present.
 */
function initNavbarActive() {
  const menu = document.querySelector('.navbar-menu');
  if (!menu) return;

  const here = normalizeNavPath(location.pathname);
  const links = menu.querySelectorAll(
    '.navbar-item[href], .dropdown-item[href], .mega-menu-link[href], .mega-menu-featured-link[href]'
  );

  links.forEach((link) => {
    const raw = link.getAttribute('href');
    // Skip anchors (#...) and full URLs with a protocol (http:, mailto:, tel:).
    if (!raw || raw.charAt(0) === '#' || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return;

    let linkPath;
    try {
      linkPath = normalizeNavPath(new URL(raw, location.href).pathname);
    } catch (e) {
      return;
    }
    if (linkPath !== here) return;

    link.classList.add('is-active');

    // The trigger of the dropdown/mega-menu the active link lives inside.
    const parent = link.closest('.dropdown, .mega-menu');
    if (parent) {
      const trigger = parent.querySelector(':scope > summary');
      if (trigger) trigger.classList.add('is-active');
    }
  });
}

/* Normalizes a path for comparison: no trailing slash; "" and
   "/index.html" => "/" (homepage). Named differently from admin-nav.js's
   normalizePath to avoid a global function collision on shared pages. */
function normalizeNavPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return '/';
  return p;
}

window.initNavbarActive = initNavbarActive;
