/**
 * molique-jit - `make:tabs` (Scaffolding)
 *
 * Markup verified against css/scss/components/_tabs.scss (Radio Hack -
 * hidden input[radio].tab-input control the visibility of .tab-pane via
 * positional `:nth-of-type()` matching, max 10 tabs in the classic
 * variant vs max 8 in `.tabs-pill` - two SEPARATE `@for` limits in the
 * SCSS, so the generator caps the number of tabs per variant) and
 * src/examples-tabs.html.
 *
 * Both variants (Classic / Segmented Control "pill") have an IDENTICAL
 * answer shape (group name + list of tabs) - they only differ in
 * rendering (`.tabs-pill` gets an extra class, `style="--tab-count"`, and
 * an empty `.tabs-pill-indicator`), so it's ONE `TabsAnswers` type with a
 * `type` field as the rendering discriminator, not two separate
 * interfaces.
 *
 * IDs for the individual inputs (`{groupName}-1`, `{groupName}-2`, ...)
 * are derived automatically from the index - pure plumbing (they only
 * need to be unique and consistent with `for=` on the label), just like
 * the form fields in make:form.
 */

import type { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import { renderStub, renderList } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';
import { loadAnswers } from './answers.js';

type TabsVariant = 'classic' | 'pill';

export interface TabItemAnswer {
  label: string;
  content: string;
}

export interface TabsAnswers {
  type: TabsVariant;
  /** The "name" attribute shared by all input[radio] in this tab group. */
  groupName: string;
  tabs: TabItemAnswer[];
}

export async function collectTabsAnswers(countFlag?: string): Promise<TabsAnswers> {
  const type = await select<TabsVariant>({
    message: 'Tabs variant?',
    choices: [
      { name: 'Classic', value: 'classic' },
      { name: 'Segmented Control (sliding pill)', value: 'pill' },
    ],
    default: 'classic',
  });

  const groupName = await input({ message: 'Group name (the "name" attribute, links the radio inputs):', default: 'my-tabs' });

  // .tabs-pill has its OWN, smaller limit in SCSS (@for $i from 1 through 8),
  // the classic variant goes up to 10 - two different limits in the source, two different maxima here.
  const count = await promptCount({
    message: 'How many tabs?',
    default: '2',
    min: 2,
    max: type === 'pill' ? 8 : 10,
    flagValue: countFlag,
  });

  const tabs: TabItemAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Tab ${i} label:`, default: `Tab ${i}` });
    const content = await input({ message: `  Tab ${i} content:`, default: `Tab ${i} content` });
    tabs.push({ label, content });
  }

  return { type, groupName, tabs };
}

export function renderTabs(answers: TabsAnswers): string {
  const { type, groupName, tabs } = answers;

  const inputs = tabs.map((_, i) => ({
    NAME: groupName,
    ID: `${groupName}-${i + 1}`,
    CHECKED_ATTR: i === 0 ? ' checked' : '',
  }));
  const INPUTS = renderList('_tab-input.stub.html', inputs);

  const labels = tabs.map((t, i) => ({ FOR_ID: `${groupName}-${i + 1}`, LABEL: t.label }));
  const LABELS = renderList('_tab-label.stub.html', labels);

  const PANES = renderList('_tab-pane.stub.html', tabs.map((t) => ({ CONTENT: t.content })));

  if (type === 'pill') {
    return renderStub('tabs-pill.stub.html', { TAB_COUNT: String(tabs.length), INPUTS, LABELS, PANES });
  }
  return renderStub('tabs-classic.stub.html', { INPUTS, LABELS, PANES });
}

export function registerMakeTabsCommand(program: Command): void {
  program
    .command('make:tabs')
    .description('Interactive tabs generator (Classic / Segmented Control, Radio Hack, zero JS) (aliases: zrob:zakladki, mache:tabs)')
    .option('-n, --count <number>', 'Number of tabs - skips this one question')
    .option('--answers <json>', 'Answers as JSON (TabsAnswers shape) - skips ALL questions')
    .option('--answers-file <path>', 'Path to a JSON file with answers - skips ALL questions')
    .option('-o, --out <path>', 'Save the result to a file (only works together with --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TabsAnswers>(opts);
      const answers = provided ?? (await collectTabsAnswers(opts.count));
      const html = renderTabs(answers);
      await outputResult(html, `components/tabs-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
