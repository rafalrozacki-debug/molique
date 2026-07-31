/**
 * molique-jit - prompt helpers shared by the `make:*` commands.
 *
 * `promptCount()` answers the user's question: "can the CLI take a flag
 * for how many components to generate?" - yes, via the `-n, --count
 * <number>` option registered per command. When supplied, it ANSWERS that
 * ONE "how many?" question without prompting interactively, but the rest
 * of the prompts (labels, variants, colors) still work normally -
 * `--count` ONLY shortcuts the number of repeatable items, not the whole
 * interactive flow.
 */

import { input } from '@inquirer/prompts';

export const countValidator = (min: number, max: number) => (v: string) => {
  const n = Number(v);
  return (Number.isInteger(n) && n >= min && n <= max) || `Enter a whole number from ${min} to ${max}.`;
};

export interface PromptCountOptions {
  message: string;
  default: string;
  min: number;
  max: number;
  /** Value from the --count flag (opts.count from Commander) - if provided, the interactive question is skipped. */
  flagValue?: string;
}

export async function promptCount(options: PromptCountOptions): Promise<number> {
  if (options.flagValue !== undefined) {
    const n = Number(options.flagValue);
    if (!Number.isInteger(n) || n < options.min || n > options.max) {
      throw new Error(
        `--count must be a whole number from ${options.min} to ${options.max} (got "${options.flagValue}").`
      );
    }
    console.log(`${options.message} ${n}  (from the --count flag)`);
    return n;
  }
  const answer = await input({
    message: options.message,
    default: options.default,
    validate: countValidator(options.min, options.max),
  });
  return Number(answer);
}
