/**
 * molique-jit - `make:data-row` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderDataRowGrid, renderDataRowCompact } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-data-row.js')).href
);

test('make:data-row grid - Grid columns + status-dot, no wrapper (block-level stacking)', () => {
  const html = renderDataRowGrid({
    rows: [
      { title: 'House on Kossaki Street 44', subtitle: '144m² living area', value: '$1,030,000', statusText: 'Draft', statusState: 'draft', actionLabels: ['Edit', 'Delete'] },
    ],
  });
  assert.match(html, /^<div class="data-row w-100">/);
  assert.match(html, /<span class="status-dot status-draft">Draft<\/span>/);
  assert.doesNotMatch(html, /grid-auto|flex-column/);
});

test('make:data-row grid - with >1 actions the LAST one gets text-danger, the first does not', () => {
  const html = renderDataRowGrid({
    rows: [{ title: 'X', subtitle: 'Y', value: 'Z', statusText: 'S', statusState: 'done', actionLabels: ['Edit', 'Delete'] }],
  });
  assert.match(html, /<button class="btn-action">Edit<\/button>/);
  assert.match(html, /<button class="btn-action text-danger">Delete<\/button>/);
});

test('make:data-row grid - with exactly 1 action it does NOT get text-danger (not every single action is destructive)', () => {
  const html = renderDataRowGrid({
    rows: [{ title: 'X', subtitle: 'Y', value: 'Z', statusText: 'S', statusState: 'pending', actionLabels: ['Preview'] }],
  });
  assert.match(html, /<button class="btn-action">Preview<\/button>/);
  assert.doesNotMatch(html, /text-danger/);
});

test('make:data-row grid - N rows render .data-row N times', () => {
  const html = renderDataRowGrid({
    rows: [
      { title: 'A', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
      { title: 'B', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
      { title: 'C', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
    ],
  });
  assert.equal((html.match(/class="data-row w-100"/g) ?? []).length, 3);
});

test('make:data-row compact - wraps in .card border-0 shadow-sm, uses the SVG sprite instead of the broken icon-* class', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-file-text', iconColor: 'danger', iconSquare: true, title: 'report.pdf', details: '0.4 MB', leadingText: '', actionIcon: 'ph-x', actionAriaLabel: 'Cancel' }],
  });
  assert.match(html, /^<div class="card border-0 shadow-sm">/);
  assert.match(html, /<use href="img\/icons-sprite\.svg#ph-file-text">/);
  assert.doesNotMatch(html, /class="icon-file-text"/);
});

test('make:data-row compact - icon-square and the icon background color are optional (empty when no color given)', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: '', iconSquare: false, title: 'James Brown', details: 'james@x.com', leadingText: '', actionIcon: 'ph-caret-down', actionAriaLabel: 'Change' }],
  });
  assert.match(html, /<div class="row-icon">/);
  assert.doesNotMatch(html, /icon-square|bg-primary/);
});

test('make:data-row compact - a non-empty leadingText adds span.text-muted.mr-2 (the correct class, not the broken "m-r-2")', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: 'primary', iconSquare: false, title: 'James Brown', details: 'james@x.com', leadingText: 'Can view', actionIcon: 'ph-caret-down', actionAriaLabel: 'Change' }],
  });
  assert.match(html, /<span class="text-muted text-4 mr-2">Can view<\/span>/);
  assert.doesNotMatch(html, /m-r-2/);
});

test('make:data-row compact - btn-action without the redundant "btn " prefix', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: '', iconSquare: false, title: 'X', details: 'Y', leadingText: '', actionIcon: 'ph-x', actionAriaLabel: 'Z' }],
  });
  assert.match(html, /<button class="btn-action" aria-label="Z">/);
  assert.doesNotMatch(html, /btn btn-action/);
});
