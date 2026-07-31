/**
 * molique-jit - `make:tabs` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTabs } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-tabs.js')).href
);

test('make:tabs - Classic: the first input gets checked, the rest do not', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'my-tabs',
    tabs: [
      { label: 'Description', content: 'Content 1' },
      { label: 'Specification', content: 'Content 2' },
    ],
  });
  assert.match(html, /<div class="tabs w-100">/);
  assert.match(html, /id="my-tabs-1" class="tab-input" checked/);
  assert.doesNotMatch(html, /id="my-tabs-2" class="tab-input" checked/);
  assert.match(html, /<label for="my-tabs-1" class="tab-label">Description<\/label>/);
  assert.doesNotMatch(html, /tabs-pill/);
});

test('make:tabs - all inputs share the same group name (name=)', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'group-x',
    tabs: [
      { label: 'A', content: 'a' },
      { label: 'B', content: 'b' },
      { label: 'C', content: 'c' },
    ],
  });
  assert.equal((html.match(/name="group-x"/g) ?? []).length, 3);
});

test('make:tabs - Pill: adds the class, --tab-count equal to the number of tabs, and an empty indicator', () => {
  const html = renderTabs({
    type: 'pill',
    groupName: 'pill-tabs',
    tabs: [
      { label: 'Day', content: 'A' },
      { label: 'Week', content: 'B' },
      { label: 'Month', content: 'C' },
    ],
  });
  assert.match(html, /class="tabs tabs-pill w-100" style="--tab-count: 3;"/);
  assert.match(html, /<div class="tabs-pill-indicator"><\/div>/);
});

test('make:tabs - input IDs and label for= are consistent (a {groupName}-{i} pair)', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'g',
    tabs: [{ label: 'A', content: 'x' }, { label: 'B', content: 'y' }],
  });
  assert.match(html, /id="g-2" class="tab-input"/);
  assert.match(html, /for="g-2" class="tab-label">B/);
});
