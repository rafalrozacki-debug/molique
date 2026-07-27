/**
 * molique-jit - `make:pagination` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_pagination.scss
 * (.pagination > .page-item.is-active/.is-disabled > .page-link; wariant
 * `.pagination-modern` dodany OBOK `.pagination`, nie zamiast) oraz
 * src/examples-pagination.html (Poprzednia/Nastepna jako zwykle
 * `.page-item`, disabled gdy na skraju zakresu stron).
 *
 * `totalPages` ograniczone do 12 - realny komponent nie ma wzorca
 * obcinania/elipsy (`...`) dla duzej liczby stron, wiec generowanie
 * dziesiatek numerow byloby nierealistyczne; 12 to rozsadny sufit dla
 * pojedynczego, plaskiego paska stron.
 */

import type { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface PaginationAnswers {
  /** .pagination-modern - oddzielone, zaokraglone kafelki zamiast zlaczonego paska. */
  modern: boolean;
  totalPages: number;
  /** 1-based. */
  currentPage: number;
  prevLabel: string;
  nextLabel: string;
}

export async function collectPaginationAnswers(countFlag?: string): Promise<PaginationAnswers> {
  const modern = await confirm({
    message: 'Wariant Nowoczesny (oddzielone kafelki, .pagination-modern)?',
    default: false,
  });

  const totalPages = await promptCount({
    message: 'Ile stron w sumie?',
    default: '5',
    min: 1,
    max: 12,
    flagValue: countFlag,
  });

  const currentPageStr = await input({
    message: 'Ktora strona jest aktualnie aktywna?',
    default: '1',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= totalPages) || `Podaj liczbe od 1 do ${totalPages}.`;
    },
  });

  const prevLabel = await input({ message: 'Etykieta "poprzednia strona":', default: 'Poprzednia' });
  const nextLabel = await input({ message: 'Etykieta "nastepna strona":', default: 'Nastepna' });

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
    .description('Interaktywny generator paginacji (Klasyczna / Nowoczesna) (aliasy: zrob:paginacje, mache:seitenzahlen)')
    .option('-n, --count <liczba>', 'Liczba stron w sumie - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt PaginationAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<PaginationAnswers>(opts);
      const answers = provided ?? (await collectPaginationAnswers(opts.count));
      const html = renderPagination(answers);
      await outputResult(html, 'components/pagination.html', provided ? { out: opts.out } : undefined);
    });
}
