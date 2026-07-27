/**
 * molique-jit - testy `make:alert`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAlert } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-alert.js')).href
);

test('make:alert - laczy klase koloru z trescia komunikatu', () => {
  const html = renderAlert({ message: 'Zmiany zostaly zapisane pomyslnie.', color: 'success' });
  assert.equal(html, '<div class="alert alert-success">Zmiany zostaly zapisane pomyslnie.</div>\n');
});

test('make:alert - kazdy z 4 kolorow daje poprawna klase alert-<kolor>', () => {
  for (const color of ['info', 'success', 'danger', 'warning']) {
    const html = renderAlert({ message: 'X', color });
    assert.match(html, new RegExp(`class="alert alert-${color}"`));
  }
});
