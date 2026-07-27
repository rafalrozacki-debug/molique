// Test na POJEDYNCZEJ stronie - pokazuje realna skale redukcji, w
// odroznieniu od verify.mjs (skanuje caly serwis, wiec dopasowuje niemal
// wszystko). NIE jest czescia publikowanego pakietu.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../dist/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..', '..');
const page = process.argv[2] || 'src/examples-accordions.html';
const outFile = path.join(here, '_verify-single-output.css');

const result = await build({ content: [page], cwd: repoRoot, outFile, verbose: true });
console.log('Strona: ' + page);
console.log('Rozmiar: ' + (Buffer.byteLength(result.css, 'utf8') / 1024).toFixed(1) + ' KB (pelny molique-style.css: 344.4 KB)');
console.log('Komponenty: ' + result.matchedComponents.join(', '));
