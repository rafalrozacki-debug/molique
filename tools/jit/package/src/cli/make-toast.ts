/**
 * molique-jit - `make:toast` (Scaffolding)
 *
 * The only component in the molique family driven entirely by JS - there
 * is no persistent markup to fill in (the `.toast-container` container
 * and the `.toast` itself are built on the fly by
 * `window.MoliqueToast.show()` in js/molique-script.js). So the
 * generator doesn't return an HTML fragment of a single component, but a
 * COMPLETE, working example: a trigger button + the API call, verified
 * against the `MoliqueToast.show({ message, type, position, duration })`
 * signature (js/molique-script.js - default values:
 * message='Powiadomienie', type='info', position='top-right',
 * duration=4000) and src/examples-toasts.html.
 *
 * The real example calls the API via an INLINE `onclick="..."` on the
 * button (acceptable in a docs site demo, but not a pattern to replicate
 * in production code) - its OWN "Copy code" block on the same page shows
 * the correct pattern instead (`<script>` + the API call), which the
 * generator follows, using `addEventListener` instead of inline
 * `onclick` (consistent with the "zero inline JS" rule from the rest of
 * the ecosystem).
 *
 * The trigger button's color matches the notification type
 * (`btn-<type>` - success/danger/warning/info are simultaneously valid
 * theme button colors), just like in the real example (`btn-success` for
 * success, `btn-danger` for danger).
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

type ToastType = 'success' | 'danger' | 'warning' | 'info';
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const TYPE_CHOICES = [
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info (default)', value: 'info' },
] as const;

const POSITION_CHOICES = [
  { name: 'Top-Right (default)', value: 'top-right' },
  { name: 'Top-Left', value: 'top-left' },
  { name: 'Top-Center', value: 'top-center' },
  { name: 'Bottom-Right', value: 'bottom-right' },
  { name: 'Bottom-Left', value: 'bottom-left' },
  { name: 'Bottom-Center', value: 'bottom-center' },
] as const;

export interface ToastAnswers {
  /** HTML id of the trigger button - must be unique on the page. */
  triggerId: string;
  triggerLabel: string;
  message: string;
  type: ToastType;
  position: ToastPosition;
  /** Display duration in milliseconds. */
  duration: number;
}

export async function collectToastAnswers(): Promise<ToastAnswers> {
  const triggerLabel = await input({ message: 'Trigger button label:', default: 'Save changes' });
  const triggerId = await input({ message: 'Button HTML id (unique on the page):', default: 'toast-trigger' });
  const message = await input({ message: 'Notification content:', default: 'Saved successfully!' });
  const type = await select<ToastType>({ message: 'Notification type?', choices: TYPE_CHOICES, default: 'success' });
  const position = await select<ToastPosition>({ message: 'Screen position?', choices: POSITION_CHOICES, default: 'top-right' });
  const durationStr = await input({
    message: 'Display duration in milliseconds:',
    default: '4000',
    validate: (v) => (Number.isInteger(Number(v)) && Number(v) > 0) || 'Enter a positive whole number.',
  });

  return { triggerId, triggerLabel, message, type, position, duration: Number(durationStr) };
}

export function renderToast(answers: ToastAnswers): string {
  return renderStub('toast.stub.html', {
    TRIGGER_ID: answers.triggerId,
    TRIGGER_LABEL: answers.triggerLabel,
    MESSAGE: answers.message,
    TYPE: answers.type,
    POSITION: answers.position,
    DURATION: String(answers.duration),
  });
}

export function registerMakeToastCommand(program: Command): void {
  program
    .command('make:toast')
    .description('Interactive Toast notification trigger button generator (MoliqueToast.show) (aliases: zrob:powiadomienie, mache:benachrichtigung)')
    .option('--answers <json>', 'Answers as JSON (ToastAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ToastAnswers>(opts);
      const answers = provided ?? (await collectToastAnswers());
      const html = renderToast(answers);
      await outputResult(html, 'components/toast.html', provided ? { out: opts.out } : undefined);
    });
}
