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
