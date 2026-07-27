/**
 * molique-jit - `make:status-icon` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_status-icons.scss
 * (.status-icon-add/.status-icon-success - statyczne, czysty CSS;
 * .status-icon-toggle - interaktywna wersja Plus->Checkmark, animacje
 * sterowane KLASA `.is-success` LUB natywnym `:checked` gdy owinieta w
 * `.status-checkbox` - "udokumentowane ograniczenie" w SCSS: goly
 * <button class="status-icon-toggle"> bez <label>.status-checkbox NIE MA
 * wolnego pseudo-elementu na powiekszenie hit-area do 44px, wiec
 * generator scaffolduje TYLKO dwa realnie uzyte w
 * src/examples-status-feedback.html warianty: statyczny span i zero-JS
 * checkbox - nie samodzielny <button> (gorsza dostepnosc, nieudokumentowany
 * wzorzec w realnym przykladzie).
 *
 * Poprawka wzgledem "copy" bloku kodu w realnym przykladzie: tam
 * `<input type="checkbox">` NIE MA `aria-label`, mimo ze widoczny obok
 * `.status-icon-toggle` to czysto dekoracyjny `<span>` bez tekstu - bez
 * aria-label taki checkbox jest NIEDOSTEPNY dla czytnikow ekranu (brak
 * accessible name). ZYWY PODGLAD na tej samej stronie ma juz poprawnie
 * `aria-label="Zaznacz mnie"` na inpucie - generator idzie za tym
 * pelniejszym wariantem i wymaga aria-label zawsze (a11y-by-default,
 * ta sama dyscyplina co przy make:carousel).
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

/* ---------- Statyczna ---------- */

type StatusIconState = 'add' | 'success';

export interface StatusIconStaticAnswers {
  state: StatusIconState;
}

async function collectStatusIconStaticAnswers(): Promise<StatusIconStaticAnswers> {
  const state = await select<StatusIconState>({
    message: 'Jaki stan ikony?',
    choices: [
      { name: 'Dodaj (plus)', value: 'add' },
      { name: 'Sukces (checkmark)', value: 'success' },
    ],
    default: 'add',
  });
  return { state };
}

export function renderStatusIconStatic(answers: StatusIconStaticAnswers): string {
  return renderStub('status-icon-static.stub.html', { STATE: answers.state });
}

/* ---------- Checkbox (zero-JS toggle) ---------- */

export interface StatusIconCheckboxAnswers {
  name: string;
  value: string;
  /** Accessible name - .status-icon-toggle jest czysto dekoracyjny (brak tekstu), bez tego checkbox jest niedostepny. */
  ariaLabel: string;
}

async function collectStatusIconCheckboxAnswers(): Promise<StatusIconCheckboxAnswers> {
  const name = await input({ message: 'Atrybut name pola:', default: 'opcja' });
  const value = await input({ message: 'Atrybut value pola:', default: '1' });
  const ariaLabel = await input({
    message: 'aria-label (checkbox nie ma widocznego tekstu - to jedyny opis dla czytnika ekranu):',
    default: 'Zaznacz',
  });
  return { name, value, ariaLabel };
}

export function renderStatusIconCheckbox(answers: StatusIconCheckboxAnswers): string {
  return renderStub('status-icon-checkbox.stub.html', {
    NAME: answers.name,
    VALUE: answers.value,
    ARIA_LABEL: answers.ariaLabel,
  });
}

/* ---------- Dispatch ---------- */

export type StatusIconAnswers =
  | ({ type: 'static' } & StatusIconStaticAnswers)
  | ({ type: 'checkbox' } & StatusIconCheckboxAnswers);

function renderStatusIcon(answers: StatusIconAnswers): string {
  if (answers.type === 'static') return renderStatusIconStatic(answers);
  return renderStatusIconCheckbox(answers);
}

async function collectStatusIconAnswers(): Promise<StatusIconAnswers> {
  const type = await select<StatusIconAnswers['type']>({
    message: 'Jaki wariant ikony statusu?',
    choices: [
      { name: 'Statyczna (.status-icon - czysty CSS, bez interakcji)', value: 'static' },
      { name: 'Interaktywna, zero-JS (.status-checkbox - Plus -> Checkmark)', value: 'checkbox' },
    ],
  });

  if (type === 'static') return { type: 'static', ...(await collectStatusIconStaticAnswers()) };
  return { type: 'checkbox', ...(await collectStatusIconCheckboxAnswers()) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeStatusIconCommand(program: Command): void {
  program
    .command('make:status-icon')
    .description('Interaktywny generator ikony statusu (Statyczna / Checkbox Plus-Checkmark) (aliasy: zrob:ikone-statusu, mache:statussymbol)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt StatusIconAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<StatusIconAnswers>(opts);
      const answers = provided ?? (await collectStatusIconAnswers());
      const html = renderStatusIcon(answers);
      await outputResult(html, `components/status-icon-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
