/**
 * molique-jit - testy `make:badge` (Etap C.1)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderBadge } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-badge.js')).href
);

test('make:badge - laczy klase koloru z tekstem', () => {
  const html = renderBadge({ text: 'Nowość', color: 'success' });
  assert.equal(html, '<span class="badge badge-success">Nowość</span>\n');
});

test('make:badge - kazdy kolor daje poprawna klase badge-<kolor>', () => {
  for (const color of ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']) {
    const html = renderBadge({ text: 'X', color });
    assert.match(html, new RegExp(`class="badge badge-${color}"`));
  }
});
