/**
 * molique - konfigurator paczki CSS
 *
 * Czyta dist/chunks/manifest.json, renderuje wybór modułów i skleja zaznaczone
 * chunki po stronie klienta (Blob -> pobranie). Zero backendu.
 *
 * Dlaczego sklejanie w dowolnej kolejności jest bezpieczne: molique deklaruje
 * kolejność warstw z góry (@layer reset, base, …), więc o precedencji decyduje
 * ta deklaracja, a nie kolejność wklejenia bloków.
 */

const MANIFEST_URL = 'dist/chunks/manifest.json';
const CHUNK_DIR = 'dist/chunks/';

// Ten sam plik JS lada na stronie PL/EN/DE - komunikaty i etykiety czytaja
// jezyk z <html lang> (ten sam wzorzec co molique-lang-suggest.js). Etykiety
// i opisy POSZCZEGOLNYCH modulow (label/desc/cat) nie sa tlumaczone tutaj -
// przychodza juz przetlumaczone w manifest.json (labelEn/descEn/catEn, patrz
// tools/builder-i18n.data.js + gen-chunks.js), bo to jedyne miejsce, gdzie
// obie strony (generator manifestu i ten skrypt) widza te same dane.
const BUILDER_LANG = document.documentElement.lang;
const BUILDER_STRINGS = {
  done: {
    pl: (kb) => 'Gotowe — paczka pobrana (' + kb + ').',
    en: (kb) => 'Done — package downloaded (' + kb + ').',
    de: (kb) => 'Fertig — Paket heruntergeladen (' + kb + ').',
  },
  error: {
    pl: (msg) => 'Błąd: ' + msg,
    en: (msg) => 'Error: ' + msg,
    de: (msg) => 'Fehler: ' + msg,
  },
  toggleAll: { pl: 'Przełącz wszystkie', en: 'Toggle all', de: 'Alle umschalten' },
  cssHeader: {
    pl: (n, ids) => '/*! molique - paczka złożona konfiguratorem\n *  Moduły (' + n + '): ' + ids + '\n *  Kolejność warstw deklarowana niżej - nie usuwaj tej linii.\n */\n',
    en: (n, ids) => '/*! molique - package assembled with the configurator\n *  Modules (' + n + '): ' + ids + '\n *  Layer order is declared below - do not remove this line.\n */\n',
    de: (n, ids) => '/*! molique - mit dem Konfigurator zusammengestelltes Paket\n *  Module (' + n + '): ' + ids + '\n *  Layer-Reihenfolge wird unten deklariert - diese Zeile nicht entfernen.\n */\n',
  },
  requires: { pl: 'wymaga: ', en: 'requires: ', de: 'erfordert: ' },
  alwaysIncluded: { pl: 'zawsze w paczce', en: 'always included', de: 'immer enthalten' },
  optInNote: {
    pl: 'dodatkowy - poza presetem „Wszystko"',
    en: 'opt-in - outside the "Everything" preset',
    de: 'optional - außerhalb des Presets „Alles"',
  },
  fetchFailed: { pl: 'Nie udało się pobrać ', en: 'Failed to fetch ', de: 'Abruf fehlgeschlagen: ' },
  assembling: { pl: 'Składam…', en: 'Assembling…', de: 'Wird zusammengestellt…' },
  loadingModules: { pl: 'Pobieram listę modułów…', en: 'Fetching module list…', de: 'Modulliste wird geladen…' },
  manifestLoadFailedTitle: {
    pl: 'Nie udało się wczytać manifestu.',
    en: 'Failed to load the manifest.',
    de: 'Manifest konnte nicht geladen werden.',
  },
  manifestLoadFailedBody: {
    pl: 'Uruchom <code>npm run build</code> (generuje <code>dist/chunks/</code>). Szczegóły: ',
    en: 'Run <code>npm run build</code> (it generates <code>dist/chunks/</code>). Details: ',
    de: 'Führen Sie <code>npm run build</code> aus (erzeugt <code>dist/chunks/</code>). Details: ',
  },
};
const builderT = (key, ...args) => {
  const entry = BUILDER_STRINGS[key][BUILDER_LANG] || BUILDER_STRINGS[key].en;
  return typeof entry === 'function' ? entry(...args) : entry;
};

// label()/desc()/cat() czytaja odpowiednie pole z manifestu (patrz wyzej) -
// domyslnie polskie, na PL nie ma nic do wyboru.
const label = (c) => (BUILDER_LANG === 'en' ? c.labelEn : BUILDER_LANG === 'de' ? c.labelDe : c.label);
const desc = (c) => (BUILDER_LANG === 'en' ? c.descEn : BUILDER_LANG === 'de' ? c.descDe : c.desc);
const catOf = (c) => (BUILDER_LANG === 'en' ? c.catEn : BUILDER_LANG === 'de' ? c.catDe : c.cat);

const LAYER_DECL = /@layer\s+reset\s*,\s*base\s*,\s*layout\s*,\s*components\s*,\s*modules\s*,\s*utilities\s*;/g;

const PRESETS_I18N = {
  nano: {
    pl: { label: 'Nano', desc: 'Sam fundament: zmienne, reset, grid, przyciski.' },
    en: { label: 'Nano', desc: 'Just the foundation: variables, reset, grid, buttons.' },
    de: { label: 'Nano', desc: 'Nur das Fundament: Variablen, Reset, Grid, Buttons.' },
  },
  landing: {
    pl: { label: 'Landing page', desc: 'Strona ofertowa: nawigacja, hero, karty, cennik, formularz.' },
    en: { label: 'Landing page', desc: 'A marketing page: navigation, hero, cards, pricing, form.' },
    de: { label: 'Landing Page', desc: 'Eine Marketing-Seite: Navigation, Hero, Karten, Preise, Formular.' },
  },
  admin: {
    pl: { label: 'Panel admina', desc: 'Dashboard B2B: sidebar, tabele, formularze, modale, wykresy.' },
    en: { label: 'Admin panel', desc: 'B2B dashboard: sidebar, tables, forms, modals, charts.' },
    de: { label: 'Admin-Panel', desc: 'B2B-Dashboard: Sidebar, Tabellen, Formulare, Modale, Diagramme.' },
  },
  shop: {
    pl: { label: 'Sklep', desc: 'E-commerce: karty produktów, koszyk, oceny, galeria.' },
    en: { label: 'Shop', desc: 'E-commerce: product cards, cart, ratings, gallery.' },
    de: { label: 'Shop', desc: 'E-Commerce: Produktkarten, Warenkorb, Bewertungen, Galerie.' },
  },
};

const PRESETS = {
  nano: {
    ...PRESETS_I18N.nano[BUILDER_LANG] || PRESETS_I18N.nano.en,
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons'],
  },
  landing: {
    ...PRESETS_I18N.landing[BUILDER_LANG] || PRESETS_I18N.landing.en,
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons', 'utilities',
      'navbar', 'dropdown', 'hero', 'cards', 'accordion', 'pricing-table', 'pricing-list',
      'testimonials', 'form-base', 'form-groups', 'form-check', 'badges', 'alerts',
      'timeline', 'scroll-to-top'],
  },
  admin: {
    ...PRESETS_I18N.admin[BUILDER_LANG] || PRESETS_I18N.admin.en,
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons', 'utilities',
      'navbar', 'dropdown', 'admin-nav', 'admin-sidebar', 'dashboard', 'tables',
      'data-rows', 'data-row-compact', 'form-base', 'form-groups', 'form-check',
      'form-switch', 'form-select-search', 'modal', 'modal-confirm', 'toasts',
      'badges', 'status-dots', 'tooltips', 'tabs', 'charts', 'stepper', 'progress'],
  },
  shop: {
    ...PRESETS_I18N.shop[BUILDER_LANG] || PRESETS_I18N.shop.en,
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons', 'utilities',
      'navbar', 'mega-menu', 'dropdown', 'cards', 'badges', 'alerts', 'toasts',
      'form-base', 'form-groups', 'form-check', 'modal', 'lightbox', 'carousel',
      'tabs', 'accordion', 'pricing-table', 'stock-bar', 'breadcrumbs', 'pagination'],
  },
};

let manifest = null;
let selected = new Set();

const $ = (sel) => document.querySelector(sel);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

/* ---------- Zależności ---------- */

// Domknięcie tranzytywne: zaznaczenie modułu dociąga to, czego on potrzebuje.
function withDeps(ids) {
  const out = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...out]) {
      const c = manifest.chunks.find((x) => x.id === id);
      if (!c) continue;
      for (const d of c.deps) {
        if (!out.has(d)) {
          out.add(d);
          changed = true;
        }
      }
    }
  }
  for (const c of manifest.chunks) if (c.mandatory) out.add(c.id);
  return out;
}

/* ---------- Render ---------- */

// Lista budowana JEDEN RAZ. Przebudowywanie jej przy każdym kliknięciu
// (innerHTML) gubiło pozycję przewijania i fokus - wyglądało to, jakby sekcja
// się zwijała. Zmiany stanu nanosi syncUI(), które tylko odświeża checkboxy.
function renderOnce() {
  const cats = {};
  // Grupujemy po PRZETLUMACZONEJ nazwie kategorii - dwie kategorie z tym samym
  // polskim "cat" maja to samo catEn/catDe, wiec grupowanie zostaje spojne.
  for (const c of manifest.chunks) {
    const cat = catOf(c);
    (cats[cat] = cats[cat] || []).push(c);
  }

  $('#builder-list').innerHTML = Object.entries(cats)
    .map(([cat, items]) => `
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h3 class="text-5 fw-bold m-0">${cat}</h3>
          <button type="button" class="btn-action" data-cat="${items[0].cat}">${builderT('toggleAll')}</button>
        </div>
        <div class="grid grid-cols-1 grid-md-cols-2 gap-2">
          ${items.map(itemHtml).join('')}
        </div>
      </div>`)
    .join('');

  syncUI();
}

// Klikalny jest TYLKO checkbox z etykietą modułu. Opis i lista zależności
// leżą poza <label>, żeby dało się je przeczytać (i zaznaczyć myszą) bez
// przypadkowego przełączania modułu.
function itemHtml(c) {
  const deps = c.deps.length
    ? `<span class="text-1 text-muted d-block">${builderT('requires')}${c.deps.join(', ')}</span>`
    : '';
  const note = c.mandatory
    ? `<span class="text-1 text-primary d-block">${builderT('alwaysIncluded')}</span>`
    : c.optIn
      ? `<span class="text-1 text-warning d-block">${builderT('optInNote')}</span>`
      : '';
  return `
    <div class="p-2 border rounded-2" data-row="${c.id}">
      <label class="d-flex align-items-center gap-2"
             style="cursor: ${c.mandatory ? 'not-allowed' : 'pointer'}">
        <input type="checkbox" class="form-check-input" data-id="${c.id}"
               ${c.mandatory ? 'disabled' : ''} />
        <span class="d-flex align-items-center justify-content-between gap-2 w-100">
          <strong class="text-3">${label(c)}</strong>
          <span class="badge badge-secondary text-1">${kb(c.gzip)}</span>
        </span>
      </label>
      <span class="text-2 text-muted d-block mt-1">${desc(c) || ''}</span>
      ${deps}
      ${note}
    </div>`;
}

// Nanosi aktualny stan na istniejący DOM - bez przebudowy listy.
function syncUI() {
  for (const c of manifest.chunks) {
    const box = document.querySelector(`input[data-id="${c.id}"]`);
    const row = document.querySelector(`[data-row="${c.id}"]`);
    if (!box || !row) continue;
    const on = selected.has(c.id);
    box.checked = on;
    row.classList.toggle('border-primary', on);
    row.classList.toggle('bg-body', on);
  }
  updateSummary();
}

function updateSummary() {
  const chosen = manifest.chunks.filter((c) => selected.has(c.id));
  const bytes = chosen.reduce((s, c) => s + c.bytes, 0);
  const gz = chosen.reduce((s, c) => s + c.gzip, 0);
  const all = manifest.chunks.reduce((s, c) => s + c.gzip, 0);
  const pct = all ? Math.round((1 - gz / all) * 100) : 0;

  $('#sum-count').textContent = chosen.length + ' / ' + manifest.chunks.length;
  $('#sum-size').textContent = kb(bytes);
  $('#sum-gzip').textContent = kb(gz);
  $('#sum-saved').textContent = pct + '%';
  $('#btn-download').disabled = chosen.length === 0;
}

/* ---------- Sklejanie ---------- */

async function buildCss() {
  const chosen = manifest.chunks.filter((c) => selected.has(c.id));
  // Kolejność warstw z manifestu, a w obrębie warstwy - kolejność z manifestu.
  const order = manifest.layerOrder;
  chosen.sort((a, b) => order.indexOf(a.layer) - order.indexOf(b.layer));

  const texts = await Promise.all(
    chosen.map((c) => fetch(CHUNK_DIR + c.file).then((r) => {
      if (!r.ok) throw new Error(builderT('fetchFailed') + c.file);
      return r.text();
    }))
  );

  const bodies = texts.map((t) =>
    t
      .replace(/^﻿/, '')   // BOM - w środku sklejonego pliku to śmieć
      .replace(LAYER_DECL, '')  // deklaracja warstw zostaje TYLKO raz, na górze
      .trim()
  );

  const header = builderT('cssHeader', chosen.length, chosen.map((c) => c.id).join(', '));

  return header + '@layer ' + order.join(', ') + ';\n' + bodies.join('\n');
}

/* ---------- Zdarzenia ---------- */

function bind() {
  // Delegacja: lista jest przerysowywana, więc nasłuch na kontenerze.
  $('#builder-list').addEventListener('change', (e) => {
    const box = e.target.closest('input[data-id]');
    if (!box) return;
    if (box.checked) selected = withDeps([...selected, box.dataset.id]);
    else selected.delete(box.dataset.id);
    syncUI();
  });

  $('#builder-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    // optIn pomijamy tak samo jak w presecie "Wszystko" - moduł dodatkowy ma
    // wejść do paczki wyłącznie przez świadome kliknięcie w jego checkbox.
    const ids = manifest.chunks
      .filter((c) => c.cat === btn.dataset.cat && !c.mandatory && !c.optIn)
      .map((c) => c.id);
    const allOn = ids.every((id) => selected.has(id));
    if (allOn) ids.forEach((id) => selected.delete(id));
    else selected = withDeps([...selected, ...ids]);
    syncUI();
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRESETS[btn.dataset.preset];
      // Brak wpisu w PRESETS = przycisk "Wszystko". Moduły optIn zostają poza
      // nim celowo - są ciężkie i potrzebne rzadko.
      selected = p
        ? withDeps(p.ids)
        : withDeps(manifest.chunks.filter((c) => !c.optIn).map((c) => c.id));
      syncUI();
    });
  });

  $('#btn-clear').addEventListener('click', () => {
    selected = withDeps([]);
    syncUI();
  });

  $('#btn-download').addEventListener('click', async () => {
    const btn = $('#btn-download');
    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = builderT('assembling');
    try {
      const css = await buildCss();
      const url = URL.createObjectURL(new Blob([css], { type: 'text/css;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'molique-custom.css';
      a.click();
      URL.revokeObjectURL(url);
      if (window.MoliqueToast) {
        MoliqueToast.show({ message: builderT('done', kb(new Blob([css]).size)), type: 'success' });
      }
    } catch (err) {
      if (window.MoliqueToast) MoliqueToast.show({ message: builderT('error', err.message), type: 'danger' });
      else alert(builderT('error', err.message));
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

/* ---------- Start ---------- */

// Ślad, że skrypt w ogóle wystartował. Bez tego strona z zablokowanym
// modułem wygląda identycznie jak strona, która wciąż się ładuje.
const loadingEl = $('#builder-loading');
if (loadingEl) loadingEl.querySelector('p').textContent = builderT('loadingModules');

// Uwaga: ostrzeżenia o file:// NIE ma tutaj celowo. Ten plik jest modułem ES,
// a przeglądarka blokuje moduły na file:// przez CORS - kod stąd nigdy by się
// nie wykonał. Ostrzeżenie siedzi jako skrypt klasyczny inline w builder.html.

fetch(MANIFEST_URL)
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then((m) => {
    manifest = m;
    selected = withDeps(PRESETS.landing.ids);
    renderOnce();
    bind();
    $('#builder-loading').remove();
  })
  .catch((err) => {
    $('#builder-loading').innerHTML =
      '<div class="alert alert-danger m-0"><strong>' + builderT('manifestLoadFailedTitle') + '</strong> ' +
      builderT('manifestLoadFailedBody') +
      err.message + '</div>';
  });
