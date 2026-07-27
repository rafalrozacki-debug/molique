/**
 * molique-jit - `make:tooltip` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_tooltips.scss
 * (`.tooltip-element` - dymek czysto w CSS, tresc dymku z `attr(data-tooltip)`,
 * zero JS) oraz src/examples-tooltips.html.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

export interface TooltipAnswers {
  /** Widoczny tekst, pod ktorym siedzi dymek. */
  text: string;
  /** Tresc dymku (atrybut data-tooltip). */
  tooltip: string;
}

export async function collectTooltipAnswers(): Promise<TooltipAnswers> {
  const text = await input({ message: 'Widoczny tekst (pod nim pojawi sie dymek):', default: 'Najedz na mnie' });
  const tooltip = await input({ message: 'Tresc dymku podpowiedzi:', default: 'Tresc podpowiedzi' });
  return { text, tooltip };
}

export function renderTooltip(answers: TooltipAnswers): string {
  return renderStub('tooltip.stub.html', { TEXT: answers.text, TOOLTIP: answers.tooltip });
}

export function registerMakeTooltipCommand(program: Command): void {
  program
    .command('make:tooltip')
    .description('Interaktywny generator dymku podpowiedzi (.tooltip-element, czysty CSS) (aliasy: zrob:podpowiedz, mache:tooltip)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt TooltipAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TooltipAnswers>(opts);
      const answers = provided ?? (await collectTooltipAnswers());
      const html = renderTooltip(answers);
      await outputResult(html, 'components/tooltip.html', provided ? { out: opts.out } : undefined);
    });
}
