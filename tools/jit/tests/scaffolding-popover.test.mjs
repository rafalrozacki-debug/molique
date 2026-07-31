/**
 * molique-jit - `make:popover` tests (Stage B.2)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPopover } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-popover.js')).href
);

test('make:popover - ANCHOR_NAME derived from ID, icon next to the button', () => {
  const html = renderPopover({
    triggerLabel: 'Options',
    triggerColor: 'btn-secondary',
    triggerIcon: 'ph-gear',
    id: 'ctxMenu1',
    items: [{ label: 'View', icon: 'ph-eye', danger: false }],
  });
  assert.match(html, /popovertarget="ctxMenu1" style="anchor-name: --anchor-ctxMenu1"/);
  assert.match(html, /id="ctxMenu1" popover class="popover-context" style="position-anchor: --anchor-ctxMenu1"/);
  assert.match(html, /Options <svg/);
});

test('make:popover - no icon next to the button, TRIGGER_CONTENT is just the label', () => {
  const html = renderPopover({
    triggerLabel: 'Options',
    triggerColor: 'btn-primary',
    triggerIcon: '',
    id: 'menu2',
    items: [{ label: 'A', icon: '', danger: false }],
  });
  assert.match(html, />\s*Options\s*<\/button>/);
});

test('make:popover - a divider right before the first destructive action, only once', () => {
  const html = renderPopover({
    triggerLabel: 'Options',
    triggerColor: 'btn-secondary',
    triggerIcon: '',
    id: 'menu3',
    items: [
      { label: 'View', icon: '', danger: false },
      { label: 'Rename', icon: '', danger: false },
      { label: 'Delete', icon: '', danger: true },
      { label: 'Delete permanently', icon: '', danger: true },
    ],
  });
  assert.equal((html.match(/<hr class="modal-divider my-1" \/>/g) ?? []).length, 1);
  const dividerIndex = html.indexOf('<hr class="modal-divider my-1" />');
  const deleteIndex = html.indexOf('Delete<');
  assert.ok(dividerIndex < deleteIndex, 'the divider should be BEFORE the first destructive action');
});

test('make:popover - no divider when the first item is already destructive', () => {
  const html = renderPopover({
    triggerLabel: 'Options',
    triggerColor: 'btn-secondary',
    triggerIcon: '',
    id: 'menu4',
    items: [{ label: 'Delete', icon: '', danger: true }],
  });
  assert.doesNotMatch(html, /<hr/);
  assert.match(html, /popover-action-btn text-danger/);
});
