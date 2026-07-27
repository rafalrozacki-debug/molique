/**
 * molique-jit - testy `make:dropdown`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderDropdownDetails, renderDropdownPopover } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-dropdown.js')).href
);

test('make:dropdown - Klasyczny (<details>): dropdown-toggle + btn + kolor, wszystkie 3 klasy', () => {
  const html = renderDropdownDetails({
    triggerLabel: 'Opcje',
    triggerClass: 'btn-outline-dark',
    alignEnd: false,
    items: [{ label: 'Edytuj', danger: false }],
  });
  assert.match(html, /<details class="dropdown">/);
  assert.match(html, /<summary class="dropdown-toggle btn-outline-dark">Opcje<\/summary>/);
  assert.doesNotMatch(html, /dropdown-menu-end/);
});

test('make:dropdown - Popover: przycisk z popovertarget, menu z popover+id zgodnym', () => {
  const html = renderDropdownPopover({
    triggerLabel: 'Akcje',
    triggerClass: 'btn-primary',
    alignEnd: false,
    id: 'pop-menu-2',
    items: [{ label: 'Pobierz raport', danger: false }],
  });
  assert.match(html, /<button class="btn-primary" popovertarget="pop-menu-2">Akcje<\/button>/);
  assert.match(html, /<div class="dropdown-menu" popover id="pop-menu-2">/);
});

test('make:dropdown - alignEnd dodaje .dropdown-menu-end w obu wariantach', () => {
  const details = renderDropdownDetails({
    triggerLabel: 'X',
    triggerClass: 'btn-primary',
    alignEnd: true,
    items: [{ label: 'A', danger: false }],
  });
  const popover = renderDropdownPopover({
    triggerLabel: 'X',
    triggerClass: 'btn-primary',
    alignEnd: true,
    id: 'm1',
    items: [{ label: 'A', danger: false }],
  });
  assert.match(details, /class="dropdown-menu dropdown-menu-end"/);
  assert.match(popover, /class="dropdown-menu dropdown-menu-end" popover/);
});

test('make:dropdown - pozycja destrukcyjna dostaje text-danger, reszta nie', () => {
  const html = renderDropdownPopover({
    triggerLabel: 'Akcje',
    triggerClass: 'btn-primary',
    alignEnd: false,
    id: 'm2',
    items: [
      { label: 'Pobierz raport', danger: false },
      { label: 'Usun', danger: true },
    ],
  });
  assert.match(html, /class="dropdown-item">Pobierz raport/);
  assert.match(html, /class="dropdown-item text-danger">Usun/);
});
