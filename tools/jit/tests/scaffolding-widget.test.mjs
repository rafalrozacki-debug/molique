/**
 * molique-jit - testy `make:widget` (Etap B.5)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderSpeedDial, renderBeforeAfter, renderStepper, renderShareBar } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-widget.js')).href
);

test('make:widget - Speed Dial: symbol glowny + N akcji z ikonami', () => {
  const html = renderSpeedDial({
    mainSymbol: '+',
    actions: [
      { label: 'Napisz maila', icon: 'ph-envelope-simple' },
      { label: 'Zadzwon', icon: 'ph-phone' },
    ],
  });
  assert.match(html, /<!-- Wymaga: css\/molique-style-speed-dial\.css -->/);
  assert.match(html, /<button class="speed-dial-main shadow-lg">\+<\/button>/);
  assert.equal((html.match(/class="speed-dial-action"/g) ?? []).length, 2); // NIE "speed-dial-actions" (wrapper)
  assert.match(html, /aria-label="Napisz maila"/);
});

test('make:widget - Before/After: oba zdjecia + max-width/aspect-ratio w stylu', () => {
  const html = renderBeforeAfter({
    afterImg: 'img/after.jpg',
    afterAlt: 'Po',
    beforeImg: 'img/before.jpg',
    beforeAlt: 'Przed',
    maxWidth: '600px',
    aspectRatio: '16/9',
  });
  assert.match(html, /style="max-width: 600px; width: 100%; aspect-ratio: 16\/9"/);
  assert.match(html, /class="before-after-img img-after"/);
  assert.match(html, /class="before-after-img img-before"/);
});

test('make:widget - Stepper numerowany: kroki przed aktywnym = is-completed, aktywny = is-active', () => {
  const html = renderStepper({
    variant: 'numbered',
    labels: ['Wymiary', 'Konstrukcja', 'Dach'],
    activeLabel: 'Konstrukcja',
  });
  assert.match(html, /class="stepper stepper-numbered w-100"/);
  assert.match(html, /class="step is-completed">\s*<div class="step-line">/);
  assert.match(html, /class="step is-active">\s*<div class="step-line">/);
  // Kazdy krok, w tym ostatni, ma .step-line - CSS sam go ukrywa na last-child.
  assert.equal((html.match(/class="step-line">/g) ?? []).length, 3);
});

test('make:widget - Stepper klasyczny: tylko is-active, brak stepper-numbered/step-line', () => {
  const html = renderStepper({ variant: 'classic', labels: ['Krok 1', 'Krok 2'], activeLabel: 'Krok 1' });
  assert.match(html, /class="stepper w-100"/);
  assert.doesNotMatch(html, /stepper-numbered/);
  assert.doesNotMatch(html, /step-line/);
  assert.doesNotMatch(html, /is-completed/);
});

test('make:widget - Share Bar: kolejnosc sieci wg NETWORK_ORDER, niezaleznie od kolejnosci w JSON', () => {
  const html = renderShareBar({ networks: ['native', 'facebook'] }); // celowo odwrotna kolejnosc
  const facebookIndex = html.indexOf('data-network="facebook"');
  const nativeIndex = html.indexOf('data-network="native"');
  assert.ok(facebookIndex < nativeIndex, 'facebook powinien wystapic przed native, niezaleznie od kolejnosci wejsciowej');
});

test('make:widget - Share Bar: native dostaje ikone + aria-label, nie litere', () => {
  const html = renderShareBar({ networks: ['native'] });
  assert.match(html, /aria-label="Udostepnij"/);
  assert.match(html, /icons-sprite\.svg#ph-export/);
});
