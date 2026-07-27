# Molique JIT Compiler Specification (Node.js)

Ten dokument definiuje architekturę silnika Just-In-Time dla frameworka Molique CSS. JIT analizuje pliki projektowe, ekstrahuje użyte ciągi znaków i generuje wyłącznie potrzebny kod CSS, wykorzystując natywne warstwy `@layer`. Silnik pisany jest w Node.js/TypeScript w celu osiągnięcia maksymalnej wydajności I/O.

## 1. Architektura Pipeline'u

Proces kompilacji jest jednokierunkowy. W odróżnieniu od klasycznych narzędzi JIT (które budują każdą klasę osobno z AST), **Molique JIT działa hybrydowo**: dynamicznie buduje utility, ale całe "gotowe" komponenty (np. `.card`, `.navbar`) wstrzykuje na podstawie tzw. klas-wyzwalaczy (Trigger Classes).

### 1.1 Scanner (Ekstraktor)

**Odpowiedzialność:** Wydobycie surowych stringów z plików źródłowych (`.html`, `.php`, `.js`).

- Czyta zawartość pliku.
- Stosuje bezkontekstowe wyrażenie regularne: `/[a-zA-Z0-9_:-]+/g`.
- Wynik jest deduplikowany za pomocą natywnego `Set<string>`.
- Dokleja do wyników klasy zdefiniowane w bloku `safelist` z pliku `molique.config.mjs` (obsługa klas dynamicznych generowanych przez PHP np. `badge-<?= $status ?>`).

### 1.2 Rule Parser (Parser Reguł)

**Odpowiedzialność:** Dopasowanie wydobytych stringów do Słownika Molique.

- Przepuszcza tokeny na obiekty abstrakcyjnego drzewa składniowego (AST).
- Rozpoznaje logikę infiksów Molique (np. `-md-`, `-lg-`).
- Odtwarza matematykę frameworka ze słowników (np. fakt, że `.m-4` to `* 4`, ale `.m-5` to wyjątek i wynosi `* 6`).

### 1.3 Generator

**Odpowiedzialność:** Ustrukturyzowanie wygenerowanych reguł zgodnie ze złotymi zasadami Molique.

- Zrzuca zmienne motywu do pseudo-klasy `:root { ... }`.
- Owija wynik w natywne warstwy na początku pliku: `@layer base, components, utilities;`
- Sortuje utilities po breakpointach (Mobile First), bazując na obiektach AST.

### 1.4 Emitter

**Odpowiedzialność:** Zapis na dysk (File I/O).

- Wypluwa wygenerowane AST do czystego stringa CSS.
- Wstrzykuje zawartość fizycznych plików SCSS (Tree-shaking) dla predefiniowanych komponentów.
- Formatuje/Minifikuje kod i zapisuje go do wyznaczonego pliku.

## 2. Zarządzanie Cache (Watch Mode)

Architektura opiera się na **Context Cache** realizowanym jako Mapa w pamięci RAM:
`Map<FilePath, Set<TokenString>>`

Dzięki temu, gdy zmienia się jeden plik projektowy, JIT analizuje tylko ten plik. Modyfikuje pulę w `Set` i natychmiast przekazuje do Generatora, osiągając czasy przebudowy < 10ms.
