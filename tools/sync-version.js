/**
 * molique - synchronizuje numer wersji w plikach, ktorych Vite/posthtml NIE
 * przetwarza (kopiowane 1:1, patrz `rootFiles` w vite.config.js), wiec nie
 * moga skorzystac z {{ __version }}.
 *
 * package.json "version" to JEDYNE zrodlo prawdy (patrz tez {{ __version }}
 * w vite.config.js i $version w tools/build-packages.ps1) - ten skrypt tylko
 * dopisuje jego aktualna wartosc tam, gdzie trzeba, zamiast liczyc na to, ze
 * ktos pamieta o recznej edycji przy kazdym wydaniu (stad regularnie gubiona
 * aktualizacja README.md w historii tego repo).
 *
 * Uruchomienie:  node tools/sync-version.js
 * Wpiete w:      npm run predev / prebuild (package.json)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version;

const readmePath = resolve(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

// Wzorzec scisly (markdown bold: "Wersja: **X.Y.Z**.") - celowo NIE lapczywy
// regex ogolny na "1.2.3" gdziekolwiek, zeby nie ruszyc przypadkiem innej
// liczby wersji w tresci (np. wersji przegladarki we fragmencie kodu).
const versionLineRe = /Wersja: \*\*\d+\.\d+\.\d+\*\*\./;

if (!versionLineRe.test(readme)) {
  console.warn(
    `[sync-version] UWAGA: nie znaleziono wzorca "Wersja: **X.Y.Z**." w README.md - ` +
    `sprawdz recznie, czy numer wersji nie jest tam nieaktualny (nic nie nadpisano).`
  );
} else {
  const updated = readme.replace(versionLineRe, `Wersja: **${version}**.`);
  if (updated !== readme) {
    writeFileSync(readmePath, updated, 'utf8');
    console.log(`[sync-version] README.md zsynchronizowane z wersja ${version}.`);
  } else {
    console.log(`[sync-version] README.md juz aktualne (${version}).`);
  }
}
