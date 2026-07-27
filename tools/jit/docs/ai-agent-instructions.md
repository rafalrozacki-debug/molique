# AI Agent Context: Molique JIT Compiler (stan po Fazach 1-5)

> Ten dokument pierwotnie instruował agenta, JAK ZBUDOWAĆ `molique-jit` od
> zera. Silnik jest już zbudowany, przetestowany (test parytetu 672/672,
> pełna ręczna weryfikacja CLI) i działający. Ten plik teraz opisuje
> architekturę TAKĄ, JAKA JEST, żeby kolejna sesja (lub kolejny agent) nie
> musiała jej odkrywać od nowa - i żeby nikt nie próbował budować
> "RuleParsera" opisanego w pierwotnej wersji tego pliku, bo to podejście
> zostało świadomie ODRZUCONE na rzecz czegoś prostszego i bezpieczniejszego.

## Rola

Pracujesz nad `molique-jit` - pakietem npm, silnikiem JIT dla frameworka
molique CSS, zlokalizowanym w tym monorepo w `tools/jit/`. Zanim zaczniesz
COKOLWIEK zmieniać, przeczytaj `jit-spec.md` i `ast-schema.md` (oba
zaktualizowane pod rzeczywistą architekturę) oraz `cli-spec.md` (schemat
`molique.config.mjs` + mechanizm lokalizacji CLI).

## Najważniejsza decyzja architektoniczna - NIE odwracaj jej bez powodu

Pierwotny plan zakładał "Rule Parser" odtwarzający matematykę Sass
(skalę odstępów, warianty kolorów) w ręcznie pisanych słownikach
TypeScript - DRUGIE źródło prawdy obok SCSS. To zostało uznane za
niebezpieczne (ryzyko dryfu) i ZASTĄPIONE tablicą przeglądową: cały
możliwy zestaw klas narzędziowych jest kompilowany RAZ przez prawdziwego
Sassa (w tym repo, nie w pakiecie), spłaszczany do JSON, a silnik w
pakiecie robi wyłącznie odczyt po kluczu. Zero logiki matematycznej w
TypeScript. Jeśli widzisz pokusę, żeby "przyspieszyć" coś przez
zakodowanie wartości na sztywno zamiast czytać je z wygenerowanych danych
- to jest dokładnie ten błąd, którego unikaliśmy. Nie rób tego.

## Struktura repozytorium

```
tools/
  gen-chunks.js              # (juz istniejacy) chunki CSS + manifest.json + class-index.json
  gen-jit-utilities.js       # (Faza 1) utilities.json ze skompilowanych chunkow
  gen-jit-package-data.js    # (Faza 2) pakuje dane do tools/jit/package/data/
  jit/
    dist-data/
      utilities.json         # COMMITOWANY - jedyne trwale zrodlo slownika utilities
    tests/
      parity.test.mjs        # (Faza 3) node:test, npm run test:jit-parity
    docs/                    # ten plik + jit-spec.md + ast-schema.md + cli-spec.md
    package/                 # sam pakiet npm "molique-jit"
      src/
        scanner.ts           # regex + fast-glob, cache per-plik
        lookup.ts            # odczyt map JSON, zero matematyki
        emitter.ts           # sklejanie finalnego CSS wg kolejnosci warstw
        build.ts / watch.ts  # orkiestracja (jednorazowa / chokidar)
        config.ts            # schemat molique.config.mjs
        cli.ts                # bin: molique-jit (Commander + tlumaczenie argv PL/DE)
        types.ts             # ZRODLO PRAWDY dla ksztaltow danych (patrz ast-schema.md)
      data/                  # GITIGNORED - kopia wygenerowana przez gen-jit-package-data.js
```

## Kolejność regeneracji (wazne przy kazdej zmianie SCSS)

```
node tools/gen-chunks.js            # 1. kompiluje SCSS -> dist/chunks/*.css + class-index.json
node tools/gen-jit-utilities.js     # 2. czyta dist/chunks/molique-utilities*.css -> utilities.json
node tools/gen-jit-package-data.js  # 3. kopiuje wszystko do tools/jit/package/data/
```

Wszystkie trzy wpięte w `npm run predev`/`prebuild` w tej kolejności - w
większości przypadków wystarczy `npm run predev`. Po zmianie w
`tools/jit/package/src/*.ts` trzeba dodatkowo `cd tools/jit/package && npm run build` (tsc).

## Test parytetu - uruchamiaj po KAŻDEJ zmianie w generatorach

```
npm run test:jit-parity
```

Dla każdej klasy w `utilities.json` porównuje ją z niezależnie
skompilowanym `css/molique-style.css`. To jedyna siatka bezpieczeństwa,
jakiej potrzebuje architektura tablicy przeglądowej - jeśli test jest
czerwony, albo `css/molique-style.css` jest przestarzały (przekompiluj:
`node node_modules/sass/sass.js css/scss/molique-style.scss
css/molique-style.css --style=expanded --no-source-map`), albo faktycznie
wprowadziłeś rozjazd w generatorach.

## Znane, świadome luki (nie próbuj ich "naprawić" bez decyzji użytkownika)

- **`fonts`/`a11y`/`eink`** (chunki core w `gen-chunks.js`) nie są
  dołączane przez `molique-jit` w żaden sposób - nie są naturalnie
  wyzwalane pojedynczą klasą (fonts = włącz/wyłącz, a11y = głównie
  globalne reguły focus/reduced-motion, eink = tryb `@media print`).
  Wymagałoby to prawdziwego projektu opt-in w configu, nie szybkiej łatki.
- **`minify` w `molique.config.mjs`** jest dziś efektywnie no-op - dane są
  już skompresowane u źródła. Zostaje w schemacie dla zgodności z
  `cli-spec.md`.
- **Brak automatycznych testów CLI** (`node:test` na `cli.ts`) - dotąd
  weryfikowane wyłącznie ręcznie, na scratch-projektach poza repo.
- **Pakiet ma `"private": true`** - nie jest jeszcze gotowy do
  `npm publish` (brak README pakietu, nie podjęto decyzji czy zostaje w
  tym monorepo czy dostaje własne repo).

## Konwencje techniczne (nadal aktualne z pierwotnego planu)

1. **Technologia:** Node.js, TypeScript (ESM, `tsc`, bez bundlera - CLI
   jest wystarczająco małe, żeby go nie potrzebować).
2. **Zależności pakietu:** `fast-glob` (skaner), `chokidar` ^3.x (watch -
   CELOWO nie v4, bo usunęła natywne wsparcie glob), `commander` (CLI).
   Zero zależności w generatorach `tools/gen-jit-*.js` (ten sam
   zero-dependency styl, co `tools/gen-chunks.js`/`tools/gen-variables-doc.js`).
3. **Molique NIE jest Tailwindem:** infiksy (`p-md-4`, `col-lg-span-6`),
   natywne warstwy `@layer` (nie ma wyliczania specyficzności), moduły
   komponentów jako wyizolowane, prekompilowane pliki.
