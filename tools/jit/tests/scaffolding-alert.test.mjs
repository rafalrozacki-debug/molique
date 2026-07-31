/**
 * molique-jit - `make:alert` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAlert } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-alert.js')).href
);

test('make:alert - combines the color class with the message content', () => {
  const html = renderAlert({ message: 'The changes were saved successfully.', color: 'success' });
  assert.equal(html, '<div class="alert alert-success">The changes were saved successfully.</div>\n');
});

test('make:alert - each of the 4 colors produces the correct alert-<color> class', () => {
  for (const color of ['info', 'success', 'danger', 'warning']) {
    const html = renderAlert({ message: 'X', color });
    assert.match(html, new RegExp(`class="alert alert-${color}"`));
  }
});
