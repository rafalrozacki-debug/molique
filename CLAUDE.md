# molique — zasady pracy nad frameworkiem (ten plik, nie klient WP)

Ten plik dotyczy pracy nad **samym frameworkiem molique** (to repo:
silnik CSS, komponenty, strona molique.dev, pakiety npm, JIT/CLI).
Globalne zasady WordPress (namespaces, Service Locator, bezpieczeństwo
PHP itd. z `~/.claude/CLAUDE.md` / `c:\Praca\CLAUDE.md`) dotyczą
projektów *klienckich korzystających z* molique — większość z nich nie
ma tu zastosowania, bo to nie jest wtyczka WordPress.

Design-system dictionary (`~/.claude/molique.md`) obowiązuje też tutaj —
to źródło prawdy dla nazw klas przy pisaniu HTML/CSS w tym repo, dokładnie
tak samo jak w projektach klienckich.

## Definition of Done — każda nowa klasa/komponent publiczny

Ustalone 2026-07-28 po tym, jak `.stat-tile` (v1.7.11) trafił wszędzie
poza `llms.txt` i wymagał osobnego, drugiego wydania (v1.7.12) tylko po
to, żeby domknąć lukę. Poniższa tabela to lista kontrolna, nie
sugestia — przed uznaniem zmiany za skończoną, przejdź ją całą.

| # | Miejsce | Kiedy dotyczy |
|---|---|---|
| 1 | SCSS komponentu + rejestracja w `_components.scss` (lub właściwym aggregatorze) | zawsze |
| 2 | `tools/builder-i18n.data.js` — wpis EN/DE dla nowego pliku komponentu | zawsze (nowy plik `.scss` w `components/`) — **build się nie zbuduje bez tego**, to jedyny punkt-bramka na liście |
| 3 | `src/docs-*.html` (PL/EN/DE) — żywy przykład + tabela klas na właściwej stronie referencyjnej | zawsze (nowa klasa publiczna) |
| 4 | `src/docs-classes.html` (PL/EN/DE) — wiersz w cheat-sheecie | zawsze (nowa klasa publiczna) |
| 5 | `llms.txt` (jeden plik, PL) | zawsze (nowa klasa publiczna) — `docs-llms.html` regeneruje się z niego automatycznie, nic więcej nie trzeba ręcznie edytować |
| 6 | `~/.claude/molique.md` (globalny słownik użytkownika, poza tym repo) | zawsze (nowa klasa publiczna) — inaczej Claude pracujący nad projektem klienckim nie wie, że klasa istnieje |
| 7 | `src/examples-*.html` | TYLKO gdy komponent wchodzi w skład większej, realistycznej kompozycji (dashboard, strona ofertowa). Pojedyncze atomy (jak `.stat-tile`) NIE dostają własnej strony examples. |
| 8 | `src/docs-roadmap.html` (PL/EN/DE) | gdy zmiana zamyka istniejący punkt roadmapy (usuń go, zaktualizuj liczniki sekcji i sumę na górze) LUB rodzi nowy pomysł na przyszłość (dopisz) |
| 9 | `src/changelog.html` (PL/EN/DE) | zawsze — patrz zasada wersjonowania niżej |
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
  drobna redakcja opisu. NIE rób dla tego osobnego wydania — zostaw
  zmianę w working tree (lub zwykły commit bez bumpa wersji, bez
  deployu) i dolicz ją do NASTĘPNEJ realnej zmiany, kiedy i tak trzeba
  będzie robić pełny cykl. Jeśli nie wiadomo, kiedy nastąpi następna
  realna zmiana, a poprawka jest publicznie widoczna (np. zła informacja
  w dokumentacji) — zapytaj, zamiast zgadywać.

## Dyscyplina gita — repo bywa współdzielone przez równoległe sesje

W praktyce w tym repo działa czasem więcej niż jedna sesja Claude Code
naraz (ten sam katalog roboczy). Konsekwencje:

- Przed `git add` zawsze rób `git status --short` i staguj **wyłącznie
  pliki, które sam zmieniłeś** — nigdy `git add -A` / `git add .`.
  W tej sesji wielokrotnie w `tools/jit/` leżała nieukończona praca
  innej sesji (nowe generatory `make:*`, testy) — zostawiona nietknięta.
- Przed `git push` rób `git fetch origin` i sprawdź `git status --short
  --branch` — jeśli `ahead N` bez `diverged`, push będzie czystym
  fast-forwardem nawet jeśli ktoś inny scommitował coś pomiędzy Twoimi
  krokami. Jeśli jest `diverged`, zatrzymaj się i zapytaj, zanim
  cokolwiek zrobisz — nie rozwiązuj konfliktu samodzielnie bez pytania.
- Nigdy nie usuwaj/nie nadpisuj plików w `.claude/` — to lokalna
  konfiguracja narzędzia, nie część projektu.

## Znane pułapki (żeby nie powtarzać tych samych błędów)

- **Apostrof w `locals='{"..."}'`:** atrybut `locals` na
  `<include src="partials/head.html">` jest w pojedynczym cudzysłowie —
  angielski apostrof dzierżawczy ("molique's...") albo skrót ("it's",
  "don't") wewnątrz tego atrybutu łamie parsowanie JSON-a
  (`ReferenceError: 'x' is not defined` przy buildzie). Przed
  commitowaniem nowego `locals='...'` sprawdź, że w środku nie ma
  apostrofu — albo przeformułuj zdanie, nie próbuj escapować.
- **`css/molique-style.css` (i pozostałe bundle) nie kompilują się same
  z `npm run build`** — trzeba je ręcznie przekompilować po zmianie w
  `css/scss/**` przez `node node_modules/sass/sass.js
  css/scss/molique-style.scss css/molique-style.css --style=expanded
  --no-source-map` (a dla bundli modułowych analogicznie z właściwym
  plikiem wejściowym), ZANIM odpalisz `npm run build` — inaczej Vite
  skopiuje starą, nieaktualną wersję do `_site/`.
- **Kolor ikon/statusów:** zawsze warianty `-text` (`--success-text`,
  `--warning-text`, `--danger-text`, `--info-text`) dla tekstu/ikon na
  jasnym tle, nigdy gołe `--success`/`--warning` itd. — te drugie są
  dobrane pod tła, nie pod kontrast tekstu.
