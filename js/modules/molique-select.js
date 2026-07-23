/**
 * molique - Moduł Searchable Select (Combobox)
 *
 * Menu jest popoverem (Popover API, top layer) - otwieranie przyciskiem
 * [popovertarget], zamykanie na Esc i klik poza menu (light dismiss)
 * obsługuje natywnie przeglądarka. JS odpowiada wyłącznie za: filtrowanie
 * opcji, obsługę wyboru i zapis wartości do ukrytego pola dla backendu.
 *
 * Kompatybilność wstecz: markup oparty o <details class="select-search">
 * (wersje przed 1.5.0) jest nadal obsługiwany - wtedy zamykanie odbywa się
 * przez usunięcie atrybutu [open] i nasłuch kliknięć poza komponentem.
 *
 * Delegacja zdarzeń (input/click na document) zamiast podpinania listenerów
 * per-opcja przy starcie: działa też dla opcji dodanych do DOM PO starcie
 * strony (np. kalendarz dolewa listę klientów z AJAX) - bez tego trzeba by
 * ręcznie re-inicjalizować moduł po każdej takiej zmianie.
 */
document.addEventListener('input', (e) => {
  const searchInput = e.target.closest('.select-search-input');
  if (!searchInput) return;

  const select = searchInput.closest('.select-search');
  if (!select) return;

  const term = searchInput.value.toLowerCase();
  select.querySelectorAll('.select-search-option').forEach(option => {
    option.classList.toggle('is-hidden', !option.textContent.toLowerCase().includes(term));
  });
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

// Fokus na polu wyszukiwania zaraz po otwarciu menu (Popover API) - zdarzenie
// toggle nie bąbelkuje, więc delegacja wymaga fazy przechwytywania.
document.addEventListener('toggle', (e) => {
  const menu = e.target;
  if (!menu.classList || !menu.classList.contains('select-search-menu')) return;
  if (e.newState !== 'open') return;

  const searchInput = menu.querySelector('.select-search-input');
  if (searchInput) searchInput.focus({ preventScroll: true });
}, true);

// Stary markup <details> (bez atrybutu [popover] na menu) nie ma natywnego
// light dismiss - zamykanie na klik poza komponentem trzeba obsłużyć ręcznie.
document.addEventListener('click', (e) => {
  document.querySelectorAll('.select-search[open]').forEach(select => {
    const menu = select.querySelector('.select-search-menu');
    if (menu && menu.hasAttribute('popover')) return; // nowy markup - [open] tu nieużywane
    if (!select.contains(e.target)) select.removeAttribute('open');
  });
});

/**
 * Ustawienie wartości z poziomu JS (np. otwarcie modala edycji z danymi
 * konkretnego rekordu) - synchronizuje etykietę na przycisku i podświetlenie
 * wybranej opcji, tak samo jak wybór myszką. Przyjmuje sam
 * <input type="hidden"> danego .select-search.
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
