/**
 * molique-jit - `make:list-group` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_list-group.scss
 * (.list-group > .list-group-item, pozycja biezaca .is-active - kolor
 * podaza za motywem przez var(--btn-text-light), nie literalny #fff).
 * `.list-group` NIE MA wlasnej strony `examples-*.html` (jedyna realna
 * uzycie to trzecia sekcja w src/examples-data-rows.html, "Prosta Lista"),
 * markup stamtad jest jednak kompletny i wprost odtwarzalny.
 */

import type { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface ListGroupAnswers {
  items: Array<{ label: string; href: string; active: boolean }>;
}

export async function collectListGroupAnswers(countFlag?: string): Promise<ListGroupAnswers> {
  const count = await promptCount({ message: 'Ile pozycji na liscie?', default: '4', min: 1, max: 20, flagValue: countFlag });

  const items: ListGroupAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Etykieta pozycji ${i}:`, default: `Pozycja ${i}` });
    const href = await input({ message: `  Link pozycji ${i}:`, default: '#' });
    const active = await confirm({ message: `  Pozycja ${i} jest biezaca (.is-active)?`, default: i === 1 });
    items.push({ label, href, active });
  }

  return { items };
}

export function renderListGroup(answers: ListGroupAnswers): string {
  const ITEMS = renderList(
    '_list-group-item.stub.html',
    answers.items.map((item) => ({
      LABEL: item.label,
      HREF: item.href,
      ACTIVE_CLASS: item.active ? ' is-active' : '',
    }))
  );
  return renderStub('list-group.stub.html', { ITEMS });
}

export function registerMakeListGroupCommand(program: Command): void {
  program
    .command('make:list-group')
    .description('Interaktywny generator listy pozycji (.list-group) (aliasy: zrob:liste-grupowa, mache:listengruppe)')
    .option('-n, --count <liczba>', 'Liczba pozycji - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt ListGroupAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ListGroupAnswers>(opts);
      const answers = provided ?? (await collectListGroupAnswers(opts.count));
      const html = renderListGroup(answers);
      await outputResult(html, 'components/list-group.html', provided ? { out: opts.out } : undefined);
    });
}
