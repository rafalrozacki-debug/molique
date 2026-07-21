/**
 * molique - Admin Nav Active (podświetlenie bieżącej strony w sidebarze)
 *
 * Odpowiednik molique-navbar-active.js dla pionowego menu panelu admina.
 * Sidebar bywa współdzielony między podstronami (jeden partial), więc aktywnej
 * pozycji nie da się zaznaczyć statycznie w markupie - moduł czyta adres URL
 * i nadaje .is-active linkom bieżącej strony.
 *
 * Podświetla WSZYSTKIE wystąpienia adresu, bo ta sama pozycja figuruje zwykle
 * dwa razy: w skróconym pasku mobilnym (.mobile-only-nav-item) i w pełnej
 * liście w szufladzie „Więcej".
 *
 * Rozdział odpowiedzialności: rozwijane gałęzie <details class="admin-nav-submenu">
 * obsługuje molique-admin-nav.js (tam aktywność jest sprzężona z drill-downem
 * na mobile). Ten moduł zajmuje się wyłącznie płaskimi linkami.
 *
 * Zero zależności. Auto-ładowany przez molique-script.js przy .admin-nav.
 */
function initAdminNavActive() {
  const navs = document.querySelectorAll('.admin-nav');
  if (!navs.length) return;

  const here = normalizeAdminNavPath(location.pathname);

  navs.forEach((nav) => {
    nav.querySelectorAll('.admin-nav-link[href]').forEach((link) => {
      // Pozycje w submenu zostawiamy molique-admin-nav.js - inaczej dwa moduły
      // walczyłyby o ten sam element (i o stan rozwinięcia gałęzi).
      if (link.closest('.admin-nav-submenu')) return;

      const raw = link.getAttribute('href');
      // Pomijamy kotwice (#...) oraz pełne URL-e z protokołem (http:, mailto:).
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

/* Ujednolica ścieżkę do porównania: bez końcowego slasha; "" oraz
   "/index.html" => "/" (strona główna). Nazwa różna od normalizePath
   z admin-nav.js i normalizeNavPath z navbar-active.js, by uniknąć
   kolizji funkcji globalnych na stronach ładujących kilka modułów. */
function normalizeAdminNavPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index.html') return '/';
  return p;
}

window.initAdminNavActive = initAdminNavActive;
