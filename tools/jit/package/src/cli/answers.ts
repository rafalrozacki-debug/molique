/**
 * molique-jit - tryb nieinteraktywny (`--answers` / `--answers-file`)
 *
 * Jeden mechanizm zamiast flagi na kazde pojedyncze pole promptu: JSON
 * podany wprost (`--answers`) albo wczytany z pliku (`--answers-file`),
 * ktorego ksztalt odpowiada dokladnie interfejsowi `XxxAnswers` danej
 * komendy. Gdy podany, komenda pomija `collectXxxAnswers()` calkowicie i
 * wywoluje `renderXxx()` wprost - zero pytan.
 *
 * Celowo BEZ biblioteki walidacji schematu - TypeScript (w miejscu
 * wywolania) i istniejace zachowanie `renderStub()` ("rzuc glosno przy
 * brakujacym placeholderze") wystarczaja jako siatka bezpieczenstwa,
 * zgodnie z minimalizmem juz przyjetym w stubs.ts.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface AnswersFlags {
  answers?: string;
  answersFile?: string;
}

/**
 * Zwraca sparsowany JSON z `--answers`/`--answers-file`, albo `undefined`,
 * gdy zadnej z flag nie podano (wtedy komenda ma dzialac interaktywnie,
 * jak dotychczas). `--answers-file` ma pierwszenstwo nad `--answers`, gdy
 * ktos (bezsensownie) poda oba naraz.
 */
function parseJson<T>(raw: string, source: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`molique-jit: ${source} nie jest poprawnym JSON-em - ${(err as Error).message}`);
  }
}

export function loadAnswers<T>(opts: AnswersFlags): T | undefined {
  if (opts.answersFile) {
    const resolved = path.resolve(process.cwd(), opts.answersFile);
    if (!fs.existsSync(resolved)) {
      throw new Error(`molique-jit: brak pliku "${resolved}" podanego przez --answers-file.`);
    }
    return parseJson<T>(fs.readFileSync(resolved, 'utf8'), `--answers-file (${opts.answersFile})`);
  }
  if (opts.answers) {
    return parseJson<T>(opts.answers, '--answers');
  }
  return undefined;
}
