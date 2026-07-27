/**
 * molique-jit - `make:badge` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_badges.scss
 * (.badge + .badge-<kolor>, ksztalt piguly) i src/examples-badges.html
 * (`<span class="badge badge-primary">Tekst</span>`).
 *
 * Pierwszy z nowej fali generatorow (plan rozwoju CLI, Etap C) - budowany
 * od razu w ksztalcie collect/render + --answers/--answers-file, bez
 * osobnego refaktoru pozniej (w odroznieniu od 8 istniejacych komend z
 * Etapu B, ktore mialy ten podzial dopisany wstecz).
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
  const text = await input({ message: 'Tekst na pigulce:', default: 'Nowość' });
  const color = await select<BadgeColor>({ message: 'Kolor?', choices: COLOR_CHOICES, default: 'primary' });
  return { text, color };
}

export function renderBadge(answers: BadgeAnswers): string {
  return renderStub('badge.stub.html', { TEXT: answers.text, COLOR: answers.color });
}

export function registerMakeBadgeCommand(program: Command): void {
  program
    .command('make:badge')
    .description('Interaktywny generator pigulki statusu (.badge) (aliasy: zrob:odznake, mache:abzeichen)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt BadgeAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<BadgeAnswers>(opts);
      const answers = provided ?? (await collectBadgeAnswers());
      const html = renderBadge(answers);
      await outputResult(html, 'components/badge.html', provided ? { out: opts.out } : undefined);
    });
}
