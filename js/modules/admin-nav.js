/**
 * molique - Admin Nav (aktywność submenu + mobilny drill-down)
 *
 * Odrobina vanilla JS wokół natywnego <details class="admin-nav-submenu">:
 *  - wykrywa aktywną pozycję z adresu URL i podświetla ją oraz jej gałąź
 *    klasą .is-active (bez potrzeby atrybutu [open] w markupie),
 *  - na mobile nie pozwala aktywnej gałęzi auto-rozwinąć drill-downu na
 *    starcie (to była główna irytacja: wejście na podstronę = otwarty panel),
 *  - wzajemne wykluczanie: otwarcie jednego submenu zamyka pozostałe,
 *  - Esc zamyka otwarty drill-down, zmiana breakpointu również.
 *
 * Samo otwieranie/zamykanie obsługuje natywny <details> - JS go tylko
 * porządkuje. Zero zależności, zero jQuery.
 */
function initAdminNav() {
  const submenus = Array.from(document.querySelectorAll('.admin-nav-submenu'));
  if (!submenus.length) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  const here = normalizePath(location.pathname);

  submenus.forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    const list = details.querySelector(':scope > .admin-nav-submenu-list');
    if (!summary || !list) return;

    // 1. Aktywność z URL - podświetl aktywny link i jego gałąź.
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
    if (hasActive) summary.classList.add('is-active');

    // 2. Na mobile nie auto-rozwijaj drill-downu na starcie. Jeśli markup
    //    renderuje <details open> dla aktywnej gałęzi, zachowujemy wskazanie
    //    przez .is-active, ale panel zamykamy.
    if (mobile.matches && details.open) {
      summary.classList.add('is-active');
      details.open = false;
    }

    // 3. Wzajemne wykluczanie (tylko na mobile, gdzie drill-down zajmuje
    //    cały ekran) - otwarcie jednego zamyka pozostałe.
    details.addEventListener('toggle', () => {
      if (!details.open || !mobile.matches) return;
      submenus.forEach((other) => {
        if (other !== details && other.open) other.open = false;
      });
    });
  });

  // 4. Esc zamyka otwarty drill-down.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    submenus.forEach((details) => {
      if (details.open) details.open = false;
    });
  });

  // 5. Zmiana breakpointu - zamykamy otwarte, żeby nie zostawić zawieszonego
  //    panelu drill-downu przy obrocie ekranu / zmianie szerokości.
  const closeAll = () => submenus.forEach((details) => { details.open = false; });
  if (mobile.addEventListener) {
    mobile.addEventListener('change', closeAll);
  } else if (mobile.addListener) {
    mobile.addListener(closeAll); // starsze Safari
  }
}

/* Ujednolica ścieżkę do porównania: bez końcowego slasha, puste => "/". */
function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

window.initAdminNav = initAdminNav;
