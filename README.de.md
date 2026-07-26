🇬🇧 [English](README.md) · 🇵🇱 [Polski](README.pl.md) · 🇩🇪 **Deutsch**

# molique

Ein leichtgewichtiges, konsequent optimiertes CSS-Framework für B2B.
Aufgebaut auf nativen Cascade Layers (`@layer`), ohne Spezifitätskämpfe und
ohne Abhängigkeiten (kein jQuery). Version: **1.7.4**.

## Repository-Struktur

Dieses Repo enthält zwei unterschiedliche Dinge:

- **Das Framework selbst** - `css/`, `js/`, `fonts/`, `starter.html`. Das
  ist das eigentliche "Produkt": die `dist/*.zip`-Pakete (siehe
  [Releases][releases]) sind genau diese Ordner, gezippt und einsatzbereit
  für jedes Projekt. Der Rest dieser README bezieht sich ausschließlich
  auf diesen Teil.
- **Der Quellcode von [molique.dev][live]** - die gesamte
  Dokumentation, Beispiele und Modul-Demos (`src/`), gebaut mit Vite
  (`npm run dev` / `npm run build`, Konfiguration in `vite.config.js`,
  Werkzeuge in `tools/`). Das ist NICHT Teil des herunterladbaren Pakets -
  es ist einfach unsere eigene, mit molique gebaute Seite. Wenn Sie einen
  Tippfehler in den Docs korrigieren oder ein Komponentenbeispiel
  hinzufügen möchten, ist das der richtige Ort - der gesamte Seiteninhalt
  ist ohnehin über "Seitenquelltext anzeigen" im Browser öffentlich
  sichtbar, es gibt hier also nichts zu verstecken.

[releases]: https://github.com/rafalrozacki-debug/molique/releases
[live]: https://molique.dev

## Schnellstart

1. Kopieren Sie die Ordner `css/`, `js/` und `fonts/` in Ihr Projekt
   (`fonts/` wird von der eingebauten `@font-face`-Regel benötigt - Poppins;
   ohne diesen Ordner fällt molique sanft auf `system-ui` zurück).
2. Binden Sie im `<head>` den Kern ein, und das JS am Ende von `<body>`
   mit dem Attribut `defer`:

```html
<link rel="stylesheet" href="css/molique-style.css" />
...
<script defer src="js/molique-script.js"></script>
```

3. Fertig. Siehe `starter.html` als Ausgangspunkt.

## Was im Paket enthalten ist

| Pfad | Beschreibung |
| --- | --- |
| `css/molique-style.css` | Kern: Reset, Base, Layout, Komponenten, Utilities. **Erforderlich.** |
| `css/molique-style.min.css` | Minifizierte Version des Kerns (Produktion). |
| `css/molique-style-admin.css` | Admin-Panel-Modul (Layout, Sidebar, Drill-down). Optional. |
| `css/molique-style-shop.css` | E-Commerce-Modul. Optional. |
| `css/molique-style-blog.css` | Blog-Modul. Optional. |
| `css/molique-style-docs.css` | Dokumentations-Chrome + Theme Editor. Optional. |
| `js/molique-script.js` | JS-Kern + intelligenter Modul-Autoloader. |
| `js/modules/*.js` | Mikromodule, die zur Laufzeit nachgeladen werden (Karussell, Lightbox, Select, Theme Editor, …). |
| `fonts/` | `woff2`-Dateien (Poppins). Werden von der in `molique-style.css` eingebauten `@font-face`-Regel verwendet - kopieren Sie diesen Ordner neben `css/`. |
| `img/flags/` | SVG-Flaggen für die Language-Switch-Komponente. |
| `starter.html` | Minimales Starter-Template. |
| `purgecss.safelist.cjs` | Fertige PurgeCSS-Safelist (siehe unten). Nur nötig, wenn Sie Ihr CSS purgen. |
| `scss/` | *(nur Source-Paket)* Sass-Quellen zum eigenen Kompilieren. |

## Optionale Module (CSS)

Binden Sie nur die Module ein, die Sie verwenden - jedes ist eine eigene
Datei `css/molique-style-*.css` (admin, shop, blog, docs, before-after,
share, speed-dial).

## PurgeCSS (optional)

Manche molique-Klassen **kommen nicht in Ihrem HTML vor** - sie werden zur
Laufzeit per JS hinzugefügt (`.is-*`-Zustände, Markup von Karussell,
Lightbox und Toasts). PurgeCSS sieht diese nicht und entfernt sie ohne
Safelist. Deshalb enthält das Paket diese fertige Datei:

```js
// purgecss.config.js
const molique = require('./purgecss.safelist.cjs');

module.exports = {
  content: ['./**/*.html', './**/*.php', './js/**/*.js'],
  css: ['./css/molique-style.css'],
  safelist: molique.runtime,   // MINIMUM - ohne das brechen Komponenten
  keyframes: true,
  variables: false,            // Variablen NICHT entfernen - das Theme baut darauf auf
};
```

**Safelist-Varianten:**

| Aufruf | Wann |
| --- | --- |
| `molique.runtime` | Immer. Klassen, die von molique per JS hinzugefügt werden. |
| `molique.merge('status', 'grid')` | Wenn Ihr **Backend Klassennamen zusammensetzt** - z. B. `class="badge-<?= $status ?>"` oder `col-md-span-<?= $n ?>"`. Solche Klassen kommen in keiner Datei wörtlich vor und müssen deshalb explizit erhalten werden. |
| `molique.all` | Alle Utility-Familien (am sichersten, kleinster Gewinn). |

Verfügbare Gruppen: `colors`, `grid`, `spacing`, `status`.

**Effekt auf einer echten Seite** (Navbar + Karte + Buttons): `277 KB → 68 KB`
(−75 %), unter Beibehaltung von allem, was JS hinzufügt.

> **Hinweis:** Bevor Sie zu PurgeCSS greifen, prüfen Sie, ob die richtige
> Modulauswahl oben schon reicht - das ist eine Reduktion ohne jedes
> Risiko. `variables: true` zerstört das Theme (Dutzende CSS-Variablen,
> vollständige Liste in `docs-variables.html`), und `keyframes: true` ist
> **nur** mit der Safelist sicher.

## JS-Autoloader

`molique-script.js` durchsucht das DOM und **lädt Module aus
`js/modules/` nur dann nach, wenn die passende Komponente auf der Seite
vorhanden ist** - kein manuelles Laden nötig. Lassen Sie deshalb den
Ordner `js/modules/` vollständig neben `molique-script.js`.

## Theme (Theme Editor)

Farben, Typografie, Rundungen und andere Variablen wählen Sie visuell im
Theme Editor (`theme-editor.html` in der Online-Version) und kopieren das
Ergebnis als `:root { … }`-Block in Ihr eigenes CSS.

## Aus den Quellen kompilieren (Source-Paket)

Erfordert Dart Sass:

```bash
sass css/scss/molique-style.scss css/molique-style.css --style=expanded
sass css/scss/molique-style-admin.scss css/molique-style-admin.css --style=expanded
# ...analog für die restlichen Bundles
```

Die Theme-Variablen (Farben, Abstände, Radius, Typografie) befinden sich
in `scss/_root.scss`.

## Lizenz

Apache License 2.0. Copyright 2026 Rafał Różacki. Vollständiger Text in
der Datei `LICENSE`, Attributionshinweis in `NOTICE`.
