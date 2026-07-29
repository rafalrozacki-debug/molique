/**
 * molique - syncs the version number into files that Vite/posthtml does NOT
 * process (copied 1:1, see `rootFiles` in vite.config.js), so they can't use
 * {{ __version }}.
 *
 * package.json "version" is the ONLY source of truth (see also
 * {{ __version }} in vite.config.js and $version in
 * tools/build-packages.ps1) - this script just writes its current value
 * wherever needed, instead of relying on someone remembering to hand-edit it
 * on every release (which is why README.md updates kept getting missed in
 * this repo's history).
 *
 * Run with:   node tools/sync-version.js
 * Wired into: npm run predev / prebuild (package.json)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version;

// Strict per-file pattern (each language uses a different word) -
// deliberately NOT a greedy generic "1.2.3" regex anywhere in the file, so
// it can't accidentally touch some other version number in the content
// (e.g. a browser version mentioned inside a code snippet).
const readmeTargets = [
  { file: 'README.md', word: 'Version' },
  { file: 'README.pl.md', word: 'Wersja' },
  { file: 'README.de.md', word: 'Version' },
];

for (const { file, word } of readmeTargets) {
  const path = resolve(root, file);
  const content = readFileSync(path, 'utf8');
  const versionLineRe = new RegExp(`${word}: \\*\\*\\d+\\.\\d+\\.\\d+\\*\\*\\.`);

  if (!versionLineRe.test(content)) {
    console.warn(
      `[sync-version] WARNING: pattern "${word}: **X.Y.Z**." not found in ${file} - ` +
      `check by hand whether the version number there is stale (nothing was overwritten).`
    );
    continue;
  }

  const updated = content.replace(versionLineRe, `${word}: **${version}**.`);
  if (updated !== content) {
    writeFileSync(path, updated, 'utf8');
    console.log(`[sync-version] ${file} synced to version ${version}.`);
  } else {
    console.log(`[sync-version] ${file} already up to date (${version}).`);
  }
}
