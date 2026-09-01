/**
 * molique - cheat-sheet data for docs-classes.{html,en.html,de.html}
 *
 * THE table of classes lives here, once, for all three languages. The
 * generator tools/gen-cheatsheet.js turns it into
 * src/partials/cheatsheet.{,en.,de.}html (gitignored, rebuilt in
 * predev/prebuild) - exactly like tools/variables-doc.data.js does for the
 * CSS-variable tables.
 *
 * WHY: the same table was maintained by hand in three files and had already
 * drifted - PL had a .rounded-circle row EN/DE lacked, PL marked two ranges
 * with "do" that EN/DE listed as plain items, and three rows were broken
 * markup (an orphan <tr><td>, a row with no opening tags, a leftover row
 * with no class cell at all).
 *
 * ROW SHAPE
 *   id       stable slug, used for anchors and for the coverage gate
 *   classes  lines of tokens. A token is either a class name ('.card'),
 *            '..' for the localised range word (do / through / bis) or '/'
 *            for a literal slash. Each line renders as its own <br />-separated
 *            row of .class-name chips. LANGUAGE-INDEPENDENT ON PURPOSE:
 *            class names must never differ between translations.
 *   desc     localised description (inline HTML allowed)
 *   demo     the third column. A plain string when all three languages share
 *            it (the usual case), or {pl,en,de} when the demo contains a label
 *   demoAttrs optional attributes for the third <td>
 */

export const CONNECTOR = { pl: 'do', en: 'through', de: 'bis' };

export const HEAD = {
  pl: ['Klasa CSS', 'Opis i zastosowanie', 'Przykład wizualny'],
  en: ['CSS Class', 'Description &amp; Usage', 'Visual Example'],
  de: ['CSS-Klasse', 'Beschreibung &amp; Verwendung', 'Visuelles Beispiel'],
};

/**
 * Search tags. A reader who does not know the class name knows their
 * problem - "centre this", "it wraps", "it is cut off". Rows carry tag KEYS;
 * the stems below are what the generator writes into data-tags, per language.
 *
 * STEMS, NOT WORDS. Polish and German inflect on the suffix, so a full word
 * ("wyśrodkowanie") is not a substring of what people type ("wyśrodkować").
 * molique-table-search.js matches a term against a tag when either is a
 * prefix of the other, which is what makes a short stem cover every form.
 * Write the stems WITHOUT diacritics - the matcher strips them on both sides.
 */
export const TAGS = {
  form: {
    pl: 'formularz',
    en: 'form',
    de: 'formular'
  },
  table: {
    pl: 'tabel',
    en: 'table',
    de: 'tabelle'
  },
  dashboard: {
    pl: 'dashboard',
    en: 'dashboard',
    de: 'dashboard'
  },
  nav: {
    pl: 'nawigacj',
    en: 'nav',
    de: 'navigation'
  },
  menu: {
    pl: 'menu',
    en: 'menu',
    de: 'menu'
  },
  modal: {
    pl: 'modal',
    en: 'modal',
    de: 'modal'
  },
  mobile: {
    pl: 'mobile',
    en: 'mobile',
    de: 'mobil'
  },
  admin: {
    pl: 'admin',
    en: 'admin',
    de: 'admin'
  },
  shop: {
    pl: 'sklep',
    en: 'shop',
    de: 'shop'
  },
  blog: {
    pl: 'blog',
    en: 'blog',
    de: 'blog'
  },
  chart: {
    pl: 'wykres',
    en: 'chart',
    de: 'diagramm'
  },
  feedback: {
    pl: 'feedback',
    en: 'feedback',
    de: 'feedback'
  },
  card: {
    pl: 'karta',
    en: 'card',
    de: 'karte'
  },
  centering: {
    pl: 'wysrodk',
    en: 'cent',
    de: 'zentr'
  },
  spacing: {
    pl: 'odstep',
    en: 'spac',
    de: 'abstand'
  },
  scroll: {
    pl: 'przewij',
    en: 'scroll',
    de: 'scroll'
  },
  wrap: {
    pl: 'zawij',
    en: 'wrap',
    de: 'umbruch'
  },
  clip: {
    pl: 'przycin',
    en: 'clip',
    de: 'beschneid'
  },
  order: {
    pl: 'kolejnos',
    en: 'order',
    de: 'reihenfolge'
  },
  visibility: {
    pl: 'widoczn',
    en: 'visib',
    de: 'sichtbar'
  },
  shadow: {
    pl: 'cien',
    en: 'shadow',
    de: 'schatten'
  },
  radius: {
    pl: 'zaokragl',
    en: 'round',
    de: 'rund'
  },
  align: {
    pl: 'wyrown',
    en: 'align',
    de: 'ausricht'
  },
  ratio: {
    pl: 'proporcj',
    en: 'ratio',
    de: 'verhaltnis'
  },
  width: {
    pl: 'szerokos',
    en: 'width',
    de: 'breite'
  },
  color: {
    pl: 'kolor',
    en: 'colo',
    de: 'farbe'
  },
  icon: {
    pl: 'ikon',
    en: 'icon',
    de: 'symbol'
  },
  overlay: {
    pl: 'nakladk',
    en: 'overlay',
    de: 'overlay'
  },
  zerojs: {
    pl: 'zero-js',
    en: 'zero-js',
    de: 'zero-js'
  },
  a11y: {
    pl: 'dostepnos',
    en: 'accessib',
    de: 'barrierefrei'
  },
  responsive: {
    pl: 'responsyw',
    en: 'responsiv',
    de: 'responsiv'
  },
  state: {
    pl: 'stan',
    en: 'state',
    de: 'status'
  },
  animation: {
    pl: 'animacj',
    en: 'animat',
    de: 'animation'
  }
};

export const CATEGORIES = [
  {
    id: 'baza-i-kontenery',
    title: {
      pl: 'Baza i kontenery',
      en: 'Base and containers',
      de: 'Basis und Container',
    },
    rows: [
      {
        id: 'container',
        classes: [['.container', '.container-fluid']],
        desc: {
          pl: 'Główne kontenery ograniczające szerokość treści (max-width: 1200px).',
          en: 'Main containers capping the content width (max-width: 1200px).',
          de: 'Hauptcontainer, die die Inhaltsbreite begrenzen (max-width: 1200px).',
        },
        demo: '-',
        tags: ['width'],
      },
      {
        id: 'breakout-mobile',
        classes: [['.breakout-mobile']],
        desc: {
          pl: 'Full-bleed na mobile (poniżej 768px): element wyrywa się z paddingu <code>.container</code>, dotyka krawędzi ekranu. Bez efektu na desktopie. Musi być bezpośrednim dzieckiem wyśrodkowanego kontenera (patrz <a href="docs-layout">docs Layout</a>, pułapka nr 5).',
          en: 'Full-bleed on mobile (below 768px): the element breaks out of the <code>.container</code> padding, touching the screen edge. No effect on desktop. Must be a direct child of a centered container (see <a href="docs-layout.en">Layout docs</a>, pitfall #5).',
          de: 'Full-Bleed auf Mobilgeräten (unterhalb von 768px): Das Element reißt sich aus dem Padding von <code>.container</code> heraus und berührt den Bildschirmrand. Ohne Effekt auf dem Desktop. Muss direktes Kind eines zentrierten Containers sein (siehe <a href="docs-layout.de">Layout-Dokumentation</a>, Fallstrick Nr. 5).',
        },
        demo: '-',
        tags: ['mobile', 'width'],
      },
      {
        id: 'stacking-container',
        classes: [['.stacking-container', '.section-stacked']],
        desc: {
          pl: 'Efekt przyklejających się do siebie sekcji podczas scrollowania (Sticky Stacking).',
          en: 'An effect of sections sticking on top of one another while scrolling (sticky stacking).',
          de: 'Ein Effekt, bei dem sich Abschnitte beim Scrollen aufeinander stapeln (Sticky Stacking).',
        },
        demo: '-',
        tags: ['scroll', 'animation'],
      },
      {
        id: 'd-none',
        classes: [['.d-none', '.d-block', '.d-flex', '.d-grid'], ['.d-md-*', '.d-lg-*']],
        desc: {
          pl: 'Narzędzia do zarządzania właściwością <code>display</code>.',
          en: 'Utilities for managing the <code>display</code> property.',
          de: 'Werkzeuge zur Steuerung der Eigenschaft <code>display</code>.',
        },
        demo: '-',
        tags: ['visibility', 'responsive'],
      },
      {
        id: 'd-inline',
        classes: [['.d-inline', '.d-inline-block', '.d-inline-flex', '.flex-column']],
        desc: {
          pl: 'Uzupełnienie rodziny <code>display</code>: warianty liniowe oraz pionowy kierunek osi Flexboksa. Wszystkie mają odmiany <code>-md-</code> i <code>-lg-</code>.',
          en: 'The rest of the <code>display</code> family: inline variants and the vertical Flexbox axis. All have <code>-md-</code> and <code>-lg-</code> versions.',
          de: 'Der Rest der <code>display</code>-Familie: Inline-Varianten und die vertikale Flexbox-Achse. Alle mit <code>-md-</code> und <code>-lg-</code> Versionen.',
        },
        demo: '-',
        tags: ['visibility'],
      },
      {
        id: 'w-25',
        classes: [['.w-25', '.w-50', '.w-100', '.w-auto', '.mw-100', '.h-100', '.vh-100', '.min-vh-100'], ['.w-75', '.w-md-*']],
        desc: {
          pl: 'Szybkie wymiarowanie (Sizing) w procentach lub jednostkach viewportu. <code>.mw-100</code> = maksymalna szerokość 100%, <code>.min-vh-100</code> = minimalna wysokość pełnego ekranu. Warianty responsywne <code>.w-md-*</code>.',
          en: 'Quick sizing, in percentages or viewport units. <code>.mw-100</code> = 100% max-width, <code>.min-vh-100</code> = full-screen min-height. Responsive variants <code>.w-md-*</code>.',
          de: 'Schnelle Größenangaben (Sizing) in Prozent oder Viewport-Einheiten. <code>.mw-100</code> = maximale Breite 100 %, <code>.min-vh-100</code> = minimale Höhe des vollen Bildschirms. Responsive Varianten <code>.w-md-*</code>.',
        },
        demo: '-',
        tags: ['width'],
      },
      {
        id: 'embed-responsive',
        classes: [['.embed-responsive']],
        desc: {
          pl: 'Responsywny kontener 16:9 dla osadzonego wideo (YouTube, Vimeo).',
          en: 'A responsive 16:9 container for embedded video (YouTube, Vimeo).',
          de: 'Ein responsiver 16:9-Container für eingebettetes Video (YouTube, Vimeo).',
        },
        demo: '-',
        tags: ['ratio', 'responsive'],
      },
      {
        id: 'embed-responsive-16by9',
        classes: [['.embed-responsive-16by9', '.embed-responsive-4by3']],
        desc: {
          pl: 'Proporcje wewnątrz <code>.embed-responsive</code> - film z YouTube/Vimeo trzyma kadr niezależnie od szerokości.',
          en: 'Aspect ratio inside <code>.embed-responsive</code> - a YouTube or Vimeo video keeps its frame at any width.',
          de: 'Seitenverhältnis in <code>.embed-responsive</code> - ein YouTube- oder Vimeo-Video behält bei jeder Breite seinen Bildausschnitt.',
        },
        demo: '-',
        tags: ['ratio'],
      },
      {
        id: 'cursor-pointer',
        classes: [['.cursor-pointer', '.cursor-default', '.cursor-not-allowed']],
        desc: {
          pl: 'Kursor nad elementem - np. łapka na klikalnym wierszu tabeli, blokada na wyłączonej akcji.',
          en: 'Cursor over the element - a hand on a clickable table row, a block on a disabled action.',
          de: 'Mauszeiger über dem Element - Hand bei einer klickbaren Tabellenzeile, Sperre bei deaktivierter Aktion.',
        },
        demo: '-',
      },
      {
        id: 'sr-only',
        classes: [['.sr-only', '.skip-link']],
        desc: {
          pl: 'Klasy dostępności (A11y) dla czytników ekranu.',
          en: 'Accessibility (A11y) classes for screen readers.',
          de: 'Barrierefreiheitsklassen (A11y) für Screenreader.',
        },
        demo: '-',
        tags: ['a11y', 'visibility'],
      },
      {
        id: 'd-md-none',
        classes: [['.d-md-none']],
        desc: {
          pl: 'Widoczność zależna od szerokości. Także <code>.d-md-block</code>, <code>.d-md-flex</code> - np. menu pokazywane dopiero od tabletu.',
          en: 'Visibility depending on width. Also <code>.d-md-block</code>, <code>.d-md-flex</code> - e.g. a menu shown only from tablet width up.',
          de: 'Sichtbarkeit abhängig von der Breite. Auch <code>.d-md-block</code>, <code>.d-md-flex</code> - z. B. ein Menü, das erst ab Tablet-Breite gezeigt wird.',
        },
        demo: '-',
        source: 'docs-layout',
      },
      {
        id: 'page-header',
        classes: [['.page-header']],
        desc: {
          pl: 'Kadrowanie obrazu tła: <code>cover</code>, wyśrodkowany, bez powtarzania.',
          en: 'Frames the background image: <code>cover</code>, centered, no repeat.',
          de: 'Rahmt das Hintergrundbild: <code>cover</code>, zentriert, keine Wiederholung.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'stacking-container-snap',
        classes: [['.stacking-container-snap']],
        desc: {
          pl: 'Wariant z przyciąganiem: przewijanie zatrzymuje się na pełnej sekcji. Wymaga własnej wysokości i przewijania.',
          en: 'A snapping variant: scrolling stops at a full section. Requires its own height and scrolling.',
          de: 'Eine Variante mit Einrasten: Das Scrollen stoppt bei einem vollständigen Abschnitt. Benötigt eine eigene Höhe und eigenes Scrollen.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'icon',
        classes: [['.icon', '.icon-sm', '.icon-lg', '.icon-xl']],
        desc: {
          pl: 'Rozmiar ikony SVG, ustawiany na samym <code>&lt;svg&gt;</code>. Ikona dziedziczy kolor tekstu (<code>currentColor</code>), więc nie ustawiaj go osobno - zmień kolor rodzica.',
          en: 'The size of an SVG icon, set on the <code>&lt;svg&gt;</code> itself. The icon inherits the text colour (<code>currentColor</code>), so do not set it separately - change the colour of the parent.',
          de: 'Die Größe eines SVG-Symbols, direkt am <code>&lt;svg&gt;</code> gesetzt. Das Symbol erbt die Textfarbe (<code>currentColor</code>), setze sie also nicht separat - ändere die Farbe des Elternelements.',
        },
        demo: '-',
        tags: ['icon'],
      },
      {
        id: 'is-state',
        classes: [['.is-active', '.is-open', '.is-visible', '.is-selected', '.is-completed'], ['.is-animated', '.is-copied', '.is-disabled', '.is-dragging', '.is-featured', '.is-success', '.js-resetting']],
        desc: {
          pl: 'Konwencja stanu: molique nazywa KAŻDY stan <code>.is-*</code>. Większość z nich nadaje JS frameworka (aktywna pozycja z URL, zaznaczony slajd, przeciągany wiersz), część wpisujesz sam (<code>.is-featured</code> na cenniku, <code>.is-active</code> w <code>.btn-group</code>). To ta sama konwencja, na której stoi wzorzec <code>/^is-/</code> w safeliście PurgeCSS - własne stany też nazywaj tak, a przetrwają czyszczenie CSS.',
          en: 'The state convention: molique names EVERY state <code>.is-*</code>. Most are applied by the framework\'s JS (the active item from the URL, the selected slide, the row being dragged), a few you write yourself (<code>.is-featured</code> on a pricing table, <code>.is-active</code> in a <code>.btn-group</code>). It is the same convention the <code>/^is-/</code> pattern in the PurgeCSS safelist relies on - name your own states this way and they survive CSS purging.',
          de: 'Die Zustandskonvention: molique benennt JEDEN Zustand <code>.is-*</code>. Die meisten setzt das JS des Frameworks (der aktive Eintrag aus der URL, der gewählte Slide, die gezogene Zeile), einige schreibst du selbst (<code>.is-featured</code> an einer Preistabelle, <code>.is-active</code> in einer <code>.btn-group</code>). Es ist dieselbe Konvention, auf der das Muster <code>/^is-/</code> in der PurgeCSS-Safelist beruht - benenne eigene Zustände so, dann überleben sie das Purging.',
        },
        demo: '-',
        tags: ['state'],
      },
    ],
  },
  {
    id: 'grid-i-kolumny',
    title: {
      pl: 'Grid i kolumny',
      en: 'Grid and columns',
      de: 'Grid und Spalten',
    },
    rows: [
      {
        id: 'grid-auto',
        classes: [['.grid-auto', '.grid-auto-sm', '.grid-auto-lg']],
        desc: {
          pl: 'Inteligentne siatki (Auto-fit). Same dopasowują liczbę kolumn do szerokości ekranu.',
          en: 'Smart grids (auto-fit). They adjust the column count to the screen width on their own.',
          de: 'Intelligente Raster (Auto-fit). Passen die Spaltenzahl selbstständig an die Bildschirmbreite an.',
        },
        demo: '-',
        tags: ['responsive'],
      },
      {
        id: 'grid-cols-1',
        classes: [['.grid-cols-1', '..', '-12'], ['.grid-md-cols-1', '..', '-12'], ['.grid-lg-cols-1', '..', '-12']],
        desc: {
          pl: 'Sztywne siatki. Wymuszają konkretną liczbę kolumn na elemencie nadrzędnym (globalnie lub od breakpointu MD).',
          en: 'Rigid grids. Force a specific column count on the parent element (globally or from the MD breakpoint on).',
          de: 'Starre Raster. Erzwingen eine feste Spaltenzahl am Elternelement (global oder ab dem MD-Breakpoint).',
        },
        demo: '-',
        tags: ['responsive'],
      },
      {
        id: 'col-span-1',
        classes: [['.col-span-1', '..', '-12'], ['.col-md-span-1', '..', '-12'], ['.col-lg-span-1', '..', '-12']],
        desc: {
          pl: 'Rozpiętość dzieci w siatce (ile kolumn ma zająć dany element).',
          en: 'How many columns a child spans in the grid.',
          de: 'Wie viele Spalten ein Kind im Raster einnimmt.',
        },
        demo: '-',
        tags: ['responsive', 'width'],
      },
      {
        id: 'col-start-1',
        classes: [['.col-start-1', '..', '-12'], ['.offset-1', '..', '-11'], ['.col-md-start-*', '.col-lg-start-*'], ['.offset-*'], ['.col-start-auto']],
        desc: {
          pl: 'Przesuwanie w siatce. <code>.col-start-N</code> ustawia kolumnę początkową, <code>.offset-N</code> zostawia N pustych kolumn przed elementem. Warianty <code>-md-</code> i <code>-lg-</code> działają od swojego breakpointu, <code>-auto</code> wraca do automatycznego układania.',
          en: 'Moving things around the grid. <code>.col-start-N</code> sets the starting column, <code>.offset-N</code> leaves N empty columns before the element. The <code>-md-</code> and <code>-lg-</code> variants apply from their breakpoint up, <code>-auto</code> returns to automatic placement.',
          de: 'Verschieben im Grid. <code>.col-start-N</code> setzt die Startspalte, <code>.offset-N</code> lässt N leere Spalten davor. Die Varianten <code>-md-</code> und <code>-lg-</code> gelten ab ihrem Breakpoint, <code>-auto</code> kehrt zur automatischen Platzierung zurück.',
        },
        demo: '-',
        tags: ['order'],
      },
      {
        id: 'bento-grid',
        classes: [['.bento-grid', '.bento-grid-3', '.bento-grid-4']],
        desc: {
          pl: 'Asymetryczna siatka z automatycznym upychaniem elementów (dense).',
          en: 'An asymmetric grid with automatic dense item packing.',
          de: 'Ein asymmetrisches Raster mit automatischer, dichter Anordnung der Elemente.',
        },
        demo: '-',
      },
      {
        id: 'bento-col-2',
        classes: [['.bento-col-2', '.bento-col-3'], ['.bento-row-2', '.bento-row-3']],
        desc: {
          pl: 'Modyfikatory rozpiętości dla klocków wewnątrz Bento Grid (działają na desktopie).',
          en: 'Span modifiers for tiles inside a Bento Grid (apply on desktop).',
          de: 'Spannweiten-Modifikatoren für Kacheln im Bento Grid (wirken auf dem Desktop).',
        },
        demo: '-',
        tags: ['width'],
      },
      {
        id: 'grid',
        classes: [['.grid']],
        desc: {
          pl: 'Włącza siatkę bez ustalania kolumn.',
          en: 'Turns on the grid without setting columns.',
          de: 'Aktiviert das Raster, ohne Spalten festzulegen.',
        },
        demo: '-',
        tags: ['responsive'],
        source: 'docs-layout',
      },
    ],
  },
  {
    id: 'flexbox-i-wyrownanie',
    title: {
      pl: 'Flexbox i wyrównanie',
      en: 'Flexbox and alignment',
      de: 'Flexbox und Ausrichtung',
    },
    rows: [
      {
        id: 'justify-content-*',
        classes: [['.justify-content-*', '.align-items-*', '.align-self-*']],
        desc: {
          pl: 'Wyrównywanie elementów we Flexboxie (np. <code>center</code>, <code>space-between</code>, <code>flex-start</code>). <code>.align-self-*</code> (start/end/center/stretch) wyrównuje pojedyncze dziecko niezależnie od rodzica.',
          en: 'Aligning elements in Flexbox (e.g. <code>center</code>, <code>space-between</code>, <code>flex-start</code>). <code>.align-self-*</code> (start/end/center/stretch) aligns a single child independently of the parent.',
          de: 'Ausrichten von Elementen im Flexbox (z. B. <code>center</code>, <code>space-between</code>, <code>flex-start</code>). <code>.align-self-*</code> (start/end/center/stretch) richtet ein einzelnes Kind unabhängig vom Elternelement aus.',
        },
        demo: '-',
        tags: ['centering', 'align', 'spacing'],
      },
      {
        id: 'justify-content-md-*',
        classes: [['.justify-content-md-*', '.align-items-md-*', '.align-self-md-*'], ['.flex-md-*']],
        desc: {
          pl: 'Wyrównanie Flexboksa tylko od breakpointu MD - te same końcówki co w wersji bazowej (<code>start</code>, <code>end</code>, <code>center</code>, <code>between</code>, <code>stretch</code>). Do tego <code>.flex-md-wrap</code> / <code>.flex-md-nowrap</code>.',
          en: 'Flexbox alignment from the MD breakpoint only - the same endings as the base classes (<code>start</code>, <code>end</code>, <code>center</code>, <code>between</code>, <code>stretch</code>). Plus <code>.flex-md-wrap</code> / <code>.flex-md-nowrap</code>.',
          de: 'Flexbox-Ausrichtung erst ab dem MD-Breakpoint - dieselben Endungen wie in der Basisversion (<code>start</code>, <code>end</code>, <code>center</code>, <code>between</code>, <code>stretch</code>). Dazu <code>.flex-md-wrap</code> / <code>.flex-md-nowrap</code>.',
        },
        demo: '-',
        tags: ['centering', 'align', 'responsive'],
      },
      {
        id: 'gap-1',
        classes: [['.gap-1', '..', '.gap-5'], ['.gap-0', '.gap-md-*']],
        desc: {
          pl: 'Odstęp między elementami siatki lub flexa. <code>.gap-0</code> znosi go całkiem, warianty <code>.gap-md-*</code> działają od breakpointu desktop.',
          en: 'The gap between grid or flex items. <code>.gap-0</code> removes it entirely; the <code>.gap-md-*</code> variants apply from the desktop breakpoint up.',
          de: 'Der Abstand zwischen Grid- oder Flex-Elementen. <code>.gap-0</code> entfernt ihn ganz; die Varianten <code>.gap-md-*</code> gelten ab dem Desktop-Breakpoint.',
        },
        demo: '-',
        tags: ['spacing'],
      },
      {
        id: 'order-first',
        classes: [['.order-first', '.order-last', '.order-0', '..', '.order-5'], ['.order-md-*', '.order-lg-*']],
        desc: {
          pl: 'Kolejność wizualna we Flexboksie i Gridzie, bez ruszania DOM-u. Warianty <code>.order-md-*</code> i <code>.order-lg-*</code>. Do naprzemiennych sekcji pisz markup w kolejności <strong>czytania</strong> i przestawiaj dopiero od MD w górę - inaczej psujesz kolejność na wąskim ekranie i dla czytników ekranu.',
          en: 'Visual order in Flexbox and Grid, without touching the DOM. Variants <code>.order-md-*</code> and <code>.order-lg-*</code>. For alternating sections, write the markup in <strong>reading</strong> order and reorder only from MD up - otherwise you break the order on narrow screens and for screen readers.',
          de: 'Visuelle Reihenfolge in Flexbox und Grid, ohne das DOM anzufassen. Varianten <code>.order-md-*</code> und <code>.order-lg-*</code>. Bei alternierenden Sektionen das Markup in <strong>Lesereihenfolge</strong> schreiben und erst ab MD umsortieren - sonst zerstören Sie die Reihenfolge auf schmalen Bildschirmen und für Screenreader.',
        },
        demo: '-',
        tags: ['order', 'responsive'],
      },
      {
        id: 'flex-wrap',
        classes: [['.flex-wrap']],
        desc: {
          pl: 'Pozwala elementom zawijać się do kolejnych linii.',
          en: 'Lets elements wrap onto the next lines.',
          de: 'Erlaubt Elementen, in die nächste Zeile umzubrechen.',
        },
        demo: '-',
        tags: ['align'],
        source: 'docs-layout',
      },
    ],
  },
  {
    id: 'odstepy-i-pozycjonowanie',
    title: {
      pl: 'Odstępy i pozycjonowanie',
      en: 'Spacing and positioning',
      de: 'Abstände und Positionierung',
    },
    rows: [
      {
        id: 'm-0',
        classes: [['.m-0', '..', '.m-5'], ['.p-0', '..', '.p-5'], ['.mt-*', '.mb-*', '.ml-*', '.mr-*', '.mx-*', '.my-*'], ['.pt-*', '.pb-*', '.pl-*', '.pr-*', '.px-*', '.py-*'], ['.ms-*', '.me-*', '.ps-*', '.pe-*']],
        desc: {
          pl: 'Skala odstępów 0-5, marginesy i paddingi. Poza wersją ze wszystkich stron (<code>.m-3</code>) istnieją warianty pojedynczych stron (<code>.mt-</code>, <code>.mb-</code>, <code>.ml-</code>, <code>.mr-</code>) i osi (<code>.mx-</code>, <code>.my-</code>) - łatwo je przeoczyć, bo do 1.7.32 nie było ich w spisie. Aliasy logiczne <code>s</code>/<code>e</code> rozwijają się do FIZYCZNYCH left/right, tak jak <code>.text-start</code>. Każdy wariant ma odpowiednik <code>-md-</code>.',
          en: 'The 0-5 spacing scale, margins and paddings. Besides the all-sides version (<code>.m-3</code>) there are single-side variants (<code>.mt-</code>, <code>.mb-</code>, <code>.ml-</code>, <code>.mr-</code>) and axis ones (<code>.mx-</code>, <code>.my-</code>) - easy to miss, because until 1.7.32 they were not listed here. The logical <code>s</code>/<code>e</code> aliases expand to PHYSICAL left/right, just like <code>.text-start</code>. Every variant has an <code>-md-</code> counterpart.',
          de: 'Die Abstandsskala 0-5 für Außen- und Innenabstände. Neben der Variante für alle Seiten (<code>.m-3</code>) gibt es Einzelseiten (<code>.mt-</code>, <code>.mb-</code>, <code>.ml-</code>, <code>.mr-</code>) und Achsen (<code>.mx-</code>, <code>.my-</code>) - leicht zu übersehen, denn bis 1.7.32 fehlten sie in dieser Liste. Die logischen Aliase <code>s</code>/<code>e</code> lösen sich zu PHYSISCHEM left/right auf, genau wie <code>.text-start</code>. Zu jeder Variante gibt es ein <code>-md-</code>-Pendant.',
        },
        demo: '-',
        tags: ['spacing'],
      },
      {
        id: 'm-md-*',
        classes: [['.m-md-*', '.p-md-*']],
        desc: {
          pl: 'Marginesy i paddingi aplikowane tylko od breakpointu MD (desktop).',
          en: 'Margins and paddings applied only from the MD breakpoint (desktop) up.',
          de: 'Margins und Paddings, die erst ab dem MD-Breakpoint (Desktop) angewendet werden.',
        },
        demo: '-',
        tags: ['spacing', 'responsive'],
      },
      {
        id: 'ml-auto',
        classes: [['.ml-auto', '.mr-auto', '.mt-auto', '.mb-auto'], ['.mx-auto', '.my-auto', '.m-auto']],
        desc: {
          pl: 'Automatyczne marginesy. <code>.mx-auto</code> wyśrodkowuje blok w poziomie, <code>.ml-auto</code>/<code>.mr-auto</code> wypychają element we Flexboksie (aliasy logiczne: <code>.ms-auto</code>, <code>.me-auto</code>).',
          en: 'Automatic margins. <code>.mx-auto</code> centres a block horizontally, <code>.ml-auto</code>/<code>.mr-auto</code> push an element inside a flex row (logical aliases: <code>.ms-auto</code>, <code>.me-auto</code>).',
          de: 'Automatische Außenabstände. <code>.mx-auto</code> zentriert einen Block horizontal, <code>.ml-auto</code>/<code>.mr-auto</code> schieben ein Element im Flexbox (logische Aliase: <code>.ms-auto</code>, <code>.me-auto</code>).',
        },
        demo: '-',
        tags: ['centering', 'spacing', 'align'],
      },
      {
        id: 'overlap-up-50',
        classes: [['.overlap-up-50', '.overlap-up-100', '.overlap-up-150']],
        desc: {
          pl: 'Wciąga element do góry o 50/100/150px (ujemny margines) - np. karta nachodząca na sekcję hero powyżej.',
          en: 'Pulls an element up by 50/100/150px (negative margin) - e.g. a card overlapping the hero section above it.',
          de: 'Zieht ein Element um 50/100/150px nach oben (negativer Margin) - z. B. eine Karte, die den Hero-Abschnitt darüber überlappt.',
        },
        demo: '-',
        tags: ['spacing'],
      },
      {
        id: 'overlap-container',
        classes: [['.overlap-container']],
        desc: {
          pl: 'Karta nachodząca na poprzednią sekcję (ujemny margines).',
          en: 'A card overlapping the previous section (negative margin).',
          de: 'Eine Karte, die den vorherigen Abschnitt überlappt (negativer Margin).',
        },
        demo: '-',
        tags: ['spacing'],
      },
      {
        id: 'position-relative',
        classes: [['.position-relative', '.position-absolute', '.position-fixed', '.position-sticky']],
        desc: {
          pl: 'Narzędzia pozycjonowania.',
          en: 'Positioning utilities.',
          de: 'Werkzeuge zur Positionierung.',
        },
        demo: '-',
      },
      {
        id: 'top-0',
        classes: [['.top-0', '.bottom-0', '.left-0', '.right-0', '.inset-0']],
        desc: {
          pl: 'Przypięcie do krawędzi rodzica. <code>.inset-0</code> rozciąga na wszystkie cztery boki (idealne pod nakładki <code>.overlay</code>).',
          en: 'Pinning to the parent\'s edges. <code>.inset-0</code> stretches across all four sides (perfect for <code>.overlay</code> overlays).',
          de: 'Anheften an die Kanten des Elternelements. <code>.inset-0</code> erstreckt sich auf alle vier Seiten (ideal für <code>.overlay</code>-Überlagerungen).',
        },
        demo: '-',
        tags: ['align'],
      },
      {
        id: 'top-50',
        classes: [['.top-50', '.left-50', '.translate-middle'], ['.translate-middle-x', '.translate-middle-y']],
        desc: {
          pl: 'Szybkie centrowanie absolutne. Warianty <code>.translate-middle-x</code> / <code>.translate-middle-y</code> centrują w jednej osi.',
          en: 'Quick absolute centering. The <code>.translate-middle-x</code> / <code>.translate-middle-y</code> variants center along a single axis.',
          de: 'Schnelle absolute Zentrierung. Die Varianten <code>.translate-middle-x</code> / <code>.translate-middle-y</code> zentrieren auf einer einzelnen Achse.',
        },
        demo: '-',
        tags: ['centering', 'align'],
      },
      {
        id: 'z-0',
        classes: [['.z-0', '.z-10', '.z-20', '.z-30', '.z-index-1', '..', '.z-index-3']],
        desc: {
          pl: 'Kolejność nakładania. <code>.z-*</code> to skala co 10 dla układu strony; <code>.z-index-*</code> to drobne korekty (1-3) wewnątrz komponentu.',
          en: 'Stacking order. <code>.z-*</code> is a scale in steps of 10 for page layout; <code>.z-index-*</code> covers small corrections (1-3) inside a component.',
          de: 'Stapelreihenfolge. <code>.z-*</code> ist eine Skala in Zehnerschritten für das Seitenlayout, <code>.z-index-*</code> deckt kleine Korrekturen (1-3) innerhalb einer Komponente ab.',
        },
        demo: '-',
        tags: ['overlay'],
      },
    ],
  },
  {
    id: 'typografia',
    title: {
      pl: 'Typografia',
      en: 'Typography',
      de: 'Typografie',
    },
    rows: [
      {
        id: 'text-1',
        classes: [['.text-1', '..', '.text-12']],
        desc: {
          pl: 'Płynna skala wielkości tekstu (clamp). Tekst bazowy (rozmiar akapitu) to <code>.text-3</code>; poniżej leżą <code>.text-1</code> (12px) i <code>.text-2</code> (13px), a <code>.text-4</code>&ndash;<code>.text-8</code> odpowiadają nagłówkom H5&ndash;H1. Wyżej rozmiary hero aż do 9rem.',
          en: 'A fluid text-size scale (clamp). The base text (paragraph size) is <code>.text-3</code>; below it sit <code>.text-1</code> (12px) and <code>.text-2</code> (13px), while <code>.text-4</code>&ndash;<code>.text-8</code> correspond to headings H5&ndash;H1. Above that, hero sizes up to 9rem.',
          de: 'Eine fließende Textgrößenskala (clamp). Der Basistext (Absatzgröße) ist <code>.text-3</code>; darunter liegen <code>.text-1</code> (12px) und <code>.text-2</code> (13px), während <code>.text-4</code>&ndash;<code>.text-8</code> den Überschriften H5&ndash;H1 entsprechen. Darüber Hero-Größen bis zu 9rem.',
        },
        demo: {
          pl: '<span class="text-4 fw-bold">Tekst 4</span>',
          en: '<span class="text-4 fw-bold">Text 4</span>',
          de: '<span class="text-4 fw-bold">Text 4</span>',
        },
        tags: ['width'],
      },
      {
        id: 'text-sm',
        classes: [['.text-sm', '/', '.text-xs', '/', '.text-base']],
        desc: {
          pl: 'Mikrocopy: 11px / 10px - jeszcze mniejsze niż <code>.text-1</code> (podpisy, dopiski prawne) oraz powrót do rozmiaru bazowego.',
          en: 'Microcopy: 11px / 10px - even smaller than <code>.text-1</code> (captions, legal fine print), plus a return to the base size.',
          de: 'Mikrocopy: 11px / 10px - noch kleiner als <code>.text-1</code> (Bildunterschriften, rechtliche Hinweise) sowie eine Rückkehr zur Basisgröße.',
        },
        demo: {
          pl: '<span class="text-sm">Tekst sm</span>',
          en: '<span class="text-sm">Text sm</span>',
          de: '<span class="text-sm">Text sm</span>',
        },
      },
      {
        id: 'fw-light',
        classes: [['.fw-light', '..', '.fw-black']],
        desc: {
          pl: 'Wagi fontów (od 300 do 900): <code>.fw-light</code>, <code>.fw-normal</code>, <code>.fw-medium</code>, <code>.fw-semibold</code> (600), <code>.fw-bold</code>, <code>.fw-black</code>.',
          en: 'Font weights (from 300 to 900): <code>.fw-light</code>, <code>.fw-normal</code>, <code>.fw-medium</code>, <code>.fw-semibold</code> (600), <code>.fw-bold</code>, <code>.fw-black</code>.',
          de: 'Schriftstärken (von 300 bis 900): <code>.fw-light</code>, <code>.fw-normal</code>, <code>.fw-medium</code>, <code>.fw-semibold</code> (600), <code>.fw-bold</code>, <code>.fw-black</code>.',
        },
        demo: {
          pl: '<span class="fw-semibold">Półgruby</span> <span class="fw-black">Gruby</span>',
          en: '<span class="fw-semibold">Semibold</span> <span class="fw-black">Black</span>',
          de: '<span class="fw-semibold">Halbfett</span> <span class="fw-black">Fett</span>',
        },
      },
      {
        id: 'text-start',
        classes: [['.text-start', '.text-center', '.text-end', '.text-left', '.text-right'], ['.text-md-*']],
        desc: {
          pl: 'Wyrównanie tekstu (text-align). Warianty <code>-md-</code> (np. <code>.text-md-center</code>) aplikują się od breakpointu desktop. <code>.text-left</code>/<code>.text-right</code> to aliasy <code>.text-start</code>/<code>.text-end</code> (też w wariancie <code>-md-</code>) - w nowym markupie używaj wersji <code>start</code>/<code>end</code>.',
          en: 'Text alignment (text-align). The <code>-md-</code> variants (e.g. <code>.text-md-center</code>) apply from the desktop breakpoint up. <code>.text-left</code>/<code>.text-right</code> are aliases of <code>.text-start</code>/<code>.text-end</code> (in the <code>-md-</code> variant too) - prefer the <code>start</code>/<code>end</code> spelling in new markup.',
          de: 'Textausrichtung (text-align). Die Varianten <code>-md-</code> (z. B. <code>.text-md-center</code>) wirken ab dem Desktop-Breakpoint. <code>.text-left</code>/<code>.text-right</code> sind Aliase von <code>.text-start</code>/<code>.text-end</code> (auch in der <code>-md-</code>-Variante) - in neuem Markup bevorzugen Sie <code>start</code>/<code>end</code>.',
        },
        demo: {
          pl: '<span class="text-center">Wyśrodkowany</span>',
          en: '<span class="text-center">Centered</span>',
          de: '<span class="text-center">Zentriert</span>',
        },
        tags: ['centering', 'align', 'responsive'],
      },
      {
        id: 'text-uppercase',
        classes: [['.text-uppercase', '.text-decoration-none']],
        desc: {
          pl: 'Transformacje i dekoracje tekstu.',
          en: 'Text transformations and decorations.',
          de: 'Texttransformationen und -dekorationen.',
        },
        demo: {
          pl: '<span class="text-uppercase">Wielkie litery</span>',
          en: '<span class="text-uppercase">Uppercase</span>',
          de: '<span class="text-uppercase">Großbuchstaben</span>',
        },
      },
      {
        id: 'text-capitalize',
        classes: [['.text-capitalize', '.text-lowercase', '.text-justify', '.text-decoration-underline', '.text-decoration-line-through']],
        desc: {
          pl: 'Wielkość liter, justowanie i dekoracja tekstu. Obok istniejących <code>.text-uppercase</code> i <code>.text-decoration-none</code>.',
          en: 'Letter case, justification and text decoration. Alongside the existing <code>.text-uppercase</code> and <code>.text-decoration-none</code>.',
          de: 'Groß-/Kleinschreibung, Blocksatz und Textdekoration. Neben den vorhandenen <code>.text-uppercase</code> und <code>.text-decoration-none</code>.',
        },
        demo: {
          pl: '<span class="text-decoration-line-through">1299 zł</span>',
          en: '<span class="text-decoration-line-through">$299</span>',
          de: '<span class="text-decoration-line-through">299 €</span>',
        },
        tags: ['wrap'],
      },
      {
        id: 'list-unstyled',
        classes: [['.list-unstyled', '.list-icons'], ['.list-icons-check', '.list-icons-arrow', '.list-icons-cross']],
        desc: {
          pl: 'Listy bez punktorów. <code>.list-unstyled</code> usuwa znaczniki; <code>.list-icons</code> zastępuje je ikoną SVG (wariant <code>-check</code> / <code>-arrow</code> / <code>-cross</code>). Kolor ikony: <code>.list-icons-success</code> / <code>-danger</code> / <code>-dark</code> (domyślnie primary).',
          en: 'Lists with no bullets. <code>.list-unstyled</code> removes the markers; <code>.list-icons</code> replaces them with an SVG icon (<code>-check</code> / <code>-arrow</code> / <code>-cross</code> variant). Icon color: <code>.list-icons-success</code> / <code>-danger</code> / <code>-dark</code> (primary by default).',
          de: 'Listen ohne Aufzählungszeichen. <code>.list-unstyled</code> entfernt die Markierungen; <code>.list-icons</code> ersetzt sie durch ein SVG-Icon (Variante <code>-check</code> / <code>-arrow</code> / <code>-cross</code>). Icon-Farbe: <code>.list-icons-success</code> / <code>-danger</code> / <code>-dark</code> (standardmäßig primary).',
        },
        demo: {
          pl: '<ul class="list-icons list-icons-check list-icons-success m-0 text-3" > <li>Gotowe</li> </ul>',
          en: '<ul class="list-icons list-icons-check list-icons-success m-0 text-3" > <li>Done</li> </ul>',
          de: '<ul class="list-icons list-icons-check list-icons-success m-0 text-3" > <li>Fertig</li> </ul>',
        },
        tags: ['icon'],
      },
      {
        id: 'list-icons-success',
        classes: [['.list-icons-success']],
        desc: {
          pl: 'Kolor ikony: zielony.',
          en: 'Icon color: green.',
          de: 'Icon-Farbe: Grün.',
        },
        demo: '-',
        source: 'docs-tables',
      },
      {
        id: 'list-icons-danger',
        classes: [['.list-icons-danger']],
        desc: {
          pl: 'Kolor ikony: czerwony.',
          en: 'Icon color: red.',
          de: 'Icon-Farbe: Rot.',
        },
        demo: '-',
        source: 'docs-tables',
      },
      {
        id: 'list-icons-dark',
        classes: [['.list-icons-dark']],
        desc: {
          pl: 'Kolor ikony: kontrastowy do tła. Bez klasy koloru ikona jest w barwie marki.',
          en: 'Icon color: contrasting with the background. Without a color class the icon is in the brand color.',
          de: 'Icon-Farbe: kontrastierend zum Hintergrund. Ohne Farbklasse ist das Icon in der Markenfarbe.',
        },
        demo: '-',
        source: 'docs-tables',
      },
      {
        id: 'text-3',
        classes: [['.text-3']],
        desc: {
          pl: '<strong>Rozmiar akapitu.</strong> To samo co <code>.text-base</code>.',
          en: '<strong>The paragraph size.</strong> The same as <code>.text-base</code>.',
          de: '<strong>Die Absatzgröße.</strong> Dasselbe wie <code>.text-base</code>.',
        },
        demo: '-',
        source: 'docs-typography',
      },
      {
        id: 'fw-normal',
        classes: [['.fw-normal']],
        desc: {
          pl: 'Domyślna waga tekstu.',
          en: 'The default text weight.',
          de: 'Standard-Textgewicht.',
        },
        demo: '-',
        source: 'docs-typography',
      },
      {
        id: 'fw-medium',
        classes: [['.fw-medium']],
        desc: {
          pl: 'Lekkie wyróżnienie: etykiety, pozycje menu.',
          en: 'A light emphasis: labels, menu items.',
          de: 'Leichte Hervorhebung: Beschriftungen, Menüpunkte.',
        },
        demo: '-',
        source: 'docs-typography',
      },
      {
        id: 'fw-semibold',
        classes: [['.fw-semibold']],
        desc: {
          pl: 'Nagłówki stron ofertowych. Token istniał od początku, klasy brakowało do 1.7.32.',
          en: 'Headings on marketing pages. The token existed from the start; the class was missing until 1.7.32.',
          de: 'Überschriften auf Marketing-Seiten. Das Token gab es von Anfang an, die Klasse fehlte bis 1.7.32.',
        },
        demo: '-',
        source: 'docs-typography',
      },
      {
        id: 'fw-bold',
        classes: [['.fw-bold']],
        desc: {
          pl: 'Nagłówki, wyróżnienia w tekście.',
          en: 'Headings, in-text emphasis.',
          de: 'Überschriften, Hervorhebungen im Text.',
        },
        demo: '-',
        source: 'docs-typography',
      },
      {
        id: 'text-knockout-dark',
        classes: [['.text-knockout-dark']],
        desc: {
          pl: 'Czarne tło, litery przezroczyste. Na ciemne zdjęcia.',
          en: 'A black background, transparent letters. For dark photos.',
          de: 'Schwarzer Hintergrund, transparente Buchstaben. Für dunkle Fotos.',
        },
        demo: '-',
        source: 'docs-typography',
      },
    ],
  },
  {
    id: 'kolory-i-powierzchnie',
    title: {
      pl: 'Kolory i powierzchnie',
      en: 'Colors and surfaces',
      de: 'Farben und Flächen',
    },
    rows: [
      {
        id: 'text-primary',
        classes: [['.text-primary', '.text-secondary'], ['.text-success', '.text-danger'], ['.text-warning', '.text-info'], ['.text-dark', '.text-light'], ['.text-muted', '.text-white'], ['.text-main']],
        desc: {
          pl: 'Pełna paleta kolorów tekstu.',
          en: 'The full text-color palette.',
          de: 'Die vollständige Textfarbpalette.',
        },
        demo: '<span class="text-primary fw-bold">Pri</span> <span class="text-success fw-bold">Suc</span> <span class="text-danger fw-bold">Dan</span>',
        tags: ['color'],
      },
      {
        id: 'bg-primary',
        classes: [['.bg-primary', '.bg-secondary'], ['.bg-success', '.bg-danger'], ['.bg-warning', '.bg-info'], ['.bg-dark', '.bg-light'], ['.bg-surface', '.bg-body', '.bg-transparent']],
        desc: {
          pl: 'Pełna paleta kolorów tła. Automatycznie dobierają kontrastowy kolor tekstu (np. biały tekst na ciemnym tle).',
          en: 'The full background-color palette. Automatically picks a contrasting text color (e.g. white text on a dark background).',
          de: 'Die vollständige Hintergrundfarbpalette. Wählt automatisch eine kontrastierende Textfarbe (z. B. weißer Text auf dunklem Hintergrund).',
        },
        demo: '<span class="badge bg-primary">Pri</span> <span class="badge bg-success">Suc</span> <span class="badge bg-danger">Dan</span>',
        tags: ['color'],
      },
      {
        id: 'bg-primary-subtle',
        classes: [['.bg-primary-subtle', '.bg-success-subtle'], ['.bg-danger-subtle', '.bg-warning-subtle'], ['.bg-info-subtle', '.bg-dark-subtle'], ['.bg-surface-subtle', '.bg-body-subtle'], ['.bg-secondary-subtle', '.bg-light-subtle', '.bg-white-subtle']],
        desc: {
          pl: 'Subtelne tła (10% krycia). Automatycznie ustawiają kolor tekstu na dopasowany. Idealne do badge\'y i wyróżnień.',
          en: 'Subtle backgrounds (10% opacity). Automatically set a matching text color. Perfect for badges and highlights.',
          de: 'Dezente Hintergründe (10 % Deckkraft). Setzen automatisch eine passende Textfarbe. Ideal für Badges und Hervorhebungen.',
        },
        demo: '<span class="badge bg-primary-subtle">Pri</span> <span class="badge bg-success-subtle">Suc</span> <span class="badge bg-danger-subtle">Dan</span>',
        tags: ['color'],
      },
      {
        id: 'bg-hover-*',
        classes: [['.bg-hover-*', '.text-hover-*', '.border-hover-*']],
        desc: {
          pl: 'Zmiana koloru tła, tekstu lub ramki po najechaniu myszką - pełna paleta (primary, success, danger, warning, info, dark, light, secondary, surface, body). Np. <code>.bg-hover-success</code>.',
          en: 'Changes the background, text, or border color on hover - the full palette (primary, success, danger, warning, info, dark, light, secondary, surface, body). E.g. <code>.bg-hover-success</code>.',
          de: 'Ändert die Hintergrund-, Text- oder Rahmenfarbe bei Hover - die vollständige Palette (primary, success, danger, warning, info, dark, light, secondary, surface, body). Z. B. <code>.bg-hover-success</code>.',
        },
        demo: {
          pl: '<span class="badge bg-surface bg-hover-success border cursor-pointer" >Najedź</span >',
          en: '<span class="badge bg-surface bg-hover-success border cursor-pointer" >Hover me</span >',
          de: '<span class="badge bg-surface bg-hover-success border cursor-pointer" >Hovern</span >',
        },
        tags: ['color', 'state'],
      },
      {
        id: 'opacity-0',
        classes: [['.opacity-0', '..', '.opacity-100', '.hover-opacity-100']],
        desc: {
          pl: 'Krycie: 0, 25, 50, 75, 100. <code>.hover-opacity-100</code> przywraca pełne krycie po najechaniu (przygaszone miniatury, logotypy).',
          en: 'Opacity: 0, 25, 50, 75, 100. <code>.hover-opacity-100</code> restores full opacity on hover (dimmed thumbnails, logos).',
          de: 'Deckkraft: 0, 25, 50, 75, 100. <code>.hover-opacity-100</code> stellt beim Hover volle Deckkraft wieder her (gedimmte Thumbnails, Logos).',
        },
        demo: '<span class="opacity-50">50%</span>',
        tags: ['visibility', 'state'],
      },
    ],
  },
  {
    id: 'obramowania-cienie-i-ksztalty',
    title: {
      pl: 'Obramowania, cienie i kształty',
      en: 'Borders, shadows and shapes',
      de: 'Rahmen, Schatten und Formen',
    },
    rows: [
      {
        id: 'border',
        classes: [['.border', '.border-0']],
        desc: {
          pl: 'Dodawanie lub usuwanie obramowania (1px solid). Warianty: <code>-top</code>, <code>-bottom</code>, <code>-left</code>, <code>-right</code>.',
          en: 'Adding or removing a border (1px solid). Variants: <code>-top</code>, <code>-bottom</code>, <code>-left</code>, <code>-right</code>.',
          de: 'Hinzufügen oder Entfernen eines Rahmens (1px solid). Varianten: <code>-top</code>, <code>-bottom</code>, <code>-left</code>, <code>-right</code>.',
        },
        demo: {
          pl: '<div class="border p-1 text-center text-4">Ramka</div>',
          en: '<div class="border p-1 text-center text-4">Border</div>',
          de: '<div class="border p-1 text-center text-4">Rahmen</div>',
        },
      },
      {
        id: 'border-top',
        classes: [['.border-top', '.border-bottom', '.border-start', '.border-end'], ['.border-top-0', '.border-bottom-0', '.border-start-0', '.border-end-0'], ['.border-left', '.border-right', '.border-left-0', '.border-right-0']],
        desc: {
          pl: 'Obramowanie pojedynczej krawędzi; wersja <code>-0</code> zdejmuje je z tej krawędzi. <code>start</code>/<code>end</code> to nazwy logiczne, <code>left</code>/<code>right</code> - ich fizyczne aliasy.',
          en: 'A border on a single edge; the <code>-0</code> version removes it from that edge. <code>start</code>/<code>end</code> are the logical names, <code>left</code>/<code>right</code> their physical aliases.',
          de: 'Ein Rahmen an einer einzelnen Kante; die <code>-0</code>-Variante entfernt ihn dort. <code>start</code>/<code>end</code> sind die logischen Namen, <code>left</code>/<code>right</code> ihre physischen Aliase.',
        },
        demo: '-',
      },
      {
        id: 'rounded-0',
        classes: [['.rounded-0', '..', '.rounded-5'], ['.border-radius-0', '..', '-5']],
        desc: {
          pl: 'Skala zaokrągleń rogów, od ostrego do bardzo miękkiego. <code>.border-radius-N</code> to alias <code>.rounded-N</code> - ta sama reguła, dwie nazwy.',
          en: 'The corner-radius scale, from square to very soft. <code>.border-radius-N</code> is an alias of <code>.rounded-N</code> - one rule, two names.',
          de: 'Die Skala für Eckenrundungen, von kantig bis sehr weich. <code>.border-radius-N</code> ist ein Alias von <code>.rounded-N</code> - eine Regel, zwei Namen.',
        },
        demo: '<div class="bg-dark rounded-5" style="width: 20px; height: 20px; margin: 0 auto" ></div>',
        tags: ['radius'],
      },
      {
        id: 'rounded-top',
        classes: [['.rounded-top', '.rounded-bottom']],
        desc: {
          pl: 'Zaokrąglenie tylko górnych albo tylko dolnych rogów (obok istniejących <code>.rounded-top-0</code> i <code>.rounded-bottom-0</code>, które je zerują).',
          en: 'Rounds only the top or only the bottom corners (next to the existing <code>.rounded-top-0</code> and <code>.rounded-bottom-0</code>, which zero them).',
          de: 'Rundet nur die oberen oder nur die unteren Ecken (neben den vorhandenen <code>.rounded-top-0</code> und <code>.rounded-bottom-0</code>, die sie nullen).',
        },
        demo: '-',
        tags: ['radius'],
      },
      {
        id: 'rounded-top-0',
        classes: [['.rounded-top-0', '.rounded-bottom-0']],
        desc: {
          pl: 'Usuwanie zaokrągleń z konkretnych stron.',
          en: 'Removing rounding from specific sides.',
          de: 'Entfernen der Abrundung von bestimmten Seiten.',
        },
        demo: '-',
        tags: ['radius'],
      },
      {
        id: 'rounded-circle',
        classes: [['.rounded-circle', '.rounded-pill']],
        desc: {
          pl: 'Idealne koło (50%) lub kształt pigułki.',
          en: 'A perfect circle (50%) or a pill shape.',
          de: 'Ein perfekter Kreis (50 %) oder eine Pillenform.',
        },
        demo: '<div class="bg-primary rounded-circle" style="width: 20px; height: 20px; margin: 0 auto" ></div>',
        tags: ['radius'],
      },
      {
        id: 'shadow-sm',
        classes: [['.shadow-sm', '.shadow', '.shadow-lg', '.shadow-none']],
        desc: {
          pl: 'Cień rzucany: mały, średni (<code>.shadow</code>), duży. <code>.shadow-none</code> zdejmuje cień, np. z karty. Wartości z tokenów <code>--shadow-sm/-md/-lg</code>.',
          en: 'Drop shadow: small, medium (<code>.shadow</code>), large. <code>.shadow-none</code> removes one, e.g. from a card. Values come from the <code>--shadow-sm/-md/-lg</code> tokens.',
          de: 'Schlagschatten: klein, mittel (<code>.shadow</code>), groß. <code>.shadow-none</code> entfernt ihn, z. B. von einer Karte. Die Werte stammen aus <code>--shadow-sm/-md/-lg</code>.',
        },
        demo: '<div class="bg-surface shadow rounded-2" style="width: 28px; height: 20px; margin: 0 auto"></div>',
        tags: ['shadow'],
      },
      {
        id: 'corner-cut-*',
        classes: [['.corner-cut-*', '.corner-concave-*']],
        desc: {
          pl: 'Odcięte lub wklęsłe narożniki (mask-image). Warianty: tl, tr, bl, br.',
          en: 'Cut-off or concave corners (mask-image). Variants: tl, tr, bl, br.',
          de: 'Abgeschnittene oder konkave Ecken (mask-image). Varianten: tl, tr, bl, br.',
        },
        demo: '-',
        tags: ['radius'],
      },
    ],
  },
  {
    id: 'przyciski-i-badge',
    title: {
      pl: 'Przyciski i badge',
      en: 'Buttons and badges',
      de: 'Buttons und Badges',
    },
    rows: [
      {
        id: 'btn',
        classes: [['.btn', '.btn-primary', '.btn-danger']],
        desc: {
          pl: 'Podstawowy przycisk. Wymuszone 44px wysokości na mobile (A11y).',
          en: 'The base button. Forces a 44px height on mobile (A11y).',
          de: 'Der Basis-Button. Erzwingt 44px Höhe auf Mobilgeräten (A11y).',
        },
        demo: {
          pl: '<button class="btn btn-primary btn-sm">Przycisk</button>',
          en: '<button class="btn btn-primary btn-sm">Button</button>',
          de: '<button class="btn btn-primary btn-sm">Button</button>',
        },
        tags: ['color'],
      },
      {
        id: 'btn-xs',
        classes: [['.btn-xs', '.btn-sm', '.btn-lg', '.btn-xl']],
        desc: {
          pl: 'Warianty wielkości przycisku. Sam <code>.btn</code> (bez modyfikatora) to wariant środkowy (<code>.btn-md</code>).',
          en: 'Button size variants. Plain <code>.btn</code> (no modifier) is the middle variant (<code>.btn-md</code>).',
          de: 'Größenvarianten des Buttons. Reines <code>.btn</code> (ohne Modifikator) ist die mittlere Variante (<code>.btn-md</code>).',
        },
        demo: '<div class="d-flex align-items-center gap-2"> <button class="btn btn-primary btn-xs">xs</button> <button class="btn btn-primary btn-lg">lg</button> </div>',
        tags: ['width'],
      },
      {
        id: 'btn-group',
        classes: [['.btn-group']],
        desc: {
          pl: 'Grupuje przyciski w jeden spójny blok (wspólne, nakładające się ramki, bez podwójnych linii na stykach).',
          en: 'Groups buttons into one cohesive block (shared, overlapping borders, no double lines at the seams).',
          de: 'Gruppiert Buttons zu einem zusammenhängenden Block (gemeinsame, überlappende Rahmen, keine doppelten Linien an den Nahtstellen).',
        },
        demo: '<div class="btn-group"> <button class="btn btn-secondary btn-sm">A</button> <button class="btn btn-secondary btn-sm">B</button> <button class="btn btn-secondary btn-sm">C</button> </div>',
        tags: ['state'],
      },
      {
        id: 'btn-outline-primary',
        classes: [['.btn-outline-primary'], ['.btn-outline-*']],
        desc: {
          pl: 'Wariant obrysowy dla każdego koloru: przezroczyste tło, kolorowa ramka i tekst, wypełnienie na hover. <code>.btn-outline-soft</code> łagodzi obrys (ramka 30%, tło hover 10%) i dokłada się do wariantu koloru.',
          en: 'The outline variant for every colour: transparent background, coloured border and text, filled on hover. <code>.btn-outline-soft</code> softens the outline (30% border, 10% hover background) and is added on top of a colour variant.',
          de: 'Die Umriss-Variante für jede Farbe: transparenter Hintergrund, farbiger Rahmen und Text, gefüllt beim Hover. <code>.btn-outline-soft</code> mildert den Umriss (Rahmen 30 %, Hover-Hintergrund 10 %) und wird zur Farbvariante ergänzt.',
        },
        demo: '<button class="btn btn-outline-primary btn-sm"> Outline </button>',
        tags: ['color'],
      },
      {
        id: 'btn-icon',
        classes: [['.btn-icon', '.btn-icon-sm', '.btn-icon-lg']],
        desc: {
          pl: 'Przycisk tylko-ikona: stały kwadrat przez <code>--btn-icon-size</code>, bez paddingu. Dodaj <code>.rounded-circle</code> dla koła.',
          en: 'Icon-only button: a fixed square via <code>--btn-icon-size</code>, no padding. Add <code>.rounded-circle</code> for a circle.',
          de: 'Button nur mit Icon: festes Quadrat über <code>--btn-icon-size</code>, ohne Padding. Fügen Sie <code>.rounded-circle</code> für einen Kreis hinzu.',
        },
        demo: {
          pl: '<button class="btn btn-outline-primary btn-icon" aria-label="Odtwórz"> <svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#ph-play"></use></svg> </button>',
          en: '<button class="btn btn-outline-primary btn-icon" aria-label="Play"> <svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#ph-play"></use></svg> </button>',
          de: '<button class="btn btn-outline-primary btn-icon" aria-label="Abspielen"> <svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#ph-play"></use></svg> </button>',
        },
        tags: ['icon', 'a11y'],
      },
      {
        id: 'btn-action',
        classes: [['.btn-action']],
        desc: {
          pl: 'Ghost button (bez tła i ramki). Idealny do tabel i pasków narzędzi.',
          en: 'A ghost button (no background or border). Perfect for tables and toolbars.',
          de: 'Ein Ghost Button (ohne Hintergrund und Rahmen). Ideal für Tabellen und Werkzeugleisten.',
        },
        demo: {
          pl: '<button class="btn-action"> <i class="icon-edit"></i> Edytuj </button>',
          en: '<button class="btn-action"> <i class="icon-edit"></i> Edit </button>',
          de: '<button class="btn-action"> <i class="icon-edit"></i> Bearbeiten </button>',
        },
        tags: ['table', 'icon'],
      },
      {
        id: 'btn-action-group',
        classes: [['.btn-action-group', '.with-dividers']],
        desc: {
          pl: 'Grupuje przyciski akcji, dodając między nimi pionowe separatory.',
          en: 'Groups action buttons together, adding vertical dividers between them.',
          de: 'Gruppiert Aktions-Buttons und fügt vertikale Trennstriche zwischen ihnen ein.',
        },
        demo: '<div class="btn-action-group with-dividers"> <button class="btn-action px-2 py-1">A</button> <button class="btn-action px-2 py-1">B</button> </div>',
        tags: ['table', 'form'],
      },
      {
        id: 'badge',
        classes: [['.badge', '.badge-success'], ['.badge-*']],
        desc: {
          pl: 'Plakietka statusu. Wariant kolorystyczny dla każdego koloru semantycznego (<code>.badge-primary</code>, <code>-secondary</code>, <code>-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>, <code>-dark</code>).',
          en: 'A status badge. A colour variant exists for every semantic colour (<code>.badge-primary</code>, <code>-secondary</code>, <code>-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>, <code>-dark</code>).',
          de: 'Ein Status-Badge. Für jede semantische Farbe gibt es eine Variante (<code>.badge-primary</code>, <code>-secondary</code>, <code>-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>, <code>-dark</code>).',
        },
        demo: {
          pl: '<span class="badge badge-success">Sukces</span>',
          en: '<span class="badge badge-success">Success</span>',
          de: '<span class="badge badge-success">Erfolg</span>',
        },
        tags: ['color', 'state'],
      },
      {
        id: 'btn-glow',
        classes: [['.btn-glow']],
        desc: {
          pl: 'Dodaje neonową poświatę (box-shadow) na hover.',
          en: 'Adds a neon glow (box-shadow) on hover.',
          de: 'Fügt bei Hover ein Neon-Leuchten (box-shadow) hinzu.',
        },
        demo: '<button class="btn btn-primary btn-sm btn-glow"> Glow </button>',
        tags: ['animation'],
      },
      {
        id: 'btn-glass',
        classes: [['.btn-glass']],
        desc: {
          pl: 'Efekt szkła (Glassmorphism). Idealny na ciemne tła i wideo.',
          en: 'A glass effect (glassmorphism). Perfect on dark backgrounds and video.',
          de: 'Ein Glaseffekt (Glassmorphism). Ideal auf dunklen Hintergründen und Video.',
        },
        demo: '<button class="btn btn-glass btn-sm">Glass</button>',
        demoAttrs: 'class="bg-dark p-2 rounded"',
        tags: ['overlay'],
      },
      {
        id: 'btn-3d',
        classes: [['.btn-3d']],
        desc: {
          pl: 'Fizyczny przycisk, który "wciska się" po kliknięciu. Wymaga zmiennej <code>--btn-3d-shadow</code>.',
          en: 'A physical button that "presses in" when clicked. Requires the <code>--btn-3d-shadow</code> variable.',
          de: 'Ein physischer Button, der sich beim Klicken "hineindrückt". Erfordert die Variable <code>--btn-3d-shadow</code>.',
        },
        demo: '<button class="btn btn-primary btn-sm btn-3d"> Push Me </button>',
      },
      {
        id: 'btn-shine',
        classes: [['.btn-shine']],
        desc: {
          pl: 'Przesuwający się błysk światła na hover.',
          en: 'A sweeping light flash on hover.',
          de: 'Ein über den Button laufender Lichtreflex.',
        },
        demo: '<button class="btn btn-dark btn-sm btn-shine">Shine</button>',
        tags: ['animation'],
      },
      {
        id: 'btn-gradient',
        classes: [['.btn-gradient']],
        desc: {
          pl: 'Płynący, animowany gradient tła.',
          en: 'A flowing, animated background gradient.',
          de: 'Ein fließender, animierter Hintergrundverlauf.',
        },
        demo: '<button class="btn btn-gradient btn-sm">Gradient</button>',
        tags: ['color'],
      },
      {
        id: 'btn-secondary',
        classes: [['.btn-secondary']],
        desc: {
          pl: 'Akcja drugoplanowa: Anuluj, Wstecz.',
          en: 'A secondary action: Cancel, Back.',
          de: 'Eine Nebenaktion: Abbrechen, Zurück.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-success',
        classes: [['.btn-success']],
        desc: {
          pl: 'Potwierdzenie, zakończenie procesu.',
          en: 'Confirmation, process completion.',
          de: 'Bestätigung, Abschluss eines Prozesses.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-warning',
        classes: [['.btn-warning']],
        desc: {
          pl: 'Akcja wymagająca uwagi.',
          en: 'An action that needs attention.',
          de: 'Eine Aktion, die Aufmerksamkeit erfordert.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-info',
        classes: [['.btn-info']],
        desc: {
          pl: 'Akcja neutralna, informacyjna.',
          en: 'A neutral, informational action.',
          de: 'Eine neutrale, informative Aktion.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-dark',
        classes: [['.btn-dark']],
        desc: {
          pl: 'Kontrast do tła. Odwraca się w dark mode razem z <code>--dark</code>.',
          en: 'Contrast against the background. Inverts in dark mode along with <code>--dark</code>.',
          de: 'Kontrast zum Hintergrund. Invertiert sich im Dark Mode zusammen mit <code>--dark</code>.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-light',
        classes: [['.btn-light']],
        desc: {
          pl: 'Przycisk na ciemnym tle.',
          en: 'A button on a dark background.',
          de: 'Ein Button auf dunklem Hintergrund.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-md',
        classes: [['.btn-md']],
        desc: {
          pl: 'Jawnie zapisany rozmiar domyślny.',
          en: 'The default size, spelled out explicitly.',
          de: 'Explizit ausgeschriebene Standardgröße.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-hover-spring',
        classes: [['.btn-hover-spring']],
        desc: {
          pl: 'Powiększenie ze sprężystym wyhamowaniem.',
          en: 'Scaling up with a springy overshoot.',
          de: 'Vergrößerung mit federndem Ausschwingen.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-hover-lift',
        classes: [['.btn-hover-lift']],
        desc: {
          pl: 'Uniesienie do góry.',
          en: 'Lifting upward.',
          de: 'Anheben nach oben.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'btn-hover-glow',
        classes: [['.btn-hover-glow']],
        desc: {
          pl: 'Poświata wokół przycisku.',
          en: 'A glow around the button.',
          de: 'Ein Schimmer um den Button.',
        },
        demo: '-',
        source: 'docs-buttons',
      },
      {
        id: 'is-active',
        classes: [['.is-active']],
        desc: {
          pl: 'Wciśnięta pozycja w grupie.',
          en: 'The pressed position in a group.',
          de: 'Die gedrückte Position in einer Gruppe.',
        },
        demo: '-',
        tags: ['state'],
        source: 'docs-buttons',
      },
      {
        id: 'btn-magnetic',
        classes: [['.btn-magnetic']],
        desc: {
          pl: 'Przycisk CTA, który ma „przyciągać" kursor na desktopie.',
          en: 'A CTA button meant to "attract" the cursor on desktop.',
          de: 'Ein CTA-Button, der den Cursor auf dem Desktop „anziehen" soll.',
        },
        demo: '-',
        cssless: true,
        source: 'docs-widgets',
      },
      {
        id: 'btn-stacked',
        classes: [['.btn-stacked', '.btn-text']],
        desc: {
          pl: 'Przycisk z ikoną NAD podpisem zamiast obok. Podpis owija się w <code>.btn-text</code> - to etykieta wewnątrz przycisku, nie osobny wariant przycisku.',
          en: 'A button with the icon ABOVE the label instead of beside it. The label goes in <code>.btn-text</code> - a label inside the button, not a separate button variant.',
          de: 'Ein Button mit dem Symbol ÜBER der Beschriftung statt daneben. Die Beschriftung kommt in <code>.btn-text</code> - eine Beschriftung im Button, keine eigene Button-Variante.',
        },
        demo: '-',
        tags: ['icon'],
      },
    ],
  },
  {
    id: 'formularze',
    title: {
      pl: 'Formularze',
      en: 'Forms',
      de: 'Formulare',
    },
    rows: [
      {
        id: 'input',
        classes: [['.input']],
        desc: {
          pl: 'Podstawowe pole tekstowe lub select. Posiada focus ring.',
          en: 'A basic text field or select. Has a focus ring.',
          de: 'Ein einfaches Textfeld oder Select. Besitzt einen Fokusring.',
        },
        demo: {
          pl: '<input type="text" class="input p-1 text-4" placeholder="Wpisz..." style="min-height: 30px" />',
          en: '<input type="text" class="input p-1 text-4" placeholder="Type..." style="min-height: 30px" />',
          de: '<input type="text" class="input p-1 text-4" placeholder="Eingeben..." style="min-height: 30px" />',
        },
        tags: ['form'],
      },
      {
        id: 'input-sm',
        classes: [['.input-sm', '.input-lg']],
        desc: {
          pl: 'Warianty wielkości <code>.input</code> - działają na inputach, selectach i textarea. Sam <code>.input</code> (bez modyfikatora) to wariant środkowy.',
          en: 'Size variants of <code>.input</code> - work on inputs, selects, and textareas. Plain <code>.input</code> (no modifier) is the middle variant.',
          de: 'Größenvarianten von <code>.input</code> - funktionieren bei Inputs, Selects und Textareas. Reines <code>.input</code> (ohne Modifikator) ist die mittlere Variante.',
        },
        demo: '<div class="d-flex align-items-center gap-2"> <input type="text" class="input input-sm p-1 text-4" placeholder="sm" style="max-width: 70px" /> <input type="text" class="input input-lg p-1 text-4" placeholder="lg" style="max-width: 90px" /> </div>',
        tags: ['form', 'width'],
      },
      {
        id: 'textarea-expandable',
        classes: [['.textarea-expandable']],
        desc: {
          pl: 'Textarea zwinięta do jednej linijki. Rozwija się po kliknięciu (lub gdy ma treść) do <code>--textarea-rows-expanded</code> wierszy, dalej przewija się w środku. Wymaga atrybutu <code>placeholder</code>.',
          en: 'A textarea collapsed to a single line. Expands on click (or when it has content) up to <code>--textarea-rows-expanded</code> rows, then scrolls internally. Requires the <code>placeholder</code> attribute.',
          de: 'Ein auf eine Zeile zusammengeklapptes Textarea. Klappt sich bei Klick (oder wenn es Inhalt hat) auf <code>--textarea-rows-expanded</code> Zeilen auf, danach scrollt es intern. Erfordert das Attribut <code>placeholder</code>.',
        },
        demo: {
          pl: '<textarea class="input textarea-expandable p-1 text-4" rows="1" placeholder="Kliknij…" style="max-width: 140px" ></textarea>',
          en: '<textarea class="input textarea-expandable p-1 text-4" rows="1" placeholder="Click…" style="max-width: 140px" ></textarea>',
          de: '<textarea class="input textarea-expandable p-1 text-4" rows="1" placeholder="Klicken…" style="max-width: 140px" ></textarea>',
        },
        tags: ['form', 'zerojs'],
      },
      {
        id: 'form-floating',
        classes: [['.form-floating']],
        desc: {
          pl: 'Kontener dla pływających etykiet (wymaga <code>placeholder=" "</code> w inpucie).',
          en: 'A container for floating labels (requires <code>placeholder=" "</code> on the input).',
          de: 'Ein Container für schwebende Labels (erfordert <code>placeholder=" "</code> am Input).',
        },
        demo: '-',
        tags: ['form', 'spacing'],
      },
      {
        id: 'input-group',
        classes: [['.input-group', '.input-group-text']],
        desc: {
          pl: 'Łączy inputy, przyciski i teksty w jeden gładki prostokąt.',
          en: 'Combines inputs, buttons, and text into one smooth rectangle.',
          de: 'Verbindet Inputs, Buttons und Text zu einem glatten Rechteck.',
        },
        demo: {
          pl: '<div class="input-group"> <input type="text" class="input p-1 text-4" style="min-height: 30px" aria-label="Przykład: pole tekstowe z przyciskiem" /> <button class="btn btn-primary p-1 text-4" style="min-height: 30px" > OK </button> </div>',
          en: '<div class="input-group"> <input type="text" class="input p-1 text-4" style="min-height: 30px" aria-label="Example: text field with a button" /> <button class="btn btn-primary p-1 text-4" style="min-height: 30px" > OK </button> </div>',
          de: '<div class="input-group"> <input type="text" class="input p-1 text-4" style="min-height: 30px" aria-label="Beispiel: Textfeld mit Button" /> <button class="btn btn-primary p-1 text-4" style="min-height: 30px" > OK </button> </div>',
        },
        tags: ['form'],
      },
      {
        id: 'form-switch',
        classes: [['.form-switch', '.form-switch-square', '.form-switch-outline']],
        desc: {
          pl: 'Przełącznik w stylu iOS. Wymaga <code>.form-switch-input</code> i <code>.form-switch-label</code>.',
          en: 'An iOS-style toggle switch. Requires <code>.form-switch-input</code> and <code>.form-switch-label</code>.',
          de: 'Ein Umschalter im iOS-Stil. Erfordert <code>.form-switch-input</code> und <code>.form-switch-label</code>.',
        },
        demo: {
          pl: '<label class="form-switch m-0"> <input type="checkbox" class="form-switch-input" checked aria-label="Przykład: przełącznik" /> </label>',
          en: '<label class="form-switch m-0"> <input type="checkbox" class="form-switch-input" checked aria-label="Example: switch" /> </label>',
          de: '<label class="form-switch m-0"> <input type="checkbox" class="form-switch-input" checked aria-label="Beispiel: Umschalter" /> </label>',
        },
        tags: ['form', 'state', 'zerojs'],
      },
      {
        id: 'form-check-input',
        classes: [['.form-check-input', '.form-check-label']],
        desc: {
          pl: 'Customowe checkboxy i radio buttons oparte na CSS.',
          en: 'Custom checkboxes and radio buttons built on CSS.',
          de: 'Auf CSS basierende, individuell gestaltete Checkboxen und Radiobuttons.',
        },
        demo: {
          pl: '<input type="checkbox" class="form-check-input m-0" checked aria-label="Przykład: checkbox" />',
          en: '<input type="checkbox" class="form-check-input m-0" checked aria-label="Example: checkbox" />',
          de: '<input type="checkbox" class="form-check-input m-0" checked aria-label="Beispiel: Checkbox" />',
        },
        tags: ['form', 'state', 'a11y'],
      },
      {
        id: 'form-pill',
        classes: [['.form-pill']],
        desc: {
          pl: 'Opt-in na cel dotykowy: <code>&lt;label&gt;</code> owijający checkbox nie jest kontrolką, więc reguła 44 px go nie obejmuje - ta klasa go dopisuje. <strong>Nie nadaje żadnego wyglądu</strong>: do 1.7.32 spis obiecywał tu „klikalne pastylki" oraz klasy <code>.form-pill-group</code>, <code>.pill-success</code> i <code>.pill-danger</code>, których w CSS nigdy nie było. Wygląd pastylki złóż z <code>.border</code>, <code>.rounded-pill</code> i <code>.px-3</code>.',
          en: 'A touch-target opt-in: a <code>&lt;label&gt;</code> wrapping a checkbox is not a control, so the 44px rule does not reach it - this class adds it. <strong>It applies no styling at all</strong>: until 1.7.32 this list promised "clickable pills" plus the classes <code>.form-pill-group</code>, <code>.pill-success</code> and <code>.pill-danger</code>, none of which ever existed in the CSS. Build the pill look from <code>.border</code>, <code>.rounded-pill</code> and <code>.px-3</code>.',
          de: 'Ein Opt-in für die Touch-Zielgröße: ein <code>&lt;label&gt;</code> um eine Checkbox ist kein Bedienelement, die 44-px-Regel greift dort also nicht - diese Klasse ergänzt sie. <strong>Sie setzt keinerlei Gestaltung</strong>: bis 1.7.32 versprach diese Liste hier „klickbare Pillen" sowie die Klassen <code>.form-pill-group</code>, <code>.pill-success</code> und <code>.pill-danger</code>, die es im CSS nie gab. Die Pillen-Optik baust du aus <code>.border</code>, <code>.rounded-pill</code> und <code>.px-3</code>.',
        },
        demo: '-',
        tags: ['form', 'state'],
      },
      {
        id: 'custom-select',
        classes: [['.custom-select', '.custom-select-trigger']],
        desc: {
          pl: 'Premium Multi Select oparty na Popover API (top layer - nie jest przycinany w modalach). Zawiera <code>.custom-select-dropdown</code>, <code>.custom-select-option</code>.',
          en: 'A premium multi-select built on the Popover API (top layer - not clipped inside modals). Contains <code>.custom-select-dropdown</code>, <code>.custom-select-option</code>.',
          de: 'Ein Premium-Multi-Select auf Basis der Popover API (Top Layer - wird in Modalen nicht zugeschnitten). Enthält <code>.custom-select-dropdown</code>, <code>.custom-select-option</code>.',
        },
        demo: '-',
        tags: ['form', 'menu'],
      },
      {
        id: 'select-search',
        classes: [['.select-search']],
        desc: {
          pl: 'Pojedynczy Searchable Select (Combobox) oparty na Popover API (top layer - nie jest przycinany w modalach). Wymaga JS do obsługi wyboru. Wyszukiwarka opcjonalna - bez <code>.select-search-input</code> działa jak zwykły select.',
          en: 'A single searchable select (combobox) built on the Popover API (top layer - not clipped inside modals). Requires JS for selection handling. The search field is optional - without <code>.select-search-input</code> it works like a regular select.',
          de: 'Ein einzelnes durchsuchbares Select (Combobox) auf Basis der Popover API (Top Layer - wird in Modalen nicht zugeschnitten). Erfordert JS für die Auswahlbehandlung. Das Suchfeld ist optional - ohne <code>.select-search-input</code> funktioniert es wie ein gewöhnliches Select.',
        },
        demo: '-',
        tags: ['form', 'menu', 'modal'],
      },
      {
        id: 'file-upload',
        classes: [['.file-upload', '.file-upload-animated']],
        desc: {
          pl: 'Strefa Drag & Drop dla plików. Wariant animowany ma biegnącą ramkę.',
          en: 'A drag &amp; drop zone for files. The animated variant has a running border.',
          de: 'Eine Drag-&amp;-Drop-Zone für Dateien. Die animierte Variante hat einen laufenden Rahmen.',
        },
        demo: '-',
        tags: ['form'],
      },
      {
        id: 'input-range',
        classes: [['.input-range', '.input-color']],
        desc: {
          pl: 'Zaawansowane inputy z customowym wyglądem.',
          en: 'Advanced inputs with a custom look.',
          de: 'Fortgeschrittene Inputs mit individuellem Aussehen.',
        },
        demo: '-',
        tags: ['form'],
      },
      {
        id: 'feedback-invalid',
        classes: [['.feedback-invalid']],
        desc: {
          pl: 'Komunikat błędu. Pojawia się automatycznie dzięki <code>:user-invalid</code>.',
          en: 'An error message. Appears automatically via <code>:user-invalid</code>.',
          de: 'Eine Fehlermeldung. Erscheint automatisch dank <code>:user-invalid</code>.',
        },
        demo: '-',
        tags: ['form', 'feedback', 'zerojs'],
      },
      {
        id: 'form-check',
        classes: [['.form-check']],
        desc: {
          pl: 'Obudowa: ustawia kontrolkę i opis w jednej linii.',
          en: 'Wrapper: puts the control and description on one line.',
          de: 'Hülle: setzt Steuerelement und Beschreibung in eine Zeile.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-forms',
      },
      {
        id: 'file-upload-icon',
        classes: [['.file-upload-icon']],
        desc: {
          pl: 'Ikona w środku strefy.',
          en: 'Icon inside the zone.',
          de: 'Icon in der Mitte der Zone.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-forms',
      },
      {
        id: 'file-upload-name',
        classes: [['.file-upload-name']],
        desc: {
          pl: 'Podpis, który JS nadpisuje nazwą wybranego pliku. Opcjonalny w markupie - bez niego moduł dopisze go sam.',
          en: 'Caption that JS overwrites with the chosen filename. Optional in the markup - without it, the module adds it itself.',
          de: 'Beschriftung, die JS mit dem Namen der gewählten Datei überschreibt. Im Markup optional - ohne sie fügt das Modul sie selbst ein.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-forms',
      },
      {
        id: 'select-search-trigger',
        classes: [['.select-search-trigger']],
        desc: {
          pl: 'Przycisk otwierający. Wymaga <code>popovertarget</code> wskazującego na <code>id</code> menu.',
          en: 'The opening button. Requires <code>popovertarget</code> pointing to the menu\'s <code>id</code>.',
          de: 'Der öffnende Button. Benötigt <code>popovertarget</code>, das auf die <code>id</code> des Menüs zeigt.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'select-search-menu',
        classes: [['.select-search-menu']],
        desc: {
          pl: 'Panel. Wymaga atrybutu <code>popover</code> i unikalnego <code>id</code> - bez nich nie trafi do top layer i zniknie jak zwykły <code>&lt;div&gt;</code>.',
          en: 'The panel. Requires the <code>popover</code> attribute and a unique <code>id</code> - without them it won\'t land in the top layer and will vanish like a plain <code>&lt;div&gt;</code>.',
          de: 'Das Panel. Benötigt das Attribut <code>popover</code> und eine eindeutige <code>id</code> - ohne sie landet es nicht im Top Layer und verschwindet wie ein gewöhnliches <code>&lt;div&gt;</code>.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'select-search-input',
        classes: [['.select-search-input']],
        desc: {
          pl: 'Pole wyszukiwania. Opcjonalne.',
          en: 'The search field. Optional.',
          de: 'Das Suchfeld. Optional.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'select-search-list',
        classes: [['.select-search-list']],
        desc: {
          pl: 'Kontener opcji.',
          en: 'The options container.',
          de: 'Der Container für die Optionen.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'select-search-option',
        classes: [['.select-search-option']],
        desc: {
          pl: 'Pojedyncza opcja. Wymaga <code>data-value</code> - moduł czyta stąd wartość przy wyborze.',
          en: 'A single option. Requires <code>data-value</code> - the module reads the value from it on selection.',
          de: 'Eine einzelne Option. Benötigt <code>data-value</code> - von dort liest das Modul den Wert bei der Auswahl.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'is-selected',
        classes: [['.is-selected']],
        desc: {
          pl: 'Opcja aktualnie wybrana. Nadaje ją skrypt.',
          en: 'The currently selected option. Set by the script.',
          de: 'Die aktuell gewählte Option. Vom Skript gesetzt.',
        },
        demo: '-',
        tags: ['form', 'state'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-pills',
        classes: [['.custom-select-pills']],
        desc: {
          pl: 'Rząd tagów wybranych opcji, wewnątrz <code>.badge</code>.',
          en: 'A row of tags for the selected options, wrapped in <code>.badge</code>.',
          de: 'Eine Reihe von Tags der gewählten Optionen, in <code>.badge</code> gehüllt.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-dropdown',
        classes: [['.custom-select-dropdown']],
        desc: {
          pl: 'Panel. Wymaga <code>popover</code> i <code>id</code> - tak samo jak w selekcie pojedynczym.',
          en: 'The panel. Requires <code>popover</code> and <code>id</code> - just like the single select.',
          de: 'Das Panel. Benötigt <code>popover</code> und <code>id</code> - genau wie beim Einfach-Select.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-search',
        classes: [['.custom-select-search']],
        desc: {
          pl: 'Kontener pola wyszukiwania.',
          en: 'The search field\'s container.',
          de: 'Der Container des Suchfelds.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-list',
        classes: [['.custom-select-list']],
        desc: {
          pl: 'Kontener kategorii i opcji.',
          en: 'The container for categories and options.',
          de: 'Der Container für Kategorien und Optionen.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-category',
        classes: [['.custom-select-category']],
        desc: {
          pl: 'Nagłówek grupujący opcje.',
          en: 'A heading that groups options.',
          de: 'Eine Überschrift, die Optionen gruppiert.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'custom-select-option',
        classes: [['.custom-select-option']],
        desc: {
          pl: 'Na <code>&lt;label&gt;</code>. W środku zwykły <code>input[type="checkbox"].form-check-input</code>.',
          en: 'On a <code>&lt;label&gt;</code>. Contains a plain <code>input[type="checkbox"].form-check-input</code>.',
          de: 'Auf einem <code>&lt;label&gt;</code>. Darin ein gewöhnliches <code>input[type="checkbox"].form-check-input</code>.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'icon-chevron',
        classes: [['.icon-chevron']],
        desc: {
          pl: 'Strzałka w przycisku; obraca się o 180° po otwarciu.',
          en: 'The arrow on the button; rotates 180° once open.',
          de: 'Der Pfeil am Button; dreht sich beim Öffnen um 180°.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'search-icon',
        classes: [['.search-icon']],
        desc: {
          pl: 'Ikona lupy w polu wyszukiwania.',
          en: 'The magnifying-glass icon in the search field.',
          de: 'Das Lupen-Icon im Suchfeld.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'form-switch-input',
        classes: [['.form-switch-input']],
        desc: {
          pl: 'Sam checkbox, przestylowany na suwak 44×24px. Kolor zaznaczenia to zawsze <code>--success</code> - patrz pułapka nr 3.',
          en: 'The checkbox itself, restyled as a 44×24px slider. The checked color is always <code>--success</code> - see pitfall #3.',
          de: 'Die Checkbox selbst, umgestylt zu einem 44×24px-Schieberegler. Die Farbe im aktivierten Zustand ist immer <code>--success</code> - siehe Fallstrick Nr. 3.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
      {
        id: 'form-switch-label',
        classes: [['.form-switch-label']],
        desc: {
          pl: 'Podpis obok suwaka.',
          en: 'The caption next to the slider.',
          de: 'Die Beschriftung neben dem Schieberegler.',
        },
        demo: '-',
        tags: ['form'],
        source: 'docs-select',
      },
    ],
  },
  {
    id: 'tabele-i-wiersze-danych',
    title: {
      pl: 'Tabele i wiersze danych',
      en: 'Tables and data rows',
      de: 'Tabellen und Datenzeilen',
    },
    rows: [
      {
        id: 'table-wrapper',
        classes: [['.table-wrapper', '.table']],
        desc: {
          pl: 'Podstawowa tabela B2B. Warianty: <code>.table-sm</code>, <code>.table-lg</code>, <code>.table-striped</code>, <code>.table-hover</code>, <code>.table-borderless</code>.',
          en: 'The base B2B table. Variants: <code>.table-sm</code>, <code>.table-lg</code>, <code>.table-striped</code>, <code>.table-hover</code>, <code>.table-borderless</code>.',
          de: 'Die Basis-B2B-Tabelle. Varianten: <code>.table-sm</code>, <code>.table-lg</code>, <code>.table-striped</code>, <code>.table-hover</code>, <code>.table-borderless</code>.',
        },
        demo: '-',
        tags: ['table', 'scroll'],
      },
      {
        id: 'thead-light',
        classes: [['.thead-light', '.thead-dark', '.thead-primary']],
        desc: {
          pl: 'Kolory nagłówków tabeli. Warianty wielkości: <code>.thead-sm</code>, <code>.thead-lg</code>.',
          en: 'Table header colors. Size variants: <code>.thead-sm</code>, <code>.thead-lg</code>.',
          de: 'Farben der Tabellenkopfzeile. Größenvarianten: <code>.thead-sm</code>, <code>.thead-lg</code>.',
        },
        demo: '-',
        tags: ['table', 'color'],
      },
      {
        id: 'table-cards',
        classes: [['.table-cards', '.table-cards-always']],
        desc: {
          pl: 'Transformuje tabelę w karty na urządzeniach mobilnych (wymaga <code>data-label</code>).',
          en: 'Transforms the table into cards on mobile devices (requires <code>data-label</code>).',
          de: 'Verwandelt die Tabelle auf Mobilgeräten in Karten (erfordert <code>data-label</code>).',
        },
        demo: '-',
        tags: ['table', 'mobile', 'responsive'],
      },
      {
        id: 'data-row',
        classes: [['.data-row', '.data-row-actions']],
        desc: {
          pl: 'Szeroki wiersz danych oparty na CSS Grid (idealny do CRM).',
          en: 'A wide data row built on CSS Grid (great for CRMs).',
          de: 'Eine breite, auf CSS Grid basierende Datenzeile (ideal für CRM).',
        },
        demo: '-',
        tags: ['table', 'dashboard'],
      },
      {
        id: 'data-row-compact',
        classes: [['.data-row-compact', '.row-icon', '.row-content']],
        desc: {
          pl: 'Kompaktowy wiersz (List Item) oparty na Flexboxie. Wewnątrz <code>.row-content</code>: <code>.row-title</code> + <code>.row-details</code>; akcje po prawej w <code>.row-actions</code>. <strong>Tekst jest domyślnie OBCINANY</strong> wielokropkiem - dobre w gęstym dashboardzie, mylące na liście z opisem.',
          en: 'A compact row (list item) built on Flexbox. Inside <code>.row-content</code>: <code>.row-title</code> + <code>.row-details</code>; actions on the right in <code>.row-actions</code>. <strong>Text is TRUNCATED by default</strong> with an ellipsis - right for a dense dashboard, misleading on a list with descriptions.',
          de: 'Eine kompakte, auf Flexbox basierende Zeile (List Item). Innerhalb von <code>.row-content</code>: <code>.row-title</code> + <code>.row-details</code>; Aktionen rechts in <code>.row-actions</code>. <strong>Text wird standardmäßig ABGESCHNITTEN</strong> (Ellipse) - richtig im dichten Dashboard, irreführend in einer Liste mit Beschreibungen.',
        },
        demo: '-',
        tags: ['table', 'dashboard', 'clip'],
      },
      {
        id: 'data-row-compact-wrap',
        classes: [['.data-row-compact-wrap']],
        desc: {
          pl: 'Wyłącza obcinanie - tytuł i opis zawijają się zamiast znikać za wielokropkiem. Do listy pozycji z dłuższym tekstem, gdzie wiersze nie muszą mieć równej wysokości.',
          en: 'Turns truncation off - the title and details wrap instead of disappearing behind an ellipsis. For lists with longer text, where rows need not share one height.',
          de: 'Schaltet das Abschneiden ab - Titel und Details brechen um, statt hinter einer Ellipse zu verschwinden. Für Listen mit längerem Text, in denen Zeilen nicht gleich hoch sein müssen.',
        },
        demo: '-',
        tags: ['table', 'wrap', 'clip'],
      },
      {
        id: 'sortable-list',
        classes: [['.sortable-list', '.sortable-item', '.sortable-handle'], ['.sortable-controls', '.sortable-announcer']],
        desc: {
          pl: 'Zmiana kolejności - przeciąganiem (Pointer Events) LUB przyciskami <code>data-sortable-up</code>/<code>-down</code>. Wymaga <code>data-sortable</code> na kontenerze.',
          en: 'Reorder items - by dragging (Pointer Events) OR the <code>data-sortable-up</code>/<code>-down</code> buttons. Requires <code>data-sortable</code> on the container.',
          de: 'Reihenfolge ändern - per Drag (Pointer Events) ODER den Buttons <code>data-sortable-up</code>/<code>-down</code>. Erfordert <code>data-sortable</code> am Container.',
        },
        demo: '-',
        tags: ['order', 'a11y', 'mobile'],
      },
      {
        id: 'list-group',
        classes: [['.list-group', '.list-group-item']],
        desc: {
          pl: 'Prosta, pionowa lista elementów ze wspólnymi ramkami. Dodaj <code>.is-active</code> do zaznaczonego elementu.',
          en: 'A simple, vertical list of items with shared borders. Add <code>.is-active</code> to the selected item.',
          de: 'Eine einfache, vertikale Liste von Elementen mit gemeinsamen Rahmen. Fügen Sie <code>.is-active</code> zum ausgewählten Element hinzu.',
        },
        demo: {
          pl: '<div class="list-group w-100" style="max-width: 140px"> <span class="list-group-item p-1 text-4">Element A</span> <span class="list-group-item p-1 text-4 is-active" >Element B</span > </div>',
          en: '<div class="list-group w-100" style="max-width: 140px"> <span class="list-group-item p-1 text-4">Item A</span> <span class="list-group-item p-1 text-4 is-active" >Item B</span > </div>',
          de: '<div class="list-group w-100" style="max-width: 140px"> <span class="list-group-item p-1 text-4">Element A</span> <span class="list-group-item p-1 text-4 is-active" >Element B</span > </div>',
        },
        tags: ['menu', 'state'],
      },
      {
        id: 'sortable-content',
        classes: [['.sortable-content']],
        desc: {
          pl: 'Dowolna treść pozycji - tekst, badge, <code>.data-row-compact</code>.',
          en: 'Any item content - text, a badge, <code>.data-row-compact</code>.',
          de: 'Beliebiger Inhalt der Position - Text, Badge, <code>.data-row-compact</code>.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-admin',
      },
      {
        id: 'table-sm',
        classes: [['.table-sm']],
        desc: {
          pl: 'Kompaktowa - więcej wierszy na ekranie.',
          en: 'Compact - more rows on screen.',
          de: 'Kompakt - mehr Zeilen auf dem Bildschirm.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'table-lg',
        classes: [['.table-lg']],
        desc: {
          pl: 'Luźna - mało wierszy, dużo powietrza.',
          en: 'Loose - fewer rows, more breathing room.',
          de: 'Locker - wenige Zeilen, viel Luft.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'table-striped',
        classes: [['.table-striped']],
        desc: {
          pl: 'Naprzemienne tło wierszy.',
          en: 'Alternating row background.',
          de: 'Abwechselnder Zeilenhintergrund.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'table-hover',
        classes: [['.table-hover']],
        desc: {
          pl: 'Podświetlenie wiersza pod kursorem.',
          en: 'Highlights the row under the cursor.',
          de: 'Hervorhebung der Zeile unter dem Cursor.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'table-borderless',
        classes: [['.table-borderless']],
        desc: {
          pl: 'Bez linii - spokojniejszy odbiór.',
          en: 'No lines - a calmer look.',
          de: 'Ohne Linien - ruhigere Wirkung.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'thead-sm',
        classes: [['.thead-sm']],
        desc: {
          pl: 'Niższy nagłówek.',
          en: 'Shorter header.',
          de: 'Niedrigere Kopfzeile.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'thead-lg',
        classes: [['.thead-lg']],
        desc: {
          pl: 'Wyższy nagłówek.',
          en: 'Taller header.',
          de: 'Höhere Kopfzeile.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'icon-square',
        classes: [['.icon-square']],
        desc: {
          pl: 'Kwadratowe tło pod ikoną.',
          en: 'Square background behind the icon.',
          de: 'Quadratischer Hintergrund hinter dem Icon.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'row-title',
        classes: [['.row-title']],
        desc: {
          pl: 'Pierwszy wiersz - nazwa rekordu.',
          en: 'First line - the record\'s name.',
          de: 'Erste Zeile - Name des Datensatzes.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'row-details',
        classes: [['.row-details']],
        desc: {
          pl: 'Drugi wiersz - metadane, przygaszony.',
          en: 'Second line - metadata, muted.',
          de: 'Zweite Zeile - Metadaten, gedämpft.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
      {
        id: 'row-actions',
        classes: [['.row-actions']],
        desc: {
          pl: 'Przyciski po prawej.',
          en: 'Buttons on the right.',
          de: 'Buttons rechts.',
        },
        demo: '-',
        tags: ['table'],
        source: 'docs-tables',
      },
    ],
  },
  {
    id: 'uklad-tresci',
    title: {
      pl: 'Układ treści',
      en: 'Content layout',
      de: 'Inhaltslayout',
    },
    rows: [
      {
        id: 'accordion',
        classes: [['.accordion', '.accordion-item']],
        desc: {
          pl: 'Akordeon oparty na natywnym <code>&lt;details&gt;</code> z płynną animacją.',
          en: 'An accordion built on native <code>&lt;details&gt;</code> with a smooth animation.',
          de: 'Ein auf nativem <code>&lt;details&gt;</code> basierendes Akkordeon mit flüssiger Animation.',
        },
        demo: '-',
        tags: ['zerojs', 'visibility'],
      },
      {
        id: 'tabs',
        classes: [['.tabs', '.tab-input', '.tab-label'], ['.tabs-header', '.tab-pane']],
        desc: {
          pl: 'Zakładki oparte na CSS Radio Hack. Etykiety w <code>.tabs-header</code>, treść każdej zakładki w <code>.tab-pane</code>.',
          en: 'Tabs built on the CSS radio hack. Labels sit in <code>.tabs-header</code>, each tab\'s content in <code>.tab-pane</code>.',
          de: 'Auf dem CSS-Radio-Hack basierende Tabs. Beschriftungen in <code>.tabs-header</code>, Inhalt jedes Tabs in <code>.tab-pane</code>.',
        },
        demo: '-',
        tags: ['zerojs', 'a11y', 'visibility'],
      },
      {
        id: 'tabs-pill',
        classes: [['.tabs-pill', '.tabs-pill-indicator']],
        desc: {
          pl: 'Wariant <code>.tabs</code> jako Segmented Control - wskaźnik przesuwa się do klikniętej zakładki (CSS <code>:has()</code>, zero JS). Wymaga <code>style="--tab-count: N;"</code>.',
          en: 'A <code>.tabs</code> variant as a segmented control - the indicator slides to the clicked tab (CSS <code>:has()</code>, zero JS). Requires <code>style="--tab-count: N;"</code>.',
          de: 'Eine <code>.tabs</code>-Variante als Segmented Control - der Indikator gleitet zum angeklickten Tab (CSS <code>:has()</code>, null JS). Erfordert <code>style="--tab-count: N;"</code>.',
        },
        demo: '<div class="tabs tabs-pill" style="--tab-count: 2; max-width: 140px" > <input type="radio" name="cheatPillTabs" id="cheatPt1" class="tab-input" checked /> <input type="radio" name="cheatPillTabs" id="cheatPt2" class="tab-input" /> <div class="tabs-header"> <div class="tabs-pill-indicator"></div> <label for="cheatPt1" class="tab-label text-4 p-1" >A</label > <label for="cheatPt2" class="tab-label text-4 p-1" >B</label > </div> </div>',
        tags: ['zerojs', 'state'],
      },
      {
        id: 'grid-expand',
        classes: [['.grid-expand'], ['.grid-expand-inner']],
        desc: {
          pl: 'Płynny akordeon oparty na CSS Grid (<code >grid-template-rows: 0fr → 1fr</code >) - zero JS. Działa wewnątrz <code>&lt;details&gt;</code> lub z klasą <code>.is-open</code>.',
          en: 'A smooth accordion built on CSS Grid (<code >grid-template-rows: 0fr → 1fr</code >) - zero JS. Works inside <code>&lt;details&gt;</code> or with the <code>.is-open</code> class.',
          de: 'Ein auf CSS Grid basierendes, flüssiges Akkordeon (<code >grid-template-rows: 0fr → 1fr</code >) - null JS. Funktioniert innerhalb von <code>&lt;details&gt;</code> oder mit der Klasse <code>.is-open</code>.',
        },
        demo: {
          pl: '<details> <summary class="cursor-pointer text-4">Rozwiń</summary> <div class="grid-expand"> <div class="grid-expand-inner text-4 text-muted pt-1"> Ukryta treść. </div> </div> </details>',
          en: '<details> <summary class="cursor-pointer text-4">Expand</summary> <div class="grid-expand"> <div class="grid-expand-inner text-4 text-muted pt-1"> Hidden content. </div> </div> </details>',
          de: '<details> <summary class="cursor-pointer text-4"> Aufklappen </summary> <div class="grid-expand"> <div class="grid-expand-inner text-4 text-muted pt-1"> Verborgener Inhalt. </div> </div> </details>',
        },
        tags: ['animation', 'visibility', 'zerojs'],
      },
      {
        id: 'timeline',
        classes: [['.timeline', '.timeline-item']],
        desc: {
          pl: 'Klasyczna oś czasu. Warianty: <code>.timeline-large</code>, <code>.timeline-numbered</code>.',
          en: 'A classic timeline. Variants: <code>.timeline-large</code>, <code>.timeline-numbered</code>.',
          de: 'Eine klassische Zeitleiste. Varianten: <code>.timeline-large</code>, <code>.timeline-numbered</code>.',
        },
        demo: '-',
      },
      {
        id: 'timeline-labeled',
        classes: [['.timeline-labeled', '.timeline-label'], ['.timeline-separator', '.timeline-node', '.timeline-line'], ['.node-primary', '.node-success', '.node-danger']],
        desc: {
          pl: 'Zaawansowana oś czasu z datami po lewej stronie (oparta na Gridzie). Kolumna środkowa: <code>.timeline-separator</code> &gt; <code>.timeline-node</code> + <code>.timeline-line</code>; kolor węzła <code>.node-primary</code> / <code>.node-success</code> / <code>.node-danger</code>. Treść w <code>.timeline-content</code>.',
          en: 'An advanced timeline with dates on the left (built on Grid). Middle column: <code>.timeline-separator</code> &gt; <code>.timeline-node</code> + <code>.timeline-line</code>; node color <code>.node-primary</code> / <code>.node-success</code> / <code>.node-danger</code>. Content in <code>.timeline-content</code>.',
          de: 'Eine fortgeschrittene Zeitleiste mit Daten links (auf Grid basierend). Mittlere Spalte: <code>.timeline-separator</code> &gt; <code>.timeline-node</code> + <code>.timeline-line</code>; Knotenfarbe <code>.node-primary</code> / <code>.node-success</code> / <code>.node-danger</code>. Inhalt in <code>.timeline-content</code>.',
        },
        demo: '-',
        tags: ['align'],
      },
      {
        id: 'stepper',
        classes: [['.stepper', '.stepper-numbered'], ['.step', '.step-line']],
        desc: {
          pl: 'Wizualizacja kroków procesu (np. w koszyku). Każdy krok to <code>.step</code> (dodaj <code>.is-active</code> lub <code>.is-completed</code>), połączony <code>.step-line</code>.',
          en: 'A visualization of process steps (e.g. in a cart). Each step is a <code>.step</code> (add <code>.is-active</code> or <code>.is-completed</code>), connected by a <code>.step-line</code>.',
          de: 'Eine Visualisierung von Prozessschritten (z. B. im Warenkorb). Jeder Schritt ist ein <code>.step</code> (fügen Sie <code>.is-active</code> oder <code>.is-completed</code> hinzu), verbunden durch eine <code>.step-line</code>.',
        },
        demo: '-',
        tags: ['state'],
      },
      {
        id: 'carousel',
        classes: [['.carousel', '.carousel-track', '.carousel-dots'], ['.carousel-nav', '.carousel-prev', '.carousel-next', '.carousel-dot']],
        desc: {
          pl: 'Karuzela slajdów. Wariant <code>.carousel-bg-sync</code> synchronizuje tło sekcji ze slajdem. Wymaga <code>carousel.js</code> (autoloader).',
          en: 'A slide carousel. The <code>.carousel-bg-sync</code> variant syncs the section\'s background with the slide. Requires <code>carousel.js</code> (autoloader).',
          de: 'Ein Folien-Karussell. Die Variante <code>.carousel-bg-sync</code> synchronisiert den Hintergrund des Abschnitts mit der Folie. Erfordert <code>carousel.js</code> (Autoloader).',
        },
        demo: '-',
        tags: ['scroll', 'mobile'],
      },
      {
        id: 'carousel-bg-sync',
        classes: [['.carousel-bg-sync']],
        desc: {
          pl: 'Hero z pełnoekranowym tłem zmieniającym się per slajd.',
          en: 'A hero with a full-screen background that changes per slide.',
          de: 'Ein Hero mit vollflächigem Hintergrund, der pro Folie wechselt.',
        },
        demo: '-',
        source: 'docs-components-extra',
      },
      {
        id: 'carousel-slide',
        classes: [['.carousel-slide']],
        desc: {
          pl: '<code>scroll-snap-align: start</code>. Szerokość - Twoja, przez <code>min-width</code>.',
          en: '<code>scroll-snap-align: start</code>. Width is yours to set, via <code>min-width</code>.',
          de: '<code>scroll-snap-align: start</code>. Breite - Ihre Sache, über <code>min-width</code>.',
        },
        demo: '-',
        source: 'docs-components-extra',
      },
      {
        id: 'carousel-bg-overlay',
        classes: [['.carousel-bg-overlay']],
        desc: {
          pl: 'Półprzezroczysta nakładka nad tłem - zapewnia czytelność tekstu.',
          en: 'A semi-transparent overlay above the background - keeps text readable.',
          de: 'Eine halbtransparente Überlagerung über dem Hintergrund - sorgt für Textlesbarkeit.',
        },
        demo: '-',
        source: 'docs-components-extra',
      },
      {
        id: 'accordion-header',
        classes: [['.accordion-header']],
        desc: {
          pl: 'Klikalny pasek ze strzałką. Zmieści kilka elementów obok siebie (np. plakietkę i tekst) - zostaną przy lewej.',
          en: 'A clickable bar with an arrow. Fits several elements side by side (e.g. a badge and text) - they\'ll stay left-aligned.',
          de: 'Eine klickbare Leiste mit Pfeil. Bietet Platz für mehrere Elemente nebeneinander (z. B. eine Plakette und Text) - sie bleiben links ausgerichtet.',
        },
        demo: '-',
        source: 'docs-interactive',
      },
      {
        id: 'accordion-body',
        classes: [['.accordion-body']],
        desc: {
          pl: 'Rozwijana treść.',
          en: 'The expandable content.',
          de: 'Der aufklappbare Inhalt.',
        },
        demo: '-',
        source: 'docs-interactive',
      },
      {
        id: 'is-open',
        classes: [['.is-open']],
        desc: {
          pl: 'Dodajesz i zdejmujesz klasę sam - np. z własnego JS.',
          en: 'You add and remove the class yourself - e.g. from your own JS.',
          de: 'Sie fügen die Klasse selbst hinzu und entfernen sie - z. B. aus eigenem JS.',
        },
        demo: '-',
        tags: ['state'],
        source: 'docs-interactive',
      },
      {
        id: 'tabs-content',
        classes: [['.tabs-content']],
        desc: {
          pl: 'Kontener paneli.',
          en: 'The panel container.',
          de: 'Der Container der Panels.',
        },
        demo: '-',
        source: 'docs-interactive',
      },
      {
        id: 'timeline-content',
        classes: [['.timeline-content']],
        desc: {
          pl: 'Treść wydarzenia.',
          en: 'The event\'s content.',
          de: 'Der Inhalt des Ereignisses.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'timeline-badge',
        classes: [['.timeline-badge']],
        desc: {
          pl: 'Znacznik na osi w układzie podstawowym.',
          en: 'The marker on the axis in the basic layout.',
          de: 'Der Marker auf der Achse im grundlegenden Layout.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'timeline-large',
        classes: [['.timeline-large']],
        desc: {
          pl: 'Wariant z większymi odstępami.',
          en: 'A variant with larger spacing.',
          de: 'Eine Variante mit größeren Abständen.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'timeline-numbered',
        classes: [['.timeline-numbered']],
        desc: {
          pl: 'Numeruje wydarzenia automatycznie.',
          en: 'Numbers the events automatically.',
          de: 'Nummeriert die Ereignisse automatisch.',
        },
        demo: '-',
        source: 'docs-sections',
      },
      {
        id: 'is-completed',
        classes: [['.is-completed']],
        desc: {
          pl: 'Krok zakończony - wszystkie przed bieżącym.',
          en: 'A finished step - all of them before the current one.',
          de: 'Ein abgeschlossener Schritt - alle vor dem aktuellen.',
        },
        demo: '-',
        tags: ['state'],
        source: 'docs-sections',
      },
      {
        id: 'component-showcase',
        classes: [['.component-showcase', '.component-preview'], ['.component-code', '.btn-copy']],
        desc: {
          pl: 'Blok „podgląd + kod": <code>.component-preview</code> pokazuje żywy komponent, <code>.component-code</code> jego źródło, a <code>.btn-copy</code> kopiuje je do schowka (obsługa w rdzeniu <code>molique-script.js</code>, klasa <code>.is-copied</code> na czas potwierdzenia). <code>.component-code</code> działa też SAMO, bez opakowania w <code>.component-showcase</code> - wtedy niesie własną ramkę.',
          en: 'A "preview + code" block: <code>.component-preview</code> shows the live component, <code>.component-code</code> its source, and <code>.btn-copy</code> copies it to the clipboard (handled in the <code>molique-script.js</code> core, with <code>.is-copied</code> during the confirmation). <code>.component-code</code> also works ON ITS OWN, without the <code>.component-showcase</code> wrapper - it then carries its own border.',
          de: 'Ein Block aus „Vorschau + Code": <code>.component-preview</code> zeigt die lebende Komponente, <code>.component-code</code> ihren Quelltext, und <code>.btn-copy</code> kopiert ihn in die Zwischenablage (im Kern <code>molique-script.js</code> behandelt, mit <code>.is-copied</code> während der Bestätigung). <code>.component-code</code> funktioniert auch ALLEIN, ohne den <code>.component-showcase</code>-Wrapper - dann bringt es einen eigenen Rahmen mit.',
        },
        demo: '-',
      },
    ],
  },
  {
    id: 'wykresy',
    title: {
      pl: 'Wykresy (Data Viz)',
      en: 'Charts (data viz)',
      de: 'Diagramme (Data Viz)',
    },
    rows: [
      {
        id: 'r-chart-wrapper',
        classes: [['.r-chart-wrapper', '.chart-micro']],
        desc: {
          pl: 'Główny kontener wykresu. <code>.chart-micro</code> wymusza mały rozmiar (np. do kart).',
          en: 'The main chart container. <code>.chart-micro</code> forces a small size (e.g. for cards).',
          de: 'Der Hauptcontainer des Diagramms. <code>.chart-micro</code> erzwingt eine kleine Größe (z. B. für Karten).',
        },
        demo: '-',
        tags: ['chart', 'dashboard'],
      },
      {
        id: 'chart-sparkline',
        classes: [['.chart-sparkline', '.sparkline-bar']],
        desc: {
          pl: 'Wykres słupkowy. Wysokość sterowana zmienną <code>--val</code>.',
          en: 'A bar chart. Height controlled by the <code>--val</code> variable.',
          de: 'Ein Balkendiagramm. Höhe gesteuert über die Variable <code>--val</code>.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-radial',
        classes: [['.chart-radial', '.radial-value']],
        desc: {
          pl: 'Półotwarty pierścień postępu.',
          en: 'A semi-open progress ring.',
          de: 'Ein halboffener Fortschrittsring.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-heatmap',
        classes: [['.chart-heatmap', '.heatmap-cell']],
        desc: {
          pl: 'Mapa aktywności. Przezroczystość sterowana zmienną <code>--val</code>.',
          en: 'An activity map. Opacity controlled by the <code>--val</code> variable.',
          de: 'Eine Aktivitätskarte. Deckkraft gesteuert über die Variable <code>--val</code>.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-area',
        classes: [['.chart-area', '.area-fill']],
        desc: {
          pl: 'Wykres warstwowy oparty na czystym SVG.',
          en: 'An area chart built on pure SVG.',
          de: 'Ein auf reinem SVG basierendes Flächendiagramm.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-pie',
        classes: [['.chart-pie', '.pie-segment']],
        desc: {
          pl: 'Wykres kołowy/Donut. Wymaga zmiennych <code>--val</code> i <code>--offset</code>.',
          en: 'A pie/donut chart. Requires the <code>--val</code> and <code>--offset</code> variables.',
          de: 'Ein Torten-/Donut-Diagramm. Erfordert die Variablen <code>--val</code> und <code>--offset</code>.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-funnel',
        classes: [['.chart-funnel', '.funnel-stage']],
        desc: {
          pl: 'Pionowy lejek danych. W każdym etapie <code>.stage-label</code> (nazwa) i <code>.stage-value</code> (liczba).',
          en: 'A vertical data funnel. Each stage has a <code>.stage-label</code> (name) and <code>.stage-value</code> (number).',
          de: 'Ein vertikaler Datentrichter. Jede Stufe hat ein <code>.stage-label</code> (Name) und <code>.stage-value</code> (Zahl).',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-pipeline',
        classes: [['.chart-pipeline', '.pipeline-stage']],
        desc: {
          pl: 'Poziomy lejek procesowy (strzałki/chevrons).',
          en: 'A horizontal process pipeline (arrows/chevrons).',
          de: 'Ein horizontaler Prozesstrichter (Pfeile/Chevrons).',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-funnel-true',
        classes: [['.chart-funnel-true', '.funnel-true-stage']],
        desc: {
          pl: 'Klasyczny, trapezowy lejek konwersji z pionową nóżką.',
          en: 'A classic, trapezoidal conversion funnel with a vertical stem.',
          de: 'Ein klassischer, trapezförmiger Conversion-Trichter mit vertikalem Fuß.',
        },
        demo: '-',
        tags: ['chart'],
      },
      {
        id: 'chart-nav',
        classes: [['.chart-nav', '.chart-nav-item'], ['.nav-label']],
        desc: {
          pl: 'Elegancka nawigacja (Segmented Control) do przełączania widoków wykresów.',
          en: 'An elegant segmented control for switching chart views.',
          de: 'Eine elegante Segmented-Control-Navigation zum Umschalten der Diagrammansichten.',
        },
        demo: '-',
        tags: ['chart', 'state', 'zerojs'],
      },
      {
        id: 'area-line',
        classes: [['.area-line']],
        desc: {
          pl: 'Sama krzywa.',
          en: 'The curve itself.',
          de: 'Die Kurve selbst.',
        },
        demo: '-',
        tags: ['chart'],
        source: 'docs-charts',
      },
      {
        id: 'pie-bg',
        classes: [['.pie-bg']],
        desc: {
          pl: 'Szary pierścień tła, widoczny pod segmentami.',
          en: 'The gray background ring, visible under the segments.',
          de: 'Der graue Hintergrundring, sichtbar unter den Segmenten.',
        },
        demo: '-',
        tags: ['chart'],
        source: 'docs-charts',
      },
      {
        id: 'stage-label',
        classes: [['.stage-label']],
        desc: {
          pl: 'Nazwa etapu.',
          en: 'The stage\'s name.',
          de: 'Der Name der Stufe.',
        },
        demo: '-',
        tags: ['chart'],
        source: 'docs-charts',
      },
      {
        id: 'stage-value',
        classes: [['.stage-value']],
        desc: {
          pl: 'Liczba przy etapie.',
          en: 'The number next to the stage.',
          de: 'Die Zahl neben der Stufe.',
        },
        demo: '-',
        tags: ['chart'],
        source: 'docs-charts',
      },
    ],
  },
  {
    id: 'karty-i-kafelki',
    title: {
      pl: 'Karty i kafelki',
      en: 'Cards and tiles',
      de: 'Karten und Kacheln',
    },
    rows: [
      {
        id: 'card',
        classes: [['.card', '.card-header', '.card-body']],
        desc: {
          pl: 'Podstawowy kontener treści z zaokrągleniami i ramką.',
          en: 'A basic content container with rounded corners and a border.',
          de: 'Ein einfacher Inhaltscontainer mit abgerundeten Ecken und Rahmen.',
        },
        demo: '-',
        tags: ['card', 'clip'],
      },
      {
        id: 'card-overflow-visible',
        classes: [['.card-overflow-visible']],
        desc: {
          pl: 'Zdejmuje z karty przycinanie (<code>overflow: hidden</code>), gdy coś ma celowo wystawać poza krawędź: wstążka „Najczęściej wybierane", plakietka nad górną krawędzią, dropdown bez <code>popover</code>. Sam przywraca zaokrąglenie skrajnemu <code>img</code>/<code>picture</code>, więc nie naprawia wstążki kosztem zdjęcia.',
          en: 'Drops the card\'s clipping (<code>overflow: hidden</code>) when something is meant to stick out: a "Most popular" ribbon, a badge above the top edge, a dropdown without <code>popover</code>. It restores the corner rounding on a leading/trailing <code>img</code>/<code>picture</code>, so it does not fix the ribbon at the photo\'s expense.',
          de: 'Hebt das Zuschneiden der Karte auf (<code>overflow: hidden</code>), wenn etwas bewusst herausragen soll: eine „Am beliebtesten"-Schleife, ein Badge über der Oberkante, ein Dropdown ohne <code>popover</code>. Die Eckenrundung eines ersten oder letzten <code>img</code>/<code>picture</code> wird dabei wiederhergestellt - der Fix geht also nicht zulasten des Fotos.',
        },
        demo: '-',
        tags: ['card', 'clip', 'overlay'],
      },
      {
        id: 'featured-box',
        classes: [['.featured-box', '.featured-box-icon']],
        desc: {
          pl: 'Karta wyróżniająca cechę produktu (często z ikoną na górze).',
          en: 'A card highlighting a product feature (often with an icon at the top).',
          de: 'Eine Karte, die ein Produktmerkmal hervorhebt (oft mit einem Icon oben).',
        },
        demo: '-',
        tags: ['card', 'icon'],
      },
      {
        id: 'thumb-info',
        classes: [['.thumb-info']],
        desc: {
          pl: 'Karta ze zdjęciem w tle i tekstem pojawiającym się na hover.',
          en: 'A card with a background photo and text appearing on hover.',
          de: 'Eine Karte mit Hintergrundfoto und bei Hover erscheinendem Text.',
        },
        demo: '-',
        tags: ['card', 'overlay'],
      },
      {
        id: 'stat-tile',
        classes: [['.stat-tile', '.stat-tile-icon', '.stat-tile-body'], ['.stat-tile-label', '.stat-tile-value', '.stat-tile-delta'], ['.stat-tile-icon-*', '.stat-tile-delta-up', '.stat-tile-delta-down']],
        desc: {
          pl: 'Kafelek KPI (ikona + liczba o stałej wielkości + opcjonalna delta trendu). Wymaga <code>.card</code> na tym samym elemencie.',
          en: 'A KPI tile (icon + a fixed-size number + an optional trend delta). Requires <code>.card</code> on the same element.',
          de: 'Eine KPI-Kachel (Icon + Zahl mit fester Größe + optionales Trend-Delta). Erfordert <code>.card</code> am selben Element.',
        },
        demo: '-',
        tags: ['card', 'dashboard'],
      },
      {
        id: 'stat-card',
        classes: [['.stat-card', '.stat-value', '.stat-trend'], ['.is-positive', '.is-negative']],
        desc: {
          pl: 'Karta statystyk KPI. Warianty trendu: <code>.is-positive</code>, <code>.is-negative</code>.',
          en: 'A KPI stat card. Trend variants: <code>.is-positive</code>, <code>.is-negative</code>.',
          de: 'Eine KPI-Statistikkarte. Trendvarianten: <code>.is-positive</code>, <code>.is-negative</code>.',
        },
        demo: '-',
        tags: ['card', 'dashboard'],
      },
      {
        id: 'counter',
        classes: [['.counter', '.counter-value']],
        desc: {
          pl: 'Licznik animowany przez JS (np. "Mamy 1500 klientów").',
          en: 'A counter animated by JS (e.g. "We have 1500 customers").',
          de: 'Ein per JS animierter Zähler (z. B. „Wir haben 1500 Kunden").',
        },
        demo: '-',
        tags: ['animation', 'dashboard'],
      },
      {
        id: 'pricing-table',
        classes: [['.pricing-table', '.pricing-header', '.pricing-features'], ['.pricing-title', '.pricing-price']],
        desc: {
          pl: 'Tabela cennikowa. Dodaj <code>.is-featured</code> dla wyróżnionego pakietu. Struktura: <code>.pricing-header</code> (z <code>.pricing-title</code> i <code>.pricing-price</code>) + <code>.pricing-features</code>.',
          en: 'A pricing table. Add <code>.is-featured</code> for the highlighted plan. Structure: <code>.pricing-header</code> (with <code>.pricing-title</code> and <code>.pricing-price</code>) + <code>.pricing-features</code>.',
          de: 'Eine Preistabelle. Fügen Sie <code>.is-featured</code> für das hervorgehobene Paket hinzu. Struktur: <code>.pricing-header</code> (mit <code>.pricing-title</code> und <code>.pricing-price</code>) + <code>.pricing-features</code>.',
        },
        demo: '-',
        tags: ['card'],
      },
      {
        id: 'pricing-list',
        classes: [['.pricing-list'], ['.pricing-list-title', '.pricing-list-price', '.pricing-list-dots']],
        desc: {
          pl: 'Alternatywa dla <code>.pricing-table</code> - pozioma lista cenowa z kropkowaną linią łączącą nazwę z ceną.',
          en: 'An alternative to <code>.pricing-table</code> - a horizontal price list with a dotted line connecting the name to the price.',
          de: 'Eine Alternative zu <code>.pricing-table</code> - eine horizontale Preisliste mit gepunkteter Linie zwischen Name und Preis.',
        },
        demo: '-',
        tags: ['card'],
      },
      {
        id: 'testimonial',
        classes: [['.testimonial']],
        desc: {
          pl: 'Cytat klienta z awatarem, imieniem i gwiazdkami oceny.',
          en: 'A customer quote with an avatar, name, and star rating.',
          de: 'Ein Kundenzitat mit Avatar, Name und Sternebewertung.',
        },
        demo: '-',
        tags: ['card'],
      },
      {
        id: 'card-footer',
        classes: [['.card-footer']],
        desc: {
          pl: 'Stopka na przyciski i metadane; przygaszone tło.',
          en: 'A footer for buttons and metadata; a dimmed background.',
          de: 'Ein Footer für Buttons und Metadaten; gedämpfter Hintergrund.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'thumb-info-wrapper',
        classes: [['.thumb-info-wrapper']],
        desc: {
          pl: 'Warstwa ze zdjęciem - to ona skaluje się przy najechaniu.',
          en: 'The layer with the photo - this is what scales on hover.',
          de: 'Die Ebene mit dem Foto - sie ist es, die beim Hover skaliert.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'thumb-info-title',
        classes: [['.thumb-info-title']],
        desc: {
          pl: 'Podpis na nakładce.',
          en: 'The caption on the overlay.',
          de: 'Die Beschriftung auf dem Overlay.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'thumb-info-bottom',
        classes: [['.thumb-info-bottom']],
        desc: {
          pl: 'Wariant: podpis przy dolnej krawędzi.',
          en: 'A variant: caption at the bottom edge.',
          de: 'Variante: Beschriftung an der unteren Kante.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'thumb-info-center',
        classes: [['.thumb-info-center']],
        desc: {
          pl: 'Wariant: podpis na środku.',
          en: 'A variant: caption centered.',
          de: 'Variante: Beschriftung zentriert.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'thumb-info-light',
        classes: [['.thumb-info-light']],
        desc: {
          pl: 'Jaśniejsza nakładka - pod ciemne zdjęcia.',
          en: 'A lighter overlay - for dark photos.',
          de: 'Ein helleres Overlay - für dunkle Fotos.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-stars',
        classes: [['.testimonial-stars']],
        desc: {
          pl: 'Ocena. Sterowana zmienną <code>--rating</code> (0-5, ułamki wypełniają gwiazdkę częściowo).',
          en: 'The rating. Driven by the <code>--rating</code> variable (0-5, fractions partially fill a star).',
          de: 'Die Bewertung. Gesteuert über die Variable <code>--rating</code> (0-5, Bruchteile füllen einen Stern teilweise).',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-quote',
        classes: [['.testimonial-quote']],
        desc: {
          pl: 'Treść wypowiedzi.',
          en: 'The quote\'s content.',
          de: 'Der Inhalt der Aussage.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-author',
        classes: [['.testimonial-author']],
        desc: {
          pl: 'Stopka: awatar plus dane osoby.',
          en: 'The footer: an avatar plus the person\'s info.',
          de: 'Der Footer: Avatar plus Personendaten.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-avatar',
        classes: [['.testimonial-avatar']],
        desc: {
          pl: 'Zdjęcie autora, przycięte do koła.',
          en: 'The author\'s photo, cropped to a circle.',
          de: 'Das Foto des Autors, kreisförmig zugeschnitten.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-name',
        classes: [['.testimonial-name']],
        desc: {
          pl: 'Imię i nazwisko.',
          en: 'The full name.',
          de: 'Vor- und Nachname.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'testimonial-role',
        classes: [['.testimonial-role']],
        desc: {
          pl: 'Stanowisko lub firma.',
          en: 'The job title or company.',
          de: 'Position oder Unternehmen.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'stat-tile-unit',
        classes: [['.stat-tile-unit']],
        desc: {
          pl: 'Jednostka po liczbie (np. „zł", „%") - mniejsza i przygaszona.',
          en: 'The unit after the number (e.g. "USD", "%") - smaller and muted.',
          de: 'Die Einheit nach der Zahl (z. B. „€", „%") - kleiner und gedämpft.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'stat-tile-delta-context',
        classes: [['.stat-tile-delta-context']],
        desc: {
          pl: 'Dopisek w delcie (np. „vs poprzedni okres") w kolorze <code>--text-muted</code>.',
          en: 'The delta\'s caption (e.g. "vs previous period") in <code>--text-muted</code>.',
          de: 'Der Zusatztext im Delta (z. B. „ggü. Vorperiode") in <code>--text-muted</code>.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-cards',
      },
      {
        id: 'stat-title',
        classes: [['.stat-title']],
        desc: {
          pl: 'Etykieta metryki.',
          en: 'The metric\'s label.',
          de: 'Die Beschriftung der Metrik.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-charts',
      },
      {
        id: 'counter-title',
        classes: [['.counter-title']],
        desc: {
          pl: 'Podpis pod liczbą.',
          en: 'Caption below the number.',
          de: 'Beschriftung unter der Zahl.',
        },
        demo: '-',
        tags: ['card'],
        source: 'docs-tables',
      },
    ],
  },
  {
    id: 'nawigacja',
    title: {
      pl: 'Nawigacja',
      en: 'Navigation',
      de: 'Navigation',
    },
    rows: [
      {
        id: 'navbar',
        classes: [['.navbar', '.navbar-transparent'], ['.navbar-pill']],
        desc: {
          pl: 'Główny pasek nawigacji. Wariant transparentny staje się pełny po scrollu (<code>.is-scrolled</code>).',
          en: 'The main navigation bar. The transparent variant becomes solid after scrolling (<code>.is-scrolled</code>).',
          de: 'Die Hauptnavigationsleiste. Die transparente Variante wird nach dem Scrollen vollflächig (<code>.is-scrolled</code>).',
        },
        demo: '-',
        tags: ['nav', 'menu'],
      },
      {
        id: 'navbar-sticky',
        classes: [['.navbar-sticky']],
        desc: {
          pl: 'Dodaj do <code>.navbar</code>, aby przykleić go do góry i włączyć logikę <code>.is-scrolled</code>/chowania na scrollu w <code>molique-script.js</code>.',
          en: 'Add to <code>.navbar</code> to pin it to the top and enable the <code>.is-scrolled</code>/hide-on-scroll logic in <code>molique-script.js</code>.',
          de: 'Zu <code>.navbar</code> hinzufügen, um sie oben anzuheften und die <code>.is-scrolled</code>-/Ausblenden-beim-Scrollen-Logik in <code>molique-script.js</code> zu aktivieren.',
        },
        demo: '-',
        tags: ['nav', 'scroll'],
      },
      {
        id: 'navbar-offcanvas-toggle',
        classes: [['.navbar-offcanvas-toggle']],
        desc: {
          pl: 'Checkbox Hack do otwierania mobilnego menu bocznego bez JS.',
          en: 'A checkbox hack for opening the mobile side menu with no JS.',
          de: 'Ein Checkbox-Hack zum Öffnen des mobilen Seitenmenüs ohne JS.',
        },
        demo: '-',
        tags: ['nav', 'mobile', 'zerojs'],
      },
      {
        id: 'mega-menu',
        classes: [['.mega-menu', '.mega-menu-trigger', '.mega-menu-content'], ['.mega-menu-featured-title', '.mega-menu-featured-text', '.mega-menu-featured-link', '.mega-menu-featured-icon']],
        desc: {
          pl: 'Szerokie menu rozwijane oparte na <code>&lt;details&gt;</code> + CSS Anchor Positioning. Otwiera się kliknięciem (desktop i mobile - zero JS), na mobile automatycznie zamienia się w akordeon. Kolumna: <code>.mega-menu-group</code> > <code>.mega-menu-col-title</code> (opcjonalnie z ikoną w <code>.mega-menu-col-icon</code>) + lista <code>.mega-menu-link</code>. Jedną "komórkę" siatki może zastąpić wyróżniona karta <code>.mega-menu-featured</code> (z <code>.mega-menu-featured-icon</code>, <code>-title</code>, <code>-text</code>, <code>-link</code>) - np. do promowania nowości.',
          en: 'A wide dropdown menu built on <code>&lt;details&gt;</code> + CSS Anchor Positioning. Opens on click (desktop and mobile - zero JS), and automatically turns into an accordion on mobile. Column: <code>.mega-menu-group</code> > <code>.mega-menu-col-title</code> (optionally with an icon in <code>.mega-menu-col-icon</code>) + a list of <code>.mega-menu-link</code>s. One grid "cell" can be replaced with a highlighted card <code>.mega-menu-featured</code> (with <code>.mega-menu-featured-icon</code>, <code>-title</code>, <code>-text</code>, <code>-link</code>) - e.g. to promote a new feature.',
          de: 'Ein breites, auf <code>&lt;details&gt;</code> + CSS Anchor Positioning basierendes Dropdown-Menü. Öffnet sich per Klick (Desktop und Mobil - null JS), verwandelt sich auf Mobilgeräten automatisch in ein Akkordeon. Spalte: <code>.mega-menu-group</code> > <code>.mega-menu-col-title</code> (optional mit einem Icon in <code>.mega-menu-col-icon</code>) + eine Liste von <code>.mega-menu-link</code>. Eine „Zelle" des Rasters kann durch eine hervorgehobene Karte <code>.mega-menu-featured</code> ersetzt werden (mit <code>.mega-menu-featured-icon</code>, <code>-title</code>, <code>-text</code>, <code>-link</code>) - z. B. um eine Neuheit zu bewerben.',
        },
        demo: '-',
        tags: ['nav', 'menu', 'zerojs'],
      },
      {
        id: 'dropdown',
        classes: [['.dropdown', '.dropdown-menu']],
        desc: {
          pl: 'Klasyczne menu rozwijane oparte na natywnym tagu <code>&lt;details&gt;</code>. Domyślnie rozwija się od lewej - dodaj <code>.dropdown-menu-end</code> do <code>.dropdown-menu</code>, żeby rozwijało się od prawej krawędzi triggera (np. gdy siedzi blisko prawej krawędzi ekranu).',
          en: 'A classic dropdown menu built on the native <code>&lt;details&gt;</code> tag. Opens from the left by default - add <code>.dropdown-menu-end</code> to <code>.dropdown-menu</code> so it opens from the trigger\'s right edge instead (e.g. when it sits close to the right edge of the screen).',
          de: 'Ein klassisches, auf dem nativen Tag <code>&lt;details&gt;</code> basierendes Dropdown-Menü. Klappt standardmäßig von links auf - fügen Sie <code>.dropdown-menu-end</code> zu <code>.dropdown-menu</code> hinzu, damit es sich von der rechten Kante des Triggers aus öffnet (z. B. wenn dieser nahe am rechten Bildschirmrand sitzt).',
        },
        demo: '-',
        tags: ['nav', 'menu', 'zerojs'],
      },
      {
        id: 'language-switch',
        classes: [['.language-switch', '.language-switch-trigger']],
        desc: {
          pl: 'Przełącznik języka w formie pigułki - wzorzec Dropdown Popover: <code >&lt;button class="language-switch-trigger" popovertarget="ID"&gt;</code > + <code>.dropdown-menu.language-switch-menu</code> z atrybutem <code>popover</code> (top layer). Pozycje listy: <code>.language-switch-item</code> (w środku <code>.language-switch-flag</code> z flagą SVG przez <code>&lt;img src="img/flags/pl.svg"&gt;</code>, <code>-name</code>, opcjonalnie <code>-check</code> przy aktywnym języku). Zwykle łączona z <code>.dropdown-menu-end</code>, bo siedzi na końcu navbara.',
          en: 'A pill-shaped language switcher - the Dropdown Popover pattern: <code >&lt;button class="language-switch-trigger" popovertarget="ID"&gt;</code > + <code>.dropdown-menu.language-switch-menu</code> with the <code>popover</code> attribute (top layer). List items: <code>.language-switch-item</code> (containing <code>.language-switch-flag</code> with an SVG flag via <code>&lt;img src="img/flags/en.svg"&gt;</code>, <code>-name</code>, optionally <code>-check</code> on the active language). Usually combined with <code>.dropdown-menu-end</code>, since it sits at the end of the navbar.',
          de: 'Ein pillenförmiger Sprachumschalter - das Dropdown-Popover-Muster: <code >&lt;button class="language-switch-trigger" popovertarget="ID"&gt;</code > + <code>.dropdown-menu.language-switch-menu</code> mit dem Attribut <code>popover</code> (Top Layer). Listenpositionen: <code>.language-switch-item</code> (darin <code>.language-switch-flag</code> mit einer SVG-Flagge über <code>&lt;img src="img/flags/de.svg"&gt;</code>, <code>-name</code>, optional <code>-check</code> bei der aktiven Sprache). Meist mit <code>.dropdown-menu-end</code> kombiniert, da sie am Ende der Navbar sitzt.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
      },
      {
        id: 'topbar',
        classes: [['.topbar']],
        desc: {
          pl: 'Wąski pasek nad główną nawigacją (często używany na dane kontaktowe).',
          en: 'A narrow bar above the main navigation (often used for contact details).',
          de: 'Eine schmale Leiste über der Hauptnavigation (oft für Kontaktdaten verwendet).',
        },
        demo: '-',
        tags: ['nav'],
      },
      {
        id: 'breadcrumb',
        classes: [['.breadcrumb', '.breadcrumb-item']],
        desc: {
          pl: 'Nawigacja okruszkowa pokazująca ścieżkę użytkownika.',
          en: 'Breadcrumb navigation showing the user\'s path.',
          de: 'Breadcrumb-Navigation, die den Pfad des Nutzers zeigt.',
        },
        demo: '-',
        tags: ['nav'],
      },
      {
        id: 'pagination',
        classes: [['.pagination', '.pagination-modern']],
        desc: {
          pl: 'Paginacja stron. Wariant modern tworzy oddzielone, zaokrąglone kafelki.',
          en: 'Page pagination. The modern variant creates separated, rounded tiles.',
          de: 'Seitenpaginierung. Die moderne Variante erzeugt getrennte, abgerundete Kacheln.',
        },
        demo: '-',
        tags: ['nav'],
      },
      {
        id: 'nav-filters',
        classes: [['.nav-filters', '.filter-item']],
        desc: {
          pl: 'Pastylki filtrów (np. do portfolio/bloga). Zaznaczony filtr dostaje <code>.is-active</code>.',
          en: 'Filter pills (e.g. for a portfolio/blog). The selected filter gets <code>.is-active</code>.',
          de: 'Filterpillen (z. B. für ein Portfolio/einen Blog). Der ausgewählte Filter erhält <code>.is-active</code>.',
        },
        demo: {
          pl: '<ul class="nav-filters m-0 p-0"> <li><button class="is-active">Wszystkie</button></li> <li><button>Design</button></li> </ul>',
          en: '<ul class="nav-filters m-0 p-0"> <li><button class="is-active">All</button></li> <li><button>Design</button></li> </ul>',
          de: '<ul class="nav-filters m-0 p-0"> <li><button class="is-active">Alle</button></li> <li><button>Design</button></li> </ul>',
        },
        tags: ['nav', 'visibility'],
      },
      {
        id: 'navbar-menu-offcanvas',
        classes: [['.navbar-menu-offcanvas']],
        desc: {
          pl: 'Menu wysuwane z boku na mobile.',
          en: 'A side-sliding menu on mobile.',
          de: 'Seitlich ausfahrendes Menü auf Mobilgeräten.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-switch',
        classes: [['.theme-switch']],
        desc: {
          pl: 'Przełącznik motywu jasny/ciemny.',
          en: 'A light/dark theme switch.',
          de: 'Umschalter hell/dunkel.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-container',
        classes: [['.navbar-container']],
        desc: {
          pl: 'Rozkłada markę i menu na przeciwne krawędzie. Łącz z <code>.container</code>, żeby ograniczyć szerokość.',
          en: 'Spreads the brand and menu to opposite edges. Combine with <code>.container</code> to cap the width.',
          de: 'Verteilt Marke und Menü an die gegenüberliegenden Kanten. Kombinieren Sie sie mit <code>.container</code>, um die Breite zu begrenzen.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-brand',
        classes: [['.navbar-brand']],
        desc: {
          pl: 'Logo lub nazwa. Zwykle linkuje do strony głównej.',
          en: 'Logo or name. Usually links to the homepage.',
          de: 'Logo oder Name. Verlinkt üblicherweise zur Startseite.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-menu',
        classes: [['.navbar-menu']],
        desc: {
          pl: 'Kontener linków. Obecność tej klasy uruchamia moduł podświetlania aktywnej pozycji.',
          en: 'The link container. Its presence activates the active-item highlighting module.',
          de: 'Der Link-Container. Seine Anwesenheit aktiviert das Modul zur Hervorhebung der aktiven Position.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-item',
        classes: [['.navbar-item']],
        desc: {
          pl: 'Pojedynczy link. Ma <code>min-height: 44px</code> - wymóg celu dotykowego.',
          en: 'A single link. Has <code>min-height: 44px</code> - the touch-target requirement.',
          de: 'Ein einzelner Link. Hat <code>min-height: 44px</code> - die Anforderung an das Berührungsziel.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'is-scrolled',
        classes: [['.is-scrolled']],
        desc: {
          pl: 'Nadawana przez JS po zescrollowaniu. Ty jej nie ustawiasz.',
          en: 'Applied by JS after scrolling. You never set it yourself.',
          de: 'Wird nach dem Scrollen von JS vergeben. Sie setzen sie nie selbst.',
        },
        demo: '-',
        tags: ['nav', 'menu', 'state'],
        source: 'docs-navbar',
      },
      {
        id: 'is-hidden',
        classes: [['.is-hidden']],
        desc: {
          pl: 'Chowa przyklejony pasek w górę przy przewijaniu w dół. Też nadaje ją JS.',
          en: 'Hides the pinned bar upward when scrolling down. Also applied by JS.',
          de: 'Verbirgt die angeheftete Leiste beim Scrollen nach unten. Wird ebenfalls von JS vergeben.',
        },
        demo: '-',
        tags: ['nav', 'menu', 'state'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-toggle',
        classes: [['.navbar-toggle']],
        desc: {
          pl: 'Hamburger. W środku trzy puste <code>&lt;span&gt;</code> - to kreski ikony.',
          en: 'The hamburger. Contains three empty <code>&lt;span&gt;</code>s - those are the icon\'s lines.',
          de: 'Der Hamburger. Enthält drei leere <code>&lt;span&gt;</code>-Elemente - das sind die Striche des Icons.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'navbar-offcanvas-backdrop',
        classes: [['.navbar-offcanvas-backdrop']],
        desc: {
          pl: 'Przyciemnione tło. Że to etykieta, klik w nie zamyka menu - też bez JS.',
          en: 'The dimmed backdrop. Since it\'s a label, clicking it closes the menu too - also with no JS.',
          de: 'Der abgedunkelte Hintergrund. Da es ein Label ist, schließt ein Klick darauf auch das Menü - ebenfalls ohne JS.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'mega-menu-group',
        classes: [['.mega-menu-group']],
        desc: {
          pl: 'Kolumna wewnątrz panelu.',
          en: 'A column inside the panel.',
          de: 'Eine Spalte innerhalb des Panels.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'mega-menu-col-title',
        classes: [['.mega-menu-col-title']],
        desc: {
          pl: 'Nagłówek kolumny.',
          en: 'The column\'s heading.',
          de: 'Die Überschrift der Spalte.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'mega-menu-col-icon',
        classes: [['.mega-menu-col-icon']],
        desc: {
          pl: 'Ikona przy nagłówku kolumny.',
          en: 'An icon next to the column heading.',
          de: 'Ein Icon neben der Spaltenüberschrift.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'mega-menu-link',
        classes: [['.mega-menu-link']],
        desc: {
          pl: 'Link w kolumnie.',
          en: 'A link within a column.',
          de: 'Ein Link innerhalb einer Spalte.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'mega-menu-featured',
        classes: [['.mega-menu-featured']],
        desc: {
          pl: 'Wyróżniony blok promocyjny w panelu. Wewnątrz: <code>.mega-menu-featured-icon</code>, <code>.mega-menu-featured-title</code>, <code>.mega-menu-featured-text</code>, <code>.mega-menu-featured-link</code>.',
          en: 'A highlighted promo block in the panel. Inside: <code>.mega-menu-featured-icon</code>, <code>.mega-menu-featured-title</code>, <code>.mega-menu-featured-text</code>, <code>.mega-menu-featured-link</code>.',
          de: 'Ein hervorgehobener Werbeblock im Panel. Darin: <code>.mega-menu-featured-icon</code>, <code>.mega-menu-featured-title</code>, <code>.mega-menu-featured-text</code>, <code>.mega-menu-featured-link</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'dropdown-toggle',
        classes: [['.dropdown-toggle']],
        desc: {
          pl: 'Na <code>&lt;summary&gt;</code>.',
          en: 'On <code>&lt;summary&gt;</code>.',
          de: 'Auf <code>&lt;summary&gt;</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'dropdown-item',
        classes: [['.dropdown-item']],
        desc: {
          pl: 'Pojedyncza pozycja.',
          en: 'A single item.',
          de: 'Eine einzelne Position.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'dropdown-menu-end',
        classes: [['.dropdown-menu-end']],
        desc: {
          pl: 'Wyrównuje panel do prawej krawędzi przycisku.',
          en: 'Aligns the panel to the button\'s right edge.',
          de: 'Richtet das Panel an der rechten Kante des Buttons aus.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'page-item',
        classes: [['.page-item']],
        desc: {
          pl: 'Pozycja (<code>&lt;li&gt;</code>). Warianty: <code>.is-active</code> - bieżąca strona, <code>.is-disabled</code> - niedostępny krok.',
          en: 'An item (<code>&lt;li&gt;</code>). Variants: <code>.is-active</code> - the current page, <code>.is-disabled</code> - an unavailable step.',
          de: 'Eine Position (<code>&lt;li&gt;</code>). Varianten: <code>.is-active</code> - die aktuelle Seite, <code>.is-disabled</code> - ein nicht verfügbarer Schritt.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'page-link',
        classes: [['.page-link']],
        desc: {
          pl: 'Klikalny <code>&lt;a&gt;</code> w środku pozycji.',
          en: 'The clickable <code>&lt;a&gt;</code> inside an item.',
          de: 'Das klickbare <code>&lt;a&gt;</code> innerhalb einer Position.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'topbar-content',
        classes: [['.topbar-content']],
        desc: {
          pl: 'Rozkłada zawartość na krawędzie paska.',
          en: 'Spreads its content to the bar\'s edges.',
          de: 'Verteilt den Inhalt an die Kanten der Leiste.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'topbar-list',
        classes: [['.topbar-list']],
        desc: {
          pl: 'Pozioma lista pozycji bez punktorów.',
          en: 'A horizontal list of items with no bullets.',
          de: 'Horizontale Liste von Positionen ohne Aufzählungszeichen.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'language-switch-menu',
        classes: [['.language-switch-menu']],
        desc: {
          pl: 'Lista języków. Łącz z <code>.dropdown-menu</code> i atrybutem <code>popover</code>.',
          en: 'The list of languages. Combine with <code>.dropdown-menu</code> and the <code>popover</code> attribute.',
          de: 'Die Sprachliste. Kombinieren Sie sie mit <code>.dropdown-menu</code> und dem Attribut <code>popover</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'language-switch-item',
        classes: [['.language-switch-item']],
        desc: {
          pl: 'Pojedynczy język; też <code>.dropdown-item</code>.',
          en: 'A single language; also <code>.dropdown-item</code>.',
          de: 'Eine einzelne Sprache; auch <code>.dropdown-item</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'language-switch-flag',
        classes: [['.language-switch-flag']],
        desc: {
          pl: 'Flaga jako <code>&lt;img&gt;</code> z <code>img/flags/</code>.',
          en: 'The flag as an <code>&lt;img&gt;</code> from <code>img/flags/</code>.',
          de: 'Die Flagge als <code>&lt;img&gt;</code> aus <code>img/flags/</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'language-switch-name',
        classes: [['.language-switch-name']],
        desc: {
          pl: 'Nazwa języka obok flagi.',
          en: 'The language\'s name next to the flag.',
          de: 'Der Sprachname neben der Flagge.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'language-switch-check',
        classes: [['.language-switch-check']],
        desc: {
          pl: 'Znacznik przy języku aktualnie wybranym.',
          en: 'The mark next to the currently selected language.',
          de: 'Die Markierung bei der aktuell gewählten Sprache.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-switch-input',
        classes: [['.theme-switch-input']],
        desc: {
          pl: 'Ukryty checkbox trzymający stan. To on musi mieć <code>id="theme-toggle"</code>.',
          en: 'The hidden checkbox holding the state. It\'s the one that needs <code>id="theme-toggle"</code>.',
          de: 'Die versteckte, zustandshaltende Checkbox. Sie benötigt <code>id="theme-toggle"</code>.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-switch-track',
        classes: [['.theme-switch-track']],
        desc: {
          pl: 'Tor suwaka - widoczna pastylka z ramką.',
          en: 'The slider\'s track - the visible bordered pill.',
          de: 'Die Bahn des Schiebereglers - die sichtbare, umrandete Pille.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-switch-thumb',
        classes: [['.theme-switch-thumb']],
        desc: {
          pl: 'Pływający element, który jeździ po torze.',
          en: 'The floating element that rides along the track.',
          de: 'Das schwebende Element, das auf der Bahn entlangfährt.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-icon-wrapper',
        classes: [['.theme-icon-wrapper']],
        desc: {
          pl: 'Kontener obu ikon wewnątrz toru.',
          en: 'The container for both icons inside the track.',
          de: 'Der Container für beide Icons innerhalb der Bahn.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'theme-icon',
        classes: [['.theme-icon']],
        desc: {
          pl: 'Wspólny styl ikony - rozmiar i przejście.',
          en: 'The shared icon style - size and transition.',
          de: 'Der gemeinsame Icon-Stil - Größe und Übergang.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'icon-sun',
        classes: [['.icon-sun']],
        desc: {
          pl: 'Ikona motywu jasnego.',
          en: 'The light-theme icon.',
          de: 'Das Icon für das helle Theme.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'icon-moon',
        classes: [['.icon-moon']],
        desc: {
          pl: 'Ikona motywu ciemnego.',
          en: 'The dark-theme icon.',
          de: 'Das Icon für das dunkle Theme.',
        },
        demo: '-',
        tags: ['nav', 'menu'],
        source: 'docs-navbar',
      },
      {
        id: 'footer-cols',
        classes: [['.footer-cols', '.footer-brand', '.footer-tagline'], ['.footer-heading', '.footer-link', '.footer-link-more', '.footer-bottom']],
        desc: {
          pl: 'Stopka strony: <code>.footer-cols</code> układa kolumny, <code>.footer-brand</code> i <code>.footer-tagline</code> to blok marki, <code>.footer-heading</code> to tytuł kolumny, a <code>.footer-bottom</code> - pasek praw autorskich. Kolor akcentu linków bierze się z <code>--footer-accent</code>; stopka jest ZAWSZE ciemna, więc dobierz odcień z kontrastem 4,5:1 na ciemnym tle.',
          en: 'The page footer: <code>.footer-cols</code> lays out the columns, <code>.footer-brand</code> and <code>.footer-tagline</code> form the brand block, <code>.footer-heading</code> is a column title and <code>.footer-bottom</code> the copyright bar. The link accent comes from <code>--footer-accent</code>; the footer is ALWAYS dark, so pick a shade with 4.5:1 contrast on a dark background.',
          de: 'Der Seitenfuß: <code>.footer-cols</code> ordnet die Spalten, <code>.footer-brand</code> und <code>.footer-tagline</code> bilden den Markenblock, <code>.footer-heading</code> ist eine Spaltenüberschrift und <code>.footer-bottom</code> die Copyright-Leiste. Die Akzentfarbe der Links kommt aus <code>--footer-accent</code>; der Footer ist IMMER dunkel, wähle also einen Ton mit 4,5:1 Kontrast auf dunklem Grund.',
        },
        demo: '-',
        tags: ['nav'],
      },
      {
        id: 'footer-author',
        classes: [['.footer-author', '.footer-author-avatar'], ['.footer-author-name', '.footer-author-role']],
        desc: {
          pl: 'Wizytówka autora w stopce - awatar plus imię i rola. Osobny komponent od <code>.author-box</code> spod wpisu na blogu; te same role, inne rozmiary i inne tło (stopka jest ciemna).',
          en: 'An author card in the footer - avatar plus name and role. A separate component from the <code>.author-box</code> under a blog post; same roles, different sizes and a different background (the footer is dark).',
          de: 'Eine Autorenkarte im Footer - Avatar plus Name und Rolle. Eine eigene Komponente, nicht die <code>.author-box</code> unter einem Blogbeitrag; gleiche Rollen, andere Größen und ein anderer Hintergrund (der Footer ist dunkel).',
        },
        demo: '-',
        tags: ['nav', 'card'],
      },
      {
        id: 'footer-trustbar',
        classes: [['.footer-trustbar', '.footer-trustbar-text', '.footer-trustbar-dot']],
        desc: {
          pl: 'Pasek zaufania nad stopką - krótkie hasła rozdzielone kropką <code>.footer-trustbar-dot</code> (gwarancja, czas realizacji, kontakt).',
          en: 'A trust bar above the footer - short claims separated by a <code>.footer-trustbar-dot</code> (guarantee, lead time, contact).',
          de: 'Eine Vertrauensleiste über dem Footer - kurze Aussagen, getrennt durch einen <code>.footer-trustbar-dot</code> (Garantie, Lieferzeit, Kontakt).',
        },
        demo: '-',
        tags: ['nav'],
      },
      {
        id: 'logo-light',
        classes: [['.logo-light', '.logo-dark']],
        desc: {
          pl: 'Dwie wersje logo w <code>.navbar-brand</code> - framework pokazuje właściwą zależnie od motywu i od tego, czy navbar leży jeszcze na ciemnym hero. Wstawiasz oba obrazki, nie przełączasz niczego z JS.',
          en: 'Two versions of the logo inside <code>.navbar-brand</code> - the framework shows the right one depending on the theme and on whether the navbar is still over a dark hero. You provide both images and switch nothing from JS.',
          de: 'Zwei Logo-Varianten in <code>.navbar-brand</code> - das Framework zeigt je nach Theme die passende, und je nachdem, ob die Navbar noch über einem dunklen Hero liegt. Du lieferst beide Bilder und schaltest nichts per JS.',
        },
        demo: '-',
        tags: ['nav', 'color'],
      },
      {
        id: 'lang-suggest-bar',
        classes: [['.lang-suggest-bar', '.lang-suggest-text', '.lang-suggest-actions']],
        desc: {
          pl: 'Pasek „czy chcesz przeczytać tę stronę po…" - buduje go <code>js/modules/molique-lang-suggest.js</code> na podstawie języka przeglądarki i linków w <code>.language-switch-menu</code>. Nie piszesz tego markupu ręcznie; pokazuje się raz i zapamiętuje odrzucenie w <code>localStorage</code>.',
          en: 'The "would you like to read this page in…" bar - built by <code>js/modules/molique-lang-suggest.js</code> from the browser language and the links in <code>.language-switch-menu</code>. You do not write this markup; it appears once and remembers a dismissal in <code>localStorage</code>.',
          de: 'Die Leiste „Möchtest du diese Seite auf … lesen?" - gebaut von <code>js/modules/molique-lang-suggest.js</code> anhand der Browsersprache und der Links in <code>.language-switch-menu</code>. Dieses Markup schreibst du nicht selbst; es erscheint einmal und merkt sich eine Ablehnung in <code>localStorage</code>.',
        },
        demo: '-',
        tags: ['nav'],
      },
    ],
  },
  {
    id: 'widgety-strony',
    title: {
      pl: 'Widgety strony',
      en: 'Page widgets',
      de: 'Seiten-Widgets',
    },
    rows: [
      {
        id: 'scroll-to-top',
        classes: [['.scroll-to-top']],
        desc: {
          pl: 'Pływający przycisk "do góry", pojawia się po przewinięciu (dodaje <code>.is-visible</code>, obsługiwane przez <code>molique-script.js</code>).',
          en: 'A floating "go to top" button, appears after scrolling (adds <code>.is-visible</code>, handled by <code>molique-script.js</code>).',
          de: 'Ein schwebender „nach oben"-Button, erscheint nach dem Scrollen (fügt <code>.is-visible</code> hinzu, behandelt von <code>molique-script.js</code>).',
        },
        demo: '-',
        tags: ['scroll', 'nav'],
      },
      {
        id: 'progress-container-fixed',
        classes: [['.progress-container-fixed', '.progress-bar-reading']],
        desc: {
          pl: 'Pasek postępu czytania przyklejony do górnej krawędzi ekranu. Wymaga skryptu JS (wbudowanego w <code>molique-script.js</code>) do aktualizacji szerokości podczas scrollowania.',
          en: 'A reading progress bar pinned to the top of the screen. Requires the JS script (built into <code>molique-script.js</code>) to update the width while scrolling.',
          de: 'Ein am oberen Bildschirmrand fixierter Lesefortschrittsbalken. Erfordert das JS-Skript (eingebaut in <code>molique-script.js</code>), um die Breite beim Scrollen zu aktualisieren.',
        },
        demo: '-',
        tags: ['scroll', 'feedback'],
      },
      {
        id: 'before-after-slider',
        classes: [['.before-after-slider'], ['.before-after-img', '.slider-line', '.slider-handle']],
        desc: {
          pl: 'Metamorfozy, projekty, retusz - porównanie dwóch zdjęć.',
          en: 'Transformations, projects, retouching - comparing two photos.',
          de: 'Umgestaltungen, Projekte, Retusche - Vergleich zweier Fotos.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'speed-dial',
        classes: [['.speed-dial']],
        desc: {
          pl: 'Pływający przycisk akcji z kilkoma skrótami (FAB).',
          en: 'A floating action button (FAB) with a handful of shortcuts.',
          de: 'Ein schwebender Aktions-Button (FAB) mit ein paar Kurzbefehlen.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'share-bar',
        classes: [['.share-bar']],
        desc: {
          pl: 'Udostępnianie artykułu w social media.',
          en: 'Sharing an article to social media.',
          de: 'Teilen eines Artikels in sozialen Medien.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'img-after',
        classes: [['.img-after']],
        desc: {
          pl: 'Zdjęcie „po" - warstwa spodnia, w normalnym przepływie (ustala wysokość widgetu).',
          en: 'The "after" photo - the bottom layer, in normal flow (sets the widget\'s height).',
          de: 'Das „Nachher"-Foto - die untere Ebene, im normalen Fluss (bestimmt die Höhe des Widgets).',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'img-before',
        classes: [['.img-before']],
        desc: {
          pl: 'Zdjęcie „przed" - warstwa wierzchnia, przycinana <code>clip-path</code> według <code>--position</code>. Kolejność klas w HTML jest dowolna - o warstwach decyduje <code>z-index</code>, nie kolejność w DOM.',
          en: 'The "before" photo - the top layer, clipped via <code>clip-path</code> according to <code>--position</code>. The class order in the HTML doesn\'t matter - layering is decided by <code>z-index</code>, not DOM order.',
          de: 'Das „Vorher"-Foto - die obere Ebene, per <code>clip-path</code> entsprechend <code>--position</code> zugeschnitten. Die Reihenfolge der Klassen im HTML ist beliebig - über die Ebenen entscheidet <code>z-index</code>, nicht die DOM-Reihenfolge.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'slider-control',
        classes: [['.slider-control']],
        desc: {
          pl: 'Niewidoczny <code>input[type=range]</code> na całej powierzchni - realny sterownik.',
          en: 'The invisible <code>input[type=range]</code> covering the whole area - the real controller.',
          de: 'Das unsichtbare <code>input[type=range]</code> über der gesamten Fläche - der eigentliche Regler.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'speed-dial-main',
        classes: [['.speed-dial-main']],
        desc: {
          pl: 'Główny okrągły przycisk 56px.',
          en: 'The main round 56px button.',
          de: 'Der runde Hauptbutton, 56px.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'speed-dial-actions',
        classes: [['.speed-dial-actions']],
        desc: {
          pl: 'Kontener skrótów - domyślnie niewidoczny (<code>opacity: 0; visibility: hidden</code>).',
          en: 'The container for the shortcuts - hidden by default (<code>opacity: 0; visibility: hidden</code>).',
          de: 'Der Container der Kurzbefehle - standardmäßig unsichtbar (<code>opacity: 0; visibility: hidden</code>).',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'speed-dial-action',
        classes: [['.speed-dial-action']],
        desc: {
          pl: 'Pojedynczy skrót, okrągły 44px.',
          en: 'A single round 44px shortcut.',
          de: 'Ein einzelner runder Kurzbefehl, 44px.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
      {
        id: 'share-btn',
        classes: [['.share-btn']],
        desc: {
          pl: 'Pojedynczy przycisk. To on, nie <code>.share-bar</code>, jest selektorem, który uruchamia autoloader.',
          en: 'A single button. This - not <code>.share-bar</code> - is the selector that triggers the autoloader.',
          de: 'Ein einzelner Button. Er, nicht <code>.share-bar</code>, ist der Selektor, der den Autoloader auslöst.',
        },
        demo: '-',
        source: 'docs-widgets',
      },
    ],
  },
  {
    id: 'panel-admina',
    title: {
      pl: 'Panel admina',
      en: 'Admin panel',
      de: 'Admin-Panel',
    },
    rows: [
      {
        id: 'admin-layout',
        classes: [['.admin-layout', '.admin-layout-floating']],
        desc: {
          pl: 'Główna siatka panelu. Wariant floating odsuwa treść od krawędzi.',
          en: 'The panel\'s main grid. The floating variant pulls the content away from the edges.',
          de: 'Das Hauptraster des Panels. Die Floating-Variante rückt den Inhalt von den Kanten ab.',
        },
        demo: '-',
        tags: ['admin', 'dashboard'],
      },
      {
        id: 'admin-rail',
        classes: [['.admin-rail', '.admin-rail-hide-mobile']],
        desc: {
          pl: 'Druga kolumna między sidebarem a treścią: podnawigacja, filtry, lista rekordów do wyboru. <strong>Celowo bez tła</strong> - siedzi na <code>--bg-body</code>, więc czyta się jako podłoże strony, a nie trzecia karta. Tor w siatce dokłada się sam, przez <code>:has()</code>, dopiero gdy element istnieje - inaczej pusty tor generowałby w trybie floating drugi <code>gap</code> i ruszał layout wszystkim. Przykleja się jak sidebar (treść przewija strona, nie kolumna). Szerokość: <code>--admin-rail-width</code> (240px). Na mobile układa się NAD treścią; <code>.admin-rail-hide-mobile</code> chowa ją, gdy tylko dubluje nawigację dostępną gdzie indziej.',
          en: 'A second column between the sidebar and the content: sub-navigation, filters, a list of records to pick from. <strong>Deliberately without a background</strong> - it sits on <code>--bg-body</code>, so it reads as page ground rather than a third card. The grid track is added by a <code>:has()</code> rule only once the element exists - an empty track would otherwise generate a second <code>gap</code> in floating mode and shift the layout for everyone. It sticks like the sidebar (the page scrolls, not the column). Width: <code>--admin-rail-width</code> (240px). On mobile it stacks ABOVE the content; <code>.admin-rail-hide-mobile</code> drops it when it merely duplicates navigation available elsewhere.',
          de: 'Eine zweite Spalte zwischen Sidebar und Inhalt: Unternavigation, Filter, eine Liste zur Auswahl. <strong>Bewusst ohne Hintergrund</strong> - sie liegt auf <code>--bg-body</code> und liest sich als Seitengrund, nicht als dritte Karte. Die Grid-Spur kommt über eine <code>:has()</code>-Regel erst dazu, wenn das Element existiert - eine leere Spur würde im Floating-Modus sonst einen zweiten <code>gap</code> erzeugen und das Layout für alle verschieben. Sie klebt wie die Sidebar (es scrollt die Seite, nicht die Spalte). Breite: <code>--admin-rail-width</code> (240px). Auf dem Handy stapelt sie sich ÜBER dem Inhalt; <code>.admin-rail-hide-mobile</code> blendet sie aus, wenn sie nur anderswo vorhandene Navigation dupliziert.',
        },
        demo: '-',
        tags: ['admin', 'nav', 'dashboard', 'responsive'],
      },
      {
        id: 'sidebar-md',
        classes: [['.sidebar-md', '.sidebar-sm']],
        desc: {
          pl: 'Klasy sterujące szerokością sidebara (dodawane do <code>.admin-layout</code>).',
          en: 'Classes controlling the sidebar\'s width (added to <code>.admin-layout</code>).',
          de: 'Klassen, die die Breite der Sidebar steuern (zu <code>.admin-layout</code> hinzugefügt).',
        },
        demo: '-',
        tags: ['admin', 'width', 'state'],
      },
      {
        id: 'admin-sidebar',
        classes: [['.admin-sidebar', '.admin-brand']],
        desc: {
          pl: 'Boczny pasek nawigacji. Na mobile zamienia się w Bottom Nav.',
          en: 'The side navigation bar. Turns into a Bottom Nav on mobile.',
          de: 'Die seitliche Navigationsleiste. Wird auf Mobilgeräten zu einem Bottom Nav.',
        },
        demo: '-',
        tags: ['admin', 'nav'],
      },
      {
        id: 'fade-bottom',
        classes: [['.fade-bottom']],
        desc: {
          pl: 'Zanikanie treści przy dolnej krawędzi (gradient). Działa na dowolnym przewijanym kontenerze - kolor przez <code>--fade-color</code>, wysokość przez <code>--fade-height</code>. W <code>.admin-sidebar</code> i <code>.admin-main</code> kolor dobiera się automatycznie.',
          en: 'Content fading at the bottom edge (gradient). Works on any scrollable container - color via <code>--fade-color</code>, height via <code>--fade-height</code>. In <code>.admin-sidebar</code> and <code>.admin-main</code> the color is picked automatically.',
          de: 'Ausblenden des Inhalts am unteren Rand (Gradient). Funktioniert auf jedem scrollbaren Container - Farbe über <code>--fade-color</code>, Höhe über <code>--fade-height</code>. In <code>.admin-sidebar</code> und <code>.admin-main</code> wird die Farbe automatisch gewählt.',
        },
        demo: '-',
        tags: ['admin', 'scroll', 'overlay'],
      },
      {
        id: 'admin-logo-hide',
        classes: [['.admin-logo-hide', '.admin-logo-compact']],
        desc: {
          pl: 'Zarządzanie widocznością logo w wąskich trybach sidebara (<code>.sidebar-sm</code>, <code>.sidebar-md</code>) oraz na urządzeniach mobilnych.',
          en: 'Managing the logo\'s visibility in narrow sidebar modes (<code>.sidebar-sm</code>, <code>.sidebar-md</code>) and on mobile devices.',
          de: 'Verwaltung der Logo-Sichtbarkeit in schmalen Sidebar-Modi (<code>.sidebar-sm</code>, <code>.sidebar-md</code>) und auf Mobilgeräten.',
        },
        demo: '-',
        tags: ['admin', 'visibility', 'responsive'],
      },
      {
        id: 'admin-logo-swap',
        classes: [['.admin-logo-swap', '.admin-logo-full', '.admin-logo-mark']],
        desc: {
          pl: 'Podmiana wordmarku na sygnet w wąskich trybach sidebara i na mobile - dwa osobne pliki w <code>.admin-brand</code>, CSS wybiera jeden. Trzecia strategia obok „ukryj" (<code>.admin-logo-hide</code>) i „zmniejsz to samo" (<code>.admin-logo-compact</code>).',
          en: 'Swaps the wordmark for the logomark in narrow sidebar modes and on mobile - two separate files inside <code>.admin-brand</code>, CSS picks one. The third strategy next to "hide it" (<code>.admin-logo-hide</code>) and "shrink the same thing" (<code>.admin-logo-compact</code>).',
          de: 'Tauscht die Wortmarke in schmalen Sidebar-Modi und auf Mobilgeräten gegen die Bildmarke - zwei separate Dateien in <code>.admin-brand</code>, CSS wählt eine aus. Die dritte Strategie neben "ausblenden" (<code>.admin-logo-hide</code>) und "dasselbe verkleinern" (<code>.admin-logo-compact</code>).',
        },
        demo: '-',
        tags: ['admin', 'responsive'],
      },
      {
        id: 'admin-nav',
        classes: [['.admin-nav', '.admin-nav-link', '.nav-text']],
        desc: {
          pl: 'Lista linków w sidebarze.',
          en: 'The list of links in the sidebar.',
          de: 'Die Liste der Links in der Sidebar.',
        },
        demo: '-',
        tags: ['admin', 'nav', 'menu'],
      },
      {
        id: 'admin-nav-submenu',
        classes: [['.admin-nav-submenu', '.admin-nav-submenu-list']],
        desc: {
          pl: 'Rozwijane drzewko linków (Submenu) na natywnym <code>&lt;details&gt;</code>. Ten sam markup dopasowuje się do trybu: drzewko (szeroki sidebar), a w wariantach wąskich (<code>-sm</code>/<code>-md</code>) oraz w Bottom Nav na mobile - pełnoekranowy drill-down z paskiem <strong>Cofnij</strong>. Aktywność (podświetlenie z URL, brak auto-otwierania na starcie, wzajemne wykluczanie) obsługuje moduł <code>admin-nav.js</code> (auto-ładowany).',
          en: 'An expandable link tree (submenu) built on native <code>&lt;details&gt;</code>. The same markup adapts to the mode: a tree (wide sidebar), and in the narrow variants (<code>-sm</code>/<code>-md</code>) and in Bottom Nav on mobile - a full-screen drill-down with a <strong>Back</strong> bar. Activity (URL highlighting, no auto-open on load, mutual exclusion) is handled by the <code>admin-nav.js</code> module (auto-loaded).',
          de: 'Ein auf nativem <code>&lt;details&gt;</code> basierender, aufklappbarer Link-Baum (Submenü). Dasselbe Markup passt sich dem Modus an: ein Baum (breite Sidebar), und in den schmalen Varianten (<code>-sm</code>/<code>-md</code>) sowie im Bottom Nav auf Mobilgeräten - ein vollflächiger Drill-down mit einer <strong>Zurück</strong>-Leiste. Die Aktivität (Hervorhebung aus der URL, kein automatisches Öffnen beim Start, gegenseitiger Ausschluss) übernimmt das Modul <code>admin-nav.js</code> (automatisch geladen).',
        },
        demo: '-',
        tags: ['admin', 'nav', 'menu', 'zerojs'],
      },
      {
        id: 'admin-nav-dropdown-menu',
        classes: [['.admin-nav-dropdown-menu', '.mobile-more-label'], ['.admin-nav-more-item']],
        desc: {
          pl: 'Drop-up "Więcej" - OSOBNY wzorzec od submenu, do przepełnienia paska. Checkbox Hack: <code>.mobile-more-toggle</code> (input) + <code>.mobile-more-label</code> (trigger) + <code>.admin-nav-dropdown-menu</code> (szuflada; desktop <code>display: contents</code>, mobile wysuwana od dołu).',
          en: 'The "More" drop-up - a SEPARATE pattern from the submenu, for bar overflow. Checkbox hack: <code>.mobile-more-toggle</code> (input) + <code>.mobile-more-label</code> (trigger) + <code>.admin-nav-dropdown-menu</code> (drawer; desktop <code>display: contents</code>, mobile slides up from the bottom).',
          de: 'Das „Mehr"-Drop-up - ein VOM Submenü GETRENNTES Muster für die Überfüllung der Leiste. Checkbox-Hack: <code>.mobile-more-toggle</code> (Input) + <code>.mobile-more-label</code> (Trigger) + <code>.admin-nav-dropdown-menu</code> (Schublade; Desktop <code>display: contents</code>, mobil von unten hereingleitend).',
        },
        demo: '-',
        tags: ['admin', 'nav', 'mobile', 'menu'],
      },
      {
        id: 'mobile-more-toggle',
        classes: [['.mobile-more-toggle', '.mobile-only-nav-item']],
        desc: {
          pl: 'Klasy pomocnicze do obsługi szuflady na mobile (Checkbox Hack).',
          en: 'Helper classes for handling the mobile drawer (checkbox hack).',
          de: 'Hilfsklassen zur Steuerung der mobilen Schublade (Checkbox-Hack).',
        },
        demo: '-',
        tags: ['admin', 'nav', 'mobile', 'zerojs'],
      },
      {
        id: 'dashboard-header',
        classes: [['.dashboard-header', '.dashboard-header-actions']],
        desc: {
          pl: 'Tworzy iluzję wycięcia (Faux Cutout) w nagłówku panelu admina.',
          en: 'Creates the illusion of a cutout (faux cutout) in the admin panel header.',
          de: 'Erzeugt die Illusion eines Ausschnitts (Faux Cutout) im Header des Admin-Panels.',
        },
        demo: '-',
        tags: ['admin', 'dashboard'],
      },
      {
        id: 'admin-main',
        classes: [['.admin-main']],
        desc: {
          pl: 'Kolumna treści. <code>overflow-x: hidden</code> - szerokie tabele wymagają własnego <code>.table-wrapper</code>.',
          en: 'The content column. <code>overflow-x: hidden</code> - wide tables need their own <code>.table-wrapper</code>.',
          de: 'Die Inhaltsspalte. <code>overflow-x: hidden</code> - breite Tabellen brauchen ihren eigenen <code>.table-wrapper</code>.',
        },
        demo: '-',
        tags: ['admin'],
        source: 'docs-admin',
      },
      {
        id: 'sidebar-toggle-icon',
        classes: [['.sidebar-toggle-icon']],
        desc: {
          pl: 'Wymaga dokładnie <strong>trzech</strong> pustych <code>&lt;span&gt;</code> w środku - CSS pozycjonuje je przez <code>:nth-child</code>, żeby uzyskać trzy różne kształty (hamburger / linie asymetryczne / strzałka).',
          en: 'Requires exactly <strong>three</strong> empty <code>&lt;span&gt;</code>s inside - CSS positions them via <code>:nth-child</code> to produce three different shapes (hamburger / asymmetric lines / arrow).',
          de: 'Erfordert genau <strong>drei</strong> leere <code>&lt;span&gt;</code>-Elemente darin - CSS positioniert sie über <code>:nth-child</code>, um drei verschiedene Formen zu erzeugen (Hamburger / asymmetrische Linien / Pfeil).',
        },
        demo: '-',
        tags: ['admin'],
        source: 'docs-admin',
      },
      {
        id: 'admin-nav-divider',
        classes: [['.admin-nav-divider']],
        desc: {
          pl: 'Pozioma linia rozdzielająca grupy linków. Znika na mobile.',
          en: 'A horizontal line separating groups of links. Disappears on mobile.',
          de: 'Horizontale Trennlinie zwischen Linkgruppen. Verschwindet auf Mobilgeräten.',
        },
        demo: '-',
        tags: ['admin'],
        source: 'docs-admin',
      },
      {
        id: 'admin-nav-bottom',
        classes: [['.admin-nav-bottom']],
        desc: {
          pl: 'Na osobnym <code>&lt;ul class="admin-nav"&gt;</code> - <code>margin-top: auto</code> dociska go do samego dołu sidebara (np. link „Ustawienia" albo przełącznik z sekcji 2). Ukryty na mobile.',
          en: 'On a separate <code>&lt;ul class="admin-nav"&gt;</code> - <code>margin-top: auto</code> pins it to the very bottom of the sidebar (e.g. a "Settings" link or the toggle from section 2). Hidden on mobile.',
          de: 'Auf einem separaten <code>&lt;ul class="admin-nav"&gt;</code> - <code>margin-top: auto</code> drückt es ganz nach unten in der Sidebar (z. B. ein Link „Einstellungen" oder der Umschalter aus Abschnitt 2). Auf Mobilgeräten verborgen.',
        },
        demo: '-',
        tags: ['admin'],
        source: 'docs-admin',
      },
      {
        id: 'admin-nav-submenu-link',
        classes: [['.admin-nav-submenu-link']],
        desc: {
          pl: 'Pojedynczy link w submenu. Wariant <code>.is-active</code> jak w linkach głównych.',
          en: 'A single link inside the submenu. <code>.is-active</code> variant works the same as on top-level links.',
          de: 'Ein einzelner Link im Untermenü. Die Variante <code>.is-active</code> funktioniert wie bei den Hauptlinks.',
        },
        demo: '-',
        tags: ['admin'],
        source: 'docs-admin',
      },
    ],
  },
  {
    id: 'modale-i-warstwa-wierzchnia',
    title: {
      pl: 'Modale i warstwa wierzchnia',
      en: 'Modals and the top layer',
      de: 'Modale und Top-Layer',
    },
    rows: [
      {
        id: 'modal-dialog',
        classes: [['.modal-dialog', '.modal-sm'], ['.modal-close-btn', '.modal-divider', '.modal-action-list']],
        desc: {
          pl: 'Natywne okno modalne oparte na tagu <code>&lt;dialog&gt;</code>. Części pomocnicze: <code>.modal-close-btn</code> (przycisk X), <code>.modal-divider</code> (linia), <code>.modal-action-list</code> &gt; <code>.modal-action-btn</code> (lista akcji).',
          en: 'A native modal window built on the <code>&lt;dialog&gt;</code> tag. Helper parts: <code>.modal-close-btn</code> (× button), <code>.modal-divider</code> (a line), <code>.modal-action-list</code> &gt; <code>.modal-action-btn</code> (action list).',
          de: 'Ein natives, auf dem Tag <code>&lt;dialog&gt;</code> basierendes modales Fenster. Hilfsteile: <code>.modal-close-btn</code> (×-Button), <code>.modal-divider</code> (eine Linie), <code>.modal-action-list</code> &gt; <code>.modal-action-btn</code> (Aktionsliste).',
        },
        demo: '-',
        tags: ['modal', 'zerojs'],
      },
      {
        id: 'modal-context',
        classes: [['.modal-context']],
        desc: {
          pl: 'Wariant <code>.modal-dialog</code> jako wąski panel boczny (desktop) lub dolna szufladka - Bottom Sheet (mobile).',
          en: 'A <code>.modal-dialog</code> variant as a narrow side panel (desktop) or a bottom drawer - bottom sheet (mobile).',
          de: 'Eine <code>.modal-dialog</code>-Variante als schmales Seitenpanel (Desktop) oder untere Schublade - Bottom Sheet (Mobil).',
        },
        demo: '-',
        tags: ['modal', 'mobile'],
      },
      {
        id: 'modal-confirm',
        classes: [['.modal-confirm', '.modal-confirm-icon']],
        desc: {
          pl: 'Wariant modala do potwierdzania akcji (np. usunięcia) - z wyśrodkowaną ikoną i skróconą treścią.',
          en: 'A modal variant for confirming an action (e.g. a deletion) - with a centered icon and shortened content.',
          de: 'Eine Modal-Variante zur Bestätigung einer Aktion (z. B. einer Löschung) - mit zentriertem Icon und verkürztem Inhalt.',
        },
        demo: '-',
        tags: ['modal', 'feedback'],
      },
      {
        id: 'popover-context',
        classes: [['.popover-context']],
        desc: {
          pl: 'Menu kontekstowe wykorzystujące natywne Popover API i Anchor Positioning.',
          en: 'A context menu using the native Popover API and Anchor Positioning.',
          de: 'Ein Kontextmenü, das die native Popover API und Anchor Positioning nutzt.',
        },
        demo: '-',
        tags: ['modal', 'menu', 'clip'],
      },
      {
        id: 'lightbox-overlay',
        classes: [['.lightbox-overlay', '.lightbox-content'], ['.lightbox-top-bar', '.lightbox-counter', '.lightbox-close'], ['.lightbox-nav', '.lightbox-prev', '.lightbox-next']],
        desc: {
          pl: 'Pełnoekranowa galeria zdjęć. Wystarczy <code >&lt;a href="duze.jpg" data-lightbox data-gallery="nazwa"&gt;</code > - reszta dzieje się automatycznie.',
          en: 'A full-screen photo gallery. All you need is <code >&lt;a href="large.jpg" data-lightbox data-gallery="name"&gt;</code > - the rest happens automatically.',
          de: 'Eine Vollbild-Fotogalerie. Es genügt <code >&lt;a href="groß.jpg" data-lightbox data-gallery="name"&gt;</code > - der Rest geschieht automatisch.',
        },
        demo: '-',
        tags: ['modal', 'overlay'],
      },
      {
        id: 'onboarding-dialog',
        classes: [['.onboarding-dialog', '.onboarding-slide'], ['.onboarding-slide-title', '.onboarding-slide-desc', '.onboarding-slide-media'], ['.onboarding-slide-icon', '.onboarding-slide-image', '.onboarding-step-count'], ['.onboarding-footer', '.onboarding-nav', '.onboarding-dots', '.onboarding-dot'], ['.onboarding-prev', '.onboarding-next', '.onboarding-skip']],
        desc: {
          pl: 'Pełnoekranowe plansze powitalne (ikona/obrazek + tytuł + opis). Deklaratywnie przez <code>data-onboarding</code> lub <code>MoliqueOnboarding.start(slides)</code>.',
          en: 'Full-screen welcome slides (icon/image + title + description). Declaratively via <code>data-onboarding</code>, or <code>MoliqueOnboarding.start(slides)</code>.',
          de: 'Vollbild-Willkommens-Slides (Icon/Bild + Titel + Beschreibung). Deklarativ über <code>data-onboarding</code> oder <code>MoliqueOnboarding.start(slides)</code>.',
        },
        demo: '-',
        tags: ['modal'],
      },
      {
        id: 'tour-dialog',
        classes: [['.tour-dialog', '.tour-spotlight', '.tour-tooltip'], ['.tour-tooltip-title', '.tour-tooltip-desc', '.tour-tooltip-footer'], ['.tour-nav', '.tour-dots', '.tour-dot', '.tour-step-count'], ['.tour-prev', '.tour-next', '.tour-skip']],
        desc: {
          pl: 'Sekwencja kroków po realnych elementach interfejsu: podświetlenie plus dymek. Deklaratywnie przez <code>data-tour</code> na elemencie lub <code>MoliqueTour.start(steps)</code>.',
          en: 'A sequence of steps over real interface elements: element highlight plus a tooltip. Declaratively via <code>data-tour</code> on an element, or <code>MoliqueTour.start(steps)</code>.',
          de: 'Eine Schrittfolge über echte Oberflächenelemente: Element-Hervorhebung plus Sprechblase. Deklarativ über <code>data-tour</code> auf einem Element oder <code>MoliqueTour.start(steps)</code>.',
        },
        demo: '-',
        tags: ['modal', 'overlay'],
      },
      {
        id: 'tooltip-element',
        classes: [['.tooltip-element']],
        desc: {
          pl: 'Prosty tooltip w czystym CSS oparty na atrybucie <code>data-tooltip</code>.',
          en: 'A simple, pure-CSS tooltip built on the <code>data-tooltip</code> attribute.',
          de: 'Ein einfacher, reiner CSS-Tooltip auf Basis des Attributs <code>data-tooltip</code>.',
        },
        demo: '-',
        tags: ['feedback', 'zerojs'],
      },
      {
        id: 'tooltip-element-bottom',
        classes: [['.tooltip-element-bottom'], ['.tooltip-element-end']],
        desc: {
          pl: 'Wariant otwierający dymek w dół zamiast w górę - użyj, gdy wyzwalacz siedzi blisko górnej krawędzi kontenera z <code>overflow: hidden</code> (np. <code>.card-header</code> wewnątrz <code>.card</code>), gdzie domyślny dymek zostałby przycięty.',
          en: 'Opens the bubble downward instead of upward - use when the trigger sits near the top edge of an <code>overflow: hidden</code> container (e.g. a <code>.card-header</code> inside a <code>.card</code>), where the default upward bubble would get clipped.',
          de: 'Öffnet die Sprechblase nach unten statt nach oben - zu verwenden, wenn der Auslöser nahe der oberen Kante eines Containers mit <code>overflow: hidden</code> sitzt (z. B. ein <code>.card-header</code> innerhalb einer <code>.card</code>), wo die standardmäßige Blase nach oben abgeschnitten würde.',
        },
        demo: '-',
        tags: ['feedback'],
      },
      {
        id: 'modal-action-btn',
        classes: [['.modal-action-btn']],
        desc: {
          pl: 'Pojedyncza akcja na liście.',
          en: 'A single action in the list.',
          de: 'Eine einzelne Aktion in der Liste.',
        },
        demo: '-',
        tags: ['modal'],
        source: 'docs-interactive',
      },
      {
        id: 'popover-action-btn',
        classes: [['.popover-action-btn']],
        desc: {
          pl: 'Pozycja menu.',
          en: 'A menu item.',
          de: 'Ein Menüpunkt.',
        },
        demo: '-',
        tags: ['modal'],
        source: 'docs-interactive',
      },
      {
        id: 'is-flipped',
        classes: [['.is-flipped']],
        desc: {
          pl: 'Menu odbite nad przycisk przy braku miejsca. Nadaje je JS.',
          en: 'The menu flipped above the button when there\'s no room below. Applied by JS.',
          de: 'Das über den Button geklappte Menü bei Platzmangel. Wird von JS vergeben.',
        },
        demo: '-',
        tags: ['modal', 'state'],
        source: 'docs-interactive',
      },
      {
        id: 'onboarding-card',
        classes: [['.onboarding-card']],
        desc: {
          pl: 'Karta planszy. Szerokość zmienną <code>--onboarding-card-width</code> (domyślnie 440px), ustawianą na <code>:root</code> - kartę buduje JS, więc nie ma markupu na <code>style=""</code>. Zmienna nie dotyczy gałęzi mobilnej, gdzie karta i tak zajmuje pełny ekran.',
          en: 'The slide card. Width via <code>--onboarding-card-width</code> (440px by default), set on <code>:root</code> - the card is built by JS, so there is no markup to put a <code>style=""</code> on. The variable deliberately does not reach the mobile branch, where the card goes full-screen anyway.',
          de: 'Die Karte der Folie. Breite über <code>--onboarding-card-width</code> (Standard 440px), gesetzt auf <code>:root</code> - die Karte wird per JS erzeugt, es gibt also kein Markup für ein <code>style=""</code>. Die Variable erreicht den Mobile-Zweig bewusst nicht, dort füllt die Karte ohnehin den ganzen Bildschirm.',
        },
        demo: '-',
        tags: ['modal'],
        source: 'docs-onboarding',
      },
    ],
  },
  {
    id: 'feedback-i-statusy',
    title: {
      pl: 'Feedback i statusy',
      en: 'Feedback and statuses',
      de: 'Feedback und Status',
    },
    rows: [
      {
        id: 'alert',
        classes: [['.alert', '.alert-success'], ['.alert-*']],
        desc: {
          pl: 'Komunikat blokowy w treści strony. Warianty <code>.alert-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>.',
          en: 'A block message inside the page content. Variants: <code>.alert-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>.',
          de: 'Eine Blockmeldung im Seiteninhalt. Varianten: <code>.alert-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>.',
        },
        demo: '-',
        tags: ['feedback', 'color'],
      },
      {
        id: 'toast-container',
        classes: [['.toast-container', '.toast'], ['.toast-*']],
        desc: {
          pl: 'Powiadomienie „toast" na Popover API - markup buduje JS, wołasz <code>MoliqueToast.show({message, type})</code>. Typ daje wariant koloru (<code>.toast-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>), a pozycję kontener (<code>.toast-top-right</code> i osiem pozostałych kombinacji).',
          en: 'A toast notification built on the Popover API - the markup is created by JS, you call <code>MoliqueToast.show({message, type})</code>. The type picks a colour variant (<code>.toast-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>), the container picks a position (<code>.toast-top-right</code> and the eight other combinations).',
          de: 'Eine Toast-Benachrichtigung auf Basis der Popover-API - das Markup baut JS, aufgerufen mit <code>MoliqueToast.show({message, type})</code>. Der Typ wählt die Farbvariante (<code>.toast-success</code>, <code>-danger</code>, <code>-warning</code>, <code>-info</code>), der Container die Position (<code>.toast-top-right</code> und die acht weiteren Kombinationen).',
        },
        demo: '-',
        tags: ['feedback', 'state'],
      },
      {
        id: 'status-dot',
        classes: [['.status-dot', '.status-pending'], ['.status-draft', '.status-done', '.status-danger', '.status-ping']],
        desc: {
          pl: 'Kropka statusu: <code>.status-draft</code>, <code>-pending</code>, <code>-done</code>, <code>-danger</code>. <code>.status-ping</code> dokłada pulsowanie.',
          en: 'A status dot: <code>.status-draft</code>, <code>-pending</code>, <code>-done</code>, <code>-danger</code>. <code>.status-ping</code> adds the pulse.',
          de: 'Ein Statuspunkt: <code>.status-draft</code>, <code>-pending</code>, <code>-done</code>, <code>-danger</code>. <code>.status-ping</code> ergänzt das Pulsieren.',
        },
        demo: '<span class="status-dot status-success status-ping"></span>',
        tags: ['state', 'color'],
      },
      {
        id: 'status-icon-toggle',
        classes: [['.status-icon-toggle', '.status-checkbox'], ['.status-icon', '.status-icon-add', '.status-icon-success']],
        desc: {
          pl: 'Animowana ikonka Plus → Ptaszek. Jako <code>&lt;label class="status-checkbox"&gt;</code> z ukrytym checkboxem działa w 100% na CSS (zero JS).',
          en: 'An animated plus → checkmark icon. As a <code>&lt;label class="status-checkbox"&gt;</code> with a hidden checkbox, it works 100% on CSS (zero JS).',
          de: 'Ein animiertes Plus-→-Haken-Icon. Als <code>&lt;label class="status-checkbox"&gt;</code> mit versteckter Checkbox funktioniert es zu 100 % über CSS (null JS).',
        },
        demo: {
          pl: '<label class="status-checkbox m-0"> <input type="checkbox" checked aria-label="Przykład: checkbox statusu" /> <span class="status-icon-toggle"></span> </label>',
          en: '<label class="status-checkbox m-0"> <input type="checkbox" checked aria-label="Example: status checkbox" /> <span class="status-icon-toggle"></span> </label>',
          de: '<label class="status-checkbox m-0"> <input type="checkbox" checked aria-label="Beispiel: Status-Checkbox" /> <span class="status-icon-toggle"></span> </label>',
        },
        tags: ['state', 'animation', 'icon'],
      },
      {
        id: 'stock-bar',
        classes: [['.stock-bar', '.stock-bar-success'], ['.stock-bar-*']],
        desc: {
          pl: 'Segmentowy poziom zapasu (5 segmentów, maska SVG, zero JS). Wypełnienie przez <code>style="--stock-filled: 3"</code> (0-5). Warianty: <code>-success</code>, <code>-warning</code>, <code>-danger</code>.',
          en: 'A segmented stock level (5 segments, SVG mask, zero JS). Fill via <code>style="--stock-filled: 3"</code> (0-5). Variants: <code>-success</code>, <code>-warning</code>, <code>-danger</code>.',
          de: 'Ein segmentierter Lagerbestand (5 Segmente, SVG-Maske, null JS). Füllung über <code>style="--stock-filled: 3"</code> (0-5). Varianten: <code>-success</code>, <code>-warning</code>, <code>-danger</code>.',
        },
        demo: '<span class="stock-bar stock-bar-success" style="--stock-filled: 4" ></span>',
        tags: ['state', 'shop', 'chart'],
      },
      {
        id: 'progress',
        classes: [['.progress', '.progress-bar']],
        desc: {
          pl: 'Prosty pasek postępu. Szerokość ustaw przez <code>style="width: 60%"</code> na <code>.progress-bar</code>.',
          en: 'A simple progress bar. Set the width via <code>style="width: 60%"</code> on <code>.progress-bar</code>.',
          de: 'Ein einfacher Fortschrittsbalken. Setzen Sie die Breite über <code>style="width: 60%"</code> an <code>.progress-bar</code>.',
        },
        demo: '<div class="progress w-100" style="max-width: 140px"> <div class="progress-bar" style="width: 60%"></div> </div>',
        tags: ['feedback', 'state'],
      },
      {
        id: 'empty-state',
        classes: [['.empty-state', '.empty-state-icon']],
        desc: {
          pl: 'Pusty stan danych (gdy nie ma wyników).',
          en: 'An empty data state (when there are no results).',
          de: 'Ein leerer Datenzustand (wenn es keine Ergebnisse gibt).',
        },
        demo: '-',
        tags: ['feedback', 'icon'],
      },
      {
        id: 'progress-label',
        classes: [['.progress-label']],
        desc: {
          pl: 'Wiersz etykieta + wartość nad paskiem. Opcjonalny.',
          en: 'A row of label + value above the bar. Optional.',
          de: 'Eine Zeile Beschriftung + Wert über dem Balken. Optional.',
        },
        demo: '-',
        tags: ['feedback'],
        source: 'docs-components-extra',
      },
      {
        id: 'toast-progress',
        classes: [['.toast-progress']],
        desc: {
          pl: 'Pasek odliczający do zniknięcia. Animacja <code>toastProgressAnim</code> też musi być na safeliście.',
          en: 'A bar counting down to dismissal. The <code>toastProgressAnim</code> animation also needs to be on the safelist.',
          de: 'Ein Balken, der bis zum Verschwinden herunterzählt. Die Animation <code>toastProgressAnim</code> muss ebenfalls auf der Safelist stehen.',
        },
        demo: '-',
        tags: ['feedback'],
        source: 'docs-interactive',
      },
      {
        id: 'is-closing',
        classes: [['.is-closing']],
        desc: {
          pl: 'Stan znikania; nadaje go skrypt.',
          en: 'The dismissing state; applied by the script.',
          de: 'Der Zustand beim Verschwinden; wird vom Skript vergeben.',
        },
        demo: '-',
        tags: ['feedback', 'state'],
        source: 'docs-interactive',
      },
    ],
  },
  {
    id: 'animacje-i-efekty',
    title: {
      pl: 'Animacje i efekty',
      en: 'Animations and effects',
      de: 'Animationen und Effekte',
    },
    rows: [
      {
        id: 'animate',
        classes: [['.animate', '.fade-in-up', '.fade-in-down'], ['.fade-in-left', '.fade-in-right', '.zoom-in'], ['.delay-100', '..', '-500']],
        desc: {
          pl: 'Animacje wejścia uruchamiane przez <code>IntersectionObserver</code> z <code>molique-script.js</code> (dodaje <code>.is-visible</code>). Opóźnienie: <code>.delay-100</code>, <code>.delay-200</code>, <code>.delay-300</code>.',
          en: 'Entrance animations triggered by <code>IntersectionObserver</code> in <code>molique-script.js</code> (adds <code>.is-visible</code>). Delay: <code>.delay-100</code>, <code>.delay-200</code>, <code>.delay-300</code>.',
          de: 'Eintrittsanimationen, ausgelöst durch <code>IntersectionObserver</code> in <code>molique-script.js</code> (fügt <code>.is-visible</code> hinzu). Verzögerung: <code>.delay-100</code>, <code>.delay-200</code>, <code>.delay-300</code>.',
        },
        demo: '-',
        tags: ['animation'],
      },
      {
        id: 'reveal-blur',
        classes: [['.reveal-blur', '.reveal-scale']],
        desc: {
          pl: 'Warianty wejścia: rozmycie lub powiększenie zamiast przesunięcia.',
          en: 'Entrance variants: blur or zoom instead of a shift.',
          de: 'Eintrittsvarianten: Unschärfe oder Vergrößerung statt Verschiebung.',
        },
        demo: '-',
        tags: ['animation', 'scroll'],
      },
      {
        id: 'scroll-reveal',
        classes: [['.scroll-reveal']],
        desc: {
          pl: 'Animacja sterowana samym scrollem przez natywne <code>animation-timeline: view()</code> - zero JS i zero Intersection Observer.',
          en: 'An animation driven purely by scroll via native <code>animation-timeline: view()</code> - zero JS and zero Intersection Observer.',
          de: 'Eine rein durch Scrollen gesteuerte Animation über das native <code>animation-timeline: view()</code> - null JS und null Intersection Observer.',
        },
        demo: '-',
        tags: ['animation', 'scroll', 'zerojs'],
      },
      {
        id: 'hover-spring',
        classes: [['.hover-spring']],
        desc: {
          pl: 'Sprężyste powiększenie elementu na hover.',
          en: 'A springy scale-up of the element on hover.',
          de: 'Eine federnde Vergrößerung des Elements bei Hover.',
        },
        demo: {
          pl: '<div class="hover-spring badge bg-primary cursor-pointer"> Najedź </div>',
          en: '<div class="hover-spring badge bg-primary cursor-pointer"> Hover me </div>',
          de: '<div class="hover-spring badge bg-primary cursor-pointer"> Hovern </div>',
        },
        tags: ['animation', 'state'],
      },
      {
        id: 'hover-gpu-shadow',
        classes: [['.hover-gpu-shadow']],
        desc: {
          pl: 'Unoszenie elementu z miękkim cieniem na hover (cień animowany przez pseudoelement, nie <code>box-shadow</code> bezpośrednio).',
          en: 'Lifts the element with a soft shadow on hover (the shadow is animated via a pseudo-element, not <code>box-shadow</code> directly).',
          de: 'Hebt das Element bei Hover mit einem weichen Schatten an (der Schatten wird über ein Pseudo-Element animiert, nicht direkt über <code>box-shadow</code>).',
        },
        demo: {
          pl: '<div class="hover-gpu-shadow badge bg-surface border text-main cursor-pointer" > Najedź </div>',
          en: '<div class="hover-gpu-shadow badge bg-surface border text-main cursor-pointer" > Hover me </div>',
          de: '<div class="hover-gpu-shadow badge bg-surface border text-main cursor-pointer" > Hovern </div>',
        },
        tags: ['animation', 'shadow', 'state'],
      },
      {
        id: 'hover-scale',
        classes: [['.hover-scale', '.hover-shadow']],
        desc: {
          pl: 'Proste efekty hover: <code>.hover-scale</code> powiększa (scale 1.05), <code>.hover-shadow</code> unosi element z cieniem <code>--shadow-lg</code>. Lżejsze warianty niż <code>.hover-spring</code> / <code>.hover-gpu-shadow</code>.',
          en: 'Simple hover effects: <code>.hover-scale</code> scales up (scale 1.05), <code>.hover-shadow</code> lifts the element with the <code>--shadow-lg</code> shadow. Lighter variants than <code>.hover-spring</code> / <code>.hover-gpu-shadow</code>.',
          de: 'Einfache Hover-Effekte: <code>.hover-scale</code> vergrößert (scale 1.05), <code>.hover-shadow</code> hebt das Element mit dem Schatten <code>--shadow-lg</code> an. Leichtere Varianten als <code>.hover-spring</code> / <code>.hover-gpu-shadow</code>.',
        },
        demo: {
          pl: '<div class="hover-scale badge bg-primary cursor-pointer"> Najedź </div>',
          en: '<div class="hover-scale badge bg-primary cursor-pointer"> Hover me </div>',
          de: '<div class="hover-scale badge bg-primary cursor-pointer"> Hovern </div>',
        },
        tags: ['animation', 'shadow', 'state'],
      },
      {
        id: 'hover-tilt',
        classes: [['.hover-tilt', '.tilt-card']],
        desc: {
          pl: 'Przechylenie 3D na hover. <code>.hover-tilt</code> to statyczny efekt CSS, <code>.tilt-card</code> dynamicznie śledzi kursor (wymaga <code>tilt.js</code>).',
          en: 'A 3D tilt on hover. <code>.hover-tilt</code> is a static CSS effect, <code>.tilt-card</code> dynamically tracks the cursor (requires <code>tilt.js</code>).',
          de: 'Eine 3D-Neigung bei Hover. <code>.hover-tilt</code> ist ein statischer CSS-Effekt, <code>.tilt-card</code> folgt dynamisch dem Cursor (erfordert <code>tilt.js</code>).',
        },
        demo: {
          pl: '<div class="hover-tilt badge bg-primary cursor-pointer"> Najedź </div>',
          en: '<div class="hover-tilt badge bg-primary cursor-pointer"> Hover me </div>',
          de: '<div class="hover-tilt badge bg-primary cursor-pointer"> Hovern </div>',
        },
        tags: ['animation', 'state'],
      },
      {
        id: 'hover-underline',
        classes: [['.hover-underline', '.hover-underline-center']],
        desc: {
          pl: 'Podkreślenie wjeżdżające na hover (od lewej lub od środka).',
          en: 'An underline sweeping in on hover (from the left or from the center).',
          de: 'Eine bei Hover einfahrende Unterstreichung (von links oder von der Mitte).',
        },
        demo: {
          pl: '<span class="hover-underline cursor-pointer" >Najedź na mnie</span >',
          en: '<span class="hover-underline cursor-pointer">Hover me</span>',
          de: '<span class="hover-underline cursor-pointer" >Hovern Sie hier</span >',
        },
        tags: ['animation', 'state'],
      },
      {
        id: 'hover-text-wipe',
        classes: [['.hover-text-wipe']],
        desc: {
          pl: 'Kolor tekstu "wjeżdża" od lewej na hover (maskowanie tła przez tekst).',
          en: 'Text color "sweeps in" from the left on hover (background masked through the text).',
          de: 'Die Textfarbe „fährt" bei Hover von links ein (Hintergrund durch den Text maskiert).',
        },
        demo: {
          pl: '<span class="hover-text-wipe fw-bold cursor-pointer" >Najedź na mnie</span >',
          en: '<span class="hover-text-wipe fw-bold cursor-pointer" >Hover me</span >',
          de: '<span class="hover-text-wipe fw-bold cursor-pointer" >Hovern Sie hier</span >',
        },
        tags: ['animation', 'state'],
      },
      {
        id: 'hover-border-draw',
        classes: [['.hover-border-draw', '.hover-border-trace']],
        desc: {
          pl: 'Nowoczesne animacje ramki (Maskowanie CSS). Idealnie opływają <code>border-radius</code>.',
          en: 'Modern border animations (CSS masking). Follow <code>border-radius</code> perfectly.',
          de: 'Moderne Rahmen-Animationen (CSS-Maskierung). Folgen dem <code>border-radius</code> perfekt.',
        },
        demo: {
          pl: '<div class="hover-border-draw p-1 text-center text-4 cursor-pointer" > Najedź </div>',
          en: '<div class="hover-border-draw p-1 text-center text-4 cursor-pointer" > Hover me </div>',
          de: '<div class="hover-border-draw p-1 text-center text-4 cursor-pointer" > Hovern </div>',
        },
        tags: ['animation', 'state', 'radius'],
      },
      {
        id: 'hover-border-draw-2',
        classes: [['.hover-border-draw-2', '.hover-border-trace-2']],
        desc: {
          pl: 'Klasyczne animacje ramki (Gradienty). Tworzą ostre kąty.',
          en: 'Classic border animations (gradients). Produce sharp corners.',
          de: 'Klassische Rahmen-Animationen (Verläufe). Erzeugen scharfe Ecken.',
        },
        demo: {
          pl: '<div class="hover-border-draw-2 p-1 text-center text-4 cursor-pointer" > Najedź </div>',
          en: '<div class="hover-border-draw-2 p-1 text-center text-4 cursor-pointer" > Hover me </div>',
          de: '<div class="hover-border-draw-2 p-1 text-center text-4 cursor-pointer" > Hovern </div>',
        },
        tags: ['animation', 'state'],
      },
      {
        id: 'text-highlight',
        classes: [['.text-highlight']],
        desc: {
          pl: 'Zakreślacz tekstu wjeżdżający na hover (lub na stałe z <code>.is-active</code>).',
          en: 'A text highlighter sweeping in on hover (or permanently with <code>.is-active</code>).',
          de: 'Ein bei Hover einfahrender Textmarker (oder dauerhaft mit <code>.is-active</code>).',
        },
        demo: {
          pl: '<span class="text-highlight cursor-pointer" >Najedź na mnie</span >',
          en: '<span class="text-highlight cursor-pointer">Hover me</span>',
          de: '<span class="text-highlight cursor-pointer" >Hovern Sie hier</span >',
        },
        tags: ['animation', 'color'],
      },
      {
        id: 'text-clip-bg',
        classes: [['.text-clip-bg']],
        desc: {
          pl: 'Tekst wycięty z tła (wymaga zmiennej <code>--clip-img</code>).',
          en: 'Text cut out of a background (requires the <code>--clip-img</code> variable).',
          de: 'Text, der aus einem Hintergrund ausgeschnitten wird (erfordert die Variable <code>--clip-img</code>).',
        },
        demo: '-',
        tags: ['color', 'clip'],
      },
      {
        id: 'text-gradient-animated',
        classes: [['.text-gradient-animated']],
        desc: {
          pl: 'Animowany gradient tekstu. Domyślnie używa kolorów primary, info i success. <br />Zmień kolory dodając: <code >style="--gradient-color-1: var(--danger); --gradient-color-2: var(--warning);"</code >',
          en: 'An animated text gradient. Uses the primary, info, and success colors by default. <br />Change the colors by adding: <code >style="--gradient-color-1: var(--danger); --gradient-color-2: var(--warning);"</code >',
          de: 'Ein animierter Textverlauf. Verwendet standardmäßig die Farben primary, info und success. <br />Ändern Sie die Farben durch Hinzufügen von: <code >style="--gradient-color-1: var(--danger); --gradient-color-2: var(--warning);"</code >',
        },
        demo: '<span class="text-gradient-animated fw-black text-6" >Gradient</span >',
        tags: ['animation', 'color'],
      },
      {
        id: 'word-rotator',
        classes: [['.word-rotator', '.typewriter'], ['.word-rotator-items']],
        desc: {
          pl: 'Rotujące słowa lub efekt maszyny do pisania. Wymaga <code>text-effects.js</code> (autoloader).',
          en: 'Rotating words or a typewriter effect. Requires <code>text-effects.js</code> (autoloader).',
          de: 'Rotierende Wörter oder ein Schreibmaschineneffekt. Erfordert <code>text-effects.js</code> (Autoloader).',
        },
        demo: '-',
        tags: ['animation'],
      },
      {
        id: 'shake',
        classes: [['.shake']],
        desc: {
          pl: 'Potrząśnięcie elementem (np. przy błędzie formularza - używane automatycznie razem z <code>:user-invalid</code>).',
          en: 'Shakes the element (e.g. on a form error - used automatically together with <code>:user-invalid</code>).',
          de: 'Lässt das Element wackeln (z. B. bei einem Formularfehler - wird automatisch zusammen mit <code>:user-invalid</code> verwendet).',
        },
        demo: {
          pl: '<span class="badge bg-danger shake">Błąd</span>',
          en: '<span class="badge bg-danger shake">Error</span>',
          de: '<span class="badge bg-danger shake">Fehler</span>',
        },
        tags: ['animation', 'feedback'],
      },
      {
        id: 'ken-burns',
        classes: [['.ken-burns']],
        desc: {
          pl: 'Powolne, ciągłe powiększenie zdjęcia w tle na hover kontenera.',
          en: 'A slow, continuous zoom on a background photo when the container is hovered.',
          de: 'Ein langsamer, kontinuierlicher Zoom auf ein Hintergrundfoto, wenn der Container gehovert wird.',
        },
        demo: '-',
        tags: ['animation'],
      },
      {
        id: 'parallax-container',
        classes: [['.parallax-container', '.parallax-bg']],
        desc: {
          pl: 'Tło poruszające się wolniej niż treść podczas scrollowania. Wymaga <code>parallax.js</code>.',
          en: 'A background moving slower than the content while scrolling. Requires <code>parallax.js</code>.',
          de: 'Ein Hintergrund, der sich beim Scrollen langsamer bewegt als der Inhalt. Erfordert <code>parallax.js</code>.',
        },
        demo: '-',
        tags: ['animation', 'scroll', 'zerojs'],
      },
      {
        id: 'fade-in',
        classes: [['.fade-in']],
        desc: {
          pl: 'Samo pojawienie, bez ruchu.',
          en: 'Just a fade-in, no movement.',
          de: 'Nur Erscheinen, ohne Bewegung.',
        },
        demo: '-',
        tags: ['animation'],
        source: 'docs-animations',
      },
      {
        id: 'is-visible',
        classes: [['.is-visible']],
        desc: {
          pl: 'Nadaje skrypt po wejściu w widok. Ty jej nie wpisujesz.',
          en: 'Set by the script once the element scrolls into view. You don\'t write it yourself.',
          de: 'Wird vom Skript gesetzt, sobald das Element sichtbar wird. Sie schreiben sie nicht selbst.',
        },
        demo: '-',
        tags: ['animation', 'state'],
        source: 'docs-animations',
      },
      {
        id: 'parallax-content',
        classes: [['.parallax-content']],
        desc: {
          pl: 'Treść nad tłem.',
          en: 'The content above the background.',
          de: 'Der Inhalt über dem Hintergrund.',
        },
        demo: '-',
        tags: ['animation'],
        source: 'docs-sections',
      },
    ],
  },
  {
    id: 'tla-nakladki-i-filtry',
    title: {
      pl: 'Tła, nakładki i filtry',
      en: 'Backgrounds, overlays and filters',
      de: 'Hintergründe, Overlays und Filter',
    },
    rows: [
      {
        id: 'bg-video-container',
        classes: [['.bg-video-container', '.bg-video'], ['.bg-image-container', '.bg-image']],
        desc: {
          pl: 'Wideo lub obraz w tle sekcji (z plakatem <code>img.bg-video</code> jako fallback). Wariant <code>.bg-image-container</code> &gt; <code>.bg-image</code> (także <code>picture.bg-image</code>) dla statycznego tła; oba mają domyślną przyciemniającą nakładkę.',
          en: 'A background video or image for a section (with a poster <code>img.bg-video</code> as a fallback). The <code>.bg-image-container</code> &gt; <code>.bg-image</code> variant (also <code>picture.bg-image</code>) for a static background; both have a default dimming overlay.',
          de: 'Ein Hintergrundvideo oder -bild für einen Abschnitt (mit einem Poster <code>img.bg-video</code> als Fallback). Die Variante <code>.bg-image-container</code> &gt; <code>.bg-image</code> (auch <code>picture.bg-image</code>) für einen statischen Hintergrund; beide haben eine standardmäßig abdunkelnde Überlagerung.',
        },
        demo: '-',
        tags: ['overlay', 'color'],
      },
      {
        id: 'overlay',
        classes: [['.overlay', '.has-overlay'], ['.overlay-dark', '.overlay-primary', '.overlay-light'], ['.overlay-*']],
        desc: {
          pl: 'Nakładka na tło. Rodzic MUSI mieć <code>.has-overlay</code>, inaczej nakładka szuka kontekstu wyżej i rozlewa się poza sekcję. Sama <code>.overlay</code> daje przyciemnienie 50%; kolor zmieniają <code>.overlay-dark</code>/<code>-primary</code>/<code>-light</code>, a krycie <code>.overlay-10</code> do <code>.overlay-90</code>.',
          en: 'An overlay on top of a background. The parent MUST carry <code>.has-overlay</code>, otherwise the overlay looks further up for a context and spills outside the section. <code>.overlay</code> alone dims by 50%; <code>.overlay-dark</code>/<code>-primary</code>/<code>-light</code> change the colour and <code>.overlay-10</code> to <code>.overlay-90</code> the opacity.',
          de: 'Ein Overlay über dem Hintergrund. Das Elternelement MUSS <code>.has-overlay</code> tragen, sonst sucht das Overlay weiter oben nach einem Kontext und läuft über den Abschnitt hinaus. <code>.overlay</code> allein dunkelt um 50 % ab; <code>.overlay-dark</code>/<code>-primary</code>/<code>-light</code> ändern die Farbe, <code>.overlay-10</code> bis <code>.overlay-90</code> die Deckkraft.',
        },
        demo: '-',
        tags: ['overlay', 'color'],
      },
      {
        id: 'bg-blobs',
        classes: [['.bg-blobs'], ['.bg-blobs-deep']],
        desc: {
          pl: 'Dwie rozmyte, unoszące się plamy koloru w tle (dekoracja sekcji Hero).',
          en: 'Two blurred, floating color blobs in the background (hero section decoration).',
          de: 'Zwei verschwommene, schwebende Farbflecken im Hintergrund (Dekoration des Hero-Abschnitts).',
        },
        demo: '-',
        tags: ['overlay', 'animation', 'color'],
      },
      {
        id: 'bg-glass',
        classes: [['.bg-glass']],
        desc: {
          pl: 'Efekt Glassmorphism (rozmycie tła, szum, półprzezroczystość).',
          en: 'A glassmorphism effect (background blur, noise, semi-transparency).',
          de: 'Ein Glassmorphism-Effekt (Hintergrundunschärfe, Rauschen, Halbtransparenz).',
        },
        demo: '<div class="bg-glass p-2 text-center text-4">Glass</div>',
        tags: ['overlay', 'color'],
      },
      {
        id: 'bg-gradient-corners',
        classes: [['.bg-gradient-corners']],
        desc: {
          pl: 'Narożne gradienty tworzące efekt świetlnej łuny (ciemne tło).',
          en: 'Corner gradients creating a glowing-light effect (dark background).',
          de: 'Eckverläufe, die einen leuchtenden Schein-Effekt erzeugen (dunkler Hintergrund).',
        },
        demo: '-',
        tags: ['overlay', 'color'],
      },
      {
        id: 'bg-gradient-corners-light',
        classes: [['.bg-gradient-corners-light']],
        desc: {
          pl: 'Ta sama łuna, na jasnym tle - odwraca się z motywem.',
          en: 'Same glow, on a light background - flips with the theme.',
          de: 'Derselbe Schein, auf hellem Hintergrund - dreht sich mit dem Theme um.',
        },
        demo: '-',
        tags: ['overlay', 'color'],
      },
      {
        id: 'bg-knockout-wrapper',
        classes: [['.bg-knockout-wrapper', '.text-knockout-light']],
        desc: {
          pl: 'Tekst "wycięty" z jasnego/ciemnego tła (mieszanie trybów CSS).',
          en: 'Text "cut out" from a light/dark background (CSS blend modes).',
          de: 'Text, der aus einem hellen/dunklen Hintergrund „ausgeschnitten" wird (CSS-Mischmodi).',
        },
        demo: '-',
        tags: ['overlay', 'clip', 'color'],
      },
      {
        id: 'hero-with-cutout',
        classes: [['.hero-with-cutout', '.cutout-wrapper']],
        desc: {
          pl: 'System wyciętych narożników dla sekcji Hero (np. <code>.cutout-md-tr</code>).',
          en: 'A cut-corner system for hero sections (e.g. <code>.cutout-md-tr</code>).',
          de: 'Ein System ausgeschnittener Ecken für Hero-Abschnitte (z. B. <code>.cutout-md-tr</code>).',
        },
        demo: '-',
        tags: ['overlay', 'radius'],
      },
      {
        id: 'filter-grayscale',
        classes: [['.filter-grayscale', '.filter-blur', '.filter-none']],
        desc: {
          pl: 'Klasy narzędziowe nakładające filtry CSS na obrazy. <code>.filter-none</code> zdejmuje filtr (np. na hover razem z <code>.hover-filter-none</code> - odbarwione logo koloruje się po najechaniu).',
          en: 'Utility classes applying CSS filters to images. <code>.filter-none</code> removes the filter (e.g. on hover together with <code>.hover-filter-none</code> - a grayscale logo gains color when hovered).',
          de: 'Utility-Klassen, die CSS-Filter auf Bilder anwenden. <code>.filter-none</code> entfernt den Filter (z. B. bei Hover zusammen mit <code>.hover-filter-none</code> - ein entfärbtes Logo bekommt bei Hover Farbe).',
        },
        demo: '-',
        tags: ['color', 'state'],
      },
      {
        id: 'hover-filter-none',
        classes: [['.hover-filter-none']],
        desc: {
          pl: 'Zdejmuje filtr po najechaniu - logo szare, które koloruje się pod kursorem.',
          en: 'Removes a filter on hover - a gray logo that gains color under the cursor.',
          de: 'Entfernt beim Hover einen Filter - ein graues Logo, das unter dem Cursor Farbe erhält.',
        },
        demo: '-',
        tags: ['overlay'],
        source: 'docs-animations',
      },
      {
        id: 'bg-overlay',
        classes: [['.bg-overlay']],
        desc: {
          pl: 'Nakładka w czerni, bez odcienia motywu.',
          en: 'A black overlay, with no theme tint.',
          de: 'Ein schwarzes Overlay, ohne Theme-Farbton.',
        },
        demo: '-',
        tags: ['overlay'],
        source: 'docs-sections',
      },
      {
        id: 'cutout-md-bl',
        classes: [['.cutout-md-bl'], ['.cutout-md-br', '.cutout-md-tl', '.cutout-md-tr']],
        desc: {
          pl: 'Który róg zdjęcia zostaje wycięty: <code>bl</code> - lewy dolny. Dalej: <code>.cutout-md-br</code>, <code>.cutout-md-tl</code>, <code>.cutout-md-tr</code>. Przedrostek <code>md</code> mówi wprost, że efekt zaczyna się od tabletu.',
          en: 'Which corner of the photo gets cut: <code>bl</code> - bottom-left. Also: <code>.cutout-md-br</code>, <code>.cutout-md-tl</code>, <code>.cutout-md-tr</code>. The <code>md</code> prefix says outright that the effect starts at tablet width.',
          de: 'Welche Ecke des Fotos ausgeschnitten wird: <code>bl</code> - unten links. Weiter: <code>.cutout-md-br</code>, <code>.cutout-md-tl</code>, <code>.cutout-md-tr</code>. Das Präfix <code>md</code> sagt direkt, dass der Effekt ab Tablet-Breite beginnt.',
        },
        demo: '-',
        tags: ['overlay'],
        source: 'docs-sections',
      },
    ],
  },
  {
    id: 'sklep-i-blog',
    title: {
      pl: 'Sklep i blog',
      en: 'Shop and blog',
      de: 'Shop und Blog',
    },
    rows: [
      {
        id: 'product-card',
        classes: [['.product-card', '.product-list-view', '.star-rating']],
        desc: {
          pl: 'Karta produktu. Dodaj <code>.product-list-view</code> do rodzica dla widoku poziomego (listy zamiast siatki).',
          en: 'A product card. Add <code>.product-list-view</code> to the parent for a horizontal (list instead of grid) view.',
          de: 'Eine Produktkarte. Fügen Sie <code>.product-list-view</code> zum Elternelement für eine horizontale Ansicht (Liste statt Raster) hinzu.',
        },
        demo: '-',
        tags: ['shop', 'card'],
      },
      {
        id: 'cart-item',
        classes: [['.cart-item', '.qty-input', '.selection-tile', '.product-swatches']],
        desc: {
          pl: 'Wiersz koszyka z kontrolerem ilości (<code>.qty-input</code>), klikalne kafelki wyboru wariantu oraz próbki kolorów (<code>.swatch</code>).',
          en: 'A cart row with a quantity controller (<code>.qty-input</code>), clickable variant-selection tiles, and color swatches (<code>.swatch</code>).',
          de: 'Eine Warenkorbzeile mit Mengenregler (<code>.qty-input</code>), klickbaren Varianten-Auswahlkacheln sowie Farbmustern (<code>.swatch</code>).',
        },
        demo: '-',
        tags: ['shop', 'form'],
      },
      {
        id: 'post-card',
        classes: [['.post-card', '.blog-post', '.simple-post-list', '.author-box']],
        desc: {
          pl: 'Komponenty modułu Bloga: karta posta (<code>.post-date-badge</code>), widok listy artykułu (<code>.blog-post</code>), lista w sidebarze (<code>.simple-post-list</code>) i box autora.',
          en: 'Blog module components: the post card (<code>.post-date-badge</code>), the article list view (<code>.blog-post</code>), the sidebar list (<code>.simple-post-list</code>), and the author box.',
          de: 'Komponenten des Blog-Moduls: die Beitragskarte (<code>.post-date-badge</code>), die Listenansicht des Artikels (<code>.blog-post</code>), die Liste in der Sidebar (<code>.simple-post-list</code>) und die Autoren-Box.',
        },
        demo: '-',
        tags: ['blog', 'card'],
      },
      {
        id: 'post-image-wrapper',
        classes: [['.post-image-wrapper']],
        desc: {
          pl: 'Na <code>&lt;a&gt;</code>. <code>position: relative</code> - kotwica dla <code>.post-date-badge</code>. Zdjęcie ma stałą wysokość 240px, niezależnie od proporcji oryginału.',
          en: 'On an <code>&lt;a&gt;</code>. <code>position: relative</code> - the anchor for <code>.post-date-badge</code>. The image has a fixed 240px height, regardless of the original\'s aspect ratio.',
          de: 'Auf einem <code>&lt;a&gt;</code>. <code>position: relative</code> - der Anker für <code>.post-date-badge</code>. Das Bild hat eine feste Höhe von 240px, unabhängig vom Seitenverhältnis des Originals.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-date-badge',
        classes: [['.post-date-badge']],
        desc: {
          pl: 'Pozycjonowana absolutnie w lewym górnym rogu. <strong>Musi</strong> być wewnątrz <code>.post-image-wrapper</code> - patrz pułapka niżej.',
          en: 'Absolutely positioned in the top-left corner. <strong>Must</strong> be inside <code>.post-image-wrapper</code> - see the pitfall below.',
          de: 'Absolut positioniert in der oberen linken Ecke. <strong>Muss</strong> innerhalb von <code>.post-image-wrapper</code> liegen - siehe Fallstrick unten.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-content',
        classes: [['.post-content']],
        desc: {
          pl: 'Reszta karty pod zdjęciem. <code>flex-grow: 1</code>.',
          en: 'The rest of the card below the image. <code>flex-grow: 1</code>.',
          de: 'Der Rest der Karte unter dem Bild. <code>flex-grow: 1</code>.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-meta',
        classes: [['.post-meta']],
        desc: {
          pl: 'Rząd metadanych (autor, kategoria…) nad tytułem. Nie mylić z <code>.post-meta-date</code> z widgetu sidebara - patrz pułapka niżej.',
          en: 'A row of metadata (author, category…) above the title. Not to be confused with <code>.post-meta-date</code> from the sidebar widget - see the pitfall below.',
          de: 'Eine Zeile mit Metadaten (Autor, Kategorie…) über dem Titel. Nicht zu verwechseln mit <code>.post-meta-date</code> aus dem Sidebar-Widget - siehe Fallstrick unten.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-title',
        classes: [['.post-title']],
        desc: {
          pl: 'Tytuł. Kolor na <code>--primary</code> po najechaniu.',
          en: 'The title. Turns <code>--primary</code> on hover.',
          de: 'Der Titel. Wechselt beim Hover zu <code>--primary</code>.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-date',
        classes: [['.post-date'], ['.day', '.month']],
        desc: {
          pl: 'Kalendarzowa kolumna 55px. Zawiera <code>.month</code> i <code>.day</code> - te same nazwy co w <code>.post-date-badge</code>, ale <strong>inny wygląd</strong>: tu miesiąc jest górnym paskiem na <code>--primary</code>, dzień białą kartą pod spodem. Patrz pułapka niżej.',
          en: 'A 55px calendar column. Contains <code>.month</code> and <code>.day</code> - the same names as in <code>.post-date-badge</code>, but with a <strong>different look</strong>: here the month is a top bar in <code>--primary</code>, the day a white card underneath. See the pitfall below.',
          de: 'Eine 55px breite Kalenderspalte. Enthält <code>.month</code> und <code>.day</code> - dieselben Namen wie in <code>.post-date-badge</code>, aber mit <strong>anderem Aussehen</strong>: Hier ist der Monat ein oberer Balken in <code>--primary</code>, der Tag eine weiße Karte darunter. Siehe Fallstrick unten.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'blog-post-image',
        classes: [['.blog-post-image']],
        desc: {
          pl: 'Zdjęcie nad tytułem, bez pływającej daty. Wysokość swobodna (<code>height: auto</code>).',
          en: 'The image above the title, with no floating date. Free height (<code>height: auto</code>).',
          de: 'Das Bild über dem Titel, ohne schwebendes Datum. Freie Höhe (<code>height: auto</code>).',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-image',
        classes: [['.post-image']],
        desc: {
          pl: 'Miniatura. Stylowana WYŁĄCZNIE wewnątrz <code>.simple-post-list</code> - poza nią to zwykły <code>&lt;img&gt;</code> bez żadnych reguł.',
          en: 'The thumbnail. Styled EXCLUSIVELY inside <code>.simple-post-list</code> - outside it, it\'s a plain <code>&lt;img&gt;</code> with no rules at all.',
          de: 'Die Miniaturansicht. AUSSCHLIESSLICH innerhalb von <code>.simple-post-list</code> gestylt - außerhalb davon ist es ein gewöhnliches <code>&lt;img&gt;</code> ohne jegliche Regeln.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-info',
        classes: [['.post-info']],
        desc: {
          pl: 'Kolumna tytuł + data, tylko wewnątrz <code>.simple-post-list</code>.',
          en: 'The title + date column, only inside <code>.simple-post-list</code>.',
          de: 'Die Spalte für Titel + Datum, nur innerhalb von <code>.simple-post-list</code>.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'post-meta-date',
        classes: [['.post-meta-date']],
        desc: {
          pl: 'Drobna data pod tytułem. Nie mylić z <code>.post-meta</code> z karty i klasycznego wpisu - inna klasa, inny wygląd.',
          en: 'A small date below the title. Not to be confused with <code>.post-meta</code> from the card and classic post - a different class, a different look.',
          de: 'Ein kleines Datum unter dem Titel. Nicht zu verwechseln mit <code>.post-meta</code> aus Karte und klassischem Beitrag - eine andere Klasse, ein anderes Aussehen.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'author-avatar',
        classes: [['.author-avatar']],
        desc: {
          pl: 'Okrągły awatar 80×80px, <code>object-fit: cover</code>.',
          en: 'A round 80×80px avatar, <code>object-fit: cover</code>.',
          de: 'Ein runder 80×80px-Avatar, <code>object-fit: cover</code>.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'author-info',
        classes: [['.author-info'], ['.author-name', '.author-role', '.author-bio']],
        desc: {
          pl: 'Kolumna tekstu. Rodzic dla <code>.author-name</code>, <code>.author-role</code>, <code>.author-bio</code> - działają wyłącznie w jej środku.',
          en: 'The text column. The parent for <code>.author-name</code>, <code>.author-role</code>, <code>.author-bio</code> - they only work inside it.',
          de: 'Die Textspalte. Übergeordnetes Element für <code>.author-name</code>, <code>.author-role</code>, <code>.author-bio</code> - sie funktionieren nur in ihrem Inneren.',
        },
        demo: '-',
        source: 'docs-blog',
      },
      {
        id: 'product-gallery',
        classes: [['.product-gallery']],
        desc: {
          pl: 'Strona pojedynczego produktu - zdjęcie główne + miniatury do przełączania.',
          en: 'Single product page - main photo + clickable thumbnails.',
          de: 'Einzelne Produktseite - Hauptfoto + klickbare Miniaturbilder zum Umschalten.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-image-wrapper',
        classes: [['.product-image-wrapper']],
        desc: {
          pl: 'Na <code>&lt;a&gt;</code>. Zdjęcie w środku nie ma domyślnej wysokości (<code>height: auto</code>) - bez inline <code>style="height:…"</code> lub własnej reguły karty w siatce będą miały różną wysokość zdjęcia.',
          en: 'On an <code>&lt;a&gt;</code>. The image inside has no default height (<code>height: auto</code>) - without an inline <code>style="height:…"</code> or your own rule, cards in a grid will have images of different heights.',
          de: 'Auf einem <code>&lt;a&gt;</code>. Das Bild darin hat keine Standardhöhe (<code>height: auto</code>) - ohne Inline-<code>style="height:…"</code> oder eine eigene Regel haben Karten im Raster unterschiedlich hohe Bilder.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-badges',
        classes: [['.product-badges']],
        desc: {
          pl: 'Pozycjonowany absolutnie w lewym górnym rogu. Wewnątrz zwykłe <code>.badge-*</code>.',
          en: 'Absolutely positioned in the top-left corner. Plain <code>.badge-*</code>s go inside.',
          de: 'Absolut positioniert in der oberen linken Ecke. Darin gewöhnliche <code>.badge-*</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-content',
        classes: [['.product-content']],
        desc: {
          pl: 'Reszta karty pod zdjęciem. <code>flex-grow: 1</code>.',
          en: 'The rest of the card below the image. <code>flex-grow: 1</code>.',
          de: 'Der Rest der Karte unter dem Bild. <code>flex-grow: 1</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-title',
        classes: [['.product-title']],
        desc: {
          pl: 'Kolor tekstu na <code>--primary</code> po najechaniu.',
          en: 'Text color switches to <code>--primary</code> on hover.',
          de: 'Textfarbe wechselt bei Hover zu <code>--primary</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-price-block',
        classes: [['.product-price-block']],
        desc: {
          pl: '<code>margin-top: auto</code> - przypina blok ceny do dołu karty. Wyrównanie <code>baseline</code>, więc cena i stara cena siedzą na wspólnej linii tekstu mimo różnych rozmiarów fontu.',
          en: '<code>margin-top: auto</code> - pins the price block to the bottom of the card. <code>baseline</code> alignment, so the price and the old price sit on a shared text line despite the different font sizes.',
          de: '<code>margin-top: auto</code> - fixiert den Preisblock am unteren Rand der Karte. Ausrichtung <code>baseline</code>, sodass Preis und alter Preis trotz unterschiedlicher Schriftgrößen auf einer gemeinsamen Textlinie sitzen.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'price-current',
        classes: [['.price-current']],
        desc: {
          pl: 'Cena aktualna - duża, <code>--primary</code>.',
          en: 'Current price - large, <code>--primary</code>.',
          de: 'Aktueller Preis - groß, <code>--primary</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'price-old',
        classes: [['.price-old']],
        desc: {
          pl: 'Cena przed obniżką - przekreślona, wyciszona.',
          en: 'Pre-discount price - struck through, muted.',
          de: 'Preis vor der Reduzierung - durchgestrichen, gedämpft.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-gallery-left',
        classes: [['.product-gallery-left']],
        desc: {
          pl: 'Od breakpointu <code>md</code>: miniatury jako kolumna PO LEWEJ stronie zdjęcia. Poniżej <code>md</code> - wraca do domyślnego układu (rząd pod spodem). Kolejność w DOM nie zmienia się, tylko wizualna (<code>order</code>).',
          en: 'From the <code>md</code> breakpoint up: thumbnails as a column TO THE LEFT of the photo. Below <code>md</code> - reverts to the default layout (a row underneath). DOM order stays the same, only the visual order changes (<code>order</code>).',
          de: 'Ab dem Breakpoint <code>md</code>: Miniaturbilder als Spalte LINKS vom Foto. Unterhalb von <code>md</code> - kehrt zum Standardlayout zurück (Reihe darunter). Die DOM-Reihenfolge ändert sich nicht, nur die visuelle (<code>order</code>).',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-gallery-right',
        classes: [['.product-gallery-right']],
        desc: {
          pl: 'To samo co <code>-left</code>, ale kolumna miniatur zostaje po prawej (kolejność DOM = kolejność wizualna).',
          en: 'Same as <code>-left</code>, but the thumbnail column stays on the right (DOM order = visual order).',
          de: 'Dasselbe wie <code>-left</code>, aber die Miniaturbild-Spalte bleibt rechts (DOM-Reihenfolge = visuelle Reihenfolge).',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-gallery-main',
        classes: [['.product-gallery-main']],
        desc: {
          pl: 'Kwadratowy kontener głównego zdjęcia (<code>aspect-ratio: 1/1</code>), zdjęcie wypełnia go przez <code>object-fit: cover</code>.',
          en: 'A square container for the main photo (<code>aspect-ratio: 1/1</code>), the image fills it via <code>object-fit: cover</code>.',
          de: 'Quadratischer Container für das Hauptfoto (<code>aspect-ratio: 1/1</code>), das Bild füllt ihn über <code>object-fit: cover</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'product-gallery-thumbs',
        classes: [['.product-gallery-thumbs']],
        desc: {
          pl: 'Pasek miniatur.',
          en: 'The thumbnail bar.',
          de: 'Die Leiste mit Miniaturbildern.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'gallery-thumb',
        classes: [['.gallery-thumb']],
        desc: {
          pl: 'Pojedyncza miniatura (<code>&lt;button&gt;</code>, 64×64px). Wymaga <code>&lt;img data-large="…"&gt;</code> w środku.',
          en: 'A single thumbnail (<code>&lt;button&gt;</code>, 64×64px). Requires an <code>&lt;img data-large="…"&gt;</code> inside.',
          de: 'Ein einzelnes Miniaturbild (<code>&lt;button&gt;</code>, 64×64px). Erfordert ein <code>&lt;img data-large="…"&gt;</code> darin.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'swatch',
        classes: [['.swatch']],
        desc: {
          pl: 'Kółko 24px. Kolor przez inline <code>style="background-color:…"</code> - nie ma zestawu gotowych klas kolorów (paleta produktu jest dowolna, nie ogranicza się do palety motywu).',
          en: 'A 24px circle. Color via inline <code>style="background-color:…"</code> - there\'s no set of ready-made color classes (a product\'s palette is arbitrary, not limited to the theme\'s palette).',
          de: 'Ein 24px-Kreis. Farbe über Inline- <code>style="background-color:…"</code> - es gibt kein Set fertiger Farbklassen (die Produktpalette ist beliebig, nicht auf die Farbpalette des Themes beschränkt).',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'cart-item-img',
        classes: [['.cart-item-img']],
        desc: {
          pl: 'Miniatura 80×80px, <code>object-fit: cover</code>.',
          en: 'An 80×80px thumbnail, <code>object-fit: cover</code>.',
          de: 'Miniaturbild 80×80px, <code>object-fit: cover</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'cart-item-info',
        classes: [['.cart-item-info']],
        desc: {
          pl: '<code>flex-grow: 1</code> - zajmuje resztę miejsca, spychając ceny i kontrolki w prawo.',
          en: '<code>flex-grow: 1</code> - takes up the remaining space, pushing prices and controls to the right.',
          de: '<code>flex-grow: 1</code> - nimmt den restlichen Platz ein und drängt Preis und Steuerelemente nach rechts.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'cart-item-controls',
        classes: [['.cart-item-controls']],
        desc: {
          pl: 'Grupa: kontroler ilości + cena + usuwanie.',
          en: 'The group: quantity controller + price + remove.',
          de: 'Die Gruppe: Mengenregler + Preis + Entfernen.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'qty-btn',
        classes: [['.qty-btn']],
        desc: {
          pl: 'Przycisk +/-. JS bierze <strong>pierwszy</strong> <code>.qty-btn</code> jako minus, <strong>ostatni</strong> jako plus - kolejność w DOM ma znaczenie, patrz pułapka niżej.',
          en: 'A +/- button. JS treats the <strong>first</strong> <code>.qty-btn</code> as minus, the <strong>last</strong> one as plus - DOM order matters here, see the pitfall below.',
          de: 'Der +/--Button. JS nimmt den <strong>ersten</strong> <code>.qty-btn</code> als Minus, den <strong>letzten</strong> als Plus - die DOM-Reihenfolge ist hier entscheidend, siehe Fallstrick unten.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'qty-val',
        classes: [['.qty-val']],
        desc: {
          pl: 'Pole liczby między przyciskami. Musi być <code>type="number"</code> z atrybutem <code>min</code> (i opcjonalnie <code>max</code>) - stąd JS czyta granice. Natywny spinner przeglądarki jest ukryty.',
          en: 'The number field between the buttons. It must be <code>type="number"</code> with a <code>min</code> attribute (and optionally <code>max</code>) - that\'s where JS reads the limits from. The browser\'s native spinner is hidden.',
          de: 'Das Zahlenfeld zwischen den Buttons. Muss <code>type="number"</code> mit dem Attribut <code>min</code> sein (optional auch <code>max</code>) - von dort liest JS die Grenzen. Der native Browser-Spinner ist ausgeblendet.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'tile-content',
        classes: [['.tile-content']],
        desc: {
          pl: 'Widoczna treść kafelka. <strong>Musi być bezpośrednim rodzeństwem</strong> inputa - reguła CSS celuje w niego przez <code>:checked + .tile-content</code>.',
          en: 'The tile\'s visible content. <strong>Must be a direct sibling</strong> of the input - the CSS rule targets it via <code>:checked + .tile-content</code>.',
          de: 'Der sichtbare Inhalt der Kachel. <strong>Muss ein direktes Geschwister</strong> des Inputs sein - die CSS-Regel zielt darauf über <code>:checked + .tile-content</code>.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
      {
        id: 'selection-tile-animated',
        classes: [['.selection-tile-animated']],
        desc: {
          pl: 'Na <code>&lt;label&gt;</code>, obok <code>.selection-tile</code>. Wyłącza natychmiastową zmianę ramki, oddając efekt zaznaczenia klasie <code>.hover-border-trace</code> (lub <code>-2</code>) dodanej do <code>.tile-content</code>.',
          en: 'On a <code>&lt;label&gt;</code>, alongside <code>.selection-tile</code>. Disables the immediate border change, handing the selection effect off to the <code>.hover-border-trace</code> (or <code>-2</code>) class added to <code>.tile-content</code>.',
          de: 'Auf einem <code>&lt;label&gt;</code>, neben <code>.selection-tile</code>. Schaltet die sofortige Rahmenänderung aus und überlässt den Auswahleffekt der Klasse <code>.hover-border-trace</code> (oder <code>-2</code>), die zu <code>.tile-content</code> hinzugefügt wird.',
        },
        demo: '-',
        source: 'docs-eshop',
      },
    ],
  },
];
