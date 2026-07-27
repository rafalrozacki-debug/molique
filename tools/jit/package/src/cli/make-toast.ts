/**
 * molique-jit - `make:toast` (Scaffolding)
 *
 * Jedyny komponent w rodzinie molique w calosci sterowany przez JS - nie
 * ma zadnego trwalego markupu do wypelnienia (kontener `.toast-container`
 * i sam `.toast` buduje `window.MoliqueToast.show()` w
 * js/molique-script.js w locie). Generator zwraca wiec nie sam HTML
 * fragment jednego komponentu, a KOMPLETNY, dzialajacy przyklad: przycisk
 * wyzwalajacy + wywolanie API, zweryfikowane wzgledem sygnatury
 * `MoliqueToast.show({ message, type, position, duration })`
 * (js/molique-script.js - domyslne wartosci: message='Powiadomienie',
 * type='info', position='top-right', duration=4000) oraz
 * src/examples-toasts.html.
 *
 * Realny przyklad wywoluje API przez INLINE `onclick="..."` na przycisku
 * (dopuszczalne w demo strony dokumentacji, ale nie jest to wzorzec do
 * powielania w kodzie produkcyjnym) - jego WLASNY blok "Kopiuj kod" na tej
 * samej stronie pokazuje za to poprawny wzorzec (`<script>` + wywolanie
 * API), ktorego generator sie trzyma, dodajac `addEventListener` zamiast
 * inline `onclick` (spojne z zasada "zero inline JS" z reszty ekosystemu).
 *
 * Kolor przycisku wyzwalajacego dopasowany do typu powiadomienia
 * (`btn-<type>` - success/danger/warning/info sa jednoczesnie prawidlowymi
 * kolorami przyciskow motywu), tak jak w realnym przykladzie
 * (`btn-success` dla success, `btn-danger` dla danger).
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type ToastType = 'success' | 'danger' | 'warning' | 'info';
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const TYPE_CHOICES = [
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info (domyslny)', value: 'info' },
] as const;

const POSITION_CHOICES = [
  { name: 'Gora-Prawo (domyslna)', value: 'top-right' },
  { name: 'Gora-Lewo', value: 'top-left' },
  { name: 'Gora-Srodek', value: 'top-center' },
  { name: 'Dol-Prawo', value: 'bottom-right' },
  { name: 'Dol-Lewo', value: 'bottom-left' },
  { name: 'Dol-Srodek', value: 'bottom-center' },
] as const;

export interface ToastAnswers {
  /** HTML id przycisku wyzwalajacego - musi byc unikalne na stronie. */
  triggerId: string;
  triggerLabel: string;
  message: string;
  type: ToastType;
  position: ToastPosition;
  /** Czas wyswietlania w milisekundach. */
  duration: number;
}

export async function collectToastAnswers(): Promise<ToastAnswers> {
  const triggerLabel = await input({ message: 'Etykieta przycisku wyzwalajacego:', default: 'Zapisz zmiany' });
  const triggerId = await input({ message: 'HTML id przycisku (unikalne na stronie):', default: 'toast-trigger' });
  const message = await input({ message: 'Tresc powiadomienia:', default: 'Zapisano pomyslnie!' });
  const type = await select<ToastType>({ message: 'Typ powiadomienia?', choices: TYPE_CHOICES, default: 'success' });
  const position = await select<ToastPosition>({ message: 'Pozycja na ekranie?', choices: POSITION_CHOICES, default: 'top-right' });
  const durationStr = await input({
    message: 'Czas wyswietlania w milisekundach:',
    default: '4000',
    validate: (v) => (Number.isInteger(Number(v)) && Number(v) > 0) || 'Podaj dodatnia liczbe calkowita.',
  });

  return { triggerId, triggerLabel, message, type, position, duration: Number(durationStr) };
}

export function renderToast(answers: ToastAnswers): string {
  return renderStub('toast.stub.html', {
    TRIGGER_ID: answers.triggerId,
    TRIGGER_LABEL: answers.triggerLabel,
    MESSAGE: answers.message,
    TYPE: answers.type,
    POSITION: answers.position,
    DURATION: String(answers.duration),
  });
}

export function registerMakeToastCommand(program: Command): void {
  program
    .command('make:toast')
    .description('Interaktywny generator przycisku wyzwalajacego powiadomienie Toast (MoliqueToast.show) (aliasy: zrob:powiadomienie, mache:benachrichtigung)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt ToastAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ToastAnswers>(opts);
      const answers = provided ?? (await collectToastAnswers());
      const html = renderToast(answers);
      await outputResult(html, 'components/toast.html', provided ? { out: opts.out } : undefined);
    });
}
