/**
 * molique-jit - `make:code-preview` tests
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { renderCodePreview } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'cli', 'make-code-preview.js')).href
);

test('make:code-preview - the preview gets RAW HTML (unescaped), rendered live', () => {
  const html = renderCodePreview({ html: '<span class="badge badge-primary">New</span>', previewExtraClass: '' });
  assert.match(html, /<div class="component-preview">\n<span class="badge badge-primary">New<\/span>/);
});

test('make:code-preview - the code block gets ESCAPED HTML (&lt; &gt; &amp;), shown as text', () => {
  const html = renderCodePreview({ html: '<span class="badge badge-primary">New & Improved</span>', previewExtraClass: '' });
  assert.match(html, /<pre><code>&lt;span class="badge badge-primary"&gt;New &amp; Improved&lt;\/span&gt;<\/code><\/pre>/);
});

test('make:code-preview - extra classes on .component-preview are optional', () => {
  const withExtra = renderCodePreview({ html: '<b>x</b>', previewExtraClass: 'w-100 bg-surface' });
  const withoutExtra = renderCodePreview({ html: '<b>x</b>', previewExtraClass: '' });
  assert.match(withExtra, /<div class="component-preview w-100 bg-surface">/);
  assert.match(withoutExtra, /<div class="component-preview">/);
});

test('make:code-preview - includes a .btn-copy button, the copy JS is already wired globally (no per-instance script)', () => {
  const html = renderCodePreview({ html: '<b>x</b>', previewExtraClass: '' });
  assert.match(html, /<button class="btn-copy">Copy<\/button>/);
  assert.doesNotMatch(html, /<script/);
});
