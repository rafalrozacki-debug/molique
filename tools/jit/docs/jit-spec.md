# Molique JIT - Specyfikacja (stan faktyczny po Fazach 1-5)

> Ten dokument opisywał pierwotnie zamierzoną architekturę (silnik liczący
> CSS w locie ze słowników matematycznych). Po implementacji okazało się, że
> lepsze, bezpieczniejsze podejście jest możliwe - patrz "Kluczowa zmiana
> architektoniczna" niżej. Ten plik opisuje architekturę TAKĄ, JAKA
> FAKTYCZNIE POWSTAŁA, nie pierwotny plan.

Molique JIT (pakiet npm `molique-jit`, `tools/jit/package/`) analizuje pliki
projektu konsumenta, wydobywa użyte tokeny (kandydatów na klasy molique) i
generuje wyłącznie potrzebny CSS. Silnik jest w Node.js/TypeScript.

## 0. Kluczowa zmiana architektoniczna: tablica przeglądowa zamiast silnika matematycznego

Klasy narzędziowe molique (`.pb-md-4`, `.text-hover-primary` itd.) **nie są
dowolne** jak w Tailwindzie (`w-[137px]`) - to skończony, w pełni wyliczalny
zbiór, zdefiniowany pętlami `@each` nad stałymi mapami Sass. Zamiast
odtwarzać tę matematykę w drugim miejscu (co pierwotny plan zakładał -
patrz `ast-schema.md`, sekcja historyczna), silnik **w ogóle nie liczy CSS
w locie**. Zamiast tego:

1. **W tym repozytorium** (raz, przy każdej zmianie SCSS) skrypty
   `tools/gen-chunks.js` (już istniejący, produkuje skompilowane chunki
   `dist/chunks/molique-*.css` przez prawdziwego Sassa) i
   `tools/gen-jit-utilities.js` (nowy) spłaszczają warstwę `utilities` do
   płaskiej mapy `nazwa-klasy -> gotowa reguła CSS`
   (`tools/jit/dist-data/utilities.json`, commitowany do gita jak
   `purgecss.safelist.cjs`).
2. `tools/gen-jit-package-data.js` pakuje ten słownik + mapę klasa-komponent
   (`dist/chunks/class-index.json`, też produkowaną przez `gen-chunks.js`) +
   skompilowane pliki komponentów + zmienne motywu w dane pakietu
   (`tools/jit/package/data/`, gitignored, odtwarzalne w każdej chwili).
3. **W pakiecie `molique-jit`** silnik robi wyłącznie: skanuj -> dopasuj
   token do mapy (odczyt O(1), zero matematyki) -> skopiuj gotowy CSS
   verbatim.

Efekt: zero reimplementacji `$space-amounts`, wariantów hover, logiki
infiksów `-md-`/`-lg-` - jeśli SCSS się zmieni, wystarczy ponownie
uruchomić generatory, a silnik JIT automatycznie odzwierciedla zmianę.
Bezpieczeństwo tego podejścia pilnuje automatyczny test parytetu
(`tools/jit/tests/parity.test.mjs`, `npm run test:jit-parity`) - dla
każdej klasy w słowniku porównuje ją z niezależnie skompilowanym
`css/molique-style.css`.

## 1. Architektura pipeline'u

### 1.1 Generatory (w tym repozytorium, nie w pakiecie)

- **`tools/gen-chunks.js`** (rozszerzony w Fazie 1) - poza swoją
  pierwotną rolą (chunki CSS dla konfiguratora `builder.html`) generuje
  teraz też `dist/chunks/class-index.json`: mapę `klasa -> ID chunka`, dla
  komponentów (`css/scss/components/*.scss`) ORAZ trzech chunków core,
  które zachowują się jak komponenty (`buttons`, `grid`, `layout` -
  wyzwalane pojedynczą klasą, w odróżnieniu od `root`/`base`/`fonts`/
  `a11y`/`eink`, które są albo zawsze potrzebne, albo nie są
  wyzwalane klasą wcale).
- **`tools/gen-jit-utilities.js`** (nowy) - czyta już skompilowane
  `dist/chunks/molique-utilities.css` + `molique-utilities-extended.css`,
  rozbija je na `tools/jit/dist-data/utilities.json`. Ręczny (bez nowej
  zależności) parser blokowy CSS - brace-depth matching, tak jak
  `gen-variables-doc.js` robi to dla `_root.scss`.
- **`tools/gen-jit-package-data.js`** (nowy) - kopiuje oba powyższe +
  skompilowane pliki komponentów + `molique-root.css`/`molique-base.css`
  (oba "mandatory", zawsze dołączane) + safelistę wyciągniętą z
  `purgecss.safelist.cjs` (tier `runtime.standard`) do
  `tools/jit/package/data/`.

Wszystkie trzy wpięte w `predev`/`prebuild` w kolejności zależności
(`gen:chunks` -> `gen:jit-utilities` -> `gen:jit-package-data`).

### 1.2 Scanner (`tools/jit/package/src/scanner.ts`)

Zgodnie z pierwotnym planem: bezkontekstowe wyrażenie regularne
`/[a-zA-Z0-9_:-]+/g` na plikach z `content` (glob przez `fast-glob`).
Cache `Map<sciezka, Set<token>>` per plik - podstawa pod tryb watch
(re-skanowanie tylko zmienionego pliku, `rescanFile`/`unionTokens`).

### 1.3 Lookup (`tools/jit/package/src/lookup.ts`)

Zastępuje pierwotnie planowany "Rule Parser". Żadnej logiki - `resolve()`
odpytuje wczytane dane (`utilities.json`, `class-index.json`) po kluczu
(dokładne dopasowanie tokenu do nazwy klasy) i zwraca listę dopasowanych
klas narzędziowych + ID komponentów. Token bez dopasowania to po prostu
klasa spoza molique - nie błąd. Domyślna safelist (`purgecss.safelist.cjs`
-> `runtime.standard`) oraz `molique.config.mjs` -> `safelist` (klasy
specyficzne dla projektu konsumenta) są dołączane zawsze, niezależnie od
skanu.

### 1.4 Emitter (`tools/jit/package/src/emitter.ts`)

Składa finalny CSS zachowując kolejność warstw
(`@layer reset, base, layout, components, modules, utilities;`):

1. Zmienne motywu (`molique-root.css`) + reset/typografia bazowa/
   `.container` (`molique-base.css`) - ZAWSZE, verbatim.
2. Dopasowane komponenty jako CAŁE, już skompilowane pliki chunków -
   nigdy nie wycinane częściowo (komponenty mają selektory zależne od
   struktury DOM, np. `:has()`, sąsiedztwo elementów, których sam skan
   klas nie potrafi bezpiecznie odtworzyć fragmentarycznie).
3. Dopasowane klasy narzędziowe, pogrupowane wg identycznego zestawu
   warunków (`@media`/`@supports`) - żeby np. 30 dopasowanych klas
   `-md-` trafiło do JEDNEGO bloku `@media`, nie 30 osobnych.
4. Pula `alwaysInclude` z `utilities.json` (fragmenty bez klasy w
   selektorze: `@keyframes`, `@property`, `::view-transition-*`) -
   dołączana zawsze, bo nie da się jej powiązać z konkretnym tokenem.

### 1.5 Build / Watch (`build.ts` / `watch.ts`)

`build()` - jednorazowe uruchomienie całego pipeline'u, zapis do pliku.
`watch()` - pierwszy build natychmiast, potem `chokidar` (v3 - v4 usunęła
natywne wsparcie glob) nasłuchuje tych samych wzorców `content`. Po
zmianie pliku: `rescanFile()` odświeża TYLKO jego wpis w cache, debounce
50ms, przebudowa z pełnego `unionTokens()`.

## 2. CLI

Zobacz `cli-spec.md` (zaktualizowany o faktyczny schemat
`molique.config.mjs` i sposób lokalizacji komend).

## 3. Zarządzanie danymi (nie "cache" w pamięci między procesami)

W odróżnieniu od pierwotnego planu (Context Cache jako jedyny mechanizm),
dane słownikowe są **plikami na dysku** (`tools/jit/package/data/*.json` +
skompilowane CSS), generowanymi raz w tym repozytorium i dystrybuowanymi
razem z pakietem npm. Cache w pamięci (`Map<sciezka, Set<token>>` w
Scannerze) dotyczy wyłącznie WYNIKÓW SKANOWANIA plików konsumenta w trybie
watch, nie samego słownika klas molique.
