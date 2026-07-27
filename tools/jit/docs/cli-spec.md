# Molique CLI Specification

Ten dokument opisuje interfejs linii poleceń oparty na Node.js. Pełni on rolę głównego silnika budującego styl z trybem nasłuchującym zmian (Watch). Narzędzie natywnie wspiera środowiska wielojęzyczne.

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

- **Zachowanie:** Tryb deweloperski nasłuchujący modyfikacji plików (oparty na bibliotece `chokidar`). JIT wykonuje _Debounce_ (~50ms) przed przebudową, re-skanuje tylko zmieniony plik i aktualizuje Context Cache, generując ostateczny plik w milisekundach.

## 3. Przykłady Użycia

Wszystkie komendy można ze sobą dowolnie łączyć w wybranych językach:

```bash
# Standard
npx molique build --minify
npx molique watch --config ./custom.config.mjs

# Język polski
npx molique buduj --minifikuj
npx molique obserwuj --konfiguracja ./custom.config.mjs

# Język niemiecki
npx molique bauen --minifizieren
npx molique beobachten
```
