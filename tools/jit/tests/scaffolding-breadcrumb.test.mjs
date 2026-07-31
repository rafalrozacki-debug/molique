/**
 * molique-jit - `make:breadcrumb` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderBreadcrumb } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-breadcrumb.js')).href
);

test('make:breadcrumb - items before the last are links, without text-white/opacity (plain context, not on a photo)', () => {
  const html = renderBreadcrumb({ items: [{ label: 'Home', href: '/' }, { label: 'Current', href: '' }] });
  assert.match(html, /<a href="\/">Home<\/a>/);
  assert.doesNotMatch(html, /text-white|opacity-75/);
});

test('make:breadcrumb - the last item is plain text with .is-active and aria-current="page", not a link', () => {
  const html = renderBreadcrumb({ items: [{ label: 'A', href: '#' }, { label: 'Current page', href: '' }] });
  assert.match(html, /<li class="breadcrumb-item is-active" aria-current="page">Current page<\/li>/);
  assert.doesNotMatch(html, /<a[^>]*>Current page/);
});

test('make:breadcrumb - wraps in <nav aria-label="breadcrumb"><ol class="breadcrumb">', () => {
  const html = renderBreadcrumb({ items: [{ label: 'A', href: '#' }] });
  assert.match(html, /^<nav aria-label="breadcrumb">/);
  assert.match(html, /<ol class="breadcrumb">/);
});
