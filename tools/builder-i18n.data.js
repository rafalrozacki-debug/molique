/**
 * molique - package configurator UI translations (builder.html)
 *
 * "Core" module labels and the descriptions of ALL chunks are PL-only in
 * the code (labels in tools/gen-chunks.js, descriptions pulled from each
 * SCSS file's header via descOf()) - this file supplies the EN/DE variants
 * that gen-chunks.js attaches to manifest.json as labelEn/labelDe/descEn/
 * descDe. Component module labels (Cards, Modal, Dropdown...) are
 * auto-generated from the English file names (labelOf()) and need NO
 * translation - they read fine in all three languages unchanged.
 */

// "Core" module labels (core[] in gen-chunks.js) - the only hand-written
// labels in the whole manifest, everything else comes from labelOf().
export const CORE_LABELS = {
  root: {
    en: 'Theme variables (:root)',
    de: 'Theme-Variablen (:root)',
  },
  fonts: {
    en: 'Fonts (@font-face)',
    de: 'Schriftarten (@font-face)',
  },
  base: {
    en: 'Base reset and typography',
    de: 'Basis-Reset und Typografie',
  },
  a11y: {
    en: 'Accessibility (focus, reduced-motion)',
    de: 'Barrierefreiheit (Fokus, Reduced-Motion)',
  },
  eink: {
    en: 'E-ink / print mode',
    de: 'E-Ink-/Druckmodus',
  },
  grid: {
    en: 'Grid and containers',
    de: 'Grid und Container',
  },
  layout: {
    en: 'Layout: sections, flex, positioning',
    de: 'Layout: Abschnitte, Flex, Positionierung',
  },
  buttons: {
    en: 'Buttons',
    de: 'Buttons',
  },
  utilities: {
    en: 'Utility classes',
    de: 'Utility-Klassen',
  },
  'utilities-extended': {
    en: 'Spacing at every breakpoint (sm/lg/xl)',
    de: 'Abstaende auf allen Breakpoints (sm/lg/xl)',
  },
};

// Descriptions - one entry per chunk (core + components), from the SCSS file's header.
export const DESCRIPTIONS = {
  root: {
    en: 'Root variables and fonts',
    de: 'Root-Variablen und Schriftarten',
  },
  fonts: {
    en: 'Fonts (@font-face)',
    de: 'Schriftarten (@font-face)',
  },
  base: {
    en: 'Base styles and reset',
    de: 'Basis-Stile und Reset',
  },
  a11y: {
    en: 'Accessibility (A11y): focus-visible, skip link, prefers-reduced-motion.',
    de: 'Barrierefreiheit (A11y): focus-visible, Skip-Link, prefers-reduced-motion.',
  },
  eink: {
    en: 'Optimization for e-ink / monochrome displays and printing.',
    de: 'Optimierung fuer E-Ink-/Monochrom-Displays und den Druck.',
  },
  grid: {
    en: 'Grid system (native CSS Grid - RAM pattern)',
    de: 'Grid-System (natives CSS Grid - RAM-Muster)',
  },
  layout: {
    en: 'Layout',
    de: 'Layout',
  },
  buttons: {
    en: 'Button styles',
    de: 'Button-Stile',
  },
  utilities: {
    en: 'Utilities (hub)',
    de: 'Utilities (Sammelmodul)',
  },
  'utilities-extended': {
    en: 'Spacing (padding/margin) at the sm, lg, and xl breakpoints',
    de: 'Abstaende (Padding/Margin) bei den Breakpoints sm, lg und xl',
  },
  accordion: {
    en: 'Accordion built on native <details> + interpolate-size.',
    de: 'Akkordeon auf Basis des nativen <details> + interpolate-size.',
  },
  'admin-nav': {
    en: 'Admin panel navigation: submenu, mobile drill-down, bottom nav.',
    de: 'Navigation des Admin-Panels: Submenue, mobiler Drill-down, Bottom-Nav.',
  },
  'admin-sidebar': {
    en: 'Admin panel sidebar: width variants, compact logo.',
    de: 'Sidebar des Admin-Panels: Breitenvarianten, kompaktes Logo.',
  },
  alerts: {
    en: 'Alerts (inline messages).',
    de: 'Alerts (Inline-Hinweise).',
  },
  badges: {
    en: 'Badges (status pills).',
    de: 'Badges (Status-Pillen).',
  },
  breadcrumbs: {
    en: 'Breadcrumbs: breadcrumb navigation.',
    de: 'Breadcrumbs: Brotkrumen-Navigation.',
  },
  cards: {
    en: 'Cards and containers',
    de: 'Karten und Container',
  },
  carousel: {
    en: 'Carousels (sliders) + variants and controls.',
    de: 'Karussells (Slider) + Varianten und Steuerelemente.',
  },
  'chart-funnel': {
    en: 'Data funnels: vertical, horizontal pipeline, and trapezoid.',
    de: 'Daten-Funnels: vertikal, horizontale Pipeline und trapezfoermig.',
  },
  charts: {
    en: 'Charts and data visualization',
    de: 'Diagramme und Datenvisualisierung',
  },
  'code-preview': {
    en: 'Code preview (preview + code)',
    de: 'Code-Vorschau (Vorschau + Code)',
  },
  'context-menu': {
    en: 'Anchored context menu (Anchor Positioning + Popover), plus a nested bottom-sheet variant for mobile.',
    de: 'Verankertes Kontextmenue (Anchor Positioning + Popover), inklusive verschachtelter Bottom-Sheet-Variante fuer Mobilgeraete.',
  },
  counters: {
    en: 'Counters: numeric counters.',
    de: 'Counters: numerische Zaehler.',
  },
  dashboard: {
    en: 'Admin dashboard',
    de: 'Admin-Dashboard',
  },
  'data-row-compact': {
    en: 'Compact Data Row: compact list variant with icon and actions.',
    de: 'Compact Data Row: kompakte Listenvariante mit Icon und Aktionen.',
  },
  'data-rows': {
    en: 'Data Rows: data rows as cards (CRM grid).',
    de: 'Data Rows: Datenzeilen als Karten (CRM-Grid).',
  },
  dropdown: {
    en: 'Dropdown: navbar variant (<details>) and Popover API variant (top layer, outside the navbar).',
    de: 'Dropdown: Navbar-Variante (<details>) und Popover-API-Variante (Top Layer, ausserhalb der Navbar).',
  },
  footer: {
    en: "Page footer (partials/footer.html)",
    de: 'Seiten-Footer (partials/footer.html)',
  },
  'form-base': {
    en: 'Base input, select, textarea, floating labels, and validation.',
    de: 'Basis-Input, Select, Textarea, Floating Labels und Validierung.',
  },
  'form-check': {
    en: 'Checkboxes and radios (custom appearance).',
    de: 'Checkboxen und Radios (individuelles Erscheinungsbild).',
  },
  'form-file-upload': {
    en: 'Custom file upload (with an animated variant).',
    de: 'Individueller Datei-Upload (mit animierter Variante).',
  },
  'form-groups': {
    en: 'Input groups: combining fields with buttons and prefixes.',
    de: 'Input-Gruppen: Felder mit Buttons und Praefixen kombinieren.',
  },
  'form-input-range': {
    en: 'Specialized inputs: range, date, color, number.',
    de: 'Spezielle Inputs: Range, Date, Color, Number.',
  },
  'form-select-custom': {
    en: 'Premium Multi Select (categories + multiple selection).',
    de: 'Premium Multi Select (Kategorien + Mehrfachauswahl).',
  },
  'form-select-search': {
    en: 'Searchable Select (combobox on the Popover API).',
    de: 'Durchsuchbares Select (Combobox auf Basis der Popover API).',
  },
  'form-switch': {
    en: 'Switches + square/outline variants.',
    de: 'Switches + Varianten square/outline.',
  },
  'grid-expand': {
    en: 'Grid Expand: smooth expand/collapse with zero JS.',
    de: 'Grid Expand: sanftes Auf-/Zuklappen ohne JS.',
  },
  hero: {
    en: 'Hero sections and overlays',
    de: 'Hero-Bereiche und Overlays',
  },
  icons: {
    en: 'Icons (Phosphor, selective SVG sprite)',
    de: 'Icons (Phosphor, selektives SVG-Sprite)',
  },
  'lang-suggest': {
    en: 'Lang Suggest (language-switch suggestion bar)',
    de: 'Lang Suggest (Hinweisleiste zum Sprachwechsel)',
  },
  'language-switch': {
    en: 'Language Switch (language switcher)',
    de: 'Language Switch (Sprachumschalter)',
  },
  lightbox: {
    en: 'Lightbox: full-screen gallery (markup built by JS).',
    de: 'Lightbox: Vollbild-Galerie (Markup wird per JS erzeugt).',
  },
  'list-group': {
    en: 'List Groups: list groups.',
    de: 'List Groups: Listengruppen.',
  },
  'list-icons': {
    en: 'List Icons: lists with icons (check/arrow/cross).',
    de: 'List Icons: Listen mit Icons (Haken/Pfeil/Kreuz).',
  },
  'mega-menu': {
    en: 'Mega Menu: <details> + CSS Anchor Positioning, degrades to an offcanvas accordion on mobile.',
    de: 'Mega Menu: <details> + CSS Anchor Positioning, degradiert auf Mobilgeraeten zu einem Offcanvas-Akkordeon.',
  },
  modal: {
    en: 'Native <dialog> modal + backdrop and entrance animations.',
    de: 'Natives <dialog>-Modal + Backdrop und Einblend-Animationen.',
  },
  'modal-confirm': {
    en: 'Confirm modal: small confirmation modal.',
    de: 'Confirm Modal: kleines Bestaetigungs-Modal.',
  },
  'modal-context': {
    en: 'Context modal: narrow side/bottom panel.',
    de: 'Context Modal: schmales Seiten-/Bottom-Panel.',
  },
  'nav-filters': {
    en: 'Nav filters: portfolio filters (+ filterPop keyframes).',
    de: 'Nav Filters: Portfolio-Filter (+ Keyframes filterPop).',
  },
  navbar: {
    en: 'Navbar: base, dark-mode logo, variants (transparent / sticky / pill), and mobile offcanvas.',
    de: 'Navbar: Basis, Logo im Dark Mode, Varianten (transparent / sticky / Pille) und mobiles Offcanvas.',
  },
  'onboarding-slides': {
    en: 'Onboarding Slides: full-screen welcome slideshow (markup built by JS).',
    de: 'Onboarding Slides: Vollbild-Willkommens-Slideshow (Markup wird per JS erzeugt).',
  },
  pagination: {
    en: 'Pagination.',
    de: 'Pagination.',
  },
  'pricing-list': {
    en: 'Pricing list: dotted-list pricing (line-item pricing).',
    de: 'Pricing List: Preisliste mit Aufzaehlungspunkten (Einzelposten).',
  },
  'pricing-table': {
    en: 'Pricing tables + a featured variant.',
    de: 'Preistabellen + hervorgehobene Variante.',
  },
  progress: {
    en: 'Progress bars.',
    de: 'Fortschrittsbalken.',
  },
  'reading-progress': {
    en: 'Reading progress bar: reading-progress indicator.',
    de: 'Reading Progress Bar: Lesefortschrittsanzeige.',
  },
  'scroll-to-top': {
    en: 'Scroll to top: back-to-top button.',
    de: 'Scroll to Top: Nach-oben-Button.',
  },
  'spotlight-tour': {
    en: 'Spotlight Tour: element-highlight coachmark sequence (markup built by JS).',
    de: 'Spotlight Tour: Coachmark-Sequenz mit Element-Hervorhebung (Markup wird per JS erzeugt).',
  },
  'stat-tile': {
    en: 'Stat Tile: KPI card (icon, label, fixed-size number, optional trend delta). Pair with .card.',
    de: 'Stat Tile: KPI-Karte (Icon, Beschriftung, Zahl mit fester Groesse, optionales Trend-Delta). Mit .card kombinieren.',
  },
  'status-dots': {
    en: 'Status dots + a pulsing "ping" variant.',
    de: 'Status Dots + pulsierende "Ping"-Variante.',
  },
  'status-icons': {
    en: 'Status icons: static, animated, and an interactive plus-to-checkmark.',
    de: 'Status Icons: statisch, animiert und ein interaktives Plus-zu-Haekchen.',
  },
  stepper: {
    en: 'Stepper: form progress bar.',
    de: 'Stepper: Fortschrittsanzeige fuer Formulare.',
  },
  'stock-bar': {
    en: 'Stock bar: segmented stock level (SVG mask, zero JS).',
    de: 'Stock Bar: segmentierter Lagerbestand (SVG-Maske, ohne JS).',
  },
  tables: {
    en: 'B2B tables: size variants, headers, card mode on mobile.',
    de: 'B2B-Tabellen: Groessenvarianten, Header, Kartenmodus auf Mobilgeraeten.',
  },
  tabs: {
    en: 'Tabs (:has() + radio hack) plus a pill variant.',
    de: 'Tabs (:has() + Radio-Hack) plus Pill-Variante.',
  },
  testimonials: {
    en: 'Testimonials.',
    de: 'Testimonials.',
  },
  'theme-editor': {
    en: 'Theme Editor (CSS variable playground)',
    de: 'Theme Editor (Spielplatz fuer CSS-Variablen)',
  },
  'theme-switch': {
    en: 'Theme Switch: light/dark theme switcher.',
    de: 'Theme Switch: Umschalter fuer Light-/Dark-Theme.',
  },
  timeline: {
    en: 'Timeline + large/numbered/labeled variants.',
    de: 'Timeline + Varianten large/numbered/labeled.',
  },
  toasts: {
    en: 'Toast notifications (Popover API) + progress-bar animation.',
    de: 'Toast-Benachrichtigungen (Popover API) + Fortschrittsbalken-Animation.',
  },
  tooltips: {
    en: 'Tooltips (pure CSS, data-tooltip).',
    de: 'Tooltips (reines CSS, data-tooltip).',
  },
  topbar: {
    en: 'Topbar: bar above the navigation.',
    de: 'Topbar: Leiste oberhalb der Navigation.',
  },
  'word-rotator': {
    en: 'Word rotator: rotating text.',
    de: 'Word Rotator: rotierender Text.',
  },
};

// Category names from CAT[] in gen-chunks.js (+ core 'Podstawy'/'Layout'/
// 'Utilities' and the 'Inne' fallback).
export const CATEGORIES = {
  Podstawy: { en: 'Basics', de: 'Grundlagen' },
  Layout: { en: 'Layout', de: 'Layout' },
  Utilities: { en: 'Utilities', de: 'Utilities' },
  Nawigacja: { en: 'Navigation', de: 'Navigation' },
  Formularze: { en: 'Forms', de: 'Formulare' },
  Feedback: { en: 'Feedback', de: 'Feedback' },
  Dane: { en: 'Data', de: 'Daten' },
  Biznes: { en: 'Business', de: 'Business' },
  'Okna i media': { en: 'Windows and media', de: 'Fenster und Medien' },
  Prezentacja: { en: 'Presentation', de: 'Praesentation' },
  'Panel admina': { en: 'Admin panel', de: 'Admin-Panel' },
  Narzędzia: { en: 'Tools', de: 'Werkzeuge' },
  Inne: { en: 'Other', de: 'Sonstiges' },
};

// PRESETS from builder.js.
export const PRESETS_I18N = {
  nano: {
    en: { label: 'Nano', desc: 'Just the foundation: variables, reset, grid, buttons.' },
    de: { label: 'Nano', desc: 'Nur das Fundament: Variablen, Reset, Grid, Buttons.' },
  },
  landing: {
    en: { label: 'Landing page', desc: 'A marketing page: navigation, hero, cards, pricing, form.' },
    de: { label: 'Landing Page', desc: 'Eine Marketing-Seite: Navigation, Hero, Karten, Preise, Formular.' },
  },
  admin: {
    en: { label: 'Admin panel', desc: 'B2B dashboard: sidebar, tables, forms, modals, charts.' },
    de: { label: 'Admin-Panel', desc: 'B2B-Dashboard: Sidebar, Tabellen, Formulare, Modale, Diagramme.' },
  },
  shop: {
    en: { label: 'Shop', desc: 'E-commerce: product cards, cart, ratings, gallery.' },
    de: { label: 'Shop', desc: 'E-Commerce: Produktkarten, Warenkorb, Bewertungen, Galerie.' },
  },
};

// Small UI strings in builder.js.
export const UI_STRINGS = {
  toggleAll: { pl: 'Przełącz wszystkie', en: 'Toggle all', de: 'Alle umschalten' },
  requires: { pl: 'wymaga: ', en: 'requires: ', de: 'erfordert: ' },
  alwaysIncluded: { pl: 'zawsze w paczce', en: 'always included', de: 'immer enthalten' },
  optInNote: {
    pl: 'dodatkowy - poza presetem „Wszystko"',
    en: 'opt-in - outside the "Everything" preset',
    de: 'optional - ausserhalb des Presets "Alles"',
  },
  fetchFailed: { pl: 'Nie udało się pobrać ', en: 'Failed to fetch ', de: 'Abruf fehlgeschlagen: ' },
  assembling: { pl: 'Składam…', en: 'Assembling…', de: 'Wird zusammengestellt…' },
  loadingModules: { pl: 'Pobieram listę modułów…', en: 'Fetching module list…', de: 'Modulliste wird geladen…' },
  manifestLoadFailedTitle: {
    pl: 'Nie udało się wczytać manifestu.',
    en: 'Failed to load the manifest.',
    de: 'Manifest konnte nicht geladen werden.',
  },
  manifestLoadFailedBody: {
    pl: 'Uruchom <code>npm run build</code> (generuje <code>dist/chunks/</code>). Szczegóły: ',
    en: 'Run <code>npm run build</code> (it generates <code>dist/chunks/</code>). Details: ',
    de: 'Fuehren Sie <code>npm run build</code> aus (erzeugt <code>dist/chunks/</code>). Details: ',
  },
};
