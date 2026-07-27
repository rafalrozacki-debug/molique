/**
 * molique-jit - `make:lightbox` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_lightbox.scss (caly
 * modal - `.lightbox-overlay`, `.lightbox-content`, `.lightbox-top-bar`,
 * strzalki, licznik - jest BUDOWANY PRZEZ JS, `js/modules/molique-lightbox.js`;
 * uzytkownik dopisuje tylko `data-lightbox` + `data-gallery` do wlasnego
 * istniejacego linku ze zdjeciem) oraz src/examples-lightbox.html. Generator
 * NIE tworzy wiec zadnego markupu modala - tylko galerie miniatur z
 * poprawnymi atrybutami.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

export interface LightboxAnswers {
  /** Atrybut data-gallery - laczy zdjecia w jedna galerie (strzalki/licznik przelaczaja tylko w jej obrebie). */
  gallery: string;
  items: Array<{ thumbImg: string; fullImg: string; alt: string }>;
}

export async function collectLightboxAnswers(countFlag?: string): Promise<LightboxAnswers> {
  const gallery = await input({ message: 'Nazwa galerii (atrybut data-gallery):', default: 'galeria' });

  const count = await promptCount({ message: 'Ile zdjec w galerii?', default: '3', min: 1, max: 12, flagValue: countFlag });

  const items: LightboxAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const thumbImg = await input({ message: `  URL miniatury ${i}:`, default: `img/miniatura-${i}.jpg` });
    const fullImg = await input({ message: `  URL pelnego zdjecia ${i}:`, default: `img/pelne-${i}.jpg` });
    const alt = await input({ message: `  Tekst alternatywny ${i}:`, default: `Zdjecie ${i}` });
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
    .description('Interaktywny generator galerii Lightbox (data-lightbox, caly modal buduje JS) (aliasy: zrob:lightbox, mache:lightbox)')
    .option('-n, --count <liczba>', 'Liczba zdjec w galerii - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt LightboxAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<LightboxAnswers>(opts);
      const answers = provided ?? (await collectLightboxAnswers(opts.count));
      const html = renderLightbox(answers);
      await outputResult(html, 'components/lightbox.html', provided ? { out: opts.out } : undefined);
    });
}
