# Przebudowa dokumentacji molique — brief dla osobnej sesji

Dokument do wklejenia/wskazania na starcie nowej rozmowy. Opisuje **co zrobić
z dokumentacją**, dlaczego, i jakie zasady obowiązują w tym repo.

---

## 1. Kontekst projektu

**molique** — lekki framework CSS B2B (repo: `c:\Praca\Molique\1.5.0`,
`github.com/rafalrozacki-debug/molique`, branch `main`).
Autor: Rafał Różacki. Aktualne wydanie: **v1.6.2**, w toku niewydane **v1.7.0**.

Kluczowe cechy istotne dla dokumentacji:

- Natywny HTML5/CSS przed JS (`<details>`, Popover API, `:has()`, Anchor
  Positioning, `interpolate-size`). JS to ostateczność.
- Kaskada oparta na `@layer reset, base, layout, components, modules, utilities`
  — zero wojen na specyficzność, `!important` tylko w `@layer utilities`.
- **111 zmiennych CSS** — na nich stoi cały motyw i dark mode.
- **57 niezależnych modułów SCSS** (po rozbiciu w lipcu 2026) + konfigurator
  paczki (`builder.html`) i manifest `dist/chunks/manifest.json`.

### Jak uruchomić stronę

```bash
npm run dev     # http://localhost:5173
npm run build   # -> _site/ (prebuild generuje dist/chunks/)
```

> **Nie otwieraj stron z `_site/` dwuklikiem.** Protokół `file://` blokuje moduły
> ES i `fetch` — `builder.html` wygląda wtedy na wiecznie ładujący się.

Strony leżą w `src/*.html`, wspólne fragmenty w `src/partials/`
(`head.html` z `locals`, `navbar.html`, `footer.html`, `scripts.html`),
sklejane przez posthtml-include w `vite.config.js`.

---

## 2. Problem do rozwiązania

Dziś `docs-*.html` i `examples-*.html` **robią to samo** — obie grupy to
galerie showcase'ów z podglądem i kodem do skopiowania. Efekt: duplikacja,
a żadna z ról nie jest pełniona porządnie.

Dodatkowo **nie istnieje tabelaryczna referencja**:

- **111 zmiennych CSS** jest udokumentowanych wyłącznie w komentarzach SCSS,
- ~1120 klas ma tylko spis w `docs-classes.html` (bez opisu zachowania).

## 3. Cel — model Pico CSS

Wzorzec: <https://picocss.com/docs/container>. Jedna strona = **jedna koncepcja**:

1. Czym to jest (1–2 zdania).
2. Jak działa — proza wyjaśniająca mechanizm.
3. **Tabela klas** i **tabela zmiennych CSS**.
4. Pułapki / czego nie robić.
5. Linki do powiązanych stron i do przykładów.

Minimum demo — od pokazywania wariantów są `examples-*`.

### Docelowy podział ról

| Grupa | Rola |
| --- | --- |
| `docs-*` | **Referencja.** Jak mechanizm działa, pełne tabele klas i zmiennych, pułapki. |
| `examples-*` | **Galeria.** Gotowe bloki do skopiowania. Bez zmian. |

---

## 4. Proponowana kolejność prac

### Etap 1 — Referencja zmiennych CSS (największa luka, niezależna)

Nowa strona `docs-variables.html`: wszystkie 111 zmiennych w tabelach, pogrupowane
(kolory, typografia, odstępy, zaokrąglenia, cienie, z-index, sidebar, focus).
Dla każdej: nazwa, wartość domyślna (light + dark), co steruje, gdzie użyta.

**Rozważ generator** (`tools/gen-variables-doc.js`) czytający `_root.scss` —
w repo jest już taka konwencja: `tools/gen-safelist.js`, `tools/gen-chunks.js`,
`tools/gen-scss-context.js`. Ręczna tabela na 111 pozycji rozjedzie się po
pierwszej zmianie.

**Pułapki do opisania** (wyszły w praktyce):
- `--dark` **odwraca się** w dark mode (`#1E293B` → `#F8FAFC`) — to „kolor
  kontrastowy do tła", nie „ciemny". Użycie go na element leżący na zdjęciu
  daje biały tekst na białym tle.
- Pary `--x` / `--x-rgb`: pierwsza to gotowy kolor, druga to **same kanały**
  i działa **wyłącznie** w `rgba()`. `border-color: var(--dark-rgb)` jest
  niepoprawne i przeglądarka odrzuca całą deklarację.
- `variables: true` w PurgeCSS niszczy motyw.

### Etap 2 — Przepisanie `docs-*` na model referencyjny

19 stron. Sugerowana kolejność: `docs-navbar`, `docs-forms`, `docs-interactive`,
`docs-cards`, `docs-tables`, reszta.

Dla każdej: przenieść showcase'y do odpowiedniego `examples-*` (jeśli tam ich
nie ma), zostawić maksymalnie jedno demo, dopisać tabele i sekcję pułapek.

### Etap 3 — Spójność nawigacji

Sidebar dokumentacji jest **zduplikowany w 19 plikach** (~116 linii każdy) i ma
**zahardkodowany `is-active`**. To ostatni duży kandydat na partial — analogicznie
do navbara, z podświetlaniem aktywnej pozycji z URL (jest już
`js/modules/molique-navbar-active.js`, który robi to dla górnego menu).

---

## 5. Zasady obowiązujące w tym repo

### Komunikacja
- **Wszystko po polsku**, z pełną diakrytyką.
- Odbiorca: web designer znający HTML/CSS i podstawy programowania. Tłumacz
  decyzje techniczne zrozumiale, ale kod pisz profesjonalnie.

### Kod i treść
- **Zawsze używaj klas molique** — nie pisz ad-hoc CSS, jeśli istnieje
  odpowiednik. Słownik: `css/scss/molique.md` (kopia globalna w
  `~/.claude/molique.md`) oraz `llms.txt`.
- Strony dokumentacji **dogfooduje molique** (tabele, akordeony, zakładki,
  `component-code` z przyciskiem Kopiuj).
- **Nie sklejaj nazw klas dynamicznie** — literały, inaczej PurgeCSS ich nie widzi.
- Stany zawsze jako `.is-*`.

### Po każdej zmianie
1. `npm run build` — musi przejść czysto.
2. Aktualizacja słowników: `css/scss/molique.md`, `~/.claude/molique.md`, `llms.txt`.
3. Changelog: `src/changelog.html` **oraz** regeneracja lustra `changelog.html.md`
   (skrypt inline w historii commitów — kopiuje źródło w blok ```html).
4. Jeśli ruszasz SCSS: `node tools/gen-scss-context.js` (odtwarza
   `_AI_CONTEXT_scss.md`).

### Commity
- Bez polskich znaków diakrytycznych i bez cudzysłowów w treści (PowerShell 5.1
  się na nich wywraca). Używaj `git commit -F -` z heredokiem w bashu.
- Stopka: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

### Weryfikacja (ważne)
Autor został wcześniej poszkodowany przez asystenta, który przy refaktorze
**pogubił reguły CSS** („do teraz odnajdujemy sieroty"). Obowiązuje zasada:
**każda zmiana masowa musi być dowiedziona, nie oceniona na oko.**

Sprawdzone narzędzia z tej sesji:
- porównanie skompilowanego CSS na poziomie **par selektor→deklaracje**
  (odporne na kolejność i grupowanie selektorów; uwzględnia kontekst `@layer`),
- kontrola bilansu `{` / `}` przed podpięciem nowych plików,
- diff pozostałych bundli (łapie skutki uboczne),
- przy zmianach w HTML: porównanie renderu `_site/` przed i po (migracja
  partiali była dowiedziona jako **bajt w bajt** identyczna).

---

## 6. Stan i pliki, które warto znać

| Ścieżka | Co to |
| --- | --- |
| `css/scss/components/` | 57 niezależnych modułów |
| `css/scss/_root.scss` | wszystkie zmienne motywu (źródło dla Etapu 1) |
| `css/scss/molique.md` | słownik klas (obowiązujący) |
| `llms.txt` | wersja słownika dla modeli AI, serwowana z `/llms.txt` |
| `dist/chunks/manifest.json` | 66 modułów: rozmiar, kategoria, opis, zależności |
| `src/builder.html` + `builder.js` | konfigurator paczki |
| `src/docs-purgecss.html` | **wzorzec docelowego stylu** — instrukcja krok po kroku, tabele, diagnostyka |
| `tools/gen-*.js` | generatory (safelist, chunks, kontekst SCSS) |

> `src/docs-purgecss.html` jest najbliższy docelowemu stylowi: sekcje numerowane,
> tabele zamiast galerii, sekcja „czego nie robić" i diagnostyka po objawie.
> Warto go użyć jako punkt odniesienia.

---

## 7. Pierwszy krok

Zacznij od **Etapu 1** (referencja zmiennych) — jest samowystarczalny, domyka
największą lukę i nie wymaga ruszania istniejących stron. Dopiero potem
przepisywanie `docs-*`, które z tej referencji będzie korzystać.
