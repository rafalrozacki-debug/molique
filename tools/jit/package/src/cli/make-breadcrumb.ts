/**
 * molique-jit - `make:breadcrumb` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_breadcrumbs.scss
 * (.breadcrumb > .breadcrumb-item, separator "/" czysto w CSS przez
 * `.breadcrumb-item + .breadcrumb-item::before`, pozycja biezaca
 * `.is-active` + `aria-current="page"`).
 *
 * `.breadcrumb` NIE MA wlasnej strony `examples-*.html` (jedyne realne
 * uzycie to wariant Hero Simple w src/examples-hero-sections.html, gdzie
 * linki sa `text-white opacity-75` bo lezy na przyciemnionym zdjeciu -
 * kontekst niewlasciwy dla samodzielnego uzycia). Generator uzywa
 * domyslnych kolorow z SCSS (`.breadcrumb-item a` = var(--primary)),
 * pasujacych do typowego uzycia nad tytulem strony, nie na zdjeciu -
 * reuzywa jednak TEGO SAMEGO `_breadcrumb-item.stub.html`, ktorego uzywa
 * juz `make:layout` (Hero Simple), bo sam element listy jest generyczny
 * (INNER to gotowe HTML, wyliczane osobno per kontekst).
 *
 * Wrapper `<nav aria-label="breadcrumb"><ol class="breadcrumb">` - wzorzec
 * WAI-ARIA "breadcrumb", ten sam, ktorego juz uzywa layout-hero-simple.stub.html.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface BreadcrumbAnswers {
  /** W kolejnosci - OSTATNIA to biezaca strona (auto .is-active + aria-current), href ostatniej jest ignorowany. */
  items: Array<{ label: string; href: string }>;
}

export async function collectBreadcrumbAnswers(countFlag?: string): Promise<BreadcrumbAnswers> {
  const count = await promptCount({
    message: 'Ile pozycji w breadcrumb (wliczajac biezaca strone)?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const items: BreadcrumbAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    const label = await input({ message: `  Etykieta pozycji ${i}${isLast ? ' (biezaca strona)' : ''}:`, default: isLast ? 'Biezaca strona' : `Krok ${i}` });
    const href = isLast ? '' : await input({ message: `  Link pozycji ${i}:`, default: '#' });
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
    .description('Interaktywny generator nawigacji okruszkowej (.breadcrumb) (aliasy: zrob:okruszki, mache:brotkrumen)')
    .option('-n, --count <liczba>', 'Liczba pozycji - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt BreadcrumbAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<BreadcrumbAnswers>(opts);
      const answers = provided ?? (await collectBreadcrumbAnswers(opts.count));
      const html = renderBreadcrumb(answers);
      await outputResult(html, 'components/breadcrumb.html', provided ? { out: opts.out } : undefined);
    });
}
