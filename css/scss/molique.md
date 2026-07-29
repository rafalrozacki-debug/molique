# Design System - molique

Lekki, rygorystycznie zoptymalizowany framework CSS B2B. Ten plik jest
OBOWIĄZUJĄCYM słownikiem klas i struktur HTML dla tego projektu.

WAŻNE: zanim napiszesz jakikolwiek HTML/CSS/Sass, sprawdź poniższy słownik.
Jeśli molique oferuje gotową klasę lub komponent pokrywający potrzebę -
użyj jej. Nie twórz nowych, ad-hoc klas CSS ani nie pisz surowego CSS poza
`@layer utilities`, jeśli istnieje odpowiednik w molique.

## Złote zasady (nienaruszalne)

- **Natywny HTML5/CSS nad JS:** zawsze preferuj natywne rozwiązania
  (`<dialog>`, `<details>`, `:user-invalid`, `scroll-snap`, `popover`).
  JS to ostateczność.
- **Zero wojen na specyficzność:** CSS opiera się na warstwach `@layer`.
  MUSISZ unikać `!important` - jedyny wyjątek to klasy narzędziowe
  w `@layer utilities`.
- **Dostępność B2B (A11y):** elementy interaktywne (button, input) muszą
  mieć `min-height: 44px` (zmienna `--target-size-min`). Wyjątek: przyciski
  `.btn-action` w gęstych tabelach.
- **Wydajność GPU:** animacje mogą modyfikować WYŁĄCZNIE `transform`,
  `scale`, `translate` i `opacity`. Zakaz animowania `box-shadow`, `width`,
  `height` (unikamy reflow).
- **ZŁOTA ZASADA GRIDA (RWD) - najczęstszy błąd do uniknięcia:** na
  urządzeniach mobilnych (`.grid-cols-1`) NIGDY nie używaj klas
  `.col-span-*`. Elementy domyślnie zajmują 100% szerokości. Układ
  desktopowy definiuj WYŁĄCZNIE klasami z prefiksem `-md-`
  (np. `.col-md-span-6`). Użycie `.col-span-12` na mobile rozsadza layout.

## Layout & Grid

- **Smart Grid (Auto):** `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`
  (automatycznie układa kolumny).
- **Sztywny Grid:** rodzic `.grid-cols-1` do `12`. Dzieci `.col-span-1`
  do `12` (patrz Złota Zasada Grida wyżej). Warianty responsywne
  `.grid-md-cols-*` i `.grid-lg-cols-*` są **domyślnie siatką jednokolumnową
  poniżej swojego progu**, więc `class="grid-md-cols-12"` wystarczy -
  dopisywanie `grid-cols-1` nic nie zmienia.
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
- **Breakout (Full-bleed na mobile):** `.breakout-mobile` - wyrywa element
  z paddingu `.container` poniżej 768px, aż do krawędzi ekranu (karuzele,
  galerie, hero w treści). Na desktopie bez efektu. Technika viewport
  centering (`width: 100vw` + `margin-left: 50%` + `translateX(-50%)`)
  liczy się względem BEZPOŚREDNIEGO rodzica - musi nim być element
  wyśrodkowany w oknie jak `.container` (`margin-inline: auto`), inaczej
  (np. zagnieżdżone w `.card-body`) wynik jest przesunięty/przycięty.
- **Bento Grid:** `.bento-grid` > `.bento-col-2`, `.bento-row-2`.
- **Sekcje:** goły `<section>` ma już domyślny rytm pionowy
  (`padding-block` = 48px góra i dół). **Nie ma klasy `.section`** - odstęp
  jest własnością samego znacznika. Nie dopisuj `mb-5 pb-5`; jeśli chcesz
  inny odstęp, użyj klasy narzędziowej (`.py-4`, `.p-0`), która nadpisze
  wartość domyślną.
- **Separator:** goły `<hr>`, zero klas - pełna szerokość, `border-top: 1px
  solid var(--border-color)`, `margin-block` = 16px. Reset jest CELOWY, nie
  kosmetyczny: domyślny `<hr>` przeglądarki ma `margin-inline: auto`, co
  jako BEZPOŚREDNIE dziecko dowolnego flexa (np. `.card-body`) kurczy go do
  prawie zera (auto-marginesy w osi poprzecznej flexboksa wygrywają z
  `align-items: stretch`) - wygląda jak kropka zamiast linii. `width: 100%`
  + `margin-inline: 0` w bazie eliminuje to raz na zawsze.

## Nawigacja (Navbar)

- **Baza:** `.navbar` > `.navbar-container` > `.navbar-brand` +
  `.navbar-menu` > `.navbar-item`.
- **Aktywna pozycja (bieżąca strona):** klasa `.is-active` na `.navbar-item`
  (oraz `.dropdown-item` / `.mega-menu-link`) - kolor primary + grubsza waga.
  Nadaje ją wg URL moduł `js/modules/molique-navbar-active.js` (auto-ładowany przy
  `.navbar-menu`): podświetla link bieżącej strony ORAZ trigger rozwijanego
  menu (dropdown/mega-menu), w którym ten link leży. Aktywności NIE wpisuj do
  markupu - navbar bywa współdzielony między podstronami, robi to skrypt z
  adresu.
- **Warianty:** `.navbar-transparent`, `.navbar-sticky` (dodaje
  `.is-scrolled`).
- **Nakładkowe (`.navbar-transparent`, `.navbar-pill`):** `position: absolute`,
  więc navbar leży NA treści - tło/zdjęcie hero zaczyna się od samej góry
  strony. Po scrollu JS nadaje `.is-scrolled` → `position: fixed` + tło motywu.
  **NIE łącz ich z `.navbar-sticky`** - sticky wraca do przepływu dokumentu
  (i wygrywa w kaskadzie), więc nakładka przestaje działać. Treść hero odsuń
  o `var(--navbar-h)`, bo navbar jest poza przepływem.
- **Pastylka:** `.navbar-pill` - navbar jako odsunięta od krawędzi pastylka
  z własnym tłem, po scrollu rozkłada się do paska przy krawędzi. Tło jest
  ZAWSZE ciemne (leży na zdjęciu), także w motywie jasnym; podmiana przez
  `style="--navbar-pill-bg: #123"`. Linki białe do momentu zescrollowania.
  Oba stany mają OSOBNE zmienne (nie jedną wspólną, bo styl inline wygrywa
  z regułą klasy i zablokowałby drugi stan):
  `--navbar-pill-bg` / `--navbar-pill-color` (nad hero),
  `--navbar-pill-bg-scrolled` / `--navbar-pill-color-scrolled` (po scrollu),
  `--navbar-pill-padding-x` (32px) / `--navbar-pill-padding-x-scrolled` (16px).
  Na mobile panel offcanvas przejmuje `--navbar-pill-bg` (inaczej białe linki
  wariantu lądowały na jasnym `--bg-surface`); w `.navbar-transparent`, który
  nie ma czym pomalować panelu, linki wracają tam do `--text-main`.
- **Offcanvas (Mobile):** oparte na Checkbox Hack
  (`.navbar-offcanvas-toggle:checked`).
- **Mega Menu:** `<details class="mega-menu" name="grupa">` >
  `<summary class="navbar-item mega-menu-trigger">` + `.mega-menu-content`
  (w środku `.mega-menu-group` z `.mega-menu-col-title` i `.mega-menu-link`,
  opcjonalnie `.mega-menu-featured`). Otwiera się **klikiem**, nie na hover -
  to natywny `<details>`, więc działa z klawiatury i bez JS. Na mobile ta sama
  struktura degraduje się do akordeonu w offcanvas. Atrybut `name` wyklucza
  wzajemnie kilka mega menu w jednym pasku.
- **Dropdown (navbar):** `<details class="dropdown">` >
  `<summary class="dropdown-toggle">` + `.dropdown-menu`.
- **Dropdown Popover (poza navbarem - top layer):** dowolny
  `<button popovertarget="ID">` + `.dropdown-menu` z atrybutem `popover`
  i unikalnym `id` - menu NIE jest przycinane przez overflow (tabele,
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
  alt="">`) - folder zawiera tylko języki oferowane w projekcie; NIGDY
  flagi emoji (nie renderują się na Windowsie) ani zewnętrzny sprite
  z `<use>` (nie działa przy file:// i bywa blokowany przez CORS).
  **Realne tłumaczenie treści (referencyjna implementacja):** ten komponent
  bywa tylko dekoracyjny (`href="#"`) - pełne, DZIAŁAJĄCE wpięcie w i18n
  (płaskie pliki `page.html`/`page.en.html`/`page.de.html`, auto-hreflang,
  ukrywanie języków bez tłumaczenia danej strony) jest opisane w
  `DOCS-PLAN.md` tego repo i zaimplementowane w jego `vite.config.js`
  (`computeI18nLocals`) - punkt wyjścia, jeśli trzeba to samo zbudować od
  zera w innym projekcie na `posthtml-include`/`posthtml-expressions`.
- **Theme Switch (light/dark):** `<label class="theme-switch">` >
  `<input type="checkbox" class="theme-switch-input">` + `.theme-switch-track`
  (z `.theme-switch-thumb` i `.theme-icon-wrapper` > `.theme-icon.icon-sun` /
  `.theme-icon.icon-moon`). **`id="theme-toggle"` jest OBOWIĄZKOWE** -
  `molique-script.js` szuka go przez `getElementById`; inne `id` albo drugi
  taki przełącznik na stronie = cisza, bez błędu. Skrypt zapisuje wybór w
  `localStorage` pod `molique-theme`, przy pierwszej wizycie czyta
  `prefers-color-scheme`, a motyw ustawia atrybutem `data-theme` na `<html>`.
  **Anti-FOUC:** odczyt z `localStorage` i ustawienie `data-theme` na `<html>`
  dzieje się TAKŻE synchronicznie w `<head>` (patrz niżej, Admin Sidebar -
  anti-FOUC) - bez tego motyw najpierw mignąłby jasny, zanim
  `molique-script.js` zdążyłby go zmienić po `DOMContentLoaded`.

## Komponenty UI & Biznesowe

- **Karty:** `.card` > `.card-header` + `.card-body` + `.card-footer`.
  Warianty: `.featured-box`, `.thumb-info` (z `.thumb-info-wrapper`).
- **Przyciski:** kolor (`.btn-primary`, `secondary`, `success`, `danger`,
  `warning`, `info`, `dark`, `light`) + rozmiar (`.btn-xs`, `.btn-sm`,
  `.btn-md`, `.btn-lg`, `.btn-xl`). **Klasa koloru implikuje `.btn`** - nie
  trzeba pisać `class="btn btn-primary"`, wystarczy `class="btn-primary"`.
  Samo `.btn` dopisz tylko dla przycisku bez koloru. Implikacja obejmuje
  wyłącznie kolory i ich odmiany obrysowe; modyfikatory rozmiaru i wyglądu
  bazy NIE niosą. Obrys: `.btn-outline-<kolor>` dla każdego koloru, plus
  `.btn-outline-soft` (ramka 30%, hover 10%). Grupowanie: `.btn-group`
  (bieżąca: `.is-active`).
- **Przyciski - warianty wyglądu:** `.btn-3d` (wymaga `--btn-3d-shadow`
  w kolorze przycisku, domyślnie primary), `.btn-glass` (tylko NA ZDJĘCIU -
  rozmywa to, co pod spodem; tło i ramka z `!important`, więc nie nadpiszesz
  ich klasą), `.btn-glow`, `.btn-gradient` (primary → info, ignoruje klasę
  koloru), `.btn-shine`, `.btn-stacked` (ikona nad podpisem; podpis w
  `.btn-text` - to etykieta, NIE osobny wariant przycisku).
- **Domyślny hover wszystkich `.btn`:** klasa na `<body>` (lub kontenerze):
  `.btn-hover-spring` / `.btn-hover-lift` / `.btn-hover-glow` - nadaje
  wspólny efekt hover wszystkim `.btn` w środku; przyciski z własną klasą
  `hover-*` mają pierwszeństwo. Do wyboru też w edytorze motywu.
- **Ghost Buttons (Tabele):** `.btn-action` (np. akcje Edytuj/Usuń).
  Grupowanie z separatorami: `.btn-action-group.with-dividers`.
- **Badges:** `.badge` + `.badge-primary` (lub inne kolory).
- **Modale (Natywne):** `<dialog class="modal-dialog">` (lub
  `.modal-context` dla bocznego/dolnego panelu). Zamykanie:
  `<form method="dialog">`.
- **Zakładki:** `.tabs` > ukryte `input.tab-input[type=radio]` (wspólne `name`)
  + `.tabs-header` > `label.tab-label` + `.tabs-content` > `.tab-pane`.
  Kolejność paneli MUSI odpowiadać kolejności inputów - CSS łączy je po
  pozycji, nie po nazwie. Wariant `.tabs-pill` z `.tabs-pill-indicator`
  (szerokość liczy `--tab-count`).
  `.tab-input` ukryty techniką `clip` (jak `.sr-only`, NIE
  `display: none`), więc grupa zostaje obsługiwana strzałkami z
  klawiatury.
- **Akordeony:** `<details class="accordion-item" name="grupa">` >
  `<summary class="accordion-header">` + `<div class="accordion-body">`.
  Nagłówek jest flexem z `gap`, a strzałkę `::after` dosuwa `margin-left: auto`
  - można więc wstawić kilka elementów (np. `.badge` + tekst) i nadal będą
  dosunięte do lewej. Zdanie z `<code>` w środku owiń w jeden `<span>`,
  inaczej `gap` rozsunie je jak osobne elementy flex.
- **Tabele B2B:** `.table-wrapper` > `<table class="table">`. Warianty:
  `.table-sm`, `.table-lg`, `.table-striped`, `.table-hover`,
  `.table-borderless`. Nagłówki: `.thead-light`, `.thead-dark`,
  `.thead-primary` (oraz rozmiary `.thead-sm`, `.thead-lg`).
- **Tabele Mobile:** dodaj `.table-cards` do `<table>`. Wymaga atrybutu
  `data-label="Nazwa"` w każdym `<td>` - CSS bierze etykiety WYŁĄCZNIE stąd,
  nie potrafi ich odczytać z `<th>`. Wariant `.table-cards-always` robi to
  samo na każdej szerokości (wąskie kolumny dashboardu).
- **Data Rows (Grid CRM):** `.data-row` > divy z danymi +
  `.data-row-actions`.
- **Compact Data Rows (List Items):** `.data-row-compact` > `.row-icon`
  (opcjonalnie z `.icon-square` - kwadratowe tło pod ikoną) +
  `.row-content` (z `.row-title` i `.row-details`) + `.row-actions`.
- **List Group:** `.list-group` > `.list-group-item` (pozycja bieżąca:
  `.is-active`). Pionowa lista pozycji do klikania - menu ustawień, wybór
  z listy.
- **Liczniki:** `.counter` > `.counter-value` + `.counter-title`. Wartość
  docelowa to TREŚĆ `.counter-value`; `js/modules/molique-counters.js`
  (auto-ładowany przy tej klasie) dolicza do niej po wejściu w widok. Bez JS
  liczba i tak jest widoczna, tylko bez animacji.
- **Pricing Tables:** `.pricing-table` (dodaj `.is-featured` dla
  wyróżnienia) > `.pricing-header` + `.pricing-features`.
- **Progress Bars:** `.progress` > `.progress-bar` (szerokość w
  `style="width: X%"`). UWAGA: `.progress-bar` (i `.progress-bar-reading`,
  patrz Widgety) animują `width` przez `transition` - świadome odstępstwo
  od reguły GPU-only, nieszkodliwe przy pojedynczym pasku.
- **Timeline:** `.timeline` (warianty: `.timeline-large`,
  `.timeline-numbered`) > `.timeline-item`.
- **Labeled Timeline (daty po lewej):** `.timeline.timeline-labeled` >
  `.timeline-item` > `.timeline-label` + `.timeline-separator` (z
  `.timeline-node` i `.timeline-line`) + `.timeline-content`.
- **Stepper:** `.stepper` (wariant: `.stepper-numbered`) > `.step` (dodaj
  `.is-active` lub `.is-completed`).

## Formularze (Zero JS Validation)

- **Floating Labels:** `.form-floating` > `input.input[placeholder=" "]` +
  `label` + `.feedback-invalid`. Ma własny `margin-bottom` (odstęp między
  polami w zwykłym bloku bez wrappera flex) - ale jako BEZPOŚREDNIE dziecko
  `.card-body` (ten ma domyślnie `gap`) margines się zeruje, żeby nie
  dublować odstępu z gapem. Poza `.card-body` margines działa normalnie.
- **Switche:** `<label class="form-switch">` >
  `<input type="checkbox" class="form-switch-input">` +
  `<span class="form-switch-label">`. Warianty: `.form-switch-square`,
  `.form-switch-outline`.
- **Input Groups:** `.input-group` > `.input-group-text` + `.input` +
  `.btn` (automatycznie łączy elementy w gładki prostokąt).
- **Zaawansowane Inputy:** `.input-range`, `.input-color`,
  `input[type="date"].input`, `input[type="number"].input` (bez
  natywnego spinnera - do krokowania służy `.qty-input` z przyciskami
  `+` / `-`, klawiatura i scroll).
- **Searchable Select (Popover API):** `.select-search` >
  `<button class="input select-search-trigger" popovertarget="ID">` +
  `.select-search-menu` z atrybutem `popover` i unikalnym `id`
  (top layer - menu NIE jest przycinane w modalach ani przewijanych
  kontenerach). Wyszukiwarka (`.select-search-input`) jest OPCJONALNA -
  bez niej komponent działa jak zwykły select (sama lista opcji).
  `select.js` działa na delegacji zdarzeń, więc obsługuje opcje dolewane
  do DOM PO starcie strony (np. z AJAX). Na wybór opcji ukryty
  `.select-search-hidden` dostaje `change` (bubbling). Ustawienie z JS:
  `MoliqueSelectSearch.setValue(hiddenInput, value)`.
- **Premium Multi Select (Popover API):** `.custom-select` >
  `<button class="custom-select-trigger" popovertarget="ID">` +
  `.custom-select-dropdown` z atrybutem `popover` i unikalnym `id`
  (z `.custom-select-category` i `.custom-select-option`).
- **File Upload:** `.file-upload` (wariant: `.file-upload-animated`) >
  niewidoczny `input[type="file"]` rozciągnięty na całą strefę
  (`position: absolute; opacity: 0`) - klik i przeciągnięcie pliku
  działają więc natywnie, bez własnego kodu drag & drop. Auto-ładowany
  `js/modules/molique-file-upload.js` (selektor `.file-upload`) nasłuchuje
  `change` i nadpisuje `.file-upload-name` nazwą wybranego pliku -
  element jest opcjonalny w markupie, moduł dopisze go sam po pierwszym
  wyborze, jeśli go nie znajdzie.

## Feedback & Statusy

- **Toasty:** Popover API. Wywoływane przez JS:
  `MoliqueToast.show({ message: '...', type: 'success' })`.
- **Status Dots:** `.status-dot` + `.status-draft` / `pending` / `done` /
  `danger`. Dodaj `.status-ping` dla pulsowania.
- **Stock Bar (segmentowy poziom zapasu):** `.stock-bar` + wariant
  `.stock-bar-success` / `-warning` / `-danger` (bez wariantu: kolor
  secondary). Wypełnienie z backendu przez `style="--stock-filled: 3"`
  (0-5); segmenty rysuje maska SVG - zero JS i zero dodatkowego markupu.
  Pasek jest czysto wizualny: wartość podawaj obok jako tekst lub nadaj
  `role="img"` + `aria-label`.
- **Interaktywna Ikona:** `.status-icon-toggle` (animacja Plus ->
  Checkmark). Może być użyta z `<label class="status-checkbox">`.
- **Tooltipy:** `.tooltip-element[data-tooltip="Treść"]`.

## Moduły: Admin, E-commerce, Blog

- **Admin Layout:** `.admin-layout` > `.admin-sidebar` + `.admin-main`.
  Wariant `.admin-layout-floating` odsuwa treść od krawędzi.
- **Fade Bottom:** `.fade-bottom` - zanikanie treści przy dolnej
  krawędzi (gradient zamiast ostrego ucięcia). Działa na dowolnym
  przewijanym kontenerze: ustaw `--fade-color` na kolor tła kontenera
  (domyślnie `--bg-surface`), wysokość przez `--fade-height` (80px).
  Na `.admin-sidebar` i `.admin-main` kolor dobiera się automatycznie,
  a na mobile gradient sidebara sam się wyłącza.
- **Admin Sidebar:** klasy szerokości: `.sidebar-md`, `.sidebar-sm` (na
  `.admin-layout`). Logo: `.admin-brand` (mieści dowolną treść - obrazek,
  SVG, tekst - w szerokości sidebara). Warianty responsywne, aktywne
  domyślnie w `.sidebar-sm`, `.sidebar-md` i na mobile: `.admin-logo-hide`,
  `.admin-logo-compact`.
- **Admin Sidebar - przełącznik szerokości:** `<button id="molique-sidebar-toggle" class="admin-nav-link">`
  (ID, nie klasa - skrypt szuka dokładnie tego identyfikatora, jeden na
  stronę) + `.sidebar-toggle-icon` z dokładnie trzema pustymi `<span>` w
  środku (morfujący hamburger → linie asymetryczne → strzałka, sterowany
  `:nth-child`). Klik cyklicznie przełącza `.admin-layout` między pełnym /
  `.sidebar-md` / `.sidebar-sm`, zapamiętując wybór w `localStorage`
  (`molique-sidebar-state`). Logika siedzi na stałe w rdzeniu
  `molique-script.js`, NIE w autoloaderze modułów. PUŁAPKA: jeśli na tej
  samej stronie jest też przykładowe (nie-realne) `.admin-nav-submenu[open]`
  poza właściwym sidebarem, przełączenie na `.sidebar-md`/`.sidebar-sm`
  włącza dla niego globalny selektor drill-downu i zamienia je w
  pełnoekranowy, niewidzialny overlay blokujący kliknięcia w całej stronie -
  stąd na `docs-admin.html` demo przełącznika jest celowo statyczne
  (bez podpięcia realnego ID), a nie żywe.
- **Admin Sidebar - anti-FOUC (zapobieganie "skakaniu" przy przeładowaniu):**
  problem: `molique-theme` i `molique-sidebar-state` z `localStorage` były
  odczytywane wyłącznie w `molique-script.js` na `DOMContentLoaded`, czyli
  PO pierwszym renderze - powracający użytkownik z zapisanym `sidebar-md`/
  `-sm` widział więc na ułamek sekundy pełny sidebar (`lg`), zanim się
  skurczył (analogicznie: jasny motyw migający przed ciemnym). Rozwiązanie
  jest DWUCZĘŚCIOWE i musi zostać skopiowane razem przy integracji frameworka
  w nowym projekcie:
  1. `partials/head.html` (a w skompilowanym HTML: sam initial `<head>`,
     jak najwyżej, zaraz po viewport meta) dostaje mały **synchroniczny**
     inline `<script>` (bez `defer`/`async`/`module` - musi wykonać się
     zanim przeglądarka narysuje cokolwiek), który czyta oba klucze
     `localStorage` i ustawia `data-theme` oraz klasę `sidebar-md`/
     `sidebar-sm` bezpośrednio na `<html>` (`document.documentElement`),
     zanim `<body>` w ogóle istnieje.
  2. `layout/_admin-layout.scss` dostaje lustrzane reguły
     `:root.sidebar-md &`/`:root.sidebar-sm &` obok istniejących
     `&.sidebar-md`/`&.sidebar-sm` - bo w chwili pierwszego malowania klasa
     jest jeszcze tylko na `<html>` (krok 1), a nie na `.admin-layout`
     (tę drugą nadaje dopiero `molique-script.js` po `DOMContentLoaded`,
     dla obsługi kliku przełącznika). Bez tej reguły CSS-owej sam
     zapis do `localStorage` w kroku 1 nic by nie dał.
  Istniejąca logika w `molique-script.js` (obsługa kliku, zapis do
  `localStorage`) zostaje BEZ ZMIAN - ten mechanizm jest czysto addytywny,
  tylko odczytuje to, co tamten zapisuje, i to wcześniej.
- **Admin Header (Faux Cutout):** `.dashboard-header` > lewa strona +
  `.dashboard-header-actions`. Tworzy iluzję wycięcia w nagłówku.
- **Admin Nav:** `.admin-nav` > `.admin-nav-link`. Submenu:
  `<details class="admin-nav-submenu">` > `<summary class="admin-nav-link">`
  + `.admin-nav-submenu-list` (z `.admin-nav-submenu-link`). Ten sam markup
  działa wszędzie dzięki natywnemu `<details>`: drzewko (szeroki sidebar),
  a w wariantach wąskich (`-sm`/`-md`) oraz w Bottom Nav na mobile -
  pełnoekranowy drill-down z paskiem „Cofnij". Aktywność ogarnia moduł
  `js/modules/molique-admin-nav.js` (auto-ładowany po `.admin-nav-submenu`):
  podświetla aktywną pozycję z URL i **na desktopie sam otwiera gałąź, w
  której leży bieżąca strona** (`details.open = true`), ale na mobile od
  razu ją zamyka - więc drill-down nigdy nie wjeżdża sam przy wejściu na
  stronę, a drzewko na szerokim sidebarze zawsze pokazuje, gdzie jesteś.
  Wyklucza też wzajemnie otwarte submenu (tylko na mobile - na desktopie
  w `-sm`/`-md` może być otwarte tylko jedno naraz z innego powodu: drugie
  i tak przykryłoby pierwsze). Aktywności NIE oznaczaj przez `open` w
  markupie - moduł ustala to sam z adresu URL, niezależnie od viewportu.
- **Admin Nav - aktywność płaskich linków:** sidebar bez submenu (np. wspólny
  dla wielu podstron) obsługuje `js/modules/molique-admin-nav-active.js`
  (auto-ładowany przy `.admin-nav`): nadaje `.is-active` każdemu
  `.admin-nav-link` wskazującemu bieżący URL - także temu zdublowanemu
  w pasku mobilnym. Pomija linki leżące w `.admin-nav-submenu` (tamte należą
  do `molique-admin-nav.js`). Aktywności NIE wpisuj do markupu - sidebar bywa
  współdzielony przez podstrony, robi to skrypt z adresu.
- **Admin Nav - Drop-up "Więcej" (mobile):** OSOBNY wzorzec od submenu, do
  przepełnienia paska. Checkbox Hack: `<input type="checkbox"
  class="mobile-more-toggle">` + `<label class="admin-nav-link
  mobile-more-label">` (trigger w pasku) + `.admin-nav-dropdown-menu`
  (szuflada z linkami; na desktopie `display: contents`, na mobile wysuwana
  od dołu). NIE ma klasy `.admin-nav-dropdown` na `<details>` - to checkbox,
  nie `<details>`.
- **E-commerce:**
  - Karta: `.product-card` (dodaj `.product-list-view` do rodzica dla
    widoku poziomego - na kontenerze OTACZAJĄCYM karty, nie na karcie).
  - Galeria produktu: `.product-gallery` > `.product-gallery-main` (zdjęcie
    główne, `aspect-ratio: 1/1`) + `.product-gallery-thumbs` >
    `.gallery-thumb` (`<button>`, wymaga `<img data-large="…">` - stąd
    `js/modules/molique-shop.js`, auto-ładowany przy `.product-gallery`,
    bierze duże zdjęcie przy kliknięciu). Moduł tylko podpina listenery,
    NIE ustawia stanu startowego - pierwszą miniaturę oznacz ręcznie
    `.is-active`, resztę `.opacity-50` (gotowa klasa narzędziowa). Warianty
    umiejscowienia: `.product-gallery-left` / `-right` - kolumna miniatur
    obok zdjęcia, ale TYLKO od `md` w górę (poniżej: domyślny rząd pod
    spodem, jak przy gridzie). Kolejność w DOM stała, `-left` przestawia
    tylko wizualnie przez `order`.
  - Koszyk: `.cart-item` z kontrolerem `.qty-input` > dokładnie dwa
    `.qty-btn` (JS bierze `:first-child`/`:last-child` jako minus/plus) +
    jeden `.qty-val` (`type="number"`, wymaga `min`, opcjonalnie `max` -
    stąd JS czyta granice).
  - Kafelki wyboru: `.selection-tile` > input ukryty (nie
    `display:none`) + `.tile-content` jako BEZPOŚREDNI sąsiad (selektor
    `:checked + .tile-content`). Wariant `.selection-tile-animated`
    współpracuje z `.hover-border-trace`/`-2` na `.tile-content`.
  - Gwiazdki: `.star-rating` (sterowane przez `style="--rating: 4.5;"`,
    zmienne `--star-size`/`--star-color`/`--star-bg`).
  - Swatche: `.product-swatches` > `.swatch` (kolor przez inline
    `style="background-color:…"`, `.is-active` = obwódka `--primary`).
- **Blog:** `.post-card` (siatka) + `.post-date-badge` (data pływająca na
  zdjęciu, wymaga `.post-image-wrapper` jako rodzica - to on ma
  `position: relative`, bez niego badge kotwiczy się do złego przodka).
  `.blog-post` (klasyczna lista) + `.post-date` (kalendarzowa kolumna).
  UWAGA: `.post-date-badge` i `.post-date` zawierają te same klasy potomne
  `.day`/`.month`, ale z DWOMA różnymi zestawami stylów - poza tymi dwoma
  rodzicami `.day`/`.month` nie mają żadnego CSS. `.simple-post-list`
  (widget sidebara) > `.post-image` + `.post-info` + `.post-meta-date` -
  wszystkie trzy stylowane WYŁĄCZNIE w tym kontekście; rozmiar miniatury
  przez `--post-thumb-size` (domyślnie 60px). `.post-meta-date` to NIE to
  samo co `.post-meta` (rząd linków z ikonami w karcie/liście) - podobna
  nazwa, zero wspólnego kodu. `.author-box` > `.author-avatar` +
  `.author-info` (rodzic dla `.author-name`/`.author-role`/`.author-bio`,
  też działających tylko w jej środku).

## Typografia & Kolory

- **Skala wielkości:** `.text-1` do `.text-12` (płynny `clamp()`).
  Tekst bazowy (rozmiar akapitu) = `.text-3`. Poniżej bazy: `.text-1`
  (12px) i `.text-2` (13px) - metadane, daty w timeline. Powyżej:
  `.text-4`-`.text-8` odpowiadają nagłówkom H5-H1, a `.text-9`-`.text-12`
  to rozmiary hero (do 9rem). Mikrocopy: `.text-sm` (11px) i `.text-xs`
  (10px) - jeszcze mniejsze niż `.text-1` (podpisy, dopiski prawne);
  `.text-base` wraca do bazy.
- **Wagi:** `.fw-light`, `.fw-normal`, `.fw-medium`, `.fw-bold`,
  `.fw-black`.
- **Kolory tekstu/tła:** `.text-primary`, `.bg-surface`, `.bg-body`,
  `.bg-glass` (Glassmorphism).
- **Kolory na hover:** `.bg-hover-*`, `.text-hover-*`, `.border-hover-*`
  (pełna paleta: primary, success, danger, warning, info, dark, light,
  secondary, surface, body). **Schemat nazwy: `CO-hover-KOLOR`** -
  `text-hover-primary`, `bg-hover-danger`, `border-hover-success`. Nigdy
  odwrotnie (`hover-text-primary` to błąd; takie klasy zostały usunięte
  z frameworka w 1.7.0).
  Na `.btn` tych klas NIE dokładaj: przycisk ma własny kolor hover z
  wariantu, więc obie reguły ze sobą konkurują. Zmień `--<kolor>-hover`.
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
  `.bg-image` (także `picture.bg-image`) - oba z domyślną nakładką.
- **Overlay (nakładka na tło):** rodzic `.has-overlay` + `.overlay`. Sama
  `.overlay` daje już przyciemnienie na 50% - kolor
  (`.overlay-dark/-primary/-light`, `.bg-overlay` = czerń) i krycie
  (`.overlay-10` do `.overlay-90`) tylko je zmieniają. `.has-overlay` jest
  OBOWIĄZKOWE: bez niego nakładka szuka kontekstu wyżej i rozlewa się poza
  sekcję.
- **Filtry Obrazów:** `.filter-grayscale`, `.filter-blur`, `.filter-none`
  (zdejmuje filtr, np. z `.hover-filter-none` - logo koloruje się na hover).
- **Obramowania (Borders):** `.border`, `.border-0`, `.border-top`,
  `.border-bottom`, `.border-start`, `.border-end`.
- **Zaokrąglenia (Radius):** `.rounded-0` do `.rounded-5`,
  `.rounded-circle`, `.rounded-pill`, `.rounded-top-0`,
  `.rounded-bottom-0`.
- **Animowane plamy w tle:** `.bg-blobs` - dwie rozmyte, organiczne plamy
  (primary + info) unoszące się w tle kontenera. Tło podąża za motywem.
  Wariant `.bg-blobs-deep` jest **ZAWSZE CIEMNY**, także w motywie jasnym
  (jak `.navbar-pill`) - dzięki temu biały tekst działa na nim bez sprawdzania
  motywu. Kolor przez `--blobs-deep-bg` (domyślnie `#0F172A`); nie używaj tam
  `var(--bg-body)` ani `var(--dark)`, bo odwracają się w dark mode.
  Sterowanie **zmiennymi, nie klasami** (kolor i czas to wartości ciągłe):
  `--blob-1` / `--blob-2` (kolory plam) i `--blob-speed` (cykl pierwszej;
  druga liczy swój jako `×1.3`, więc jedna wartość przyspiesza obie
  i zachowuje rozjazd cykli). Typowo pod `.bg-glass` - szkło musi mieć
  co rozmywać. Kształt plam jest statyczny (`border-radius` nie jest
  animowalny bez reflow), ruch daje wyłącznie `transform` z obrotem.
  Animacja wyłącza się przy `prefers-reduced-motion`.
- **Grid Expand (płynny akordeon):** `.grid-expand` > `.grid-expand-inner`
  (owija treść, bez niego nie ma czego ściskać przez `overflow:hidden`).
  Animuje `grid-template-rows: 0fr → 1fr` - jedyny sposób na płynne
  „height: auto" w czystym CSS. Trzy wyzwalacze: `.is-open` (ręcznie,
  np. z JS), `details[open]` (wewnątrz natywnego `<details>`), oraz
  `.form-switch:has(.form-switch-input:checked) + .grid-expand` (switch
  TUŻ PRZED jako rodzeństwo, nie w tym samym `<label>` - inaczej klik
  w odsłoniętej treści dodatkowo przełącza switch). Wszystkie zero-JS.
- **Inne Helpery:** `.parallax-container`
  (Scroll-Driven), `.bg-gradient-corners` (łuna), `.stacking-container` >
  `.section-stacked`, `.embed-responsive` (do wideo z YT/Vimeo).

## Widgety (Opt-in)

- **Karuzele:** `.carousel` > `.carousel-track` > `.carousel-slide`
  (szerokość slajdu przez własny `min-width`). Strzałki opcjonalne
  (`.carousel-nav.carousel-prev/-next`); kropki (`.carousel-dots` >
  `.carousel-dot.is-active`) generuje skrypt SAM, gdy slajdów >1 i nie ma
  ich jeszcze w markupie. Wariant `.carousel-bg-sync` (+ dziecko
  `.carousel-bg-overlay`) zmienia tło kontenera na `data-bg` aktualnie
  widocznego `.carousel-slide` - ten sam `IntersectionObserver`, który
  podświetla kropki. Strzałki w tym wariancie widoczne tylko na hover.
- **Lightbox:** `<a href="duze.jpg" data-lightbox data-gallery="galeria">` -
  to WSZYSTKO, co piszesz. Skrypt sam dokleja na końcu `<body>` cały modal
  (`.lightbox-overlay` > `.lightbox-top-bar` z `.lightbox-counter` +
  `.lightbox-close`, `.lightbox-nav.lightbox-prev/-next`,
  `.lightbox-content`) - nie pisz tych klas ręcznie. Nawigacja: klik,
  swipe/drag, oraz klawiatura wewnątrz otwartego modala (`←`/`→` zmiana
  zdjęcia, `Esc` zamyka; focus wchodzi na `.lightbox-close` i wraca do
  klikniętej miniatury po zamknięciu).
- **Filtry Portfolio:** `.nav-filters` (lista przycisków `data-filter`,
  `"all"` = wszystkie) MUSI mieć kontener z `.filter-item` (atrybut
  `data-category`) jako bezpośredniego `nextElementSibling` - skrypt szuka
  go dokładnie tak, nic pomiędzy. Stan nadaje skrypt: `.is-hidden`
  (`display:none`) na niepasujących, `.is-animated` (wejściowa animacja)
  na dopiero co pokazanych.
- **Pasek czytania:** `.progress-container-fixed` > `.progress-bar-reading`,
  umieszczone zaraz po otwarciu `<body>`. Obsługa na stałe w rdzeniu
  `molique-script.js` (razem z sticky navbarem), nie w autoloaderze modułów.
- **Przed / Po:** `.before-after-slider` > `.img-after` (warstwa spodnia,
  ustala wysokość) + `.img-before` (przycinana `clip-path` wg zmiennej
  `--position`) + `.slider-control` (niewidoczny `input[range]`, realny
  sterownik) + `.slider-line`/`.slider-handle` (wizualne). Oba zdjęcia
  powinny mieć te same proporcje, inaczej `.img-before` się rozciąga.
- **Przycisk magnetyczny:** `.btn-magnetic` - zero CSS, cały efekt to
  inline `transform` z JS na `mousemove`. Aktywny tylko przy
  `(pointer: fine)` (nie na dotyku).
- **Speed Dial:** `.speed-dial` (zawsze `position: fixed; bottom/right:
  30px`, bez wariantu rogu) > `.speed-dial-main` + `.speed-dial-actions`
  > `.speed-dial-action`. Rozwija się na `:hover` LUB `:focus-within` -
  zero JS.
- **Udostępnianie:** `.share-bar` > `.share-btn[data-network]` (facebook /
  twitter / linkedin / whatsapp / native - `native` to Web Share API,
  bez wsparcia kończy się blokującym `alert()`).
- **Powrót na górę:** `.scroll-to-top` (też zawsze `bottom/right: 30px`
  - **kolizja z `.speed-dial`** na tej samej stronie, patrz pułapka w
  `docs-widgets.html`) + `.is-visible` (nadaje rdzeń `molique-script.js`
  po 400px scrolla, nie osobny moduł).
- **Wyszukiwarka tabeli:** dowolny `input[data-search-target="#id"]`
  filtruje wiersze `#id` na żywo (`js/modules/molique-table-search.js`,
  auto-ładowany po `data-search-target`). Wiersz `.cheat-sheet-category`
  chowa się automatycznie, gdy nic pod nim nie pasuje - reszta tabel
  ignoruje tę klasę bezpiecznie.

## Wykresy (Data Viz - Progressive Enhancement)

- **Zasada:** wykresy budowane w HTML/CSS/SVG jako fallback.
- **Przekazywanie danych:** wartości przekazywane z backendu TYLKO przez
  zmienne CSS: `style="--val: 75%;"`.
- **Struktura:** `.r-chart-wrapper` (dodaj `.chart-micro` dla małych
  wykresów) > `.chart-sparkline` / `.chart-radial` / `.chart-heatmap` /
  `.chart-area` / `.chart-pie`.
- **Lejki:** `.chart-funnel` (pionowy), `.chart-pipeline` (poziomy),
  `.chart-funnel-true` (klasyczny trapezowy).
- **Nawigacja Wykresów (segmentowany przełącznik zakresu):**
  `.chart-nav` > `<label class="chart-nav-item">` >
  `<input type="radio" name="…">` + `<span class="nav-label">`.
  Stan trzyma radio, więc przełączanie działa **bez JS**. Radio jest ukryte
  techniką `clip` (nie `display: none`), dzięki czemu **grupa zostaje
  obsługiwana strzałkami z klawiatury**, a obwódka focusa trafia na
  `.nav-label`.

## Architektura JavaScript

- **Autoloader:** główny plik `molique-script.js` skanuje DOM i
  asynchronicznie pobiera mikro-moduły z `js/modules/` (np.
  `molique-carousel.js`, `molique-lightbox.js`) tylko wtedy, gdy komponent
  istnieje na stronie.
- **Nazwy plików zawsze z prefiksem `molique-`** - dotyczy WSZYSTKIEGO, co
  trafia do cudzego projektu: rdzeń (`molique-script.js`), moduły JS
  (`js/modules/molique-*.js`), bundle CSS (`css/molique-style*.css`) oraz
  chunki konfiguratora (`dist/chunks/molique-*.css`). Dzięki temu skrypty
  synchronizujące framework mogą podmieniać wyłącznie pliki molique, nie
  ruszając kodu użytkownika. Nazwę pliku chunka nadaje `tools/gen-chunks.js`
  i wpisuje ją do manifestu - konfigurator czyta ją stamtąd, więc nie ma
  drugiego miejsca do zaktualizowania.
- **Vanilla JS:** całkowity zakaz używania jQuery.
- **NIGDY nie sklejaj nazw klas dynamicznie** (`'toast-' + type`,
  `` `col-span-${n}` ``). Taka nazwa nie istnieje w źródle jako literał, więc
  nie widzi jej ani PurgeCSS, ani wyszukiwarka IDE, ani generator safelisty.
  Zamiast tego mapa literałów: `const T = { success: 'toast-success', … }`
  i `T[type] || T.info` (przy okazji dostajesz walidację wejścia).
- **Stany zawsze jako `.is-*`** (`is-active`, `is-hidden`, `is-selected`) -
  to konwencja, na której opiera się jeden pattern w safeliście PurgeCSS.

## Purge / rozmiar CSS

- **Najpierw moduły, potem purge:** dobór bundli (`admin`, `shop`, `blog`…)
  to redukcja bez ryzyka. PurgeCSS dopiero potem.
- **Safelista:** paczka zawiera `purgecss.safelist.cjs`.
  `safelist: molique.runtime` to minimum (klasy dodawane przez JS);
  `molique.merge('status','grid')` gdy backend skleja nazwy klas
  (np. `badge-<?= $status ?>`). Bez tego wylatują m.in. `.is-*`, `toast-*`,
  `lightbox-*` i `@keyframes toastProgressAnim`.
- **Nigdy `variables: true`** - na zmiennych CSS stoi cały motyw.
