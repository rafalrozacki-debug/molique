/**
 * molique-jit - `make:testimonial` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_testimonials.scss
 * (.testimonial > .testimonial-stars + .testimonial-quote +
 * .testimonial-author > .testimonial-avatar + nazwa/rola) oraz
 * src/examples-testimonials.html.
 *
 * Pojedynczy ksztalt (jedna karta referencji) - bez `-n/--count`, zgodnie
 * z konwencja komend jednostkowych (make:badge, make:progress).
 *
 * Poprawka wzgledem realnego przykladu: LIVE PODGLAD strony renderuje 5
 * gwiazdek jako SVG (`<svg class="icon"><use
 * href="img/icons-sprite.svg#ph-star--fill">`), ale skopiowany blok
 * kodu (`<pre><code>`) na tej samej stronie pokazuje LITERALNY tekst
 * "★★★★★" (encja Unicode) zamiast SVG - dwa rozne zapisy tego samego
 * komponentu w jednym pliku. Generator uzywa SVG-sprite (spojne z
 * cala reszta frameworka: karty, lightbox, data-row, pricing-table),
 * powtorzonego dokladnie tyle razy, ile gwiazdek wybrano - bez separatora
 * miedzy nimi, dokladnie jak w zywym podgladzie.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

const STAR_ICON = '<svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#ph-star--fill"></use></svg>';

export interface TestimonialAnswers {
  /** Liczba wypelnionych gwiazdek (0-5). */
  starCount: number;
  quote: string;
  avatarUrl: string;
  avatarAlt: string;
  name: string;
  role: string;
}

export async function collectTestimonialAnswers(): Promise<TestimonialAnswers> {
  const starCount = await select<number>({
    message: 'Ile gwiazdek (0-5)?',
    choices: [0, 1, 2, 3, 4, 5].map((n) => ({ name: String(n), value: n })),
    default: 5,
  });
  const quote = await input({
    message: 'Tresc cytatu (bez cudzyslowow - generator je doda):',
    default: 'Molique calkowicie zmienilo sposob, w jaki buduje strony internetowe.',
  });
  const avatarUrl = await input({ message: 'URL awatara autora:', default: 'img/avatar.jpg' });
  const avatarAlt = await input({ message: 'Tekst alternatywny awatara:', default: 'Klient' });
  const name = await input({ message: 'Imie i nazwisko autora:', default: 'Anna Nowak' });
  const role = await input({ message: 'Stanowisko/firma autora:', default: 'CEO r-sample' });

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
    .description('Interaktywny generator karty referencji (.testimonial) (aliasy: zrob:referencje, mache:referenz)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt TestimonialAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TestimonialAnswers>(opts);
      const answers = provided ?? (await collectTestimonialAnswers());
      const html = renderTestimonial(answers);
      await outputResult(html, 'components/testimonial.html', provided ? { out: opts.out } : undefined);
    });
}
