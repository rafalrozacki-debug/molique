# Przebudowa dokumentacji molique — brief dla osobnej sesji

Dokument do wklejenia/wskazania na starcie nowej rozmowy. Opisuje **co zrobić
z dokumentacją**, dlaczego, i jakie zasady obowiązują w tym repo.

---

## 1. Kontekst projektu

**molique** — lekki framework CSS B2B (repo: `c:\Praca\Molique\1.5.0`,
`github.com/rafalrozacki-debug/molique`, branch `main`).
Autor: Rafał Różacki. Aktualne wydanie: **v1.6.2**, w toku niewydane **v1.7.0**.

Kluczowe cechy istotne dla dokumentacji:

- Natywny HTML5/CSS przed JS (`<details>`, Popover API, `:has()`, Anchor
  Positioning, `interpolate-size`). JS to ostateczność.
- Kaskada oparta na `@layer reset, base, layout, components, modules, utilities`
  — zero wojen na specyficzność, `!important` tylko w `@layer utilities`.
- **148 zmiennych CSS** — na nich stoi cały motyw i dark mode. (Wcześniejszy
  szacunek „111" był nietrafiony: to 86 zmiennych motywu w `:root`, 56
  zmiennych komponentów i 6 czystych wejść z markupu — trzy kategorie o
  różnym kontrakcie z użytkownikiem. Udokumentowane w `docs-variables.html`.)
- **57 niezależnych modułów SCSS** (po rozbiciu w lipcu 2026) + konfigurator
  paczki (`builder.html`) i manifest `dist/chunks/manifest.json`.

### Jak uruchomić stronę

```bash
npm run dev     # http://localhost:5173
npm run build   # -> _site/ (prebuild generuje dist/chunks/)
```

> **Nie otwieraj stron z `_site/` dwuklikiem.** Protokół `file://` blokuje moduły
> ES i `fetch` — `builder.html` wygląda wtedy na wiecznie ładujący się.

Strony leżą w `src/*.html`, wspólne fragmenty w `src/partials/`
(`head.html` z `locals`, `navbar.html`, `footer.html`, `scripts.html`),
sklejane przez posthtml-include w `vite.config.js`.

---

## 2. Problem do rozwiązania

Dziś `docs-*.html` i `examples-*.html` **robią to samo** — obie grupy to
galerie showcase'ów z podglądem i kodem do skopiowania. Efekt: duplikacja,
a żadna z ról nie jest pełniona porządnie.

Dodatkowo **nie istnieje tabelaryczna referencja**:

- **111 zmiennych CSS** jest udokumentowanych wyłącznie w komentarzach SCSS,
- ~1120 klas ma tylko spis w `docs-classes.html` (bez opisu zachowania).

## 3. Cel — model Pico CSS

Wzorzec: <https://picocss.com/docs/container>. Jedna strona = **jedna koncepcja**:

1. Czym to jest (1–2 zdania).
2. Jak działa — proza wyjaśniająca mechanizm.
3. **Tabela klas** i **tabela zmiennych CSS**.
4. Pułapki / czego nie robić.
5. Linki do powiązanych stron i do przykładów.

Minimum demo — od pokazywania wariantów są `examples-*`.

### Docelowy podział ról

| Grupa | Rola |
| --- | --- |
| `docs-*` | **Referencja.** Jak mechanizm działa, pełne tabele klas i zmiennych, pułapki. |
| `examples-*` | **Galeria.** Gotowe bloki do skopiowania. Bez zmian. |

---

## 4. Proponowana kolejność prac

### Etap 1 — Referencja zmiennych CSS ✅ ZROBIONE

Zrealizowane: `src/docs-variables.html` + generator `tools/gen-variables-doc.js`
(wartości z SCSS) i `tools/variables-doc.data.js` (opisy). Generator przerywa
build przy rozjeździe opisów ze źródłem. Przy okazji wyszła i została naprawiona
martwa deklaracja w `.bg-glass` (brak `--bg-surface-rgb`).

<details>
<summary>Pierwotne założenia etapu</summary>

Nowa strona `docs-variables.html`: wszystkie zmienne w tabelach, pogrupowane
(kolory, typografia, odstępy, zaokrąglenia, cienie, z-index, sidebar, focus).
Dla każdej: nazwa, wartość domyślna (light + dark), co steruje, gdzie użyta.

**Rozważ generator** (`tools/gen-variables-doc.js`) czytający `_root.scss` —
w repo jest już taka konwencja: `tools/gen-safelist.js`, `tools/gen-chunks.js`,
`tools/gen-scss-context.js`. Ręczna tabela na 111 pozycji rozjedzie się po
pierwszej zmianie.

**Pułapki do opisania** (wyszły w praktyce):
- `--dark` **odwraca się** w dark mode (`#1E293B` → `#F8FAFC`) — to „kolor
  kontrastowy do tła", nie „ciemny". Użycie go na element leżący na zdjęciu
  daje biały tekst na białym tle.
- Pary `--x` / `--x-rgb`: pierwsza to gotowy kolor, druga to **same kanały**
  i działa **wyłącznie** w `rgba()`. `border-color: var(--dark-rgb)` jest
  niepoprawne i przeglądarka odrzuca całą deklarację.
- `variables: true` w PurgeCSS niszczy motyw.

</details>

### Etap 2 — Przepisanie `docs-*` na model referencyjny ✅ ZAMKNIĘTE (17/17)

Wszystkie 17 stron pasujących do modelu referencyjnego przepisane.
`docs-classes.html` i `docs.html` zostają osobnym, jeszcze nierozstrzygniętym
przypadkiem (patrz niżej).

Dla każdej strony: przenieść showcase'y do odpowiedniego `examples-*` (jeśli
tam ich nie ma), zostawić maksymalnie jedno demo, dopisać tabele i sekcję
pułapek.

#### Stan prac

| Strona | Stan | Klasy (opisane/w CSS) |
| --- | --- | --- |
| `docs-navbar` | ✅ | 63/63 |
| `docs-forms` | ✅ | 17/17 |
| `docs-interactive` | ✅ | 42/42 |
| `docs-cards` | ✅ | 23/23 |
| `docs-tables` | ✅ | 37/37 |
| `docs-buttons` | ✅ | 46/46 |
| `docs-layout` | ✅ | 70/70 rodzin |
| `docs-typography` | ✅ | 67/67 rodzin |
| `docs-sections` | ✅ | 41/41 |
| `docs-animations` | ✅ | 26/26 |
| `docs-charts` | ✅ | 31/31 |
| `docs-select` | ✅ | 23/23 |
| `docs-eshop` | ✅ | 27/27 |
| `docs-blog` | ✅ | 21/21 |
| `docs-admin` | ✅ | 26/26 |
| `docs-widgets` | ✅ | 15/15 |
| `docs-components-extra` | ✅ | 27/27 |
| `docs-classes`, `docs.html` | ⚠️ osobny przypadek | patrz niżej |

`docs-classes` to spis ~1120 klas — model referencyjny do niego nie pasuje,
to raczej kandydat na generowanie z chunków. `docs.html` jest stroną startową,
nie referencją komponentu. Obie wymagają osobnej decyzji.

#### Sprawdzona metoda (powtarzać dla każdej strony)

1. **Ustal zakres** — które chunki SCSS należą do tematu strony
   (`dist/chunks/molique-*.css`, kategorie w `manifest.json`). Uwaga na
   granice między stronami, żeby nie opisywać tego samego dwa razy.
2. **Wyciągnij komplet klas** z tych chunków:
   `grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]*' … | sort -u`. **Odfiltruj artefakty** —
   regex łapie fragmenty URL-i z SVG (`.w3`, `.org`) i klasy obce
   (`.btn`, `.card`), które należą do innych modułów.
3. **Przeczytaj SCSS, nie zgaduj.** Każde twierdzenie o zachowaniu (co wymaga
   czego, co robi JS, co jest `!important`) potwierdź w źródle. Tak wyszło, że
   `molique.md` kłamał o mega menu, a `.btn-text` nie jest wariantem przycisku.
4. **Napisz stronę**: sekcja „co wybrać" na wejściu, mechanizmy prozą, tabele
   klas, sekcja pułapek w akordeonie, linki do `examples-*` i stron
   powiązanych, nawigacja dół.
5. **Test kompletności** — porównaj klasy opisane na stronie
   (`<code>.x</code>`) z listą z kroku 2. Ma wyjść **zero pominiętych**.
   Ten test wyłapał realne dziury w `docs-navbar` i `docs-interactive`.
   Przy klasach narzędziowych (`docs-layout`: 221 klas) **zwiń rodziny
   numerowane** do wzorca przed porównaniem —
   `sed -E 's/-(auto|100|75|50|25|1[0-2]|[0-9])$/-N/'` — inaczej test każe
   wypisywać `.col-span-1` … `.col-span-12` osobno i strona robi się
   nieczytelna. Dokumentuj rodzinę z zakresem, nie każdy jej element.
   Rodziny bywają też **kolorowe**, nie tylko numeryczne (`docs-typography`:
   `.bg-hover-primary` … `-body`) — wtedy dołóż drugie zwinięcie:
   `s/^(\.(text|bg|border)-hover)-(primary|secondary|success|danger|warning|info|dark|light|surface|body)$/\1-N/`.
   Na samej stronie wypisz komplet kolorów raz, w kolumnie „warianty".
6. **Sprawdź, czy nic nie zginęło**: usunięte showcase'y muszą istnieć
   w `examples-*` (`grep -rl 'class="…' src/examples-*.html`).
   **Uwaga na fałszywe trafienia z sidebara** — link w menu
   (`href="examples-X.html"`) pasuje do grepa, choć strona wcale nie ma tej
   klasy w treści. Sprawdź `grep -c 'class="nazwa'`, nie samo `grep -rl`.
7. **Martwe linki**: każdy `href="*.html"` musi wskazywać istniejący plik.
   Osobno: **łańcuch nawigacji dół-strony** (Wstecz/Następny) musi
   wskazywać na FAKTYCZNYCH sąsiadów z `partials/docs-sidebar.html`, nie
   tylko na istniejące pliki — plik-do-którego-linkujesz może istnieć, ale
   być złym sąsiadem (znaleziono tak 4 zerwane linki naraz przy
   `docs-components-extra`). Szybki skrypt:
   `awk '/Nawigacja dół/,/<\/div>[[:space:]]*$/' src/docs-X.html | grep -oE 'href="[^"]*"'`
   na całej sekwencji stron, porównane z kolejnością w sidebarze.
8. `npm run build` + commit.

#### Ustalenia, które przy okazji wyszły

- Strony `docs-*` **nie mają stopki** — layout admina wypełnia ekran.
  Kończą się `<script src="js/molique-script.js"></script>`, bez partiali
  `footer.html` / `scripts.html`.
- Nagłówek akordeonu z plakietką: etykietę owiń w **jeden** `<span>`,
  inaczej `gap` rozsunie słowa w środku zdania.
- W przykładach **nie używać nazw prawdziwych klientów** — do dyspozycji
  „Molique" i „Briko" (CRM autora).
- Każda strona po przepisaniu zwykle ujawnia braki w `molique.md` i
  `llms.txt` — uzupełniać od razu i synchronizować `~/.claude/molique.md`.
- `docs-eshop`: `.product-gallery` był martwym kodem — `molique-shop.js`
  miał gotową logikę przełączania miniatur od dawna, ale CSS i markup nigdy
  nie powstały. Zaprojektowany od zera przy przepisywaniu strony (razem
  z wariantami `.product-gallery-left`/`-right`), tym samym trybem co
  wcześniej `.chart-nav`. Przy okazji znaleziono w starej wersji strony
  dwie martwe klasy bez żadnego CSS (`.cart-item-title`, `.cart-item-price`)
  i błąd `.badge-danger` użyty bez bazowej `.badge` (w przeciwieństwie do
  `.btn`, kolor odznaki NIE implikuje klasy bazowej) — poprawione przy
  teście kompletności w obie strony. Późniejszy bug zgłoszony przez
  użytkownika: w wariancie `-left`/`-right` ostatnia miniatura "znikała" —
  `.product-gallery-thumbs` dziedziczył `flex-wrap: wrap` z reguły
  domyślnej, a w układzie kolumnowym otwierało to niechcianą drugą kolumnę
  poza widocznym paskiem. Naprawa: `flex-wrap: nowrap` w wariancie
  kolumnowym.
- `docs-blog`: `.day`/`.month` to dwie pary klas potomnych o tej samej
  nazwie, ale różnym wyglądzie, zależnie od rodzica (`.post-date-badge` vs
  `.post-date`) — pierwszy taki przypadek w projekcie, udokumentowany jako
  osobna pułapka. Przy okazji poprawiono niezgodność rodzaju gramatycznego
  w przykładowej notce autora strony ("Ekspertka"/"Pasjonatka" opisujące
  mężczyznę — kopiuj-wklej z szablonu). Znaleziono też zepsuty łańcuch
  nawigacji dół-strony: `docs-admin.html` prowadził "Wstecz" prosto do
  `docs-eshop.html`, pomijając `docs-blog.html` — naprawione.
- `docs-admin`: strona przed przepisaniem dokumentowała `.stepper` i
  `.status-dot` — to komponenty RDZENIA (`components/_stepper.scss`,
  `components/_status-dots.scss`, ładowane przez `_components.scss` do
  `molique-style.css`), nie mają nic wspólnego z modułem admina i nie
  wymagają `molique-style-admin.css`. Ustalenie zakresu (krok 1 metody)
  ujawniło też, że stary `css/scss/_admin.scss` (~300 linii) był całkowicie
  martwy — jedyne wczytanie było zakomentowane w `molique-style.scss`, a
  cała jego treść dawno przeniosła się do `layout/_admin-layout.scss` +
  `components/_admin-sidebar.scss` + `components/_admin-nav.scss` (layout/
  sidebar/nav) i osobnych plików rdzenia (`.form-switch` →
  `components/_form-switch.scss`, `.btn-action` → `_buttons.scss`,
  `.data-row` → `components/_data-rows.scss`). Usunięty za zgodą
  użytkownika; wymusiło to też usunięcie martwego wpisu `--sidebar-width`
  z `tools/variables-doc.data.js` i przeliczenie licznika (61 → 60) w
  `docs-variables.html`. Nowo odkryty, w pełni zbudowany, ale NIGDZIE
  wcześniej nieużywany mechanizm: przełącznik szerokości sidebara
  (`#molique-sidebar-toggle` + `.sidebar-toggle-icon`, cykl pełny →
  `.sidebar-md` → `.sidebar-sm`, `localStorage`) — logika siedziała gotowa
  w rdzeniu `molique-script.js` od dawna, ale żaden plik w repo nigdy nie
  dodał przycisku o tym ID do markupu. Znaleziono też, że `.chart-funnel`/
  `.chart-pipeline`/`.chart-funnel-true` fizycznie mieszkają w
  `components/_chart-funnel.scss`, ładowanym WYŁĄCZNIE przez
  `molique-style-admin.scss` — reszta wykresów w rdzeniu działa bez tego
  pliku, lejki nie; dopisano to jako pułapkę zarówno w `docs-admin.html`,
  jak i (do zrobienia przy następnej wizycie na tamtej stronie) warto
  dopisać wzmiankę w `docs-charts.html`.
  **Metodologiczna nauka:** pierwsza wersja strony miała żywy, realnie
  podpięty przycisk `#molique-sidebar-toggle` (świadomie sterujący
  PRAWDZIWYM layoutem tej strony dokumentacji — chwytliwy pomysł). Test
  w Playwright wykrył realny błąd: kliknięcie przełącznika włączało
  globalny selektor CSS drill-downu (`.sidebar-md .admin-nav-submenu[open]`),
  który złapał też osobne, statyczne demo `.admin-nav-submenu[open]` w
  sekcji niżej — mimo że to demo nie leżało w prawdziwym sidebarze, i tak
  było jego potomkiem przez wspólny `.admin-layout`. Zamieniało się w
  pełnoekranowy, niewidzialny overlay blokujący kliknięcia na całej
  stronie. Wniosek na przyszłość: **żywe demo, które przełącza klasę na
  wspólnym przodku (tu: `.admin-layout`), nigdy nie powinno współistnieć na
  tej samej stronie z innym demo używającym selektorów zależnych od tego
  przodka** — bezpieczniej trzymać taki przełącznik statycznym (kod +
  tabela, bez żywego podpięcia), tak jak ostatecznie zrobiono.
- `docs-widgets`: strona ładowała nieistniejący plik
  `css/molique-style-contact.css` (martwy link `<link>` w `<head>`, bez
  odpowiadającej mu sekcji na stronie ani pliku SCSS gdziekolwiek w
  repo) — usunięty. Znaleziono realną kolizję CSS: `.speed-dial` i
  `.scroll-to-top` mają identyczne domyślne współrzędne
  (`position: fixed; bottom/right: 30px`), więc użyte razem na jednej
  stronie nakładają się dokładnie na sobie — udokumentowane jako pułapka
  nr 1. Przy ustalaniu zakresu wyszło też, że `molique-table-search.js`
  (`data-search-target`, filtrowanie wierszy na żywo) nie było
  udokumentowane NIGDZIE w modelu referencyjnym, nawet na już gotowym
  `docs-tables.html` — dopisane tam jako mały patch (mechanizm jest
  ogólnego przeznaczenia, mimo że jego jedyne realne użycie w repo to
  wyszukiwarka w `docs-classes.html`, stąd wspierana, ale opcjonalna
  klasa `.cheat-sheet-category`).
- `docs-components-extra` (ostatnia strona Etapu 2): dwa realne bugi w
  kodzie, nie tylko w dokumentacji. (1) Wariant karuzeli „Background Sync"
  (`.carousel-bg-sync` + `data-bg`) był reklamowany na tej stronie i na
  `examples-carousel.html`, ale ZERO linii JS w repo czytało `data-bg` —
  CSS czekał gotowy na `background-image`, którego nikt nigdy nie
  ustawiał. Po pytaniu użytkownika (opcja: dokończyć) dopisano logikę w
  `molique-carousel.js`, wykorzystując już istniejący
  `IntersectionObserver` (ten sam, co podświetla kropki) — zweryfikowane
  w Playwright na realnej stronie. (2) Stara wersja strony twierdziła, że
  lightbox „natywnie obsługuje nawigację klawiaturą (strzałki, ESC)" — w
  całym `molique-lightbox.js` nie było ani jednego nasłuchu `keydown`.
  Realna pułapka klawiaturowa (modal bez możliwości zamknięcia bez
  myszy). Naprawione: `keydown` na `Esc`/`←`/`→`, focus na
  `.lightbox-close` przy otwarciu, powrót focusu do triggera przy
  zamknięciu, plus brakujące `aria-label` na przyciskach — też
  zweryfikowane w Playwright. Przy ustalaniu zakresu znaleziono też, że
  `.progress-bar`/`.progress-bar-reading` (z sekcji "Widgety") animują
  `width`, nie `transform` — ten sam wzorzec co `.funnel-stage`
  wcześniej, potraktowany tak samo: udokumentowane jako świadomy wyjątek
  od reguły GPU-only, nie zmieniane bez pytania.
  **Audyt łańcucha nawigacji dół-strony:** przy weryfikacji sąsiadów tej
  (ostatniej) strony wyszło na jaw, że cały łańcuch 18 stron miał cztery
  zerwane linki nagromadzone z różnych wcześniejszych sesji (nie tylko z
  tego przepisywania) — `docs-navbar` pomijał `docs-sections`,
  `docs-interactive` pomijał `docs-tables`, a sama
  `docs-components-extra` (w wersji, którą właśnie pisano) omyłkowo
  celowała w `docs-forms` zamiast w faktycznego sąsiada `docs-charts`.
  Zamiast łatać pojedynczo, przeliczono CAŁY łańcuch (`docs-layout` →
  … → `docs-purgecss`, 18 stron) skryptem porównującym każdy `href` z
  prawdziwą kolejnością w `partials/docs-sidebar.html` i naprawiono
  wszystkie cztery naraz. Wniosek: przy każdej kolejnej zmianie
  wpływającej na sąsiedztwo stron (nowa strona, zmiana kolejności w
  sidebarze) warto powtórzyć ten sam skrypt zamiast ufać pojedynczym
  linkom.

### Unifikacja sidebara dokumentacji (po Etapie 2)

Zgłoszenie użytkownika: `docs.html` i `docs-classes.html` miały
`.admin-layout-floating`, pozostałe 19 stron `docs-*.html` — zwykły
`.admin-layout`. Do tego: sidebar dokumentacji (~21 linków w 8
kategoriach, same linki tekstowe bez ikon) był zbyt długi.

- **Floating ujednolicony wszędzie** (21/21 stron) — zwykły find/replace
  na wrapperze, zweryfikowany grepem przed i po.
- **`partials/docs-sidebar.html` przebudowany na rozwijane kategorie**:
  6 z 8 kategorii (te z 2+ pozycjami) to teraz `<details class="admin-nav-submenu">`
  — dokładnie ten sam komponent, który wcześniej (przy `docs-admin`) miał
  zero realnych użyć w całym repo. To pierwsze prawdziwe wdrożenie.
  Kategorie z JEDNĄ pozycją (Wykresy & Dane, Build & optymalizacja)
  celowo zostały płaskimi linkami — accordion na jeden element to zbędny
  dodatkowy klik.
- **`molique-admin-nav.js` rozszerzony**: gałąź z aktywną stroną teraz
  sama się otwiera na desktopie (`details.open = true` przy `hasActive`),
  nie tylko podświetla. Istniejący krok „na mobile nie auto-rozwijaj"
  uruchamia się zaraz potem i poprawnie cofa to na wąskich viewportach —
  jeden warunek za drugim, bez rozgałęzienia po typie urządzenia.
- Zweryfikowane w Playwright na 1400px (dokładnie 1 z 6 gałęzi otwarta,
  właściwa position sidebara przez floating) i na 390px (szuflada
  „Więcej" + zagnieżdżony pełnoekranowy drill-down wewnątrz niej —
  kombinacja NIGDY wcześniej nie testowana empirycznie, bo submenu nie
  miało żadnego realnego użycia; działa poprawnie, „Cofnij" zamyka).
  Zrzuty ekranu potwierdziły też stronę wizualną.
- **Obserwacja, nie zgłoszony problem**: na mobile (`@media max-width:768px`)
  wyzwalacz kategorii nie ma widocznej strzałki (CSS jawnie ją ukrywa w
  tym kontekście — pre-istniejące zachowanie komponentu, nie coś
  wprowadzonego teraz). Wizualnie kategoria-do-rozwinięcia i zwykły link
  wyglądają identycznie w szufladzie „Więcej", różni je tylko to, że tap
  w kategorię idzie głębiej zamiast nawigować. Może być warte dodania
  jakiegoś wskaźnika później, jeśli okaże się mylące w praktyce.

### Zrobione follow-upy

- **`.file-upload` dokończony** — brakujący `js/modules/molique-file-upload.js`
  dopisany: nasłuch `change` na ukrytym input, nadpisuje (lub dopisuje,
  jeśli nie istnieje w markupie) `.file-upload-name` nazwą wybranego
  pliku. Klik i natywne przeciągnięcie pliku i tak już działały (sam
  input to niewidoczna, rozciągnięta na całą kartę strefa) — brakowało
  wyłącznie potwierdzenia efektu. Zweryfikowane w Playwright
  (`setInputFiles`, ten sam sygnał `change` co przy realnym drop) na
  dwóch niezależnych instancjach na jednej stronie. Dopisane do
  `docs-forms.html` (już gotowej strony referencyjnej) i do słowników.

### Pomysły odłożone na później (poza zakresem przebudowy dokumentacji)
- **Lightbox i karuzela — dalsze dopracowanie** zapowiedziane przez
  użytkownika na później, poza tym, co już naprawiono przy
  `docs-components-extra` (Background Sync, klawiatura w lightboksie).
  Konkretny zakres jeszcze nieustalony — do doprecyzowania, gdy użytkownik
  wróci do tematu.

- **Wizualny konfigurator `bg-blobs`** — strona w rodzaju `theme-editor.html`,
  na której klika się kolory (`--blob-1`, `--blob-2`), tempo
  (`--blob-speed`) i tło wariantu (`--blobs-deep-bg`), a wychodzi gotowy
  `style="…"` do skopiowania. Komponent jest już w całości sterowany
  zmiennymi, więc taki edytor nie wymaga zmian w CSS — wystarczy UI
  ustawiające zmienne na podglądzie, dokładnie jak
  `js/modules/molique-theme-editor.js`.
- **Asymetria breakpointów w siatce** — rodzic ma progi `md` i `lg`, ale
  odstępy `sm`/`xl` istnieją tylko w opt-in `_utilities-extended.scss`.
  Do rozważenia, czy ujednolicić.
- **Mikrointerakcje z Pinteresta** (niski priorytet) — autor ma zebrany
  folder inspiracji do wdrożenia. Zanim cokolwiek powstanie, warto
  przefiltrować listę przez ograniczenia frameworka, bo one odrzucają dużą
  część typowych efektów z moodboardów:
  - animować wolno **wyłącznie** `transform`, `scale`, `translate`
    i `opacity` — odpada wszystko, co rusza `box-shadow`, `width`,
    `height`, `top/left` czy `border-radius` (reflow),
  - każdy ciągły ruch potrzebuje wyjścia przy `prefers-reduced-motion`,
  - efekt wymagający JS musi trafić do `js/modules/molique-*.js`
    i wpisu w autoloaderze `molique-script.js`.

  Miejsce docelowe: `css/scss/utilities/_animations.scss` plus demo
  w `examples-hover-microinteractions.html`. Przepisana strona
  `docs-animations` wypisze komplet tego, co JUŻ istnieje — dobry punkt
  wyjścia, żeby odsiać pomysły już pokryte.
- **„Ludzka" maszyna do pisania** (najniższy priorytet) — wariant
  `.typewriter`, w którym litery pojawiają się w nierównym tempie, jakby
  pisał je człowiek: losowe wahanie odstępu, dłuższa pauza po kropce
  i przecinku, sporadyczna literówka cofana backspace'em.
  **Wykonalne bez problemu:** efekt jest już sterowany z
  `js/modules/molique-text-effects.js`, więc to zmiana w module, nie w CSS —
  obecna wersja używa stałego interwału, wystarczy zastąpić go
  `setTimeout` z losowanym opóźnieniem. Uwaga na dwie rzeczy: `aria-hidden`
  na animowanym tekście plus pełna treść dla czytnika ekranu, oraz
  `prefers-reduced-motion` (wtedy od razu cały tekst).

### Etap 3 — Spójność nawigacji ✅ ZROBIONE (wykonany przed Etapem 2)

Wyciągnięty do `src/partials/docs-sidebar.html`; aktywną pozycję nadaje z URL
nowy `js/modules/molique-admin-nav-active.js` (auto-ładowany przy `.admin-nav`).

Zrobiony wcześniej niż planowano, bo 19 kopii **już się rozjechało** i dokładanie
do nich dwudziestej pozycji byłoby pracą do wyrzucenia w tym etapie. Rozjazd
naprawiony przy okazji: sześć stron nie linkowało do Spisu klas ani Roadmapy,
`docs.html` gubiło blog, a `docs-tables.html` wypadło z osiemnastu menu.

Update: pierwsza interpretacja "roadmapa musi wylecieć z dokumentacji"
(usunięcie strony + wszystkich 8 linków w całym serwisie) była za
szeroka — użytkownik doprecyzował, że chodziło **wyłącznie** o link
w sidebarze dokumentacji (`partials/docs-sidebar.html`, kategoria
"Wprowadzenie"). Strona żyje dalej pod `docs-roadmap.html` i zostaje
linkowana z navbara, stopki i przykładów mega menu — tak jak
`changelog.html`, jest traktowana jako strona ogłoszeń/zasobów, a nie
część drzewka dokumentacji API. Wszystko poza sidebarem przywrócone
z historii gita (`git show`/`git checkout` na commicie sprzed
usunięcia), więc bajtowo identyczne z wersją przed pomyłką — poza samą
`docs-roadmap.html`, do której użytkownik miał kopię zapasową na
produkcji (molique.rozacki.com) na wypadek, gdyby historia gita
zawiodła.

---

## 5. Zasady obowiązujące w tym repo

### Komunikacja
- **Wszystko po polsku**, z pełną diakrytyką.
- Odbiorca: web designer znający HTML/CSS i podstawy programowania. Tłumacz
  decyzje techniczne zrozumiale, ale kod pisz profesjonalnie.

### Kod i treść
- **Zawsze używaj klas molique** — nie pisz ad-hoc CSS, jeśli istnieje
  odpowiednik. Słownik: `css/scss/molique.md` (kopia globalna w
  `~/.claude/molique.md`) oraz `llms.txt`.
- Strony dokumentacji **dogfooduje molique** (tabele, akordeony, zakładki,
  `component-code` z przyciskiem Kopiuj).
- **Nie sklejaj nazw klas dynamicznie** — literały, inaczej PurgeCSS ich nie widzi.
- Stany zawsze jako `.is-*`.

### Po każdej zmianie
1. `npm run build` — musi przejść czysto.
2. Aktualizacja słowników: `css/scss/molique.md`, `~/.claude/molique.md`, `llms.txt`.
3. Changelog: `src/changelog.html` **oraz** regeneracja lustra `changelog.html.md`
   (skrypt inline w historii commitów — kopiuje źródło w blok ```html).
4. Jeśli ruszasz SCSS: `node tools/gen-scss-context.js` (odtwarza
   `_AI_CONTEXT_scss.md`).

### Commity
- Bez polskich znaków diakrytycznych i bez cudzysłowów w treści (PowerShell 5.1
  się na nich wywraca). Używaj `git commit -F -` z heredokiem w bashu.
- Stopka: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

### Weryfikacja (ważne)
Autor został wcześniej poszkodowany przez asystenta, który przy refaktorze
**pogubił reguły CSS** („do teraz odnajdujemy sieroty"). Obowiązuje zasada:
**każda zmiana masowa musi być dowiedziona, nie oceniona na oko.**

Sprawdzone narzędzia z tej sesji:
- porównanie skompilowanego CSS na poziomie **par selektor→deklaracje**
  (odporne na kolejność i grupowanie selektorów; uwzględnia kontekst `@layer`),
- kontrola bilansu `{` / `}` przed podpięciem nowych plików,
- diff pozostałych bundli (łapie skutki uboczne),
- przy zmianach w HTML: porównanie renderu `_site/` przed i po (migracja
  partiali była dowiedziona jako **bajt w bajt** identyczna).

---

## 6. Stan i pliki, które warto znać

| Ścieżka | Co to |
| --- | --- |
| `css/scss/components/` | 57 niezależnych modułów |
| `css/scss/_root.scss` | wszystkie zmienne motywu (źródło dla Etapu 1) |
| `css/scss/molique.md` | słownik klas (obowiązujący) |
| `llms.txt` | wersja słownika dla modeli AI, serwowana z `/llms.txt` |
| `dist/chunks/manifest.json` | 66 modułów: rozmiar, kategoria, opis, zależności |
| `src/builder.html` + `builder.js` | konfigurator paczki |
| `src/docs-purgecss.html` | **wzorzec docelowego stylu** — instrukcja krok po kroku, tabele, diagnostyka |
| `tools/gen-*.js` | generatory (safelist, chunks, kontekst SCSS) |

> `src/docs-purgecss.html` jest najbliższy docelowemu stylowi: sekcje numerowane,
> tabele zamiast galerii, sekcja „czego nie robić" i diagnostyka po objawie.
> Warto go użyć jako punkt odniesienia.

---

## 7. Następny krok

Etapy 1 i 3 są zamknięte. Zostaje **Etap 2** — przepisanie 19 stron `docs-*`
na model referencyjny. Grunt jest przygotowany: jest z czego linkować
(`docs-variables.html`), a nawigacja to jeden plik, więc dokładanie stron nie
wymaga już edycji dwudziestu kopii.

Sugerowana kolejność bez zmian: `docs-navbar`, `docs-forms`, `docs-interactive`,
`docs-cards`, `docs-tables`, reszta.
