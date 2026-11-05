/**
 * molique - refreshes tools/icon-catalog.data.json from @phosphor-icons/core
 *
 * The package is not a dependency of this repo: the gallery only needs the
 * names, tags and categories, and those change once in a long while. Download
 * it into a folder of its own and point this script at its dist/index.mjs:
 *
 *   npm pack @phosphor-icons/core           (in an empty folder outside the repo)
 *   tar -xzf phosphor-icons-core-*.tgz
 *   node tools/update-icon-catalog.mjs <that folder>/package/dist/index.mjs
 *
 * The file is read as TEXT and never imported: a downloaded package does not
 * get to run code here. The array literal is cut out, the enum references are
 * resolved from the header of the same file, and the rest is plain JSON.
 *
 * Output: tools/icon-catalog.data.json, one icon per line so a Phosphor update
 * shows up as a readable diff.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) {
  console.error('usage: node tools/update-icon-catalog.mjs <@phosphor-icons/core>/dist/index.mjs');
  process.exit(1);
}

const text = fs.readFileSync(source, 'utf8');
const start = text.indexOf('const n = [');
const end = text.lastIndexOf('];');
if (start < 0 || end < 0) throw new Error('icon array not found - the package layout changed');

/** "e" = IconCategory, "a" = FigmaCategory: i.ARROWS = "arrows", ... */
function readEnum(letter) {
  const m = new RegExp(`${letter} = /\\* @__PURE__ \\*/ \\(\\(i\\) => \\((.*?), i\\)\\)\\(`).exec(text.slice(0, start));
  if (!m) throw new Error(`enum ${letter} not found`);
  return Object.fromEntries([...m[1].matchAll(/i\.([A-Z]+) = "([^"]+)"/g)].map((x) => [x[1], x[2]]));
}

const enums = { e: readEnum('e'), a: readEnum('a') };
const literal = text
  .slice(start + 'const n = '.length, end + 1)
  .replace(/\b([ea])\.([A-Z]+)\b/g, (_, letter, key) => {
    if (!enums[letter][key]) throw new Error(`unknown enum value ${letter}.${key}`);
    return JSON.stringify(enums[letter][key]);
  })
  .replace(/(^|[\s{,])([a-z_]+):/gm, '$1"$2":')
  .replace(/:\s*!0/g, ': true')
  .replace(/:\s*!1/g, ': false');

const words = (list) =>
  [...new Set(list.flatMap((value) => value.toLowerCase().split(/[\s/]+/)))].filter(
    (word) => word && !word.startsWith('*') && word !== '&'
  );

const icons = JSON.parse(literal)
  .map((icon) => ({ name: icon.name, tags: words(icon.tags).join(' '), categories: words(icon.categories).join(' ') }))
  .sort((a, b) => a.name.localeCompare(b.name));

const out = path.join(root, 'tools', 'icon-catalog.data.json');
fs.writeFileSync(out, `[\n${icons.map((icon) => '  ' + JSON.stringify(icon)).join(',\n')}\n]\n`, 'utf8');
console.log(`update-icon-catalog: ${icons.length} icons -> tools/icon-catalog.data.json`);
