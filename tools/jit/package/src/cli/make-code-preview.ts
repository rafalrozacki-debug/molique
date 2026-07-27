/**
 * molique-jit - `make:code-preview` (Scaffolding)
 *
 * Markup zweryfikowany wzgledem css/scss/components/_code-preview.scss
 * (.component-showcase > .component-preview + .component-code > .btn-copy
 * + <pre><code>). To DOKLADNIE wzorzec "podglad + kod", ktorego uzywa
 * KAZDA strona src/examples-*.html w calym repo - przeniesiony z modulu
 * docs do rdzenia SCSS wlasnie po to, zeby dzialal wszedzie (komentarz w
 * zrodle: "np. hero na stronie glownej"). `.btn-copy` NIE wymaga zadnego
 * JS per-instancja - kopiowanie obsluguje globalnie
 * `js/molique-script.js` (sekcja "KULOODPORNE KOPIOWANIE KODU",
 * `document.querySelectorAll('.btn-copy')`), generator wypisuje wiec
 * WYLACZNIE markup.
 *
 * Praktyczny cel: opakowanie wyniku INNEJ komendy `make:*` (np. wygenerowanej
 * karty czy przycisku) w standardowy showcase do wlasnej strony stylu.
 * To PIERWSZY generator w calej rodzinie molique-jit wymagajacy realnego
 * escapowania HTML - `.component-code` pokazuje kod jako TEKST (wewnatrz
 * <pre><code>), podczas gdy `.component-preview` renderuje TEN SAM markup
 * NA ZYWO (bez escapowania) - dwa rozne cele, jedno zrodlo danych.
 *
 * Ograniczenie: `input()` z @inquirer/prompts jest jednoliniowy - do
 * wielo liniowych fragmentow (np. cala karta czy modal) uzyj
 * `--answers`/`--answers-file` zamiast trybu interaktywnego.
 */

import type { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { renderStub } from '../stubs.js';
import { outputResult } from './output.js';
import { loadAnswers } from './answers.js';

function escapeHtml(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface CodePreviewAnswers {
  /** Surowy HTML komponentu - renderowany NA ZYWO w podgladzie i (zescapowany) jako kod do skopiowania. */
  html: string;
  /** Dodatkowe klasy narzedziowe na .component-preview, np. "w-100 bg-surface" - puste = brak. */
  previewExtraClass: string;
}

export async function collectCodePreviewAnswers(): Promise<CodePreviewAnswers> {
  const html = await input({
    message: 'Kod HTML komponentu do pokazania (jednoliniowy - do wieloliniowych uzyj --answers):',
    default: '<button class="btn-primary">Przycisk</button>',
  });
  const previewExtraClass = await input({
    message: 'Dodatkowe klasy na .component-preview (puste = brak, np. "w-100 bg-surface"):',
    default: '',
  });
  return { html, previewExtraClass };
}

export function renderCodePreview(answers: CodePreviewAnswers): string {
  return renderStub('code-preview.stub.html', {
    PREVIEW_HTML: answers.html,
    CODE_HTML: escapeHtml(answers.html),
    PREVIEW_EXTRA_CLASS: answers.previewExtraClass ? ` ${answers.previewExtraClass}` : '',
  });
}

export function registerMakeCodePreviewCommand(program: Command): void {
  program
    .command('make:code-preview')
    .description('Interaktywny generator bloku "podglad + kod" (.component-showcase) (aliasy: zrob:podglad-kodu, mache:codevorschau)')
    .option('--answers <json>', 'Odpowiedzi jako JSON (ksztalt CodePreviewAnswers) - pomija WSZYSTKIE pytania (zalecane dla wieloliniowego HTML)')
    .option('--answers-file <path>', 'Sciezka do pliku JSON z odpowiedziami - pomija WSZYSTKIE pytania')
    .option('-o, --out <path>', 'Zapisz wynik do pliku (dziala tylko razem z --answers/--answers-file)')
    .action(async (opts: { answers?: string; answersFile?: string; out?: string }) => {
      const provided = loadAnswers<CodePreviewAnswers>(opts);
      const answers = provided ?? (await collectCodePreviewAnswers());
      const html = renderCodePreview(answers);
      await outputResult(html, 'components/code-preview.html', provided ? { out: opts.out } : undefined);
    });
}
