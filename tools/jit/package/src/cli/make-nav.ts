/**
 * molique-jit - `make:nav` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem: src/examples-navbar.html (offcanvas,
 * transparent, pill + krytyczna uwaga "nie lacz z navbar-sticky"),
 * src/examples-mega-menu.html i src/partials/navbar.html (mega menu),
 * src/examples-language-switch.html (language switch + checkmark SVG),
 * src/partials/navbar.html (theme switch, w tym wymog id="theme-toggle").
 *
 * W odroznieniu od make:layout (gdzie warianty byly STRUKTURALNIE rozne
 * pliki), tu trzy warianty navbara (Standard/Transparent/Pastylka) roznia
 * sie WYLACZNIE klasa i atrybutem style na tym samym <nav> - wiec to JEDEN
 * stub (navbar.stub.html) z {{ NAV_CLASS }}/{{ NAV_STYLE_ATTR }} obliczanymi
 * w TS, a nie trzy prawie identyczne pliki.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount, countValidator } from './prompts.js';

const CHECK_SVG =
  '<span class="language-switch-check"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor">' +
  '<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>' +
  '</svg></span>';

/* ---------- Warianty tla navbara ---------- */

async function resolveVariant(): Promise<{ NAV_CLASS: string; NAV_STYLE_ATTR: string; VARIANT_NOTE: string }> {
  const variant = await select({
    message: 'Wariant navbara?',
    choices: [
      { name: 'Standardowy', value: 'standard' },
      { name: 'Transparent (nakladkowy, sticky po scrollu)', value: 'transparent' },
      { name: 'Pastylka (floating pill)', value: 'pill' },
    ],
  });

  if (variant === 'standard') {
    return { NAV_CLASS: 'navbar', NAV_STYLE_ATTR: '', VARIANT_NOTE: '' };
  }

  // Wspolna uwaga dla Transparent/Pastylka - obie sa "position: absolute"
  // (naklada sie na tresc), wiec obie maja te same dwie pulapki.
  const note =
    '<!-- WAZNE: nie dodawaj .navbar-sticky do tej klasy - sticky wraca do\n' +
    '     przeplywu dokumentu i caly efekt nakladki znika (klase .is-scrolled\n' +
    '     nadaje JS automatycznie). Odsun tresc hero o var(--navbar-h), np.\n' +
    '     <header style="padding-top: calc(var(--navbar-h) + 4rem)">, bo navbar\n' +
    '     jest position:absolute i bez tego naglowek wejdzie pod nim. -->\n';

  if (variant === 'transparent') {
    return { NAV_CLASS: 'navbar navbar-transparent', NAV_STYLE_ATTR: '', VARIANT_NOTE: note };
  }

  // Pastylka - dokumentowane domyslne kolory (ciemna pastylka, bialy tekst)
  // sa sensowne same w sobie; pytamy TYLKO o dwa tla (nad hero / po scrollu),
  // reszte zmiennych (kolor tekstu, padding) zostawiamy na wartosciach
  // domyslnych z CSS, zamiast prosic o wszystkie 6 na raz.
  const customize = await confirm({
    message: 'Dostosowac kolory pastylki do marki? (inaczej zostaja domyslne: ciemna nad hero, motyw po scrollu)',
    default: false,
  });

  let NAV_STYLE_ATTR = '';
  if (customize) {
    const bg = await input({ message: 'Kolor tla pastylki nad hero (hex):', default: '#1e293b' });
    const bgScrolled = await input({
      message: 'Kolor tla po zescrollowaniu (hex, zwykle zostaw motyw):',
      default: '',
    });
    const vars = [`--navbar-pill-bg: ${bg};`, bgScrolled ? `--navbar-pill-bg-scrolled: ${bgScrolled};` : '']
      .filter(Boolean)
      .join(' ');
    NAV_STYLE_ATTR = ` style="${vars}"`;
  }

  return { NAV_CLASS: 'navbar navbar-pill', NAV_STYLE_ATTR, VARIANT_NOTE: note };
}

/* ---------- Mega Menu ---------- */

async function promptMegaMenu(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac Mega Menu?', default: false });
  if (!wanted) return '';

  const TITLE = await input({ message: 'Etykieta wyzwalacza Mega Menu:', default: 'Produkty' });
  const countStr = await input({
    message: 'Ile kolumn ma miec Mega Menu?',
    default: '2',
    validate: countValidator(1, 4),
  });
  const count = Number(countStr);

  const groups = [];
  for (let i = 1; i <= count; i++) {
    const COL_TITLE = await input({ message: `  Tytul kolumny ${i}:`, default: `Kategoria ${i}` });
    const linksLine = await input({
      message: `  Linki w kolumnie ${i} (oddzielone przecinkami):`,
      default: 'Link 1, Link 2, Link 3',
    });
    const links = linksLine
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((LABEL) => ({ LABEL }));
    const LINKS = renderList('_mega-menu-link.stub.html', links);
    groups.push({ COL_TITLE, LINKS });
  }

  const GROUPS = renderList('_mega-menu-group.stub.html', groups);
  return renderStub('_mega-menu.stub.html', { TITLE, GROUPS });
}

/* ---------- Theme Switch ---------- */

async function promptThemeSwitch(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac przelacznik Light/Dark Mode?', default: false });
  return wanted ? renderStub('_theme-switch.stub.html', {}) : '';
}

/* ---------- Language Switch ---------- */

async function promptLanguageSwitch(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac Language Switch (Popover API)?', default: false });
  if (!wanted) return '';

  const countStr = await input({
    message: 'Ile jezykow?',
    default: '2',
    validate: countValidator(2, 5),
  });
  const count = Number(countStr);

  const items = [];
  let activeFlag = 'pl';
  for (let i = 1; i <= count; i++) {
    const isFirst = i === 1;
    const FLAG_CODE = await input({
      message: `  Kod jezyka ${i}${isFirst ? ' (aktywny)' : ''} (nazwa pliku w img/flags/, np. pl):`,
      default: isFirst ? 'pl' : '',
      validate: (v: string) => /^[a-z]{2}$/.test(v) || 'Podaj dwuliterowy kod (np. pl, gb, de).',
    });
    const LABEL = await input({ message: `  Pelna nazwa jezyka ${i}:`, default: isFirst ? 'Polski' : '' });
    if (isFirst) activeFlag = FLAG_CODE;
    items.push({ FLAG_CODE, LABEL, CHECK: isFirst ? CHECK_SVG : '' });
  }

  console.log(
    `Uwaga: upewnij sie, ze pliki img/flags/${items.map((i) => i.FLAG_CODE + '.svg').join(', img/flags/')} ` +
      'istnieja w Twoim projekcie - molique dostarcza tylko flagi jezykow faktycznie oferowanych.'
  );

  const ITEMS = renderList('_language-switch-item.stub.html', items);
  return renderStub('_language-switch.stub.html', {
    POPOVER_ID: 'lang-switch-menu',
    ACTIVE_FLAG_CODE: activeFlag,
    ACTIVE_FLAG_CODE_UPPER: activeFlag.toUpperCase(),
    ITEMS,
  });
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeNavCommand(program: Command): void {
  program
    .command('make:nav')
    .description('Interaktywny generator navbara (offcanvas, mega menu, theme/language switch) (aliasy: zrob:nawigacje, mache:nav)')
    .option(
      '-n, --count <liczba>',
      'Liczba zwyklych pozycji menu (bez Mega Menu) - pomija to jedno pytanie, reszta (mega menu, jezyki...) zostaje interaktywna'
    )
    .action(async (opts: { count?: string }) => {
      const { NAV_CLASS, NAV_STYLE_ATTR, VARIANT_NOTE } = await resolveVariant();
      const BRAND = await input({ message: 'Nazwa/logo w navbarze:', default: 'Logo' });
      const TOGGLE_ID = await input({ message: 'ID checkboxa offcanvas (unikalne na stronie):', default: 'navToggle' });

      const count = await promptCount({
        message: 'Ile zwyklych pozycji menu (bez Mega Menu)?',
        default: '3',
        min: 0,
        max: 8,
        flagValue: opts.count,
      });
      const items = [];
      for (let i = 1; i <= count; i++) {
        const LABEL = await input({ message: `  Etykieta pozycji ${i}:`, default: `Pozycja ${i}` });
        items.push({ LABEL });
      }
      const NAV_ITEMS = renderList('_navbar-item.stub.html', items);

      const MEGA_MENU = await promptMegaMenu();
      const themeSwitch = await promptThemeSwitch();
      const languageSwitch = await promptLanguageSwitch();
      const MENU_CONTENT = [NAV_ITEMS, MEGA_MENU, themeSwitch, languageSwitch].filter(Boolean).join('\n');

      const html = renderStub('navbar.stub.html', {
        VARIANT_NOTE,
        NAV_CLASS,
        NAV_STYLE_ATTR,
        TOGGLE_ID,
        BRAND,
        MENU_CONTENT,
      });

      await outputResult(html, 'components/navbar.html');
    });
}
