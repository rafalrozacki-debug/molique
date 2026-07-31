/**
 * molique-jit - `make:widget` (Scaffolding)
 *
 * Markup verified against four independent SCSS files (each a SEPARATE,
 * opt-in bundle outside the main css/molique-style.css - hence the
 * "Requires: css/molique-style-X.css" comment in the generated markup,
 * exactly as in the real code blocks on the examples pages):
 * - css/scss/_speed-dial.scss (.speed-dial, zero JS - :hover/:focus-within),
 *   src/examples-speed-dial.html.
 * - css/scss/_before-after.scss (.before-after-slider, --position set by
 *   js/modules/before-after.js from a hidden input[range]),
 *   src/examples-before-after.html.
 * - css/scss/components/_stepper.scss (.stepper vs .stepper-numbered - TWO
 *   different .step child markups: numbered ALWAYS has .step-line, even on
 *   the last step - CSS itself hides it via `&:last-child .step-line`, so
 *   the generator doesn't need to special-case the last item),
 *   src/examples-stepper.html.
 * - css/scss/_share.scss (.share-bar, network colors hardcoded in SCSS via
 *   [data-network] - the generator does NOT choose colors, only the
 *   correct attribute value), src/examples-share-widget.html.
 *
 * The last of the 8 planned generators - after it, `make:component`
 * prints the full set.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * each of the 4 variants gets its own `XxxAnswers` type and its own pure
 * `renderXxx()`.
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
  const mainSymbol = await input({ message: 'Character/symbol on the main button:', default: '+' });

  const count = await promptCount({
    message: 'How many extra actions in the Speed Dial?',
    default: '3',
    min: 1,
    max: 6,
    flagValue: countFlag,
  });

  const actions = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Action ${i} label (aria-label):`, default: `Action ${i}` });
    const icon = await input({
      message: `  Action ${i} icon (name from img/icons-sprite.svg):`,
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
  const afterImg = await input({ message: '"After" photo URL:', default: 'img/after.jpg' });
  const afterAlt = await input({ message: '"After" photo alt text:', default: 'After' });
  const beforeImg = await input({ message: '"Before" photo URL:', default: 'img/before.jpg' });
  const beforeAlt = await input({ message: '"Before" photo alt text:', default: 'Before' });
  const maxWidth = await input({ message: 'Maximum slider width:', default: '600px' });
  const aspectRatio = await input({ message: 'Slider aspect ratio (aspect-ratio):', default: '16/9' });
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
  /** Label of the currently active step. */
  activeLabel: string;
}

export async function collectStepperAnswers(): Promise<StepperAnswers> {
  const variant = await select<StepperVariant>({
    message: 'Stepper variant?',
    choices: [
      { name: 'Classic (thick bars)', value: 'classic' },
      { name: 'Numbered (circles connected by a line)', value: 'numbered' },
    ],
  });

  const labelsLine = await input({ message: 'Step labels (comma-separated):', default: 'Dimensions, Construction, Roof' });
  const labels = labelsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const activeLabel = await select({
    message: 'Which step is currently active?',
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
  native: { name: 'Native sharing (Web Share API)', letter: '' },
};
// Order as in the real example - fixed, independent of the checkbox
// selection order (or the order in the JSON with --answers).
const NETWORK_ORDER = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'native'];

export interface ShareBarAnswers {
  /** A subset of 'facebook'|'twitter'|'linkedin'|'whatsapp'|'native', in any order - rendering enforces the NETWORK_ORDER order. */
  networks: string[];
}

export async function collectShareBarAnswers(): Promise<ShareBarAnswers> {
  const networks = await checkbox({
    message: 'Which networks to add to the bar?',
    choices: NETWORK_ORDER.map((value) => ({ name: NETWORK_META[value].name, value, checked: true })),
    validate: (choices) => (choices && choices.length > 0) || 'Choose at least one network.',
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
    message: 'Which widget do you want to generate?',
    choices: [
      { name: 'Speed Dial (floating action button)', value: 'speed-dial' },
      { name: 'Before / After Slider (photo comparison slider)', value: 'before-after' },
      { name: 'Stepper (form progress bar)', value: 'stepper' },
      { name: 'Share Bar (social media sharing)', value: 'share-bar' },
    ],
  });

  if (widgetType === 'speed-dial') return { type: 'speed-dial', ...(await collectSpeedDialAnswers(countFlag)) };
  if (widgetType === 'before-after') return { type: 'before-after', ...(await collectBeforeAfterAnswers()) };
  if (widgetType === 'stepper') return { type: 'stepper', ...(await collectStepperAnswers()) };
  return { type: 'share-bar', ...(await collectShareBarAnswers()) };
}

/* ---------- Command registration ---------- */

export function registerMakeWidgetCommand(program: Command): void {
  program
    .command('make:widget')
    .description(
      'Interactive generator for small widgets (Speed Dial / Before-After Slider / Stepper / Share Bar) ' +
        '(aliases: zrob:widget, mache:widget)'
    )
    .option('-n, --count <number>', 'Number of actions in the Speed Dial (only applies to that variant) - skips this one question')
    .option('--answers <json>', 'Answers as JSON (WidgetAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<WidgetAnswers>(opts);
      const answers = provided ?? (await collectWidgetAnswers(opts.count));
      const html = renderWidget(answers);
      await outputResult(html, `components/${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
