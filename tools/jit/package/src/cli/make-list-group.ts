/**
 * molique-jit - `make:list-group` (Scaffolding)
 *
 * Markup verified against css/scss/components/_list-group.scss
 * (.list-group > .list-group-item, the current item .is-active - the
 * color follows the theme via var(--btn-text-light), not a literal
 * #fff). `.list-group` does NOT HAVE its own `examples-*.html` page (the
 * only real usage is the third section in src/examples-data-rows.html,
 * "Simple List"), but the markup from there is complete and directly
 * reproducible.
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
  const count = await promptCount({ message: 'How many items in the list?', default: '4', min: 1, max: 20, flagValue: countFlag });

  const items: ListGroupAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Item ${i} label:`, default: `Item ${i}` });
    const href = await input({ message: `  Item ${i} link:`, default: '#' });
    const active = await confirm({ message: `  Is item ${i} the current one (.is-active)?`, default: i === 1 });
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
    .description('Interactive list item generator (.list-group) (aliases: zrob:liste-grupowa, mache:listengruppe)')
    .option('-n, --count <number>', 'Number of items - skips this one question')
    .option('--answers <json>', 'Answers as JSON (ListGroupAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ListGroupAnswers>(opts);
      const answers = provided ?? (await collectListGroupAnswers(opts.count));
      const html = renderListGroup(answers);
      await outputResult(html, 'components/list-group.html', provided ? { out: opts.out } : undefined);
    });
}
