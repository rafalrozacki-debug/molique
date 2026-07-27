#!/usr/bin/env node
/**
 * molique-jit - CLI
 *
 * Komendy glowne (angielskie, kanoniczne) + aliasy polskie/niemieckie wg
 * tools/jit/docs/cli-spec.md. Lokalizacja NIE jest robiona przez alias()
 * Commandera (rozne nazwy per jezyk dla TEJ SAMEJ flagi to gimnastyka,
 * ktorej Commander nie robi wygodnie) - zamiast tego argv jest
 * TLUMACZONE na kanoniczne angielskie nazwy PRZED przekazaniem do
 * Commandera, ktory zna tylko jeden, angielski wariant kazdej
 * komendy/flagi. Prostsze i latwiejsze do przetestowania niz zaleznosc od
 * wewnetrznej obslugi aliasow biblioteki.
 */

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { build } from './build.js';
import { watch } from './watch.js';
import { loadConfig, resolveTargets, DEFAULT_CONFIG_FILE, INIT_TEMPLATE } from './config.js';

/* ---------- Tlumaczenie argv (PL/DE -> EN) ---------- */

const COMMAND_ALIASES: Record<string, string> = {
  start: 'init', // PL i DE dziela to samo slowo dla "init"
  buduj: 'build', // PL
  bauen: 'build', // DE
  obserwuj: 'watch', // PL
  beobachten: 'watch', // DE
};

const FLAG_ALIASES: Record<string, string> = {
  '--minifikuj': '--minify',
  '--minifizieren': '--minify',
  '--konfiguracja': '--config',
  '--konfiguration': '--config',
};

// argv = [nodePath, scriptPath, ...userArgs] - slowo komendy zaczyna sie
// dopiero od indeksu 2. Pominiecie tego dawalo prawdziwego buga: petla
// sprawdzala argv[0] ("node", nie zaczyna sie od "-") jako "slowo komendy",
// oznaczala je jako sprawdzone i nigdy nie docierala do prawdziwej komendy
// pod argv[2].
export function translateArgv(argv: string[]): string[] {
  const out = argv.slice();
  let commandTranslated = false;
  for (let i = 2; i < out.length; i++) {
    const eq = out[i].indexOf('=');
    const flagPart = eq === -1 ? out[i] : out[i].slice(0, eq);
    if (flagPart in FLAG_ALIASES) {
      out[i] = FLAG_ALIASES[flagPart] + (eq === -1 ? '' : out[i].slice(eq));
      continue;
    }
    // Pierwszy token (od indeksu 2), ktory nie zaczyna sie od "-", to slowo komendy.
    if (!commandTranslated && !out[i].startsWith('-')) {
      if (out[i] in COMMAND_ALIASES) out[i] = COMMAND_ALIASES[out[i]];
      commandTranslated = true;
    }
  }
  return out;
}

/* ---------- Wspolne ---------- */

function targetsCwd(configPath: string): string {
  return path.dirname(path.resolve(configPath));
}

/* ---------- Program ---------- */

const program = new Command();
program.name('molique-jit').description('Silnik JIT dla frameworka molique - generuje wylacznie potrzebny CSS.');

program
  .command('init')
  .description('Tworzy plik molique.config.mjs (alias: start)')
  .action(() => {
    const target = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);
    if (fs.existsSync(target)) {
      console.error(`${DEFAULT_CONFIG_FILE} juz istnieje - nie nadpisuje.`);
      process.exitCode = 1;
      return;
    }
    fs.writeFileSync(target, INIT_TEMPLATE);
    console.log(`Utworzono ${DEFAULT_CONFIG_FILE}.`);
  });

program
  .command('build')
  .description('Kompiluje CSS do pliku(ow) wyjsciowego(ych) (aliasy: buduj, bauen)')
  .option('-c, --config <path>', 'Sciezka do pliku konfiguracyjnego', DEFAULT_CONFIG_FILE)
  .option('-m, --minify', 'Wymus kompresje wyjscia (patrz uwaga w molique.config.mjs)')
  .option('-v, --verbose', 'Wypisz statystyki dopasowania')
  .action(async (opts: { config: string; minify?: boolean; verbose?: boolean }) => {
    const config = await loadConfig(opts.config);
    const targets = resolveTargets(config);
    const cwd = targetsCwd(opts.config);
    let hadError = false;

    for (const target of targets) {
      try {
        const result = await build({
          content: target.content,
          cwd,
          outFile: path.resolve(cwd, target.output),
          safelist: config.safelist,
          verbose: opts.verbose,
        });
        console.log(
          `OK  ${target.output} - ${result.matchedUtilityClasses.length} klas narzedziowych, ` +
            `${result.matchedComponents.length} komponentow.`
        );
      } catch (err) {
        console.error(`BLAD ${target.output}: ${(err as Error).message}`);
        hadError = true;
      }
    }

    process.exitCode = hadError ? 1 : 0;
  });

program
  .command('watch')
  .description('Tryb deweloperski - nasluchuje zmian na zywo (aliasy: obserwuj, beobachten)')
  .option('-c, --config <path>', 'Sciezka do pliku konfiguracyjnego', DEFAULT_CONFIG_FILE)
  .option('-v, --verbose', 'Wypisz statystyki po kazdej przebudowie', true)
  .action(async (opts: { config: string; verbose?: boolean }) => {
    const config = await loadConfig(opts.config);
    const targets = resolveTargets(config);
    const cwd = targetsCwd(opts.config);

    const handles = await Promise.all(
      targets.map((target) =>
        watch({
          content: target.content,
          cwd,
          outFile: path.resolve(cwd, target.output),
          safelist: config.safelist,
          verbose: opts.verbose,
        })
      )
    );

    console.log(`Nasluchuje (${targets.length} cel(e/ow))... Ctrl+C, zeby zakonczyc.`);

    let shuttingDown = false;
    const shutdown = async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      await Promise.all(handles.map((h) => h.close()));
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });

program.parseAsync(translateArgv(process.argv)).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
