/**
 * molique - generator sitemap.xml + aktualizacja linii Sitemap: w robots.txt
 *
 * Jedno zrodlo prawdy dla domeny produkcyjnej: stala SITE_URL ponizej. Strona
 * jest statyczna (zero renderowania przy zadaniu), wiec nie da sie tego
 * rozwiazac "zmienna w locie" - ale MOZNA to rozwiazac na poziomie builda:
 * kazdy plik, ktory potrzebuje domeny, dostaje ja stad. Zmiana domeny w
 * przyszlosci = edycja tej jednej stalej + ponowne uruchomienie skryptu.
 *
 * Skanuje src/*.html (ten sam plaski wzorzec co `input` w vite.config.js -
 * partiale w src/partials/ NIE sa osobnymi stronami, wiec sa pomijane).
 * Ladne URL-e licza sie analogicznie do toPrettyUrl() w vite.config.js
 * i tools/migrate-pretty-urls.js (reszta -> bez ".html"), z ta roznica ze
 * tu skladamy bezwzgledny URL (SITE_URL + "/" + segment), wiec strona
 * glowna dostaje pusty segment zamiast wzglednego "./".
 *
 * Uruchomienie:  node tools/gen-sitemap.js
 * Wyjscie:       sitemap.xml (korzen repo)
 *                robots.txt  (tylko linia "Sitemap:", reszta bez zmian)
 *
 * Podpiety jako `postbuild` w package.json.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://molique.rozacki.com';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'src');

// Strony wykluczone z sitemapy - nie sa tresciam do indeksowania.
const EXCLUDED = new Set(['404']);

function toPrettyUrl(base, locale) {
  if (base === 'index') {
    return locale ? `index.${locale}` : '';
  }
  return locale ? `${base}.${locale}` : base;
}

// Priorytet wg tego samego podzialu, co w poprzedniej, recznie pisanej
// wersji sitemap.xml - strona glowna i glowne narzedzia najwyzej, docs-*
// wysoko, examples-* nizej (duzo, drugorzedne), blog/changelog najnizej.
function priorityFor(base) {
  if (base === 'index') return '1.0';
  if (['docs', 'docs-classes', 'theme-editor', 'download'].includes(base)) return '0.9';
  if (base.startsWith('docs-')) return '0.8';
  if (base === 'blog') return '0.7';
  if (base.startsWith('examples-')) return '0.6';
  if (base === 'changelog') return '0.5';
  return '0.5';
}

const today = new Date().toISOString().slice(0, 10);

const pages = readdirSync(srcDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => {
    const match = f.match(/^(.+?)(?:\.(en|de))?\.html$/);
    return { base: match[1], locale: match[2] || null };
  })
  .filter((p) => !EXCLUDED.has(p.base));

const urls = pages.map(({ base, locale }) => ({
  loc: `${SITE_URL}/${toPrettyUrl(base, locale)}`,
  priority: priorityFor(base),
}));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (u) =>
      `   <url>\n      <loc>${u.loc}</loc>\n      <lastmod>${today}</lastmod>\n      <priority>${u.priority}</priority>\n   </url>`
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync(resolve(root, 'sitemap.xml'), xml, 'utf8');

const robotsPath = resolve(root, 'robots.txt');
const robots = readFileSync(robotsPath, 'utf8');
const updatedRobots = robots.replace(
  /Sitemap:\s*\S+/,
  `Sitemap: ${SITE_URL}/sitemap.xml`
);
writeFileSync(robotsPath, updatedRobots, 'utf8');

console.log(`sitemap.xml: ${urls.length} adresow pod ${SITE_URL}`);
console.log('robots.txt: linia Sitemap: zaktualizowana');
