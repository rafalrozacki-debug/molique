/**
 * molique-jit - `make:status-dot` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_status-dots.scss
 * (.status-dot + .status-<stan>, opcjonalnie .status-ping dla animowanego
 * pierscienia - obie klasy wspoldziela sie na tym samym elemencie) oraz
 * src/examples-status-dots.html.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type StatusDotColor = 'draft' | 'pending' | 'done' | 'danger';

const STATUS_CHOICES = [
  { name: 'Szkic (draft)', value: 'draft' },
  { name: 'Oczekuje (pending)', value: 'pending' },
  { name: 'Zakonczone (done)', value: 'done' },
  { name: 'Krytyczny (danger)', value: 'danger' },
] as const;

export interface StatusDotAnswers {
  text: string;
  status: StatusDotColor;
  /** .status-ping - pulsujacy pierscien wokol kropki. */
  ping: boolean;
}

export async function collectStatusDotAnswers(): Promise<StatusDotAnswers> {
  const text = await input({ message: 'Tekst przy kropce:', default: 'Zakonczone' });
  const status = await select<StatusDotColor>({ message: 'Status?', choices: STATUS_CHOICES, default: 'done' });
  const ping = await confirm({ message: 'Dodac pulsujaca animacje (.status-ping)?', default: false });
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
    .description('Interaktywny generator kropki statusu (.status-dot) (aliasy: zrob:kropke-statusu, mache:statuspunkt)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt StatusDotAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<StatusDotAnswers>(opts);
      const answers = provided ?? (await collectStatusDotAnswers());
      const html = renderStatusDot(answers);
      await outputResult(html, 'components/status-dot.html', provided ? { out: opts.out } : undefined);
    });
}
