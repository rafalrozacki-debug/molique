/**
 * molique-jit - `make:component` (Discovery)
 *
 * Used to be the command that generated a Modal - now, after being
 * renamed to "make:modal" and after further families were added
 * (make:layout, eventually make:nav/make:table/...), "make:component"
 * serves as a listing of the available generators, so the user doesn't
 * have to remember every name.
 *
 * DELIBERATELY no second, hand-written command list here - it reads the
 * descriptions DIRECTLY from the already-registered Commander commands
 * (every `make:*` carries its own description, including the PL/DE
 * aliases). A single source of truth: when someone adds a new `make:*`
 * command, this list updates itself, with no second place to remember to
 * edit.
 */

import type { Command } from 'commander';

export function registerMakeComponentListCommand(program: Command): void {
  program
    .command('make:component')
    .description('Lists the available component generators (make:*)')
    .action(() => {
      const generators = program.commands.filter((c) => c.name().startsWith('make:') && c.name() !== 'make:component');

      if (generators.length === 0) {
        console.log('No generators registered.');
        return;
      }

      console.log('Available generators:\n');
      const width = Math.max(...generators.map((c) => c.name().length));
      for (const c of generators) {
        console.log('  ' + c.name().padEnd(width + 2) + c.description());
      }
      console.log('\nUsage: molique-jit <generator-name>  (e.g. molique-jit make:modal)');
    });
}
