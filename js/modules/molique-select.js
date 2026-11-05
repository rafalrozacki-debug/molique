/**
 * molique - Searchable Select (Combobox) module
 *
 * The menu is a popover (Popover API, top layer) - opening via the
 * [popovertarget] button, closing on Esc and a click outside the menu
 * (light dismiss) are all handled natively by the browser. JS is only
 * responsible for: filtering options, handling selection, and writing
 * the value into the hidden field for the backend.
 *
 * Backward compatibility: markup based on <details class="select-search">
 * (pre-1.5.0 versions) is still supported - in that case closing happens
 * by removing the [open] attribute and listening for clicks outside the component.
 *
 * Event delegation (input/click on document) instead of attaching a
 * listener per option at startup: this also works for options added to
 * the DOM AFTER the page loads (e.g. a calendar streaming in a client
 * list via AJAX) - without this, the module would need to be manually
 * re-initialized after every such change.
 *
 * Also filters the search field of .custom-select. Keyboard and ARIA of both live
 * in molique-combobox.js.
 */

// Called at event time, so it does not matter which of the two modules loaded first.
const selectSearchNormalize = (value) =>
  window.MoliqueCombobox ? window.MoliqueCombobox.normalize(value) : String(value).toLowerCase();

function filterSelectSearch(select, value) {
  const term = selectSearchNormalize(value);
  select.querySelectorAll('.select-search-option').forEach(option => {
    option.classList.toggle('is-hidden', !selectSearchNormalize(option.textContent).includes(term));
  });
}

// Goes through the rows in order, so a category heading stays only while
// something below it does.
function filterCustomSelect(select, value) {
  const term = selectSearchNormalize(value);
  let heading = null;
  let headingUsed = false;
  const closeHeading = () => {
    if (heading) heading.hidden = !headingUsed;
  };
  select.querySelectorAll('.custom-select-category, .custom-select-option').forEach(row => {
    if (row.classList.contains('custom-select-category')) {
      closeHeading();
      heading = row;
      headingUsed = false;
      return;
    }
    row.hidden = !selectSearchNormalize(row.textContent).includes(term);
    if (!row.hidden) headingUsed = true;
  });
  closeHeading();
}

document.addEventListener('input', (e) => {
  if (!e.target.closest) return;
  const searchInput = e.target.closest('.select-search-input');
  if (searchInput) {
    const select = searchInput.closest('.select-search');
    if (!select) return;
    filterSelectSearch(select, searchInput.value);
    if (window.MoliqueCombobox) window.MoliqueCombobox.refresh(searchInput, { restart: true });
    return;
  }
  const customField = e.target.closest('.custom-select-search input');
  if (customField) filterCustomSelect(customField.closest('.custom-select'), customField.value);
});

document.addEventListener('click', (e) => {
  const option = e.target.closest('.select-search-option');
  if (!option) return;

  const select = option.closest('.select-search');
  if (!select) return;

  const menu = select.querySelector('.select-search-menu');
  const trigger = select.querySelector('.select-search-trigger span');
  const searchInput = select.querySelector('.select-search-input');
  const hiddenInput = select.querySelector('.select-search-hidden');
  const isPopover = !!(menu && menu.hasAttribute('popover'));

  if (trigger) {
    trigger.textContent = option.textContent.trim();
    trigger.style.color = 'var(--text-main)';
  }
  if (hiddenInput) {
    hiddenInput.value = option.getAttribute('data-value') || '';
    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  select.querySelectorAll('.select-search-option').forEach(opt => opt.classList.remove('is-selected'));
  option.classList.add('is-selected');

  if (isPopover) {
    menu.hidePopover();
  } else {
    select.removeAttribute('open');
  }

  if (searchInput) {
    searchInput.value = '';
    select.querySelectorAll('.select-search-option').forEach(opt => opt.classList.remove('is-hidden'));
  }
});

// Focus the search field right after the menu opens (Popover API) - the
// toggle event doesn't bubble, so delegation requires the capture phase.
document.addEventListener('toggle', (e) => {
  const menu = e.target;
  if (!menu.classList) return;
  const isSelect = menu.classList.contains('select-search-menu');
  if (!isSelect && !menu.classList.contains('custom-select-dropdown')) return;

  const searchInput = menu.querySelector(isSelect ? '.select-search-input' : '.custom-select-search input');
  if (!searchInput) return;
  if (e.newState === 'open') {
    searchInput.focus({ preventScroll: true });
    return;
  }
  // A filter left behind would hide options the next time the menu opens.
  searchInput.value = '';
  if (isSelect) filterSelectSearch(menu.closest('.select-search'), '');
  else filterCustomSelect(menu.closest('.custom-select'), '');
}, true);

// The old <details> markup (no [popover] attribute on the menu) has no
// native light dismiss - closing on a click outside the component has to be handled manually.
document.addEventListener('click', (e) => {
  document.querySelectorAll('.select-search[open]').forEach(select => {
    const menu = select.querySelector('.select-search-menu');
    if (menu && menu.hasAttribute('popover')) return; // new markup - [open] unused here
    if (!select.contains(e.target)) select.removeAttribute('open');
  });
});

/**
 * Sets a value from JS (e.g. opening an edit modal with a specific
 * record's data) - syncs the trigger's label and the selected option's
 * highlight, exactly like a mouse selection. Takes the
 * <input type="hidden"> of the given .select-search.
 */
window.MoliqueSelectSearch = {
  setValue(hiddenInput, value) {
    if (!hiddenInput) return;
    const select = hiddenInput.closest('.select-search');
    if (!select) return;

    const trigger = select.querySelector('.select-search-trigger');
    const label = trigger ? trigger.querySelector('span') : null;
    const option = select.querySelector(`.select-search-option[data-value="${CSS.escape(String(value))}"]`);

    hiddenInput.value = option ? value : '';

    select.querySelectorAll('.select-search-option').forEach(opt => opt.classList.remove('is-selected'));
    if (option) {
      option.classList.add('is-selected');
      if (label) label.textContent = option.textContent.trim();
    } else if (label) {
      label.textContent = (trigger && trigger.dataset.placeholder) || label.textContent;
    }
  }
};
