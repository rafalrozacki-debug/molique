/**
 * molique-jit - `make:counter` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_counters.scss
 * (.counter > .counter-value + .counter-title) oraz
 * js/modules/molique-counters.js (auto-ladowany przy klasie .counter-value):
 * tresc .counter-value to LICZBA docelowa (JS parsuje ja przez
 * parseFloat() i animuje liczenie od 0 po wejsciu w viewport, IntersectionObserver),
 * opcjonalne atrybuty data-prefix/data-suffix (np. "$"/"+", "%") sa
 * dopisywane do wyniku bez zmiany logiki liczenia.
 *
 * BRAK dedykowanej strony examples-* dla samego .counter (jedyne realne
 * uzycie w repo to polaczenie z .chart-radial na stronie glownej,
 * src/index.html) - grunt tego generatora to SCSS + faktyczne zachowanie
 * JS-a, nie przyklad strony docs.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

export interface CounterAnswers {
  /** Liczba docelowa - JS animuje liczenie od 0 do tej wartosci. */
  value: number;
  title: string;
  /** np. "$", puste = brak. */
  prefix: string;
  /** np. "+", "%", puste = brak. */
  suffix: string;
}

export async function collectCounterAnswers(): Promise<CounterAnswers> {
  const valueStr = await input({
    message: 'Docelowa liczba (JS animuje liczenie od 0):',
    default: '1500',
    validate: (v: string) => !Number.isNaN(Number(v)) || 'Podaj liczbe.',
  });
  const title = await input({ message: 'Podpis pod liczba:', default: 'Zadowolonych klientow' });
  const prefix = await input({ message: 'Prefiks (np. "$"), puste = brak:', default: '' });
  const suffix = await input({ message: 'Sufiks (np. "+", "%"), puste = brak:', default: '+' });
  return { value: Number(valueStr), title, prefix, suffix };
}

export function renderCounter(answers: CounterAnswers): string {
  return renderStub('counter.stub.html', {
    VALUE: String(answers.value),
    TITLE: answers.title,
    PREFIX_ATTR: answers.prefix ? ` data-prefix="${answers.prefix}"` : '',
    SUFFIX_ATTR: answers.suffix ? ` data-suffix="${answers.suffix}"` : '',
  });
}

export function registerMakeCounterCommand(program: Command): void {
  program
    .command('make:counter')
    .description('Interaktywny generator animowanego licznika (.counter) (aliasy: zrob:licznik, mache:zaehler)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt CounterAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CounterAnswers>(opts);
      const answers = provided ?? (await collectCounterAnswers());
      const html = renderCounter(answers);
      await outputResult(html, 'components/counter.html', provided ? { out: opts.out } : undefined);
    });
}
