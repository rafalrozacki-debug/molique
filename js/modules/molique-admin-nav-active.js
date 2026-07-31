/**
 * molique - Admin Nav Active (highlights the current page in the sidebar)
 *
 * The vertical-menu counterpart to molique-navbar-active.js for the admin
 * panel. The sidebar is often shared across pages (one partial), so the
 * active item can't be marked statically in the markup - this module
 * reads the URL and adds .is-active to the current page's links.
 *
 * Highlights EVERY occurrence of the address, since the same item
 * typically appears twice: in the condensed mobile bar
 * (.mobile-only-nav-item) and in the full list inside the "More" drawer.
 *
 * Division of responsibility: expandable branches
 * (<details class="admin-nav-submenu">) are handled by
 * molique-admin-nav.js (there, active state is coupled with the mobile
 * drill-down). This module only handles flat links.
 *
 * Zero dependencies. Auto-loaded by molique-script.js when .admin-nav is present.
 */
function initAdminNavActive() {
  const navs = document.querySelectorAll('.admin-nav');
  if (!navs.length) return;

  const here = normalizeAdminNavPath(location.pathname);

  navs.forEach((nav) => {
    nav.querySelectorAll('.admin-nav-link[href]').forEach((link) => {
      // Leave submenu items to molique-admin-nav.js - otherwise the two
      // modules would fight over the same element (and the branch's expanded state).
      if (link.closest('.admin-nav-submenu')) return;

      const raw = link.getAttribute('href');
      // Skip anchors (#...) and full URLs with a protocol (http:, mailto:).
      if (!raw || raw.charAt(0) === '#' || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return;

      let linkPath;
      try {
        linkPath = normalizeAdminNavPath(new URL(raw, location.href).pathname);
      } catch (e) {
        return;
      }

      if (linkPath === here) link.classList.add('is-active');
    });
  });
}

/* Normalizes a path for comparison: no trailing slash; "" and
   "/index.html" => "/" (homepage). Named differently from admin-nav.js's
   normalizePath and navbar-active.js's normalizeNavPath, to avoid a
   global function collision on pages that load several modules. */
function normalizeAdminNavPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return '/';
  return p;
}

window.initAdminNavActive = initAdminNavActive;
