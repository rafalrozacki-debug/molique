/**
 * molique-jit - Watch
 *
 * Nasluchuje zmian w plikach projektu i przebudowuje wyjscie inkrementalnie:
 * po zmianie JEDNEGO pliku re-skanujemy TYLKO ten plik (`rescanFile`),
 * aktualizujemy jego wpis w cache Scannera, sumujemy wszystkie tokeny
 * (`unionTokens`) i dopiero na tej podstawie odpytujemy slownik/emitujemy
 * CSS - dokladnie architektura opisana w oryginalnym jit-spec.md.
 *
 * Debounce (~50ms): zapis kilku plikow naraz (np. "Save All" w edytorze)
 * ma wywolac JEDNA przebudowe, nie serie osobnych.
 *
 * UWAGA na wersje chokidar: v4 usunela natywne wsparcie dla wzorcow glob
 * (trzeba by samemu rozwijac je do konkretnych sciezek). Pakiet celowo
 * trzyma sie chokidar v3, ktory glob rozumie natywnie - te same globy
 * `content`, ktorych uzywa Scanner, mozna przekazac wprost do chokidar.watch().
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
  /** Wywolywane po kazdej (przedebounce'owanej) przebudowie. */
  onBuild?: (result: BuildResult) => void;
}

export interface WatchHandle {
  /** Zatrzymuje watcher i anuluje oczekujacy debounce. */
  close(): Promise<void>;
}

export async function watch(options: WatchOptions): Promise<WatchHandle> {
  const data = loadData();
  const { fileCache } = await scan({ content: options.content, cwd: options.cwd });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function rebuild(): void {
    const tokens = unionTokens(fileCache);
    const { matchedUtilityClasses, matchedComponentIds, unmatchedTokenCount } = resolve(tokens, data);
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
        `molique-jit (watch): ${matchedUtilityClasses.length} klas narzedziowych, ` +
          `${matchedComponentIds.length} komponentow.`
      );
    }

    options.onBuild?.(result);
  }

  function scheduleRebuild(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(rebuild, DEBOUNCE_MS);
  }

  // Pierwszy build - natychmiast, bez debounce (nie ma jeszcze na co czekac).
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
