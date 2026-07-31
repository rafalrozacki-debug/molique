/**
 * molique-jit - `make:lightbox` (Scaffolding)
 *
 * Markup verified against css/scss/components/_lightbox.scss (the whole
 * modal - `.lightbox-overlay`, `.lightbox-content`, `.lightbox-top-bar`,
 * arrows, counter - is BUILT BY JS, `js/modules/molique-lightbox.js`; the
 * user only adds `data-lightbox` + `data-gallery` to their own existing
 * link with a photo) and src/examples-lightbox.html. So the generator
 * creates NO modal markup at all - only a thumbnail gallery with the
 * correct attributes.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface LightboxAnswers {
  /** The data-gallery attribute - groups photos into one gallery (arrows/counter only cycle within it). */
  gallery: string;
  items: Array<{ thumbImg: string; fullImg: string; alt: string }>;
}

export async function collectLightboxAnswers(countFlag?: string): Promise<LightboxAnswers> {
  const gallery = await input({ message: 'Gallery name (the data-gallery attribute):', default: 'gallery' });

  const count = await promptCount({ message: 'How many photos in the gallery?', default: '3', min: 1, max: 12, flagValue: countFlag });

  const items: LightboxAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const thumbImg = await input({ message: `  Thumbnail ${i} URL:`, default: `img/thumb-${i}.jpg` });
    const fullImg = await input({ message: `  Full photo ${i} URL:`, default: `img/full-${i}.jpg` });
    const alt = await input({ message: `  Photo ${i} alt text:`, default: `Photo ${i}` });
    items.push({ thumbImg, fullImg, alt });
  }

  return { gallery, items };
}

export function renderLightbox(answers: LightboxAnswers): string {
  const ITEMS = renderList(
    '_lightbox-item.stub.html',
    answers.items.map((i) => ({ FULL_IMG: i.fullImg, THUMB_IMG: i.thumbImg, ALT: i.alt, GALLERY: answers.gallery }))
  );
  return renderStub('lightbox.stub.html', { ITEMS });
}

export function registerMakeLightboxCommand(program: Command): void {
  program
    .command('make:lightbox')
    .description('Interactive Lightbox gallery generator (data-lightbox, the whole modal is built by JS) (aliases: zrob:lightbox, mache:lightbox)')
    .option('-n, --count <number>', 'Number of photos in the gallery - skips this one question')
    .option('--answers <json>', 'Answers as JSON (LightboxAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<LightboxAnswers>(opts);
      const answers = provided ?? (await collectLightboxAnswers(opts.count));
      const html = renderLightbox(answers);
      await outputResult(html, 'components/lightbox.html', provided ? { out: opts.out } : undefined);
    });
}
