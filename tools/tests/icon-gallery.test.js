/**
 * molique - tests for the gallery of every Phosphor icon
 *
 * Run with:  npm run test:icon-gallery
 * Requires:  node tools/gen-icon-gallery.js and node tools/gen-icon-sprite.js
 *
 * The searches run against the SHIPPED matcher (js/modules/molique-table-search.js
 * loaded into a vm) and the tags of the GENERATED cards, so nothing here
 * re-implements the search. Two kinds of queries, and both matter:
 *
 *   FINDS      a word someone really types must land on the icon, in every
 *              inflected form. This is what the dictionary is for.
 *   STAYS OUT  a word must NOT drag in an unrelated family. The matcher accepts
 *              a typed word that starts with a tag, so a short stem silently
 *              catches other words: "logo" would answer "logowanie" with every
 *              brand, "kolo" would answer "kolor" with every wheel. These were
 *              real bugs in the first version of the dictionary.
 */

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

const catalog = JSON.parse(read('tools', 'icon-catalog.data.json'));
const overrides = JSON.parse(read('tools', 'icon-tags.overrides.json'));
const sprite = read('img', 'icons-anim-all.svg');

const CARD = /<div class="card[^"]*" data-tags="([^"]*)"><svg[^>]*><use href="img\/icons-anim-all\.svg#ph-([a-z0-9-]+)"><\/use><\/svg><span[^>]*>([a-z0-9-]+)<\/span><\/div>/g;
const parse = (file) => [...read('src', 'partials', file).matchAll(CARD)].map((m) => ({ tags: m[1], id: m[2], label: m[3] }));

const LANGS = { pl: parse('icon-gallery.html'), en: parse('icon-gallery.en.html'), de: parse('icon-gallery.de.html') };

/* ---------- the real matcher ---------- */

const sandbox = { window: { location: { search: '' } }, document: {}, URLSearchParams };
vm.createContext(sandbox);
vm.runInContext(read('js', 'modules', 'molique-table-search.js'), sandbox);
const { normalizeTableSearch: normalize, tableSearchRowMatches: matches } = sandbox;

const index = Object.fromEntries(
  Object.entries(LANGS).map(([lang, cards]) => [
    lang,
    cards.map((c) => ({ name: c.id, text: normalize(c.label), tags: normalize(c.tags).split(/\s+/).filter(Boolean) })),
  ])
);
const search = (lang, query) => {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return index[lang].filter((entry) => matches(entry, terms)).map((entry) => entry.name);
};

/* ---------- the catalogue ---------- */

check('catalogue has unique names', new Set(catalog.map((i) => i.name)).size === catalog.length, String(catalog.length));
for (const [lang, cards] of Object.entries(LANGS)) {
  check(`${lang}: a card for every icon`, cards.length === catalog.length, `${cards.length} of ${catalog.length}`);
  check(`${lang}: the label is the icon name`, cards.every((c) => c.id === c.label));
}
const symbols = new Set([...sprite.matchAll(/<symbol id="ph-([a-z0-9-]+)"/g)].map((m) => m[1]));
const missing = catalog.filter((i) => !symbols.has(i.name)).map((i) => i.name);
check('the sprite holds every icon of the gallery', missing.length === 0, missing.slice(0, 5).join(' '));

/* ---------- hand-written stems survive ---------- */

const covered = (tags, word) => tags.some((tag) => tag === word || (tag.length >= 3 && word.startsWith(tag)));
const lost = [];
for (const [lang, cards] of Object.entries(LANGS)) {
  const byName = new Map(cards.map((c) => [c.id, c.tags.split(' ')]));
  for (const [name, stems] of Object.entries(overrides)) {
    for (const word of (stems[lang] || '').split(' ').filter(Boolean)) {
      if (!covered(byName.get(name), word)) lost.push(`${lang}/${name}/${word}`);
    }
  }
}
check('hand-written stems of the 118 icons are all still there', lost.length === 0, lost.slice(0, 6).join(' '));

/* ---------- finds ---------- */

const FINDS = {
  pl: [
    ['kosz', 'trash'], ['kosza', 'trash'], ['koszem', 'trash'], ['smieci', 'trash'], ['śmieci', 'trash'],
    ['dzwonek', 'bell'], ['dzwonka', 'bell'], ['powiadomienia', 'bell'],
    ['kłódka', 'lock'], ['klodki', 'lock'], ['haslo', 'password'], ['hasła', 'password'],
    ['samochód', 'car'], ['samochodu', 'car'], ['auto', 'car'],
    ['drukarka', 'printer'], ['drukarki', 'printer'],
    ['kot', 'cat'], ['kota', 'cat'], ['pies', 'dog'], ['psa', 'dog'],
    ['faktura', 'invoice'], ['faktury', 'invoice'], ['rachunek', 'receipt'],
    ['zębatka', 'gear'], ['ustawienia', 'gear'],
    ['koperta', 'envelope'], ['koperty', 'envelope'],
    ['pogoda', 'cloud-sun'], ['deszcz', 'cloud-rain'], ['śnieg', 'cloud-snow'],
    ['serce', 'heart'], ['ulubione', 'heart'],
    ['użytkownik', 'user'], ['uzytkownicy', 'users'],
    ['monitor', 'monitor'], ['ekran', 'monitor'], ['koło', 'circle'],
    ['kolor', 'palette'], ['logo', 'x-logo'], ['logowanie', 'sign-in'],
    ['kalendarz', 'calendar'], ['czapka', 'beanie'], ['żaba', null],
    ['strzałka w dół', 'arrow-down'], ['strzałka prawo', 'arrow-right'],
    ['gotówka', 'money'], ['pieniądze', 'money'], ['światło', 'lightbulb'], ['koszula', 't-shirt'],
  ],
  de: [
    ['Mülleimer', null], ['Papierkorb', 'trash'], ['Glocke', 'bell'], ['Schloss', 'lock'],
    ['Auto', 'car'], ['Drucker', 'printer'], ['Katze', 'cat'], ['Hund', 'dog'],
    ['Rechnung', 'invoice'], ['Zahnrad', 'gear'], ['Einstellungen', 'gear'],
    ['Wolke', 'cloud'], ['Regen', 'cloud-rain'], ['Schnee', 'cloud-snow'],
    ['Herz', 'heart'], ['Benutzer', 'user'], ['Bildschirm', 'monitor'], ['Handy', 'device-mobile'],
    ['Hand', 'hand'], ['Hände', 'hand'], ['Tür', 'door'], ['Baum', 'tree'], ['Straße', 'road-horizon'],
    ['Pfeil unten', 'arrow-down'], ['Kalender', 'calendar'],
  ],
  en: [
    ['trash', 'trash'], ['notification', 'bell'], ['padlock', 'lock'], ['settings', 'gear'], ['invoice', 'invoice'],
  ],
};

for (const [lang, list] of Object.entries(FINDS)) {
  for (const [query, name] of list) {
    if (!name) continue;
    const hits = search(lang, query);
    check(`${lang}: "${query}" finds ${name}`, hits.includes(name), `${hits.length} hits`);
  }
}

/* ---------- stays out ---------- */

const STAYS_OUT = [
  ['pl', 'logowanie', (n) => n.endsWith('-logo'), 'brand logos'],
  ['pl', 'kolor', (n) => /^(circle|tire)$/.test(n), 'circles and wheels'],
  ['pl', 'kotwica', (n) => n === 'cat', 'the cat'],
  ['pl', 'gotówka', (n) => /^check/.test(n), 'check marks'],
  ['pl', 'światło', (n) => /^globe/.test(n), 'globes'],
  ['pl', 'koszula', (n) => n === 'trash', 'the bin'],
  ['pl', 'pieszy', (n) => n === 'dog', 'the dog'],
  ['pl', 'teczka', (n) => n === 'rainbow', 'the rainbow'],
  ['pl', 'piorun', (n) => /^(feather|pen)$/.test(n), 'the feather and the pen'],
  ['pl', 'paragon', (n) => n === 'bowl-steam', 'steam'],
  ['pl', 'planeta', (n) => n === 'blueprint', 'the blueprint'],
  ['de', 'Handy', (n) => n === 'hand' || n === 'hand-palm', 'hands'],
  ['de', 'Bildschirm', (n) => n === 'image', 'pictures'],
  ['de', 'Krankenhaus', (n) => n === 'crane', 'the crane'],
  ['de', 'Baum', (n) => n === 'hammer', 'construction tools'],
  ['de', 'links', (n) => n === 'link', 'chain links'],
  ['de', 'Radio', (n) => n === 'tire', 'wheels'],
  ['de', 'Turm', (n) => n === 'door', 'the door'],
];

for (const [lang, query, isWrong, label] of STAYS_OUT) {
  const wrong = search(lang, query).filter(isWrong);
  check(`${lang}: "${query}" does not bring up ${label}`, wrong.length === 0, wrong.slice(0, 4).join(' '));
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
