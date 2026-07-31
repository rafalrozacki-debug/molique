/**
 * molique-jit - `make:lightbox` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderLightbox } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-lightbox.js')).href
);

test('make:lightbox - every link has data-lightbox and a shared data-gallery', () => {
  const html = renderLightbox({
    gallery: 'projects',
    items: [
      { thumbImg: 'mini-1.jpg', fullImg: 'full-1.jpg', alt: 'Photo 1' },
      { thumbImg: 'mini-2.jpg', fullImg: 'full-2.jpg', alt: 'Photo 2' },
    ],
  });
  assert.equal((html.match(/data-lightbox/g) ?? []).length, 2);
  assert.equal((html.match(/data-gallery="projects"/g) ?? []).length, 2);
});

test('make:lightbox - href points to the FULL photo, <img> src to the THUMBNAIL (different values)', () => {
  const html = renderLightbox({
    gallery: 'g',
    items: [{ thumbImg: 'mini.jpg', fullImg: 'full.jpg', alt: 'X' }],
  });
  assert.match(html, /href="full\.jpg"/);
  assert.match(html, /src="mini\.jpg"/);
});

test('make:lightbox - no modal/overlay markup at all (JS builds it)', () => {
  const html = renderLightbox({ gallery: 'g', items: [{ thumbImg: 'a.jpg', fullImg: 'b.jpg', alt: 'X' }] });
  assert.doesNotMatch(html, /lightbox-overlay|lightbox-content|lightbox-nav/);
});
