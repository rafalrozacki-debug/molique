/**
 * molique-jit - `make:counter` (Scaffolding)
 *
 * Markup verified against css/scss/components/_counters.scss (.counter >
 * .counter-value + .counter-title) and js/modules/molique-counters.js
 * (auto-loaded when the .counter-value class is present): the content of
 * .counter-value is the TARGET NUMBER (JS parses it via parseFloat() and
 * animates counting up from 0 once it enters the viewport,
 * IntersectionObserver), optional data-prefix/data-suffix attributes
 * (e.g. "$"/"+", "%") are appended to the result without changing the
 * counting logic.
 *
 * There is NO dedicated examples-* page for .counter alone (the only
 * real usage in the repo is paired with .chart-radial on the homepage,
 * src/index.html) - this generator is grounded in the SCSS + the actual
 * JS behavior, not a docs example page.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

export interface CounterAnswers {
  /** Target number - JS animates counting from 0 up to this value. */
  value: number;
  title: string;
  /** e.g. "$", empty = none. */
  prefix: string;
  /** e.g. "+", "%", empty = none. */
  suffix: string;
}

export async function collectCounterAnswers(): Promise<CounterAnswers> {
  const valueStr = await input({
    message: 'Target number (JS animates counting up from 0):',
    default: '1500',
    validate: (v: string) => !Number.isNaN(Number(v)) || 'Enter a number.',
  });
  const title = await input({ message: 'Caption below the number:', default: 'Satisfied customers' });
  const prefix = await input({ message: 'Prefix (e.g. "$"), empty = none:', default: '' });
  const suffix = await input({ message: 'Suffix (e.g. "+", "%"), empty = none:', default: '+' });
  return { value: Number(valueStr), title, prefix, suffix };
}

export function renderCounter(answers: CounterAnswers): string {
  return renderStub('counter.stub.html', {
    VALUE: String(answers.value),
    TITLE: answers.title,
    PREFIX_ATTR: answers.prefix ? ` data-prefix="${answers.prefix}"` : '',
    SUFFIX_ATTR: answers.suffix ? ` data-suffix="${answers.suffix}"` : '',
  });
}

export function registerMakeCounterCommand(program: Command): void {
  program
    .command('make:counter')
    .description('Interactive animated counter (.counter) generator (aliases: zrob:licznik, mache:zaehler)')
    .option('--answers <json>', 'Answers as JSON (CounterAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CounterAnswers>(opts);
      const answers = provided ?? (await collectCounterAnswers());
      const html = renderCounter(answers);
      await outputResult(html, 'components/counter.html', provided ? { out: opts.out } : undefined);
    });
}
