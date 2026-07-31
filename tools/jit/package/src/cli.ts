#!/usr/bin/env node
/**
 * molique-jit - CLI
 *
 * Main commands (English, canonical) + Polish/German aliases per
 * tools/jit/docs/cli-spec.md. Localization is NOT done via Commander's
 * alias() (different names per language for the SAME flag is a gymnastic
 * Commander doesn't do conveniently) - instead argv is TRANSLATED to the
 * canonical English names BEFORE being passed to Commander, which only
 * knows a single, English variant of each command/flag. Simpler and
 * easier to test than relying on the library's internal alias handling.
 */

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';
import { watch } from './watch.js';
import { loadConfig, resolveTargets, DEFAULT_CONFIG_FILE, INIT_TEMPLATE } from './config.js';
import { registerMakeModalCommand } from './cli/make-modal.js';
import { registerMakeLayoutCommand } from './cli/make-layout.js';
import { registerMakeNavCommand } from './cli/make-nav.js';
import { registerMakeTableCommand } from './cli/make-table.js';
import { registerMakeChartCommand } from './cli/make-chart.js';
import { registerMakeFormCommand } from './cli/make-form.js';
import { registerMakePopoverCommand } from './cli/make-popover.js';
import { registerMakeWidgetCommand } from './cli/make-widget.js';
import { registerMakeBadgeCommand } from './cli/make-badge.js';
import { registerMakeProgressCommand } from './cli/make-progress.js';
import { registerMakeAccordionCommand } from './cli/make-accordion.js';
import { registerMakePaginationCommand } from './cli/make-pagination.js';
import { registerMakeTooltipCommand } from './cli/make-tooltip.js';
import { registerMakeAlertCommand } from './cli/make-alert.js';
import { registerMakeDropdownCommand } from './cli/make-dropdown.js';
import { registerMakeTabsCommand } from './cli/make-tabs.js';
import { registerMakeStatusDotCommand } from './cli/make-status-dot.js';
import { registerMakeCounterCommand } from './cli/make-counter.js';
import { registerMakeTimelineCommand } from './cli/make-timeline.js';
import { registerMakeCarouselCommand } from './cli/make-carousel.js';
import { registerMakeLightboxCommand } from './cli/make-lightbox.js';
import { registerMakeCardCommand } from './cli/make-card.js';
import { registerMakeDataRowCommand } from './cli/make-data-row.js';
import { registerMakePricingTableCommand } from './cli/make-pricing-table.js';
import { registerMakeListGroupCommand } from './cli/make-list-group.js';
import { registerMakeTestimonialCommand } from './cli/make-testimonial.js';
import { registerMakeToastCommand } from './cli/make-toast.js';
import { registerMakeBreadcrumbCommand } from './cli/make-breadcrumb.js';
import { registerMakeStatusIconCommand } from './cli/make-status-icon.js';
import { registerMakeCodePreviewCommand } from './cli/make-code-preview.js';
import { registerMakeComponentListCommand } from './cli/list.js';

/* ---------- argv translation (PL/DE -> EN) ---------- */

const COMMAND_ALIASES: Record<string, string> = {
  pomoc: 'help', // PL
  hilfe: 'help', // DE
  start: 'init', // PL and DE share the same word for "init"
  buduj: 'build', // PL
  bauen: 'build', // DE
  obserwuj: 'watch', // PL
  beobachten: 'watch', // DE
  'zrob:modal': 'make:modal', // PL
  'mache:modal': 'make:modal', // DE
  'zrob:uklad': 'make:layout', // PL
  'mache:layout': 'make:layout', // DE
  'zrob:nawigacje': 'make:nav', // PL
  'mache:nav': 'make:nav', // DE
  'zrob:tabele': 'make:table', // PL
  'mache:tabelle': 'make:table', // DE
  'zrob:wykres': 'make:chart', // PL
  'mache:diagramm': 'make:chart', // DE
  'zrob:formularz': 'make:form', // PL
  'mache:formular': 'make:form', // DE
  'zrob:popover': 'make:popover', // PL
  'mache:popover': 'make:popover', // DE
  'zrob:widget': 'make:widget', // PL
  'mache:widget': 'make:widget', // DE
  'zrob:odznake': 'make:badge', // PL
  'mache:abzeichen': 'make:badge', // DE
  'zrob:pasek-postepu': 'make:progress', // PL
  'mache:fortschritt': 'make:progress', // DE
  'zrob:akordeon': 'make:accordion', // PL
  'mache:akkordeon': 'make:accordion', // DE
  'zrob:paginacje': 'make:pagination', // PL
  'mache:seitenzahlen': 'make:pagination', // DE
  'zrob:podpowiedz': 'make:tooltip', // PL
  'mache:tooltip': 'make:tooltip', // DE
  'zrob:komunikat': 'make:alert', // PL
  'mache:hinweis': 'make:alert', // DE
  'zrob:rozwijane': 'make:dropdown', // PL
  'mache:dropdown': 'make:dropdown', // DE
  'zrob:zakladki': 'make:tabs', // PL
  'mache:tabs': 'make:tabs', // DE
  'zrob:kropke-statusu': 'make:status-dot', // PL
  'mache:statuspunkt': 'make:status-dot', // DE
  'zrob:licznik': 'make:counter', // PL
  'mache:zaehler': 'make:counter', // DE
  'zrob:os-czasu': 'make:timeline', // PL
  'mache:zeitleiste': 'make:timeline', // DE
  'zrob:karuzele': 'make:carousel', // PL
  'mache:karussell': 'make:carousel', // DE
  'zrob:lightbox': 'make:lightbox', // PL
  'mache:lightbox': 'make:lightbox', // DE
  'zrob:karte': 'make:card', // PL
  'mache:karte': 'make:card', // DE
  'zrob:wiersz-danych': 'make:data-row', // PL
  'mache:datenzeile': 'make:data-row', // DE
  'zrob:cennik': 'make:pricing-table', // PL
  'mache:preisliste': 'make:pricing-table', // DE
  'zrob:liste-grupowa': 'make:list-group', // PL
  'mache:listengruppe': 'make:list-group', // DE
  'zrob:referencje': 'make:testimonial', // PL
  'mache:referenz': 'make:testimonial', // DE
  'zrob:powiadomienie': 'make:toast', // PL
  'mache:benachrichtigung': 'make:toast', // DE
  'zrob:okruszki': 'make:breadcrumb', // PL
  'mache:brotkrumen': 'make:breadcrumb', // DE
  'zrob:ikone-statusu': 'make:status-icon', // PL
  'mache:statussymbol': 'make:status-icon', // DE
  'zrob:podglad-kodu': 'make:code-preview', // PL
  'mache:codevorschau': 'make:code-preview', // DE
};

const FLAG_ALIASES: Record<string, string> = {
  '--minifikuj': '--minify',
  '--minifizieren': '--minify',
  '--konfiguracja': '--config',
  '--konfiguration': '--config',
  // Flags shared by the make:* commands (CLI roadmap) - added for full
  // consistency with the rest of the CLI, even though in practice these
  // flags are more often used in scripts/CI than typed live in a terminal.
  '--liczba': '--count', // PL
  '--anzahl': '--count', // DE
  '--odpowiedzi': '--answers', // PL
  '--antworten': '--answers', // DE
  '--plik-odpowiedzi': '--answers-file', // PL
  '--antwortdatei': '--answers-file', // DE
  '--wyjscie': '--out', // PL
  '--ausgabe': '--out', // DE
};

// argv = [nodePath, scriptPath, ...userArgs] - the command word only
// starts at index 2. Skipping this caused a real bug: the loop checked
// argv[0] ("node", doesn't start with "-") as the "command word", marked
// it as handled, and never reached the actual command at argv[2].
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
    // The first token (from index 2) that doesn't start with "-" is the command word.
    if (!commandTranslated && !out[i].startsWith('-')) {
      if (out[i] in COMMAND_ALIASES) out[i] = COMMAND_ALIASES[out[i]];
      commandTranslated = true;
    }
  }
  return out;
}

/* ---------- Shared ---------- */

function targetsCwd(configPath: string): string {
  return path.dirname(path.resolve(configPath));
}

/* ---------- Program ---------- */

// Version read from our own package.json (the single source of truth) -
// instead of duplicating the number hardcoded here, where it's easy to
// forget to update it with every release.
const packageJsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version: string };

const program = new Command();
program
  .name('molique-jit')
  .description('JIT engine for the molique framework - generates only the CSS you need.')
  .version(version, '-V, --version', 'Print the version number');

program
  .command('init')
  .description('Creates the molique.config.mjs file (alias: start)')
  .action(() => {
    const target = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);
    if (fs.existsSync(target)) {
      console.error(`${DEFAULT_CONFIG_FILE} already exists - not overwriting.`);
      process.exitCode = 1;
      return;
    }
    fs.writeFileSync(target, INIT_TEMPLATE);
    console.log(`Created ${DEFAULT_CONFIG_FILE}.`);
  });

program
  .command('build')
  .description('Compiles CSS to the output file(s) (aliases: buduj, bauen)')
  .option('-c, --config <path>', 'Path to the configuration file', DEFAULT_CONFIG_FILE)
  .option('-m, --minify', 'Force output minification (see the note in molique.config.mjs)')
  .option('-v, --verbose', 'Print matching stats')
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
          `OK  ${target.output} - ${result.matchedUtilityClasses.length} utility classes, ` +
            `${result.matchedComponents.length} components.`
        );
      } catch (err) {
        console.error(`ERROR ${target.output}: ${(err as Error).message}`);
        hadError = true;
      }
    }

    process.exitCode = hadError ? 1 : 0;
  });

program
  .command('watch')
  .description('Development mode - listens for changes live (aliases: obserwuj, beobachten)')
  .option('-c, --config <path>', 'Path to the configuration file', DEFAULT_CONFIG_FILE)
  .option('-v, --verbose', 'Print stats after every rebuild', true)
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

    console.log(`Watching (${targets.length} target(s))... Ctrl+C to stop.`);

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

registerMakeModalCommand(program);
registerMakeLayoutCommand(program);
registerMakeNavCommand(program);
registerMakeTableCommand(program);
registerMakeChartCommand(program);
registerMakeFormCommand(program);
registerMakePopoverCommand(program);
registerMakeWidgetCommand(program);
registerMakeBadgeCommand(program);
registerMakeProgressCommand(program);
registerMakeAccordionCommand(program);
registerMakePaginationCommand(program);
registerMakeTooltipCommand(program);
registerMakeAlertCommand(program);
registerMakeDropdownCommand(program);
registerMakeTabsCommand(program);
registerMakeStatusDotCommand(program);
registerMakeCounterCommand(program);
registerMakeTimelineCommand(program);
registerMakeCarouselCommand(program);
registerMakeLightboxCommand(program);
registerMakeCardCommand(program);
registerMakeDataRowCommand(program);
registerMakePricingTableCommand(program);
registerMakeListGroupCommand(program);
registerMakeTestimonialCommand(program);
registerMakeToastCommand(program);
registerMakeBreadcrumbCommand(program);
registerMakeStatusIconCommand(program);
registerMakeCodePreviewCommand(program);
// Registered last (order has no functional significance - the list in
// cli/list.ts only reads program.commands when the action is actually
// invoked, by which point all commands are already registered), but it's
// more readable to keep the "listing" command as the last entry in
// registration order.
registerMakeComponentListCommand(program);

program.parseAsync(translateArgv(process.argv)).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
