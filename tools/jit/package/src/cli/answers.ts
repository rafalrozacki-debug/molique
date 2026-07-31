/**
 * molique-jit - non-interactive mode (`--answers` / `--answers-file`)
 *
 * One mechanism instead of a flag for every single prompt field: JSON
 * supplied directly (`--answers`) or read from a file (`--answers-file`),
 * whose shape matches exactly the given command's `XxxAnswers` interface.
 * When provided, the command skips `collectXxxAnswers()` entirely and
 * calls `renderXxx()` directly - no questions asked.
 *
 * Deliberately WITHOUT a schema validation library - TypeScript (at the
 * call site) and the existing `renderStub()` behavior ("throw loudly on a
 * missing placeholder") are enough as a safety net, in line with the
 * minimalism already adopted in stubs.ts.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface AnswersFlags {
  answers?: string;
  answersFile?: string;
}

/**
 * Returns the parsed JSON from `--answers`/`--answers-file`, or
 * `undefined` when neither flag was supplied (in that case the command
 * should behave interactively, as before). `--answers-file` takes
 * precedence over `--answers` if someone (pointlessly) supplies both at
 * once.
 */
function parseJson<T>(raw: string, source: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`molique-jit: ${source} is not valid JSON - ${(err as Error).message}`);
  }
}

export function loadAnswers<T>(opts: AnswersFlags): T | undefined {
  if (opts.answersFile) {
    const resolved = path.resolve(process.cwd(), opts.answersFile);
    if (!fs.existsSync(resolved)) {
      throw new Error(`molique-jit: file "${resolved}" supplied via --answers-file was not found.`);
    }
    return parseJson<T>(fs.readFileSync(resolved, 'utf8'), `--answers-file (${opts.answersFile})`);
  }
  if (opts.answers) {
    return parseJson<T>(opts.answers, '--answers');
  }
  return undefined;
}
