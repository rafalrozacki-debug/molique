/**
 * molique-jit - `make:status-icon` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderStatusIconStatic, renderStatusIconCheckbox } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-status-icon.js')).href
);

test('make:status-icon static - state lands in the status-icon-<state> class name', () => {
  assert.equal(renderStatusIconStatic({ state: 'add' }).trim(), '<span class="status-icon status-icon-add"></span>');
  assert.equal(renderStatusIconStatic({ state: 'success' }).trim(), '<span class="status-icon status-icon-success"></span>');
});

test('make:status-icon checkbox - always has an aria-label (the span is purely decorative, no text)', () => {
  const html = renderStatusIconCheckbox({ name: 'option', value: '1', ariaLabel: 'Check me' });
  assert.match(html, /<input type="checkbox" name="option" value="1" aria-label="Check me" \/>/);
  assert.match(html, /<span class="status-icon-toggle"><\/span>/);
});

test('make:status-icon checkbox - wraps in <label class="status-checkbox">', () => {
  const html = renderStatusIconCheckbox({ name: 'x', value: '1', ariaLabel: 'X' });
  assert.match(html, /^<label class="status-checkbox">/);
});
