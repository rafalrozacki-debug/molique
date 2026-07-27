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
| `molique help`       | `molique pomoc`    | `molique hilfe`      | Wypisuje pomoc (dla calego CLI albo jednej komendy) |
| `--minify` / `-m`    | `--minifikuj`      | `--minifizieren`     | Kompresja (usuwa białe znaki)      |
| `--config` / `-c`    | `--konfiguracja`   | `--konfiguration`    | Wskazuje własny plik `.config`     |
| `--version` / `-V`   | *(bez aliasu - uniwersalny skrot)* | *(jw.)* | Wypisuje wersje zainstalowanego pakietu |

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
   wygrywa JSON (juz koduje liczbe elementow). Blad w JSON-ie (`--answers`
   badz plik z `--answers-file`) daje czytelny komunikat wskazujacy KTORA
   flaga zawiodla, nie goly `SyntaxError` z V8. Implementacja:
   `loadAnswers()` w `cli/answers.ts`, `outputResult()` w `cli/output.ts`.

Aliasy PL/DE dla tych flag (pelna spojnosc z aliasami komend z Sekcji 1):

| Angielski | Polski | Niemiecki |
| :-- | :-- | :-- |
| `--count` / `-n` | `--liczba` | `--anzahl` |
| `--answers` | `--odpowiedzi` | `--antworten` |
| `--answers-file` | `--plik-odpowiedzi` | `--antwortdatei` |
| `--out` / `-o` | `--wyjscie` | `--ausgabe` |

Krotkie warianty (`-n`, `-o`) NIE maja osobnych aliasow PL/DE - to
pojedyncze litery, jednakowe niezaleznie od jezyka.

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
na mobile - zero dodatkowego markupu do obu). `triggerColor` implikuje
juz `.btn` we frameworku - baza nie jest dopisywana osobno.

```typescript
interface PopoverAnswers {
  triggerLabel: string;
  triggerColor: 'btn-secondary' | 'btn-primary' | 'btn-light' | 'btn-outline-primary btn-outline-soft';
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

### `make:tooltip` (aliasy: `zrob:podpowiedz`, `mache:tooltip`)

Generuje dymek podpowiedzi w 100% CSS (`.tooltip-element`, tresc dymku z
`attr(data-tooltip)`, zero JS).

```typescript
interface TooltipAnswers {
  text: string;    // widoczny tekst
  tooltip: string; // tresc dymku
}
```

```bash
npx molique-jit make:tooltip --answers '{"text":"PUM","tooltip":"Powierzchnia Uzytkowa Mieszkalna"}'
```

### `make:alert` (aliasy: `zrob:komunikat`, `mache:hinweis`)

Generuje statyczny komunikat w tresci strony (`.alert.alert-<kolor>`).
BEZ przycisku zamykania i BEZ JS - to `.toast` znika automatycznie,
`.alert` w ogole nie ma tej mechaniki (dokumentacja realnego przykladu
wprost to rozroznia).

```typescript
interface AlertAnswers {
  message: string;
  color: 'info' | 'success' | 'danger' | 'warning';
}
```

```bash
npx molique-jit make:alert --answers '{"message":"Zmiany zostaly zapisane pomyslnie.","color":"success"}'
```

### `make:dropdown` (aliasy: `zrob:rozwijane`, `mache:dropdown`)

Dwie STRUKTURALNIE rozne wersje (pole `"type"`): Klasyczny na
`<details>`/`<summary>` (navbar) i Popover w top layer (zalecany poza
navbarem - tabele, karty, modale, nie przycinany przez `overflow`).
`.dropdown-menu-end` (wyrownanie do prawej) dziala identycznie w obu.
`triggerClass` to SAMA klasa koloru (np. `btn-outline-dark`) - implikuje
juz `.btn` we frameworku (`_buttons.scss`, "IMPLIKACJA .btn"), wiec baza
nie jest dopisywana osobno.

```typescript
type DropdownAnswers =
  | { type: 'details'; triggerLabel: string; triggerClass: string; alignEnd: boolean; items: Array<{ label: string; danger: boolean }> }
  | { type: 'popover'; triggerLabel: string; triggerClass: string; alignEnd: boolean; id: string; items: Array<{ label: string; danger: boolean }> };
```

```bash
npx molique-jit make:dropdown -n 5
npx molique-jit make:dropdown --answers '{"type":"popover","triggerLabel":"Opcje","triggerClass":"btn-outline-dark","alignEnd":false,"id":"pop-menu-1","items":[{"label":"Edytuj","danger":false},{"label":"Usun","danger":true}]}'
```

### `make:tabs` (aliasy: `zrob:zakladki`, `mache:tabs`)

Zakladki na Radio Hack (ukryte `input[radio].tab-input` steruja
widocznoscia `.tab-pane` przez pozycyjne `:nth-of-type()`, zero JS). Dwa
warianty (`type`) maja IDENTYCZNY ksztalt odpowiedzi (roznia sie tylko
renderowaniem - `pill` dostaje `.tabs-pill`, `style="--tab-count"` i pusty
`.tabs-pill-indicator`). WAZNE: `.tabs-pill` ma WLASNY, mniejszy limit w
SCSS (max 8 zakladek) nizszy niz klasyczny wariant (max 10) - `-n/--count`
respektuje wlasciwy limit w zaleznosci od wybranego wariantu.

```typescript
interface TabsAnswers {
  type: 'classic' | 'pill';
  groupName: string; // atrybut "name" wspolny dla wszystkich input[radio]
  tabs: Array<{ label: string; content: string }>;
}
```

```bash
npx molique-jit make:tabs -n 3
npx molique-jit make:tabs --answers '{"type":"pill","groupName":"my-pill-tabs","tabs":[{"label":"Dzien","content":"Statystyki z dnia."},{"label":"Tydzien","content":"Statystyki z tygodnia."}]}'
```

### `make:status-dot` (aliasy: `zrob:kropke-statusu`, `mache:statuspunkt`)

Generuje kropke statusu (`.status-dot.status-<stan>`), opcjonalnie z
pulsujacym pierscieniem (`.status-ping`, ta sama warstwa co Stock Bar w
`make:chart`).

```typescript
interface StatusDotAnswers {
  text: string;
  status: 'draft' | 'pending' | 'done' | 'danger';
  ping: boolean;
}
```

```bash
npx molique-jit make:status-dot --answers '{"text":"Live","status":"done","ping":true}'
```

### `make:counter` (aliasy: `zrob:licznik`, `mache:zaehler`)

Generuje animowany licznik (`.counter > .counter-value + .counter-title`).
Tresc `.counter-value` to SAMA liczba docelowa - `js/modules/molique-counters.js`
parsuje ja przez `parseFloat()` i animuje liczenie od 0 po wejsciu w viewport
(IntersectionObserver). Opcjonalne `data-prefix`/`data-suffix` (np. "$"/"+")
dopisuja sie do wyniku bez zmiany logiki liczenia. Brak dedykowanej strony
przykladow dla samego `.counter` - grunt to SCSS + faktyczne zachowanie JS.

```typescript
interface CounterAnswers {
  value: number;
  title: string;
  prefix: string; // '' = brak
  suffix: string; // '' = brak
}
```

```bash
npx molique-jit make:counter --answers '{"value":1500,"title":"Zadowolonych klientow","prefix":"","suffix":"+"}'
```

### `make:timeline` (aliasy: `zrob:os-czasu`, `mache:zeitleiste`)

Trzy STRUKTURALNIE rozne warianty (pole `"type"`): `large` (ikony/litery w
`.timeline-badge`), `numbered` (CSS SAM dolicza numer przez `counter()`,
zero dodatkowego markupu), `labeled` (CSS Grid, data po lewej -
`.timeline-line` u ostatniej pozycji chowa sama CSS przez `:last-child`,
generator zawsze generuje ja dla kazdej pozycji).

```typescript
type TimelineAnswers =
  | { type: 'large'; items: Array<{ badge: string; title: string; description: string }> }
  | { type: 'numbered'; items: Array<{ title: string; description: string }> }
  | { type: 'labeled'; items: Array<{ dateLabel: string; timeLabel: string; nodeColor: '' | 'primary' | 'success' | 'danger'; title: string; description: string }> };
```

```bash
npx molique-jit make:timeline -n 4
npx molique-jit make:timeline --answers '{"type":"labeled","items":[{"dateLabel":"30.06.2026","timeLabel":"16:44","nodeColor":"success","title":"Rafal Rozacki","description":"Przyjecie towaru."}]}'
```

### `make:carousel` (aliasy: `zrob:karuzele`, `mache:karussell`)

Dwa STRUKTURALNIE rozne warianty (pole `"type"`): Podstawowa (karty z
tekstem, kolor tla per slajd) i Hero/Background Sync (tlo pod slajdem
przez `data-bg`, naklada przyciemniajaca). Natywny `scroll-snap` - zero JS
do samego przewijania. WAZNE: kropki paginacji (`.carousel-dots`) generuje
`js/modules/molique-carousel.js` SAM, gdy slajdow > 1 - generator ich NIE
dopisuje (nie ma ich w zrodle realnego przykladu, mimo ze widac je w
renderowanym podgladzie).

```typescript
type CarouselAnswers =
  | { type: 'basic'; maxWidth: string; slides: Array<{ title: string; text: string; color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' }> }
  | { type: 'bg-sync'; height: string; slides: Array<{ bg: string; heading: string }> };
```

```bash
npx molique-jit make:carousel -n 4
npx molique-jit make:carousel --answers '{"type":"bg-sync","height":"400px","slides":[{"bg":"img/architektura.jpg","heading":"Architektura"}]}'
```

### `make:lightbox` (aliasy: `zrob:lightbox`, `mache:lightbox`)

Caly modal (`.lightbox-overlay`, strzalki, licznik) BUDUJE
`js/modules/molique-lightbox.js` - generator dopisuje tylko `data-lightbox`
+ `data-gallery` do zwyklych linkow ze zdjeciami, zero markupu modala.

```typescript
interface LightboxAnswers {
  gallery: string; // atrybut data-gallery - laczy zdjecia w jedna galerie
  items: Array<{ thumbImg: string; fullImg: string; alt: string }>;
}
```

```bash
npx molique-jit make:lightbox -n 5
npx molique-jit make:lightbox --answers '{"gallery":"realizacje","items":[{"thumbImg":"img/m1.jpg","fullImg":"img/p1.jpg","alt":"Foto 1"}]}'
```

### `make:card` (aliasy: `zrob:karte`, `mache:karte`)

Piec STRUKTURALNIE roznych wariantow (pole `"type"`, splaszczone do
top-level zgodnie z konwencja z `make:layout`/`make:timeline`/
`make:carousel`): Klasyczna (header/body/footer), Featured Box (cecha
produktu z ikona, kolor primary nie dodaje ani `style`, ani klasy koloru -
tylko warianty inne niz primary dostaja `style="border-top-color: var(--
<kolor>)"` + `bg-<kolor> text-white` na ikonie), Thumb Info Center (zdjecie
+ naklada wysrodkowana, ikona lupy, `text-6`) i Thumb Info Bottom (naklada
przy dole, opcjonalna plakietka `.badge`, `text-7`, opcjonalny wariant
`.thumb-info-light` zamiast domyslnego ciemnego gradientu) - to DWA OSOBNE
stuby, bo maja inna wewnetrzna tresc, nie jeden z flaga - oraz Interaktywna
(`.card p-4 text-center` + efekt hover: spring+cien GPU LUB `.tilt-card`
na ciemnym tle; UWAGA: przy `tilt` opis uzywa `text-white opacity-50`
zamiast `text-muted`, bo na `bg-dark` `text-muted` jest nieczytelny -
zweryfikowane wzgledem realnego przykladu).

```typescript
type CardAnswers =
  | { type: 'classic'; title: string; body: string; footerButtonLabel: string }
  | { type: 'featured-box'; icon: string; title: string; description: string; accentColor: 'primary' | 'success' | 'danger' | 'warning' | 'info' }
  | { type: 'thumb-info-center'; imageUrl: string; imageAlt: string; title: string }
  | { type: 'thumb-info-bottom'; imageUrl: string; imageAlt: string; title: string; light: boolean; badge: string }
  | { type: 'interactive'; icon: string; title: string; description: string; effect: 'spring-shadow' | 'tilt' };
```

```bash
npx molique-jit make:card
npx molique-jit make:card --answers '{"type":"featured-box","icon":"ph-rocket-launch","title":"Wydajnosc","description":"Framework jest ekstremalnie lekki.","accentColor":"success"}'
```

### `make:data-row` (aliasy: `zrob:wiersz-danych`, `mache:datenzeile`)

Dwa STRUKTURALNIE rozne warianty (pole `"type"`): Grid CRM (`.data-row` -
CSS Grid, 5 kolumn stale, wlasny `margin-bottom` - generator NIE dodaje
zadnego wrappera, wiersze staja jeden pod drugim jako zwykle elementy
blokowe, dokladnie jak w realnym przykladzie) i Kompaktowy
(`.data-row-compact` - Flexbox, separacja przez `border-bottom` +
`:last-child` - WYMAGA wspolnego rodzica, generator owija w
`.card border-0 shadow-sm` zgodnie z rekomendowanym wzorcem z realnego
przykladu). W wariancie Grid CRM, gdy etykiet akcji jest wiecej niz jedna,
OSTATNIA dostaje automatycznie `text-danger` (wzorzec Edytuj/Usun z
realnego przykladu) - pojedyncza akcja nigdy nie dostaje tego koloru
automatycznie.

**Dwie niezalezne poprawki wzgledem realnego przykladu** (ta sama
dyscyplina co przy `make:carousel`): (1) sekcja "Kompaktowe Wiersze" uzywa
tam `class="icon-file-text"`/`class="icon-x"` - stary system fontow ikon
bez ZADNEGO wsparcia w SCSS (potwierdzone grepem - zero `@font-face` lub
regul `.icon-*`), zapomniana migracja na aktualny SVG-sprite system
(`<svg class="icon"><use href="img/icons-sprite.svg#ph-...">`), ktorego
generator uzywa konsekwentnie; (2) tekst pomocniczy w tej samej sekcji ma
`class="... m-r-2"` - ta klasa nie istnieje w `utilities/_spacing.scss`
(poprawna to `mr-2`, bez dodatkowego myslnika), generator uzywa `mr-2`.
Dodatkowo `.btn-action` tam ma zbedny prefiks `btn ` (ta klasa ma WLASNA
kompletna definicje, nigdy nie potrzebowala `.btn`) - generator konsekwentnie
pomija ten prefiks, tak jak juz poprawnie robi to pierwsza sekcja tego
samego pliku.

```typescript
type DataRowAnswers =
  | { type: 'row'; rows: Array<{ title: string; subtitle: string; value: string; statusText: string; statusState: 'draft' | 'pending' | 'done' | 'danger'; actionLabels: string[] }> }
  | { type: 'compact'; items: Array<{ icon: string; iconColor: '' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark'; iconSquare: boolean; title: string; details: string; leadingText: string; actionIcon: string; actionAriaLabel: string }> };
```

```bash
npx molique-jit make:data-row -n 3
npx molique-jit make:data-row --answers '{"type":"compact","items":[{"icon":"ph-user","iconColor":"primary","iconSquare":false,"title":"James Brown","details":"james@alignui.com","leadingText":"Can view","actionIcon":"ph-caret-down","actionAriaLabel":"Zmien poziom dostepu"}]}'
```

### `make:pricing-table` (aliasy: `zrob:cennik`, `mache:preisliste`)

Dwa STRUKTURALNIE rozne warianty (pole `"type"`): Karty cenowe
(`.pricing-table` - wlasny nagrodek, lista cech z opcjonalnym
przekresleniem `.is-disabled`, przycisk; wyroznienie `.is-featured`
dodaje `text-primary` do tytulu i `btn-primary w-100 hover-spring` zamiast
`btn-outline-primary w-100` na przycisku - wstazka "Popularne" jest CZYSTO
w CSS przez `content: 'Popularne'` na `::before`, generator jej NIE
dopisuje do markupu) i Pozioma Lista z Kropkami (`.pricing-list` - li >
`.pricing-list-title` + pusty `.pricing-list-dots` (dekoracyjna kropkowana
linia, czysty CSS) + `.pricing-list-price`). Liczba kolumn siatki karier
(`grid-md-cols-<N>`) dopasowuje sie automatycznie do liczby pakietow.

`.pricing-list` NIE MA wlasnej strony `examples-*.html` (jedyne wzmianki
to wiersz w tabeli klas `docs-classes.html` i lista bundli w
`builder.js`) - budowa wprost z `_pricing-list.scss`, ten sam wyjatek co
przy `make:counter`.

Poprawka wzgledem realnego przykladu Kart Cenowych: przyciski tam maja
zbedny prefiks `btn ` (`class="btn btn-outline-primary w-100"`) - ta sama
juz ustalona w tej sesji konwencja (`.btn-<kolor>` implikuje `.btn`),
generator uzywa samego `btn-outline-primary w-100` / `btn-primary w-100
hover-spring`.

```typescript
type PricingTableAnswers =
  | { type: 'table'; plans: Array<{ title: string; price: string; priceSuffix: string; featured: boolean; features: Array<{ text: string; disabled: boolean }>; buttonLabel: string }> }
  | { type: 'list'; items: Array<{ title: string; price: string }> };
```

```bash
npx molique-jit make:pricing-table -n 3
npx molique-jit make:pricing-table --answers '{"type":"table","plans":[{"title":"Pro","price":"99","priceSuffix":"zl / msc","featured":true,"features":[{"text":"Nielimitowane Projekty","disabled":false}],"buttonLabel":"Wybierz Pro"}]}'
```

### `make:list-group` (aliasy: `zrob:liste-grupowa`, `mache:listengruppe`)

Jeden ksztalt: `.list-group` > `.list-group-item` (link lub przycisk),
pozycja biezaca dostaje `.is-active`. `.list-group` NIE MA wlasnej strony
`examples-*.html` (jedyne realne uzycie to trzecia sekcja "Prosta Lista"
w `src/examples-data-rows.html`), markup stamtad jest jednak kompletny i
wprost odtwarzalny.

```typescript
interface ListGroupAnswers {
  items: Array<{ label: string; href: string; active: boolean }>;
}
```

```bash
npx molique-jit make:list-group -n 4
npx molique-jit make:list-group --answers '{"items":[{"label":"Ustawienia konta","href":"#","active":true},{"label":"Powiadomienia","href":"#","active":false}]}'
```

### `make:testimonial` (aliasy: `zrob:referencje`, `mache:referenz`)

Jeden ksztalt (jedna karta referencji, bez `-n/--count` - jak
`make:badge`/`make:progress`): `.testimonial` > `.testimonial-stars` +
`.testimonial-quote` + `.testimonial-author` > `.testimonial-avatar` +
imie/rola.

Poprawka wzgledem realnego przykladu: LIVE PODGLAD strony renderuje
gwiazdki jako SVG (`ph-star--fill`), ale skopiowany blok kodu na tej
samej stronie pokazuje literalny tekst "★★★★★" - dwa rozne zapisy tego
samego komponentu w jednym pliku. Generator uzywa SVG-sprite, spojnego z
cala reszta frameworka (karty, lightbox, data-row, pricing-table),
powtorzonego dokladnie tyle razy, ile gwiazdek wybrano (0-5), bez
separatora - dokladnie jak w zywym podgladzie.

```typescript
interface TestimonialAnswers {
  starCount: number; // 0-5
  quote: string;
  avatarUrl: string;
  avatarAlt: string;
  name: string;
  role: string;
}
```

```bash
npx molique-jit make:testimonial
npx molique-jit make:testimonial --answers '{"starCount":5,"quote":"Swietny framework!","avatarUrl":"img/avatar.jpg","avatarAlt":"Klient","name":"Jan Kowalski","role":"Dyrektor"}'
```

### `make:toast` (aliasy: `zrob:powiadomienie`, `mache:benachrichtigung`)

Jedyny komponent w rodzinie molique w calosci sterowany przez JS - nie ma
zadnego trwalego markupu do wypelnienia (`.toast-container`/`.toast`
buduje `window.MoliqueToast.show()` w `js/molique-script.js` w locie).
Generator zwraca wiec KOMPLETNY, dzialajacy przyklad: przycisk
wyzwalajacy + wywolanie API, zweryfikowane wzgledem sygnatury
`MoliqueToast.show({ message, type, position, duration })` (domyslne
wartosci w JS: `message='Powiadomienie'`, `type='info'`,
`position='top-right'`, `duration=4000`).

Realny przyklad wywoluje API przez inline `onclick="..."` na przycisku
(dopuszczalne w demo strony dokumentacji, ale nie do powielania w kodzie
produkcyjnym) - jego WLASNY blok "Kopiuj kod" na tej samej stronie pokazuje
za to poprawny wzorzec (`<script>` + wywolanie API), ktorego generator
sie trzyma, dodajac `addEventListener` zamiast inline `onclick`. Kolor
przycisku wyzwalajacego dopasowany do typu powiadomienia (`btn-<type>` -
success/danger/warning/info sa jednoczesnie prawidlowymi kolorami
przyciskow motywu), tak jak w realnym przykladzie.

```typescript
interface ToastAnswers {
  triggerId: string;
  triggerLabel: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration: number; // ms
}
```

```bash
npx molique-jit make:toast
npx molique-jit make:toast --answers '{"triggerId":"toast-trigger","triggerLabel":"Zapisz zmiany","message":"Zapisano pomyslnie!","type":"success","position":"top-right","duration":4000}'
```

### `make:breadcrumb` (aliasy: `zrob:okruszki`, `mache:brotkrumen`)

`.breadcrumb` > `.breadcrumb-item`, separator "/" czysto w CSS
(`.breadcrumb-item + .breadcrumb-item::before`), pozycja biezaca dostaje
`.is-active` + `aria-current="page"` i jest zwyklym tekstem (nie linkiem).

`.breadcrumb` NIE MA wlasnej strony `examples-*.html` (jedyne realne
uzycie to wariant Hero Simple w `make:layout`, gdzie linki sa
`text-white opacity-75`, bo lezy na przyciemnionym zdjeciu - kontekst
niewlasciwy dla samodzielnego uzycia nad tytulem strony). Generator
reuzywa TEGO SAMEGO `_breadcrumb-item.stub.html` co `make:layout`
(element jest generyczny), ale liczy `INNER` bez klas nadkladu - zwykly
link w domyslnym kolorze `--primary` z SCSS. Wrapper
`<nav aria-label="breadcrumb"><ol class="breadcrumb">` - wzorzec
WAI-ARIA "breadcrumb", ten sam, ktorego juz uzywa `layout-hero-simple.stub.html`.

```typescript
interface BreadcrumbAnswers {
  items: Array<{ label: string; href: string }>; // ostatnia pozycja: href ignorowany, renderowany jako tekst
}
```

```bash
npx molique-jit make:breadcrumb -n 3
npx molique-jit make:breadcrumb --answers '{"items":[{"label":"Strona glowna","href":"/"},{"label":"Blog","href":"/blog"},{"label":"Biezaca strona","href":""}]}'
```

### `make:status-icon` (aliasy: `zrob:ikone-statusu`, `mache:statussymbol`)

Dwa STRUKTURALNIE rozne warianty (pole `"type"`): Statyczna (czysty CSS,
`<span class="status-icon status-icon-add">` lub `status-icon-success`)
i Interaktywna zero-JS (`.status-checkbox` > `input[checkbox]` +
`<span class="status-icon-toggle">`, animacja Plus->Checkmark sterowana
natywnym `:checked`). Generator scaffolduje TYLKO te dwa warianty
faktycznie uzyte w `src/examples-status-feedback.html` - NIE samodzielny
`<button class="status-icon-toggle">` bez `<label>`, ktory SCSS sam
opisuje jako "udokumentowane ograniczenie" (brak wolnego pseudo-elementu
na powiekszenie hit-area do 44px).

Poprawka wzgledem "copy" bloku kodu w realnym przykladzie: tam
`<input type="checkbox">` nie ma `aria-label`, mimo ze
`.status-icon-toggle` obok to czysto dekoracyjny `<span>` bez tekstu -
bez `aria-label` taki checkbox jest niedostepny dla czytnikow ekranu
(brak accessible name). Zywy podglad na tej samej stronie ma juz
poprawnie `aria-label="Zaznacz mnie"` - generator idzie za tym
pelniejszym wariantem i wymaga `aria-label` zawsze.

```typescript
type StatusIconAnswers =
  | { type: 'static'; state: 'add' | 'success' }
  | { type: 'checkbox'; name: string; value: string; ariaLabel: string };
```

```bash
npx molique-jit make:status-icon
npx molique-jit make:status-icon --answers '{"type":"checkbox","name":"opcja_premium","value":"1","ariaLabel":"Zaznacz mnie"}'
```

### `make:code-preview` (aliasy: `zrob:podglad-kodu`, `mache:codevorschau`)

`.component-showcase` > `.component-preview` + `.component-code` >
`.btn-copy` + `<pre><code>` - DOKLADNIE wzorzec "podglad + kod", ktorego
uzywa KAZDA strona `src/examples-*.html` w calym repo (przeniesiony z
modulu docs do rdzenia SCSS wlasnie po to, zeby dzialal wszedzie).
`.btn-copy` NIE wymaga zadnego JS per-instancja - kopiowanie obsluguje
globalnie `js/molique-script.js` ("KULOODPORNE KOPIOWANIE KODU",
`document.querySelectorAll('.btn-copy')`), generator wypisuje wiec
wylacznie markup.

Praktyczny cel: opakowanie wyniku INNEJ komendy `make:*` w standardowy
showcase do wlasnej strony stylu (np. wewnetrzny style guide). PIERWSZY
generator w calej rodzinie wymagajacy realnego escapowania HTML -
`.component-code` pokazuje kod jako TEKST (`&amp;`/`&lt;`/`&gt;` wewnatrz
`<pre><code>`), podczas gdy `.component-preview` renderuje TEN SAM markup
NA ZYWO (bez escapowania) - dwa rozne cele, jedno zrodlo danych.

Ograniczenie: `input()` z `@inquirer/prompts` jest jednoliniowy - do
wieloliniowych fragmentow (np. cala karta czy modal) uzyj
`--answers`/`--answers-file` zamiast trybu interaktywnego.

```typescript
interface CodePreviewAnswers {
  html: string; // surowy HTML komponentu
  previewExtraClass: string; // np. "w-100 bg-surface", puste = brak
}
```

```bash
npx molique-jit make:code-preview --answers '{"html":"<span class=\"badge badge-primary\">New</span>","previewExtraClass":"w-100 bg-surface"}'
```

---

**Pierwsza fala nowych generatorow (Etap C) jest kompletna: `make:badge`,
`make:progress`, `make:accordion`, `make:pagination`** - kazdy zbudowany
od razu w docelowym ksztalcie (collect/render, `--answers`/
`--answers-file`, wlasny plik testow).

**Druga (niewielka) fala jest tez kompletna: `make:tooltip`, `make:alert`,
`make:dropdown`, `make:tabs`** - ten sam wzorzec.

**Trzecia fala jest tez kompletna: `make:status-dot`, `make:counter`,
`make:timeline`, `make:carousel`** - ten sam wzorzec.

**Czwarta fala jest tez kompletna: `make:lightbox`, `make:card`,
`make:data-row`, `make:pricing-table`** - ten sam wzorzec.

**Piata (niewielka) fala jest tez kompletna: `make:list-group`,
`make:testimonial`, `make:toast`** - ten sam wzorzec.

**Szosta fala jest tez kompletna: `make:breadcrumb`, `make:status-icon`,
`make:code-preview`** - ten sam wzorzec. Lacznie **29 komend `make:*`**.
Wszystkie pojedyncze/male komponenty molique maja teraz wlasna komende
scaffoldingowa. E-commerce i blog (duze, wieloczesciowe rodziny) swiadomie
odlozone na kolejna fale planowania (na prosbe uzytkownika).
