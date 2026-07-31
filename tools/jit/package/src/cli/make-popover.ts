/**
 * molique-jit - `make:popover` (Scaffolding)
 *
 * Markup verified against css/scss/components/_context-menu.scss
 * (.popover-context - CSS Anchor Positioning + Popover API, auto-flip
 * when near the bottom edge is handled by
 * js/modules/molique-context-menu.js, on mobile it automatically
 * degrades to a bottom sheet - zero extra markup for that) and real
 * usage in src/examples-context-menu.html.
 *
 * IMPORTANT: `.popover-context` is used across the WHOLE repo ONLY on
 * one dedicated examples page - there's no documented pairing with e.g.
 * `.btn-action` (a ghost button in tables), so the generator sticks
 * exactly to what the real example shows: a plain `<button
 * class="btn-{color}">`. The color class already implies `.btn` in the
 * framework (see `_buttons.scss`, "the .btn implication") - the base
 * class is NOT added separately.
 *
 * Anchor: the real markup separates the `id` (on the popover, paired
 * with `popovertarget`) from the named CSS anchor (`anchor-name` on the
 * button / `position-anchor` on the popover) - these are TWO different
 * values (`id="ctxMenu1"` vs `anchor-name: --btn-ctx-1`). Here
 * ANCHOR_NAME is derived automatically from the ID (`--anchor-{id}`), so
 * as not to ask for a second value the user has no real choice about
 * anyway - it only needs to be unique and consistent between the button
 * and the popover, which automatic derivation guarantees.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * `PopoverAnswers` holds RAW data (icon name, the `danger` flag), not
 * ready-made HTML fragments - those (ICON_HTML, DANGER_CLASS, the
 * dividing <hr>) are computed inside the pure `renderPopover()`.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

const TRIGGER_COLOR_CHOICES = [
  { name: 'Secondary (default)', value: 'btn-secondary' },
  { name: 'Primary', value: 'btn-primary' },
  { name: 'Light', value: 'btn-light' },
  // .btn-outline-soft BY ITSELF has no color of its own - it's a
  // modifier nested in SCSS inside EVERY .btn-outline-<color> (a
  // softened border/hover), not a standalone class. The previous version
  // of this choice (`'btn-outline-soft'` as a single value) produced a
  // button with no real color at all - fixed by pairing it with primary.
  { name: 'Outline (soft)', value: 'btn-outline-primary btn-outline-soft' },
] as const;

export interface PopoverItemAnswer {
  label: string;
  /** Icon name from img/icons-sprite.svg (without "#"), empty = no icon. */
  icon: string;
  /** A destructive action (e.g. "Delete") - gets .text-danger and a dividing <hr> before it. */
  danger: boolean;
}

export interface PopoverAnswers {
  triggerLabel: string;
  triggerColor: 'btn-secondary' | 'btn-primary' | 'btn-light' | 'btn-outline-primary btn-outline-soft';
  /** Icon next to the button, empty = no icon. */
  triggerIcon: string;
  /** Popover ID (unique on the page) - ANCHOR_NAME is derived from it automatically. */
  id: string;
  items: PopoverItemAnswer[];
}

function iconHtml(icon: string): string {
  return icon ? `<svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#${icon}"></use></svg> ` : '';
}

export async function collectPopoverAnswers(countFlag?: string): Promise<PopoverAnswers> {
  const triggerLabel = await input({ message: 'Trigger button label:', default: 'Options' });
  const triggerColor = await select({ message: 'Button color?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-secondary' });
  const addTriggerIcon = await confirm({ message: 'Add an icon next to the button?', default: true });
  const triggerIcon = addTriggerIcon
    ? await input({ message: '  Icon name (without "#", from img/icons-sprite.svg):', default: 'ph-gear' })
    : '';

  const id = await input({ message: 'Popover ID (unique on the page):', default: 'ctxMenu1' });

  const count = await promptCount({
    message: 'How many menu items?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const items: PopoverItemAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Item ${i} label:`, default: i === 1 ? 'View' : `Action ${i}` });
    const icon = await input({
      message: `  Item ${i} icon (name from img/icons-sprite.svg, empty = none):`,
      default: i === 1 ? 'ph-eye' : '',
    });
    const danger = await confirm({ message: `  Is item ${i} a destructive action (e.g. Delete)?`, default: false });
    items.push({ label, icon, danger });
  }

  return { triggerLabel, triggerColor, triggerIcon, id, items };
}

export function renderPopover(answers: PopoverAnswers): string {
  const { triggerLabel, triggerColor, triggerIcon, id, items } = answers;

  const ANCHOR_NAME = `--anchor-${id}`;
  const TRIGGER_CLASS = triggerColor;
  const TRIGGER_CONTENT = [triggerLabel, triggerIcon ? iconHtml(triggerIcon).trim() : ''].filter(Boolean).join(' ');

  // The dividing <hr> appears in the real example EXACTLY once, right
  // before the first destructive action (unless it's the very first item
  // - then there's nothing to separate).
  const itemBlocks: string[] = [];
  let dividerInserted = false;
  items.forEach((item, i) => {
    if (item.danger && i > 0 && !dividerInserted) {
      itemBlocks.push('    <hr class="modal-divider my-1" />');
      dividerInserted = true;
    }
    itemBlocks.push(
      renderStub('_popover-action-item.stub.html', {
        LABEL: item.label,
        ICON_HTML: iconHtml(item.icon),
        DANGER_CLASS: item.danger ? ' text-danger' : '',
      }).trimEnd()
    );
  });
  const ITEMS = itemBlocks.join('\n');

  return renderStub('popover-context.stub.html', { TRIGGER_CLASS, ID: id, ANCHOR_NAME, TRIGGER_CONTENT, ITEMS });
}

export function registerMakePopoverCommand(program: Command): void {
  program
    .command('make:popover')
    .description(
      'Interactive context menu generator (.popover-context - CSS Anchor Positioning, auto-flip, ' +
        'bottom sheet on mobile) (aliases: zrob:popover, mache:popover)'
    )
    .option('-n, --count <number>', 'Number of menu items - skips this one question')
    .option('--answers <json>', 'Answers as JSON (PopoverAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<PopoverAnswers>(opts);
      const answers = provided ?? (await collectPopoverAnswers(opts.count));
      const html = renderPopover(answers);
      await outputResult(html, 'components/popover-context.html', provided ? { out: opts.out } : undefined);
    });
}
