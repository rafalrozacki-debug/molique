/**
 * molique-jit - `make:card` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_cards.scss (4 realnie
 * rozne komponenty pod wspolnym parasolem "Karty", nie 4 modyfikatory
 * jednego): Klasyczna Karta (.card > .card-header/.card-body/.card-footer),
 * Featured Box (.featured-box - grubsza gorna ramka, ikona), Thumb Info
 * (.thumb-info - zdjecie w tle + naklada; wariant "center" ma ZUPELNIE inna
 * wewnetrzna tresc - ikona lupy, text-6 - niz "bottom"/"light" - opcjonalny
 * badge, text-7 - wiec to dwa OSOBNE stuby, nie jeden z warunkiem),
 * Interaktywna Karta (.card p-4 text-center + klasy hover - INNA struktura
 * wewnetrzna niz Klasyczna Karta, mimo tej samej bazowej klasy .card).
 * Wszystko zweryfikowane wzgledem src/examples-cards.html.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

/* ---------- Klasyczna Karta ---------- */

export interface CardClassicAnswers {
  title: string;
  body: string;
  footerButtonLabel: string;
}

async function collectCardClassicAnswers(): Promise<CardClassicAnswers> {
  const title = await input({ message: 'Tytul karty:', default: 'Tytul Karty' });
  const body = await input({ message: 'Tresc karty:', default: 'To jest standardowa karta.' });
  const footerButtonLabel = await input({ message: 'Etykieta przycisku w stopce:', default: 'Akcja' });
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
  { name: 'Primary (domyslny)', value: 'primary' },
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
  const icon = await input({ message: 'Nazwa ikony (z img/icons-sprite.svg):', default: 'ph-rocket-launch' });
  const title = await input({ message: 'Tytul cechy:', default: 'Wydajnosc' });
  const description = await input({ message: 'Opis cechy:', default: 'Krotki opis cechy produktu.' });
  const accentColor = await select<AccentColor>({ message: 'Kolor akcentu (gorna ramka + ikona)?', choices: ACCENT_COLOR_CHOICES, default: 'primary' });
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
  const imageUrl = await input({ message: 'URL zdjecia:', default: 'img/projekt.jpg' });
  const imageAlt = await input({ message: 'Tekst alternatywny zdjecia:', default: 'Projekt' });
  const title = await input({ message: 'Tekst na srodku nakladki:', default: 'Powieksz zdjecie' });
  return { imageUrl, imageAlt, title };
}

export function renderThumbInfoCenter(answers: ThumbInfoCenterAnswers): string {
  return renderStub('card-thumb-info-center.stub.html', {
    IMAGE_URL: answers.imageUrl,
    IMAGE_ALT: answers.imageAlt,
    TITLE: answers.title,
  });
}

/* ---------- Thumb Info - Bottom (+ opcjonalnie Light) ---------- */

export interface ThumbInfoBottomAnswers {
  imageUrl: string;
  imageAlt: string;
  title: string;
  /** Jasna (85% biel) naklada zamiast ciemnego gradientu. */
  light: boolean;
  /** Tekst plakietki nad tytulem, '' = brak. */
  badge: string;
}

async function collectThumbInfoBottomAnswers(): Promise<ThumbInfoBottomAnswers> {
  const imageUrl = await input({ message: 'URL zdjecia:', default: 'img/projekt.jpg' });
  const imageAlt = await input({ message: 'Tekst alternatywny zdjecia:', default: 'Projekt' });
  const title = await input({ message: 'Tytul nad dolna krawedzia:', default: 'Aplikacja Mobilna' });
  const badge = await input({ message: 'Tekst plakietki nad tytulem (puste = brak):', default: 'Nowosc' });
  const light = await confirm({ message: 'Jasna naklada (85% biel) zamiast ciemnego gradientu?', default: false });
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

/* ---------- Interaktywna Karta ---------- */

type InteractiveEffect = 'spring-shadow' | 'tilt';

export interface InteractiveCardAnswers {
  icon: string;
  title: string;
  description: string;
  effect: InteractiveEffect;
}

async function collectInteractiveCardAnswers(): Promise<InteractiveCardAnswers> {
  const icon = await input({ message: 'Nazwa ikony (z img/icons-sprite.svg):', default: 'ph-cursor-click' });
  const title = await input({ message: 'Tytul:', default: 'Spring Hover' });
  const description = await input({ message: 'Podpis:', default: '.hover-spring + .hover-gpu-shadow' });
  const effect = await select<InteractiveEffect>({
    message: 'Efekt hover?',
    choices: [
      { name: 'Spring + cien GPU (.hover-gpu-shadow .hover-spring)', value: 'spring-shadow' },
      { name: '3D Tilt - wymaga tilt.js (.tilt-card)', value: 'tilt' },
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
    // Na ciemnym tle (.bg-dark .text-white) .text-muted jest za mało czytelny -
    // realny przyklad uzywa .text-white .opacity-50 zamiast .text-muted.
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
    message: 'Jaki wariant karty?',
    choices: [
      { name: 'Klasyczna (header/body/footer)', value: 'classic' },
      { name: 'Featured Box (cecha produktu, ikona)', value: 'featured-box' },
      { name: 'Thumb Info - tekst na srodku (lupa)', value: 'thumb-info-center' },
      { name: 'Thumb Info - tekst na dole (opcjonalna plakietka)', value: 'thumb-info-bottom' },
      { name: 'Interaktywna (hover GPU / 3D Tilt)', value: 'interactive' },
    ],
  });

  if (type === 'classic') return { type: 'classic', ...(await collectCardClassicAnswers()) };
  if (type === 'featured-box') return { type: 'featured-box', ...(await collectFeaturedBoxAnswers()) };
  if (type === 'thumb-info-center') return { type: 'thumb-info-center', ...(await collectThumbInfoCenterAnswers()) };
  if (type === 'thumb-info-bottom') return { type: 'thumb-info-bottom', ...(await collectThumbInfoBottomAnswers()) };
  return { type: 'interactive', ...(await collectInteractiveCardAnswers()) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeCardCommand(program: Command): void {
  program
    .command('make:card')
    .description('Interaktywny generator kart (Klasyczna / Featured Box / Thumb Info / Interaktywna) (aliasy: zrob:karte, mache:karte)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt CardAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CardAnswers>(opts);
      const answers = provided ?? (await collectCardAnswers());
      const html = renderCard(answers);
      await outputResult(html, `components/card-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
