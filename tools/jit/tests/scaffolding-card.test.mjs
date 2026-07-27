/**
 * molique-jit - testy `make:card`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCardClassic, renderFeaturedBox, renderThumbInfoCenter, renderThumbInfoBottom, renderInteractiveCard } =
  await import(pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-card.js')).href);

test('make:card classic - btn-primary bez prefiksu "btn " (nowa konwencja implikacji)', () => {
  const html = renderCardClassic({ title: 'Tytul Karty', body: 'Tresc.', footerButtonLabel: 'Akcja' });
  assert.match(html, /<div class="card-header">Tytul Karty<\/div>/);
  assert.match(html, /<button class="btn-primary btn-sm">Akcja<\/button>/);
  assert.doesNotMatch(html, /btn btn-primary/);
});

test('make:card featured-box - kolor primary (domyslny) nie dodaje style ani klas koloru', () => {
  const html = renderFeaturedBox({ icon: 'ph-rocket-launch', title: 'Wydajnosc', description: 'Opis.', accentColor: 'primary' });
  assert.match(html, /<div class="featured-box">/);
  assert.match(html, /<div class="featured-box-icon">/);
  assert.doesNotMatch(html, /style=/);
});

test('make:card featured-box - kolor niestandardowy dodaje border-top-color i bg-<kolor> text-white', () => {
  const html = renderFeaturedBox({ icon: 'ph-check', title: 'Skutecznosc', description: 'Opis.', accentColor: 'success' });
  assert.match(html, /<div class="featured-box" style="border-top-color: var\(--success\)">/);
  assert.match(html, /<div class="featured-box-icon bg-success text-white">/);
});

test('make:card thumb-info-center - text-6, ikona lupy, brak plakietki', () => {
  const html = renderThumbInfoCenter({ imageUrl: 'img/a.jpg', imageAlt: 'Projekt', title: 'Powieksz zdjecie' });
  assert.match(html, /class="thumb-info thumb-info-center shadow-sm"/);
  assert.match(html, /ph-magnifying-glass/);
  assert.match(html, /<h3 class="thumb-info-title text-6 fw-bold">Powieksz zdjecie<\/h3>/);
});

test('make:card thumb-info-bottom - z plakietka, bez thumb-info-light', () => {
  const html = renderThumbInfoBottom({ imageUrl: 'img/a.jpg', imageAlt: 'Projekt', title: 'Aplikacja Mobilna', badge: 'Nowosc', light: false });
  assert.match(html, /class="thumb-info thumb-info-bottom shadow-sm"/);
  assert.match(html, /<span class="badge badge-primary mb-2 align-self-start">Nowosc<\/span>/);
  assert.match(html, /<h3 class="thumb-info-title text-7 fw-bold m-0">Aplikacja Mobilna<\/h3>/);
});

test('make:card thumb-info-bottom - wariant light bez plakietki pomija span badge', () => {
  const html = renderThumbInfoBottom({ imageUrl: 'img/a.jpg', imageAlt: 'Projekt', title: 'Jasna Nakladka', badge: '', light: true });
  assert.match(html, /class="thumb-info thumb-info-bottom thumb-info-light shadow-sm"/);
  assert.doesNotMatch(html, /badge-primary/);
});

test('make:card interactive - spring-shadow uzywa text-muted na opisie', () => {
  const html = renderInteractiveCard({ icon: 'ph-cursor-click', title: 'Spring Hover', description: '.hover-spring', effect: 'spring-shadow' });
  assert.match(html, /class="card p-4 text-center hover-gpu-shadow hover-spring cursor-pointer"/);
  assert.match(html, /<p class="text-muted text-4 m-0">\.hover-spring<\/p>/);
});

test('make:card interactive - tilt uzywa bg-dark text-white i text-white opacity-50 na opisie (nie text-muted)', () => {
  const html = renderInteractiveCard({ icon: 'ph-cube', title: '3D Tilt (JS)', description: '.tilt-card', effect: 'tilt' });
  assert.match(html, /class="card p-4 text-center tilt-card bg-dark text-white cursor-pointer"/);
  assert.match(html, /<p class="text-white opacity-50 text-4 m-0">\.tilt-card<\/p>/);
  assert.doesNotMatch(html, /text-muted/);
});
