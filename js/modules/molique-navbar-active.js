/**
 * molique - Navbar Active (podświetlenie bieżącej strony wg URL)
 *
 * Górny navbar jest współdzielony między podstronami (jeden markup), więc
 * aktywnej pozycji nie da się zaznaczyć statycznie w HTML. Ten moduł czyta
 * adres URL i nadaje .is-active linkowi bieżącej strony ORAZ triggerowi
 * rozwijanego menu (dropdown / mega-menu), w którym ten link się znajduje.
 *
 * Gdy strona figuruje w kilku menu naraz (np. w dropdownie „Przykłady" i w
 * mega menu „Komponenty"), podświetlane są wszystkie jej wystąpienia.
 *
 * Zero zależności. Auto-ładowany przez molique-script.js przy .navbar-menu.
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
    // Pomijamy kotwice (#...) oraz pełne URL-e z protokołem (http:, mailto:, tel:).
    if (!raw || raw.charAt(0) === '#' || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return;

    let linkPath;
    try {
      linkPath = normalizeNavPath(new URL(raw, location.href).pathname);
    } catch (e) {
      return;
    }
    if (linkPath !== here) return;

    link.classList.add('is-active');

    // Trigger rozwijanego menu, w którym leży aktywny link.
    const parent = link.closest('.dropdown, .mega-menu');
    if (parent) {
      const trigger = parent.querySelector(':scope > summary');
      if (trigger) trigger.classList.add('is-active');
    }
  });
}

/* Ujednolica ścieżkę do porównania: bez końcowego slasha; "" oraz
   "/index.html" => "/" (strona główna). Nazwa różna od normalizePath z
   admin-nav.js, by uniknąć kolizji globalnych funkcji na wspólnych stronach. */
function normalizeNavPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return '/';
  return p;
}

window.initNavbarActive = initNavbarActive;
