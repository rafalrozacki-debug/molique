/**
 * molique-jit - testy `make:form` (Etap B.7)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderForm } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-form.js')).href
);

test('make:form - Floating + pole wymagane dostaje feedback-invalid, opcjonalne nie', () => {
  const html = renderForm({
    style: 'floating',
    fields: [
      { label: 'Imie', type: 'text', required: true },
      { label: 'Opis', type: 'textarea', required: false },
    ],
    submitLabel: 'Wyslij',
  });
  assert.match(html, /class="form-floating mb-4">\s*<input type="text"[^>]*required/);
  assert.match(html, /feedback-invalid">To pole jest wymagane\.</);
  assert.match(html, /<textarea class="input" id="form-field-2"/);
  assert.doesNotMatch(html, /Opis[\s\S]*feedback-invalid/);
});

test('make:form - Klasyczny + pole wymagane NIGDY nie dostaje feedback-invalid', () => {
  const html = renderForm({
    style: 'classic',
    fields: [{ label: 'Nazwa', type: 'text', required: true }],
    submitLabel: 'Wyslij',
  });
  assert.match(html, /class="input-group-inline w-100 mb-3">/);
  assert.match(html, /required/);
  assert.doesNotMatch(html, /feedback-invalid/);
});

test('make:form - bez zadnego opcjonalnego modulu, BODY to tylko pola + submit', () => {
  const html = renderForm({ style: 'floating', fields: [{ label: 'A', type: 'text', required: false }], submitLabel: 'OK' });
  assert.doesNotMatch(html, /select-search/);
  assert.doesNotMatch(html, /custom-select/);
  assert.doesNotMatch(html, /file-upload/);
});

test('make:form - Searchable Select: opcje numerowane od 1, ukryte pole z podana nazwa', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    selectSearch: { label: 'Wybierz', placeholder: 'Wybierz z listy...', fieldName: 'wybor', options: ['Opcja 1', 'Opcja 2'] },
    submitLabel: 'OK',
  });
  assert.match(html, /data-value="1">Opcja 1/);
  assert.match(html, /data-value="2">Opcja 2/);
  assert.match(html, /name="wybor" class="select-search-hidden"/);
});

test('make:form - Premium Multi Select: kategorie w kolejnosci, kolory cykliczne globalnie (nie per kategoria)', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    customSelect: {
      label: 'Filtruj',
      placeholder: 'Wybierz...',
      categories: [
        { name: 'Popularne', items: ['HTML', 'CSS'] },
        { name: 'Inne', items: ['JS'] },
      ],
    },
    submitLabel: 'OK',
  });
  const popularneIndex = html.indexOf('custom-select-category">Popularne');
  const inneIndex = html.indexOf('custom-select-category">Inne');
  assert.ok(popularneIndex < inneIndex);
  assert.match(html, /--danger-rgb/); // HTML = 1. kolor (danger)
  assert.match(html, /--info-rgb/); // CSS = 2. kolor (info)
  assert.match(html, /--success-rgb/); // JS (kategoria "Inne") = 3. kolor (success) - cykl NIE resetuje sie na nowej kategorii
});

test('make:form - Drag & Drop File Upload: wariant animowany zmienia ikone na ph-cloud', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    fileUpload: { animated: true, title: 'Upusc plik', subtitle: 'lub kliknij', fieldName: 'plik' },
    submitLabel: 'OK',
  });
  assert.match(html, /file-upload file-upload-animated/);
  assert.match(html, /ph-cloud/);
});

test('make:form - Drag & Drop File Upload: wariant domyslny uzywa ph-file-text, bez klasy animowanej', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    fileUpload: { animated: false, title: 'Upusc plik', subtitle: 'lub kliknij', fieldName: 'plik' },
    submitLabel: 'OK',
  });
  assert.doesNotMatch(html, /file-upload-animated/);
  assert.match(html, /ph-file-text/);
});
