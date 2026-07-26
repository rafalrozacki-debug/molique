// molique - podmienia tresc komentarzy w pliku wg slownika tlumaczen.
//
// Uzycie jako modul: translateContent(content, ext, dict) -> { content, missing }
// Uzycie z CLI: node apply-translations.mjs <lang> <folder>
//   Rekurencyjnie przechodzi <folder>, dla kazdego .scss/.css/.js podmienia
//   komentarze wg dict.<lang>.json. Brakujace wpisy zostaja PO POLSKU
//   (nigdy nie wywalaja builda) i sa zliczane w podsumowaniu.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractBlocks, blockParagraphs, normalizeKey, wrapText } from './comments-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRAP_WIDTH = 88;
const DECORATIVE_RE = /^[\s=\-*_#~]*$/;

function translateParagraph(text, dict, missing) {
  const key = normalizeKey(text);
  const hit = dict[key];
  if (hit) return hit;
  missing.push(key);
  return text; // fallback: PL, build nigdy nie pada na brakujacym wpisie
}

// Zastepuje w bloku 'line-run' ("// tekst" na kolejnych wierszach) jego
// tresciowe akapity przetlumaczonymi, zachowujac linie dekoracyjne 1:1.
function rebuildLineRun(block, dict, missing) {
  const n = block.rawLines.length;
  const isDeco = (rl) => DECORATIVE_RE.test(rl.text);
  const out = [];
  let i = 0;
  while (i < n) {
    const rl = block.rawLines[i];
    if (isDeco(rl)) { out.push(`${rl.indent}//${rl.text}`); i++; continue; }

    const indent = rl.indent;
    const texts = [];
    while (i < n && !isDeco(block.rawLines[i])) { texts.push(block.rawLines[i].text.trim()); i++; }
    const translated = translateParagraph(texts.join(' '), dict, missing);
    const wrapWidth = WRAP_WIDTH - indent.length - 3;
    for (const w of wrapText(translated, wrapWidth)) out.push(`${indent}// ${w}`);
  }
  return out.join('\n');
}

// Zastepuje w bloku "/* ... */" (jedno- lub wieloliniowym, JSDoc lub
// swobodnym) jego tresciowe akapity, zachowujac linie dekoracyjne
// (naglowki/stopki "====") 1:1 na ich oryginalnej pozycji.
function rebuildBlock(block, dict, missing) {
  const indentBase = block.before ?? '';
  const n = block.rawLines.length;
  const isJsDoc = block.rawLines.some((rl, idx) => idx > 0 && /^\s*\*(?!\/)/.test(rl.raw));

  const lineInfos = block.rawLines.map((rl, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === n - 1;
    let content = rl.raw;
    if (!isFirst && isJsDoc) content = content.replace(/^\s*\*\s?/, '');
    const trimmed = content.trim();
    return { isFirst, isLast, raw: rl.raw, after: rl.after ?? '', decorative: DECORATIVE_RE.test(trimmed), text: trimmed };
  });

  const out = [];
  let i = 0;
  while (i < n) {
    const li = lineInfos[i];

    if (li.decorative) {
      if (li.isFirst && li.isLast) out.push(`${indentBase}/*${li.raw}*/${li.after}`);
      else if (li.isFirst) out.push(`${indentBase}/*${li.raw}`);
      else if (li.isLast) out.push(isJsDoc ? `${indentBase} */${li.after}` : `${li.raw}*/${li.after}`);
      else out.push(isJsDoc ? `${indentBase} *${li.raw.replace(/^\s*\*/, '')}` : li.raw);
      i++;
      continue;
    }

    const groupStart = i;
    const texts = [];
    while (i < n && !lineInfos[i].decorative) { texts.push(lineInfos[i].text); i++; }
    const groupEnd = i - 1;
    const includesFirst = groupStart === 0;
    const includesLast = groupEnd === n - 1;

    const translated = translateParagraph(texts.join(' '), dict, missing);
    const marker = isJsDoc ? ' * ' : '   ';
    const wrapWidth = WRAP_WIDTH - indentBase.length - marker.length;
    const wrapped = wrapText(translated, wrapWidth);

    wrapped.forEach((w, wi) => {
      const isWFirst = wi === 0;
      const isWLast = wi === wrapped.length - 1;
      let line;
      if (isWFirst && includesFirst) line = `${indentBase}/* ${w}`;
      else if (isWFirst && isJsDoc) line = `${indentBase} * ${w}`;
      else line = `${indentBase}${marker}${w}`;

      if (isWLast && includesLast) line += ` */${lineInfos[groupEnd].after}`;
      out.push(line);
    });
  }

  return out.join('\n');
}

export function translateContent(content, ext, dict) {
  const { lines, blocks } = extractBlocks(content, ext);
  const missing = [];
  const replacements = [];

  for (const block of blocks) {
    let replacement;
    if (block.kind === 'inline-line') {
      const [para] = blockParagraphs(block);
      const t = para ? translateParagraph(para.text, dict, missing) : block.text;
      replacement = `${block.before}//${para ? ' ' + t : block.text}`;
    } else if (block.kind === 'inline-block') {
      const [para] = blockParagraphs(block);
      const t = para ? translateParagraph(para.text, dict, missing) : block.text;
      replacement = `${block.before}/*${para ? ' ' + t + ' ' : block.text}*/${block.after}`;
    } else if (block.kind === 'line-run') {
      replacement = rebuildLineRun(block, dict, missing);
    } else if (block.kind === 'block') {
      replacement = rebuildBlock(block, dict, missing);
    }
    replacements.push({ start: block.start, end: block.end, replacement });
  }

  if (!replacements.length) return { content, missing };

  const finalLines = [];
  let cursor = 0;
  for (const r of replacements) {
    while (cursor < r.start) { finalLines.push(lines[cursor]); cursor++; }
    finalLines.push(r.replacement);
    cursor = r.end + 1;
  }
  while (cursor < lines.length) { finalLines.push(lines[cursor]); cursor++; }

  return { content: finalLines.join('\n'), missing };
}

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(name))) out.push(p);
  }
  return out;
}

async function main() {
  const [, , lang, folder] = process.argv;
  if (!lang || !folder) {
    console.error('Uzycie: node apply-translations.mjs <lang> <folder>');
    process.exit(1);
  }
  const dictPath = resolve(__dirname, `dict.${lang}.json`);
  const dict = JSON.parse(readFileSync(dictPath, 'utf8'));
  const root = resolve(folder);
  const files = walk(root, ['.scss', '.css', '.js']);
  let totalMissing = 0;
  const missingSet = new Set();
  for (const file of files) {
    const ext = extname(file).slice(1);
    const content = readFileSync(file, 'utf8');
    const { content: out, missing } = translateContent(content, ext, dict);
    missing.forEach((m) => missingSet.add(m));
    totalMissing += missing.length;
    writeFileSync(file, out, 'utf8');
  }
  console.log(`[${lang}] Przetlumaczono ${files.length} plikow w ${relative(process.cwd(), root)}.`);
  console.log(`[${lang}] Brakujace wpisy (wystapienia/unikalne): ${totalMissing}/${missingSet.size}.`);
  if (missingSet.size) {
    console.log(`[${lang}] Przyklad brakujacych: ${[...missingSet].slice(0, 5).map((s) => JSON.stringify(s.slice(0, 60))).join(', ')}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('apply-translations.mjs')) {
  main();
}
