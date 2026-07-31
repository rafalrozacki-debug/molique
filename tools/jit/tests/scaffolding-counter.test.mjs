/**
 * molique-jit - `make:counter` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCounter } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-counter.js')).href
);

test('make:counter - without a prefix/suffix, no extra attributes', () => {
  const html = renderCounter({ value: 1500, title: 'Customers', prefix: '', suffix: '' });
  assert.equal(html, '<div class="counter">\n  <span class="counter-value">1500</span>\n  <div class="counter-title">Customers</div>\n</div>\n');
});

test('make:counter - the counter-value content is JUST the number (JS parses it via parseFloat)', () => {
  const html = renderCounter({ value: 42, title: 'X', prefix: '', suffix: '' });
  assert.match(html, /class="counter-value">42</);
});

test('make:counter - the prefix and suffix land as data-* attributes, not in the content', () => {
  const html = renderCounter({ value: 1500, title: 'Customers', prefix: '$', suffix: '+' });
  assert.match(html, /class="counter-value" data-prefix="\$" data-suffix="\+">1500</);
});
