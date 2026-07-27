/**
 * molique-jit - `make:pricing-table` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_pricing-table.scss
 * (.pricing-table > .pricing-header + ul.pricing-features + przycisk,
 * wstazka "Popularne" na .is-featured jest CZYSTO w CSS przez
 * `content: 'Popularne'` na ::before - generator NIE dopisuje jej do
 * markupu) i src/examples-pricing-tables.html.
 *
 * `.pricing-list` NIE MA wlasnej strony `examples-*.html` (potwierdzone
 * grepem - jedyne wzmianki to wpis w tabeli klas docs-classes.html i
 * lista bundli w builder.js) - budowa wprost z
 * css/scss/components/_pricing-list.scss, ten sam wyjatek co przy
 * make:counter wczesniej w tej sesji.
 *
 * Dwie NIEZALEZNIE dzialajace sekcje CSS (tabele cenowe kontra pozioma
 * lista z kropkami), stad dwa STRUKTURALNIE rozne warianty (pole "type").
 *
 * Poprawka wzgledem realnego przykladu: przyciski tam maja zbedny
 * prefiks `btn ` (`class="btn btn-outline-primary w-100"` /
 * `class="btn btn-primary w-100 hover-spring"`) - ta sama, juz
 * ustalona w tej sesji konwencja (`.btn-<kolor>` implikuje `.btn`),
 * generator uzywa samego `btn-outline-primary w-100` / `btn-primary
 * w-100 hover-spring`.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- .pricing-table (Karty cenowe) ---------- */

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
  const count = await promptCount({ message: 'Ile pakietow cenowych?', default: '3', min: 1, max: 6, flagValue: countFlag });

  const plans: PricingTableCardsAnswers['plans'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Nazwa pakietu ${i}:`, default: `Pakiet ${i}` });
    const price = await input({ message: `  Cena pakietu ${i} (sama liczba):`, default: '49' });
    const priceSuffix = await input({ message: `  Jednostka ceny pakietu ${i} (np. "zl / msc"):`, default: 'zl / msc' });
    const featured = await confirm({ message: `  Wyroznic pakiet ${i} (wstazka "Popularne", .is-featured)?`, default: false });
    const featuresLine = await input({
      message: `  Cechy pakietu ${i} (oddzielone przecinkami):`,
      default: '1 Projekt, 5 GB Powierzchni, Wsparcie 24/7',
    });
    const featureTexts = featuresLine.split(',').map((s) => s.trim()).filter(Boolean);
    const disabledLine = await input({
      message: `  Ktore cechy pakietu ${i} sa NIEDOSTEPNE (numery od 1, po przecinku; puste = zadna)?`,
      default: '',
    });
    const disabledIndexes = new Set(
      disabledLine.split(',').map((s) => Number.parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n))
    );
    const features = featureTexts.map((text, idx) => ({ text, disabled: disabledIndexes.has(idx + 1) }));
    const buttonLabel = await input({ message: `  Etykieta przycisku pakietu ${i}:`, default: featured ? 'Wybierz Pro' : 'Wybierz' });
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

/* ---------- .pricing-list (Pozioma lista z kropkami) ---------- */

export interface PricingListAnswers {
  items: Array<{ title: string; price: string }>;
}

async function collectPricingListAnswers(countFlag?: string): Promise<PricingListAnswers> {
  const count = await promptCount({ message: 'Ile pozycji cennika?', default: '3', min: 1, max: 20, flagValue: countFlag });

  const items: PricingListAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Nazwa pozycji ${i}:`, default: `Pozycja ${i}` });
    const price = await input({ message: `  Cena pozycji ${i}:`, default: '49 zl' });
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
    message: 'Jaki wariant cennika?',
    choices: [
      { name: 'Karty cenowe (.pricing-table)', value: 'table' },
      { name: 'Pozioma lista z kropkami (.pricing-list)', value: 'list' },
    ],
  });

  if (type === 'table') return { type: 'table', ...(await collectPricingTableCardsAnswers(countFlag)) };
  return { type: 'list', ...(await collectPricingListAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakePricingTableCommand(program: Command): void {
  program
    .command('make:pricing-table')
    .description('Interaktywny generator cennika (Karty cenowe / Pozioma lista z kropkami) (aliasy: zrob:cennik, mache:preisliste)')
    .option('-n, --count <liczba>', 'Liczba pakietow/pozycji - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt PricingTableAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<PricingTableAnswers>(opts);
      const answers = provided ?? (await collectPricingTableAnswers(opts.count));
      const html = renderPricingTable(answers);
      await outputResult(html, `components/pricing-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
