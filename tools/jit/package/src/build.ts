/**
 * molique-jit - Build
 *
 * Sklejenie calego pipeline'u: Scanner -> Lookup -> Emitter -> zapis pliku.
 * Tryb jednorazowy (`build`) - watch mode i CLI to kolejne, osobne fazy,
 * ktore beda korzystac z tej samej funkcji (watch bedzie po prostu wywolywac
 * `build` ponownie po kazdej zmianie, na start; optymalizacja przez
 * ScanResult.fileCache przyjdzie razem z realnym watcherem).
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
  const { matchedUtilityClasses, matchedComponentIds, unmatchedTokenCount } = resolve(tokens, data);
  const css = emit(data, matchedUtilityClasses, matchedComponentIds);

  fs.mkdirSync(path.dirname(options.outFile), { recursive: true });
  fs.writeFileSync(options.outFile, css);

  if (options.verbose) {
    console.log(
      `molique-jit: ${matchedUtilityClasses.length} klas narzedziowych, ` +
        `${matchedComponentIds.length} komponentow, ${unmatchedTokenCount} tokenow spoza molique.`
    );
  }

  return {
    css,
    matchedUtilityClasses,
    matchedComponents: matchedComponentIds,
    unmatchedTokenCount,
  };
}
