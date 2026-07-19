# Design System — molique

Lekki, rygorystycznie zoptymalizowany framework CSS B2B. Ten plik jest
OBOWIĄZUJĄCYM słownikiem klas i struktur HTML dla tego projektu.

WAŻNE: zanim napiszesz jakikolwiek HTML/CSS/Sass, sprawdź poniższy słownik.
Jeśli molique oferuje gotową klasę lub komponent pokrywający potrzebę —
użyj jej. Nie twórz nowych, ad-hoc klas CSS ani nie pisz surowego CSS poza
`@layer utilities`, jeśli istnieje odpowiednik w molique.

## Złote zasady (nienaruszalne)

- **Natywny HTML5/CSS nad JS:** zawsze preferuj natywne rozwiązania
  (`<dialog>`, `<details>`, `:user-invalid`, `scroll-snap`, `popover`).
  JS to ostateczność.
- **Zero wojen na specyficzność:** CSS opiera się na warstwach `@layer`.
  MUSISZ unikać `!important` — jedyny wyjątek to klasy narzędziowe
  w `@layer utilities`.
- **Dostępność B2B (A11y):** elementy interaktywne (button, input) muszą
  mieć `min-height: 44px` (zmienna `--target-size-min`). Wyjątek: przyciski
  `.btn-action` w gęstych tabelach.
- **Wydajność GPU:** animacje mogą modyfikować WYŁĄCZNIE `transform`,
  `scale`, `translate` i `opacity`. Zakaz animowania `box-shadow`, `width`,
  `height` (unikamy reflow).
- **ZŁOTA ZASADA GRIDA (RWD) — najczęstszy błąd do uniknięcia:** na
  urządzeniach mobilnych (`.grid-cols-1`) NIGDY nie używaj klas
  `.col-span-*`. Elementy domyślnie zajmują 100% szerokości. Układ
  desktopowy definiuj WYŁĄCZNIE klasami z prefiksem `-md-`
  (np. `.col-md-span-6`). Użycie `.col-span-12` na mobile rozsadza layout.

## Layout & Grid

- **Smart Grid (Auto):** `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`
  (automatycznie układa kolumny).
- **Sztywny Grid:** rodzic `.grid-cols-1` do `12`. Dzieci `.col-span-1`
  do `12` (patrz Złota Zasada Grida wyżej).
- **Offsety (Grid):** `.col-start-1` do `12` LUB klasyczne `.offset-1`
  do `11` (oraz warianty `-md-`, `-lg-`). Przesuwanie elementów w siatce.
- **Flexbox:** `.d-flex`, `.flex-column`, `.align-items-center`,
  `.justify-content-between`, `.gap-1` do `.gap-5`. Pojedyncze dziecko:
  `.align-self-start/-end/-center/-stretch`.
- **Spacing:** `.m-1` do `.m-5`, `.p-1` do `.p-5` (oraz warianty `-md-`,
  np. `.p-md-4`). Wciąganie w górę (ujemny margines):
  `.overlap-up-50/-100/-150` (np. karta na hero).
- **Pozycjonowanie:** `.position-relative/-absolute/-fixed/-sticky`;
  przypięcie do krawędzi `.top-0/.bottom-0/.left-0/.right-0/.inset-0`;
  centrowanie `.top-50` + `.left-50` + `.translate-middle(-x/-y)`.
  Sizing: `.w-25/-50/-75/-100/-auto`, `.mw-100`, `.min-vh-100`.
- **Bento Grid:** `.bento-grid` > `.bento-col-2`, `.bento-row-2`.

## Nawigacja (Navbar)

- **Baza:** `.navbar` > `.navbar-container` > `.navbar-brand` +
  `.navbar-menu` > `.navbar-item`.
- **Warianty:** `.navbar-transparent`, `.navbar-sticky` (dodaje
  `.is-scrolled`).
- **Offcanvas (Mobile):** oparte na Checkbox Hack
  (`.navbar-offcanvas-toggle:checked`).
- **Mega Menu:** `.mega-menu` > `.mega-menu-content` (rozwijane na hover).
- **Dropdown (navbar):** `<details class="dropdown">` >
  `<summary class="dropdown-toggle">` + `.dropdown-menu`.
- **Dropdown Popover (poza navbarem — top layer):** dowolny
  `<button popovertarget="ID">` + `.dropdown-menu` z atrybutem `popover`
  i unikalnym `id` — menu NIE jest przycinane przez overflow (tabele,
  karty, modale) i kotwiczy się automatycznie do swojego przycisku
  (niejawny anchor, bez wrappera `.dropdown`). Wyrównanie do prawej:
  dodatkowo `.dropdown-menu-end`.
- **Language Switch (Popover):**
  `<button class="language-switch-trigger" popovertarget="ID">` (z
  `.language-switch-flag` + kodem języka) +
  `.dropdown-menu.dropdown-menu-end.language-switch-menu` z atrybutem
  `popover` i `id` > `.dropdown-item.language-switch-item` (z
  `.language-switch-flag`, `.language-switch-name`, opcjonalnie
  `.language-switch-check`). Flagi WYŁĄCZNIE jako osobne pliki SVG z
  `img/flags/` (`<img src="img/flags/pl.svg" width="20" height="15"
  alt="">`) — folder zawiera tylko języki oferowane w projekcie; NIGDY
  flagi emoji (nie renderują się na Windowsie) ani zewnętrzny sprite
  z `<use>` (nie działa przy file:// i bywa blokowany przez CORS).

## Komponenty UI & Biznesowe

- **Karty:** `.card` > `.card-header` + `.card-body` + `.card-footer`.
  Warianty: `.featured-box`, `.thumb-info` (z `.thumb-info-wrapper`).
- **Przyciski:** `.btn` + `.btn-primary` (lub `secondary`, `success`,
  `danger`, `warning`, `dark`). Warianty: `.btn-outline-primary`, `.btn-sm`,
  `.btn-lg`. Grupowanie: `.btn-group`.
- **Ghost Buttons (Tabele):** `.btn-action` (np. akcje Edytuj/Usuń).
  Grupowanie z separatorami: `.btn-action-group.with-dividers`.
- **Badges:** `.badge` + `.badge-primary` (lub inne kolory).
- **Modale (Natywne):** `<dialog class="modal-dialog">` (lub
  `.modal-context` dla bocznego/dolnego panelu). Zamykanie:
  `<form method="dialog">`.
- **Akordeony:** `<details class="accordion-item" name="grupa">` >
  `<summary class="accordion-header">` + `<div class="accordion-body">`.
- **Tabele B2B:** `.table-wrapper` > `<table class="table">`. Warianty:
  `.table-sm`, `.table-lg`, `.table-striped`, `.table-hover`,
  `.table-borderless`. Nagłówki: `.thead-light`, `.thead-dark`,
  `.thead-primary` (oraz rozmiary `.thead-sm`, `.thead-lg`).
- **Tabele Mobile:** dodaj `.table-cards` do `<table>`. Wymaga atrybutu
  `data-label="Nazwa"` w każdym `<td>`.
- **Data Rows (Grid CRM):** `.data-row` > divy z danymi +
  `.data-row-actions`.
- **Compact Data Rows (List Items):** `.data-row-compact` > `.row-icon` +
  `.row-content` (z `.row-title` i `.row-details`) + `.row-actions`.
- **Pricing Tables:** `.pricing-table` (dodaj `.is-featured` dla
  wyróżnienia) > `.pricing-header` + `.pricing-features`.
- **Progress Bars:** `.progress` > `.progress-bar` (szerokość w
  `style="width: X%"`).
- **Timeline:** `.timeline` (warianty: `.timeline-large`,
  `.timeline-numbered`) > `.timeline-item`.
- **Labeled Timeline (daty po lewej):** `.timeline.timeline-labeled` >
  `.timeline-item` > `.timeline-label` + `.timeline-separator` (z
  `.timeline-node` i `.timeline-line`) + `.timeline-content`.
- **Stepper:** `.stepper` (wariant: `.stepper-numbered`) > `.step` (dodaj
  `.is-active` lub `.is-completed`).

## Formularze (Zero JS Validation)

- **Floating Labels:** `.form-floating` > `input.input[placeholder=" "]` +
  `label` + `.feedback-invalid`.
- **Switche:** `<label class="form-switch">` >
  `<input type="checkbox" class="form-switch-input">` +
  `<span class="form-switch-label">`. Warianty: `.form-switch-square`,
  `.form-switch-outline`.
- **Input Groups:** `.input-group` > `.input-group-text` + `.input` +
  `.btn` (automatycznie łączy elementy w gładki prostokąt).
- **Zaawansowane Inputy:** `.input-range`, `.input-color`,
  `input[type="date"].input`, `input[type="number"].input` (bez
  natywnego spinnera — do krokowania służy `.qty-input` z przyciskami
  `+` / `-`, klawiatura i scroll).
- **Searchable Select (Popover API):** `.select-search` >
  `<button class="input select-search-trigger" popovertarget="ID">` +
  `.select-search-menu` z atrybutem `popover` i unikalnym `id`
  (top layer — menu NIE jest przycinane w modalach ani przewijanych
  kontenerach). Wyszukiwarka (`.select-search-input`) jest OPCJONALNA —
  bez niej komponent działa jak zwykły select (sama lista opcji).
- **Premium Multi Select (Popover API):** `.custom-select` >
  `<button class="custom-select-trigger" popovertarget="ID">` +
  `.custom-select-dropdown` z atrybutem `popover` i unikalnym `id`
  (z `.custom-select-category` i `.custom-select-option`).
- **File Upload:** `.file-upload` (wariant: `.file-upload-animated`) >
  `input[type="file"]`.

## Feedback & Statusy

- **Toasty:** Popover API. Wywoływane przez JS:
  `MoliqueToast.show({ message: '...', type: 'success' })`.
- **Status Dots:** `.status-dot` + `.status-draft` / `pending` / `done` /
  `danger`. Dodaj `.status-ping` dla pulsowania.
- **Stock Bar (segmentowy poziom zapasu):** `.stock-bar` + wariant
  `.stock-bar-success` / `-warning` / `-danger` (bez wariantu: kolor
  secondary). Wypełnienie z backendu przez `style="--stock-filled: 3"`
  (0–5); segmenty rysuje maska SVG — zero JS i zero dodatkowego markupu.
  Pasek jest czysto wizualny: wartość podawaj obok jako tekst lub nadaj
  `role="img"` + `aria-label`.
- **Interaktywna Ikona:** `.status-icon-toggle` (animacja Plus ->
  Checkmark). Może być użyta z `<label class="status-checkbox">`.
- **Tooltipy:** `.tooltip-element[data-tooltip="Treść"]`.

## Moduły: Admin, E-commerce, Blog

- **Admin Layout:** `.admin-layout` > `.admin-sidebar` + `.admin-main`.
  Wariant `.admin-layout-floating` odsuwa treść od krawędzi.
- **Fade Bottom:** `.fade-bottom` — zanikanie treści przy dolnej
  krawędzi (gradient zamiast ostrego ucięcia). Działa na dowolnym
  przewijanym kontenerze: ustaw `--fade-color` na kolor tła kontenera
  (domyślnie `--bg-surface`), wysokość przez `--fade-height` (80px).
  Na `.admin-sidebar` i `.admin-main` kolor dobiera się automatycznie,
  a na mobile gradient sidebara sam się wyłącza.
- **Admin Sidebar:** klasy szerokości: `.sidebar-md`, `.sidebar-sm`. Logo:
  `.admin-brand` (mieści dowolną treść — obrazek, SVG, tekst — w szerokości
  sidebara). Warianty responsywne, aktywne domyślnie w `.sidebar-sm`,
  `.sidebar-md` i na mobile: `.admin-logo-hide`, `.admin-logo-compact`.
- **Admin Header (Faux Cutout):** `.dashboard-header` > lewa strona +
  `.dashboard-header-actions`. Tworzy iluzję wycięcia w nagłówku.
- **Admin Nav:** `.admin-nav` > `.admin-nav-link`. Submenu:
  `<details class="admin-nav-submenu">` > `<summary>` +
  `.admin-nav-submenu-list`. Drop-up na mobile:
  `<details class="admin-nav-dropdown">`.
- **E-commerce:**
  - Karta: `.product-card` (dodaj `.product-list-view` do rodzica dla
    widoku poziomego).
  - Koszyk: `.cart-item` z kontrolerem `.qty-input`.
  - Kafelki wyboru: `.selection-tile` (wariant:
    `.selection-tile-animated`).
  - Gwiazdki: `.star-rating` (sterowane przez `style="--rating: 4.5;"`).
  - Swatche: `.product-swatches` > `.swatch`.
- **Blog:** `.post-card` (z `.post-date-badge`), `.blog-post` (widok
  listy), `.simple-post-list` (sidebar), `.author-box`.

## Typografia & Kolory

- **Skala wielkości:** `.text-1` do `.text-12` (płynny `clamp()`).
  Tekst bazowy (rozmiar akapitu) = `.text-3`. Poniżej bazy: `.text-1`
  (12px) i `.text-2` (13px) — metadane, daty w timeline. Powyżej:
  `.text-4`–`.text-8` odpowiadają nagłówkom H5–H1, a `.text-9`–`.text-12`
  to rozmiary hero (do 9rem). Mikrocopy: `.text-sm` (11px) i `.text-xs`
  (10px) — jeszcze mniejsze niż `.text-1` (podpisy, dopiski prawne);
  `.text-base` wraca do bazy.
- **Wagi:** `.fw-light`, `.fw-normal`, `.fw-medium`, `.fw-bold`,
  `.fw-black`.
- **Kolory tekstu/tła:** `.text-primary`, `.bg-surface`, `.bg-body`,
  `.bg-glass` (Glassmorphism).
- **Kolory na hover:** `.bg-hover-*`, `.text-hover-*`, `.border-hover-*`
  (pełna paleta: primary, success, danger, warning, info, dark, light,
  secondary, surface, body) — UWAGA: nazwa to `bg-hover-`, NIE `hover-bg-`.
- **Listy z ikonami:** `.list-unstyled` (bez punktorów) oraz `.list-icons`
  z wariantem ikony `.list-icons-check/-arrow/-cross` i kolorem
  `.list-icons-success/-danger/-dark` (domyślnie primary).

## Animacje, Efekty & Utilities (GPU)

- **Wejścia:** `.animate.fade-in-up`, `.reveal-blur`, `.reveal-scale`.
- **Scroll Reveal:** `.scroll-reveal` (wykorzystuje
  `animation-timeline: view()`).
- **Hover:** `.hover-spring`, `.hover-gpu-shadow`, `.hover-tilt`
  (statyczny) lub `.tilt-card` (dynamiczny JS). Lekkie warianty:
  `.hover-scale` (powiększenie), `.hover-shadow` (unoszenie z cieniem).
- **Efekty Tekstowe:** `.hover-text-wipe`, `.hover-underline`,
  `.text-highlight`, `.typewriter`, `.text-gradient-animated`,
  `.text-clip-bg`.
- **Ramki (Zaokrąglone):** `.hover-border-expand`, `.hover-border-spin`.
- **Ramki (Ostre):** `.hover-border-draw-2`, `.hover-border-trace-2`.
- **Kolor Ramek:** zmień domyślny kolor dodając
  `style="--hover-border-color: var(--danger);"`.
- **Background Video/Image:** `.bg-video-container` > `img.bg-video`
  (plakat) + `video.bg-video`; wariant statyczny `.bg-image-container` >
  `.bg-image` (także `picture.bg-image`) — oba z domyślną nakładką.
- **Overlay (nakładka na tło):** rodzic `.has-overlay` + `.overlay` z
  kolorem `.overlay-dark/-primary/-light` (lub `.bg-overlay` = czerń) i
  kryciem `.overlay-10` do `.overlay-90`.
- **Filtry Obrazów:** `.filter-grayscale`, `.filter-blur`, `.filter-none`
  (zdejmuje filtr, np. z `.hover-filter-none` — logo koloruje się na hover).
- **Obramowania (Borders):** `.border`, `.border-0`, `.border-top`,
  `.border-bottom`, `.border-start`, `.border-end`.
- **Zaokrąglenia (Radius):** `.rounded-0` do `.rounded-5`,
  `.rounded-circle`, `.rounded-pill`, `.rounded-top-0`,
  `.rounded-bottom-0`.
- **Inne Helpery:** `.grid-expand` (płynny akordeon), `.parallax-container`
  (Scroll-Driven), `.bg-gradient-corners` (łuna), `.stacking-container` >
  `.section-stacked`, `.embed-responsive` (do wideo z YT/Vimeo).

## Widgety (Opt-in)

- **Karuzele:** `.carousel` > `.carousel-track` > `.carousel-slide`.
  Wariant: `.carousel-bg-sync`.
- **Lightbox:** `<a href="duze.jpg" data-lightbox data-gallery="galeria">`.
- **Inne:** `.before-after-slider`, `.btn-magnetic`, `.speed-dial`,
  `.share-bar` (z `data-network="native"`), `.scroll-to-top`.

## Wykresy (Data Viz — Progressive Enhancement)

- **Zasada:** wykresy budowane w HTML/CSS/SVG jako fallback.
- **Przekazywanie danych:** wartości przekazywane z backendu TYLKO przez
  zmienne CSS: `style="--val: 75%;"`.
- **Struktura:** `.r-chart-wrapper` (dodaj `.chart-micro` dla małych
  wykresów) > `.chart-sparkline` / `.chart-radial` / `.chart-heatmap` /
  `.chart-area` / `.chart-pie`.
- **Lejki:** `.chart-funnel` (pionowy), `.chart-pipeline` (poziomy),
  `.chart-funnel-true` (klasyczny trapezowy).
- **Nawigacja Wykresów:** `.chart-nav` > `.chart-nav-item`.

## Architektura JavaScript

- **Autoloader:** główny plik `molique-script.js` skanuje DOM i
  asynchronicznie pobiera mikro-moduły z `js/modules/` (np. `carousel.js`,
  `lightbox.js`) tylko wtedy, gdy komponent istnieje na stronie.
- **Vanilla JS:** całkowity zakaz używania jQuery.
