import { defineConfig, normalizePath, createLogger } from 'vite';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, existsSync, copyFileSync, readFileSync } from 'node:fs';
import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';
import posthtmlExpressions from 'posthtml-expressions';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// __dirname nie istnieje w ESM ("type": "module") — odtwarzamy z import.meta.url.
const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, 'src');

// package.json "version" to JEDYNE zrodlo prawdy numeru wersji w calym
// repo - wstrzykiwane nizej jako {{ __version }} (strony/partiale) oraz
// __MOLIQUE_VERSION__ (JS bundlowany przez Vite, patrz `define` w
// defineConfig). Historia w changelog.html/.en/.de oraz wzmianki o
// konkretnym PRZESZLYM wydaniu (np. "usuniete w 1.7.0" w docs-typography)
// swiadomie NIE korzystaja z tej zmiennej - to fakty historyczne, ktore
// nie maja sie zmieniac wraz z bumpem wersji.
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'));
const APP_VERSION = pkg.version;

// Czyta JSON wygenerowany przez inny skrypt (build-packages.ps1 /
// gen-chunks.js / gen-variables-doc.js), z bezpiecznym fallbackiem, jesli
// ktos odpali `vite build` na czystym repo przed pierwszym uruchomieniem
// tamtego skryptu - build ma sie nie wywalic, tylko pokazac wartosc
// zapasowa (i ostrzezenie), zamiast krzaczyc strone.
function readJsonSafe(path, fallback, label) {
  if (!existsSync(path)) {
    console.warn(`[molique] UWAGA: brak ${path} - uzywam wartosci zapasowej dla ${label}.`);
    return fallback;
  }
  // PowerShell 5.1 "Set-Content -Encoding utf8" zawsze dokleja BOM (nie ma
  // tam "utf8NoBOM" jak w PowerShell 7+) - build-packages.ps1 pisze nim
  // package-sizes.json, wiec JSON.parse musi ten BOM zdjac, inaczej "﻿{"
  // nie jest poprawnym JSON-em i cala konfiguracja Vite sie wywala.
  let text = readFileSync(path, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return JSON.parse(text);
}

// Rozmiary paczek ZIP - jedyne zrodlo prawdy to dist/package-sizes.json,
// zapisywany przez tools/build-packages.ps1 na podstawie REALNYCH plikow,
// nie recznie szacowanych wartosci.
const PACKAGE_SIZES = readJsonSafe(
  resolve(__dirname, 'dist/package-sizes.json'),
  { pl: {}, en: {}, de: {} },
  'rozmiarow paczek (uruchom tools/build-packages.ps1)'
);

// Liczba modulow w konfiguratorze - jedyne zrodlo to dist/chunks/manifest.json
// (ten sam plik, ktorego builder.html uzywa na zywo), zeby marketingowy tekst
// na download.html nigdy nie rozjechal sie z realna lista modulow.
const CHUNK_MANIFEST = readJsonSafe(
  resolve(__dirname, 'dist/chunks/manifest.json'),
  { chunks: [] },
  'liczby modulow (uruchom tools/gen-chunks.js)'
);
const MODULE_COUNT = CHUNK_MANIFEST.chunks.length;

// Liczby zmiennych CSS - jedyne zrodlo to tools/variables-counts.json,
// zapisywany przez tools/gen-variables-doc.js z tych samych danych, z
// ktorych generowane sa tabele na docs-variables.html.
const VARS_COUNTS = readJsonSafe(
  resolve(__dirname, 'tools/variables-counts.json'),
  { global: 0, component: 0, input: 0, darkOverrides: 0 },
  'liczby zmiennych CSS (uruchom tools/gen-variables-doc.js)'
);

// Auto-wejścia: każda strona .html w src/ staje się osobnym wejściem builda,
// bez ręcznej listy ~85 podstron. Nowa strona = po prostu nowy plik w src/.
const input = Object.fromEntries(
  readdirSync(srcDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), resolve(srcDir, file)])
);

// Zasoby frameworka NIE są bundlowane ani hashowane — kopiujemy je 1:1 do
// buildu, tak samo jak użytkownik kopiuje je do swojego projektu. Dzięki temu
// css/molique-style.css zostaje css/molique-style.css (bez sufiksu z hashem),
// a kompilacja SCSS i tools/build-packages.ps1 nadal celują w root repo.
// dist zawiera paczki wydania (molique-*.zip) - kopiujemy je do buildu, bo
// download.html linkuje do dist/molique-<wersja>.zip.
const assetDirs = ['css', 'js', 'fonts', 'img', 'dist'];

// Zasoby frameworka celowo nie są w grafie modułów Vite (dowozi je static-copy),
// więc Vite informuje o każdym z nich "resolved at runtime". To zachowanie
// pożądane — wyciszamy tylko te linie (×85 stron = szum), realne ostrzeżenia
// i podsumowanie builda zostają.
const logger = createLogger();
const isRuntimeAssetNotice = (msg) =>
  typeof msg === 'string' && msg.includes('to be resolved at runtime');
const baseWarn = logger.warn;
const baseWarnOnce = logger.warnOnce;
logger.warn = (msg, opts) => {
  if (isRuntimeAssetNotice(msg)) return;
  baseWarn(msg, opts);
};
logger.warnOnce = (msg, opts) => {
  if (isRuntimeAssetNotice(msg)) return;
  baseWarnOnce(msg, opts);
};

// Pliki z korzenia repo, które muszą być pobieralne spod adresu strony.
// llms.txt MUSI leżeć dokładnie w /llms.txt - na tym polega cała konwencja
// (agent AI pobiera go z korzenia domeny), więc nie może wylądować w podfolderze.
// Favicony muszą leżeć w korzeniu: przeglądarki i czytniki manifestu pytają
// o nie po nazwie, a site.webmanifest odwołuje się do ikon względem SIEBIE.
const rootFiles = [
  'llms.txt', 'purgecss.safelist.cjs', 'LICENSE', 'NOTICE',
  'README.md', 'README.pl.md', 'README.de.md',
  'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png',
  'apple-touch-icon.png', 'android-chrome-192x192.png',
  'android-chrome-512x512.png', 'site.webmanifest',
];
const outDir = resolve(__dirname, '_site');

// Własny mini-plugin zamiast static-copy: ta wtyczka dla pojedynczych plików
// z dest:'.' liczy cel na źródło i wywala build (EINVAL: src and dest are same).
function copyRootFiles() {
  // Typy binarne MUSZĄ być rozpoznane: domyślne text/plain sprawia, że
  // przeglądarka w trybie dev odrzuca ikonę i favicon się nie pokazuje.
  const mime = (name) =>
    name.endsWith('.txt') ? 'text/plain; charset=utf-8'
    : name.endsWith('.cjs') ? 'text/javascript; charset=utf-8'
    : name.endsWith('.ico') ? 'image/x-icon'
    : name.endsWith('.png') ? 'image/png'
    : name.endsWith('.webmanifest') ? 'application/manifest+json; charset=utf-8'
    : 'text/plain; charset=utf-8';

  return {
    name: 'molique-copy-root-files',
    // DEV: serwuj prosto z korzenia repo.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url || '').split('?')[0].replace(/^\//, '');
        if (!rootFiles.includes(name)) return next();
        const from = resolve(__dirname, name);
        if (!existsSync(from)) return next();
        res.setHeader('Content-Type', mime(name));
        res.end(readFileSync(from));
      });
    },
    // BUILD: skopiuj do korzenia _site/.
    closeBundle() {
      for (const name of rootFiles) {
        const from = resolve(__dirname, name);
        if (existsSync(from)) copyFileSync(from, resolve(outDir, name));
      }
    },
  };
}

// i18n: konwencja plaskich sufiksow, nie podfolderow (/en/, /de/) - te
// zlamalyby wszystkie wzgledne sciezki (base: './', css/…, linki miedzy
// stronami) w calym serwisie. "docs.html" (PL, domyslny, brak sufiksu),
// "docs.en.html", "docs.de.html" - Vite i tak juz auto-wykrywa kazdy plik
// .html w src/ jako osobne wejscie (patrz `input` wyzej), wiec nowy plik
// jezykowy nie wymaga zadnej zmiany w konfiguracji.
//
// Ta funkcja liczy z NAZWY PLIKU (nie z tresci strony) komplet zmiennych
// potrzebnych partiali head.html (hreflang) i navbar.html (przelacznik
// jezyka) - policzone RAZ w buildzie, wiec zadna z ~88 stron nie musi
// recznie przekazywac tych danych przez <include locals='...'>. Odpowiedniki
// jezykowe strony, ktorych jeszcze nie ma na dysku, dostaja __hasEn/__hasDe
// = false - head.html/navbar.html uzywaja <if condition="__hasEn"> zeby
// nie renderowac hreflang/pozycji przelacznika do nieistniejacego pliku.
//
// PULAPKA (zlapana przy pierwszym buildzie): posthtml-expressions
// interpoluje WSZYSTKIE {{ }} w calym dokumencie w jednym przebiegu PRZED
// usunieciem galezi <if> o falszywym warunku - wiec {{ __altEn }} musi byc
// poprawna, zdefiniowana wartoscia (string) NAWET gdy __hasEn=false i ta
// galaz i tak zostanie wyrzucona. Wartosc null/undefined wywala caly build
// (ReferenceError w strictMode), mimo ze <if> by ja i tak ukryl - dlatego
// fallback do __altPl (bezpieczny, zawsze istnieje), nie do null.
const LOCALE_META = {
  pl: { label: 'PL', flag: 'pl' },
  en: { label: 'EN', flag: 'gb' },
  de: { label: 'DE', flag: 'de' },
};

// Ladny URL z nazwy bazowej pliku - BEZ specjalnego przypadku dla "index"
// (w odroznieniu od tools/migrate-pretty-urls.js). Te wartosci trafiaja
// m.in. do <link rel="alternate" hreflang="..." href="..."> w head.html -
// Vite skanuje href we WSZYSTKICH <link> jako referencje do zasobu (w
// odroznieniu od <a href>, ktorych nie skanuje), wiec "./" tutaj probowaloby
// wczytac katalog src/ jako plik i wywalaloby caly build (EISDIR). Statyczne
// <a href> (navbar-brand, stopka, 404) dostaly ladniejsze "./" wylacznie
// przez jednorazowa migracje w tools/migrate-pretty-urls.js - to bezpieczne,
// bo Vite nie skanuje <a>.
function toPrettyUrl(base, locale) {
  return locale ? `${base}.${locale}` : base;
}

// Jedyne zrodlo prawdy dla domeny produkcyjnej - to samo SITE_URL co w
// tools/gen-sitemap.js. hreflang MUSI byc bezwzgledny (Google Search Console
// odrzuca wzgledne wartosci - patrz audyt Lighthouse "hreflang"), w
// odroznieniu od __altPl/__altEn/__altDe uzywanych w przelaczniku jezyka w
// navbarze, ktore musza zostac wzgledne (dzialaja spod dowolnego katalogu).
const SITE_URL = 'https://molique.rozacki.com';
function toAbsoluteUrl(base, locale) {
  // Strona glowna dostaje sam korzen domeny (bez segmentu "index") - ta sama
  // zasada co w tools/gen-sitemap.js, zeby hreflang zgadzal sie z adresami
  // faktycznie promowanymi w sitemap.xml.
  const segment = base === 'index' ? (locale ? `index.${locale}` : '') : toPrettyUrl(base, locale);
  return `${SITE_URL}/${segment}`;
}

function computeI18nLocals(filename) {
  const file = basename(filename);
  const match = file.match(/^(.+?)(?:\.(en|de))?\.html$/);
  const base = match[1];
  const locale = match[2] || 'pl';
  const altPl = toPrettyUrl(base, null);
  const altEnFile = toPrettyUrl(base, 'en');
  const altDeFile = toPrettyUrl(base, 'de');
  // existsSync sprawdza prawdziwe pliki .html na dysku - tylko wartosc
  // wstrzykiwana do szablonu jest ladna, sam warunek istnienia zostaje.
  const hasEn = existsSync(resolve(srcDir, `${base}.en.html`));
  const hasDe = existsSync(resolve(srcDir, `${base}.de.html`));

  return {
    __lang: locale,
    __langLabel: LOCALE_META[locale].label,
    __langFlag: LOCALE_META[locale].flag,
    __isPl: locale === 'pl',
    __isEn: locale === 'en',
    __isDe: locale === 'de',
    __altPl: altPl,
    __altEn: hasEn ? altEnFile : altPl,
    __altDe: hasDe ? altDeFile : altPl,
    __hasEn: hasEn,
    __hasDe: hasDe,
    // Bezwzgledne adresy WYLACZNIE do <link rel="alternate" hreflang="...">
    // w head.html - nigdzie indziej (nawigacja zostaje wzgledna).
    __hreflangPl: toAbsoluteUrl(base, null),
    __hreflangEn: toAbsoluteUrl(base, 'en'),
    __hreflangDe: toAbsoluteUrl(base, 'de'),
    // Domyslne warianty paczek (min bez fontow / src bez fontow) w jezyku
    // TEJ strony - patrz PACKAGE_SIZES wyzej. Uzywane jako startowa etykieta
    // "~X KB" na download.html/.en/.de, zanim download.js w ogole sie odpali.
    __prodSizeKb: PACKAGE_SIZES[locale]?.[''] ?? 0,
    __srcSizeKb: PACKAGE_SIZES[locale]?.['-src'] ?? 0,
  };
}

// Mini-plugin: rozwija <include src="partials/…"> w czasie builda (posthtml +
// posthtml-include). Własny zamiast vite-plugin-posthtml (porzucony, wywala się
// na nowym Node). order:'pre' — include musi rozwinąć się ZANIM Vite czyta
// odwołania do zasobów w HTML.
function moliqueInclude() {
  return {
    name: 'molique-posthtml-include',
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        // Domyślne locals dla posthtml-expressions: description='' sprawia,
        // że warunek <if condition="description"> na stronach bez opisu jest
        // falsy (pomija <meta description>) zamiast rzucać ReferenceError.
        // Strony z opisem nadpisują to swoim locals. i18n locals (patrz
        // computeI18nLocals) liczone z nazwy pliku, dostępne we WSZYSTKICH
        // <include> tej strony (head.html, navbar.html), bez przekazywania
        // ich ręcznie. __version - patrz komentarz przy APP_VERSION wyżej.
        // __moduleCount / __*VarsCount - patrz CHUNK_MANIFEST / VARS_COUNTS
        // wyżej; te same zasady: jedno wyliczone źródło, zero ręcznych liczb
        // w prozie stron.
        const locals = {
          description: '',
          heroImage: '',
          __version: APP_VERSION,
          __moduleCount: MODULE_COUNT,
          __globalVarsCount: VARS_COUNTS.global,
          __componentVarsCount: VARS_COUNTS.component,
          __inputVarsCount: VARS_COUNTS.input,
          __darkOverrideCount: VARS_COUNTS.darkOverrides,
          ...computeI18nLocals(ctx.filename),
        };
        const result = await posthtml([
          posthtmlInclude({ root: srcDir, posthtmlExpressionsOptions: { locals } }),
          // Drugi przebieg NA CALYM, juz rozwinietym dokumencie (po
          // posthtmlInclude) - posthtmlInclude sam wywoluje expressions
          // TYLKO wewnatrz tresci partiali, ktore wlacza (<include>), nigdy
          // na tekscie samej strony najwyzszego poziomu. Bez tego drugiego
          // przebiegu {{ __version }} dzialaloby wylacznie w partialach
          // (np. footer.html), nie w index.html/download.html bezposrednio.
          posthtmlExpressions({ locals }),
        ]).process(html, {
          from: ctx.filename,
        });
        return result.html;
      },
    },
  };
}

export default defineConfig({
  root: 'src',
  customLogger: logger,
  // Ścieżki względne w wyjściu (css/…, js/…) — strona działa spod dowolnego
  // katalogu hostingu, nie tylko z korzenia domeny.
  base: './',
  // Wyłączamy domyślny publicDir — zasoby dowozi vite-plugin-static-copy.
  publicDir: false,
  appType: 'mpa',
  // Stale globalne podmieniane tekstowo w kazdym module JS przechodzacym
  // przez Vite (np. src/download.js) - te same wartosci co w HTML-ach,
  // wiec numer wersji i rozmiary paczek nigdy nie rozjezdza sie miedzy
  // stronami a skryptami.
  define: {
    __MOLIQUE_VERSION__: JSON.stringify(APP_VERSION),
    __MOLIQUE_PACKAGE_SIZES__: JSON.stringify(PACKAGE_SIZES),
  },
  build: {
    // Build strony trafia do _site/ (ignorowany w gicie). NIGDY do dist/,
    // bo tam leżą wersjonowane paczki wydania (molique-*.zip).
    outDir,
    emptyOutDir: true,
    rollupOptions: { input },
  },
  plugins: [
    moliqueInclude(),
    // Serwuje zasoby w dev i kopiuje je verbatim do _site/ przy buildzie.
    viteStaticCopy({
      targets: assetDirs.map((dir) => ({
        src: normalizePath(resolve(__dirname, dir)),
        dest: '.',
      })),
    }),
    copyRootFiles(),
  ],
});
