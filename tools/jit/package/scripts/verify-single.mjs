// Test on a SINGLE page - shows the real scale of the reduction, unlike
// verify.mjs (scans the entire site, so it matches almost everything).
// NOT part of the published package.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../dist/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..', '..');
const page = process.argv[2] || 'src/examples-accordions.html';
const outFile = path.join(here, '_verify-single-output.css');

const result = await build({ content: [page], cwd: repoRoot, outFile, verbose: true });
console.log('Page: ' + page);
console.log('Size: ' + (Buffer.byteLength(result.css, 'utf8') / 1024).toFixed(1) + ' KB (full molique-style.css: 344.4 KB)');
console.log('Components: ' + result.matchedComponents.join(', '));
