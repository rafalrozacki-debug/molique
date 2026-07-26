/**
 * molique - Theme Editor (żywy edytor zmiennych CSS)
 *
 * Steruje zmiennymi CSS na żywo (document.documentElement) i eksportuje
 * gotowy blok :root { ... } / [data-theme="dark"] { ... } do wklejenia.
 *
 * Kluczowe decyzje:
 *  - Nadpisania trzymamy w <style id="te-overrides">, NIE w stylu inline -
 *    dzięki temu poprawnie działa kaskada light/dark (inline nadpisałby oba).
 *  - Zmienne "odwracalne" (paleta, tła) edytujemy w AKTYWNYM motywie: light
 *    trafia do :root, dark do [data-theme="dark"]. Zmienne niezależne od
 *    motywu (sidebar, radius, spacing, typografia) zawsze do :root.
 *  - Pary -rgb wyliczamy z hexa automatycznie; kolory -hover przyciemniamy.
 *
 * Konfiguracja kontrolek siedzi w HTML (atrybuty data-te-*), więc moduł jest
 * generyczny. Zero zależności, zero jQuery.
 */

// Ten sam plik JS ląduje na stronie PL/EN/DE, więc teksty toastów nie mogą
// być zaszyte na sztywno - czytamy jezyk z <html lang> (ten sam wzorzec co
// molique-lang-suggest.js) i wybieramy z malego slownika.
const TE_LANG = document.documentElement.lang;
const TE_STRINGS = {
  noChanges: { pl: 'Brak zmian do skopiowania', en: 'No changes to copy', de: 'Keine Änderungen zum Kopieren' },
  copied: { pl: 'Skopiowano CSS motywu', en: 'Theme CSS copied', de: 'Theme-CSS kopiert' },
  reset: { pl: 'Przywrócono domyślny motyw', en: 'Default theme restored', de: 'Standard-Theme wiederhergestellt' },
  dark: { pl: 'Ciemny', en: 'Dark', de: 'Dunkel' },
  light: { pl: 'Jasny', en: 'Light', de: 'Hell' },
};
const teT = (key) => TE_STRINGS[key][TE_LANG] || TE_STRINGS[key].en;

function initThemeEditor() {
  const root = document.querySelector('.theme-editor');
  if (!root) return;

  const html = document.documentElement;
  const STORAGE_KEY = 'molique-theme-editor';
  const controls = Array.from(root.querySelectorAll('[data-te-var]'));

  // Kazdy control ma OBOK siebie w tym samym .te-row czytelny opis
  // (<span class="te-label">), ale to nie jest prawdziwy <label> powiazany
  // przez for/id - bez tego czytnik ekranu nie wie, czym steruje dany
  // input[type=color]/input[type=range] itd. Ustawiamy aria-label z tekstu
  // tego opisu zamiast recznie dopisywac dziesiatki id/for w HTML.
  controls.forEach((control) => {
    if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')) return;
    const row = control.closest('.te-row');
    const label = row && row.querySelector('.te-label');
    if (label && label.textContent.trim()) {
      control.setAttribute('aria-label', label.textContent.trim());
    }
  });

  const overrides = load();

  const styleEl = document.createElement('style');
  styleEl.id = 'te-overrides';
  document.head.appendChild(styleEl);

  const mode = () => (html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  /* --- Domyślny hover przycisków (klasa na <body>, poza mechanizmem zmiennych) --- */
  const BTN_HOVER_KEY = 'molique-theme-editor-btnhover';
  const BTN_HOVER_CLASSES = ['btn-hover-spring', 'btn-hover-lift', 'btn-hover-glow'];
  const btnHoverSel = root.querySelector('[data-te-btn-hover]');
  let btnHover = '';
  try { btnHover = localStorage.getItem(BTN_HOVER_KEY) || ''; } catch (e) { /* ignore */ }
  const applyBtnHover = (val) => {
    BTN_HOVER_CLASSES.forEach((c) => document.body.classList.remove(c));
    if (val) document.body.classList.add(val);
    btnHover = val;
  };

  /* Odwracalna zmienna edytowana w dark => blok [data-theme="dark"];
     reszta (w tym light) => :root. */
  const bucketFor = (control) =>
    control.dataset.teScope === 'mode' && mode() === 'dark' ? overrides.dark : overrides.light;

  function setVar(control) {
    const name = control.dataset.teVar;
    const bucket = bucketFor(control);

    let value;
    if (control.dataset.teType === 'color') {
      value = normalizeHex(control.value) || control.value;
      bucket[name] = value;
      if (control.dataset.teRgb) bucket[control.dataset.teRgb] = hexToRgb(value);
      if (control.dataset.teHover) bucket[control.dataset.teHover] = darken(value, 0.12);
    } else {
      value = control.value + (control.dataset.teUnit || '');
      bucket[name] = value;
    }

    applyOverrides();
    updateOutput(control);
    save();
  }

  function applyOverrides() {
    const block = (selector, obj) => {
      const keys = Object.keys(obj);
      if (!keys.length) return '';
      const lines = keys.map((k) => '  ' + k + ': ' + obj[k] + ';').join('\n');
      return selector + ' {\n' + lines + '\n}\n';
    };
    styleEl.textContent = block(':root', overrides.light) + block('[data-theme="dark"]', overrides.dark);
  }

  /* Ustawia kontrolki na aktualnie wyliczone wartości (dla aktywnego motywu). */
  function syncControls() {
    const cs = getComputedStyle(html);
    controls.forEach((control) => {
      const raw = cs.getPropertyValue(control.dataset.teVar).trim();
      if (control.dataset.teType === 'color') {
        const hex = normalizeHex(raw);
        if (hex) control.value = hex;
      } else {
        const num = parseFloat(raw);
        if (!isNaN(num)) control.value = String(num);
      }
      updateOutput(control);
    });
  }

  function updateOutput(control) {
    if (control.dataset.teType !== 'range') return;
    const out = control.parentElement.querySelector('.te-output');
    if (out) out.textContent = control.value + (control.dataset.teUnit || '');
  }

  function updateModeHint() {
    const hint = root.querySelector('[data-te-mode-label]');
    if (hint) hint.textContent = mode() === 'dark' ? teT('dark') : teT('light');
  }

  function buildExport() {
    const block = (selector, obj) => {
      const keys = Object.keys(obj);
      if (!keys.length) return '';
      const lines = keys.map((k) => '  ' + k + ': ' + obj[k] + ';').join('\n');
      return selector + ' {\n' + lines + '\n}';
    };
    const css = [block(':root', overrides.light), block('[data-theme="dark"]', overrides.dark)]
      .filter(Boolean)
      .join('\n\n');
    const hint = btnHover
      ? '/* Domyślny hover przycisków - dodaj klasę do <body>: */\n/* <body class="' + btnHover + '"> */'
      : '';
    return [css, hint].filter(Boolean).join('\n\n');
  }

  /* --- Akcje: Kopiuj / Reset --- */
  const copyBtn = document.querySelector('[data-te-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const css = buildExport();
      if (!css) {
        toast(teT('noChanges'), 'info');
        return;
      }
      copyText(css).then(() => toast(teT('copied'), 'success'));
    });
  }

  const resetBtn = document.querySelector('[data-te-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      overrides.light = {};
      overrides.dark = {};
      applyOverrides();
      save();
      syncControls();
      applyBtnHover('');
      if (btnHoverSel) btnHoverSel.value = '';
      try { localStorage.removeItem(BTN_HOVER_KEY); } catch (e) { /* ignore */ }
      toast(teT('reset'), 'info');
    });
  }

  /* --- Wpięcia --- */
  controls.forEach((control) => {
    control.addEventListener('input', () => setVar(control));
  });

  if (btnHoverSel) {
    btnHoverSel.value = btnHover;
    btnHoverSel.addEventListener('change', () => {
      applyBtnHover(btnHoverSel.value);
      try { localStorage.setItem(BTN_HOVER_KEY, btnHoverSel.value); } catch (e) { /* ignore */ }
    });
  }

  /* Przełączenie motywu (checkbox #theme-toggle z rdzenia) zmienia data-theme
     na <html> - obserwujemy i przeładowujemy kontrolki na wartości motywu. */
  new MutationObserver(() => {
    updateModeHint();
    syncControls();
  }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  applyOverrides();
  syncControls();
  updateModeHint();
  applyBtnHover(btnHover);

  /* ============ pomocnicze ============ */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { light: parsed.light || {}, dark: parsed.dark || {} };
      }
    } catch (e) { /* ignore */ }
    return { light: {}, dark: {} };
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch (e) { /* ignore */ }
  }
}

function normalizeHex(value) {
  if (!value) return null;
  let h = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
  if (/^[0-9a-fA-F]{6}$/.test(h)) return '#' + h.toLowerCase();
  return null;
}

function hexToRgb(hex) {
  const h = normalizeHex(hex);
  if (!h) return '0, 0, 0';
  const int = parseInt(h.slice(1), 16);
  return ((int >> 16) & 255) + ', ' + ((int >> 8) & 255) + ', ' + (int & 255);
}

function darken(hex, amount) {
  const h = normalizeHex(hex);
  if (!h) return hex;
  const int = parseInt(h.slice(1), 16);
  const f = Math.max(0, 1 - amount);
  const r = Math.round(((int >> 16) & 255) * f);
  const g = Math.round(((int >> 8) & 255) * f);
  const b = Math.round((int & 255) * f);
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
    resolve();
  });
}

function toast(message, type) {
  if (window.MoliqueToast) window.MoliqueToast.show({ message: message, type: type });
}

window.initThemeEditor = initThemeEditor;
