// Manual Phase 2 verification - NOT part of the published package.
// Runs the engine against the real molique repo pages (src/**/*.html) and
// prints stats + a few spot-checks, to confirm matching works on real
// content, not just synthetic examples.
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

console.log('\nGenerated CSS size: ' + (Buffer.byteLength(result.css, 'utf8') / 1024).toFixed(1) + ' KB');
console.log('Saved to: ' + path.relative(repoRoot, outFile));

const checks = {
  ':root present': result.css.includes(':root{'),
  'dark mode present': result.css.includes('data-theme=dark]') || result.css.includes('[data-theme="dark"]'),
  '.card matched': result.matchedUtilityClasses.includes('card') || result.matchedComponents.includes('cards'),
  '.p-md-4 (-md- utility) in output': result.css.includes('.p-md-4{') || result.css.includes(',.p-md-4{') || result.css.includes('.p-md-4,'),
  'm-5 uses *6 (not *5)': (() => {
    const m = result.css.match(/\.m-5\{margin:calc\(var\(--spacing-unit\) \* (\d+)\)/);
    return m ? m[1] === '6' : 'class m-5 was not used on the scanned pages';
  })(),
  '@keyframes scrollRevealAnim present (alwaysInclude)': result.css.includes('@keyframes scrollRevealAnim'),
};

console.log('\nSpot-checks:');
for (const [name, ok] of Object.entries(checks)) {
  console.log('  ' + (ok === true ? 'OK  ' : ok === false ? 'FAIL' : 'INFO') + ' - ' + name + (typeof ok === 'string' ? ' (' + ok + ')' : ''));
}
