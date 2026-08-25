# Spis klas + wyszukiwanie po kontekście — status

Dokument roboczy. Fazy 0–4 z pierwotnego planu są **wykonane** i czekają
w working tree razem z resztą 1.7.32 (bez bumpa wersji — 1.7.32 nie jest
jeszcze opublikowane ani wdrożone). Trwała zasada trafiła do `CLAUDE.md`
(punkt 4 w Definition of Done). Ten plik do skasowania po wydaniu.

## Co jest zrobione

| Faza | Stan |
|---|---|
| 0 — rozstrzygnięcia | kryterium trójstanowe (`public` / `runtime` / `internal`) + domknięcie rodzin; słownik 33 tagów jako **rdzenie**; kategorie 13 → 21 |
| 1 — generator | `tools/cheatsheet.data.js` + `tools/gen-cheatsheet.js` → `src/partials/cheatsheet{,.en,.de}.html` (w `.gitignore`, budowane w `predev`/`prebuild`) |
| 2 — tagi i wyszukiwanie | `data-tags` na `<tr>`, dopasowanie rdzeniowe w `molique-table-search.js` |
| 3 — treść | 373 wiersze, **pokrycie 1287/1287 klas**, bramka twarda |
| 4 — UX wyszukiwania | licznik trafień, pusty stan, `?q=`, `Esc`, opcjonalny skrót klawiszowy |

## Liczby (zmierzone, nie szacowane)

- **1287** klas w ośmiu bundlach (bez `molique-style-docs.css` — to styl
  samej strony, nie API frameworka).
- **373** wiersze w **21** kategoriach. Startowaliśmy z 183 realnych
  wierszy i 692 klasami poza tabelą.
- **184** opisy zebrane maszynowo z tabel klas na stronach `docs-*`
  (skrypt jednorazowy, filtrowany po `data-label`) — już przetłumaczone,
  więc największe ryzyko planu (koszt tłumaczeń) w dużej części odpadło.
- Strona: 181 kB / **33 kB gzip**. Dla porównania `changelog.html` waży
  240 kB / 52 kB, więc podział na sekcje ani `content-visibility` nie są
  potrzebne — nawigacją jest wyszukiwarka.

## Błędy znalezione przy okazji (wszystkie naprawione)

1. **Trzy zepsute wiersze w markupie**, niewidoczne bo przeglądarka je
   naprawia: osierocone `<tr><td>` (pusty wiersz, wszystkie języki),
   wiersz `.rounded-circle` bez znaczników otwierających (EN/DE — treść
   wypadała poza tabelę), wiersz-widmo bez komórki klas.
2. **Dwa wiersze zdublowane** (`.pagination`, `.breadcrumb`) w dwóch
   sekcjach o nazwie „Nawigacja", z różnymi opisami.
3. **Ukrywanie nagłówków sekcji nigdy nie działało** — moduł szukał
   `tr.cheat-sheet-category`, a klasa siedzi na `<td colspan>`. Selektor
   nie łapał niczego; nagłówki znikały przypadkiem, bo były filtrowane
   jak zwykłe wiersze. `llms.txt` i słownik globalny opisywały zachowanie,
   którego nie było.
4. **`.form-pill` nie robi pastylki.** Spis obiecywał „klikalne pastylki"
   plus `.form-pill-group`, `.pill-success`, `.pill-danger`. W CSS jest
   JEDNA reguła z tą klasą: 44 px celu dotykowego dla `<label>` wokół
   checkboxa. Trzy pozostałe klasy nie istnieją.
5. **`.h1`–`.h6` nie istnieją jako klasy** — tylko selektory elementów.
   Wiersz obiecywał „wymuszenie stylu nagłówka na zwykłym tekście",
   a jego własne demo (`<span class="h5">`) nie działało. Wiersz usunięty.
6. **`_eink.scss` celował w nieistniejące klasy** (`.video-bg` zamiast
   `.bg-video`, `.skeleton-loader`) — na e-inku i w druku tło wideo nie
   było chowane.

## Co zostało

- `npm publish` dla `molique` (wymaga OTP użytkownika) i wdrożenie
  strony — całe 1.7.32, nie tylko ta praca.
- Po wydaniu: skasować ten plik.

## Otwarte pytania do decyzji

- **`.h1`–`.h6`:** dodać je jako realne klasy do frameworka (byłyby
  przydatne: „nagłówek wizualnie, `<p>` semantycznie"), czy zostawić samą
  poprawkę dokumentacji? Na razie zrobiona tylko poprawka.
- **`.form-pill`:** dorobić realny komponent pastylki, czy zostawić klasę
  jako opt-in na cel dotykowy i tyle? Na razie to drugie, opisane wprost.
