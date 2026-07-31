/**
 * molique-jit - `make:breadcrumb` (Scaffolding)
 *
 * Markup verified against css/scss/components/_breadcrumbs.scss
 * (.breadcrumb > .breadcrumb-item, the "/" separator purely via CSS
 * through `.breadcrumb-item + .breadcrumb-item::before`, the current
 * position via `.is-active` + `aria-current="page"`).
 *
 * `.breadcrumb` does NOT HAVE its own `examples-*.html` page (the only
 * real usage is the Hero Simple variant in
 * src/examples-hero-sections.html, where the links are `text-white
 * opacity-75` because it sits on a dimmed photo - an unsuitable context
 * for standalone use). The generator uses the default SCSS colors
 * (`.breadcrumb-item a` = var(--primary)), fitting for typical use above
 * a page title, not over a photo - it does, however, reuse the SAME
 * `_breadcrumb-item.stub.html` already used by `make:layout` (Hero
 * Simple), because the list item itself is generic (INNER is ready-made
 * HTML, computed separately per context).
 *
 * The `<nav aria-label="breadcrumb"><ol class="breadcrumb">` wrapper - the
 * WAI-ARIA "breadcrumb" pattern, the same one already used by
 * layout-hero-simple.stub.html.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface BreadcrumbAnswers {
  /** In order - the LAST one is the current page (auto .is-active + aria-current), its href is ignored. */
  items: Array<{ label: string; href: string }>;
}

export async function collectBreadcrumbAnswers(countFlag?: string): Promise<BreadcrumbAnswers> {
  const count = await promptCount({
    message: 'How many breadcrumb items (including the current page)?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const items: BreadcrumbAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    const label = await input({ message: `  Item ${i} label${isLast ? ' (current page)' : ''}:`, default: isLast ? 'Current page' : `Step ${i}` });
    const href = isLast ? '' : await input({ message: `  Item ${i} link:`, default: '#' });
    items.push({ label, href });
  }

  return { items };
}

export function renderBreadcrumb(answers: BreadcrumbAnswers): string {
  const rendered = answers.items.map((item, i) => {
    const isLast = i === answers.items.length - 1;
    return {
      ITEM_CLASS: ['breadcrumb-item', isLast ? 'is-active' : ''].filter(Boolean).join(' '),
      ARIA_CURRENT_ATTR: isLast ? ' aria-current="page"' : '',
      INNER: isLast ? item.label : `<a href="${item.href}">${item.label}</a>`,
    };
  });
  const ITEMS = renderList('_breadcrumb-item.stub.html', rendered);
  return renderStub('breadcrumb.stub.html', { ITEMS });
}

export function registerMakeBreadcrumbCommand(program: Command): void {
  program
    .command('make:breadcrumb')
    .description('Interactive breadcrumb navigation (.breadcrumb) generator (aliases: zrob:okruszki, mache:brotkrumen)')
    .option('-n, --count <number>', 'Number of items - skips this one question')
    .option('--answers <json>', 'Answers as JSON (BreadcrumbAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<BreadcrumbAnswers>(opts);
      const answers = provided ?? (await collectBreadcrumbAnswers(opts.count));
      const html = renderBreadcrumb(answers);
      await outputResult(html, 'components/breadcrumb.html', provided ? { out: opts.out } : undefined);
    });
}
