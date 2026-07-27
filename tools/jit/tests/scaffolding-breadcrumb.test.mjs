/**
 * molique-jit - testy `make:breadcrumb`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderBreadcrumb } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-breadcrumb.js')).href
);

test('make:breadcrumb - pozycje przed ostatnia sa linkami, bez text-white/opacity (kontekst zwykly, nie na zdjeciu)', () => {
  const html = renderBreadcrumb({ items: [{ label: 'Strona glowna', href: '/' }, { label: 'Biezaca', href: '' }] });
  assert.match(html, /<a href="\/">Strona glowna<\/a>/);
  assert.doesNotMatch(html, /text-white|opacity-75/);
});

test('make:breadcrumb - ostatnia pozycja to zwykly tekst z .is-active i aria-current="page", nie link', () => {
  const html = renderBreadcrumb({ items: [{ label: 'A', href: '#' }, { label: 'Biezaca strona', href: '' }] });
  assert.match(html, /<li class="breadcrumb-item is-active" aria-current="page">Biezaca strona<\/li>/);
  assert.doesNotMatch(html, /<a[^>]*>Biezaca strona/);
});

test('make:breadcrumb - owija w <nav aria-label="breadcrumb"><ol class="breadcrumb">', () => {
  const html = renderBreadcrumb({ items: [{ label: 'A', href: '#' }] });
  assert.match(html, /^<nav aria-label="breadcrumb">/);
  assert.match(html, /<ol class="breadcrumb">/);
});
