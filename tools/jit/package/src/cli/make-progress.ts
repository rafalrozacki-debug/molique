/**
 * molique-jit - `make:progress` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_progress.scss
 * (.progress > .progress-bar - kolor domyslny to var(--primary) wbudowany
 * w baze klasy, .progress-label to osobny blok NAD paskiem) oraz realnego
 * uzycia w src/examples-progress-bars.html: kolor NIE ma wlasnych klas
 * `.progress-bar-<kolor>` (w odroznieniu od np. badge) - przyklad uzywa
 * WPROST ogolnej klasy narzedziowej `bg-<kolor>` doklejonej do
 * `.progress-bar` (`class="progress-bar bg-success"`), wiec generator
 * robi dokladnie to samo zamiast wymyslac nieistniejacy modyfikator.
 *
 * Zakres CELOWO nie obejmuje osobnego widgetu "Pasek Czytania" (Reading
 * Progress, `.progress-container-fixed`/`.progress-bar-reading`) - to
 * jednorazowy, calostronicowy element rdzenia skryptu, nie komponent do
 * parametryzacji per-instancja jak zwykly progress bar.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type ProgressColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

const COLOR_CHOICES = [
  { name: 'Primary (domyslny)', value: 'primary' },
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
  const label = await input({ message: 'Etykieta paska:', default: 'Rozwoj projektu' });
  const value = await input({
    message: 'Wartosc procentowa (0-100):',
    default: '75',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 0 && n <= 100) || 'Podaj liczbe calkowita od 0 do 100.';
    },
  });
  const color = await select<ProgressColor>({ message: 'Kolor paska?', choices: COLOR_CHOICES, default: 'primary' });
  return { label, value: Number(value), color };
}

export function renderProgress(answers: ProgressAnswers): string {
  const COLOR_CLASS = answers.color === 'primary' ? '' : ` bg-${answers.color}`;
  return renderStub('progress.stub.html', { LABEL: answers.label, VALUE: String(answers.value), COLOR_CLASS });
}

export function registerMakeProgressCommand(program: Command): void {
  program
    .command('make:progress')
    .description('Interaktywny generator paska postepu z etykieta (.progress/.progress-bar) (aliasy: zrob:pasek-postepu, mache:fortschritt)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt ProgressAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ProgressAnswers>(opts);
      const answers = provided ?? (await collectProgressAnswers());
      const html = renderProgress(answers);
      await outputResult(html, 'components/progress.html', provided ? { out: opts.out } : undefined);
    });
}
