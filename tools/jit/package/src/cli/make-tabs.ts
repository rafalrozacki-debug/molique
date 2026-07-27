/**
 * molique-jit - `make:tabs` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_tabs.scss (Radio
 * Hack - ukryte input[radio].tab-input sterują widocznością .tab-pane
 * przez pozycyjne dopasowanie `:nth-of-type()`, max 10 zakladek w
 * wariancie klasycznym vs max 8 w `.tabs-pill` - dwa OSOBNE limity `@for`
 * w SCSS-ie, wiec generator ogranicza liczbe zakladek per wariant) oraz
 * src/examples-tabs.html.
 *
 * Oba warianty (Klasyczny / Segmented Control "pill") maja IDENTYCZNY
 * ksztalt odpowiedzi (nazwa grupy + lista zakladek) - roznia sie tylko
 * renderowaniem (`.tabs-pill` dostaje dodatkowa klase, `style="--tab-count"`
 * i pusty `.tabs-pill-indicator`), wiec to JEDEN typ `TabsAnswers` z polem
 * `type` jako dyskryminatorem renderowania, nie dwa osobne interfejsy.
 *
 * ID pojedynczych inputow (`{groupName}-1`, `{groupName}-2`, ...) sa
 * wyprowadzane automatycznie z indeksu - to czysta hydraulika (musza tylko
 * byc unikalne i spojne z `for=` na labelu), tak samo jak pola formularza
 * w make:form.
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
  /** Atrybut "name" wspolny dla wszystkich input[radio] tej grupy zakladek. */
  groupName: string;
  tabs: TabItemAnswer[];
}

export async function collectTabsAnswers(countFlag?: string): Promise<TabsAnswers> {
  const type = await select<TabsVariant>({
    message: 'Wariant zakladek?',
    choices: [
      { name: 'Klasyczny', value: 'classic' },
      { name: 'Segmented Control (suwajacy pill)', value: 'pill' },
    ],
    default: 'classic',
  });

  const groupName = await input({ message: 'Nazwa grupy (atrybut "name", laczy input radio):', default: 'my-tabs' });

  // .tabs-pill ma WLASNY, mniejszy limit w SCSS (@for $i from 1 through 8),
  // klasyczny wariant idzie do 10 - dwa rozne limity w zrodle, dwa rozne max tutaj.
  const count = await promptCount({
    message: 'Ile zakladek?',
    default: '2',
    min: 2,
    max: type === 'pill' ? 8 : 10,
    flagValue: countFlag,
  });

  const tabs: TabItemAnswer[] = [];
  for (let i = 1; i <= count; i++) {
    const label = await input({ message: `  Etykieta zakladki ${i}:`, default: `Zakladka ${i}` });
    const content = await input({ message: `  Tresc zakladki ${i}:`, default: `Tresc zakladki ${i}` });
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
    .description('Interaktywny generator zakladek (Klasyczny / Segmented Control, Radio Hack, zero JS) (aliasy: zrob:zakladki, mache:tabs)')
    .option('-n, --count <liczba>', 'Liczba zakladek - pomija to jedno pytanie')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt TabsAnswers) - pomija WSZYSTKIE pytania')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { count?: string; answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<TabsAnswers>(opts);
      const answers = provided ?? (await collectTabsAnswers(opts.count));
      const html = renderTabs(answers);
      await outputResult(html, `components/tabs-${answers.type}.html`, provided ? { out: opts.out } : undefined);
    });
}
