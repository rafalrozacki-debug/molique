/**
 * molique - content generator for docs-llms.html
 *
 * Reads llms.txt as the SOURCE OF TRUTH and assembles an HTML fragment
 * from it to insert into docs-llms.html. One source, zero drift between
 * what an AI agent reads (the raw /llms.txt) and what a human sees on the
 * page - the exact same reason docs-variables.html generates its tables
 * from _root.scss instead of maintaining them by hand.
 *
 * The parser understands ONLY the constructs actually used in llms.txt -
 * it is not a general Markdown parser:
 *   # ...             -> skipped (page title is hand-written in docs-llms.html)
 *   Context: ...       -> first plain-text paragraph (line 2 of the file)
 *   ## N. TITLE        -> <h2>
 *   ### Title          -> <h3>
 *   - **Label:** text   -> <li>, with inline **bold** and `code`
 *     - text            -> nested <li> (one level, as in the E-commerce
 *                          section)
 *   blank line          -> closes the current list
 *
 * Run with:  node tools/gen-llms-page.js
 * Output:    src/partials/llms-content.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(root, 'llms.txt');
const outPath = path.join(root, 'src', 'partials', 'llms-content.html');

if (!fs.existsSync(srcPath)) {
  console.error('llms.txt not found in the repo root.');
  process.exit(1);
}

const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  // Code spans often contain a literal asterisk (e.g. `.is-*`, `hover-*`,
  // `.col-span-*`) - they need to be stashed away BEFORE the **bold**
  // regex, otherwise that asterisk confuses it for a missing closing bold
  // marker (a real case in this file: "**NEVER use `.col-span-*`
  // classes**"). The placeholder is the byte \x00 + index + \x00 - it
  // never occurs in real prose, unlike e.g. a bare digit surrounded by
  // spaces.
  const codes = [];
  const stash = (code) => {
    codes.push(code);
    return `\x00${codes.length - 1}\x00`;
  };
  let out = esc(s);
  // Double backtick - the Markdown escape for a code span that itself
  // contains a ` character (the only such case in the file: "``
  // `col-span-${n}` ``", quoting a badly-composed template as an
  // anti-pattern example). Must run BEFORE the single-backtick regex,
  // otherwise the inner single backticks would be wrongly taken as their
  // own delimiters.
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
      throw new Error(`gen-llms-page: nested list with no parent at line ${i + 1}`);
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

  // A plain text line outside a list (doesn't occur in the file today,
  // but without this fallback a silent source-format error would drop
  // content).
  closeList();
  w(`<p class="text-secondary mb-3">${inline(line.trim())}</p>`);
}
closeList();

const HEADER = [
  '<!-- GENERATED FILE - do not edit by hand.',
  '     Source: llms.txt (repo root).',
  '     Regenerate with: node tools/gen-llms-page.js -->',
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, HEADER.concat(out).join('\n') + '\n');

console.log('Wrote src/partials/llms-content.html (' + out.length + ' HTML lines from ' + lines.length + ' source lines).');
