/**
 * molique-jit - `make:toast` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderToast } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-toast.js')).href
);

test('make:toast - the trigger button gets the btn-<type> color, matching the notification type', () => {
  const html = renderToast({ triggerId: 'toast-1', triggerLabel: 'Success', message: 'Saved!', type: 'success', position: 'top-right', duration: 4000 });
  assert.match(html, /<button id="toast-1" class="btn-success">Success<\/button>/);
});

test('make:toast - calls MoliqueToast.show via addEventListener, NOT via inline onclick', () => {
  const html = renderToast({ triggerId: 'toast-2', triggerLabel: 'Error', message: 'An error occurred.', type: 'danger', position: 'bottom-center', duration: 5000 });
  assert.match(html, /document\.getElementById\('toast-2'\)\.addEventListener\('click'/);
  assert.doesNotMatch(html, /onclick=/);
});

test('make:toast - message/type/position/duration land correctly in the API call object', () => {
  const html = renderToast({ triggerId: 'toast-3', triggerLabel: 'X', message: 'A server error occurred.', type: 'danger', position: 'bottom-center', duration: 5000 });
  assert.match(html, /message: 'A server error occurred\.'/);
  assert.match(html, /type: 'danger'/);
  assert.match(html, /position: 'bottom-center'/);
  assert.match(html, /duration: 5000/);
});
