/**
 * molique - sitemap.xml generator + updates the Sitemap: line in robots.txt
 *
 * One source of truth for the production domain: the SITE_URL constant
 * below. The site is static (nothing rendered at request time), so this
 * can't be solved with an "on-the-fly variable" - but it CAN be solved at
 * build time: every file that needs the domain gets it from here. Changing
 * the domain in the future = edit this one constant + rerun the script.
 *
 * Scans src/*.html (the same flat pattern as `input` in vite.config.js -
 * partials under src/partials/ are NOT separate pages, so they're
 * skipped). Pretty URLs are computed the same way as toPrettyUrl() in
 * vite.config.js and tools/migrate-pretty-urls.js (otherwise -> strip
 * ".html"), with the difference that here we build an absolute URL
 * (SITE_URL + "/" + segment), so the homepage gets an empty segment
 * instead of the relative "./".
 *
 * Run with:  node tools/gen-sitemap.js
 * Output:    sitemap.xml (repo root)
 *            robots.txt  (only the "Sitemap:" line, the rest untouched)
 *
 * Wired in as `postbuild` in package.json.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://molique.dev';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'src');

// Pages excluded from the sitemap - not content meant to be indexed.
const EXCLUDED = new Set(['404']);

function toPrettyUrl(base, locale) {
  if (base === 'index') {
    return locale ? `index.${locale}` : '';
  }
  return locale ? `${base}.${locale}` : base;
}

// Priority follows the same breakdown as the previous, hand-written
// sitemap.xml - homepage and main tools highest, docs-* high, examples-*
// lower (many of them, secondary), blog/changelog lowest.
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

console.log(`sitemap.xml: ${urls.length} URLs under ${SITE_URL}`);
console.log('robots.txt: Sitemap: line updated');
