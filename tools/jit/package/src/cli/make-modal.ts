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
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, joinBlocks } from '../stubs.js';
import { outputResult } from './output.js';

type ModalType = 'standard' | 'confirm' | 'context';

const ID_VALIDATE = (v: string) =>
  /^[a-zA-Z][\w-]*$/.test(v) || 'ID musi zaczynac sie od litery i zawierac tylko litery/cyfry/-/_ (bez spacji).';

async function promptTrigger(id: string): Promise<string> {
  const TRIGGER_LABEL = await input({ message: 'Etykieta przycisku otwierajacego:', default: 'Otworz' });
  const TRIGGER_VARIANT = await select({
    message: 'Kolor przycisku otwierajacego:',
    choices: [
      { name: 'Primary', value: 'btn-primary' },
      { name: 'Secondary', value: 'btn-secondary' },
      { name: 'Danger', value: 'btn-danger' },
    ],
    default: 'btn-primary',
  });
  return renderStub('_trigger-button.stub.html', { ID: id, TRIGGER_LABEL, TRIGGER_VARIANT });
}

async function makeStandardModal(id: string): Promise<string> {
  const TITLE = await input({ message: 'Tytul modala:', default: 'Tytul' });
  const BODY = await input({ message: 'Tresc modala:', default: 'Tresc modala...' });
  const trigger = await promptTrigger(id);
  const modal = renderStub('modal-standard.stub.html', { ID: id, TITLE, BODY });
  return joinBlocks(trigger, modal);
}

async function makeConfirmModal(id: string): Promise<string> {
  const TITLE = await input({ message: 'Pytanie (tytul):', default: 'Na pewno?' });
  const MESSAGE = await input({ message: 'Opis:', default: 'Tej operacji nie mozna cofnac.' });
  const CANCEL_LABEL = await input({ message: 'Etykieta przycisku anulowania:', default: 'Anuluj' });
  const CONFIRM_LABEL = await input({ message: 'Etykieta przycisku potwierdzenia:', default: 'Potwierdz' });
  const CONFIRM_VARIANT = await select({
    message: 'Kolor przycisku potwierdzenia:',
    choices: [
      { name: 'Danger (akcja niszczaca, np. usuwanie)', value: 'btn-danger' },
      { name: 'Primary', value: 'btn-primary' },
      { name: 'Success', value: 'btn-success' },
    ],
    default: 'btn-danger',
  });
  const ICON = await select({
    message: 'Ikona (Phosphor, img/icons-sprite.svg):',
    choices: [
      { name: 'Ostrzezenie', value: 'ph-warning' },
      { name: 'Pytanie', value: 'ph-question' },
      { name: 'Kosz', value: 'ph-trash' },
      { name: 'Informacja', value: 'ph-info' },
    ],
    default: 'ph-warning',
  });
  const trigger = await promptTrigger(id);
  const modal = renderStub('modal-confirm.stub.html', {
    ID: id,
    TITLE,
    MESSAGE,
    CANCEL_LABEL,
    CONFIRM_LABEL,
    CONFIRM_VARIANT,
    ICON,
  });
  return joinBlocks(trigger, modal);
}

async function makeContextModal(id: string): Promise<string> {
  const TITLE = await input({ message: 'Tytul menu:', default: 'Opcje' });
  console.log('Dwie pozycje akcji na start - kolejne dopiszesz recznie w wygenerowanym kodzie (skopiuj <li>).');
  const ACTION_1_LABEL = await input({ message: '  Etykieta akcji 1:', default: 'Edytuj' });
  const ACTION_1_ICON = await input({
    message: '  Ikona akcji 1 (nazwa z img/icons-sprite.svg, np. ph-pencil):',
    default: 'ph-pencil',
  });
  const ACTION_2_LABEL = await input({ message: '  Etykieta akcji 2:', default: 'Usun' });
  const ACTION_2_ICON = await input({ message: '  Ikona akcji 2:', default: 'ph-trash' });
  const action2Danger = await confirm({ message: '  Czy akcja 2 jest niszczaca (kolor danger)?', default: true });
  const trigger = await promptTrigger(id);
  const modal = renderStub('modal-context.stub.html', {
    ID: id,
    TITLE,
    ACTION_1_LABEL,
    ACTION_1_ICON,
    ACTION_2_LABEL,
    ACTION_2_ICON,
    ACTION_2_CLASS: action2Danger ? 'text-danger' : '',
  });
  return joinBlocks(trigger, modal);
}

async function makeModal(): Promise<string> {
  const modalType = await select<ModalType>({
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

  if (modalType === 'standard') return makeStandardModal(id);
  if (modalType === 'confirm') return makeConfirmModal(id);
  return makeContextModal(id);
}

export function registerMakeModalCommand(program: Command): void {
  program
    .command('make:modal')
    .description(
      'Interaktywny generator modala (<dialog>) - Standard / Confirm / Context ' +
        '(aliasy: zrob:modal, mache:modal)'
    )
    .action(async () => {
      const html = await makeModal();
      await outputResult(html, 'components/modal.html');
    });
}
