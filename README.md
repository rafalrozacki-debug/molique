# molique

Ultralekki, rygorystycznie zoptymalizowany framework CSS B2B. Zbudowany na
natywnych warstwach kaskadowych (`@layer`), bez wojen na specyficzność i bez
zależności (zero jQuery). Wersja: **1.6.0**.

## Szybki start

1. Skopiuj folder `css/`, `js/` (i `fonts/`, jeśli chcesz markowe fonty) do
   swojego projektu.
2. W `<head>` dołącz rdzeń, a JS na końcu `<body>` z atrybutem `defer`:

```html
<link rel="stylesheet" href="css/molique-style.css" />
...
<script defer src="js/molique-script.js"></script>
```

3. Gotowe. Zobacz `starter.html` jako punkt wyjścia.

## Co jest w paczce

| Ścieżka | Opis |
| --- | --- |
| `css/molique-style.css` | Rdzeń: reset, base, layout, komponenty, utilities. **Wymagany.** |
| `css/molique-style.min.css` | Zminifikowana wersja rdzenia (produkcja). |
| `css/molique-style-admin.css` | Moduł panelu admina (layout, sidebar, drill-down). Opcjonalny. |
| `css/molique-style-shop.css` | Moduł e-commerce. Opcjonalny. |
| `css/molique-style-blog.css` | Moduł bloga. Opcjonalny. |
| `css/molique-style-docs.css` | Chrome dokumentacji + theme-editor. Opcjonalny. |
| `css/fonts.css` | **Opcjonalne** `@font-face` (Inter + Poppins). Domyślnie molique używa `system-ui`. |
| `js/molique-script.js` | Rdzeń JS + inteligentny autoloader modułów. |
| `js/modules/*.js` | Mikro-moduły dociągane w runtime (carousel, lightbox, select, theme-editor, …). |
| `fonts/` | Pliki `woff2` (opcjonalne, do `fonts.css`). |
| `img/flags/` | Flagi SVG do komponentu language-switch. |
| `starter.html` | Minimalny szablon startowy. |
| `scss/` | *(tylko paczka Source)* Źródła Sass do własnej kompilacji. |

## Moduły opcjonalne (CSS)

Dołączaj tylko te, których używasz — każdy to osobny plik `css/molique-style-*.css`
(admin, shop, blog, docs, before-after, share, speed-dial).

## Autoloader JS

`molique-script.js` skanuje DOM i **dociąga moduły z `js/modules/` tylko wtedy,
gdy dany komponent istnieje na stronie** — nie ma potrzeby ręcznego ładowania.
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

Zobacz plik `LICENSE`.
