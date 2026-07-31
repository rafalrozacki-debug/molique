/**
 * molique-jit - Scanner
 *
 * Extracts raw tokens (candidate molique classes) from project files.
 * A context-free regex - deliberately: molique forbids concatenating
 * class names in JS ("NEVER concatenate class names dynamically",
 * molique.md), so every real class exists somewhere as a literal string.
 * The per-file cache (`Map<path, Set<token>>`) is here from the start,
 * even though watch mode is only a later phase - rebuilding a single file
 * in watch mode should mean swapping one entry in this map, not
 * rescanning everything.
 */

import fs from 'node:fs';
import fg from 'fast-glob';

const TOKEN_RE = /[a-zA-Z0-9_:-]+/g;

export interface ScanOptions {
  content: string[];
  cwd: string;
}

export interface ScanResult {
  /** Union of tokens from all scanned files. */
  tokens: Set<string>;
  /** Per-file token cache - the basis for the future watch mode. */
  fileCache: Map<string, Set<string>>;
}

function tokensOf(text: string): Set<string> {
  const set = new Set<string>();
  for (const m of text.matchAll(TOKEN_RE)) set.add(m[0]);
  return set;
}

export async function scan(options: ScanOptions): Promise<ScanResult> {
  const files = await fg(options.content, {
    cwd: options.cwd,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  const fileCache = new Map<string, Set<string>>();
  const tokens = new Set<string>();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const found = tokensOf(text);
    fileCache.set(file, found);
    for (const t of found) tokens.add(t);
  }

  return { tokens, fileCache };
}

/** Rescans a SINGLE file and returns the updated token set - for use by the future watch mode. */
export function rescanFile(file: string, fileCache: Map<string, Set<string>>): Set<string> {
  const text = fs.readFileSync(file, 'utf8');
  const found = tokensOf(text);
  fileCache.set(file, found);
  return found;
}

/** Sums all tokens from the current cache state - called after every change in watch mode. */
export function unionTokens(fileCache: Map<string, Set<string>>): Set<string> {
  const tokens = new Set<string>();
  for (const set of fileCache.values()) {
    for (const t of set) tokens.add(t);
  }
  return tokens;
}
