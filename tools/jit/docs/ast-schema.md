# Molique JIT - Abstract Syntax Tree (AST) Schema

Ten dokument definiuje strukturę danych używaną wewnątrz kompilatora Molique JIT. Nasze AST jest zoptymalizowane pod generowanie CSS z nazw klas wyciągniętych ze Skanera. Zamiast zagnieżdżonego drzewa kodu, używamy płaskiej, łatwej do sortowania kolekcji (Tablicy Obiektów).

## 1. Główne Typy (TypeScript Interfaces)

Każda klasa znaleziona w kodzie HTML/PHP po przejściu przez `Rule Parser` zamieniana jest na obiekt zgodny z interfejsem `MoliqueAstNode`.

```typescript
export type CSSLayer = "base" | "components" | "utilities";

// Unia (Union Type) wszystkich możliwych węzłów
export type MoliqueAstNode = UtilityNode | ComponentNode | StateNode;
```

### 1.1. Utility Node (Dynamicznie generowane klasy)

Używane dla klas narzędziowych (np. `m-4`, `pb-md-3`, `text-hover-primary`).

```typescript
export interface UtilityNode {
  type: "utility";
  layer: "utilities";
  className: string; // Znaleziona klasa (np. 'pb-md-4')
  selector: string; // Zbudowany selektor (np. '.pb-md-4' lub '.text-hover-primary:hover')
  mediaQuery: string | null; // Np. '(min-width: 768px)' dla modyfikatora '-md-'
  styles: Record<string, string>; // Mapa właściwości CSS
}
```

### 1.2. Component Node (Tree-Shaking gotowych bloków SCSS)

Jeśli klasa pasuje do predefiniowanej nazwy komponentu (np. `card`, `carousel`, `navbar`), zamiast budować go linijka po linijce, AST odwołuje się do fizycznego prekompilowanego pliku (skutkuje to zrzuceniem całego kodu bloku SCSS).

```typescript
export interface ComponentNode {
  type: "component";
  layer: "components";
  name: string; // Główna nazwa (np. 'carousel')
  rawCss: string; // Zminifikowany string CSS całego komponentu
}
```

### 1.3. State Node (Stany z frameworka)

Dla klas zaczynających się od `is-` (np. `is-active`, `is-hidden`, `is-scrolled`).

```typescript
export interface StateNode {
  type: "state";
  layer: "utilities"; // Lądują w utilities, by nadpisywać bazę
  className: string;
  rawCss: string; // Wstrzykiwana globalna reguła stanu
}
```

## 2. Zasady Sortowania w Generatorze (Sorting Pipeline)

Zanim węzły zostaną przekazane do Emittera, muszą zostać posortowane:

1. **Warstwy:** Najpierw `ComponentNode` (`@layer components`), potem `UtilityNode` (`@layer utilities`).
2. **Kolejność Utilities (Mobile First):** Grupowanie według `mediaQuery` (`null` -> `-sm-` -> `-md-` -> `-lg-` -> `-xl-`).

Dzięki sortowaniu na poziomie obiektów JS plik wyjściowy zawsze zachowuje poprawną strukturę kaskady RWD bez obliczania specyficzności.
