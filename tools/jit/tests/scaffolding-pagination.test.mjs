/**
 * molique-jit - testy `make:pagination` (Etap C.4 - ostatnia z pierwszej fali)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPagination } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-pagination.js')).href
);

test('make:pagination - strona 1: "Poprzednia" disabled, "1" aktywna', () => {
  const html = renderPagination({ modern: false, totalPages: 3, currentPage: 1, prevLabel: 'Poprzednia', nextLabel: 'Następna' });
  assert.match(html, /class="page-item is-disabled">\s*<a class="page-link" href="#">Poprzednia/);
  assert.match(html, /class="page-item is-active">\s*<a class="page-link" href="#">1</);
  assert.doesNotMatch(html, /Następna[\s\S]{0,5}is-disabled/);
});

test('make:pagination - ostatnia strona: "Nastepna" disabled', () => {
  const html = renderPagination({ modern: false, totalPages: 3, currentPage: 3, prevLabel: 'Poprzednia', nextLabel: 'Następna' });
  const nextItemIndex = html.lastIndexOf('<li class="page-item');
  assert.match(html.slice(nextItemIndex), /is-disabled/);
});

test('make:pagination - strona srodkowa: ani prev, ani next nie sa disabled', () => {
  const html = renderPagination({ modern: false, totalPages: 5, currentPage: 3, prevLabel: 'Poprzednia', nextLabel: 'Następna' });
  assert.equal((html.match(/is-disabled/g) ?? []).length, 0);
  assert.match(html, /class="page-item is-active">\s*<a class="page-link" href="#">3</);
});

test('make:pagination - wariant modern dodaje klase OBOK .pagination, nie zamiast', () => {
  const html = renderPagination({ modern: true, totalPages: 2, currentPage: 1, prevLabel: 'P', nextLabel: 'N' });
  assert.match(html, /class="pagination pagination-modern m-0"/);
});

test('make:pagination - wariant klasyczny bez dodatkowej klasy', () => {
  const html = renderPagination({ modern: false, totalPages: 2, currentPage: 1, prevLabel: 'P', nextLabel: 'N' });
  assert.match(html, /class="pagination m-0"/);
  assert.doesNotMatch(html, /pagination-modern/);
});

test('make:pagination - liczba pozycji = totalPages + 2 (prev/next)', () => {
  const html = renderPagination({ modern: false, totalPages: 4, currentPage: 2, prevLabel: 'P', nextLabel: 'N' });
  assert.equal((html.match(/page-item/g) ?? []).length, 6);
});
