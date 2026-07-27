/**
 * molique-jit - test parytetu (Faza 3)
 *
 * Jedyna siatka bezpieczenstwa, jakiej potrzebuje architektura "tablicy
 * przegladowej": tools/jit/dist-data/utilities.json NIE liczy CSS samo,
 * tylko kopiuje juz skompilowane deklaracje z dist/chunks/molique-utilities*.css.
 * Ten test sprawdza, czy to, co jest w utilities.json, faktycznie zgadza
 * sie z NIEZALEZNIE skompilowanym css/molique-style.css (pelny build strony,
 * osobna kompilacja Sass) - jedyny sposob, w jaki mogloby to "nie zgadzac
 * sie", to ktos zmienil SCSS i zapomnial odpalic
 * `npm run gen:chunks && npm run gen:jit-utilities` (albo odwrotnie -
 * css/molique-style.css jest przestarzaly).
 *
 * CELOWO wlasna, druga implementacja ekstrakcji regul CSS (nie import z
 * tools/gen-jit-utilities.js) - gdyby test uzywal TEJ SAMEJ funkcji co
 * produkcyjny generator, bylby tautologiczny i nigdy nie wykrylby bledu w
 * tamtej funkcji.
 *
 * Uruchomienie:  node --test tools/jit/tests/
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const utilitiesPath = path.join(root, 'tools', 'jit', 'dist-data', 'utilities.json');
const siteStylesheetPath = path.join(root, 'css', 'molique-style.css');

/* ---------- Normalizacja (niweluje roznice formatowania compressed/pretty) ---------- */

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
// Deklaracje/warunki @media: spacje bez znaczenia semantycznego - usuwamy calkowicie.
// Kompresja Sass (--style=compressed, uzywana przez gen-chunks.js) dodatkowo:
//  - skraca "0.4" do ".4" (bezstratne, kosmetyczne),
//  - male litery w kodach hex (#14162B -> #14162b, tez kosmetyczne),
//  - zamienia slowo kluczowe "transparent" na "rgba(0,0,0,0)" (udokumentowane
//    zachowanie Dart Sass compressed - unika znanego bledu interpolacji
//    "transparent" jako czarnego w starszych przegladarkach; semantycznie
//    identyczny kolor, nie prawdziwy rozjazd).
// "Pretty" css/molique-style.css nie robi zadnej z tych trzech rzeczy, wiec
// trzeba je zniwelowac po obu stronach porownania.
const norm = (s) =>
  s
    .replace(/\s+/g, '')
    .replace(/(?<![\d.])0+(\.\d+)/g, '$1')
    .replace(/#[0-9A-Fa-f]{3,8}\b/g, (m) => m.toLowerCase())
    // Kompresja Sass skraca szesciocyfrowy hex do trzycyfrowego, gdy to
    // mozliwe (#ffffff -> #fff) - identyczny kolor, tylko krotszy zapis.
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/g, '#$1$2$3')
    .replace(/\btransparent\b/g, 'rgba(0,0,0,0)')
    // Dart Sass compressed wybiera hsla() jako kanoniczna forme czystej bieli
    // z alfa - rgba(255,255,255,x) w "pretty" jest identycznym kolorem.
    .replace(/rgba\(255,255,255,/g, 'hsla(0,0%,100%,');
// Selektory: spacja bywa KOMBINATOREM POTOMNYM (".bg-video img" != ".bg-videoimg")
// - wolno zwinac wielokrotne spacje do jednej, ale nie usunac ich calkiem.
// PULAPKA zlapana w praniu: ownerOf() MUSI dostac ten wariant, nie norm() -
// inaczej ".bg-video img" traci spacje i sklejone "bg-videoimg" jest
// odczytywane jako jeden (falszywy) token klasy.
// Kombinatory ">"/"+"/"~" maja natomiast spacje WYLACZNIE kosmetyczne
// ("input:checked + .x" == "input:checked+.x") - kompresja Sass je usuwa,
// wiec trzeba to zrobic po obu stronach porownania, inaczej falszywy alarm.
const normSelector = (s) =>
  s
    .trim()
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\s+/g, ' ');

/* ---------- Mini-walker (wlasna kopia, nie import - patrz komentarz wyzej) ---------- */

function firstBlock(text, matchAtStart) {
  const m = matchAtStart.exec(text);
  if (!m) return null;
  const braceIdx = text.indexOf('{', m.index + m[0].length - 1);
  if (braceIdx === -1) throw new Error('Niedomknieta klamra po "' + m[0] + '"');
  let depth = 0;
  for (let i = braceIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(braceIdx + 1, i);
  }
  throw new Error('Niedomkniety blok "' + m[0] + '"');
}

function splitTopLevel(body) {
  const stmts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '{') {
      if (depth === 0) stmts.push({ head: body.slice(start, i).trim(), bodyStart: i + 1 });
      depth++;
    } else if (body[i] === '}') {
      depth--;
      if (depth === 0) stmts[stmts.length - 1].bodyEnd = i;
      start = i + 1;
    }
  }
  return stmts.map((s) => ({ head: s.head, body: body.slice(s.bodyStart, s.bodyEnd) }));
}

const OWNER_CLASS = /\.([A-Za-z_-][\w-]*)/g;
function ownerOf(selector) {
  let m;
  let last = null;
  OWNER_CLASS.lastIndex = 0;
  while ((m = OWNER_CLASS.exec(selector))) last = m[1];
  return last;
}

/**
 * klasa||selektor(znorm.)||wrappery(znorm., polaczone '>') -> lista wariantow
 * deklaracji (Set per wystapienie). LISTA, nie pojedynczy wpis - niektore
 * selektory (np. ".hover-opacity-100" w _helpers.scss) sa w SCSS zdefiniowane
 * WIECEJ NIZ RAZ z roznymi deklaracjami (druga, pozniejsza wersja z
 * !important wygrywa w kaskadzie) - "pierwsze trafienie wygrywa" gubiloby
 * ta druga, poprawnie zwyciezajaca wersje i falszywie oskarzalo
 * utilities.json (ktory poprawnie przechowuje OBA warianty) o rozjazd.
 */
function extractReference(cssText) {
  const clean = stripComments(cssText);
  const body = firstBlock(clean, /@layer\s+utilities(?![\w-])/);
  assert.ok(body, 'Nie znaleziono "@layer utilities{...}" w css/molique-style.css - format pliku sie zmienil, popraw test.');

  const reference = new Map();

  function walk(content, wrappers) {
    for (const stmt of splitTopLevel(content)) {
      if (/^@media\b/.test(stmt.head) || /^@supports\b/.test(stmt.head)) {
        walk(stmt.body, [...wrappers, norm(stmt.head)]);
        continue;
      }
      if (/^@layer\b/.test(stmt.head)) {
        walk(stmt.body, wrappers);
        continue;
      }
      if (stmt.head.startsWith('@')) continue; // @keyframes/@property/inne - poza zakresem tego testu (alwaysInclude)
      for (const rawSelector of stmt.head.split(',')) {
        const selector = normSelector(rawSelector);
        if (!selector) continue;
        const owner = ownerOf(selector);
        if (!owner) continue;
        const key = owner + '||' + selector + '||' + wrappers.join('>');
        if (!reference.has(key)) reference.set(key, []);
        reference.get(key).push(new Set(norm(stmt.body).split(';').filter(Boolean)));
      }
    }
  }

  walk(body, []);
  return reference;
}

/* ---------- Test ---------- */

test('utilities.json zgadza sie z niezaleznie skompilowanym css/molique-style.css', async (t) => {
  assert.ok(fs.existsSync(utilitiesPath), `Brak ${utilitiesPath} - uruchom npm run gen:jit-utilities.`);
  assert.ok(fs.existsSync(siteStylesheetPath), `Brak ${siteStylesheetPath}.`);

  const utilities = JSON.parse(fs.readFileSync(utilitiesPath, 'utf8'));
  const reference = extractReference(fs.readFileSync(siteStylesheetPath, 'utf8'));

  // "utilities-extended" to modul OPT-IN (patrz naglowek _utilities-extended.scss:
  // "nie wchodzi do domyslnego bundla") - css/molique-style.css (bundle strony)
  // CELOWO go nie zawiera, wiec porownywanie tych klas z tym plikiem zawsze
  // konczyloby sie falszywym alarmem. Dla nich robimy lzejszy sanity-check
  // (niepusta tresc), nie pelne porownanie z niezaleznym zrodlem.
  const EXTENDED_SOURCE = 'molique-utilities-extended.css';

  let checkedAgainstSite = 0;
  let checkedExtendedOnly = 0;

  for (const [className, rules] of Object.entries(utilities.classes)) {
    await t.test(className, () => {
      for (const rule of rules) {
        if (rule.source === EXTENDED_SOURCE) {
          assert.ok(rule.css.trim().length > 0, `Pusta regula dla "${rule.selector}" (utilities-extended).`);
          checkedExtendedOnly++;
          continue;
        }
        const key = className + '||' + normSelector(rule.selector) + '||' + rule.wrappers.map(norm).join('>');
        const refDecls = reference.get(key);
        assert.ok(
          refDecls,
          `Brak "${rule.selector}" (warunki: ${rule.wrappers.join(' > ') || 'brak'}) w css/molique-style.css - ` +
            'utilities.json jest przestarzaly wzgledem SCSS. Uruchom: npm run gen:chunks && npm run gen:jit-utilities.'
        );
        const myDecls = [...new Set(norm(rule.css).split(';').filter(Boolean))].sort();
        const matches = refDecls.some((set) => {
          const sorted = [...set].sort();
          return sorted.length === myDecls.length && sorted.every((v, i) => v === myDecls[i]);
        });
        assert.ok(
          matches,
          `Deklaracje "${rule.selector}" nie pasuja do zadnego z ${refDecls.length} wariantow w css/molique-style.css.\n` +
            `  utilities.json: ${myDecls.join(';')}\n` +
            refDecls.map((s, i) => `  wariant ${i}: ${[...s].sort().join(';')}`).join('\n')
        );
        checkedAgainstSite++;
      }
    });
  }

  assert.ok(
    checkedAgainstSite > 500,
    `Podejrzanie malo regul zweryfikowanych wzgledem css/molique-style.css (${checkedAgainstSite}).`
  );
  assert.ok(checkedExtendedOnly > 0, 'Brak jakichkolwiek regul z modulu opt-in "utilities-extended" - sprawdz zakres testu.');
});
