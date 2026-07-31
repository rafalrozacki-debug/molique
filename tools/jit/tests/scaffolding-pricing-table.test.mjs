/**
 * molique-jit - `make:pricing-table` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderPricingTableCards, renderPricingList } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-pricing-table.js')).href
);

test('make:pricing-table cards - grid-md-cols matches the number of plans', () => {
  const html = renderPricingTableCards({
    plans: [
      { title: 'Basic', price: '49', priceSuffix: '$ / mo', featured: false, features: [{ text: 'X', disabled: false }], buttonLabel: 'Choose' },
      { title: 'Pro', price: '99', priceSuffix: '$ / mo', featured: true, features: [{ text: 'Y', disabled: false }], buttonLabel: 'Choose Pro' },
      { title: 'Enterprise', price: '199', priceSuffix: '$ / mo', featured: false, features: [{ text: 'Z', disabled: false }], buttonLabel: 'Contact' },
    ],
  });
  assert.match(html, /^<div class="grid-cols-1 grid-md-cols-3 gap-4 align-items-center w-100">/);
});

test('make:pricing-table cards - the featured plan gets is-featured + text-primary + btn-primary hover-spring, a regular one gets btn-outline-primary', () => {
  const html = renderPricingTableCards({
    plans: [
      { title: 'Basic', price: '49', priceSuffix: '$ / mo', featured: false, features: [], buttonLabel: 'Choose' },
      { title: 'Pro', price: '99', priceSuffix: '$ / mo', featured: true, features: [], buttonLabel: 'Choose Pro' },
    ],
  });
  assert.match(html, /<div class="pricing-table">/);
  assert.match(html, /<div class="pricing-table is-featured">/);
  assert.match(html, /<div class="pricing-title text-primary">Pro<\/div>/);
  assert.match(html, /<button class="btn-primary w-100 hover-spring">Choose Pro<\/button>/);
  assert.match(html, /<button class="btn-outline-primary w-100">Choose<\/button>/);
  assert.doesNotMatch(html, /btn btn-/);
});

test('make:pricing-table cards - a disabled feature gets class="is-disabled", the rest do not', () => {
  const html = renderPricingTableCards({
    plans: [
      {
        title: 'Basic',
        price: '49',
        priceSuffix: '$ / mo',
        featured: false,
        features: [
          { text: '1 Project', disabled: false },
          { text: '24/7 Support', disabled: true },
        ],
        buttonLabel: 'Choose',
      },
    ],
  });
  assert.match(html, /<li>1 Project<\/li>/);
  assert.match(html, /<li class="is-disabled">24\/7 Support<\/li>/);
});

test('make:pricing-table list - every item has title/dots/price, no "Popular" ribbon (that\'s CSS ::before, not markup)', () => {
  const html = renderPricingList({
    items: [
      { title: 'Website', price: '$1500' },
      { title: 'Online Store', price: '$4500' },
    ],
  });
  assert.match(html, /^<ul class="pricing-list">/);
  assert.match(html, /<span class="pricing-list-title">Website<\/span>/);
  assert.match(html, /<span class="pricing-list-dots"><\/span>/);
  assert.match(html, /<span class="pricing-list-price">\$1500<\/span>/);
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
});
