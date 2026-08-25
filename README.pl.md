<div align="center">
  <img src="img/molique-logo.svg#gh-light-mode-only" alt="molique" width="280">
  <img src="img/molique-logo-light.svg#gh-dark-mode-only" alt="molique" width="280">
</div>

🇬🇧 [English](README.md) · 🇵🇱 **Polski** · 🇩🇪 [Deutsch](README.de.md)

# molique

Lekki, rygorystycznie zoptymalizowany framework CSS B2B. Zbudowany na
natywnych warstwach kaskadowych (`@layer`), bez wojen na specyficzność i bez
zależności (zero jQuery). Wersja: **1.7.32**.

## Struktura repozytorium

Ten repo zawiera dwie odrębne rzeczy:

- **Sam framework** - `css/`, `js/`, `fonts/`, `starter.html`. To jest
  właściwy "produkt": paczki `dist/*.zip` (patrz [Releases][releases])
  to dokładnie te foldery, spakowane i gotowe do wgrania do dowolnego
  projektu. Reszta tego README dotyczy wyłącznie tej części.
- **Źródło strony [molique.dev][live]** - cała dokumentacja,
  przykłady i demo modułów (`src/`), zbudowane przez Vite
  (`npm run dev` / `npm run build`, konfiguracja w `vite.config.js`,
  narzędzia w `tools/`). To NIE jest część pobieranej paczki - to
  strona własna projektu, napisana w oparciu o molique. Jeśli
  chcesz naprawić literówkę w docsach albo dodać przykład komponentu,
  to jest właściwe miejsce - cała treść strony jest i tak publicznie
  widoczna przez "Wyświetl kod źródłowy" w przeglądarce, więc nie ma tu
  nic chowanego.

[releases]: https://github.com/rafalrozacki-debug/molique/releases
[live]: https://molique.dev

## Szybki start

1. Skopiuj foldery `css/`, `js/` i `fonts/` do swojego projektu
   (`fonts/` jest wymagany przez wbudowany `@font-face` - Poppins;
   bez niego molique zdegraduje się łagodnie do `system-ui`).
2. W `<head>` dołącz rdzeń, a JS na końcu `<body>` z atrybutem `defer`:

```html
<link rel="stylesheet" href="css/molique-style.css" />
...
<script defer src="js/molique-script.js"></script>
```

3. Gotowe. Zobacz `starter.html` jako punkt wyjścia.

## Wymagania przeglądarkowe

molique stoi na nowoczesnym, natywnym CSS. Większość degraduje się łagodnie
na starszych silnikach; **jedna rzecz nie**, więc jest tu napisana wprost,
zamiast czekać, aż ktoś na nią wpadnie.

| Silnik | Z `molique-script.js` | Sam CSS |
|---|---|---|
| Chrome / Edge | **125** | **133** |
| Firefox | **147** | 147 |
| Safari | **26** | 26 |

**Jedyny twardy wymóg.** Cztery komponenty pozycjonują się względem
przycisku, który je otwiera, korzystając z *niejawnej* kotwicy, jaką
przeglądarka tworzy między przyciskiem `[popovertarget]` a jego
popoverem: `.dropdown-menu[popover]`, `.popover-context`,
`.select-search-menu`, `.custom-select-dropdown`.

Ta niejawna kotwica to Chrome/Edge **133+**. Samo CSS Anchor Positioning
jest starsze (Chrome 125) i to są dwie różne rzeczy: **Chrome/Edge 125-132
poprawnie parsują `anchor()`, ale nie tworzą niejawnej kotwicy**. Każdy
z tych komponentów ma fallback `@supports not (top: anchor(bottom))`,
który zamienia menu w wyśrodkowany panel - ale ten test wykrywa wyłącznie
anchor positioning jako całość, nie widzi braku niejawnej kotwicy
i **żadne zapytanie o cechę w CSS tego nie wykryje**.

Ten przedział domyka `js/modules/molique-popover-anchor.js`, doładowywany
automatycznie przez `molique-script.js`, gdy któreś z tych menu jest na
stronie. Nadaje triggerowi jawną `anchor-name` i wskazuje na nią
`position-anchor` menu - dokładnie to, co `.mega-menu` robi w czystym
CSS, na co może sobie pozwolić tylko dlatego, że ma wrapper, w którym da
się ograniczyć jedną wspólną nazwę. Powiązanie powstaje na kliknięciu
i jest delegowane z `document`, więc menu dorenderowane później nie
wymagają reinicjalizacji, a menu współdzielone przez kilka triggerów
kotwiczy się do tego faktycznie użytego. Tam, gdzie niejawna kotwica już
działa, nic to nie zmienia - jawna kotwica wskazuje ten sam element.
`anchor-name` lub `position-anchor` ustawione przez Ciebie są
respektowane i nigdy nadpisywane.

**Jeśli bierzesz sam CSS, bez JS, próg zostaje na Chrome/Edge 133.**

Firefox i Safari dowiozły anchor positioning długo po tym, jak zachowanie
niejawnej kotwicy zostało ustalone, więc nie jest znany tam analogiczny
przedział; poniżej ich minimów przejmuje fallback z wyśrodkowanym panelem
i działa.

Nie dotyczy: `.mega-menu` używa jawnej `anchor-name`, a
`.tour-tooltip` dostaje ją z JS. Oba działają wszędzie tam, gdzie działa
anchor positioning (Chrome 125+).

Przy integracji bez JS, która musi sięgnąć Chrome 125-132, zrób ręcznie
to, co robi shim: nadaj triggerowi jawną `anchor-name`, a menu pasującą
`position-anchor`. Albo użyj wariantu `<details class="dropdown">`,
który nie korzysta z anchor positioning w ogóle.

## Co jest w paczce

| Ścieżka | Opis |
| --- | --- |
| `css/molique-style.css` | Rdzeń: reset, base, layout, komponenty, utilities. **Wymagany.** |
| `css/molique-style.min.css` | Zminifikowana wersja rdzenia (produkcja). |
| `css/molique-style-admin.css` | Moduł panelu admina (layout, sidebar, drill-down). Opcjonalny. |
| `css/molique-style-shop.css` | Moduł e-commerce. Opcjonalny. |
| `css/molique-style-blog.css` | Moduł bloga. Opcjonalny. |
| `css/molique-style-docs.css` | Chrome dokumentacji + theme-editor. Opcjonalny. |
| `js/molique-script.js` | Rdzeń JS + inteligentny autoloader modułów. |
| `js/modules/*.js` | Mikro-moduły dociągane w runtime (carousel, lightbox, select, theme-editor, …). |
| `fonts/` | Pliki `woff2` (Poppins). Używane przez `@font-face` wbudowany w `molique-style.css` - skopiuj ten folder obok `css/`. |
| `img/flags/` | Flagi SVG do komponentu language-switch. |
| `starter.html` | Minimalny szablon startowy. |
| `purgecss.safelist.cjs` | Gotowa safelista dla PurgeCSS (patrz niżej). Potrzebna tylko, jeśli purge'ujesz CSS. |
| `scss/` | *(tylko paczka Source)* Źródła Sass do własnej kompilacji. |

## Moduły opcjonalne (CSS)

Dołączaj tylko te, których używasz - każdy to osobny plik `css/molique-style-*.css`
(admin, shop, blog, docs, before-after, share, speed-dial).

## PurgeCSS (opcjonalnie)

Część klas molique **nie występuje w Twoim HTML** - dodaje je JS w czasie działania
(stany `.is-*`, markup karuzeli, lightboxa i toastów). PurgeCSS ich nie widzi i bez
safelisty je wytnie. Dlatego w paczce jest gotowy plik:

```js
// purgecss.config.js
const molique = require('./purgecss.safelist.cjs');

module.exports = {
  content: ['./**/*.html', './**/*.php', './js/**/*.js'],
  css: ['./css/molique-style.css'],
  safelist: molique.runtime,   // MINIMUM - bez tego komponenty się psują
  keyframes: true,
  variables: false,            // NIE usuwaj zmiennych - na nich stoi motyw
};
```

**Warianty safelisty:**

| Wywołanie | Kiedy |
| --- | --- |
| `molique.runtime` | Zawsze. Klasy dodawane przez JS molique. |
| `molique.merge('status', 'grid')` | Gdy Twój **backend skleja nazwy klas** - np. `class="badge-<?= $status ?>"` albo `col-md-span-<?= $n ?>`. Takich klas nie ma w żadnym pliku, więc trzeba je zachować jawnie. |
| `molique.all` | Wszystkie rodziny utilities (najbezpieczniej, najmniejszy zysk). |

Dostępne grupy: `colors`, `grid`, `spacing`, `status`.

**Efekt na realnej stronie** (navbar + karta + przyciski): `277 KB → 68 KB` (−75%),
przy zachowaniu wszystkiego, co dodaje JS.

> **Uwaga:** zanim sięgniesz po PurgeCSS, sprawdź czy wystarczy dobór modułów wyżej -
> to redukcja bez żadnego ryzyka. `variables: true` zepsuje motyw (dziesiątki
> zmiennych CSS, pełna lista w `docs-variables.html`), a `keyframes: true`
> jest bezpieczne **tylko** z safelistą.

## Autoloader JS

`molique-script.js` skanuje DOM i **dociąga moduły z `js/modules/` tylko wtedy,
gdy dany komponent istnieje na stronie** - nie ma potrzeby ręcznego ładowania.
Dlatego zostaw folder `js/modules/` w całości obok `molique-script.js`.

## Motyw (Theme Editor)

Kolory, typografię, zaokrąglenia i inne zmienne dobierzesz wizualnie w
edytorze motywu (`theme-editor.html` w wersji online), a wynik skopiujesz jako
blok `:root { … }` do własnego CSS.

## Kompilacja ze źródeł (paczka Source)

Wymaga Dart Sass:

```bash
sass css/scss/molique-style.scss css/molique-style.css --style=expanded
sass css/scss/molique-style-admin.scss css/molique-style-admin.css --style=expanded
# ...analogicznie pozostałe bundle
```

Zmienne motywu (kolory, spacing, radius, typografia) są w
`scss/_root.scss`.

## Licencja

Apache License 2.0. Copyright 2026 Rafał Różacki. Pełny tekst w pliku
`LICENSE`, informacja o atrybucji w `NOTICE`.
