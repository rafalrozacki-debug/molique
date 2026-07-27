/**
 * molique-jit - `make:accordion` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_accordion.scss
 * (natywny `<details class="accordion-item" name="...">` - atrybut
 * `name` grupuje panele, przegladarka sama pilnuje "tylko jeden otwarty
 * naraz w tej samej grupie", zero JS) oraz src/examples-accordions.html.
 * Zaden panel nie jest domyslnie otwarty w realnym przykladzie (brak
 * atrybutu `open`), wiec generator tego nie wymysla.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface AccordionAnswers {
  /** Atrybut `name` - grupuje panele (przegladarka pilnuje "tylko jeden otwarty naraz"). */
  groupName: string;
  panels: Array<{ question: string; answer: string }>;
}

export async function collectAccordionAnswers(countFlag?: string): Promise<AccordionAnswers> {
  const groupName = await input({ message: 'Nazwa grupy (atrybut "name", laczy panele):', default: 'faq' });

  const count = await promptCount({
    message: 'Ile paneli ma miec akordeon?',
    default: '3',
    min: 1,
    max: 15,
    flagValue: countFlag,
  });

  const panels: AccordionAnswers['panels'] = [];
  for (let i = 1; i <= count; i++) {
    const question = await input({ message: `  Pytanie panelu ${i}:`, default: `Pytanie ${i}` });
    const answer = await input({ message: `  Odpowiedz panelu ${i}:`, default: `Odpowiedz ${i}` });
    panels.push({ question, answer });
  }

  return { groupName, panels };
}

export function renderAccordion(answers: AccordionAnswers): string {
  const items = answers.panels.map((p) => ({
    GROUP_NAME: answers.groupName,
    QUESTION: p.question,
    ANSWER: p.answer,
  }));
  const ITEMS = renderList('_accordion-item.stub.html', items);
  return renderStub('accordion.stub.html', { ITEMS });
}

export function registerMakeAccordionCommand(program: Command): void {
  program
    .command('make:accordion')
    .description('Interaktywny generator akordeonu FAQ (natywny <details>, zero JS) (aliasy: zrob:akordeon, mache:akkordeon)')
    .option('-n, --count <liczba>', 'Liczba paneli - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt AccordionAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<AccordionAnswers>(opts);
      const answers = provided ?? (await collectAccordionAnswers(opts.count));
      const html = renderAccordion(answers);
      await outputResult(html, 'components/accordion.html', provided ? { out: opts.out } : undefined);
    });
}
