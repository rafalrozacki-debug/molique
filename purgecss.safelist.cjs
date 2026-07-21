/**
 * molique - safelista dla PurgeCSS
 *
 * PLIK GENEROWANY AUTOMATYCZNIE - nie edytuj recznie.
 * Zrodlo: tools/gen-safelist.js   |   Regeneracja: node tools/gen-safelist.js
 * Wygenerowano: 2026-07-21
 *
 * PO CO TO: czesc klas molique nie wystepuje w HTML - dodaje je JS w czasie
 * dzialania strony (stany, markup karuzeli/lightboxa/toastow). PurgeCSS ich
 * nie widzi i by je wyciely, psujac komponenty.
 *
 * UZYCIE (purgecss.config.js albo postcss.config.js):
 *
 *   const molique = require('./purgecss.safelist.cjs');
 *
 *   safelist: molique.runtime        // MINIMUM - bez tego molique sie psuje
 *   safelist: molique.all            // runtime + wszystkie rodziny utilities
 *   safelist: molique.merge('colors', 'grid')   // runtime + wybrane rodziny
 */

/* =========================================================================
   TIER 1 - RUNTIME (obowiazkowe)
   Klasy tworzone/przelaczane przez JS molique. Pominiecie = zepsute komponenty.
   ========================================================================= */

const runtime = {
  standard: [
    'admin-nav-submenu',
    'btn-hover-glow',
    'btn-hover-lift',
    'btn-hover-spring',
    'carousel-dot',
    'carousel-dots',
    'fw-bold',
    'lightbox-close',
    'lightbox-content',
    'lightbox-counter',
    'lightbox-nav',
    'lightbox-next',
    'lightbox-overlay',
    'lightbox-prev',
    'lightbox-top-bar',
    'opacity-50',
    'select-search',
    'select-search-menu',
    'sidebar-md',
    'sidebar-sm',
    'text-white',
    'toast',
    'toast-bottom-center',
    'toast-bottom-left',
    'toast-bottom-right',
    'toast-container',
    'toast-danger',
    'toast-info',
    'toast-progress',
    'toast-success',
    'toast-top-center',
    'toast-top-left',
    'toast-top-right',
    'toast-warning',
  ],
  // Konwencja stanow molique. Pattern zamiast listy literalow, bo chroni takze
  // klasy przelaczane z WLASNEGO kodu uzytkownika (np. .step.is-completed).
  // Pokrywa 16 klas .is-* w CSS.
  greedy: [/^is-/],
  // Animacja odpalana ze stylu inline w JS - zadna regula CSS jej nie wola,
  // wiec opcja keyframes:true by ja usunela.
  keyframes: [
    'toastProgressAnim',
  ],
};

/* =========================================================================
   TIER 2 - RODZINY UTILITIES (opcjonalne, wybierz swoje)
   Molique NIE wie, czy Twoj backend sklada nazwy klas dynamicznie - np.
   class="opacity-<?= $x ?>" albo status z pola w bazie. Takich klas nie ma
   w zadnym pliku, wiec PurgeCSS je wytnie. Wlacz TYLKO te grupy, ktore
   faktycznie generujesz dynamicznie - kazda wlaczona grupa to mniejszy zysk.
   ========================================================================= */

const families = {
  // .bg-*, .text-*, .border-* - kolory/rozmiary sterowane z CMS
  colors: [/^bg-/, /^text-/, /^border-/],
  // .col-span-*, .col-md-span-*, .offset-*, .grid-cols-* - layout z pola CMS
  grid: [/^col-/, /^offset-/, /^grid-cols-/],
  // marginesy/paddingi/gapy skladane w petli
  spacing: [/^m[trblxy]?-/, /^p[trblxy]?-/, /^gap-/],
  // statusy z enuma w bazie: .badge-*, .status-*, .stock-bar-*, .opacity-*
  status: [/^badge-/, /^status-/, /^stock-bar-/, /^overlay-/, /^opacity-/],
};

/* ---------- Skladanie ---------- */

function merge(...groups) {
  const greedy = [...runtime.greedy];
  for (const g of groups) {
    if (!families[g]) throw new Error('Nieznana grupa safelisty: ' + g);
    greedy.push(...families[g]);
  }
  return { standard: runtime.standard, greedy, keyframes: runtime.keyframes };
}

const all = merge(...Object.keys(families));

module.exports = { runtime, families, merge, all };
