/**
 * molique-jit - `make:table` (Scaffolding)
 *
 * Markup verified against css/scss/components/_tables.scss (size/header/
 * mobile-card classes, the data-label mechanism via
 * `content: attr(data-label)`) and src/examples-tables.html (the real
 * layout: .table-wrapper > table.table[...] > thead[.thead-*] + tbody,
 * the first column bolded as the row identifier).
 *
 * The first generator using NESTED renderList(): a row is a list of
 * cells (_table-cell), a table is a list of rows (_table-row), where each
 * row is itself already the result of an earlier renderList() over the
 * cells. Zero loops/conditionals in the stubs - both loops (columns x
 * rows) live in TypeScript.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * `collectTableAnswers()` contains ONLY the questions, `renderTable()` is
 * pure and synchronous - it's the one under test
 * (tools/jit/tests/scaffolding-table.test.mjs) and the one called
 * directly by non-interactive mode (`--answers`/`--answers-file`).
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface TableAnswers {
  columns: string[];
  rowCount: number;
  size: '' | 'table-sm' | 'table-lg';
  theadVariant: '' | 'thead-light' | 'thead-dark' | 'thead-primary';
  striped: boolean;
  hover: boolean;
  mobileMode: 'table-cards' | 'table-cards-always' | '';
}

export async function collectTableAnswers(countFlag?: string): Promise<TableAnswers> {
  const columnsLine = await input({
    message: 'Column names (comma-separated):',
    default: 'Name, Status, Date, Amount',
  });
  const columns = columnsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const rowCount = await promptCount({
    message: 'How many sample rows to generate?',
    default: '3',
    min: 0,
    max: 20,
    flagValue: countFlag,
  });

  const size = await select({
    message: 'Table size?',
    choices: [
      { name: 'Small (compact)', value: 'table-sm' },
      { name: 'Medium (default)', value: '' },
      { name: 'Large (roomy)', value: 'table-lg' },
    ],
    default: '',
  });

  const theadVariant = await select({
    message: 'Header variant?',
    choices: [
      { name: 'Default', value: '' },
      { name: 'Light (thead-light)', value: 'thead-light' },
      { name: 'Dark (thead-dark)', value: 'thead-dark' },
      { name: 'Primary (thead-primary)', value: 'thead-primary' },
    ],
    default: '',
  });

  const striped = await confirm({ message: 'Zebra stripes (alternating row background)?', default: false });
  const hover = await confirm({ message: 'Highlight the row on hover?', default: true });

  const mobileMode = await select({
    message: 'Mobile mode?',
    choices: [
      { name: 'Auto Cards (cards only below ~576px)', value: 'table-cards' },
      { name: 'Always cards (on desktop too)', value: 'table-cards-always' },
      { name: 'Classic horizontal scroll (no cards)', value: '' },
    ],
    default: 'table-cards',
  });

  return { columns, rowCount, size, theadVariant, striped, hover, mobileMode };
}

export function renderTable(answers: TableAnswers): string {
  const { columns, rowCount, size, theadVariant, striped, hover, mobileMode } = answers;

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

  return renderStub('table.stub.html', { TABLE_CLASS, THEAD_CLASS_ATTR, HEADER_CELLS, ROWS });
}

export function registerMakeTableCommand(program: Command): void {
  program
    .command('make:table')
    .description('Interactive B2B table generator with automatic mobile data-label (aliases: zrob:tabele, mache:tabelle)')
    .option('-n, --count <number>', 'Number of sample rows - skips this one question, the rest stays interactive')
    .option('--answers <json>', 'Answers as JSON (TableAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file - otherwise we ask interactively)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TableAnswers>(opts);
      const answers = provided ?? (await collectTableAnswers(opts.count));
      const html = renderTable(answers);
      await outputResult(html, 'components/table.html', provided ? { out: opts.out } : undefined);
    });
}
