/**
 * molique-jit - `make:timeline` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_timeline.scss (trzy
 * warianty: `.timeline-large` z `.timeline-badge` na ikone/litere,
 * `.timeline-numbered` - CSS SAM dolicza numer przez `counter()`, zero
 * dodatkowego markupu do numeracji, i `.timeline-labeled` - CSS Grid,
 * data po lewej, `.timeline-line` u OSTATNIEGO elementu chowa sama CSS
 * przez `:last-child`, generator nie robi wyjatku) oraz realnego uzycia w
 * src/examples-timeline.html.
 *
 * Trzy STRUKTURALNIE rozne ksztalty pozycji (inne pola, inny tag <li> vs
 * <div>), wiec dyskryminujaca unia typu z osobnym stubem per wariant - ta
 * sama zasada co make:modal/make:chart.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- Z ikonami (.timeline-large) ---------- */

export interface TimelineLargeAnswers {
  items: Array<{ badge: string; title: string; description: string }>;
}

async function collectTimelineLargeAnswers(countFlag?: string): Promise<TimelineLargeAnswers> {
  const count = await promptCount({ message: 'Ile pozycji na osi?', default: '2', min: 1, max: 8, flagValue: countFlag });
  const items: TimelineLargeAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const badge = await input({ message: `  Litera/ikona pozycji ${i} (tresc .timeline-badge):`, default: String.fromCharCode(64 + i) });
    const title = await input({ message: `  Tytul pozycji ${i}:`, default: `Etap ${i}` });
    const description = await input({ message: `  Opis pozycji ${i}:`, default: 'Opis etapu.' });
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

/* ---------- Numerowana (.timeline-numbered) ---------- */

export interface TimelineNumberedAnswers {
  items: Array<{ title: string; description: string }>;
}

async function collectTimelineNumberedAnswers(countFlag?: string): Promise<TimelineNumberedAnswers> {
  const count = await promptCount({ message: 'Ile krokow?', default: '3', min: 1, max: 8, flagValue: countFlag });
  const items: TimelineNumberedAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Tytul kroku ${i}:`, default: `Krok ${i}` });
    const description = await input({ message: `  Opis kroku ${i}:`, default: 'Opis kroku.' });
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

/* ---------- Z datami (.timeline-labeled) ---------- */

type NodeColor = '' | 'primary' | 'success' | 'danger';

const NODE_COLOR_CHOICES = [
  { name: 'Domyslny (neutralny)', value: '' },
  { name: 'Primary', value: 'primary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
] as const;

export interface TimelineLabeledAnswers {
  items: Array<{ dateLabel: string; timeLabel: string; nodeColor: NodeColor; title: string; description: string }>;
}

async function collectTimelineLabeledAnswers(countFlag?: string): Promise<TimelineLabeledAnswers> {
  const count = await promptCount({ message: 'Ile wpisow na osi?', default: '3', min: 1, max: 10, flagValue: countFlag });
  const items: TimelineLabeledAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const dateLabel = await input({ message: `  Data wpisu ${i}:`, default: '30.06.2026' });
    const timeLabel = await input({ message: `  Godzina wpisu ${i}:`, default: '12:00' });
    const nodeColor = await select<NodeColor>({ message: `  Kolor kropki wpisu ${i}?`, choices: NODE_COLOR_CHOICES, default: '' });
    const title = await input({ message: `  Tytul wpisu ${i}:`, default: `Wpis ${i}` });
    const description = await input({ message: `  Opis wpisu ${i}:`, default: 'Opis operacji.' });
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
    message: 'Jaki wariant osi czasu?',
    choices: [
      { name: 'Z ikonami/literami (.timeline-large)', value: 'large' },
      { name: 'Numerowana automatycznie (.timeline-numbered)', value: 'numbered' },
      { name: 'Z datami po lewej, Grid (.timeline-labeled)', value: 'labeled' },
    ],
  });

  if (type === 'large') return { type: 'large', ...(await collectTimelineLargeAnswers(countFlag)) };
  if (type === 'numbered') return { type: 'numbered', ...(await collectTimelineNumberedAnswers(countFlag)) };
  return { type: 'labeled', ...(await collectTimelineLabeledAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeTimelineCommand(program: Command): void {
  program
    .command('make:timeline')
    .description('Interaktywny generator osi czasu (Z ikonami / Numerowana / Z datami-Grid) (aliasy: zrob:os-czasu, mache:zeitleiste)')
    .option('-n, --count <liczba>', 'Liczba pozycji na osi - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt TimelineAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TimelineAnswers>(opts);
      const answers = provided ?? (await collectTimelineAnswers(opts.count));
      const html = renderTimeline(answers);
      await outputResult(html, `components/timeline-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
