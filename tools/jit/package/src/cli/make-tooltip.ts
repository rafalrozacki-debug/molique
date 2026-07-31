/**
 * molique-jit - `make:tooltip` (Scaffolding)
 *
 * Markup verified against css/scss/components/_tooltips.scss
 * (`.tooltip-element` - a bubble purely in CSS, the bubble content from
 * `attr(data-tooltip)`, zero JS) and src/examples-tooltips.html.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

export interface TooltipAnswers {
  /** Visible text, under which the bubble appears. */
  text: string;
  /** Bubble content (the data-tooltip attribute). */
  tooltip: string;
}

export async function collectTooltipAnswers(): Promise<TooltipAnswers> {
  const text = await input({ message: 'Visible text (the bubble appears under it):', default: 'Hover over me' });
  const tooltip = await input({ message: 'Tooltip bubble content:', default: 'Tooltip content' });
  return { text, tooltip };
}

export function renderTooltip(answers: TooltipAnswers): string {
  return renderStub('tooltip.stub.html', { TEXT: answers.text, TOOLTIP: answers.tooltip });
}

export function registerMakeTooltipCommand(program: Command): void {
  program
    .command('make:tooltip')
    .description('Interactive tooltip bubble generator (.tooltip-element, plain CSS) (aliases: zrob:podpowiedz, mache:tooltip)')
    .option('--answers <json>', 'Answers as JSON (TooltipAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TooltipAnswers>(opts);
      const answers = provided ?? (await collectTooltipAnswers());
      const html = renderTooltip(answers);
      await outputResult(html, 'components/tooltip.html', provided ? { out: opts.out } : undefined);
    });
}
