/**
 * molique-jit - wspolny "co zrobic z wygenerowanym kodem?" dla wszystkich
 * komend `make:*` (spec: "Innowacja UX" - konsola / plik / [pozniej: schowek]).
 * Wydzielone z make.ts, zeby make-layout.ts i kolejne komendy nie duplikowaly
 * tej samej logiki.
 *
 * Trzeci, opcjonalny parametr wlacza galaz NIEINTERAKTYWNA (plan rozwoju
 * CLI, Etap B) - komendy uzywajace `--answers`/`--answers-file` przekazuja
 * go, zeby CI/skrypt nigdy nie utknal na pytaniu "konsola czy plik?".
 * Brak trzeciego argumentu = dokladnie stare zachowanie (100% wstecznie
 * kompatybilne, dopoki kolejne komendy nie zostana zmigrowane).
 */

import fs from 'node:fs';
import path from 'node:path';
import { select, input, confirm } from '@inquirer/prompts';

export interface NonInteractiveOutput {
  /** Sciezka pliku wyjsciowego. Brak = pisz na stdout. */
  out?: string;
}

export async function outputResult(
  html: string,
  defaultFileName: string,
  nonInteractive?: NonInteractiveOutput
): Promise<void> {
  if (nonInteractive) {
    if (!nonInteractive.out) {
      console.log(html);
      return;
    }
    const resolved = path.resolve(process.cwd(), nonInteractive.out);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, html);
    console.log(`Zapisano: ${nonInteractive.out}`);
    return;
  }

  const outputMode = await select({
    message: 'Co zrobic z wygenerowanym kodem?',
    choices: [
      { name: 'Wypisz w konsoli (do skopiowania)', value: 'console' },
      { name: 'Zapisz do pliku', value: 'file' },
    ],
  });

  if (outputMode === 'console') {
    console.log('\n' + html);
    return;
  }

  const outPath = await input({ message: 'Sciezka pliku wyjsciowego:', default: defaultFileName });
  const resolved = path.resolve(process.cwd(), outPath);

  if (fs.existsSync(resolved)) {
    const overwrite = await confirm({ message: `${outPath} juz istnieje - nadpisac?`, default: false });
    if (!overwrite) {
      console.log('Anulowano.');
      return;
    }
  }

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, html);
  console.log(`Zapisano: ${outPath}`);
}
