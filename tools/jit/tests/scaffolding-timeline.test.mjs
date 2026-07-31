/**
 * molique-jit - `make:timeline` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTimelineLarge, renderTimelineNumbered, renderTimelineLabeled } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-timeline.js')).href
);

test('make:timeline - Large: every item has a timeline-badge with text', () => {
  const html = renderTimelineLarge({
    items: [
      { badge: 'A', title: 'Stage 1', description: 'Description 1' },
      { badge: 'B', title: 'Stage 2', description: 'Description 2' },
    ],
  });
  assert.match(html, /class="timeline timeline-large m-0"/);
  assert.match(html, /class="timeline-badge">A</);
  assert.match(html, /class="timeline-badge">B</);
});

test('make:timeline - Numbered: no timeline-badge, CSS numbers it automatically', () => {
  const html = renderTimelineNumbered({
    items: [
      { title: 'Step 1', description: 'Description 1' },
      { title: 'Step 2', description: 'Description 2' },
    ],
  });
  assert.match(html, /class="timeline timeline-numbered m-0"/);
  assert.doesNotMatch(html, /timeline-badge/);
});

test('make:timeline - Labeled: the node color adds a node-<color> class, empty = no class', () => {
  const html = renderTimelineLabeled({
    items: [
      { dateLabel: '06/30/2026', timeLabel: '16:44', nodeColor: 'success', title: 'A', description: 'B' },
      { dateLabel: '06/29/2026', timeLabel: '7:15', nodeColor: '', title: 'C', description: 'D' },
    ],
  });
  assert.match(html, /class="timeline-node node-success">/);
  assert.match(html, /class="timeline-node">/);
});

test('make:timeline - Labeled: every item has timeline-line (CSS hides it on the last one itself)', () => {
  const html = renderTimelineLabeled({
    items: [
      { dateLabel: 'A', timeLabel: 'A', nodeColor: '', title: 'A', description: 'A' },
      { dateLabel: 'B', timeLabel: 'B', nodeColor: '', title: 'B', description: 'B' },
      { dateLabel: 'C', timeLabel: 'C', nodeColor: '', title: 'C', description: 'C' },
    ],
  });
  assert.equal((html.match(/class="timeline-line">/g) ?? []).length, 3);
});
