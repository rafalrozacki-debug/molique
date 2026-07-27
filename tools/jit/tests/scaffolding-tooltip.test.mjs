/**
 * molique-jit - testy `make:tooltip`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTooltip } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-tooltip.js')).href
);

test('make:tooltip - tekst widoczny i data-tooltip trafiaja w odpowiednie miejsca', () => {
  const html = renderTooltip({ text: 'PUM', tooltip: 'Powierzchnia Uzytkowa Mieszkalna' });
  assert.equal(html, '<span class="tooltip-element" data-tooltip="Powierzchnia Uzytkowa Mieszkalna">PUM</span>\n');
});
