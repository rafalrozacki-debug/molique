# molique - zasady pracy nad frameworkiem (ten plik, nie klient WP)

Ten plik dotyczy pracy nad **samym frameworkiem molique** (to repo:
silnik CSS, komponenty, strona molique.dev, pakiety npm, JIT/CLI).
Globalne zasady WordPress (namespaces, Service Locator, bezpieczeństwo
PHP itd. z `~/.claude/CLAUDE.md` / `c:\Praca\CLAUDE.md`) dotyczą
projektów *klienckich korzystających z* molique - większość z nich nie
ma tu zastosowania, bo to nie jest wtyczka WordPress.

Design-system dictionary (`~/.claude/molique.md`) obowiązuje też tutaj -
to źródło prawdy dla nazw klas przy pisaniu HTML/CSS w tym repo, dokładnie
tak samo jak w projektach klienckich.

## Definition of Done - każda nowa klasa/komponent publiczny

Ustalone 2026-07-28 po tym, jak `.stat-tile` (v1.7.11) trafił wszędzie
poza `llms.txt` i wymagał osobnego, drugiego wydania (v1.7.12) tylko po
to, żeby domknąć lukę. Poniższa tabela to lista kontrolna, nie
sugestia - przed uznaniem zmiany za skończoną, przejdź ją całą.

| # | Miejsce | Kiedy dotyczy |
|---|---|---|
| 1 | SCSS komponentu + rejestracja w `_components.scss` (lub właściwym aggregatorze) | zawsze |
| 2 | `tools/builder-i18n.data.js` - wpis EN/DE dla nowego pliku komponentu | zawsze (nowy plik `.scss` w `components/`) - **build się nie zbuduje bez tego**, to jedyny punkt-bramka na liście |
| 3 | `src/docs-*.html` (PL/EN/DE) - żywy przykład + tabela klas na właściwej stronie referencyjnej | zawsze (nowa klasa publiczna) |
| 4 | `src/docs-classes.html` (PL/EN/DE) - wiersz w cheat-sheecie | zawsze (nowa klasa publiczna) |
| 5 | `llms.txt` (jeden plik, PL) | zawsze (nowa klasa publiczna) - `docs-llms.html` regeneruje się z niego automatycznie, nic więcej nie trzeba ręcznie edytować |
| 6 | `~/.claude/molique.md` (globalny słownik użytkownika, poza tym repo) | zawsze (nowa klasa publiczna) - inaczej Claude pracujący nad projektem klienckim nie wie, że klasa istnieje |
| 7 | `src/examples-*.html` | TYLKO gdy komponent wchodzi w skład większej, realistycznej kompozycji (dashboard, strona ofertowa). Pojedyncze atomy (jak `.stat-tile`) NIE dostają własnej strony examples. |
| 8 | `src/docs-roadmap.html` (PL/EN/DE) | gdy zmiana zamyka istniejący punkt roadmapy (usuń go, zaktualizuj liczniki sekcji i sumę na górze) LUB rodzi nowy pomysł na przyszłość (dopisz) |
| 9 | `src/changelog.html` (PL/EN/DE) | zawsze - patrz zasada wersjonowania niżej |
| 10 | `src/index.html` (PL/EN/DE) | TYLKO dla zmian "na afiszu" (nowa strona, duży nowy moduł jak JIT/CLI). Pojedynczy komponent tego nie dostaje. |
| 11 | Link w `partials/navbar.html` / `partials/docs-sidebar.html` (PL/EN/DE) | TYLKO przy nowej stronie (nie przy dopisce do istniejącej) |

## Kiedy wersjonować, a kiedy batchować

Nie każda zmiana dostaje własny bump wersji + osobny deploy. Rozróżnienie:

- **Realna zmiana (wersjonuj i wdróż od razu):** nowy komponent, nowa
  klasa, zmiana zachowania/wyglądu, poprawka buga, nowa strona. Pełny
  cykl: bump `package.json` → `node tools/sync-version.js` →
  `npm install --package-lock-only` → `powershell -File
  tools/build-packages.ps1` (+ usuń stare ZIP-y) → `npm run build` →
  commit → push → deploy → `curl` weryfikacja na żywo.
- **Domknięcie/porządek (batchuj):** brakujący wpis w cheat-sheecie/
  llms.txt/roadmapie do czegoś, co już jest live; literówka w docsach;
  drobna redakcja opisu. NIE rób dla tego osobnego wydania - zostaw
  zmianę w working tree (lub zwykły commit bez bumpa wersji, bez
  deployu) i dolicz ją do NASTĘPNEJ realnej zmiany, kiedy i tak trzeba
  będzie robić pełny cykl. Jeśli nie wiadomo, kiedy nastąpi następna
  realna zmiana, a poprawka jest publicznie widoczna (np. zła informacja
  w dokumentacji) - zapytaj, zamiast zgadywać.

## Pakiety npm - łatwo o dryf, bo publish jest ręczny

Odkryte 2026-07-29, gdy `molique` na npm okazał się zamrożony na 1.7.7,
mimo że molique.dev było już przy 1.7.18 (11 wersji różnicy) - nikt nie
zauważył, bo `npm run build`/deploy strony **nigdy nie dotyka npm**, to
osobna, ręczna ścieżka.

- **`molique` (framework CSS)** - `npm/molique/` jest w `.gitignore`
  (generowany na nowo za każdym razem). Przed publikacją zawsze:
  `node tools/build-npm-molique.mjs` (synchronizuje wersję z korzeniem
  `package.json`, kopiuje CSS/SCSS/JS/img/flags, tłumaczy komentarze na
  EN). Zwróć uwagę na log `[en] Brakujące wpisy` - jeśli >0, część
  nowych komentarzy PL w SCSS nie ma jeszcze tłumaczenia w
  `tools/i18n-comments/dict.en.json`/`dict.de.json` (workflow: patrz
  `tools/i18n-comments/extract-worklist.mjs` + `apply-translations.mjs` -
  Claude odpowiada za jakość tłumaczeń, nie olewaj tego przy realnej
  publikacji, ale to osobny,
  większy krok niż sam release strony, więc nie musi blokować KAŻDEGO
  bumpa wersji, jeśli akurat nic nowego nie doszło w komentarzach).
- **`molique-jit` (silnik JIT + CLI)** - źródło w `tools/jit/package/`,
  wersjonowane bezpośrednio w jego `package.json` (osobna numeracja od
  frameworka, np. `0.2.1` - nie synchronizuj jej z wersją strony).
- **Publikacja wymaga 2FA/OTP z przeglądarki użytkownika - Claude NIE
  MOŻE tego zrobić samodzielnie.** Po przygotowaniu paczki (krok wyżej)
  zawsze kończy się na: "gotowe do `npm publish` - potrzebuję Twojego
  OTP, uruchom `cd npm/molique && npm publish` (lub `cd
  tools/jit/package && npm publish`) i podaj kod, albo zrób to sam".
- **Kiedy o tym pamiętać:** nie przy KAŻDYM bumpie `package.json` (byłoby
  to nadgorliwe dla drobnych poprawek), ale zawsze gdy zmiana dotyczy
  czegoś, co realnie trafia do paczki npm (CSS/SCSS/JS rdzenia, nie
  strona molique.dev) LUB gdy minęło kilka wersji odkąd ktoś ostatnio
  sprawdzał `npm view molique version` / `npm view molique-jit version`
  względem `package.json` w repo.

## Dyscyplina gita - repo bywa współdzielone przez równoległe sesje

W praktyce w tym repo działa czasem więcej niż jedna sesja Claude Code
naraz (ten sam katalog roboczy). Konsekwencje:

- Przed `git add` zawsze rób `git status --short` i staguj **wyłącznie
  pliki, które sam zmieniłeś** - nigdy `git add -A` / `git add .`.
  W tej sesji wielokrotnie w `tools/jit/` leżała nieukończona praca
  innej sesji (nowe generatory `make:*`, testy) - zostawiona nietknięta.
- Przed `git push` rób `git fetch origin` i sprawdź `git status --short
  --branch` - jeśli `ahead N` bez `diverged`, push będzie czystym
  fast-forwardem nawet jeśli ktoś inny scommitował coś pomiędzy Twoimi
  krokami. Jeśli jest `diverged`, zatrzymaj się i zapytaj, zanim
  cokolwiek zrobisz - nie rozwiązuj konfliktu samodzielnie bez pytania.
- Nigdy nie usuwaj/nie nadpisuj plików w `.claude/` - to lokalna
  konfiguracja narzędzia, nie część projektu.

## Znane pułapki (żeby nie powtarzać tych samych błędów)

- **Apostrof w `locals='{"..."}'`:** atrybut `locals` na
  `<include src="partials/head.html">` jest w pojedynczym cudzysłowie -
  angielski apostrof dzierżawczy ("molique's...") albo skrót ("it's",
  "don't") wewnątrz tego atrybutu łamie parsowanie JSON-a
  (`ReferenceError: 'x' is not defined` przy buildzie). Przed
  commitowaniem nowego `locals='...'` sprawdź, że w środku nie ma
  apostrofu - albo przeformułuj zdanie, nie próbuj escapować.
- **`css/molique-style.css` (i pozostałe bundle) nie kompilują się same
  z `npm run build`** - trzeba je ręcznie przekompilować po zmianie w
  `css/scss/**` przez `node node_modules/sass/sass.js
  css/scss/molique-style.scss css/molique-style.css --style=expanded
  --no-source-map` (a dla bundli modułowych analogicznie z właściwym
  plikiem wejściowym), ZANIM odpalisz `npm run build` - inaczej Vite
  skopiuje starą, nieaktualną wersję do `_site/`.
- **Kolor ikon/statusów:** zawsze warianty `-text` (`--success-text`,
  `--warning-text`, `--danger-text`, `--info-text`) dla tekstu/ikon na
  jasnym tle, nigdy gołe `--success`/`--warning` itd. - te drugie są
  dobrane pod tła, nie pod kontrast tekstu.
- **ŻADEN plik częściowy nie owija się we własny `@layer` - stan od
  v1.7.32, egzekwuj to przy każdym nowym pliku.** Warstwę nadaje
  WYŁĄCZNIE entry point (`molique-style*.scss`), owijając cały import.
  Dodatkowe owinięcie W ŚRODKU pliku tworzy podwarstwę
  (`components.components`) i psuje kaskadę w obie strony, zależnie od
  `!important`:
  - deklaracje zwykłe: podwarstwa PRZEGRYWA z nieowiniętymi regułami tej
    samej warstwy, niezależnie od kolejności i specyficzności (realny bug:
    `.stat-tile` ustawiało `flex-direction: row`, ale wygrywało `column`
    z nieowiniętego `.card` - ikona lądowała nad tekstem; v1.7.14);
  - deklaracje `!important`: kolejność warstw jest ODWRÓCONA, więc
    podwarstwa WYGRYWA - a przy okazji `!important` spoza jakiejkolwiek
    warstwy jest najsłabszy w całej kaskadzie autora. To drugie zgłosił
    użytkownik, któremu nadpisanie `.bg-dark` z własnego arkusza cicho
    przegrywało: różnica granatu #14162B vs #16233C, nie do wychwycenia
    okiem, znaleziona dopiero pomiarem pikseli.
  W v1.7.32 zdjęto owinięcie z 36 plików (skrypt + weryfikacja: wszystkie
  8 bundli identycznych po spłaszczeniu warstw, zero selektorów, dla
  których zmienił się zwycięzca). Nie przywracaj tego wzorca.
- **Konsekwencja dla projektów klienckich:** utilities molique mają
  `!important` wewnątrz warstwy, więc nadpisanie klasy narzędziowej ze
  zwykłego, bezwarstwowego arkusza NIE ZADZIAŁA - i to niezależnie od
  spłaszczenia. Właściwa droga to zmiana zmiennej (`--bg-dark-fixed`,
  `--footer-accent`, `--pricing-ribbon`, `--form-check-size`), a nie
  walka z kaskadą. Nowe utilities z zaszytą wartością zawsze wystawiaj
  jako token.
- **Goły `1fr` w CSS Grid to `minmax(auto, 1fr)`, nie `minmax(0, 1fr)`:**
  minimum toru liczy się z min-content potomków (dowolnie głęboko
  zagnieżdżonych), NIE z zera - `min-width: 0` + `overflow-x: hidden` na
  elemencie w tym torze tego NIE gwarantują (to inny mechanizm). Efekt
  bywa niewidoczny bez narzędzi deweloperskich, bo `html`/`body` w tym
  projekcie mają celowo `overflow-x: clip` (nie `scroll`, żeby nie psuć
  `position: sticky`) - więc zamiast scrollbara dostajesz ciche obcięcie
  treści. Zawsze `minmax(0, 1fr)` (albo `repeat(N, minmax(0, 1fr))`),
  gdy tor może zawierać cokolwiek o nieprzewidywalnej szerokości
  wewnętrznej (tabela, długa etykieta, pigułka zakładek). Naprawione w
  `.admin-layout` (v1.7.13) i `.tabs-pill` - sprawdź oba jako wzorzec.
