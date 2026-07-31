/**
 * molique-jit - `make:form` tests (Stage B.7)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderForm } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-form.js')).href
);

test('make:form - Floating + a required field gets feedback-invalid, an optional one does not', () => {
  const html = renderForm({
    style: 'floating',
    fields: [
      { label: 'Name', type: 'text', required: true },
      { label: 'Description', type: 'textarea', required: false },
    ],
    submitLabel: 'Send',
  });
  assert.match(html, /class="form-floating mb-4">\s*<input type="text"[^>]*required/);
  assert.match(html, /feedback-invalid">This field is required\.</);
  assert.match(html, /<textarea class="input" id="form-field-2"/);
  assert.doesNotMatch(html, /Description[\s\S]*feedback-invalid/);
});

test('make:form - Classic + a required field NEVER gets feedback-invalid', () => {
  const html = renderForm({
    style: 'classic',
    fields: [{ label: 'Name', type: 'text', required: true }],
    submitLabel: 'Send',
  });
  assert.match(html, /class="input-group-inline w-100 mb-3">/);
  assert.match(html, /required/);
  assert.doesNotMatch(html, /feedback-invalid/);
});

test('make:form - without any optional module, BODY is just the fields + submit', () => {
  const html = renderForm({ style: 'floating', fields: [{ label: 'A', type: 'text', required: false }], submitLabel: 'OK' });
  assert.doesNotMatch(html, /select-search/);
  assert.doesNotMatch(html, /custom-select/);
  assert.doesNotMatch(html, /file-upload/);
});

test('make:form - Searchable Select: options numbered from 1, hidden field with the given name', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    selectSearch: { label: 'Choose', placeholder: 'Choose from the list...', fieldName: 'choice', options: ['Option 1', 'Option 2'] },
    submitLabel: 'OK',
  });
  assert.match(html, /data-value="1">Option 1/);
  assert.match(html, /data-value="2">Option 2/);
  assert.match(html, /name="choice" class="select-search-hidden"/);
});

test('make:form - Premium Multi Select: categories in order, colors cycle globally (not per category)', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    customSelect: {
      label: 'Filter',
      placeholder: 'Choose...',
      categories: [
        { name: 'Popular', items: ['HTML', 'CSS'] },
        { name: 'Other', items: ['JS'] },
      ],
    },
    submitLabel: 'OK',
  });
  const popularIndex = html.indexOf('custom-select-category">Popular');
  const otherIndex = html.indexOf('custom-select-category">Other');
  assert.ok(popularIndex < otherIndex);
  assert.match(html, /--danger-rgb/); // HTML = 1st color (danger)
  assert.match(html, /--info-rgb/); // CSS = 2nd color (info)
  assert.match(html, /--success-rgb/); // JS (the "Other" category) = 3rd color (success) - the cycle does NOT reset on a new category
});

test('make:form - Drag & Drop File Upload: the animated variant switches the icon to ph-cloud', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    fileUpload: { animated: true, title: 'Drop a file', subtitle: 'or click', fieldName: 'file' },
    submitLabel: 'OK',
  });
  assert.match(html, /file-upload file-upload-animated/);
  assert.match(html, /ph-cloud/);
});

test('make:form - Drag & Drop File Upload: the default variant uses ph-file-text, without the animated class', () => {
  const html = renderForm({
    style: 'floating',
    fields: [{ label: 'A', type: 'text', required: false }],
    fileUpload: { animated: false, title: 'Drop a file', subtitle: 'or click', fieldName: 'file' },
    submitLabel: 'OK',
  });
  assert.doesNotMatch(html, /file-upload-animated/);
  assert.match(html, /ph-file-text/);
});
