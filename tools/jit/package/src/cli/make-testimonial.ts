/**
 * molique-jit - `make:testimonial` (Scaffolding)
 *
 * Markup verified against css/scss/components/_testimonials.scss
 * (.testimonial > .testimonial-stars + .testimonial-quote +
 * .testimonial-author > .testimonial-avatar + name/role) and
 * src/examples-testimonials.html.
 *
 * A single shape (one testimonial card) - no `-n/--count`, following the
 * convention for single-item commands (make:badge, make:progress).
 *
 * Fix relative to the real example: the LIVE PREVIEW on the page renders
 * 5 stars as SVG (`<svg class="icon"><use
 * href="img/icons-sprite.svg#ph-star--fill">`), but the copyable code
 * block (`<pre><code>`) on the same page shows the LITERAL text
 * "★★★★★" (a Unicode entity) instead of SVG - two different renderings
 * of the same component in one file. The generator uses the SVG sprite
 * (consistent with the rest of the framework: cards, lightbox, data-row,
 * pricing-table), repeated exactly as many times as stars were chosen -
 * with no separator between them, exactly like in the live preview.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

const STAR_ICON = '<svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#ph-star--fill"></use></svg>';

export interface TestimonialAnswers {
  /** Number of filled stars (0-5). */
  starCount: number;
  quote: string;
  avatarUrl: string;
  avatarAlt: string;
  name: string;
  role: string;
}

export async function collectTestimonialAnswers(): Promise<TestimonialAnswers> {
  const starCount = await select<number>({
    message: 'How many stars (0-5)?',
    choices: [0, 1, 2, 3, 4, 5].map((n) => ({ name: String(n), value: n })),
    default: 5,
  });
  const quote = await input({
    message: 'Quote content (without quotation marks - the generator adds them):',
    default: 'molique completely changed the way I build websites.',
  });
  const avatarUrl = await input({ message: 'Author avatar URL:', default: 'img/avatar.jpg' });
  const avatarAlt = await input({ message: 'Avatar alt text:', default: 'Customer' });
  const name = await input({ message: 'Author full name:', default: 'Anna Nowak' });
  const role = await input({ message: 'Author role/company:', default: 'CEO, Acme Inc.' });

  return { starCount, quote, avatarUrl, avatarAlt, name, role };
}

export function renderTestimonial(answers: TestimonialAnswers): string {
  return renderStub('testimonial.stub.html', {
    STARS: STAR_ICON.repeat(answers.starCount),
    QUOTE: answers.quote,
    AVATAR_URL: answers.avatarUrl,
    AVATAR_ALT: answers.avatarAlt,
    NAME: answers.name,
    ROLE: answers.role,
  });
}

export function registerMakeTestimonialCommand(program: Command): void {
  program
    .command('make:testimonial')
    .description('Interactive testimonial card generator (.testimonial) (aliases: zrob:referencje, mache:referenz)')
    .option('--answers <json>', 'Answers as JSON (TestimonialAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TestimonialAnswers>(opts);
      const answers = provided ?? (await collectTestimonialAnswers());
      const html = renderTestimonial(answers);
      await outputResult(html, 'components/testimonial.html', provided ? { out: opts.out } : undefined);
    });
}
