/**
 * molique-jit - `make:modal` (Scaffolding)
 *
 * See tools/jit/docs/scaffolding-spec.md, point 3.B. Three variants
 * (Standard / Confirm / Context), the markup in the stubs
 * (src/stubs/modal-*.stub.html) is 1:1 with the real, working example in
 * src/examples-modals.html of this repo - not with the illustrative
 * pseudocode in scaffolding-spec.md - so that the generated code is
 * guaranteed to match what the CSS actually supports (see
 * css/scss/components/_modal*.scss).
 *
 * The command was previously named "make:component" (when Modal was the
 * only generator) - renamed to "make:modal" after further families were
 * added (make:layout etc.), to match the "one command = one component
 * type" convention. "make:component" now lists the available generators
 * (see cli/list.ts).
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * each variant gets its OWN `ModalXxxAnswers` type and its OWN pure
 * `renderModalXxx()`, following the "separate stub/type per variant,
 * zero conditionals inside" rule. `ModalAnswers` (a union with a "type"
 * field) is the shape expected by `--answers`/`--answers-file`.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, joinBlocks } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

const ID_VALIDATE = (v: string) =>
  /^[a-zA-Z][\w-]*$/.test(v) || 'The ID must start with a letter and contain only letters/digits/-/_ (no spaces).';

type TriggerVariant = 'btn-primary' | 'btn-secondary' | 'btn-danger';

interface TriggerAnswers {
  triggerLabel: string;
  triggerVariant: TriggerVariant;
}

async function collectTriggerAnswers(): Promise<TriggerAnswers> {
  const triggerLabel = await input({ message: 'Opening button label:', default: 'Open' });
  const triggerVariant = await select<TriggerVariant>({
    message: 'Opening button color:',
    choices: [
      { name: 'Primary', value: 'btn-primary' },
      { name: 'Secondary', value: 'btn-secondary' },
      { name: 'Danger', value: 'btn-danger' },
    ],
    default: 'btn-primary',
  });
  return { triggerLabel, triggerVariant };
}

function renderTriggerButton(id: string, trigger: TriggerAnswers): string {
  return renderStub('_trigger-button.stub.html', {
    ID: id,
    TRIGGER_LABEL: trigger.triggerLabel,
    TRIGGER_VARIANT: trigger.triggerVariant,
  });
}

/* ---------- Standard ---------- */

export interface ModalStandardAnswers extends TriggerAnswers {
  id: string;
  title: string;
  body: string;
}

export async function collectModalStandardAnswers(id: string): Promise<ModalStandardAnswers> {
  const title = await input({ message: 'Modal title:', default: 'Title' });
  const body = await input({ message: 'Modal content:', default: 'Modal content...' });
  const trigger = await collectTriggerAnswers();
  return { id, title, body, ...trigger };
}

export function renderModalStandard(answers: ModalStandardAnswers): string {
  const trigger = renderTriggerButton(answers.id, answers);
  const modal = renderStub('modal-standard.stub.html', { ID: answers.id, TITLE: answers.title, BODY: answers.body });
  return joinBlocks(trigger, modal);
}

/* ---------- Confirm ---------- */

type ConfirmVariant = 'btn-danger' | 'btn-primary' | 'btn-success';
type ConfirmIcon = 'ph-warning' | 'ph-question' | 'ph-trash' | 'ph-info';

export interface ModalConfirmAnswers extends TriggerAnswers {
  id: string;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant: ConfirmVariant;
  icon: ConfirmIcon;
}

export async function collectModalConfirmAnswers(id: string): Promise<ModalConfirmAnswers> {
  const title = await input({ message: 'Question (title):', default: 'Are you sure?' });
  const message = await input({ message: 'Description:', default: 'This action cannot be undone.' });
  const cancelLabel = await input({ message: 'Cancel button label:', default: 'Cancel' });
  const confirmLabel = await input({ message: 'Confirm button label:', default: 'Confirm' });
  const confirmVariant = await select<ConfirmVariant>({
    message: 'Confirm button color:',
    choices: [
      { name: 'Danger (a destructive action, e.g. deletion)', value: 'btn-danger' },
      { name: 'Primary', value: 'btn-primary' },
      { name: 'Success', value: 'btn-success' },
    ],
    default: 'btn-danger',
  });
  const icon = await select<ConfirmIcon>({
    message: 'Icon (Phosphor, img/icons-sprite.svg):',
    choices: [
      { name: 'Warning', value: 'ph-warning' },
      { name: 'Question', value: 'ph-question' },
      { name: 'Trash', value: 'ph-trash' },
      { name: 'Info', value: 'ph-info' },
    ],
    default: 'ph-warning',
  });
  const trigger = await collectTriggerAnswers();
  return { id, title, message, cancelLabel, confirmLabel, confirmVariant, icon, ...trigger };
}

export function renderModalConfirm(answers: ModalConfirmAnswers): string {
  const trigger = renderTriggerButton(answers.id, answers);
  const modal = renderStub('modal-confirm.stub.html', {
    ID: answers.id,
    TITLE: answers.title,
    MESSAGE: answers.message,
    CANCEL_LABEL: answers.cancelLabel,
    CONFIRM_LABEL: answers.confirmLabel,
    CONFIRM_VARIANT: answers.confirmVariant,
    ICON: answers.icon,
  });
  return joinBlocks(trigger, modal);
}

/* ---------- Context ---------- */

export interface ModalContextAnswers extends TriggerAnswers {
  id: string;
  title: string;
  action1Label: string;
  action1Icon: string;
  action2Label: string;
  action2Icon: string;
  action2Danger: boolean;
}

export async function collectModalContextAnswers(id: string): Promise<ModalContextAnswers> {
  const title = await input({ message: 'Menu title:', default: 'Options' });
  console.log('Two action items to start - add more later by hand in the generated code (copy the <li>).');
  const action1Label = await input({ message: '  Action 1 label:', default: 'Edit' });
  const action1Icon = await input({
    message: '  Action 1 icon (name from img/icons-sprite.svg, e.g. ph-pencil):',
    default: 'ph-pencil',
  });
  const action2Label = await input({ message: '  Action 2 label:', default: 'Delete' });
  const action2Icon = await input({ message: '  Action 2 icon:', default: 'ph-trash' });
  const action2Danger = await confirm({ message: '  Is action 2 destructive (danger color)?', default: true });
  const trigger = await collectTriggerAnswers();
  return { id, title, action1Label, action1Icon, action2Label, action2Icon, action2Danger, ...trigger };
}

export function renderModalContext(answers: ModalContextAnswers): string {
  const trigger = renderTriggerButton(answers.id, answers);
  const modal = renderStub('modal-context.stub.html', {
    ID: answers.id,
    TITLE: answers.title,
    ACTION_1_LABEL: answers.action1Label,
    ACTION_1_ICON: answers.action1Icon,
    ACTION_2_LABEL: answers.action2Label,
    ACTION_2_ICON: answers.action2Icon,
    ACTION_2_CLASS: answers.action2Danger ? 'text-danger' : '',
  });
  return joinBlocks(trigger, modal);
}

/* ---------- Dispatch ---------- */

export type ModalAnswers =
  | ({ type: 'standard' } & ModalStandardAnswers)
  | ({ type: 'confirm' } & ModalConfirmAnswers)
  | ({ type: 'context' } & ModalContextAnswers);

function renderModal(answers: ModalAnswers): string {
  if (answers.type === 'standard') return renderModalStandard(answers);
  if (answers.type === 'confirm') return renderModalConfirm(answers);
  return renderModalContext(answers);
}

async function collectModalAnswers(): Promise<ModalAnswers> {
  const modalType = await select<ModalAnswers['type']>({
    message: 'Modal type?',
    choices: [
      { name: 'Standard', value: 'standard' },
      { name: 'Confirmation dialog (Confirm)', value: 'confirm' },
      { name: 'Side / contextual (Context)', value: 'context' },
    ],
  });
  const id = await input({
    message: 'Modal ID (the id attribute, also used in onclick):',
    default: 'myModal',
    validate: ID_VALIDATE,
  });

  if (modalType === 'standard') return { type: 'standard', ...(await collectModalStandardAnswers(id)) };
  if (modalType === 'confirm') return { type: 'confirm', ...(await collectModalConfirmAnswers(id)) };
  return { type: 'context', ...(await collectModalContextAnswers(id)) };
}

export function registerMakeModalCommand(program: Command): void {
  program
    .command('make:modal')
    .description(
      'Interactive modal (<dialog>) generator - Standard / Confirm / Context ' +
        '(aliases: zrob:modal, mache:modal)'
    )
    .option('--answers <json>', 'Answers as JSON (ModalAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ModalAnswers>(opts);
      const answers = provided ?? (await collectModalAnswers());
      const html = renderModal(answers);
      await outputResult(html, 'components/modal.html', provided ? { out: opts.out } : undefined);
    });
}
