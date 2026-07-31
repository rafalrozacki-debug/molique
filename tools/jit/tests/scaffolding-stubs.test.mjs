/**
 * molique-jit - tests for the scaffolding template engine (Stage A)
 *
 * Tests renderStub()/renderList()/joinBlocks() from
 * tools/jit/package/src/stubs.ts (compiled to dist/stubs.js) - the
 * foundation every make:* command is built on. Zero dependency on any
 * specific command, so it can exist before the refactor described in
 * Stage B.
 *
 * renderStub() reads .stub.html files from dist/stubs/ (copied there by
 * scripts/copy-stubs.mjs as part of "npm run build") - the directory
 * isn't configurable from outside, so the test creates its OWN, temporary
 * fixture file directly in dist/stubs/ (a name with a prefix that never
 * collides with real stubs) and removes it afterwards in the `after`
 * hook - this way the test exercises the REAL disk-read path, rather
 * than depending on the content of a specific, real component.
 *
 * Run with:  node --test tools/jit/tests/
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const stubsDistDir = path.join(root, 'tools', 'jit', 'package', 'dist', 'stubs');
const fixtureName = '_test-fixture-scaffolding-stubs.stub.html';
const fixturePath = path.join(stubsDistDir, fixtureName);

before(() => {
  if (!fs.existsSync(stubsDistDir)) {
    throw new Error(
      `Missing ${stubsDistDir} - run "npm run build" in tools/jit/package/ first (scripts/copy-stubs.mjs copies the .stub.html files there).`
    );
  }
  fs.writeFileSync(fixturePath, '<li class="{{ CLASS }}">{{ LABEL }}</li>\n');
});

after(() => {
  fs.rmSync(fixturePath, { force: true });
});

// pathToFileURL() is required on Windows - a bare "C:/..." string throws
// ERR_UNSUPPORTED_ESM_URL_SCHEME (see also the note about the same issue
// when verifying the scaffolding generators in this session).
const { renderStub, renderList, joinBlocks } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'stubs.js')).href
);

test('renderStub() - substitutes all placeholders', () => {
  const html = renderStub(fixtureName, { CLASS: 'is-active', LABEL: 'Step 1' });
  assert.equal(html, '<li class="is-active">Step 1</li>\n');
});

test('renderStub() - throws when a placeholder value is missing', () => {
  assert.throws(() => renderStub(fixtureName, { CLASS: 'is-active' }), /LABEL/);
});

test('renderStub() - throws for a non-existent stub file', () => {
  assert.throws(() => renderStub('_never-exists.stub.html', {}), /missing template/);
});

test('renderList() - renders the same stub once per item and joins the result', () => {
  const items = [
    { CLASS: '', LABEL: 'First' },
    { CLASS: 'is-active', LABEL: 'Second' },
    { CLASS: '', LABEL: 'Third' },
  ];
  const html = renderList(fixtureName, items);
  assert.equal(html, '<li class="">First</li>\n<li class="is-active">Second</li>\n<li class="">Third</li>');
});

test('renderList() - an empty list yields an empty string', () => {
  assert.equal(renderList(fixtureName, []), '');
});

test('joinBlocks() - joins blocks with a blank line, with a single trailing newline', () => {
  const joined = joinBlocks('<a>1</a>\n', '<b>2</b>');
  assert.equal(joined, '<a>1</a>\n\n<b>2</b>\n');
});

test('joinBlocks() - a single block gets exactly one trailing newline', () => {
  assert.equal(joinBlocks('<a>1</a>'), '<a>1</a>\n');
});
