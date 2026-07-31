/**
 * molique-jit - `make:layout` (Scaffolding)
 *
 * Three variants (Admin Dashboard / Classic SaaS-Landing / Bento Grid),
 * markup verified 1:1 against real, working examples:
 * src/examples-admin-layout.html (.admin-layout), src/examples-hero-sections.html
 * (.page-header + .overlay AND separately .hero-with-cutout +
 * .cutout-wrapper - these are TWO different, mutually incompatible hero
 * variants, even though the original proposal described them as one),
 * src/examples-layout.html (.bento-grid).
 *
 * "Classic SaaS/Landing" has its OWN sub-choice (Simple/Cutout), because
 * these really are two different components in SCSS (_hero.scss:
 * .page-header vs .hero-with-cutout), not one with an optional cutout.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * 4 flat `LayoutAnswers` types (admin/hero-simple/hero-cutout/bento)
 * instead of a nested "hero -> simple/cutout" choice - consistent with
 * the flat type union used in make-modal.ts/make-chart.ts/make-widget.ts.
 * The "simple or cutout" choice remains interactively as the SECOND
 * question after "which layout" (see collectLayoutAnswers), but
 * --answers/--answers-file supplies the target, already-flattened type
 * directly in the "type" field.
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
  /** Menu item labels, in order - the FIRST one gets .is-active automatically. */
  items: string[];
}

export async function collectAdminAnswers(countFlag?: string): Promise<AdminAnswers> {
  const floating = await confirm({
    message: 'Floating variant (panel pulled away from the screen edge)?',
    default: false,
  });
  const logo = await input({ message: 'Name/logo in the sidebar:', default: 'Logo' });
  const count = await promptCount({
    message: 'How many items in the side menu?',
    default: '3',
    min: 1,
    max: 10,
    flagValue: countFlag,
  });

  const items: string[] = [];
  for (let i = 1; i <= count; i++) {
    items.push(await input({ message: `  Item ${i} label:`, default: i === 1 ? 'Dashboard' : `Item ${i}` }));
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

/* ---------- Classic SaaS / Landing (Hero) - Simple ---------- */

export interface HeroSimpleAnswers {
  title: string;
  imageUrl: string;
  overlayColorClass: string;
  overlayOpacityClass: string;
  /** Breadcrumb labels, in order - the LAST one is the current page (auto .is-active + aria-current). */
  breadcrumbLabels: string[];
}

export async function collectHeroSimpleAnswers(countFlag?: string): Promise<HeroSimpleAnswers> {
  const title = await input({ message: 'Hero section title:', default: 'Page Title' });
  const imageUrl = await input({ message: 'Background photo URL:', default: 'img/hero-bg.jpg' });
  const overlayColorClass = await select({
    message: 'Dimming overlay color:',
    choices: [
      { name: 'Black (literal)', value: 'bg-overlay' },
      { name: 'Dark (theme-aware)', value: 'overlay-dark' },
      { name: 'Primary', value: 'overlay-primary' },
      { name: 'Light', value: 'overlay-light' },
    ],
    default: 'bg-overlay',
  });
  const overlayOpacityClass = await select({
    message: 'Overlay opacity:',
    choices: [
      { name: '30%', value: 'overlay-30' },
      { name: '50%', value: 'overlay-50' },
      { name: '70%', value: 'overlay-70' },
      { name: '80%', value: 'overlay-80' },
    ],
    default: 'overlay-80',
  });

  const count = await promptCount({
    message: 'How many breadcrumb items (including the current page)?',
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
        message: `  Breadcrumb item ${i} label${isLast ? ' (current page)' : ''}:`,
        default: isLast ? 'Current page' : `Step ${i}`,
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
  const title = await input({ message: 'Title:', default: 'Build it with molique' });
  const message = await input({ message: 'Description:', default: 'A short description below the title.' });
  const imageUrl = await input({ message: 'Background photo URL:', default: 'img/hero-bg.jpg' });
  const imageAlt = await input({ message: 'Photo alt text:', default: 'Background' });
  const cutoutVariant = await select<HeroCutoutAnswers['cutoutVariant']>({
    message: 'Which corner should be cut out (touches the photo)?',
    choices: [
      { name: 'Bottom right', value: 'cutout-md-br' },
      { name: 'Bottom left', value: 'cutout-md-bl' },
      { name: 'Top right', value: 'cutout-md-tr' },
      { name: 'Top left', value: 'cutout-md-tl' },
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
    message: 'How many tiles should the base consist of?',
    default: '4',
    min: 2,
    max: 8,
    flagValue: countFlag,
  });

  const tiles: BentoAnswers['tiles'] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Tile ${i} content:`, default: `Tile ${i}` });
    const size = await select<BentoSize>({
      message: `  Tile ${i} size:`,
      choices: [
        { name: 'Normal', value: 'normal' },
        { name: 'Wide (2x width)', value: 'wide' },
        { name: 'Tall (2x height)', value: 'tall' },
        { name: 'Big (2x2)', value: 'big' },
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
    message: 'Which layout do you want to generate?',
    choices: [
      { name: 'Admin Dashboard', value: 'admin' },
      { name: 'Classic SaaS / Landing (Hero)', value: 'hero' },
      { name: 'Bento Grid Section', value: 'bento' },
    ],
  });

  if (layoutType === 'admin') return { type: 'admin', ...(await collectAdminAnswers(countFlag)) };
  if (layoutType === 'bento') return { type: 'bento', ...(await collectBentoAnswers(countFlag)) };

  // Cutout has no variable-length list - countFlag only applies to the Simple variant (breadcrumb).
  const heroVariant = await select({
    message: 'Which hero variant?',
    choices: [
      { name: 'Simple (dimming overlay + breadcrumb)', value: 'simple' },
      { name: 'With a cut-out corner (Cutout)', value: 'cutout' },
    ],
  });
  if (heroVariant === 'simple') return { type: 'hero-simple', ...(await collectHeroSimpleAnswers(countFlag)) };
  return { type: 'hero-cutout', ...(await collectHeroCutoutAnswers()) };
}

/* ---------- Command registration ---------- */

export function registerMakeLayoutCommand(program: Command): void {
  program
    .command('make:layout')
    .description(
      'Interactive page skeleton generator (Admin Dashboard / Hero / Bento Grid) ' +
        '(aliases: zrob:uklad, mache:layout)'
    )
    .option(
      '-n, --count <number>',
      'Number of repeatable items (menu items / breadcrumb / tiles, depending on the chosen layout) - skips this one question'
    )
    .option('--answers <json>', 'Answers as JSON (LayoutAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<LayoutAnswers>(opts);
      const answers = provided ?? (await collectLayoutAnswers(opts.count));
      const html = renderLayout(answers);
      await outputResult(joinBlocks(html), `components/${answers.type}-layout.html`, provided ? { out: opts.out } : undefined);
    });
}
