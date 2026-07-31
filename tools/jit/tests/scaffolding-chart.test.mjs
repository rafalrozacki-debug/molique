/**
 * molique-jit - `make:chart` tests (Stage B.4)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderRadial, renderFunnel, renderPipeline, renderStockBar } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-chart.js')).href
);

test('make:chart - Radial: the primary color adds no variable override or class', () => {
  const html = renderRadial({ value: 75, color: 'primary' });
  assert.match(html, /--val: 75%/);
  assert.doesNotMatch(html, /--primary: var/);
  assert.doesNotMatch(html, /text-primary/);
});

test('make:chart - Radial: another color overrides --primary and adds a text-* class', () => {
  const html = renderRadial({ value: 42, color: 'danger' });
  assert.match(html, /--val: 42%/);
  assert.match(html, /--primary: var\(--danger\);/);
  assert.match(html, /text-danger/);
});

test('make:chart - Funnel: width decreases evenly 100% -> 45%, colors cycle', () => {
  const html = renderFunnel({ labels: ['A', 'B', 'C'] });
  assert.match(html, /--val: 100%.*A/s);
  assert.match(html, /--val: 73%.*B/s);
  assert.match(html, /--val: 45%.*C/s);
  assert.match(html, /--stage-bg: var\(--primary\)/);
  assert.match(html, /--stage-bg: var\(--info\); --stage-text: var\(--btn-text-dark\)/);
});

test('make:chart - Funnel: a single label = 100%, no division by zero', () => {
  const html = renderFunnel({ labels: ['Only one'] });
  assert.match(html, /--val: 100%/);
});

test('make:chart - Pipeline: the active step gets is-active, the rest have no inline style', () => {
  const html = renderPipeline({ steps: ['New', 'Contact', 'Contract'], activeLabel: 'Contact' });
  assert.match(html, /<div class="pipeline-stage is-active">Contact<\/div>/);
  assert.match(html, /<div class="pipeline-stage">New<\/div>/);
  assert.doesNotMatch(html, /style=/);
});

test('make:chart - Pipeline: no active step (activeLabel empty)', () => {
  const html = renderPipeline({ steps: ['A', 'B'], activeLabel: '' });
  assert.doesNotMatch(html, /is-active/);
});

test('make:chart - Stock Bar: role="img" and aria-label are ALWAYS present', () => {
  const html = renderStockBar({ filled: 3, variant: '', ariaLabel: 'Stock: 3/5' });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Stock: 3\/5"/);
  assert.match(html, /--stock-filled: 3/);
  assert.doesNotMatch(html, /stock-bar-/); // no variant = only the base .stock-bar class
});

test('make:chart - Stock Bar: a color variant adds a second class', () => {
  const html = renderStockBar({ filled: 1, variant: 'stock-bar-danger', ariaLabel: 'Critical' });
  assert.match(html, /class="stock-bar stock-bar-danger"/);
});
