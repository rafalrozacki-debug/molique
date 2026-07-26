# Współtworzenie molique

Dzięki za zainteresowanie! Najbardziej potrzebna pomoc to obecnie:

1. **Rozwój frameworka** - nowe komponenty, poprawki, przegląd kodu.
2. **Darmowe szablony** - gotowe strony/layouty budowane na molique (landing
   page, panel admina, sklep, blog...), które mogą trafić do galerii
   przykładów.

Zanim zaczniesz większą pracę (nowy komponent, nowy szablon), **otwórz
najpierw issue** opisujące co planujesz - unikniemy sytuacji, w której dwie
osoby pracują nad tym samym, albo praca idzie w kierunku, który się nie
przyjmie.

## Struktura repo

Zobacz sekcję ["Struktura repozytorium"](README.md#repository-structure) w
README - w skrócie: `css/`/`js/`/`fonts/` to sam framework, `src/` to
źródło strony [molique.rozacki.com](https://molique.rozacki.com) (docs,
przykłady, demo modułów).

## Środowisko lokalne

```bash
npm install
npm run dev      # http://localhost:5173, live reload
npm run build    # generuje _site/ - sprawdź, że przechodzi bez błędów przed PR
```

Edytujesz CSS w `css/scss/*.scss`, nie w skompilowanych `css/*.css` (te są
generowane). Po zmianach w SCSS zrestartuj `npm run dev` albo poczekaj na
rekompilację Vite.

## Zasady kodu (skrót)

Pełne reguły są rozpisane w komentarzach na górze poszczególnych plików
SCSS/JS, ale najważniejsze:

- **Najpierw sprawdź, czy klasa już istnieje.** Molique ma bogaty słownik
  utility/komponentów (`docs-classes.html` = pełny cheat sheet) - nie
  dodawaj nowego ad-hoc CSS, jeśli da się złożyć z istniejących klas.
- **`@layer`, nie `!important`.** Kaskada oparta jest na warstwach
  (`reset, base, layout, components, modules, utilities`) - `!important`
  dopuszczalny wyłącznie w `@layer utilities`.
- **Natywne HTML5/CSS przed JS.** `<details>`, Popover API, `:has()`,
  Anchor Positioning zamiast pisania własnego JS, gdzie to możliwe.
- **Zero JS-bibliotek.** Waniliowy JS, zero jQuery, zero zależności runtime.
- **Callbacki jako metody, nie closures** (jeśli piszesz moduł JS z
  event listenerami złożonymi z więcej niż jednej funkcji) - łatwiej
  odhookować i przetestować.
- **A11y nie jest opcjonalna.** Min. `44px` touch target na elementach
  interaktywnych (`--target-size-min`), widoczny `:focus-visible`,
  sensowny kontrast (WCAG AA, 4.5:1 dla tekstu).
- **Animacje tylko `transform`/`opacity`.** Zero animowania `width`,
  `height`, `box-shadow` (reflow).
- **Dark mode jest obowiązkowy**, nie dodatkiem - każdy nowy komponent
  musi działać w obu motywach.

## Zgłaszanie błędów

Otwórz [issue](https://github.com/rafalrozacki-debug/molique/issues) z:
- co się dzieje vs. czego się oczekiwało,
- minimalny fragment HTML/CSS, który to reprodukuje,
- przeglądarka + system.

## Pull Requesty

- Jedna zmiana = jeden PR (nie mieszaj kilku niezwiązanych poprawek).
- `npm run build` musi przejść bez błędów.
- Nowy komponent CSS: dodaj go też do odpowiedniej strony `docs-*.html`
  (opis + tabela klas) - komponent bez dokumentacji nie zostanie
  scalony.
- Jeśli zmieniasz coś widocznego na stronie, dołącz zrzut ekranu (jasny
  i ciemny motyw).

## Zgłaszanie szablonu

Szablony to strony/layouty budowane WYŁĄCZNIE na klasach molique (bez
własnego CSS poza `@layer utilities`, jeśli już musisz coś dopisać).
Otwórz issue z krótkim opisem i - jeśli masz - zrzutem ekranu/makietą,
zanim zaczniesz kodować całość.

## Licencja

Wysyłając PR, zgadzasz się na licencjonowanie swojego wkładu na
[Apache License 2.0](LICENSE), tak jak reszta projektu.
