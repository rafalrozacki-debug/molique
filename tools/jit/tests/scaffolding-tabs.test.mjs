/**
 * molique-jit - testy `make:tabs`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTabs } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-tabs.js')).href
);

test('make:tabs - Klasyczny: pierwszy input dostaje checked, reszta nie', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'my-tabs',
    tabs: [
      { label: 'Opis', content: 'Tresc 1' },
      { label: 'Specyfikacja', content: 'Tresc 2' },
    ],
  });
  assert.match(html, /<div class="tabs w-100">/);
  assert.match(html, /id="my-tabs-1" class="tab-input" checked/);
  assert.doesNotMatch(html, /id="my-tabs-2" class="tab-input" checked/);
  assert.match(html, /<label for="my-tabs-1" class="tab-label">Opis<\/label>/);
  assert.doesNotMatch(html, /tabs-pill/);
});

test('make:tabs - wszystkie inputy dziela ta sama nazwe grupy (name=)', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'grupa-x',
    tabs: [
      { label: 'A', content: 'a' },
      { label: 'B', content: 'b' },
      { label: 'C', content: 'c' },
    ],
  });
  assert.equal((html.match(/name="grupa-x"/g) ?? []).length, 3);
});

test('make:tabs - Pill: dodaje klase, --tab-count rowny liczbie zakladek, i pusty wskaznik', () => {
  const html = renderTabs({
    type: 'pill',
    groupName: 'pill-tabs',
    tabs: [
      { label: 'Dzien', content: 'A' },
      { label: 'Tydzien', content: 'B' },
      { label: 'Miesiac', content: 'C' },
    ],
  });
  assert.match(html, /class="tabs tabs-pill w-100" style="--tab-count: 3;"/);
  assert.match(html, /<div class="tabs-pill-indicator"><\/div>/);
});

test('make:tabs - ID inputow i for= etykiet sa spojne (para {groupName}-{i})', () => {
  const html = renderTabs({
    type: 'classic',
    groupName: 'g',
    tabs: [{ label: 'A', content: 'x' }, { label: 'B', content: 'y' }],
  });
  assert.match(html, /id="g-2" class="tab-input"/);
  assert.match(html, /for="g-2" class="tab-label">B/);
});
