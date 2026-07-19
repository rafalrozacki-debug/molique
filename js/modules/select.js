/**
 * molique - Moduł Searchable Select (Combobox)
 *
 * Menu jest popoverem (Popover API, top layer) — otwieranie przyciskiem
 * [popovertarget], zamykanie na Esc i klik poza menu (light dismiss)
 * obsługuje natywnie przeglądarka. JS odpowiada wyłącznie za: filtrowanie
 * opcji, obsługę wyboru i zapis wartości do ukrytego pola dla backendu.
 *
 * Kompatybilność wstecz: markup oparty o <details class="select-search">
 * (wersje przed 1.5.0) jest nadal obsługiwany — wtedy zamykanie odbywa się
 * przez usunięcie atrybutu [open] i nasłuch kliknięć poza komponentem.
 */
document.querySelectorAll('.select-search').forEach(select => {
  const menu = select.querySelector('.select-search-menu');
  const trigger = select.querySelector('.select-search-trigger span');
  const searchInput = select.querySelector('.select-search-input');
  const options = select.querySelectorAll('.select-search-option');
  const hiddenInput = select.querySelector('.select-search-hidden');
  const isPopover = !!(menu && menu.hasAttribute('popover'));

  const closeMenu = () => {
    if (isPopover) {
      menu.hidePopover();
    } else {
      select.removeAttribute('open');
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      options.forEach(option => {
        option.classList.toggle('is-hidden', !option.textContent.toLowerCase().includes(searchTerm));
      });
    });

    if (isPopover) {
      menu.addEventListener('toggle', (e) => {
        if (e.newState === 'open') searchInput.focus();
      });
    }
  }

  options.forEach(option => {
    option.addEventListener('click', () => {
      trigger.textContent = option.textContent.trim();
      trigger.style.color = 'var(--text-main)';
      if (hiddenInput) hiddenInput.value = option.getAttribute('data-value');
      options.forEach(opt => opt.classList.remove('is-selected'));
      option.classList.add('is-selected');
      closeMenu();
      if (searchInput) {
        searchInput.value = '';
        options.forEach(opt => opt.classList.remove('is-hidden'));
      }
    });
  });

  if (!isPopover) {
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) select.removeAttribute('open');
    });
  }
});
