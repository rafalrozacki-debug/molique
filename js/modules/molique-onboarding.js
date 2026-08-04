/**
 * molique - Onboarding Slides module
 *
 * A native <dialog> (showModal/close) instead of a hand-managed <div> -
 * same reasoning as molique-lightbox.js: the focus trap, restoring focus
 * to the triggering element, and closing on Escape are all built into the
 * browser, so this code doesn't reimplement any of them.
 *
 * Two ways to use this module:
 *  1. Declarative (zero JS): a hidden <div data-onboarding> wrapping one
 *     or more <div data-onboarding-slide data-onboarding-title="..."
 *     data-onboarding-desc="..." data-onboarding-icon="ph-xxx"> children,
 *     in document order. Auto-shows once per browser (localStorage,
 *     keyed by data-onboarding-key or the page's own path) as soon as
 *     this module loads.
 *  2. Imperative: window.MoliqueOnboarding.start(slides, options) for
 *     dynamic/generated content. Returns a Promise, resolved once the
 *     dialog closes (skip, Escape, or completing the last slide) - lets
 *     integrators chain straight into a Spotlight Tour:
 *     MoliqueOnboarding.start(slides).then(() => MoliqueTour.start(steps)).
 *
 * NOTE: this module is only auto-loaded when a [data-onboarding] element
 * exists on the page. To call MoliqueOnboarding.start() purely from JS,
 * with no declarative markup anywhere, add
 * <script defer src="js/modules/molique-onboarding.js"> yourself.
 *
 * Slide content (title/description) is inserted via .textContent, never
 * .innerHTML - a deliberately stricter choice than MoliqueToast.show()'s
 * `message` (which does use innerHTML today, a pre-existing gap not
 * repeated here).
 */
// .split('-')[0]: document.documentElement.lang isn't always a bare
// 2-letter code - WordPress (and BCP 47 generally) often renders the
// full tag with a region, e.g. "pl-PL" - an un-split lookup against
// ONBOARDING_STRINGS.pl would silently miss and fall back to English.
const ONBOARDING_LANG = document.documentElement.lang.split('-')[0];
const ONBOARDING_STRINGS = {
  pl: {
    skip: 'Pomiń',
    prev: 'Poprzedni',
    next: 'Dalej',
    start: 'Zaczynamy',
    step: (n, total) => `Krok ${n} z ${total}`,
    dot: (n) => `Przejdź do slajdu ${n}`,
  },
  de: {
    skip: 'Überspringen',
    prev: 'Zurück',
    next: 'Weiter',
    start: 'Los geht’s',
    step: (n, total) => `Schritt ${n} von ${total}`,
    dot: (n) => `Zu Folie ${n} wechseln`,
  },
  en: {
    skip: 'Skip',
    prev: 'Previous',
    next: 'Next',
    start: 'Get started',
    step: (n, total) => `Step ${n} of ${total}`,
    dot: (n) => `Go to slide ${n}`,
  },
};
const onboardingT = (key) => (ONBOARDING_STRINGS[ONBOARDING_LANG] || ONBOARDING_STRINGS.en)[key];

let onboardingDialog = null;
let onboardingSlides = [];
let onboardingIndex = 0;
let onboardingResolve = null;
let onboardingOptions = {};
let onboardingWasSkipped = true;

function ensureOnboardingDialog() {
  if (onboardingDialog) return onboardingDialog;

  onboardingDialog = document.createElement('dialog');
  onboardingDialog.className = 'onboarding-dialog';
  onboardingDialog.innerHTML = `
    <div class="onboarding-card">
      <div class="onboarding-slide" aria-live="polite">
        <div class="onboarding-slide-media"></div>
        <h2 class="onboarding-slide-title"></h2>
        <p class="onboarding-slide-desc"></p>
        <span class="onboarding-step-count"></span>
      </div>
      <div class="onboarding-footer">
        <button type="button" class="onboarding-skip"></button>
        <div class="onboarding-dots"></div>
        <div class="onboarding-nav">
          <button type="button" class="onboarding-prev">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="onboarding-next"></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(onboardingDialog);

  const media = onboardingDialog.querySelector('.onboarding-slide-media');
  const title = onboardingDialog.querySelector('.onboarding-slide-title');
  const desc = onboardingDialog.querySelector('.onboarding-slide-desc');
  const stepCount = onboardingDialog.querySelector('.onboarding-step-count');
  const dotsContainer = onboardingDialog.querySelector('.onboarding-dots');
  const btnSkip = onboardingDialog.querySelector('.onboarding-skip');
  const btnPrev = onboardingDialog.querySelector('.onboarding-prev');
  const btnNext = onboardingDialog.querySelector('.onboarding-next');

  btnSkip.textContent = onboardingT('skip');
  btnPrev.setAttribute('aria-label', onboardingT('prev'));

  function renderSlide() {
    const slide = onboardingSlides[onboardingIndex];

    media.innerHTML = '';
    if (slide.icon) {
      const wrap = document.createElement('div');
      wrap.className = 'onboarding-slide-icon';
      wrap.innerHTML = `<svg class="icon" aria-hidden="true"><use href="img/icons-sprite.svg#${slide.icon}"></use></svg>`;
      media.appendChild(wrap);
    } else if (slide.image) {
      const img = document.createElement('img');
      img.className = 'onboarding-slide-image';
      img.src = slide.image;
      img.alt = slide.imageAlt || '';
      if (!slide.imageAlt) {
        console.warn('MoliqueOnboarding: a slide with "image" is missing "imageAlt" (accessibility).');
      }
      media.appendChild(img);
    }

    title.textContent = slide.title || '';
    desc.textContent = slide.description || '';
    stepCount.textContent = onboardingT('step')(onboardingIndex + 1, onboardingSlides.length);

    btnPrev.disabled = onboardingIndex === 0;
    const isLast = onboardingIndex === onboardingSlides.length - 1;
    btnNext.textContent = isLast ? onboardingT('start') : onboardingT('next');

    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === onboardingIndex);
    });
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    if (onboardingSlides.length <= 1) return;
    onboardingSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'onboarding-dot';
      dot.setAttribute('aria-label', onboardingT('dot')(i + 1));
      dot.addEventListener('click', () => {
        onboardingIndex = i;
        renderSlide();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function requestClose(skipped) {
    onboardingWasSkipped = skipped;
    onboardingDialog.close();
  }

  btnNext.addEventListener('click', () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      onboardingIndex++;
      renderSlide();
    } else {
      requestClose(false);
    }
  });
  btnPrev.addEventListener('click', () => {
    if (onboardingIndex > 0) {
      onboardingIndex--;
      renderSlide();
    }
  });
  btnSkip.addEventListener('click', () => requestClose(true));

  // ArrowLeft/ArrowRight navigate - Escape closes natively (<dialog>), so
  // it isn't handled here (the "close" listener below covers it too, via
  // onboardingWasSkipped's default of true).
  document.addEventListener('keydown', (e) => {
    if (!onboardingDialog.open) return;
    if (e.key === 'ArrowRight') btnNext.click();
    else if (e.key === 'ArrowLeft') btnPrev.click();
  });

  // A single source of truth for "the dialog finished": fires for every
  // close path (Skip, last-slide Next, or native Escape) - simpler and
  // less error-prone than trying to call finish() from three separate
  // listeners and risk double-invoking .close().
  onboardingDialog.addEventListener('close', () => {
    const cb = onboardingWasSkipped ? onboardingOptions.onSkip : onboardingOptions.onComplete;
    if (typeof cb === 'function') cb();
    if (onboardingResolve) {
      onboardingResolve();
      onboardingResolve = null;
    }
  });

  onboardingDialog._render = renderSlide;
  onboardingDialog._buildDots = buildDots;
  return onboardingDialog;
}

function resolveSlides(source) {
  if (Array.isArray(source)) return source;
  return Array.from(source.querySelectorAll('[data-onboarding-slide]')).map((el) => ({
    icon: el.getAttribute('data-onboarding-icon') || null,
    image: el.getAttribute('data-onboarding-image') || null,
    imageAlt: el.getAttribute('data-onboarding-image-alt') || '',
    title: el.getAttribute('data-onboarding-title') || '',
    description: el.getAttribute('data-onboarding-desc') || '',
  }));
}

function startOnboarding(slidesOrWrapper, options = {}) {
  const dialog = ensureOnboardingDialog();
  onboardingSlides = resolveSlides(slidesOrWrapper);
  if (onboardingSlides.length === 0) return Promise.resolve();

  onboardingOptions = options;
  onboardingIndex = 0;
  onboardingWasSkipped = true;

  dialog._buildDots();
  dialog._render();
  dialog.showModal();

  return new Promise((resolve) => {
    onboardingResolve = resolve;
  });
}

window.MoliqueOnboarding = { start: startOnboarding };

const onboardingWrapper = document.querySelector('[data-onboarding]');
if (onboardingWrapper) {
  const key = onboardingWrapper.getAttribute('data-onboarding-key') || 'path:' + location.pathname;
  const storageKey = 'molique-onboarding-' + key;
  if (!localStorage.getItem(storageKey)) {
    const markSeen = () => {
      try {
        localStorage.setItem(storageKey, '1');
      } catch (err) {
        // localStorage unavailable (private browsing / disabled) - the
        // slides simply show again next visit, not a hard failure.
      }
    };
    startOnboarding(onboardingWrapper, { onSkip: markSeen, onComplete: markSeen });
  }
}
