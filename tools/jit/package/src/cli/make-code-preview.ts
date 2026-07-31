/**
 * molique-jit - `make:code-preview` (Scaffolding)
 *
 * Markup verified against css/scss/components/_code-preview.scss
 * (.component-showcase > .component-preview + .component-code > .btn-copy
 * + <pre><code>). This is EXACTLY the "preview + code" pattern used by
 * EVERY src/examples-*.html page across the whole repo - moved from the
 * docs module into the SCSS core precisely so it works everywhere
 * (source comment: "e.g. the hero on the homepage"). `.btn-copy` does
 * NOT need any per-instance JS - copying is handled globally by
 * `js/molique-script.js` (the "BULLETPROOF CODE COPYING" section,
 * `document.querySelectorAll('.btn-copy')`), so the generator outputs
 * ONLY markup.
 *
 * Practical purpose: wrapping the output of ANOTHER `make:*` command
 * (e.g. a generated card or button) in a standard showcase for your own
 * style guide page. This is the FIRST generator in the whole molique-jit
 * family that requires real HTML escaping - `.component-code` shows the
 * code as TEXT (inside <pre><code>), while `.component-preview` renders
 * the SAME markup LIVE (unescaped) - two different purposes, one source
 * of data.
 *
 * Limitation: `input()` from @inquirer/prompts is single-line - for
 * multi-line fragments (e.g. a whole card or modal) use
 * `--answers`/`--answers-file` instead of interactive mode.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

function escapeHtml(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface CodePreviewAnswers {
  /** Raw component HTML - rendered LIVE in the preview and (escaped) as the code to copy. */
  html: string;
  /** Extra utility classes on .component-preview, e.g. "w-100 bg-surface" - empty = none. */
  previewExtraClass: string;
}

export async function collectCodePreviewAnswers(): Promise<CodePreviewAnswers> {
  const html = await input({
    message: 'Component HTML code to show (single-line - use --answers for multi-line):',
    default: '<button class="btn-primary">Button</button>',
  });
  const previewExtraClass = await input({
    message: 'Extra classes on .component-preview (empty = none, e.g. "w-100 bg-surface"):',
    default: '',
  });
  return { html, previewExtraClass };
}

export function renderCodePreview(answers: CodePreviewAnswers): string {
  return renderStub('code-preview.stub.html', {
    PREVIEW_HTML: answers.html,
    CODE_HTML: escapeHtml(answers.html),
    PREVIEW_EXTRA_CLASS: answers.previewExtraClass ? ` ${answers.previewExtraClass}` : '',
  });
}

export function registerMakeCodePreviewCommand(program: Command): void {
  program
    .command('make:code-preview')
    .description('Interactive "preview + code" block (.component-showcase) generator (aliases: zrob:podglad-kodu, mache:codevorschau)')
    .option('--answers <json>', 'Answers as JSON (CodePreviewAnswers shape) - skips ALL questions (recommended for multi-line HTML)')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CodePreviewAnswers>(opts);
      const answers = provided ?? (await collectCodePreviewAnswers());
      const html = renderCodePreview(answers);
      await outputResult(html, 'components/code-preview.html', provided ? { out: opts.out } : undefined);
    });
}
