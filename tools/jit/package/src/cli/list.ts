/**
 * molique-jit - `make:component` (Discovery)
 *
 * Kiedyś to była komenda, ktora generowala Modal - teraz, po przemianowaniu
 * na "make:modal" i dodaniu kolejnych rodzin (make:layout, docelowo
 * make:nav/make:table/...), "make:component" sluzy jako spis dostepnych
 * generatorow, zeby uzytkownik nie musial pamietac wszystkich nazw.
 *
 * CELOWO nie ma tu drugiej, recznie pisanej listy komend - czyta opisy
 * WPROST z juz zarejestrowanych komend Commandera (kazde `make:*` samo
 * niesie swoj opis wlacznie z aliasami PL/DE). Jedno zrodlo prawdy: gdy
 * ktos doda nowa komende `make:*`, ta lista zaktualizuje sie sama, bez
 * pamietania o drugim miejscu do edycji.
 */

import type { Command } from 'commander';

export function registerMakeComponentListCommand(program: Command): void {
  program
    .command('make:component')
    .description('Listuje dostepne generatory komponentow (make:*)')
    .action(() => {
      const generators = program.commands.filter((c) => c.name().startsWith('make:') && c.name() !== 'make:component');

      if (generators.length === 0) {
        console.log('Brak zarejestrowanych generatorow.');
        return;
      }

      console.log('Dostepne generatory:\n');
      const width = Math.max(...generators.map((c) => c.name().length));
      for (const c of generators) {
        console.log('  ' + c.name().padEnd(width + 2) + c.description());
      }
      console.log('\nUzycie: molique-jit <nazwa-generatora>  (np. molique-jit make:modal)');
    });
}
