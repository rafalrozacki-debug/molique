import { defineConfig, normalizePath, createLogger } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
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
const assetDirs = ['css', 'js', 'fonts', 'img'];

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
        const result = await posthtml([posthtmlInclude({ root: srcDir })]).process(html, {
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
    outDir: resolve(__dirname, '_site'),
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
  ],
});
