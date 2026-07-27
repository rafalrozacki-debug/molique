/**
 * molique-jit - testy `make:progress` (Etap C.2)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderProgress } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-progress.js')).href
);

test('make:progress - primary (domyslny) nie dostaje dodatkowej klasy bg-*', () => {
  const html = renderProgress({ label: 'Rozwoj', value: 85, color: 'primary' });
  assert.match(html, /class="progress-bar" style="width: 85%"/);
  assert.doesNotMatch(html, /bg-primary/);
});

test('make:progress - inny kolor dodaje klase narzedziowa bg-<kolor>', () => {
  const html = renderProgress({ label: 'SEO', value: 60, color: 'success' });
  assert.match(html, /class="progress-bar bg-success" style="width: 60%"/);
});

test('make:progress - etykieta i wartosc procentowa w progress-label', () => {
  const html = renderProgress({ label: 'Zuzycie serwera', value: 92, color: 'danger' });
  assert.match(html, /<span>Zuzycie serwera<\/span>/);
  assert.match(html, /<span>92%<\/span>/);
});
