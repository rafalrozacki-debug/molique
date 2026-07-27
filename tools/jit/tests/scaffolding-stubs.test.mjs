/**
 * molique-jit - testy silnika szablonow scaffoldingu (Etap A)
 *
 * Testuje renderStub()/renderList()/joinBlocks() z tools/jit/package/src/stubs.ts
 * (skompilowane do dist/stubs.js) - fundament, na ktorym stoi kazda komenda
 * make:*. Zero zaleznosci od jakiejkolwiek konkretnej komendy, wiec moze
 * powstac przed refaktorem opisanym w Etapie B.
 *
 * renderStub() czyta pliki .stub.html z dist/stubs/ (kopiowane tam przez
 * scripts/copy-stubs.mjs w ramach "npm run build") - katalog nie jest
 * parametryzowalny z zewnatrz, wiec test tworzy WLASNY, tymczasowy plik
 * fixture bezposrednio w dist/stubs/ (nazwa z prefiksem, ktory nigdy nie
 * kolioduje z prawdziwymi stubami) i usuwa go po sobie w hooku `after` -
 * dzieki temu test cwiczy PRAWDZIWA sciezke odczytu z dysku, a nie
 * zaleznosc od tresci konkretnego, prawdziwego komponentu.
 *
 * Uruchomienie:  node --test tools/jit/tests/
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
      `Brak ${stubsDistDir} - uruchom najpierw "npm run build" w tools/jit/package/ (scripts/copy-stubs.mjs kopiuje tam .stub.html).`
    );
  }
  fs.writeFileSync(fixturePath, '<li class="{{ CLASS }}">{{ LABEL }}</li>\n');
});

after(() => {
  fs.rmSync(fixturePath, { force: true });
});

// pathToFileURL() jest wymagane na Windows - goly string "C:/..." wywala
// ERR_UNSUPPORTED_ESM_URL_SCHEME (patrz tez notatka o tym samym problemie
// przy weryfikacji generatorow scaffoldingu w tej sesji).
const { renderStub, renderList, joinBlocks } = await import(
  pathToFileURL(path.join(root, 'tools', 'jit', 'package', 'dist', 'stubs.js')).href
);

test('renderStub() - podstawia wszystkie placeholdery', () => {
  const html = renderStub(fixtureName, { CLASS: 'is-active', LABEL: 'Krok 1' });
  assert.equal(html, '<li class="is-active">Krok 1</li>\n');
});

test('renderStub() - rzuca blad przy brakujacej wartosci dla placeholdera', () => {
  assert.throws(() => renderStub(fixtureName, { CLASS: 'is-active' }), /LABEL/);
});

test('renderStub() - rzuca blad przy nieistniejacym pliku stuba', () => {
  assert.throws(() => renderStub('_nie-istnieje-nigdy.stub.html', {}), /brak szablonu/);
});

test('renderList() - renderuje ten sam stub raz na element i laczy wynik', () => {
  const items = [
    { CLASS: '', LABEL: 'Pierwszy' },
    { CLASS: 'is-active', LABEL: 'Drugi' },
    { CLASS: '', LABEL: 'Trzeci' },
  ];
  const html = renderList(fixtureName, items);
  assert.equal(html, '<li class="">Pierwszy</li>\n<li class="is-active">Drugi</li>\n<li class="">Trzeci</li>');
});

test('renderList() - pusta lista daje pusty string', () => {
  assert.equal(renderList(fixtureName, []), '');
});

test('joinBlocks() - laczy bloki pusta linia, z jednym trailing newline', () => {
  const joined = joinBlocks('<a>1</a>\n', '<b>2</b>');
  assert.equal(joined, '<a>1</a>\n\n<b>2</b>\n');
});

test('joinBlocks() - pojedynczy blok dostaje dokladnie jeden trailing newline', () => {
  assert.equal(joinBlocks('<a>1</a>'), '<a>1</a>\n');
});
