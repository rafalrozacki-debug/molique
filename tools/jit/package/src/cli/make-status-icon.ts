/**
 * molique-jit - `make:status-icon` (Scaffolding)
 *
 * Markup verified against css/scss/components/_status-icons.scss
 * (.status-icon-add/.status-icon-success - static, plain CSS;
 * .status-icon-toggle - the interactive Plus->Checkmark version, the
 * animation is driven by the `.is-success` CLASS OR native `:checked`
 * when wrapped in `.status-checkbox` - a "documented limitation" in
 * SCSS: a bare <button class="status-icon-toggle"> without a
 * <label>.status-checkbox has NO free pseudo-element to enlarge the
 * hit-area to 44px, so the generator only scaffolds the two variants
 * actually used in src/examples-status-feedback.html: a static span and
 * the zero-JS checkbox - not a standalone <button> (worse accessibility,
 * an undocumented pattern in the real example).
 *
 * Fix relative to the "copy" code block in the real example: there
 * `<input type="checkbox">` has NO `aria-label`, even though the
 * `.status-icon-toggle` shown next to it is a purely decorative `<span>`
 * with no text - without an aria-label such a checkbox is INACCESSIBLE
 * to screen readers (no accessible name). The LIVE PREVIEW on the same
 * page already correctly has `aria-label="Zaznacz mnie"` on the input -
 * the generator follows this more complete variant and requires an
 * aria-label always (a11y-by-default, the same discipline as in
 * make:carousel).
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

/* ---------- Static ---------- */

type StatusIconState = 'add' | 'success';

export interface StatusIconStaticAnswers {
  state: StatusIconState;
}

async function collectStatusIconStaticAnswers(): Promise<StatusIconStaticAnswers> {
  const state = await select<StatusIconState>({
    message: 'Which icon state?',
    choices: [
      { name: 'Add (plus)', value: 'add' },
      { name: 'Success (checkmark)', value: 'success' },
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
  /** Accessible name - .status-icon-toggle is purely decorative (no text), without this the checkbox is inaccessible. */
  ariaLabel: string;
}

async function collectStatusIconCheckboxAnswers(): Promise<StatusIconCheckboxAnswers> {
  const name = await input({ message: 'Field name attribute:', default: 'option' });
  const value = await input({ message: 'Field value attribute:', default: '1' });
  const ariaLabel = await input({
    message: 'aria-label (the checkbox has no visible text - this is the only description for a screen reader):',
    default: 'Check',
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
    message: 'Which status icon variant?',
    choices: [
      { name: 'Static (.status-icon - plain CSS, no interaction)', value: 'static' },
      { name: 'Interactive, zero-JS (.status-checkbox - Plus -> Checkmark)', value: 'checkbox' },
    ],
  });

  if (type === 'static') return { type: 'static', ...(await collectStatusIconStaticAnswers()) };
  return { type: 'checkbox', ...(await collectStatusIconCheckboxAnswers()) };
}

/* ---------- Command registration ---------- */

export function registerMakeStatusIconCommand(program: Command): void {
  program
    .command('make:status-icon')
    .description('Interactive status icon generator (Static / Checkbox Plus-Checkmark) (aliases: zrob:ikone-statusu, mache:statussymbol)')
    .option('--answers <json>', 'Answers as JSON (StatusIconAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<StatusIconAnswers>(opts);
      const answers = provided ?? (await collectStatusIconAnswers());
      const html = renderStatusIcon(answers);
      await outputResult(html, `components/status-icon-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
