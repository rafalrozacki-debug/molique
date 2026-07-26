/**
 * molique - przelacznik wariantu paczki na download.html
 *
 * Zero fetch, zero zaleznosci: warianty zipa sa budowane STATYCZNIE przez
 * tools/build-packages.ps1 (bo reczne pisanie kontenera ZIP w przegladarce
 * to niepotrzebne ryzyko), a ten skrypt tylko przelacza, do ktorego pliku
 * wskazuje przycisk - na podstawie wybranego formatu CSS
 * (pelna/zminifikowana), checkboxa fontow ORAZ jezyka strony (<html lang>) -
 * paczka EN/DE ma komentarze w kodzie przetlumaczone (patrz
 * tools/i18n-comments/), zeby ktos z download.en.html/download.de.html nie
 * dostal po cichu kodu skomentowanego wylacznie po polsku.
 *
 * Numer wersji i rozmiary pochodza z __MOLIQUE_VERSION__ i
 * __MOLIQUE_PACKAGE_SIZES__ - stalych wstrzykiwanych przez Vite (patrz
 * `define` w vite.config.js), czytanych z package.json i z
 * dist/package-sizes.json (zapisywanego przez tools/build-packages.ps1 na
 * podstawie realnych rozmiarow zbudowanych zipow).
 *
 * Ladowany jako <script type="module"> (jak builder.js) - to jedyny sposob,
 * zeby Vite w ogole zauwazyl i skopiowal ten plik do builda; zwykly
 * <script src> bez type="module" jest przez Vite ignorowany.
 */
const DOWNLOAD_VERSION = __MOLIQUE_VERSION__;
const PACKAGE_SIZES = __MOLIQUE_PACKAGE_SIZES__;

// <html lang="pl|en|de"> jest ustawiane na kazdej stronie przez
// computeI18nLocals() w vite.config.js - zadny dodatkowy atrybut nie jest
// tu potrzebny. "pl" (domyslny) nie dostaje sufiksu w nazwie pliku paczki
// (wsteczna zgodnosc z istniejacymi linkami), ale W SLOWNIKU rozmiarow ma
// wlasny klucz "pl" jak kazdy inny jezyk.
const LANG_SUFFIX = { pl: '', en: '-en', de: '-de' };
const lang = document.documentElement.lang in LANG_SUFFIX ? document.documentElement.lang : 'pl';
const langSuffix = LANG_SUFFIX[lang];
const sizesForLang = PACKAGE_SIZES[lang] || {};

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

    const kb = sizesForLang[suffix];

    link.href = `dist/molique-${DOWNLOAD_VERSION}${langSuffix}${suffix}.zip`;
    link.textContent = `${label} (~${kb} KB) ⬇`;
  }

  formatInputs.forEach((input) => input.addEventListener('change', update));
  if (fontsInput) fontsInput.addEventListener('change', update);
}

document.querySelectorAll('[data-download-card]').forEach(initDownloadCard);
