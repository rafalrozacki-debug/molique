/**
 * molique-jit - `make:timeline` (Scaffolding)
 *
 * Markup verified against css/scss/components/_timeline.scss (three
 * variants: `.timeline-large` with `.timeline-badge` for an icon/letter,
 * `.timeline-numbered` - CSS ITSELF adds the number via `counter()`, zero
 * extra markup for numbering, and `.timeline-labeled` - CSS Grid, the
 * date on the left, `.timeline-line` on the LAST item is hidden by CSS
 * alone via `:last-child`, the generator makes no exception) and real
 * usage in src/examples-timeline.html.
 *
 * Three STRUCTURALLY different item shapes (different fields, different
 * tag <li> vs <div>), hence a discriminated type union with a separate
 * stub per variant - the same rule as make:modal/make:chart.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- With icons (.timeline-large) ---------- */

export interface TimelineLargeAnswers {
  items: Array<{ badge: string; title: string; description: string }>;
}

async function collectTimelineLargeAnswers(countFlag?: string): Promise<TimelineLargeAnswers> {
  const count = await promptCount({ message: 'How many items on the timeline?', default: '2', min: 1, max: 8, flagValue: countFlag });
  const items: TimelineLargeAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const badge = await input({ message: `  Item ${i} letter/icon (the .timeline-badge content):`, default: String.fromCharCode(64 + i) });
    const title = await input({ message: `  Item ${i} title:`, default: `Stage ${i}` });
    const description = await input({ message: `  Item ${i} description:`, default: 'Stage description.' });
    items.push({ badge, title, description });
  }
  return { items };
}

export function renderTimelineLarge(answers: TimelineLargeAnswers): string {
  const ITEMS = renderList(
    '_timeline-item-large.stub.html',
    answers.items.map((i) => ({ BADGE: i.badge, TITLE: i.title, DESCRIPTION: i.description }))
  );
  return renderStub('timeline-large.stub.html', { ITEMS });
}

/* ---------- Numbered (.timeline-numbered) ---------- */

export interface TimelineNumberedAnswers {
  items: Array<{ title: string; description: string }>;
}

async function collectTimelineNumberedAnswers(countFlag?: string): Promise<TimelineNumberedAnswers> {
  const count = await promptCount({ message: 'How many steps?', default: '3', min: 1, max: 8, flagValue: countFlag });
  const items: TimelineNumberedAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Step ${i} title:`, default: `Step ${i}` });
    const description = await input({ message: `  Step ${i} description:`, default: 'Step description.' });
    items.push({ title, description });
  }
  return { items };
}

export function renderTimelineNumbered(answers: TimelineNumberedAnswers): string {
  const ITEMS = renderList(
    '_timeline-item-numbered.stub.html',
    answers.items.map((i) => ({ TITLE: i.title, DESCRIPTION: i.description }))
  );
  return renderStub('timeline-numbered.stub.html', { ITEMS });
}

/* ---------- With dates (.timeline-labeled) ---------- */

type NodeColor = '' | 'primary' | 'success' | 'danger';

const NODE_COLOR_CHOICES = [
  { name: 'Default (neutral)', value: '' },
  { name: 'Primary', value: 'primary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
] as const;

export interface TimelineLabeledAnswers {
  items: Array<{ dateLabel: string; timeLabel: string; nodeColor: NodeColor; title: string; description: string }>;
}

async function collectTimelineLabeledAnswers(countFlag?: string): Promise<TimelineLabeledAnswers> {
  const count = await promptCount({ message: 'How many timeline entries?', default: '3', min: 1, max: 10, flagValue: countFlag });
  const items: TimelineLabeledAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const dateLabel = await input({ message: `  Entry ${i} date:`, default: '06/30/2026' });
    const timeLabel = await input({ message: `  Entry ${i} time:`, default: '12:00' });
    const nodeColor = await select<NodeColor>({ message: `  Entry ${i} node color?`, choices: NODE_COLOR_CHOICES, default: '' });
    const title = await input({ message: `  Entry ${i} title:`, default: `Entry ${i}` });
    const description = await input({ message: `  Entry ${i} description:`, default: 'Description of the action.' });
    items.push({ dateLabel, timeLabel, nodeColor, title, description });
  }
  return { items };
}

export function renderTimelineLabeled(answers: TimelineLabeledAnswers): string {
  const ITEMS = renderList(
    '_timeline-item-labeled.stub.html',
    answers.items.map((i) => ({
      DATE_LABEL: i.dateLabel,
      TIME_LABEL: i.timeLabel,
      NODE_CLASS: i.nodeColor ? ` node-${i.nodeColor}` : '',
      TITLE: i.title,
      DESCRIPTION: i.description,
    }))
  );
  return renderStub('timeline-labeled.stub.html', { ITEMS });
}

/* ---------- Dispatch ---------- */

export type TimelineAnswers =
  | ({ type: 'large' } & TimelineLargeAnswers)
  | ({ type: 'numbered' } & TimelineNumberedAnswers)
  | ({ type: 'labeled' } & TimelineLabeledAnswers);

function renderTimeline(answers: TimelineAnswers): string {
  if (answers.type === 'large') return renderTimelineLarge(answers);
  if (answers.type === 'numbered') return renderTimelineNumbered(answers);
  return renderTimelineLabeled(answers);
}

async function collectTimelineAnswers(countFlag?: string): Promise<TimelineAnswers> {
  const type = await select<TimelineAnswers['type']>({
    message: 'Which timeline variant?',
    choices: [
      { name: 'With icons/letters (.timeline-large)', value: 'large' },
      { name: 'Automatically numbered (.timeline-numbered)', value: 'numbered' },
      { name: 'With dates on the left, Grid (.timeline-labeled)', value: 'labeled' },
    ],
  });

  if (type === 'large') return { type: 'large', ...(await collectTimelineLargeAnswers(countFlag)) };
  if (type === 'numbered') return { type: 'numbered', ...(await collectTimelineNumberedAnswers(countFlag)) };
  return { type: 'labeled', ...(await collectTimelineLabeledAnswers(countFlag)) };
}

/* ---------- Command registration ---------- */

export function registerMakeTimelineCommand(program: Command): void {
  program
    .command('make:timeline')
    .description('Interactive timeline generator (With icons / Numbered / With dates-Grid) (aliases: zrob:os-czasu, mache:zeitleiste)')
    .option('-n, --count <number>', 'Number of items on the timeline - skips this one question')
    .option('--answers <json>', 'Answers as JSON (TimelineAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TimelineAnswers>(opts);
      const answers = provided ?? (await collectTimelineAnswers(opts.count));
      const html = renderTimeline(answers);
      await outputResult(html, `components/timeline-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
