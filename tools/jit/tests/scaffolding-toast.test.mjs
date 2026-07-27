/**
 * molique-jit - testy `make:toast`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderToast } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-toast.js')).href
);

test('make:toast - przycisk wyzwalajacy dostaje kolor btn-<type>, zgodny z typem powiadomienia', () => {
  const html = renderToast({ triggerId: 'toast-1', triggerLabel: 'Sukces', message: 'Zapisano!', type: 'success', position: 'top-right', duration: 4000 });
  assert.match(html, /<button id="toast-1" class="btn-success">Sukces<\/button>/);
});

test('make:toast - wywoluje MoliqueToast.show przez addEventListener, NIE przez inline onclick', () => {
  const html = renderToast({ triggerId: 'toast-2', triggerLabel: 'Blad', message: 'Wystapil blad.', type: 'danger', position: 'bottom-center', duration: 5000 });
  assert.match(html, /document\.getElementById\('toast-2'\)\.addEventListener\('click'/);
  assert.doesNotMatch(html, /onclick=/);
});

test('make:toast - message/type/position/duration trafiaja poprawnie do obiektu wywolania API', () => {
  const html = renderToast({ triggerId: 'toast-3', triggerLabel: 'X', message: 'Wystapil blad serwera.', type: 'danger', position: 'bottom-center', duration: 5000 });
  assert.match(html, /message: 'Wystapil blad serwera\.'/);
  assert.match(html, /type: 'danger'/);
  assert.match(html, /position: 'bottom-center'/);
  assert.match(html, /duration: 5000/);
});
