/**
 * molique-jit - `make:accordion` (Scaffolding)
 *
 * Markup verified against css/scss/components/_accordion.scss (a native
 * `<details class="accordion-item" name="...">` - the `name` attribute
 * groups the panels, the browser itself enforces "only one open at a
 * time within the same group", zero JS) and
 * src/examples-accordions.html. No panel is open by default in the real
 * example (no `open` attribute), so the generator doesn't invent one.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface AccordionAnswers {
  /** The `name` attribute - groups the panels (the browser enforces "only one open at a time"). */
  groupName: string;
  panels: Array<{ question: string; answer: string }>;
}

export async function collectAccordionAnswers(countFlag?: string): Promise<AccordionAnswers> {
  const groupName = await input({ message: 'Group name (the "name" attribute, links the panels):', default: 'faq' });

  const count = await promptCount({
    message: 'How many panels should the accordion have?',
    default: '3',
    min: 1,
    max: 15,
    flagValue: countFlag,
  });

  const panels: AccordionAnswers['panels'] = [];
  for (let i = 1; i <= count; i++) {
    const question = await input({ message: `  Panel ${i} question:`, default: `Question ${i}` });
    const answer = await input({ message: `  Panel ${i} answer:`, default: `Answer ${i}` });
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
    .description('Interactive FAQ accordion generator (native <details>, zero JS) (aliases: zrob:akordeon, mache:akkordeon)')
    .option('-n, --count <number>', 'Number of panels - skips this one question')
    .option('--answers <json>', 'Answers as JSON (AccordionAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<AccordionAnswers>(opts);
      const answers = provided ?? (await collectAccordionAnswers(opts.count));
      const html = renderAccordion(answers);
      await outputResult(html, 'components/accordion.html', provided ? { out: opts.out } : undefined);
    });
}
