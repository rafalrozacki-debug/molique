/**
 * molique - user-facing text follows <html lang> (lightbox, file upload,
 * share, toast default, copy button).
 *
 * These strings are invisible in normal use - three of the four are read
 * only by a screen reader - so nothing here can be checked by looking at the
 * page. Every case is therefore measured on the live DOM, across six values
 * of lang, including the two that actually break implementations:
 *
 *   pl-PL  a full BCP 47 tag (what WordPress renders). An un-split
 *          comparison against 'pl' falls through to English and nobody
 *          notices, because English is a plausible-looking result.
 *   ""     no lang at all. Must give English, NOT the old Polish default -
 *          this is the case that matters for everyone installing from npm.
 *
 * Polish plurals get their own block: "2 pliki" but "5 plikow", and the
 * 12-14 band flips back. The string this replaced said "plikow" always.
 *
 * Needs Playwright, which is not a dependency of this repo: without it the
 * test skips. Install it elsewhere and point NODE_PATH at it.
 * npm run test:i18n-labels
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.log('SKIP  Playwright is not installed');
  process.exit(0);
}

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};
const eq = (name, got, want) => check(name, got === want, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);

const pageFor = (lang) => `<!doctype html><html${lang === null ? '' : ` lang="${lang}"`}><head><meta charset="utf-8">
<link rel="stylesheet" href="/css/molique-style.css"></head><body>
<a href="/img/flags/pl.svg" data-lightbox data-gallery="g"><img src="/img/flags/pl.svg" alt="x" width="20"></a>
<div class="file-upload"><input type="file" multiple></div>
<button class="share-btn" data-network="native">Udostepnij</button>
<div class="component-code"><button class="btn-copy">Kopiuj</button><pre><code>abc</code></pre></div>
<script src="/js/molique-script.js"></script>
</body></html>`;

const serve = (page, lang) =>
  page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: pageFor(lang) });
    const file = path.join(ROOT, u.pathname);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const ext = path.extname(file).toLowerCase();
      const type = ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
      return route.fulfill({ contentType: `${type}; charset=utf-8`, body: fs.readFileSync(file) });
    }
    return route.fulfill({ status: 404, body: '' });
  });

const browser = await chromium.launch();

const EXPECT = {
  pl: { close: 'Zamknij', prev: 'Poprzednie zdjęcie', next: 'Następne zdjęcie', zoom: 'Powiększenie', toast: 'Powiadomienie', copied: 'Skopiowano!' },
  en: { close: 'Close', prev: 'Previous image', next: 'Next image', zoom: 'Enlarged view', toast: 'Notification', copied: 'Copied!' },
  de: { close: 'Schließen', prev: 'Vorheriges Bild', next: 'Nächstes Bild', zoom: 'Vergrößerte Ansicht', toast: 'Benachrichtigung', copied: 'Kopiert!' },
};

/* lang -> which language the framework must speak. The last three are the
   whole point of the change. */
const CASES = [
  ['pl', 'pl', 'jawny polski'],
  ['en', 'en', 'jawny angielski'],
  ['de', 'de', 'jawny niemiecki'],
  ['pl-PL', 'pl', 'PULAPKA: pelny tag z regionem'],
  ['', 'en', 'PULAPKA: pusty lang = angielski, NIE polski'],
  ['fr', 'en', 'nieznany jezyk = angielski'],
];

for (const [lang, want, label] of CASES) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await serve(page, lang);
  await page.goto('https://cc.local/');
  await page.waitForFunction(() => typeof window.MoliqueToast === 'object', null, { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => !!document.querySelector('.lightbox-close'), null, { timeout: 8000 }).catch(() => {});

  const e = EXPECT[want];
  const got = await page.evaluate(() => {
    const q = (s, a) => {
      const el = document.querySelector(s);
      return el ? el.getAttribute(a) : null;
    };
    return {
      close: q('.lightbox-close', 'aria-label'),
      prev: q('.lightbox-prev', 'aria-label'),
      next: q('.lightbox-next', 'aria-label'),
      zoom: q('.lightbox-content img', 'alt'),
    };
  });

  check(`lang="${lang}" (${label}): zero bledow JS`, errors.length === 0, errors.slice(0, 2).join(' | '));
  eq(`lang="${lang}": lightbox - zamknij`, got.close, e.close);
  eq(`lang="${lang}": lightbox - poprzednie`, got.prev, e.prev);
  eq(`lang="${lang}": lightbox - nastepne`, got.next, e.next);
  eq(`lang="${lang}": lightbox - alt powiekszenia`, got.zoom, e.zoom);

  /* toast default: show() with no message at all */
  const toastText = await page.evaluate(async () => {
    window.MoliqueToast.show({});
    await new Promise((r) => setTimeout(r, 120));
    const t = document.querySelector('.toast, [class*="toast"]');
    return t ? t.textContent.trim() : null;
  });
  check(`lang="${lang}": domyslny tekst toastu`, (toastText || '').includes(e.toast), JSON.stringify(toastText));

  /* copy button: whichever branch runs, the WORD must be in the right language */
  const copyText = await page.evaluate(async () => {
    document.querySelector('.btn-copy').click();
    await new Promise((r) => setTimeout(r, 250));
    return document.querySelector('.btn-copy').innerText;
  });
  const okCopy = copyText === e.copied || /^(Błąd!|Error!|Fehler!)$/.test(copyText);
  check(`lang="${lang}": przycisk kopiowania`, okCopy && !(want !== 'pl' && /Skopiowano|Błąd/.test(copyText)), JSON.stringify(copyText));

  await page.close();
}

/* ---------- Polish plurals in the file upload ---------- */
{
  const page = await browser.newPage();
  await serve(page, 'pl');
  await page.goto('https://cc.local/');
  await page.waitForFunction(() => typeof window.initFileUpload === 'function', null, { timeout: 8000 }).catch(() => {});

  const forms = await page.evaluate(() => {
    const out = {};
    for (const n of [2, 3, 4, 5, 11, 12, 14, 22, 24, 25, 112]) out[n] = fileUploadText(n);
    return out;
  });

  const want = {
    2: 'Wybrano 2 pliki',
    3: 'Wybrano 3 pliki',
    4: 'Wybrano 4 pliki',
    5: 'Wybrano 5 plików',
    11: 'Wybrano 11 plików',
    12: 'Wybrano 12 plików',
    14: 'Wybrano 14 plików',
    22: 'Wybrano 22 pliki',
    24: 'Wybrano 24 pliki',
    25: 'Wybrano 25 plików',
    112: 'Wybrano 112 plików',
  };
  for (const n of Object.keys(want)) eq(`liczba mnoga PL: ${n}`, forms[n], want[n]);

  /* KONTROLA UJEMNA: the string this replaced said "plikow" for every count,
     so a regression to it would still look plausible. Pin the 2-4 band. */
  check('KONTROLA UJEMNA: 2-4 to NIE "plikow"', !/plików/.test(forms[2] + forms[3] + forms[4]), forms[2]);

  await page.close();
}

/* The two blocks below exist because mutation testing found the suite blind
   to them: making the CORE lookup eager, and switching the file upload's
   fallback to Polish, both left every assertion green. */
{
  const page = await browser.newPage();
  await serve(page, '');
  await page.goto('https://cc.local/');
  await page.waitForFunction(() => typeof window.initFileUpload === 'function', null, { timeout: 8000 }).catch(() => {});
  eq('KONTROLA UJEMNA: file upload bez lang = angielski', await page.evaluate(() => fileUploadText(3)), '3 files selected');
  eq('KONTROLA UJEMNA: file upload przy lang="fr" = angielski', await page.evaluate(() => {
    document.documentElement.lang = 'fr';
    return fileUploadText(3);
  }), '3 files selected');
  await page.close();
}

{
  const page = await browser.newPage();
  await serve(page, 'en');
  await page.goto('https://cc.local/');
  await page.waitForFunction(() => typeof window.MoliqueToast === 'object', null, { timeout: 8000 }).catch(() => {});

  const before = await page.evaluate(async () => {
    window.MoliqueToast.show({});
    await new Promise((r) => setTimeout(r, 120));
    return document.querySelector('.toast, [class*="toast"]').textContent.trim();
  });
  const after = await page.evaluate(async () => {
    document.documentElement.lang = 'de';
    document.querySelectorAll('.toast, [class*="toast"]').forEach((t) => t.remove());
    window.MoliqueToast.show({});
    await new Promise((r) => setTimeout(r, 120));
    return document.querySelector('.toast, [class*="toast"]').textContent.trim();
  });
  check('RDZEN czyta lang LENIWIE: zmiana po starcie dziala', before.includes('Notification') && after.includes('Benachrichtigung'), `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);

  await page.close();
}

{
  const page = await browser.newPage();
  await serve(page, 'en');
  await page.goto('https://cc.local/');
  await page.waitForFunction(() => typeof window.initFileUpload === 'function', null, { timeout: 8000 }).catch(() => {});
  const en = await page.evaluate(() => fileUploadText(3));
  eq('file upload po angielsku', en, '3 files selected');
  const de = await page.evaluate(() => {
    document.documentElement.lang = 'de-AT';
    return fileUploadText(3);
  });
  eq('file upload po niemiecku, tag z regionem (de-AT)', de, '3 Dateien ausgewählt');

  /* The lookup is LAZY - lang changed after load must take effect. */
  const late = await page.evaluate(() => {
    document.documentElement.lang = 'pl';
    return fileUploadText(3);
  });
  eq('odczyt jest LENIWY: zmiana lang po starcie dziala', late, 'Wybrano 3 pliki');

  await page.close();
}

console.log(failed ? `\n${failed} nie przeszlo` : '\njezyk etykiet: wszystko przeszlo');
const r = await Promise.race([browser.close().then(() => 'c'), new Promise((x) => setTimeout(() => x('t'), 3000))]);
if (r === 't') console.log('(close zawisl)');
process.exit(failed ? 1 : 0);
