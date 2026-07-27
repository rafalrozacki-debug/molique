/**
 * molique-jit - uruchamia testy scaffoldingu (tools/jit/tests/scaffolding-*.test.mjs)
 *
 * `node --test tools/jit/tests/scaffolding-*.test.mjs` w skrypcie npm psuje
 * sie na Windows: npm uruchamia skrypty przez cmd.exe, ktore NIE rozwija
 * gwiazdki (`*`) jak powloka POSIX - trafiaby do node doslowny string z
 * gwiazdka, ktory nie pasuje do zadnego pliku. `node --test <katalog>`
 * tez zawiodl przy weryfikacji (Node probowal `require()` sciezki
 * katalogu zamiast go przeskanowac). Zamiast tego Node SAM wylicza liste
 * plikow (fs.readdirSync, bez powloki) i przekazuje ja jako jawne,
 * pojedyncze argumenty do `node --test` - przenosne na Windows/macOS/Linux.
 *
 * Uruchomienie:  node tools/run-scaffolding-tests.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(root, 'tools', 'jit', 'tests');

const files = fs
  .readdirSync(testsDir)
  .filter((name) => name.startsWith('scaffolding-') && name.endsWith('.test.mjs'))
  .sort()
  .map((name) => path.join(testsDir, name));

if (files.length === 0) {
  console.error(`Brak plikow "scaffolding-*.test.mjs" w ${testsDir}.`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status ?? 1);
