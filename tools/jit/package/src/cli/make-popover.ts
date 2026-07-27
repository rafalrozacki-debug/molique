/**
 * molique-jit - `make:popover` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_context-menu.scss
 * (.popover-context - CSS Anchor Positioning + Popover API, auto-flip nad
 * przycisk blisko dolnej krawedzi obsluguje js/modules/molique-context-menu.js,
 * na mobile automatycznie degraduje do bottom sheet - zero dodatkowego
 * markupu do tego) oraz realnego uzycia w src/examples-context-menu.html.
 *
 * WAZNE: `.popover-context` jest uzywany w CALYM repo TYLKO na jednej
 * dedykowanej stronie przykladow - nie ma udokumentowanego parowania z np.
 * `.btn-action` (ghost button w tabelach), wiec generator trzyma sie
 * dokladnie tego, co pokazuje realny przyklad: zwykly `<button class="btn
 * btn-{kolor}">`, nie wymysla nowych polaczen.
 *
 * Kotwica: real markup rozdziela `id` (na popoverze, parowany z
 * `popovertarget`) od nazwanej kotwicy CSS (`anchor-name` na przycisku /
 * `position-anchor` na popoverze) - to DWIE rozne wartosci
 * (`id="ctxMenu1"` vs `anchor-name: --btn-ctx-1`). Tu ANCHOR_NAME jest
 * wyprowadzany automatycznie z ID (`--anchor-{id}`), zeby nie pytac o
 * druga wartosc bez ktorej uzytkownik i tak nie ma realnego wyboru - musi
 * tylko byc unikalna i spojna miedzy przyciskiem a popoverem, co
 * automatyczne wyprowadzenie gwarantuje.
 */

import type { Command } from 'commander';
import { select, input, confirm } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { promptCount } from './prompts.js';

const TRIGGER_COLOR_CHOICES = [
  { name: 'Secondary (domyslny)', value: 'btn-secondary' },
  { name: 'Primary', value: 'btn-primary' },
  { name: 'Light', value: 'btn-light' },
  { name: 'Outline (soft)', value: 'btn-outline-soft' },
] as const;

interface ActionItem {
  LABEL: string;
  ICON_HTML: string;
  DANGER_CLASS: string;
  danger: boolean;
}

function iconHtml(icon: string): string {
  return icon ? `<svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#${icon}"></use></svg> ` : '';
}

export function registerMakePopoverCommand(program: Command): void {
  program
    .command('make:popover')
    .description(
      'Interaktywny generator menu kontekstowego (.popover-context - CSS Anchor Positioning, auto-flip, ' +
        'bottom sheet na mobile) (aliasy: zrob:popover, mache:popover)'
    )
    .option('-n, --count <liczba>', 'Liczba pozycji w menu - pomija to jedno pytanie')
    .action(async (opts: { count?: string }) => {
      const TRIGGER_LABEL = await input({ message: 'Etykieta przycisku wyzwalajacego:', default: 'Opcje' });
      const triggerColor = await select({ message: 'Kolor przycisku?', choices: TRIGGER_COLOR_CHOICES, default: 'btn-secondary' });
      const addTriggerIcon = await confirm({ message: 'Dodac ikone przy przycisku?', default: true });
      const triggerIcon = addTriggerIcon
        ? await input({ message: '  Nazwa ikony (bez "#", z img/icons-sprite.svg):', default: 'ph-gear' })
        : '';

      const ID = await input({ message: 'ID popovera (unikalne na stronie):', default: 'ctxMenu1' });
      const ANCHOR_NAME = `--anchor-${ID}`;
      const TRIGGER_CLASS = `btn ${triggerColor}`;
      const TRIGGER_CONTENT = [TRIGGER_LABEL, addTriggerIcon ? iconHtml(triggerIcon).trim() : ''].filter(Boolean).join(' ');

      const count = await promptCount({
        message: 'Ile pozycji w menu?',
        default: '3',
        min: 1,
        max: 8,
        flagValue: opts.count,
      });

      const items: ActionItem[] = [];
      for (let i = 1; i <= count; i++) {
        const LABEL = await input({ message: `  Etykieta pozycji ${i}:`, default: i === 1 ? 'Podglad' : `Akcja ${i}` });
        const icon = await input({
          message: `  Ikona pozycji ${i} (nazwa z img/icons-sprite.svg, puste = brak):`,
          default: i === 1 ? 'ph-eye' : '',
        });
        const danger = await confirm({ message: `  Pozycja ${i} to akcja destrukcyjna (np. Usun)?`, default: false });
        items.push({ LABEL, ICON_HTML: iconHtml(icon), DANGER_CLASS: danger ? ' text-danger' : '', danger });
      }

      // Dzielacy <hr> pojawia sie w realnym przykladzie DOKLADNIE raz, tuz
      // przed pierwsza akcja destrukcyjna (o ile nie jest to pierwsza
      // pozycja w ogole - wtedy nie ma czego oddzielac).
      const itemBlocks: string[] = [];
      let dividerInserted = false;
      items.forEach((item, i) => {
        if (item.danger && i > 0 && !dividerInserted) {
          itemBlocks.push('    <hr class="modal-divider my-1" />');
          dividerInserted = true;
        }
        itemBlocks.push(
          renderStub('_popover-action-item.stub.html', {
            LABEL: item.LABEL,
            ICON_HTML: item.ICON_HTML,
            DANGER_CLASS: item.DANGER_CLASS,
          }).trimEnd()
        );
      });
      const ITEMS = itemBlocks.join('\n');

      const html = renderStub('popover-context.stub.html', { TRIGGER_CLASS, ID, ANCHOR_NAME, TRIGGER_CONTENT, ITEMS });
      await outputResult(html, 'components/popover-context.html');
    });
}
