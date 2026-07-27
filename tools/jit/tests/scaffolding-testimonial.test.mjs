/**
 * molique-jit - testy `make:testimonial`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTestimonial } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-testimonial.js')).href
);

test('make:testimonial - 5 gwiazdek renderuje 5 ikon SVG, bez separatora (skleja jak zywy podglad)', () => {
  const html = renderTestimonial({ starCount: 5, quote: 'Q', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.equal((html.match(/ph-star--fill/g) ?? []).length, 5);
  assert.match(html, /<div class="testimonial-stars"><svg[^>]*><use[^>]*><\/use><\/svg><svg/);
});

test('make:testimonial - 0 gwiazdek daje pusty .testimonial-stars', () => {
  const html = renderTestimonial({ starCount: 0, quote: 'Q', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.match(html, /<div class="testimonial-stars"><\/div>/);
});

test('make:testimonial - cytat jest owiniety w cudzyslowy przez stub, uzytkownik ich nie wpisuje', () => {
  const html = renderTestimonial({ starCount: 3, quote: 'Swietny framework!', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.match(html, /<p class="testimonial-quote">"Swietny framework!"<\/p>/);
});
