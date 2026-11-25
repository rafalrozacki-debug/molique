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
 * Since 1.7.54 a page deeper than the menu (a record's card under
 * /stock/item/5/) lights up the link of its section (/stock/) - see
 * adminNavActiveMatch() for the rules.
 *
 * Division of responsibility: expandable branches
 * (<details class="admin-nav-submenu">) are handled by
 * molique-admin-nav.js (there, active state is coupled with the mobile
 * drill-down). This module only marks flat links - but it still has to
 * look at the branches, because a branch can win the match instead.
 *
 * Zero dependencies. Auto-loaded by molique-script.js when .admin-nav is present.
 */
function initAdminNavActive() {
  if (!document.querySelector('.admin-nav')) return;

  const match = adminNavActiveMatch(normalizeAdminNavPath(location.pathname));
  // Leave submenu items to molique-admin-nav.js - otherwise the two
  // modules would fight over the same element (and the branch's expanded state).
  match.links.forEach((entry) => {
    if (!entry.details) entry.link.classList.add('is-active');
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

/* Which nav entries the current address belongs to. A copy of
 * adminNavSubmenuMatch() in molique-admin-nav.js, where the rules are
 * explained in full; the two modules load in any order and each marks only
 * its own half, so each computes the whole contest. npm run test:admin-nav
 * checks that the copies agree.
 *
 * In short: an exact match anywhere wins alone; otherwise the longest
 * whole-segment prefix wins, among the links and each branch's section
 * (the common prefix of its links); the nav's root never wins by prefix.
 *
 * Until 1.7.53 this module also skipped every absolute URL, so a sidebar
 * rendered with full addresses (WordPress esc_url(home_url(...))) was never
 * lit by it at all. Now only another origin is skipped.
 */
function adminNavActiveMatch(here) {
  const entries = [];
  const add = (link, details) => {
    const raw = link.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return;
    let url;
    try {
      url = new URL(raw, location.href);
    } catch (e) {
      return;
    }
    // Another site (or mailto:, whose origin is "null") is not a page here.
    if (url.origin !== location.origin) return;
    entries.push({ link, details, path: normalizeAdminNavPath(url.pathname) });
  };
  document.querySelectorAll('.admin-nav .admin-nav-link[href]').forEach((link) => {
    if (!link.closest('.admin-nav-submenu')) add(link, null);
  });
  document.querySelectorAll('.admin-nav-submenu').forEach((details) => {
    const list = details.querySelector(':scope > .admin-nav-submenu-list');
    if (list) list.querySelectorAll('.admin-nav-submenu-link[href]').forEach((link) => add(link, details));
  });

  const exact = entries.filter((e) => e.path === here);
  if (exact.length) return { links: exact, sections: [] };
  if (!entries.length) return { links: [], sections: [] };

  const segs = (p) => (p === '/' ? [] : p.slice(1).split('/'));
  const common = (paths) => {
    let out = segs(paths[0]);
    paths.slice(1).forEach((p) => {
      const s = segs(p);
      let i = 0;
      while (i < out.length && i < s.length && out[i] === s[i]) i++;
      out = out.slice(0, i);
    });
    return out;
  };
  const hereSegs = segs(here);
  // Length of `prefix` when it is a whole-segment prefix of the address, else -1.
  const under = (prefix) => {
    if (prefix.length >= hereSegs.length) return -1;
    for (let i = 0; i < prefix.length; i++) if (prefix[i] !== hereSegs[i]) return -1;
    return prefix.length;
  };
  const root = common(entries.map((e) => e.path)).length;

  let best = root;
  let links = [];
  let sections = [];
  entries.forEach((e) => {
    const n = under(segs(e.path));
    if (n > best) { best = n; links = [e]; sections = []; }
    else if (n === best && n > root) links.push(e);
  });
  document.querySelectorAll('.admin-nav-submenu').forEach((details) => {
    const own = entries.filter((e) => e.details === details).map((e) => e.path);
    if (!own.length) return;
    const n = under(common(own));
    if (n > best) { best = n; links = []; sections = [details]; }
    else if (n === best && n > root) sections.push(details);
  });
  return { links, sections };
}

window.initAdminNavActive = initAdminNavActive;
