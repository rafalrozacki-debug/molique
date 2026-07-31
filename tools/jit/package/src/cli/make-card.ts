/**
 * molique-jit - `make:card` (Scaffolding)
 *
 * Markup verified against css/scss/components/_cards.scss (4 genuinely
 * different components under the shared "Cards" umbrella, not 4
 * modifiers of one): Classic Card (.card > .card-header/.card-body/
 * .card-footer), Featured Box (.featured-box - thicker top border,
 * icon), Thumb Info (.thumb-info - background photo + overlay; the
 * "center" variant has a COMPLETELY different inner content - magnifying
 * glass icon, text-6 - than "bottom"/"light" - optional badge, text-7 -
 * so these are two SEPARATE stubs, not one with a condition), Interactive
 * Card (.card p-4 text-center + hover classes - a DIFFERENT inner
 * structure than the Classic Card, despite sharing the base .card class).
 * Everything verified against src/examples-cards.html.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

/* ---------- Classic Card ---------- */

export interface CardClassicAnswers {
  title: string;
  body: string;
  footerButtonLabel: string;
}

async function collectCardClassicAnswers(): Promise<CardClassicAnswers> {
  const title = await input({ message: 'Card title:', default: 'Card Title' });
  const body = await input({ message: 'Card content:', default: 'This is a standard card.' });
  const footerButtonLabel = await input({ message: 'Footer button label:', default: 'Action' });
  return { title, body, footerButtonLabel };
}

export function renderCardClassic(answers: CardClassicAnswers): string {
  return renderStub('card-classic.stub.html', {
    TITLE: answers.title,
    BODY: answers.body,
    FOOTER_BUTTON_LABEL: answers.footerButtonLabel,
  });
}

/* ---------- Featured Box ---------- */

type AccentColor = 'primary' | 'success' | 'danger' | 'warning' | 'info';

const ACCENT_COLOR_CHOICES = [
  { name: 'Primary (default)', value: 'primary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
] as const;

export interface FeaturedBoxAnswers {
  icon: string;
  title: string;
  description: string;
  accentColor: AccentColor;
}

async function collectFeaturedBoxAnswers(): Promise<FeaturedBoxAnswers> {
  const icon = await input({ message: 'Icon name (from img/icons-sprite.svg):', default: 'ph-rocket-launch' });
  const title = await input({ message: 'Feature title:', default: 'Performance' });
  const description = await input({ message: 'Feature description:', default: 'A short description of the product feature.' });
  const accentColor = await select<AccentColor>({ message: 'Accent color (top border + icon)?', choices: ACCENT_COLOR_CHOICES, default: 'primary' });
  return { icon, title, description, accentColor };
}

export function renderFeaturedBox(answers: FeaturedBoxAnswers): string {
  const isDefault = answers.accentColor === 'primary';
  return renderStub('card-featured-box.stub.html', {
    ICON: answers.icon,
    TITLE: answers.title,
    DESCRIPTION: answers.description,
    STYLE_ATTR: isDefault ? '' : ` style="border-top-color: var(--${answers.accentColor})"`,
    ICON_CLASS: isDefault ? '' : ` bg-${answers.accentColor} text-white`,
  });
}

/* ---------- Thumb Info - Center ---------- */

export interface ThumbInfoCenterAnswers {
  imageUrl: string;
  imageAlt: string;
  title: string;
}

async function collectThumbInfoCenterAnswers(): Promise<ThumbInfoCenterAnswers> {
  const imageUrl = await input({ message: 'Photo URL:', default: 'img/project.jpg' });
  const imageAlt = await input({ message: 'Photo alt text:', default: 'Project' });
  const title = await input({ message: 'Text in the center of the overlay:', default: 'Enlarge photo' });
  return { imageUrl, imageAlt, title };
}

export function renderThumbInfoCenter(answers: ThumbInfoCenterAnswers): string {
  return renderStub('card-thumb-info-center.stub.html', {
    IMAGE_URL: answers.imageUrl,
    IMAGE_ALT: answers.imageAlt,
    TITLE: answers.title,
  });
}

/* ---------- Thumb Info - Bottom (+ optionally Light) ---------- */

export interface ThumbInfoBottomAnswers {
  imageUrl: string;
  imageAlt: string;
  title: string;
  /** A light (85% white) overlay instead of the dark gradient. */
  light: boolean;
  /** Badge text above the title, '' = none. */
  badge: string;
}

async function collectThumbInfoBottomAnswers(): Promise<ThumbInfoBottomAnswers> {
  const imageUrl = await input({ message: 'Photo URL:', default: 'img/project.jpg' });
  const imageAlt = await input({ message: 'Photo alt text:', default: 'Project' });
  const title = await input({ message: 'Title above the bottom edge:', default: 'Mobile App' });
  const badge = await input({ message: 'Badge text above the title (empty = none):', default: 'New' });
  const light = await confirm({ message: 'Light overlay (85% white) instead of the dark gradient?', default: false });
  return { imageUrl, imageAlt, title, badge, light };
}

export function renderThumbInfoBottom(answers: ThumbInfoBottomAnswers): string {
  const BADGE_HTML = answers.badge
    ? `\n    <span class="badge badge-primary mb-2 align-self-start">${answers.badge}</span>`
    : '';
  return renderStub('card-thumb-info-bottom.stub.html', {
    IMAGE_URL: answers.imageUrl,
    IMAGE_ALT: answers.imageAlt,
    TITLE: answers.title,
    LIGHT_CLASS: answers.light ? ' thumb-info-light' : '',
    BADGE_HTML,
  });
}

/* ---------- Interactive Card ---------- */

type InteractiveEffect = 'spring-shadow' | 'tilt';

export interface InteractiveCardAnswers {
  icon: string;
  title: string;
  description: string;
  effect: InteractiveEffect;
}

async function collectInteractiveCardAnswers(): Promise<InteractiveCardAnswers> {
  const icon = await input({ message: 'Icon name (from img/icons-sprite.svg):', default: 'ph-cursor-click' });
  const title = await input({ message: 'Title:', default: 'Spring Hover' });
  const description = await input({ message: 'Caption:', default: '.hover-spring + .hover-gpu-shadow' });
  const effect = await select<InteractiveEffect>({
    message: 'Hover effect?',
    choices: [
      { name: 'Spring + GPU shadow (.hover-gpu-shadow .hover-spring)', value: 'spring-shadow' },
      { name: '3D Tilt - requires tilt.js (.tilt-card)', value: 'tilt' },
    ],
    default: 'spring-shadow',
  });
  return { icon, title, description, effect };
}

export function renderInteractiveCard(answers: InteractiveCardAnswers): string {
  const isTilt = answers.effect === 'tilt';
  return renderStub('card-interactive.stub.html', {
    ICON: answers.icon,
    TITLE: answers.title,
    DESCRIPTION: answers.description,
    EFFECT_CLASS: isTilt ? ' tilt-card bg-dark text-white' : ' hover-gpu-shadow hover-spring',
    // On a dark background (.bg-dark .text-white) .text-muted isn't
    // legible enough - the real example uses .text-white .opacity-50
    // instead of .text-muted.
    DESCRIPTION_CLASS: isTilt ? 'text-white opacity-50' : 'text-muted',
  });
}

/* ---------- Dispatch ---------- */

export type CardAnswers =
  | ({ type: 'classic' } & CardClassicAnswers)
  | ({ type: 'featured-box' } & FeaturedBoxAnswers)
  | ({ type: 'thumb-info-center' } & ThumbInfoCenterAnswers)
  | ({ type: 'thumb-info-bottom' } & ThumbInfoBottomAnswers)
  | ({ type: 'interactive' } & InteractiveCardAnswers);

function renderCard(answers: CardAnswers): string {
  if (answers.type === 'classic') return renderCardClassic(answers);
  if (answers.type === 'featured-box') return renderFeaturedBox(answers);
  if (answers.type === 'thumb-info-center') return renderThumbInfoCenter(answers);
  if (answers.type === 'thumb-info-bottom') return renderThumbInfoBottom(answers);
  return renderInteractiveCard(answers);
}

async function collectCardAnswers(): Promise<CardAnswers> {
  const type = await select<CardAnswers['type']>({
    message: 'Which card variant?',
    choices: [
      { name: 'Classic (header/body/footer)', value: 'classic' },
      { name: 'Featured Box (product feature, icon)', value: 'featured-box' },
      { name: 'Thumb Info - centered text (magnifying glass)', value: 'thumb-info-center' },
      { name: 'Thumb Info - text at the bottom (optional badge)', value: 'thumb-info-bottom' },
      { name: 'Interactive (GPU hover / 3D Tilt)', value: 'interactive' },
    ],
  });

  if (type === 'classic') return { type: 'classic', ...(await collectCardClassicAnswers()) };
  if (type === 'featured-box') return { type: 'featured-box', ...(await collectFeaturedBoxAnswers()) };
  if (type === 'thumb-info-center') return { type: 'thumb-info-center', ...(await collectThumbInfoCenterAnswers()) };
  if (type === 'thumb-info-bottom') return { type: 'thumb-info-bottom', ...(await collectThumbInfoBottomAnswers()) };
  return { type: 'interactive', ...(await collectInteractiveCardAnswers()) };
}

/* ---------- Command registration ---------- */

export function registerMakeCardCommand(program: Command): void {
  program
    .command('make:card')
    .description('Interactive card generator (Classic / Featured Box / Thumb Info / Interactive) (aliases: zrob:karte, mache:karte)')
    .option('--answers <json>', 'Answers as JSON (CardAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CardAnswers>(opts);
      const answers = provided ?? (await collectCardAnswers());
      const html = renderCard(answers);
      await outputResult(html, `components/card-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
