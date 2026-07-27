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
 *
 * Rozdzial "zbierz odpowiedzi" / "wyrenderuj markup" (plan rozwoju CLI,
 * Etap B): w odroznieniu od modal/chart/widget/layout, `make:form` NIE ma
 * dyskryminujacej unii wariantow - to JEDEN plaski `FormAnswers` z trzema
 * OPCJONALNYMI modulami (pole `undefined` = modul pominiety), bo tak
 * naprawde dziala: styl + pola + do trzech niezaleznie wlaczalnych bloków.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

type FieldStyle = 'floating' | 'classic';
type FieldType = 'text' | 'email' | 'number' | 'tel' | 'textarea';

const TYPE_CHOICES = [
  { name: 'Tekst', value: 'text' },
  { name: 'Email', value: 'email' },
  { name: 'Numer', value: 'number' },
  { name: 'Telefon', value: 'tel' },
  { name: 'Wieloliniowe (textarea)', value: 'textarea' },
] as const;

export interface FormFieldAnswer {
  label: string;
  type: FieldType;
  required: boolean;
}

export interface SelectSearchModuleAnswers {
  label: string;
  placeholder: string;
  fieldName: string;
  options: string[];
}

export interface CustomSelectModuleAnswers {
  label: string;
  placeholder: string;
  categories: Array<{ name: string; items: string[] }>;
}

export interface FileUploadModuleAnswers {
  animated: boolean;
  title: string;
  subtitle: string;
  fieldName: string;
}

export interface FormAnswers {
  style: FieldStyle;
  fields: FormFieldAnswer[];
  /** undefined = modul pominiety. */
  selectSearch?: SelectSearchModuleAnswers;
  customSelect?: CustomSelectModuleAnswers;
  fileUpload?: FileUploadModuleAnswers;
  submitLabel: string;
}

/* ---------- Podstawowe pola ---------- */

async function collectFields(style: FieldStyle, countFlag?: string): Promise<FormFieldAnswer[]> {
  const count = await promptCount({
    message: 'Ile podstawowych pol ma miec formularz?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const fields: FormFieldAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Etykieta pola ${i}:`, default: `Pole ${i}` });
    const type = await select<FieldType>({ message: `  Typ pola ${i}?`, choices: TYPE_CHOICES, default: 'text' });
    const required = await confirm({ message: `  Pole ${i} wymagane?`, default: false });
    fields.push({ label, type, required });
  }

  return fields;
}

function renderFields(style: FieldStyle, fields: FormFieldAnswer[]): string {
  return fields
    .map((field, idx) => {
      const i = idx + 1;
      const ID = `form-field-${i}`;
      const REQUIRED_ATTR = field.required ? ' required' : '';
      // Jedyny udokumentowany wzorzec komunikatu bledu (examples-forms-basics.html,
      // sekcja "Natywna Walidacja") wystepuje tylko przy .form-floating - dlatego
      // .input-group-inline nigdy nie dostaje .feedback-invalid.
      const FEEDBACK =
        field.required && style === 'floating' ? '\n    <div class="feedback-invalid">To pole jest wymagane.</div>' : '';

      const stubName =
        style === 'floating'
          ? field.type === 'textarea'
            ? '_form-field-floating-textarea.stub.html'
            : '_form-field-floating-input.stub.html'
          : field.type === 'textarea'
            ? '_form-field-classic-textarea.stub.html'
            : '_form-field-classic-input.stub.html';

      return renderStub(stubName, { ID, TYPE: field.type, LABEL: field.label, REQUIRED_ATTR, FEEDBACK }).trimEnd();
    })
    .join('\n');
}

/* ---------- Modul: Searchable Select ---------- */

async function collectSelectSearchModule(): Promise<SelectSearchModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Dodac Searchable Select (Combobox)?', default: false });
  if (!wanted) return undefined;

  const label = await input({ message: '  Etykieta nad selectem:', default: 'Wybierz opcje' });
  const placeholder = await input({ message: '  Tekst na przycisku, zanim cos wybrano:', default: 'Wybierz z listy...' });
  const fieldName = await input({ message: '  Nazwa pola (name ukrytego inputu dla backendu):', default: 'wybor' });
  const optionsLine = await input({ message: '  Opcje do wyboru (oddzielone przecinkami):', default: 'Opcja 1, Opcja 2, Opcja 3' });
  const options = optionsLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return { label, placeholder, fieldName, options };
}

function renderSelectSearchModule(mod: SelectSearchModuleAnswers): string {
  const options = mod.options.map((LABEL, i) => ({ VALUE: String(i + 1), LABEL }));
  const OPTIONS = renderList('_select-search-option.stub.html', options);
  return renderStub('form-module-select-search.stub.html', {
    LABEL: mod.label,
    PLACEHOLDER: mod.placeholder,
    FIELD_NAME: mod.fieldName,
    OPTIONS,
  });
}

/* ---------- Modul: Premium Multi Select ---------- */

// Cykl kolorow kart opcji - ta sama zasada co FUNNEL_PALETTE w make-chart.ts:
// examples-select.html pokazuje tylko 3 przyklady (danger/info/warning), tu
// rozszerzone o success dla wiekszej liczby opcji, bez lamania konwencji.
const CUSTOM_SELECT_COLORS = ['danger', 'info', 'success', 'warning'];

async function collectCustomSelectModule(): Promise<CustomSelectModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Dodac Premium Multi Select (kategorie + checkboxy)?', default: false });
  if (!wanted) return undefined;

  const label = await input({ message: '  Etykieta nad selectem:', default: 'Filtruj wyniki' });
  const placeholder = await input({ message: '  Tekst na przycisku, zanim cos wybrano:', default: 'Wybierz...' });
  const categoriesLine = await input({ message: '  Nazwy kategorii (oddzielone przecinkami):', default: 'Popularne, Inne' });
  const categoryNames = categoriesLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const categories: CustomSelectModuleAnswers['categories'] = [];
  for (const name of categoryNames) {
    const itemsLine = await input({ message: `  Opcje w kategorii "${name}" (oddzielone przecinkami):`, default: 'Opcja 1, Opcja 2' });
    const items = itemsLine
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    categories.push({ name, items });
  }

  return { label, placeholder, categories };
}

function renderCustomSelectModule(mod: CustomSelectModuleAnswers): string {
  let colorIndex = 0;
  const categoryBlocks = mod.categories.map((cat) => {
    const items = cat.items.map((TITLE) => {
      const COLOR = CUSTOM_SELECT_COLORS[colorIndex % CUSTOM_SELECT_COLORS.length];
      colorIndex++;
      return { TITLE, COLOR, LETTER: TITLE.charAt(0).toUpperCase() };
    });
    const header = renderStub('_custom-select-category.stub.html', { LABEL: cat.name }).trimEnd();
    const options = renderList('_custom-select-option.stub.html', items);
    return [header, options].join('\n');
  });

  const CATEGORIES = categoryBlocks.join('\n');
  return renderStub('form-module-custom-select.stub.html', { LABEL: mod.label, PLACEHOLDER: mod.placeholder, CATEGORIES });
}

/* ---------- Modul: Drag & Drop File Upload ---------- */

async function collectFileUploadModule(): Promise<FileUploadModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Dodac strefe Drag & Drop File Upload?', default: false });
  if (!wanted) return undefined;

  const animated = await confirm({ message: '  Wariant animowany (biegnaca linia na hover)?', default: false });
  const title = await input({ message: '  Naglowek strefy:', default: 'Upusc plik tutaj' });
  const subtitle = await input({ message: '  Podpis pod naglowkiem:', default: 'lub kliknij, aby wybrac' });
  const fieldName = await input({ message: '  Nazwa pola (name inputu pliku):', default: 'plik' });

  return { animated, title, subtitle, fieldName };
}

function renderFileUploadModule(mod: FileUploadModuleAnswers): string {
  return renderStub('form-module-file-upload.stub.html', {
    VARIANT_CLASS: mod.animated ? ' file-upload-animated' : '',
    ICON: mod.animated ? 'ph-cloud' : 'ph-file-text',
    TITLE: mod.title,
    SUBTITLE: mod.subtitle,
    FIELD_NAME: mod.fieldName,
  });
}

/* ---------- Dispatch ---------- */

export function renderForm(answers: FormAnswers): string {
  const FIELDS = renderFields(answers.style, answers.fields);
  const selectSearch = answers.selectSearch ? renderSelectSearchModule(answers.selectSearch) : '';
  const customSelect = answers.customSelect ? renderCustomSelectModule(answers.customSelect) : '';
  const fileUpload = answers.fileUpload ? renderFileUploadModule(answers.fileUpload) : '';

  const BODY = [FIELDS, selectSearch, customSelect, fileUpload].filter(Boolean).join('\n\n');
  return renderStub('form.stub.html', { BODY, SUBMIT_LABEL: answers.submitLabel });
}

async function collectFormAnswers(countFlag?: string): Promise<FormAnswers> {
  const style = await select<FieldStyle>({
    message: 'Styl podstawowych pol?',
    choices: [
      { name: 'Floating Labels (etykieta plywa do gory)', value: 'floating' },
      { name: 'Klasyczny (etykieta obok pola)', value: 'classic' },
    ],
  });

  const fields = await collectFields(style, countFlag);
  const selectSearch = await collectSelectSearchModule();
  const customSelect = await collectCustomSelectModule();
  const fileUpload = await collectFileUploadModule();
  const submitLabel = await input({ message: 'Etykieta przycisku wysylki:', default: 'Wyslij' });

  return { style, fields, selectSearch, customSelect, fileUpload, submitLabel };
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
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt FormAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<FormAnswers>(opts);
      const answers = provided ?? (await collectFormAnswers(opts.count));
      const html = renderForm(answers);
      await outputResult(html, 'components/form.html', provided ? { out: opts.out } : undefined);
    });
}
