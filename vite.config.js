import { defineConfig, normalizePath, createLogger } from 'vite';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, existsSync, copyFileSync, readFileSync } from 'node:fs';
import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// __dirname nie istnieje w ESM ("type": "module") — odtwarzamy z import.meta.url.
const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, 'src');

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
        const result = await posthtml([
          posthtmlInclude({
            root: srcDir,
            // Domyślne locals dla posthtml-expressions: description='' sprawia,
            // że warunek <if condition="description"> na stronach bez opisu jest
            // falsy (pomija <meta description>) zamiast rzucać ReferenceError.
            // Strony z opisem nadpisują to swoim locals. i18n locals (patrz
            // computeI18nLocals) liczone z nazwy pliku, dostępne we WSZYSTKICH
            // <include> tej strony (head.html, navbar.html), bez przekazywania
            // ich ręcznie.
            posthtmlExpressionsOptions: {
              locals: { description: '', ...computeI18nLocals(ctx.filename) },
            },
          }),
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
