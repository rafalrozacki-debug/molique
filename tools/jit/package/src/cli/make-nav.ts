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
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B, ostatni/najbardziej zlozony z 8 istniejacych komend): jeden
 * plaski `NavAnswers` (jak make:form) - wariant tla + trzy NIEZALEZNIE
 * wlaczalne moduly (mega menu / theme switch / language switch, pole
 * `undefined`/`false` = pominiete). Ostrzezenie o plikach img/flags/
 * zostaje WYLACZNIE w collectLanguageSwitch() (interaktywne) - render
 * jest celowo bez I/O, zgodnie z zasada przyjeta w calym tym refaktorze;
 * uzytkownik --answers/--answers-file juz zna swoje kody flag.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount, countValidator } from './prompts.js';
import { loadAnswers } from './answers.js';

const CHECK_SVG =
  '<span class="language-switch-check"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor">' +
  '<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>' +
  '</svg></span>';

// Wspolna uwaga dla Transparent/Pastylka - obie sa "position: absolute"
// (naklada sie na tresc), wiec obie maja te same dwie pulapki.
const OVERLAY_NOTE =
  '<!-- WAZNE: nie dodawaj .navbar-sticky do tej klasy - sticky wraca do\n' +
  '     przeplywu dokumentu i caly efekt nakladki znika (klase .is-scrolled\n' +
  '     nadaje JS automatycznie). Odsun tresc hero o var(--navbar-h), np.\n' +
  '     <header style="padding-top: calc(var(--navbar-h) + 4rem)">, bo navbar\n' +
  '     jest position:absolute i bez tego naglowek wejdzie pod nim. -->\n';

/* ---------- Warianty tla navbara ---------- */

type NavVariant = 'standard' | 'transparent' | 'pill';

interface VariantAnswers {
  variant: NavVariant;
  /** Ustawione TYLKO gdy variant === 'pill' i uzytkownik zdecydowal sie dostosowac kolory. */
  pillBg?: string;
  pillBgScrolled?: string;
}

async function collectVariantAnswers(): Promise<VariantAnswers> {
  const variant = await select<NavVariant>({
    message: 'Wariant navbara?',
    choices: [
      { name: 'Standardowy', value: 'standard' },
      { name: 'Transparent (nakladkowy, sticky po scrollu)', value: 'transparent' },
      { name: 'Pastylka (floating pill)', value: 'pill' },
    ],
  });

  if (variant !== 'pill') return { variant };

  // Pastylka - dokumentowane domyslne kolory (ciemna pastylka, bialy tekst)
  // sa sensowne same w sobie; pytamy TYLKO o dwa tla (nad hero / po scrollu),
  // reszte zmiennych (kolor tekstu, padding) zostawiamy na wartosciach
  // domyslnych z CSS, zamiast prosic o wszystkie 6 na raz.
  const customize = await confirm({
    message: 'Dostosowac kolory pastylki do marki? (inaczej zostaja domyslne: ciemna nad hero, motyw po scrollu)',
    default: false,
  });
  if (!customize) return { variant };

  const pillBg = await input({ message: 'Kolor tla pastylki nad hero (hex):', default: '#1e293b' });
  const pillBgScrolledRaw = await input({
    message: 'Kolor tla po zescrollowaniu (hex, zwykle zostaw motyw):',
    default: '',
  });
  return { variant, pillBg, pillBgScrolled: pillBgScrolledRaw || undefined };
}

function renderVariant(answers: VariantAnswers): { NAV_CLASS: string; NAV_STYLE_ATTR: string; VARIANT_NOTE: string } {
  if (answers.variant === 'standard') {
    return { NAV_CLASS: 'navbar', NAV_STYLE_ATTR: '', VARIANT_NOTE: '' };
  }
  if (answers.variant === 'transparent') {
    return { NAV_CLASS: 'navbar navbar-transparent', NAV_STYLE_ATTR: '', VARIANT_NOTE: OVERLAY_NOTE };
  }

  let NAV_STYLE_ATTR = '';
  if (answers.pillBg) {
    const vars = [`--navbar-pill-bg: ${answers.pillBg};`, answers.pillBgScrolled ? `--navbar-pill-bg-scrolled: ${answers.pillBgScrolled};` : '']
      .filter(Boolean)
      .join(' ');
    NAV_STYLE_ATTR = ` style="${vars}"`;
  }
  return { NAV_CLASS: 'navbar navbar-pill', NAV_STYLE_ATTR, VARIANT_NOTE: OVERLAY_NOTE };
}

/* ---------- Mega Menu ---------- */

export interface MegaMenuAnswers {
  title: string;
  groups: Array<{ title: string; links: string[] }>;
}

async function collectMegaMenu(): Promise<MegaMenuAnswers | undefined> {
  const wanted = await confirm({ message: 'Dodac Mega Menu?', default: false });
  if (!wanted) return undefined;

  const title = await input({ message: 'Etykieta wyzwalacza Mega Menu:', default: 'Produkty' });
  const countStr = await input({
    message: 'Ile kolumn ma miec Mega Menu?',
    default: '2',
    validate: countValidator(1, 4),
  });
  const count = Number(countStr);

  const groups: MegaMenuAnswers['groups'] = [];
  for (let i = 1; i <= count; i++) {
    const colTitle = await input({ message: `  Tytul kolumny ${i}:`, default: `Kategoria ${i}` });
    const linksLine = await input({
      message: `  Linki w kolumnie ${i} (oddzielone przecinkami):`,
      default: 'Link 1, Link 2, Link 3',
    });
    const links = linksLine
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    groups.push({ title: colTitle, links });
  }

  return { title, groups };
}

function renderMegaMenu(mod: MegaMenuAnswers): string {
  const groups = mod.groups.map((g) => ({
    COL_TITLE: g.title,
    LINKS: renderList('_mega-menu-link.stub.html', g.links.map((LABEL) => ({ LABEL }))),
  }));
  const GROUPS = renderList('_mega-menu-group.stub.html', groups);
  return renderStub('_mega-menu.stub.html', { TITLE: mod.title, GROUPS });
}

/* ---------- Theme Switch ---------- */

async function collectThemeSwitch(): Promise<boolean> {
  return confirm({ message: 'Dodac przelacznik Light/Dark Mode?', default: false });
}

function renderThemeSwitch(wanted: boolean): string {
  return wanted ? renderStub('_theme-switch.stub.html', {}) : '';
}

/* ---------- Language Switch ---------- */

export interface LanguageSwitchAnswers {
  /** Pierwszy jezyk na liscie jest aktywny (dostaje CHECK_SVG). */
  languages: Array<{ flagCode: string; label: string }>;
}

async function collectLanguageSwitch(): Promise<LanguageSwitchAnswers | undefined> {
  const wanted = await confirm({ message: 'Dodac Language Switch (Popover API)?', default: false });
  if (!wanted) return undefined;

  const countStr = await input({
    message: 'Ile jezykow?',
    default: '2',
    validate: countValidator(2, 5),
  });
  const count = Number(countStr);

  const languages: LanguageSwitchAnswers['languages'] = [];
  for (let i = 1; i <= count; i++) {
    const isFirst = i === 1;
    const flagCode = await input({
      message: `  Kod jezyka ${i}${isFirst ? ' (aktywny)' : ''} (nazwa pliku w img/flags/, np. pl):`,
      default: isFirst ? 'pl' : '',
      validate: (v: string) => /^[a-z]{2}$/.test(v) || 'Podaj dwuliterowy kod (np. pl, gb, de).',
    });
    const label = await input({ message: `  Pelna nazwa jezyka ${i}:`, default: isFirst ? 'Polski' : '' });
    languages.push({ flagCode, label });
  }

  console.log(
    `Uwaga: upewnij sie, ze pliki img/flags/${languages.map((l) => l.flagCode + '.svg').join(', img/flags/')} ` +
      'istnieja w Twoim projekcie - molique dostarcza tylko flagi jezykow faktycznie oferowanych.'
  );

  return { languages };
}

function renderLanguageSwitch(mod: LanguageSwitchAnswers): string {
  const activeFlag = mod.languages[0]?.flagCode ?? 'pl';
  const items = mod.languages.map((l, i) => ({ FLAG_CODE: l.flagCode, LABEL: l.label, CHECK: i === 0 ? CHECK_SVG : '' }));
  const ITEMS = renderList('_language-switch-item.stub.html', items);
  return renderStub('_language-switch.stub.html', {
    POPOVER_ID: 'lang-switch-menu',
    ACTIVE_FLAG_CODE: activeFlag,
    ACTIVE_FLAG_CODE_UPPER: activeFlag.toUpperCase(),
    ITEMS,
  });
}

/* ---------- Dispatch ---------- */

export interface NavAnswers extends VariantAnswers {
  brand: string;
  toggleId: string;
  items: string[];
  megaMenu?: MegaMenuAnswers;
  themeSwitch: boolean;
  languageSwitch?: LanguageSwitchAnswers;
}

export function renderNav(answers: NavAnswers): string {
  const { NAV_CLASS, NAV_STYLE_ATTR, VARIANT_NOTE } = renderVariant(answers);
  const NAV_ITEMS = renderList('_navbar-item.stub.html', answers.items.map((LABEL) => ({ LABEL })));
  const MEGA_MENU = answers.megaMenu ? renderMegaMenu(answers.megaMenu) : '';
  const themeSwitchHtml = renderThemeSwitch(answers.themeSwitch);
  const languageSwitchHtml = answers.languageSwitch ? renderLanguageSwitch(answers.languageSwitch) : '';
  const MENU_CONTENT = [NAV_ITEMS, MEGA_MENU, themeSwitchHtml, languageSwitchHtml].filter(Boolean).join('\n');

  return renderStub('navbar.stub.html', {
    VARIANT_NOTE,
    NAV_CLASS,
    NAV_STYLE_ATTR,
    TOGGLE_ID: answers.toggleId,
    BRAND: answers.brand,
    MENU_CONTENT,
  });
}

async function collectNavAnswers(countFlag?: string): Promise<NavAnswers> {
  const variantAnswers = await collectVariantAnswers();
  const brand = await input({ message: 'Nazwa/logo w navbarze:', default: 'Logo' });
  const toggleId = await input({ message: 'ID checkboxa offcanvas (unikalne na stronie):', default: 'navToggle' });

  const count = await promptCount({
    message: 'Ile zwyklych pozycji menu (bez Mega Menu)?',
    default: '3',
    min: 0,
    max: 8,
    flagValue: countFlag,
  });
  const items: string[] = [];
  for (let i = 1; i <= count; i++) {
    items.push(await input({ message: `  Etykieta pozycji ${i}:`, default: `Pozycja ${i}` }));
  }

  const megaMenu = await collectMegaMenu();
  const themeSwitch = await collectThemeSwitch();
  const languageSwitch = await collectLanguageSwitch();

  return { ...variantAnswers, brand, toggleId, items, megaMenu, themeSwitch, languageSwitch };
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
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt NavAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<NavAnswers>(opts);
      const answers = provided ?? (await collectNavAnswers(opts.count));
      const html = renderNav(answers);
      await outputResult(html, 'components/navbar.html', provided ? { out: opts.out } : undefined);
    });
}
