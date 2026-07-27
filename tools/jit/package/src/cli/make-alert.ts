/**
 * molique-jit - `make:alert` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_alerts.scss
 * (.alert + .alert-<kolor>, dokladnie 4 warianty: info/success/danger/
 * warning) oraz src/examples-alerts.html. WAZNE: statyczny komunikat w
 * tresci strony, BEZ przycisku zamykania i BEZ JS - to `.toast` pojawia
 * sie i znika automatycznie, `.alert` nie ma tej mechaniki wcale
 * (dokumentacja wprost to rozroznia). Generator nie wymysla wiec
 * nieistniejacego przycisku "x".
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
  const message = await input({ message: 'Tresc komunikatu:', default: 'Zmiany zostaly zapisane pomyslnie.' });
  const color = await select<AlertColor>({ message: 'Kolor?', choices: COLOR_CHOICES, default: 'info' });
  return { message, color };
}

export function renderAlert(answers: AlertAnswers): string {
  return renderStub('alert.stub.html', { MESSAGE: answers.message, COLOR: answers.color });
}

export function registerMakeAlertCommand(program: Command): void {
  program
    .command('make:alert')
    .description('Interaktywny generator statycznego komunikatu (.alert) (aliasy: zrob:komunikat, mache:hinweis)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt AlertAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<AlertAnswers>(opts);
      const answers = provided ?? (await collectAlertAnswers());
      const html = renderAlert(answers);
      await outputResult(html, 'components/alert.html', provided ? { out: opts.out } : undefined);
    });
}
