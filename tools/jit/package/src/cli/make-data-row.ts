/**
 * molique-jit - `make:data-row` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_data-rows.scss
 * (.data-row - CSS Grid, 5 kolumn: 2fr 1fr 1fr 1fr auto, wlasny
 * margin-bottom - NIE potrzebuje zadnego wrappera, wiersze staja jeden
 * pod drugim jako zwykle elementy blokowe) i
 * css/scss/components/_data-row-compact.scss (.data-row-compact - Flexbox,
 * separacja przez border-bottom + :last-child { border-bottom: none } -
 * WYMAGA wspolnego rodzica, zeby :last-child dzialal) oraz
 * src/examples-data-rows.html.
 *
 * Dwie NIEZALEZNE sekcje w realnym przykladzie ('.data-row' i
 * '.data-row-compact'), stad dwa STRUKTURALNIE rozne warianty (pole
 * "type", splaszczone jak w make:card/make:timeline/make:carousel).
 *
 * DWIE POPRAWKI wzgledem realnego przykladu (ta sama dyscyplina co przy
 * make:carousel - naprawiamy potwierdzone niezalezne bledy, nie
 * powielamy ich):
 * 1. Ikony w sekcji "Kompaktowe Wiersze" uzywaja `class="icon-file-text"`/
 *    `class="icon-x"` - stary system fontow ikon, ktory NIE ISTNIEJE
 *    nigdzie w SCSS frameworka (brak jakiegokolwiek @font-face lub reguly
 *    ".icon-*" dla tych klas - potwierdzone grepem). To scisle rownolegle
 *    do "btn btn-primary" - zapomniana migracja na aktualny system
 *    (<svg class="icon"><use href="img/icons-sprite.svg#ph-..."></use></svg>),
 *    ktory generator konsekwentnie stosuje wszedzie indziej (karty,
 *    lightbox, karuzela, timeline). Generator uzywa TEGO systemu.
 * 2. Przycisk akcji w tej samej sekcji ma tekst pomocniczy w
 *    `class="text-muted text-4 m-r-2"` - "m-r-2" NIE ISTNIEJE w
 *    _spacing.scss (poprawna klasa to "mr-2", bez dodatkowego myslnika -
 *    potwierdzone grepem po utilities/_spacing.scss). Generator uzywa
 *    "mr-2".
 * Dodatkowo: `class="btn btn-action ..."` w tej samej sekcji ma zbedny
 * prefiks "btn " - .btn-action ma WLASNA, kompletna definicje w
 * _buttons.scss (appearance/background/border/padding wlasne), nigdy nie
 * potrzebowala bazowego .btn (w odroznieniu od .btn-outline-soft, ktora
 * BYLA czystym modyfikatorem) - pierwsza sekcja tego samego pliku
 * (".data-row") juz pokazuje poprawny zapis "btn-action" bez prefiksu,
 * generator jest z nim spojny.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

/* ---------- .data-row (Grid, CRM) ---------- */

type StatusState = 'draft' | 'pending' | 'done' | 'danger';

const STATUS_CHOICES = [
  { name: 'Szkic (draft)', value: 'draft' },
  { name: 'Oczekuje (pending)', value: 'pending' },
  { name: 'Zrobione (done)', value: 'done' },
  { name: 'Blad (danger)', value: 'danger' },
] as const;

export interface DataRowGridAnswers {
  rows: Array<{
    title: string;
    subtitle: string;
    value: string;
    statusText: string;
    statusState: StatusState;
    /** Etykiety przyciskow akcji - gdy > 1, OSTATNIA dostaje automatycznie text-danger (wzorzec Edytuj/Usun z realnego przykladu). */
    actionLabels: string[];
  }>;
}

async function collectDataRowGridAnswers(countFlag?: string): Promise<DataRowGridAnswers> {
  const count = await promptCount({ message: 'Ile wierszy?', default: '2', min: 1, max: 20, flagValue: countFlag });

  const rows: DataRowGridAnswers['rows'] = [];
  for (let i = 1; i <= count; i++) {
    const title = await input({ message: `  Tytul wiersza ${i}:`, default: `Pozycja ${i}` });
    const subtitle = await input({ message: `  Podtytul/parametry wiersza ${i}:`, default: 'Podtytul' });
    const value = await input({ message: `  Wartosc wiersza ${i} (np. cena):`, default: '0 zl' });
    const statusText = await input({ message: `  Tekst statusu wiersza ${i}:`, default: 'Szkic' });
    const statusState = await select<StatusState>({ message: `  Stan statusu wiersza ${i}?`, choices: STATUS_CHOICES, default: 'draft' });
    const actionsLine = await input({
      message: `  Etykiety akcji wiersza ${i} (oddzielone przecinkami, ostatnia = czerwona):`,
      default: 'Edytuj, Usun',
    });
    const actionLabels = actionsLine.split(',').map((s) => s.trim()).filter(Boolean);
    rows.push({ title, subtitle, value, statusText, statusState, actionLabels });
  }

  return { rows };
}

export function renderDataRowGrid(answers: DataRowGridAnswers): string {
  const items = answers.rows.map((row) => {
    const ACTIONS = renderList(
      '_data-row-action.stub.html',
      row.actionLabels.map((label, i) => ({
        LABEL: label,
        DANGER_CLASS: row.actionLabels.length > 1 && i === row.actionLabels.length - 1 ? ' text-danger' : '',
      }))
    );
    return {
      TITLE: row.title,
      SUBTITLE: row.subtitle,
      VALUE: row.value,
      STATUS_STATE: row.statusState,
      STATUS_TEXT: row.statusText,
      ACTIONS,
    };
  });
  return renderList('_data-row-item.stub.html', items);
}

/* ---------- .data-row-compact (Flex, List Item) ---------- */

type RowIconColor = '' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';

const ICON_COLOR_CHOICES = [
  { name: 'Domyslny (var(--bg-body), bez koloru)', value: '' },
  { name: 'Primary', value: 'primary' },
  { name: 'Secondary', value: 'secondary' },
  { name: 'Success', value: 'success' },
  { name: 'Danger', value: 'danger' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
  { name: 'Dark', value: 'dark' },
] as const;

export interface DataRowCompactAnswers {
  items: Array<{
    icon: string;
    iconColor: RowIconColor;
    iconSquare: boolean;
    title: string;
    details: string;
    /** Tekst pomocniczy przed przyciskiem akcji (np. "Can view"), '' = brak. */
    leadingText: string;
    actionIcon: string;
    actionAriaLabel: string;
  }>;
}

async function collectDataRowCompactAnswers(countFlag?: string): Promise<DataRowCompactAnswers> {
  const count = await promptCount({ message: 'Ile kompaktowych wierszy?', default: '2', min: 1, max: 20, flagValue: countFlag });

  const items: DataRowCompactAnswers['items'] = [];
  for (let i = 1; i <= count; i++) {
    const icon = await input({ message: `  Nazwa ikony wiersza ${i} (z img/icons-sprite.svg):`, default: 'ph-file-text' });
    const iconColor = await select<RowIconColor>({ message: `  Kolor tla ikony wiersza ${i}?`, choices: ICON_COLOR_CHOICES, default: '' });
    const iconSquare = await confirm({ message: `  Kwadratowa ikona wiersza ${i} (zamiast okragleej)?`, default: false });
    const title = await input({ message: `  Tytul wiersza ${i}:`, default: `Pozycja ${i}` });
    const details = await input({ message: `  Szczegoly wiersza ${i}:`, default: '' });
    const leadingText = await input({ message: `  Tekst przed przyciskiem akcji wiersza ${i} (puste = brak):`, default: '' });
    const actionIcon = await input({ message: `  Nazwa ikony przycisku akcji wiersza ${i}:`, default: 'ph-trash' });
    const actionAriaLabel = await input({ message: `  aria-label przycisku akcji wiersza ${i}:`, default: 'Usun' });
    items.push({ icon, iconColor, iconSquare, title, details, leadingText, actionIcon, actionAriaLabel });
  }

  return { items };
}

export function renderDataRowCompact(answers: DataRowCompactAnswers): string {
  const ITEMS = renderList(
    '_data-row-compact-item.stub.html',
    answers.items.map((item) => ({
      ICON: item.icon,
      ICON_SQUARE_CLASS: item.iconSquare ? ' icon-square' : '',
      ICON_COLOR_CLASS: item.iconColor ? ` bg-${item.iconColor} text-white` : '',
      TITLE: item.title,
      DETAILS: item.details,
      LEADING_TEXT_HTML: item.leadingText ? `\n    <span class="text-muted text-4 mr-2">${item.leadingText}</span>` : '',
      ACTION_ICON: item.actionIcon,
      ACTION_ARIA_LABEL: item.actionAriaLabel,
    }))
  );
  return renderStub('data-row-compact.stub.html', { ITEMS });
}

/* ---------- Dispatch ---------- */

export type DataRowAnswers =
  | ({ type: 'row' } & DataRowGridAnswers)
  | ({ type: 'compact' } & DataRowCompactAnswers);

function renderDataRow(answers: DataRowAnswers): string {
  if (answers.type === 'row') return renderDataRowGrid(answers);
  return renderDataRowCompact(answers);
}

async function collectDataRowAnswers(countFlag?: string): Promise<DataRowAnswers> {
  const type = await select<DataRowAnswers['type']>({
    message: 'Jaki wariant wiersza danych?',
    choices: [
      { name: 'Wiersz Grid, CRM (.data-row)', value: 'row' },
      { name: 'Kompaktowy, lista/panel boczny (.data-row-compact)', value: 'compact' },
    ],
  });

  if (type === 'row') return { type: 'row', ...(await collectDataRowGridAnswers(countFlag)) };
  return { type: 'compact', ...(await collectDataRowCompactAnswers(countFlag)) };
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeDataRowCommand(program: Command): void {
  program
    .command('make:data-row')
    .description('Interaktywny generator wierszy danych (Grid CRM / Kompaktowy) (aliasy: zrob:wiersz-danych, mache:datenzeile)')
    .option('-n, --count <liczba>', 'Liczba wierszy - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt DataRowAnswers, z polem "type") - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<DataRowAnswers>(opts);
      const answers = provided ?? (await collectDataRowAnswers(opts.count));
      const html = renderDataRow(answers);
      await outputResult(html, `components/data-row-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
