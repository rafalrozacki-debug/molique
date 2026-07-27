/**
 * molique-jit - `make:layout` (Scaffolding)
 *
 * Trzy warianty (Admin Dashboard / Classic SaaS-Landing / Bento Grid),
 * markup zweryfikowany 1:1 wzgledem realnych, dzialajacych przykladow:
 * src/examples-admin-layout.html (.admin-layout), src/examples-hero-sections.html
 * (.page-header + .overlay ORAZ osobno .hero-with-cutout + .cutout-wrapper -
 * to DWA rozne, niekompatybilne ze soba warianty hero, mimo ze oryginalna
 * propozycja opisywala je jako jedno), src/examples-layout.html (.bento-grid).
 *
 * "Classic SaaS/Landing" ma WLASNY podwybor (Prosty/Cutout), bo to naprawde
 * dwa rozne komponenty w SCSS (_hero.scss: .page-header vs .hero-with-cutout),
 * nie jeden z opcjonalnym wycieciem.
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B): 4 plaskie typy `LayoutAnswers` (admin/hero-simple/hero-cutout/
 * bento) zamiast zagniezdzonego wyboru "hero -> simple/cutout" - spojne z
 * plaska unia typu uzywana w make-modal.ts/make-chart.ts/make-widget.ts.
 * Wybor "prosty czy cutout" zostaje interaktywnie jako DRUGIE pytanie po
 * "jaki uklad" (patrz collectLayoutAnswers), ale --answers/--answers-file
 * podaje docelowy, juz splaszczony typ wprost w polu "type".
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList, joinBlocks } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- Admin Dashboard ---------- */

export interface AdminAnswers {
  floating: boolean;
  logo: string;
  /** Etykiety pozycji menu, w kolejnosci - PIERWSZA dostaje .is-active automatycznie. */
  items: string[];
}

export async function collectAdminAnswers(countFlag?: string): Promise<AdminAnswers> {
  const floating = await confirm({
    message: 'Wariant Floating (panel odsuniety od krawedzi ekranu)?',
    default: false,
  });
  const logo = await input({ message: 'Nazwa/logo w sidebarze:', default: 'Logo' });
  const count = await promptCount({
    message: 'Ile pozycji w menu bocznym?',
    default: '3',
    min: 1,
    max: 10,
    flagValue: countFlag,
  });

  const items: string[] = [];
  for (let i = 1; i <= count; i++) {
    items.push(await input({ message: `  Etykieta pozycji ${i}:`, default: i === 1 ? 'Dashboard' : `Pozycja ${i}` }));
  }

  return { floating, logo, items };
}

export function renderAdminDashboard(answers: AdminAnswers): string {
  const { floating, logo, items } = answers;
  const navItems = items.map((LABEL, i) => ({
    LABEL,
    LINK_CLASS: ['admin-nav-link', i === 0 ? 'is-active' : ''].filter(Boolean).join(' '),
  }));
  const NAV_ITEMS = renderList('_admin-nav-item.stub.html', navItems);
  const LAYOUT_CLASSES = ['admin-layout', floating ? 'admin-layout-floating' : ''].filter(Boolean).join(' ');
  return renderStub('layout-admin.stub.html', { LAYOUT_CLASSES, LOGO: logo, NAV_ITEMS });
}

/* ---------- Classic SaaS / Landing (Hero) - Prosty ---------- */

export interface HeroSimpleAnswers {
  title: string;
  imageUrl: string;
  overlayColorClass: string;
  overlayOpacityClass: string;
  /** Etykiety breadcrumb, w kolejnosci - OSTATNIA to biezaca strona (auto .is-active + aria-current). */
  breadcrumbLabels: string[];
}

export async function collectHeroSimpleAnswers(countFlag?: string): Promise<HeroSimpleAnswers> {
  const title = await input({ message: 'Tytul sekcji hero:', default: 'Tytul Strony' });
  const imageUrl = await input({ message: 'URL zdjecia w tle:', default: 'img/hero-bg.jpg' });
  const overlayColorClass = await select({
    message: 'Kolor naklada przyciemniajacego:',
    choices: [
      { name: 'Czarny (literal)', value: 'bg-overlay' },
      { name: 'Ciemny (motyw)', value: 'overlay-dark' },
      { name: 'Primary', value: 'overlay-primary' },
      { name: 'Jasny', value: 'overlay-light' },
    ],
    default: 'bg-overlay',
  });
  const overlayOpacityClass = await select({
    message: 'Krycie nakladu:',
    choices: [
      { name: '30%', value: 'overlay-30' },
      { name: '50%', value: 'overlay-50' },
      { name: '70%', value: 'overlay-70' },
      { name: '80%', value: 'overlay-80' },
    ],
    default: 'overlay-80',
  });

  const count = await promptCount({
    message: 'Ile pozycji w breadcrumb (wliczajac biezaca strone)?',
    default: '2',
    min: 1,
    max: 6,
    flagValue: countFlag,
  });

  const breadcrumbLabels: string[] = [];
  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    breadcrumbLabels.push(
      await input({
        message: `  Etykieta pozycji breadcrumb ${i}${isLast ? ' (biezaca strona)' : ''}:`,
        default: isLast ? 'Biezaca strona' : `Krok ${i}`,
      })
    );
  }

  return { title, imageUrl, overlayColorClass, overlayOpacityClass, breadcrumbLabels };
}

export function renderHeroSimple(answers: HeroSimpleAnswers): string {
  const { title, imageUrl, overlayColorClass, overlayOpacityClass, breadcrumbLabels } = answers;
  const items = breadcrumbLabels.map((LABEL, i) => {
    const isLast = i === breadcrumbLabels.length - 1;
    return {
      ITEM_CLASS: ['breadcrumb-item', isLast ? 'is-active' : ''].filter(Boolean).join(' '),
      ARIA_CURRENT_ATTR: isLast ? ' aria-current="page"' : '',
      INNER: isLast ? LABEL : `<a href="#" class="text-white opacity-75">${LABEL}</a>`,
    };
  });
  const BREADCRUMB_ITEMS = renderList('_breadcrumb-item.stub.html', items);

  return renderStub('layout-hero-simple.stub.html', {
    TITLE: title,
    IMAGE_URL: imageUrl,
    OVERLAY_COLOR_CLASS: overlayColorClass,
    OVERLAY_OPACITY_CLASS: overlayOpacityClass,
    BREADCRUMB_ITEMS,
  });
}

/* ---------- Classic SaaS / Landing (Hero) - Cutout ---------- */

export interface HeroCutoutAnswers {
  title: string;
  message: string;
  imageUrl: string;
  imageAlt: string;
  cutoutVariant: 'cutout-md-br' | 'cutout-md-bl' | 'cutout-md-tr' | 'cutout-md-tl';
}

export async function collectHeroCutoutAnswers(): Promise<HeroCutoutAnswers> {
  const title = await input({ message: 'Tytul:', default: 'Zbuduj to z molique' });
  const message = await input({ message: 'Opis:', default: 'Krotki opis pod tytulem.' });
  const imageUrl = await input({ message: 'URL zdjecia w tle:', default: 'img/hero-bg.jpg' });
  const imageAlt = await input({ message: 'Tekst alternatywny zdjecia:', default: 'Tlo' });
  const cutoutVariant = await select<HeroCutoutAnswers['cutoutVariant']>({
    message: 'Ktory rog ma byc wyciety (dotyka zdjecia)?',
    choices: [
      { name: 'Prawy dolny', value: 'cutout-md-br' },
      { name: 'Lewy dolny', value: 'cutout-md-bl' },
      { name: 'Prawy gorny', value: 'cutout-md-tr' },
      { name: 'Lewy gorny', value: 'cutout-md-tl' },
    ],
    default: 'cutout-md-br',
  });
  return { title, message, imageUrl, imageAlt, cutoutVariant };
}

export function renderHeroCutout(answers: HeroCutoutAnswers): string {
  return renderStub('layout-hero-cutout.stub.html', {
    TITLE: answers.title,
    MESSAGE: answers.message,
    IMAGE_URL: answers.imageUrl,
    IMAGE_ALT: answers.imageAlt,
    CUTOUT_VARIANT: answers.cutoutVariant,
  });
}

/* ---------- Bento Grid ---------- */

type BentoSize = 'normal' | 'wide' | 'tall' | 'big';

const BENTO_SIZES: Record<BentoSize, string> = {
  normal: '',
  wide: 'bento-col-2',
  tall: 'bento-row-2',
  big: 'bento-col-2 bento-row-2',
};

export interface BentoAnswers {
  tiles: Array<{ label: string; size: BentoSize }>;
}

export async function collectBentoAnswers(countFlag?: string): Promise<BentoAnswers> {
  const count = await promptCount({
    message: 'Z ilu kafelkow ma sie skladac baza?',
    default: '4',
    min: 2,
    max: 8,
    flagValue: countFlag,
  });

  const tiles: BentoAnswers['tiles'] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Tresc kafelka ${i}:`, default: `Kafelek ${i}` });
    const size = await select<BentoSize>({
      message: `  Rozmiar kafelka ${i}:`,
      choices: [
        { name: 'Normalny', value: 'normal' },
        { name: 'Szeroki (2x szerokosci)', value: 'wide' },
        { name: 'Wysoki (2x wysokosci)', value: 'tall' },
        { name: 'Duzy (2x2)', value: 'big' },
      ],
      default: i === 1 ? 'big' : 'normal',
    });
    tiles.push({ label, size });
  }

  return { tiles };
}

export function renderBento(answers: BentoAnswers): string {
  const tiles = answers.tiles.map((t) => ({
    CLASSES: [BENTO_SIZES[t.size], 'hover-gpu-shadow', 'p-4'].filter(Boolean).join(' '),
    LABEL: t.label,
  }));
  const TILES = renderList('_bento-tile.stub.html', tiles);
  return renderStub('layout-bento.stub.html', { TILES });
}

/* ---------- Dispatch ---------- */

export type LayoutAnswers =
  | ({ type: 'admin' } & AdminAnswers)
  | ({ type: 'hero-simple' } & HeroSimpleAnswers)
  | ({ type: 'hero-cutout' } & HeroCutoutAnswers)
  | ({ type: 'bento' } & BentoAnswers);

function renderLayout(answers: LayoutAnswers): string {
  if (answers.type === 'admin') return renderAdminDashboard(answers);
  if (answers.type === 'hero-simple') return renderHeroSimple(answers);
  if (answers.type === 'hero-cutout') return renderHeroCutout(answers);
  return renderBento(answers);
}

async function collectLayoutAnswers(countFlag?: string): Promise<LayoutAnswers> {
  const layoutType = await select({
    message: 'Jaki uklad chcesz wygenerowac?',
    choices: [
      { name: 'Admin Dashboard', value: 'admin' },
      { name: 'Classic SaaS / Landing (Hero)', value: 'hero' },
      { name: 'Bento Grid Section', value: 'bento' },
    ],
  });

  if (layoutType === 'admin') return { type: 'admin', ...(await collectAdminAnswers(countFlag)) };
  if (layoutType === 'bento') return { type: 'bento', ...(await collectBentoAnswers(countFlag)) };

  // Cutout nie ma listy o zmiennej dlugosci - countFlag dotyczy tylko wariantu Prosty (breadcrumb).
  const heroVariant = await select({
    message: 'Ktory wariant hero?',
    choices: [
      { name: 'Prosty (naklada przyciemniajaca + breadcrumb)', value: 'simple' },
      { name: 'Z wycietym rogiem (Cutout)', value: 'cutout' },
    ],
  });
  if (heroVariant === 'simple') return { type: 'hero-simple', ...(await collectHeroSimpleAnswers(countFlag)) };
  return { type: 'hero-cutout', ...(await collectHeroCutoutAnswers()) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeLayoutCommand(program: Command): void {
  program
    .command('make:layout')
    .description(
      'Interaktywny generator szkieletow stron (Admin Dashboard / Hero / Bento Grid) ' +
        '(aliasy: zrob:uklad, mache:layout)'
    )
    .option(
      '-n, --count <liczba>',
      'Liczba powtarzalnych elementow (pozycje menu / breadcrumb / kafelki, zaleznie od wybranego ukladu) - pomija to jedno pytanie'
    )
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt LayoutAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<LayoutAnswers>(opts);
      const answers = provided ?? (await collectLayoutAnswers(opts.count));
      const html = renderLayout(answers);
      await outputResult(joinBlocks(html), `components/${answers.type}-layout.html`, provided ? { out: opts.out } : undefined);
    });
}
