/**
 * molique-jit - testy `make:list-group`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderListGroup } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-list-group.js')).href
);

test('make:list-group - pozycja active dostaje .is-active, pozostale nie', () => {
  const html = renderListGroup({
    items: [
      { label: 'Ustawienia konta', href: '#', active: true },
      { label: 'Powiadomienia', href: '#', active: false },
    ],
  });
  assert.match(html, /<a href="#" class="list-group-item is-active">Ustawienia konta<\/a>/);
  assert.match(html, /<a href="#" class="list-group-item">Powiadomienia<\/a>/);
});

test('make:list-group - N pozycji renderuje N razy .list-group-item, wewnatrz jednego .list-group', () => {
  const html = renderListGroup({
    items: [
      { label: 'A', href: '#', active: false },
      { label: 'B', href: '#', active: false },
      { label: 'C', href: '#', active: false },
    ],
  });
  assert.match(html, /^<div class="list-group w-100">/);
  assert.equal((html.match(/class="list-group-item/g) ?? []).length, 3);
});
