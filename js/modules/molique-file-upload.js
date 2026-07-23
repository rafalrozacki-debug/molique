/**
 * molique - Custom File Upload (podglad nazwy wybranego pliku)
 *
 * .file-upload stoi na niewidocznym input[type="file"] rozciagnietym na
 * cala strefe (position:absolute, opacity:0) - dzieki temu klik i
 * przeciagniecie pliku dzialaja natywnie bez dodatkowego kodu. Ten modul
 * dokłada jedyna brakujaca czesc: potwierdzenie, ze plik zostal wybrany.
 * Bez niego input po cichu przyjmuje plik (drop nie otwiera go tez jako
 * nowej karty przegladarki), ale nic tego nie pokazuje.
 */
function initFileUpload() {
  document.querySelectorAll('.file-upload input[type="file"]').forEach((input) => {
    const box = input.closest('.file-upload');
    if (!box) return;

    input.addEventListener('change', () => {
      const files = input.files;
      if (!files || files.length === 0) return;

      let nameEl = box.querySelector('.file-upload-name');
      if (!nameEl) {
        nameEl = document.createElement('p');
        nameEl.className = 'file-upload-name text-4 fw-bold m-0 mt-2';
        box.appendChild(nameEl);
      }

      nameEl.textContent = files.length === 1
        ? files[0].name
        : `Wybrano ${files.length} plików`;
    });
  });
}

window.initFileUpload = initFileUpload;
