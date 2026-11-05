/**
 * molique - command palette
 *
 * A search field with a list of results in a native <dialog>: the top layer, the
 * focus trap, Esc and the return of focus to the opener all come from the browser.
 * Keyboard and ARIA of the list live in molique-combobox.js, which the autoloader
 * brings in alongside this file.
 *
 *   <button data-command-palette-open="#palette">Szukaj</button>
 *   <dialog class="command-palette" id="palette" data-command-palette-hotkey="k">
 *     <div class="command-palette-header">
 *       <input class="command-palette-input" placeholder="Szukaj...">
 *     </div>
 *     <div class="command-palette-list">
 *       <div class="command-palette-group">
 *         <div class="command-palette-group-label">Strony</div>
 *         <a class="command-palette-item" href="/klienci" data-tags="kontrahen firm">Klienci</a>
 *       </div>
 *     </div>
 *   </dialog>
 *
 * Items in the HTML are filtered on the spot: without diacritics, by visible text
 * and by data-tags stems, like the table search.
 *
 * RESULTS FROM A SERVER come through an event, not a function to call, so the
 * listener can be attached at any time, before this file has even loaded. It is
 * the same contract as sortable:update: molique has no backend.
 *
 *   document.addEventListener('command:search', (e) => {
 *     const { query, signal, respond } = e.detail;
 *     respond(fetch(`/search?q=${encodeURIComponent(query)}`, { signal }).then((r) => r.json()));
 *   });
 *
 * respond() takes an array or a Promise of one: { label, href?, meta?, group?,
 * value? }. Everything lands in the page through textContent, and an href that is
 * not http(s) is dropped, so a record named <img onerror=...> stays a name. A newer
 * query aborts the signal and a late answer to an older one is ignored.
 *
 * Attributes on the dialog: data-command-palette-hotkey="k" (Ctrl/Cmd + key, opt-in
 * because a framework has no business claiming a key), -min (2 characters before
 * asking the server), -debounce (200 ms), -empty (the empty-state text).
 *
 * command:select fires on the dialog when an item is chosen, with { item, value,
 * label, query, result }. preventDefault() stops the link from being followed.
 *
 * API: window.MoliqueCommandPalette.open(target) and .close(target).
 */

(() => {
  if (window.MoliqueCommandPalette) return;

  const TEXT = {
    pl: { empty: 'Brak wyników dla', loading: 'Szukam...', error: 'Nie udało się pobrać wyników', close: 'Zamknij', count: (n) => `Wyniki: ${n}` },
    en: { empty: 'No results for', loading: 'Searching...', error: 'Could not load the results', close: 'Close', count: (n) => `Results: ${n}` },
    de: { empty: 'Keine Treffer für', loading: 'Suche läuft...', error: 'Ergebnisse konnten nicht geladen werden', close: 'Schließen', count: (n) => `Treffer: ${n}` },
  };
  const texts = () => TEXT[String(document.documentElement.lang || '').slice(0, 2)] || TEXT.en;

  const states = new WeakMap();
  const results = new WeakMap(); // item -> the result object it was built from

  const resolve = (target) => (typeof target === 'string' ? document.querySelector(target) : target);
  const numberAttr = (dialog, name, fallback) => {
    const value = parseInt(dialog.getAttribute(name), 10);
    return Number.isNaN(value) ? fallback : value;
  };

  function stateOf(dialog) {
    if (states.has(dialog)) return states.get(dialog);
    const input = dialog.querySelector('.command-palette-input');
    const list = dialog.querySelector('.command-palette-list');
    if (!input || !list) return null;

    const remote = document.createElement('div');
    remote.className = 'command-palette-remote';
    list.appendChild(remote);

    const message = document.createElement('p');
    message.className = 'command-palette-empty';
    message.hidden = true;
    list.after(message);

    // A phone has no Esc, and a full-screen palette leaves no backdrop to tap: without
    // this button the only way out would be to choose something.
    if (!dialog.querySelector('.command-palette-close')) {
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'command-palette-close';
      closeButton.textContent = texts().close;
      input.after(closeButton);
    }

    const status = document.createElement('div');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    dialog.appendChild(status);

    if (!input.hasAttribute('aria-label') && input.placeholder) input.setAttribute('aria-label', input.placeholder);
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    const state = { input, list, remote, message, status, timer: 0, controller: null, token: 0, busy: false, failed: false };
    states.set(dialog, state);
    labelGroups(list);
    return state;
  }

  function labelGroups(scope) {
    scope.querySelectorAll('.command-palette-group').forEach((group) => {
      const label = group.querySelector('.command-palette-group-label');
      group.setAttribute('role', 'group');
      if (!label) return;
      if (!label.id) label.id = `molique-palette-group-${Math.random().toString(36).slice(2, 9)}`;
      group.setAttribute('aria-labelledby', label.id);
    });
  }

  function safeHref(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function buildItem(result) {
    const href = safeHref(result.href);
    const item = document.createElement(href ? 'a' : 'button');
    item.className = 'command-palette-item';
    if (href) item.href = href;
    else item.type = 'button';
    if (result.value !== undefined && result.value !== null) item.dataset.value = String(result.value);

    const label = document.createElement('span');
    label.className = 'command-palette-item-label';
    label.textContent = String(result.label ?? '');
    item.appendChild(label);

    if (result.meta) {
      const meta = document.createElement('span');
      meta.className = 'command-palette-item-meta';
      meta.textContent = String(result.meta);
      item.appendChild(meta);
    }
    results.set(item, result);
    return item;
  }

  function renderResults(state, list) {
    const groups = new Map();
    for (const result of list) {
      if (!result || typeof result !== 'object' || !result.label) continue;
      const name = result.group ? String(result.group) : '';
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(result);
    }
    const nodes = [];
    for (const [name, items] of groups) {
      const group = document.createElement('div');
      group.className = 'command-palette-group';
      if (name) {
        const label = document.createElement('div');
        label.className = 'command-palette-group-label';
        label.textContent = name;
        group.appendChild(label);
      }
      items.forEach((result) => group.appendChild(buildItem(result)));
      nodes.push(group);
    }
    state.remote.replaceChildren(...nodes);
    labelGroups(state.remote);
  }

  function visibleItems(state) {
    return [...state.list.querySelectorAll('.command-palette-item')].filter((item) => !item.hidden);
  }

  function show(dialog, state, options) {
    const count = visibleItems(state).length;
    const query = state.input.value.trim();
    const t = texts();

    let text = '';
    if (state.failed) text = t.error;
    else if (state.busy && count === 0) text = t.loading;
    else if (count === 0 && query) text = `${dialog.getAttribute('data-command-palette-empty') || t.empty} "${query}"`;

    state.message.textContent = text;
    state.message.hidden = !text;
    state.list.hidden = count === 0;
    state.list.setAttribute('aria-busy', String(state.busy));
    dialog.classList.toggle('is-loading', state.busy);
    state.status.textContent = state.busy ? t.loading : text || t.count(count);
    if (window.MoliqueCombobox) window.MoliqueCombobox.refresh(state.input, options);
  }

  function filterStatic(state, query) {
    const combobox = window.MoliqueCombobox;
    const normalize = combobox ? combobox.normalize : (v) => String(v).toLowerCase();
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    state.list.querySelectorAll('.command-palette-item').forEach((item) => {
      if (state.remote.contains(item)) return;
      const entry = {
        text: normalize(item.textContent),
        tags: normalize(item.dataset.tags || '').split(/\s+/).filter(Boolean),
      };
      item.hidden = terms.length > 0 && !(combobox ? combobox.matches(entry, terms) : entry.text.includes(terms.join(' ')));
    });
    state.list.querySelectorAll('.command-palette-group').forEach((group) => {
      if (state.remote.contains(group)) return;
      group.hidden = !group.querySelector('.command-palette-item:not([hidden])');
    });
  }

  function cancelSearch(state) {
    clearTimeout(state.timer);
    if (state.controller) state.controller.abort();
    state.controller = null;
    state.busy = false;
    state.failed = false;
    state.token += 1;
    return state.token;
  }

  function askServer(dialog, state, query, token) {
    const controller = new AbortController();
    state.controller = controller;

    const respond = (answer) => {
      if (token !== state.token) return;
      state.busy = true;
      show(dialog, state);
      Promise.resolve(answer).then(
        (list) => {
          if (token !== state.token) return;
          state.busy = false;
          renderResults(state, Array.isArray(list) ? list : []);
          show(dialog, state);
        },
        (error) => {
          if (token !== state.token || (error && error.name === 'AbortError')) return;
          state.busy = false;
          state.failed = true;
          show(dialog, state);
        }
      );
    };

    dialog.dispatchEvent(
      new CustomEvent('command:search', { bubbles: true, detail: { query, signal: controller.signal, respond } })
    );
  }

  function update(dialog) {
    const state = stateOf(dialog);
    if (!state) return;
    const query = state.input.value.trim();
    const token = cancelSearch(state);
    filterStatic(state, query);
    if (query.length >= numberAttr(dialog, 'data-command-palette-min', 2)) {
      state.timer = setTimeout(
        () => askServer(dialog, state, query, token),
        numberAttr(dialog, 'data-command-palette-debounce', 200)
      );
    } else {
      state.remote.replaceChildren();
    }
    // Only here, on a new query. Results arriving later must not take the highlight
    // away from an item the arrow keys have already reached.
    show(dialog, state, { restart: true });
  }

  function open(target) {
    const dialog = resolve(target);
    if (!dialog || dialog.open || !dialog.matches('.command-palette')) return;
    const state = stateOf(dialog);
    if (!state) return;
    update(dialog);
    dialog.showModal();
    state.input.focus();
  }

  function close(target) {
    const dialog = resolve(target);
    if (dialog && dialog.open) dialog.close();
  }

  function choose(item, event) {
    const dialog = item.closest('.command-palette');
    if (!dialog) return;
    const state = stateOf(dialog);
    const label = item.querySelector('.command-palette-item-label');
    const allowed = dialog.dispatchEvent(
      new CustomEvent('command:select', {
        bubbles: true,
        cancelable: true,
        detail: {
          item,
          value: item.dataset.value ?? '',
          label: (label || item).textContent.trim(),
          query: state ? state.input.value.trim() : '',
          result: results.get(item) || null,
        },
      })
    );
    if (!allowed) event.preventDefault();
    dialog.close();
  }

  function clickedOutside(dialog, e) {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest) return;
    const opener = e.target.closest('[data-command-palette-open]');
    if (opener) {
      e.preventDefault();
      open(opener.getAttribute('data-command-palette-open'));
      return;
    }
    const item = e.target.closest('.command-palette-item');
    if (item) {
      choose(item, e);
      return;
    }
    const closeButton = e.target.closest('.command-palette-close');
    if (closeButton) {
      closeButton.closest('.command-palette').close();
      return;
    }
    // A click on ::backdrop is reported on the dialog itself.
    if (e.target.matches('.command-palette') && clickedOutside(e.target, e)) e.target.close();
  });

  document.addEventListener('input', (e) => {
    const input = e.target.closest ? e.target.closest('.command-palette-input') : null;
    if (input) update(input.closest('.command-palette'));
  });

  // The next opening starts clean whichever way this one ended. close does not bubble.
  document.addEventListener(
    'close',
    (e) => {
      if (!e.target.matches || !e.target.matches('.command-palette')) return;
      const state = states.get(e.target);
      if (!state) return;
      state.input.value = '';
      update(e.target);
    },
    true
  );

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || !e.key) return;
    const key = e.key.toLowerCase();
    const dialog = [...document.querySelectorAll('.command-palette[data-command-palette-hotkey]')].find(
      (d) => d.getAttribute('data-command-palette-hotkey').toLowerCase() === key
    );
    if (!dialog || (e.target && e.target.isContentEditable)) return;
    // Over another open dialog the shortcut would stack a second modal on it.
    if (!dialog.open && document.querySelector('dialog[open]')) return;
    e.preventDefault();
    if (dialog.open) dialog.close();
    else open(dialog);
  });

  window.MoliqueCommandPalette = { open, close };
})();
