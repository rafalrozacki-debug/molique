/**
 * molique-jit - Configuration (molique.config.mjs)
 *
 * Schema of the user configuration file - never formally defined anywhere
 * before (the original cli-spec.md only mentioned it). The file is a
 * regular ESM module with a default export of the {@link MoliqueConfig}
 * object.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** One independent build target: its own set of source files and its own output file. */
export interface ConfigTarget {
  content: string[];
  output: string;
}

export interface MoliqueConfig {
  /** Globs (relative to the config file's location) to scan. */
  content?: string[];
  /** Output CSS file path (relative to the config file's location). */
  output?: string;
  /**
   * Custom, dynamically composed classes (e.g. PHP backend:
   * `badge-<?= $status ?>`) that a plain literal scan cannot find.
   * molique's OWN runtime classes (toasts, carousel, lightbox, etc.) are
   * included automatically and do NOT need to be duplicated here - this
   * list is ONLY for classes specific to the consuming project.
   */
  safelist?: string[];
  /**
   * Output minification. Defaults to true - the source data (component
   * chunks, the utilities layer) is already compressed at the source
   * (gen-chunks.js, --style=compressed), so in practice this flag doesn't
   * squeeze out anything extra today - it stays in the schema for
   * consistency with cli-spec.md and in case future data sources are not
   * already compressed.
   */
  minify?: boolean;
  /**
   * Several independent targets from a single config (e.g. a separate,
   * smaller CSS file for each campaign landing page). When provided and
   * non-empty, REPLACES the `content`/`output` fields above - each target
   * has its own complete set.
   */
  targets?: ConfigTarget[];
}

export const DEFAULT_CONFIG_FILE = 'molique.config.mjs';
export const DEFAULT_CONTENT = ['**/*.html', '**/*.php'];
export const DEFAULT_OUTPUT = 'css/molique-jit.css';

/** Expands the config into a list of concrete targets - always at least one. */
export function resolveTargets(config: MoliqueConfig): ConfigTarget[] {
  if (config.targets && config.targets.length > 0) return config.targets;
  return [
    {
      content: config.content ?? DEFAULT_CONTENT,
      output: config.output ?? DEFAULT_OUTPUT,
    },
  ];
}

export async function loadConfig(configPath: string): Promise<MoliqueConfig> {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Configuration file not found: ${resolved}\nRun "molique-jit init" (or "molique-jit start") to create it.`
    );
  }
  const mod = (await import(pathToFileURL(resolved).href)) as { default?: MoliqueConfig };
  if (!mod.default) {
    throw new Error(`${resolved} has no default export (export default { ... }).`);
  }
  return mod.default;
}

export const INIT_TEMPLATE = `export default {
  // Project files to scan for molique classes.
  content: ${JSON.stringify(DEFAULT_CONTENT)},

  // Where to save the generated CSS.
  output: ${JSON.stringify(DEFAULT_OUTPUT)},

  // Custom, dynamically composed classes (e.g. PHP backend:
  // \`badge-<?= $status ?>\`) that the scanner cannot find as a literal.
  // molique's OWN runtime classes (toasts, carousel, lightbox, etc.) are
  // included automatically - this list does NOT need to duplicate them.
  safelist: [],

  // Output minification (see the comment in the docs - the data is
  // already compressed at the source).
  minify: true,

  // Optional: several independent CSS files from a single config, e.g. a
  // separate, dedicated file for an ad campaign landing page. When
  // provided, REPLACES the content/output fields above.
  // targets: [
  //   { content: ['landing-campaign.html'], output: 'css/landing-campaign.css' },
  // ],
};
`;
