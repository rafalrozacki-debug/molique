/**
 * molique - generator tresci dla docs-llms.html
 *
 * Czyta llms.txt jako ZRODLO PRAWDY i sklada z niego fragment HTML do
 * wstawienia na docs-llms.html. Jedno zrodlo, zero rozjazdu miedzy tym,
 * co czyta agent AI (surowy /llms.txt), a tym, co widzi czlowiek na
 * stronie - dokladnie ten sam powod, dla ktorego docs-variables.html
 * generuje swoje tabele z _root.scss zamiast trzymac je recznie.
 *
 * Parser rozumie WYLACZNIE konstrukcje faktycznie uzywane w llms.txt -
 * nie jest to ogolny parser Markdown:
 *   # ...          -> pomijane (tytul strony pisany recznie w docs-llms.html)
 *   Kontekst: ...  -> pierwszy akapit zwykiego tekstu (linia 2 pliku)
 *   ## N. TYTUL    -> <h2>
 *   ### Tytul      -> <h3>
 *   - **Etykieta:** tekst   -> <li>, z inline **bold** i `code`
 *     - tekst               -> zagniezdzony <li> (jeden poziom, jak w
 *                              sekcji E-commerce)
 *   pusta linia    -> zamyka biezaca liste
 *
 * Uruchomienie:  node tools/gen-llms-page.js
 * Wyjscie:       src/partials/llms-content.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(root, 'llms.txt');
const outPath = path.join(root, 'src', 'partials', 'llms-content.html');

if (!fs.existsSync(srcPath)) {
  console.error('Nie znaleziono llms.txt w korzeniu repo.');
  process.exit(1);
}

const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  // Code spany czesto zawieraja literalna gwiazdke (np. `.is-*`, `hover-*`,
  // `.col-span-*`) - trzeba je schowac PRZED regexem **bold**, inaczej ta
  // gwiazdka myli go z brakujacym domknieciem pogrubienia (realny przypadek
  // w tym pliku: "**NIGDY nie uzywaj klas `.col-span-*`**"). Placeholder to
  // bajt \x00 + indeks + \x00 - nie wystapi w prawdziwej prozie, w
  // przeciwienstwie np. do samej cyfry otoczonej spacjami.
  const codes = [];
  const stash = (code) => {
    codes.push(code);
    return `\x00${codes.length - 1}\x00`;
  };
  let out = esc(s);
  // Podwojny apostrof wsteczny - markdown escape dla code-spanu, ktory sam
  // zawiera znak ` (jedyny taki przypadek w pliku: "`` `col-span-${n}` ``",
  // cytujacy zle skladany szablon jako przyklad anty-wzorca). Musi isc PRZED
  // pojedynczym, inaczej wewnetrzne pojedyncze apostrofy zostana blednie
  // wziete za wlasne delimitery.
  out = out.replace(/``\s?(.+?)\s?``/g, (_, code) => stash(code));
  out = out.replace(/`([^`]+)`/g, (_, code) => stash(code));
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\x00(\d+)\x00/g, (_, idx) => `<code>${codes[Number(idx)]}</code>`);
  return out;
}

const out = [];
const w = (s) => out.push(s);

let listOpen = false;
let pendingTopLi = false;
let subListOpen = false;
let firstH2 = true;

function closePendingTopLi() {
  if (!pendingTopLi) return;
  if (subListOpen) {
    w('      </ul>');
    subListOpen = false;
  }
  w('    </li>');
  pendingTopLi = false;
}

function closeList() {
  closePendingTopLi();
  if (listOpen) {
    w('</ul>');
    listOpen = false;
  }
}

let i = 0;
if (lines[0] && lines[0].startsWith('# ')) i = 1;
if (lines[i] && lines[i].trim() && !lines[i].startsWith('#')) {
  w(`<p class="text-muted mb-4">${inline(lines[i].trim())}</p>`);
  i++;
}

for (; i < lines.length; i++) {
  const line = lines[i];

  if (line.trim() === '') {
    closeList();
    continue;
  }

  if (line.startsWith('## ')) {
    closeList();
    w(`<h2 class="text-8 fw-bold mb-3${firstH2 ? '' : ' mt-5'}">${inline(line.slice(3).trim())}</h2>`);
    firstH2 = false;
    continue;
  }

  if (line.startsWith('### ')) {
    closeList();
    w(`<h3 class="text-6 fw-bold mb-2 mt-4">${inline(line.slice(4).trim())}</h3>`);
    continue;
  }

  const nested = line.match(/^ {2}- (.*)$/);
  const top = line.match(/^- (.*)$/);

  if (nested) {
    if (!pendingTopLi) {
      throw new Error(`gen-llms-page: zagnieżdżona lista bez rodzica w linii ${i + 1}`);
    }
    if (!subListOpen) {
      w('      <ul>');
      subListOpen = true;
    }
    w(`        <li>${inline(nested[1])}</li>`);
    continue;
  }

  if (top) {
    closePendingTopLi();
    if (!listOpen) {
      w('<ul class="text-secondary mb-4">');
      listOpen = true;
    }
    w(`  <li>${inline(top[1])}`);
    pendingTopLi = true;
    continue;
  }

  // Zwykla linia tekstu poza lista (nie wystepuje dzis w pliku, ale bez
  // tego fallbacku cichy blad w formacie zrodla zgubilby tresc).
  closeList();
  w(`<p class="text-secondary mb-3">${inline(line.trim())}</p>`);
}
closeList();

const HEADER = [
  '<!-- PLIK GENEROWANY - nie edytuj recznie.',
  '     Zrodlo: llms.txt (korzen repo).',
  '     Regeneracja: node tools/gen-llms-page.js -->',
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, HEADER.concat(out).join('\n') + '\n');

console.log('Zapisano src/partials/llms-content.html (' + out.length + ' linii HTML z ' + lines.length + ' linii zrodla).');
