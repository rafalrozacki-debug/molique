/**
 * molique - Table Live Search
 * Filters table rows based on the typed text.
 * Initialized by the autoloader (initTableSearch)
 */

window.initTableSearch = function() {
  // Find every input with a data-search-target attribute
  const searchInputs = document.querySelectorAll('input[data-search-target]');

  searchInputs.forEach(input => {
    // Get the ID of the table this input should filter
    const targetId = input.getAttribute('data-search-target');
    const tableBody = document.querySelector(targetId);

    if (!tableBody) return;

    // Get every data row (skip category headers)
    const rows = tableBody.querySelectorAll('tr:not(.cheat-sheet-category)');

    input.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase().trim();

      rows.forEach(row => {
        // Get all the text from the row
        const rowText = row.textContent.toLowerCase();

        // Show the row if it contains the search term, otherwise hide it
        if (rowText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // Optional: hide category headers if all their children are hidden
      // (for advanced tables like our Cheat Sheet)
      const categories = tableBody.querySelectorAll('tr.cheat-sheet-category');
      categories.forEach(category => {
        let nextRow = category.nextElementSibling;
        let hasVisibleChildren = false;

        // Check every row up to the next category
        while (nextRow && !nextRow.classList.contains('cheat-sheet-category')) {
          if (nextRow.style.display !== 'none') {
            hasVisibleChildren = true;
            break;
          }
          nextRow = nextRow.nextElementSibling;
        }

        // Hide the category if there are no results under it
        category.style.display = hasVisibleChildren ? '' : 'none';
      });
    });
  });
};