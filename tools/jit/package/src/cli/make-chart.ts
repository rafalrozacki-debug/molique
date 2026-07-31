/**
 * molique-jit - `make:chart` (Scaffolding)
 *
 * Markup verified against css/scss/components/_charts.scss (Radial Bar -
 * .r-chart-wrapper > .chart-radial > .radial-value, --val via CSS
 * Houdini), _chart-funnel.scss (.chart-funnel/.funnel-stage - vertical,
 * width via --val decreasing gradually; .chart-pipeline/.pipeline-stage -
 * horizontal CRM, arrows via clip-path, .is-active with no inline style
 * at all because CSS itself swaps --stage-bg/--stage-text), _stock-bar.scss
 * (.stock-bar, --stock-filled 0-5, an SVG mask - zero extra markup). Real
 * usage confirmed in src/examples-charts-basic.html and
 * src/examples-funnels.html.
 *
 * `.chart-funnel-true` (trapezoidal) and the rest of _charts.scss
 * (sparkline, heatmap, area, pie, stat-card) are OUT of scope - the
 * user's request lists exactly 4 types (Radial/Funnel/Pipeline/Stock
 * Bar), not the whole Data Viz family.
 *
 * A11y: the source comment in _stock-bar.scss explicitly requires
 * `role="img"` + `aria-label` (the element is purely visual) - the
 * generator adds this always, not as an option to enable.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * each of the 4 variants gets its own `XxxAnswers` type and its own pure
 * `renderXxx()`. Along the way: Stock Bar was calling `promptCount()`
 * without passing `flagValue` (the command didn't register `-n/--count`
 * at all) - fixed here, in line with the convention used by the rest of
 * the commands.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

type ChartColor = 'primary' | 'success' | 'danger' | 'warning' | 'info';

// The same light/dark text classification against a colored background
// as the hover loop in _colors.scss ($theme-colors): primary/dark/
// secondary -> light text, success/danger/warning/info -> dark text.
const COLOR_CHOICES = [
  { name: 'Primary (default)', value: 'primary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
] as const;

/* ---------- Radial Bar ---------- */

export interface RadialAnswers {
  value: number;
  color: ChartColor;
}

export async function collectRadialAnswers(): Promise<RadialAnswers> {
  const valueStr = await input({
    message: 'Percentage value (0-100):',
    default: '75',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 0 && n <= 100) || 'Enter a whole number from 0 to 100.';
    },
  });
  const color = await select<ChartColor>({ message: 'Ring color?', choices: COLOR_CHOICES, default: 'primary' });
  return { value: Number(valueStr), color };
}

export function renderRadial(answers: RadialAnswers): string {
  const { value, color } = answers;
  const COLOR_STYLE = color === 'primary' ? '' : ` --primary: var(--${color});`;
  const VALUE_CLASS = color === 'primary' ? '' : ` text-${color}`;
  return renderStub('chart-radial.stub.html', { VALUE: String(value), COLOR_STYLE, VALUE_CLASS });
}

/* ---------- Funnel (vertical) ---------- */

// Successive stage colors (cyclic) + whether they need dark text - the
// same rule as in radial/_colors.scss.
const FUNNEL_PALETTE: Array<{ bg: string; darkText: boolean }> = [
  { bg: 'primary', darkText: false },
  { bg: 'info', darkText: true },
  { bg: 'success', darkText: true },
  { bg: 'secondary', darkText: false },
];

export interface FunnelAnswers {
  labels: string[];
}

export async function collectFunnelAnswers(): Promise<FunnelAnswers> {
  const labelsLine = await input({
    message: 'Stage labels, from widest to narrowest (comma-separated):',
    default: 'Visits, Signups, Purchases',
  });
  const labels = labelsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { labels };
}

export function renderFunnel(answers: FunnelAnswers): string {
  const { labels } = answers;
  // Width decreases evenly from 100% to 45% - the real example in
  // examples-funnels.html does exactly the same thing (100%, 75%, ...).
  const floor = 45;
  const stages = labels.map((LABEL, i) => {
    const VALUE = labels.length === 1 ? 100 : Math.round(100 - (i * (100 - floor)) / (labels.length - 1));
    const { bg, darkText } = FUNNEL_PALETTE[i % FUNNEL_PALETTE.length];
    const STYLE_EXTRA = ` --stage-bg: var(--${bg});` + (darkText ? ' --stage-text: var(--btn-text-dark);' : '');
    return { LABEL, VALUE: String(VALUE), STYLE_EXTRA };
  });

  const STAGES = renderList('_funnel-stage.stub.html', stages);
  return renderStub('chart-funnel.stub.html', { STAGES });
}

/* ---------- Pipeline (horizontal CRM) ---------- */

export interface PipelineAnswers {
  steps: string[];
  /** Label of the currently active step, '' = none active. */
  activeLabel: string;
}

export async function collectPipelineAnswers(): Promise<PipelineAnswers> {
  const stepsLine = await input({
    message: 'Process step names (comma-separated):',
    default: 'New, Contact, Quote, Negotiation, Contract',
  });
  const steps = stepsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const activeLabel = await select({
    message: 'Which step is currently active?',
    choices: [...steps.map((s) => ({ name: s, value: s })), { name: '(none)', value: '' }],
    default: steps[0] ?? '',
  });

  return { steps, activeLabel };
}

export function renderPipeline(answers: PipelineAnswers): string {
  const { steps, activeLabel } = answers;
  const stages = steps.map((LABEL) => ({ LABEL, ACTIVE_CLASS: LABEL === activeLabel ? ' is-active' : '' }));
  const STAGES = renderList('_pipeline-stage.stub.html', stages);
  return renderStub('chart-pipeline.stub.html', { STAGES });
}

/* ---------- Stock Bar ---------- */

type StockBarVariant = '' | 'stock-bar-success' | 'stock-bar-warning' | 'stock-bar-danger';

export interface StockBarAnswers {
  filled: number;
  variant: StockBarVariant;
  ariaLabel: string;
}

export async function collectStockBarAnswers(countFlag?: string): Promise<StockBarAnswers> {
  const filled = await promptCount({
    message: 'How many of the 5 segments are filled?',
    default: '3',
    min: 0,
    max: 5,
    flagValue: countFlag,
  });

  const variant = await select<StockBarVariant>({
    message: 'Color variant?',
    choices: [
      { name: 'Default (neutral)', value: '' },
      { name: 'Success (high stock)', value: 'stock-bar-success' },
      { name: 'Warning (low stock)', value: 'stock-bar-warning' },
      { name: 'Danger (critical stock)', value: 'stock-bar-danger' },
    ],
    default: '',
  });

  const ariaLabel = await input({ message: 'Text for screen readers (aria-label):', default: `Stock: ${filled}/5` });

  return { filled, variant, ariaLabel };
}

export function renderStockBar(answers: StockBarAnswers): string {
  const { filled, variant, ariaLabel } = answers;
  const VARIANT_CLASS = variant ? ` ${variant}` : '';
  return renderStub('chart-stock-bar.stub.html', { FILLED: String(filled), VARIANT_CLASS, ARIA_LABEL: ariaLabel });
}

/* ---------- Dispatch ---------- */

export type ChartAnswers =
  | ({ type: 'radial' } & RadialAnswers)
  | ({ type: 'funnel' } & FunnelAnswers)
  | ({ type: 'pipeline' } & PipelineAnswers)
  | ({ type: 'stock-bar' } & StockBarAnswers);

function renderChart(answers: ChartAnswers): string {
  if (answers.type === 'radial') return renderRadial(answers);
  if (answers.type === 'funnel') return renderFunnel(answers);
  if (answers.type === 'pipeline') return renderPipeline(answers);
  return renderStockBar(answers);
}

async function collectChartAnswers(countFlag?: string): Promise<ChartAnswers> {
  const chartType = await select<ChartAnswers['type']>({
    message: 'Which chart do you want to generate?',
    choices: [
      { name: 'Radial Bar (progress ring)', value: 'radial' },
      { name: 'Funnel (vertical funnel)', value: 'funnel' },
      { name: 'Pipeline (horizontal CRM process)', value: 'pipeline' },
      { name: 'Stock Bar (segmented stock level)', value: 'stock-bar' },
    ],
  });

  if (chartType === 'radial') return { type: 'radial', ...(await collectRadialAnswers()) };
  if (chartType === 'funnel') return { type: 'funnel', ...(await collectFunnelAnswers()) };
  if (chartType === 'pipeline') return { type: 'pipeline', ...(await collectPipelineAnswers()) };
  return { type: 'stock-bar', ...(await collectStockBarAnswers(countFlag)) };
}

/* ---------- Command registration ---------- */

export function registerMakeChartCommand(program: Command): void {
  program
    .command('make:chart')
    .description(
      'Interactive CSS/SVG chart generator (Radial Bar / Funnel / Pipeline / Stock Bar) ' +
        '(aliases: zrob:wykres, mache:diagramm)'
    )
    .option('-n, --count <number>', 'Number of filled segments in the Stock Bar (only applies to that variant) - skips this one question')
    .option('--answers <json>', 'Answers as JSON (ChartAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ChartAnswers>(opts);
      const answers = provided ?? (await collectChartAnswers(opts.count));
      const html = renderChart(answers);
      await outputResult(html, `components/${answers.type}-chart.html`, provided ? { out: opts.out } : undefined);
    });
}
