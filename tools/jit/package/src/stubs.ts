/**
 * molique-jit - Stub Renderer (Scaffolding)
 *
 * Per tools/jit/docs/scaffolding-spec.md: "A lightweight regex replacer,
 * not Handlebars/Twig." No conditional logic INSIDE the template -
 * variants (e.g. Standard/Confirm/Context of a modal) are SEPARATE
 * .stub.html files, not one file with {{#if}}. This module only replaces
 * "{{ KEY }}" with a value from the map - nothing more.
 *
 * Stubs live in src/stubs/ (source code, committed to git - these are
 * authored TEMPLATES, not generated data like tools/jit/package/data/).
 * `tsc` only compiles *.ts, so *.stub.html has to be copied to dist/
 * separately (see scripts/copy-stubs.mjs, wired into "npm run build") -
 * this makes the engine behave identically from source and after
 * building, and in the future (a real `npm publish`) the package carries
 * the stubs with it in dist/, with no dependency on the src/ folder.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stubsDir = path.resolve(here, 'stubs');

const PLACEHOLDER = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

/**
 * Renders a single stub. Throws on EVERY placeholder without a supplied
 * value - better to fail loudly on a typo in the template/prompt than to
 * silently leave "{{ TITLE }}" in the generated code.
 */
export function renderStub(stubName: string, values: Record<string, string>): string {
  const file = path.join(stubsDir, stubName);
  if (!fs.existsSync(file)) {
    throw new Error(`molique-jit: missing template "${stubName}" in ${stubsDir}.`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  return raw.replace(PLACEHOLDER, (match, key: string) => {
    if (!(key in values)) {
      throw new Error(`molique-jit: template "${stubName}" uses "{{ ${key} }}", but no value was supplied.`);
    }
    return values[key];
  });
}

/** Joins several rendered fragments (e.g. button + modal) with a blank line between them. */
export function joinBlocks(...blocks: string[]): string {
  return blocks.map((b) => b.trimEnd()).join('\n\n') + '\n';
}

/**
 * Renders the SAME small stub separately for each array item and joins
 * the results - for user-declared lists of variable length (N table
 * columns, N funnel steps, N Speed Dial sub-buttons).
 *
 * The loop lives in TypeScript, NOT in the template - the stub itself
 * stays flat, with no "each"/"if" syntax (see the file header). The
 * result of this function usually ends up as the VALUE of a single
 * placeholder in a parent template (e.g. {{ ROW }} in
 * modal-table.stub.html) - it's not used standalone.
 */
export function renderList(stubName: string, items: Record<string, string>[]): string {
  return items.map((values) => renderStub(stubName, values).trimEnd()).join('\n');
}
