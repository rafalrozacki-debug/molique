/**
 * molique - Admin Nav (aktywność submenu + mobilny drill-down)
 *
 * Odrobina vanilla JS wokół natywnego <details class="admin-nav-submenu">:
 *  - wykrywa aktywną pozycję z adresu URL i podświetla ją oraz jej gałąź
 *    klasą .is-active (bez potrzeby atrybutu [open] w markupie),
 *  - na mobile nie pozwala aktywnej gałęzi auto-rozwinąć drill-downu na
 *    starcie (to była główna irytacja: wejście na podstronę = otwarty panel),
 *  - animowane zamknięcie (wyjazd w dół): natywny <details> chowa treść
 *    natychmiast, więc opóźniamy zdjęcie [open] o czas animacji CSS,
 *  - wzajemne wykluczanie: otwarcie jednego submenu zamyka pozostałe,
 *  - Esc zamyka otwarty drill-down, zmiana breakpointu również.
 *
 * Otwieranie i wjazd obsługuje natywny <details> + CSS. Zero zależności.
 */
function initAdminNav() {
  const submenus = Array.from(document.querySelectorAll('.admin-nav-submenu'));
  if (!submenus.length) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const here = normalizePath(location.pathname);

  // Animowane zamknięcie: odtwarza wyjazd (.is-closing), po jego końcu zdejmuje
  // [open]. Na desktopie i przy reduced-motion zamyka natychmiast.
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
      // Najpierw [open]=false (natywne ukrycie), dopiero potem zdejmij
      // .is-closing - inaczej między nimi mrugnęłaby animacja wjazdu.
      details.open = false;
      details.classList.remove('is-closing');
    };

    details.classList.add('is-closing');
    if (panel) {
      panel.addEventListener('animationend', finish, { once: true });
      // Bezpiecznik, gdyby animationend nie wystrzelił (np. panel bez animacji).
      setTimeout(finish, 400);
    } else {
      finish();
    }
  };

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
    //    przez .is-active, ale panel zamykamy (bez animacji - to stan startowy).
    if (mobile.matches && details.open) {
      summary.classList.add('is-active');
      details.open = false;
    }

    // 3. Zamknięcie przez pasek "Cofnij": przejmujemy natywny toggle, żeby
    //    zagrać wyjazd. Otwieranie zostawiamy natywnemu <details> (wjazd z CSS).
    summary.addEventListener('click', (e) => {
      if (mobile.matches && details.open && !details.classList.contains('is-closing')) {
        e.preventDefault();
        closeAnimated(details);
      }
    });

    // 4. Wzajemne wykluczanie (tylko na mobile) - otwarcie jednego zamyka
    //    pozostałe (natychmiast; nie animujemy „obcego" panelu).
    details.addEventListener('toggle', () => {
      if (!details.open || !mobile.matches) return;
      submenus.forEach((other) => {
        if (other !== details && other.open) other.open = false;
      });
    });
  });

  // 5. Esc zamyka otwarty drill-down (z animacją wyjazdu).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    submenus.forEach((details) => {
      if (details.open) closeAnimated(details);
    });
  });

  // 6. Zmiana breakpointu - zamykamy otwarte natychmiast, żeby nie zostawić
  //    zawieszonego panelu drill-downu przy obrocie ekranu / zmianie szerokości.
  const closeAll = () => submenus.forEach((details) => {
    details.classList.remove('is-closing');
    details.open = false;
  });
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
