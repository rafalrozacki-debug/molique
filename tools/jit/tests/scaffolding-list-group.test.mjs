/**
 * molique-jit - `make:list-group` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderListGroup } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-list-group.js')).href
);

test('make:list-group - the active item gets .is-active, the rest do not', () => {
  const html = renderListGroup({
    items: [
      { label: 'Account Settings', href: '#', active: true },
      { label: 'Notifications', href: '#', active: false },
    ],
  });
  assert.match(html, /<a href="#" class="list-group-item is-active">Account Settings<\/a>/);
  assert.match(html, /<a href="#" class="list-group-item">Notifications<\/a>/);
});

test('make:list-group - N items render .list-group-item N times, inside a single .list-group', () => {
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
