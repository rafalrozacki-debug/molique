/**
 * molique-jit - `make:nav` tests (Stage B.8 - the last of the 8 existing commands)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderNav } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-nav.js')).href
);

test('make:nav - Standard: no extra class, no navbar-sticky warning', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: ['Home', 'About'],
    themeSwitch: false,
  });
  assert.match(html, /<nav class="navbar">/);
  assert.doesNotMatch(html, /do not add \.navbar-sticky/);
  assert.match(html, /<a href="#" class="navbar-item">Home<\/a>/);
  assert.match(html, /<a href="#" class="navbar-item">About<\/a>/);
});

test('make:nav - Transparent: gets the navbar-sticky warning', () => {
  const html = renderNav({ variant: 'transparent', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(html, /class="navbar navbar-transparent"/);
  assert.match(html, /do not add \.navbar-sticky/);
});

test('make:nav - Pill without customization: no style attribute', () => {
  const html = renderNav({ variant: 'pill', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(html, /class="navbar navbar-pill">/); // no style="..." before >
});

test('make:nav - Pill with customization: both colors in the style when both are given', () => {
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

test('make:nav - without any optional module, MENU_CONTENT is just the items', () => {
  const html = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: ['A'], themeSwitch: false });
  assert.doesNotMatch(html, /mega-menu/);
  assert.doesNotMatch(html, /theme-switch/);
  assert.doesNotMatch(html, /language-switch/);
});

test('make:nav - Mega Menu: groups and links in order', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: [],
    megaMenu: { title: 'Products', groups: [{ title: 'Category 1', links: ['Link 1', 'Link 2'] }] },
    themeSwitch: false,
  });
  assert.match(html, /mega-menu-trigger">Products</);
  assert.match(html, /mega-menu-col-title">Category 1</);
  assert.match(html, /mega-menu-link">Link 1</);
  assert.match(html, /mega-menu-link">Link 2</);
});

test('make:nav - Theme Switch: present only when enabled', () => {
  const withSwitch = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: true });
  const withoutSwitch = renderNav({ variant: 'standard', brand: 'Logo', toggleId: 'navToggle', items: [], themeSwitch: false });
  assert.match(withSwitch, /id="theme-toggle"/);
  assert.doesNotMatch(withoutSwitch, /theme-switch/);
});

test('make:nav - Language Switch: the first language is active (CHECK_SVG), the rest are not', () => {
  const html = renderNav({
    variant: 'standard',
    brand: 'Logo',
    toggleId: 'navToggle',
    items: [],
    languageSwitch: { languages: [{ flagCode: 'pl', label: 'Polish' }, { flagCode: 'gb', label: 'English' }] },
    themeSwitch: false,
  });
  assert.match(html, /language-switch-flag"><img src="img\/flags\/pl\.svg"/);
  assert.match(html, /Polish<\/span><span class="language-switch-check">/);
  assert.doesNotMatch(html, /English<\/span><span class="language-switch-check">/);
});
