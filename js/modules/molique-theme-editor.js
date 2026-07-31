/**
 * molique - Theme Editor (live CSS variable editor)
 *
 * Controls CSS variables live (document.documentElement) and exports a
 * ready-to-paste :root { ... } / [data-theme="dark"] { ... } block.
 *
 * Key decisions:
 *  - Overrides are kept in a <style id="te-overrides">, NOT in an inline
 *    style - this is what makes the light/dark cascade work correctly
 *    (inline would override both).
 *  - "Invertible" variables (palette, backgrounds) are edited in the
 *    ACTIVE theme: light goes into :root, dark into [data-theme="dark"].
 *    Theme-independent variables (sidebar, radius, spacing, typography)
 *    always go into :root.
 *  - -rgb pairs are computed from the hex automatically; -hover colors are darkened.
 *
 * Control configuration lives in the HTML (data-te-* attributes), so the
 * module stays generic. Zero dependencies, zero jQuery.
 */

// The same JS file loads on the PL/EN/DE site, so toast text can't be
// hardcoded - we read the language from <html lang> (the same pattern as
// molique-lang-suggest.js) and pick from a small dictionary.
const TE_LANG = document.documentElement.lang;
const TE_STRINGS = {
  noChanges: { pl: 'Brak zmian do skopiowania', en: 'No changes to copy', de: 'Keine Änderungen zum Kopieren' },
  copied: { pl: 'Skopiowano CSS motywu', en: 'Theme CSS copied', de: 'Theme-CSS kopiert' },
  reset: { pl: 'Przywrócono domyślny motyw', en: 'Default theme restored', de: 'Standard-Theme wiederhergestellt' },
  dark: { pl: 'Ciemny', en: 'Dark', de: 'Dunkel' },
  light: { pl: 'Jasny', en: 'Light', de: 'Hell' },
  presetApplied: { pl: 'Zastosowano paletę', en: 'Palette applied', de: 'Palette angewendet' },
};
const teT = (key) => TE_STRINGS[key][TE_LANG] || TE_STRINGS[key].en;

/**
 * Ready-made palettes (the "Ready-made palettes" button in the editor) -
 * set BOTH themes at once (unlike manual editing, which only touches the
 * currently visible theme), since a preset only makes sense as a
 * complete, deliberate light/dark pair, not separate cases.
 *
 * DELIBERATELY doesn't touch --success/--danger/--warning/--info:
 * semantic colors (the "went well/badly" status) stay shared across all
 * palettes, only the brand identity changes (primary, secondary,
 * backgrounds, border, text) - just like in the reference mockup these
 * values come from (there too, success/danger/warning/info were defined
 * ONCE, globally, outside the individual themes).
 *
 * "Secondary" in each preset is the value described in the source as
 * "Accent" (the second, more distinctive brand color) - the molique
 * editor has no separate "Accent" control, and a shared, neutral gray
 * across all 4 palettes would look less distinguishable in a quick
 * preview than the very thing presets are reached for.
 */
const TE_PRESETS = {
  premium: {
    light: {
      '--primary': '#18181b', '--primary-rgb': '24, 24, 27', '--primary-hover': '#151518',
      '--secondary': '#52525b', '--secondary-rgb': '82, 82, 91', '--secondary-hover': '#48484f',
      '--bg-body': '#f6f6f6', '--body-rgb': '246, 246, 246',
      '--bg-surface': '#ffffff', '--bg-surface-rgb': '255, 255, 255',
      '--border-color': '#e4e4e7',
      '--dark': '#09090b', '--dark-rgb': '9, 9, 11',
      '--light': '#ffffff', '--light-rgb': '255, 255, 255',
    },
    dark: {
      '--primary': '#fafafa', '--primary-rgb': '250, 250, 250', '--primary-hover': '#fbfbfb',
      '--secondary': '#a1a1aa', '--secondary-rgb': '161, 161, 170', '--secondary-hover': '#afafb7',
      '--bg-body': '#09090b', '--body-rgb': '9, 9, 11',
      '--bg-surface': '#1d1d1f', '--bg-surface-rgb': '29, 29, 31',
      '--border-color': '#27272a',
      '--dark': '#fafafa', '--dark-rgb': '250, 250, 250',
      '--light': '#1d1d1f', '--light-rgb': '29, 29, 31',
    },
  },
  eco: {
    light: {
      '--primary': '#0f766e', '--primary-rgb': '15, 118, 110', '--primary-hover': '#0d6861',
      '--secondary': '#047857', '--secondary-rgb': '4, 120, 87', '--secondary-hover': '#046a4d',
      '--bg-body': '#f1f1f0', '--body-rgb': '241, 241, 240',
      '--bg-surface': '#fafaf9', '--bg-surface-rgb': '250, 250, 249',
      '--border-color': '#e7e5e4',
      '--dark': '#112217', '--dark-rgb': '17, 34, 23',
      '--light': '#fafaf9', '--light-rgb': '250, 250, 249',
    },
    dark: {
      '--primary': '#2dd4bf', '--primary-rgb': '45, 212, 191', '--primary-hover': '#4ddac9',
      '--secondary': '#34d399', '--secondary-rgb': '52, 211, 153', '--secondary-hover': '#52daa8',
      '--bg-body': '#0b0f0d', '--body-rgb': '11, 15, 13',
      '--bg-surface': '#1f2220', '--bg-surface-rgb': '31, 34, 32',
      '--border-color': '#1c2720',
      '--dark': '#f0fdf4', '--dark-rgb': '240, 253, 244',
      '--light': '#1f2220', '--light-rgb': '31, 34, 32',
    },
  },
  terra: {
    light: {
      '--primary': '#a14227', '--primary-rgb': '161, 66, 39', '--primary-hover': '#8e3a22',
      '--secondary': '#b45309', '--secondary-rgb': '180, 83, 9', '--secondary-hover': '#9e4908',
      '--bg-body': '#f3f1ee', '--body-rgb': '243, 241, 238',
      '--bg-surface': '#fcfaf7', '--bg-surface-rgb': '252, 250, 247',
      '--border-color': '#eadecd',
      '--dark': '#1f1815', '--dark-rgb': '31, 24, 21',
      '--light': '#fcfaf7', '--light-rgb': '252, 250, 247',
    },
    dark: {
      '--primary': '#f08c71', '--primary-rgb': '240, 140, 113', '--primary-hover': '#f29d86',
      '--secondary': '#fbbf24', '--secondary-rgb': '251, 191, 36', '--secondary-hover': '#fcc945',
      '--bg-body': '#120e0c', '--body-rgb': '18, 14, 12',
      '--bg-surface': '#25211f', '--bg-surface-rgb': '37, 33, 31',
      '--border-color': '#2e231e',
      '--dark': '#fcfbfa', '--dark-rgb': '252, 251, 250',
      '--light': '#25211f', '--light-rgb': '37, 33, 31',
    },
  },
  cyber: {
    light: {
      '--primary': '#0e7490', '--primary-rgb': '14, 116, 144', '--primary-hover': '#0c667f',
      '--secondary': '#0369a1', '--secondary-rgb': '3, 105, 161', '--secondary-hover': '#035c8e',
      '--bg-body': '#e8f0f1', '--body-rgb': '232, 240, 241',
      '--bg-surface': '#f0f9fa', '--bg-surface-rgb': '240, 249, 250',
      '--border-color': '#cffafe',
      '--dark': '#0b1c1e', '--dark-rgb': '11, 28, 30',
      '--light': '#f0f9fa', '--light-rgb': '240, 249, 250',
    },
    dark: {
      '--primary': '#22d3ee', '--primary-rgb': '34, 211, 238', '--primary-hover': '#43daf1',
      '--secondary': '#2dd4bf', '--secondary-rgb': '45, 212, 191', '--secondary-hover': '#4ddac9',
      '--bg-body': '#040b0d', '--body-rgb': '4, 11, 13',
      '--bg-surface': '#181f20', '--bg-surface-rgb': '24, 31, 32',
      '--border-color': '#164e63',
      '--dark': '#e0f7fa', '--dark-rgb': '224, 247, 250',
      '--light': '#181f20', '--light-rgb': '24, 31, 32',
    },
  },
};

function initThemeEditor() {
  const root = document.querySelector('.theme-editor');
  if (!root) return;

  const html = document.documentElement;
  const STORAGE_KEY = 'molique-theme-editor';
  const controls = Array.from(root.querySelectorAll('[data-te-var]'));

  // Every control has a readable description right next to it in the
  // same .te-row (<span class="te-label">), but it isn't a real <label>
  // linked via for/id - without this a screen reader doesn't know what a
  // given input[type=color]/input[type=range] etc. controls. We set an
  // aria-label from that description's text instead of hand-adding
  // dozens of id/for pairs in the HTML.
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

  /* --- Default button hover (a class on <body>, outside the variable mechanism) --- */
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

  /* An invertible variable edited in dark => the [data-theme="dark"] block;
     everything else (including light) => :root. */
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

  /* Sets the controls to the currently computed values (for the active theme). */
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
      ? '/* Default button hover - add the class to <body>: */\n/* <body class="' + btnHover + '"> */'
      : '';
    return [css, hint].filter(Boolean).join('\n\n');
  }

  /* --- Actions: Copy / Reset --- */
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

  /* --- Wiring up --- */
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

  /* --- Ready-made palettes --- */
  root.querySelectorAll('[data-te-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = TE_PRESETS[btn.dataset.tePreset];
      if (!preset) return;
      Object.assign(overrides.light, preset.light);
      Object.assign(overrides.dark, preset.dark);
      applyOverrides();
      syncControls();
      save();
      toast(teT('presetApplied'), 'success');
    });
  });

  /* Switching the theme (the core's #theme-toggle checkbox) changes
     data-theme on <html> - we observe it and reload the controls to the theme's values. */
  new MutationObserver(() => {
    updateModeHint();
    syncControls();
  }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  applyOverrides();
  syncControls();
  updateModeHint();
  applyBtnHover(btnHover);

  /* ============ helpers ============ */
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
