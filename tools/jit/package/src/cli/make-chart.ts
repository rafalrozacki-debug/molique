/**
 * molique-jit - `make:chart` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_charts.scss (Radial
 * Bar - .r-chart-wrapper > .chart-radial > .radial-value, --val przez CSS
 * Houdini), _chart-funnel.scss (.chart-funnel/.funnel-stage - pionowy,
 * szerokosc przez --val malejaca stopniowo; .chart-pipeline/.pipeline-stage
 * - poziomy CRM, strzalki przez clip-path, .is-active bez zadnego stylu
 * inline bo CSS sam podmienia --stage-bg/--stage-text), _stock-bar.scss
 * (.stock-bar, --stock-filled 0-5, maska SVG - zero dodatkowego markupu).
 * Realne uzycie potwierdzone w src/examples-charts-basic.html i
 * src/examples-funnels.html.
 *
 * `.chart-funnel-true` (trapezowy) i cala reszta _charts.scss (sparkline,
 * heatmap, area, pie, stat-card) sa POZA zakresem - propozycja
 * uzytkownika wymienia dokladnie 4 typy (Radial/Funnel/Pipeline/Stock
 * Bar), nie cala rodzine Data Viz.
 *
 * A11y: _stock-bar.scss w komentarzu zrodlowym wprost wymaga
 * `role="img"` + `aria-label` (element jest czysto wizualny) - generator
 * dodaje to zawsze, nie jako opcje do wlaczenia.
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B): kazdy z 4 wariantow dostaje wlasny typ `XxxAnswers` i wlasna
 * czysta `renderXxx()`. Przy okazji: Stock Bar wolal `promptCount()` bez
 * przekazania `flagValue` (komenda w ogole nie rejestrowala `-n/--count`) -
 * naprawione tutaj, zgodnie z konwencja reszty komend.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

type ChartColor = 'primary' | 'success' | 'danger' | 'warning' | 'info';

// Ta sama klasyfikacja jasny/ciemny tekst na tle koloru co petla hover w
// _colors.scss ($theme-colors): primary/dark/secondary -> jasny tekst,
// success/danger/warning/info -> ciemny tekst.
const COLOR_CHOICES = [
  { name: 'Primary (domyslny)', value: 'primary' },
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
    message: 'Wartosc procentowa (0-100):',
    default: '75',
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 0 && n <= 100) || 'Podaj liczbe calkowita od 0 do 100.';
    },
  });
  const color = await select<ChartColor>({ message: 'Kolor pierscienia?', choices: COLOR_CHOICES, default: 'primary' });
  return { value: Number(valueStr), color };
}

export function renderRadial(answers: RadialAnswers): string {
  const { value, color } = answers;
  const COLOR_STYLE = color === 'primary' ? '' : ` --primary: var(--${color});`;
  const VALUE_CLASS = color === 'primary' ? '' : ` text-${color}`;
  return renderStub('chart-radial.stub.html', { VALUE: String(value), COLOR_STYLE, VALUE_CLASS });
}

/* ---------- Funnel (pionowy) ---------- */

// Kolejne kolory etapow (cyklicznie) + czy potrzebuja ciemnego tekstu -
// ta sama zasada co w radial/_colors.scss.
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
    message: 'Etykiety etapow, od najszerszego do najwezszego (oddzielone przecinkami):',
    default: 'Odwiedziny, Rejestracje, Zakupy',
  });
  const labels = labelsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { labels };
}

export function renderFunnel(answers: FunnelAnswers): string {
  const { labels } = answers;
  // Szerokosc maleje rownomiernie od 100% do 45% - realny przyklad w
  // examples-funnels.html robi dokladnie to samo (100%, 75%, ...).
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

/* ---------- Pipeline (poziomy CRM) ---------- */

export interface PipelineAnswers {
  steps: string[];
  /** Etykieta aktualnie aktywnego kroku, '' = brak aktywnego. */
  activeLabel: string;
}

export async function collectPipelineAnswers(): Promise<PipelineAnswers> {
  const stepsLine = await input({
    message: 'Nazwy krokow procesu (oddzielone przecinkami):',
    default: 'Nowy, Kontakt, Wycena, Negocjacje, Umowa',
  });
  const steps = stepsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const activeLabel = await select({
    message: 'Ktory krok jest aktualnie aktywny?',
    choices: [...steps.map((s) => ({ name: s, value: s })), { name: '(brak)', value: '' }],
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
    message: 'Ile z 5 segmentow wypelnionych?',
    default: '3',
    min: 0,
    max: 5,
    flagValue: countFlag,
  });

  const variant = await select<StockBarVariant>({
    message: 'Wariant koloru?',
    choices: [
      { name: 'Domyslny (neutralny)', value: '' },
      { name: 'Success (wysoki stan)', value: 'stock-bar-success' },
      { name: 'Warning (niski stan)', value: 'stock-bar-warning' },
      { name: 'Danger (krytyczny stan)', value: 'stock-bar-danger' },
    ],
    default: '',
  });

  const ariaLabel = await input({ message: 'Tekst dla czytnikow ekranu (aria-label):', default: `Stan: ${filled}/5` });

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
    message: 'Jaki wykres chcesz wygenerowac?',
    choices: [
      { name: 'Radial Bar (kolko z progresem)', value: 'radial' },
      { name: 'Funnel (pionowy lejek)', value: 'funnel' },
      { name: 'Pipeline (poziomy proces CRM)', value: 'pipeline' },
      { name: 'Stock Bar (segmentowy poziom zapasu)', value: 'stock-bar' },
    ],
  });

  if (chartType === 'radial') return { type: 'radial', ...(await collectRadialAnswers()) };
  if (chartType === 'funnel') return { type: 'funnel', ...(await collectFunnelAnswers()) };
  if (chartType === 'pipeline') return { type: 'pipeline', ...(await collectPipelineAnswers()) };
  return { type: 'stock-bar', ...(await collectStockBarAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeChartCommand(program: Command): void {
  program
    .command('make:chart')
    .description(
      'Interaktywny generator wykresow CSS/SVG (Radial Bar / Funnel / Pipeline / Stock Bar) ' +
        '(aliasy: zrob:wykres, mache:diagramm)'
    )
    .option('-n, --count <liczba>', 'Liczba wypelnionych segmentow w Stock Bar (dotyczy tylko tego wariantu) - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt ChartAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<ChartAnswers>(opts);
      const answers = provided ?? (await collectChartAnswers(opts.count));
      const html = renderChart(answers);
      await outputResult(html, `components/${answers.type}-chart.html`, provided ? { out: opts.out } : undefined);
    });
}
