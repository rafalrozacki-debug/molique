/**
 * molique-jit - `make:component` (Scaffolding)
 *
 * Zobacz tools/jit/docs/scaffolding-spec.md. Dzis (pierwsza iteracja)
 * obsluguje WYLACZNIE generator Modala (spec, punkt 3.B) - Tabela i inne
 * komendy `make:*` to kolejne kroki. Pytanie "jaki komponent?" jest
 * pominiete, bo przy jednej realnej opcji tylko wydluzaloby flow - jak
 * dojdzie druga (np. Tabela), dodaj wybor na poczatku `action()` i
 * dopisz kolejna galaz obok `makeModal()`.
 *
 * Markup w stubach (src/stubs/modal-*.stub.html) jest 1:1 z realnym,
 * dzialajacym przykladem w src/examples-modals.html tego repo - nie z
 * ilustracyjnego pseudokodu w scaffolding-spec.md - zeby wygenerowany kod
 * byl gwarantowanie zgodny z tym, co faktycznie wspiera CSS (patrz
 * css/scss/components/_modal*.scss).
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, joinBlocks } from '../stubs.js';

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

async function outputResult(html: string, defaultFileName: string): Promise<void> {
  const outputMode = await select({
    message: 'Co zrobic z wygenerowanym kodem?',
    choices: [
      { name: 'Wypisz w konsoli (do skopiowania)', value: 'console' },
      { name: 'Zapisz do pliku', value: 'file' },
    ],
  });

  if (outputMode === 'console') {
    console.log('\n' + html);
    return;
  }

  const outPath = await input({ message: 'Sciezka pliku wyjsciowego:', default: defaultFileName });
  const resolved = path.resolve(process.cwd(), outPath);

  if (fs.existsSync(resolved)) {
    const overwrite = await confirm({ message: `${outPath} juz istnieje - nadpisac?`, default: false });
    if (!overwrite) {
      console.log('Anulowano.');
      return;
    }
  }

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, html);
  console.log(`Zapisano: ${outPath}`);
}

export function registerMakeCommand(program: Command): void {
  program
    .command('make:component')
    .description('Interaktywny generator gotowych blokow HTML (scaffolding) - dzis tylko Modal')
    .action(async () => {
      const html = await makeModal();
      await outputResult(html, 'components/modal.html');
    });
}
