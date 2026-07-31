/**
 * molique-jit - `make:status-dot` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderStatusDot } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-status-dot.js')).href
);

test('make:status-dot - without ping, only the status class', () => {
  const html = renderStatusDot({ text: 'Done', status: 'done', ping: false });
  assert.equal(html, '<span class="status-dot status-done">Done</span>\n');
});

test('make:status-dot - with ping, the status-ping class is appended next to the status', () => {
  const html = renderStatusDot({ text: 'Live', status: 'done', ping: true });
  assert.equal(html, '<span class="status-dot status-done status-ping">Live</span>\n');
});

test('make:status-dot - each status produces the correct status-<state> class', () => {
  for (const status of ['draft', 'pending', 'done', 'danger']) {
    const html = renderStatusDot({ text: 'X', status, ping: false });
    assert.match(html, new RegExp(`class="status-dot status-${status}"`));
  }
});
