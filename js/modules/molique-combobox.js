/**
 * molique - keyboard and ARIA for a field with a list
 *
 * Shared by .select-search, .custom-select and .command-palette. The autoloader
 * brings it in next to them; there is nothing to call. Everything is delegated
 * from document, so options added later (AJAX) work without re-initialising.
 *
 * TWO PATTERNS, on purpose.
 *
 * .select-search and .command-palette are a combobox: DOM focus stays in the
 * field, so typing keeps working, and aria-activedescendant points at the
 * highlighted option. Their options are plain elements, which a keyboard could
 * not reach at all.
 *
 * .custom-select is a list of real checkboxes. Giving them role="option" would
 * erase what they are for a screen reader, so they stay checkboxes and the arrow
 * keys move real focus between them.
 *
 * Keys: Up and Down move and wrap, Home and End jump (in a field only while it is
 * empty, otherwise they belong to the caret), Enter picks, Esc is left to the
 * popover or dialog. Enter in a field never submits the surrounding form.
 *
 * API: window.MoliqueCombobox.refresh(field) after the list changed, with
 * { restart: true } after a new query, and the matcher: .normalize(text),
 * .matches({ text, tags }, terms).
 */

(() => {
  if (window.MoliqueCombobox) return;

  const LISTS = [
    {
      root: '.select-search',
      field: '.select-search-input',
      trigger: '.select-search-trigger',
      list: '.select-search-list',
      option: '.select-search-option',
      menu: '.select-search-menu',
    },
    {
      root: '.command-palette',
      field: '.command-palette-input',
      list: '.command-palette-list',
      option: '.command-palette-item',
      selectionFollowsHighlight: true,
    },
  ];

  const CHECKS = {
    root: '.custom-select',
    field: '.custom-select-search input',
    trigger: '.custom-select-trigger',
    box: '.custom-select-option input',
    menu: '.custom-select-dropdown',
  };

  let lastId = 0;
  const uid = (prefix) => `molique-${prefix}-${++lastId}`;

  /** lowercase, no diacritics; ł has no combining form, hence the extra pass */
  const normalize = (value) =>
    String(value).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '');

  /** The same rule as the table search: tags are stems, so a prefix either way counts. */
  const matches = (entry, terms) =>
    terms.every(
      (term) =>
        entry.text.includes(term) ||
        entry.tags.some((tag) => tag.startsWith(term) || (tag.length >= 3 && term.startsWith(tag)))
    );

  const usable = (el) =>
    !el.hidden &&
    !el.classList.contains('is-hidden') &&
    !el.closest('[hidden]') &&
    !el.hasAttribute('disabled') &&
    el.getAttribute('aria-disabled') !== 'true';

  const optionsOf = (root, w) => [...root.querySelectorAll(w.option)].filter(usable);
  const activeOf = (root, w) => root.querySelector(`${w.option}.is-active`);
  const hostOf = (root, w) => root.querySelector(w.field) || (w.trigger ? root.querySelector(w.trigger) : null);

  function isOpen(root, w) {
    if (!w.menu) return true;
    const menu = root.querySelector(w.menu);
    if (menu && menu.hasAttribute('popover')) return menu.matches(':popover-open');
    return root.hasAttribute('open'); // the <details> markup from before 1.5.0
  }

  function openMenu(root, w) {
    const menu = root.querySelector(w.menu);
    if (menu && menu.hasAttribute('popover')) menu.showPopover();
    else root.setAttribute('open', '');
  }

  function closeMenu(root, w) {
    const menu = root.querySelector(w.menu);
    if (menu && menu.hasAttribute('popover')) menu.hidePopover();
    else root.removeAttribute('open');
  }

  function describe(root, w) {
    const list = root.querySelector(w.list);
    const host = hostOf(root, w);
    if (!list || !host) return;
    if (!list.id) list.id = uid('list');
    list.setAttribute('role', 'listbox');
    root.querySelectorAll(w.option).forEach((option) => {
      if (!option.id) option.id = uid('option');
      option.setAttribute('role', 'option');
      option.tabIndex = -1;
      if (!w.selectionFollowsHighlight) {
        option.setAttribute('aria-selected', String(option.classList.contains('is-selected')));
      }
    });
    host.setAttribute('role', 'combobox');
    host.setAttribute('aria-controls', list.id);
    host.setAttribute('aria-haspopup', 'listbox');
    host.setAttribute('aria-expanded', String(isOpen(root, w)));
    if (host.matches('input')) host.setAttribute('aria-autocomplete', 'list');
    const trigger = w.trigger ? root.querySelector(w.trigger) : null;
    if (trigger && trigger !== host) trigger.setAttribute('aria-haspopup', 'listbox');
  }

  function highlight(root, w, option, { scroll = true } = {}) {
    const previous = activeOf(root, w);
    if (previous && previous !== option) {
      previous.classList.remove('is-active');
      if (w.selectionFollowsHighlight) previous.setAttribute('aria-selected', 'false');
    }
    const host = hostOf(root, w);
    if (!option) {
      if (host) host.removeAttribute('aria-activedescendant');
      return;
    }
    option.classList.add('is-active');
    if (w.selectionFollowsHighlight) option.setAttribute('aria-selected', 'true');
    if (host) host.setAttribute('aria-activedescendant', option.id);
    if (scroll) option.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Keeps the highlight if it survived, else starts at the top. `restart` is for a
   * new query: the best match comes first, so Enter has to mean the top of the list,
   * not a position left over from the previous search.
   */
  function settle(root, w, { restart = false } = {}) {
    describe(root, w);
    const options = optionsOf(root, w);
    const active = activeOf(root, w);
    if (restart) {
      highlight(root, w, options[0] || null);
      return;
    }
    if (active && options.includes(active)) {
      highlight(root, w, active);
      return;
    }
    highlight(root, w, options.find((o) => o.classList.contains('is-selected')) || options[0] || null);
  }

  const locate = (el) => {
    for (const w of LISTS) {
      const root = el.closest(w.root);
      if (root) return { root, w };
    }
    return null;
  };

  function step(root, w, delta) {
    const options = optionsOf(root, w);
    if (!options.length) return;
    const index = options.indexOf(activeOf(root, w));
    const next = index < 0 ? (delta > 0 ? 0 : options.length - 1) : (index + delta + options.length) % options.length;
    highlight(root, w, options[next]);
  }

  function pick(root, w) {
    const active = activeOf(root, w);
    if (active && usable(active)) active.click();
  }

  function onComboboxKey(e, root, w) {
    const onField = e.target.matches(w.field);
    const onTrigger = !!w.trigger && e.target.matches(w.trigger);
    if (!onField && !onTrigger) return;

    const open = isOpen(root, w);
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu(root, w);
      }
      return;
    }

    const emptyField = !onField || !e.target.value;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        step(root, w, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        step(root, w, -1);
        break;
      case 'Home':
      case 'End':
        if (!emptyField) return;
        e.preventDefault();
        {
          const options = optionsOf(root, w);
          highlight(root, w, e.key === 'Home' ? options[0] : options[options.length - 1]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        pick(root, w);
        break;
      case ' ':
        if (onField) return;
        e.preventDefault();
        pick(root, w);
        break;
      case 'Tab':
        if (w.menu) closeMenu(root, w);
        break;
      default:
    }
  }

  function onCheckKey(e, root) {
    const t = e.target;
    const field = root.querySelector(CHECKS.field);
    const onField = t === field;
    const onBox = t.matches(CHECKS.box);
    const onTrigger = t.matches(CHECKS.trigger);
    if (!onField && !onBox && !onTrigger) return;

    if (onTrigger) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isOpen(root, CHECKS)) {
        e.preventDefault();
        openMenu(root, CHECKS);
      }
      return;
    }

    const boxes = [...root.querySelectorAll(CHECKS.box)].filter(usable);
    const index = boxes.indexOf(t);
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    const go = (el) => {
      e.preventDefault();
      if (el) el.focus();
    };

    switch (e.key) {
      case 'ArrowDown':
        go(onField ? first : boxes[index + 1] || field || first);
        break;
      case 'ArrowUp':
        go(onField ? last : boxes[index - 1] || field || last);
        break;
      case 'Home':
        if (onBox) go(first);
        break;
      case 'End':
        if (onBox) go(last);
        break;
      case 'Enter':
        e.preventDefault();
        if (onBox) t.click();
        else if (first) first.click();
        break;
      default:
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!e.target.closest) return;
    const checks = e.target.closest(CHECKS.root);
    if (checks) {
      onCheckKey(e, checks);
      return;
    }
    const found = locate(e.target);
    if (found) onComboboxKey(e, found.root, found.w);
  });

  // toggle does not bubble, so delegation needs the capture phase.
  document.addEventListener(
    'toggle',
    (e) => {
      if (!e.target.closest) return;
      const checks = e.target.closest(CHECKS.root);
      if (checks && e.target.matches(CHECKS.menu)) {
        const boxes = checks.querySelectorAll(CHECKS.box);
        // Without a search field nothing takes the focus, so the keys would stay on the trigger.
        if (e.newState === 'open' && !checks.querySelector(CHECKS.field) && boxes.length) boxes[0].focus({ preventScroll: true });
        return;
      }
      const found = locate(e.target);
      if (!found || !found.w.menu) return;
      const isMenu = e.target.matches(found.w.menu) || e.target === found.root;
      if (!isMenu) return;
      if (isOpen(found.root, found.w)) settle(found.root, found.w);
      else {
        describe(found.root, found.w);
        highlight(found.root, found.w, null);
      }
    },
    true
  );

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !e.target.closest) return;
    for (const w of LISTS) {
      const option = e.target.closest(w.option);
      if (option && !option.classList.contains('is-active') && usable(option)) {
        const root = option.closest(w.root);
        if (root) highlight(root, w, option, { scroll: false });
        return;
      }
    }
  });

  window.MoliqueCombobox = {
    normalize,
    matches,
    refresh(el, options) {
      const found = el && el.closest ? locate(el) : null;
      if (found) settle(found.root, found.w, options);
    },
  };
})();
