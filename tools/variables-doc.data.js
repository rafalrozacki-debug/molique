/**
 * molique - opisy zmiennych CSS dla docs-variables.html
 *
 * TU są wyłącznie OPISY. Wartości (light + dark), pliki źródłowe i miejsca
 * użycia czyta z SCSS generator tools/gen-variables-doc.js — dzięki temu
 * tabela nie rozjeżdża się po zmianie motywu.
 *
 * Generator PRZERYWA build, gdy:
 *   - w SCSS jest zmienna, której nie ma tutaj (brak opisu),
 *   - tutaj jest zmienna, której nie ma już w SCSS (martwy wpis).
 * To jest cały mechanizm chroniący dokumentację przed rozjechaniem się.
 */

/* ---------- Grupy zmiennych globalnych (kolejność = kolejność na stronie) ---------- */

export const GROUPS = [
  { id: 'fonts',      title: 'Fonty i wagi',                 intro: 'Rodziny fontów i skala grubości. Podmiana obu rodzin to najszybszy sposób na zmianę charakteru całego interfejsu.' },
  { id: 'palette',    title: 'Paleta kolorów',               intro: 'Kolory semantyczne. Każdy ma wariant <code>-hover</code> używany przez przyciski, linki i stany aktywne.' },
  { id: 'surfaces',   title: 'Tła, tekst i obramowania',     intro: 'Warstwy interfejsu: podkład strony, powierzchnia kart, kolory tekstu. To one odwracają się w dark mode.' },
  { id: 'rgb',        title: 'Kanały RGB (przezroczystość)', intro: 'Same kanały, bez <code>rgb()</code> dookoła. Działają WYŁĄCZNIE wewnątrz <code>rgba()</code> — patrz pułapka nr 2.' },
  { id: 'typography', title: 'Skala typografii',             intro: 'Płynne rozmiary na <code>clamp()</code> — skalują się z szerokością okna bez media queries.' },
  { id: 'spacing',    title: 'Odstępy i wymiary',            intro: 'Cały rytm pionowy stoi na <code>--spacing-unit</code>. Zmiana tej jednej wartości przeskalowuje odstępy w całym frameworku.' },
  { id: 'radius',     title: 'Zaokrąglenia, cienie i ruch',  intro: 'Kształt i głębia. Cienie są celowo miękkie — molique nie animuje <code>box-shadow</code> (reflow), tylko <code>transform</code>.' },
  { id: 'a11y',       title: 'Dostępność i cele dotykowe',   intro: 'Minimalne rozmiary klikalne wg WCAG 2.2 AAA oraz wygląd obwódki focusa.' },
  { id: 'sidebar',    title: 'Sidebar panelu admina',        intro: 'Sidebar jest ZAWSZE ciemny — te zmienne nie odwracają się w dark mode. Patrz pułapka nr 4.' },
  { id: 'zindex',     title: 'Warstwy (z-index)',            intro: 'Ustalona hierarchia nakładania. Trzymaj się tych wartości zamiast wpisywać własne liczby — inaczej modal wyląduje pod navbarem.' },
];

/* ---------- Zmienne globalne (:root) ---------- */

export const GLOBAL = {
  /* --- fonts --- */
  '--font-family-base':    ['fonts', 'Font tekstu ciągłego: akapity, tabele, formularze, przyciski.'],
  '--font-family-heading': ['fonts', 'Font nagłówków H1–H6 i logo w navbarze.'],
  '--fw-light':            ['fonts', 'Waga dla klasy <code>.fw-light</code> — podpisy, tekst drugoplanowy.'],
  '--fw-normal':           ['fonts', 'Waga domyślna tekstu (<code>.fw-normal</code>).'],
  '--fw-medium':           ['fonts', 'Lekkie wyróżnienie (<code>.fw-medium</code>) — etykiety, aktywne pozycje menu.'],
  '--fw-semibold':         ['fonts', 'Poziom pośredni używany wewnętrznie przez nagłówki tabel i karty. Brak osobnej klasy narzędziowej.'],
  '--fw-bold':             ['fonts', 'Nagłówki i <code>.fw-bold</code>.'],
  '--fw-black':            ['fonts', 'Maksymalna waga (<code>.fw-black</code>) — tytuły hero, duże liczby w dashboardzie.'],

  /* --- palette --- */
  '--primary':         ['palette', 'Kolor marki. Przyciski główne, linki, aktywne pozycje nawigacji, obwódka focusa.'],
  '--primary-hover':   ['palette', 'Primary po najechaniu i w stanie <code>:active</code>.'],
  '--secondary':       ['palette', 'Kolor drugoplanowy. Źródło dla <code>--text-muted</code>.'],
  '--secondary-hover': ['palette', 'Secondary po najechaniu.'],
  '--success':         ['palette', 'Potwierdzenia: toasty sukcesu, badge, status „done”, pasek zapasu.'],
  '--success-hover':   ['palette', 'Success po najechaniu.'],
  '--danger':          ['palette', 'Błędy i akcje destrukcyjne: walidacja formularzy, przycisk Usuń.'],
  '--danger-hover':    ['palette', 'Danger po najechaniu.'],
  '--warning':         ['palette', 'Ostrzeżenia i stany oczekujące.'],
  '--warning-hover':   ['palette', 'Warning po najechaniu.'],
  '--info':            ['palette', 'Komunikaty neutralne, podpowiedzi.'],
  '--info-hover':      ['palette', 'Info po najechaniu.'],
  '--light':           ['palette', 'Kolor jasny <strong>względny</strong> — w dark mode staje się ciemny. Używaj na tekst leżący na tle <code>--dark</code>.'],
  '--dark':            ['palette', 'Kolor kontrastowy do tła, NIE „ciemny” — w dark mode staje się jasny. Źródło dla <code>--text-main</code>. Patrz pułapka nr 1.'],

  /* --- surfaces --- */
  '--bg-body':        ['surfaces', 'Podkład całej strony. Ciemniejszy od powierzchni kart, żeby karty się odcinały.'],
  '--bg-surface':     ['surfaces', 'Powierzchnia elementów wyniesionych: karty, modale, dropdowny, nagłówki tabel.'],
  '--text-main':      ['surfaces', 'Domyślny kolor tekstu. Pochodna <code>--dark</code>, więc odwraca się razem z nim.'],
  '--text-muted':     ['surfaces', 'Tekst drugoplanowy: opisy, metadane, daty (<code>.text-muted</code>).'],
  '--border-color':   ['surfaces', 'Wszystkie obramowania i separatory: karty, wiersze tabel, inputy.'],
  '--card-bg-subtle': ['surfaces', 'Ledwie widoczne tło (3% koloru kontrastowego) — nagłówki tabel, stopki kart, bloki kodu.'],
  '--btn-text-light': ['surfaces', 'Kolor napisu na przyciskach z ciemnym tłem.'],
  '--btn-text-dark':  ['surfaces', 'Kolor napisu na przyciskach z jasnym tłem (warning, light).'],
  '--code-bg':        ['surfaces', 'Tło bloków kodu (<code>.component-code</code>). Ciemne w obu motywach, ale w dark mode schodzi <strong>poniżej</strong> <code>--bg-surface</code> — inaczej blok zlewałby się z tłem strony.'],
  '--code-text':      ['surfaces', 'Kolor tekstu w blokach kodu.'],
  '--code-border':    ['surfaces', 'Obramowanie bloku kodu. Potrzebne, gdy <code>.component-code</code> stoi samodzielnie, bez otoczki <code>.component-showcase</code>.'],

  /* --- rgb --- */
  '--primary-rgb':   ['rgb', 'Kanały <code>--primary</code>. Używane m.in. przez <code>--focus-ring-color</code> i tła <code>-subtle</code>.'],
  '--secondary-rgb': ['rgb', 'Kanały <code>--secondary</code>.'],
  '--success-rgb':   ['rgb', 'Kanały <code>--success</code>.'],
  '--danger-rgb':    ['rgb', 'Kanały <code>--danger</code>.'],
  '--warning-rgb':   ['rgb', 'Kanały <code>--warning</code>.'],
  '--info-rgb':      ['rgb', 'Kanały <code>--info</code>.'],
  '--dark-rgb':      ['rgb', 'Kanały <code>--dark</code> — odwracają się w dark mode. Baza dla <code>--card-bg-subtle</code> i delikatnych cieni.'],
  '--light-rgb':     ['rgb', 'Kanały <code>--light</code> — odwracają się w dark mode. NIE używaj ich w sidebarze (pułapka nr 4).'],
  '--body-rgb':      ['rgb', 'Kanały <code>--bg-body</code> — gradienty zanikania (<code>.fade-bottom</code>), nakładki.'],
  '--bg-surface-rgb':['rgb', 'Kanały <code>--bg-surface</code> — warstwa barwiąca w <code>.bg-glass</code> (glassmorphism).'],
  '--sidebar-rgb':   ['rgb', 'Kanały tła sidebara — cienie i gradienty w panelu admina.'],

  /* --- typography --- */
  '--text-base-size': ['typography', 'Rozmiar akapitu i punkt odniesienia dla <code>.text-3</code>. 14px na mobile, 15px na desktopie — celowo mało, pod gęste interfejsy B2B.'],
  '--h1-size':        ['typography', 'H1 oraz <code>.text-8</code>. Główny tytuł strony.'],
  '--h2-size':        ['typography', 'H2 oraz <code>.text-7</code>. Tytuły sekcji.'],
  '--h3-size':        ['typography', 'H3 oraz <code>.text-6</code>. Tytuły dużych kart i widgetów.'],
  '--h4-size':        ['typography', 'H4 oraz <code>.text-5</code>. Standardowe tytuły kart.'],
  '--h5-size':        ['typography', 'H5 oraz <code>.text-4</code>. Wyróżniony tekst, etykiety.'],
  '--h6-size':        ['typography', 'H6 — rozmiar bazowy, ale pogrubiony. Równy <code>--text-base-size</code>.'],
  '--text-sm':        ['typography', 'Mikrocopy: podpisy, dopiski prawne (<code>.text-sm</code>).'],
  '--text-xs':        ['typography', 'Najmniejszy rozmiar (<code>.text-xs</code>). Poniżej tego progu tekst przestaje być czytelny.'],

  /* --- spacing --- */
  '--spacing-unit':        ['spacing', '<strong>Jednostka bazowa całego frameworka.</strong> Wszystkie <code>.m-*</code>, <code>.p-*</code> i <code>.gap-*</code> to jej wielokrotności.'],
  '--grid-gap':            ['spacing', 'Domyślna przerwa między kolumnami i wierszami siatki (3 jednostki).'],
  '--scroll-padding':      ['spacing', 'Zapas nad celem kotwicy (<code>scroll-padding-top</code>) — nagłówek nie chowa się pod sticky navbarem.'],
  '--container-max-width': ['spacing', 'Maksymalna szerokość <code>.container</code>. Powyżej tej wartości treść przestaje się rozciągać.'],
  '--post-thumb-size':     ['spacing', 'Bok miniatury w listach wpisów bloga (<code>.simple-post-list</code>).'],
  '--navbar-h':            ['spacing', 'Wysokość globalnego navbara. Używana do odsuwania treści spod navbarów nakładkowych i do startu sidebara admina.'],

  /* --- radius --- */
  '--border-radius':    ['radius', 'Domyślne zaokrąglenie: przyciski, inputy, karty, badge.'],
  '--border-radius-lg': ['radius', 'Większe zaokrąglenie: modale, hero, kontenery wyróżnione.'],
  '--transition-speed': ['radius', 'Czas trwania przejść hover/focus. Jedna wartość na cały framework — spójne tempo interfejsu.'],
  '--shadow-sm':        ['radius', 'Delikatne uniesienie: inputy, małe karty.'],
  '--shadow-md':        ['radius', 'Standardowe uniesienie: dropdowny, popovery, karty po najechaniu.'],
  '--shadow-lg':        ['radius', 'Mocne uniesienie: modale, przyklejony navbar po scrollu.'],

  /* --- a11y --- */
  '--target-size-min':      ['a11y', '<strong>Minimalny cel dotykowy 44×44px (WCAG 2.2 AAA).</strong> Wysokość przycisków, inputów i pozycji menu. Wyjątek: <code>.btn-action</code> w gęstych tabelach.'],
  '--hamburger-size':       ['a11y', 'Bok przycisku menu mobilnego. Domyślnie równy celowi dotykowemu.'],
  '--hamburger-bar-width':  ['a11y', 'Szerokość kreski w ikonie hamburgera.'],
  '--hamburger-bar-height': ['a11y', 'Grubość kreski w ikonie hamburgera.'],
  '--focus-ring-width':     ['a11y', 'Grubość obwódki focusa klawiaturowego.'],
  '--focus-ring-color':     ['a11y', 'Kolor obwódki focusa — primary z kryciem 25%.'],
  '--focus-ring-radius':    ['a11y', 'Zaokrąglenie obwódki focusa. Domyślnie zgodne z zaokrągleniem elementu.'],

  /* --- sidebar --- */
  '--sidebar-bg':            ['sidebar', 'Tło sidebara. <strong>Nie zmienia się w dark mode</strong> — sidebar jest ciemny zawsze.'],
  '--sidebar-submenu-bg':    ['sidebar', 'Tło rozwiniętego submenu — jaśniejsze od sidebara, żeby oddzielić poziomy.'],
  '--sidebar-text':          ['sidebar', 'Kolor nieaktywnych pozycji nawigacji.'],
  '--sidebar-text-active':   ['sidebar', 'Kolor pozycji aktywnej i najechanej.'],
  '--sidebar-highlight-rgb': ['sidebar', 'Kanały jasnego akcentu sidebara (hover, separatory, scrollbar). Celowo literalne, a nie <code>--light-rgb</code> — patrz pułapka nr 4.'],
  '--sidebar-width-lg':      ['sidebar', 'Szerokość sidebara pełnego (domyślna, z etykietami).'],
  '--sidebar-width-md':      ['sidebar', 'Szerokość wariantu <code>.sidebar-md</code> — ikona z podpisem.'],
  '--sidebar-width-sm':      ['sidebar', 'Szerokość wariantu <code>.sidebar-sm</code> — same ikony.'],

  /* --- zindex --- */
  '--z-index-dropdown':       ['zindex', 'Rozwijane menu w navbarze.'],
  '--z-index-sticky':         ['zindex', 'Elementy przyklejone przy scrollu.'],
  '--z-index-fixed':          ['zindex', 'Navbar przypięty na stałe.'],
  '--z-index-modal-backdrop': ['zindex', 'Przyciemnione tło pod modalem.'],
  '--z-index-modal':          ['zindex', 'Okno modalne. Natywny <code>&lt;dialog&gt;</code> i tak trafia do top layer — ta wartość obsługuje fallbacki.'],
  '--z-index-popover':        ['zindex', 'Popovery: select z wyszukiwarką, menu kontekstowe.'],
  '--z-index-toast':          ['zindex', 'Powiadomienia — muszą być nad modalem, bo potwierdzają akcję wykonaną w modalu.'],
  '--z-index-tooltip':        ['zindex', 'Dymki podpowiedzi — najwyżej w normalnej hierarchii.'],
  '--z-index-skip-link':      ['zindex', 'Link „przejdź do treści” — zawsze na wierzchu, inaczej przestaje działać dla czytników ekranu.'],
};

/* ---------- Zmienne komponentów ----------
   kind: 'api'      — ustawiasz je w markupie (style="--x: …")
         'internal' — framework liczy je sam; opisane, bo widać je w DevTools */

export const COMPONENT = {
  '--btn-border-width':      ['Przyciski', 'api', 'Grubość ramki przycisków. Podnieś dla wariantów <code>.btn-outline-*</code>.'],
  '--btn-3d-shadow':         ['Przyciski', 'internal', 'Kolor „podstawy” przycisku 3D. Ustawiany per wariant koloru.'],

  '--input-border-width':     ['Formularze', 'api', 'Grubość ramki pól formularza.'],
  '--input-padding-y':        ['Formularze', 'internal', 'Pionowy padding inputa. Warianty <code>-sm</code>/<code>-lg</code> nadpisują go same.'],
  '--textarea-rows-expanded': ['Formularze', 'api', 'Docelowa liczba wierszy, do której rozwija się textarea po kliknięciu. Domyślnie 6.'],

  '--navbar-pill-bg':                ['Navbar', 'api', 'Tło navbara-pastylki nad hero. Zawsze ciemne, także w motywie jasnym.'],
  '--navbar-pill-color':             ['Navbar', 'api', 'Kolor linków pastylki nad hero.'],
  '--navbar-pill-bg-scrolled':       ['Navbar', 'api', 'Tło pastylki po zescrollowaniu. <strong>Osobna zmienna</strong> — inaczej styl inline zablokowałby drugi stan.'],
  '--navbar-pill-color-scrolled':    ['Navbar', 'api', 'Kolor linków pastylki po zescrollowaniu.'],
  '--navbar-pill-padding-x':         ['Navbar', 'api', 'Odsunięcie pastylki od krawędzi okna nad hero.'],
  '--navbar-pill-padding-x-scrolled':['Navbar', 'api', 'Odsunięcie pastylki po zescrollowaniu — mniejsze, pasek dochodzi do krawędzi.'],

  '--sidebar-width':         ['Panel admina', 'internal', '<strong>Wpis historyczny</strong> z <code>_admin.scss</code>. Layout używa <code>--sidebar-width-lg/-md/-sm</code>; ta zmienna nie steruje już szerokością.'],
  '--current-sidebar-width': ['Panel admina', 'internal', 'Aktualnie obowiązująca szerokość sidebara. Przełączana klasami <code>.sidebar-md</code> / <code>.sidebar-sm</code>.'],
  '--sidebar-radius':        ['Panel admina', 'api', 'Zaokrąglenie sidebara w wariancie <code>.admin-layout-floating</code>.'],
  '--layout-gap':            ['Panel admina', 'api', 'Przerwa między sidebarem a treścią w wariancie floating.'],
  '--layout-padding':        ['Panel admina', 'api', 'Odsunięcie całego layoutu od krawędzi okna w wariancie floating.'],
  '--main-bg':               ['Panel admina', 'api', 'Tło kolumny z treścią.'],
  '--main-radius':           ['Panel admina', 'api', 'Zaokrąglenie kolumny z treścią w wariancie floating.'],
  '--drilldown-bar-h':       ['Panel admina', 'internal', 'Wysokość paska „Cofnij” w pełnoekranowym submenu na mobile.'],
  '--fade-color':            ['Panel admina', 'api', 'Kolor gradientu zanikania <code>.fade-bottom</code>. Ustaw na kolor tła kontenera.'],
  '--fade-height':           ['Panel admina', 'api', 'Wysokość gradientu zanikania.'],
  '--cutout-bg':             ['Panel admina', 'api', 'Kolor iluzji wycięcia w <code>.dashboard-header</code>. Musi równać się tłu za nagłówkiem.'],
  '--cutout-radius':         ['Panel admina', 'api', 'Promień łuku wycięcia.'],

  '--table-padding-x':        ['Tabele', 'internal', 'Poziomy padding komórek. Nadpisywany przez <code>.table-sm</code> / <code>.table-lg</code>.'],
  '--table-padding-y':        ['Tabele', 'internal', 'Pionowy padding komórek.'],
  '--table-font-size':        ['Tabele', 'internal', 'Rozmiar tekstu w komórkach.'],
  '--table-header-font-size': ['Tabele', 'internal', 'Rozmiar tekstu w nagłówku tabeli.'],

  '--timeline-spacing':     ['Timeline', 'api', 'Odstęp pionowy między wydarzeniami.'],
  '--timeline-dot-size':    ['Timeline', 'api', 'Średnica kropki na osi.'],
  '--timeline-dot-color':   ['Timeline', 'api', 'Kolor kropki — do oznaczania statusu wydarzenia.'],
  '--timeline-line-color':  ['Timeline', 'api', 'Kolor pionowej linii osi.'],
  '--timeline-label-width': ['Timeline', 'api', 'Szerokość kolumny z datą w wariancie <code>.timeline-labeled</code>.'],

  '--rating':     ['Sklep', 'api', 'Ocena 0–5 dla <code>.star-rating</code>. Wartości ułamkowe wypełniają gwiazdkę częściowo.'],
  '--star-size':  ['Sklep', 'api', 'Rozmiar gwiazdki.'],
  '--star-color': ['Sklep', 'api', 'Kolor gwiazdki wypełnionej.'],
  '--star-bg':    ['Sklep', 'api', 'Kolor gwiazdki pustej.'],

  '--stock-filled':    ['Stock bar', 'api', 'Liczba wypełnionych segmentów (0–5). <strong>Jedyne wejście z backendu</strong> dla <code>.stock-bar</code>.'],
  '--stock-segments':  ['Stock bar', 'api', 'Łączna liczba segmentów paska. Domyślnie 5.'],
  '--stock-color':     ['Stock bar', 'internal', 'Kolor wypełnienia — ustawiany przez warianty <code>.stock-bar-success/-warning/-danger</code>.'],
  '--stock-color-rgb': ['Stock bar', 'internal', 'Kanały koloru wypełnienia, do przygaszonego tła segmentów pustych.'],

  '--ping-color': ['Status', 'internal', 'Kolor pulsowania <code>.status-ping</code>. Dziedziczy po wariancie statusu.'],

  '--chart-val':  ['Wykresy', 'internal', 'Animowana kopia <code>--val</code>, zarejestrowana przez <code>@property</code>. Bez niej procent nie da się animować.'],
  '--stage-bg':   ['Wykresy', 'api', 'Tło pojedynczego etapu lejka.'],
  '--stage-text': ['Wykresy', 'api', 'Kolor tekstu na etapie lejka.'],

  '--tab-count': ['Zakładki', 'api', 'Liczba zakładek — od niej zależy szerokość podkreślenia aktywnej. Ustaw per instancja.'],

  '--position': ['Before/After', 'internal', 'Pozycja suwaka w procentach. Ustawiana przez <code>js/modules/molique-before-after.js</code>.'],

  '--blobs-deep-bg':    ['Animacje', 'api', 'Tło wariantu <code>.bg-blobs-deep</code>. Literalna wartość, bo ten wariant jest ciemny <strong>zawsze</strong> — także w motywie jasnym, żeby biały tekst był na nim czytelny bez sprawdzania motywu.'],
  '--blob-opacity':     ['Animacje', 'internal', 'Bazowe krycie plam w <code>.bg-blobs</code>. Klatki animacji pulsują <strong>względem</strong> tej wartości (<code>calc()</code>), dzięki czemu wariant <code>.bg-blobs-deep</code> może podnieść poziom bazowy bez przepisywania animacji.'],
  '--hover-scale':      ['Animacje', 'api', 'Docelowe powiększenie dla <code>.hover-scale</code>.'],
  '--hover-y':          ['Animacje', 'api', 'Docelowe uniesienie w pionie dla efektów hover.'],
  '--gradient-color-1': ['Animacje', 'api', 'Pierwszy przystanek gradientu animowanego.'],
  '--gradient-color-2': ['Animacje', 'api', 'Drugi przystanek gradientu animowanego.'],
  '--gradient-color-3': ['Animacje', 'api', 'Trzeci przystanek gradientu animowanego.'],
  '--t-top':            ['Animacje', 'internal', 'Postęp rysowania górnej krawędzi w <code>.hover-border-draw-2</code>. Zarejestrowana przez <code>@property</code> — bez tego procentu nie da się animować.'],
  '--t-right':          ['Animacje', 'internal', 'Postęp rysowania prawej krawędzi. Opóźniona względem górnej, żeby ramka rysowała się po kolei.'],
  '--t-bottom':         ['Animacje', 'internal', 'Postęp rysowania dolnej krawędzi.'],
  '--t-left':           ['Animacje', 'internal', 'Postęp rysowania lewej krawędzi — domyka obrys.'],
  '--trace-angle':      ['Animacje', 'internal', 'Kąt gradientu stożkowego w <code>.hover-border-spin</code>. Animowany dzięki rejestracji w <code>@property</code>.'],
};

/* ---------- Czyste wejścia z markupu ----------
   Zmienne, których framework NIGDY nie deklaruje — tylko je czyta.
   Ustawiasz je sam, zwykle przez style="--x: …". Wartość zapasową
   (jeśli jest) generator czyta z var(--x, FALLBACK) w SCSS. */

export const INPUT = {
  '--val':                 ['Wykresy', 'Wartość wykresu — procent dla <code>.chart-radial</code> i <code>.chart-area</code>, waga etapu w lejkach. <strong>Jedyny sposób podania danych z backendu.</strong>'],
  '--offset':              ['Wykresy', 'Przesunięcie początku wycinka w <code>.chart-pie</code> — suma poprzednich wycinków. Bez niej wszystkie wycinki startują z tego samego miejsca.'],
  '--grid-min':            ['Layout', 'Minimalna szerokość kolumny w <code>.grid-auto</code>. Poniżej niej siatka zwija się do mniejszej liczby kolumn.'],
  '--hover-border-color':  ['Animacje', 'Kolor rysowanej ramki dla efektów <code>.hover-border-*</code>. Domyślnie <code>--primary</code>.'],
  '--border-radius-pill':  ['Nawigacja', 'Zaokrąglenie elementów w kształcie pastylki (language switch, mega menu). Domyślnie <code>999px</code>.'],
  '--clip-img':            ['Typografia', 'Obraz lub gradient przycinany do kształtu liter w <code>.text-clip-bg</code>. Bez niej tekst zostaje bez wypełnienia.'],
};
