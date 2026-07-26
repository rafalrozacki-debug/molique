// molique - wspolna logika parsowania/podmiany komentarzy w .scss/.css/.js
//
// Model: plik to sekwencja WIERSZY. Kazdy wiersz jest albo czystym kodem,
// albo zawiera komentarz (calo-wierszowy lub doklejony na koncu wiersza
// kodu). Sasiadujace calo-wierszowe komentarze "//" oraz wieloliniowe
// "/* ... */" sa grupowane w JEDEN blok, zeby tlumaczyc cala prozaiczna
// tresc naraz (a nie linia-po-linii, co psuloby zdania rozbite na kilka
// wierszy). Linie czysto dekoracyjne (np. "=========") sa wykrywane
// (brak liter) i NIGDY nie trafiaja do tlumaczenia - przechodza 1:1.

const DECORATIVE_RE = /^[\s=\-*_#~]*$/;

function isDecorative(text) {
  return DECORATIVE_RE.test(text);
}

// Skanuje wiersz w poszukiwaniu poczatku komentarza, ignorujac "//"/"/*"
// wewnatrz literalow stringow (naiwny, ale wystarczajacy dla wlasnego kodu).
function findCommentStart(line, allowLineComment) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inSingle) {
      if (c === "'" && line[i - 1] !== '\\') inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === '"' && line[i - 1] !== '\\') inDouble = false;
      continue;
    }
    if (c === "'") { inSingle = true; continue; }
    if (c === '"') { inDouble = true; continue; }
    if (c === '/' && line[i + 1] === '*') return { index: i, type: 'block' };
    if (allowLineComment && c === '/' && line[i + 1] === '/') return { index: i, type: 'line' };
  }
  return null;
}

// Normalizuje tekst do klucza slownika: sklejone spacje, przycieta biala
// przestrzen. To samo zdanie w dwoch plikach = jeden wpis w slowniku.
export function normalizeKey(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Zwraca liste blokow komentarzy w pliku. Kazdy blok ma:
//   kind: 'line-run' | 'inline-line' | 'block' | 'inline-block'
//   start, end: indeksy wierszy (0-based, wlacznie)
//   paragraphs: [{ text, lineIndent, marker }] - tresc do przetlumaczenia
//   (linie dekoracyjne NIE wchodza do paragraphs, sa odtwarzane z surowych
//   linii przy rekonstrukcji)
export function extractBlocks(content, ext) {
  const allowLine = ext !== 'css';
  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const found = findCommentStart(line, allowLine);
    if (!found) { i++; continue; }
    const before = line.slice(0, found.index);

    if (found.type === 'line') {
      if (before.trim() === '') {
        // calo-wierszowy "//" - zbierz sasiadujace wiersze tego samego typu
        const rawLines = [];
        let j = i;
        while (j < lines.length) {
          const l = lines[j];
          const f = findCommentStart(l, true);
          if (!f || f.type !== 'line' || l.slice(0, f.index).trim() !== '') break;
          rawLines.push({ indent: l.slice(0, f.index), text: l.slice(f.index + 2) });
          j++;
        }
        blocks.push({ kind: 'line-run', start: i, end: j - 1, rawLines });
        i = j;
      } else {
        // "//" doklejone na koncu wiersza kodu
        blocks.push({ kind: 'inline-line', start: i, end: i, before, text: line.slice(found.index + 2) });
        i++;
      }
    } else {
      // "/* ... */" - jedno- lub wieloliniowy
      let scanLine = i;
      let scanFrom = found.index + 2;
      let closeLineIdx = -1;
      let closeIdx = -1;
      while (true) {
        const text = scanLine === i ? line : lines[scanLine];
        const idx = text.indexOf('*/', scanFrom);
        if (idx !== -1) { closeLineIdx = scanLine; closeIdx = idx; break; }
        scanLine++;
        if (scanLine >= lines.length) break;
        scanFrom = 0;
      }
      if (closeLineIdx === -1) { i++; continue; } // niezamkniety blok - zostaw jak jest

      if (closeLineIdx === i) {
        const after = line.slice(closeIdx + 2);
        blocks.push({
          kind: 'inline-block', start: i, end: i, before, after,
          text: line.slice(found.index + 2, closeIdx),
        });
      } else {
        const rawLines = [];
        for (let k = i; k <= closeLineIdx; k++) {
          if (k === i) rawLines.push({ raw: lines[k].slice(found.index + 2), isFirst: true, indent: before });
          else if (k === closeLineIdx) rawLines.push({ raw: lines[k].slice(0, closeIdx), isLast: true, after: lines[k].slice(closeIdx + 2) });
          else rawLines.push({ raw: lines[k] });
        }
        blocks.push({ kind: 'block', start: i, end: closeLineIdx, before, rawLines });
      }
      i = closeLineIdx + 1;
    }
  }

  return { lines, blocks };
}

// Wyciaga z bloku liste "akapitow" (ciagle linie z realna trescia, wg
// isDecorative) do przetlumaczenia. Zwraca [{ text, indent }].
export function blockParagraphs(block) {
  if (block.kind === 'inline-line' || block.kind === 'inline-block') {
    return isDecorative(block.text) ? [] : [{ text: block.text.trim() }];
  }
  if (block.kind === 'line-run') {
    const paragraphs = [];
    let current = [];
    for (const rl of block.rawLines) {
      if (isDecorative(rl.text)) {
        if (current.length) { paragraphs.push(current.join(' ').trim()); current = []; }
      } else {
        current.push(rl.text.trim());
      }
    }
    if (current.length) paragraphs.push(current.join(' ').trim());
    return paragraphs.map((text) => ({ text }));
  }
  // 'block'
  const paragraphs = [];
  let current = [];
  for (const rl of block.rawLines) {
    // JSDoc-style " * tekst" -> zdejmij wiodacy "*"
    const raw = rl.raw;
    const stripped = /^\s*\*\s?/.test(raw) ? raw.replace(/^\s*\*\s?/, '') : raw;
    if (isDecorative(stripped)) {
      if (current.length) { paragraphs.push(current.join(' ').trim()); current = []; }
    } else {
      current.push(stripped.trim());
    }
  }
  if (current.length) paragraphs.push(current.join(' ').trim());
  return paragraphs.map((text) => ({ text }));
}

// Zawija dlugi string na linie o maks. dlugosci `width` (dzielac po
// spacjach, bez ciecia srodka slowa).
export function wrapText(text, width) {
  const words = text.split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    if (cur.length === 0) { cur = w; continue; }
    if ((cur + ' ' + w).length > width) { out.push(cur); cur = w; }
    else { cur += ' ' + w; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}
