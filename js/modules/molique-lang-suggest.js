/**
 * molique - Lang Suggest (language-switch suggestion based on navigator.language)
 *
 * Doesn't force a redirect - Google advises against automatic language
 * redirects (they can cut off Googlebot, which reports as en-US, from the
 * Polish version and hurt visibility). Instead, a discreet, dismissible
 * bar at the bottom of the screen, in the LANGUAGE DETECTED for the
 * user - not the language of the page they happen to be on.
 *
 * The link target comes from the existing .language-switch-menu in the
 * navbar (the data-lang attribute on each .language-switch-item) - zero
 * duplication of the "does this page have an EN/DE version" logic, which
 * computeI18nLocals in vite.config.js already computes. Pages without a
 * navbar (e.g. docs-classes.html) have no .language-switch-menu, so the
 * module never even loads on them (see dynamicModules in molique-script.js).
 *
 * The user's choice (switch/stay) is saved in localStorage - the bar
 * shows only once. Auto-loaded when .language-switch-menu is present.
 */
const LANG_SUGGEST_DISMISSED_KEY = "molique-lang-suggest-dismissed";

const LANG_SUGGEST_MESSAGES = {
  pl: {
    text: "Czy chcesz przeczytać tę stronę po polsku?",
    switch: "Tak, przełącz",
    stay: "Zostań przy tej wersji",
  },
  en: {
    text: "Would you like to read this page in English?",
    switch: "Yes, switch",
    stay: "Stay on this version",
  },
  de: {
    text: "Möchtest du diese Seite auf Deutsch lesen?",
    switch: "Ja, wechseln",
    stay: "Bei dieser Version bleiben",
  },
};

function initLangSuggest() {
  if (localStorage.getItem(LANG_SUGGEST_DISMISSED_KEY)) return;

  const detected = detectLangSuggestLocale();
  if (!detected) return;

  // .split('-')[0]: document.documentElement.lang isn't always a bare
  // 2-letter code - WordPress (and BCP 47 generally) often renders the
  // full tag with a region, e.g. "pl-PL" - detected is always a bare
  // code (from navigator.language.slice(0,2)), so an un-split "current"
  // would never match it and the bar would offer to switch to the
  // language the page is already in.
  const current = document.documentElement.lang.split('-')[0];
  if (detected === current) return;

  const menu = document.querySelector(".language-switch-menu");
  if (!menu) return;

  const targetLink = menu.querySelector(`[data-lang="${detected}"]`);
  if (!targetLink) return;

  showLangSuggestBar(LANG_SUGGEST_MESSAGES[detected], targetLink.getAttribute("href"));
}

function detectLangSuggestLocale() {
  const raw = navigator.language || (navigator.languages && navigator.languages[0]) || "";
  const code = raw.slice(0, 2).toLowerCase();
  return LANG_SUGGEST_MESSAGES[code] ? code : null;
}

function showLangSuggestBar(messages, href) {
  const bar = document.createElement("div");
  bar.className = "lang-suggest-bar";
  bar.innerHTML = `
    <p class="lang-suggest-text">${messages.text}</p>
    <div class="lang-suggest-actions">
      <button type="button" class="btn-primary btn-sm" data-action="switch">${messages.switch}</button>
      <button type="button" class="btn-outline-secondary btn-sm" data-action="stay">${messages.stay}</button>
    </div>
  `;

  bar.querySelector('[data-action="switch"]').addEventListener("click", () => {
    dismissLangSuggest(bar);
    location.href = href;
  });
  bar.querySelector('[data-action="stay"]').addEventListener("click", () => {
    dismissLangSuggest(bar);
  });

  document.body.appendChild(bar);
  // Entrance on the next frame - the element must render in its starting
  // state first, so the transition to .is-visible actually animates.
  requestAnimationFrame(() => bar.classList.add("is-visible"));
}

function dismissLangSuggest(bar) {
  localStorage.setItem(LANG_SUGGEST_DISMISSED_KEY, "1");
  bar.classList.remove("is-visible");
  // setTimeout instead of transitionend - under prefers-reduced-motion the
  // CSS zeroes out the transition, so transitionend would never fire.
  setTimeout(() => bar.remove(), 300);
}

window.initLangSuggest = initLangSuggest;
