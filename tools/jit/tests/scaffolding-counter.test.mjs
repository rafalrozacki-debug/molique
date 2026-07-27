/**
 * molique-jit - testy `make:counter`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCounter } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-counter.js')).href
);

test('make:counter - bez prefiksu/sufiksu, brak dodatkowych atrybutow', () => {
  const html = renderCounter({ value: 1500, title: 'Klienci', prefix: '', suffix: '' });
  assert.equal(html, '<div class="counter">\n  <span class="counter-value">1500</span>\n  <div class="counter-title">Klienci</div>\n</div>\n');
});

test('make:counter - tresc counter-value to SAMA liczba (JS parsuje ja przez parseFloat)', () => {
  const html = renderCounter({ value: 42, title: 'X', prefix: '', suffix: '' });
  assert.match(html, /class="counter-value">42</);
});

test('make:counter - prefiks i sufiks trafiaja jako atrybuty data-*, nie do tresci', () => {
  const html = renderCounter({ value: 1500, title: 'Klienci', prefix: '$', suffix: '+' });
  assert.match(html, /class="counter-value" data-prefix="\$" data-suffix="\+">1500</);
});
