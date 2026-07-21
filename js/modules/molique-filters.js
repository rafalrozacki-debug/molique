/**
 * molique - Moduł Filtrów Portfolio
 */
document.querySelectorAll('.nav-filters').forEach(group => {
  const buttons = group.querySelectorAll('button');
  const container = group.nextElementSibling;
  if (!container) return;
  const items = container.querySelectorAll('.filter-item');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      const filterValue = button.getAttribute('data-filter');

      items.forEach(item => {
        item.classList.remove('is-animated');
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.classList.remove('is-hidden');
          setTimeout(() => item.classList.add('is-animated'), 10);
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });
});