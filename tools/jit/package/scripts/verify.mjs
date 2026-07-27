// Reczna weryfikacja Fazy 2 - NIE jest czescia publikowanego pakietu.
// Uruchamia silnik na realnych stronach repo molique (src/**/*.html) i
// drukuje statystyki + kilka spot-checkow, zeby potwierdzic, ze dopasowanie
// dziala na prawdziwej tresci, nie tylko na syntetycznych przykladach.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../dist/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..', '..');
const outFile = path.join(here, '_verify-output.css');

const result = await build({
  content: ['src/**/*.html'],
  cwd: repoRoot,
  outFile,
  verbose: true,
});

console.log('\nRozmiar wygenerowanego CSS: ' + (Buffer.byteLength(result.css, 'utf8') / 1024).toFixed(1) + ' KB');
console.log('Zapisano do: ' + path.relative(repoRoot, outFile));

const checks = {
  ':root obecny': result.css.includes(':root{'),
  'dark mode obecny': result.css.includes('data-theme=dark]') || result.css.includes('[data-theme="dark"]'),
  '.card dopasowany': result.matchedUtilityClasses.includes('card') || result.matchedComponents.includes('cards'),
  '.p-md-4 (utility -md-) w wyjsciu': result.css.includes('.p-md-4{') || result.css.includes(',.p-md-4{') || result.css.includes('.p-md-4,'),
  'm-5 uzywa *6 (nie *5)': (() => {
    const m = result.css.match(/\.m-5\{margin:calc\(var\(--spacing-unit\) \* (\d+)\)/);
    return m ? m[1] === '6' : 'klasa m-5 nie zostala uzyta na zeskanowanych stronach';
  })(),
  '@keyframes scrollRevealAnim obecny (alwaysInclude)': result.css.includes('@keyframes scrollRevealAnim'),
};

console.log('\nSpot-checki:');
for (const [name, ok] of Object.entries(checks)) {
  console.log('  ' + (ok === true ? 'OK  ' : ok === false ? 'FAIL' : 'INFO') + ' - ' + name + (typeof ok === 'string' ? ' (' + ok + ')' : ''));
}
