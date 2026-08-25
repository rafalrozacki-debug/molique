/**
 * molique - Table Live Search
 *
 * Filters the rows of a table as you type. Initialised by the autoloader
 * (initTableSearch), triggered by any input[data-search-target].
 *
 *   <input data-search-target="#tbodyId">
 *   <tbody id="tbodyId">
 *     <tr><td colspan="3" class="cheat-sheet-category">Section</td></tr>
 *     <tr data-tags="form input validation">…</tr>
 *
 * SEARCHES MORE THAN THE VISIBLE TEXT. A row also matches on its data-tags -
 * the words someone types when they know their problem but not the class name
 * ("centre", "wrap", "scroll"). Tags stay out of the markup's visible output,
 * so the table keeps its three columns.
 *
 * MATCHING, and why it is not a plain substring test. Polish (and German)
 * inflect on the suffix: a tag "wyśrodkowanie" is NOT a substring of the word
 * a user actually types, "wyśrodkować". So tags are stored as STEMS
 * ("wyśrodk") and a term matches a tag when either is a prefix of the other.
 * Visible text is still matched as a substring. Diacritics are stripped on
 * both sides, so "wysrodkowac" finds the same rows on a keyboard without
 * Polish characters.
 *
 * SECTION HEADERS. A header row is a <tr> that CONTAINS a cell with the
 * category class - the class sits on the <td colspan>, not on the <tr>. The
 * previous version queried 'tr.cheat-sheet-category', which matched nothing:
 * the hide-empty-section logic never ran at all, and headers only disappeared
 * because they were being filtered as if they were data rows.
 *
 * VISIBILITY uses the hidden attribute, not an inline display style - molique
 * enforces [hidden] { display: none !important } in its base layer, so it
 * cannot lose to a component that sets display.
 */

const TABLE_SEARCH_TEXT = {
  pl: { empty: 'Brak wyników dla', count: (n, total) => `${n} z ${total}` },
  en: { empty: 'No results for', count: (n, total) => `${n} of ${total}` },
  de: { empty: 'Keine Treffer für', count: (n, total) => `${n} von ${total}` },
};

/** lowercase, strip diacritics; ł/Ł have no combining form, hence the extra pass */
function normalizeTableSearch(value) {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function tableSearchTexts(lang) {
  return TABLE_SEARCH_TEXT[String(lang || '').slice(0, 2)] || TABLE_SEARCH_TEXT.en;
}

function isTableSearchCategoryRow(row) {
  return !!row.querySelector(':scope > .cheat-sheet-category') ||
    row.classList.contains('cheat-sheet-category');
}

/** One row's searchable haystack: visible text plus its tag stems. */
function indexTableSearchRow(row) {
  return {
    row,
    text: normalizeTableSearch(row.textContent),
    tags: normalizeTableSearch(row.dataset.tags || '')
      .split(/\s+/)
      .filter(Boolean),
  };
}

function tableSearchRowMatches(entry, terms) {
  return terms.every(
    (term) =>
      entry.text.includes(term) ||
      entry.tags.some(
        // either direction, so a stem finds every inflected form of the word
        (tag) => tag.startsWith(term) || (tag.length >= 3 && term.startsWith(tag))
      )
  );
}

/* ---------- one search input + its table ---------- */

function setupTableSearch(input) {
  const tableBody = document.querySelector(input.getAttribute('data-search-target'));
  if (!tableBody) return null;

  const texts = tableSearchTexts(document.documentElement.lang);
  const statusTarget = input.getAttribute('data-search-status');
  const status = statusTarget ? document.querySelector(statusTarget) : null;
  const emptyLabel = input.getAttribute('data-search-empty') || texts.empty;

  let categories = [];
  let entries = [];

  /** the "nothing found" row, created once and only when it is first needed */
  let emptyRow = null;
  function ensureEmptyRow() {
    if (emptyRow) return emptyRow;
    const firstRow = tableBody.querySelector('tr');
    const columns = firstRow ? firstRow.children.length : 1;
    emptyRow = document.createElement('tr');
    emptyRow.className = 'table-search-empty';
    const cell = document.createElement('td');
    cell.colSpan = columns;
    cell.className = 'text-center text-muted p-4';
    emptyRow.appendChild(cell);
    tableBody.appendChild(emptyRow);
    return emptyRow;
  }

  function reindex() {
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    categories = rows.filter(isTableSearchCategoryRow);
    entries = rows
      .filter((r) => !isTableSearchCategoryRow(r) && r !== emptyRow)
      .map(indexTableSearchRow);
  }

  function apply() {
    const query = normalizeTableSearch(input.value).trim();
    const terms = query.split(/\s+/).filter(Boolean);
    let visible = 0;

    for (const entry of entries) {
      const show = terms.length === 0 || tableSearchRowMatches(entry, terms);
      entry.row.hidden = !show;
      if (show) visible++;
    }

    // A section header stays only while something below it is still visible.
    for (const category of categories) {
      let next = category.nextElementSibling;
      let hasVisible = false;
      while (next && !isTableSearchCategoryRow(next)) {
        if (next !== emptyRow && !next.hidden) {
          hasVisible = true;
          break;
        }
        next = next.nextElementSibling;
      }
      category.hidden = !hasVisible;
    }

    // Empty state - without it, zero matches just left a blank table.
    if (terms.length && visible === 0) {
      const row = ensureEmptyRow();
      row.firstChild.textContent = emptyLabel + ' "' + input.value.trim() + '"';
      row.hidden = false;
    } else if (emptyRow) {
      emptyRow.hidden = true;
    }

    if (status) status.textContent = terms.length ? texts.count(visible, entries.length) : '';
  }

  reindex();
  input.addEventListener('input', apply);
  // Esc clears the field and restores every row
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !input.value) return;
    input.value = '';
    apply();
  });

  // Opt-in page hotkey (data-search-hotkey="/"). Opt-in on purpose: a
  // framework has no business claiming a key on every page that uses it, and
  // the shortcut must never fire while someone is typing somewhere else.
  const hotkey = input.getAttribute('data-search-hotkey');
  if (hotkey) {
    document.addEventListener('keydown', (event) => {
      if (event.key !== hotkey || event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active && active.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (active && active.isContentEditable)) return;
      event.preventDefault();
      input.focus();
      input.select();
    });
  }

  return { input, refresh: () => (reindex(), apply()), apply };
}

/* ---------- public surface ---------- */

const tableSearchInstances = [];

window.initTableSearch = function () {
  document.querySelectorAll('input[data-search-target]').forEach((input) => {
    if (tableSearchInstances.some((i) => i.input === input)) return;
    const instance = setupTableSearch(input);
    if (instance) tableSearchInstances.push(instance);
  });

  // Deep-linkable result: ?q=… pre-fills the FIRST search field on the page.
  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial && tableSearchInstances.length && !tableSearchInstances[0].input.value) {
    tableSearchInstances[0].input.value = initial;
    tableSearchInstances[0].apply();
  }
};

/**
 * Re-read the table after rows were added or removed at runtime.
 * MoliqueTableSearch.refresh()            - every search on the page
 * MoliqueTableSearch.refresh(inputEl)     - just that one
 */
window.MoliqueTableSearch = {
  refresh(input) {
    tableSearchInstances.filter((i) => !input || i.input === input).forEach((i) => i.refresh());
  },
};
