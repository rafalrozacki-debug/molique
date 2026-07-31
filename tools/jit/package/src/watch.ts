/**
 * molique-jit - Watch
 *
 * Listens for changes in project files and rebuilds the output
 * incrementally: after a SINGLE file changes, we re-scan ONLY that file
 * (`rescanFile`), update its entry in the Scanner's cache, sum all tokens
 * (`unionTokens`), and only then query the dictionary / emit CSS - exactly
 * the architecture described in the original jit-spec.md.
 *
 * Debounce (~50ms): saving several files at once (e.g. "Save All" in an
 * editor) should trigger ONE rebuild, not a series of separate ones.
 *
 * NOTE on the chokidar version: v4 removed native glob support (patterns
 * would have to be expanded to concrete paths by hand). The package
 * deliberately sticks to chokidar v3, which understands glob natively -
 * the same `content` globs the Scanner uses can be passed straight to
 * chokidar.watch().
 */

import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { scan, rescanFile, unionTokens } from './scanner.js';
import { loadData, resolve } from './lookup.js';
import { emit } from './emitter.js';
import type { BuildOptions, BuildResult } from './types.js';

const DEBOUNCE_MS = 50;

export interface WatchOptions extends BuildOptions {
  /** Called after every (debounced) rebuild. */
  onBuild?: (result: BuildResult) => void;
}

export interface WatchHandle {
  /** Stops the watcher and cancels any pending debounce. */
  close(): Promise<void>;
}

export async function watch(options: WatchOptions): Promise<WatchHandle> {
  const data = loadData();
  const { fileCache } = await scan({ content: options.content, cwd: options.cwd });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function rebuild(): void {
    const tokens = unionTokens(fileCache);
    const { matchedUtilityClasses, matchedComponentIds, unmatchedTokenCount } = resolve(
      tokens,
      data,
      options.safelist
    );
    const css = emit(data, matchedUtilityClasses, matchedComponentIds);

    fs.mkdirSync(path.dirname(options.outFile), { recursive: true });
    fs.writeFileSync(options.outFile, css);

    const result: BuildResult = {
      css,
      matchedUtilityClasses,
      matchedComponents: matchedComponentIds,
      unmatchedTokenCount,
    };

    if (options.verbose) {
      console.log(
        `molique-jit (watch): ${matchedUtilityClasses.length} utility classes, ` +
          `${matchedComponentIds.length} components.`
      );
    }

    options.onBuild?.(result);
  }

  function scheduleRebuild(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(rebuild, DEBOUNCE_MS);
  }

  // First build - immediately, no debounce (there's nothing to wait for yet).
  rebuild();

  const watcher = chokidar.watch(options.content, {
    cwd: options.cwd,
    ignoreInitial: true,
  });

  const toAbsolute = (relFile: string) => path.resolve(options.cwd, relFile);

  watcher.on('add', (relFile) => {
    rescanFile(toAbsolute(relFile), fileCache);
    scheduleRebuild();
  });
  watcher.on('change', (relFile) => {
    rescanFile(toAbsolute(relFile), fileCache);
    scheduleRebuild();
  });
  watcher.on('unlink', (relFile) => {
    fileCache.delete(toAbsolute(relFile));
    scheduleRebuild();
  });

  await new Promise<void>((resolvePromise) => watcher.once('ready', () => resolvePromise()));

  return {
    async close() {
      if (debounceTimer) clearTimeout(debounceTimer);
      await watcher.close();
    },
  };
}
