/**
 * molique-jit - `make:dropdown` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderDropdownDetails, renderDropdownPopover } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-dropdown.js')).href
);

test('make:dropdown - Classic (<details>): dropdown-toggle + btn + color, all 3 classes', () => {
  const html = renderDropdownDetails({
    triggerLabel: 'Options',
    triggerClass: 'btn-outline-dark',
    alignEnd: false,
    items: [{ label: 'Edit', danger: false }],
  });
  assert.match(html, /<details class="dropdown">/);
  assert.match(html, /<summary class="dropdown-toggle btn-outline-dark">Options<\/summary>/);
  assert.doesNotMatch(html, /dropdown-menu-end/);
});

test('make:dropdown - Popover: button with popovertarget, menu with a matching popover+id', () => {
  const html = renderDropdownPopover({
    triggerLabel: 'Actions',
    triggerClass: 'btn-primary',
    alignEnd: false,
    id: 'pop-menu-2',
    items: [{ label: 'Download report', danger: false }],
  });
  assert.match(html, /<button class="btn-primary" popovertarget="pop-menu-2">Actions<\/button>/);
  assert.match(html, /<div class="dropdown-menu" popover id="pop-menu-2">/);
});

test('make:dropdown - alignEnd adds .dropdown-menu-end in both variants', () => {
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

test('make:dropdown - a destructive item gets text-danger, the rest do not', () => {
  const html = renderDropdownPopover({
    triggerLabel: 'Actions',
    triggerClass: 'btn-primary',
    alignEnd: false,
    id: 'm2',
    items: [
      { label: 'Download report', danger: false },
      { label: 'Delete', danger: true },
    ],
  });
  assert.match(html, /class="dropdown-item">Download report/);
  assert.match(html, /class="dropdown-item text-danger">Delete/);
});
