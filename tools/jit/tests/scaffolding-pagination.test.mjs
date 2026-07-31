/**
 * molique-jit - `make:pagination` tests (Stage C.4 - the last of the first wave)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPagination } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-pagination.js')).href
);

test('make:pagination - page 1: "Previous" disabled, "1" active', () => {
  const html = renderPagination({ modern: false, totalPages: 3, currentPage: 1, prevLabel: 'Previous', nextLabel: 'Next' });
  assert.match(html, /class="page-item is-disabled">\s*<a class="page-link" href="#">Previous/);
  assert.match(html, /class="page-item is-active">\s*<a class="page-link" href="#">1</);
  assert.doesNotMatch(html, /Next[\s\S]{0,5}is-disabled/);
});

test('make:pagination - last page: "Next" disabled', () => {
  const html = renderPagination({ modern: false, totalPages: 3, currentPage: 3, prevLabel: 'Previous', nextLabel: 'Next' });
  const nextItemIndex = html.lastIndexOf('<li class="page-item');
  assert.match(html.slice(nextItemIndex), /is-disabled/);
});

test('make:pagination - a middle page: neither prev nor next is disabled', () => {
  const html = renderPagination({ modern: false, totalPages: 5, currentPage: 3, prevLabel: 'Previous', nextLabel: 'Next' });
  assert.equal((html.match(/is-disabled/g) ?? []).length, 0);
  assert.match(html, /class="page-item is-active">\s*<a class="page-link" href="#">3</);
});

test('make:pagination - the modern variant adds a class ALONGSIDE .pagination, not instead of it', () => {
  const html = renderPagination({ modern: true, totalPages: 2, currentPage: 1, prevLabel: 'P', nextLabel: 'N' });
  assert.match(html, /class="pagination pagination-modern m-0"/);
});

test('make:pagination - the classic variant has no extra class', () => {
  const html = renderPagination({ modern: false, totalPages: 2, currentPage: 1, prevLabel: 'P', nextLabel: 'N' });
  assert.match(html, /class="pagination m-0"/);
  assert.doesNotMatch(html, /pagination-modern/);
});

test('make:pagination - number of items = totalPages + 2 (prev/next)', () => {
  const html = renderPagination({ modern: false, totalPages: 4, currentPage: 2, prevLabel: 'P', nextLabel: 'N' });
  assert.equal((html.match(/page-item/g) ?? []).length, 6);
});
