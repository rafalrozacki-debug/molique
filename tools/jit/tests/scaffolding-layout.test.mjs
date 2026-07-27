/**
 * molique-jit - testy `make:layout` (Etap B.6)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAdminDashboard, renderHeroSimple, renderHeroCutout, renderBento } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-layout.js')).href
);

test('make:layout - Admin: pierwsza pozycja menu dostaje is-active, reszta nie', () => {
  const html = renderAdminDashboard({ floating: false, logo: 'Logo', items: ['Dashboard', 'Klienci', 'Ustawienia'] });
  assert.doesNotMatch(html, /admin-layout-floating/);
  assert.match(html, /class="admin-nav-link is-active">Dashboard/);
  assert.doesNotMatch(html, /class="admin-nav-link is-active">Klienci/);
  assert.match(html, /class="admin-nav-link">Klienci/);
});

test('make:layout - Admin: floating dodaje klase admin-layout-floating', () => {
  const html = renderAdminDashboard({ floating: true, logo: 'Logo', items: ['Dashboard'] });
  assert.match(html, /class="admin-layout admin-layout-floating"/);
});

test('make:layout - Hero Simple: ostatni breadcrumb bez linku, z aria-current i is-active', () => {
  const html = renderHeroSimple({
    title: 'Tytul',
    imageUrl: 'img/hero-bg.jpg',
    overlayColorClass: 'overlay-dark',
    overlayOpacityClass: 'overlay-70',
    breadcrumbLabels: ['Start', 'Ta strona'],
  });
  assert.match(html, /overlay overlay-dark overlay-70/);
  assert.match(html, /<a href="#" class="text-white opacity-75">Start<\/a>/);
  assert.match(html, /class="breadcrumb-item is-active" aria-current="page">Ta strona</);
  assert.doesNotMatch(html, /<a[^>]*>Ta strona<\/a>/); // ostatni element NIE jest linkiem
});

test('make:layout - Hero Cutout: wybrany rog trafia do klasy i komentarza', () => {
  const html = renderHeroCutout({
    title: 'Zbuduj to',
    message: 'Opis',
    imageUrl: 'img/hero-bg.jpg',
    imageAlt: 'Tlo',
    cutoutVariant: 'cutout-md-tl',
  });
  assert.match(html, /class="cutout-wrapper cutout-md-tl w-100 w-md-50"/);
  assert.match(html, /<img src="img\/hero-bg\.jpg" alt="Tlo" \/>/);
});

test('make:layout - Bento: rozmiar kafelka mapuje sie na poprawne klasy bento-col/row', () => {
  const html = renderBento({
    tiles: [
      { label: 'Duzy', size: 'big' },
      { label: 'Szeroki', size: 'wide' },
      { label: 'Wysoki', size: 'tall' },
      { label: 'Normalny', size: 'normal' },
    ],
  });
  assert.match(html, /class="bento-col-2 bento-row-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Duzy/);
  assert.match(html, /class="bento-col-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Szeroki/);
  assert.match(html, /class="bento-row-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Wysoki/);
  assert.match(html, /class="hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Normalny/);
});
