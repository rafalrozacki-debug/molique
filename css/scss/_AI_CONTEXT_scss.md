# Zbiorczy kontekst projektu dla AI

**Folder glowny:** `scss`
**Liczba plikow w paczce:** 93

## Struktura plikow:
- `components/_accordion.scss`
- `components/_admin-nav.scss`
- `components/_admin-sidebar.scss`
- `components/_alerts.scss`
- `components/_badges.scss`
- `components/_breadcrumbs.scss`
- `components/_cards.scss`
- `components/_carousel.scss`
- `components/_chart-funnel.scss`
- `components/_charts.scss`
- `components/_code-preview.scss`
- `components/_context-menu.scss`
- `components/_counters.scss`
- `components/_dashboard.scss`
- `components/_data-row-compact.scss`
- `components/_data-rows.scss`
- `components/_dropdown.scss`
- `components/_form-base.scss`
- `components/_form-check.scss`
- `components/_form-file-upload.scss`
- `components/_form-groups.scss`
- `components/_form-input-range.scss`
- `components/_form-select-custom.scss`
- `components/_form-select-search.scss`
- `components/_form-switch.scss`
- `components/_grid-expand.scss`
- `components/_hero.scss`
- `components/_language-switch.scss`
- `components/_lightbox.scss`
- `components/_list-group.scss`
- `components/_list-icons.scss`
- `components/_mega-menu.scss`
- `components/_modal-confirm.scss`
- `components/_modal-context.scss`
- `components/_modal.scss`
- `components/_nav-filters.scss`
- `components/_navbar.scss`
- `components/_pagination.scss`
- `components/_pricing-list.scss`
- `components/_pricing-table.scss`
- `components/_progress.scss`
- `components/_reading-progress.scss`
- `components/_scroll-to-top.scss`
- `components/_status-dots.scss`
- `components/_status-icons.scss`
- `components/_stepper.scss`
- `components/_stock-bar.scss`
- `components/_tables.scss`
- `components/_tabs.scss`
- `components/_testimonials.scss`
- `components/_theme-editor.scss`
- `components/_theme-switch.scss`
- `components/_timeline.scss`
- `components/_toasts.scss`
- `components/_tooltips.scss`
- `components/_topbar.scss`
- `components/_word-rotator.scss`
- `layout/_admin-layout.scss`
- `modules/_docs.scss`
- `utilities/_animations.scss`
- `utilities/_borders.scss`
- `utilities/_colors.scss`
- `utilities/_helpers.scss`
- `utilities/_spacing.scss`
- `utilities/_typography.scss`
- `_a11y.scss`
- `_admin.scss`
- `_base.scss`
- `_before-after.scss`
- `_blog.scss`
- `_buttons.scss`
- `_components.scss`
- `_eink.scss`
- `_fonts.scss`
- `_forms.scss`
- `_grid.scss`
- `_layout.scss`
- `_mixins.scss`
- `_root.scss`
- `_share.scss`
- `_shop.scss`
- `_speed-dial.scss`
- `_utilities-extended.scss`
- `_utilities.scss`
- `_variables.scss`
- `molique-style-admin.scss`
- `molique-style-before-after.scss`
- `molique-style-blog.scss`
- `molique-style-docs.scss`
- `molique-style-share.scss`
- `molique-style-shop.scss`
- `molique-style-speed-dial.scss`
- `molique-style.scss`

## Plik: `components/_accordion.scss`

```scss
// molique - Akordeon na natywnym <details> + interpolate-size.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   3. AKORDEON (Natywny <details>)
   ========================================= */
.accordion {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--bg-surface);
}

.accordion-item {
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }

  /* MAGIA CSS 2026: Płynne otwieranie natywnego details */
  interpolate-size: allow-keywords;
  
  &::details-content {
    /* Stan zamknięty ORAZ zamykanie: overflow wraca do hidden natychmiast,
       więc zwijana treść jest przycinana od pierwszej klatki. */
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), content-visibility 0.3s allow-discrete;
    height: 0;
    overflow: hidden;
  }

  &[open]::details-content {
    height: auto;
    /* Po rozwinięciu zdejmujemy przycinanie. Bez tego treść wyższa niż
       wysokość policzona przez animację zostaje ucięta na stałe, a przewijalny
       rodzic (overflow-y: auto) nie widzi, że jest co przewijać.
       `0s 0.3s` = przełącz dopiero PO zakończeniu animacji wysokości; gdyby
       overflow stał się widoczny od razu, treść wychodziłaby poza rosnące
       pudełko i nachodziła na sąsiadów przez cały czas otwierania. */
    overflow: visible;
    transition:
      height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      content-visibility 0.3s allow-discrete,
      overflow 0s 0.3s allow-discrete;
  }
}

.accordion-header {
  display: flex;
  /* BEZ justify-content: space-between. Strzałka ::after jest kolejnym
     elementem flex, więc space-between rozpychał WSZYSTKIE dzieci nagłówka
     na całą szerokość - nagłówek z plakietką i kodem (np. "1  Nakładka plus
     .navbar-sticky") lądował rozstrzelony i wyśrodkowany. Strzałkę dosuwamy
     do prawej przez margin-left na niej samej, przez co liczba elementów
     w nagłówku przestaje mieć znaczenie. */
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
  padding: calc(var(--spacing-unit) * 2);
  font-weight: var(--fw-medium);
  color: var(--text-main);
  cursor: pointer;
  list-style: none; 
  transition: background-color var(--transition-speed), color var(--transition-speed);

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: "▼";
    margin-left: auto;
    flex-shrink: 0;
    font-size: 0.8rem;
    transition: transform var(--transition-speed) ease;
  }

  &:hover {
    background-color: var(--card-bg-subtle);
  }
}

.accordion-item[open] .accordion-header {
  color: var(--primary);
  border-bottom: 1px solid var(--border-color);
  
  &::after {
    transform: rotate(180deg);
  }
}

.accordion-body {
  padding: calc(var(--spacing-unit) * 2);
  color: var(--text-muted);
}
```

## Plik: `components/_admin-nav.scss`

```scss
// molique - Nawigacja panelu admina: submenu, drill-down na mobile, bottom nav.
@use '../variables' as *;
@use '../mixins' as *;

/* Wysokość bloku logo (.admin-brand: target-size-min + margin-bottom) -
   drill-down submenu w -sm/-md zaczyna się PONIŻEJ tej wysokości, żeby logo
   zostawało widoczne zamiast znikać pod panelem "Cofnij". */
$admin-brand-block-height: calc(var(--target-size-min) + var(--spacing-unit) * 4);

/* Transformacja tagu <summary> w pasek "Cofnij" (drill-down). Współdzielona
   przez warianty wąskie na desktopie (-sm/-md) oraz mobilny drill-down w
   Bottom Nav - mixin odpowiada TYLKO za wygląd (strzałka wstecz + napis
   "Cofnij", kolory, hover/focus). Pozycjonowanie ustala kontekst wywołania. */
@mixin admin-drilldown-back {
  background-color: var(--sidebar-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0;
  gap: 8px;
  transition: background-color var(--transition-speed);
  /* summary bywa oznaczone .is-active (kolor --btn-text-light, który w dark
     mode robi się ciemny). Tło "Cofnij" to zawsze ciemny --sidebar-bg, więc
     kolor MUSI wrócić do palety sidebara - inaczej strzałka i napis znikają
     w ciemnym motywie. */
  color: var(--sidebar-text);

  /* Bez tego "Cofnij" nie reaguje na hover/focus. Przyciemniamy (nie
     rozjaśniamy) - na ciemnym tle jasne podświetlenie wygląda obco. */
  &:hover {
    color: var(--sidebar-text-active);
    background-color: rgba(0, 0, 0, 0.15);
  }
  &:focus-visible {
    background-color: rgba(0, 0, 0, 0.15);
    /* nadpisuje jasny pierścień fokusu z _base.scss (oparty o --primary) */
    outline: none;
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.4);
  }

  /* Ukrywamy oryginalną ikonę pozycji */
  > i, > svg { display: none !important; }

  /* Rysujemy ikonę strzałki w lewo (Cofnij) */
  &::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    background-color: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath d='M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z'/%3E%3C/svg%3E") no-repeat center / contain;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath d='M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z'/%3E%3C/svg%3E") no-repeat center / contain;
  }

  /* Zmieniamy tekst pozycji na "Cofnij" */
  .nav-text {
    display: block !important;
    /* bez tego .nav-text dziedziczy width:100% z wariantu -md i rozpycha się */
    width: auto;
    font-size: 0 !important; /* Ukrywa oryginalny tekst */
    &::after {
      content: 'Cofnij';
      font-size: 0.875rem;
      text-transform: none;
      letter-spacing: normal;
    }
  }
}

@layer components {
  .admin-nav {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) * 1);
    list-style: none;
    padding: 0;
    margin: 0;

    @media (max-width: 768px) {
      flex-direction: row;
      /* Równe odstępy dla głównych ikon na pasku */
      justify-content: space-around; 
      width: 100%;
      gap: 0;
    }
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    color: var(--sidebar-text);
    text-decoration: none;
    font-weight: var(--fw-medium);
    transition: all var(--transition-speed) ease;
    border-radius: var(--border-radius);
    min-height: var(--target-size-min);
    
    /* Domyślny układ (Standard - .sidebar-lg) */
    flex-direction: row;
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
    gap: calc(var(--spacing-unit) * 1.5);
    justify-content: flex-start;

    i, svg {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .nav-text {
      white-space: nowrap;
      opacity: 1;
      transition: opacity var(--transition-speed);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      color: var(--sidebar-text-active);
      background-color: rgba(var(--sidebar-highlight-rgb), 0.05);
    }

    &.is-active {
      color: var(--btn-text-light);
      background-color: var(--primary);
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
    }

    /* =========================================
       WARIANTY DESKTOPOWE (Ignorowane na mobile!)
       ========================================= */
    @include mq(md) {
      
      /* --- WARIANT: NARROW (Ikona na górze, tekst na dole) --- */
      .sidebar-md & {
        /* FIX: Wymuszamy układ pionowy! */
        flex-direction: column;
        justify-content: center;
        padding: calc(var(--spacing-unit) * 1) 4px;
        gap: calc(var(--spacing-unit) * 0.5);
        text-align: center;
        width: 100%; 

        .nav-text {
          /* FIX: Mały, wyśrodkowany tekst */
          font-size: 0.6rem; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: normal;
          word-break: break-word;
          line-height: 1.1;
          width: 100%;
        }
      }

      /* --- WARIANT: COMPACT (Tylko ikony) --- */
      .sidebar-sm & {
        justify-content: center;
        align-items: center;
        padding: calc(var(--spacing-unit) * 1.5) 0;
        width: 100%;
        
        i, svg, .sidebar-toggle-icon { margin: 0 !important; }
        .nav-text { display: none; }
      }

    }

    /* =========================================
       MOBILE BOTTOM NAV
       ========================================= */
    @media (max-width: 768px) {
      flex-direction: column;
      justify-content: center;
      padding: calc(var(--spacing-unit) * 1);
      gap: 4px;
      
      /* FIX: flex: 1 sprawia, że wszystkie 5 ikon podzieli się miejscem po równo */
      flex: 1;
      min-width: 0; /* Pozwala na zgniatanie, jeśli ekran jest bardzo wąski */
      
      .nav-text {
        display: block;
        font-size: 0.65rem;
        white-space: normal;
        text-align: center;
        line-height: 1.1;
      }
      
      &.is-active {
        background-color: transparent;
        color: var(--primary);
        box-shadow: none;
      }
    }
  }

  /* =========================================
     PODZIAŁ I DOLNA NAWIGACJA
     ========================================= */
  .admin-nav-divider {
    display: block;
    width: 100%; 
    height: 1px;
    background-color: rgba(var(--sidebar-highlight-rgb), 0.1);
    margin: 0;
    border: none;
    flex-shrink: 0;
    border-top: calc(var(--spacing-unit) * 1) solid transparent;
    border-bottom: calc(var(--spacing-unit) * 1) solid transparent;
    background-clip: content-box;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .admin-nav-bottom {
    margin-top: auto !important; 
    
    @media (max-width: 768px) {
      display: none !important; /* Ukrywamy dolną sekcję na mobile */
    }
  }

  /* FIX: Klasa ukrywająca duplikaty linków na desktopie! */
  .mobile-only-nav-item {
    @include mq(md) {
      display: none !important;
    }
  }

  /* =========================================
     MOBILE DROP-UP MENU (Checkbox Hack - Slide Up)
     ========================================= */
  
  .mobile-more-toggle {
    display: none;
  }

  .mobile-more-label {
    cursor: pointer;
    @include mq(md) {
      display: none !important;
    }
  }

  .admin-nav-dropdown-menu {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) * 1);

    /* DESKTOP: Linki na płasko */
    @include mq(md) {
      display: contents;
    }

    /* MOBILE: Pływająca szuflada */
    @include mq(md, max) {
      position: fixed;
      /* FIX: dolny pasek to min-height 70px PLUS padding-bottom
         env(safe-area-inset-bottom) - bez wliczenia wcięcia szuflada wchodzi
         dolną krawędzią pod pasek i ostatnie pozycje są przycięte
         (identyczna formuła jak w bottom-sheet submenu). */
      bottom: calc(70px + env(safe-area-inset-bottom));
      left: 0;
      right: 0;
      width: 100%;

      background-color: var(--sidebar-bg);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-top-left-radius: var(--border-radius-lg, 24px);
      border-top-right-radius: var(--border-radius-lg, 24px);
      padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 2);
      padding-bottom: calc(var(--spacing-unit) * 4);
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
      z-index: 100;
      /* FIX: Długie listy (np. nawigacja dokumentacji) muszą się przewijać w pionie,
         inaczej szuflada wystaje ponad górną krawędź ekranu */
      max-height: calc(
        100dvh - 70px - env(safe-area-inset-bottom) - (var(--spacing-unit) * 4)
      );
      overflow-y: auto;
      
      /* FIX: Zamiast display: none, ukrywamy szufladę pod ekranem! */
      visibility: hidden;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.3s;
      
      .admin-nav-link {
        flex-direction: row;
        justify-content: flex-start;
        padding: calc(var(--spacing-unit) * 2);
        min-height: 48px;
        
        i, svg {
          font-size: 1.5rem;
          margin-right: calc(var(--spacing-unit) * 2) !important;
        }
        
        .nav-text {
          display: block;
          font-size: 1rem;
          text-align: left;
          white-space: nowrap;
        }
      }
    }
  }

  /* MAGIA: Wsuwanie szuflady po kliknięciu */
  .mobile-more-toggle:checked ~ .admin-nav-dropdown-menu {
    @include mq(md, max) {
      visibility: visible;
      transform: translateY(0);
    }
  }
  
  /* =========================================
     SUBMENU (Rozwijane drzewko linków)
     ========================================= */
  .admin-nav-submenu {
    position: relative;
    
    summary {
      list-style: none;
      cursor: pointer;
      &::-webkit-details-marker { display: none; }
      
      &::after {
        content: "";
        display: inline-block;
        margin-left: auto;
        width: 6px;
        height: 6px;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg);
        transition: transform var(--transition-speed);
        opacity: 0.5;
      }
    }

    &[open] > summary::after {
      transform: rotate(-135deg);
    }
  }

  /* --- WARIANT DOMYŚLNY (Szeroki Sidebar - Drzewko) --- */
  .admin-nav-submenu-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 4px 0 8px 0;
    padding-left: calc(var(--spacing-unit) * 5); 
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 8px; 
      left: calc(var(--spacing-unit) * 3); 
      width: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .admin-nav-submenu-link {
    display: flex;
    align-items: center;
    color: var(--sidebar-text);
    text-decoration: none;
    font-size: 0.8125rem;
    font-weight: var(--fw-medium);
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    border-radius: var(--border-radius);
    transition: all var(--transition-speed);
    position: relative;
    border: 1px solid transparent;

    &::before {
      content: '';
      position: absolute;
      left: calc(var(--spacing-unit) * -2);
      top: 50%;
      width: 12px;
      height: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &:hover {
      color: var(--sidebar-text-active);
      background-color: rgba(var(--sidebar-highlight-rgb), 0.05);
    }

    &.is-active {
      color: var(--sidebar-text-active);
      font-weight: var(--fw-bold);
      border-color: rgba(255, 255, 255, 0.2);
      background-color: transparent;
      box-shadow: none !important;
    }
  }

  /* --- WARIANTY WĄSKIE (Drill-down Menu) --- */
  @include mq(md) {
    .sidebar-md .admin-nav-submenu,
    .sidebar-sm .admin-nav-submenu {
      
      /* Uciekamy z kontekstu pozycjonowania, żeby móc przykryć cały sidebar! */
      position: static; 
      
      summary::after { display: none; }
      .admin-nav-submenu-list { display: none !important; }

      /* =========================================
         STAN OTWARTY (Drill-down Active)
         ========================================= */
      &[open] {

        /* 1. Tło przykrywające resztę sidebara PONIŻEJ logo (logo zostaje widoczne) */
        &::before {
          content: '';
          position: absolute;
          top: $admin-brand-block-height;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--sidebar-bg);
          z-index: 100;
        }

        /* 2. Przycisk "Cofnij" (Transformacja tagu <summary>) - pod logo, nie w jego miejscu */
        > summary {
          position: absolute;
          top: $admin-brand-block-height;
          left: 0;
          width: 100%;
          height: 70px;
          z-index: 102;
          @include admin-drilldown-back;
        }

        /* 3. Lista linków submenu - zaczyna się pod przyciskiem Cofnij (który jest pod logo) */
        > .admin-nav-submenu-list {
          display: flex !important;
          position: absolute;
          top: calc(#{$admin-brand-block-height} + 70px);
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 101;
          background-color: var(--sidebar-bg);
          padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 1);
          margin: 0;
          overflow-y: auto;

          /* Resetujemy linie drzewka */
          &::before { display: none; }

          .admin-nav-submenu-link {
            padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1);
            justify-content: center;
            text-align: center;
            /* FIX: długie słowa bez naturalnych miejsc łamania (spacji, myślnika)
               wylewały się poza wąski sidebar -sm - poszerzanie -sm nie wchodzi
               w grę, więc zamiast tego łamiemy słowo, ale TYLKO gdy faktycznie
               nie mieści się w wierszu (overflow-wrap, nie word-break: break-word -
               ten drugi łamie słowa nawet gdy zmieściłyby się w całości) */
            overflow-wrap: break-word;
            &::before { display: none; } /* Ukrywamy poziome kreseczki */
          }
        }
      }
    }

    /* W trybie SM (najwęższym) ukrywamy tekst "Cofnij", zostawiamy samą strzałkę */
    .sidebar-sm .admin-nav-submenu[open] > summary .nav-text {
      display: none !important;
    }

    /* --- WARIANT -SM: linki na pełną szerokość z separatorem zamiast ramek ---
       Sidebar -sm jest zbyt wąski (72px), żeby zaokrąglona ramka + padding
       wokół każdego linku miały sens - tekst dotykał/wylewał się poza ramkę.
       Zamiast tego: linki na pełną szerokość, oddzielone cienką linią. */
    .sidebar-sm .admin-nav-submenu[open] > .admin-nav-submenu-list {
      padding-left: 0;
      padding-right: 0;

      .admin-nav-submenu-link {
        width: 100%;
        border-radius: 0;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: rgba(255, 255, 255, 0.08);

        &:last-child {
          border-bottom: none;
        }

        &.is-active {
          background-color: rgba(var(--sidebar-highlight-rgb), 0.05);
        }
      }
    }
  }

  /* =========================================
     MOBILE: SUBMENU JAKO DRILL-DOWN (jak -sm/-md)
     =========================================
     W poziomym Bottom Nav drzewko nie ma sensu. Klik w trigger podmienia
     widok na pełnoekranowy panel: <summary> staje się paskiem "Cofnij" na
     górze ekranu, a lista linków wypełnia resztę - identycznie jak drill-down
     w wariantach -sm/-md, tylko jako mobilna nakładka. Natywny <details>
     odpowiada za samo otwieranie; moduł admin-nav.js obsługuje tylko
     aktywność z URL i wzajemne wykluczanie otwartych submenu. */
  @media (max-width: 768px) {
    .admin-nav-submenu {
      position: static;
      /* details rozciąga swój <summary> (trigger) na kafelek paska */
      display: flex;

      /* Wysokość użytecznej (dotykalnej) części paska "Cofnij". Do niej
         dochodzi jeszcze env(safe-area-inset-top) - status bar/notch - żeby
         napis nie lądował pod paskiem powiadomień, a duży target był daleko
         od górnej krawędzi (mniej przypadkowych gestów notyfikacji). */
      --drilldown-bar-h: 64px;

      > summary {
        width: 100%;
        /* strzałka rozwinięcia drzewka jest zbędna w poziomym pasku */
        &::after { display: none; }
      }

      &[open] {
        /* 1. Lista -> pełnoekranowy panel (od samej góry ekranu). Jego ciemne
           tło stanowi CIĄGŁĄ powierzchnię także pod paskiem "Cofnij" - linki
           odsuwamy paddingiem, żeby nie chowały się pod paskiem. Dzięki temu
           "Cofnij" i lista są jedną całością niezależnie od tego, jak przeglądarka
           pomaluje tło samego <summary>. */
        > .admin-nav-submenu-list {
          display: flex !important; /* nadpisuje domyślny stan drzewka */
          flex-direction: column;
          gap: calc(var(--spacing-unit) * 0.5);
          margin: 0;

          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
          background-color: var(--sidebar-bg);
          /* Wypełnienie na czas "bounce": overshoot unosi panel nieco w górę,
             odsłaniając pasek u dołu - ten solidny cień (blur 0) domalowuje
             ciemne tło poniżej panelu, więc przez przeskok nie mignie strona. */
          box-shadow: 0 160px 0 var(--sidebar-bg);
          /* padding-top mieści pasek "Cofnij" (wysokość + status bar) + oddech */
          padding: calc(var(--drilldown-bar-h) + env(safe-area-inset-top) + var(--spacing-unit) * 2)
            calc(var(--spacing-unit) * 2)
            calc(var(--spacing-unit) * 2 + env(safe-area-inset-bottom));
          overflow-y: auto;
          /* Wjazd od dołu z lekkim odbiciem (back-ease: control point > 1) */
          animation: adminDrilldownPanelIn 0.42s cubic-bezier(0.34, 1.4, 0.64, 1) both;

          /* Linki wyśrodkowane w pionie (wygodniej dla kciuka na mobile);
             "safe" cofa do góry i pozwala przewijać, gdy pozycji jest dużo. */
          justify-content: center;
          justify-content: safe center;

          /* Reset pionowej linii drzewka */
          &::before { display: none; }

          /* Linki na pełną szerokość, bez poziomych kreseczek drzewka */
          .admin-nav-submenu-link {
            justify-content: flex-start;
            text-align: left;
            padding: calc(var(--spacing-unit) * 2);
            min-height: 48px;
            font-size: 1rem;
            &::before { display: none; }
          }
        }

        /* 2. <summary> -> pasek "Cofnij" na górze, NA panelu (leży na jego
           ciemnym tle). z-index nad panelem. */
        > summary {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: calc(var(--drilldown-bar-h) + env(safe-area-inset-top));
          z-index: 1051; /* nad panelem i nad dolnym paskiem (1040) */
          @include admin-drilldown-back;
          /* napis schodzi spod status bara/notcha (env), a duży, niżej
             położony target jest wygodniejszy dla kciuka */
          padding-top: env(safe-area-inset-top);
          /* na dotyku (brak hover) jaśniejszy napis = wyraźny przycisk wstecz */
          color: var(--sidebar-text-active);
          /* Napis pojawia się z lekkim opóźnieniem - dopiero gdy panel zdąży
             już przykryć górę ekranu (inaczej mignąłby nad stroną). */
          animation: adminDrilldownBar 0.24s ease 0.12s both;
        }
      }

      /* =========================================
         WYJAZD (animowane zamknięcie - klasa .is-closing z admin-nav.js)
         =========================================
         Natywny <details> chowa treść natychmiast, więc moduł JS opóźnia
         faktyczne zamknięcie: dodaje .is-closing, czeka na koniec animacji
         i dopiero wtedy zdejmuje [open]. */
      &.is-closing > .admin-nav-submenu-list {
        animation: adminDrilldownPanelOut 0.22s cubic-bezier(0.4, 0, 1, 1) both;
      }
      &.is-closing > summary {
        animation: adminDrilldownBarOut 0.18s ease both;
      }
    }

    /* Wejście/wyjście drill-downu (GPU: wyłącznie opacity + transform) */
    @keyframes adminDrilldownBar {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes adminDrilldownBarOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes adminDrilldownPanelIn {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes adminDrilldownPanelOut {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
  }

  /* A11y: bez animacji dla użytkowników z prefers-reduced-motion
     (moduł admin-nav.js dodatkowo zamyka natychmiast, bez czekania). */
  @media (prefers-reduced-motion: reduce) {
    .admin-nav-submenu[open] > summary,
    .admin-nav-submenu[open] > .admin-nav-submenu-list,
    .admin-nav-submenu.is-closing > summary,
    .admin-nav-submenu.is-closing > .admin-nav-submenu-list {
      animation: none;
    }
  }

} /* ZAMKNIĘCIE @layer components */
```

## Plik: `components/_admin-sidebar.scss`

```scss
// molique - Pasek boczny panelu admina: warianty szerokosci, logo kompaktowe.
@use '../variables' as *;
@use '../mixins' as *;

/* Wspólny wygląd kompaktowej wersji logo (plakietka z ikoną/inicjałem).
   Współdzielony między trybami wąskimi na desktopie (-sm, -md) i mobile,
   żeby nie duplikować reguł w trzech miejscach. */
@mixin admin-logo-compact-style {
  img, svg {
    max-width: 32px;
    max-height: 32px;
    width: auto;
    height: auto;
    margin: auto; /* obrazek/SVG zawsze wyśrodkowany w plakietce, niezależnie od justify-content */
  }

  display: flex;
  align-items: center;
  /* flex-start (nie center): przy tekście dłuższym niż plakietka chcemy
     obciąć koniec, a nie pokazywać losowy fragment ze środka */
  justify-content: flex-start;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  font-size: 1.25rem;
  font-weight: var(--fw-black);
  background-color: rgba(var(--sidebar-highlight-rgb), 0.1);
  border-radius: 8px;
  margin: 0 !important;
}

@layer components {
  .admin-sidebar {
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: var(--layout-padding);
    height: calc(100dvh - (var(--layout-padding) * 2));
    border-radius: var(--sidebar-radius);
    z-index: var(--z-index-sticky);
    padding: calc(var(--spacing-unit) * 2.5) calc(var(--spacing-unit) * 1);
    gap: calc(var(--spacing-unit) * 3);

    /* Wracamy do bezpiecznego ukrywania, bo sidebar sam będzie rósł */
    overflow-y: auto;
    overflow-x: hidden; 
    
    /* FIX: Sidebar ma sztywną szerokość i płynnie rośnie */
    width: var(--current-sidebar-width);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

    /* Elegancki scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--sidebar-highlight-rgb), 0.1) transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
      background: rgba(var(--sidebar-highlight-rgb), 0.1);
      border-radius: var(--border-radius);
    }


    /* Mobile Bottom Nav */
    @media (max-width: 768px) {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%; /* Wymuszamy 100% na mobile */
      height: auto;
      min-height: 70px;
      flex-direction: row;
      align-items: center;
      padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
      border-radius: 0;
      border-top: 1px solid rgba(var(--sidebar-highlight-rgb), 0.1);
      padding-bottom: env(safe-area-inset-bottom);
      overflow: visible;
    }
  }

  /* =========================================
     KOORDYNACJA Z GLOBALNYM NAVBAREM
     =========================================
     Gdy nad layoutem admina siedzi navbar (body > .navbar), sidebar musi
     zaczynać się POD nim i wypełniać resztę okna. Tylko desktop - na mobile
     sidebar to dolny Bottom Nav (position: fixed; bottom). */
  @include mq(md) {
    body:has(> .navbar) .admin-sidebar {
      top: calc(var(--navbar-h) + var(--layout-padding));
      height: calc(100dvh - var(--navbar-h) - (var(--layout-padding) * 2));
    }
  }

  /* Na stronach z layoutem admina navbar zostaje przyklejony (nie chowa się
     przy scrollu w dół), inaczej sidebar odsłaniałby pusty pasek u góry. */
  body:has(.admin-layout) .navbar-sticky.is-hidden {
    transform: none;
  }

  /* Zanikanie treści na dole przewijanego sidebara (opt-in: klasa
     .fade-bottom z warstwy layout). Gradient musi mieć kolor tła
     sidebara (zawsze ciemny), nie powierzchni strony. */
  .admin-sidebar.fade-bottom {
    --fade-color: var(--sidebar-bg);

    /* Na mobile sidebar zamienia się w poziomy dolny pasek -
       pionowy gradient zasłaniałby pigułki nawigacji. */
    @media (max-width: 768px) {
      &::after { display: none; }
    }
  }

  /* Logo w sidebarze.
     Działa niezależnie od typu treści (obrazek, SVG, tekst) - zawsze
     mieści się w szerokości rodzica i nigdy nie rozsadza sidebara. */
  .admin-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    height: var(--target-size-min);
    flex-shrink: 0; /* FIX: overflow:hidden nadaje elementom flex automatyczne min-height:0 -
                        bez tego logo zgniata się do zera, gdy .admin-nav jest wyższy niż sidebar */
    margin-bottom: calc(var(--spacing-unit) * 4);
    overflow: hidden;
    white-space: nowrap;
    text-decoration: none;
    color: var(--sidebar-text-active);
    font-family: var(--font-family-heading);
    font-weight: var(--fw-black);
    font-size: var(--h4-size);

    img, svg {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  }

  /* =========================================
     ANIMOWANA IKONA PRZEŁĄCZNIKA (Morphing Hamburger)
     ========================================= */
  
  /* 1. Przycisk przełącznika */
  #molique-sidebar-toggle {
    display: flex;
    align-items: center;
    /* Domyślnie (LG) ikona jest po lewej stronie, jak reszta linków */
    justify-content: flex-start; 
    width: 100%; /* Zawsze zajmuje całą szerokość sidebara */
    height: var(--target-size-min, 44px);
    padding: 0 calc(var(--spacing-unit) * 2) !important; /* Padding jak w linkach */
    margin: 0;
    border-radius: var(--border-radius);
  }

  /* W trybie wąskim (MD i SM) środkujemy ikonę */
  .admin-layout.sidebar-md #molique-sidebar-toggle,
  .admin-layout.sidebar-sm #molique-sidebar-toggle {
    justify-content: center;
    padding: 0 !important;
  }

  /* 2. Baza ikony */
  .sidebar-toggle-icon {
    width: 20px;
    height: 14px;
    position: relative;
    display: inline-block;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    span {
      position: absolute;
      left: 0;
      height: 2px;
      background-color: currentColor;
      border-radius: 2px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
    }
    
    /* Domyślny stan (LG) - Klasyczny Hamburger */
    span:nth-child(1) { top: 0; }
    span:nth-child(2) { top: 6px; }
    span:nth-child(3) { top: 12px; }
  }

  /* Stan 2 (MD) - Asymetryczny */
  .admin-layout.sidebar-md .sidebar-toggle-icon {
    span:nth-child(1) { width: 100%; }
    span:nth-child(2) { width: 75%; }
    span:nth-child(3) { width: 50%; }
  }

  /* Stan 3 (SM) - Strzałka w prawo */
  .admin-layout.sidebar-sm .sidebar-toggle-icon {
    /* KOREKTA OPTYCZNA: Przesuwamy całą ikonę o 2px w lewo, żeby zrównoważyć ciężar grota strzałki */
    transform: translateX(-2px);
    
    span:nth-child(1) {
      width: 50%;
      top: 2px;
      left: 10px;
      transform: rotate(45deg);
    }
    span:nth-child(2) {
      width: 100%;
      top: 6px;
      left: 0;
      transform: rotate(0);
    }
    span:nth-child(3) {
      width: 50%;
      top: 10px;
      left: 10px;
      transform: rotate(-45deg);
    }
  }

  /* =========================================
     ZARZĄDZANIE LOGO - WERSJA RESPONSYWNA
     ========================================= */

  /* Tryby wąskie na desktopie (-sm, -md): logo zwija się automatycznie,
     tak samo jak etykiety linków w .admin-nav-link (patrz _admin-nav.scss) */
  @include mq(md) {
    .sidebar-sm .admin-logo-hide,
    .sidebar-md .admin-logo-hide {
      display: none !important;
    }

    .sidebar-sm .admin-logo-compact,
    .sidebar-md .admin-logo-compact {
      @include admin-logo-compact-style;
    }
  }

  /* Mobile (sidebar zwinięty do dolnego paska): te same zasady */
  @media (max-width: 768px) {
    /* Opcja 1: Całkowite ukrycie logo na mobile */
    .admin-logo-hide {
      display: none !important;
    }

    /* Opcja 2: Wersja kompaktowa (zmniejszona) na mobile */
    .admin-logo-compact {
      @include admin-logo-compact-style;
    }
  }
}
```

## Plik: `components/_alerts.scss`

```scss
// molique - Alerty (komunikaty inline).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   2. ALERTS (Komunikaty)
   ========================================= */
.alert {
  padding: calc(var(--spacing-unit) * 2);
  margin-bottom: calc(var(--spacing-unit) * 2);
  border-radius: var(--border-radius);
  border-left: 4px solid;
}

.alert-info { 
  background-color: rgba(var(--info-rgb), 0.1); 
  border-color: var(--info); 
  color: var(--text-main); 
}
.alert-success { 
  background-color: rgba(var(--success-rgb), 0.1); 
  border-color: var(--success); 
  color: var(--text-main); 
}
.alert-danger { 
  background-color: rgba(var(--danger-rgb), 0.1); 
  border-color: var(--danger); 
  color: var(--text-main); 
}
.alert-warning { 
  background-color: rgba(var(--warning-rgb), 0.1); 
  border-color: var(--warning); 
  color: var(--text-main); 
}
```

## Plik: `components/_badges.scss`

```scss
// molique - Badges (pigulki statusow).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   1. BADGES (Pigułki)
   ========================================= */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25em 0.65em;
  font-size: 0.75em;
  font-weight: var(--fw-bold);
  line-height: 1;
  border-radius: 50rem; /* Kształt pigułki */
  color: var(--btn-text-light);
}

.badge-primary { background-color: var(--primary); }
.badge-secondary { background-color: var(--secondary); }
.badge-success { background-color: var(--success); }
.badge-danger { background-color: var(--danger); }
.badge-warning { background-color: var(--warning); color: var(--text-main); }
.badge-info { background-color: var(--info); color: var(--text-main); }
.badge-dark { background-color: var(--dark); }
```

## Plik: `components/_breadcrumbs.scss`

```scss
// molique - Breadcrumbs: nawigacja okruszkowa.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   5. BREADCRUMBS (Nawigacja okruszkowa)
   ========================================= */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0 0 calc(var(--spacing-unit) * 2) 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  color: var(--primary);
  text-decoration: none;
}

.breadcrumb-item a:hover { text-decoration: underline; }

.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  display: inline-block;
  padding: 0 calc(var(--spacing-unit) * 1);
  color: var(--text-muted);
}

.breadcrumb-item.is-active { color: var(--text-muted); }
```

## Plik: `components/_cards.scss`

```scss
/**
 * molique - Karty i Kontenery
 * Zawiera bazowe Karty, Featured Boxes, Thumb Info oraz Overlapping Cards.
 */

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   1. BAZOWA KARTA (Card)
   ========================================= */
.card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden; /* Zapobiega wylewaniu się zdjęć poza zaokrąglone rogi */
  transition: box-shadow var(--transition-speed), transform var(--transition-speed);
}

.card-header {
  padding: calc(var(--spacing-unit) * 2);
  background-color: var(--card-bg-subtle);
  border-bottom: 1px solid var(--border-color);
  font-weight: var(--fw-bold);
  border-top-left-radius: calc(var(--border-radius) - 1px);
  border-top-right-radius: calc(var(--border-radius) - 1px);
}
.card-body {
  flex: 1 1 auto; /* Pozwala karcie rosnąć i wypełniać miejsce w Gridzie */
  padding: calc(var(--spacing-unit) * 2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}

.card-footer {
  padding: calc(var(--spacing-unit) * 2);
  background-color: var(--card-bg-subtle);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  border-bottom-left-radius: calc(var(--border-radius) - 1px);
  border-bottom-right-radius: calc(var(--border-radius) - 1px);
}

/* =========================================
   2. FEATURED BOX (Wyróżnione cechy)
   ========================================= */
.featured-box {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 4);
  text-align: center;
  border-top: 4px solid var(--primary);
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
}

.featured-box-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--text-main);
  color: var(--primary);
  font-size: 1.5rem;
  font-weight: var(--fw-bold);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

/* =========================================
   3. THUMB INFO (Karty z obrazkiem w tle)
   ========================================= */
.thumb-info {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: var(--border-radius);
  text-decoration: none !important;
  color: #fff;
  
  img {
    width: 100%;
    display: block;
    transition: transform 0.4s ease;
  }
  
  &:hover img { 
    transform: scale(1.08); 
  }
}

.thumb-info-wrapper {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.thumb-info:hover .thumb-info-wrapper { 
  opacity: 1; 
}

.thumb-info-title {
  transform: translateY(20px);
  transition: transform 0.3s ease;
  margin: 0;
}

.thumb-info:hover .thumb-info-title { 
  transform: translateY(0); 
}

/* Warianty ułożenia tekstu */
.thumb-info-center .thumb-info-wrapper {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.thumb-info-bottom .thumb-info-wrapper {
  justify-content: flex-end;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  padding: calc(var(--spacing-unit) * 3);
}

.thumb-info-light .thumb-info-wrapper {
  background-color: rgba(255, 255, 255, 0.85);
  color: var(--dark);
}

/* =========================================
   4. OVERLAPPING CARD (Nachodząca karta)
   ========================================= */
.overlap-container {
  position: relative;
  z-index: 10;
  /* Na mobile delikatne przesunięcie w górę */
  margin-top: calc(var(--spacing-unit) * -6); 
}

@include mq(md) {
  .overlap-container {
    /* Domyślne przesunięcie na desktopie (ok. 100px) */
    margin-top: calc(var(--spacing-unit) * -12); 
  }
  
  /* Warianty dla pełnej kontroli (jeśli karta jest bardzo wysoka) */
  .overlap-up-50 { margin-top: -50px; }
  .overlap-up-100 { margin-top: -100px; }
  .overlap-up-150 { margin-top: -150px; }
}
```

## Plik: `components/_carousel.scss`

```scss
// molique - Karuzele (slidery) + warianty i kontrolki.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   6. KARUZELE (Sliders)
   ========================================= */
.carousel {
  position: relative;
  width: 100%;
}

.carousel-bg-sync {
  position: relative;
  min-height: 300px;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.carousel-bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2;
}

.carousel-bg-sync .carousel-track {
  position: relative;
  z-index: 3;
}

.carousel-bg-sync .carousel-nav {
  z-index: 4;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.carousel-slide {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* Przyciski nawigacyjne (Strzałki) */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  color: var(--text-main);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color var(--transition-speed), color var(--transition-speed), border-color var(--transition-speed);
  
  &:hover {
    background-color: var(--primary);
    /* Jak w .btn-primary: w dark mode primary jaśnieje, więc tekst musi
       ciemnieć - literal #fff tracił kontrast */
    color: var(--btn-text-light);
    border-color: var(--primary);
  }
}

.carousel-prev { left: -15px; }
.carousel-next { right: -15px; }

/* Kropki paginacji */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: calc(var(--spacing-unit) * 3);
}

.carousel-dot {
  width: 10px;
  height: 10px;
  min-height: 10px !important; /* Nadpisuje globalne 44px dla buttonów */
  flex: 0 0 auto; /* Blokuje rozciąganie we Flexboxie */
  border-radius: 50%;
  background-color: var(--border-color);
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  position: relative;
  transition: background-color var(--transition-speed), transform var(--transition-speed);
  
  /* Zwiększenie obszaru klikalnego dla mobile */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    transform: translate(-50%, -50%);
  }

  &:hover { background-color: var(--secondary); }

  &.is-active {
    background-color: var(--primary);
    transform: scale(1.3);
  }
}

@include mq(sm, max) {
  .carousel-prev { left: 5px; }
  .carousel-next { right: 5px; }
}

/* Wariant BG-Sync: Strzałki wewnątrz, widoczne tylko na hover */
.carousel-bg-sync {
  .carousel-nav {
    opacity: 0;
    visibility: hidden;
    /* Dodajemy lekki przesuw dla płynnego wjazdu */
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  
  .carousel-prev { left: 20px; transform: translateY(-50%) translateX(-10px); }
  .carousel-next { right: 20px; transform: translateY(-50%) translateX(10px); }

  &:hover .carousel-nav {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) translateX(0);
  }
}
```

## Plik: `components/_chart-funnel.scss`

```scss
// molique - Lejki danych: pionowy, poziomy pipeline i trapezowy.
@layer components {
  /* =========================================
     1. LEJEK DANYCH (Pionowy, oparty na --val)
     ========================================= */
  .chart-funnel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--spacing-unit) * 0.5);
    width: 100%;
    padding: calc(var(--spacing-unit) * 2) 0;
  }

  .funnel-stage {
    /* Szerokość sterowana z HTML, domyślnie 100% */
    width: var(--val, 100%);
    min-width: 140px; /* Zapobiega zgnieceniu tekstu na samym dole lejka */
    min-height: var(--target-size-min);
    
    background-color: var(--stage-bg, var(--primary));
    color: var(--stage-text, var(--btn-text-light));
    border-radius: var(--border-radius);
    
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    
    font-size: 0.875rem;
    font-weight: var(--fw-medium);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Subtelny efekt hover dla interaktywności */
    &:hover {
      filter: brightness(1.1);
      transform: scale(1.02);
    }
  }

  /* =========================================
     2. LEJEK PROCESOWY (Poziomy CRM Pipeline)
     ========================================= */
  .chart-pipeline {
    display: flex;
    width: 100%;
    gap: 4px; /* Odstęp między strzałkami */
    
    /* Na mobile zamieniamy w pionowy stos */
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .pipeline-stage {
    flex: 1;
    min-height: var(--target-size-min);
    background-color: var(--stage-bg, var(--bg-surface));
    color: var(--stage-text, var(--text-main));
    
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
    
    font-size: 0.875rem;
    font-weight: var(--fw-medium);
    text-align: center;
    position: relative;
    
    /* Magia CSS: Kształt strzałki (Chevron) */
    clip-path: polygon(0% 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 0% 100%, 16px 50%);
    
    /* Pierwszy element nie ma wcięcia z lewej */
    &:first-child {
      clip-path: polygon(0% 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 0% 100%);
      border-top-left-radius: var(--border-radius);
      border-bottom-left-radius: var(--border-radius);
    }
    
    /* Ostatni element nie ma szpica z prawej */
    &:last-child {
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 16px 50%);
      border-top-right-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
    }

    /* Aktywny etap */
    &.is-active {
      --stage-bg: var(--primary);
      --stage-text: var(--btn-text-light);
    }

    /* Reset kształtów na mobile (zwykłe zaokrąglone prostokąty) */
    @media (max-width: 768px) {
      clip-path: none !important;
      border-radius: var(--border-radius) !important;
      justify-content: space-between; /* Tekst do lewej, ew. ikona do prawej */
    }
  }

   /* =========================================
     3. TRUE FUNNEL (Praktyczny Lejek z nóżką)
     ========================================= */
  .chart-funnel-true {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    
    /* Zmieniamy proporcje na kwadrat - bardziej kompaktowe i praktyczne */
    aspect-ratio: 1 / 1; 
    gap: 2px; 
    
    /* MAGIA CSS: Rzeźbiony wielokąt - Szersza nóżka (50% szerokości) */
    clip-path: polygon(
      /* Górna krawędź i prawe górne zaokrąglenie */
      4% 0%, 96% 0%, 98.5% 1%, 100% 4%,
      
      /* Prawy skos w dół (kończy się niżej, na 70% wysokości) */
      76% 68%,
      /* Prawe wewnętrzne załamanie */
      75% 72%,
      
      /* Prawa pionowa nóżka (szersza, na 75% osi X) */
      75% 92%,
      /* Prawy dolny róg (ścięty wyżej) */
      73% 96%,
      
      /* Ścięty dół (kąt) */
      27% 100%,
      
      /* Lewy dolny róg (ścięty niżej) */
      25% 98%,
      /* Lewa pionowa nóżka (szersza, na 25% osi X) */
      25% 72%,
      
      /* Lewe wewnętrzne załamanie */
      24% 68%,
      /* Lewy skos w górę */
      0% 4%,
      
      /* Lewe górne zaokrąglenie */
      1.5% 1%
    );
  }

  .funnel-true-stage {
    flex: var(--val, 1); 
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--stage-bg, var(--primary));
    color: var(--stage-text, var(--btn-text-light));
    
    /* Zabezpieczenie tekstu w wąskiej nóżce */
    padding: calc(var(--spacing-unit) * 1) 5%;
    overflow: hidden;
    
    line-height: 1.2;
    text-align: center;
    transition: filter var(--transition-speed);
    
    &:hover {
      filter: brightness(1.1);
    }

    .stage-value {
      font-size: 1.25rem;
      font-weight: var(--fw-black);
    }
    .stage-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }
  }
}
```

## Plik: `components/_charts.scss`

```scss
/**
 * molique - Wykresy i Wizualizacje Danych (Data Viz)
 * Architektura Progressive Enhancement (Czysty CSS/SVG jako fallback)
 */

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   0. CSS HOUDINI (Rejestracja zmiennych do animacji)
   ========================================= */
/* Pozwala przeglądarce płynnie animować wartości procentowe w gradientach! */
@property --chart-val {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}

/* =========================================
   1. BAZOWY KONTENER
   ========================================= */
.r-chart-wrapper {
  position: relative;
  width: 100%;
  height: 200px; /* Domyślna wysokość dla dużych wykresów */
  display: flex;
  align-items: flex-end;
  
  /* Zabezpieczenie przed rozsadzeniem kontenera */
  max-width: 100%;
  
  /* WARIANT: MICRO CHART (Do kart statystyk i tabel) */
  &.chart-micro {
    width: 80px;  /* Sztywna, bezpieczna szerokość */
    height: 40px; /* Sztywna, bezpieczna wysokość */
    flex-shrink: 0; /* Zapobiega zgniataniu przez Flexboxa */
  }
}

/* =========================================
   2. SPARKLINES (Wykresy słupkowe)
   ========================================= */
.chart-sparkline {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 4px;
}

.sparkline-bar {
  flex: 1;
  height: var(--val, 0%);
  background-color: var(--primary);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  transition: height 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  &:hover { opacity: 0.8; }

  /* Animacja rośnięcia przy ładowaniu */
  @starting-style {
    height: 0%;
  }
}

/* =========================================
   3. RADIAL BAR (Półotwarte pierścienie)
   ========================================= */
.chart-radial {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Mapujemy zmienną inline na zarejestrowaną zmienną Houdini */
  --chart-val: var(--val, 0%);
  
  background: conic-gradient(
    var(--primary) var(--chart-val), 
    var(--border-color) 0
  );
  
  -webkit-mask-image: radial-gradient(transparent 55%, black 56%);
  mask-image: radial-gradient(transparent 55%, black 56%);
  
  /* MAGIA: Płynna animacja wypełniania pierścienia */
  transition: --chart-val 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  /* Animacja wejścia całego kółka (Pop-in) */
  animation: radialPop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;

  @starting-style {
    --chart-val: 0%;
  }
}

@keyframes radialPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.radial-value {
  font-size: 1.5rem;
  font-weight: var(--fw-black);
  color: var(--text-main);
  /* Animacja pojawiania się tekstu */
  animation: fadeIn 1s ease backwards 0.3s;
}

/* =========================================
   4. HEATMAP (Mapy aktywności)
   ========================================= */
.chart-heatmap {
  display: grid;
  gap: 4px;
  width: 100%;
}

.heatmap-cell {
  border-radius: 4px;
  background-color: rgba(var(--primary-rgb), var(--val, 0.1));
  aspect-ratio: 1 / 1; 
  
  animation: heatmapPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  
  &:hover {
    transform: scale(1.2);
    box-shadow: var(--shadow-md);
    z-index: 2;
  }
}

@for $i from 1 through 50 {
  .heatmap-cell:nth-child(#{$i}) {
    animation-delay: #{$i * 0.02}s; 
  }
}

@keyframes heatmapPop {
  0% { opacity: 0; transform: scale(0.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* =========================================
   5. SMOOTH AREA CHART (Wykresy warstwowe SVG)
   ========================================= */
.chart-area {
  width: 100%;
  height: 100%;
  overflow: visible;
  
  /* MAGIA: Animacja odsłaniania wykresu od lewej do prawej */
  animation: areaReveal 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  
  .area-fill {
    fill: url(#areaGradient);
    opacity: 0.5;
  }
  
  .area-line {
    fill: none;
    stroke: var(--primary);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

@keyframes areaReveal {
  /* Ukrywa cały wykres po prawej stronie */
  0% { clip-path: inset(0 100% 0 0); }
  /* Odsłania cały wykres */
  100% { clip-path: inset(0 0 0 0); }
}

/* =========================================
   6. PIE / DONUT CHART (Wykres kołowy SVG)
   ========================================= */
.chart-pie {
  width: 100%;
  height: 100%;
  /* Obracamy o -90 stopni, aby wykres zaczynał się na godzinie 12:00 */
  transform: rotate(-90deg);
  overflow: visible;
  
  circle {
    fill: transparent;
    /* Grubość pierścienia. Zmień na 16 dla pełnego koła (Pie), lub zostaw mniejsze dla Donuta */
    stroke-width: 6; 
    /* Zaokrąglone końce segmentów (B2B Premium) */
    stroke-linecap: round; 
  }
  
  .pie-bg {
    stroke: var(--card-bg-subtle);
  }
  
  .pie-segment {
    stroke: currentColor;
    stroke-dasharray: var(--val) calc(100 - var(--val));
    stroke-dashoffset: calc(var(--offset) * -1);
    
    /* MAGIA PREMIUM: Transform origin na środek SVG */
    transform-origin: center;
    
    /* Płynna animacja rysowania i hovera */
    animation: pieReveal 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
    transition: 
      stroke-dasharray var(--transition-speed), 
      stroke-dashoffset var(--transition-speed),
      transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      filter 0.3s ease;
      
    cursor: pointer;

    /* Efekt Hover: Segment rośnie i rzuca cień (Drop Shadow działa na SVG!) */
    &:hover {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      /* Przenosi segment na wierzch */
      z-index: 10; 
    }
  }
}

@keyframes pieReveal {
  0% { stroke-dasharray: 0 100; }
}

/* =========================================
   7. STATS CARDS (Karty Statystyk)
   ========================================= */
.stat-card {
  padding: calc(var(--spacing-unit) * 3);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1);
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-sm);
  }
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: var(--fw-black);
  color: var(--text-main);
  line-height: 1.2;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: var(--fw-bold);
  
  &.is-positive { color: var(--success); }
  &.is-negative { color: var(--danger); }
}

/* =========================================
   8. EMPTY STATES (Puste stany danych)
   ========================================= */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--spacing-unit) * 6) calc(var(--spacing-unit) * 3);
  background-color: rgba(var(--dark-rgb), 0.02);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
}

.empty-state-icon {
  font-size: 3rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: calc(var(--spacing-unit) * 2);
}
```

## Plik: `components/_code-preview.scss`

```scss
/**
 * molique - Code Preview (podgląd + kod)
 * Bloki prezentacyjne: .component-showcase > .component-preview + .component-code.
 * Przeniesione z modułu docs do rdzenia, żeby działały wszędzie (np. hero na
 * stronie głównej), nie tylko na stronach ładujących bundle dokumentacji.
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
  .component-showcase {
    margin: calc(var(--spacing-unit) * 4) 0;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    background-color: var(--bg-body);
    /* Zabezpieczenie przed rozsadzaniem przez zawartość */
    max-width: 100%;
  }

  .component-preview {
    padding: calc(var(--spacing-unit) * 3);
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing-unit) * 3);
    background-image: radial-gradient(var(--border-color) 1px, transparent 0);
    background-size: 20px 20px;

    @include mq(md) {
      padding: calc(var(--spacing-unit) * 6);
    }
  }

  .component-code {
    position: relative;
    background-color: var(--code-bg);
    /* Ramka, bo .component-code bywa uzywany SAMODZIELNIE (bez otoczki
       .component-showcase, ktora niosla obramowanie) - bez niej blok kodu
       nie ma zadnej krawedzi. */
    border: 1px solid var(--code-border);
    border-radius: var(--border-radius);
    margin: 0;
    padding: 0;
    /* Zabezpieczenie przed rozsadzaniem przez długi kod */
    max-width: 100%;

    pre {
      margin: 0;
      padding: calc(var(--spacing-unit) * 4);
      /* Wymuszenie scrollowania w poziomie dla długich linii kodu */
      overflow-x: auto;
      max-width: 100%;
      color: var(--code-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  }

  /* Wewnatrz showcase'u obramowanie niesie juz .component-showcase, a blok
     kodu przylega do podgladu - zostaje sama kreska rozdzielajaca. */
  .component-showcase > .component-code {
    border: 0;
    border-top: 1px solid var(--code-border);
    border-radius: 0;
  }

  .btn-copy {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);

    &:hover { background-color: rgba(255, 255, 255, 0.2); }
    &.is-copied { background-color: var(--success); border-color: var(--success); }
  }
}
```

## Plik: `components/_context-menu.scss`

```scss
// molique - Anchored context menu (Anchor Positioning + Popover) wraz z zagniezdzonym wariantem bottom sheet na mobile.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
     4. ANCHORED CONTEXT MENU (CSS Anchor Positioning)
     ========================================= */
  .popover-context {
    /* Reset domyślnych stylów Popover API (UA daje [popover]
       color: CanvasText - patrz komentarz przy .modal-dialog) */
    margin: 0;
    padding: calc(var(--spacing-unit) * 1);
    color: var(--text-main);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
    min-width: 160px;
    
    /* MAGIA 2026: CSS Anchor Positioning */
    position: absolute;
    top: anchor(bottom);
    left: anchor(start);
    margin-top: 4px; 
    
    /* Fallback dla starszych przeglądarek */
    @supports not (top: anchor(bottom)) {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
    }

    /* Animacja wejścia */
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease, display 0.2s allow-discrete, overlay 0.2s allow-discrete;

    &:popover-open {
      opacity: 1;
      transform: translateY(0);
    }

    @starting-style {
      &:popover-open {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    /* --- FLIP: menu blisko dolnej krawędzi ekranu (patrz js/modules/context-menu.js) --- */
    &.is-flipped {
      top: auto;
      bottom: anchor(top);
      margin-top: 0;
      margin-bottom: 4px;

      transform: translateY(10px);

      &:popover-open {
        transform: translateY(0);
      }

      @starting-style {
        &:popover-open {
          transform: translateY(10px);
        }
      }
    }

    /* --- FIX: KULOODPORNY RESET LISTY --- */
    ul, ol {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    li {
      margin: 0;
      padding: 0;
    }

    /* --- WSPARCIE DLA STARYCH KLAS (.popover-action-btn) --- */
    .popover-action-btn {
      width: 100%;
      text-align: left;
      padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
      background: transparent;
      border: none;
      border-radius: calc(var(--border-radius) / 2);
      color: var(--text-main);
      font-size: 0.875rem;
      font-weight: var(--fw-medium);
      cursor: pointer;
      transition: background-color var(--transition-speed), color var(--transition-speed);
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        background-color: var(--card-bg-subtle);
        color: var(--primary);
      }

      &.text-danger:hover {
        background-color: rgba(var(--danger-rgb), 0.1);
        color: var(--danger);
      }
    }

    /* =========================================
       MOBILE: BOTTOM SHEET (Szuflada z dołu)
       ========================================= */
    @media (max-width: 768px) {
      /* Resetujemy pozycjonowanie Anchor */
      position: fixed !important;
      top: auto !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      
      /* Rozciągamy na całą szerokość */
      width: 100% !important;
      min-width: 100%;
      margin: 0;
      
      /* Stylizacja szuflady */
      border: none;
      border-top: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
      padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 2);
      padding-bottom: env(safe-area-inset-bottom); 
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
      
      /* Animacja wjazdu z dołu */
      transform: translateY(100%);
      &:popover-open {
        transform: translateY(0);
      }
      @starting-style {
        &:popover-open { transform: translateY(100%); }
      }

      /* "Uchwyt" (pill) na górze szuflady */
      &::before {
        content: '';
        display: block;
        width: 40px;
        height: 4px;
        background-color: var(--border-color);
        border-radius: 4px;
        margin: 0 auto calc(var(--spacing-unit) * 2) auto;
      }

      /* Powiększamy przyciski dla łatwiejszego klikania palcem */
      .popover-action-btn,
      .btn-action {
        width: 100%;
        justify-content: flex-start;
        padding: calc(var(--spacing-unit) * 2);
        font-size: 1rem;
        min-height: 48px !important;
        
        i, svg {
          font-size: 1.25rem;
          margin-right: calc(var(--spacing-unit) * 1);
        }
      }
    }
  }

  /* Tło przyciemniające (Backdrop) dla Bottom Sheet na mobile */
  @media (max-width: 768px) {
    .popover-context::backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      opacity: 0;
      transition: opacity 0.3s ease, display 0.3s allow-discrete, overlay 0.3s allow-discrete;
    }
    .popover-context:popover-open::backdrop {
      opacity: 1;
    }
    @starting-style {
      .popover-context:popover-open::backdrop { opacity: 0; }
    }
  }
}
```

## Plik: `components/_counters.scss`

```scss
// molique - Counters: liczniki liczbowe.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   9. COUNTERS (Liczniki)
   ========================================= */
.counter {
  text-align: center;
  padding: calc(var(--spacing-unit) * 3) 0;
}

.counter-value {
  display: inline-block;
  font-size: 3.5rem;
  font-weight: var(--fw-black);
  line-height: 1;
  color: var(--primary);
  margin-bottom: calc(var(--spacing-unit) * 1);
  letter-spacing: -1px;
}

.counter-title {
  font-size: 1.125rem;
  font-weight: var(--fw-bold);
  color: var(--text-main);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

## Plik: `components/_dashboard.scss`

```scss
/**
 * molique - Admin dashboard
 * Zawiera elementy na dashboardzie, takie jak nakładki, karty i inne komponenty.
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
   DASHBOARD HEADER (Faux Cutout / Nakładka)
   ========================================= */
.dashboard-header {
  --cutout-radius: 32px;
  --cutout-bg: var(--bg-body); 
  
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  margin-top: calc(var(--spacing-unit) * -4);
  margin-right: calc(var(--spacing-unit) * -4);
  margin-left: calc(var(--spacing-unit) * -4);
  margin-bottom: calc(var(--spacing-unit) * 4);
  
  padding-left: calc(var(--spacing-unit) * 4);
  padding-top: calc(var(--spacing-unit) * 4);
  
  /* FIX: Resetujemy ujemne marginesy na mobile. 
     Nie potrzebujemy tu wycięcia, a zapobiega to ucinaniu tekstu! */
  @include mq(md, max) {
    flex-direction: column;
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;
    padding-top: 0;
    padding-left: 0;
  }
}

.dashboard-header-actions {
  background-color: var(--cutout-bg);
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 4);
  border-bottom-left-radius: var(--cutout-radius);
  border-top-right-radius: var(--main-radius, 0); 
  
  margin-top: calc(var(--spacing-unit) * -4);
  
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  position: relative;
  
  @include mq(md) {
    &::before {
      content: "";
      position: absolute;
      left: calc(var(--cutout-radius) * -1);
      top: 0;
      width: var(--cutout-radius);
      height: var(--cutout-radius);
      background: radial-gradient(circle at bottom left, transparent calc(var(--cutout-radius) - 0.5px), var(--cutout-bg) var(--cutout-radius));
      pointer-events: none;
    }
    &::after {
      content: "";
      position: absolute;
      right: 0;
      bottom: calc(var(--cutout-radius) * -1);
      width: var(--cutout-radius);
      height: var(--cutout-radius);
      background: radial-gradient(circle at bottom left, transparent calc(var(--cutout-radius) - 0.5px), var(--cutout-bg) var(--cutout-radius));
      pointer-events: none;
    }
  }
  
  /* FIX: Na mobile usuwamy tło i wyrównujemy przyciski do lewej krawędzi tekstu */
  @include mq(md, max) {
    background-color: transparent;
    padding: calc(var(--spacing-unit) * 3) 0 0 0; /* Tylko odstęp od góry */
    border-radius: 0;
    width: 100%;
    &::before, &::after { display: none; }
  }
}
}
```

## Plik: `components/_data-row-compact.scss`

```scss
// molique - Compact Data Row: kompaktowy wariant listy z ikona i akcjami.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   3. COMPACT DATA ROW (List Item / Wariant kompaktowy)
   ========================================= */
.data-row-compact {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  transition: background-color var(--transition-speed);

  /* Ostatni element na liście nie ma dolnej ramki */
  &:last-child {
    border-bottom: none;
  }

  /* Subtelny hover (jak na inspiracji) */
  &:hover {
    background-color: var(--card-bg-subtle);
  }

  /* Opcjonalna ikona / awatar po lewej */
  .row-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%; /* Domyślnie kółko (awatar) */
    background-color: var(--bg-body);
    color: var(--text-muted);
    flex-shrink: 0; /* Zapobiega zgniataniu ikony */
    font-size: 1.25rem;
    
    /* Wariant: Kwadratowa ikona (np. dla plików) */
    &.icon-square {
      border-radius: var(--border-radius);
    }
  }

  /* Środkowa część (Tytuł + Szczegóły) */
  .row-content {
    flex: 1; /* Zajmuje całą dostępną przestrzeń */
    min-width: 0; /* Zapobiega rozpychaniu kontenera przez długi tekst */
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-title {
    font-weight: var(--fw-bold);
    color: var(--text-main);
    font-size: 0.875rem;
    /* Ucinanie zbyt długiego tekstu (...) */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-details {
    font-size: 0.75rem;
    color: var(--text-muted);
    /* Ucinanie zbyt długiego tekstu (...) */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Prawa strona (Akcje / Przyciski) */
  .row-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 1);
  }
}
```

## Plik: `components/_data-rows.scss`

```scss
// molique - Data Rows: wiersze danych jako karty (grid CRM).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   2. DATA ROWS (Wiersze tabeli jako karty dla CRM)
   ========================================= */
.data-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  /* Kolor powierzchni zamiast literalnego #fff - w dark mode wiersz ma
     ciemnieć razem z kartami (w light mode bez zmiany: biel). */
  background-color: var(--bg-surface);
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing-unit) * 1);
  transition: box-shadow var(--transition-speed);

  &:hover {
    box-shadow: var(--shadow-sm);
  }
}

@include mq(md, max) {
  .data-row {
    grid-template-columns: 1fr;
    gap: calc(var(--spacing-unit) * 1);
  }
  .data-row-actions {
    margin-top: calc(var(--spacing-unit) * 2);
    padding-top: calc(var(--spacing-unit) * 2);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing-unit) * 1);
  }
}
```

## Plik: `components/_dropdown.scss`

```scss
// molique - Dropdown: wariant w navbarze (<details>) oraz wariant Popover API (top layer, poza navbarem).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   4. DROPDOWN (Zwykłe menu rozwijane)
   ========================================= */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  list-style: none;
  cursor: pointer;
  
  &::-webkit-details-marker { display: none; }

  &::after {
    content: "";
    display: inline-block;
    margin-left: calc(var(--spacing-unit) * 1);
    vertical-align: middle;
    border-top: 4px solid;
    border-right: 4px solid transparent;
    border-bottom: 0;
    border-left: 4px solid transparent;
  }
}

.dropdown[open] .dropdown-toggle::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: var(--z-index-dropdown);
  cursor: default;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: calc(var(--z-index-dropdown) + 1);
  min-width: 200px;
  padding: calc(var(--spacing-unit) * 1) 0;
  background-color: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  animation: fadeInDown 0.2s ease;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
  color: var(--text-main);
  text-decoration: none;
  transition: background-color var(--transition-speed);

  &:hover {
    background-color: var(--card-bg-subtle);
    color: var(--primary);
  }
}

/* Modyfikator: menu rozwija się od PRAWEJ krawędzi triggera zamiast od
   lewej — niezbędne dla dropdownów siedzących blisko prawej krawędzi
   ekranu (np. w navbarze), żeby panel nie wystawał poza viewport. */
/* Aktywna pozycja (bieżąca strona) - klasę nadaje js/modules/molique-navbar-active.js.
   Reguła mieszka tutaj, a nie w _navbar.scss, żeby moduł był samowystarczalny. */
.dropdown-item.is-active {
  color: var(--primary);
  font-weight: var(--fw-bold);
}

.dropdown-menu-end {
  left: auto;
  right: 0;
}

/* =========================================
   4.1. DROPDOWN JAKO POPOVER (Top Layer)
   ========================================= */
/* Zalecany wariant POZA navbarem (tabele, karty, modale, przewijane
   kontenery): dowolny istniejący przycisk z [popovertarget="ID"] +
   `.dropdown-menu` z atrybutem [popover] i tym samym `id`. Atrybut
   [popover] przenosi menu do top layer przeglądarki — koniec przycinania
   przez overflow przodków — a Esc i klik poza menu zamykają je natywnie
   (light dismiss).

   Pozycjonowanie: popover otwarty przez [popovertarget] dostaje swój
   przycisk jako NIEJAWNY anchor (position-anchor: auto — wartość
   domyślna), więc anchor() działa bez wrappera .dropdown, bez anchor-name
   i bez anchor-scope. To dlatego ten wariant można doczepić do dowolnego
   buttona jedną parą atrybutów. */
.dropdown-menu[popover] {
  /* Reset domyślnych stylów UA popovera (position:fixed + inset:0 +
     margin:auto centruje na ekranie) */
  position: absolute;
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
  margin: 4px 0 0 0;
  color: var(--text-main);

  /* Fallback dla przeglądarek bez CSS Anchor Positioning (starszy
     Firefox): menu otwiera się jako wyśrodkowany panel — nadal w top
     layer, więc nic go nie przycina. */
  @supports not (top: anchor(bottom)) {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(320px, calc(100vw - 2rem));
    height: fit-content;
  }
}

/* Wyrównanie do prawej krawędzi przycisku — tylko tam, gdzie działa
   anchor positioning (w fallbacku menu i tak jest wyśrodkowane). */
@supports (top: anchor(bottom)) {
  .dropdown-menu-end[popover] {
    left: auto;
    right: anchor(right);
  }
}
```

## Plik: `components/_form-base.scss`

```scss
// molique - Bazowy input, select, textarea, floating labels i walidacja.
@layer components {
  /* =========================================
     1. BAZOWY INPUT & SELECT
     ========================================= */
  .input {
    --input-border-width: 1px;
    --input-padding-y: calc(var(--spacing-unit) * 1.25);
    display: block;
    width: 100%;
    padding: var(--input-padding-y) calc(var(--spacing-unit) * 2);
    font-family: var(--font-family-base);
    font-weight: var(--fw-medium);
    line-height: 1.5;
    color: var(--text-main);
    background-color: var(--bg-surface);
    background-clip: padding-box;
    border: var(--input-border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);

     /* --- WARIANTY WIELKOŚCI ---
        Działają na każdym elemencie noszącym klasę .input: input, select i textarea.
        Sam .input (bez modyfikatora) to wariant środkowy ("md"). */

    /* Kompaktowy (Idealny do tabel, popoverów i małych widgetów) */
    &.input-sm {
      --input-padding-y: calc(var(--spacing-unit) * 0.75);
      padding: var(--input-padding-y) calc(var(--spacing-unit) * 1.5);
      font-size: 0.8125rem; /* Mniejszy font */
      border-radius: calc(var(--border-radius) * 0.8);
      /* Nadpisujemy globalne 44px dla mobile, jeśli używamy input-sm */
      min-height: 32px !important;
    }

    /* Duży (Idealny do wyszukiwarek Hero i głównych formularzy) */
    &.input-lg {
      --input-padding-y: calc(var(--spacing-unit) * 1.5);
      padding: var(--input-padding-y) calc(var(--spacing-unit) * 2.5);
      font-size: 1.125rem; /* Większy font */
      border-radius: calc(var(--border-radius) * 1.2);
      min-height: 56px !important;
    }


    &:focus {
      border-color: var(--primary);
      outline: 0;
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
    }

    &::placeholder {
      color: var(--text-muted);
      opacity: 0.6;
    }

    &:disabled, &[readonly] {
      background-color: var(--bg-body);
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  /* Customowa strzałka dla Selecta */
  select.input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right calc(var(--spacing-unit) * 1.5) center;
    background-size: 16px 12px;
    padding-right: calc(var(--spacing-unit) * 4);
    cursor: pointer;

    /* .input-sm/.input-lg nadpisują padding skrótowo (wszystkie strony) —
       tu przywracamy miejsce po prawej na strzałkę, żeby jej nie zasłaniać. */
    &.input-sm { padding-right: calc(var(--spacing-unit) * 3); }
    &.input-lg { padding-right: calc(var(--spacing-unit) * 5); }
  }

  /* =========================================
     2. NATYWNA WALIDACJA (Bez JS)
     ========================================= */
  .input:user-valid {
    border-color: var(--success);
    &:focus { box-shadow: 0 0 0 var(--focus-ring-width) rgba(var(--success-rgb), 0.15); }
  }

  .input:user-invalid {
    border-color: var(--danger);
    &:focus { box-shadow: 0 0 0 var(--focus-ring-width) rgba(var(--danger-rgb), 0.15); }
  }

  .feedback-invalid {
    display: none;
    width: 100%;
    margin-top: calc(var(--spacing-unit) * 0.5);
    font-size: 0.875em;
    color: var(--danger);
  }

  .input:user-invalid ~ .feedback-invalid {
    display: block;
    animation: fadeIn var(--transition-speed) ease;
  }

  /* =========================================
     3. TEXTAREA: TRYB "JEDNA LINIJKA" (Auto-Expand, Zero JS)
     ========================================= */
  .textarea-expandable {
    /* Do ilu wierszy pole ma się rozwinąć — nadpisywalne per instancja:
       style="--textarea-rows-expanded: 10;" */
    --textarea-rows-expanded: 6;

    resize: none;
    overflow-y: hidden;
    /* Zmiana wysokości to reflow, więc zgodnie ze Złotą Zasadą GPU
       (animujemy tylko transform/opacity) — przełącznik jest natychmiastowy. */
    transition: none;
    height: calc(1lh + (var(--input-padding-y, calc(var(--spacing-unit) * 1.25)) * 2) + (var(--input-border-width) * 2));

    /* Rozwinięte: pole aktywne LUB posiadające treść — dzięki :not(:placeholder-shown)
       tekst nie znika z powrotem do jednej linijki po samej utracie fokusu.
       WYMAGA atrybutu placeholder (choćby placeholder=" ") na <textarea>. */
    &:focus,
    &:not(:placeholder-shown) {
      height: calc(var(--textarea-rows-expanded) * 1lh + (var(--input-padding-y, calc(var(--spacing-unit) * 1.25)) * 2) + (var(--input-border-width) * 2));
      overflow-y: auto;
    }

    /* Fallback: przeglądarki bez wsparcia jednostki `lh` (np. starsze Safari) */
    @supports not (height: 1lh) {
      height: calc(1.5em + (var(--input-padding-y, calc(var(--spacing-unit) * 1.25)) * 2));

      &:focus,
      &:not(:placeholder-shown) {
        height: calc(var(--textarea-rows-expanded) * 1.5em + (var(--input-padding-y, calc(var(--spacing-unit) * 1.25)) * 2));
      }
    }
  }
}
```

## Plik: `components/_form-check.scss`

```scss
// molique - Checkboxy i radio (custom appearance).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     1. CHECKBOXY I RADIO
     ========================================= */
  .form-check {
    display: flex;
    align-items: center;
    margin-bottom: calc(var(--spacing-unit) * 1);
  }

  .form-check-input {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    margin: 0; 
    margin-right: calc(var(--spacing-unit) * 1.5);
    flex-shrink: 0; 
    background-color: var(--bg-body);
    border: 2px solid var(--border-color);
    border-radius: calc(var(--border-radius) / 2);
    cursor: pointer;
    transition: background var(--transition-speed), border-color var(--transition-speed);
    position: relative;
  }

  .form-check-input[type="radio"] { border-radius: 50%; }

  .form-check-input:checked {
    background-color: var(--primary);
    border-color: var(--primary);
  }

  .form-check-input[type="checkbox"]:checked {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
    background-size: 70%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .form-check-input[type="radio"]:checked {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3ccircle cx='10' cy='10' r='5' fill='%23fff'/%3e%3c/svg%3e");
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .form-check-label {
    cursor: pointer;
    color: var(--text-main);
    user-select: none;
    margin: 0;
    line-height: 1.25rem; 
  }
}
```

## Plik: `components/_form-file-upload.scss`

```scss
// molique - Custom file upload (z wariantem animowanym).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     3. CUSTOM FILE UPLOAD
     ========================================= */
  .file-upload {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing-unit) * 4);
    border: 2px dashed var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-surface);
    transition: all var(--transition-speed);
    text-align: center;
    cursor: pointer;

    &:hover, &:focus-within {
      border-color: var(--primary);
      background-color: rgba(var(--primary-rgb), 0.03);
    }

    input[type="file"] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    .file-upload-icon {
      font-size: 2rem;
      color: var(--text-muted);
      margin-bottom: calc(var(--spacing-unit) * 1);
      transition: color var(--transition-speed), transform var(--transition-speed);
    }

    &:hover .file-upload-icon {
      color: var(--primary);
      transform: translateY(-5px);
    }
  }

  .file-upload-animated {
    border: none; 
    background-image: 
      linear-gradient(to right, var(--border-color) 50%, transparent 50%),
      linear-gradient(to bottom, var(--border-color) 50%, transparent 50%),
      linear-gradient(to left, var(--border-color) 50%, transparent 50%),
      linear-gradient(to top, var(--border-color) 50%, transparent 50%);
    background-size: 16px 2px, 2px 16px, 16px 2px, 2px 16px;
    background-position: 0 0, 100% 0, 0 100%, 0 0;
    background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
    
    &:hover, &:focus-within {
      background-color: rgba(var(--primary-rgb), 0.03);
      background-image: 
        linear-gradient(to right, var(--primary) 50%, transparent 50%),
        linear-gradient(to bottom, var(--primary) 50%, transparent 50%),
        linear-gradient(to left, var(--primary) 50%, transparent 50%),
        linear-gradient(to top, var(--primary) 50%, transparent 50%);
      animation: marchingAnts 0.6s linear infinite;
    }

    /* UWAGA: input[type="file"] celowo POZA tą listą — musi zachować
       position: absolute z bazowego .file-upload (niewidoczny overlay
       na całej karcie, z-index: 2 ma już z bazy). Nadpisanie na relative
       wprowadzało go do układu i spychało zawartość karty w dół. */
    .file-upload-icon, h4, p, .file-upload-name {
      position: relative;
      z-index: 2;
    }
  }

  @keyframes marchingAnts {
    0% { background-position: 0 0, 100% 0, 0 100%, 0 0; }
    100% { background-position: 16px 0, 100% 16px, -16px 100%, 0 -16px; }
  }
}
```

## Plik: `components/_form-groups.scss`

```scss
// molique - Input groups: laczenie pol z przyciskami i prefiksami.
@layer components {
  /* =========================================
     1. INPUT GROUPS (Zgrupowane pola i przyciski)
     ========================================= */
  .input-group {
    display: flex;
    align-items: stretch;
    width: 100%;
    border-radius: var(--border-radius);
    transition: box-shadow var(--transition-speed);

    /* Focus na całej grupie */
    &:focus-within {
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
      
      > .input, > .btn, > .input-group-text {
        border-color: var(--primary) !important;
      }
    }

    /* 1. BAZA: Wszystkie elementy w grupie */
    > .input, 
    > .btn, 
    > .input-group-text {
      position: relative;
      margin-bottom: 0;
      /* ŁOPATOLOGICZNIE: Zabijamy wszystkie rogi każdemu elementowi */
      border-radius: 0 !important; 
      
      /* Wyłączamy indywidualny focus i walidację */
      &:focus, &:user-valid, &:user-invalid {
        box-shadow: none !important;
        border-color: var(--border-color) !important;
        z-index: 3;
      }
    }

    /* 2. NAKŁADANIE RAMEK: Każdy element (oprócz pierwszego) wsuwa się pod poprzednika */
    > .input + .input,
    > .input + .btn,
    > .input + .input-group-text,
    > .btn + .input,
    > .btn + .btn,
    > .btn + .input-group-text,
    > .input-group-text + .input,
    > .input-group-text + .btn,
    > .input-group-text + .input-group-text {
      margin-left: -1px;
    }

    /* 3. ODZYSKIWANIE ROGÓW: Tylko skrajne elementy */
    > :first-child {
      border-top-left-radius: var(--border-radius) !important;
      border-bottom-left-radius: var(--border-radius) !important;
    }

    > :last-child {
      border-top-right-radius: var(--border-radius) !important;
      border-bottom-right-radius: var(--border-radius) !important;
    }

    /* 4. SPECYFIKA ELEMENTÓW */
    > .input {
      flex: 1 1 auto;
      width: 1%;
      min-width: 0;
    }

    > .btn {
      z-index: 2;
      border: 1px solid var(--border-color);
      
      &:hover { 
        z-index: 3; 
        background-color: var(--card-bg-subtle);
      }
    }
  }

  .input-group-text {
    --input-border-width: 1px;
    display: flex;
    align-items: center;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    font-weight: var(--fw-medium);
    color: var(--text-muted);
    text-align: center;
    white-space: nowrap;
    background-color: var(--card-bg-subtle);
    border: var(--input-border-width) solid var(--border-color);
    min-height: var(--target-size-min); 
    transition: border-color var(--transition-speed);
  }

  /* =========================================
     2. FLOATING LABELS
     ========================================= */
  .form-floating {
    position: relative;
    margin-bottom: calc(var(--spacing-unit) * 2);

    label {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      padding: 1rem 0.75rem;
      pointer-events: none;
      transform-origin: 0 0;
      transition: opacity var(--transition-speed), transform var(--transition-speed);
      color: var(--text-muted);
    }

    .input:focus ~ label,
    .input:not(:placeholder-shown) ~ label {
      opacity: 0.8;
      transform: scale(0.85) translateY(-0.75rem) translateX(0.15rem);
    }

    .input {
      padding-top: 1.625rem;
      padding-bottom: 0.625rem;
    }
  }
}
```

## Plik: `components/_form-input-range.scss`

```scss
// molique - Specyficzne inputy: range, date, color, number.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     2. SPECYFICZNE INPUTY (Range, Date, Color)
     ========================================= */
  .input-range {
    appearance: none;
    width: 100%;
    height: 8px;
    background: var(--border-color);
    border-radius: 1rem;
    outline: none;
    cursor: pointer;
    overflow: hidden; 

    &::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid var(--primary);
      box-shadow: -10010px 0 0 10000px var(--primary), 0 2px 5px rgba(0,0,0,0.15);
      transition: transform var(--transition-speed);
    }

    &::-webkit-slider-thumb:hover { transform: scale(1.15); }
    &::-moz-range-progress { background: var(--primary); height: 8px; border-radius: 1rem; }
    &::-moz-range-thumb {
      width: 16px; height: 16px; border-radius: 50%; background: #fff;
      border: 2px solid var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      transition: transform var(--transition-speed);
    }
    &::-moz-range-thumb:hover { transform: scale(1.15); }
  }

  /* Number: chowamy natywne strzałki (spinner) - w gęstych formularzach
     B2B wyglądają obco i gryzą się z własnymi przyciskami krokowania.
     Zamiennik to kontrolka .qty-input (przyciski + / -), a wartość nadal
     można zmieniać klawiaturą (góra/dół) i scrollem. */
  input[type="number"].input {
    -moz-appearance: textfield;
    appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  input[type="date"].input,
  input[type="time"].input,
  input[type="datetime-local"].input {
    appearance: none;
    position: relative;
    cursor: pointer;

    &::-webkit-calendar-picker-indicator {
      background-color: transparent;
      padding: 4px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity var(--transition-speed), background-color var(--transition-speed);
      border-radius: 4px;

      &:hover { opacity: 1; background-color: var(--card-bg-subtle); }
    }
  }

  .input-color {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: var(--target-size-min);
    height: var(--target-size-min);
    padding: 0;
    background-color: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);

    &::-webkit-color-swatch-wrapper { padding: 4px; }
    &::-webkit-color-swatch { border: none; border-radius: calc(var(--border-radius) - 4px); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1); }
    &::-moz-color-swatch { border: none; border-radius: calc(var(--border-radius) - 4px); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1); }

    &:focus-visible {
      outline: 0;
      border-color: var(--primary);
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
    }
  }
}
```

## Plik: `components/_form-select-custom.scss`

```scss
// molique - Premium Multi Select (kategorie + wielokrotny wybor).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     5. PREMIUM MULTI SELECT (Wzorowany na UI)
     ========================================= */
  .custom-select {
    position: relative;
    width: 100%;
    /* Ogranicza widoczność anchor-name poniżej do tej instancji komponentu,
       żeby wiele .custom-select na jednej stronie nie "podpinało się" nawzajem. */
    anchor-scope: --custom-select-trigger;

    /* Stan "otwarty" odczytujemy z popovera przez :has() — popover
       (w przeciwieństwie do <details>) nie zostawia atrybutu [open]
       na elemencie nadrzędnym. */
    &:has(.custom-select-dropdown:popover-open) .custom-select-trigger {
      border-color: var(--primary);
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
      .icon-chevron { transform: rotate(180deg); }
    }
  }

  .custom-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--target-size-min);
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    text-align: left;
    /* Trigger to <button> — w przeciwieństwie do <summary> nie dziedziczy
       fontu automatycznie. */
    font: inherit;
    color: var(--text-main);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
    /* Punkt zaczepienia dla .custom-select-dropdown (CSS Anchor Positioning) */
    anchor-name: --custom-select-trigger;

    .icon-chevron {
      transition: transform var(--transition-speed);
      color: var(--text-muted);
    }
  }

  .custom-select-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px; 
    flex: 1;
    
    .badge {
      padding: 4px 10px; 
      font-size: 0.75rem;
      border-radius: 50px; 
      font-weight: var(--fw-medium);
    }
  }

  .custom-select-dropdown {
    /* Atrybut [popover] w HTML przenosi dropdown do top layer przeglądarki —
       dzięki temu NIE jest przycinany przez overflow przodków (np. przewijany
       .card-body w modalu) i renderuje się nad otwartym <dialog>. Zamykanie
       na Esc i klik poza menu obsługuje natywnie light dismiss.
       Pozycję względem przycisku ustala CSS Anchor Positioning (Chrome 125+,
       Safari 26+). position-anchor MUSI być ustawiony — bez niego
       anchor()/anchor-size() nie mają się do czego odnieść. */
    position: absolute;
    position-anchor: --custom-select-trigger;
    /* Reset domyślnych stylów UA popovera (inset: 0 + margin: auto centruje) */
    inset: auto;
    /* Przyklejamy górę popovera do dołu przycisku (anchor) */
    top: anchor(bottom);
    /* Wyrównujemy lewą krawędź popovera z lewą krawędzią przycisku */
    left: anchor(left);
    /* Szerokość taka sama jak przycisk */
    width: anchor-size(width);
    /* z-index istotny tylko w fallbacku — w top layer o kolejności decyduje
       moment otwarcia, nie z-index (sticky nagłówki tabel z z-index:10
       przestają być problemem). */
    z-index: var(--z-index-dropdown);

    margin: 4px 0 0 0;
    padding: 0;
    min-width: 180px;
    color: var(--text-main);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg, 12px);
    box-shadow: var(--shadow-lg);
    overflow: hidden;

    &:popover-open {
      display: flex;
      flex-direction: column;
      animation: fadeInDown 0.2s ease;
    }

    /* Fallback dla przeglądarek bez CSS Anchor Positioning (starszy Firefox):
       dropdown otwiera się jako wyśrodkowany panel — nadal w top layer,
       więc nic go nie przycina. */
    @supports not (top: anchor(bottom)) {
      position: fixed;
      inset: 0;
      margin: auto;
      width: min(400px, calc(100vw - 2rem));
      height: fit-content;
    }
  }

  .custom-select-search {
    padding: calc(var(--spacing-unit) * 1);
    border-bottom: 1px solid var(--border-color);
    position: relative;
    
    .search-icon {
      position: absolute;
      left: calc(var(--spacing-unit) * 2.5);
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none; 
      z-index: 2;
    }

    .input {
      padding-left: calc(var(--spacing-unit) * 4.5);
      
      &:user-valid, &:user-invalid {
        border-color: var(--border-color) !important;
      }
      &:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color) !important;
      }
    }
  }

  .custom-select-category {
    font-size: 0.7rem;
    font-weight: var(--fw-bold);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    margin-top: calc(var(--spacing-unit) * 1);
    
    &:first-child { margin-top: 0; }
  }

  .custom-select-list {
    max-height: 300px;
    overflow-y: auto;
    padding: calc(var(--spacing-unit) * 2);
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) * 1);
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  }

  .custom-select-option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 2);
    padding: calc(var(--spacing-unit) * 1.5);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-speed);

    &:hover {
      background-color: var(--card-bg-subtle);
    }

    &:has(input:checked) {
      border-color: var(--primary);
      background-color: rgba(var(--primary-rgb), 0.05);
    }

    input[type="checkbox"] {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0 0 0 auto; 
      background-color: var(--bg-body);
      border: 2px solid var(--border-color);
      border-radius: calc(var(--border-radius) / 2);
      cursor: pointer;
      transition: background var(--transition-speed), border-color var(--transition-speed);
      
      &:checked {
        background-color: var(--primary);
        border-color: var(--primary);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
        background-size: 70%;
        background-position: center;
        background-repeat: no-repeat;
      }
    }
  }
}
```

## Plik: `components/_form-select-search.scss`

```scss
// molique - Searchable Select (combobox na Popover API).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     4. SEARCHABLE SELECT (Combobox)
     ========================================= */
  .select-search {
    position: relative;
    width: 100%;
    /* Ogranicza widoczność anchor-name poniżej do tej instancji komponentu,
       żeby wiele .select-search na jednej stronie nie "podpinało się" nawzajem. */
    anchor-scope: --select-search-trigger;

    /* Stan "otwarty" odczytujemy z popovera przez :has() — popover
       (w przeciwieństwie do <details>) nie zostawia atrybutu [open]
       na elemencie nadrzędnym. */
    &:has(.select-search-menu:popover-open) .select-search-trigger {
      border-color: var(--primary);
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
      &::after { transform: rotate(180deg); }
    }
  }

  .select-search-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    text-align: left;
    /* Trigger to <button> — w przeciwieństwie do <summary> nie dziedziczy
       fontu automatycznie. */
    font: inherit;
    cursor: pointer;
    user-select: none;
    background-color: var(--bg-surface);
    /* Punkt zaczepienia dla .select-search-menu (CSS Anchor Positioning) */
    anchor-name: --select-search-trigger;

    &::after {
      content: "▼";
      font-size: 0.7rem;
      color: var(--text-muted);
      transition: transform var(--transition-speed);
    }
  }

  .select-search-menu {
    /* Atrybut [popover] w HTML przenosi menu do top layer przeglądarki —
       dzięki temu NIE jest przycinane przez overflow przodków (np. przewijany
       .card-body w modalu) i renderuje się nad otwartym <dialog>. Zamykanie
       na Esc i klik poza menu obsługuje natywnie light dismiss. */
    position: absolute;
    position-anchor: --select-search-trigger;
    /* Reset domyślnych stylów UA popovera (inset: 0 + margin: auto centruje) */
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);
    width: anchor-size(width);
    margin: 4px 0 0 0;
    max-height: 300px;
    padding: calc(var(--spacing-unit) * 1);
    color: var(--text-main);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
    /* z-index istotny tylko w fallbacku — w top layer o kolejności decyduje
       moment otwarcia, nie z-index. */
    z-index: var(--z-index-dropdown);

    &:popover-open {
      display: flex;
      flex-direction: column;
      animation: fadeInDown 0.2s ease;
    }

    /* Fallback dla przeglądarek bez CSS Anchor Positioning (starszy Firefox):
       menu otwiera się jako wyśrodkowany panel — nadal w top layer, więc
       nic go nie przycina. */
    @supports not (top: anchor(bottom)) {
      position: fixed;
      inset: 0;
      margin: auto;
      width: min(400px, calc(100vw - 2rem));
      height: fit-content;
    }
  }

  .select-search-input {
    margin-bottom: calc(var(--spacing-unit) * 1);
    min-height: 36px !important; 
    padding: 0.5rem 0.75rem;
  }

  .select-search-list {
    overflow-y: auto;
    flex: 1;
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  }

  .select-search-option {
    cursor: pointer;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    border-radius: calc(var(--border-radius) / 2);
    transition: background-color var(--transition-speed);
    
    &:hover { background-color: var(--card-bg-subtle); }
    &.is-hidden { display: none !important; }
    &.is-selected {
      background-color: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);
      font-weight: var(--fw-bold);
    }
  }
}
```

## Plik: `components/_form-switch.scss`

```scss
// molique - Przelaczniki (switche) + warianty square/outline.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     1.5. PRZEŁĄCZNIKI (Switche iOS Style)
     ========================================= */
  .form-switch {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 1.5);
    cursor: pointer;
  }

  .form-switch-input {
    appearance: none;
    width: 44px;
    height: 24px;
    background-color: var(--border-color);
    border-radius: 50px;
    position: relative;
    cursor: pointer;
    transition: background-color var(--transition-speed);
    margin: 0;
    display: flex;
    align-items: center;

    &::after {
      content: '';
      position: absolute;
      left: 2px;
      width: 20px;
      height: 20px;
      background-color: #fff;
      border-radius: 50%;
      transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
    }

    &:checked {
      background-color: var(--success);
      &::after {
        transform: translateX(20px);
      }
    }
  }

  .form-switch-label {
    font-weight: var(--fw-medium);
    color: var(--text-main);
    user-select: none;
  }

  .form-switch-square .form-switch-input {
    border-radius: var(--border-radius);
    &::after { border-radius: calc(var(--border-radius) - 2px); }
  }

  .form-switch-outline .form-switch-input {
    background-color: transparent;
    border: 2px solid var(--border-color);
    
    &::after {
      background-color: var(--border-color);
      box-shadow: none;
      width: 16px;
      height: 16px;
      left: 2px; 
    }
    
    &:checked {
      background-color: transparent;
      border-color: var(--success);
      &::after {
        background-color: var(--success);
        transform: translateX(20px);
      }
    }
  }
}
```

## Plik: `components/_grid-expand.scss`

```scss
// molique - Grid Expand: plynne rozwijanie bez JS.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   5. GRID EXPAND (Płynne rozwijanie bez JS)
   ========================================= */
.grid-expand {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  & > .grid-expand-inner {
    overflow: hidden;
  }
  
  &.is-open,
  details[open] & {
    grid-template-rows: 1fr;
  }
}
```

## Plik: `components/_hero.scss`

```scss
/**
 * molique - Sekcje Hero i Nakładki (Overlay)
 * Sekcje powitalne ze zdjęciem w tle, przyciemniającą nakładką (Overlay)
 * oraz zaawansowanym systemem wycinanych narożników (Hero Cutout).
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
  /* =========================================
     1. PAGE HEADER (Hero ze zdjęciem w tle)
     ========================================= */
  .page-header {
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* Dodaj do dowolnego kontenera z .overlay w środku — odcina wystające
     rogi nakładki i daje jej kontekst pozycjonowania (position:relative). */
  .has-overlay {
    position: relative;
    overflow: hidden;
  }

  /* =========================================
     2. OVERLAY (Przyciemniająca nakładka)
     ========================================= */
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* --- Kolory nakładki --- */
  /* overlay-dark na literale (jak overlay-light): nakładka ma ZAWSZE
     przyciemniać zdjęcie pod jasnym tekstem hero, a dark mode odwraca
     var(--dark) do prawie białego - "przyciemnienie" stawało się
     rozjaśnieniem i biały tekst lądował na jasnym tle. */
  .bg-overlay { background-color: #000; }
  .overlay-dark { background-color: #1E293B; }
  .overlay-primary { background-color: var(--primary); }
  .overlay-light { background-color: #fff; }

  /* --- Przezroczystość nakładki (skok co 10) --- */
  .overlay-10 { opacity: 0.1; }
  .overlay-20 { opacity: 0.2; }
  .overlay-30 { opacity: 0.3; }
  .overlay-40 { opacity: 0.4; }
  .overlay-50 { opacity: 0.5; }
  .overlay-60 { opacity: 0.6; }
  .overlay-70 { opacity: 0.7; }
  .overlay-80 { opacity: 0.8; }
  .overlay-90 { opacity: 0.9; }

  /* =========================================
     3. HERO CUTOUT SYSTEM (Wklęsłe narożniki)
     ========================================= */
  .hero-with-cutout {
    position: relative;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  .cutout-wrapper {
    position: relative;
    background-color: var(--cutout-bg, var(--bg-surface));
  }

  @include mq(md) {
    .hero-with-cutout {
      overflow: hidden;

      img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      }
    }

    .cutout-wrapper {
      z-index: 1;
      /* Promień "wycięcia" w rogu stykającym się ze zdjęciem */
      --cutout-radius: 32px;
    }

    /* Każdy wariant kotwiczy wrapper w danym rogu i wycina PRZECIWLEGŁY
       (stykający się ze zdjęciem) róg samego wrappera łagodnym łukiem —
       stąd "at 0 0" dla br (wycięcie w lewym-górnym rogu wrappera), itd. */
    .cutout-wrapper.cutout-md-br {
      position: absolute;
      right: 0;
      bottom: 0;
      mask-image: radial-gradient(circle var(--cutout-radius) at 0 0, transparent 99%, #fff 100%);
      -webkit-mask-image: radial-gradient(circle var(--cutout-radius) at 0 0, transparent 99%, #fff 100%);
    }

    .cutout-wrapper.cutout-md-bl {
      position: absolute;
      left: 0;
      bottom: 0;
      mask-image: radial-gradient(circle var(--cutout-radius) at 100% 0, transparent 99%, #fff 100%);
      -webkit-mask-image: radial-gradient(circle var(--cutout-radius) at 100% 0, transparent 99%, #fff 100%);
    }

    .cutout-wrapper.cutout-md-tr {
      position: absolute;
      right: 0;
      top: 0;
      mask-image: radial-gradient(circle var(--cutout-radius) at 0 100%, transparent 99%, #fff 100%);
      -webkit-mask-image: radial-gradient(circle var(--cutout-radius) at 0 100%, transparent 99%, #fff 100%);
    }

    .cutout-wrapper.cutout-md-tl {
      position: absolute;
      left: 0;
      top: 0;
      mask-image: radial-gradient(circle var(--cutout-radius) at 100% 100%, transparent 99%, #fff 100%);
      -webkit-mask-image: radial-gradient(circle var(--cutout-radius) at 100% 100%, transparent 99%, #fff 100%);
    }
  }
}
```

## Plik: `components/_language-switch.scss`

```scss
/**
 * molique - Language Switch (przełącznik języka)
 * Trigger (pigułka z flagą + kodem języka) otwiera listę języków jako
 * popover w top layer: <button class="language-switch-trigger"
 * popovertarget="ID"> + .dropdown-menu.language-switch-menu[popover]#ID.
 * Menu kotwiczy się automatycznie do przycisku (niejawny anchor) i nie
 * jest przycinane przez overflow. Flagi: osobne mini-pliki SVG w
 * img/flags/ wstawiane przez <img src="img/flags/pl.svg" alt="">
 * (emoji flag NIE renderują się na Windowsie, a zewnętrzny sprite
 * z <use> nie działa m.in. przy file://). Stary markup
 * <details class="dropdown language-switch"> jest nadal obsługiwany
 * (kompatybilność wstecz).
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
  .language-switch-trigger {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 0.75);
    height: 38px;
    padding: 0 calc(var(--spacing-unit) * 1.5);
    background-color: var(--card-bg-subtle);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-pill, 999px);
    color: var(--text-main);
    /* Trigger to <button> — nie dziedziczy rodziny fontów automatycznie */
    font-family: inherit;
    font-weight: var(--fw-medium);
    font-size: 0.8125rem;
    line-height: 1;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--transition-speed), border-color var(--transition-speed);

    &::-webkit-details-marker { display: none; }

    /* Strzałka wskaźnika — ten sam trik co .dropdown-toggle / .mega-menu-trigger */
    &::after {
      content: '';
      display: inline-block;
      margin-left: calc(var(--spacing-unit) * 0.25);
      border-top: 4px solid;
      border-right: 4px solid transparent;
      border-left: 4px solid transparent;
      color: var(--text-muted);
      transition: transform var(--transition-speed);
    }

    &:hover, &:focus-visible {
      background-color: rgba(var(--primary-rgb), 0.08);
      border-color: rgba(var(--primary-rgb), 0.3);
    }
  }

  /* Obrót strzałki: wariant popover (menu musi stać bezpośrednio za
     przyciskiem) oraz legacy <details>. */
  .language-switch-trigger:has(+ .language-switch-menu:popover-open)::after,
  .language-switch[open] > .language-switch-trigger::after {
    transform: rotate(180deg);
  }

  /* Flaga: plik SVG z img/flags/ w sztywnym pudełku 4:3.
     Wewnętrzna ramka (::after) oddziela jasne pola flag (np. biel PL)
     od tła — bez niej flaga "rozpływa się" na jasnej pigułce. */
  .language-switch-flag {
    position: relative;
    display: inline-flex;
    width: 20px;
    height: 15px;
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;

    img,
    svg {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
      pointer-events: none;
    }
  }

  .language-switch-menu {
    min-width: 190px;
  }

  .language-switch-item {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 1.25);
  }

  .language-switch-name {
    flex: 1;
  }

  /* Checkmark aktywnego języka: ikona SVG w currentColor (font-weight
     zostaje dla legacy markupu ze znakiem tekstowym "✓"). */
  .language-switch-check {
    display: inline-flex;
    align-items: center;
    color: var(--primary);
    font-weight: var(--fw-bold);

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
```

## Plik: `components/_lightbox.scss`

```scss
// molique - Lightbox: galeria pelnoekranowa (markup budowany z JS).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
   3. LIGHTBOX (Galeria pełnoekranowa)
   ========================================= */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: none; /* Zmieniane przez JS na flex */
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-speed);
  
  &.is-active {
    opacity: 1;
  }
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  user-select: none;
  will-change: transform, opacity;
}

.lightbox-top-bar {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 calc(var(--spacing-unit) * 3);
  z-index: 2010;
}

.lightbox-counter {
  color: #fff;
  font-size: 0.875rem;
  font-weight: var(--fw-bold);
}

.lightbox-close {
  color: #fff;
  font-size: 2.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  transition: opacity var(--transition-speed);
  
  &:hover { opacity: 1; }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: none;
  font-size: 3rem;
  cursor: pointer;
  padding: 20px;
  z-index: 2010;
  transition: color var(--transition-speed);
  
  &:hover { color: #fff; }
}

.lightbox-prev { left: 10px; }
.lightbox-next { right: 10px; }

@include mq(sm, max) {
  .lightbox-nav { font-size: 2rem; padding: 10px; }
  .lightbox-content img { max-height: 75vh; }
}
}
```

## Plik: `components/_list-group.scss`

```scss
// molique - List Groups: grupy list.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   7. LIST GROUPS (Grupy list)
   ========================================= */
.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.list-group-item {
  position: relative;
  display: block;
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  color: var(--text-main);
  background-color: var(--bg-body);
  border: 1px solid var(--border-color);
  margin-bottom: -1px;
  text-decoration: none;
  transition: background-color var(--transition-speed), z-index 0s;
}

.list-group-item:first-child {
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.list-group-item:last-child {
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  margin-bottom: 0;
}

.list-group-item.is-active {
  z-index: 2;
  /* Jak w .btn-primary: kolor tekstu podąża za motywem (w dark mode
     primary jaśnieje, literal #fff tracił kontrast) */
  color: var(--btn-text-light);
  background-color: var(--primary);
  border-color: var(--primary);
}

a.list-group-item:hover, button.list-group-item:hover {
  background-color: var(--card-bg-subtle);
  z-index: 1;
}
```

## Plik: `components/_list-icons.scss`

```scss
// molique - List Icons: listy z ikonami (check/arrow/cross).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   8. LIST ICONS (Listy z ikonami)
   ========================================= */
.list-unstyled {
  padding-left: 0;
  list-style: none;
}

.list-icons {
  padding-left: 0;
  list-style: none;
}

.list-icons li {
  position: relative;
  padding-left: calc(var(--spacing-unit) * 3.5);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
}

.list-icons li:last-child { margin-bottom: 0; }

.list-icons li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 18px;
  height: 18px;
  background-color: var(--primary);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.list-icons-check li::before {
  -webkit-mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
  mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
}

.list-icons-arrow li::before {
  -webkit-mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 10h10M11 5l4 5-4 5'/%3e%3c/svg%3e");
  mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 10h10M11 5l4 5-4 5'/%3e%3c/svg%3e");
}

.list-icons-cross li::before {
  -webkit-mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 6l8 8M14 6l-8 8'/%3e%3c/svg%3e");
  mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 6l8 8M14 6l-8 8'/%3e%3c/svg%3e");
}

.list-icons-success li::before { background-color: var(--success); }
.list-icons-danger li::before { background-color: var(--danger); }
.list-icons-dark li::before { background-color: var(--dark); }
```

## Plik: `components/_mega-menu.scss`

```scss
// molique - Mega Menu: <details> + CSS Anchor Positioning, na mobile degraduje sie do akordeonu w offcanvas.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   3. MEGA MENU (<details> + Anchor Positioning — Zero JS, działa na mobile)
   ========================================= */
.mega-menu {
  /* Ogranicza widoczność anchor-name poniżej do tej instancji komponentu,
     żeby wiele .mega-menu na jednej stronie nie "podpinało się" nawzajem
     (ten sam trik co .custom-select w _form-advanced.scss). Celowo BEZ
     position:relative — .mega-menu-content ma się pozycjonować względem
     .navbar (patrz niżej), nie względem tego małego elementu, żeby szeroki
     panel nie wystawał poza ekran, gdy trigger siedzi blisko prawej
     krawędzi navbara. */
  anchor-scope: --mega-menu-trigger;
}

.mega-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.5);
  min-height: var(--target-size-min);
  color: var(--text-muted);
  font-weight: var(--fw-medium);
  cursor: pointer;
  list-style: none;
  transition: color var(--transition-speed);
  /* Punkt zaczepienia dla .mega-menu-content (CSS Anchor Positioning) */
  anchor-name: --mega-menu-trigger;

  &::-webkit-details-marker { display: none; }

  &::after {
    content: '';
    display: inline-block;
    border-top: 4px solid;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    transition: transform var(--transition-speed);
  }

  &:hover {
    color: var(--primary);
  }
}

.mega-menu[open] > .mega-menu-trigger {
  color: var(--primary);

  &::after {
    transform: rotate(180deg);
  }

  /* Niewidzialna "przykrywka" na cały ekran, dopóki menu jest otwarte —
     klik gdziekolwiek poza panelem trafia w <summary> i natywnie zamyka
     <details> (identyczny trik jak .dropdown[open] .dropdown-toggle::before
     powyżej — zero JS potrzebne do zamykania na klik-poza-menu). */
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: var(--z-index-dropdown);
    cursor: default;
  }
}

.mega-menu-content {
  display: none;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 5);
  margin: 0;
  padding: calc(var(--spacing-unit) * 4);
  background-color: var(--bg-surface);
  background-image: radial-gradient(circle at 100% 0%, rgba(var(--primary-rgb), 0.06), transparent 55%);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg, 16px);
  box-shadow: var(--shadow-lg), 0 20px 40px -20px rgba(0, 0, 0, 0.25);

  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease, display 0.25s allow-discrete;
}

.mega-menu[open] > .mega-menu-content {
  display: grid;
  opacity: 1;
}

.mega-menu-group {
  padding-block: calc(var(--spacing-unit) * 2.5);
}

.mega-menu-col-title {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.25);
  margin: 0 0 calc(var(--spacing-unit) * 1.5) 0;
  font-size: 0.8125rem;
  font-weight: var(--fw-bold);
  color: var(--text-main);
}

.mega-menu-col-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--border-radius);
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);

  svg { width: 17px; height: 17px; }
}

.mega-menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing-unit) * 1);
  padding: calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 1);
  margin-inline: calc(var(--spacing-unit) * -1);
  border-radius: var(--border-radius);
  color: var(--text-muted);
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color var(--transition-speed), color var(--transition-speed), transform var(--transition-speed);

  /* Strzałka pojawiająca się na hover — czysto dekoracyjna (opacity/transform,
     GPU-safe), sygnalizuje "przejdź dalej" bez dokładania obrazków. */
  &::after {
    content: '\2192';
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity var(--transition-speed), transform var(--transition-speed);
  }

  &:hover, &:focus-visible {
    background-color: rgba(var(--primary-rgb), 0.08);
    color: var(--primary);
    transform: translateX(2px);

    &::after {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

/* Wyróżniona karta (Featured) — jedna "komórka" siatki, wizualnie
   podniesiona ponad zwykłe kolumny linków (gradient + CTA). */
/* Aktywna pozycja (bieżąca strona) - klasę nadaje js/modules/molique-navbar-active.js.
   Reguła mieszka tutaj, a nie w _navbar.scss, żeby moduł był samowystarczalny. */
.mega-menu-link.is-active {
  color: var(--primary);
  font-weight: var(--fw-bold);
}

.mega-menu-featured {
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--spacing-unit) * 1.5);
  padding: calc(var(--spacing-unit) * 3);
  border-radius: var(--border-radius);
  /* Gradient na literałach, NIE na var(--dark)/var(--primary): karta jest
     celowo ZAWSZE ciemna z białym tekstem (jak sidebar), a dark mode
     odwraca --dark do prawie białego i rozjaśnia --primary - z flipowanymi
     zmiennymi biały tekst lądował na jasnym tle. */
  background-image: linear-gradient(145deg, #1E293B, #0284C7);
  color: #fff;
}

.mega-menu-featured-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  background-color: rgba(255, 255, 255, 0.15);
  font-size: 1.25rem;
}

.mega-menu-featured-title {
  margin: 0;
  font-size: 1rem;
  font-weight: var(--fw-bold);
  color: #fff;
}

.mega-menu-featured-text {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
}

.mega-menu-featured-link {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.75);
  margin-top: auto;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.75);
  border-radius: var(--border-radius-pill, 999px);
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: var(--fw-medium);
  text-decoration: none;
  transition: background-color var(--transition-speed), transform var(--transition-speed);

  &:hover, &:focus-visible {
    background-color: rgba(255, 255, 255, 0.28);
    transform: translateX(2px);
  }
}

@include mq(md) {
  .mega-menu-content {
    position: absolute;
    /* Pion: przyklejony pod TRIGGEREM (anchor positioning). Poziom: NIE
       wyrównujemy do triggera, tylko wyśrodkowujemy względem całego
       .navbar (position:relative, patrz sekcja 1) — dzięki temu szeroki
       panel (do 980px) zawsze mieści się w oknie, niezależnie od tego, czy
       trigger siedzi po lewej, w środku czy po prawej stronie navbara. */
    position-anchor: --mega-menu-trigger;
    top: anchor(bottom);
    left: 50%;
    margin-top: calc(var(--spacing-unit) * 1);
    width: min(94vw, 980px);
    /* FIX: przy wielu wąskich kolumnach (dużo pozycji w menu) panel może
       zrobić się wyższy niż viewport — ograniczamy wysokość i włączamy
       wewnętrzny scroll zamiast wypychania poza ekran. */
    max-height: min(78vh, 680px);
    overflow-y: auto;
    z-index: calc(var(--z-index-dropdown) + 1);
    transform: translateX(-50%) translateY(-8px);

    /* Fallback dla przeglądarek bez wsparcia CSS Anchor Positioning:
       "top" liczony od dołu całego .navbar zamiast od samego triggera. */
    @supports not (top: anchor(bottom)) {
      top: 100%;
    }
  }

  .mega-menu[open] > .mega-menu-content {
    transform: translateX(-50%) translateY(0);

    @starting-style {
      transform: translateX(-50%) translateY(-8px);
    }
  }
}

@include mq(sm, max) {
  .mega-menu-content {
    position: static;
    grid-template-columns: 1fr;
    gap: calc(var(--spacing-unit) * 3);
    width: 100%;
    margin-top: calc(var(--spacing-unit) * 1);
    box-shadow: none;
    border: none;
    background-color: rgba(0, 0, 0, 0.02);

    /* Na mobile pokazuje/chowa się natychmiast, bez animacji — spójnie z
       .admin-nav-submenu, który też jest oparty na <details>. */
    opacity: 1;
    transform: none;
    transition: none;
  }

  .mega-menu-group {
    padding-block: calc(var(--spacing-unit) * 1.5);
  }

  .mega-menu-featured {
    grid-row: auto;
  }
}
```

## Plik: `components/_modal-confirm.scss`

```scss
// molique - Confirm modal: maly modal potwierdzenia.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
   1.1. CONFIRM MODAL (Mały modal potwierdzenia)
   ========================================= */
/* Modyfikator szerokości */
.modal-sm {
  max-width: 360px;
}

/* Specyficzny układ dla potwierdzeń (bez nagłówka, wyśrodkowany) */
.modal-confirm .card-body {
  text-align: center;
  padding: calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 2);
}

.modal-confirm-icon {
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: calc(var(--spacing-unit) * 2);
  /* Używamy animacji z _animations.scss dla zwrócenia uwagi */
  display: inline-block;
}

.modal-confirm .card-footer {
  display: flex;
  gap: calc(var(--spacing-unit) * 2);
  background-color: transparent; /* Czysty wygląd bez szarego tła */
  border-top: none;
  padding: 0 calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 3);
}

.modal-confirm .card-footer .btn {
  flex: 1; /* Przyciski zajmują równo po 50% szerokości */
}
}
```

## Plik: `components/_modal-context.scss`

```scss
// molique - Context modal: waski panel boczny/dolny.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
   2. CONTEXT MODAL (Wąskie menu kontekstowe)
   ========================================= */
.modal-context {
  max-width: 400px; 
  margin-right: calc(var(--spacing-unit) * 2);
  margin-left: auto;
  transform: translateX(20px);
  
  &[open] { transform: translateX(0); }
  @starting-style { &[open] { transform: translateX(20px); } }
}

.modal-context .card {
  border-radius: var(--border-radius);
}

.modal-context .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  border-top-left-radius: calc(var(--border-radius) - 1px);
  border-top-right-radius: calc(var(--border-radius) - 1px);
  
  h3 { margin: 0; font-size: 1.125rem; }
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: color var(--transition-speed);
  width: var(--target-size-min);
  height: var(--target-size-min);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -12px;

  &:hover { color: var(--danger); }
}

/* Przycisk zamykania w nagłówku modala dostaje fokus automatycznie przy
   showModal() (przeglądarka focusuje pierwszy fokusowalny element okna),
   więc pełny pierścień fokusu świeci się od razu po otwarciu i wygląda
   jak błąd renderowania. Zamieniamy go na subtelniejszy wskaźnik — nadal
   widoczny przy nawigacji klawiaturą (A11y), ale nie krzyczący. */
.modal-dialog .card-header .btn-action:focus-visible,
.modal-dialog .card-header .modal-close-btn:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--focus-ring-color);
  background-color: var(--card-bg-subtle);
}

.modal-context .card-body {
  padding: calc(var(--spacing-unit) * 3);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}

.modal-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: calc(var(--spacing-unit) * 1) 0;
  width: 100%;
}

.modal-action-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.modal-action-btn {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
  width: 100%;
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  background: transparent;
  border: none;
  border-radius: calc(var(--border-radius) / 2);
  color: var(--text-main);
  font-weight: var(--fw-medium);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-speed), color var(--transition-speed);
  min-height: var(--target-size-min) !important;

  &:hover { background-color: var(--card-bg-subtle); color: var(--primary); }
  &.text-danger:hover { background-color: rgba(var(--danger-rgb), 0.1); color: var(--danger); }
}

@include mq(sm, max) {
  .modal-context {
    max-width: 100%;
    margin: auto 0 0 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    transform: translateY(100%);
    
    /* NAPRAWA 5: Bottom Sheet na mobile nie powinien zajmować 100% ekranu, 
       żeby użytkownik widział, że to modal */
    max-height: 90vh;
    max-height: 90dvh;
    
    &[open] { transform: translateY(0); }
    @starting-style { &[open] { transform: translateY(100%); } }
  }
  
  .modal-context .card {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
}
```

## Plik: `components/_modal.scss`

```scss
// molique - Natywny modal <dialog> + backdrop i animacje wejscia.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
/* =========================================
   1. NATYWNY MODAL (<dialog>)
   ========================================= */
.modal-dialog {
  border: none;
  padding: 0;
  background: transparent;
  /* UA daje <dialog> color: CanvasText, co przerywa dziedziczenie
     koloru z body - jawny kolor motywu przywraca łańcuch dziedziczenia
     (m.in. dla nagłówków z color: inherit) niezależnie od color-scheme. */
  color: var(--text-main);
  overflow: visible;
  
  max-width: 600px;
  width: 90%;
  margin: auto; 

  /* NAPRAWA 1: Ograniczamy wysokość modala do wielkości ekranu (z małym marginesem) */
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem); /* Nowoczesne jednostki dla mobile */
  
  /* NAPRAWA 2: Modal staje się kontenerem flex */
  display: flex;
  flex-direction: column;

  &:not([open]) {
    display: none !important;
    pointer-events: none !important;
  }

  &::backdrop {
    /* Literal zamiast rgba(var(--dark-rgb)): przyciemnienie tła ma ZAWSZE
       przyciemniać, a dark mode odwraca --dark-rgb do jasnego - backdrop
       robił się jasną mgłą, wbrew idei ciemnego motywu. */
    background-color: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(4px);
  }

  transition: 
    opacity var(--transition-speed) ease, 
    transform var(--transition-speed) ease,
    display var(--transition-speed) ease allow-discrete, 
    overlay var(--transition-speed) ease allow-discrete;
  
  opacity: 0;
  transform: translateY(-20px);

  &[open] {
    opacity: 1;
    transform: translateY(0);
  }

  @starting-style {
    &[open] {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
}

/* Karta wewnątrz modala */
.modal-dialog .card {
  margin: 0;
  box-shadow: var(--shadow-lg);
  
  /* NAPRAWA 3: Karta nie może być wyższa niż sam modal */
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

/* NAPRAWA 4: MAGIA UX - Tylko ciało karty się scrolluje! */
.modal-dialog .card-body {
  overflow-y: auto;
  overscroll-behavior: contain; /* Zapobiega scrollowaniu tła strony pod modalem */
  
  /* Elegancki, cienki scrollbar */
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
}
}
```

## Plik: `components/_nav-filters.scss`

```scss
// molique - Nav filters: filtry portfolio (+ keyframes filterPop).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   7. NAV FILTERS (Filtry Portfolio)
   ========================================= */
.nav-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin-bottom: calc(var(--spacing-unit) * 4);
  gap: calc(var(--spacing-unit) * 1);
  
  button {
    background: transparent;
    border: 1px solid transparent;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    border-radius: var(--border-radius);
    color: var(--text-muted);
    font-weight: var(--fw-medium);
    cursor: pointer;
    transition: all var(--transition-speed);
    
    &:hover {
      color: var(--primary);
      background-color: var(--card-bg-subtle);
    }
    
    &.is-active {
      color: #fff;
      background-color: var(--primary);
      border-color: var(--primary);
    }
  }
}

.filter-item {
  transition: opacity 0.3s ease, transform 0.3s ease;
  
  &.is-hidden { display: none !important; }
  &.is-animated { animation: filterPop 0.4s ease-out forwards; }
}

@keyframes filterPop {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
```

## Plik: `components/_navbar.scss`

```scss
// molique - Navbar: baza, logo w dark mode, warianty (transparent / sticky / pastylka) i offcanvas mobile.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   1. NAVBAR (Baza)
   ========================================= */
.navbar {
  position: relative;
  padding: calc(var(--spacing-unit) * 2) 0;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
}

.navbar-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  font-size: var(--h4-size);
  font-weight: var(--fw-bold);
  color: var(--text-main);
  text-decoration: none;

  img, svg {
    max-width: 100%;
    max-height: var(--target-size-min);
    width: auto;
    height: auto;
    object-fit: contain;
  }

  /* <picture> jest domyślnie elementem inline — jako dziecko flexa dostaje
     własny "line box" i wyrównuje <img> do baseline zamiast do środka,
     stąd wizualne przesunięcie logo w górę. display:contents usuwa ten box
     z layoutu, więc <img> w środku staje się bezpośrednim elementem flexa
     .navbar-brand, dokładnie tak jak bez opakowania w <picture>. */
  picture {
    display: contents;
  }
  /* Domyślnie ukrywamy logo dla trybu ciemnego */
  .logo-dark {
    display: none;
  }
}

/* =========================================
   ZARZĄDZANIE LOGO W DARK MODE
   ========================================= */
[data-theme="dark"] {
  .navbar-brand {
    /* Ukrywamy jasne logo */
    .logo-light {
      display: none;
    }
    /* Pokazujemy ciemne logo (przywracając display: contents, żeby nie zepsuć flexboxa!) */
    .logo-dark {
      display: contents;
    }
  }
}

/* Przycisk Hamburgera (Wymuszone 44x44px dla B2B) */
.navbar-toggle {
  display: none;
  background: transparent;
  border: none;
  width: var(--target-size-min);
  height: var(--target-size-min);
  position: relative;
  cursor: pointer;
  padding: 0;
  color: var(--text-main);
  z-index: 1060;
}

.navbar-toggle span {
  display: block;
  position: absolute;
  height: var(--hamburger-bar-height);
  width: var(--hamburger-bar-width);
  background: var(--text-main);
  border-radius: 2px;
  opacity: 1;
  left: 8px;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.navbar-toggle span:nth-child(1) { top: 12px; }
.navbar-toggle span:nth-child(2) { top: 19px; }
.navbar-toggle span:nth-child(3) { top: 26px; }

.navbar-menu {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-item {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: var(--fw-medium);
  transition: color var(--transition-speed);
  cursor: pointer;

  &:hover {
    color: var(--primary);
  }
}

/* Aktywna pozycja = bieżąca strona. Klasę .is-active nadaje wg URL moduł
   js/modules/navbar-active.js (auto-ładowany przy .navbar-menu) - linkowi
   bieżącej strony oraz triggerowi menu, w którym się znajduje. Wyróżnienie
   mocniejsze niż hover: kolor primary + grubsza waga.

   Odpowiedniki dla .dropdown-item i .mega-menu-link siedzą w SWOICH plikach,
   żeby pominięcie tamtych modułów nie zostawiało tu osieroconych selektorów. */
.navbar-item.is-active {
  color: var(--primary);
  font-weight: var(--fw-bold);
}

/* =========================================
   2. NAVBAR - WARIANTY
   ========================================= */

/* --- Transparent Navbar --- */
.navbar-transparent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-fixed);
  background-color: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .navbar-brand, .navbar-item { color: #fff; }
  .navbar-toggle { color: #fff; span { background-color: #fff; } }

  /* Logo: przed scrollem navbar leży na ciemnym hero, więc pokazujemy jasną
     wersję logo NIEZALEŻNIE od motywu (nadpisuje logikę dark-mode). Po
     scrollu (.is-scrolled) navbar dostaje tło i logo wraca do wersji
     zależnej od motywu (reguły bazowe / [data-theme="dark"]). */
  &:not(.is-scrolled) .navbar-brand {
    .logo-light { display: none; }
    .logo-dark { display: contents; }
  }

  &.is-scrolled {
    position: fixed;
    background-color: var(--bg-surface);
    border-bottom-color: var(--border-color);
    box-shadow: var(--shadow-sm);

    .navbar-brand, .navbar-item { color: var(--text-main); }
    .navbar-toggle span { background-color: var(--text-main); }
  }
}

/* --- Sticky Navbar (przyklejony do góry + auto-hide na scrollu w dół) ---
   Klasy is-scrolled/is-hidden dostaje z JS (molique-script.js, sekcja
   "STICKY NAVBAR & READING PROGRESS") - stąd brak tu deklaracji position
   inline, tylko czysty stan wynikający z dodanej klasy. */
.navbar-sticky {
  position: sticky;
  top: 0;
  z-index: var(--z-index-fixed);
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;

  &.is-scrolled {
    box-shadow: var(--shadow-sm);
  }

  /* Chowa navbar przy scrollowaniu w dół, pokazuje z powrotem przy scrollu w górę */
  &.is-hidden {
    transform: translateY(-100%);
  }
}

/* --- Navbar "Pastylka" (pływająca nad hero -> sticky po scrollu) ---
   Wariant nakładkowy: navbar jest odsuniętą od krawędzi pastylką leżącą NA
   treści, więc tło/zdjęcie sekcji pod spodem zaczyna się od samej góry strony
   (a nie dopiero pod paskiem). Po przescrollowaniu klasa .is-scrolled
   (molique-script.js) rozkłada pastylkę do zwykłego paska przy krawędzi.

   NIE łącz z .navbar-sticky - sticky wraca do przepływu dokumentu i efekt
   nakładki znika. */
.navbar-pill {
  /* --- API kolorów: osobna zmienna na każdy stan -------------------------
     <nav class="navbar navbar-pill" style="
            --navbar-pill-bg: #4c1d95;
            --navbar-pill-bg-scrolled: #1e293b;
            --navbar-pill-color-scrolled: #fff;">

     Świadomie NIE przedefiniowujemy zmiennych bazowych w .is-scrolled -
     styl inline (czyli sposób, w jaki się je ustawia) wygrywa z regułą klasy
     i zablokowałby drugi stan. Stąd osobne pary *-scrolled. */

  /* Stan pastylki (nad hero). Tło to LITERAŁ, nie var(--dark) - ta zmienna
     w dark mode jaśnieje, więc pastylka by zbielała, a biały tekst zniknął. */
  --navbar-pill-bg: #1e293b;
  --navbar-pill-color: #fff;

  /* Stan po scrollu - domyślnie kolory motywu, jak zwykły navbar. */
  --navbar-pill-bg-scrolled: var(--bg-surface);
  --navbar-pill-color-scrolled: var(--text-main);

  /* Wcięcie treści od zaokrąglonych krawędzi. Przy promieniu 999px domyślne
     16px z .container jest za ciasne - stąd osobna zmienna. Po scrollu wraca
     do wartości .container, żeby treść równała się z resztą strony. */
  --navbar-pill-padding-x: calc(var(--spacing-unit) * 4);
  --navbar-pill-padding-x-scrolled: calc(var(--spacing-unit) * 2);

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-fixed);
  padding: calc(var(--spacing-unit) * 2);
  background-color: transparent;
  border-bottom: none;

  .navbar-container {
    background-color: var(--navbar-pill-bg);
    border-radius: 999px;
    padding-block: calc(var(--spacing-unit) * 1.5);
    /* Nadpisuje poziomy padding .container (wyższa specyficzność). */
    padding-inline: var(--navbar-pill-padding-x);
    box-shadow: var(--shadow-lg);
  }

  .navbar-brand,
  .navbar-item {
    color: var(--navbar-pill-color);
  }

  .navbar-toggle {
    color: var(--navbar-pill-color);
    span { background-color: var(--navbar-pill-color); }
  }

  /* Nad ciemną pastylką jasne logo niezależnie od motywu (jak w transparent). */
  &:not(.is-scrolled) .navbar-brand {
    .logo-light { display: none; }
    .logo-dark { display: contents; }
  }

  /* Po scrollu: pastylka rozkłada się do krawędzi i przechodzi na drugi
     komplet zmiennych (*-scrolled). */
  &.is-scrolled {
    position: fixed;
    padding: 0;
    background-color: var(--navbar-pill-bg-scrolled);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);

    .navbar-container {
      background-color: transparent;
      border-radius: 0;
      box-shadow: none;
      padding-block: calc(var(--spacing-unit) * 2);
      padding-inline: var(--navbar-pill-padding-x-scrolled);
    }

    .navbar-brand,
    .navbar-item { color: var(--navbar-pill-color-scrolled); }

    .navbar-toggle {
      color: var(--navbar-pill-color-scrolled);
      span { background-color: var(--navbar-pill-color-scrolled); }
    }
  }
}

/* --- Offcanvas Mobile Menu (Zero JS) --- */
.navbar-offcanvas-toggle {
  display: none;
}

.navbar-offcanvas-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1040;
}

@include mq(sm, max) {
  .navbar-toggle {
    display: block;
  }

  .navbar-menu-offcanvas {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    background-color: var(--bg-surface);
    z-index: 1050;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 3);
    margin: 0;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);

    /* FIX: panel ma sztywną wysokość (top:0 do bottom:0), więc gdy lista
       linków jest dłuższa niż ekran, musi się sama przewijać - inaczej
       dolne pozycje są nieosiągalne. */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* UWAGA: .navbar-offcanvas-toggle musi być rodzeństwem (bezpośrednim,
     tym samym rodzicem co) .navbar-menu-offcanvas, .navbar-offcanvas-backdrop
     i .navbar-toggle — czyli wszystkie cztery elementy powinny siedzieć
     razem wewnątrz .navbar-container. Kombinator "~" nie sięga w głąb
     dalszych rodzeństw, więc np. checkbox umieszczony PRZED <nav>, a
     .navbar-menu-offcanvas wewnątrz <nav>, nigdy się nie dopasują. */
  .navbar-offcanvas-toggle:checked ~ .navbar-menu-offcanvas {
    transform: translateX(0);
  }

  .navbar-offcanvas-toggle:checked ~ .navbar-offcanvas-backdrop {
    display: block;
  }

  .navbar-offcanvas-toggle:checked ~ .navbar-toggle span:nth-child(1) {
    top: 19px; transform: rotate(135deg);
  }
  .navbar-offcanvas-toggle:checked ~ .navbar-toggle span:nth-child(2) {
    opacity: 0; left: -20px;
  }
  .navbar-offcanvas-toggle:checked ~ .navbar-toggle span:nth-child(3) {
    top: 19px; transform: rotate(-135deg);
  }

  /* WARIANTY NAKŁADKOWE A PANEL OFFCANVAS.
     Oba warianty wymuszają jasny kolor linków, bo nad zdjęciem hero leżą na
     ciemnym tle. Ta sama reguła obowiązywała jednak także w panelu mobilnym,
     który ma tło --bg-surface — efekt: białe linki na białym panelu, menu
     praktycznie niewidoczne. Każdy wariant domykamy inaczej, bo tylko
     pastylka ma czym pomalować panel. */

  /* Pastylka: panel przejmuje jej ciemne tło, linki zostają jasne. */
  .navbar-pill .navbar-menu-offcanvas {
    background-color: var(--navbar-pill-bg);
  }

  /* Transparent: brak własnego tła panelu, więc na czas menu mobilnego
     linki wracają do koloru motywu (panel zostaje na --bg-surface). */
  .navbar-transparent .navbar-menu-offcanvas .navbar-item {
    color: var(--text-main);
  }
}
```

## Plik: `components/_pagination.scss`

```scss
// molique - Paginacja.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   6. PAGINACJA (Pagination)
   ========================================= */
.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: calc(var(--spacing-unit) * 2) 0;
}

.page-item { margin: 0; }

.page-link {
  display: block;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
  color: var(--primary);
  background-color: var(--bg-body);
  border: 1px solid var(--border-color);
  margin-left: -1px;
  text-decoration: none;
  transition: background-color var(--transition-speed);
}

.page-link:hover { background-color: var(--card-bg-subtle); }

.page-item:first-child .page-link {
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
}

.page-item:last-child .page-link {
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.page-item.is-active .page-link {
  z-index: 1;
  color: #fff;
  background-color: var(--primary);
  border-color: var(--primary);
}

.page-item.is-disabled .page-link {
  color: var(--text-muted);
  pointer-events: none;
  background-color: var(--bg-surface);
}

/* WARIANT: Nowoczesna (Oddzielone kafelki) */
  .pagination-modern {
    gap: 8px; /* Odstęp między przyciskami */
    
    .page-item { margin: 0; }
    
    .page-link {
      border-radius: var(--border-radius) !important; /* Każdy ma zaokrąglenia */
      margin-left: 0;
      border: 1px solid transparent;
      background-color: var(--bg-surface);
      color: var(--text-muted);
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      font-weight: var(--fw-medium);
      box-shadow: var(--shadow-sm);
      
      &:hover {
        color: var(--primary);
        border-color: var(--border-color);
      }
    }

    .page-item.is-active .page-link {
      background-color: var(--primary);
      color: #fff;
      border-color: var(--primary);
      box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.3);
    }
  }
```

## Plik: `components/_pricing-list.scss`

```scss
// molique - Pricing list: lista z kropkami (cennik pozycjami).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   5. PRICING LIST (Lista z kropkami)
   ========================================= */
.pricing-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: baseline;
    margin-bottom: 12px;
    font-size: 1rem;
  }
}

.pricing-list-title {
  font-weight: var(--fw-bold);
  color: var(--text-main);
  margin: 0;
}

.pricing-list-dots {
  flex-grow: 1;
  border-bottom: 2px dotted var(--border-color);
  margin: 0 8px;
  position: relative;
  top: -4px;
  opacity: 0.5;
}

.pricing-list-price {
  font-weight: var(--fw-black);
  color: var(--primary);
  font-size: 1.125rem;
  white-space: nowrap;
}
```

## Plik: `components/_pricing-table.scss`

```scss
// molique - Tabele cenowe (pricing tables) + wariant wyrozniony.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   1. TABELE CENOWE (Pricing Tables)
   ========================================= */
.pricing-table {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 4);
  text-align: center;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  /* Wyróżniona karta (np. "Najpopularniejsze") */
  &.is-featured {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: scale(1.05);
    z-index: 2;
    background-color: var(--bg-body);
    
    /* Tasiemka (Ribbon) */
    &::before {
      content: 'Popularne';
      position: absolute;
      top: 15px;
      right: -35px;
      background-color: var(--primary);
      color: #fff;
      font-size: 0.75rem;
      font-weight: var(--fw-bold);
      padding: 4px 40px;
      transform: rotate(45deg);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

.pricing-header {
  margin-bottom: calc(var(--spacing-unit) * 3);
  
  .pricing-title {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .pricing-price {
    font-size: 3rem;
    font-weight: var(--fw-black);
    color: var(--text-main);
    line-height: 1;
    margin: calc(var(--spacing-unit) * 2) 0;
    
    span {
      font-size: 1rem;
      color: var(--text-muted);
      font-weight: var(--fw-normal);
    }
  }
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 calc(var(--spacing-unit) * 4) 0;
  flex-grow: 1; /* Pcha przycisk na sam dół */
  
  li {
    padding: calc(var(--spacing-unit) * 1.5) 0;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-main);
    
    &:last-child { border-bottom: none; }
    
    /* Przekreślone, niedostępne funkcje */
    &.is-disabled {
      color: var(--text-muted);
      text-decoration: line-through;
      opacity: 0.5;
    }
  }
}
```

## Plik: `components/_progress.scss`

```scss
// molique - Paski postepu (progress bars).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   2. PASKI POSTĘPU (Progress Bars)
   ========================================= */
.progress {
  display: flex;
  height: 8px; /* Cienki, nowoczesny pasek */
  overflow: hidden;
  background-color: var(--border-color);
  border-radius: 50px;
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.progress-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  background-color: var(--primary);
  transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: var(--fw-bold);
  margin-bottom: calc(var(--spacing-unit) * 1);
  color: var(--text-main);
}
```

## Plik: `components/_reading-progress.scss`

```scss
// molique - Reading progress bar: pasek postepu czytania.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   9. READING PROGRESS BAR
   ========================================= */
.progress-container-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: transparent;
  z-index: 2000;
  pointer-events: none;
}

.progress-bar-reading {
  height: 100%;
  background: var(--primary);
  width: 0%;
  transition: width 0.1s ease-out;
}
```

## Plik: `components/_scroll-to-top.scss`

```scss
// molique - Scroll to top: przycisk powrotu na gore.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   8. SCROLL TO TOP (Powrót na górę)
   ========================================= */
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: var(--target-size-min);
  height: var(--target-size-min);
  background-color: var(--primary);
  /* Jak w .btn-primary: kolor tekstu podąża za motywem (w dark mode
     primary jaśnieje, więc ikona musi ciemnieć - literal #fff ginął
     i na jasnym primary, i na hoverze z flipowanym var(--dark)) */
  color: var(--btn-text-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all var(--transition-speed);
  box-shadow: var(--shadow-md);

  &.is-visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    background-color: var(--dark);
    transform: translateY(-3px);
  }
}

@include mq(xs, max) {
  .scroll-to-top {
    bottom: 20px;
    right: 20px;
  }
}
```

## Plik: `components/_status-dots.scss`

```scss
// molique - Status dots (kropki statusu) + wariant pulsujacy ping.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   4. STATUS DOTS (Kropki statusu i Ping)
   ========================================= */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1);
  font-size: 0.875rem;
  font-weight: var(--fw-medium);
  color: var(--text-main);

  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  /* Definiujemy kolory tła ORAZ zmienną dla cienia (Ping) */
  &.status-draft { 
    --ping-color: var(--border-color);
    &::before { background-color: var(--border-color); }
  }
  &.status-pending { 
    --ping-color: var(--warning);
    &::before { background-color: var(--warning); }
  }
  &.status-done { 
    --ping-color: var(--success);
    &::before { background-color: var(--success); }
  }
  &.status-danger { 
    --ping-color: var(--danger);
    &::before { background-color: var(--danger); }
  }
}

/* Animowany Ping (box-shadow na kropce) */
.status-ping::before {
  animation: pingDot 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pingDot {
  0% { box-shadow: 0 0 0 0 var(--ping-color); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
```

## Plik: `components/_status-icons.scss`

```scss
// molique - Ikony statusu: statyczne animowane oraz interaktywna plus->checkmark.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   6. ANIMOWANE IKONY STATUSU (Statyczne)
   ========================================= */
.status-icon {
  width: 32px; /* Zmniejszono z 64px */
  height: 32px;
  border-radius: 50%;
  position: relative;
  display: inline-block;
  transition: all var(--transition-speed);
}

/* Ikona Plus (Dodaj) */
.status-icon-add {
  border: 2px solid var(--text-main); /* Cieńsza ramka */
  
  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: var(--text-main);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 1px;
  }

  &::before { width: 2px; height: 50%; }
  &::after { width: 50%; height: 2px; }
}

/* Ikona Sukces (Checkmark) */
.status-icon-success {
  background-color: var(--success);
  
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%) rotate(45deg);
    width: 8px; /* Pomniejszony ptaszek */
    height: 14px;
    border: solid #fff;
    border-width: 0 2px 2px 0; /* Cieńszy ptaszek */
  }
}

/* =========================================
   7. INTERAKTYWNA IKONA STATUSU (Plus -> Sukces)
   ========================================= */
.status-icon-toggle {
  width: 32px; /* Zmniejszono z 64px */
  height: 32px;
  border: 2px solid var(--border-color); /* Cieńsza ramka */
  border-radius: 50%;
  background-color: transparent;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;

  /* Stan początkowy: PLUS */
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14px; /* Pomniejszony plus */
    height: 14px;
    background: 
      linear-gradient(var(--text-muted), var(--text-muted)) center/2px 100% no-repeat,
      linear-gradient(var(--text-muted), var(--text-muted)) center/100% 2px no-repeat;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    opacity: 1;
  }

  /* Stan końcowy: CHECKMARK (Ptaszek) */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px; /* Pomniejszony ptaszek */
    height: 14px;
    border: solid #fff;
    border-width: 0 2px 2px 0; /* Cieńszy ptaszek */
    opacity: 0;
    transform: translate(-50%, -60%) rotate(45deg) scale(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  }

  /* AKCJA: Po dodaniu klasy .is-success */
  &.is-success {
    background-color: var(--success);
    border-color: var(--success);

    &::before {
      transform: translate(-50%, -50%) scale(0) rotate(90deg);
      opacity: 0;
    }

    &::after {
      transform: translate(-50%, -60%) rotate(45deg) scale(1);
      opacity: 1;
    }
  }
}

/* --- Wersja jako natywny Checkbox (Zero JS) --- */
.status-checkbox {
  display: inline-flex;
  cursor: pointer;
  margin: 0;
  position: relative;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    z-index: -1;

    &:checked + .status-icon-toggle {
      background-color: var(--success);
      border-color: var(--success);

      &::before {
        transform: translate(-50%, -50%) scale(0) rotate(90deg);
        opacity: 0;
      }

      &::after {
        transform: translate(-50%, -60%) rotate(45deg) scale(1);
        opacity: 1;
      }
    }

    &:focus-visible + .status-icon-toggle {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  }
}
```

## Plik: `components/_stepper.scss`

```scss
// molique - Stepper: pasek postepu formularza.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   4. STEPPER (Pasek postępu formularza)
   ========================================= */
.stepper {
  display: flex;
  gap: calc(var(--spacing-unit) * 1);
  overflow-x: auto;
  margin-bottom: calc(var(--spacing-unit) * 4);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.step {
  flex: 1; 
  min-width: 140px; 
  color: var(--text-muted);
  font-weight: var(--fw-medium);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: color var(--transition-speed);

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 4px;
    margin-bottom: calc(var(--spacing-unit) * 1.5);
    transition: background-color var(--transition-speed);
  }

  &:hover { color: var(--text-main); }

  &.is-active {
    color: var(--text-main);
    font-weight: var(--fw-bold);
    &::before { background-color: var(--primary); }
  }
}

/* Wariant 2: Stepper Numerowany (Kółka i linie) */
.stepper-numbered {
  counter-reset: stepper-counter;
  gap: 0;
  border-bottom: none;
  padding-bottom: 0;
  
  .step {
    position: relative;
    text-align: center;
    padding-top: 44px;
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
    min-width: 120px;
    
    &::before { display: none; }
    
    &::after {
      counter-increment: stepper-counter;
      content: counter(stepper-counter);
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--bg-surface);
      border: 2px solid var(--border-color);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--fw-bold);
      font-size: 0.875rem;
      z-index: 2;
      transition: all var(--transition-speed);
    }

    .step-line {
      position: absolute;
      top: 15px;
      left: 50%;
      width: 100%;
      height: 2px;
      background-color: var(--border-color);
      z-index: 1;
      transition: background-color var(--transition-speed);
    }

    &:last-child .step-line { display: none; }

    &.is-active, &.is-completed {
      color: var(--text-main);
      &::after {
        background-color: var(--primary);
        border-color: var(--primary);
        color: #fff;
      }
    }
    
    &.is-completed .step-line {
      background-color: var(--primary);
    }
  }
}
```

## Plik: `components/_stock-bar.scss`

```scss
// molique - Stock bar: segmentowy poziom zapasu (maska SVG, zero JS).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   4.5. STOCK BAR (Segmentowy poziom zapasu)
   ========================================= */
/* Pięciosegmentowy wskaźnik poziomu (stany magazynowe, limity, quoty).
   Zero JS i zero dodatkowego markupu: segmenty rysuje maska SVG (5
   zaokrąglonych prostokątów), a wypełnienie to zwykły gradient ucinany
   na granicy segmentu. Liczba wypełnionych segmentów z backendu przez
   zmienną CSS: style="--stock-filled: 3" (0-5). "Puste" segmenty to
   tint koloru wariantu (rgba), więc działają też w dark mode.
   A11y: element jest czysto wizualny - podawaj wartość obok jako tekst
   lub nadaj role="img" + aria-label="Stan: 3/5". */
.stock-bar {
  --stock-segments: 5;
  --stock-filled: 0;
  --stock-color: var(--secondary);
  --stock-color-rgb: var(--secondary-rgb);

  display: inline-block;
  width: 60px;
  height: 10px;
  flex-shrink: 0;
  vertical-align: middle;
  background: linear-gradient(
    to right,
    var(--stock-color) 0 calc(var(--stock-filled) / var(--stock-segments) * 100%),
    rgba(var(--stock-color-rgb), 0.25) 0
  );
  /* Maska: 5 segmentów 10x10 (rx=2) z odstępem 2.5 w siatce 60x10.
     Granica k/5 wypełnienia zawsze wypada w przerwie między segmentami,
     więc krawędź gradientu nigdy nie tnie segmentu w połowie. */
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 10' preserveAspectRatio='none'%3E%3Crect width='10' height='10' rx='2'/%3E%3Crect x='12.5' width='10' height='10' rx='2'/%3E%3Crect x='25' width='10' height='10' rx='2'/%3E%3Crect x='37.5' width='10' height='10' rx='2'/%3E%3Crect x='50' width='10' height='10' rx='2'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 10' preserveAspectRatio='none'%3E%3Crect width='10' height='10' rx='2'/%3E%3Crect x='12.5' width='10' height='10' rx='2'/%3E%3Crect x='25' width='10' height='10' rx='2'/%3E%3Crect x='37.5' width='10' height='10' rx='2'/%3E%3Crect x='50' width='10' height='10' rx='2'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}

/* Warianty kolorystyczne (semantyka jak w statusach) */
.stock-bar-success { --stock-color: var(--success); --stock-color-rgb: var(--success-rgb); }
.stock-bar-warning { --stock-color: var(--warning); --stock-color-rgb: var(--warning-rgb); }
.stock-bar-danger  { --stock-color: var(--danger);  --stock-color-rgb: var(--danger-rgb); }
```

## Plik: `components/_tables.scss`

```scss
// molique - Tabele B2B: warianty rozmiaru, naglowki, tryb kart na mobile.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
  /* =========================================
     1. TABELE B2B (Zoptymalizowane pod dane)
     ========================================= */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--bg-body);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    color: var(--text-main);
    font-size: 0.875rem; 
    
    /* Zmienne sterujące rozmiarem (Domyślnie MD) */
    --table-padding-y: calc(var(--spacing-unit) * 1.5);
    --table-padding-x: calc(var(--spacing-unit) * 2);
    --table-font-size: 0.875rem;
    --table-header-font-size: 0.75rem;
  }

  /* --- WARIANTY ROZMIARÓW --- */
  
  /* Kompaktowa (Gęste dane, np. raporty finansowe) */
  .table-sm {
    --table-padding-y: calc(var(--spacing-unit) * 0.75);
    --table-padding-x: calc(var(--spacing-unit) * 1.5);
    --table-font-size: 0.8125rem;
    --table-header-font-size: 0.7rem;
  }

  /* Luźna (Dużo przestrzeni, np. lista użytkowników z awatarami) */
  .table-lg {
    --table-padding-y: calc(var(--spacing-unit) * 1.5);
    --table-padding-x: calc(var(--spacing-unit) * 2);
    --table-font-size: 1rem;
    --table-header-font-size: 0.875rem;
  }

  /* --- STYLE BAZOWE KOMÓREK --- */
  .table th, 
  .table td {
    padding: var(--table-padding-y) var(--table-padding-x);
    border-bottom: 1px solid var(--border-color);
    text-align: left;
    vertical-align: middle;
    font-size: var(--table-font-size);
  }

  .table th {
    font-weight: var(--fw-bold);
    background-color: var(--bg-surface);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: var(--table-header-font-size);
    position: sticky;
    top: 0;
    z-index: 10;
    /* Zapobiega podwójnemu obramowaniu przy sticky header */
    box-shadow: 0 1px 0 var(--border-color);
    border-bottom: none;
  }

  /* --- WARIANTY NAGŁÓWKÓW (THEAD) --- */
  
  /* Domyślny / Jasny (Subtelne odcięcie) */
  .thead-light th {
    background-color: var(--card-bg-subtle);
    color: var(--text-muted);
    border-bottom: 2px solid var(--border-color); /* Mocniejsza linia pod nagłówkiem */
  }

  /* Ciemny (Mocny kontrast) */
  .thead-dark th {
    background-color: var(--dark);
    color: var(--btn-text-light);
    border-bottom: none;
    /* Zmieniamy kolor cienia dla sticky header */
    box-shadow: 0 1px 0 rgba(255,255,255,0.1);
  }

  /* Primary (Kolor marki) */
  .thead-primary th {
    background-color: var(--primary);
    color: var(--btn-text-light);
    border-bottom: none;
    box-shadow: 0 1px 0 rgba(0,0,0,0.1);
  }

  /* --- WARIANTY WIELKOŚCI NAGŁÓWKÓW --- */
  
  /* Kompaktowy nagłówek (Mniejsze paddingi i font) */
  .thead-sm th {
    padding-top: calc(var(--spacing-unit) * 1);
    padding-bottom: calc(var(--spacing-unit) * 1);
    font-size: 0.65rem;
    letter-spacing: 1px;
  }

  /* Duży nagłówek (Więcej oddechu) */
  .thead-lg th {
    padding-top: calc(var(--spacing-unit) * 2.5);
    padding-bottom: calc(var(--spacing-unit) * 2.5);
    font-size: 0.875rem;
    letter-spacing: 0;
  }

  /* --- WARIANTY WIZUALNE --- */
  
  /* Paski zebry (Zwiększają czytelność szerokich tabel) */
  .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(var(--dark-rgb), 0.02);
  }

  /* Podświetlanie wiersza na hover */
  .table-hover tbody tr {
    transition: background-color var(--transition-speed);
    &:hover {
      background-color: var(--card-bg-subtle);
    }
  }

  /* Tabele bez bocznych ramek (Czysty, nowoczesny wygląd) */
  .table-borderless {
    th, td { border-bottom: none; }
    tbody tr { border-bottom: 1px solid var(--border-color); }
    tbody tr:last-child { border-bottom: none; }
  }

  /* --- MIXIN: Transformacja tabeli w karty (Mobile-First Data) --- */
  @mixin make-table-cards {
    thead { display: none; }
    tbody, tr, td { display: block; width: 100%; }
    
    tr { 
      margin-bottom: calc(var(--spacing-unit) * 2); 
      border: 1px solid var(--border-color); 
      border-radius: var(--border-radius); 
      background-color: var(--bg-surface);
      /* Resetujemy tło z zebry dla kart */
      background-color: var(--bg-surface) !important;
    }
    
    td { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      text-align: right; 
      border-bottom: 1px solid var(--border-color); 
      padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
    }
    
    td:last-child { border-bottom: none; }
    
    td::before { 
      content: attr(data-label); 
      font-weight: var(--fw-bold); 
      color: var(--text-muted); 
      text-align: left; 
      padding-right: calc(var(--spacing-unit) * 2); 
    }
  }

  /* Wersja Mobilna (Automatyczna) */
  @include mq(sm, max) {
    .table-cards { 
      @include make-table-cards; 
    }
  }

  /* Wersja Wymuszona (Działa zawsze, nawet na desktopie) */
  .table-cards-always {
    @include make-table-cards;
  }
}
```

## Plik: `components/_tabs.scss`

```scss
// molique - Zakladki (:has() + radio hack) wraz z wariantem pill.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   4. ZAKŁADKI (CSS :has() + Radio Hack)
   ========================================= */
.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tabs-header {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.tab-input {
  display: none; 
}

.tab-label {
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--text-muted);
  font-weight: var(--fw-medium);
  transition: color var(--transition-speed), border-color var(--transition-speed);

  &:hover {
    color: var(--text-main);
  }
}

.tab-pane {
  display: none;
  animation: fadeIn var(--transition-speed) ease;
}

/* Łączenie inputa z panelem na podstawie ID (do 10 zakładek) */
@for $i from 1 through 10 {
  .tab-input:nth-of-type(#{$i}):checked ~ .tabs-content .tab-pane:nth-of-type(#{$i}) {
    display: block;
  }
  
  .tab-input:nth-of-type(#{$i}):checked ~ .tabs-header .tab-label:nth-of-type(#{$i}) {
    color: var(--primary);
    border-bottom-color: var(--primary);
    font-weight: var(--fw-bold);
  }
}

/* =========================================
   4b. ZAKŁADKI PILL (Segmented Control, suwający wskaźnik — Zero JS)
   ========================================= */
.tabs-pill {
  /* Liczba zakładek — nadpisz per instancja: style="--tab-count: 3;" */
  --tab-count: 2;

  .tabs-header {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--tab-count), 1fr);
    border-bottom: none;
    background-color: var(--card-bg-subtle);
    border-radius: 50rem;
    padding: 4px;
  }

  .tab-label {
    position: relative;
    z-index: 2;
    text-align: center;
    border-bottom: none;
    border-radius: 50rem;
    margin-bottom: 0;
  }

  .tabs-pill-indicator {
    position: absolute;
    z-index: 1;
    top: 4px;
    left: 4px;
    height: calc(100% - 8px);
    width: calc((100% - 8px) / var(--tab-count));
    background-color: var(--bg-surface);
    border-radius: 50rem;
    box-shadow: var(--shadow-sm);
    /* Suwanie wskaźnika: translateX(%) liczy się względem WŁASNEJ szerokości
       wskaźnika, która = szerokości jednej kolumny grida — stąd przesunięcie
       o "100% * (i-1)" zawsze trafia dokładnie na i-tą zakładkę. */
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
    pointer-events: none;
  }

  /* Dopasowanie inputa (po pozycji) do wskaźnika i koloru aktywnej etykiety */
  @for $i from 1 through 8 {
    &:has(.tab-input:nth-of-type(#{$i}):checked) .tabs-pill-indicator {
      transform: translateX(calc(100% * #{$i - 1}));
    }

    .tab-input:nth-of-type(#{$i}):checked ~ .tabs-header .tab-label:nth-of-type(#{$i}) {
      color: var(--text-main);
    }
  }
}
```

## Plik: `components/_testimonials.scss`

```scss
// molique - Testimonials (referencje).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   5. TESTIMONIALS (Referencje)
   ========================================= */
.testimonial {
  text-align: center;
  padding: calc(var(--spacing-unit) * 4);
  background: var(--bg-surface);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.testimonial-quote {
  font-size: 1.125rem;
  font-style: italic;
  color: var(--text-main);
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing-unit) * 2);
}

.testimonial-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-name { font-weight: var(--fw-bold); margin: 0; }
.testimonial-role { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
.testimonial-stars { color: var(--warning); margin-bottom: calc(var(--spacing-unit) * 2); }
```

## Plik: `components/_theme-editor.scss`

```scss
/**
 * molique - Theme Editor (Playground zmiennych CSS)
 * Układ narzędzia: panel kontrolek + żywy podgląd. Styl chrome edytora,
 * a NIE komponentów molique (te podglądamy w stanie surowym). Ładowany
 * tylko w bundlu dokumentacji (molique-style-docs.css).
 */

@use '../variables' as *;
@use '../mixins' as *;

/* Strona edytora: kolumna flex, żeby panele wypełniły resztę okna pod
   navbarem BEZ zgadywania jego wysokości (navbar w flow jako 1. dziecko). */
.te-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.theme-editor {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(300px, 360px) 1fr;
  overflow: hidden;

  @include mq(md, max) {
    display: block;
    overflow: visible;
  }
}

/* --- Panel kontrolek (lewy) --- */
.te-controls {
  overflow-y: auto;
  padding: calc(var(--spacing-unit) * 3);
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 3);

  @include mq(md, max) {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: none;
  }
}

/* Akcje edytora (Reset / Kopiuj CSS) - przypięte na górze panelu kontrolek */
.te-controls-actions {
  position: sticky;
  top: calc(var(--spacing-unit) * -3);
  z-index: 2;
  display: flex;
  gap: calc(var(--spacing-unit) * 1);
  padding: calc(var(--spacing-unit) * 2) 0;
  margin: calc(var(--spacing-unit) * -3) 0 0;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);

  .btn { flex: 1; }
}

.te-mode-hint {
  font-size: var(--text-sm);
  color: var(--text-muted);
  background-color: var(--card-bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 1.5);
  margin: 0;

  strong { color: var(--text-main); }
}

/* --- Grupa kontrolek --- */
.te-group {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0;
  margin: 0;
  overflow: hidden;

  > summary {
    list-style: none;
    cursor: pointer;
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
    font-weight: var(--fw-bold);
    color: var(--text-main);
    background-color: var(--card-bg-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--target-size-min);

    &::-webkit-details-marker { display: none; }

    &::after {
      content: '';
      width: 8px;
      height: 8px;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(45deg);
      transition: transform var(--transition-speed);
      opacity: 0.5;
    }
  }
  &[open] > summary::after { transform: rotate(-135deg); }
}

.te-group-body {
  padding: calc(var(--spacing-unit) * 2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}

/* --- Wiersz kontrolki --- */
.te-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
}

.te-label {
  font-size: var(--text-sm);
  color: var(--text-main);
  line-height: 1.3;

  code {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
}

/* Kontrolka koloru: natywny input opakowany w okrągły swatch */
.te-color {
  inline-size: 40px;
  block-size: 40px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: none;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: none; border-radius: 50%; }
  &::-moz-color-swatch { border: none; border-radius: 50%; }
}

/* Suwak + odczyt wartości */
.te-range-wrap {
  display: grid;
  grid-template-columns: 1fr 3.5rem;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1);
  min-width: 0;
}
.te-range { width: 100%; min-width: 0; margin: 0; }
.te-output {
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  text-align: right;
}

/* Wiersz z suwakiem zajmuje pełną szerokość (label nad kontrolką) */
.te-row-stacked {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1);
}

/* --- Panel podglądu (prawy) --- */
.te-preview {
  overflow-y: auto;
  padding: calc(var(--spacing-unit) * 4);
  background-color: var(--bg-body);

  @include mq(md, max) {
    padding: calc(var(--spacing-unit) * 3);
  }
}

.te-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
}

.te-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 1);
}
.te-swatch {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--dark-rgb), 0.1);
  flex-shrink: 0;
}

/* Podgląd kolorów sidebara (zmienne "zawsze ciemne") */
.te-sidebar-preview {
  background-color: var(--sidebar-bg);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 1.5);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);

  .te-sb-item {
    color: var(--sidebar-text);
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    border-radius: var(--border-radius);
    font-size: var(--text-sm);

    &.is-active {
      color: var(--sidebar-text-active);
      background-color: rgba(var(--sidebar-highlight-rgb), 0.08);
      font-weight: var(--fw-bold);
    }
  }
}
```

## Plik: `components/_theme-switch.scss`

```scss
// molique - Theme Switch: przelacznik motywu light/dark.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@layer components {
  /* =========================================
     THEME SWITCH (Light / Dark Mode Toggle)
     ========================================= */
  .theme-switch {
    display: inline-flex;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .theme-switch-input {
    display: none;
  }

  .theme-switch-track {
    position: relative;
    display: flex;
    align-items: center;
    width: 64px;
    height: 32px;
    padding: 4px;
    background-color: var(--card-bg-subtle);
    border: 1px solid var(--border-color);
    border-radius: 50px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    transition: background-color var(--transition-speed), border-color var(--transition-speed);
  }

  /* Pływająca pastylka (Tło pod aktywną ikoną) */
  .theme-switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background-color: var(--bg-surface);
    border-radius: 50%;
    box-shadow: var(--shadow-sm), 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 1;
  }

  .theme-icon-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }


  /* Ikony Słońca i Księżyca */
  .theme-icon {
    width: 14px;
    height: 14px;
    color: var(--text-muted);
    transition: color 0.3s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;

    &.icon-sun {
      margin-right: 4px !important;
    }
    
    &.icon-moon {
      margin-left: 4px !important;
    }
  }

  /* --- STAN: LIGHT MODE (Domyślny) --- */
  .theme-switch-input:not(:checked) + .theme-switch-track {
    .icon-sun {
      color: var(--warning); /* Słońce świeci na żółto/pomarańczowo */
      transform: rotate(0deg) scale(1.1);
      opacity: 1;
    }
    .icon-moon {
      transform: rotate(-30deg) scale(0.85);
      opacity: 0.4;
    }
  }

  /* --- STAN: DARK MODE (Zaznaczony) --- */
  .theme-switch-input:checked + .theme-switch-track {
    /* Opcjonalnie: zmiana tła całego przełącznika w dark mode */
    background-color: rgba(var(--primary-rgb), 0.1);
    border-color: rgba(var(--primary-rgb), 0.2);

    .theme-switch-thumb {
      transform: translateX(32px); /* Przesunięcie pastylki na prawą stronę */
    }

    .icon-sun {
      transform: rotate(90deg) scale(0.85);
      opacity: 0.4;
    }
    .icon-moon {
      color: var(--primary); /* Księżyc świeci w kolorze głównym marki */
      transform: rotate(0deg) scale(1.1);
      opacity: 1;
    }
  }

  /* Focus Ring dla dostępności (A11y) */
  .theme-switch-input:focus-visible + .theme-switch-track {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: 2px;
  }
}
```

## Plik: `components/_timeline.scss`

```scss
// molique - Timeline (os czasu) + warianty large/numbered/labeled.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

@layer components {
  /* =========================================
     3. TIMELINE (Oś czasu - Wersja Hybrydowa)
     ========================================= */
  
  /* --- WERSJA KLASYCZNA (Pseudo-elementy) --- */
  .timeline {
    --timeline-line-color: var(--border-color);
    --timeline-dot-color: var(--primary);
    --timeline-dot-size: 14px;
    --timeline-spacing: 30px;
    
    position: relative;
    padding-left: var(--timeline-spacing);
    margin: calc(var(--spacing-unit) * 4) 0;
    list-style: none;
    
    /* Główna linia */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: calc(var(--timeline-dot-size) / 2 - 1px);
      height: 100%;
      width: 2px;
      background: var(--timeline-line-color);
    }
  }

  .timeline-item {
    position: relative;
    margin-bottom: calc(var(--spacing-unit) * 4);
    
    &:last-child { margin-bottom: 0; }
    
    /* Domyślna kropka */
    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: calc(var(--timeline-spacing) * -1);
      width: var(--timeline-dot-size);
      height: var(--timeline-dot-size);
      border-radius: 50%;
      background: var(--timeline-dot-color);
      border: 2px solid var(--bg-body);
      z-index: 2;
    }
  }

  /* Wariant 1: Duże kółka na ikony */
  .timeline-large {
    --timeline-dot-size: 48px;
    --timeline-spacing: 70px;
    
    .timeline-item::before { display: none; }
  }

  .timeline-badge {
    position: absolute;
    top: 0;
    left: calc(var(--timeline-spacing) * -1);
    width: var(--timeline-dot-size);
    height: var(--timeline-dot-size);
    border-radius: 50%;
    background: var(--bg-body);
    border: 2px solid var(--border-color);
    color: var(--text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--fw-bold);
    font-size: 1.25rem;
    z-index: 2;
    box-shadow: var(--shadow-sm);
    transition: border-color var(--transition-speed), color var(--transition-speed);
  }

  .timeline-item:hover .timeline-badge {
    border-color: var(--primary);
    color: var(--primary);
  }

  /* Wariant 2: Automatyczna numeracja */
  .timeline-numbered {
    @extend .timeline-large;
    counter-reset: timeline-step;
    
    .timeline-item {
      counter-increment: timeline-step;
      
      &::after {
        content: counter(timeline-step);
        position: absolute;
        top: 0;
        left: calc(var(--timeline-spacing) * -1);
        width: var(--timeline-dot-size);
        height: var(--timeline-dot-size);
        border-radius: 50%;
        background: var(--bg-body);
        border: 2px solid var(--border-color);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--fw-light);
        font-size: 1.5rem;
        z-index: 2;
        transition: border-color var(--transition-speed), background-color var(--transition-speed);
      }
      
      &:hover::after {
        border-color: var(--primary);
        background-color: var(--primary);
        color: #fff;
      }
    }
  }

  /* --- WERSJA ZAAWANSOWANA (Grid / Etykiety po lewej) --- */
  .timeline-labeled {
    --timeline-label-width: 90px;
    
    /* Resetujemy klasyczne pseudo-elementy, bo tu używamy Grida */
    padding-left: 0;
    &::before { display: none; }
    
    .timeline-item {
      margin-bottom: 0;
      &::before, &::after { display: none; }
      
      /* Układ Grida */
      display: grid;
      grid-template-columns: var(--timeline-label-width) 24px 1fr;
      gap: calc(var(--spacing-unit) * 2);
      
      /* Mobile: Data nad treścią */
      @include mq(md, max) {
        grid-template-columns: 24px 1fr;
        
        .timeline-label {
          grid-column: 2;
          text-align: left;
          display: flex;
          align-items: center;
          gap: calc(var(--spacing-unit) * 1);
          padding-top: 0;
          margin-bottom: calc(var(--spacing-unit) * 0.5);
        }
        
        .timeline-separator {
          grid-column: 1;
          grid-row: 1 / span 2;
        }
      }
    }

    /* Elementy wewnętrzne Grida */
    .timeline-label {
      text-align: right;
      font-size: 0.75rem;
      line-height: 1.2;
      padding-top: 4px;
    }

    .timeline-separator {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .timeline-node {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--bg-surface);
      border: 2px solid var(--border-color);
      flex-shrink: 0;
      margin-top: 6px;
      z-index: 2;
      
      &.node-primary { border-color: var(--primary); }
      &.node-success { border-color: var(--success); }
      &.node-danger { border-color: var(--danger); }
    }

    .timeline-line {
      width: 2px;
      flex-grow: 1;
      background-color: var(--border-color);
      margin-top: 4px;
      margin-bottom: calc(var(--spacing-unit) * -2); 
      z-index: 1;
    }

    .timeline-item:last-child .timeline-line {
      display: none;
    }

    .timeline-content {
      padding-bottom: calc(var(--spacing-unit) * 4);
    }
  }
}
```

## Plik: `components/_toasts.scss`

```scss
// molique - Toast notifications (Popover API) + animacja paska postepu.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   3. TOAST NOTIFICATIONS (Powiadomienia)
   ========================================= */
.toast-container {
  position: fixed;
  z-index: var(--z-index-toast);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
  padding: calc(var(--spacing-unit) * 2);
  pointer-events: none; 

  /* NAPRAWA TOP LAYER: Reset domyślnych stylów Popover API */
  margin: 0;
  border: none;
  background: transparent;
  overflow: visible;
  inset: auto; /* Resetujemy domyślne rozciągnięcie popovera */
}

/* Pozycje kontenera (Dodano 'auto' dla nieużywanych krawędzi, by nadpisać Popover) */
.toast-top-right { top: 0; right: 0; bottom: auto; left: auto; align-items: flex-end; }
.toast-top-left { top: 0; left: 0; bottom: auto; right: auto; align-items: flex-start; }
.toast-bottom-right { bottom: 0; right: 0; top: auto; left: auto; align-items: flex-end; }
.toast-bottom-left { bottom: 0; left: 0; top: auto; right: auto; align-items: flex-start; }
.toast-top-center { top: 0; left: 50%; bottom: auto; right: auto; transform: translateX(-50%); align-items: center; }
.toast-bottom-center { bottom: 0; left: 50%; top: auto; right: auto; transform: translateX(-50%); align-items: center; }

/* Sam Toast */
.toast {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  min-width: 280px;
  max-width: 350px;
  pointer-events: auto; /* Toast sam w sobie jest klikalny */
  position: relative;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: var(--fw-medium);
  
  /* Animacja wejścia */
  animation: toastEnter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  will-change: transform, opacity;
}

/* Animacja wyjścia (dodawana przez JS) */
.toast.is-closing {
  animation: toastExit 0.3s ease-in forwards;
}

/* Warianty kolorystyczne (B2B style - pasek z boku) */
.toast-success { border-left: 4px solid var(--success); }
.toast-danger { border-left: 4px solid var(--danger); }
.toast-info { border-left: 4px solid var(--info); }
.toast-warning { border-left: 4px solid var(--warning); }

/* Pasek postępu czasu */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  opacity: 0.2;
  width: 100%;
  transform-origin: left;
}

/* Keyframes dla Toastów */
@keyframes toastEnter {
  from { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.95); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes toastExit {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}

@keyframes toastProgressAnim {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Na mobile toasty zajmują całą szerokość */
@include mq(sm, max) {
  .toast-container {
    width: 100%;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    align-items: center !important;
  }
  .toast {
    width: 100%;
    max-width: 100%;
  }
}
```

## Plik: `components/_tooltips.scss`

```scss
// molique - Tooltipy (czysty CSS, data-tooltip).
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   5. TOOLTIPS (Dymki podpowiedzi - Czysty CSS)
   ========================================= */
.tooltip-element {
  position: relative;
  display: inline-block;
  cursor: help;
  border-bottom: 1px dotted var(--text-muted);
}

.tooltip-element::before, 
.tooltip-element::after {
  position: absolute;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  z-index: var(--z-index-tooltip);
  pointer-events: none;
}

/* Strzałka dymku */
.tooltip-element::before {
  content: "";
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 10px);
  border: 5px solid transparent;
  border-top-color: var(--dark);
  margin-bottom: -1px;
}

/* Treść dymku */
.tooltip-element::after {
  content: attr(data-tooltip);
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 10px);
  background-color: var(--dark);
  color: #fff;
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: var(--fw-medium);
  white-space: nowrap;
  margin-bottom: 9px;
  box-shadow: var(--shadow-sm);
}

.tooltip-element:hover::before, 
.tooltip-element:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}
```

## Plik: `components/_topbar.scss`

```scss
// molique - Topbar: pasek nad nawigacja.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.
// Komentarz cichy (//), zeby dokumentacja pliku nie trafiala do CSS.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   7. TOPBAR (Pasek nad nawigacją)
   ========================================= */
.topbar {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  padding: 4px 0;
  color: var(--text-muted);
}

.topbar a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-speed);
}

.topbar a:hover { color: var(--primary); }

.topbar-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.topbar-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 16px;
}

@include mq(sm, max) {
  .topbar { display: none; }
}
```

## Plik: `components/_word-rotator.scss`

```scss
// molique - Word rotator: obracajacy sie tekst.
//
// Modul niezalezny: mozna go pominac w bundlu bez bledow kompilacji.

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   6. WORD ROTATOR (Obracający się tekst)
   ========================================= */
.word-rotator {
  display: inline-flex;
  vertical-align: bottom;
  overflow: hidden;
  position: relative;
}

.word-rotator-items {
  display: inline-flex;
  flex-direction: column;
  align-items: center; 
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center; 
  
  span {
    display: block;
    white-space: nowrap;
  }
}
```

## Plik: `layout/_admin-layout.scss`

```scss
@layer layout {
  .admin-layout {
    /* Zmienne sterujące aktualnym stanem layoutu */
    --current-sidebar-width: var(--sidebar-width-lg);
    --layout-gap: 0px;
    --layout-padding: 0px;
    --sidebar-radius: 0px;
    --main-radius: 0px;
    /* FIX: Domyślne tło dla głównej treści w trybie standardowym */
    --main-bg: var(--bg-surface); 

    display: grid;
    grid-template-columns: var(--current-sidebar-width) 1fr;
    gap: var(--layout-gap);
    padding: var(--layout-padding);
    min-height: 100dvh;
    background-color: var(--bg-body);
    transition: grid-template-columns var(--transition-speed) ease;

    /* Gdy nad layoutem jest globalny navbar, nie licz jego wysokości do
       min-height (inaczej strona ma zbędny pasek pustego scrolla u dołu). */
    body:has(> .navbar) & {
      min-height: calc(100dvh - var(--navbar-h));
    }

    /* WARIANTY ROZMIARÓW */
    &.sidebar-md { --current-sidebar-width: var(--sidebar-width-md); }
    &.sidebar-sm { --current-sidebar-width: var(--sidebar-width-sm); }

    /* WARIANT FLOATING (Odsunięty od krawędzi) */
    &.admin-layout-floating {
      --layout-gap: calc(var(--spacing-unit) * 3);
      --layout-padding: calc(var(--spacing-unit) * 3);
      --sidebar-radius: var(--border-radius-lg);
      --main-radius: var(--border-radius-lg);
      --main-bg: var(--bg-surface);
      
      /* Na mobile resetujemy floating */
      @media (max-width: 768px) {
        --layout-gap: 0px;
        --layout-padding: 0px;
        --sidebar-radius: 0px;
        --main-radius: 0px;
      }
    }

    /* Mobile: Przejście na Bottom Nav */
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      --current-sidebar-width: 100%;
    }
  }

  .admin-main {
    background-color: var(--main-bg);
    border-radius: var(--main-radius);
    /* FIX: Gwarantowany padding niezależnie od trybu */
    padding: calc(var(--spacing-unit) * 4);
    padding-bottom: calc(var(--spacing-unit) * 12);
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
    
    /* Cień tylko w trybie floating */
    .admin-layout-floating & {
      box-shadow: var(--shadow-sm);
    }
  }

  /* Zanikanie treści na dole głównej kolumny (opt-in: klasa .fade-bottom
     z warstwy layout). .admin-main nie przewija się sam - przewija się
     strona - a overflow-x:hidden czyni go scrollportem dla sticky,
     przez co bazowy wariant nigdy by się nie "przykleił". Dlatego tu
     gradient jest pozycjonowany fixed względem okna, wyrównany do
     kolumny treści zmiennymi layoutu (działa też w trybie floating). */
  .admin-main.fade-bottom {
    --fade-color: var(--main-bg);

    &::after {
      position: fixed;
      bottom: var(--layout-padding);
      left: calc(var(--current-sidebar-width) + var(--layout-gap) + var(--layout-padding));
      right: var(--layout-padding);
      height: var(--fade-height);
      margin-top: 0;
      border-radius: 0 0 var(--main-radius) var(--main-radius);
    }

    @media (max-width: 768px) {
      &::after {
        left: 0;
        right: 0;
        /* Nad mobilnym dolnym paskiem nawigacji (sidebar) */
        bottom: calc(70px + env(safe-area-inset-bottom));
        border-radius: 0;
      }
    }
  }
}
```

## Plik: `modules/_docs.scss`

```scss
/**
 * molique - Documentation Styles
 * Zawiera tylko style dla bloków prezentacyjnych (Showcase).
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer modules {
  /* Ograniczenie szerokości i FIX paddingów na mobile */
  .docs-content-wrapper {
    /* FIX: .admin-main jest flex-column. Przy width:auto + margin:auto
       specyfikacja flexboxa WYŁĄCZA stretch na osi poprzecznej (auto-marginesy
       "zjadają" wolne miejsce), więc element jest liczony na podstawie
       max-content swojej zawartości — a nie zawijający się <pre> ma bardzo
       szeroki max-content, co rozpychało całą kolumnę treści i ucinało tekst
       przez overflow:hidden wyżej w drzewie. Jawne width:100% wymusza
       wypełnienie dostępnej szerokości niezależnie od kontekstu flex/grid
       przodka, a margin:auto nadal centruje po osiągnięciu max-width. */
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    /* FIX: Gwarantowany padding boczny na mobile! */
    padding-left: calc(var(--spacing-unit) * 2);
    padding-right: calc(var(--spacing-unit) * 2);

    @include mq(md) {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .docs-nav-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: var(--fw-bold);
    color: rgba(255, 255, 255, 0.4);
    margin: calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 1) 0;
  }

  /* Bloki prezentacyjne (Showcase) przeniesione do rdzenia:
     components/_code-preview.scss (działają też poza bundle'em docs). */
}
```

## Plik: `utilities/_animations.scss`

```scss
/**
 * molique - Utilities (Narzędzia)
 * Animacje i mikrointerakcje
 */

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   0. CSS HOUDINI (Rejestracja zmiennych)
   ========================================= */
@property --t-top { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
@property --t-right { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
@property --t-bottom { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
@property --t-left { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
@property --trace-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

/* =========================================
   0.5. PŁYNNA ZMIANA MOTYWU (View Transitions API)
   ========================================= */
/* Cross-fade wyzwalany przez document.startViewTransition() w
   molique-script.js (przełącznik motywu). Przenikają się dwie migawki
   całej strony na GPU (czysta opacity) - zgodnie ze złotą zasadą:
   żadnego animowania kolorów per element. Pseudo-elementy poza @layer,
   bo dotyczą specjalnego drzewa ::view-transition, nie komponentów. */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.35s;
  animation-timing-function: ease;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}

@layer utilities {
  /* =========================================
     1. ANIMACJE WEJŚCIA (Intersection Observer)
     ========================================= */
  .animate {
    opacity: 0;
    will-change: transform, opacity;
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .animate.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1) !important;
  }

  .fade-in { transform: translate3d(0, 0, 0); }
  .fade-in-up { transform: translate3d(0, 40px, 0); }
  .fade-in-down { transform: translate3d(0, -40px, 0); }
  .fade-in-left { transform: translate3d(-40px, 0, 0); }
  .fade-in-right { transform: translate3d(40px, 0, 0); }
  .zoom-in { transform: scale(0.95); }

  .delay-100 { transition-delay: 100ms; }
  .delay-200 { transition-delay: 200ms; }
  .delay-300 { transition-delay: 300ms; }
  .delay-400 { transition-delay: 400ms; }
  .delay-500 { transition-delay: 500ms; }

  .reveal-blur {
    opacity: 0; filter: blur(10px); transform: translateY(20px);
    transition: opacity 0.6s ease, filter 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform, opacity, filter;
    &.is-visible { opacity: 1; filter: blur(0); transform: translateY(0); }
    @starting-style { &.is-visible { opacity: 0; filter: blur(10px); transform: translateY(20px); } }
  }

  .reveal-scale {
    opacity: 0; transform: scale(0.95);
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform, opacity;
    &.is-visible { opacity: 1; transform: scale(1); }
    @starting-style { &.is-visible { opacity: 0; transform: scale(0.95); } }
  }

  /* =========================================
     2. SCROLL REVEAL (CSS Scroll-Driven Animations)
     ========================================= */
  
  /* Domyślnie (na mobile) klasa nic nie robi - zapobiega to glitchom i oszczędza baterię */
  .scroll-reveal {
    opacity: 1;
    transform: none;
  }

  /* Animacja włącza się tylko na desktopie (od breakpointu MD) */
  @include mq(md) {
    @supports (animation-timeline: view()) {
      .scroll-reveal {
        animation: scrollRevealAnim linear both;
        animation-timeline: view();
        animation-range: entry 10% cover 30%;
      }
    }
  }

  @keyframes scrollRevealAnim {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* =========================================
     3. HOVER EFFECTS (Mikrointerakcje)
     ========================================= */
  .hover-spring, .hover-gpu-shadow {
    --hover-y: 0px;
    --hover-scale: 1;
    transform: translateY(var(--hover-y)) scale(var(--hover-scale));
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: transform;
  }

  .hover-spring { display: inline-block; &:hover { --hover-scale: 1.05; } }

  .hover-gpu-shadow {
    position: relative;
    isolation: isolate; 
    overflow: visible !important; 
    &::after {
      content: ''; position: absolute; inset: 0; border-radius: inherit;
      box-shadow: var(--shadow-lg); opacity: 0; transition: opacity 0.3s ease;
      pointer-events: none; z-index: -1;
    }
    &:hover { --hover-y: -4px; &::after { opacity: 1; } }
  }

  .hover-tilt {
    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    transform-style: preserve-3d; will-change: transform;
    &:hover { transform: perspective(1000px) rotateX(4deg) rotateY(-4deg) scale(1.02); }
  }

  .tilt-card {
    transition: transform 0.1s ease-out;
    transform-style: preserve-3d; will-change: transform;
  }

  /* =========================================
     4. EFEKTY TEKSTOWE
     ========================================= */
  .text-highlight {
    background-image: linear-gradient(transparent 60%, rgba(var(--primary-rgb), 0.3) 60%);
    background-size: 0% 100%; background-repeat: no-repeat;
    transition: background-size 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    &:hover, &.is-active { background-size: 100% 100%; }
  }

  .hover-underline {
    position: relative; display: inline-block; text-decoration: none;
    &::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px;
      background-color: currentColor; transform: scaleX(0); transform-origin: right;
      transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); will-change: transform;
    }
    &:hover::after, &.is-active::after { transform: scaleX(1); transform-origin: left; }
  }

  .hover-underline-center {
    @extend .hover-underline;
    &::after { transform-origin: center; }
    &:hover::after, &.is-active::after { transform-origin: center; }
  }

  .hover-text-wipe {
    background-image: linear-gradient(var(--primary), var(--primary)), linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-size: 0% 100%, 100% 100%;
    background-position: 100% 0%, 0% 0%;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: background-size 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    &:hover { background-size: 100% 100%, 100% 100%; background-position: 0% 0%, 0% 0%; }
  }

  .typewriter {
    display: inline-block;
    border-right: 2px solid var(--primary);
    padding-right: 4px;
    animation: blinkCursor 0.75s step-end infinite;
  }
  @keyframes blinkCursor { from, to { border-color: transparent; } 50% { border-color: var(--primary); } }

  .text-gradient-animated {
    --gradient-color-1: var(--primary);
    --gradient-color-2: var(--info);
    --gradient-color-3: var(--success);
    background: linear-gradient(to right, var(--gradient-color-1), var(--gradient-color-2), var(--gradient-color-3), var(--gradient-color-1));
    background-size: 300% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textGradientFlow 4s linear infinite;
  }
  @keyframes textGradientFlow { 0% { background-position: 0% center; } 100% { background-position: -300% center; } }

  /* =========================================
     5. INNE (Shake, Parallax, Blobs)
     ========================================= */
  .shake { animation: shakeAnim 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
  @keyframes shakeAnim {
    10%, 90% { transform: translate3d(-2px, 0, 0); }
    20%, 80% { transform: translate3d(4px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
    40%, 60% { transform: translate3d(6px, 0, 0); }
  }
  .input:user-invalid { animation: shakeAnim 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }

  .ken-burns {
    overflow: hidden;
    img, .bg-image { transition: transform 10s ease-out; will-change: transform; }
    &:hover img, &:hover .bg-image { transform: scale(1.1); }
  }

  .parallax-container { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .parallax-bg { position: absolute; top: -20%; left: 0; width: 100%; height: 140%; object-fit: cover; z-index: 0; pointer-events: none; will-change: transform; }
  .parallax-content { position: relative; z-index: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }

  .bg-blobs { position: relative; overflow: hidden; background-color: var(--bg-surface); z-index: 1; }
  .bg-blobs::before, .bg-blobs::after {
    content: ''; position: absolute; width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
    /* Nieregularny, organiczny kształt zamiast koła. Promienie są STATYCZNE -
       border-radius nie jest animowalny bez reflow, więc ruch daje wyłącznie
       transform. Sam kształt pod blurem 80px byłby jednak ledwo czytelny,
       dlatego w animacji doszedł obrót: obracająca się nieregularna plama
       zmienia obrys w czasie, czego idealne koło nie potrafi. */
    border-radius: 42% 58% 63% 37% / 45% 38% 62% 55%;
    filter: blur(80px); z-index: -1; opacity: 0.4;
    will-change: transform; transform: translate3d(0, 0, 0);
    animation: blobFloat 15s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  }
  .bg-blobs::before { background-color: rgba(var(--primary-rgb), 0.5); top: -10%; left: -10%; }
  .bg-blobs::after {
    background-color: rgba(var(--info-rgb), 0.4); bottom: -10%; right: -10%; animation-delay: -7.5s;
    /* Lustrzany obrys, żeby obie plamy nie były tym samym kształtem. */
    border-radius: 63% 37% 42% 58% / 62% 55% 45% 38%;
  }
  @keyframes blobFloat {
    0%   { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
    100% { transform: translate3d(10%, 15%, 0) scale(1.1) rotate(35deg); }
  }

  /* A11y: plamy to duży, ciągły ruch w tle - z dodanym obrotem tym bardziej.
     Przy prefers-reduced-motion zostaje sam statyczny, organiczny kształt.
     Globalna reguła w tym pliku wycisza tylko przejścia widoku, więc tę
     animację trzeba zatrzymać osobno. */
  @media (prefers-reduced-motion: reduce) {
    .bg-blobs::before, .bg-blobs::after { animation: none; }
  }

  /* Wariant głębszy: tło schodzi z --bg-surface na --bg-body (ciemniejsze
     w OBU motywach) i plamy są mocniej wysycone. Nadal podąża za motywem -
     to nie jest odpowiednik "zawsze ciemnego" navbara-pastylki. */
  .bg-blobs-deep {
    background-color: var(--bg-body);
    &::before, &::after { opacity: 0.55; }
    &::before { background-color: rgba(var(--primary-rgb), 0.7); }
    &::after  { background-color: rgba(var(--info-rgb), 0.6); }
  }

  /* =========================================
     6. ANIMACJE RAMEK (Border Effects)
     ========================================= */
  .hover-border-draw {
    position: relative;
    border-radius: var(--border-radius);
    &::before {
      content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 2px;
      background: var(--hover-border-color, var(--primary));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      transform: scale(0.95); opacity: 0; visibility: hidden; 
      transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease, visibility 0.4s;
      pointer-events: none;
    }
    &:hover::before, &.is-active::before, input:checked + &::before {
      transform: scale(1); opacity: 1; visibility: visible; 
    }
  }

  .hover-border-trace {
    position: relative;
    border-radius: var(--border-radius);
    &::before {
      content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 2px;
      background: conic-gradient(from var(--trace-angle), transparent 0%, transparent 70%, var(--hover-border-color, var(--primary)) 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
    }
    &:hover::before, &.is-active::before, input:checked + &::before {
      opacity: 1; animation: borderTraceSpin 1.5s linear infinite;
    }
  }
  @keyframes borderTraceSpin { from { --trace-angle: 0deg; } to { --trace-angle: 360deg; } }

  .hover-border-draw-2 {
    position: relative;
    background-image: 
    linear-gradient(to right, var(--hover-border-color, var(--primary)) 100%, transparent 100%),
    linear-gradient(to bottom, var(--hover-border-color, var(--primary)) 100%, transparent 100%),
    linear-gradient(to left, var(--hover-border-color, var(--primary)) 100%, transparent 100%),
    linear-gradient(to top, var(--hover-border-color, var(--primary)) 100%, transparent 100%);
    background-repeat: no-repeat;
    background-size: 0% 2px, 2px 0%, 0% 2px, 2px 0%;
    background-position: 0 0, 100% 0, 100% 100%, 0 100%;
    transition: background-size 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    &:hover, &.is-active, input:checked + & {
      background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
    }
  }

  .hover-border-trace-2 {
    position: relative;
    background-image: 
      linear-gradient(to right, var(--hover-border-color, var(--primary)) var(--t-top), transparent var(--t-top)),
      linear-gradient(to bottom, var(--hover-border-color, var(--primary)) var(--t-right), transparent var(--t-right)),
      linear-gradient(to left, var(--hover-border-color, var(--primary)) var(--t-bottom), transparent var(--t-bottom)),
      linear-gradient(to top, var(--hover-border-color, var(--primary)) var(--t-left), transparent var(--t-left));
    background-repeat: no-repeat;
    background-position: 0 0, 100% 0, 100% 100%, 0 100%;
    background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
    transition: --t-top 0.15s linear 0.45s, --t-right 0.15s linear 0.3s, --t-bottom 0.15s linear 0.15s, --t-left 0.15s linear 0s;
    &:hover, &.is-active, input:checked + & {
      --t-top: 100%; --t-right: 100%; --t-bottom: 100%; --t-left: 100%;
      transition: --t-top 0.15s linear 0s, --t-right 0.15s linear 0.15s, --t-bottom 0.15s linear 0.3s, --t-left 0.15s linear 0.45s;
    }
  }
}
```

## Plik: `utilities/_borders.scss`

```scss
/**
 * molique - Utilities
 * Obramowania (Borders) i Zaokrąglenia (Border Radius)
 */

@use '../variables' as *;

@layer utilities {
  /* =========================================
     1. OBRAMOWANIA (Borders)
     ========================================= */
  .border { border: 1px solid var(--border-color) !important; }
  .border-0 { border: 0 !important; }
  
  .border-top { border-top: 1px solid var(--border-color) !important; }
  .border-top-0 { border-top: 0 !important; }
  
  .border-bottom { border-bottom: 1px solid var(--border-color) !important; }
  .border-bottom-0 { border-bottom: 0 !important; }
  
  .border-start, .border-left { border-left: 1px solid var(--border-color) !important; }
  .border-start-0, .border-left-0 { border-left: 0 !important; }
  
  .border-end, .border-right { border-right: 1px solid var(--border-color) !important; }
  .border-end-0, .border-right-0 { border-right: 0 !important; }

  /* =========================================
     2. ZAOKRĄGLENIA (Border Radius)
     ========================================= */
  .rounded-0, .border-radius-0 { border-radius: 0 !important; }
  .rounded-1, .border-radius-1 { border-radius: 4px !important; }
  .rounded-2, .border-radius-2 { border-radius: var(--border-radius) !important; }
  .rounded-3, .border-radius-3 { border-radius: var(--border-radius-lg, 16px) !important; }
  .rounded-4, .border-radius-4 { border-radius: 24px !important; }
  .rounded-5, .border-radius-5 { border-radius: 32px !important; }
  
  .rounded-circle { border-radius: 50% !important; }
  .rounded-pill { border-radius: 50rem !important; }
  
  /* Zaokrąglanie tylko konkretnych stron */
  .rounded-top { border-top-left-radius: var(--border-radius) !important; border-top-right-radius: var(--border-radius) !important; }
  .rounded-bottom { border-bottom-left-radius: var(--border-radius) !important; border-bottom-right-radius: var(--border-radius) !important; }

  /* Usuwanie zaokrągleń z konkretnych stron */
  .rounded-top-0 { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }
  .rounded-bottom-0 { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }

  /* =========================================
     3. ROGI: OSTRE CIĘCIE (clip-path) I WKLĘSŁE WCIĘCIE (mask-image)
     ========================================= */
  $corner-size: 24px;

  .corner-cut-tl { clip-path: polygon(#{$corner-size} 0, 100% 0, 100% 100%, 0 100%, 0 #{$corner-size}); }
  .corner-cut-tr { clip-path: polygon(0 0, calc(100% - #{$corner-size}) 0, 100% #{$corner-size}, 100% 100%, 0 100%); }
  .corner-cut-bl { clip-path: polygon(0 0, 100% 0, 100% 100%, #{$corner-size} 100%, 0 calc(100% - #{$corner-size})); }
  .corner-cut-br { clip-path: polygon(0 0, 100% 0, 100% calc(100% - #{$corner-size}), calc(100% - #{$corner-size}) 100%, 0 100%); }

  .corner-concave-tl {
    mask-image: radial-gradient(circle #{$corner-size} at 0 0, transparent 99%, #fff 100%);
    -webkit-mask-image: radial-gradient(circle #{$corner-size} at 0 0, transparent 99%, #fff 100%);
  }
  .corner-concave-tr {
    mask-image: radial-gradient(circle #{$corner-size} at 100% 0, transparent 99%, #fff 100%);
    -webkit-mask-image: radial-gradient(circle #{$corner-size} at 100% 0, transparent 99%, #fff 100%);
  }
  .corner-concave-bl {
    mask-image: radial-gradient(circle #{$corner-size} at 0 100%, transparent 99%, #fff 100%);
    -webkit-mask-image: radial-gradient(circle #{$corner-size} at 0 100%, transparent 99%, #fff 100%);
  }
  .corner-concave-br {
    mask-image: radial-gradient(circle #{$corner-size} at 100% 100%, transparent 99%, #fff 100%);
    -webkit-mask-image: radial-gradient(circle #{$corner-size} at 100% 100%, transparent 99%, #fff 100%);
  }
}
```

## Plik: `utilities/_colors.scss`

```scss
/**
 * molique - Utilities (Narzędzia)
 * Kolory tekstu, tła, hovery i efekty specjalne (Zgodne z Dark Mode)
 */

@use '../variables' as *;

@layer utilities {
  /* =========================================
     1. KOLORY TEKSTU
     ========================================= */
  .text-main { color: var(--text-main) !important; }
  .text-muted { color: var(--text-muted) !important; }
  .text-white { color: #ffffff !important; }

  .text-primary { color: var(--primary) !important; }
  .text-secondary { color: var(--secondary) !important; }
  .text-success { color: var(--success) !important; }
  .text-danger { color: var(--danger) !important; }
  .text-warning { color: var(--warning) !important; }
  .text-info { color: var(--info) !important; }
  .text-dark { color: var(--dark) !important; }
  .text-light { color: var(--light) !important; }

  /* =========================================
     2. KOLORY TŁA
     ========================================= */
  .bg-body { background-color: var(--bg-body) !important; }
  .bg-surface { background-color: var(--bg-surface) !important; }
  .bg-transparent { background-color: transparent !important; }

  .bg-primary { background-color: var(--primary) !important; color: var(--btn-text-light) !important; }
  .bg-secondary { background-color: var(--secondary) !important; color: var(--btn-text-light) !important; }
  .bg-success { background-color: var(--success) !important; color: var(--btn-text-light) !important; }
  .bg-danger { background-color: var(--danger) !important; color: var(--btn-text-light) !important; }
  .bg-warning { background-color: var(--warning) !important; color: var(--text-main) !important; }
  .bg-info { background-color: var(--info) !important; color: var(--text-main) !important; }
  /* bg-dark na literałach: sekcje "zawsze ciemne" (stopki, hero) łączone
     w HTML z .text-white - z flipowanym var(--dark) w ciemnym motywie tło
     robiło się jasne pod białym tekstem. */
  .bg-dark { background-color: #1E293B !important; color: #F9F9F9 !important; }
  .bg-light { background-color: var(--light) !important; color: var(--text-main) !important; }

  /* --- TŁA SUBTELNE (10% krycia) --- */
  /* Wykorzystujemy zmienne RGB z _root.scss do uzyskania przezroczystości */
  .bg-primary-subtle { background-color: rgba(var(--primary-rgb), 0.1) !important; color: var(--primary) !important; }
  .bg-secondary-subtle { background-color: rgba(var(--secondary-rgb), 0.1) !important; color: var(--secondary) !important; }
  .bg-success-subtle { background-color: rgba(var(--success-rgb), 0.1) !important; color: var(--success) !important; }
  .bg-danger-subtle { background-color: rgba(var(--danger-rgb), 0.1) !important; color: var(--danger) !important; }
  .bg-warning-subtle { background-color: rgba(var(--warning-rgb), 0.1) !important; color: var(--warning-hover) !important; }
  .bg-info-subtle { background-color: rgba(var(--info-rgb), 0.1) !important; color: var(--info-hover) !important; }
  .bg-dark-subtle { background-color: rgba(var(--dark-rgb), 0.1) !important; color: var(--dark) !important; }
  .bg-light-subtle { background-color: rgba(var(--light-rgb), 0.5) !important; color: var(--text-main) !important; }
  .bg-surface-subtle { background-color: rgba(var(--dark-rgb), 0.03) !important; color: var(--text-main) !important; }
  .bg-body-subtle { background-color: rgba(var(--dark-rgb), 0.05) !important; color: var(--text-main) !important; }
  .bg-white-subtle { background-color: rgba(255, 255, 255, 0.1) !important; color: var(--text-main) !important; }

  /* =========================================
     3. HOVER UTILITIES (Generowane z pętli)
     ========================================= */
  $theme-colors: (
    "primary": var(--primary),
    "secondary": var(--secondary),
    "success": var(--success),
    "danger": var(--danger),
    "warning": var(--warning),
    "info": var(--info),
    "light": var(--light),
    "dark": var(--dark),
    "surface": var(--bg-surface),
    "body": var(--bg-body)
  );

  @each $name, $color in $theme-colors {
    
    /* Tło na hover */
    .bg-hover-#{$name} {
      transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
      
      &:hover {
        background-color: #{$color} !important;
        
        /* Automatyczny kontrast tekstu */
        @if $name == "primary" or $name == "success" or $name == "danger" or $name == "dark" or $name == "info" or $name == "secondary" {
          color: var(--btn-text-light) !important;
        } @else if $name == "warning" or $name == "light" or $name == "surface" or $name == "body" {
          color: var(--text-main) !important;
        }
      }
    }

    /* Tekst na hover */
    .text-hover-#{$name} {
      transition: color var(--transition-speed) ease;
      &:hover { color: #{$color} !important; }
    }
    
    /* Obramowanie na hover */
    .border-hover-#{$name} {
      transition: border-color var(--transition-speed) ease;
      &:hover { border-color: #{$color} !important; }
    }
  }

  /* =========================================
     4. GLASSMORPHISM
     ========================================= */
  .bg-glass {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(var(--bg-surface-rgb), 0.15) 0%, rgba(var(--bg-surface-rgb), 0.01) 100%);
    backdrop-filter: blur(25px) saturate(180%) brightness(120%);
    -webkit-backdrop-filter: blur(25px) saturate(180%) brightness(120%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: var(--shadow-lg), inset 0 1px 2px rgba(255, 255, 255, 0.5);
    border-radius: var(--border-radius);

    &::before {
      content: "";
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      opacity: 0.06;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      z-index: 0;
    }

    > * { position: relative; z-index: 1; }
  }

  [data-theme="dark"] .bg-glass {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.02) 100%);
    backdrop-filter: blur(25px) saturate(150%);
    -webkit-backdrop-filter: blur(25px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: var(--shadow-lg), inset 0 1px 1px rgba(255, 255, 255, 0.05);
  }

  /* =========================================
     5. ZAAWANSOWANE TŁA
     ========================================= */

  /* Narożne gradienty (Efekt łuny) */
  .bg-gradient-corners {
    position: relative;
    /* Literal: łuna wymaga zawsze ciemnego tła (flipowany var(--dark)
       w ciemnym motywie rozjaśniał sekcję pod jasną treścią) */
    background-color: #1E293B;
    z-index: 1;
    /* Zabezpieczenie przed wylewaniem się zawartości */
    overflow: hidden; 
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      
      /* FIX: Pseudo-element musi dziedziczyć zaokrąglenia od rodzica! */
      border-radius: inherit; 
      
      background: 
        radial-gradient(circle at 0% 0%, rgba(var(--primary-rgb), 0.4) 0%, transparent 50%), 
        radial-gradient(circle at 100% 100%, rgba(var(--info-rgb), 0.4) 0%, transparent 50%);
      pointer-events: none;
    }
  }

  /* Tekst wycięty z tła (Wymaga zmiennej --clip-img w HTML) */
  .text-clip-bg {
    background-image: var(--clip-img);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    display: inline-block;
  }
}
```

## Plik: `utilities/_helpers.scss`

```scss
/**
 * molique - Utilities (Narzędzia)
 * Filtry, Embeds, i Stany Hover
 */

@use '../variables' as *;
@use '../mixins' as *;

@layer utilities {
  /* =========================================
     DISPLAY UTILITIES (Zarządzanie widocznością)
     ========================================= */
  
  /* Domyślne (Mobile First) */
  .d-none { display: none !important; }
  .d-inline { display: inline !important; }
  .d-inline-block { display: inline-block !important; }
  .d-block { display: block !important; }
  .d-flex { display: flex !important; }
  .d-inline-flex { display: inline-flex !important; }
  .d-grid { display: grid !important; }

  /* Warianty dla Desktopu (MD) */
  @include mq(md) {
    .d-md-none { display: none !important; }
    .d-md-inline { display: inline !important; }
    .d-md-inline-block { display: inline-block !important; }
    .d-md-block { display: block !important; }
    .d-md-flex { display: flex !important; }
    .d-md-inline-flex { display: inline-flex !important; }
    .d-md-grid { display: grid !important; }
  }

  /* Warianty dla Dużych Ekranów (LG) */
  @include mq(lg) {
    .d-lg-none { display: none !important; }
    .d-lg-inline { display: inline !important; }
    .d-lg-inline-block { display: inline-block !important; }
    .d-lg-block { display: block !important; }
    .d-lg-flex { display: flex !important; }
    .d-lg-inline-flex { display: inline-flex !important; }
    .d-lg-grid { display: grid !important; }
  }

/* =========================================
   5. HELPERS (Filtry, Embeds, Hover States)
   ========================================= */
.filter-grayscale { filter: grayscale(100%); transition: filter var(--transition-speed); }
.filter-blur { filter: blur(4px); transition: filter var(--transition-speed); }
.filter-none { filter: none; }

.hover-scale { transition: transform var(--transition-speed) cubic-bezier(0.25, 1, 0.5, 1); display: inline-block; will-change: transform; }
.hover-scale:hover { transform: scale(1.05); }

.hover-shadow { transition: box-shadow var(--transition-speed), transform var(--transition-speed); }
.hover-shadow:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }

.hover-opacity-100 { transition: opacity var(--transition-speed); }
.hover-opacity-100:hover { opacity: 1; }

/* USUNIETE: .hover-text-primary i .hover-bg-light.
   Lamaly konwencje nazw (CO-hover-KOLOR, np. text-hover-primary) i byly
   duplikatami klas z palety w utilities/_colors.scss - tamte dodatkowo maja
   transition. Uzycia zmigrowane na .text-hover-primary. */

.embed-responsive { position: relative; display: block; width: 100%; padding: 0; overflow: hidden; }
.embed-responsive::before { display: block; content: ""; }
.embed-responsive iframe, .embed-responsive video { position: absolute; top: 0; bottom: 0; left: 0; width: 100%; height: 100%; border: 0; }
.embed-responsive-16by9::before { padding-top: 56.25%; }
.embed-responsive-4by3::before { padding-top: 75%; }

/* =========================================
   6. FILTRY I PRZEZROCZYSTOŚĆ (Logotypy)
   ========================================= */
.opacity-0 { opacity: 0 !important; }
.opacity-25 { opacity: 0.25 !important; }
.opacity-50 { opacity: 0.5 !important; }
.opacity-75 { opacity: 0.75 !important; }
.opacity-100 { opacity: 1 !important; }
.hover-opacity-100 { transition: opacity var(--transition-speed) !important; }
.hover-opacity-100:hover { opacity: 1 !important; }

.hover-filter-none { transition: filter var(--transition-speed) !important; }
.hover-filter-none:hover { filter: none !important; }

/* =========================================
   6b. CIENIE (Shadows)
   ========================================= */
.shadow-sm { box-shadow: var(--shadow-sm) !important; }
.shadow { box-shadow: var(--shadow-md) !important; }
.shadow-lg { box-shadow: var(--shadow-lg) !important; }
.shadow-none { box-shadow: none !important; }

/* =========================================
   6c. KURSOR
   ========================================= */
.cursor-pointer { cursor: pointer !important; }
.cursor-default { cursor: default !important; }
.cursor-not-allowed { cursor: not-allowed !important; }

/* =========================================
   7. STACKING SECTIONS (Przyklejone sekcje)
   ========================================= */
.stacking-container {
  position: relative;
}

.section-stacked {
  position: sticky;
  top: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
}

/* WARIANT: Magnetyczne przeskakiwanie (Scroll Snap) */
.stacking-container-snap {
  /* Kontener musi mieć określoną wysokość i własny scroll */
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  
  /* MAGIA CSS: Wymusza przeskakiwanie do krawędzi sekcji */
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  
  /* Ukrywamy pasek przewijania dla efektu "czystej prezentacji" */
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  .section-stacked {
    /* Każda sekcja staje się punktem przyciągania */
    scroll-snap-align: start;
    scroll-snap-stop: always; /* Wymusza zatrzymanie na każdej sekcji, zapobiega "przelatywaniu" */
  }
}

/* =========================================
   8. KNOCKOUT TEXT (Tekst wycinający tło)
   ========================================= */
/* Kontener ze zdjęciem w tle */
.bg-knockout-wrapper {
  position: relative;
  background-size: cover;
  background-position: center;
  /* Opcjonalnie: dodaj background-attachment: fixed dla efektu parallax wewnątrz tekstu! */
}

/* Wariant Jasny: Białe tło, przezroczysty tekst */
.text-knockout-light {
  background-color: #fff;
  color: #000; /* Musi być czarny, żeby mix-blend-mode zadziałał */
  mix-blend-mode: screen; /* Czarny staje się przezroczysty, biały zostaje biały */
}

/* Wariant Ciemny: Czarne tło, przezroczysty tekst */
.text-knockout-dark {
  background-color: #000;
  color: #fff; /* Musi być biały, żeby mix-blend-mode zadziałał */
  mix-blend-mode: multiply; /* Biały staje się przezroczysty, czarny zostaje czarny */
}

  /* =========================================
     BACKGROUND MEDIA (Wydajne tła: Wideo i Obrazki)
     ========================================= */
  .bg-video-container,
  .bg-image-container {
    position: relative;
    overflow: hidden;
    isolation: isolate; 

    /* Domyślny overlay (przyciemnienie) */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4); 
      z-index: -1;
      pointer-events: none;
    }
  }

  /* Wspólne style dla wideo, obrazków i tagu <picture> w tle */
  .bg-video,
  .bg-image,
  picture.bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    pointer-events: none;
    
    /* Jeśli to tag <picture>, musimy ostylować <img> wewnątrz niego */
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  /* Specyficzne dla wideo (Akceleracja GPU) */
  video.bg-video {
    object-fit: cover;
    transform: translateZ(0);
    will-change: transform;
  }

  /* A11y: Ukrywanie wideo dla prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .bg-video-container video.bg-video {
      display: none; 
    }
  }

  .z-index-1 { z-index: 1 !important; }
  .z-index-2 { z-index: 2 !important; }
  .z-index-3 { z-index: 3 !important; }
  
}
```

## Plik: `utilities/_spacing.scss`

```scss
/**
 * molique - Utilities (Narzędzia)
 * Pętle generujące margines i paddingi dla wszystkich elementów
 */
 
@use '../variables' as *;
@use '../mixins' as *;
@use 'sass:meta';

@layer utilities {
  /* =========================================
     1. SPACING (Marginesy i Paddingi)
     ========================================= */
  
  /* Dodano wartość 'auto' do mapy */
  $space-amounts: (
    0: 0, 
    1: var(--spacing-unit), 
    2: calc(var(--spacing-unit) * 2), 
    3: calc(var(--spacing-unit) * 3), 
    4: calc(var(--spacing-unit) * 4), 
    5: calc(var(--spacing-unit) * 6),
    auto: auto
  );
  
  /* Klasyczna nomenklatura (Top, Bottom, Left, Right, X, Y) */
  $sides: (
    t: top, 
    b: bottom, 
    l: left, 
    r: right, 
    x: (left, right), 
    y: (top, bottom)
  );

  @each $space-key, $space-val in $space-amounts {
    
    /* Paddingi (pomijamy 'auto', bo padding: auto nie istnieje w CSS) */
    @if $space-key != auto {
      .p-#{$space-key} { padding: #{$space-val} !important; }
      
      @each $side-key, $side-val in $sides {
        @if meta.type-of($side-val) == "list" {
          .p#{$side-key}-#{$space-key} { 
            padding-#{nth($side-val, 1)}: #{$space-val} !important; 
            padding-#{nth($side-val, 2)}: #{$space-val} !important; 
          }
        } @else {
          .p#{$side-key}-#{$space-key} { padding-#{$side-val}: #{$space-val} !important; }
        }
      }
    }

    /* Marginesy (wspierają 'auto') */
    .m-#{$space-key} { margin: #{$space-val} !important; }
    
    @each $side-key, $side-val in $sides {
      @if meta.type-of($side-val) == "list" {
        .m#{$side-key}-#{$space-key} { 
          margin-#{nth($side-val, 1)}: #{$space-val} !important; 
          margin-#{nth($side-val, 2)}: #{$space-val} !important; 
        }
      } @else {
        .m#{$side-key}-#{$space-key} { margin-#{$side-val}: #{$space-val} !important; }
      }
    }
  }

  /* =========================================
     2. WARIANTY DESKTOPOWE (MD)
     ========================================= */
  @include mq(md) {
    @each $space-key, $space-val in $space-amounts {
      
      @if $space-key != auto {
        .p-md-#{$space-key} { padding: #{$space-val} !important; }
        
        @each $side-key, $side-val in $sides {
          @if meta.type-of($side-val) == "list" {
            .p#{$side-key}-md-#{$space-key} { 
              padding-#{nth($side-val, 1)}: #{$space-val} !important; 
              padding-#{nth($side-val, 2)}: #{$space-val} !important; 
            }
          } @else {
            .p#{$side-key}-md-#{$space-key} { padding-#{$side-val}: #{$space-val} !important; }
          }
        }
      }

      .m-md-#{$space-key} { margin: #{$space-val} !important; }
      
      @each $side-key, $side-val in $sides {
        @if meta.type-of($side-val) == "list" {
          .m#{$side-key}-md-#{$space-key} { 
            margin-#{nth($side-val, 1)}: #{$space-val} !important; 
            margin-#{nth($side-val, 2)}: #{$space-val} !important; 
          }
        } @else {
          .m#{$side-key}-md-#{$space-key} { margin-#{$side-val}: #{$space-val} !important; }
        }
      }
    }
  }
}
```

## Plik: `utilities/_typography.scss`

```scss
/**
 * molique - Utilities (Narzędzia)
 * Klasy tekstowe i nagłówków
 */

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   2. TYPOGRAFIA (Narzędzia tekstowe)
   ========================================= */
/* Mikrocopy - CELOWO mniejsze niż tokeny --text-sm/--text-xs (13/12px),
   których używają komponenty. Klasy narzędziowe .text-sm/.text-xs to
   najmniejsze rozmiary w systemie (podpisy, prawne dopiski) i leżą
   PONIŻEJ .text-1. Nie podpinaj ich pod var(--text-sm)/var(--text-xs). */
.text-xs { font-size: 0.625rem !important; }   /* 10px */
.text-sm { font-size: 0.6875rem !important; }  /* 11px */
.text-base { font-size: var(--text-base-size) !important; }

/* Skala numeryczna - ROŚNIE, a tekst bazowy to .text-3 (jak akapity).
   .text-1/.text-2 leżą poniżej bazy (metadane, daty w timeline). */
.text-1 { font-size: var(--text-xs) !important; }        /* 12px */
.text-2 { font-size: var(--text-sm) !important; }        /* 13px */
.text-3 { font-size: var(--text-base-size) !important; } /* baza 14-15px */
.text-4 { font-size: var(--h5-size) !important; }
.text-5 { font-size: var(--h4-size) !important; }
.text-6 { font-size: var(--h3-size) !important; }
.text-7 { font-size: var(--h2-size) !important; }
.text-8 { font-size: var(--h1-size) !important; }

/* Gigantyczne rozmiary (np. do liczników, Hero) */
.text-9 { font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem) !important; }
.text-10 { font-size: clamp(2.5rem, 6vw + 1rem, 5.5rem) !important; }
.text-11 { font-size: clamp(2.75rem, 7vw + 1rem, 6.5rem) !important; }
.text-12 { font-size: clamp(3.5rem, 10vw + 1rem, 9rem) !important; }

.text-center { text-align: center !important; }
.text-start { text-align: left !important; }
.text-end { text-align: right !important; }
.text-justify { text-align: justify !important; }

@include mq(md) {
  .text-md-center { text-align: center !important; }
  .text-md-start { text-align: left !important; }
  .text-md-end { text-align: right !important; }
}

.text-uppercase { text-transform: uppercase !important; }
.text-lowercase { text-transform: lowercase !important; }
.text-capitalize { text-transform: capitalize !important; }

.fw-light { font-weight: var(--fw-light) !important; }
.fw-normal { font-weight: var(--fw-normal) !important; }
.fw-medium { font-weight: var(--fw-medium) !important; }
.fw-bold { font-weight: var(--fw-bold) !important; }
.fw-black { font-weight: var(--fw-black) !important; }

.text-decoration-none { text-decoration: none !important; }
.text-decoration-underline { text-decoration: underline !important; }
.text-decoration-line-through { text-decoration: line-through !important; }
```

## Plik: `_a11y.scss`

```scss
// molique - Dostepnosc (A11y): focus-visible, skip-link, prefers-reduced-motion.
/* =========================================
   DOSTĘPNOŚĆ (ACCESSIBILITY - A11y)
   ========================================= */

// 1. Klasa dla czytników ekranu (Screen Reader Only)
// Ukrywa tekst wizualnie, ale pozwala czytnikom go przeczytać.
// Idealne np. dla ikon bez etykiet tekstowych.
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// 2. Skip Link (Przejdź do treści)
// Link ukryty na górze strony, pojawia się tylko, gdy ktoś używa klawisza TAB.
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--primary);
  color: var(--btn-text-light);
  padding: calc(var(--spacing-unit) * 1.25) calc(var(--spacing-unit) * 2.5);
  z-index: 9999;
  text-decoration: none;
  font-weight: bold;
  transition: top 0.3s ease;

  &:focus {
    top: 0;
    outline: var(--focus-ring-width) solid var(--text-main);
    outline-offset: 2px;
  }
}
```

## Plik: `_admin.scss`

```scss
/**
 * molique - Admin & Dashboard UI
 * Moduł przeznaczony dla paneli B2B.
 */

@use 'variables' as *;
@use 'mixins' as *;

/* =========================================
   1. NADPISANIE ZMIENNYCH (Theme)
   ========================================= */
:root {
  --primary: #f97316; 
  --primary-hover: #ea580c;
  --primary-rgb: 249, 115, 22;
  
  --sidebar-bg: #1e293b;
  --sidebar-text: #94a3b8;
  --sidebar-text-active: #ffffff;
  --sidebar-width: 280px;
  
  --bg-surface: #f8fafc; 
}

/* =========================================
   2. LAYOUT (Grid)
   ========================================= */
.admin-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
  background-color: var(--bg-surface);
}

.admin-sidebar {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: calc(var(--spacing-unit) * 4) calc(var(--spacing-unit) * 3) 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 4);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  
  /* Elegancki, cienki scrollbar dla sidebaru */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: rgba(255, 255, 255, 0.2); 
    border-radius: 10px; 
  }
  &::-webkit-scrollbar-thumb:hover { 
    background: rgba(255, 255, 255, 0.3); 
  }
}

/* Śródtytuły w nawigacji */
.admin-nav-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: var(--fw-black);
  color: var(--sidebar-text);
  opacity: 0.6;
  margin: calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
  display: flex;
  align-items: center;
  gap: 12px;

  /* Nowoczesna linia oddzielająca obok tekstu */
  &::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.05);
  }
}

/* Gradient zanikający na dole sidebaru */
.admin-sidebar::after {
  content: '';
  position: sticky;
  bottom: 0;
  margin-top: auto; /* Pcha gradient na sam dół, jeśli linków jest mało */
  margin-left: calc(var(--spacing-unit) * -3); /* Ignoruje lewy padding rodzica */
  margin-right: calc(var(--spacing-unit) * -3); /* Ignoruje prawy padding rodzica */
  height: 80px;
  flex-shrink: 0; /* Zapobiega zgniataniu gradientu przez flexbox */
  background: linear-gradient(to top, var(--sidebar-bg) 15%, transparent);
  pointer-events: none; /* Przepuszcza kliknięcia myszką */
}

.admin-main {
  padding: calc(var(--spacing-unit) * 5);
  padding-bottom: 100px; /* Zwiększony dolny padding, by ostatni element wyjechał spod gradientu */
  overflow-x: hidden;
}

/* Gradient zanikający na dole głównej treści */
.admin-main::after {
  content: '';
  position: fixed;
  bottom: 0;
  right: 0;
  left: var(--sidebar-width); /* Zaczyna się tam, gdzie kończy sidebar */
  height: 80px;
  background: linear-gradient(to top, var(--bg-surface) 20%, transparent);
  pointer-events: none;
  z-index: 10;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1);
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  padding: calc(var(--spacing-unit) * 1.5) 0;
  color: var(--sidebar-text);
  text-decoration: none;
  font-weight: var(--fw-medium);
  transition: color var(--transition-speed);
  border-bottom: 1px solid rgba(255,255,255,0.05);

  &:hover, &.is-active {
    color: var(--sidebar-text-active);
  }
}


/* =========================================
   4. FORM SWITCH (Przełącznik iOS style)
   ========================================= */
.form-switch {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
  cursor: pointer;
}

.form-switch-input {
  appearance: none;
  width: 44px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  transition: background-color var(--transition-speed);
  margin: 0;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-sm);
  }

  &:checked {
    background-color: var(--success);
    &::after {
      transform: translateX(20px);
    }
  }
}

.form-switch-label {
  font-weight: var(--fw-medium);
  color: var(--text-main);
  user-select: none;
}

/* Wariant 1: Kwadratowy (Technical / B2B) */
.form-switch-square .form-switch-input {
  border-radius: var(--border-radius);
  
  &::after {
    border-radius: calc(var(--border-radius) - 2px);
  }
}

/* Wariant 2: Outline (Minimalistyczny) */
.form-switch-outline .form-switch-input {
  background-color: transparent;
  border: 2px solid var(--border-color);
  
  &::after {
    background-color: var(--border-color);
    box-shadow: none;
    /* Korekta pozycji ze względu na 2px ramki */
    width: 16px;
    height: 16px;
    left: 2px; 
  }
  
  &:checked {
    background-color: transparent;
    border-color: var(--success);
    
    &::after {
      background-color: var(--success);
      transform: translateX(20px);
    }
  }
}

/* =========================================
   5. INLINE INPUT GROUP (NAPRAWIONE)
   ========================================= */
.input-group-inline {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  flex-wrap: wrap; /* Pozwala zawinąć na mobile */
  
  .input {
    flex: 1 1 0%;
    min-width: 0; /* Zapobiega rozsadzaniu grida! */
  }
  
  .separator {
    font-weight: var(--fw-bold);
    color: var(--text-muted);
  }
}

/* =========================================
   7. DATA ROWS (Wiersze tabeli jako karty)
   ========================================= */
.data-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  background-color: #fff;
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing-unit) * 1);
  transition: box-shadow var(--transition-speed);

  &:hover {
    box-shadow: var(--shadow-sm);
  }
}

@include mq(md, max) {
  .data-row {
    grid-template-columns: 1fr;
    gap: calc(var(--spacing-unit) * 1);
  }
  .data-row-actions {
    margin-top: calc(var(--spacing-unit) * 2);
    padding-top: calc(var(--spacing-unit) * 2);
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing-unit) * 1);
  }
}

/* =========================================
   8. ACTION BUTTONS (Ghost buttons w tabelach)
   ========================================= */
.btn-action {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: var(--fw-medium);
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.5);
  padding: calc(var(--spacing-unit) * 1);
  cursor: pointer;
  transition: color var(--transition-speed);
  min-height: 32px !important; 

  &:hover { color: var(--text-main); }
  &.text-danger:hover { color: var(--danger); }
}

/* =========================================
   9. MOBILE BOTTOM NAVIGATION (Zamiast Sidebaru)
   ========================================= */
@include mq(md, max) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
  
  .admin-main {
    padding: calc(var(--spacing-unit) * 2);
    /* Robimy dużo miejsca na dole, żeby pasek nawigacji nie zasłaniał treści */
    padding-bottom: 140px; 
    overflow-wrap: break-word; 
    word-wrap: break-word;
  }

  /* Przesuwamy gradient w głównej treści nad dolny pasek nawigacji */
  .admin-main::after {
    left: 0;
    bottom: 70px; 
  }

  /* Przebudowa Sidebaru na poziomy pasek na dole */
  .admin-sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto; /* Usunięto sztywne 64px, by tekst mógł się łamać */
    min-height: 70px;
    flex-direction: row;
    align-items: center;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    gap: calc(var(--spacing-unit) * 1);
    z-index: 1040;
    background-color: var(--sidebar-bg);
    border-top: 1px solid rgba(255,255,255,0.1);
    
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  /* Ukrywamy śródtytuły i gradient na pasku mobilnym */
  .admin-nav-title,
  .docs-nav-title,
  .admin-sidebar::after {
    display: none !important;
  }

  /* Układ linków profilowych na mobile */
  .admin-sidebar > div:first-child {
    display: flex;
    gap: calc(var(--spacing-unit) * 1);
    margin-bottom: 0 !important;
    white-space: nowrap;
  }

  .admin-sidebar .btn {
    width: auto !important;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .admin-nav {
    flex-direction: row;
    align-items: stretch;
    gap: calc(var(--spacing-unit) * 1);
    flex-wrap: nowrap; /* Pigułki muszą być w jednym rzędzie */
  }

  .admin-nav-link {
    border-bottom: none;
    padding: calc(var(--spacing-unit) * 1);
    background-color: rgba(255,255,255,0.05);
    border-radius: 12px;
    
    /* 1. NAPRAWA TEKSTU: Wymuszamy łamanie słów */
    white-space: normal !important; 
    word-wrap: break-word;
    text-align: center;
    line-height: 1.2;
    font-size: 0.75rem;
    
    /* 2. NAPRAWA TŁA: Sztywna szerokość i ZAKAZ zgniatania przez Flexbox */
    width: 100px; 
    flex: 0 0 auto; 
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.is-active {
      background-color: var(--primary);
      color: #fff;
    }
  }

  /* Przycisk nie może zajmować 100% na mobile */
  .admin-sidebar .btn {
    width: auto !important;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Przebudowa listy linków */
  .admin-nav {
    flex-direction: row;
    align-items: center;
  }

  .admin-nav-link {
    border-bottom: none;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    background-color: rgba(255,255,255,0.05);
    border-radius: 50px; /* Kształt pigułki */
    white-space: nowrap;
    
    &.is-active {
      background-color: var(--primary);
      color: #fff;
    }
  }

  /* --- ZARZĄDZANIE LOGO NA MOBILE --- */
  
  /* Opcja 1: Całkowite ukrycie logo na mobile */
  .admin-logo-hide {
    display: none !important;
  }

  /* Opcja 2: Wersja kompaktowa (zmniejszona) na mobile */
  .admin-logo-compact {
    /* Jeśli to obrazek, wymuszamy mały rozmiar */
    img {
      max-height: 32px;
      width: auto;
    }
    
    /* Jeśli to tekst, zmniejszamy font i ukrywamy resztę słów (zostawiamy np. pierwszą literę) */
    font-size: 1.25rem;
    font-weight: var(--fw-black);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255,255,255,0.1);
    border-radius: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: clip;
  }
}
```

## Plik: `_base.scss`

```scss
/**
 * molique - Style Bazowe i Reset
 * Zawiera reset CSS, style dla html/body i podstawowe kontenery
 */

@use 'variables' as *;
@use 'mixins' as *;

@layer base {
  /* =========================================
     RESET, BAZA & A11Y
     ========================================= */
  html {
    scroll-behavior: smooth;
    scroll-padding-top: var(--scroll-padding);
    /* Globalna tarcza anty-rozsadzeniowa. UWAGA: musi być "clip", nie "hidden" —
       "hidden" wymusza overflow-y:auto (sprzężenie osi wg specyfikacji CSS Overflow),
       przez co html/body stają się nieoczekiwanym "scroll container" i wyłączają
       position:sticky wszystkim elementom w dokumencie (np. .admin-sidebar). */
    overflow-x: clip;
    width: 100%;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: var(--font-family-base);
    font-size: var(--text-base-size); 
    color: var(--text-main);
    background-color: var(--bg-body);
    line-height: 1.5; 
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: clip;
    width: 100%;
    position: relative;
  }

  /* Globalny Focus Ring (Dostępność) */
  :focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: 2px;
    border-radius: var(--focus-ring-radius);
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color var(--transition-speed);
    
    &:hover {
      color: var(--primary-hover);
    }
  }

  /* Wymuszenie dziedziczenia fontów dla elementów formularzy */
  input, button, select, textarea, optgroup, option {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  /* =========================================
     B2B TARGET SIZE ENFORCEMENT (WCAG 2.2)
     ========================================= */

  /* 1. Domyślny, kompaktowy rozmiar dla Desktopu (myszka) */
  button, 
  input:not([type="checkbox"]):not([type="radio"]):not([type="color"]), 
  select, 
  textarea {
    min-height: 36px;
    padding-top: calc(var(--spacing-unit) * 0.5);
    padding-bottom: calc(var(--spacing-unit) * 0.5);
  }

  /* 2. Wymuszenie 44px TYLKO na urządzeniach dotykowych (Mobile/Tablet) */
  @media (pointer: coarse) {
    button, 
    input:not([type="checkbox"]):not([type="radio"]):not([type="color"]), 
    select, 
    textarea,
    .form-switch-label,
    .form-pill {
      min-height: var(--target-size-min, 44px) !important;
    }
  }

  /* =========================================
     TYPOGRAFIA - NAGŁÓWKI
     ========================================= */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-family-heading);
    font-weight: var(--fw-bold);
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 2);
    color: inherit; 
    text-wrap: balance;
  }

  h1 { font-size: var(--h1-size); line-height: 1.1; }
  h2 { font-size: var(--h2-size); line-height: 1.2; }
  h3 { font-size: var(--h3-size); line-height: 1.3; }
  h4 { font-size: var(--h4-size); line-height: 1.35; }
  h5 { font-size: var(--h5-size); line-height: 1.4; }
  h6 { font-size: var(--h6-size); line-height: 1.5; }

  p {
    margin-top: 0;
    margin-bottom: calc(var(--spacing-unit) * 2);
    text-wrap: pretty;
    max-width: 75ch; 
  }

  /* =========================================
     KONTENERY
     ========================================= */
  .container {
    width: 100%;
    max-width: var(--container-max-width);
    margin-right: auto;
    margin-left: auto;
    /* FIX: Bezpieczny, mniejszy padding na mobile (16px) */
    padding-right: calc(var(--spacing-unit) * 2);
    padding-left: calc(var(--spacing-unit) * 2);
  }

  .container-fluid {
    width: 100%;
    padding-right: calc(var(--spacing-unit) * 2);
    padding-left: calc(var(--spacing-unit) * 2);
    margin-right: auto;
    margin-left: auto;
  }

  /* Na desktopie wracamy do paddingu opartego na grid-gap */
  @include mq(md) {
    .container, .container-fluid {
      padding-right: calc(var(--grid-gap) / 2);
      padding-left: calc(var(--grid-gap) / 2);
    }
  }

  /* =========================================
     INLINE CODE
     ========================================= */
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875em; 
    color: var(--primary); 
    background-color: var(--card-bg-subtle); 
    padding: 0.2em 0.4em; 
    border-radius: 4px;
    word-break: break-word; 
  }

  pre code {
    font-size: inherit;
    color: inherit;
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    word-break: normal;
  }
}
```

## Plik: `_before-after.scss`

```scss
/**
 * molique - Widget Przed / Po (Before & After)
 * Suwak porównawczy dwóch obrazów, sterowany ukrytym inputem range
 * (--position ustawiane przez JS z js/modules/before-after.js).
 */

@use 'variables' as *;
@use 'mixins' as *;

.before-after-slider {
  position: relative;
  width: 100%;
  min-height: 200px;
  overflow: hidden;
  border-radius: var(--border-radius);
  background-color: var(--light);
  --position: 50%;
}

.before-after-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  pointer-events: none;
}

.img-after {
  position: relative;
  z-index: 1;
}

.img-before {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 2;
  clip-path: polygon(0 0, var(--position) 0, var(--position) 100%, 0 100%);
}

.slider-control {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  margin: 0;
  min-height: 0;
  opacity: 0;
  cursor: ew-resize;
}

.slider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--position);
  z-index: 5;
  width: 4px;
  background: #fff;
  transform: translateX(-50%);
  box-shadow: var(--shadow-md);
  pointer-events: none;
}

.slider-handle {
  position: absolute;
  top: 50%;
  left: var(--position);
  z-index: 6;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  color: var(--dark);
  font-size: 1.25rem;
  line-height: 1;
  box-shadow: var(--shadow-md);
  transform: translate(-50%, -50%);
  pointer-events: none;

  &::after {
    content: '\2194';
    font-weight: var(--fw-bold);
  }
}
```

## Plik: `_blog.scss`

```scss
/**
 * molique - Moduł Bloga
 * Komponenty dla artykułów, list wpisów i sekcji autora.
 */

@use 'variables' as *;
@use 'mixins' as *;

/* =========================================
   1. KARTA WPISU (Post Card - Grid View)
   ========================================= */
.post-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
}

.post-image-wrapper {
  position: relative;
  display: block;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 240px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

/* Pływająca data na zdjęciu */
.post-date-badge {
  position: absolute;
  top: calc(var(--spacing-unit) * 2);
  left: calc(var(--spacing-unit) * 2);
  background-color: var(--bg-body);
  color: var(--text-main);
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
  border-radius: var(--border-radius);
  text-align: center;
  box-shadow: var(--shadow-sm);
  z-index: 2;
  
  .day { display: block; font-size: 1.5rem; font-weight: var(--fw-black); line-height: 1; }
  .month { display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: var(--fw-bold); color: var(--primary); margin-top: 2px; }
}

.post-content {
  padding: calc(var(--spacing-unit) * 3);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 2);
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
  
  a { color: inherit; text-decoration: none; }
  a:hover { color: var(--primary); }
}

.post-title {
  font-size: 1.25rem;
  font-weight: var(--fw-bold);
  color: var(--text-main);
  text-decoration: none;
  margin-bottom: calc(var(--spacing-unit) * 2);
  line-height: 1.3;
  
  &:hover { color: var(--primary); }
}

/* =========================================
   2. KLASYCZNY WPIS (List View)
   ========================================= */
.blog-post {
  display: flex;
  margin-bottom: calc(var(--spacing-unit) * 6);
  padding-bottom: calc(var(--spacing-unit) * 4);
  border-bottom: 1px solid var(--border-color);
  
  &:last-child { border-bottom: none; }

  @include mq(sm, max) {
    flex-direction: column;
  }
}

/* Data obok wpisu */
.post-date {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 55px;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-right: calc(var(--spacing-unit) * 3);
  
  @include mq(sm, max) {
    margin-bottom: calc(var(--spacing-unit) * 2);
  }

  .month {
    background-color: var(--primary);
    color: #fff;
    font-size: 0.75rem;
    font-weight: var(--fw-bold);
    padding: calc(var(--spacing-unit) * 0.5) 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .day {
    background-color: var(--bg-surface);
    color: var(--text-main);
    font-size: 1.5rem;
    font-weight: var(--fw-black);
    padding: calc(var(--spacing-unit) * 0.75) 0;
    border: 1px solid var(--border-color);
    border-top: none;
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
}

.blog-post-image {
  display: block;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing-unit) * 3);
  
  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.4s ease;
  }

  &:hover img { transform: scale(1.05); }
}

/* =========================================
   3. MAŁA LISTA WPISÓW (Sidebar Widget)
   ========================================= */
.simple-post-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: flex-start;
    padding: calc(var(--spacing-unit) * 1.5) 0;
    border-bottom: 1px dotted var(--border-color);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .post-image {
    width: var(--post-thumb-size, 60px);
    height: var(--post-thumb-size, 60px);
    border-radius: calc(var(--border-radius) / 2);
    object-fit: cover;
    margin-right: calc(var(--spacing-unit) * 2);
    flex-shrink: 0;
  }

  .post-info {
    display: flex;
    flex-direction: column;
    
    a {
      color: var(--text-main);
      font-weight: var(--fw-medium);
      text-decoration: none;
      line-height: 1.3;
      margin-bottom: 4px;
      transition: color var(--transition-speed);
      
      &:hover { color: var(--primary); }
    }
  }

  .post-meta-date {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}

/* =========================================
   4. SEKCJA AUTORA (Author Box)
   ========================================= */
.author-box {
  display: flex;
  gap: calc(var(--spacing-unit) * 3);
  padding: calc(var(--spacing-unit) * 4);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin: calc(var(--spacing-unit) * 5) 0;
  
  @include mq(sm, max) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.author-info {
  flex-grow: 1;
  
  .author-name { font-size: 1.125rem; font-weight: var(--fw-bold); margin-bottom: 4px; }
  .author-role { font-size: 0.875rem; color: var(--primary); font-weight: var(--fw-medium); margin-bottom: 12px; }
  .author-bio { color: var(--text-muted); margin-bottom: 0; font-size: 0.95rem; }
}
```

## Plik: `_buttons.scss`

```scss
/**
 * molique - Style Przycisków
 * Zawiera wszystkie warianty, rozmiary i grupy przycisków
 */

@use 'variables' as *;

@layer components {
  /* =========================================
     1. BAZOWY PRZYCISK (.btn)
     ========================================= */
  /* Kolory muszą być zadeklarowane PRZED blokiem bazowym, bo buduje on z nich
     listę selektorów (patrz niżej). */
  $theme-colors: (
    "primary": var(--primary),
    "secondary": var(--secondary),
    "success": var(--success),
    "danger": var(--danger),
    "warning": var(--warning),
    "info": var(--info),
    "light": var(--light),
    "dark": var(--dark)
  );

  /* IMPLIKACJA .btn — sam .btn-primary wystarczy, bez dopisywania .btn.
     Listę budujemy z mapy kolorów, więc nowy kolor dostaje bazę automatycznie;
     ręczna lista rozjechałaby się przy pierwszym dodanym wariancie.

     CELOWO NIE OBEJMUJE:
     - modyfikatorów wyglądu (.btn-3d, .btn-glass, .btn-shine, .btn-gradient,
       .btn-glow, .btn-stacked, .btn-outline-soft) i rozmiarów (.btn-sm itd.) —
       to dodatki do przycisku, nie przyciski,
     - .btn-action, który ŚWIADOMIE łamie regułę 44px na gęste tabele,
     - .btn-group, .btn-action-group, .btn-copy, .btn-text, .btn-hover-* —
       mają prefiks btn-, ale przyciskami nie są. */
  $btn-base-selectors: ".btn";
  @each $name, $color in $theme-colors {
    $btn-base-selectors: "#{$btn-base-selectors}, .btn-#{$name}, .btn-outline-#{$name}";
  }

  #{$btn-base-selectors} {
    --btn-border-width: 1px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing-unit) * 1);
    font-family: inherit;
    font-weight: var(--fw-medium);
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    border-radius: var(--border-radius);
    border: var(--btn-border-width) solid transparent; 
    transition: background-color var(--transition-speed), border-color var(--transition-speed), color var(--transition-speed);

    /* Focus Ring dla dostępności */
    &:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  }

  /* =========================================
     2. WARIANTY KOLORYSTYCZNE (Pętla SCSS)
     ========================================= */
  @each $name, $color in $theme-colors {

    /* --- WARIANTY PEŁNE (Solid) --- */
    .btn-#{$name} {
      background-color: #{$color};
      border-color: #{$color};
      
      /* Automatyczny kontrast tekstu */
      @if $name == "warning" or $name == "light" {
        color: var(--text-main);
      } @else {
        color: var(--btn-text-light, #fff);
      }

      &:hover, &:focus-visible {
        /* Używamy zmiennej -hover z _root.scss, jeśli istnieje, w przeciwnym razie przyciemniamy/rozjaśniamy */
        background-color: var(--#{$name}-hover, color-mix(in srgb, #{$color} 85%, black));
        border-color: var(--#{$name}-hover, color-mix(in srgb, #{$color} 85%, black));
      }
    }

    /* --- WARIANTY KONTUROWE (Outline) --- */
    .btn-outline-#{$name} {
      background-color: transparent;
      border-color: #{$color};
      color: #{$color};

      /* Domyślny, pełny hover */
      &:hover, &:focus-visible {
        background-color: #{$color};
        
        @if $name == "warning" or $name == "light" {
          color: var(--text-main);
        } @else {
          color: var(--btn-text-light, #fff);
        }
      }

      /* Wariant Soft (Półprzezroczysty hover i złagodzona ramka) */
      &.btn-outline-soft {
        /* Domyślnie ramka jest bardzo delikatna (30% krycia) */
        border-color: rgba(var(--#{$name}-rgb), 0.3);
        
        &:hover, &:focus-visible {
          /* Tło na 10% krycia */
          background-color: rgba(var(--#{$name}-rgb), 0.1);
          /* Ramka staje się nieco wyraźniejsza (50% krycia), ale wciąż miękka */
          border-color: rgba(var(--#{$name}-rgb), 0.5);
          color: #{$color};
        }
      }
    }
  }

  /* =========================================
     3. ROZMIARY PRZYCISKÓW
     ========================================= */
  .btn-xs {
    padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit) * 0.75);
    font-size: 0.75rem;
    border-radius: calc(var(--border-radius) * 0.6);
  }

  .btn-sm {
    padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 1.5);
    font-size: 0.875rem;
    border-radius: calc(var(--border-radius) * 0.8);
  }

  .btn-md {
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
    font-size: 1rem;
    border-radius: var(--border-radius);
  }

  .btn-lg {
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
    font-size: 1.125rem;
    border-radius: calc(var(--border-radius) * 1.2);
    font-weight: var(--fw-bold);
  }

  .btn-xl {
    padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
    font-size: 1.25rem;
    border-radius: calc(var(--border-radius) * 1.5);
    font-weight: var(--fw-bold);
  }

  /* =========================================
     4. BUTTON GROUPS (Zgrupowane przyciski)
     ========================================= */
  .btn-group {
    display: inline-flex;
    align-items: stretch;

    .btn {
      position: relative;
      flex: 1 1 auto;
    }

    .btn:not(:first-child) {
      margin-left: calc(var(--btn-border-width) * -1);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .btn:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .btn:hover, 
    .btn:focus, 
    .btn:active, 
    .btn.is-active {
      z-index: 1;
    }
  }

  /* =========================================
     5. GHOST BUTTONS (Akcje w tabelach i paskach)
     ========================================= */
  .btn-action {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: inherit;
    font-weight: var(--fw-medium);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spacing-unit) * 1);
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    min-height: 32px !important; 
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-speed) ease;
    
    i, svg {
      font-size: 1.1em;
      flex-shrink: 0;
    }

    &:hover, &:focus-visible {
      color: var(--text-main);
      background-color: var(--card-bg-subtle, rgba(0,0,0,0.05));
    }

    &.text-danger {
      color: var(--danger);
      &:hover, &:focus-visible {
        background-color: rgba(var(--danger-rgb), 0.1);
      }
    }
    
    &.text-primary {
      color: var(--primary);
      &:hover, &:focus-visible {
        background-color: rgba(var(--primary-rgb), 0.1);
      }
    }

    &:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  }
  
  /* Grupowanie przycisków akcji */
  .btn-action-group {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) * 0.5);
    
    &.with-dividers {
      gap: 0; 
      
      .btn-action {
        position: relative;
        border-radius: 0; 
        
        &::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%; 
          bottom: 20%;
          width: 1px;
          background-color: var(--border-color);
          pointer-events: none;
        }
        
        &:last-child::after {
          display: none;
        }
        
        &:first-child {
          border-top-left-radius: var(--border-radius);
          border-bottom-left-radius: var(--border-radius);
        }
        &:last-child {
          border-top-right-radius: var(--border-radius);
          border-bottom-right-radius: var(--border-radius);
        }
      }
    }
  }

  /* =========================================
     6. NOWOCZESNE EFEKTY (Modyfikatory)
     ========================================= */
  
  /* 1. GLOW (Neonowa poświata) */
  .btn-glow {
    position: relative;
    /* Dziedziczy kolor tła przycisku do stworzenia poświaty */
    box-shadow: 0 0 15px 0 rgba(0,0,0,0.2);
    transition: box-shadow 0.3s ease, transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      /* Używamy currentColor lub tła, ale najbezpieczniej użyć zmiennej z _root.scss */
      box-shadow: 0 8px 25px -5px var(--primary);
    }
  }

  /* 2. GLASS (Szkło - idealne na ciemne tła i wideo) */
  .btn-glass {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease, border-color 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
    }
  }

  /* 3. 3D PUSH (Fizyczny przycisk) */
  .btn-3d {
    /* Wymaga zdefiniowania koloru cienia (np. ciemniejszy primary) */
    --btn-3d-shadow: var(--primary-hover);
    
    transform: translateY(0);
    box-shadow: 0 6px 0 0 var(--btn-3d-shadow) !important;
    transition: transform 0.1s ease, box-shadow 0.1s ease;

    &:hover {
      transform: translateY(2px);
      box-shadow: 0 4px 0 0 var(--btn-3d-shadow) !important;
    }

    &:active {
      transform: translateY(6px);
      box-shadow: 0 0 0 0 var(--btn-3d-shadow) !important;
    }
  }

  /* 4. SHINE (Przesuwający się błysk) */
  .btn-shine {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      transform: skewX(-25deg);
      transition: none;
    }

    &:hover::after {
      animation: btnShineAnim 0.7s ease forwards;
    }
  }

  @keyframes btnShineAnim {
    100% { left: 200%; }
  }

  /* 5. GRADIENT ANIMATED (Płynący gradient) */
  .btn-gradient {
    background: linear-gradient(
      135deg, 
      var(--primary), 
      var(--info), 
      var(--success), 
      var(--primary)
    ) !important;
    background-size: 300% 100% !important;
    color: #fff !important;
    border: none !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
      animation: btnGradientFlow 3s linear infinite;
    }
  }

  @keyframes btnGradientFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  /* =========================================
     6. WARIANTY UKŁADU (Layout Modifiers)
     ========================================= */
  
  /* Przycisk pionowy (Ikona nad tekstem) - Wzorzec z aplikacji mobilnych */
  .btn-stacked {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px !important;
    
    padding: calc(var(--spacing-unit) * 1);
    min-height: 56px !important;
    line-height: 1 !important; 

    i, svg {
      font-size: 1.2rem;
      width: 1em !important;
      height: 1em !important;
      flex-shrink: 0;
      margin: 0 !important;
      display: block; 
    }

    span, .btn-text {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1 !important; 
      text-align: center;
      
      padding: 0 !important;
      white-space: normal;
      word-break: break-word;
      width: 100%;
    }
  }

  /* =========================================
     DOMYŚLNY HOVER PRZYCISKÓW (opt-in)
     =========================================
     Dodaj JEDNĄ z klas do <body> (lub dowolnego kontenera), aby WSZYSTKIE
     .btn w środku dostały wspólny efekt hover - twórca wybiera go raz,
     zamiast oznaczać każdy przycisk osobno. Przyciski z własną klasą
     hover-* są pomijane (mają pierwszeństwo). GPU: transform + box-shadow. */
  .btn-hover-spring .btn:not([class*="hover-"]),
  .btn-hover-lift .btn:not([class*="hover-"]),
  .btn-hover-glow .btn:not([class*="hover-"]) {
    transition: background-color var(--transition-speed),
      border-color var(--transition-speed), color var(--transition-speed),
      transform var(--transition-speed) cubic-bezier(0.25, 1, 0.5, 1),
      box-shadow var(--transition-speed);
    will-change: transform;
  }
  .btn-hover-spring .btn:not([class*="hover-"]):hover {
    transform: scale(1.05);
  }
  .btn-hover-lift .btn:not([class*="hover-"]):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .btn-hover-glow .btn:not([class*="hover-"]):hover {
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    .btn-hover-spring .btn:not([class*="hover-"]):hover,
    .btn-hover-lift .btn:not([class*="hover-"]):hover {
      transform: none;
    }
  }
}
```

## Plik: `_components.scss`

```scss
/**
 * molique - Komponenty UI (Hub)
 * Ten plik ładuje wszystkie mniejsze moduły z folderu components/
 */

// Nawigacja rozbita na niezalezne moduly (kolejnosc = kolejnosc w CSS).
// Kazdy z nich mozna pominac w wlasnym bundlu bez bledow kompilacji.
@use 'components/navbar' as *;
@use 'components/mega-menu' as *;
@use 'components/dropdown' as *;
@use 'components/breadcrumbs' as *;
@use 'components/pagination' as *;
@use 'components/topbar' as *;
@use 'components/scroll-to-top' as *;
@use 'components/reading-progress' as *;
@use 'components/language-switch' as *;
@use 'components/hero' as *;
@use 'components/cards' as *;
// Modale rozbite na niezalezne moduly (kolejnosc = kolejnosc w CSS).
@use 'components/modal' as *;
@use 'components/modal-confirm' as *;
@use 'components/modal-context' as *;
@use 'components/lightbox' as *;
@use 'components/context-menu' as *;
// Wyswietlanie danych rozbite na niezalezne moduly (kolejnosc = kolejnosc w CSS).
@use 'components/tables' as *;
@use 'components/data-rows' as *;
@use 'components/data-row-compact' as *;
@use 'components/accordion' as *;
@use 'components/tabs' as *;
@use 'components/grid-expand' as *;
@use 'components/carousel' as *;
@use 'components/list-group' as *;
@use 'components/list-icons' as *;
@use 'components/counters' as *;
// Feedback rozbity na niezalezne moduly (kolejnosc = kolejnosc w CSS).
@use 'components/badges' as *;
@use 'components/alerts' as *;
@use 'components/toasts' as *;
@use 'components/status-dots' as *;
@use 'components/stock-bar' as *;
@use 'components/tooltips' as *;
@use 'components/status-icons' as *;
// Komponenty biznesowe rozbite na niezalezne moduly (kolejnosc = kolejnosc w CSS).
@use 'components/pricing-table' as *;
@use 'components/progress' as *;
@use 'components/timeline' as *;
@use 'components/stepper' as *;
@use 'components/testimonials' as *;
@use 'components/word-rotator' as *;
@use 'components/nav-filters' as *;
@use 'components/pricing-list' as *;
@use 'components/charts' as *;
@use 'components/code-preview' as *;
```

## Plik: `_eink.scss`

```scss
// molique - Optymalizacja dla e-ink / monochrome i wydruku.
/* =========================================
   OPTYMALIZACJA DLA E-INK / MONOCHROME
   ========================================= */

// Wykrywamy ekrany czarno-białe LUB takie o wolnym odświeżaniu
@media (monochrome), (update: slow) {
  
  // Wyłączamy wszystkie animacje i przejścia, które mogą powodować efekt smużenia na e-ink
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }

  // Wymuszamy maksymalny kontrast
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  // Usuwamy cienie i obramowania, które mogą być nieczytelne lub powodować efekt smużenia
  .card, .btn, .shadow, .dropdown-menu {
    box-shadow: none !important;
    border: 2px solid #000000 !important;
  }

  // Wyróżnienie linków bez użycia koloru
  a {
    color: #000000 !important;
    text-decoration: underline !important;
    font-weight: 700;
  }

  // Ukrywamy całkowicie elementy, które nie mają sensu bez kolorów/animacji
  .video-bg, .skeleton-loader {
    display: none !important;
  }
}
```

## Plik: `_fonts.scss`

```scss
/**
 * molique - Fonty (@font-face)
 * FontBody = Inter (tekst), FontHeading = Poppins (nagłówki).
 * Nazwy rodzin odpowiadają --font-family-base / --font-family-heading z _root.
 * Ścieżki względne do skompilowanego CSS w css/ (pliki w css/../fonts/).
 * font-display: swap - tekst widoczny od razu, bez FOIT.
 *
 * DLACZEGO unicode-range: paczka Poppins ma pliki latin-ext TYLKO dla wagi
 * 400 i 700. Pozostałe wagi (m.in. 900 = .fw-black, używana w nagłówkach)
 * to subset "latin" bez ł/ż/ą/ę/ć/ń/ś/ź - przeglądarka podmieniała wtedy
 * POJEDYNCZE znaki na font systemowy, co widać jako rozjechaną typografię.
 * Rozwiązanie: podstawowa łacina leci z pliku właściwej wagi, a zakres
 * latin-ext z najbliższego pliku, który te glify ma (400 dla lekkich wag,
 * 700 dla ciężkich). Docelowo warto dociągnąć subsety latin-ext dla
 * wszystkich wag - wtedy druga deklaracja per waga staje się zbędna.
 */

// Zakresy z google-webfonts-helper (te same, których używa Google Fonts).
$latin: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
  U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122,
  U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
$latin-ext: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,
  U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
  U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;

/* --- FontBody: Inter (pliki mają latin-ext dla obu wag) --- */
@font-face {
  font-family: 'FontBody';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/inter-v20-latin_latin-ext-regular.woff2') format('woff2');
}
@font-face {
  font-family: 'FontBody';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/inter-v20-latin_latin-ext-700.woff2') format('woff2');
}

/* --- FontHeading: Poppins ---
   Mapa: waga -> (plik dla podstawowej łaciny, plik dla latin-ext).
   Wagi 400 i 700 mają własny plik z latin-ext, więc drugiej deklaracji
   nie potrzebują (null). */
$poppins: (
  100: ('poppins-v24-latin-100' 'poppins-v24-latin_latin-ext-regular'),
  200: ('poppins-v24-latin-200' 'poppins-v24-latin_latin-ext-regular'),
  300: ('poppins-v24-latin-300' 'poppins-v24-latin_latin-ext-regular'),
  400: ('poppins-v24-latin_latin-ext-regular' null),
  500: ('poppins-v24-latin-500' 'poppins-v24-latin_latin-ext-regular'),
  600: ('poppins-v24-latin-600' 'poppins-v24-latin_latin-ext-700'),
  700: ('poppins-v24-latin_latin-ext-700' null),
  800: ('poppins-v24-latin-800' 'poppins-v24-latin_latin-ext-700'),
  900: ('poppins-v24-latin-900' 'poppins-v24-latin_latin-ext-700')
);

@each $weight, $files in $poppins {
  $base: nth($files, 1);
  $ext: nth($files, 2);

  @font-face {
    font-family: 'FontHeading';
    font-style: normal;
    font-weight: $weight;
    font-display: swap;
    src: url('../fonts/#{$base}.woff2') format('woff2');

    // Subset "latin" trzeba ograniczyć zakresem, żeby nie przechwytywał
    // znaków, których nie zawiera. Plik z pełnym latin-ext (400/700)
    // obsługuje oba zakresy, więc zostaje bez ograniczenia.
    @if $ext != null {
      unicode-range: $latin;
    }
  }

  @if $ext != null {
    @font-face {
      font-family: 'FontHeading';
      font-style: normal;
      font-weight: $weight;
      font-display: swap;
      src: url('../fonts/#{$ext}.woff2') format('woff2');
      unicode-range: $latin-ext;
    }
  }
}
```

## Plik: `_forms.scss`

```scss
/**
 * molique - Komponenty formularzy (Hub)
 * Ten plik ładuje wszystkie mniejsze moduły formularzy z folderu components/
 */

@use 'components/form-base' as *;
@use 'components/form-groups' as *;
// Formularze zaawansowane rozbite na niezalezne moduly (kolejnosc = kolejnosc w CSS).
@use 'components/form-check' as *;
@use 'components/form-switch' as *;
@use 'components/form-input-range' as *;
@use 'components/form-file-upload' as *;
@use 'components/form-select-search' as *;
@use 'components/form-select-custom' as *;
@use 'components/theme-switch' as *;
```

## Plik: `_grid.scss`

```scss
/**
 * molique - System Grid (Natywny CSS Grid - Wzorzec RAM)
 * Architektura: Zero klas na dzieciach, pełna automatyzacja
 */

@use 'variables' as *;
@use 'mixins' as *;

@layer layout {
  /* =========================================
     1. BAZOWY KONTENER SIATKI
     ========================================= */
  .grid {
    display: grid;
    gap: var(--grid-gap);
  }

  /* NAPRAWA GRID BLOWOUT: 
     Każde dziecko grida może się skurczyć poniżej swojej zawartości */
  .grid > *,
  [class*="grid-cols-"] > *,
  [class*="grid-auto"] > * {
    min-width: 0;
  }

  /* =========================================
     2. INTELIGENTNY AUTO-GRID (Święty Graal RWD)
     ========================================= */
  /* 
     Użycie: <div class="grid-auto">...</div>
     Dzieci same ułożą się w kolumny o minimalnej szerokości 280px.
     Jeśli brakuje miejsca, automatycznie spadną do nowej linii.
  */
  .grid-auto {
    display: grid;
    gap: var(--grid-gap);
    /* Wzorzec RAM: Repeat, Auto-fit, Minmax */
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--grid-min, 280px)), 1fr));
  }

  /* Warianty Auto-Grida (nadpisywanie zmiennej lokalnej) */
  .grid-auto-sm { --grid-min: 200px; }
  .grid-auto-lg { --grid-min: 350px; }

  /* =========================================
     3. SZTYWNE KOLUMNY (Tylko gdy naprawdę potrzebne)
     ========================================= */
  $grid-columns: 12;

  @for $i from 1 through $grid-columns {
    .grid-cols-#{$i} {
      display: grid;
      grid-template-columns: repeat(#{$i}, 1fr);
    }
  }

  /* Siatka responsywna domyślnie JEDNOKOLUMNOWA poniżej swojego progu.
     Bez tej reguły .grid-md-cols-12 istniało wyłącznie w media query, więc na
     telefonie element nie był gridem w ogóle. Dzieci układały się wtedy jako
     bloki - wizualnie na pełną szerokość, czyli POPRAWNIE - ale gap przestawał
     działać (wymaga grid/flex) i odstępy znikały tylko na mobile. Trudny do
     wyłapania błąd, bo desktop wyglądał dobrze.

     Dzięki temu wystarczy `class="grid-md-cols-12"`; dopisywanie
     `grid-cols-1` przestaje być potrzebne. Reguły z media queries są dalej
     w źródle przy tej samej specyficzności, więc od progu normalnie wygrywają.

     Dotyczy obu progów - także .grid-lg-cols-*, które ma tu swój odpowiednik
     dla dzieci (.col-lg-span-*, .offset-lg-*). */
  [class*="grid-md-cols-"],
  [class*="grid-lg-cols-"] {
    display: grid;
    grid-template-columns: 1fr;
  }

  @include mq(md) {
    @for $i from 1 through $grid-columns {
      .grid-md-cols-#{$i} {
        display: grid;
        grid-template-columns: repeat(#{$i}, 1fr);
      }
    }
  }

  /* Wariant lg. Musi stać PO bloku md, żeby przy obu klasach naraz
     (np. "grid-md-cols-2 grid-lg-cols-4") wygrywał od progu lg - obie mają
     tę samą specyficzność, więc decyduje kolejność w źródle. */
  @include mq(lg) {
    @for $i from 1 through $grid-columns {
      .grid-lg-cols-#{$i} {
        display: grid;
        grid-template-columns: repeat(#{$i}, 1fr);
      }
    }
  }

  /* =========================================
     4. OVERRIDE DZIECI (Rozpiętość i Offsety)
     ========================================= */
  
  /* --- 1. ROZPIĘTOŚĆ (Span) --- */
  /* FIX: Używamy grid-column-end zamiast grid-column! */
  @for $i from 1 through $grid-columns {
    .col-span-#{$i} {
      grid-column-end: span #{$i};
      min-width: 0;
    }
  }

  @include mq(md) {
    @for $i from 1 through $grid-columns {
      .col-md-span-#{$i} {
        grid-column-end: span #{$i};
        min-width: 0;
      }
    }
  }

  @include mq(lg) {
    @for $i from 1 through $grid-columns {
      .col-lg-span-#{$i} {
        grid-column-end: span #{$i};
        min-width: 0;
      }
    }
  }

  /* --- 2. OFFSETY (Przesuwanie elementów w siatce) --- */
  @for $i from 1 through 12 {
    .col-start-#{$i}, 
    .offset-#{$i - 1} { 
      grid-column-start: #{$i}; 
    }
  }
  
  @include mq(md) {
    @for $i from 1 through 12 {
      .col-md-start-#{$i}, 
      .offset-md-#{$i - 1} { 
        grid-column-start: #{$i}; 
      }
    }
  }

  @include mq(lg) {
    @for $i from 1 through 12 {
      .col-lg-start-#{$i}, 
      .offset-lg-#{$i - 1} { 
        grid-column-start: #{$i}; 
      }
    }
  }
  
  /* Reset offsetu */
  .col-start-auto, .offset-0 { grid-column-start: auto; }
  @include mq(md) { .col-md-start-auto, .offset-md-0 { grid-column-start: auto; } }
  @include mq(lg) { .col-lg-start-auto, .offset-lg-0 { grid-column-start: auto; } }

  /* =========================================
     5. BENTO GRID (Asymetryczna siatka)
     ========================================= */
  .bento-grid {
    display: grid;
    /* Domyślna szerokość kafelka (Twoje płynne podejście) */
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    
    /* FIX 1: minmax() gwarantuje 250px, ale pozwala kafelkowi urosnąć, jeśli tekstu jest za dużo */
    grid-auto-rows: minmax(250px, auto); 
    gap: var(--grid-gap);
    
    /* FIX 2: MAGIA BENTO! Zmusza przeglądarkę do upychania mniejszych klocków w puste luki */
    grid-auto-flow: dense;
    
    /* Dzieci Bento Grida */
    > * {
      border-radius: var(--border-radius);
      overflow: hidden;
      /* Zapewnia, że zawartość wypełnia kafelek */
      display: flex;
      flex-direction: column;
    }
  }

  /* Modyfikatory rozpiętości (Działają od tabletu w górę) */
  @include mq(md) {
    .bento-col-2 { grid-column: span 2; }
    .bento-col-3 { grid-column: span 3; }
    .bento-row-2 { grid-row: span 2; }
    .bento-row-3 { grid-row: span 3; }
    
    /* FIX: Wymuszenie sztywnej liczby kolumn dla precyzyjnych układów Bento */
    .bento-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .bento-grid-4 { grid-template-columns: repeat(4, 1fr); }
  }
}
```

## Plik: `_layout.scss`

```scss
/**
 * molique - Layout
 * Zawiera sizing, positioning, flexbox i display
 */

@use 'variables' as *;
@use 'mixins' as *;

/* =========================================
   1. SIZING (Szerokość / Wysokość)
   ========================================= */
.w-25 { width: 25%; }
.w-50 { width: 50%; }
.w-75 { width: 75%; }
.w-100 { width: 100%; }
.w-auto { width: auto; }
.mw-100 { max-width: 100%; }

.h-100 { height: 100%; }
.vh-100 { height: 100vh; }
.min-vh-100 { min-height: 100vh; }

/* DODANE: Responsywne szerokości */
@include mq(md) {
  .w-md-25 { width: 25%; }
  .w-md-50 { width: 50%; }
  .w-md-75 { width: 75%; }
  .w-md-100 { width: 100%; }
  .w-md-auto { width: auto; }
}

/* =========================================
   2. DISPLAY & FLEXBOX
   ========================================= */
.d-none { display: none; }
.d-block { display: block; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.justify-content-start { justify-content: flex-start; }
.justify-content-end { justify-content: flex-end; }
.justify-content-center { justify-content: center; }
.justify-content-between { justify-content: space-between; }

.align-items-start { align-items: flex-start; }
.align-items-end { align-items: flex-end; }
.align-items-center { align-items: center; }
.align-items-stretch { align-items: stretch; }

.align-self-start { align-self: flex-start; }
.align-self-end { align-self: flex-end; }
.align-self-center { align-self: center; }
.align-self-stretch { align-self: stretch; }

/* Odstępy (Gap) dla Flexboxa i Grida */
.gap-0 { gap: 0; }
.gap-1 { gap: calc(var(--spacing-unit) * 1); }
.gap-2 { gap: calc(var(--spacing-unit) * 2); }
.gap-3 { gap: calc(var(--spacing-unit) * 3); }
.gap-4 { gap: calc(var(--spacing-unit) * 4); }
.gap-5 { gap: calc(var(--spacing-unit) * 6); }

@include mq(md) {
  .gap-md-0 { gap: 0; }
  .gap-md-1 { gap: calc(var(--spacing-unit) * 1); }
  .gap-md-2 { gap: calc(var(--spacing-unit) * 2); }
  .gap-md-3 { gap: calc(var(--spacing-unit) * 3); }
  .gap-md-4 { gap: calc(var(--spacing-unit) * 4); }
  .gap-md-5 { gap: calc(var(--spacing-unit) * 6); }
}

@include mq(md) {
  .d-md-none { display: none; }
  .d-md-block { display: block; }
  .d-md-flex { display: flex; }
  
  .flex-md-row { flex-direction: row; }
  .flex-md-column { flex-direction: column; }
}

/* =========================================
   3. POZYCJONOWANIE
   ========================================= */
.position-relative { position: relative !important; }
.position-absolute { position: absolute !important; }
.position-fixed { position: fixed !important; }
.position-sticky { 
  position: sticky !important; 
  top: 0; 
  z-index: var(--z-index-sticky); 
}

/* Krawędzie */
.top-0 { top: 0 !important; }
.bottom-0 { bottom: 0 !important; }
.left-0 { left: 0 !important; }
.right-0 { right: 0 !important; }
.inset-0 { inset: 0 !important; }

/* Centrowanie absolutne */
.top-50 { top: 50% !important; }
.left-50 { left: 50% !important; }

.translate-middle { transform: translate(-50%, -50%) !important; }
.translate-middle-x { transform: translateX(-50%) !important; }
.translate-middle-y { transform: translateY(-50%) !important; }

/* =========================================
   4. Z-INDEX
   ========================================= */
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }

/* =========================================
   5. TEKST
   ========================================= */
.text-center { text-align: center; }
.text-start { text-align: left; }
.text-end { text-align: right; }

.fw-bold { font-weight: var(--fw-bold); }
.fw-normal { font-weight: var(--fw-normal); }
.fw-light { font-weight: var(--fw-light); }
/* =========================================
   6. FADE BOTTOM (Zanikanie treści przy dolnej krawędzi)
   =========================================
   Opt-in dla dowolnego przewijanego kontenera (lub elementu, przez
   który przewija się strona): gradient przykrywa dolną krawędź i
   treść "zanika" zamiast być ucięta. Kolor gradientu MUSI odpowiadać
   tłu elementu - steruj przez --fade-color (domyślnie --bg-surface).
   Wysokość: --fade-height. Komponenty admina (.admin-sidebar,
   .admin-main) mają własne integracje w module admin. */
.fade-bottom {
  --fade-height: 80px;
  --fade-color: var(--bg-surface);

  &::after {
    content: '';
    display: block;
    position: sticky;
    bottom: 0;
    height: var(--fade-height);
    /* Gradient nakłada się na treść, nie wydłuża przewijania */
    margin-top: calc(var(--fade-height) * -1);
    flex-shrink: 0;
    background: linear-gradient(to top, var(--fade-color) 15%, transparent);
    pointer-events: none;
    z-index: 2;
  }
}
```

## Plik: `_mixins.scss`

```scss
// Mixin dla responsywności (Mobile-first)

@use 'variables' as *;

// Mixin dla responsywności
@mixin mq($breakpoint, $type: min) {
  @if $type == min {
    @if $breakpoint == sm {
      @media (min-width: $breakpoint-sm) { @content; }
    } @else if $breakpoint == md {
      @media (min-width: $breakpoint-md) { @content; }
    } @else if $breakpoint == lg {
      @media (min-width: $breakpoint-lg) { @content; }
    } @else if $breakpoint == xl {
      @media (min-width: $breakpoint-xl) { @content; }
    }
  } @else if $type == max {
    @if $breakpoint == xs {
      @media (max-width: $breakpoint-xs-max) { @content; }
    } @else if $breakpoint == sm {
      @media (max-width: $breakpoint-sm-max) { @content; }
    } @else if $breakpoint == md {
      @media (max-width: $breakpoint-md-max) { @content; } /* TEGO BRAKOWAŁO */
    } @else if $breakpoint == lg {
      @media (max-width: $breakpoint-lg-max) { @content; } /* TEGO BRAKOWAŁO */
    }
  }
}

// Ukrywa strzałki (spinnery) w polach input type="number"
@mixin hide-number-spinners {
  appearance: textfield;
  // stylelint-disable-next-line property-no-vendor-prefix
  -moz-appearance: textfield; 

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
```

## Plik: `_root.scss`

```scss
/**
 * molique - Zmienne Root i Fonty
 * Architektura: Płynna typografia, B2B Target Size, Dark Mode Ready
 */

/* =========================================
   ZMIENNE CSS (CSS Custom Properties)
   ========================================= */
:root {
  /* Deklaracja schematu kolorów dla przeglądarki. Bez niej kolory
     systemowe (CanvasText itd.) są ZAWSZE jasnoschematowe - np. natywny
     <dialog> dostaje od UA color: CanvasText (czarny) i w dark mode
     nagłówki (color: inherit) robią się czarne na ciemnej karcie.
     Deklaracja naprawia też natywne scrollbary i kontrolki formularzy. */
  color-scheme: light;

  /* Fonty z systemowym fallbackiem */
  --font-family-base: 'FontBody', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'FontHeading', system-ui, -apple-system, sans-serif;

  /* NOWA PALETA BAZOWA (Nowoczesne B2B) */
  --primary: #0284C7;
  --primary-hover: #0369A1;
  --light: #F9F9F9;
  --dark: #1E293B;
  
  --secondary: #64748B;
  --secondary-hover: #475569;
  --success: #10B981;
  --success-hover: #059669;
  --danger: #EF4444;
  --danger-hover: #DC2626;
  --warning: #F59E0B;
  --warning-hover: #D97706;
  --info: #0EA5E9;
  --info-hover: #0284C7;

  /* Kolory tła i tekstu */
  --bg-body: #F1F5F9; /* Delikatny szary podkład pod panele */
  --bg-surface: #FFFFFF; /* Czysta biel dla kart i głównych kontenerów */
  --text-main: var(--dark);
  --text-muted: var(--secondary);
  --border-color: #E2E8F0;
  
  /* ZMIENNE SIDEBARA ADMINA.
     UWAGA: sidebar jest ZAWSZE ciemny (--sidebar-bg nie zmienia się
     w dark mode), więc jego jasne akcenty muszą być literalne — NIE
     wolno tu używać var(--light) / var(--light-rgb), bo dark mode
     odwraca te zmienne (jasny → ciemny) i tekst oraz podświetlenia
     znikają na ciemnym tle sidebara. */
  --sidebar-bg: #102E4A;
  --sidebar-submenu-bg: #52677D;
  --sidebar-text: #94A3B8;
  --sidebar-text-active: #F9F9F9;
  /* Jasne akcenty sidebara (hover, separatory, scrollbar, plakietka
     logo) — niezależne od motywu, w przeciwieństwie do --light-rgb */
  --sidebar-highlight-rgb: 249, 249, 249;
  
  /* Rozmiary Sidebara */
  --sidebar-width-lg: 280px;
  --sidebar-width-md: 100px;
  --sidebar-width-sm: 72px;

  /* Kolory RGB do przezroczystości (Muszą odpowiadać kolorom HEX wyżej!) */
  --primary-rgb: 2, 132, 199;     /* #0284C7 */
  --secondary-rgb: 100, 116, 139; /* #64748B */
  --success-rgb: 16, 185, 129;    /* #10B981 */
  --danger-rgb: 239, 68, 68;      /* #EF4444 */
  --warning-rgb: 245, 158, 11;    /* #F59E0B */
  --info-rgb: 14, 165, 233;       /* #0EA5E9 */
  
  --dark-rgb: 30, 41, 59;         /* #1E293B */
  --light-rgb: 249, 249, 249;     /* #F9F9F9 */
  --body-rgb: 241, 245, 249;      /* #F1F5F9 */
  --bg-surface-rgb: 255, 255, 255; /* #FFFFFF - kanały --bg-surface, używane przez .bg-glass */
  --sidebar-rgb: 16, 46, 74;      /* #102E4A */

  --btn-text-light: var(--light);
  --btn-text-dark: var(--dark);
  --card-bg-subtle: rgba(var(--dark-rgb), 0.03);

  /* BLOKI KODU. Ciemne w OBU motywach (tak wygląda kod wszędzie), ale
     wartość NIE może być zahardkodowana: w dark mode --bg-surface to
     dokładnie #1E293B, więc blok kodu zlewał się z tłem strony w jeden
     prostokąt. W ciemnym motywie schodzimy poniżej tła powierzchni. */
  --code-bg: #1E293B;
  --code-text: #E2E8F0;
  --code-border: rgba(255, 255, 255, 0.12);

  /* Spacing (1 jednostka = 8px) */
  --spacing-unit: 8px;

  /* Grid */
  --grid-gap: calc(var(--spacing-unit) * 3);

  /* Inne */
  --border-radius: 8px;
  --border-radius-lg: 16px;
  --transition-speed: 0.2s;

  /* Baza: 14px na mobile, rośnie do max 15px na desktopie. 
     Idealne do gęstych interfejsów SaaS/CRM. */
  --text-base-size: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  
  /* Skala dla nagłówków (Major Third - 1.25) 
     Przeliczona od nowej, mniejszej bazy, żeby zachować proporcje */
  
  /* H1: Główne tytuły stron */
  --h1-size: clamp(2rem, 2vw + 1rem, 2.5rem);
  
  /* H2: Tytuły sekcji */
  --h2-size: clamp(1.6rem, 1.5vw + 0.8rem, 2rem);
  
  /* H3: Tytuły dużych kart/widgetów */
  --h3-size: clamp(1.28rem, 1vw + 0.8rem, 1.6rem);
  
  /* H4: Standardowe tytuły kart */
  --h4-size: clamp(1.02rem, 0.8vw + 0.7rem, 1.28rem);
  
  /* H5: Wyróżniony tekst, etykiety */
  --h5-size: clamp(0.9rem, 0.5vw + 0.7rem, 1.02rem);
  
  /* H6: Równe tekstowi bazowemu, ale pogrubione */
  --h6-size: var(--text-base-size);

  /* Skala dla małych tekstów (np. stopki, metadane, tagi) */
  --text-sm: 0.8125rem; /* 13px */
  --text-xs: 0.75rem;   /* 12px */

  /* =========================================
     B2B TARGET SIZE (WCAG 2.2 AAA)
     ========================================= */
  --target-size-min: 44px;
  --hamburger-size: var(--target-size-min);
  --hamburger-bar-width: 24px;
  --hamburger-bar-height: 2px;

  /* Rozmiary kontenerów i komponentów */
  --container-max-width: 1200px;
  --post-thumb-size: 60px;

  /* Wysokość globalnego navbara (logo 44px + pionowy padding 2x16px).
     Używana, gdy pod navbarem siedzi layout admina - sidebar startuje
     dokładnie pod paskiem i wypełnia resztę okna. */
  --navbar-h: 76px;

  /* Cienie i Poświaty */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  --focus-ring-width: 3px;
  --focus-ring-color: rgba(var(--primary-rgb), 0.25);
  --focus-ring-radius: var(--border-radius);

  /* Layout */
  --scroll-padding: 80px;  

  /* Z-INDEX (Architektura warstw) */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-toast: 1070;
  --z-index-tooltip: 1080;
  --z-index-skip-link: 9999;

  /* WAGI FONTÓW */
  --fw-light: 300;
  --fw-normal: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700;
  --fw-black: 900;
}

/* =========================================
   KOLORY - PALETA DARK MODE
   ========================================= */
[data-theme="dark"] {
  /* Kolory systemowe przeglądarki (CanvasText, scrollbary, natywne
     kontrolki, kalendarz date-pickera) podążają za ciemnym motywem */
  color-scheme: dark;

  /* 1. Kolory strukturalne (Odwrócenie) */
  --bg-body: #0F172A; /* Bardzo ciemny granat/szary (nie czysty czarny!) */
  --bg-surface: #1E293B; /* Nieco jaśniejszy od body (tworzy głębię kart) */
  --text-main: #F8FAFC;
  --text-muted: #94A3B8;
  --border-color: #334155;

  /* 2. Kolory semantyczne (Rozjaśnione i odsycone dla czytelności na ciemnym) */
  --primary: #38BDF8;       /* Jaśniejszy niebieski */
  --primary-hover: #7DD3FC;
  
  --secondary: #94A3B8;     /* Jaśniejszy szary */
  --secondary-hover: #CBD5E1;
  
  --success: #34D399;       /* Pastelowy zielony */
  --success-hover: #6EE7B7;
  
  --danger: #F87171;        /* Pastelowy czerwony (nie razi w oczy) */
  --danger-hover: #FCA5A5;
  
  --warning: #FBBF24;       /* Jasny pomarańczowy/żółty */
  --warning-hover: #FCD34D;
  
  --info: #38BDF8;
  --info-hover: #7DD3FC;

  /* Zmienne semantyczne odwrócone */
  --light: #1E293B; /* W dark mode 'light' staje się ciemny */
  --dark: #F8FAFC;  /* W dark mode 'dark' staje się jasny */

  /* 3. Wartości RGB dla Dark Mode (Kluczowe dla klas -subtle i focus ringów!) */
  --primary-rgb: 56, 189, 248;
  --secondary-rgb: 148, 163, 184;
  --success-rgb: 52, 211, 153;
  --danger-rgb: 248, 113, 113;
  --warning-rgb: 251, 191, 36;
  --info-rgb: 56, 189, 248;
  
  --dark-rgb: 248, 250, 252;
  --light-rgb: 15, 23, 42;
  --body-rgb: 15, 23, 42;
  --bg-surface-rgb: 30, 41, 59;
  --sidebar-rgb: 15, 23, 42;

  /* Ciemniej niż --bg-surface (#1E293B) i niż --bg-body (#0F172A),
     żeby blok kodu odcinał się od obu. */
  --code-bg: #060B16;
}
```

## Plik: `_share.scss`

```scss
/**
 * molique - Widget Udostępniania (Share Bar)
 * Pionowy pasek social-share przyklejony do krawędzi ekranu (poziomy
 * i przyklejony do dołu na mobile). Kolory sieci są celowo brandowe
 * (nie z palety molique), żeby ikony pozostały rozpoznawalne.
 */

@use 'variables' as *;
@use 'mixins' as *;

.share-bar {
  position: fixed;
  top: 50%;
  left: 20px;
  z-index: var(--z-index-fixed);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.25);
  padding: calc(var(--spacing-unit) * 1.25);
  background: #fff;
  border-radius: 50rem;
  box-shadow: var(--shadow-lg);
  transform: translateY(-50%);

  @include mq(md, max) {
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    flex-direction: row;
    justify-content: center;
    border-radius: 0;
    transform: none;
  }
}

.share-btn {
  width: 40px;
  height: 40px;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 1.125rem;
  text-decoration: none;
  cursor: pointer;
  transition: transform var(--transition-speed), filter var(--transition-speed);

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }

  &[data-network='facebook'] { background-color: #1877f2; }
  &[data-network='twitter'] { background-color: #000000; }
  &[data-network='linkedin'] { background-color: #0a66c2; }
  &[data-network='whatsapp'] { background-color: #25d366; }
  &[data-network='native'] { background-color: var(--primary); }
}
```

## Plik: `_shop.scss`

```scss
/**
 * molique - Moduł E-commerce
 * Zawiera specyficzne komponenty dla sklepów internetowych.
 */

@use 'variables' as *;
@use 'mixins' as *;

/* =========================================
   1. KARTA PRODUKTU (Baza)
   ========================================= */
.product-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: box-shadow var(--transition-speed), transform var(--transition-speed);
  height: 100%;
}
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.product-image-wrapper {
  position: relative;
  display: block;
  overflow: hidden;
  /* Tło pod zdjęciem produktu podąża za motywem (w light mode to nadal
     czysta biel) - literalne #fff dawało jaskrawobiały blok na ciemnej
     karcie w dark mode, prześwitujący też pod półprzezroczystymi
     placeholderami typu --card-bg-subtle. */
  background-color: var(--bg-surface);
}
.product-image-wrapper img {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-image-wrapper:hover img {
  transform: scale(1.05);
}

.product-badges {
  position: absolute;
  top: calc(var(--spacing-unit) * 1.5);
  left: calc(var(--spacing-unit) * 1.5);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
  z-index: 2;
}

.product-content {
  padding: calc(var(--spacing-unit) * 3);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  font-size: 1.125rem;
  font-weight: var(--fw-bold);
  color: var(--text-main);
  text-decoration: none;
  margin-bottom: calc(var(--spacing-unit) * 1);
  transition: color var(--transition-speed);
}
.product-title:hover {
  color: var(--primary);
}

.product-price-block {
  margin-top: auto; /* Pcha cenę na dół, jeśli tytuł jest krótki */
  padding-top: calc(var(--spacing-unit) * 2);
  display: flex;
  align-items: baseline;
  gap: calc(var(--spacing-unit) * 1.5);
}

.price-current {
  font-size: 1.5rem;
  font-weight: var(--fw-black);
  color: var(--primary);
}

.price-old {
  font-size: 1rem;
  color: var(--text-muted);
  text-decoration: line-through;
}

/* =========================================
   2. WIDOK LISTY (Grid / List Toggle)
   ========================================= */
.product-list-view {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 3);

  .product-card {
    flex-direction: row;
    align-items: stretch;
  }

  .product-image-wrapper {
    width: 250px;
    flex-shrink: 0;
    border-right: 1px solid var(--border-color);
    display: flex; /* NAPRAWA: Pozwala zdjęciu wypełnić kontener */
    
    img {
      width: 100%;
      height: 100% !important; /* NAPRAWA: Nadpisuje inline style z HTML */
      object-fit: cover;
    }
  }

  .product-content {
    justify-content: center;
  }

  .product-price-block {
    margin-top: calc(var(--spacing-unit) * 2);
  }

  @include mq(sm, max) {
    .product-card { flex-direction: column; }
    .product-image-wrapper { 
      width: 100%; 
      border-right: none; 
      border-bottom: 1px solid var(--border-color); 
      
      img { height: 250px !important; } /* Na mobile wracamy do stałej wysokości */
    }
  }
}

/* =========================================
   3. STAR RATINGS (Oceny Gwiazdkowe - Czysty CSS)
   ========================================= */
.star-rating {
  /* Lokalne zmienne API */
  --rating: 0; /* Wartość od 0 do 5 */
  --star-size: 16px;
  --star-color: var(--warning);
  --star-bg: var(--border-color);
  display: inline-block;
  width: calc(var(--star-size) * 5);
  height: var(--star-size);
  /* Tło to gradient, który wypełnia się w zależności od zmiennej --rating */
  background: linear-gradient(to right, var(--star-color) calc(var(--rating) / 5 * 100%), var(--star-bg) calc(var(--rating) / 5 * 100%));
  /* Maska SVG wycina z tła kształt 5 gwiazdek! */
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E");
  -webkit-mask-size: var(--star-size) var(--star-size);
  mask-size: var(--star-size) var(--star-size);
  -webkit-mask-repeat: repeat-x;
  mask-repeat: repeat-x;
}

/* =========================================
   4. COLOR SWATCHES (Wybór koloru)
   ========================================= */
.product-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 1);
  margin-top: calc(var(--spacing-unit) * 1.5);
}

.swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bg-surface); /* Wewnętrzna ramka */
  box-shadow: 0 0 0 1px var(--border-color); /* Zewnętrzna ramka */
  cursor: pointer;
  transition: box-shadow var(--transition-speed), transform var(--transition-speed);
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch.is-active {
  box-shadow: 0 0 0 2px var(--primary);
}

/* =========================================
   5. KOSZYK (Cart Item & Qty Input)
   ========================================= */
.cart-item {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 3);
  flex-wrap: wrap;
}

.cart-item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.cart-item-info {
  flex-grow: 1;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 3);
}

/* Kontroler Ilości (+ / -) */
.qty-input {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  height: var(--target-size-min); /* Wymuszone 44px dla B2B */
  background-color: var(--bg-body);
  transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
  
  /* Focus ring na całym kontenerze, gdy input jest aktywny */
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
  }
}

.qty-btn {
  background-color: var(--bg-surface);
  border: none;
  color: var(--text-main);
  padding: 0 calc(var(--spacing-unit) * 2);
  cursor: pointer;
  font-weight: var(--fw-bold);
  transition: background-color var(--transition-speed);

  &:hover { background-color: var(--border-color); }
  &:focus { outline: none; }
}

/* Ukrycie natywnych strzałek (spinnera) niezależnie od klasy inputa -
   kontrolka ma własne przyciski + / -, więc systemowy stepper by się
   dublował (dotąd chowała je tylko klasa .qty-val). */
.qty-input input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.qty-val {
  width: 50px;
  border: none;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  text-align: center;
  font-weight: var(--fw-bold);
  color: var(--text-main);
  background-color: transparent;
  padding: 0;
  margin: 0;
  min-height: 0 !important; /* Nadpisuje globalne 44px z _base.scss */
  
  /* Usuwamy domyślny focus, bo obsługuje go rodzic (.qty-input) */
  &:focus { outline: none; box-shadow: none; } 
  
  /* Ukrywamy strzałki systemowe */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
/* =========================================
   6. SELECTION TILES (Kafelki wyboru)
   ========================================= */
.selection-tile {
  display: block;
  position: relative;
  cursor: pointer;
  margin: 0;

  /* Ukrywamy natywny input, ale zostawiamy go w DOM dla dostępności */
  input[type="radio"],
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    z-index: -1;

    /* MAGIA: Kiedy input jest zaznaczony, stylujemy sąsiadujący .tile-content */
    &:checked + .tile-content {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 1px var(--primary);
      background-color: rgba(var(--primary-rgb), 0.03) !important;
    }

    /* Focus dla nawigacji klawiaturą (A11y) */
    &:focus-visible + .tile-content {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  }

  .tile-content {
    transition: all var(--transition-speed);
    height: 100%;
  }
}

/* Wariant z animowaną ramką (współpracuje z .hover-border-trace) */
.selection-tile-animated {
  input[type="radio"]:checked + .tile-content,
  input[type="checkbox"]:checked + .tile-content {
    /* Usuwamy natychmiastową zmianę ramki i cienia, zostawiamy to animacji CSS Houdini */
    border-color: var(--border-color) !important;
    box-shadow: none;
  }
}
```

## Plik: `_speed-dial.scss`

```scss
/**
 * molique - Widget Speed Dial (Floating Action Button)
 * Pływający przycisk akcji, który po najechaniu (desktop) lub kliknięciu
 * (dowolne urządzenie, dzięki :focus-within) rozwija dodatkowe opcje.
 * Zero JavaScriptu.
 */

@use 'variables' as *;
@use 'mixins' as *;

.speed-dial {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: var(--z-index-fixed);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
}

.speed-dial-main {
  width: 56px;
  height: 56px;
  min-height: 0;
  border-radius: 50%;
  background-color: var(--primary);
  color: #fff;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-speed);

  &:hover {
    transform: scale(1.05);
  }
}

.speed-dial-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity var(--transition-speed), transform var(--transition-speed), visibility var(--transition-speed);
}

/* Rozwija się na hover CAŁEGO widgetu LUB gdy focus jest na którymkolwiek
   jego dziecku (np. po kliknięciu .speed-dial-main) — działa więc też
   na urządzeniach dotykowych i z klawiatury, bez ani linijki JS. */
.speed-dial:hover .speed-dial-actions,
.speed-dial:focus-within .speed-dial-actions {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.speed-dial-action {
  width: 44px;
  height: 44px;
  min-height: 0;
  border-radius: 50%;
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  text-decoration: none;
  cursor: pointer;
  transition: transform var(--transition-speed), background-color var(--transition-speed), color var(--transition-speed);

  &:hover {
    transform: scale(1.1);
    background-color: var(--primary);
    color: #fff;
  }
}
```

## Plik: `_utilities-extended.scss`

```scss
// molique - Odstepy (padding/margin) na progach sm, lg i xl
//
// Modul OPT-IN: nie wchodzi do domyslnego bundla ani do presetu "Wszystko"
// w konfiguratorze. Generuje komplet odstepow razy trzy dodatkowe progi, wiec
// wazy tyle, co kilka komponentow - wlaczasz go swiadomie albo wcale.
// Rdzen ma odstepy bazowe i wariant -md-; to jest rozszerzenie ponad to.

@use 'variables' as *;
@use 'mixins' as *;
@use 'sass:meta';
@use 'sass:list';

/* =========================================
   UTILITIES - EXTENDED (Włącz na żądanie)
   ========================================= */

$space-amounts: (0: 0, 1: $spacing-unit, 2: $spacing-unit * 2, 3: $spacing-unit * 3, 4: $spacing-unit * 4, 5: $spacing-unit * 6);
$sides: (t: top, b: bottom, l: left, r: right, x: (left, right), y: (top, bottom));

// Generowanie breakpointów pobocznych (sm, lg, xl)
$extended-breakpoints: ('sm': sm, 'lg': lg, 'xl': xl);

@each $bp-name, $bp-val in $extended-breakpoints {
  @include mq($bp-val) {
    @each $space-key, $space-val in $space-amounts {
      .p-#{$bp-name}-#{$space-key} { padding: #{$space-val}; }
      .m-#{$bp-name}-#{$space-key} { margin: #{$space-val}; }
      
      @each $side-key, $side-val in $sides {
        @if meta.type-of($side-val) == "list" {
          .p#{$side-key}-#{$bp-name}-#{$space-key} { padding-block: #{$space-val}; }
          @if $side-key == x { .p#{$side-key}-#{$bp-name}-#{$space-key} { padding-inline: #{$space-val}; } }
          
          .m#{$side-key}-#{$bp-name}-#{$space-key} { margin-block: #{$space-val}; }
          @if $side-key == x { .m#{$side-key}-#{$bp-name}-#{$space-key} { margin-inline: #{$space-val}; } }
        } @else {
          .p#{$side-key}-#{$bp-name}-#{$space-key} { padding-#{$side-val}: #{$space-val}; }
          .m#{$side-key}-#{$bp-name}-#{$space-key} { margin-#{$side-val}: #{$space-val}; }
        }
      }
    }
  }
}
```

## Plik: `_utilities.scss`

```scss
/**
 * molique - Utilities (Hub)
 * Ten plik ładuje wszystkie mniejsze moduły z folderu utilities/
 */

@use 'utilities/spacing';
@use 'utilities/typography';
@use 'utilities/colors';
@use 'utilities/borders';
@use 'utilities/animations';
@use 'utilities/helpers';
```

## Plik: `_variables.scss`

```scss
/**
 * molique - Zmienne SCSS
 */

// Mapowanie zmiennych SASS
$primary: var(--primary);
$bg-body: var(--bg-body);
$bg-surface: var(--bg-surface);
$text-main: var(--text-main);
$text-muted: var(--text-muted);
$border-color: var(--border-color);
$spacing-unit: 8px;

// BREAKPOINTY (RWD - Media Queries)
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

$breakpoint-xs-max: $breakpoint-sm - 1px;
$breakpoint-sm-max: $breakpoint-md - 1px;
$breakpoint-md-max: $breakpoint-lg - 1px;
$breakpoint-lg-max: $breakpoint-xl - 1px;
$breakpoint-xl-max: $breakpoint-xxl - 1px;
```

## Plik: `molique-style-admin.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Panelu Admina
 * Ten plik wygeneruje gotowy molique-style-admin.css
 */

@use "sass:meta";

// 1. Deklarujemy warstwę
@layer modules;

// 2. Wstrzykujemy fizyczny kod admina do warstwy
@layer modules {
  // Wczytujemy rozbite pliki, które utworzyliśmy w poprzednim kroku
  @include meta.load-css("layout/admin-layout");
  @include meta.load-css("components/admin-sidebar");
  @include meta.load-css("components/admin-nav");
  @include meta.load-css("components/chart-funnel"); 
  @include meta.load-css("components/dashboard"); 
}
```

## Plik: `molique-style-before-after.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Widgetu Przed / Po
 * Ten plik wygeneruje gotowy molique-style-before-after.css
 */

@use "sass:meta";

// 1. Deklarujemy warstwę, aby style widgetu miały odpowiedni priorytet
@layer modules;

// 2. Wstrzykujemy fizyczny kod widgetu do warstwy
@layer modules {
  @include meta.load-css("before-after");
}
```

## Plik: `molique-style-blog.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Modułu Bloga
 * Ten plik wygeneruje gotowy molique-style-blog.css
 */

@use "sass:meta";

@layer modules;

@layer modules {
  @include meta.load-css("blog");
}
```

## Plik: `molique-style-docs.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Dokumentacji
 * Ten plik wygeneruje gotowy molique-style-docs.css
 */

@use "sass:meta";

@layer modules;

@layer modules {
  @include meta.load-css("modules/docs");
  @include meta.load-css("components/theme-editor");
}
```

## Plik: `molique-style-share.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Widgetu Udostępniania (Share)
 * Ten plik wygeneruje gotowy molique-style-share.css
 */

@use "sass:meta";

// 1. Deklarujemy warstwę, aby style widgetu miały odpowiedni priorytet
@layer modules;

// 2. Wstrzykujemy fizyczny kod widgetu do warstwy
@layer modules {
  @include meta.load-css("share");
}
```

## Plik: `molique-style-shop.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Modułu E-commerce
 * Ten plik wygeneruje gotowy molique-style-shop.css
 */

@use "sass:meta";

// 1. Deklarujemy warstwę, aby style sklepu miały odpowiedni priorytet
@layer modules;

// 2. Wstrzykujemy fizyczny kod sklepu do warstwy
@layer modules {
  @include meta.load-css("shop");
}
```

## Plik: `molique-style-speed-dial.scss`

```scss
/**
 * molique - Plik kompilacyjny dla Widgetu Speed Dial
 * Ten plik wygeneruje gotowy molique-style-speed-dial.css
 */

@use "sass:meta";

// 1. Deklarujemy warstwę, aby style widgetu miały odpowiedni priorytet
@layer modules;

// 2. Wstrzykujemy fizyczny kod widgetu do warstwy
@layer modules {
  @include meta.load-css("speed-dial");
}
```

## Plik: `molique-style.scss`

```scss
@use "sass:meta";

// Definicja kolejności warstw
@layer reset, base, layout, components, modules, utilities;

// Wstrzykiwanie kodu bezpośrednio do warstw
@layer reset {
  @include meta.load-css("root"); // Tylko root ma fizyczny CSS (:root)
  @include meta.load-css("fonts"); // @font-face: Inter + Poppins
}

@layer base {
  @include meta.load-css("base");
  @include meta.load-css("a11y");
  @include meta.load-css("eink");
}

@layer layout {
  @include meta.load-css("grid");
  @include meta.load-css("layout");
}

@layer components {
  @include meta.load-css("buttons");
  @include meta.load-css("forms");
  @include meta.load-css("components");
}

@layer modules {
  // Moduły opcjonalne (zakomentowane, bo kompilujemy je do osobnych plików!)
  // @include meta.load-css("shop");
  // @include meta.load-css("blog");
  // @include meta.load-css("admin");
}

@layer utilities {
  @include meta.load-css("utilities");
  // @use 'utilities-extended'; 
}
```

