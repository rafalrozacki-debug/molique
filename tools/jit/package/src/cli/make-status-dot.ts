/**
 * molique-jit - `make:status-dot` (Scaffolding)
 *
 * Markup verified against css/scss/components/_status-dots.scss
 * (.status-dot + .status-<state>, optionally .status-ping for an
 * animated ring - both classes are shared on the same element) and
 * src/examples-status-dots.html.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type StatusDotColor = 'draft' | 'pending' | 'done' | 'danger';

const STATUS_CHOICES = [
  { name: 'Draft', value: 'draft' },
  { name: 'Pending', value: 'pending' },
  { name: 'Done', value: 'done' },
  { name: 'Critical (danger)', value: 'danger' },
] as const;

export interface StatusDotAnswers {
  text: string;
  status: StatusDotColor;
  /** .status-ping - a pulsing ring around the dot. */
  ping: boolean;
}

export async function collectStatusDotAnswers(): Promise<StatusDotAnswers> {
  const text = await input({ message: 'Text next to the dot:', default: 'Done' });
  const status = await select<StatusDotColor>({ message: 'Status?', choices: STATUS_CHOICES, default: 'done' });
  const ping = await confirm({ message: 'Add a pulsing animation (.status-ping)?', default: false });
  return { text, status, ping };
}

export function renderStatusDot(answers: StatusDotAnswers): string {
  return renderStub('status-dot.stub.html', {
    TEXT: answers.text,
    STATUS: answers.status,
    PING_CLASS: answers.ping ? ' status-ping' : '',
  });
}

export function registerMakeStatusDotCommand(program: Command): void {
  program
    .command('make:status-dot')
    .description('Interactive status dot generator (.status-dot) (aliases: zrob:kropke-statusu, mache:statuspunkt)')
    .option('--answers <json>', 'Answers as JSON (StatusDotAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<StatusDotAnswers>(opts);
      const answers = provided ?? (await collectStatusDotAnswers());
      const html = renderStatusDot(answers);
      await outputResult(html, 'components/status-dot.html', provided ? { out: opts.out } : undefined);
    });
}
