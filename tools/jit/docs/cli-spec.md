# Molique CLI Specification

> Stan po Fazie 5: zaimplementowane i ręcznie zweryfikowane end-to-end
> (`tools/jit/package/src/cli.ts`, `bin: molique-jit`). Ta specyfikacja
> okazała się w praktyce bardzo bliska pierwotnemu planowi - komendy i
> aliasy poniżej odpowiadają dokładnie temu, co powstało. Dopisano
> wyłącznie brakujący wcześniej schemat `molique.config.mjs` (sekcja 4) i
> doprecyzowano mechanizm lokalizacji (sekcja 5).

Ten dokument opisuje interfejs linii poleceń oparty na Node.js. Pełni on rolę głównego silnika budującego styl z trybem nasłuchującym zmian (Watch). Narzędzie natywnie wspiera środowiska wielojęzyczne.

Nazwa binarki: `molique-jit` (nie samo `molique`) - zgodna z nazwą pakietu
npm, żeby uniknąć kolizji z ewentualnymi innymi narzędziami o krótszej
nazwie.

## 1. Komendy Główne i Aliasy

| Angielski (Standard) | Polski Alias       | Niemiecki Alias      | Akcja                              |
| :------------------- | :----------------- | :------------------- | :--------------------------------- |
| `molique init`       | `molique start`    | `molique start`      | Tworzy bazowy plik konfiguracyjny  |
| `molique build`      | `molique buduj`    | `molique bauen`      | Kompiluje CSS do pliku wyjściowego |
| `molique watch`      | `molique obserwuj` | `molique beobachten` | Nasłuchuje zmian na żywo           |
| `--minify` / `-m`    | `--minifikuj`      | `--minifizieren`     | Kompresja (usuwa białe znaki)      |
| `--config` / `-c`    | `--konfiguracja`   | `--konfiguration`    | Wskazuje własny plik `.config`     |

## 2. Działanie komend

### `init` / `start`

- **Zachowanie:** Zrzuca w głównym folderze plik `molique.config.mjs` ze wzorcową konfiguracją i predefiniowaną safelistą dla frameworka (niezbędną dla JS).

### `build` / `buduj` / `bauen`

- **Zachowanie:** Skanuje cały glob podany w sekcji `content` z pliku konfiguracyjnego. Ładuje moduły, generuje ostateczny CSS, opcjonalnie przepuszcza przez minifikator i zapisuje na dysk. Standard wyjścia: Exit Code 0 (sukces) / 1 (błąd).

### `watch` / `obserwuj` / `beobachten`

- **Zachowanie:** Tryb deweloperski nasłuchujący modyfikacji plików (oparty na bibliotece `chokidar`, wersja 3.x - v4 usunęła natywne wsparcie dla wzorców glob, potrzebne tutaj). JIT wykonuje _Debounce_ (~50ms) przed przebudową, re-skanuje tylko zmieniony plik i aktualizuje Context Cache, generując ostateczny plik w milisekundach. Działa dla wszystkich `targets` z configu jednocześnie (osobny watcher na każdy), zamyka się na `Ctrl+C`.

## 3. Przykłady Użycia

Wszystkie komendy można ze sobą dowolnie łączyć w wybranych językach:

```bash
# Standard
npx molique-jit build --minify
npx molique-jit watch --config ./custom.config.mjs

# Język polski
npx molique-jit buduj --minifikuj
npx molique-jit obserwuj --konfiguracja ./custom.config.mjs

# Język niemiecki
npx molique-jit bauen --minifizieren
npx molique-jit beobachten
```

## 4. Schemat `molique.config.mjs`

Zwykły moduł ESM z domyślnym eksportem obiektu (źródło prawdy:
`tools/jit/package/src/config.ts`):

```typescript
export interface ConfigTarget {
  content: string[];
  output: string;
}

export interface MoliqueConfig {
  content?: string[]; // domyslnie ['**/*.html', '**/*.php']
  output?: string; // domyslnie 'css/molique-jit.css'
  safelist?: string[]; // WLASNE dynamiczne klasy projektu (np. `badge-<?= $status ?>`)
  minify?: boolean; // patrz uwaga nizej
  targets?: ConfigTarget[]; // patrz "Wiele celow" nizej
}
```

- **`safelist`** to lista TYLKO klas specyficznych dla projektu konsumenta.
  Klasy runtime'owe samego molique (toasty, karuzela, lightbox, sidebar
  itd.) dołączane są automatycznie z wbudowanej safelisty pakietu (tier
  `runtime.standard` z `purgecss.safelist.cjs`) - tej listy NIE trzeba
  dublować.
- **`minify`**: w obecnej implementacji efektywnie no-op - dane źródłowe
  (chunki komponentów, warstwa utilities) są już skompresowane u źródła
  (`tools/gen-chunks.js`, `--style=compressed`), więc nie ma dodatkowych
  białych znaków do usunięcia. Pole zostaje w schemacie dla zgodności z
  tą specyfikacją i na wypadek przyszłych źródeł danych.
- **Wiele celów (`targets`)**: gdy podane i niepuste, ZASTĘPUJE pola
  `content`/`output` powyżej. Każdy element to niezależny build - typowy
  przypadek: osobny, dedykowany (mały) plik CSS dla landing page
  kampanii reklamowej, obok głównego pliku strony:

  ```javascript
  export default {
    targets: [
      { content: ['src/**/*.html'], output: 'css/molique-jit.css' },
      { content: ['landing-kampania.html'], output: 'css/landing-kampania.css' },
    ],
  };
  ```

  `molique-jit build`/`watch` budują/nasłuchują KAŻDY target niezależnie -
  plik `landing-kampania.css` zawiera wyłącznie klasy użyte w
  `landing-kampania.html`, nie całą resztę strony.

`molique-jit init` (alias `start`) tworzy plik startowy z komentarzami
wyjaśniającymi każde pole (`INIT_TEMPLATE` w `config.ts`) - odmawia
nadpisania, jeśli `molique.config.mjs` już istnieje.

## 5. Mechanizm lokalizacji (implementacja)

Aliasy PL/DE komend i flag NIE są realizowane przez wbudowany mechanizm
aliasów biblioteki CLI (Commander) - różne nazwy per język dla TEJ SAMEJ
flagi to niewygodna gimnastyka z jego API. Zamiast tego `process.argv`
jest TŁUMACZONE na kanoniczne angielskie nazwy komend/flag PRZED
przekazaniem do Commandera (`translateArgv()` w `cli.ts`) - biblioteka
zna tylko jeden, angielski wariant każdej komendy i flagi. Prostsze,
łatwiejsze do jednostkowego przetestowania niż poleganie na wewnętrznej
obsłudze aliasów Commandera.

## 6. Komendy Scaffoldingowe (`make:*`)

> Sekcja rozbudowywana przyrostowo, po jednej komendzie na raz, w miare
> przerabiania kazdego `src/cli/make-*.ts` na ksztalt collect/render (plan
> rozwoju CLI, Etap B/C). Zastepuje `scaffolding-spec.md`, ktorego opis
> `make:page`/`make:component`-z-pod-trybami zostal porzucony na rzecz
> jednej oddzielnej komendy na rodzine komponentow.

Kazda komenda scaffoldingowa wspiera TRZY niezalezne tryby zbierania
odpowiedzi, ktore mozna laczyc:

1. **Interaktywny** (domyslny) - pytania w terminalu (`@inquirer/prompts`).
2. **`-n, --count <liczba>`** - tam, gdzie komenda generuje liste o
   zmiennej dlugosci, pomija TYLKO pytanie "ile?"; reszta pytan zostaje
   interaktywna. Implementacja: `promptCount()` w `cli/prompts.ts`.
3. **`--answers <json>` / `--answers-file <path>`** - pomija WSZYSTKIE
   pytania na raz, podajac gotowy obiekt odpowiedzi (ksztalt
   udokumentowany per komenda ponizej). Wynik trafia na stdout, chyba ze
   dodano `-o, --out <path>` - wtedy zapisuje do pliku bez pytania "konsola
   czy plik?". Gdy podano oba `-n/--count` i `--answers`/`--answers-file`,
   wygrywa JSON (juz koduje liczbe elementow). Implementacja:
   `loadAnswers()` w `cli/answers.ts`, `outputResult()` w `cli/output.ts`.

### `make:table` (aliasy: `zrob:tabele`, `mache:tabelle`)

Generuje tabele B2B (`.table-wrapper > table.table[...] > thead + tbody`)
z automatycznym `data-label` na komorkach (mechanizm mobile-first
`.table-cards`).

```typescript
interface TableAnswers {
  columns: string[]; // nazwy kolumn, w kolejnosci
  rowCount: number; // liczba przykladowych wierszy (0 = pusty tbody)
  size: '' | 'table-sm' | 'table-lg';
  theadVariant: '' | 'thead-light' | 'thead-dark' | 'thead-primary';
  striped: boolean; // .table-striped
  hover: boolean; // .table-hover
  mobileMode: 'table-cards' | 'table-cards-always' | ''; // '' = klasyczny scroll, bez kart
}
```

```bash
npx molique-jit make:table -n 5
npx molique-jit make:table --answers '{"columns":["Nazwa","Status"],"rowCount":2,"size":"","theadVariant":"thead-dark","striped":true,"hover":true,"mobileMode":"table-cards"}'
npx molique-jit make:table --answers-file ./table.json -o components/table.html
```

### `make:popover` (aliasy: `zrob:popover`, `mache:popover`)

Generuje menu kontekstowe `.popover-context` (CSS Anchor Positioning +
Popover API, auto-flip nad przycisk blisko dolnej krawedzi i bottom sheet
na mobile - zero dodatkowego markupu do obu).

```typescript
interface PopoverAnswers {
  triggerLabel: string;
  triggerColor: 'btn-secondary' | 'btn-primary' | 'btn-light' | 'btn-outline-soft';
  triggerIcon: string; // nazwa ikony z img/icons-sprite.svg, '' = brak
  id: string; // ID popovera (unikalne na stronie) - ANCHOR_NAME wyprowadzany z niego automatycznie
  items: Array<{
    label: string;
    icon: string; // '' = brak ikony
    danger: boolean; // akcja destrukcyjna - dostaje .text-danger + dzielacy <hr> przed soba (raz, przed PIERWSZA taka pozycja)
  }>;
}
```

```bash
npx molique-jit make:popover -n 5
npx molique-jit make:popover --answers '{"triggerLabel":"Opcje","triggerColor":"btn-secondary","triggerIcon":"ph-gear","id":"ctxMenu1","items":[{"label":"Podglad","icon":"ph-eye","danger":false},{"label":"Usun","icon":"ph-trash","danger":true}]}'
```

### `make:modal` (aliasy: `zrob:modal`, `mache:modal`)

Generuje natywny `<dialog class="modal-dialog">` + przycisk otwierajacy
(`showModal()`, zero wlasnego JS). Trzy WARIANTY, kazdy z wlasnym ksztaltem
odpowiedzi (pole `"type"` w JSON-ie wybiera wariant) - wszystkie trzy maja
wspolne pola `triggerLabel`/`triggerVariant` (przycisk otwierajacy).

```typescript
type ModalAnswers =
  | { type: 'standard'; id: string; title: string; body: string; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' }
  | { type: 'confirm'; id: string; title: string; message: string; cancelLabel: string; confirmLabel: string; confirmVariant: 'btn-danger' | 'btn-primary' | 'btn-success'; icon: 'ph-warning' | 'ph-question' | 'ph-trash' | 'ph-info'; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' }
  | { type: 'context'; id: string; title: string; action1Label: string; action1Icon: string; action2Label: string; action2Icon: string; action2Danger: boolean; triggerLabel: string; triggerVariant: 'btn-primary' | 'btn-secondary' | 'btn-danger' };
```

```bash
npx molique-jit make:modal --answers '{"type":"standard","id":"myModal","title":"Tytul","body":"Tresc...","triggerLabel":"Otworz","triggerVariant":"btn-primary"}'
npx molique-jit make:modal --answers '{"type":"confirm","id":"delModal","title":"Na pewno?","message":"Nie mozna cofnac.","cancelLabel":"Anuluj","confirmLabel":"Usun","confirmVariant":"btn-danger","icon":"ph-trash","triggerLabel":"Usun","triggerVariant":"btn-danger"}'
```

### `make:chart` (aliasy: `zrob:wykres`, `mache:diagramm`)

Cztery WARIANTY (pole `"type"`): Radial Bar, Funnel (pionowy lejek),
Pipeline (poziomy proces CRM), Stock Bar. `-n/--count` dotyczy WYLACZNIE
wariantu Stock Bar (liczba wypelnionych segmentow, 0-5).

```typescript
type ChartAnswers =
  | { type: 'radial'; value: number; color: 'primary' | 'success' | 'danger' | 'warning' | 'info' }
  | { type: 'funnel'; labels: string[] }
  | { type: 'pipeline'; steps: string[]; activeLabel: string } // '' = brak aktywnego kroku
  | { type: 'stock-bar'; filled: number; variant: '' | 'stock-bar-success' | 'stock-bar-warning' | 'stock-bar-danger'; ariaLabel: string };
```

```bash
npx molique-jit make:chart --answers '{"type":"radial","value":75,"color":"success"}'
npx molique-jit make:chart --answers '{"type":"funnel","labels":["Odwiedziny","Rejestracje","Zakupy"]}'
npx molique-jit make:chart --answers '{"type":"pipeline","steps":["Nowy","Kontakt","Umowa"],"activeLabel":"Kontakt"}'
npx molique-jit make:chart -n 4   # Stock Bar - pyta interaktywnie o reszte, "ile segmentow?" pominiete
```

### `make:widget` (aliasy: `zrob:widget`, `mache:widget`)

Cztery NIEPOWIAZANE ze soba widgety pod jedna komenda: Speed Dial,
Before/After Slider, Stepper, Share Bar. `-n/--count` dotyczy WYLACZNIE
liczby akcji w Speed Dial.

```typescript
type WidgetAnswers =
  | { type: 'speed-dial'; mainSymbol: string; actions: Array<{ label: string; icon: string }> }
  | { type: 'before-after'; afterImg: string; afterAlt: string; beforeImg: string; beforeAlt: string; maxWidth: string; aspectRatio: string }
  | { type: 'stepper'; variant: 'classic' | 'numbered'; labels: string[]; activeLabel: string }
  | { type: 'share-bar'; networks: string[] }; // podzbior 'facebook'|'twitter'|'linkedin'|'whatsapp'|'native', w dowolnej kolejnosci
```

```bash
npx molique-jit make:widget -n 5   # Speed Dial - "ile akcji?" pominiete
npx molique-jit make:widget --answers '{"type":"stepper","variant":"numbered","labels":["Wymiary","Konstrukcja","Dach"],"activeLabel":"Konstrukcja"}'
npx molique-jit make:widget --answers '{"type":"share-bar","networks":["facebook","native"]}'
```

### `make:layout` (aliasy: `zrob:uklad`, `mache:layout`)

Cztery PLASKIE warianty (mimo ze w trybie interaktywnym Hero ma wlasny
pod-wybor Prosty/Cutout, w `--answers` wybiera sie od razu docelowy typ):
`admin`, `hero-simple`, `hero-cutout`, `bento`. `-n/--count` dotyczy
pozycji menu (`admin`) / breadcrumb (`hero-simple`) / kafelkow (`bento`) -
`hero-cutout` nie ma listy o zmiennej dlugosci.

```typescript
type LayoutAnswers =
  | { type: 'admin'; floating: boolean; logo: string; items: string[] } // PIERWSZA pozycja dostaje .is-active automatycznie
  | { type: 'hero-simple'; title: string; imageUrl: string; overlayColorClass: string; overlayOpacityClass: string; breadcrumbLabels: string[] } // OSTATNIA = biezaca strona, auto is-active + aria-current
  | { type: 'hero-cutout'; title: string; message: string; imageUrl: string; imageAlt: string; cutoutVariant: 'cutout-md-br' | 'cutout-md-bl' | 'cutout-md-tr' | 'cutout-md-tl' }
  | { type: 'bento'; tiles: Array<{ label: string; size: 'normal' | 'wide' | 'tall' | 'big' }> };
```

```bash
npx molique-jit make:layout -n 5   # Admin Dashboard - "ile pozycji menu?" pominiete
npx molique-jit make:layout --answers '{"type":"bento","tiles":[{"label":"Kafelek 1","size":"big"},{"label":"Kafelek 2","size":"wide"}]}'
npx molique-jit make:layout --answers '{"type":"hero-cutout","title":"Zbuduj to","message":"Opis","imageUrl":"img/hero-bg.jpg","imageAlt":"Tlo","cutoutVariant":"cutout-md-br"}'
```

### `make:form` (aliasy: `zrob:formularz`, `mache:formular`)

W odroznieniu od pozostalych komend - BEZ dyskryminujacej unii wariantow.
Jeden plaski `FormAnswers`: styl podstawowych pol + lista pol + do TRZECH
niezaleznie wlaczalnych modulow (pole `undefined`/pominiete = modul
niedodany). `-n/--count` dotyczy liczby podstawowych pol.

```typescript
interface FormAnswers {
  style: 'floating' | 'classic';
  fields: Array<{ label: string; type: 'text' | 'email' | 'number' | 'tel' | 'textarea'; required: boolean }>;
  selectSearch?: { label: string; placeholder: string; fieldName: string; options: string[] };
  customSelect?: { label: string; placeholder: string; categories: Array<{ name: string; items: string[] }> };
  fileUpload?: { animated: boolean; title: string; subtitle: string; fieldName: string };
  submitLabel: string;
}
```

```bash
npx molique-jit make:form -n 5
npx molique-jit make:form --answers '{"style":"floating","fields":[{"label":"Imie","type":"text","required":true}],"fileUpload":{"animated":true,"title":"Upusc plik","subtitle":"lub kliknij","fieldName":"plik"},"submitLabel":"Wyslij"}'
```

### `make:nav` (aliasy: `zrob:nawigacje`, `mache:nav`) - ostatnia z 8 podstawowych komend

Jeden plaski `NavAnswers`: wariant tla (Standard/Transparent/Pastylka -
roznia sie WYLACZNIE klasa/atrybutem `style` na tym samym `<nav>`, jeden
stub) + pozycje menu + do TRZECH niezaleznie wlaczalnych modulow (Mega
Menu / Theme Switch / Language Switch). `-n/--count` dotyczy WYLACZNIE
zwyklych pozycji menu (bez Mega Menu).

```typescript
interface NavAnswers {
  variant: 'standard' | 'transparent' | 'pill';
  pillBg?: string;          // tylko variant === 'pill', po dostosowaniu kolorow
  pillBgScrolled?: string;  // jw., opcjonalne nawet wtedy
  brand: string;
  toggleId: string;         // ID checkboxa offcanvas - MUSI byc unikalne na stronie
  items: string[];
  megaMenu?: { title: string; groups: Array<{ title: string; links: string[] }> };
  themeSwitch: boolean;
  languageSwitch?: { languages: Array<{ flagCode: string; label: string }> }; // PIERWSZY jezyk = aktywny
}
```

```bash
npx molique-jit make:nav -n 5
npx molique-jit make:nav --answers '{"variant":"pill","pillBg":"#123456","brand":"Logo","toggleId":"navToggle","items":["Start"],"themeSwitch":true,"languageSwitch":{"languages":[{"flagCode":"pl","label":"Polski"},{"flagCode":"gb","label":"English"}]}}'
```

---

**Wszystkie 8 pierwotnie zaplanowanych komend `make:*` maja juz podzial na
`collect`/`render`, tryb `--answers`/`--answers-file` i wlasny plik testow
w `tools/jit/tests/scaffolding-*.test.mjs`** - Etap B planu rozwoju CLI
jest kompletny. Kolejne generatory (Etap C: `make:badge`, `make:progress`,
`make:accordion`, `make:pagination`) dokladaja sie do tej listy ponizej, w
miare powstawania.

### `make:badge` (aliasy: `zrob:odznake`, `mache:abzeichen`)

Generuje pojedyncza pigulke statusu (`.badge.badge-<kolor>`). Najprostszy
z generatorow - jeden stub, zero list, zbudowany od razu w ksztalcie
docelowym (Etap C).

```typescript
interface BadgeAnswers {
  text: string;
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
}
```

```bash
npx molique-jit make:badge --answers '{"text":"Nowość","color":"success"}'
```

### `make:progress` (aliasy: `zrob:pasek-postepu`, `mache:fortschritt`)

Generuje pasek postepu z etykieta (`.progress-label` + `.progress >
.progress-bar`). Kolor NIE ma wlasnych klas komponentu - dokleja sie
ogolna klase narzedziowa `bg-<kolor>` (dokladnie jak realny przyklad w
`examples-progress-bars.html`); `primary` jest juz kolorem domyslnym
wbudowanym w baze `.progress-bar`, wiec nie dostaje zadnej dodatkowej
klasy.

```typescript
interface ProgressAnswers {
  label: string;
  value: number; // 0-100
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
}
```

```bash
npx molique-jit make:progress --answers '{"label":"Optymalizacja SEO","value":60,"color":"success"}'
```

### `make:accordion` (aliasy: `zrob:akordeon`, `mache:akkordeon`)

Generuje akordeon FAQ na natywnym `<details>`/`<summary>` - zero JS,
zero atrybutu `open` domyslnie (jak w realnym przykladzie). `-n/--count`
dotyczy liczby paneli.

```typescript
interface AccordionAnswers {
  groupName: string; // atrybut "name" - grupuje panele (przegladarka pilnuje "tylko jeden otwarty naraz")
  panels: Array<{ question: string; answer: string }>;
}
```

```bash
npx molique-jit make:accordion -n 5
npx molique-jit make:accordion --answers '{"groupName":"faq","panels":[{"question":"Jak zainstalowac?","answer":"Podepnij CSS."}]}'
```

### `make:pagination` (aliasy: `zrob:paginacje`, `mache:seitenzahlen`) - ostatnia z pierwszej fali (Etap C)

Generuje pasek paginacji (`.pagination` + opcjonalnie `.pagination-modern`
OBOK niej, nie zamiast). "Poprzednia"/"Nastepna" to zwykle `.page-item`,
automatycznie `is-disabled` na skraju zakresu stron. `-n/--count` dotyczy
calkowitej liczby stron (limit 12 - realny komponent nie ma wzorca
obcinania/elipsy dla wiekszej liczby).

```typescript
interface PaginationAnswers {
  modern: boolean;
  totalPages: number;
  currentPage: number; // 1-based
  prevLabel: string;
  nextLabel: string;
}
```

```bash
npx molique-jit make:pagination -n 8
npx molique-jit make:pagination --answers '{"modern":true,"totalPages":5,"currentPage":3,"prevLabel":"Poprzednia","nextLabel":"Następna"}'
```

---

**Pierwsza fala nowych generatorow (Etap C) jest kompletna: `make:badge`,
`make:progress`, `make:accordion`, `make:pagination`** - kazdy zbudowany
od razu w docelowym ksztalcie (collect/render, `--answers`/
`--answers-file`, wlasny plik testow). Lacznie 12 komend `make:*`.
Kolejne komponenty (tabs, carousel, dropdown, pricing-table, timeline,
testimonials, tooltips, lightbox, status-dots/icons, data-rows,
list-group, counters, breadcrumbs samodzielne, toasts, code-preview,
e-commerce, blog) czekaja na kolejna fale planowania.
