/**
 * molique - Table Live Search
 * Filtruje wiersze tabeli na podstawie wpisanego tekstu.
 * Inicjowane przez autoloader (initTableSearch)
 */

window.initTableSearch = function() {
  // Szukamy wszystkich inputów z atrybutem data-search-target
  const searchInputs = document.querySelectorAll('input[data-search-target]');

  searchInputs.forEach(input => {
    // Pobieramy ID tabeli, którą ten input ma filtrować
    const targetId = input.getAttribute('data-search-target');
    const tableBody = document.querySelector(targetId);

    if (!tableBody) return;

    // Pobieramy wszystkie wiersze z danymi (pomijamy nagłówki kategorii)
    const rows = tableBody.querySelectorAll('tr:not(.cheat-sheet-category)');

    input.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase().trim();

      rows.forEach(row => {
        // Pobieramy cały tekst z wiersza
        const rowText = row.textContent.toLowerCase();

        // Jeśli tekst zawiera szukaną frazę, pokazujemy wiersz, w przeciwnym razie ukrywamy
        if (rowText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // Opcjonalnie: Ukrywanie nagłówków kategorii, jeśli wszystkie ich dzieci są ukryte
      // (Dla zaawansowanych tabel, takich jak nasz Cheat Sheet)
      const categories = tableBody.querySelectorAll('tr.cheat-sheet-category');
      categories.forEach(category => {
        let nextRow = category.nextElementSibling;
        let hasVisibleChildren = false;

        // Sprawdzamy wszystkie wiersze aż do następnej kategorii
        while (nextRow && !nextRow.classList.contains('cheat-sheet-category')) {
          if (nextRow.style.display !== 'none') {
            hasVisibleChildren = true;
            break;
          }
          nextRow = nextRow.nextElementSibling;
        }

        // Ukrywamy kategorię, jeśli nie ma pod nią wyników
        category.style.display = hasVisibleChildren ? '' : 'none';
      });
    });
  });
};