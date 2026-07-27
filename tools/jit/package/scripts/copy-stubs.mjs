// molique-jit - kopiuje src/stubs/*.stub.html do dist/stubs/ po kompilacji
// TypeScript (tsc kompiluje tylko *.ts, stuby trzeba przenies osobno).
// Uruchamiane jako czesc "npm run build" (patrz package.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcStubs = path.join(root, 'src', 'stubs');
const distStubs = path.join(root, 'dist', 'stubs');

fs.rmSync(distStubs, { recursive: true, force: true });
fs.mkdirSync(distStubs, { recursive: true });

const files = fs.readdirSync(srcStubs).filter((f) => f.endsWith('.stub.html'));
for (const f of files) {
  fs.copyFileSync(path.join(srcStubs, f), path.join(distStubs, f));
}

console.log(`copy-stubs: skopiowano ${files.length} szablon(y/ow) do dist/stubs/`);
