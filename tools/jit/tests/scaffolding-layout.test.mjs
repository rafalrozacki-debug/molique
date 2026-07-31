/**
 * molique-jit - `make:layout` tests (Stage B.6)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAdminDashboard, renderHeroSimple, renderHeroCutout, renderBento } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-layout.js')).href
);

test('make:layout - Admin: the first menu item gets is-active, the rest do not', () => {
  const html = renderAdminDashboard({ floating: false, logo: 'Logo', items: ['Dashboard', 'Customers', 'Settings'] });
  assert.doesNotMatch(html, /admin-layout-floating/);
  assert.match(html, /class="admin-nav-link is-active">Dashboard/);
  assert.doesNotMatch(html, /class="admin-nav-link is-active">Customers/);
  assert.match(html, /class="admin-nav-link">Customers/);
});

test('make:layout - Admin: floating adds the admin-layout-floating class', () => {
  const html = renderAdminDashboard({ floating: true, logo: 'Logo', items: ['Dashboard'] });
  assert.match(html, /class="admin-layout admin-layout-floating"/);
});

test('make:layout - Hero Simple: the last breadcrumb item has no link, with aria-current and is-active', () => {
  const html = renderHeroSimple({
    title: 'Title',
    imageUrl: 'img/hero-bg.jpg',
    overlayColorClass: 'overlay-dark',
    overlayOpacityClass: 'overlay-70',
    breadcrumbLabels: ['Start', 'This page'],
  });
  assert.match(html, /overlay overlay-dark overlay-70/);
  assert.match(html, /<a href="#" class="text-white opacity-75">Start<\/a>/);
  assert.match(html, /class="breadcrumb-item is-active" aria-current="page">This page</);
  assert.doesNotMatch(html, /<a[^>]*>This page<\/a>/); // the last item is NOT a link
});

test('make:layout - Hero Cutout: the chosen corner lands in the class and the comment', () => {
  const html = renderHeroCutout({
    title: 'Build it',
    message: 'Description',
    imageUrl: 'img/hero-bg.jpg',
    imageAlt: 'Background',
    cutoutVariant: 'cutout-md-tl',
  });
  assert.match(html, /class="cutout-wrapper cutout-md-tl w-100 w-md-50"/);
  assert.match(html, /<img src="img\/hero-bg\.jpg" alt="Background" \/>/);
});

test('make:layout - Bento: tile size maps to the correct bento-col/row classes', () => {
  const html = renderBento({
    tiles: [
      { label: 'Big', size: 'big' },
      { label: 'Wide', size: 'wide' },
      { label: 'Tall', size: 'tall' },
      { label: 'Normal', size: 'normal' },
    ],
  });
  assert.match(html, /class="bento-col-2 bento-row-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Big/);
  assert.match(html, /class="bento-col-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Wide/);
  assert.match(html, /class="bento-row-2 hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Tall/);
  assert.match(html, /class="hover-gpu-shadow p-4">\s*<h2 class="fw-bold">Normal/);
});
