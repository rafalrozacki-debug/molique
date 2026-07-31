/**
 * molique-jit - shared "what to do with the generated code?" prompt for
 * all `make:*` commands (spec: "UX Innovation" - console / file / [later:
 * clipboard]). Extracted from make.ts so make-layout.ts and later
 * commands don't duplicate the same logic.
 *
 * The third, optional parameter enables the NON-INTERACTIVE branch (CLI
 * roadmap, Stage B) - commands using `--answers`/`--answers-file` pass it
 * so CI/a script never gets stuck on the "console or file?" question.
 * No third argument = exactly the old behavior (100% backward compatible
 * until the remaining commands are migrated).
 */

import fs from 'node:fs';
import path from 'node:path';
import { select, input, confirm } from '@inquirer/prompts';

export interface NonInteractiveOutput {
  /** Output file path. Absent = write to stdout. */
  out?: string;
}

export async function outputResult(
  html: string,
  defaultFileName: string,
  nonInteractive?: NonInteractiveOutput
): Promise<void> {
  if (nonInteractive) {
    if (!nonInteractive.out) {
      console.log(html);
      return;
    }
    const resolved = path.resolve(process.cwd(), nonInteractive.out);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, html);
    console.log(`Saved: ${nonInteractive.out}`);
    return;
  }

  const outputMode = await select({
    message: 'What do you want to do with the generated code?',
    choices: [
      { name: 'Print in the console (to copy)', value: 'console' },
      { name: 'Save to a file', value: 'file' },
    ],
  });

  if (outputMode === 'console') {
    console.log('\n' + html);
    return;
  }

  const outPath = await input({ message: 'Output file path:', default: defaultFileName });
  const resolved = path.resolve(process.cwd(), outPath);

  if (fs.existsSync(resolved)) {
    const overwrite = await confirm({ message: `${outPath} already exists - overwrite?`, default: false });
    if (!overwrite) {
      console.log('Cancelled.');
      return;
    }
  }

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, html);
  console.log(`Saved: ${outPath}`);
}
