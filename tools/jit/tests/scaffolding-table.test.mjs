/**
 * molique-jit - `make:table` tests (Stage B.1)
 *
 * Tests renderTable() (a pure function from
 * tools/jit/package/src/cli/make-table.ts, compiled to
 * dist/cli/make-table.js) - no prompts, exactly like the manual
 * verification done while building this generator.
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTable } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-table.js')).href
);

test('make:table - default settings (hover + mobile cards, no zebra stripes)', () => {
  const html = renderTable({
    columns: ['Name', 'Status'],
    rowCount: 2,
    size: '',
    theadVariant: '',
    striped: false,
    hover: true,
    mobileMode: 'table-cards',
  });
  assert.match(html, /class="table[^"]*table-hover[^"]*table-cards"/);
  assert.doesNotMatch(html, /table-striped/);
  assert.match(html, /<th>Name<\/th>/);
  assert.match(html, /<th>Status<\/th>/);
  assert.equal((html.match(/<td /g) ?? []).length, 4); // 2 columns x 2 rows
  assert.match(html, /data-label="Name" class="fw-bold">Name 1</);
  assert.match(html, /data-label="Status">Status 1</);
});

test('make:table - zebra stripes + thead-dark + size sm', () => {
  const html = renderTable({
    columns: ['A'],
    rowCount: 1,
    size: 'table-sm',
    theadVariant: 'thead-dark',
    striped: true,
    hover: false,
    mobileMode: '',
  });
  assert.match(html, /class="table table-sm table-striped"/);
  assert.match(html, /<thead class="thead-dark">/);
});

test('make:table - a thead without a variant gets no class attribute', () => {
  const html = renderTable({
    columns: ['A'],
    rowCount: 1,
    size: '',
    theadVariant: '',
    striped: false,
    hover: false,
    mobileMode: '',
  });
  assert.match(html, /<thead>/);
  assert.doesNotMatch(html, /<thead class=/);
});

test('make:table - rowCount 0 yields an empty tbody, no error', () => {
  const html = renderTable({
    columns: ['A'],
    rowCount: 0,
    size: '',
    theadVariant: '',
    striped: false,
    hover: false,
    mobileMode: '',
  });
  assert.doesNotMatch(html, /<td/); // no data rows - the header uses <th>, not <td>
  assert.match(html, /<tbody>/);
});

test('make:table - only the first column gets class="fw-bold"', () => {
  const html = renderTable({
    columns: ['First', 'Second', 'Third'],
    rowCount: 1,
    size: '',
    theadVariant: '',
    striped: false,
    hover: false,
    mobileMode: '',
  });
  assert.match(html, /data-label="First" class="fw-bold">First 1</);
  assert.match(html, /data-label="Second">Second 1</);
  assert.doesNotMatch(html, /data-label="Second" class="fw-bold"/);
});
