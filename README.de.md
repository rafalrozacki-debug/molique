<div align="center">
  <img src="img/molique-logo.svg#gh-light-mode-only" alt="molique" width="280">
  <img src="img/molique-logo-light.svg#gh-dark-mode-only" alt="molique" width="280">
</div>

🇬🇧 [English](README.md) · 🇵🇱 [Polski](README.pl.md) · 🇩🇪 **Deutsch**

# molique

Ein leichtgewichtiges, konsequent optimiertes CSS-Framework für B2B.
Aufgebaut auf nativen Cascade Layers (`@layer`), ohne Spezifitätskämpfe und
ohne Abhängigkeiten (kein jQuery). Version: **1.7.32**.

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

## Browser-Anforderungen

molique baut auf modernem, nativem CSS auf. Das meiste degradiert auf
älteren Engines sanft; **eine Sache nicht**, deshalb steht sie hier
ausdrücklich, statt entdeckt werden zu müssen.

| Engine | Mit `molique-script.js` | Nur CSS |
|---|---|---|
| Chrome / Edge | **125** | **133** |
| Firefox | **147** | 147 |
| Safari | **26** | 26 |

**Die eine harte Anforderung.** Vier Komponenten positionieren sich
relativ zu dem Button, der sie öffnet, über den *impliziten* Anker, den
der Browser zwischen einem `[popovertarget]`-Button und seinem Popover
herstellt: `.dropdown-menu[popover]`, `.popover-context`,
`.select-search-menu`, `.custom-select-dropdown`.

Dieser implizite Anker ist Chrome/Edge **133+**. CSS Anchor Positioning
selbst ist älter (Chrome 125), und beides ist getrennt: **Chrome/Edge
125-132 parsen `anchor()` korrekt, erzeugen aber keinen impliziten
Anker**. Jede dieser Komponenten trägt einen Fallback
`@supports not (top: anchor(bottom))`, der das Menü in ein zentriertes
Panel verwandelt - dieser Test erkennt jedoch nur Anchor Positioning als
Ganzes, er sieht den fehlenden impliziten Anker nicht, und **keine
CSS-Feature-Query kann das**.

Dieses Band schließt `js/modules/molique-popover-anchor.js`, das
`molique-script.js` automatisch nachlädt, sobald eines dieser Menüs auf
der Seite ist. Es gibt dem Auslöser einen expliziten `anchor-name` und
richtet `position-anchor` des Menüs darauf aus - genau das, was
`.mega-menu` in reinem CSS tut, was es sich nur leisten kann, weil es
einen Wrapper hat, in dem sich ein gemeinsamer Name begrenzen lässt. Die
Verknüpfung entsteht beim Klick und ist von `document` delegiert, sodass
später gerenderte Menüs keine Neuinitialisierung brauchen und ein von
mehreren Auslösern geteiltes Menü sich an dem tatsächlich benutzten
verankert. Wo der implizite Anker bereits funktioniert, ändert das nichts -
ein expliziter Anker verweist auf dasselbe Element. Ein selbst gesetzter
`anchor-name` oder `position-anchor` wird respektiert und nie
überschrieben.

**Wer das CSS ohne das JS nimmt, bleibt bei Chrome/Edge 133.**

Firefox und Safari haben Anchor Positioning lange nach der Festlegung des
impliziten Ankers ausgeliefert, ein entsprechendes Band ist dort also
nicht bekannt; unterhalb ihrer Minima übernimmt der Fallback mit dem
zentrierten Panel und funktioniert.

Nicht betroffen: `.mega-menu` nutzt einen expliziten `anchor-name`,
und `.tour-tooltip` bekommt einen per JS. Beide funktionieren überall
dort, wo Anchor Positioning funktioniert (Chrome 125+).

Für eine reine CSS-Einbindung, die Chrome 125-132 erreichen muss, macht
man von Hand, was der Shim tut: dem Auslöser einen expliziten
`anchor-name` geben und dem Menü ein passendes `position-anchor`. Oder
die Variante `<details class="dropdown">` nutzen, die ohne Anchor
Positioning auskommt.

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
