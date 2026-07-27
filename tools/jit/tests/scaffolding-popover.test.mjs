/**
 * molique-jit - testy `make:popover` (Etap B.2)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPopover } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-popover.js')).href
);

test('make:popover - ANCHOR_NAME wyprowadzony z ID, ikona przy przycisku', () => {
  const html = renderPopover({
    triggerLabel: 'Opcje',
    triggerColor: 'btn-secondary',
    triggerIcon: 'ph-gear',
    id: 'ctxMenu1',
    items: [{ label: 'Podglad', icon: 'ph-eye', danger: false }],
  });
  assert.match(html, /popovertarget="ctxMenu1" style="anchor-name: --anchor-ctxMenu1"/);
  assert.match(html, /id="ctxMenu1" popover class="popover-context" style="position-anchor: --anchor-ctxMenu1"/);
  assert.match(html, /Opcje <svg/);
});

test('make:popover - bez ikony przy przycisku, TRIGGER_CONTENT to sama etykieta', () => {
  const html = renderPopover({
    triggerLabel: 'Opcje',
    triggerColor: 'btn-primary',
    triggerIcon: '',
    id: 'menu2',
    items: [{ label: 'A', icon: '', danger: false }],
  });
  assert.match(html, />\s*Opcje\s*<\/button>/);
});

test('make:popover - divider tuz przed pierwsza akcja destrukcyjna, tylko raz', () => {
  const html = renderPopover({
    triggerLabel: 'Opcje',
    triggerColor: 'btn-secondary',
    triggerIcon: '',
    id: 'menu3',
    items: [
      { label: 'Podglad', icon: '', danger: false },
      { label: 'Zmien nazwe', icon: '', danger: false },
      { label: 'Usun', icon: '', danger: true },
      { label: 'Usun trwale', icon: '', danger: true },
    ],
  });
  assert.equal((html.match(/<hr class="modal-divider my-1" \/>/g) ?? []).length, 1);
  const dividerIndex = html.indexOf('<hr class="modal-divider my-1" />');
  const usunIndex = html.indexOf('Usun<');
  assert.ok(dividerIndex < usunIndex, 'divider powinien byc PRZED pierwsza akcja destrukcyjna');
});

test('make:popover - brak dividera, gdy pierwsza pozycja juz jest destrukcyjna', () => {
  const html = renderPopover({
    triggerLabel: 'Opcje',
    triggerColor: 'btn-secondary',
    triggerIcon: '',
    id: 'menu4',
    items: [{ label: 'Usun', icon: '', danger: true }],
  });
  assert.doesNotMatch(html, /<hr/);
  assert.match(html, /popover-action-btn text-danger/);
});
