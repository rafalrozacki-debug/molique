/**
 * molique-jit - `make:pagination` (Scaffolding)
 *
 * Markup verified against css/scss/components/_pagination.scss
 * (.pagination > .page-item.is-active/.is-disabled > .page-link; the
 * `.pagination-modern` variant is added ALONGSIDE `.pagination`, not
 * instead of it) and src/examples-pagination.html (Previous/Next as
 * regular `.page-item`, disabled when at the edge of the page range).
 *
 * `totalPages` is capped at 12 - the real component has no
 * truncation/ellipsis (`...`) pattern for a large number of pages, so
 * generating dozens of numbers would be unrealistic; 12 is a reasonable
 * ceiling for a single, flat page bar.
 */

import type { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface PaginationAnswers {
  /** .pagination-modern - separated, rounded tiles instead of a joined bar. */
  modern: boolean;
  totalPages: number;
  /** 1-based. */
  currentPage: number;
  prevLabel: string;
  nextLabel: string;
}

export async function collectPaginationAnswers(countFlag?: string): Promise<PaginationAnswers> {
  const modern = await confirm({
    message: 'Modern variant (separated tiles, .pagination-modern)?',
    default: false,
  });

  const totalPages = await promptCount({
    message: 'How many pages in total?',
    default: '5',
    min: 1,
    max: 12,
    flagValue: countFlag,
  });

  const currentPageStr = await input({
    message: 'Which page is currently active?',
    default: '1',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= totalPages) || `Enter a number from 1 to ${totalPages}.`;
    },
  });

  const prevLabel = await input({ message: '"Previous page" label:', default: 'Previous' });
  const nextLabel = await input({ message: '"Next page" label:', default: 'Next' });

  return { modern, totalPages, currentPage: Number(currentPageStr), prevLabel, nextLabel };
}

export function renderPagination(answers: PaginationAnswers): string {
  const { modern, totalPages, currentPage, prevLabel, nextLabel } = answers;

  const items: Array<{ LABEL: string; ITEM_CLASS: string }> = [];
  items.push({ LABEL: prevLabel, ITEM_CLASS: currentPage === 1 ? ' is-disabled' : '' });
  for (let i = 1; i <= totalPages; i++) {
    items.push({ LABEL: String(i), ITEM_CLASS: i === currentPage ? ' is-active' : '' });
  }
  items.push({ LABEL: nextLabel, ITEM_CLASS: currentPage === totalPages ? ' is-disabled' : '' });

  const ITEMS = renderList('_pagination-item.stub.html', items);
  const MODERN_CLASS = modern ? ' pagination-modern' : '';
  return renderStub('pagination.stub.html', { MODERN_CLASS, ITEMS });
}

export function registerMakePaginationCommand(program: Command): void {
  program
    .command('make:pagination')
    .description('Interactive pagination generator (Classic / Modern) (aliases: zrob:paginacje, mache:seitenzahlen)')
    .option('-n, --count <number>', 'Total number of pages - skips this one question')
    .option('--answers <json>', 'Answers as JSON (PaginationAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<PaginationAnswers>(opts);
      const answers = provided ?? (await collectPaginationAnswers(opts.count));
      const html = renderPagination(answers);
      await outputResult(html, 'components/pagination.html', provided ? { out: opts.out } : undefined);
    });
}
