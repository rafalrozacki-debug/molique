/**
 * molique-jit - testy `make:status-icon`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderStatusIconStatic, renderStatusIconCheckbox } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-status-icon.js')).href
);

test('make:status-icon static - state trafia w nazwe klasy status-icon-<state>', () => {
  assert.equal(renderStatusIconStatic({ state: 'add' }).trim(), '<span class="status-icon status-icon-add"></span>');
  assert.equal(renderStatusIconStatic({ state: 'success' }).trim(), '<span class="status-icon status-icon-success"></span>');
});

test('make:status-icon checkbox - zawsze ma aria-label (span jest czysto dekoracyjny, bez tekstu)', () => {
  const html = renderStatusIconCheckbox({ name: 'opcja', value: '1', ariaLabel: 'Zaznacz mnie' });
  assert.match(html, /<input type="checkbox" name="opcja" value="1" aria-label="Zaznacz mnie" \/>/);
  assert.match(html, /<span class="status-icon-toggle"><\/span>/);
});

test('make:status-icon checkbox - owija w <label class="status-checkbox">', () => {
  const html = renderStatusIconCheckbox({ name: 'x', value: '1', ariaLabel: 'X' });
  assert.match(html, /^<label class="status-checkbox">/);
});
