/**
 * molique-jit - testy `make:lightbox`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderLightbox } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-lightbox.js')).href
);

test('make:lightbox - kazdy link ma data-lightbox i wspolna data-gallery', () => {
  const html = renderLightbox({
    gallery: 'realizacje',
    items: [
      { thumbImg: 'mini-1.jpg', fullImg: 'pelne-1.jpg', alt: 'Foto 1' },
      { thumbImg: 'mini-2.jpg', fullImg: 'pelne-2.jpg', alt: 'Foto 2' },
    ],
  });
  assert.equal((html.match(/data-lightbox/g) ?? []).length, 2);
  assert.equal((html.match(/data-gallery="realizacje"/g) ?? []).length, 2);
});

test('make:lightbox - href to PELNE zdjecie, src <img> to MINIATURA (rozne wartosci)', () => {
  const html = renderLightbox({
    gallery: 'g',
    items: [{ thumbImg: 'mini.jpg', fullImg: 'pelne.jpg', alt: 'X' }],
  });
  assert.match(html, /href="pelne\.jpg"/);
  assert.match(html, /src="mini\.jpg"/);
});

test('make:lightbox - brak zadnego markupu modala/overlay (buduje go JS)', () => {
  const html = renderLightbox({ gallery: 'g', items: [{ thumbImg: 'a.jpg', fullImg: 'b.jpg', alt: 'X' }] });
  assert.doesNotMatch(html, /lightbox-overlay|lightbox-content|lightbox-nav/);
});
