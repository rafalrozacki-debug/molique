/**
 * molique-jit - testy `make:pricing-table`
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPricingTableCards, renderPricingList } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-pricing-table.js')).href
);

test('make:pricing-table cards - grid-md-cols dopasowany do liczby pakietow', () => {
  const html = renderPricingTableCards({
    plans: [
      { title: 'Basic', price: '49', priceSuffix: 'zl / msc', featured: false, features: [{ text: 'X', disabled: false }], buttonLabel: 'Wybierz' },
      { title: 'Pro', price: '99', priceSuffix: 'zl / msc', featured: true, features: [{ text: 'Y', disabled: false }], buttonLabel: 'Wybierz Pro' },
      { title: 'Enterprise', price: '199', priceSuffix: 'zl / msc', featured: false, features: [{ text: 'Z', disabled: false }], buttonLabel: 'Kontakt' },
    ],
  });
  assert.match(html, /^<div class="grid-cols-1 grid-md-cols-3 gap-4 align-items-center w-100">/);
});

test('make:pricing-table cards - pakiet featured dostaje is-featured + text-primary + btn-primary hover-spring, zwykly dostaje btn-outline-primary', () => {
  const html = renderPricingTableCards({
    plans: [
      { title: 'Basic', price: '49', priceSuffix: 'zl / msc', featured: false, features: [], buttonLabel: 'Wybierz' },
      { title: 'Pro', price: '99', priceSuffix: 'zl / msc', featured: true, features: [], buttonLabel: 'Wybierz Pro' },
    ],
  });
  assert.match(html, /<div class="pricing-table">/);
  assert.match(html, /<div class="pricing-table is-featured">/);
  assert.match(html, /<div class="pricing-title text-primary">Pro<\/div>/);
  assert.match(html, /<button class="btn-primary w-100 hover-spring">Wybierz Pro<\/button>/);
  assert.match(html, /<button class="btn-outline-primary w-100">Wybierz<\/button>/);
  assert.doesNotMatch(html, /btn btn-/);
});

test('make:pricing-table cards - cecha disabled dostaje class="is-disabled", pozostale nie', () => {
  const html = renderPricingTableCards({
    plans: [
      {
        title: 'Basic',
        price: '49',
        priceSuffix: 'zl / msc',
        featured: false,
        features: [
          { text: '1 Projekt', disabled: false },
          { text: 'Wsparcie 24/7', disabled: true },
        ],
        buttonLabel: 'Wybierz',
      },
    ],
  });
  assert.match(html, /<li>1 Projekt<\/li>/);
  assert.match(html, /<li class="is-disabled">Wsparcie 24\/7<\/li>/);
});

test('make:pricing-table list - kazda pozycja ma title/dots/price, brak wstazki "Popularne" (to CSS ::before, nie markup)', () => {
  const html = renderPricingList({
    items: [
      { title: 'Strona www', price: '1500 zl' },
      { title: 'Sklep internetowy', price: '4500 zl' },
    ],
  });
  assert.match(html, /^<ul class="pricing-list">/);
  assert.match(html, /<span class="pricing-list-title">Strona www<\/span>/);
  assert.match(html, /<span class="pricing-list-dots"><\/span>/);
  assert.match(html, /<span class="pricing-list-price">1500 zl<\/span>/);
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
});
