/**
 * molique-jit - pomocniki promptow wspoldzielone przez komendy `make:*`.
 *
 * `promptCount()` odpowiada na pytanie uzytkownika: "czy CLI moze miec
 * dopisek z iloscia komponentow do wygenerowania?" - tak, przez opcje
 * `-n, --count <liczba>` zarejestrowana per komenda. Gdy podana, ODPOWIADA
 * na TO JEDNO pytanie "ile?" bez pytania interaktywnie, ale reszta promptow
 * (etykiety, warianty, kolory) nadal dziala normalnie - `--count` skraca
 * TYLKO liczbe powtarzalnych elementow, nie caly interaktywny flow.
 */

import { input } from '@inquirer/prompts';

export const countValidator = (min: number, max: number) => (v: string) => {
  const n = Number(v);
  return (Number.isInteger(n) && n >= min && n <= max) || `Podaj liczbe calkowita od ${min} do ${max}.`;
};

export interface PromptCountOptions {
  message: string;
  default: string;
  min: number;
  max: number;
  /** Wartosc z flagi --count (opts.count z Commandera) - jesli podana, pytanie interaktywne jest pomijane. */
  flagValue?: string;
}

export async function promptCount(options: PromptCountOptions): Promise<number> {
  if (options.flagValue !== undefined) {
    const n = Number(options.flagValue);
    if (!Number.isInteger(n) || n < options.min || n > options.max) {
      throw new Error(
        `--count musi byc liczba calkowita od ${options.min} do ${options.max} (otrzymano "${options.flagValue}").`
      );
    }
    console.log(`${options.message} ${n}  (z flagi --count)`);
    return n;
  }
  const answer = await input({
    message: options.message,
    default: options.default,
    validate: countValidator(options.min, options.max),
  });
  return Number(answer);
}
