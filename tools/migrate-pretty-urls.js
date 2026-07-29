// One-off migration script: strips ".html" from internal <a href="...">
// links across src/, switching to the pretty URLs already supported by
// rule 3 in .htaccess (^([^\.]+(?:\.(?:en|de))?)$ -> $1.html).
// Run with: node tools/migrate-pretty-urls.js
//
// Rules:
//   page.html      -> page
//   page.en.html   -> page.en
//   page.de.html   -> page.de
//   index.html     -> ./            (homepage, Apache DirectoryIndex)
//   index.en.html  -> index.en
//   index.de.html  -> index.de
//
// Idempotent - running it a second time on already-migrated files changes
// nothing (the regex only matches a trailing ".html" in the href value).
// Doesn't touch links with a protocol, anchors, or attributes other than
// href (src, action, etc. are left alone).

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

// Matches only href="name[.en|.de].html" - no "/", no protocol, no
// fragment/query (confirmed during the audit: no such cases exist).
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

console.log(`Migration complete: ${filesChanged} files changed, ${totalReplacements} links rewritten.`);
