/**
 * molique-jit - Stub Renderer (Scaffolding)
 *
 * Zgodnie z tools/jit/docs/scaffolding-spec.md: "Lekki regex-replacer, nie
 * Handlebars/Twig". Zadnej logiki warunkowej WEWNATRZ szablonu - warianty
 * (np. Standard/Confirm/Context modala) to OSOBNE pliki .stub.html, nie
 * jeden plik z {{#if}}. Ten modul tylko podmienia "{{ KLUCZ }}" na wartosc
 * z mapy - nic wiecej.
 *
 * Stuby zyja w src/stubs/ (kod zrodlowy, commitowany do gita - to sa
 * TEMPLATE'y autorskie, nie wygenerowane dane jak tools/jit/package/data/).
 * `tsc` kompiluje tylko *.ts, wiec *.stub.html trzeba skopiowac do dist/
 * osobno (patrz scripts/copy-stubs.mjs, wpiete w "npm run build") - dzieki
 * temu silnik dziala identycznie z zrodla i po zbudowaniu, a w przyszlosci
 * (prawdziwy `npm publish`) paczka niesie stuby ze soba w dist/, bez
 * zaleznosci od folderu src/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stubsDir = path.resolve(here, 'stubs');

const PLACEHOLDER = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

/**
 * Renderuje pojedynczy stub. Rzuca blad na KAZDY placeholder bez podanej
 * wartosci - lepiej gtosno wywalic sie przy literowce w szablonie/promptcie
 * niz cicho zostawic "{{ TYTUL }}" w wygenerowanym kodzie.
 */
export function renderStub(stubName: string, values: Record<string, string>): string {
  const file = path.join(stubsDir, stubName);
  if (!fs.existsSync(file)) {
    throw new Error(`molique-jit: brak szablonu "${stubName}" w ${stubsDir}.`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  return raw.replace(PLACEHOLDER, (match, key: string) => {
    if (!(key in values)) {
      throw new Error(`molique-jit: szablon "${stubName}" uzywa "{{ ${key} }}", ale nie podano wartosci.`);
    }
    return values[key];
  });
}

/** Sklejenie kilku wyrenderowanych fragmentow (np. przycisk + modal) pustą linia miedzy nimi. */
export function joinBlocks(...blocks: string[]): string {
  return blocks.map((b) => b.trimEnd()).join('\n\n') + '\n';
}
