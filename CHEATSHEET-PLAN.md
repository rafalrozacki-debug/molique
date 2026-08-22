# Plan: kompletny spis klas + wyszukiwanie po kontekście

Stan na 1.7.32 (wydanie przygotowane, czeka na `npm publish`).
Dokument roboczy — po zakończeniu prac do skasowania albo do przeniesienia
w skróconej formie do `CLAUDE.md`.

## 1. Diagnoza (zmierzona, nie szacowana)

Porównanie klas ze skompilowanego `css/molique-style.css` z tokenami
w `src/docs-classes.html` (skrypt jednorazowy, obsługa zakresów `.m-0` do
`.m-5`, wzorców `.btn-*` i wyliczeń w prozie):

- **1191** klas w rdzeniu, **199** wierszy w tabeli, **347** klas poza nią.
- Rozbicie braków:
  - **91** — całe komponenty bez ani jednego wiersza: `theme-switch`,
    `onboarding-*`, `tour-*`, `carousel-*`, `lightbox-*`, `testimonial-*`,
    `footer-*`, `select-search-*`, `custom-select-*`, `sortable-*`,
    `thumb-info-*`, `file-upload-*`, `pricing-list-*`;
  - **46** — warianty kolorystyczne: `badge-*`, `alert-*`, `btn-outline-*`,
    `btn-hover-*`, `toast-*`, `stock-bar-*`, `bg-hover-*`, `stat-tile-*`;
  - **25** — podstawy, których brak zaskakuje najbardziej: `.card-footer`,
    `.form-check`, `.tabs-content`, `.dropdown-item`, `.navbar-item`,
    `.navbar-pill`, `.accordion-header`, `.page-link`, `.icon`;
  - **10** — stany `.is-*`;
  - **175** — drobiazgi wewnętrzne (`area-line`, `pie-bg`, `js-resetting`).

## 2. Co już jest w repo i trzeba na tym budować

- **Cheat-sheet:** jedna tabela, `<tbody id="cheatSheetBody">`, wiersze
  rozdzielone `<td colspan="3" class="cheat-sheet-category">`. Dwanaście
  kategorii (numeracja w treści jest niespójna — dwie noszą nazwę
  „Nawigacja", do uporządkowania przy okazji).
- **Wyszukiwarka:** `input#classSearch` z `data-search-target="#cheatSheetBody"`,
  obsługiwana przez `js/modules/molique-table-search.js`. Matchuje
  `row.textContent`, ukrywa nagłówek kategorii, gdy nic pod nim nie zostało.
- **Precedens generatora tabel:** `tools/variables-doc.data.js` (opisy)
  + `tools/gen-variables-doc.js` (czyta SCSS jako źródło prawdy, skleja,
  wypisuje `src/partials/variables-*.html`, które są w `.gitignore`).
  **Generator PRZERYWA build**, gdy zmienna w SCSS nie ma opisu — to jedyne
  w repo zabezpieczenie przed dokumentacją, która kłamie.

### Pułapka odkryta przy planowaniu

`docs-variables.en.html` i `.de.html` dołączają **ten sam, polski** partial
co wersja PL. Generator rozwiązał dryf, ale nie i18n. Nie powielamy tego
błędu: dane cheat-sheetu od początku mają pola `pl`/`en`/`de`, wzorem
`tools/builder-i18n.data.js`.

## 3. Decyzje architektoniczne

1. **Tabela generowana z danych, nie pisana ręcznie w trzech plikach.**
   546 wierszy × 3 języki utrzymywane ręcznie zdryfują w pierwszym miesiącu.
2. **EN/DE w danych od razu**, nie „kiedyś potem" (patrz pułapka wyżej).
3. **Bramka w generatorze:** każda klasa ze skompilowanego CSS musi mieć
   wpis albo być jawnie oznaczona `internal: true`. Inaczej build pada,
   z listą brakujących. Bez tego za trzy wydania wrócimy do 347.
4. **Tagi jako `data-tags` na `<tr>`**, nie jako widoczna kolumna. Kolumna
   to szum wizualny w tabeli, która i tak ma trzy kolumny.
5. **Rozszerzamy istniejącą wyszukiwarkę**, nie piszemy drugiej. Dopisanie
   `row.dataset.tags` do przeszukiwanego tekstu to dwie linijki w
   `molique-table-search.js` — i staje się cechą WIDGETU molique, dostępną
   w każdym projekcie, a nie hackiem tej jednej strony. Czyli wchodzi
   w Definition of Done: llms.txt, słownik globalny, docs.

## 4. Słownik tagów (do zatwierdzenia w fazie 0)

Sens tagów: ktoś nie zna nazwy klasy, zna swój problem.

- **Kontekst:** `formularz`, `tabela`, `dashboard`, `nawigacja`, `modal`,
  `mobile`, `admin`, `ecommerce`, `blog`, `wykres`, `feedback`, `overlay`.
- **Problem:** `wyśrodkowanie`, `odstęp`, `przewijanie`, `zawijanie`,
  `przycinanie`, `kolejność`, `widoczność`, `cień`, `zaokrąglenie`,
  `wyrównanie`, `proporcje`.
- **Cecha:** `zero-js`, `dostępność`, `responsywne`, `stan`, `animacja`.

Test przydatności: wpisanie „wyśrodkować" ma zwrócić
`.justify-content-center`, `.align-items-center`, `.translate-middle`,
`.mx-auto`, `.text-center`. Jeśli nie zwraca — tagi są źle dobrane.

Tagi zostają **po polsku również w wersji EN/DE**? NIE — to pole
lokalizowane jak opis. Inaczej niemiecki użytkownik szuka po polsku.

## 5. Fazy

### Faza 0 — rozstrzygnięcia (bez kodu)
- Kryterium „API publiczne vs wewnętrzne" dla 175 drobiazgów. Propozycja:
  publiczna jest klasa, która występuje w markupie któregokolwiek
  `src/docs-*.html` / `src/examples-*.html` albo w `llms.txt`. Reszta
  dostaje `internal: true` z jednozdaniowym uzasadnieniem.
- Zatwierdzenie słownika tagów.
- Decyzja o kategoriach: zostaje 12 (po uporządkowaniu duplikatu nazwy)
  czy przebudowa.

### Faza 1 — generator, bez zmiany treści
- `tools/cheatsheet.data.js` + `tools/gen-cheatsheet.js` →
  `src/partials/cheatsheet.{pl,en,de}.html` (do `.gitignore`).
- Migracja istniejących 199 wierszy do danych **1:1**.
- **Weryfikacja:** wygenerowany HTML po normalizacji białych znaków
  identyczny z obecnym. Dopiero wtedy podmiana w `docs-classes.*.html`.
- Bramka włączona, ale na starcie w trybie ostrzeżenia (lista braków
  w logu), żeby nie zablokować buildu przed fazą 3.

### Faza 2 — tagi i wyszukiwanie
- Pole `tags` w danych, render do `data-tags`.
- `molique-table-search.js`: przeszukiwany tekst = `textContent` +
  `dataset.tags`.
- DoD widgetu: llms.txt, `~/.claude/molique.md`, `docs-*` (opis
  `data-tags`), changelog.

### Faza 3 — treść, partiami w kolejności wartości
1. 25 podstaw (`.card-footer`, `.navbar-item`, `.form-check`…) — największy
   zwrot, najmniej pracy.
2. 46 wariantów kolorystycznych — w większości jeden wiersz na rodzinę
   z wyliczeniem, nie 46 wierszy.
3. 91 klas komponentowych — po komponencie, z linkiem do właściwej strony
   `docs-*`.
4. 175 drobiazgów — triage na `internal: true` / wpis.
- Po każdej partii: przełączenie bramki na twardą dla domkniętych kategorii.

### Faza 4 — UX wyszukiwania
- Licznik wyników i pusty stan (dziś przy zerze trafień tabela jest po
  prostu pusta).
- `?q=` w adresie, żeby dało się linkować wynik.
- Skrót klawiszowy do pola (`/`), `Esc` czyści.

### Faza 5 — domknięcie
- Rozmiar strony: przy ~550 wierszach × 3 języki sprawdzić wagę HTML
  i czas renderu; ewentualnie podział na sekcje albo `content-visibility`.
- PurgeCSS: trzecia kolumna tabeli używa REALNYCH klas w demo, więc
  przejrzeć safelistę po dodaniu nowych demo.
- Changelog, wersja, wydanie.

## 6. Ryzyka

- **Tłumaczenia.** 347 opisów × 2 języki to największy pojedynczy koszt
  całości. Nie zaczynać od nich: najpierw PL w danych, EN/DE partiami,
  z bramką dopuszczającą tymczasowo brak `en`/`de` (z ostrzeżeniem).
- **Równoległe sesje.** Repo bywa współdzielone — obowiązuje `git add`
  wyłącznie własnych plików, nigdy `-A` (patrz `CLAUDE.md`).
- **Rozjazd numeracji kategorii** w trzech językach przy ręcznej edycji —
  kolejny argument za generatorem.
