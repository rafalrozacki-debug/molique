/**
 * molique-jit - runs the scaffolding tests (tools/jit/tests/scaffolding-*.test.mjs)
 *
 * `node --test tools/jit/tests/scaffolding-*.test.mjs` as an npm script
 * breaks on Windows: npm runs scripts through cmd.exe, which does NOT
 * expand the `*` glob like a POSIX shell would - node would receive the
 * literal string with the asterisk, which matches no file. `node --test
 * <directory>` also failed during verification (Node tried to `require()`
 * the directory path instead of scanning it). Instead, Node itself
 * enumerates the file list (fs.readdirSync, no shell involved) and passes
 * it as explicit, individual arguments to `node --test` - portable across
 * Windows/macOS/Linux.
 *
 * Run with:  node tools/run-scaffolding-tests.mjs
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
  console.error(`No "scaffolding-*.test.mjs" files found in ${testsDir}.`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status ?? 1);
