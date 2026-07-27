/**
 * molique-jit - `make:dropdown` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_dropdown.scss (dwa
 * NIEZALEZNE mechanizmy otwierania - `<details class="dropdown">` +
 * `<summary class="dropdown-toggle">` klasycznie, ORAZ dowolny przycisk z
 * `popovertarget` + `.dropdown-menu[popover]` jako zalecany wariant poza
 * navbarem, top layer, nie przycinany przez overflow) oraz realnego
 * uzycia w src/examples-dropdown.html. Dwie STRUKTURALNIE rozne wersje
 * (inny wyzwalacz: <details>/<summary> vs zwykly <button>), wiec dwa
 * osobne stuby - ta sama zasada co w make:layout dla Hero Prosty/Cutout.
 *
 * `.dropdown-menu-end` (wyrownanie do prawej) dziala identycznie w obu
 * wariantach, wiec jest wspolnym polem `alignEnd` w obu typach odpowiedzi.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

const TRIGGER_COLOR_CHOICES = [
  { name: 'Outline Dark (domyslny, jak w przykladzie)', value: 'btn-outline-dark' },
  { name: 'Primary', value: 'btn-primary' },
  { name: 'Secondary', value: 'btn-secondary' },
  { name: 'Light', value: 'btn-light' },
] as const;

export interface DropdownItemAnswer {
  label: string;
  /** Akcja destrukcyjna (np. "Usun") - dostaje .text-danger. */
  danger: boolean;
}

async function collectItems(countFlag?: string): Promise<DropdownItemAnswer[]> {
  const count = await promptCount({
    message: 'Ile pozycji w menu?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const items: DropdownItemAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Etykieta pozycji ${i}:`, default: i === 1 ? 'Edytuj' : `Pozycja ${i}` });
    const danger = await confirm({ message: `  Pozycja ${i} to akcja destrukcyjna (np. Usun)?`, default: false });
    items.push({ label, danger });
  }
  return items;
}

function renderItems(items: DropdownItemAnswer[]): string {
  return renderList(
    '_dropdown-item.stub.html',
    items.map((i) => ({ LABEL: i.label, DANGER_CLASS: i.danger ? ' text-danger' : '' }))
  );
}

/* ---------- Klasyczny (<details>) ---------- */

export interface DropdownDetailsAnswers {
  triggerLabel: string;
  triggerClass: string;
  alignEnd: boolean;
  items: DropdownItemAnswer[];
}

async function collectDropdownDetailsAnswers(countFlag?: string): Promise<DropdownDetailsAnswers> {
  const triggerLabel = await input({ message: 'Etykieta wyzwalacza:', default: 'Opcje' });
  const triggerClass = await select({ message: 'Kolor wyzwalacza?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-outline-dark' });
  const alignEnd = await confirm({ message: 'Wyrownac menu do prawej krawedzi (.dropdown-menu-end)?', default: false });
  const items = await collectItems(countFlag);
  return { triggerLabel, triggerClass, alignEnd, items };
}

export function renderDropdownDetails(answers: DropdownDetailsAnswers): string {
  return renderStub('dropdown-details.stub.html', {
    TRIGGER_LABEL: answers.triggerLabel,
    // Kolor implikuje juz .btn we frameworku (_buttons.scss, "IMPLIKACJA
    // .btn") - examples-dropdown.html pisze jeszcze obie klasy jawnie
    // (strona przykladow nie zostala zaktualizowana po tej zmianie), ale
    // generowany kod idzie za aktualnym stanem frameworka, nie za
    // nieaktualnym przykladem.
    TRIGGER_CLASS: answers.triggerClass,
    END_CLASS: answers.alignEnd ? ' dropdown-menu-end' : '',
    ITEMS: renderItems(answers.items),
  });
}

/* ---------- Popover (top layer) ---------- */

export interface DropdownPopoverAnswers {
  triggerLabel: string;
  triggerClass: string;
  alignEnd: boolean;
  /** ID popovera (unikalne na stronie), parowany z popovertarget na przycisku. */
  id: string;
  items: DropdownItemAnswer[];
}

async function collectDropdownPopoverAnswers(countFlag?: string): Promise<DropdownPopoverAnswers> {
  const triggerLabel = await input({ message: 'Etykieta wyzwalacza:', default: 'Opcje ▾' });
  const triggerClass = await select({ message: 'Kolor wyzwalacza?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-outline-dark' });
  const alignEnd = await confirm({ message: 'Wyrownac menu do prawej krawedzi (.dropdown-menu-end)?', default: false });
  const id = await input({ message: 'ID menu (unikalne na stronie, parowane z popovertarget):', default: 'dropdownMenu1' });
  const items = await collectItems(countFlag);
  return { triggerLabel, triggerClass, alignEnd, id, items };
}

export function renderDropdownPopover(answers: DropdownPopoverAnswers): string {
  return renderStub('dropdown-popover.stub.html', {
    TRIGGER_LABEL: answers.triggerLabel,
    TRIGGER_CLASS: answers.triggerClass,
    END_CLASS: answers.alignEnd ? ' dropdown-menu-end' : '',
    ID: answers.id,
    ITEMS: renderItems(answers.items),
  });
}

/* ---------- Dispatch ---------- */

export type DropdownAnswers =
  | ({ type: 'details' } & DropdownDetailsAnswers)
  | ({ type: 'popover' } & DropdownPopoverAnswers);

function renderDropdown(answers: DropdownAnswers): string {
  return answers.type === 'details' ? renderDropdownDetails(answers) : renderDropdownPopover(answers);
}

async function collectDropdownAnswers(countFlag?: string): Promise<DropdownAnswers> {
  const variant = await select({
    message: 'Ktory wariant dropdownu?',
    choices: [
      { name: 'Klasyczny (<details>, dla navbara)', value: 'details' },
      { name: 'Popover - top layer (zalecany poza navbarem: tabele, karty, modale)', value: 'popover' },
    ],
    default: 'popover',
  });

  if (variant === 'details') return { type: 'details', ...(await collectDropdownDetailsAnswers(countFlag)) };
  return { type: 'popover', ...(await collectDropdownPopoverAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeDropdownCommand(program: Command): void {
  program
    .command('make:dropdown')
    .description('Interaktywny generator menu rozwijanego (Klasyczny <details> / Popover top layer) (aliasy: zrob:rozwijane, mache:dropdown)')
    .option('-n, --count <liczba>', 'Liczba pozycji w menu - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt DropdownAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<DropdownAnswers>(opts);
      const answers = provided ?? (await collectDropdownAnswers(opts.count));
      const html = renderDropdown(answers);
      await outputResult(html, `components/dropdown-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
