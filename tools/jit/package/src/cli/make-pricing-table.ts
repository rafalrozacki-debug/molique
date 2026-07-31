/**
 * molique-jit - `make:pricing-table` (Scaffolding)
 *
 * Markup verified against css/scss/components/_pricing-table.scss
 * (.pricing-table > .pricing-header + ul.pricing-features + a button, the
 * "Popular" ribbon on .is-featured is PURELY in CSS via
 * `content: 'Popularne'` on ::before - the generator does NOT add it to
 * the markup) and src/examples-pricing-tables.html.
 *
 * `.pricing-list` does NOT HAVE its own `examples-*.html` page (confirmed
 * by grep - the only mentions are an entry in the docs-classes.html class
 * table and the bundle list in builder.js) - built directly from
 * css/scss/components/_pricing-list.scss, the same exception as with
 * make:counter earlier in this session.
 *
 * Two INDEPENDENTLY working CSS sections (pricing tables vs a horizontal
 * dotted list), hence two STRUCTURALLY different variants (a "type"
 * field).
 *
 * Fix relative to the real example: the buttons there have a redundant
 * `btn ` prefix (`class="btn btn-outline-primary w-100"` /
 * `class="btn btn-primary w-100 hover-spring"`) - the same convention
 * already established in this session (`.btn-<color>` implies `.btn`),
 * the generator uses just `btn-outline-primary w-100` / `btn-primary
 * w-100 hover-spring`.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- .pricing-table (Pricing cards) ---------- */

export interface PricingTableCardsAnswers {
  plans: Array<{
    title: string;
    price: string;
    priceSuffix: string;
    featured: boolean;
    features: Array<{ text: string; disabled: boolean }>;
    buttonLabel: string;
  }>;
}

async function collectPricingTableCardsAnswers(countFlag?: string): Promise<PricingTableCardsAnswers> {
  const count = await promptCount({ message: 'How many pricing plans?', default: '3', min: 1, max: 6, flagValue: countFlag });

  const plans: PricingTableCardsAnswers['plans'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Plan ${i} name:`, default: `Plan ${i}` });
    const price = await input({ message: `  Plan ${i} price (just the number):`, default: '49' });
    const priceSuffix = await input({ message: `  Plan ${i} price unit (e.g. "$ / mo"):`, default: '$ / mo' });
    const featured = await confirm({ message: `  Highlight plan ${i} ("Popular" ribbon, .is-featured)?`, default: false });
    const featuresLine = await input({
      message: `  Plan ${i} features (comma-separated):`,
      default: '1 Project, 5 GB Storage, 24/7 Support',
    });
    const featureTexts = featuresLine.split(',').map((s) => s.trim()).filter(Boolean);
    const disabledLine = await input({
      message: `  Which features of plan ${i} are UNAVAILABLE (numbers from 1, comma-separated; empty = none)?`,
      default: '',
    });
    const disabledIndexes = new Set(
      disabledLine.split(',').map((s) => Number.parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n))
    );
    const features = featureTexts.map((text, idx) => ({ text, disabled: disabledIndexes.has(idx + 1) }));
    const buttonLabel = await input({ message: `  Plan ${i} button label:`, default: featured ? 'Choose Pro' : 'Choose' });
    plans.push({ title, price, priceSuffix, featured, features, buttonLabel });
  }

  return { plans };
}

export function renderPricingTableCards(answers: PricingTableCardsAnswers): string {
  const CARDS = renderList(
    '_pricing-table-card.stub.html',
    answers.plans.map((plan) => {
      const FEATURES = renderList(
        '_pricing-table-feature.stub.html',
        plan.features.map((f) => ({ TEXT: f.text, DISABLED_CLASS: f.disabled ? ' class="is-disabled"' : '' }))
      );
      return {
        FEATURED_CLASS: plan.featured ? ' is-featured' : '',
        TITLE_CLASS: plan.featured ? ' text-primary' : '',
        TITLE: plan.title,
        PRICE: plan.price,
        PRICE_SUFFIX: plan.priceSuffix,
        FEATURES,
        BUTTON_CLASS: plan.featured ? 'btn-primary w-100 hover-spring' : 'btn-outline-primary w-100',
        BUTTON_LABEL: plan.buttonLabel,
      };
    })
  );
  return renderStub('pricing-table.stub.html', { COL_COUNT: String(answers.plans.length), CARDS });
}

/* ---------- .pricing-list (Horizontal dotted list) ---------- */

export interface PricingListAnswers {
  items: Array<{ title: string; price: string }>;
}

async function collectPricingListAnswers(countFlag?: string): Promise<PricingListAnswers> {
  const count = await promptCount({ message: 'How many price list items?', default: '3', min: 1, max: 20, flagValue: countFlag });

  const items: PricingListAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Item ${i} name:`, default: `Item ${i}` });
    const price = await input({ message: `  Item ${i} price:`, default: '$49' });
    items.push({ title, price });
  }

  return { items };
}

export function renderPricingList(answers: PricingListAnswers): string {
  const ITEMS = renderList(
    '_pricing-list-item.stub.html',
    answers.items.map((item) => ({ TITLE: item.title, PRICE: item.price }))
  );
  return renderStub('pricing-list.stub.html', { ITEMS });
}

/* ---------- Dispatch ---------- */

export type PricingTableAnswers =
  | ({ type: 'table' } & PricingTableCardsAnswers)
  | ({ type: 'list' } & PricingListAnswers);

function renderPricingTable(answers: PricingTableAnswers): string {
  if (answers.type === 'table') return renderPricingTableCards(answers);
  return renderPricingList(answers);
}

async function collectPricingTableAnswers(countFlag?: string): Promise<PricingTableAnswers> {
  const type = await select<PricingTableAnswers['type']>({
    message: 'Which pricing variant?',
    choices: [
      { name: 'Pricing cards (.pricing-table)', value: 'table' },
      { name: 'Horizontal dotted list (.pricing-list)', value: 'list' },
    ],
  });

  if (type === 'table') return { type: 'table', ...(await collectPricingTableCardsAnswers(countFlag)) };
  return { type: 'list', ...(await collectPricingListAnswers(countFlag)) };
}

/* ---------- Command registration ---------- */

export function registerMakePricingTableCommand(program: Command): void {
  program
    .command('make:pricing-table')
    .description('Interactive pricing generator (Pricing cards / Horizontal dotted list) (aliases: zrob:cennik, mache:preisliste)')
    .option('-n, --count <number>', 'Number of plans/items - skips this one question')
    .option('--answers <json>', 'Answers as JSON (PricingTableAnswers shape, with a "type" field) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<PricingTableAnswers>(opts);
      const answers = provided ?? (await collectPricingTableAnswers(opts.count));
      const html = renderPricingTable(answers);
      await outputResult(html, `components/pricing-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
