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
 */

import type { Command } from 'commander';
import { select, input, checkbox } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';

/* ---------- Speed Dial ---------- */

const SPEED_DIAL_DEFAULT_ICONS = ['ph-envelope-simple', 'ph-phone', 'ph-chat-circle'];

async function makeSpeedDial(countFlag?: string): Promise<string> {
  const MAIN_SYMBOL = await input({ message: 'Znak/symbol na glownym przycisku:', default: '+' });

  const count = await promptCount({
    message: 'Ile dodatkowych akcji w Speed Dial?',
    default: '3',
    min: 1,
    max: 6,
    flagValue: countFlag,
  });

  const actions = [];
  for (let i = 1; i <= count; i++) {
    const LABEL = await input({ message: `  Etykieta (aria-label) akcji ${i}:`, default: `Akcja ${i}` });
    const ICON = await input({
      message: `  Ikona akcji ${i} (nazwa z img/icons-sprite.svg):`,
      default: SPEED_DIAL_DEFAULT_ICONS[i - 1] ?? 'ph-star',
    });
    actions.push({ LABEL, ICON });
  }

  const ACTIONS = renderList('_speed-dial-action.stub.html', actions);
  return renderStub('speed-dial.stub.html', { MAIN_SYMBOL, ACTIONS });
}

/* ---------- Before / After Slider ---------- */

async function makeBeforeAfter(): Promise<string> {
  const AFTER_IMG = await input({ message: 'URL zdjecia "Po":', default: 'img/after.jpg' });
  const AFTER_ALT = await input({ message: 'Tekst alternatywny zdjecia "Po":', default: 'Po' });
  const BEFORE_IMG = await input({ message: 'URL zdjecia "Przed":', default: 'img/before.jpg' });
  const BEFORE_ALT = await input({ message: 'Tekst alternatywny zdjecia "Przed":', default: 'Przed' });
  const MAX_WIDTH = await input({ message: 'Maksymalna szerokosc suwaka:', default: '600px' });
  const ASPECT_RATIO = await input({ message: 'Proporcje suwaka (aspect-ratio):', default: '16/9' });

  return renderStub('before-after.stub.html', { AFTER_IMG, AFTER_ALT, BEFORE_IMG, BEFORE_ALT, MAX_WIDTH, ASPECT_RATIO });
}

/* ---------- Stepper ---------- */

async function makeStepper(): Promise<string> {
  const variant = await select({
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
// Kolejnosc jak w realnym przykladzie - stala, niezalezna od kolejnosci zaznaczania w checkboxie.
const NETWORK_ORDER = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'native'];

async function makeShareBar(): Promise<string> {
  const selected = await checkbox({
    message: 'Ktore sieci dodac do paska?',
    choices: NETWORK_ORDER.map((value) => ({ name: NETWORK_META[value].name, value, checked: true })),
    validate: (choices) => (choices && choices.length > 0) || 'Wybierz przynajmniej jedna siec.',
  });

  const itemBlocks = NETWORK_ORDER.filter((n) => selected.includes(n)).map((network) =>
    network === 'native'
      ? renderStub('_share-btn-native.stub.html', {}).trimEnd()
      : renderStub('_share-btn-letter.stub.html', { NETWORK: network, LETTER: NETWORK_META[network].letter }).trimEnd()
  );

  return renderStub('share-bar.stub.html', { ITEMS: itemBlocks.join('\n') });
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
    .action(async (opts: { count?: string }) => {
      const widgetType = await select({
        message: 'Jaki widget chcesz wygenerowac?',
        choices: [
          { name: 'Speed Dial (plywajacy przycisk akcji)', value: 'speed-dial' },
          { name: 'Before / After Slider (suwak porownawczy zdjec)', value: 'before-after' },
          { name: 'Stepper (pasek postepu formularza)', value: 'stepper' },
          { name: 'Share Bar (udostepnianie w social media)', value: 'share-bar' },
        ],
      });

      const html =
        widgetType === 'speed-dial'
          ? await makeSpeedDial(opts.count)
          : widgetType === 'before-after'
            ? await makeBeforeAfter()
            : widgetType === 'stepper'
              ? await makeStepper()
              : await makeShareBar();

      await outputResult(html, `components/${widgetType}.html`);
    });
}
