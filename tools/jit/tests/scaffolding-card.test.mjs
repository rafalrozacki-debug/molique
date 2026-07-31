/**
 * molique-jit - `make:card` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCardClassic, renderFeaturedBox, renderThumbInfoCenter, renderThumbInfoBottom, renderInteractiveCard } =
  await import(pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-card.js')).href);

test('make:card classic - btn-primary without the "btn " prefix (new implication convention)', () => {
  const html = renderCardClassic({ title: 'Card Title', body: 'Content.', footerButtonLabel: 'Action' });
  assert.match(html, /<div class="card-header">Card Title<\/div>/);
  assert.match(html, /<button class="btn-primary btn-sm">Action<\/button>/);
  assert.doesNotMatch(html, /btn btn-primary/);
});

test('make:card featured-box - the primary (default) color adds no style or color classes', () => {
  const html = renderFeaturedBox({ icon: 'ph-rocket-launch', title: 'Performance', description: 'Description.', accentColor: 'primary' });
  assert.match(html, /<div class="featured-box">/);
  assert.match(html, /<div class="featured-box-icon">/);
  assert.doesNotMatch(html, /style=/);
});

test('make:card featured-box - a custom color adds border-top-color and bg-<color> text-white', () => {
  const html = renderFeaturedBox({ icon: 'ph-check', title: 'Effectiveness', description: 'Description.', accentColor: 'success' });
  assert.match(html, /<div class="featured-box" style="border-top-color: var\(--success\)">/);
  assert.match(html, /<div class="featured-box-icon bg-success text-white">/);
});

test('make:card thumb-info-center - text-6, magnifying glass icon, no badge', () => {
  const html = renderThumbInfoCenter({ imageUrl: 'img/a.jpg', imageAlt: 'Project', title: 'Enlarge photo' });
  assert.match(html, /class="thumb-info thumb-info-center shadow-sm"/);
  assert.match(html, /ph-magnifying-glass/);
  assert.match(html, /<h3 class="thumb-info-title text-6 fw-bold">Enlarge photo<\/h3>/);
});

test('make:card thumb-info-bottom - with a badge, without thumb-info-light', () => {
  const html = renderThumbInfoBottom({ imageUrl: 'img/a.jpg', imageAlt: 'Project', title: 'Mobile App', badge: 'New', light: false });
  assert.match(html, /class="thumb-info thumb-info-bottom shadow-sm"/);
  assert.match(html, /<span class="badge badge-primary mb-2 align-self-start">New<\/span>/);
  assert.match(html, /<h3 class="thumb-info-title text-7 fw-bold m-0">Mobile App<\/h3>/);
});

test('make:card thumb-info-bottom - the light variant without a badge omits the badge span', () => {
  const html = renderThumbInfoBottom({ imageUrl: 'img/a.jpg', imageAlt: 'Project', title: 'Light Overlay', badge: '', light: true });
  assert.match(html, /class="thumb-info thumb-info-bottom thumb-info-light shadow-sm"/);
  assert.doesNotMatch(html, /badge-primary/);
});

test('make:card interactive - spring-shadow uses text-muted on the description', () => {
  const html = renderInteractiveCard({ icon: 'ph-cursor-click', title: 'Spring Hover', description: '.hover-spring', effect: 'spring-shadow' });
  assert.match(html, /class="card p-4 text-center hover-gpu-shadow hover-spring cursor-pointer"/);
  assert.match(html, /<p class="text-muted text-4 m-0">\.hover-spring<\/p>/);
});

test('make:card interactive - tilt uses bg-dark text-white and text-white opacity-50 on the description (not text-muted)', () => {
  const html = renderInteractiveCard({ icon: 'ph-cube', title: '3D Tilt (JS)', description: '.tilt-card', effect: 'tilt' });
  assert.match(html, /class="card p-4 text-center tilt-card bg-dark text-white cursor-pointer"/);
  assert.match(html, /<p class="text-white opacity-50 text-4 m-0">\.tilt-card<\/p>/);
  assert.doesNotMatch(html, /text-muted/);
});
