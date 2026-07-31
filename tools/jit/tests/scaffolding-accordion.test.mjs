/**
 * molique-jit - `make:accordion` tests (Stage C.3)
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAccordion } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-accordion.js')).href
);

test('make:accordion - every panel gets the same group name (name=)', () => {
  const html = renderAccordion({
    groupName: 'faq',
    panels: [
      { question: 'Question 1', answer: 'Answer 1' },
      { question: 'Question 2', answer: 'Answer 2' },
    ],
  });
  assert.equal((html.match(/name="faq"/g) ?? []).length, 2);
  assert.match(html, /<summary class="accordion-header">Question 1<\/summary>/);
  assert.match(html, /<div class="accordion-body">Answer 1<\/div>/);
});

test('make:accordion - no panel has the open attribute by default', () => {
  const html = renderAccordion({ groupName: 'faq', panels: [{ question: 'P', answer: 'O' }] });
  assert.doesNotMatch(html, /\[open\]|<details[^>]*\bopen\b/);
});

test('make:accordion - a single panel works correctly (lower edge case)', () => {
  const html = renderAccordion({ groupName: 'g', panels: [{ question: 'Only question', answer: 'Only answer' }] });
  assert.equal((html.match(/accordion-item/g) ?? []).length, 1);
});
