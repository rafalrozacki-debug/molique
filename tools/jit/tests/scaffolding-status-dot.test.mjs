/**
 * molique-jit - testy `make:status-dot`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderStatusDot } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-status-dot.js')).href
);

test('make:status-dot - bez ping, tylko klasa statusu', () => {
  const html = renderStatusDot({ text: 'Zakonczone', status: 'done', ping: false });
  assert.equal(html, '<span class="status-dot status-done">Zakonczone</span>\n');
});

test('make:status-dot - z ping, klasa status-ping doklejona obok statusu', () => {
  const html = renderStatusDot({ text: 'Live', status: 'done', ping: true });
  assert.equal(html, '<span class="status-dot status-done status-ping">Live</span>\n');
});

test('make:status-dot - kazdy status daje poprawna klase status-<stan>', () => {
  for (const status of ['draft', 'pending', 'done', 'danger']) {
    const html = renderStatusDot({ text: 'X', status, ping: false });
    assert.match(html, new RegExp(`class="status-dot status-${status}"`));
  }
});
