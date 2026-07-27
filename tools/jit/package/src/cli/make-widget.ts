/**
 * molique-jit - `make:widget` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem czterech niezaleznych plikow SCSS (kazdy to
 * OSOBNY, opt-in bundle poza glownym css/molique-style.css - stad komentarz
 * "Wymaga: css/molique-style-X.css" w wygenerowanym markupie, dokladnie jak
 * w realnych blokach kodu na stronach przykladow):
 * - css/scss/_speed-dial.scss (.speed-dial, zero JS - :hover/:focus-within),
 *   src/examples-speed-dial.html.
 * - css/scss/_before-after.scss (.before-after-slider, --position ustawiane
 *   przez js/modules/before-after.js z ukrytego input[range]),
 *   src/examples-before-after.html.
 * - css/scss/components/_stepper.scss (.stepper vs .stepper-numbered - DWA
 *   rozne markupy dziecka .step: numbered ZAWSZE ma .step-line, nawet w
 *   ostatnim kroku - CSS sam go ukrywa `&:last-child .step-line`, wiec
 *   generator nie musi robic wyjatku dla ostatniego elementu),
 *   src/examples-stepper.html.
 * - css/scss/_share.scss (.share-bar, kolory sieci na sztywno w SCSS przez
 *   [data-network] - generator NIE wybiera kolorow, tylko poprawna wartosc
 *   atrybutu), src/examples-share-widget.html.
 *
 * Ostatni z 8 zaplanowanych generatorow - po nim `make:component` wypisuje
 * komplet.
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B): kazdy z 4 wariantow dostaje wlasny typ `XxxAnswers` i wlasna
 * czysta `renderXxx()`.
 */

import type { Command } from 'commander';
import { select, input, checkbox } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- Speed Dial ---------- */

const SPEED_DIAL_DEFAULT_ICONS = ['ph-envelope-simple', 'ph-phone', 'ph-chat-circle'];

export interface SpeedDialAnswers {
  mainSymbol: string;
  actions: Array<{ label: string; icon: string }>;
}

export async function collectSpeedDialAnswers(countFlag?: string): Promise<SpeedDialAnswers> {
  const mainSymbol = await input({ message: 'Znak/symbol na glownym przycisku:', default: '+' });

  const count = await promptCount({
    message: 'Ile dodatkowych akcji w Speed Dial?',
    default: '3',
    min: 1,
    max: 6,
    flagValue: countFlag,
  });

  const actions = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Etykieta (aria-label) akcji ${i}:`, default: `Akcja ${i}` });
    const icon = await input({
      message: `  Ikona akcji ${i} (nazwa z img/icons-sprite.svg):`,
      default: SPEED_DIAL_DEFAULT_ICONS[i - 1] ?? 'ph-star',
    });
    actions.push({ label, icon });
  }

  return { mainSymbol, actions };
}

export function renderSpeedDial(answers: SpeedDialAnswers): string {
  const ACTIONS = renderList(
    '_speed-dial-action.stub.html',
    answers.actions.map((a) => ({ LABEL: a.label, ICON: a.icon }))
  );
  return renderStub('speed-dial.stub.html', { MAIN_SYMBOL: answers.mainSymbol, ACTIONS });
}

/* ---------- Before / After Slider ---------- */

export interface BeforeAfterAnswers {
  afterImg: string;
  afterAlt: string;
  beforeImg: string;
  beforeAlt: string;
  maxWidth: string;
  aspectRatio: string;
}

export async function collectBeforeAfterAnswers(): Promise<BeforeAfterAnswers> {
  const afterImg = await input({ message: 'URL zdjecia "Po":', default: 'img/after.jpg' });
  const afterAlt = await input({ message: 'Tekst alternatywny zdjecia "Po":', default: 'Po' });
  const beforeImg = await input({ message: 'URL zdjecia "Przed":', default: 'img/before.jpg' });
  const beforeAlt = await input({ message: 'Tekst alternatywny zdjecia "Przed":', default: 'Przed' });
  const maxWidth = await input({ message: 'Maksymalna szerokosc suwaka:', default: '600px' });
  const aspectRatio = await input({ message: 'Proporcje suwaka (aspect-ratio):', default: '16/9' });
  return { afterImg, afterAlt, beforeImg, beforeAlt, maxWidth, aspectRatio };
}

export function renderBeforeAfter(answers: BeforeAfterAnswers): string {
  return renderStub('before-after.stub.html', {
    AFTER_IMG: answers.afterImg,
    AFTER_ALT: answers.afterAlt,
    BEFORE_IMG: answers.beforeImg,
    BEFORE_ALT: answers.beforeAlt,
    MAX_WIDTH: answers.maxWidth,
    ASPECT_RATIO: answers.aspectRatio,
  });
}

/* ---------- Stepper ---------- */

type StepperVariant = 'classic' | 'numbered';

export interface StepperAnswers {
  variant: StepperVariant;
  labels: string[];
  /** Etykieta aktualnie aktywnego kroku. */
  activeLabel: string;
}

export async function collectStepperAnswers(): Promise<StepperAnswers> {
  const variant = await select<StepperVariant>({
    message: 'Wariant steppera?',
    choices: [
      { name: 'Klasyczny (grube paski)', value: 'classic' },
      { name: 'Numerowany (kolka polaczone linia)', value: 'numbered' },
    ],
  });

  const labelsLine = await input({ message: 'Etykiety krokow (oddzielone przecinkami):', default: 'Wymiary, Konstrukcja, Dach' });
  const labels = labelsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const activeLabel = await select({
    message: 'Ktory krok jest aktualnie aktywny?',
    choices: labels.map((l) => ({ name: l, value: l })),
    default: labels[0],
  });

  return { variant, labels, activeLabel };
}

export function renderStepper(answers: StepperAnswers): string {
  const { variant, labels, activeLabel } = answers;
  const activeIndex = labels.indexOf(activeLabel);

  const stubName = variant === 'numbered' ? '_stepper-step-numbered.stub.html' : '_stepper-step-classic.stub.html';
  const steps = labels.map((LABEL, i) => {
    const CLASS =
      variant === 'numbered'
        ? i < activeIndex
          ? ' is-completed'
          : i === activeIndex
            ? ' is-active'
            : ''
        : i === activeIndex
          ? ' is-active'
          : '';
    return { LABEL, CLASS };
  });

  const STEPS = renderList(stubName, steps);
  const STEPPER_CLASS = variant === 'numbered' ? ' stepper-numbered' : '';
  return renderStub('stepper.stub.html', { STEPPER_CLASS, STEPS });
}

/* ---------- Share Bar ---------- */

const NETWORK_META: Record<string, { name: string; letter: string }> = {
  facebook: { name: 'Facebook', letter: 'f' },
  twitter: { name: 'Twitter / X', letter: 't' },
  linkedin: { name: 'LinkedIn', letter: 'in' },
  whatsapp: { name: 'WhatsApp', letter: 'w' },
  native: { name: 'Natywne udostepnianie (Web Share API)', letter: '' },
};
// Kolejnosc jak w realnym przykladzie - stala, niezalezna od kolejnosci zaznaczania w checkboxie
// (lub od kolejnosci w JSON-ie przy --answers).
const NETWORK_ORDER = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'native'];

export interface ShareBarAnswers {
  /** Podzbior 'facebook'|'twitter'|'linkedin'|'whatsapp'|'native', w dowolnej kolejnosci - render wymusza kolejnosc NETWORK_ORDER. */
  networks: string[];
}

export async function collectShareBarAnswers(): Promise<ShareBarAnswers> {
  const networks = await checkbox({
    message: 'Ktore sieci dodac do paska?',
    choices: NETWORK_ORDER.map((value) => ({ name: NETWORK_META[value].name, value, checked: true })),
    validate: (choices) => (choices && choices.length > 0) || 'Wybierz przynajmniej jedna siec.',
  });
  return { networks };
}

export function renderShareBar(answers: ShareBarAnswers): string {
  const itemBlocks = NETWORK_ORDER.filter((n) => answers.networks.includes(n)).map((network) =>
    network === 'native'
      ? renderStub('_share-btn-native.stub.html', {}).trimEnd()
      : renderStub('_share-btn-letter.stub.html', { NETWORK: network, LETTER: NETWORK_META[network].letter }).trimEnd()
  );
  return renderStub('share-bar.stub.html', { ITEMS: itemBlocks.join('\n') });
}

/* ---------- Dispatch ---------- */

export type WidgetAnswers =
  | ({ type: 'speed-dial' } & SpeedDialAnswers)
  | ({ type: 'before-after' } & BeforeAfterAnswers)
  | ({ type: 'stepper' } & StepperAnswers)
  | ({ type: 'share-bar' } & ShareBarAnswers);

function renderWidget(answers: WidgetAnswers): string {
  if (answers.type === 'speed-dial') return renderSpeedDial(answers);
  if (answers.type === 'before-after') return renderBeforeAfter(answers);
  if (answers.type === 'stepper') return renderStepper(answers);
  return renderShareBar(answers);
}

async function collectWidgetAnswers(countFlag?: string): Promise<WidgetAnswers> {
  const widgetType = await select<WidgetAnswers['type']>({
    message: 'Jaki widget chcesz wygenerowac?',
    choices: [
      { name: 'Speed Dial (plywajacy przycisk akcji)', value: 'speed-dial' },
      { name: 'Before / After Slider (suwak porownawczy zdjec)', value: 'before-after' },
      { name: 'Stepper (pasek postepu formularza)', value: 'stepper' },
      { name: 'Share Bar (udostepnianie w social media)', value: 'share-bar' },
    ],
  });

  if (widgetType === 'speed-dial') return { type: 'speed-dial', ...(await collectSpeedDialAnswers(countFlag)) };
  if (widgetType === 'before-after') return { type: 'before-after', ...(await collectBeforeAfterAnswers()) };
  if (widgetType === 'stepper') return { type: 'stepper', ...(await collectStepperAnswers()) };
  return { type: 'share-bar', ...(await collectShareBarAnswers()) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeWidgetCommand(program: Command): void {
  program
    .command('make:widget')
    .description(
      'Interaktywny generator drobnych widgetow (Speed Dial / Before-After Slider / Stepper / Share Bar) ' +
        '(aliasy: zrob:widget, mache:widget)'
    )
    .option('-n, --count <liczba>', 'Liczba akcji w Speed Dial (dotyczy tylko tego wariantu) - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt WidgetAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<WidgetAnswers>(opts);
      const answers = provided ?? (await collectWidgetAnswers(opts.count));
      const html = renderWidget(answers);
      await outputResult(html, `components/${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
