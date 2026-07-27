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
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList, joinBlocks } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';

/* ---------- Admin Dashboard ---------- */

async function makeAdminDashboard(countFlag?: string): Promise<string> {
  const floating = await confirm({
    message: 'Wariant Floating (panel odsuniety od krawedzi ekranu)?',
    default: false,
  });
  const LOGO = await input({ message: 'Nazwa/logo w sidebarze:', default: 'Logo' });
  const count = await promptCount({
    message: 'Ile pozycji w menu bocznym?',
    default: '3',
    min: 1,
    max: 10,
    flagValue: countFlag,
  });

  const items = [];
  for (let i = 1; i <= count; i++) {
    const LABEL = await input({ message: `  Etykieta pozycji ${i}:`, default: i === 1 ? 'Dashboard' : `Pozycja ${i}` });
    const LINK_CLASS = ['admin-nav-link', i === 1 ? 'is-active' : ''].filter(Boolean).join(' ');
    items.push({ LABEL, LINK_CLASS });
  }

  const NAV_ITEMS = renderList('_admin-nav-item.stub.html', items);
  const LAYOUT_CLASSES = ['admin-layout', floating ? 'admin-layout-floating' : ''].filter(Boolean).join(' ');

  return renderStub('layout-admin.stub.html', { LAYOUT_CLASSES, LOGO, NAV_ITEMS });
}

/* ---------- Classic SaaS / Landing (Hero) ---------- */

async function makeHeroSimple(countFlag?: string): Promise<string> {
  const TITLE = await input({ message: 'Tytul sekcji hero:', default: 'Tytul Strony' });
  const IMAGE_URL = await input({ message: 'URL zdjecia w tle:', default: 'img/hero-bg.jpg' });
  const OVERLAY_COLOR_CLASS = await select({
    message: 'Kolor naklada przyciemniajacego:',
    choices: [
      { name: 'Czarny (literal)', value: 'bg-overlay' },
      { name: 'Ciemny (motyw)', value: 'overlay-dark' },
      { name: 'Primary', value: 'overlay-primary' },
      { name: 'Jasny', value: 'overlay-light' },
    ],
    default: 'bg-overlay',
  });
  const OVERLAY_OPACITY_CLASS = await select({
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

  const items = [];
  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    const LABEL = await input({
      message: `  Etykieta pozycji breadcrumb ${i}${isLast ? ' (biezaca strona)' : ''}:`,
      default: isLast ? 'Biezaca strona' : `Krok ${i}`,
    });
    items.push({
      ITEM_CLASS: ['breadcrumb-item', isLast ? 'is-active' : ''].filter(Boolean).join(' '),
      ARIA_CURRENT_ATTR: isLast ? ' aria-current="page"' : '',
      INNER: isLast ? LABEL : `<a href="#" class="text-white opacity-75">${LABEL}</a>`,
    });
  }

  const BREADCRUMB_ITEMS = renderList('_breadcrumb-item.stub.html', items);

  return renderStub('layout-hero-simple.stub.html', {
    TITLE,
    IMAGE_URL,
    OVERLAY_COLOR_CLASS,
    OVERLAY_OPACITY_CLASS,
    BREADCRUMB_ITEMS,
  });
}

async function makeHeroCutout(): Promise<string> {
  const TITLE = await input({ message: 'Tytul:', default: 'Zbuduj to z molique' });
  const MESSAGE = await input({ message: 'Opis:', default: 'Krotki opis pod tytulem.' });
  const IMAGE_URL = await input({ message: 'URL zdjecia w tle:', default: 'img/hero-bg.jpg' });
  const IMAGE_ALT = await input({ message: 'Tekst alternatywny zdjecia:', default: 'Tlo' });
  const CUTOUT_VARIANT = await select({
    message: 'Ktory rog ma byc wyciety (dotyka zdjecia)?',
    choices: [
      { name: 'Prawy dolny', value: 'cutout-md-br' },
      { name: 'Lewy dolny', value: 'cutout-md-bl' },
      { name: 'Prawy gorny', value: 'cutout-md-tr' },
      { name: 'Lewy gorny', value: 'cutout-md-tl' },
    ],
    default: 'cutout-md-br',
  });

  return renderStub('layout-hero-cutout.stub.html', { TITLE, MESSAGE, IMAGE_URL, IMAGE_ALT, CUTOUT_VARIANT });
}

async function makeHero(countFlag?: string): Promise<string> {
  const variant = await select({
    message: 'Ktory wariant hero?',
    choices: [
      { name: 'Prosty (naklada przyciemniajaca + breadcrumb)', value: 'simple' },
      { name: 'Z wycietym rogiem (Cutout)', value: 'cutout' },
    ],
  });
  // Cutout nie ma listy o zmiennej dlugosci - countFlag dotyczy tylko wariantu Prosty (breadcrumb).
  return variant === 'simple' ? makeHeroSimple(countFlag) : makeHeroCutout();
}

/* ---------- Bento Grid ---------- */

const BENTO_SIZES: Record<string, string> = {
  normal: '',
  wide: 'bento-col-2',
  tall: 'bento-row-2',
  big: 'bento-col-2 bento-row-2',
};

async function makeBento(countFlag?: string): Promise<string> {
  const count = await promptCount({
    message: 'Z ilu kafelkow ma sie skladac baza?',
    default: '4',
    min: 2,
    max: 8,
    flagValue: countFlag,
  });

  const tiles = [];
  for (let i = 1; i <= count; i++) {
    const LABEL = await input({ message: `  Tresc kafelka ${i}:`, default: `Kafelek ${i}` });
    const sizeKey = await select({
      message: `  Rozmiar kafelka ${i}:`,
      choices: [
        { name: 'Normalny', value: 'normal' },
        { name: 'Szeroki (2x szerokosci)', value: 'wide' },
        { name: 'Wysoki (2x wysokosci)', value: 'tall' },
        { name: 'Duzy (2x2)', value: 'big' },
      ],
      default: i === 1 ? 'big' : 'normal',
    });
    const CLASSES = [BENTO_SIZES[sizeKey], 'hover-gpu-shadow', 'p-4'].filter(Boolean).join(' ');
    tiles.push({ CLASSES, LABEL });
  }

  const TILES = renderList('_bento-tile.stub.html', tiles);
  return renderStub('layout-bento.stub.html', { TILES });
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
    .action(async (opts: { count?: string }) => {
      const layoutType = await select({
        message: 'Jaki uklad chcesz wygenerowac?',
        choices: [
          { name: 'Admin Dashboard', value: 'admin' },
          { name: 'Classic SaaS / Landing (Hero)', value: 'hero' },
          { name: 'Bento Grid Section', value: 'bento' },
        ],
      });

      const html =
        layoutType === 'admin'
          ? await makeAdminDashboard(opts.count)
          : layoutType === 'hero'
            ? await makeHero(opts.count)
            : await makeBento(opts.count);

      await outputResult(joinBlocks(html), `components/${layoutType}-layout.html`);
    });
}
