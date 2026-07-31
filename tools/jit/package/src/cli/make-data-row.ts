/**
 * molique-jit - `make:data-row` (Scaffolding)
 *
 * Markup verified against css/scss/components/_data-rows.scss (.data-row
 * - CSS Grid, 5 columns: 2fr 1fr 1fr 1fr auto, its own margin-bottom -
 * does NOT need any wrapper, rows stack one below the other as regular
 * block elements) and css/scss/components/_data-row-compact.scss
 * (.data-row-compact - Flexbox, separation via border-bottom +
 * :last-child { border-bottom: none } - REQUIRES a shared parent for
 * :last-child to work) and src/examples-data-rows.html.
 *
 * Two INDEPENDENT sections in the real example ('.data-row' and
 * '.data-row-compact'), hence two STRUCTURALLY different variants (a
 * "type" field, flattened like in make:card/make:timeline/make:carousel).
 *
 * TWO FIXES relative to the real example (the same discipline as
 * make:carousel - we fix confirmed independent bugs, not replicate
 * them):
 * 1. Icons in the "Compact Rows" section use `class="icon-file-text"`/
 *    `class="icon-x"` - an old icon font system that does NOT EXIST
 *    anywhere in the framework's SCSS (no @font-face or ".icon-*" rule
 *    for these classes at all - confirmed by grep). This is exactly
 *    parallel to "btn btn-primary" - a forgotten migration to the
 *    current system
 *    (<svg class="icon"><use href="img/icons-sprite.svg#ph-..."></use></svg>),
 *    which the generator applies consistently everywhere else (cards,
 *    lightbox, carousel, timeline). The generator uses THIS system.
 * 2. The action button in the same section has helper text in
 *    `class="text-muted text-4 m-r-2"` - "m-r-2" does NOT EXIST in
 *    _spacing.scss (the correct class is "mr-2", without the extra
 *    hyphen - confirmed by grepping utilities/_spacing.scss). The
 *    generator uses "mr-2".
 * Additionally: `class="btn btn-action ..."` in the same section has a
 * redundant "btn " prefix - .btn-action has its OWN, complete definition
 * in _buttons.scss (its own appearance/background/border/padding), it
 * never needed the base .btn (unlike .btn-outline-soft, which WAS a pure
 * modifier) - the first section of the same file (".data-row") already
 * shows the correct "btn-action" without the prefix, the generator stays
 * consistent with it.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- .data-row (Grid, CRM) ---------- */

type StatusState = 'draft' | 'pending' | 'done' | 'danger';

const STATUS_CHOICES = [
  { name: 'Draft', value: 'draft' },
  { name: 'Pending', value: 'pending' },
  { name: 'Done', value: 'done' },
  { name: 'Danger', value: 'danger' },
] as const;

export interface DataRowGridAnswers {
  rows: Array<{
    title: string;
    subtitle: string;
    value: string;
    statusText: string;
    statusState: StatusState;
    /** Action button labels - when > 1, the LAST one automatically gets text-danger (the Edit/Delete pattern from the real example). */
    actionLabels: string[];
  }>;
}

async function collectDataRowGridAnswers(countFlag?: string): Promise<DataRowGridAnswers> {
  const count = await promptCount({ message: 'How many rows?', default: '2', min: 1, max: 20, flagValue: countFlag });

  const rows: DataRowGridAnswers['rows'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Row ${i} title:`, default: `Item ${i}` });
    const subtitle = await input({ message: `  Row ${i} subtitle/parameters:`, default: 'Subtitle' });
    const value = await input({ message: `  Row ${i} value (e.g. price):`, default: '$0' });
    const statusText = await input({ message: `  Row ${i} status text:`, default: 'Draft' });
    const statusState = await select<StatusState>({ message: `  Row ${i} status state?`, choices: STATUS_CHOICES, default: 'draft' });
    const actionsLine = await input({
      message: `  Row ${i} action labels (comma-separated, last one = red):`,
      default: 'Edit, Delete',
    });
    const actionLabels = actionsLine.split(',').map((s) => s.trim()).filter(Boolean);
    rows.push({ title, subtitle, value, statusText, statusState, actionLabels });
  }

  return { rows };
}

export function renderDataRowGrid(answers: DataRowGridAnswers): string {
  const items = answers.rows.map((row) => {
    const ACTIONS = renderList(
      '_data-row-action.stub.html',
      row.actionLabels.map((label, i) => ({
        LABEL: label,
        DANGER_CLASS: row.actionLabels.length > 1 && i === row.actionLabels.length - 1 ? ' text-danger' : '',
      }))
    );
    return {
      TITLE: row.title,
      SUBTITLE: row.subtitle,
      VALUE: row.value,
      STATUS_STATE: row.statusState,
      STATUS_TEXT: row.statusText,
      ACTIONS,
    };
  });
  return renderList('_data-row-item.stub.html', items);
}

/* ---------- .data-row-compact (Flex, List Item) ---------- */

type RowIconColor = '' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

const ICON_COLOR_CHOICES = [
  { name: 'Default (var(--bg-body), no color)', value: '' },
  { name: 'Primary', value: 'primary' },
  { name: 'Secondary', value: 'secondary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
  { name: 'Dark', value: 'dark' },
] as const;

export interface DataRowCompactAnswers {
  items: Array<{
    icon: string;
    iconColor: RowIconColor;
    iconSquare: boolean;
    title: string;
    details: string;
    /** Helper text before the action button (e.g. "Can view"), '' = none. */
    leadingText: string;
    actionIcon: string;
    actionAriaLabel: string;
  }>;
}

async function collectDataRowCompactAnswers(countFlag?: string): Promise<DataRowCompactAnswers> {
  const count = await promptCount({ message: 'How many compact rows?', default: '2', min: 1, max: 20, flagValue: countFlag });

  const items: DataRowCompactAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const icon = await input({ message: `  Row ${i} icon name (from img/icons-sprite.svg):`, default: 'ph-file-text' });
    const iconColor = await select<RowIconColor>({ message: `  Row ${i} icon background color?`, choices: ICON_COLOR_CHOICES, default: '' });
    const iconSquare = await confirm({ message: `  Square icon for row ${i} (instead of round)?`, default: false });
    const title = await input({ message: `  Row ${i} title:`, default: `Item ${i}` });
    const details = await input({ message: `  Row ${i} details:`, default: '' });
    const leadingText = await input({ message: `  Text before row ${i}'s action button (empty = none):`, default: '' });
    const actionIcon = await input({ message: `  Row ${i} action button icon name:`, default: 'ph-trash' });
    const actionAriaLabel = await input({ message: `  Row ${i} action button aria-label:`, default: 'Delete' });
    items.push({ icon, iconColor, iconSquare, title, details, leadingText, actionIcon, actionAriaLabel });
  }

  return { items };
}

export function renderDataRowCompact(answers: DataRowCompactAnswers): string {
  const ITEMS = renderList(
    '_data-row-compact-item.stub.html',
    answers.items.map((item) => ({
      ICON: item.icon,
      ICON_SQUARE_CLASS: item.iconSquare ? ' icon-square' : '',
      ICON_COLOR_CLASS: item.iconColor ? ` bg-${item.iconColor} text-white` : '',
      TITLE: item.title,
      DETAILS: item.details,
      LEADING_TEXT_HTML: item.leadingText ? `\n    <span class="text-muted text-4 mr-2">${item.leadingText}</span>` : '',
      ACTION_ICON: item.actionIcon,
      ACTION_ARIA_LABEL: item.actionAriaLabel,
    }))
  );
  return renderStub('data-row-compact.stub.html', { ITEMS });
}

/* ---------- Dispatch ---------- */

export type DataRowAnswers =
  | ({ type: 'row' } & DataRowGridAnswers)
  | ({ type: 'compact' } & DataRowCompactAnswers);

function renderDataRow(answers: DataRowAnswers): string {
  if (answers.type === 'row') return renderDataRowGrid(answers);
  return renderDataRowCompact(answers);
}

async function collectDataRowAnswers(countFlag?: string): Promise<DataRowAnswers> {
  const type = await select<DataRowAnswers['type']>({
    message: 'Which data row variant?',
    choices: [
      { name: 'Grid row, CRM (.data-row)', value: 'row' },
      { name: 'Compact, list/side panel (.data-row-compact)', value: 'compact' },
    ],
  });

  if (type === 'row') return { type: 'row', ...(await collectDataRowGridAnswers(countFlag)) };
  return { type: 'compact', ...(await collectDataRowCompactAnswers(countFlag)) };
}

/* ---------- Command registration ---------- */

export function registerMakeDataRowCommand(program: Command): void {
  program
    .command('make:data-row')
    .description('Interactive data row generator (Grid CRM / Compact) (aliases: zrob:wiersz-danych, mache:datenzeile)')
    .option('-n, --count <number>', 'Number of rows - skips this one question')
    .option('--answers <json>', 'Answers as JSON (DataRowAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<DataRowAnswers>(opts);
      const answers = provided ?? (await collectDataRowAnswers(opts.count));
      const html = renderDataRow(answers);
      await outputResult(html, `components/data-row-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
