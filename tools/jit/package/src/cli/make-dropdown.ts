/**
 * molique-jit - `make:dropdown` (Scaffolding)
 *
 * Markup verified against css/scss/components/_dropdown.scss (two
 * INDEPENDENT opening mechanisms - `<details class="dropdown">` +
 * `<summary class="dropdown-toggle">` classically, AND any button with
 * `popovertarget` + `.dropdown-menu[popover]` as the recommended variant
 * outside a navbar, top layer, not clipped by overflow) and real usage in
 * src/examples-dropdown.html. Two STRUCTURALLY different versions
 * (different trigger: <details>/<summary> vs a plain <button>), so two
 * separate stubs - the same rule as in make:layout for Hero Simple/Cutout.
 *
 * `.dropdown-menu-end` (right alignment) behaves identically in both
 * variants, so it's a shared `alignEnd` field in both answer types.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

const TRIGGER_COLOR_CHOICES = [
  { name: 'Outline Dark (default, as in the example)', value: 'btn-outline-dark' },
  { name: 'Primary', value: 'btn-primary' },
  { name: 'Secondary', value: 'btn-secondary' },
  { name: 'Light', value: 'btn-light' },
] as const;

export interface DropdownItemAnswer {
  label: string;
  /** A destructive action (e.g. "Delete") - gets .text-danger. */
  danger: boolean;
}

async function collectItems(countFlag?: string): Promise<DropdownItemAnswer[]> {
  const count = await promptCount({
    message: 'How many menu items?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const items: DropdownItemAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Item ${i} label:`, default: i === 1 ? 'Edit' : `Item ${i}` });
    const danger = await confirm({ message: `  Is item ${i} a destructive action (e.g. Delete)?`, default: false });
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

/* ---------- Classic (<details>) ---------- */

export interface DropdownDetailsAnswers {
  triggerLabel: string;
  triggerClass: string;
  alignEnd: boolean;
  items: DropdownItemAnswer[];
}

async function collectDropdownDetailsAnswers(countFlag?: string): Promise<DropdownDetailsAnswers> {
  const triggerLabel = await input({ message: 'Trigger label:', default: 'Options' });
  const triggerClass = await select({ message: 'Trigger color?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-outline-dark' });
  const alignEnd = await confirm({ message: 'Align the menu to the right edge (.dropdown-menu-end)?', default: false });
  const items = await collectItems(countFlag);
  return { triggerLabel, triggerClass, alignEnd, items };
}

export function renderDropdownDetails(answers: DropdownDetailsAnswers): string {
  return renderStub('dropdown-details.stub.html', {
    TRIGGER_LABEL: answers.triggerLabel,
    // The color already implies .btn in the framework (_buttons.scss,
    // "the .btn implication") - examples-dropdown.html still writes both
    // classes explicitly (the examples page wasn't updated after this
    // change), but the generated code follows the framework's current
    // state, not the stale example.
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
  /** Popover ID (unique on the page), paired with popovertarget on the button. */
  id: string;
  items: DropdownItemAnswer[];
}

async function collectDropdownPopoverAnswers(countFlag?: string): Promise<DropdownPopoverAnswers> {
  const triggerLabel = await input({ message: 'Trigger label:', default: 'Options ▾' });
  const triggerClass = await select({ message: 'Trigger color?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-outline-dark' });
  const alignEnd = await confirm({ message: 'Align the menu to the right edge (.dropdown-menu-end)?', default: false });
  const id = await input({ message: 'Menu ID (unique on the page, paired with popovertarget):', default: 'dropdownMenu1' });
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
    message: 'Which dropdown variant?',
    choices: [
      { name: 'Classic (<details>, for a navbar)', value: 'details' },
      { name: 'Popover - top layer (recommended outside a navbar: tables, cards, modals)', value: 'popover' },
    ],
    default: 'popover',
  });

  if (variant === 'details') return { type: 'details', ...(await collectDropdownDetailsAnswers(countFlag)) };
  return { type: 'popover', ...(await collectDropdownPopoverAnswers(countFlag)) };
}

/* ---------- Command registration ---------- */

export function registerMakeDropdownCommand(program: Command): void {
  program
    .command('make:dropdown')
    .description('Interactive dropdown menu generator (Classic <details> / Popover top layer) (aliases: zrob:rozwijane, mache:dropdown)')
    .option('-n, --count <number>', 'Number of menu items - skips this one question')
    .option('--answers <json>', 'Answers as JSON (DropdownAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<DropdownAnswers>(opts);
      const answers = provided ?? (await collectDropdownAnswers(opts.count));
      const html = renderDropdown(answers);
      await outputResult(html, `components/dropdown-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
