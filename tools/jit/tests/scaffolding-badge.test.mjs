/**
 * molique-jit - `make:badge` tests (Stage C.1)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderBadge } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-badge.js')).href
);

test('make:badge - combines the color class with the text', () => {
  const html = renderBadge({ text: 'New', color: 'success' });
  assert.equal(html, '<span class="badge badge-success">New</span>\n');
});

test('make:badge - each color produces the correct badge-<color> class', () => {
  for (const color of ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']) {
    const html = renderBadge({ text: 'X', color });
    assert.match(html, new RegExp(`class="badge badge-${color}"`));
  }
});
