/**
 * molique-jit - `make:testimonial` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderTestimonial } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-testimonial.js')).href
);

test('make:testimonial - 5 stars render 5 SVG icons, with no separator (joined like in the live preview)', () => {
  const html = renderTestimonial({ starCount: 5, quote: 'Q', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.equal((html.match(/ph-star--fill/g) ?? []).length, 5);
  assert.match(html, /<div class="testimonial-stars"><svg[^>]*><use[^>]*><\/use><\/svg><svg/);
});

test('make:testimonial - 0 stars produce an empty .testimonial-stars', () => {
  const html = renderTestimonial({ starCount: 0, quote: 'Q', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.match(html, /<div class="testimonial-stars"><\/div>/);
});

test('make:testimonial - the quote is wrapped in quotation marks by the stub, the user does not type them', () => {
  const html = renderTestimonial({ starCount: 3, quote: 'Great framework!', avatarUrl: 'a.jpg', avatarAlt: 'A', name: 'N', role: 'R' });
  assert.match(html, /<p class="testimonial-quote">"Great framework!"<\/p>/);
});
