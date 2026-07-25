/**
 * molique - przelacznik wariantu paczki na download.html
 *
 * Zero fetch, zero zaleznosci: 6 wariantow zipa jest budowanych STATYCZNIE
 * przez tools/build-packages.ps1 (bo reczne pisanie kontenera ZIP w
 * przegladarce to niepotrzebne ryzyko), a ten skrypt tylko przelacza, do
 * ktorego pliku wskazuje przycisk - na podstawie wybranego formatu CSS
 * (pelna/zminifikowana) i checkboxa fontow.
 *
 * Rozmiary ponizej trzeba zaktualizowac recznie przy kazdym wydaniu -
 * dokladnie tak samo, jak juz dzis recznie aktualizowane sa etykiety KB
 * na tej stronie. Ladowany jako <script type="module"> (jak builder.js) -
 * to jedyny sposob, zeby Vite w ogole zauwazyl i skopiowal ten plik do
 * builda; zwykly <script src> bez type="module" jest przez Vite ignorowany.
 */
const DOWNLOAD_VERSION = '1.7.0';

const PROD_SIZES_KB = { '': 90, '-fonts': 276, '-full': 138, '-full-fonts': 324 };
const SRC_SIZES_KB = { '-src': 275, '-src-fonts': 461 };

function initDownloadCard(card) {
  const formatInputs = card.querySelectorAll('[data-format-input]');
  const fontsInput = card.querySelector('[data-fonts-input]');
  const link = card.querySelector('[data-download-link]');
  if (!link) return;

  const isSource = card.dataset.tier === 'source';
  const label = link.dataset.label;

  function update() {
    const full = formatInputs.length
      ? [...formatInputs].some((r) => r.checked && r.value === 'full')
      : true; // karta Source: zawsze pelna CSS, bez przelacznika

    const fonts = fontsInput ? fontsInput.checked : false;

    const suffix = isSource
      ? (fonts ? '-src-fonts' : '-src')
      : (full ? '-full' : '') + (fonts ? '-fonts' : '');

    const kb = (isSource ? SRC_SIZES_KB : PROD_SIZES_KB)[suffix];

    link.href = `dist/molique-${DOWNLOAD_VERSION}${suffix}.zip`;
    link.textContent = `${label} (~${kb} KB) ⬇`;
  }

  formatInputs.forEach((input) => input.addEventListener('change', update));
  if (fontsInput) fontsInput.addEventListener('change', update);
}

document.querySelectorAll('[data-download-card]').forEach(initDownloadCard);
