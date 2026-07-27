/**
 * molique-jit - `make:table` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_tables.scss (klasy
 * rozmiaru/naglowka/karty mobilne, mechanizm data-label przez
 * `content: attr(data-label)`) i src/examples-tables.html (realny uklad:
 * .table-wrapper > table.table[...] > thead[.thead-*] + tbody, pierwsza
 * kolumna pogrubiona jako identyfikator wiersza).
 *
 * Pierwszy generator uzywajacy ZAGNIEZDZONEGO renderList(): wiersz to
 * lista komorek (_table-cell), tabela to lista wierszy (_table-row), gdzie
 * kazdy wiersz sam w sobie jest juz wynikiem wczesniejszego renderList()
 * na komorkach. Zero petli/warunkow w stubach - obie petle (kolumny x
 * wiersze) siedza w TypeScript.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';

export function registerMakeTableCommand(program: Command): void {
  program
    .command('make:table')
    .description('Interaktywny generator tabeli B2B z automatycznym data-label na mobile (aliasy: zrob:tabele, mache:tabelle)')
    .option('-n, --count <liczba>', 'Liczba przykladowych wierszy - pomija to jedno pytanie, reszta zostaje interaktywna')
    .action(async (opts: { count?: string }) => {
      const columnsLine = await input({
        message: 'Nazwy kolumn (oddzielone przecinkami):',
        default: 'Nazwa, Status, Data, Kwota',
      });
      const columns = columnsLine
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const rowCount = await promptCount({
        message: 'Ile przykladowych wierszy wygenerowac?',
        default: '3',
        min: 0,
        max: 20,
        flagValue: opts.count,
      });

      const size = await select({
        message: 'Rozmiar tabeli?',
        choices: [
          { name: 'Small (kompaktowa)', value: 'table-sm' },
          { name: 'Medium (domyslna)', value: '' },
          { name: 'Large (luzna)', value: 'table-lg' },
        ],
        default: '',
      });

      const theadVariant = await select({
        message: 'Wariant naglowka?',
        choices: [
          { name: 'Domyslny', value: '' },
          { name: 'Jasny (thead-light)', value: 'thead-light' },
          { name: 'Ciemny (thead-dark)', value: 'thead-dark' },
          { name: 'Primary (thead-primary)', value: 'thead-primary' },
        ],
        default: '',
      });

      const striped = await confirm({ message: 'Paski zebry (naprzemienne tlo wierszy)?', default: false });
      const hover = await confirm({ message: 'Podswietlanie wiersza na hover?', default: true });

      const mobileMode = await select({
        message: 'Tryb mobilny?',
        choices: [
          { name: 'Auto Cards (karty tylko ponizej ~576px)', value: 'table-cards' },
          { name: 'Zawsze karty (rowniez na desktopie)', value: 'table-cards-always' },
          { name: 'Klasyczny poziomy scroll (bez kart)', value: '' },
        ],
        default: 'table-cards',
      });

      const TABLE_CLASS = ['table', size, striped ? 'table-striped' : '', hover ? 'table-hover' : '', mobileMode]
        .filter(Boolean)
        .join(' ');
      const THEAD_CLASS_ATTR = theadVariant ? ` class="${theadVariant}"` : '';

      const HEADER_CELLS = renderList('_table-header-cell.stub.html', columns.map((LABEL) => ({ LABEL })));

      const rows = [];
      for (let r = 1; r <= rowCount; r++) {
        const cells = columns.map((col, i) => ({
          LABEL: col,
          VALUE: `${col} ${r}`,
          CLASS_ATTR: i === 0 ? ' class="fw-bold"' : '',
        }));
        const CELLS = renderList('_table-cell.stub.html', cells);
        rows.push({ CELLS });
      }
      const ROWS = renderList('_table-row.stub.html', rows);

      const html = renderStub('table.stub.html', { TABLE_CLASS, THEAD_CLASS_ATTR, HEADER_CELLS, ROWS });

      await outputResult(html, 'components/table.html');
    });
}
