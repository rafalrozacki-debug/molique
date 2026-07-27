/**
 * molique-jit - wspolny "co zrobic z wygenerowanym kodem?" dla wszystkich
 * komend `make:*` (spec: "Innowacja UX" - konsola / plik / [pozniej: schowek]).
 * Wydzielone z make.ts, zeby make-layout.ts i kolejne komendy nie duplikowaly
 * tej samej logiki.
 */

import fs from 'node:fs';
import path from 'node:path';
import { select, input, confirm } from '@inquirer/prompts';

export async function outputResult(html: string, defaultFileName: string): Promise<void> {
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
