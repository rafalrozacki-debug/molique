/**
 * molique-jit - `make:modal` tests (Stage B.3)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderModalStandard, renderModalConfirm, renderModalContext } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-modal.js')).href
);

test('make:modal - Standard: trigger + dialog with a title and content', () => {
  const html = renderModalStandard({
    id: 'myModal',
    title: 'Title',
    body: 'Modal content...',
    triggerLabel: 'Open',
    triggerVariant: 'btn-primary',
  });
  assert.match(html, /onclick="document\.getElementById\('myModal'\)\.showModal\(\)"/);
  assert.match(html, /<dialog id="myModal" class="modal-dialog">/);
  assert.match(html, /<h2 class="h5 m-0">Title<\/h2>/);
  assert.match(html, /<p>Modal content\.\.\.<\/p>/);
});

test('make:modal - Confirm: icon, both buttons, color variants', () => {
  const html = renderModalConfirm({
    id: 'delModal',
    title: 'Are you sure?',
    message: 'This cannot be undone.',
    cancelLabel: 'Cancel',
    confirmLabel: 'Delete',
    confirmVariant: 'btn-danger',
    icon: 'ph-trash',
    triggerLabel: 'Delete',
    triggerVariant: 'btn-danger',
  });
  assert.match(html, /class="modal-dialog modal-confirm"/);
  assert.match(html, /icons-sprite\.svg#ph-trash/);
  assert.match(html, /<button class="btn-secondary">Cancel<\/button>/);
  assert.match(html, /<button class="btn-danger">Delete<\/button>/);
});

test('make:modal - Context: action list, the second one marked as danger', () => {
  const html = renderModalContext({
    id: 'ctxModal',
    title: 'Options',
    action1Label: 'Edit',
    action1Icon: 'ph-pencil',
    action2Label: 'Delete',
    action2Icon: 'ph-trash',
    action2Danger: true,
    triggerLabel: 'Open',
    triggerVariant: 'btn-secondary',
  });
  assert.match(html, /class="modal-dialog modal-context"/);
  assert.match(html, /<button class="modal-action-btn">/);
  assert.match(html, /<button class="modal-action-btn text-danger">/);
  assert.match(html, /Edit/);
  assert.match(html, /Delete/);
});

test('make:modal - Context: without a destructive action, no text-danger class', () => {
  const html = renderModalContext({
    id: 'ctxModal2',
    title: 'Options',
    action1Label: 'Edit',
    action1Icon: 'ph-pencil',
    action2Label: 'Duplicate',
    action2Icon: 'ph-copy',
    action2Danger: false,
    triggerLabel: 'Open',
    triggerVariant: 'btn-secondary',
  });
  assert.doesNotMatch(html, /text-danger/);
});
