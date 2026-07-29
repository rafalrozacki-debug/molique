/**
 * molique - generator selektywnego sprite'a SVG z ikon Phosphor
 *
 * Zamiast fontu ikon (setki glifow w jednym pliku, w tym te nieużywane) albo
 * osobnego <img> per ikona (jeden request HTTP każda), buduje JEDEN plik
 * img/icons-sprite.svg zawierający WYŁĄCZNIE ikony faktycznie użyte w
 * src/*.html - <symbol> referowany przez <use>, bez JS w runtime.
 *
 * Zrodlo ikon (nie w repo - zbyt duze, ~1500 plikow na wage), sciezka do
 * katalogu <waga>/<nazwa>-<waga>.svg przez MOLIQUE_PHOSPHOR_DIR (patrz
 * nizej) - bez tej zmiennej i bez lokalnego katalogu autora skrypt
 * po prostu pomija regeneracje (patrz existsSync na dole tej sekcji).
 * Domyslna waga to "light" (zgodna z tym, czego uzywa reszta strony).
 *
 * Skladnia uzycia w HTML:
 *   <svg class="icon"><use href="img/icons-sprite.svg#ph-lightning"></use></svg>
 *
 * Uruchomienie:  node tools/gen-icon-sprite.js
 * Wyjscie:       img/icons-sprite.svg (repo root - kopiowany do _site/img/
 *                przez juz istniejacy wpis "img" w assetDirs w vite.config.js,
 *                zero dodatkowej konfiguracji Vite)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const outPath = path.join(root, 'img', 'icons-sprite.svg');

// Zrodlowe SVG-i Phosphor sa lokalne (nie w repo, ~1500 plikow na wage) -
// dajemy mozliwosc wskazania ich sciezki przez zmienna srodowiskowa, z
// fallbackiem na katalog na maszynie autora. Kontrybutorzy klonujacy repo
// publicznie nie maja ani jednego, ani drugiego - patrz sprawdzenie
// existsSync nizej, ktore w tym wypadku pomija regeneracje zamiast wywalac
// cala komende `npm run dev`/`npm run build` (img/icons-sprite.svg jest juz
// wygenerowany i zacommitowany, wiec build i tak dziala na tym, co jest).
const PHOSPHOR_DIR =
  process.env.MOLIQUE_PHOSPHOR_DIR || 'C:/Praca/Materiały/Ikony/phosphor-icons/SVGs';
const DEFAULT_WEIGHT = 'light';

if (!existsSync(PHOSPHOR_DIR)) {
  console.log(
    'gen-icon-sprite: nie znaleziono lokalnego zrodla ikon Phosphor (' +
      PHOSPHOR_DIR +
      ') - pomijam regeneracje, img/icons-sprite.svg zostaje bez zmian.\n' +
      'Zeby dodac/zmienic ikone, pobierz SVG-i z phosphoricons.com i wskaz ich ' +
      'katalog zmienna MOLIQUE_PHOSPHOR_DIR.'
  );
  process.exit(0);
}

/* ---------- 1. Skan src/*.html w poszukiwaniu uzytych ikon ---------- */

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) htmlFiles(p, out);
    else if (name.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// #ph-lightning albo #ph-lightning--bold (opcjonalny sufiks wagi)
const ICON_REF = /icons-sprite\.svg#ph-([a-z0-9-]+?)(?:--(thin|light|regular|bold|fill|duotone))?"/g;

const used = new Map(); // "waga/nazwa" -> { name, weight }
for (const file of htmlFiles(srcDir)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(ICON_REF)) {
    const name = m[1];
    const weight = m[2] || DEFAULT_WEIGHT;
    used.set(`${weight}/${name}`, { name, weight });
  }
}

if (used.size === 0) {
  console.log('gen-icon-sprite: brak uzytych ikon Phosphor w src/*.html - pomijam.');
  process.exit(0);
}

/* ---------- 2. Wczytanie i przepakowanie kazdej uzytej ikony ---------- */

const symbols = [];
const missing = [];

for (const { name, weight } of [...used.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const svgPath = path.join(PHOSPHOR_DIR, weight, `${name}-${weight}.svg`);
  if (!existsSync(svgPath)) {
    missing.push(`${name} (waga: ${weight}) - brak pliku ${svgPath}`);
    continue;
  }
  const raw = readFileSync(svgPath, 'utf8');

  // Wyciagamy viewBox oryginalu i sama tresc (bez opakowujacego <svg> i bez
  // dekoracyjnego <rect fill="none"/>, ktory Phosphor dokleja do kazdej
  // ikony jako niewidoczny bounding box - w <symbol> jest zbedny).
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 256 256';
  const inner = raw
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<rect[^>]*fill="none"[^>]*\/>/, '')
    .trim();

  const id = weight === DEFAULT_WEIGHT ? `ph-${name}` : `ph-${name}--${weight}`;
  symbols.push(`  <symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`);
}

if (missing.length) {
  console.error('\ngen-icon-sprite: nie znaleziono plikow zrodlowych dla:');
  for (const m of missing) console.error('  - ' + m);
  console.error('Sprawdz literowki w nazwach ikon (phosphoricons.com) i uruchom ponownie.\n');
  process.exit(1);
}

/* ---------- 3. Zapis sprite'a ---------- */

const sprite =
  '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' +
  symbols.join('\n') +
  '\n</svg>\n';

writeFileSync(outPath, sprite, 'utf8');
console.log(`gen-icon-sprite: ${symbols.length} ikon Phosphor -> img/icons-sprite.svg`);
