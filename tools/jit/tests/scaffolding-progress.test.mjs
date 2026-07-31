/**
 * molique-jit - `make:progress` tests (Stage C.2)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderProgress } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-progress.js')).href
);

test('make:progress - primary (default) gets no extra bg-* class', () => {
  const html = renderProgress({ label: 'Progress', value: 85, color: 'primary' });
  assert.match(html, /class="progress-bar" style="width: 85%"/);
  assert.doesNotMatch(html, /bg-primary/);
});

test('make:progress - another color adds the bg-<color> utility class', () => {
  const html = renderProgress({ label: 'SEO', value: 60, color: 'success' });
  assert.match(html, /class="progress-bar bg-success" style="width: 60%"/);
});

test('make:progress - label and percentage value in progress-label', () => {
  const html = renderProgress({ label: 'Server usage', value: 92, color: 'danger' });
  assert.match(html, /<span>Server usage<\/span>/);
  assert.match(html, /<span>92%<\/span>/);
});
