/**
 * molique-jit - `make:badge` (Scaffolding)
 *
 * Markup verified against css/scss/components/_badges.scss (.badge +
 * .badge-<color>, pill shape) and src/examples-badges.html
 * (`<span class="badge badge-primary">Text</span>`).
 *
 * The first of the new wave of generators (CLI roadmap, Stage C) - built
 * from the start in the collect/render + --answers/--answers-file shape,
 * with no separate refactor later (unlike the 8 existing commands from
 * Stage B, which had this split retrofitted).
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type BadgeColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

const COLOR_CHOICES = [
  { name: 'Primary', value: 'primary' },
  { name: 'Secondary', value: 'secondary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
  { name: 'Dark', value: 'dark' },
] as const;

export interface BadgeAnswers {
  text: string;
  color: BadgeColor;
}

export async function collectBadgeAnswers(): Promise<BadgeAnswers> {
  const text = await input({ message: 'Pill text:', default: 'New' });
  const color = await select<BadgeColor>({ message: 'Color?', choices: COLOR_CHOICES, default: 'primary' });
  return { text, color };
}

export function renderBadge(answers: BadgeAnswers): string {
  return renderStub('badge.stub.html', { TEXT: answers.text, COLOR: answers.color });
}

export function registerMakeBadgeCommand(program: Command): void {
  program
    .command('make:badge')
    .description('Interactive status pill (.badge) generator (aliases: zrob:odznake, mache:abzeichen)')
    .option('--answers <json>', 'Answers as JSON (BadgeAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<BadgeAnswers>(opts);
      const answers = provided ?? (await collectBadgeAnswers());
      const html = renderBadge(answers);
      await outputResult(html, 'components/badge.html', provided ? { out: opts.out } : undefined);
    });
}
