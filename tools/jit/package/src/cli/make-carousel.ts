/**
 * molique-jit - `make:carousel` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_carousel.scss
 * (.carousel > .carousel-track > .carousel-slide, natywny scroll-snap,
 * zero JS do samego przewijania) oraz src/examples-carousel.html.
 *
 * WAZNE: `.carousel-dots`/`.carousel-dot` (kropki paginacji) generuje
 * js/modules/molique-carousel.js SAM, gdy slajdow > 1 i nie ma ich jeszcze
 * w markupie - generator NIE dopisuje ich recznie, zgodnie z tym, co
 * pokazuje realny przyklad (kropek w kodzie zrodlowym strony NIE MA,
 * mimo ze widac je w renderowanym podgladzie).
 *
 * Dwa STRUKTURALNIE rozne warianty (podstawowy: karty z tekstem vs
 * bg-sync: tlo pod-slajdowe przez data-bg + naklada), stad osobne stuby.
 *
 * A11y: bg-sync w realnym przykladzie NIE ma aria-label na strzalkach
 * nawigacji (w odroznieniu od wariantu podstawowego, ktory ma "Poprzedni"/
 * "Nastepny" - najwyrazniej przeoczenie w tym samym pliku docs), generator
 * dodaje je konsekwentnie w OBU wariantach. Inline `style="z-index: 4"` na
 * strzalkach bg-sync w przykladzie jest zbedny - `.carousel-bg-sync
 * .carousel-nav` w SCSS juz ustawia ten z-index, wiec generator go pomija.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- Podstawowa ---------- */

type SlideColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

// Ta sama klasyfikacja jasny/ciemny tekst na tle koloru co w calym repo
// (_colors.scss hover loop, FUNNEL_PALETTE w make-chart.ts): primary/
// secondary/dark -> jasny tekst, success/danger/warning/info -> ciemny
// (domyslny) tekst - dokladnie ta asymetria, ktora widac w realnym
// przykladzie (bg-primary/bg-dark dostaja text-white, bg-success nie).
const LIGHT_TEXT_COLORS = new Set<SlideColor>(['primary', 'secondary', 'dark']);

const COLOR_CHOICES = [
  { name: 'Primary', value: 'primary' },
  { name: 'Dark', value: 'dark' },
  { name: 'Success', value: 'success' },
  { name: 'Secondary', value: 'secondary' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
] as const;

export interface CarouselBasicAnswers {
  maxWidth: string;
  slides: Array<{ title: string; text: string; color: SlideColor }>;
}

async function collectCarouselBasicAnswers(countFlag?: string): Promise<CarouselBasicAnswers> {
  const maxWidth = await input({ message: 'Maksymalna szerokosc karuzeli:', default: '600px' });
  const count = await promptCount({ message: 'Ile slajdow?', default: '3', min: 1, max: 8, flagValue: countFlag });

  const slides: CarouselBasicAnswers['slides'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Tytul slajdu ${i}:`, default: `Slajd ${i}` });
    const text = await input({ message: `  Tekst slajdu ${i}:`, default: 'Przesun palcem lub uzyj strzalek' });
    const color = await select<SlideColor>({
      message: `  Kolor tla slajdu ${i}?`,
      choices: COLOR_CHOICES,
      default: (['primary', 'dark', 'success'][(i - 1) % 3] as SlideColor),
    });
    slides.push({ title, text, color });
  }

  return { maxWidth, slides };
}

export function renderCarouselBasic(answers: CarouselBasicAnswers): string {
  const SLIDES = renderList(
    '_carousel-slide-basic.stub.html',
    answers.slides.map((s) => ({
      TITLE: s.title,
      TEXT: s.text,
      COLOR: s.color,
      TEXT_CLASS: LIGHT_TEXT_COLORS.has(s.color) ? ' text-white' : '',
    }))
  );
  return renderStub('carousel-basic.stub.html', { MAX_WIDTH: answers.maxWidth, SLIDES });
}

/* ---------- Hero (Background Sync) ---------- */

export interface CarouselBgSyncAnswers {
  height: string;
  slides: Array<{ bg: string; heading: string }>;
}

async function collectCarouselBgSyncAnswers(countFlag?: string): Promise<CarouselBgSyncAnswers> {
  const height = await input({ message: 'Wysokosc karuzeli:', default: '400px' });
  const count = await promptCount({ message: 'Ile slajdow?', default: '2', min: 1, max: 8, flagValue: countFlag });

  const slides: CarouselBgSyncAnswers['slides'] = [];
  for (let i = 1; i <= count; i++) {
    const bg = await input({ message: `  URL zdjecia tla slajdu ${i}:`, default: `img/slide-${i}.jpg` });
    const heading = await input({ message: `  Naglowek slajdu ${i}:`, default: `Naglowek ${i}` });
    slides.push({ bg, heading });
  }

  return { height, slides };
}

export function renderCarouselBgSync(answers: CarouselBgSyncAnswers): string {
  const SLIDES = renderList(
    '_carousel-slide-bg-sync.stub.html',
    answers.slides.map((s) => ({ BG: s.bg, HEADING: s.heading }))
  );
  return renderStub('carousel-bg-sync.stub.html', { HEIGHT: answers.height, SLIDES });
}

/* ---------- Dispatch ---------- */

export type CarouselAnswers =
  | ({ type: 'basic' } & CarouselBasicAnswers)
  | ({ type: 'bg-sync' } & CarouselBgSyncAnswers);

function renderCarousel(answers: CarouselAnswers): string {
  return answers.type === 'basic' ? renderCarouselBasic(answers) : renderCarouselBgSync(answers);
}

async function collectCarouselAnswers(countFlag?: string): Promise<CarouselAnswers> {
  const type = await select<CarouselAnswers['type']>({
    message: 'Ktory wariant karuzeli?',
    choices: [
      { name: 'Podstawowa (karty z tekstem)', value: 'basic' },
      { name: 'Hero (tlo zmienia sie razem ze slajdem)', value: 'bg-sync' },
    ],
  });

  if (type === 'basic') return { type: 'basic', ...(await collectCarouselBasicAnswers(countFlag)) };
  return { type: 'bg-sync', ...(await collectCarouselBgSyncAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeCarouselCommand(program: Command): void {
  program
    .command('make:carousel')
    .description('Interaktywny generator karuzeli (Podstawowa / Hero Background Sync, natywny scroll-snap) (aliasy: zrob:karuzele, mache:karussell)')
    .option('-n, --count <liczba>', 'Liczba slajdow - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt CarouselAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CarouselAnswers>(opts);
      const answers = provided ?? (await collectCarouselAnswers(opts.count));
      const html = renderCarousel(answers);
      await outputResult(html, `components/carousel-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
