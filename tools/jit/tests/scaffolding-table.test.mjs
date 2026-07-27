/**
 * molique-jit - testy `make:table` (Etap B.1)
 *
 * Testuje renderTable() (czysta funkcja z tools/jit/package/src/cli/make-table.ts,
 * skompilowana do dist/cli/make-table.js) - bez prompotow, dokladnie tak
 * jak reczna weryfikacja robiona przy budowie tego generatora.
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTable } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-table.js')).href
);

test('make:table - domyslne ustawienia (hover + karty mobile, bez paskow zebry)', () => {
  const html = renderTable({
    columns: ['Nazwa', 'Status'],
    rowCount: 2,
    size: '',
    theadVariant: '',
    striped: false,
    hover: true,
    mobileMode: 'table-cards',
  });
  assert.match(html, /class="table[^"]*table-hover[^"]*table-cards"/);
  assert.doesNotMatch(html, /table-striped/);
  assert.match(html, /<th>Nazwa<\/th>/);
  assert.match(html, /<th>Status<\/th>/);
  assert.equal((html.match(/<td /g) ?? []).length, 4); // 2 kolumny x 2 wiersze
  assert.match(html, /data-label="Nazwa" class="fw-bold">Nazwa 1</);
  assert.match(html, /data-label="Status">Status 1</);
});

test('make:table - paski zebry + thead-dark + rozmiar sm', () => {
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

test('make:table - thead bez wariantu nie dostaje atrybutu class', () => {
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

test('make:table - rowCount 0 daje pusty tbody, bez bledu', () => {
  const html = renderTable({
    columns: ['A'],
    rowCount: 0,
    size: '',
    theadVariant: '',
    striped: false,
    hover: false,
    mobileMode: '',
  });
  assert.doesNotMatch(html, /<td/); // brak wierszy danych - naglowek uzywa <th>, nie <td
  assert.match(html, /<tbody>/);
});

test('make:table - tylko pierwsza kolumna dostaje class="fw-bold"', () => {
  const html = renderTable({
    columns: ['Pierwsza', 'Druga', 'Trzecia'],
    rowCount: 1,
    size: '',
    theadVariant: '',
    striped: false,
    hover: false,
    mobileMode: '',
  });
  assert.match(html, /data-label="Pierwsza" class="fw-bold">Pierwsza 1</);
  assert.match(html, /data-label="Druga">Druga 1</);
  assert.doesNotMatch(html, /data-label="Druga" class="fw-bold"/);
});
