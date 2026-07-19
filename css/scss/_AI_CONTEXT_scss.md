# Zbiorczy kontekst projektu dla AI

**Folder glowny:** `scss`
**Liczba plikow w paczce:** 43

## Struktura plikow:
- `components/_admin-nav.scss`
- `components/_admin-sidebar.scss`
- `components/_business.scss`
- `components/_cards.scss`
- `components/_chart-funnel.scss`
- `components/_charts.scss`
- `components/_dashboard.scss`
- `components/_data-display.scss`
- `components/_feedback.scss`
- `components/_form-advanced.scss`
- `components/_form-base.scss`
- `components/_form-groups.scss`
- `components/_modals.scss`
- `components/_navigation.scss`
- `layout/_admin-layout.scss`
- `modules/_docs.scss`
- `molique-style-admin.scss`
- `molique-style-blog.scss`
- `molique-style-docs.scss`
- `molique-style-shop.scss`
- `molique-style.scss`
- `utilities/_animations.scss`
- `utilities/_borders.scss`
- `utilities/_colors.scss`
- `utilities/_helpers.scss`
- `utilities/_spacing.scss`
- `utilities/_typography.scss`
- `_a11y.scss`
- `_admin.scss`
- `_base.scss`
- `_blog.scss`
- `_buttons.scss`
- `_components.scss`
- `_eink.scss`
- `_forms.scss`
- `_grid.scss`
- `_layout.scss`
- `_mixins.scss`
- `_root.scss`
- `_shop.scss`
- `_utilities-extended.scss`
- `_utilities.scss`
- `_variables.scss`

---

## Plik: `components/_admin-nav.scss`

```scss
@use '../variables' as *;
@use '../mixins' as *;

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
      background-color: rgba(var(--light-rgb), 0.05);
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
        flex-direction: column;
        justify-content: center;
        padding: calc(var(--spacing-unit) * 1) 4px;
        gap: calc(var(--spacing-unit) * 0.5);
        text-align: center;
        width: 100%; 

        .nav-text {
          font-size: 0.6rem; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: normal;
          word-break: break-word;
          line-height: 1.1;
          width: 100%;
        }
      }

      .sidebar-md .admin-sidebar:hover &,
      .sidebar-sm .admin-sidebar:hover & {
        flex-direction: row;
        justify-content: flex-start;
        padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
        gap: calc(var(--spacing-unit) * 1.5);
        text-align: left;

        /* W trybie SM ikony miały margin: 0 !important, musimy to zresetować */
        i, svg, .sidebar-toggle-icon {
          margin: 0 !important;
        }

        .nav-text {
          display: block; /* W trybie SM tekst był ukryty, przywracamy go */
          font-size: 0.875rem;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
        }
      }

      /* MAGIA: Kiedy najeżdżamy na wąski sidebar, linki wracają do normalności! */
      .sidebar-md .admin-sidebar:hover & {
        flex-direction: row;
        justify-content: flex-start;
        padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
        text-align: left;

        .nav-text {
          font-size: 0.875rem;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
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
    background-color: rgba(var(--light-rgb), 0.1);
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
      bottom: 70px; /* Wysokość dolnego paska */
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
      background-color: rgba(var(--light-rgb), 0.05);
    }

    &.is-active {
      color: var(--sidebar-text-active);
      font-weight: var(--fw-bold);
      border-color: rgba(255, 255, 255, 0.2);
      background-color: transparent;
      box-shadow: none !important;
    }
  }

  /* --- WARIANTY WĄSKIE (Całkowite ukrycie drzewka) --- */
  @include mq(md) {
    .sidebar-md .admin-nav-submenu,
    .sidebar-sm .admin-nav-submenu {
      summary::after { display: none; }
      
      .admin-nav-submenu-list { 
        display: none !important; 
      }
    }

    /* FIX: Przywracamy drzewko i strzałkę dla MD i SM! */
    .sidebar-md .admin-sidebar:hover .admin-nav-submenu,
    .sidebar-sm .admin-sidebar:hover .admin-nav-submenu {
      summary::after { display: inline-block; }
      
      &[open] .admin-nav-submenu-list {
        display: flex !important;
      }
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
      background-color: rgba(var(--light-rgb), 0.05);
    }

    &.is-active {
      color: var(--sidebar-text-active);
      font-weight: var(--fw-bold);
      border-color: rgba(255, 255, 255, 0.2);
      background-color: transparent;
      box-shadow: none !important;
    }
  }

  /* --- WARIANTY WĄSKIE (Ukrywanie drzewka) --- */
  @include mq(md) {
    .sidebar-md .admin-nav-submenu,
    .sidebar-sm .admin-nav-submenu {
      summary::after { display: none; }
      
      /* Domyślnie ukrywamy listę w wąskim trybie */
      .admin-nav-submenu-list { 
        display: none !important; 
      }
    }

    /* FIX: Przywracamy drzewko i strzałkę, gdy najedziemy na wąski sidebar! */
    .sidebar-md .admin-sidebar:hover .admin-nav-submenu {
      summary::after { display: inline-block; }
      
      /* Jeśli <details> jest otwarte, pokazujemy listę */
      &[open] .admin-nav-submenu-list {
        display: flex !important;
      }
    }
  }

  /* Na mobile (Bottom Nav) ukrywamy submenu całkowicie */
  @media (max-width: 768px) {
    .admin-nav-submenu-list { display: none !important; }
    .admin-nav-submenu summary::after { display: none; }
  }

} /* ZAMKNIĘCIE @layer components */
```

---

## Plik: `components/_admin-sidebar.scss`

```scss
@use '../variables' as *;
@use '../mixins' as *;

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
    scrollbar-color: rgba(var(--light-rgb), 0.1) transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { 
      background: rgba(var(--light-rgb), 0.1); 
      border-radius: var(--border-radius); 
    }

    /* =========================================
       MAGIA: PŁYWAJĄCE ROZWIJANIE NA HOVER
       ========================================= */
    @include mq(md) {
      /* FIX: Działa zarówno dla MD jak i SM */
      .admin-layout.sidebar-md &:hover,
      .admin-layout.sidebar-sm &:hover {
        width: var(--sidebar-width-lg);
        box-shadow: 10px 0 30px rgba(0,0,0,0.15);
      }
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
      border-top: 1px solid rgba(var(--light-rgb), 0.1);
      padding-bottom: env(safe-area-inset-bottom);
      overflow: visible; 
    }
  }
  /* ... reszta pliku bez zmian ... */

  /* Logo w sidebarze */
  .admin-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--target-size-min);
    margin-bottom: calc(var(--spacing-unit) * 2);
    
    img { max-height: 100%; }
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

  /* FIX: Kiedy najeżdżamy na wąski sidebar, przycisk wraca do układu z LG */
  .admin-layout.sidebar-md .admin-sidebar:hover #molique-sidebar-toggle,
  .admin-layout.sidebar-sm .admin-sidebar:hover #molique-sidebar-toggle {
    justify-content: flex-start;
    padding: 0 calc(var(--spacing-unit) * 2) !important;
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
     ZARZĄDZANIE LOGO NA MOBILE
     ========================================= */
  @media (max-width: 768px) {
    
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
      
      /* Resetujemy marginesy, żeby logo ładnie siedziało na pasku */
      margin: 0 !important;
    }
  }
}
```

---

## Plik: `components/_business.scss`

```scss
/**
 * molique - Komponenty Biznesowe
 * Zawiera Tabele Cenowe, Paski Postępu, Oś Czasu (Timeline) oraz Stepper.
 */

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

---

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

---

## Plik: `components/_chart-funnel.scss`

```scss
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

---

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

---

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

---

## Plik: `components/_data-display.scss`

```scss
/**
 * molique - Wyświetlanie Danych
 * Zawiera Tabele, Data Rows, Akordeony, Zakładki (Tabs) oraz Grid Expand.
 */

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

/* =========================================
   2. DATA ROWS (Wiersze tabeli jako karty dla CRM)
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
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), content-visibility 0.3s allow-discrete;
    height: 0;
    overflow: hidden;
  }

  &[open]::details-content {
    height: auto;
  }
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    color: #fff;
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
  color: #fff;
  background-color: var(--primary);
  border-color: var(--primary);
}

a.list-group-item:hover, button.list-group-item:hover {
  background-color: var(--card-bg-subtle);
  z-index: 1;
}

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

---

## Plik: `components/_feedback.scss`

```scss
/**
 * molique - Feedback Wizualny
 * Zawiera Badges, Alerty, Powiadomienia (Toasts) oraz Kropki Statusu.
 */

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

---

## Plik: `components/_form-advanced.scss`

```scss
@layer components {
  /* =========================================
     1. CHECKBOXY I RADIO
     ========================================= */
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

  /* Wariant 1: Kwadratowy (Technical / B2B) */
  .form-switch-square .form-switch-input {
    border-radius: var(--border-radius);
    &::after { border-radius: calc(var(--border-radius) - 2px); }
  }

  /* Wariant 2: Outline (Minimalistyczny) */
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

    input[type="file"], .file-upload-icon, h4, p, .file-upload-name {
      position: relative;
      z-index: 2;
    }
  }

  @keyframes marchingAnts {
    0% { background-position: 0 0, 100% 0, 0 100%, 0 0; }
    100% { background-position: 16px 0, 100% 16px, -16px 100%, 0 -16px; }
  }

  /* =========================================
     4. SEARCHABLE SELECT (Combobox)
     ========================================= */
  .select-search { width: 100%; }

  .select-search-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    background-color: var(--bg-surface);
    
    &::-webkit-details-marker { display: none; }
    
    &::after {
      content: "▼";
      font-size: 0.7rem;
      color: var(--text-muted);
      transition: transform var(--transition-speed);
    }
  }

  .select-search[open] .select-search-trigger {
    border-color: var(--primary);
    box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
    &::after { transform: rotate(180deg); }
  }

  .select-search-menu {
    width: 100%;
    padding: calc(var(--spacing-unit) * 1);
    max-height: 300px;
    display: flex;
    flex-direction: column;
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

  /* =========================================
     5. PREMIUM MULTI SELECT (Wzorowany na UI)
     ========================================= */
  .custom-select {
    position: relative;
    width: 100%;
    
    &[open] .custom-select-trigger {
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
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
    
    &::-webkit-details-marker { display: none; }
    
    .icon-chevron {
      transition: transform var(--transition-speed);
      color: var(--text-muted);
    }
  }

  /* Poprawione Tagi (Pills) */
  .custom-select-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px; /* Większy odstęp */
    flex: 1;
    
    .badge {
      padding: 4px 10px; /* Większy padding */
      font-size: 0.75rem;
      border-radius: 50px; /* Kształt pigułki */
      font-weight: var(--fw-medium);
    }
  }

  .custom-select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    min-width: 320px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg, 12px);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-index-dropdown);
    overflow: hidden;
    animation: fadeInDown 0.2s ease;

  
  /* FIX: Naprawa wyszukiwarki wewnątrz dropdownu (Bez input-group) */
  .custom-select-search {
    padding: calc(var(--spacing-unit) * 1);
    border-bottom: 1px solid var(--border-color);
    position: relative;
    
    /* Ikona lupy pozycjonowana absolutnie */
    .search-icon {
      position: absolute;
      left: calc(var(--spacing-unit) * 2.5);
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none; /* Kliknięcie w ikonę aktywuje input */
      z-index: 2;
    }

    .input {
      /* Robimy miejsce na ikonę z lewej strony */
      padding-left: calc(var(--spacing-unit) * 4.5);
      
      /* Wyłączamy zieloną/czerwoną ramkę walidacji wewnątrz dropdownu */
      &:user-valid, &:user-invalid {
        border-color: var(--border-color) !important;
      }
      &:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color) !important;
      }
    }
  }

  /* NOWOŚĆ: Nagłówki kategorii */
  .custom-select-category {
    font-size: 0.7rem;
    font-weight: var(--fw-bold);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
    margin-top: calc(var(--spacing-unit) * 1);
    
    /* Pierwsza kategoria nie potrzebuje marginesu z góry */
    &:first-child { margin-top: 0; }
  }

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

    /* FIX: Wymuszamy nasz customowy wygląd checkboxa! */
    input[type="checkbox"] {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0 0 0 auto; /* Pcha na prawą stronę */
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

---

## Plik: `components/_form-base.scss`

```scss
@layer components {
  /* =========================================
     1. BAZOWY INPUT & SELECT
     ========================================= */
  .input {
    --input-border-width: 1px;
    display: block;
    width: 100%;
    padding: calc(var(--spacing-unit) * 1.25) calc(var(--spacing-unit) * 2);
    font-family: var(--font-family-base);
    font-weight: var(--fw-medium);
    line-height: 1.5;
    color: var(--text-main);
    background-color: var(--bg-surface);
    background-clip: padding-box;
    border: var(--input-border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);

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
}
```

---

## Plik: `components/_form-groups.scss`

```scss
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

---

## Plik: `components/_modals.scss`

```scss
/**
 * molique - Modale i Lightbox
 * Zawiera natywne okna dialogowe, menu kontekstowe oraz galerię pełnoekranową.
 */

@use '../variables' as *;
@use '../mixins' as *;

/* =========================================
   1. NATYWNY MODAL (<dialog>)
   ========================================= */
.modal-dialog {
  border: none;
  padding: 0;
  background: transparent;
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
    background-color: rgba(var(--dark-rgb), 0.6);
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

/* =========================================
   4. ANCHORED CONTEXT MENU (CSS Anchor Positioning)
   ========================================= */
.popover-context {
  /* Reset domyślnych stylów Popover API */
  margin: 0;
  padding: calc(var(--spacing-unit) * 1);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  min-width: 160px;
  
  /* MAGIA 2026: CSS Anchor Positioning */
  position: absolute;
  /* Przykleja górę popovera do dołu przycisku (anchor) */
  top: anchor(bottom);
  /* Wyrównuje lewą krawędź popovera z lewą krawędzią przycisku */
  left: anchor(start);
  margin-top: 4px; /* Delikatny odstęp od przycisku */
  
  /* Fallback dla starszych przeglądarek (wyśrodkuje na ekranie) */
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
}

/* Lista akcji wewnątrz popovera */
.popover-action-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

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
```

---

## Plik: `components/_navigation.scss`

```scss
/**
 * molique - Nawigacja i Menu
 * Zawiera Navbar, Offcanvas, Mega Menu oraz Dropdowny.
 */

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
  font-size: var(--h4-size);
  font-weight: var(--fw-bold);
  color: var(--text-main);
  text-decoration: none;
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

  &.is-scrolled {
    position: fixed;
    background-color: var(--bg-surface);
    border-bottom-color: var(--border-color);
    box-shadow: var(--shadow-sm);
    
    .navbar-brand, .navbar-item { color: var(--text-main); }
    .navbar-toggle span { background-color: var(--text-main); }
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
    
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .navbar-offcanvas-toggle:checked ~ .navbar-menu-offcanvas {
    transform: translateX(0);
  }

  .navbar-offcanvas-toggle:checked ~ .navbar-offcanvas-backdrop {
    display: block;
  }

  .navbar-offcanvas-toggle:checked ~ .navbar-container .navbar-toggle span:nth-child(1) {
    top: 19px; transform: rotate(135deg);
  }
  .navbar-offcanvas-toggle:checked ~ .navbar-container .navbar-toggle span:nth-child(2) {
    opacity: 0; left: -20px;
  }
  .navbar-offcanvas-toggle:checked ~ .navbar-container .navbar-toggle span:nth-child(3) {
    top: 19px; transform: rotate(-135deg);
  }
}

/* =========================================
   3. MEGA MENU
   ========================================= */
.mega-menu {
  position: static; 
}

.mega-menu-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-surface);
  border-top: 2px solid var(--primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  padding: calc(var(--spacing-unit) * 4) 0;
  z-index: var(--z-index-dropdown);
  
  display: block !important; 
  visibility: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;

  /* Niewidzialny most zapobiegający zamykaniu menu */
  &::before {
    content: '';
    position: absolute;
    top: -20px; 
    left: 0;
    width: 100%;
    height: 20px;
    background: transparent;
  }
}

@include mq(md) {
  .mega-menu:hover .mega-menu-content {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
}

@include mq(sm, max) {
  .mega-menu-content {
    position: static;
    box-shadow: none;
    border: none;
    padding: calc(var(--spacing-unit) * 2);
    background-color: rgba(0,0,0,0.02);
    
    display: none !important; 
    visibility: visible;
    opacity: 1;
    transform: none;
  }
  
  .mega-menu.is-active .mega-menu-content {
    display: block !important;
  }
}

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
  color: #fff;
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

---

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
}
```

---

## Plik: `modules/_docs.scss`

```scss
/**
 * molique - Documentation Styles
 * Zawiera tylko style dla bloków prezentacyjnych (Showcase).
 */

@layer modules {
  /* Ograniczenie szerokości czytania wewnątrz admin-main */
  .docs-content-wrapper {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Tytuły grup w nawigacji bocznej */
  .docs-nav-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: var(--fw-bold);
    color: rgba(255, 255, 255, 0.4);
    margin: calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 1) 0;
  }

  /* Bloki prezentacyjne (Showcase) */
  .component-showcase {
    margin: calc(var(--spacing-unit) * 6) 0;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    background-color: var(--bg-body);
  }

  .component-preview {
    padding: calc(var(--spacing-unit) * 6);
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing-unit) * 3);
    background-image: radial-gradient(var(--border-color) 1px, transparent 0);
    background-size: 20px 20px;
  }

  .component-code {
    position: relative;
    background-color: #1e293b;
    margin: 0;
    padding: 0;
    
    pre {
      margin: 0;
      padding: calc(var(--spacing-unit) * 4);
      overflow-x: auto;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  }

  /* Przycisk kopiowania */
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

---

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

---

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

---

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
}
```

---

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

---

## Plik: `molique-style.scss`

```scss
@use "sass:meta";

// Definicja kolejności warstw
@layer reset, base, layout, components, modules, utilities;

// Wstrzykiwanie kodu bezpośrednio do warstw
@layer reset {
  @include meta.load-css("root"); // Tylko root ma fizyczny CSS (:root)
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

---

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

  .fade-in-up { transform: translate3d(0, 40px, 0); }
  .fade-in-down { transform: translate3d(0, -40px, 0); }
  .fade-in-left { transform: translate3d(-40px, 0, 0); }
  .fade-in-right { transform: translate3d(40px, 0, 0); }
  .zoom-in { transform: scale(0.95); }

  .delay-100 { transition-delay: 100ms; }
  .delay-200 { transition-delay: 200ms; }
  .delay-300 { transition-delay: 300ms; }

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
    border-radius: 50%; filter: blur(80px); z-index: -1; opacity: 0.4;
    will-change: transform; transform: translate3d(0, 0, 0);
    animation: blobFloat 15s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  }
  .bg-blobs::before { background-color: rgba(var(--primary-rgb), 0.5); top: -10%; left: -10%; }
  .bg-blobs::after { background-color: rgba(var(--info-rgb), 0.4); bottom: -10%; right: -10%; animation-delay: -7.5s; }
  @keyframes blobFloat { 0% { transform: translate3d(0, 0, 0) scale(1); } 100% { transform: translate3d(10%, 15%, 0) scale(1.1); } }

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

---

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
  
  /* Usuwanie zaokrągleń z konkretnych stron */
  .rounded-top-0 { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }
  .rounded-bottom-0 { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }
}
```

---

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
  .bg-dark { background-color: var(--dark) !important; color: var(--btn-text-light) !important; }
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
    background-color: var(--dark);
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

---

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

.hover-text-primary:hover { color: var(--primary); }
.hover-bg-light:hover { background-color: var(--light); }

.embed-responsive { position: relative; display: block; width: 100%; padding: 0; overflow: hidden; }
.embed-responsive::before { display: block; content: ""; }
.embed-responsive iframe, .embed-responsive video { position: absolute; top: 0; bottom: 0; left: 0; width: 100%; height: 100%; border: 0; }
.embed-responsive-16by9::before { padding-top: 56.25%; }
.embed-responsive-4by3::before { padding-top: 75%; }

/* =========================================
   6. FILTRY I PRZEZROCZYSTOŚĆ (Logotypy)
   ========================================= */
.opacity-50 { opacity: 0.5 !important; }
.hover-opacity-100 { transition: opacity var(--transition-speed) !important; }
.hover-opacity-100:hover { opacity: 1 !important; }

.hover-filter-none { transition: filter var(--transition-speed) !important; }
.hover-filter-none:hover { filter: none !important; }

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
     BACKGROUND VIDEO (Wydajne tło wideo)
     ========================================= */
  .bg-video-container {
    position: relative;
    overflow: hidden;
    /* Tworzy nowy, odizolowany kontekst renderowania (z-index nie wycieka) */
    isolation: isolate; 

    /* Domyślny overlay (przyciemnienie), żeby tekst był czytelny */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4); /* Zmień krycie według potrzeb */
      z-index: -1;
      pointer-events: none;
    }
  }

  .bg-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Wideo zawsze wypełnia kontener bez zniekształceń */
    z-index: -2;
    pointer-events: none;
    
    /* MAGIA WYDAJNOŚCI: Wymusza renderowanie wideo na dedykowanej warstwie GPU */
    transform: translateZ(0);
    will-change: transform;
  }

  /* A11y: Szanujemy ustawienia systemu operacyjnego użytkownika */
  @media (prefers-reduced-motion: reduce) {
    .bg-video-container video.bg-video {
      display: none; /* Ukrywamy wideo, jeśli użytkownik ma włączoną redukcję ruchu */
    }
  }

  .z-index-1 { z-index: 1 !important; }
  .z-index-2 { z-index: 2 !important; }
  .z-index-3 { z-index: 3 !important; }
  
}
```

---

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

---

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

---

## Plik: `_a11y.scss`

```scss
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

---

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

---

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
    /* Globalna tarcza anty-rozsadzeniowa */
    overflow-x: hidden;
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
    overflow-x: hidden;
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

---

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

---

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
  .btn {
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
}
```

---

## Plik: `_components.scss`

```scss
/**
 * molique - Komponenty UI (Hub)
 * Ten plik ładuje wszystkie mniejsze moduły z folderu components/
 */

@use 'components/navigation' as *;
@use 'components/cards' as *;
@use 'components/modals' as *;
@use 'components/data-display' as *;
@use 'components/feedback' as *;
@use 'components/business' as *;
@use 'components/charts' as *;
```

---

## Plik: `_eink.scss`

```scss
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

---

## Plik: `_forms.scss`

```scss
/**
 * molique - Komponenty formularzy (Hub)
 * Ten plik ładuje wszystkie mniejsze moduły formularzy z folderu components/
 */

@use 'components/form-base' as *;
@use 'components/form-groups' as *;
@use 'components/form-advanced' as *;
```

---

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

  @include mq(md) {
    @for $i from 1 through $grid-columns {
      .grid-md-cols-#{$i} {
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

---

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
```

---

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

---

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
  
  /* ZMIENNE SIDEBARA ADMINA */
  --sidebar-bg: #102E4A;
  --sidebar-submenu-bg: #52677D;
  --sidebar-text: #94A3B8;
  --sidebar-text-active: var(--light);
  
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
  --sidebar-rgb: 16, 46, 74;      /* #102E4A */

  --btn-text-light: var(--light);
  --btn-text-dark: var(--dark);
  --card-bg-subtle: rgba(var(--dark-rgb), 0.03);

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
  --primary: #3d8bfd;
  --primary-hover: #6ea8fe;
  --secondary: #adb5bd;
  --secondary-hover: #c1c8d1;
  --success: #75b798;
  --success-hover: #a3cfbb;
  --danger: #ea868f;
  --danger-hover: #f1aeb5;
  --warning: #ffda6a;
  --warning-hover: #ffe69c;
  --light: #212529;
  --dark: #f8f9fa;
  --info: #6edff6;
  --info-hover: #9eeaf9;

  --bg-body: #121212;
  --bg-surface: #1e1e1e;
  --text-main: #e9ecef;
  --text-muted: #adb5bd;
  --border-color: #333333;
  --card-bg-subtle: rgba(var(--dark-rgb), 0.06);

  --primary-rgb: 61, 139, 253;
  --secondary-rgb: 173, 181, 189;
  --success-rgb: 117, 183, 152;
  --danger-rgb: 234, 134, 143;
  --dark-rgb: 248, 249, 250;
  --info-rgb: 110, 223, 246;
  --warning-rgb: 255, 218, 106;
  --body-rgb: 18, 18, 18;
}
```

---

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
  background-color: #fff;
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

---

## Plik: `_utilities-extended.scss`

```scss
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

---

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

---

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

---

