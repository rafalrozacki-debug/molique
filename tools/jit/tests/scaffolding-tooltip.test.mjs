/**
 * molique-jit - `make:tooltip` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTooltip } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-tooltip.js')).href
);

test('make:tooltip - the visible text and data-tooltip land in the right places', () => {
  const html = renderTooltip({ text: 'GLA', tooltip: 'Gross Living Area' });
  assert.equal(html, '<span class="tooltip-element" data-tooltip="Gross Living Area">GLA</span>\n');
});
