/**
 * molique-jit - `make:alert` (Scaffolding)
 *
 * Markup verified against css/scss/components/_alerts.scss (.alert +
 * .alert-<color>, exactly 4 variants: info/success/danger/warning) and
 * src/examples-alerts.html. IMPORTANT: a static message in the page
 * content, WITHOUT a close button and WITHOUT JS - it's `.toast` that
 * appears and disappears automatically, `.alert` has none of that
 * mechanics (the docs explicitly distinguish the two). So the generator
 * doesn't invent a nonexistent "x" button.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type AlertColor = 'info' | 'success' | 'danger' | 'warning';

const COLOR_CHOICES = [
  { name: 'Info', value: 'info' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
] as const;

export interface AlertAnswers {
  message: string;
  color: AlertColor;
}

export async function collectAlertAnswers(): Promise<AlertAnswers> {
  const message = await input({ message: 'Message content:', default: 'The changes were saved successfully.' });
  const color = await select<AlertColor>({ message: 'Color?', choices: COLOR_CHOICES, default: 'info' });
  return { message, color };
}

export function renderAlert(answers: AlertAnswers): string {
  return renderStub('alert.stub.html', { MESSAGE: answers.message, COLOR: answers.color });
}

export function registerMakeAlertCommand(program: Command): void {
  program
    .command('make:alert')
    .description('Interactive static message (.alert) generator (aliases: zrob:komunikat, mache:hinweis)')
    .option('--answers <json>', 'Answers as JSON (AlertAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<AlertAnswers>(opts);
      const answers = provided ?? (await collectAlertAnswers());
      const html = renderAlert(answers);
      await outputResult(html, 'components/alert.html', provided ? { out: opts.out } : undefined);
    });
}
