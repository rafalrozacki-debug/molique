/**
 * molique-jit - testy `make:modal` (Etap B.3)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderModalStandard, renderModalConfirm, renderModalContext } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-modal.js')).href
);

test('make:modal - Standard: trigger + dialog z tytulem i trescia', () => {
  const html = renderModalStandard({
    id: 'myModal',
    title: 'Tytul',
    body: 'Tresc modala...',
    triggerLabel: 'Otworz',
    triggerVariant: 'btn-primary',
  });
  assert.match(html, /onclick="document\.getElementById\('myModal'\)\.showModal\(\)"/);
  assert.match(html, /<dialog id="myModal" class="modal-dialog">/);
  assert.match(html, /<h2 class="h5 m-0">Tytul<\/h2>/);
  assert.match(html, /<p>Tresc modala\.\.\.<\/p>/);
});

test('make:modal - Confirm: ikona, oba przyciski, warianty kolorow', () => {
  const html = renderModalConfirm({
    id: 'delModal',
    title: 'Na pewno?',
    message: 'Nie mozna cofnac.',
    cancelLabel: 'Anuluj',
    confirmLabel: 'Usun',
    confirmVariant: 'btn-danger',
    icon: 'ph-trash',
    triggerLabel: 'Usun',
    triggerVariant: 'btn-danger',
  });
  assert.match(html, /class="modal-dialog modal-confirm"/);
  assert.match(html, /icons-sprite\.svg#ph-trash/);
  assert.match(html, /<button class="btn btn-secondary">Anuluj<\/button>/);
  assert.match(html, /<button class="btn btn-danger">Usun<\/button>/);
});

test('make:modal - Context: lista akcji, druga oznaczona jako danger', () => {
  const html = renderModalContext({
    id: 'ctxModal',
    title: 'Opcje',
    action1Label: 'Edytuj',
    action1Icon: 'ph-pencil',
    action2Label: 'Usun',
    action2Icon: 'ph-trash',
    action2Danger: true,
    triggerLabel: 'Otworz',
    triggerVariant: 'btn-secondary',
  });
  assert.match(html, /class="modal-dialog modal-context"/);
  assert.match(html, /<button class="modal-action-btn">/);
  assert.match(html, /<button class="modal-action-btn text-danger">/);
  assert.match(html, /Edytuj/);
  assert.match(html, /Usun/);
});

test('make:modal - Context: bez akcji destrukcyjnej, brak klasy text-danger', () => {
  const html = renderModalContext({
    id: 'ctxModal2',
    title: 'Opcje',
    action1Label: 'Edytuj',
    action1Icon: 'ph-pencil',
    action2Label: 'Duplikuj',
    action2Icon: 'ph-copy',
    action2Danger: false,
    triggerLabel: 'Otworz',
    triggerVariant: 'btn-secondary',
  });
  assert.doesNotMatch(html, /text-danger/);
});
