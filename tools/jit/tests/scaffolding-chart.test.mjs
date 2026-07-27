/**
 * molique-jit - testy `make:chart` (Etap B.4)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderRadial, renderFunnel, renderPipeline, renderStockBar } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-chart.js')).href
);

test('make:chart - Radial: kolor primary nie dodaje nadpisania zmiennej ani klasy', () => {
  const html = renderRadial({ value: 75, color: 'primary' });
  assert.match(html, /--val: 75%/);
  assert.doesNotMatch(html, /--primary: var/);
  assert.doesNotMatch(html, /text-primary/);
});

test('make:chart - Radial: inny kolor nadpisuje --primary i dodaje klase text-*', () => {
  const html = renderRadial({ value: 42, color: 'danger' });
  assert.match(html, /--val: 42%/);
  assert.match(html, /--primary: var\(--danger\);/);
  assert.match(html, /text-danger/);
});

test('make:chart - Funnel: szerokosc maleje rownomiernie 100% -> 45%, kolory cykliczne', () => {
  const html = renderFunnel({ labels: ['A', 'B', 'C'] });
  assert.match(html, /--val: 100%.*A/s);
  assert.match(html, /--val: 73%.*B/s);
  assert.match(html, /--val: 45%.*C/s);
  assert.match(html, /--stage-bg: var\(--primary\)/);
  assert.match(html, /--stage-bg: var\(--info\); --stage-text: var\(--btn-text-dark\)/);
});

test('make:chart - Funnel: pojedyncza etykieta = 100%, bez dzielenia przez zero', () => {
  const html = renderFunnel({ labels: ['Jedyny'] });
  assert.match(html, /--val: 100%/);
});

test('make:chart - Pipeline: aktywny krok dostaje is-active, reszta bez zadnego stylu inline', () => {
  const html = renderPipeline({ steps: ['Nowy', 'Kontakt', 'Umowa'], activeLabel: 'Kontakt' });
  assert.match(html, /<div class="pipeline-stage is-active">Kontakt<\/div>/);
  assert.match(html, /<div class="pipeline-stage">Nowy<\/div>/);
  assert.doesNotMatch(html, /style=/);
});

test('make:chart - Pipeline: brak aktywnego kroku (activeLabel puste)', () => {
  const html = renderPipeline({ steps: ['A', 'B'], activeLabel: '' });
  assert.doesNotMatch(html, /is-active/);
});

test('make:chart - Stock Bar: role="img" i aria-label ZAWSZE obecne', () => {
  const html = renderStockBar({ filled: 3, variant: '', ariaLabel: 'Stan: 3/5' });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Stan: 3\/5"/);
  assert.match(html, /--stock-filled: 3/);
  assert.doesNotMatch(html, /stock-bar-/); // brak wariantu = tylko bazowa klasa .stock-bar
});

test('make:chart - Stock Bar: wariant koloru dodaje druga klase', () => {
  const html = renderStockBar({ filled: 1, variant: 'stock-bar-danger', ariaLabel: 'Krytyczny' });
  assert.match(html, /class="stock-bar stock-bar-danger"/);
});
