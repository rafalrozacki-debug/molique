/**
 * molique - Admin Nav (submenu active state + mobile drill-down)
 *
 * A bit of vanilla JS around the native <details class="admin-nav-submenu">:
 *  - detects the active item from the URL and highlights it and its
 *    branch with the .is-active class (no need for an [open] attribute in the markup);
 *    since 1.7.54 a page deeper than the menu lights up its branch too,
 *    see adminNavSubmenuMatch(),
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

  // The same contest molique-admin-nav-active.js runs for the flat links -
  // see adminNavSubmenuMatch() below.
  const match = adminNavSubmenuMatch(here);

  submenus.forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    const list = details.querySelector(':scope > .admin-nav-submenu-list');
    if (!summary || !list) return;

    // 1. Active state from the URL - highlight the active link and its branch.
    //    A branch also lights up on its own, without any link, when the page
    //    sits under its section (a record's card deeper than the menu goes).
    let hasActive = match.sections.includes(details);
    match.links.forEach((entry) => {
      if (entry.details !== details) return;
      entry.link.classList.add('is-active');
      hasActive = true;
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

/* Normalizes a path for comparison: no trailing slash; "" and
   "/index.html" => "/" (homepage) - the same rule as the flat-link module,
   because both must reach the same verdict. */
function normalizePath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return '/';
  return p;
}

/* Which nav entries the current address belongs to.
 *
 * Until 1.7.53 only an IDENTICAL path counted, so on a record's card
 * (/rentals/contract/12/ under a menu that only links /rentals/contracts/)
 * nothing in the sidebar was lit - not even the module's name.
 *
 * 1. Exact match anywhere wins, and then ONLY exact matches are marked
 *    (the same address can appear twice: sidebar and mobile drawer).
 * 2. Otherwise the longest prefix wins, counted in whole path segments
 *    (/stock matches /stock/item/5, never /stockroom). Candidates are the
 *    links and each branch's SECTION - the common prefix of its links - so
 *    a branch lights up for a card that matches none of its links.
 * 3. The nav's ROOT - the common prefix of every link in it ("/", or
 *    "/app" when the panel lives in a subfolder) - never wins by prefix.
 *    Otherwise the home link would light up on every unknown page.
 *
 * molique-admin-nav-active.js carries the same function under its own name
 * (adminNavActiveMatch): the two modules load in any order and each marks
 * only its own half, so each must compute the WHOLE contest by itself.
 * npm run test:admin-nav checks that the two copies agree.
 */
function adminNavSubmenuMatch(here) {
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
    entries.push({ link, details, path: normalizePath(url.pathname) });
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

window.initAdminNav = initAdminNav;
