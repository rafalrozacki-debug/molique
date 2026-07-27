# Molique CLI - Scaffolding Engine (DevTools)

Ten dokument opisuje architekturę systemu generowania komponentów (Scaffolding) z wiersza poleceń dla Molique CSS. 

Celem Scaffoldingu jest znaczne przyspieszenie pracy programisty poprzez interaktywne pytania (kreatory) w terminalu i wypluwanie gotowych, zoptymalizowanych bloków HTML (z pełnym wsparciem A11y, ARIA i natywnych rozwiązań CSS, na których opiera się Molique).

## 1. Architektura Generowania (Stubs System)

Zamiast sklejać potężne stringi z kodem w plikach TypeScript (co jest nieczytelne i podatne na błędy), CLI wykorzystuje architekturę **Stubs** (Szablonów).

- **Szablony (Stubs):** Czyste pliki HTML z "tagami zastępczymi" (np. `{{ ID }}`, `{{ CLASSES }}`, `{{ SLOT }}`). 
- **Lokalizacja:** Zawsze przetrzymywane wewnątrz narzędzia CLI w `src/stubs/`.
- **Silnik renderowania:** Lekki regex-replacer (np. wymieniający `{{ ZMIENNA }}` na treść). Nie używamy ciężkich silników typu Handlebars czy Twig.

## 2. Główny Przepływ Akcji (Flow)

Każda komenda z rodziny `make:*` (np. `molique make:component`) uruchamia następujący proces:

1. **Prompting (Wybór interaktywny):** CLI wykorzystuje pakiet `@inquirer/prompts` lub `enquirer` do wyświetlenia menu wyboru strzałkami w terminalu.
2. **Kolekcjonowanie danych:** Pytania zmieniają się dynamicznie (tzw. Pytania Warunkowe). Np. Jeśli użytkownik wybrał `Modal`, program dopytuje "Czy to Modal Confirm czy Modal Context?".
3. **Kompilacja (Render):** System wczytuje plik `.stub` z dysku i podmienia tagi na odpowiedzi użytkownika.
4. **Wyjście (Output):** Program zapisuje gotowy kod. 
   *Innowacja UX:* Narzędzie pozwala deweloperowi zdecydować — czy zapisać komponent do nowego pliku (np. `components/my-modal.html`), czy po prostu wyrzucić czysty skopiowany kod wprost na ekran konsoli do zaznaczenia myszką!

---

## 3. Komendy Scaffoldingowe

### `molique make:page` (Zrób:Stronę)
Generuje szkielet całej strony (HTML5 Boilerplate) z wpiętym i przygotowanym layoutem.

**Parametry pobierane od dewelopera:**
- **Nazwa pliku:** (np. `dashboard.html`)
- **Rodzaj układu:** 
  1. *Klasyczny (Header -> Content -> Footer)*
  2. *Admin Layout (Floating, ze zoptymalizowanym Sidebarem na mobile)*
- **Wariant Navbara (jeśli Klasyczny):** Transparent / Sticky / Pill
- **Theme Switcher:** Dodaj natywny przełącznik Dark Mode? (Tak/Nie)

### `molique make:component` (Zrób:Komponent)
Główne działo CLI. Tworzy powtarzalne struktury złożone.

**Obsługiwane struktury (Przykłady interakcji):**

#### A. Tabela (B2B Table)
- "Rozmiar tabeli?" (Small / Medium / Large)
- "Zastosować mobile-first table-cards?" (Auto / Zawsze / Nigdy)
- "Wariant nagłówka?" (Light / Dark / Primary)
- *Wynik:* Generuje `<div class="table-wrapper"><table class="...">` uzupełniając poprawnie `data-label` na `<td>`.

#### B. Modal (Natywny `<dialog>`)
- "Typ modala?" (Standard / Dialog potwierdzający / Boczny Context)
- *Wynik:* Generuje poprawnie ukryty, niedostępny przez TAB modal oparty na natywnym HTML:
  ```html
  <dialog class="modal-dialog modal-confirm" id="myModal">
    <div class="card">
       <form method="dialog"><button class="modal-close-btn">&times;</button></form>
       <div class="card-body">...</div>
    </div>
  </dialog>