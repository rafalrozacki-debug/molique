/**
 * molique-jit - `make:nav` (Scaffolding)
 *
 * Markup verified against: src/examples-navbar.html (offcanvas,
 * transparent, pill + the critical "don't combine with navbar-sticky"
 * note), src/examples-mega-menu.html and src/partials/navbar.html (mega
 * menu), src/examples-language-switch.html (language switch + checkmark
 * SVG), src/partials/navbar.html (theme switch, including the
 * id="theme-toggle" requirement).
 *
 * Unlike make:layout (where the variants were STRUCTURALLY different
 * files), here the three navbar variants (Standard/Transparent/Pill)
 * differ ONLY by class and a style attribute on the same <nav> - so it's
 * ONE stub (navbar.stub.html) with {{ NAV_CLASS }}/{{ NAV_STYLE_ATTR }}
 * computed in TS, rather than three nearly identical files.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B,
 * the last/most complex of the 8 existing commands): one flat
 * `NavAnswers` (like make:form) - a background variant + three
 * INDEPENDENTLY enabled modules (mega menu / theme switch / language
 * switch, an `undefined`/`false` field = skipped). The warning about
 * img/flags/ files stays EXCLUSIVELY in collectLanguageSwitch()
 * (interactive) - the render function is deliberately free of I/O, per
 * the rule followed throughout this refactor; an --answers/--answers-file
 * user already knows their flag codes.
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

// Shared note for Transparent/Pill - both are "position: absolute"
// (overlay on the content), so both share the same two pitfalls.
const OVERLAY_NOTE =
  '<!-- IMPORTANT: do not add .navbar-sticky to this class - sticky returns to\n' +
  '     the document flow and the whole overlay effect disappears (JS adds the\n' +
  '     .is-scrolled class automatically). Push the hero content down by\n' +
  '     var(--navbar-h), e.g.\n' +
  '     <header style="padding-top: calc(var(--navbar-h) + 4rem)">, because the\n' +
  '     navbar is position:absolute and without this the header will sit under it. -->\n';

/* ---------- Navbar background variants ---------- */

type NavVariant = 'standard' | 'transparent' | 'pill';

interface VariantAnswers {
  variant: NavVariant;
  /** Set ONLY when variant === 'pill' and the user chose to customize the colors. */
  pillBg?: string;
  pillBgScrolled?: string;
}

async function collectVariantAnswers(): Promise<VariantAnswers> {
  const variant = await select<NavVariant>({
    message: 'Navbar variant?',
    choices: [
      { name: 'Standard', value: 'standard' },
      { name: 'Transparent (overlay, sticky after scroll)', value: 'transparent' },
      { name: 'Pill (floating pill)', value: 'pill' },
    ],
  });

  if (variant !== 'pill') return { variant };

  // Pill - the documented default colors (dark pill, white text) are
  // sensible on their own; we ONLY ask about the two backgrounds (over the
  // hero / after scrolling), leaving the rest of the variables (text
  // color, padding) at their CSS defaults, instead of asking about all 6
  // at once.
  const customize = await confirm({
    message: 'Customize the pill colors for your brand? (otherwise they stay default: dark over the hero, theme-aware after scroll)',
    default: false,
  });
  if (!customize) return { variant };

  const pillBg = await input({ message: 'Pill background color over the hero (hex):', default: '#1e293b' });
  const pillBgScrolledRaw = await input({
    message: 'Background color after scrolling (hex, usually leave it theme-aware):',
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
  const wanted = await confirm({ message: 'Add a Mega Menu?', default: false });
  if (!wanted) return undefined;

  const title = await input({ message: 'Mega Menu trigger label:', default: 'Products' });
  const countStr = await input({
    message: 'How many columns should the Mega Menu have?',
    default: '2',
    validate: countValidator(1, 4),
  });
  const count = Number(countStr);

  const groups: MegaMenuAnswers['groups'] = [];
  for (let i = 1; i <= count; i++) {
    const colTitle = await input({ message: `  Column ${i} title:`, default: `Category ${i}` });
    const linksLine = await input({
      message: `  Links in column ${i} (comma-separated):`,
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
  return confirm({ message: 'Add a Light/Dark Mode switch?', default: false });
}

function renderThemeSwitch(wanted: boolean): string {
  return wanted ? renderStub('_theme-switch.stub.html', {}) : '';
}

/* ---------- Language Switch ---------- */

export interface LanguageSwitchAnswers {
  /** The first language in the list is active (gets CHECK_SVG). */
  languages: Array<{ flagCode: string; label: string }>;
}

async function collectLanguageSwitch(): Promise<LanguageSwitchAnswers | undefined> {
  const wanted = await confirm({ message: 'Add a Language Switch (Popover API)?', default: false });
  if (!wanted) return undefined;

  const countStr = await input({
    message: 'How many languages?',
    default: '2',
    validate: countValidator(2, 5),
  });
  const count = Number(countStr);

  const languages: LanguageSwitchAnswers['languages'] = [];
  for (let i = 1; i <= count; i++) {
    const isFirst = i === 1;
    const flagCode = await input({
      message: `  Language ${i} code${isFirst ? ' (active)' : ''} (file name in img/flags/, e.g. pl):`,
      default: isFirst ? 'pl' : '',
      validate: (v: string) => /^[a-z]{2}$/.test(v) || 'Enter a two-letter code (e.g. pl, gb, de).',
    });
    const label = await input({ message: `  Language ${i} full name:`, default: isFirst ? 'Polish' : '' });
    languages.push({ flagCode, label });
  }

  console.log(
    `Note: make sure the files img/flags/${languages.map((l) => l.flagCode + '.svg').join(', img/flags/')} ` +
      'exist in your project - molique only ships flags for languages actually offered.'
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
  const brand = await input({ message: 'Name/logo in the navbar:', default: 'Logo' });
  const toggleId = await input({ message: 'Offcanvas checkbox ID (unique on the page):', default: 'navToggle' });

  const count = await promptCount({
    message: 'How many plain menu items (excluding the Mega Menu)?',
    default: '3',
    min: 0,
    max: 8,
    flagValue: countFlag,
  });
  const items: string[] = [];
  for (let i = 1; i <= count; i++) {
    items.push(await input({ message: `  Item ${i} label:`, default: `Item ${i}` }));
  }

  const megaMenu = await collectMegaMenu();
  const themeSwitch = await collectThemeSwitch();
  const languageSwitch = await collectLanguageSwitch();

  return { ...variantAnswers, brand, toggleId, items, megaMenu, themeSwitch, languageSwitch };
}

/* ---------- Command registration ---------- */

export function registerMakeNavCommand(program: Command): void {
  program
    .command('make:nav')
    .description('Interactive navbar generator (offcanvas, mega menu, theme/language switch) (aliases: zrob:nawigacje, mache:nav)')
    .option(
      '-n, --count <number>',
      'Number of plain menu items (excluding the Mega Menu) - skips this one question, the rest (mega menu, languages...) stays interactive'
    )
    .option('--answers <json>', 'Answers as JSON (NavAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<NavAnswers>(opts);
      const answers = provided ?? (await collectNavAnswers(opts.count));
      const html = renderNav(answers);
      await outputResult(html, 'components/navbar.html', provided ? { out: opts.out } : undefined);
    });
}
