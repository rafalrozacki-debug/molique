# Molique JIT - Struktury danych (stan faktyczny po Fazach 1-5)

> Pierwotna wersja tego dokumentu opisywała `MoliqueAstNode` (Utility/
> Component/State) budowany W LOCIE przez "Rule Parser" z nazw klas i
> słowników matematycznych. Ten silnik nigdy nie powstał w tamtej formie -
> patrz `jit-spec.md` sekcja 0 po wyjaśnienie dlaczego. Nie ma już
> "parsera reguł" ani obiektów AST budowanych w czasie działania: dane są
> WCZEŚNIEJ SKOMPILOWANE (przez prawdziwego Sassa, w tym repozytorium) i
> zapisane jako JSON, a silnik w pakiecie `molique-jit` robi wyłącznie
> odczyt po kluczu. Ten dokument opisuje faktyczne kształty danych -
> źródło prawdy to `tools/jit/package/src/types.ts`.

## 1. Słownik klas narzędziowych (`utilities.json`)

Generowany przez `tools/gen-jit-utilities.js` z już skompilowanego
`dist/chunks/molique-utilities.css` / `molique-utilities-extended.css`.

```typescript
export interface UtilityRule {
  /** Pelny tekst selektora, np. ".text-hover-primary:hover". */
  selector: string;
  /**
   * Warunki opakowujace regule, od zewnetrznego do wewnetrznego, np.
   * ["@media (min-width: 768px)", "@supports (animation-timeline: view())"].
   * Pusta tablica = brak warunku.
   */
  wrappers: string[];
  /** Deklaracje CSS (bez selektora i klamer), np. "color:var(--primary) !important". */
  css: string;
  /** Nazwa chunka zrodlowego, np. "molique-utilities-extended.css" (modul opt-in). */
  source: string;
}

/** Fragment CSS bez zadnej klasy w selektorze (np. @keyframes, @property) - zawsze dolaczany. */
export interface AlwaysIncludeEntry {
  raw: string;
  source: string;
}

export interface UtilitiesDictionary {
  generated: string;
  sources: string[];
  classCount: number;
  ruleCount: number;
  alwaysIncludeCount: number;
  /** Nazwa klasy -> LISTA regul (jedna klasa moze miec wiecej niz jedna regule, np. baza + :hover). */
  classes: Record<string, UtilityRule[]>;
  alwaysInclude: AlwaysIncludeEntry[];
}
```

**Dlaczego `wrappers` to tablica, nie pojedynczy `mediaQuery: string`
(jak w pierwotnej wersji tego dokumentu):** znaleziono realny przypadek w
`_animations.scss` - `.scroll-reveal` jest zagnieżdżone jednocześnie w
`@media (min-width: 768px)` I `@supports (animation-timeline: view())`.
Pojedyncze pole `mediaQuery` zgubiłoby ten drugi warunek.

**Dlaczego `classes[nazwa]` to tablica, nie pojedynczy obiekt:** ten sam
selektor bywa zdefiniowany więcej niż raz w tym samym pliku SCSS z różnymi
deklaracjami (np. `.hover-opacity-100` w `_helpers.scss` - raz bez
`!important`, raz z, druga wygrywa w kaskadzie). Silnik dołącza WSZYSTKIE
warianty verbatim, dokładnie tak jak zrobiłby to pełny build Sass.

**Zasada właściciela przy selektorach złożonych** (np.
`[data-theme="dark"] .bg-glass`, `.stacking-container-snap .section-stacked`):
OSTATNIA klasa w selektorze jest właścicielem wpisu. Bezpieczne
uproszczenie w jedną stronę: w najgorszym razie reguła złożona zostanie
dołączona bez użycia klasy-rodzica (nieszkodliwy, "martwy" fragment CSS -
selektor potomny i tak nie trafi w żaden element bez rodzica w DOM),
nigdy odwrotnie.

## 2. Indeks komponentów (`class-index.json`)

Generowany przez rozszerzoną sekcję w `tools/gen-chunks.js`.

```typescript
export interface ClassIndex {
  generated: string;
  /** Klasa CSS -> ID chunka komponentu, np. "card" -> "cards". */
  classes: Record<string, string>;
}
```

Obejmuje `css/scss/components/*.scss` ORAZ trzy chunki core, które mimo
kategorii "core" zachowują się jak komponenty z perspektywy JIT-a -
włączane przez UŻYCIE konkretnej klasy, nie przez samą obecność
frameworka: `buttons` (`.btn-primary` itd.), `grid` (`.col-span-*`,
`.grid-cols-*`, `.offset-*`, `.bento-*`), `layout` (`.d-flex`, `.gap-*`,
`.align-items-*`, `.w-*` itd.). Znalezione i naprawione w Fazie 5 -
pierwotna wersja obejmowała WYŁĄCZNIE folder `components/`, przez co np.
`.btn-primary` nie rozwiązywał się wcale.

Gdy trafiony token jest kluczem w tej mapie, silnik dołącza CAŁY
skompilowany plik `dist/chunks/molique-<id>.css` verbatim - nigdy
częściowo (komponenty mają selektory zależne od struktury DOM, których
sam skan klas nie potrafi bezpiecznie odtworzyć fragmentarycznie).

## 3. Zawsze dołączane dane (poza mapami)

- `molique-root.css` (zmienne `:root` + `[data-theme="dark"]`) i
  `molique-base.css` (reset, typografia bazowa, `.container`/
  `.container-fluid`) - oba oznaczone `mandatory: true` w
  `tools/gen-chunks.js`, dołączane ZAWSZE, niezależnie od zeskanowanych
  klas.
- `safelist.json` (`tools/gen-jit-package-data.js`, tier
  `runtime.standard` z `purgecss.safelist.cjs`) - klasy tworzone/
  przełączane przez WŁASNY JS molique (toasty, karuzela, lightbox,
  sidebar) - traktowane jako zawsze obecne w efektywnym zbiorze tokenów
  do dopasowania, niezależnie od tego, co scanner faktycznie znalazł.

## 4. Kolejność w wyjściowym CSS

Emitter (`tools/jit/package/src/emitter.ts`) składa finalny plik w stałej
kolejności - zobacz `jit-spec.md` sekcję 1.4. Nie ma tu żadnego etapu
"sortowania AST" jak w pierwotnym planie - kolejność wynika wprost z tego,
w jakiej kolejności emitter dokleja gotowe fragmenty (root+base, potem
komponenty, potem utilities pogrupowane wg `wrappers`, na końcu
`alwaysInclude`).
