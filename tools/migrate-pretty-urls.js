// Jednorazowy skrypt migracyjny: usuwa ".html" z wewnetrznych linkow
// <a href="..."> w calym src/, przechodzac na ladne URL-e wspierane juz
// przez regule 3 w .htaccess (^([^\.]+(?:\.(?:en|de))?)$ -> $1.html).
// Uruchomienie: node tools/migrate-pretty-urls.js
//
// Reguly:
//   page.html      -> page
//   page.en.html   -> page.en
//   page.de.html   -> page.de
//   index.html     -> ./            (strona glowna, DirectoryIndex Apache)
//   index.en.html  -> index.en
//   index.de.html  -> index.de
//
// Idempotentny - drugie uruchomienie na juz zmigrowanych plikach nic nie
// zmienia (regex dopasowuje wylacznie ".html" na koncu wartosci href).
// Nie rusza linkow z protokolem, kotwic, ani atrybutow innych niz href
// (src, action itp. nie sa dotykane).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function toPrettyUrl(base, locale) {
  if (base === 'index') {
    return locale ? `index.${locale}` : './';
  }
  return locale ? `${base}.${locale}` : base;
}

// Dopasowuje wylacznie href="nazwa[.en|.de].html" - bez "/", bez protokolu,
// bez fragmentu/query (potwierdzone w audycie: takich przypadkow nie ma).
const HREF_RE = /href="([a-zA-Z0-9_-]+)(?:\.(en|de))?\.html"/g;

let filesChanged = 0;
let totalReplacements = 0;

for (const file of walk(srcDir)) {
  const original = readFileSync(file, 'utf8');
  let replacementsInFile = 0;

  const updated = original.replace(HREF_RE, (match, base, locale) => {
    replacementsInFile++;
    return `href="${toPrettyUrl(base, locale)}"`;
  });

  if (replacementsInFile > 0) {
    writeFileSync(file, updated, 'utf8');
    filesChanged++;
    totalReplacements += replacementsInFile;
  }
}

console.log(`Migracja zakonczona: ${filesChanged} plikow zmienionych, ${totalReplacements} linkow przepisanych.`);
