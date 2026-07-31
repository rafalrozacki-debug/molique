/**
 * molique-jit - `make:progress` (Scaffolding)
 *
 * Markup verified against css/scss/components/_progress.scss (.progress
 * > .progress-bar - the default color is var(--primary) built into the
 * class base, .progress-label is a separate block ABOVE the bar) and
 * real usage in src/examples-progress-bars.html: color has NO dedicated
 * `.progress-bar-<color>` classes (unlike e.g. badge) - the example uses
 * the general utility class `bg-<color>` DIRECTLY, appended to
 * `.progress-bar` (`class="progress-bar bg-success"`), so the generator
 * does exactly the same instead of inventing a modifier that doesn't
 * exist.
 *
 * The scope DELIBERATELY excludes the separate "Reading Progress" widget
 * (`.progress-container-fixed`/`.progress-bar-reading`) - that's a
 * one-off, whole-page element from the core script, not a component to
 * parametrize per instance like a regular progress bar.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type ProgressColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

const COLOR_CHOICES = [
  { name: 'Primary (default)', value: 'primary' },
  { name: 'Secondary', value: 'secondary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
  { name: 'Dark', value: 'dark' },
] as const;

export interface ProgressAnswers {
  label: string;
  value: number;
  color: ProgressColor;
}

export async function collectProgressAnswers(): Promise<ProgressAnswers> {
  const label = await input({ message: 'Bar label:', default: 'Project progress' });
  const value = await input({
    message: 'Percentage value (0-100):',
    default: '75',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 0 && n <= 100) || 'Enter a whole number from 0 to 100.';
    },
  });
  const color = await select<ProgressColor>({ message: 'Bar color?', choices: COLOR_CHOICES, default: 'primary' });
  return { label, value: Number(value), color };
}

export function renderProgress(answers: ProgressAnswers): string {
  const COLOR_CLASS = answers.color === 'primary' ? '' : ` bg-${answers.color}`;
  return renderStub('progress.stub.html', { LABEL: answers.label, VALUE: String(answers.value), COLOR_CLASS });
}

export function registerMakeProgressCommand(program: Command): void {
  program
    .command('make:progress')
    .description('Interactive labeled progress bar generator (.progress/.progress-bar) (aliases: zrob:pasek-postepu, mache:fortschritt)')
    .option('--answers <json>', 'Answers as JSON (ProgressAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ProgressAnswers>(opts);
      const answers = provided ?? (await collectProgressAnswers());
      const html = renderProgress(answers);
      await outputResult(html, 'components/progress.html', provided ? { out: opts.out } : undefined);
    });
}
