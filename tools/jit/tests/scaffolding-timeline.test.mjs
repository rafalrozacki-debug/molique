/**
 * molique-jit - testy `make:timeline`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTimelineLarge, renderTimelineNumbered, renderTimelineLabeled } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-timeline.js')).href
);

test('make:timeline - Large: kazda pozycja ma timeline-badge z tekstem', () => {
  const html = renderTimelineLarge({
    items: [
      { badge: 'A', title: 'Etap 1', description: 'Opis 1' },
      { badge: 'B', title: 'Etap 2', description: 'Opis 2' },
    ],
  });
  assert.match(html, /class="timeline timeline-large m-0"/);
  assert.match(html, /class="timeline-badge">A</);
  assert.match(html, /class="timeline-badge">B</);
});

test('make:timeline - Numbered: brak timeline-badge, CSS sam numeruje', () => {
  const html = renderTimelineNumbered({
    items: [
      { title: 'Krok 1', description: 'Opis 1' },
      { title: 'Krok 2', description: 'Opis 2' },
    ],
  });
  assert.match(html, /class="timeline timeline-numbered m-0"/);
  assert.doesNotMatch(html, /timeline-badge/);
});

test('make:timeline - Labeled: kolor kropki dodaje klase node-<kolor>, pusty = bez klasy', () => {
  const html = renderTimelineLabeled({
    items: [
      { dateLabel: '30.06.2026', timeLabel: '16:44', nodeColor: 'success', title: 'A', description: 'B' },
      { dateLabel: '29.06.2026', timeLabel: '7:15', nodeColor: '', title: 'C', description: 'D' },
    ],
  });
  assert.match(html, /class="timeline-node node-success">/);
  assert.match(html, /class="timeline-node">/);
});

test('make:timeline - Labeled: kazda pozycja ma timeline-line (CSS sam ukrywa u ostatniej)', () => {
  const html = renderTimelineLabeled({
    items: [
      { dateLabel: 'A', timeLabel: 'A', nodeColor: '', title: 'A', description: 'A' },
      { dateLabel: 'B', timeLabel: 'B', nodeColor: '', title: 'B', description: 'B' },
      { dateLabel: 'C', timeLabel: 'C', nodeColor: '', title: 'C', description: 'C' },
    ],
  });
  assert.equal((html.match(/class="timeline-line">/g) ?? []).length, 3);
});
