/**
 * molique-jit - `make:form` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_form-groups.scss
 * (.form-floating - wymaga placeholder=" "; .input-group-inline),
 * _form-select-search.scss (.select-search - Popover API, top layer),
 * _form-select-custom.scss (.custom-select - Premium Multi Select, kategorie),
 * _form-file-upload.scss (.file-upload / .file-upload-animated) oraz realnego
 * uzycia w src/examples-forms-basics.html, src/examples-input-groups.html
 * (.input-group-inline), src/examples-select.html (.select-search,
 * .custom-select) i src/examples-file-upload.html.
 *
 * WAZNE: js/modules/molique-select.js obsluguje TYLKO .select-search - nie ma
 * zadnego modulu JS dla .custom-select (pills/checkboxy sa tam czysto
 * statyczne w dokumentacji, podswietlenie karty na :checked to czysty CSS
 * `:has()`). Dlatego wygenerowany .custom-select startuje PUSTY (bez
 * podbitych "przykladowych" pozycji jak w docs) - haerdkodowanie fikcyjnego
 * zaznaczenia byloby mylace w prawdziwym formularzu.
 *
 * Style podstawowych pol (Floating / Klasyczny) roznia sie STRUKTURALNIE
 * (inny tag-wrapper, .form-floating vs .input-group-inline), wiec to dwa
 * osobne zestawy stubow - zgodnie z zasada z make:layout. Typ pola
 * (text/email/number/tel vs textarea) rozni sie tagiem (<input> vs
 * <textarea>), wiec rowniez osobne pliki, nie {{ TAG }} w jednym.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';

type FieldStyle = 'floating' | 'classic';

const TYPE_CHOICES = [
  { name: 'Tekst', value: 'text' },
  { name: 'Email', value: 'email' },
  { name: 'Numer', value: 'number' },
  { name: 'Telefon', value: 'tel' },
  { name: 'Wieloliniowe (textarea)', value: 'textarea' },
] as const;

/* ---------- Podstawowe pola ---------- */

async function makeFields(style: FieldStyle, countFlag?: string): Promise<string> {
  const count = await promptCount({
    message: 'Ile podstawowych pol ma miec formularz?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const fields: string[] = [];
  for (let i = 1; i <= count; i++) {
    const LABEL = await input({ message: `  Etykieta pola ${i}:`, default: `Pole ${i}` });
    const type = await select({ message: `  Typ pola ${i}?`, choices: TYPE_CHOICES, default: 'text' });
    const required = await confirm({ message: `  Pole ${i} wymagane?`, default: false });

    const ID = `form-field-${i}`;
    const REQUIRED_ATTR = required ? ' required' : '';
    // Jedyny udokumentowany wzorzec komunikatu bledu (examples-forms-basics.html,
    // sekcja "Natywna Walidacja") wystepuje tylko przy .form-floating - dlatego
    // .input-group-inline nigdy nie dostaje .feedback-invalid.
    const FEEDBACK = required && style === 'floating' ? '\n    <div class="feedback-invalid">To pole jest wymagane.</div>' : '';

    const stubName =
      style === 'floating'
        ? type === 'textarea'
          ? '_form-field-floating-textarea.stub.html'
          : '_form-field-floating-input.stub.html'
        : type === 'textarea'
          ? '_form-field-classic-textarea.stub.html'
          : '_form-field-classic-input.stub.html';

    fields.push(renderStub(stubName, { ID, TYPE: type, LABEL, REQUIRED_ATTR, FEEDBACK }).trimEnd());
  }

  return fields.join('\n');
}

/* ---------- Modul: Searchable Select ---------- */

async function promptSelectSearchModule(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac Searchable Select (Combobox)?', default: false });
  if (!wanted) return '';

  const LABEL = await input({ message: '  Etykieta nad selectem:', default: 'Wybierz opcje' });
  const PLACEHOLDER = await input({ message: '  Tekst na przycisku, zanim cos wybrano:', default: 'Wybierz z listy...' });
  const FIELD_NAME = await input({ message: '  Nazwa pola (name ukrytego inputu dla backendu):', default: 'wybor' });
  const optionsLine = await input({ message: '  Opcje do wyboru (oddzielone przecinkami):', default: 'Opcja 1, Opcja 2, Opcja 3' });

  const options = optionsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((LABEL_OPT, i) => ({ VALUE: String(i + 1), LABEL: LABEL_OPT }));

  const OPTIONS = renderList('_select-search-option.stub.html', options);
  return renderStub('form-module-select-search.stub.html', { LABEL, PLACEHOLDER, FIELD_NAME, OPTIONS });
}

/* ---------- Modul: Premium Multi Select ---------- */

// Cykl kolorow kart opcji - ta sama zasada co FUNNEL_PALETTE w make-chart.ts:
// examples-select.html pokazuje tylko 3 przyklady (danger/info/warning), tu
// rozszerzone o success dla wiekszej liczby opcji, bez lamania konwencji.
const CUSTOM_SELECT_COLORS = ['danger', 'info', 'success', 'warning'];

async function promptCustomSelectModule(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac Premium Multi Select (kategorie + checkboxy)?', default: false });
  if (!wanted) return '';

  const LABEL = await input({ message: '  Etykieta nad selectem:', default: 'Filtruj wyniki' });
  const PLACEHOLDER = await input({ message: '  Tekst na przycisku, zanim cos wybrano:', default: 'Wybierz...' });
  const categoriesLine = await input({ message: '  Nazwy kategorii (oddzielone przecinkami):', default: 'Popularne, Inne' });
  const categoryNames = categoriesLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let colorIndex = 0;
  const categoryBlocks: string[] = [];
  for (const categoryName of categoryNames) {
    const itemsLine = await input({ message: `  Opcje w kategorii "${categoryName}" (oddzielone przecinkami):`, default: 'Opcja 1, Opcja 2' });
    const items = itemsLine
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((TITLE) => {
        const COLOR = CUSTOM_SELECT_COLORS[colorIndex % CUSTOM_SELECT_COLORS.length];
        colorIndex++;
        return { TITLE, COLOR, LETTER: TITLE.charAt(0).toUpperCase() };
      });

    const header = renderStub('_custom-select-category.stub.html', { LABEL: categoryName }).trimEnd();
    const options = renderList('_custom-select-option.stub.html', items);
    categoryBlocks.push([header, options].join('\n'));
  }

  const CATEGORIES = categoryBlocks.join('\n');
  return renderStub('form-module-custom-select.stub.html', { LABEL, PLACEHOLDER, CATEGORIES });
}

/* ---------- Modul: Drag & Drop File Upload ---------- */

async function promptFileUploadModule(): Promise<string> {
  const wanted = await confirm({ message: 'Dodac strefe Drag & Drop File Upload?', default: false });
  if (!wanted) return '';

  const animated = await confirm({ message: '  Wariant animowany (biegnaca linia na hover)?', default: false });
  const TITLE = await input({ message: '  Naglowek strefy:', default: 'Upusc plik tutaj' });
  const SUBTITLE = await input({ message: '  Podpis pod naglowkiem:', default: 'lub kliknij, aby wybrac' });
  const FIELD_NAME = await input({ message: '  Nazwa pola (name inputu pliku):', default: 'plik' });

  return renderStub('form-module-file-upload.stub.html', {
    VARIANT_CLASS: animated ? ' file-upload-animated' : '',
    ICON: animated ? 'ph-cloud' : 'ph-file-text',
    TITLE,
    SUBTITLE,
    FIELD_NAME,
  });
}

/* ---------- Rejestracja komendy ---------- */

export function registerMakeFormCommand(program: Command): void {
  program
    .command('make:form')
    .description(
      'Interaktywny generator formularzy (Floating Labels / Klasyczny + opcjonalny Searchable Select, ' +
        'Premium Multi Select, Drag & Drop File Upload) (aliasy: zrob:formularz, mache:formular)'
    )
    .option('-n, --count <liczba>', 'Liczba podstawowych pol formularza - pomija to jedno pytanie')
    .action(async (opts: { count?: string }) => {
      const style = await select<FieldStyle>({
        message: 'Styl podstawowych pol?',
        choices: [
          { name: 'Floating Labels (etykieta plywa do gory)', value: 'floating' },
          { name: 'Klasyczny (etykieta obok pola)', value: 'classic' },
        ],
      });

      const FIELDS = await makeFields(style, opts.count);
      const selectSearch = await promptSelectSearchModule();
      const customSelect = await promptCustomSelectModule();
      const fileUpload = await promptFileUploadModule();
      const SUBMIT_LABEL = await input({ message: 'Etykieta przycisku wysylki:', default: 'Wyslij' });

      const BODY = [FIELDS, selectSearch, customSelect, fileUpload].filter(Boolean).join('\n\n');
      const html = renderStub('form.stub.html', { BODY, SUBMIT_LABEL });

      await outputResult(html, 'components/form.html');
    });
}
