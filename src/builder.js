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

const LAYER_DECL = /@layer\s+reset\s*,\s*base\s*,\s*layout\s*,\s*components\s*,\s*modules\s*,\s*utilities\s*;/g;

const PRESETS = {
  nano: {
    label: 'Nano',
    desc: 'Sam fundament: zmienne, reset, grid, przyciski.',
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons'],
  },
  landing: {
    label: 'Landing page',
    desc: 'Strona ofertowa: nawigacja, hero, karty, cennik, formularz.',
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons', 'utilities',
      'navbar', 'dropdown', 'hero', 'cards', 'accordion', 'pricing-table', 'pricing-list',
      'testimonials', 'form-base', 'form-groups', 'form-check', 'badges', 'alerts',
      'timeline', 'scroll-to-top'],
  },
  admin: {
    label: 'Panel admina',
    desc: 'Dashboard B2B: sidebar, tabele, formularze, modale, wykresy.',
    ids: ['root', 'fonts', 'base', 'a11y', 'grid', 'layout', 'buttons', 'utilities',
      'navbar', 'dropdown', 'admin-nav', 'admin-sidebar', 'dashboard', 'tables',
      'data-rows', 'data-row-compact', 'form-base', 'form-groups', 'form-check',
      'form-switch', 'form-select-search', 'modal', 'modal-confirm', 'toasts',
      'badges', 'status-dots', 'tooltips', 'tabs', 'charts', 'stepper', 'progress'],
  },
  shop: {
    label: 'Sklep',
    desc: 'E-commerce: karty produktów, koszyk, oceny, galeria.',
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

function render() {
  const cats = {};
  for (const c of manifest.chunks) (cats[c.cat] = cats[c.cat] || []).push(c);

  $('#builder-list').innerHTML = Object.entries(cats)
    .map(([cat, items]) => `
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h3 class="text-5 fw-bold m-0">${cat}</h3>
          <button type="button" class="btn-action" data-cat="${cat}">Przełącz wszystkie</button>
        </div>
        <div class="grid grid-cols-1 grid-md-cols-2 gap-2">
          ${items.map(itemHtml).join('')}
        </div>
      </div>`)
    .join('');

  updateSummary();
}

function itemHtml(c) {
  const on = selected.has(c.id);
  const lock = c.mandatory ? ' disabled' : '';
  const deps = c.deps.length
    ? `<span class="text-1 text-muted d-block">wymaga: ${c.deps.join(', ')}</span>`
    : '';
  return `
    <label class="d-flex align-items-start gap-2 p-2 border rounded-2 ${on ? 'border-hover-primary' : ''}"
           style="cursor: ${c.mandatory ? 'not-allowed' : 'pointer'}">
      <input type="checkbox" class="form-check-input mt-1" data-id="${c.id}"
             ${on ? 'checked' : ''}${lock} />
      <span class="w-100">
        <span class="d-flex align-items-center justify-content-between gap-2">
          <strong class="text-3">${c.label}</strong>
          <span class="badge badge-secondary text-1">${kb(c.gzip)}</span>
        </span>
        <span class="text-2 text-muted d-block">${c.desc || ''}</span>
        ${deps}
        ${c.mandatory ? '<span class="text-1 text-primary d-block">wymagany</span>' : ''}
      </span>
    </label>`;
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
      if (!r.ok) throw new Error('Nie udało się pobrać ' + c.file);
      return r.text();
    }))
  );

  const bodies = texts.map((t) =>
    t
      .replace(/^﻿/, '')   // BOM - w środku sklejonego pliku to śmieć
      .replace(LAYER_DECL, '')  // deklaracja warstw zostaje TYLKO raz, na górze
      .trim()
  );

  const header =
    '/*! molique - paczka złożona konfiguratorem\n' +
    ' *  Moduły (' + chosen.length + '): ' + chosen.map((c) => c.id).join(', ') + '\n' +
    ' *  Kolejność warstw deklarowana niżej - nie usuwaj tej linii.\n' +
    ' */\n';

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
    render();
  });

  $('#builder-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    const ids = manifest.chunks.filter((c) => c.cat === btn.dataset.cat && !c.mandatory).map((c) => c.id);
    const allOn = ids.every((id) => selected.has(id));
    if (allOn) ids.forEach((id) => selected.delete(id));
    else selected = withDeps([...selected, ...ids]);
    render();
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRESETS[btn.dataset.preset];
      selected = p ? withDeps(p.ids) : withDeps(manifest.chunks.map((c) => c.id));
      render();
    });
  });

  $('#btn-clear').addEventListener('click', () => {
    selected = withDeps([]);
    render();
  });

  $('#btn-download').addEventListener('click', async () => {
    const btn = $('#btn-download');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Składam…';
    try {
      const css = await buildCss();
      const url = URL.createObjectURL(new Blob([css], { type: 'text/css;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'molique-custom.css';
      a.click();
      URL.revokeObjectURL(url);
      if (window.MoliqueToast) {
        MoliqueToast.show({ message: 'Gotowe — paczka pobrana (' + kb(new Blob([css]).size) + ').', type: 'success' });
      }
    } catch (err) {
      if (window.MoliqueToast) MoliqueToast.show({ message: 'Błąd: ' + err.message, type: 'danger' });
      else alert('Błąd: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

/* ---------- Start ---------- */

fetch(MANIFEST_URL)
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then((m) => {
    manifest = m;
    selected = withDeps(PRESETS.landing.ids);
    render();
    bind();
    $('#builder-loading').remove();
  })
  .catch((err) => {
    $('#builder-loading').innerHTML =
      '<div class="alert alert-danger m-0"><strong>Nie udało się wczytać manifestu.</strong> ' +
      'Uruchom <code>npm run build</code> (generuje <code>dist/chunks/</code>). Szczegóły: ' +
      err.message + '</div>';
  });
