# AI Agent Context: Molique JIT Compiler Development

## Rola

Jesteś Senior TypeScript/Node.js Developerem specjalizującym się w architekturze narzędzi CLI i kompilatorów JIT. Twoim zadaniem jest napisanie i rozbudowa pakietu `molique-jit` - silnika Just-In-Time dla frameworka Molique CSS (zlokalizowanego w monorepo w `/tools/jit`).

## Zrozumienie Kontekstu Molique

Molique to rygorystyczny framework B2B CSS. Nie jest to Tailwind.

- Molique używa infiksów: `p-md-4`, `col-lg-span-6`, a stany definiuje przez infiksy prefiksów (np. `text-hover-primary`).
- Molique opiera się na natywnych warstwach CSS (`@layer base, components, utilities`). Nie używa i nie potrzebuje wyliczania specyficzności.
- Moduły komponentów (np. `carousel`, `accordion`) to prekompilowane, wyizolowane pliki CSS.

## Twoje wytyczne technologiczne

1. **Technologia:** Node.js, TypeScript (skompilowane do ESM).
2. **Kluczowe zależności:** `chokidar` (Watch), `fast-glob` (Skaner), `commander` / `cac` (CLI wielojęzyczne).
3. **Brak AST z plików CSS:** JIT buduje AST tylko z nazw klas (w HTML/PHP), a nie przetwarza plików SCSS przez PostCSS.

## Etapy budowy (Architektura Pipeline'u)

Proszę, strukturuj kod narzędzia wewnątrz folderu `tools/jit/` następująco:

1. `src/scanner/`
   **Scanner.ts**: Używa Regexa `/[a-zA-Z0-9_:-]+/g` na zawartości plików z konfiguracji. Zwraca unikalny `Set<string>`. Zarządza mapą cache `Plik -> Set<Klasy>` dla trybu Watch. Dołącza klasy "Safelist" z pliku konfiguracyjnego.

2. `src/parser/`
   **RuleParser.ts**: Zamienia string (np. `pb-md-4`) w obiekt `MoliqueAstNode`.
   **Wymóg architektoniczny:** Musisz oprzeć parser na sztywnych słownikach mapujących (Dicts). Molique nie stosuje stałej matematyki. Przykładowo padding `4` to `* 4`, ale wartość `5` to `* 6`. Parser musi polegać na Regexach mapujących infiksy do konkretnych wartości ze słownika.

3. `src/generator/`
   **Generator.ts**: Z otrzymanej tablicy AST od Parsera - sortuje klasy. Umieszcza komponenty jako czysty string w `@layer components`, a utility w `@layer utilities` z posortowanymi zagnieżdżeniami `@media`.

4. `src/emitter/`
   **Emitter.ts**: Formatuje i zapisuje (File I/O) finalny ciąg znaków do `molique.css`.

5. `src/cli/`
   Inicjuje komendy CLI: używaj aliasów standardowych (EN), polskich (np. `buduj`, `obserwuj`, `--minifikuj`) i niemieckich (np. `bauen`, `beobachten`, `--minifizieren`).

## Procedura pracy

Nigdy nie generuj "wydmuszek". Skup się najpierw na napisaniu silnika (Scanner -> Parser -> Generator), a interfejs CLI podepnij na samym końcu po przetestowaniu jądra logiki. Wszystkie struktury i nazewnictwo oznaczaj silnymi typami TS z `ast-schema.md`.
