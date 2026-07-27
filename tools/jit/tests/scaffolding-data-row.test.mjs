/**
 * molique-jit - testy `make:data-row`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderDataRowGrid, renderDataRowCompact } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-data-row.js')).href
);

test('make:data-row grid - kolumny Grid + status-dot, brak wrappera (block-level stacking)', () => {
  const html = renderDataRowGrid({
    rows: [
      { title: 'Dom w Kossaccach 44', subtitle: '144m2 PUM', value: '1 030 000 zl', statusText: 'Szkic', statusState: 'draft', actionLabels: ['Edytuj', 'Usun'] },
    ],
  });
  assert.match(html, /^<div class="data-row w-100">/);
  assert.match(html, /<span class="status-dot status-draft">Szkic<\/span>/);
  assert.doesNotMatch(html, /grid-auto|flex-column/);
});

test('make:data-row grid - z >1 akcjami OSTATNIA dostaje text-danger, pierwsza nie', () => {
  const html = renderDataRowGrid({
    rows: [{ title: 'X', subtitle: 'Y', value: 'Z', statusText: 'S', statusState: 'done', actionLabels: ['Edytuj', 'Usun'] }],
  });
  assert.match(html, /<button class="btn-action">Edytuj<\/button>/);
  assert.match(html, /<button class="btn-action text-danger">Usun<\/button>/);
});

test('make:data-row grid - z dokladnie 1 akcja NIE dostaje text-danger (nie kazda pojedyncza akcja jest niszczaca)', () => {
  const html = renderDataRowGrid({
    rows: [{ title: 'X', subtitle: 'Y', value: 'Z', statusText: 'S', statusState: 'pending', actionLabels: ['Podglad'] }],
  });
  assert.match(html, /<button class="btn-action">Podglad<\/button>/);
  assert.doesNotMatch(html, /text-danger/);
});

test('make:data-row grid - N wierszy renderuje N razy .data-row', () => {
  const html = renderDataRowGrid({
    rows: [
      { title: 'A', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
      { title: 'B', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
      { title: 'C', subtitle: '', value: '', statusText: '', statusState: 'draft', actionLabels: [] },
    ],
  });
  assert.equal((html.match(/class="data-row w-100"/g) ?? []).length, 3);
});

test('make:data-row compact - owija w .card border-0 shadow-sm, uzywa SVG-sprite zamiast bledej klasy icon-*', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-file-text', iconColor: 'danger', iconSquare: true, title: 'raport.pdf', details: '0.4 MB', leadingText: '', actionIcon: 'ph-x', actionAriaLabel: 'Anuluj' }],
  });
  assert.match(html, /^<div class="card border-0 shadow-sm">/);
  assert.match(html, /<use href="img\/icons-sprite\.svg#ph-file-text">/);
  assert.doesNotMatch(html, /class="icon-file-text"/);
});

test('make:data-row compact - icon-square i kolor tla ikony sa opcjonalne (puste, gdy nie podano koloru)', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: '', iconSquare: false, title: 'James Brown', details: 'james@x.com', leadingText: '', actionIcon: 'ph-caret-down', actionAriaLabel: 'Zmien' }],
  });
  assert.match(html, /<div class="row-icon">/);
  assert.doesNotMatch(html, /icon-square|bg-primary/);
});

test('make:data-row compact - leadingText niepusty dodaje span.text-muted.mr-2 (poprawna klasa, nie zepsuta "m-r-2")', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: 'primary', iconSquare: false, title: 'James Brown', details: 'james@x.com', leadingText: 'Can view', actionIcon: 'ph-caret-down', actionAriaLabel: 'Zmien' }],
  });
  assert.match(html, /<span class="text-muted text-4 mr-2">Can view<\/span>/);
  assert.doesNotMatch(html, /m-r-2/);
});

test('make:data-row compact - btn-action bez zbednego prefiksu "btn "', () => {
  const html = renderDataRowCompact({
    items: [{ icon: 'ph-user', iconColor: '', iconSquare: false, title: 'X', details: 'Y', leadingText: '', actionIcon: 'ph-x', actionAriaLabel: 'Z' }],
  });
  assert.match(html, /<button class="btn-action" aria-label="Z">/);
  assert.doesNotMatch(html, /btn btn-action/);
});
