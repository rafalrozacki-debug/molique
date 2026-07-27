/**
 * molique-jit - testy `make:carousel`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCarouselBasic, renderCarouselBgSync } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-carousel.js')).href
);

test('make:carousel - Podstawowa: strzalki maja aria-label, brak kropek w markupie', () => {
  const html = renderCarouselBasic({
    maxWidth: '600px',
    slides: [{ title: 'Slajd 1', text: 'Tekst', color: 'primary' }],
  });
  assert.match(html, /aria-label="Poprzedni"/);
  assert.match(html, /aria-label="Nastepny"/);
  assert.doesNotMatch(html, /carousel-dot/); // kropki generuje JS, nie generator
});

test('make:carousel - primary/dark/secondary dostaja text-white, success/danger/warning/info nie', () => {
  const light = renderCarouselBasic({ maxWidth: '600px', slides: [{ title: 'A', text: 'A', color: 'primary' }] });
  const dark = renderCarouselBasic({ maxWidth: '600px', slides: [{ title: 'A', text: 'A', color: 'success' }] });
  assert.match(light, /bg-primary text-white/);
  assert.match(dark, /bg-success rounded-2/);
  assert.doesNotMatch(dark, /bg-success text-white/);
});

test('make:carousel - BG-Sync: data-bg na slajdzie, overlay obecny, brak inline z-index (juz w CSS)', () => {
  const html = renderCarouselBgSync({
    height: '400px',
    slides: [{ bg: 'img/a.jpg', heading: 'Architektura' }],
  });
  assert.match(html, /class="carousel carousel-bg-sync w-100" style="height: 400px"/);
  assert.match(html, /class="carousel-bg-overlay">/);
  assert.match(html, /data-bg="img\/a\.jpg"/);
  assert.doesNotMatch(html, /z-index/);
});

test('make:carousel - BG-Sync: strzalki tez maja aria-label (poprawka wzgledem realnego przykladu)', () => {
  const html = renderCarouselBgSync({ height: '400px', slides: [{ bg: 'a.jpg', heading: 'A' }] });
  assert.match(html, /aria-label="Poprzedni"/);
  assert.match(html, /aria-label="Nastepny"/);
});
