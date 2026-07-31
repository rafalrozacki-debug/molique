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
 * NOTE (pre-existing gap, not touched by this comment-translation pass):
 * the "N files selected" string on line ~29 is hardcoded Polish even
 * though this module loads on the EN/DE site pages too - would need a
 * real localization pass like molique-carousel.js's CAROUSEL_LANG pattern.
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
