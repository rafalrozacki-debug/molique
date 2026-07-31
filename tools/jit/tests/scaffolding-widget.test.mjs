/**
 * molique-jit - `make:widget` tests (Stage B.5)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderSpeedDial, renderBeforeAfter, renderStepper, renderShareBar } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-widget.js')).href
);

test('make:widget - Speed Dial: main symbol + N actions with icons', () => {
  const html = renderSpeedDial({
    mainSymbol: '+',
    actions: [
      { label: 'Send an email', icon: 'ph-envelope-simple' },
      { label: 'Call', icon: 'ph-phone' },
    ],
  });
  assert.match(html, /<!-- Requires: css\/molique-style-speed-dial\.css -->/);
  assert.match(html, /<button class="speed-dial-main shadow-lg">\+<\/button>/);
  assert.equal((html.match(/class="speed-dial-action"/g) ?? []).length, 2); // NOT "speed-dial-actions" (the wrapper)
  assert.match(html, /aria-label="Send an email"/);
});

test('make:widget - Before/After: both photos + max-width/aspect-ratio in the style', () => {
  const html = renderBeforeAfter({
    afterImg: 'img/after.jpg',
    afterAlt: 'After',
    beforeImg: 'img/before.jpg',
    beforeAlt: 'Before',
    maxWidth: '600px',
    aspectRatio: '16/9',
  });
  assert.match(html, /style="max-width: 600px; width: 100%; aspect-ratio: 16\/9"/);
  assert.match(html, /class="before-after-img img-after"/);
  assert.match(html, /class="before-after-img img-before"/);
});

test('make:widget - Numbered Stepper: steps before the active one = is-completed, the active one = is-active', () => {
  const html = renderStepper({
    variant: 'numbered',
    labels: ['Dimensions', 'Construction', 'Roof'],
    activeLabel: 'Construction',
  });
  assert.match(html, /class="stepper stepper-numbered w-100"/);
  assert.match(html, /class="step is-completed">\s*<div class="step-line">/);
  assert.match(html, /class="step is-active">\s*<div class="step-line">/);
  // Every step, including the last, has .step-line - CSS itself hides it on the last-child.
  assert.equal((html.match(/class="step-line">/g) ?? []).length, 3);
});

test('make:widget - Classic Stepper: only is-active, no stepper-numbered/step-line', () => {
  const html = renderStepper({ variant: 'classic', labels: ['Step 1', 'Step 2'], activeLabel: 'Step 1' });
  assert.match(html, /class="stepper w-100"/);
  assert.doesNotMatch(html, /stepper-numbered/);
  assert.doesNotMatch(html, /step-line/);
  assert.doesNotMatch(html, /is-completed/);
});

test('make:widget - Share Bar: network order follows NETWORK_ORDER, regardless of the JSON order', () => {
  const html = renderShareBar({ networks: ['native', 'facebook'] }); // deliberately reversed order
  const facebookIndex = html.indexOf('data-network="facebook"');
  const nativeIndex = html.indexOf('data-network="native"');
  assert.ok(facebookIndex < nativeIndex, 'facebook should appear before native, regardless of input order');
});

test('make:widget - Share Bar: native gets an icon + aria-label, not a letter', () => {
  const html = renderShareBar({ networks: ['native'] });
  assert.match(html, /aria-label="Share"/);
  assert.match(html, /icons-sprite\.svg#ph-export/);
});
