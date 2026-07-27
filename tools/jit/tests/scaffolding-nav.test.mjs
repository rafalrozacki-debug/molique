/**
 * molique-jit - testy `make:nav` (Etap B.8 - ostatnia z 8 istniejacych komend)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderNav } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-nav.js')).href
);

test('make:nav - Standard: brak dodatkowej klasy, brak ostrzezenia o navbar-sticky', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: ['Start', 'O nas'],
    themeSwitch: false,
  });
  assert.match(html, /<nav class="navbar">/);
  assert.doesNotMatch(html, /nie dodawaj \.navbar-sticky/);
  assert.match(html, /<a href="#" class="navbar-item">Start<\/a>/);
  assert.match(html, /<a href="#" class="navbar-item">O nas<\/a>/);
});

test('make:nav - Transparent: dostaje ostrzezenie o navbar-sticky', () => {
  const html = renderNav({ variant: 'transparent', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(html, /class="navbar navbar-transparent"/);
  assert.match(html, /nie dodawaj \.navbar-sticky/);
});

test('make:nav - Pill bez customizacji: brak atrybutu style', () => {
  const html = renderNav({ variant: 'pill', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(html, /class="navbar navbar-pill">/); // brak style="..." przed >
});

test('make:nav - Pill z customizacja: oba kolory w stylu, gdy oba podane', () => {
  const html = renderNav({
    variant: 'pill',
    pillBg: '#123456',
    pillBgScrolled: '#abcdef',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: [],
    themeSwitch: false,
  });
  assert.match(html, /style="--navbar-pill-bg: #123456; --navbar-pill-bg-scrolled: #abcdef;"/);
});

test('make:nav - bez zadnego opcjonalnego modulu, MENU_CONTENT to tylko pozycje', () => {
  const html = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: ['A'], themeSwitch: false });
  assert.doesNotMatch(html, /mega-menu/);
  assert.doesNotMatch(html, /theme-switch/);
  assert.doesNotMatch(html, /language-switch/);
});

test('make:nav - Mega Menu: grupy i linki w kolejnosci', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: [],
    megaMenu: { title: 'Produkty', groups: [{ title: 'Kategoria 1', links: ['Link 1', 'Link 2'] }] },
    themeSwitch: false,
  });
  assert.match(html, /mega-menu-trigger">Produkty</);
  assert.match(html, /mega-menu-col-title">Kategoria 1</);
  assert.match(html, /mega-menu-link">Link 1</);
  assert.match(html, /mega-menu-link">Link 2</);
});

test('make:nav - Theme Switch: obecny tylko gdy wlaczony', () => {
  const withSwitch = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: true });
  const withoutSwitch = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(withSwitch, /id="theme-toggle"/);
  assert.doesNotMatch(withoutSwitch, /theme-switch/);
});

test('make:nav - Language Switch: pierwszy jezyk aktywny (CHECK_SVG), reszta bez', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: [],
    languageSwitch: { languages: [{ flagCode: 'pl', label: 'Polski' }, { flagCode: 'gb', label: 'English' }] },
    themeSwitch: false,
  });
  assert.match(html, /language-switch-flag"><img src="img\/flags\/pl\.svg"/);
  assert.match(html, /Polski<\/span><span class="language-switch-check">/);
  assert.doesNotMatch(html, /English<\/span><span class="language-switch-check">/);
});
