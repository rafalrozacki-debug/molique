/**
 * molique-jit - Build
 *
 * Assembles the whole pipeline: Scanner -> Lookup -> Emitter -> write
 * file. One-shot mode (`build`) - watch mode and the CLI are later,
 * separate phases that will use this same function (watch will initially
 * just call `build` again after every change; optimization via
 * ScanResult.fileCache will arrive together with the real watcher).
 */

import fs from 'node:fs';
import path from 'node:path';
import { scan } from './scanner.js';
import { loadData, resolve } from './lookup.js';
import { emit } from './emitter.js';
import type { BuildOptions, BuildResult } from './types.js';

export async function build(options: BuildOptions): Promise<BuildResult> {
  const data = loadData();
  const { tokens } = await scan({ content: options.content, cwd: options.cwd });
  const { matchedUtilityClasses, matchedComponentIds, unmatchedTokenCount } = resolve(
    tokens,
    data,
    options.safelist
  );
  const css = emit(data, matchedUtilityClasses, matchedComponentIds);

  fs.mkdirSync(path.dirname(options.outFile), { recursive: true });
  fs.writeFileSync(options.outFile, css);

  if (options.verbose) {
    console.log(
      `molique-jit: ${matchedUtilityClasses.length} utility classes, ` +
        `${matchedComponentIds.length} components, ${unmatchedTokenCount} tokens outside molique.`
    );
  }

  return {
    css,
    matchedUtilityClasses,
    matchedComponents: matchedComponentIds,
    unmatchedTokenCount,
  };
}
