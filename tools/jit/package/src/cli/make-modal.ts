/**
 * molique-jit - `make:modal` (Scaffolding)
 *
 * Zobacz tools/jit/docs/scaffolding-spec.md, punkt 3.B. Trzy warianty
 * (Standard / Confirm / Context), markup w stubach (src/stubs/modal-*.stub.html)
 * jest 1:1 z realnym, dzialajacym przykladem w src/examples-modals.html tego
 * repo - nie z ilustracyjnego pseudokodu w scaffolding-spec.md - zeby
 * wygenerowany kod byl gwarantowanie zgodny z tym, co faktycznie wspiera CSS
 * (patrz css/scss/components/_modal*.scss).
 *
 * Nazwa komendy byla wczesniej "make:component" (kiedy Modal byl jedynym
 * generatorem) - przemianowana na "make:modal" po dodaniu kolejnych rodzin
 * (make:layout itd.), zeby pasowac do konwencji "jedna komenda = jeden
 * typ komponentu". "make:component" teraz listuje dostepne generatory
 * (patrz cli/list.ts).
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B): kazdy wariant dostaje WLASNY typ `ModalXxxAnswers` i WLASNA
 * czysta `renderModalXxx()`, zgodnie z zasada "osobny stub/typ per
 * wariant, zero warunkow w srodku". `ModalAnswers` (unia z polem `type`)
 * to ksztalt oczekiwany przez `--answers`/`--answers-file`.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, joinBlocks } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

const ID_VALIDATE = (v: string) =>
  /^[a-zA-Z][\w-]*$/.test(v) || 'ID musi zaczynac sie od litery i zawierac tylko litery/cyfry/-/_ (bez spacji).';

type TriggerVariant = 'btn-primary' | 'btn-secondary' | 'btn-danger';

interface TriggerAnswers {
  triggerLabel: string;
  triggerVariant: TriggerVariant;
}

async function collectTriggerAnswers(): Promise<TriggerAnswers> {
  const triggerLabel = await input({ message: 'Etykieta przycisku otwierajacego:', default: 'Otworz' });
  const triggerVariant = await select<TriggerVariant>({
    message: 'Kolor przycisku otwierajacego:',
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
  const title = await input({ message: 'Tytul modala:', default: 'Tytul' });
  const body = await input({ message: 'Tresc modala:', default: 'Tresc modala...' });
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
  const title = await input({ message: 'Pytanie (tytul):', default: 'Na pewno?' });
  const message = await input({ message: 'Opis:', default: 'Tej operacji nie mozna cofnac.' });
  const cancelLabel = await input({ message: 'Etykieta przycisku anulowania:', default: 'Anuluj' });
  const confirmLabel = await input({ message: 'Etykieta przycisku potwierdzenia:', default: 'Potwierdz' });
  const confirmVariant = await select<ConfirmVariant>({
    message: 'Kolor przycisku potwierdzenia:',
    choices: [
      { name: 'Danger (akcja niszczaca, np. usuwanie)', value: 'btn-danger' },
      { name: 'Primary', value: 'btn-primary' },
      { name: 'Success', value: 'btn-success' },
    ],
    default: 'btn-danger',
  });
  const icon = await select<ConfirmIcon>({
    message: 'Ikona (Phosphor, img/icons-sprite.svg):',
    choices: [
      { name: 'Ostrzezenie', value: 'ph-warning' },
      { name: 'Pytanie', value: 'ph-question' },
      { name: 'Kosz', value: 'ph-trash' },
      { name: 'Informacja', value: 'ph-info' },
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
  const title = await input({ message: 'Tytul menu:', default: 'Opcje' });
  console.log('Dwie pozycje akcji na start - kolejne dopiszesz recznie w wygenerowanym kodzie (skopiuj <li>).');
  const action1Label = await input({ message: '  Etykieta akcji 1:', default: 'Edytuj' });
  const action1Icon = await input({
    message: '  Ikona akcji 1 (nazwa z img/icons-sprite.svg, np. ph-pencil):',
    default: 'ph-pencil',
  });
  const action2Label = await input({ message: '  Etykieta akcji 2:', default: 'Usun' });
  const action2Icon = await input({ message: '  Ikona akcji 2:', default: 'ph-trash' });
  const action2Danger = await confirm({ message: '  Czy akcja 2 jest niszczaca (kolor danger)?', default: true });
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
    message: 'Typ modala?',
    choices: [
      { name: 'Standard', value: 'standard' },
      { name: 'Dialog potwierdzajacy (Confirm)', value: 'confirm' },
      { name: 'Boczny / kontekstowy (Context)', value: 'context' },
    ],
  });
  const id = await input({
    message: 'ID modala (atrybut id, uzywany tez w onclick):',
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
      'Interaktywny generator modala (<dialog>) - Standard / Confirm / Context ' +
        '(aliasy: zrob:modal, mache:modal)'
    )
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt ModalAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ModalAnswers>(opts);
      const answers = provided ?? (await collectModalAnswers());
      const html = renderModal(answers);
      await outputResult(html, 'components/modal.html', provided ? { out: opts.out } : undefined);
    });
}
