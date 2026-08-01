/**
 * molique - Spotlight Tour module
 *
 * A native <dialog> (showModal/close), the same primitive as
 * molique-lightbox.js and molique-onboarding.js - but here the reason is
 * stronger than "convenient": showModal() makes the WHOLE document
 * outside the dialog genuinely `inert` per spec (out of the tab order,
 * out of hit testing, out of the accessibility tree), which is exactly
 * "the highlighted element stays visible but isn't interactive" for
 * free, with zero hand-rolled focus trap.
 *
 * Two ways to use this module:
 *  1. Declarative (zero JS): add data-tour (+ optional data-tour-group,
 *     default group "default") plus data-tour-title/data-tour-desc to
 *     any real, existing page elements. Step order = DOM order within a
 *     group - the same "position decides order" rule already used by
 *     data-gallery groups in molique-lightbox.js and documented for
 *     .tabs in molique.md. Elements not present at module-load time
 *     (AJAX/lazy content) are outside the declarative scan's reach - use
 *     the JS API for those.
 *  2. Imperative: window.MoliqueTour.start(steps, options), where each
 *     step is { target, title, description } and target is a selector
 *     string or a live Element. Returns a Promise, resolved once the
 *     dialog closes (Skip, Escape, or finishing the last step) - chains
 *     naturally after Onboarding Slides:
 *     MoliqueOnboarding.start(slides).then(() => MoliqueTour.start(steps)).
 *
 * NOTE: this module is only auto-loaded when a [data-tour] element
 * exists on the page. To call MoliqueTour.start() purely from JS, with
 * no declarative markup anywhere, add
 * <script defer src="js/modules/molique-tour.js"> yourself.
 *
 * NOTE: clicking inside the visible "hole" or the dimmed area around it
 * deliberately does nothing (unlike molique-lightbox.js's click-outside-
 * to-close) - this is a guided sequence, not a dismissible gallery, so
 * only the tooltip's own Skip/Prev/Next control navigation.
 */
const TOUR_LANG = document.documentElement.lang;
const TOUR_STRINGS = {
  pl: {
    skip: 'Pomiń',
    prev: 'Wstecz',
    next: 'Dalej',
    finish: 'Zakończ',
    step: (n, total) => `Krok ${n} z ${total}`,
    dot: (n) => `Przejdź do kroku ${n}`,
  },
  de: {
    skip: 'Überspringen',
    prev: 'Zurück',
    next: 'Weiter',
    finish: 'Fertig',
    step: (n, total) => `Schritt ${n} von ${total}`,
    dot: (n) => `Zu Schritt ${n} wechseln`,
  },
  en: {
    skip: 'Skip',
    prev: 'Back',
    next: 'Next',
    finish: 'Finish',
    step: (n, total) => `Step ${n} of ${total}`,
    dot: (n) => `Go to step ${n}`,
  },
};
const tourT = (key) => (TOUR_STRINGS[TOUR_LANG] || TOUR_STRINGS.en)[key];

const TOUR_ANCHOR_NAME = '--molique-tour-target';
const TOUR_HOLE_PADDING = 8;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let tourDialog = null;
let tourSteps = [];
let tourIndex = 0;
let tourResolve = null;
let tourOptions = {};
let tourWasSkipped = true;
let tourActiveTarget = null;
let tourResizeHandlerAttached = false;

function ensureTourDialog() {
  if (tourDialog) return tourDialog;

  tourDialog = document.createElement('dialog');
  tourDialog.className = 'tour-dialog';
  tourDialog.innerHTML = `
    <div class="tour-spotlight"></div>
    <div class="tour-tooltip" aria-live="polite">
      <h2 class="tour-tooltip-title"></h2>
      <p class="tour-tooltip-desc"></p>
      <span class="tour-step-count"></span>
      <div class="tour-tooltip-footer">
        <button type="button" class="tour-skip"></button>
        <div class="tour-dots"></div>
        <div class="tour-nav">
          <button type="button" class="tour-prev">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="tour-next"></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(tourDialog);

  const spotlight = tourDialog.querySelector('.tour-spotlight');
  const tooltip = tourDialog.querySelector('.tour-tooltip');
  const title = tourDialog.querySelector('.tour-tooltip-title');
  const desc = tourDialog.querySelector('.tour-tooltip-desc');
  const stepCount = tourDialog.querySelector('.tour-step-count');
  const dotsContainer = tourDialog.querySelector('.tour-dots');
  const btnSkip = tourDialog.querySelector('.tour-skip');
  const btnPrev = tourDialog.querySelector('.tour-prev');
  const btnNext = tourDialog.querySelector('.tour-next');

  btnSkip.textContent = tourT('skip');
  btnPrev.setAttribute('aria-label', tourT('prev'));

  function clearAnchor() {
    if (tourActiveTarget) tourActiveTarget.style.removeProperty('anchor-name');
    tourActiveTarget = null;
  }

  function positionSpotlight(target) {
    const rect = target.getBoundingClientRect();
    spotlight.style.top = rect.top - TOUR_HOLE_PADDING + 'px';
    spotlight.style.left = rect.left - TOUR_HOLE_PADDING + 'px';
    spotlight.style.width = rect.width + TOUR_HOLE_PADDING * 2 + 'px';
    spotlight.style.height = rect.height + TOUR_HOLE_PADDING * 2 + 'px';
  }

  function activateStep() {
    return new Promise((resolve) => {
      const step = tourSteps[tourIndex];
      clearAnchor();

      const finishScroll = () => {
        tourActiveTarget = step.target;
        // A named anchor - implicit (popovertarget+id) anchoring can't
        // work here, since the target is an arbitrary page element, not
        // a [popovertarget] button.
        step.target.style.setProperty('anchor-name', TOUR_ANCHOR_NAME);
        tooltip.style.setProperty('position-anchor', TOUR_ANCHOR_NAME);
        positionSpotlight(step.target);
        resolve();
      };

      if ('scrollend' in window) {
        const onScrollEnd = () => { window.removeEventListener('scrollend', onScrollEnd); finishScroll(); };
        window.addEventListener('scrollend', onScrollEnd);
        // 'instant', not 'auto', under reduced motion: per the CSSOM View
        // spec, 'auto' defers to the element's computed scroll-behavior
        // CSS property - and html { scroll-behavior: smooth; } is set
        // unconditionally in _base.scss, so 'auto' would still animate.
        // 'instant' bypasses scroll-behavior entirely.
        step.target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'center' });
        // Nothing to scroll (already in view) never fires "scrollend" - a
        // short fallback timer covers that case too.
        setTimeout(() => { window.removeEventListener('scrollend', onScrollEnd); finishScroll(); }, 400);
      } else {
        // 'instant', not 'auto', under reduced motion: per the CSSOM View
        // spec, 'auto' defers to the element's computed scroll-behavior
        // CSS property - and html { scroll-behavior: smooth; } is set
        // unconditionally in _base.scss, so 'auto' would still animate.
        // 'instant' bypasses scroll-behavior entirely.
        step.target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'center' });
        setTimeout(finishScroll, prefersReducedMotion() ? 0 : 300);
      }
    });
  }

  function renderStep() {
    const step = tourSteps[tourIndex];
    title.textContent = step.title || '';
    desc.textContent = step.description || '';
    stepCount.textContent = tourT('step')(tourIndex + 1, tourSteps.length);

    btnPrev.disabled = tourIndex === 0;
    const isLast = tourIndex === tourSteps.length - 1;
    btnNext.textContent = isLast ? tourT('finish') : tourT('next');

    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === tourIndex);
    });
  }

  function goToStep(index) {
    tourIndex = index;
    activateStep().then(renderStep);
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    if (tourSteps.length <= 1) return;
    tourSteps.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'tour-dot';
      dot.setAttribute('aria-label', tourT('dot')(i + 1));
      dot.addEventListener('click', () => goToStep(i));
      dotsContainer.appendChild(dot);
    });
  }

  function requestClose(skipped) {
    tourWasSkipped = skipped;
    tourDialog.close();
  }

  btnNext.addEventListener('click', () => {
    if (tourIndex < tourSteps.length - 1) goToStep(tourIndex + 1);
    else requestClose(false);
  });
  btnPrev.addEventListener('click', () => {
    if (tourIndex > 0) goToStep(tourIndex - 1);
  });
  btnSkip.addEventListener('click', () => requestClose(true));

  document.addEventListener('keydown', (e) => {
    if (!tourDialog.open) return;
    if (e.key === 'ArrowRight') btnNext.click();
    else if (e.key === 'ArrowLeft' && tourIndex > 0) btnPrev.click();
  });

  // Defensive re-sync on viewport resize AND on background scroll.
  // <dialog> inertness blocks focus/hit-testing on the rest of the
  // document, but it does NOT stop the page itself from scrolling under
  // mouse wheel/PageDown - confirmed live, this isn't hypothetical. The
  // tooltip re-tracks the target on its own (native anchor()), but the
  // spotlight hole is JS-positioned and would otherwise freeze at its
  // pre-scroll coordinates while the target moves out from under it.
  let resizeTicking = false;
  function onViewportChange() {
    if (!tourDialog.open || resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
      if (tourActiveTarget) positionSpotlight(tourActiveTarget);
      resizeTicking = false;
    });
  }

  // A single source of truth for "the tour finished" - fires for every
  // close path (Skip, last-step Finish, or native Escape).
  tourDialog.addEventListener('close', () => {
    clearAnchor();
    const cb = tourWasSkipped ? tourOptions.onSkip : tourOptions.onComplete;
    if (typeof cb === 'function') cb();
    if (tourResolve) {
      tourResolve();
      tourResolve = null;
    }
  });

  tourDialog._goToStep = goToStep;
  tourDialog._buildDots = buildDots;
  tourDialog._onViewportChange = onViewportChange;
  return tourDialog;
}

function resolveTarget(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function isVisible(el) {
  if (!el || !el.offsetParent) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function resolveSteps(source) {
  let raw;
  if (Array.isArray(source)) {
    raw = source.map((step) => ({ ...step, target: resolveTarget(step.target) }));
  } else {
    // Declarative: every [data-tour] element sharing the same group,
    // order = DOM order (see the file header for why there's no separate
    // numeric index attribute).
    raw = Array.from(document.querySelectorAll('[data-tour]'))
      .filter((el) => (el.getAttribute('data-tour-group') || 'default') === source)
      .map((el) => ({
        target: el,
        title: el.getAttribute('data-tour-title') || '',
        description: el.getAttribute('data-tour-desc') || '',
      }));
  }
  // Targets missing entirely, or present but currently hidden (a
  // role-gated panel, a closed accordion, etc.) are dropped silently -
  // no author bookkeeping required. A target selector that never
  // resolves at all is a real integration mistake, so that one still warns.
  return raw.filter((step) => {
    if (!step.target) {
      console.warn(`MoliqueTour: a step's target could not be resolved and was skipped.`, step);
      return false;
    }
    return isVisible(step.target);
  });
}

function startTour(stepsOrGroup, options = {}) {
  const dialog = ensureTourDialog();
  tourSteps = resolveSteps(stepsOrGroup);
  if (tourSteps.length === 0) return Promise.resolve();

  tourOptions = options;
  tourIndex = 0;
  tourWasSkipped = true;

  dialog._buildDots();
  dialog.showModal();
  dialog._goToStep(0);

  if (!tourResizeHandlerAttached) {
    window.addEventListener('resize', dialog._onViewportChange, { passive: true });
    // capture: true - background scroll happens on whatever element the
    // wheel/PageDown targets (often not `window` itself), so listening
    // on window without capture would miss most real scroll sources.
    window.addEventListener('scroll', dialog._onViewportChange, { passive: true, capture: true });
    tourResizeHandlerAttached = true;
  }

  return new Promise((resolve) => {
    tourResolve = resolve;
  });
}

window.MoliqueTour = { start: startTour };

const tourTriggerGroups = new Set(
  Array.from(document.querySelectorAll('[data-tour]')).map((el) => el.getAttribute('data-tour-group') || 'default')
);
if (tourTriggerGroups.size > 0) {
  // Auto-starts the FIRST declared group only, on module load, ONCE per
  // browser (localStorage) - same reasoning as molique-onboarding.js's
  // declarative auto-trigger: a guided tour that replayed on every visit
  // would be more of a nuisance than a welcome slideshow. If a page
  // defines multiple named groups, start the rest explicitly via
  // MoliqueTour.start('groupName') (e.g. from a "Replay tour" button).
  const firstGroup = tourTriggerGroups.values().next().value;
  const storageKey = 'molique-tour-path:' + location.pathname + ':' + firstGroup;
  if (!localStorage.getItem(storageKey)) {
    const markSeen = () => {
      try {
        localStorage.setItem(storageKey, '1');
      } catch (err) {
        // localStorage unavailable (private browsing / disabled) - the
        // tour simply auto-plays again next visit, not a hard failure.
      }
    };
    startTour(firstGroup, { onSkip: markSeen, onComplete: markSeen });
  }
}
