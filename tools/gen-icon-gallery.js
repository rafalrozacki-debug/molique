/**
 * molique - generates the gallery of every Phosphor icon
 *
 * Writes src/partials/icon-gallery.html / .en.html / .de.html, included by
 * src/examples-icon-anim.*.html. The partials are in .gitignore, like the
 * cheat sheet: 1512 cards in three languages would otherwise weigh down every
 * diff of the repo, and they come entirely from the data below.
 *
 * Sources:
 *   tools/icon-catalog.data.json    names, tags and categories from Phosphor
 *                                   (tools/update-icon-catalog.mjs refreshes it)
 *   tools/icon-tags.data.js         English word -> Polish and German stems
 *   tools/icon-tags.overrides.json  hand-written stems of single icons
 *
 * ORDER MATTERS: run this BEFORE tools/gen-icon-sprite.js. The sprite is built
 * from the icons referenced in src/**.html, so without the partials the
 * gallery's sprite would come out empty.
 *
 * Run with:  node tools/gen-icon-gallery.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dictionary from './icon-tags.data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partialsDir = path.join(root, 'src', 'partials');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, 'tools', file), 'utf8'));

const catalog = read('icon-catalog.data.json');
const overrides = read('icon-tags.overrides.json');

const LANGS = [
  { code: 'pl', file: 'icon-gallery.html', column: 1 },
  { code: 'en', file: 'icon-gallery.en.html', column: null },
  { code: 'de', file: 'icon-gallery.de.html', column: 2 },
];

/* ---------- dictionary ---------- */

const entries = new Map();
for (const line of dictionary.split('\n')) {
  if (!line.trim()) continue;
  const fields = line.split('|');
  if (fields.length !== 3) throw new Error(`gen-icon-gallery: bad dictionary line: ${line}`);
  if (entries.has(fields[0])) throw new Error(`gen-icon-gallery: "${fields[0]}" is in the dictionary twice`);
  entries.set(fields[0], fields);
}

/** The entry of a word, or of its singular / base form: bells, charging, archived. */
function lookup(word) {
  const forms = [
    word,
    word.replace(/s$/, ''),
    word.replace(/es$/, ''),
    word.replace(/ies$/, 'y'),
    word.replace(/d$/, ''),
    word.replace(/ed$/, ''),
    word.replace(/ing$/, ''),
    word.replace(/ing$/, 'e'),
  ];
  for (const form of forms) if (entries.has(form)) return entries.get(form);
  return null;
}

/* ---------- tags ---------- */

/** Stems of one icon in one language, from its name, tags and categories. */
function stemsOf(icon, column) {
  const words = new Set([...icon.name.split('-'), ...icon.tags.split(' '), ...icon.categories.split(' ')]);
  const stems = new Set();
  for (const word of words) {
    const entry = lookup(word);
    if (entry) for (const stem of entry[column].split(' ')) if (stem) stems.add(stem);
  }
  return stems;
}

/**
 * A stem that another stem already covers adds nothing but bytes: "dzwon" finds
 * "dzwonek" anyway, because the search matches a typed word starting with a tag.
 */
function dropCovered(words) {
  const list = [...new Set(words)];
  return list.filter((word) => !list.some((other) => other !== word && other.length >= 3 && word.startsWith(other)));
}

function tagsOf(icon, lang) {
  const own = (overrides[icon.name]?.[lang.code] || '').split(' ').filter(Boolean);
  const phosphor = `${icon.tags} ${icon.categories}`.split(' ').filter(Boolean);
  const stems = lang.column === null ? [] : [...stemsOf(icon, lang.column)];
  return dropCovered([...phosphor, ...own, ...stems]).join(' ');
}

/* ---------- render ---------- */

// Phosphor tags hold < and > (greater-than, less-than), and a quote is possible.
const escapeAttr = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = (icon, lang) =>
  `<div class="card p-2 text-center align-items-center icon-anim-hover icon-anim-tap" data-tags="${escapeAttr(tagsOf(icon, lang))}">` +
  `<svg class="icon icon-xl icon-anim" aria-hidden="true"><use href="img/icons-anim-all.svg#ph-${icon.name}"></use></svg>` +
  `<span class="d-block text-2 text-muted mt-2">${icon.name}</span></div>`;

fs.mkdirSync(partialsDir, { recursive: true });
for (const lang of LANGS) {
  const html = catalog.map((icon) => card(icon, lang)).join('\n') + '\n';
  fs.writeFileSync(path.join(partialsDir, lang.file), html, 'utf8');
}
console.log(`gen-icon-gallery: ${catalog.length} cards, ${entries.size} dictionary words -> src/partials/icon-gallery*.html`);
