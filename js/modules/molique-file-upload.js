/**
 * molique - Custom File Upload (selected file name preview)
 *
 * .file-upload sits on top of an invisible input[type="file"] stretched
 * across the whole zone (position:absolute, opacity:0) - this makes
 * click and drag-and-drop work natively with no extra code. This module
 * adds the one missing piece: confirming that a file was selected.
 * Without it the input silently accepts the file (a drop also doesn't
 * open it as a new browser tab), but nothing shows this to the user.
 *
 * The "N files selected" line follows <html lang> (since 1.7.52).
 */

// POLISH NEEDS A FUNCTION, NOT A STRING. It has two plural forms above one:
// "2 pliki" but "5 plików", and the 12-14 band flips back to the second form
// ("12 plików", yet "22 pliki"). The old hardcoded line said "plików" for
// every count, so the most common case - picking two or three files - was
// grammatically wrong in the one language it was written for.
// n is always >= 2 here: a single file shows its own name instead.
const FILE_UPLOAD_TEXT = {
  pl: (n) => `Wybrano ${n} ${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'pliki' : 'plików'}`,
  de: (n) => `${n} Dateien ausgewählt`,
  en: (n) => `${n} files selected`,
};
const fileUploadText = (n) =>
  (FILE_UPLOAD_TEXT[String(document.documentElement.lang || '').split('-')[0]] || FILE_UPLOAD_TEXT.en)(n);

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
        : fileUploadText(files.length);
    });
  });
}

window.initFileUpload = initFileUpload;
