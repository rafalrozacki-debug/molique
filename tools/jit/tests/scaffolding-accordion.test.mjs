/**
 * molique-jit - testy `make:accordion` (Etap C.3)
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderAccordion } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-accordion.js')).href
);

test('make:accordion - kazdy panel dostaje ta sama nazwe grupy (name=)', () => {
  const html = renderAccordion({
    groupName: 'faq',
    panels: [
      { question: 'Pytanie 1', answer: 'Odpowiedz 1' },
      { question: 'Pytanie 2', answer: 'Odpowiedz 2' },
    ],
  });
  assert.equal((html.match(/name="faq"/g) ?? []).length, 2);
  assert.match(html, /<summary class="accordion-header">Pytanie 1<\/summary>/);
  assert.match(html, /<div class="accordion-body">Odpowiedz 1<\/div>/);
});

test('make:accordion - zaden panel nie ma domyslnie atrybutu open', () => {
  const html = renderAccordion({ groupName: 'faq', panels: [{ question: 'P', answer: 'O' }] });
  assert.doesNotMatch(html, /\[open\]|<details[^>]*\bopen\b/);
});

test('make:accordion - jeden panel dziala poprawnie (brzeg dolny)', () => {
  const html = renderAccordion({ groupName: 'g', panels: [{ question: 'Jedyne pytanie', answer: 'Jedyna odpowiedz' }] });
  assert.equal((html.match(/accordion-item/g) ?? []).length, 1);
});
