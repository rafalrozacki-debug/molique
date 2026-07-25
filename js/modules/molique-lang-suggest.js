/**
 * molique - Lang Suggest (sugestia zmiany języka wg navigator.language)
 *
 * Nie przekierowuje na siłę - Google odradza automatyczne przekierowania
 * językowe (mogą odciąć Googlebota, który zgłasza się jako en-US, od
 * polskiej wersji i zaszkodzić widoczności). Zamiast tego dyskretny,
 * odrzucalny pasek na dole ekranu, w JĘZYKU WYKRYTYM u użytkownika -
 * nie w języku strony, na której akurat jest.
 *
 * Cel linku brany jest z gotowego .language-switch-menu w navbarze
 * (atrybut data-lang na każdym .language-switch-item) - zero duplikacji
 * logiki "czy ta strona ma wersję EN/DE", którą już liczy
 * computeI18nLocals w vite.config.js. Strony bez navbara (np.
 * docs-classes.html) nie mają .language-switch-menu, więc moduł się na
 * nich w ogóle nie doładowuje (patrz dynamicModules w molique-script.js).
 *
 * Wybór użytkownika (przełącz/zostań) zapisywany w localStorage - pasek
 * pokazuje się tylko raz. Auto-ładowany przy .language-switch-menu.
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

  const current = document.documentElement.lang;
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
  // Wejście na następnej klatce - element musi się najpierw wyrenderować
  // w stanie startowym, żeby przejście do .is-visible faktycznie animowało.
  requestAnimationFrame(() => bar.classList.add("is-visible"));
}

function dismissLangSuggest(bar) {
  localStorage.setItem(LANG_SUGGEST_DISMISSED_KEY, "1");
  bar.classList.remove("is-visible");
  // setTimeout zamiast transitionend - przy prefers-reduced-motion CSS
  // zeruje transition, więc transitionend nigdy by się nie odpalił.
  setTimeout(() => bar.remove(), 300);
}

window.initLangSuggest = initLangSuggest;
