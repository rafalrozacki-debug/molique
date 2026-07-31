/**
 * molique-jit - `make:form` (Scaffolding)
 *
 * Markup verified against css/scss/components/_form-groups.scss
 * (.form-floating - requires placeholder=" "; .input-group-inline),
 * _form-select-search.scss (.select-search - Popover API, top layer),
 * _form-select-custom.scss (.custom-select - Premium Multi Select,
 * categories), _form-file-upload.scss (.file-upload /
 * .file-upload-animated), and real usage in
 * src/examples-forms-basics.html, src/examples-input-groups.html
 * (.input-group-inline), src/examples-select.html (.select-search,
 * .custom-select), and src/examples-file-upload.html.
 *
 * IMPORTANT: js/modules/molique-select.js handles ONLY .select-search -
 * there is no JS module for .custom-select (the pills/checkboxes are
 * purely static there in the docs, the card highlight on :checked is
 * plain CSS `:has()`). That's why the generated .custom-select starts
 * EMPTY (without any pre-checked "example" items like in the docs) -
 * hardcoding a fake selection would be misleading in a real form.
 *
 * The styling of the basic fields (Floating / Classic) differs
 * STRUCTURALLY (a different wrapper tag, .form-floating vs
 * .input-group-inline), so these are two separate sets of stubs -
 * following the same rule as make:layout. The field type (text/email/
 * number/tel vs textarea) differs by tag (<input> vs <textarea>), so it
 * also gets separate files, not a {{ TAG }} in one.
 *
 * Split into "collect answers" / "render markup" (CLI roadmap, Stage B):
 * unlike modal/chart/widget/layout, `make:form` has NO discriminated
 * union of variants - it's ONE flat `FormAnswers` with three OPTIONAL
 * modules (an `undefined` field = the module was skipped), because
 * that's really how it works: style + fields + up to three
 * independently-enabled blocks.
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
  { name: 'Text', value: 'text' },
  { name: 'Email', value: 'email' },
  { name: 'Number', value: 'number' },
  { name: 'Phone', value: 'tel' },
  { name: 'Multi-line (textarea)', value: 'textarea' },
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
  /** undefined = the module was skipped. */
  selectSearch?: SelectSearchModuleAnswers;
  customSelect?: CustomSelectModuleAnswers;
  fileUpload?: FileUploadModuleAnswers;
  submitLabel: string;
}

/* ---------- Basic fields ---------- */

async function collectFields(style: FieldStyle, countFlag?: string): Promise<FormFieldAnswer[]> {
  const count = await promptCount({
    message: 'How many basic fields should the form have?',
    default: '3',
    min: 1,
    max: 8,
    flagValue: countFlag,
  });

  const fields: FormFieldAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Field ${i} label:`, default: `Field ${i}` });
    const type = await select<FieldType>({ message: `  Field ${i} type?`, choices: TYPE_CHOICES, default: 'text' });
    const required = await confirm({ message: `  Is field ${i} required?`, default: false });
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
      // The only documented error message pattern (examples-forms-basics.html,
      // "Native Validation" section) only occurs with .form-floating - that's
      // why .input-group-inline never gets .feedback-invalid.
      const FEEDBACK =
        field.required && style === 'floating' ? '\n    <div class="feedback-invalid">This field is required.</div>' : '';

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

/* ---------- Module: Searchable Select ---------- */

async function collectSelectSearchModule(): Promise<SelectSearchModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Add a Searchable Select (Combobox)?', default: false });
  if (!wanted) return undefined;

  const label = await input({ message: '  Label above the select:', default: 'Choose an option' });
  const placeholder = await input({ message: '  Button text before anything is chosen:', default: 'Choose from the list...' });
  const fieldName = await input({ message: '  Field name (the hidden input\'s name for the backend):', default: 'choice' });
  const optionsLine = await input({ message: '  Options to choose from (comma-separated):', default: 'Option 1, Option 2, Option 3' });
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

/* ---------- Module: Premium Multi Select ---------- */

// Color cycle for the option cards - the same rule as FUNNEL_PALETTE in
// make-chart.ts: examples-select.html shows only 3 examples (danger/info/
// warning), extended here with success for a larger number of options,
// without breaking the convention.
const CUSTOM_SELECT_COLORS = ['danger', 'info', 'success', 'warning'];

async function collectCustomSelectModule(): Promise<CustomSelectModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Add a Premium Multi Select (categories + checkboxes)?', default: false });
  if (!wanted) return undefined;

  const label = await input({ message: '  Label above the select:', default: 'Filter results' });
  const placeholder = await input({ message: '  Button text before anything is chosen:', default: 'Choose...' });
  const categoriesLine = await input({ message: '  Category names (comma-separated):', default: 'Popular, Other' });
  const categoryNames = categoriesLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const categories: CustomSelectModuleAnswers['categories'] = [];
  for (const name of categoryNames) {
    const itemsLine = await input({ message: `  Options in the "${name}" category (comma-separated):`, default: 'Option 1, Option 2' });
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

/* ---------- Module: Drag & Drop File Upload ---------- */

async function collectFileUploadModule(): Promise<FileUploadModuleAnswers | undefined> {
  const wanted = await confirm({ message: 'Add a Drag & Drop File Upload zone?', default: false });
  if (!wanted) return undefined;

  const animated = await confirm({ message: '  Animated variant (running line on hover)?', default: false });
  const title = await input({ message: '  Zone heading:', default: 'Drop a file here' });
  const subtitle = await input({ message: '  Caption below the heading:', default: 'or click to choose' });
  const fieldName = await input({ message: '  Field name (the file input\'s name):', default: 'file' });

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
    message: 'Style of the basic fields?',
    choices: [
      { name: 'Floating Labels (label floats up)', value: 'floating' },
      { name: 'Classic (label next to the field)', value: 'classic' },
    ],
  });

  const fields = await collectFields(style, countFlag);
  const selectSearch = await collectSelectSearchModule();
  const customSelect = await collectCustomSelectModule();
  const fileUpload = await collectFileUploadModule();
  const submitLabel = await input({ message: 'Submit button label:', default: 'Send' });

  return { style, fields, selectSearch, customSelect, fileUpload, submitLabel };
}

/* ---------- Command registration ---------- */

export function registerMakeFormCommand(program: Command): void {
  program
    .command('make:form')
    .description(
      'Interactive form generator (Floating Labels / Classic + optional Searchable Select, ' +
        'Premium Multi Select, Drag & Drop File Upload) (aliases: zrob:formularz, mache:formular)'
    )
    .option('-n, --count <number>', 'Number of basic form fields - skips this one question')
    .option('--answers <json>', 'Answers as JSON (FormAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<FormAnswers>(opts);
      const answers = provided ?? (await collectFormAnswers(opts.count));
      const html = renderForm(answers);
      await outputResult(html, 'components/form.html', provided ? { out: opts.out } : undefined);
    });
}
