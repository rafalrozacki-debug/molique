/**
 * molique - Lightbox (Gallery) module
 *
 * A native <dialog> (showModal/close) instead of a hand-managed <div>:
 * the focus trap, restoring focus to the triggering element, and closing
 * on Escape are all built into the browser, so this code doesn't
 * reimplement any of them.
 *
 * NOTE: switching images in the gallery deliberately does NOT use the
 * View Transitions API. Testing showed that
 * document.startViewTransition()'s .finished can sometimes never
 * resolve (even though the content itself already changed), and the
 * NEXT call to startViewTransition() after that happened would stop
 * firing its callback at all - a real risk of the gallery's arrows
 * getting permanently stuck. Instead: a manual transform/opacity
 * animation, exactly like the rest of the framework (see molique.md:
 * animations only ever touch transform/opacity), with a time-based
 * throttle (always releases itself) instead of a lock tied to any promise.
 *
 * NOTE (pre-existing gap, not touched by this comment-translation pass):
 * the aria-labels/alt text generated below ("Zamknij", "Poprzednie
 * zdjęcie", "Następne zdjęcie", "Powiększenie") are hardcoded Polish even
 * though this module loads on the EN/DE site pages too - a real
 * accessibility gap that would need a language lookup like
 * molique-carousel.js's CAROUSEL_LANG pattern.
 */
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
if (lightboxTriggers.length > 0) {
  let lightboxOverlay = document.querySelector('.lightbox-overlay');
  if (!lightboxOverlay) {
    lightboxOverlay = document.createElement('dialog');
    lightboxOverlay.className = 'lightbox-overlay';
    lightboxOverlay.innerHTML = `
      <div class="lightbox-top-bar">
        <span class="lightbox-counter"></span>
        <button class="lightbox-close" aria-label="Zamknij" autofocus>&times;</button>
      </div>
      <button class="lightbox-nav lightbox-prev" aria-label="Poprzednie zdjęcie">&#10094;</button>
      <div class="lightbox-content">
        <img src="" alt="Powiększenie">
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Następne zdjęcie">&#10095;</button>
    `;
    document.body.appendChild(lightboxOverlay);
  }

  const lightboxImg = lightboxOverlay.querySelector('img');
  const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
  const btnPrev = lightboxOverlay.querySelector('.lightbox-prev');
  const btnNext = lightboxOverlay.querySelector('.lightbox-next');
  const counter = lightboxOverlay.querySelector('.lightbox-counter');

  let currentGallery = [];
  let currentIndex = 0;
  const galleries = {};

  const SLIDE_MS = 220;
  const SLIDE_DISTANCE = 56;
  // A time-based throttle - always releases itself after SLIDE_MS, so
  // (unlike a lock tied to an animation/promise) it can never get stuck permanently.
  let lastChangeAt = 0;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  lightboxTriggers.forEach(trigger => {
    const galleryName = trigger.getAttribute('data-gallery') || 'default';
    if (!galleries[galleryName]) galleries[galleryName] = [];
    galleries[galleryName].push(trigger);

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      currentGallery = galleries[galleryName];
      currentIndex = currentGallery.indexOf(trigger);
      updateLightbox();
      lightboxOverlay.showModal();
    });
  });

  function slideUrl(trigger) {
    return trigger.getAttribute('href') || trigger.getAttribute('data-lightbox');
  }

  // Preload adjacent images in the background, so the arrows/swipe feel
  // instant instead of waiting on the network for every change.
  function preloadAdjacent() {
    if (currentGallery.length <= 1) return;
    const nextTrigger = currentGallery[(currentIndex + 1) % currentGallery.length];
    const prevTrigger = currentGallery[(currentIndex - 1 + currentGallery.length) % currentGallery.length];
    [nextTrigger, prevTrigger].forEach((t) => {
      const url = slideUrl(t);
      if (url) new Image().src = url;
    });
  }

  function updateLightbox() {
    const trigger = currentGallery[currentIndex];
    lightboxImg.src = slideUrl(trigger);
    if (currentGallery.length > 1) {
      counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
      btnPrev.style.display = '';
      btnNext.style.display = '';
      counter.style.display = '';
    } else {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
      counter.style.display = 'none';
    }
    preloadAdjacent();
  }

  function advanceIndex(direction) {
    currentIndex = direction === 1
      ? (currentIndex + 1) % currentGallery.length
      : (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  }

  function changeSlide(direction) {
    if (currentGallery.length <= 1) return;
    const now = Date.now();
    if (now - lastChangeAt < SLIDE_MS) return;
    lastChangeAt = now;

    if (prefersReducedMotion()) {
      advanceIndex(direction);
      updateLightbox();
      return;
    }

    lightboxImg.style.transition = `transform ${SLIDE_MS}ms ease, opacity ${SLIDE_MS}ms ease`;
    lightboxImg.style.transform = `translateX(${-direction * SLIDE_DISTANCE}px)`;
    lightboxImg.style.opacity = '0';

    setTimeout(() => {
      advanceIndex(direction);
      updateLightbox();
      lightboxImg.style.transition = 'none';
      lightboxImg.style.transform = `translateX(${direction * SLIDE_DISTANCE}px)`;
      void lightboxImg.offsetWidth; // force reflow, so the next transition actually takes effect
      lightboxImg.style.transition = `transform ${SLIDE_MS}ms ease, opacity ${SLIDE_MS}ms ease`;
      lightboxImg.style.transform = 'translateX(0)';
      lightboxImg.style.opacity = '1';
    }, SLIDE_MS);
  }

  btnNext.addEventListener('click', (e) => { e.stopPropagation(); changeSlide(1); });
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); changeSlide(-1); });

  const closeLightbox = () => lightboxOverlay.close();
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay || e.target.classList.contains('lightbox-content')) closeLightbox();
  });

  // Arrow-key navigation - Escape closes natively (<dialog>), so it's not
  // handled here. Only active while the dialog is actually open.
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.open) return;
    if (e.key === 'ArrowRight') changeSlide(1);
    else if (e.key === 'ArrowLeft') changeSlide(-1);
  });

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  lightboxOverlay.addEventListener('pointerdown', e => {
    if (e.target !== lightboxImg && e.target !== lightboxOverlay) return;
    if (currentGallery.length <= 1) return;
    isDragging = true;
    startX = e.clientX;
    lightboxImg.style.transition = 'none';
    lightboxOverlay.style.cursor = 'grabbing';
  });

  lightboxOverlay.addEventListener('pointermove', e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    lightboxImg.style.transform = `translateX(${currentX * 0.8}px)`;
  });

  lightboxOverlay.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    lightboxOverlay.style.cursor = '';
    if (currentX < -50) changeSlide(1);
    else if (currentX > 50) changeSlide(-1);
    else {
      lightboxImg.style.transition = `transform ${SLIDE_MS}ms ease`;
      lightboxImg.style.transform = 'translateX(0)';
    }
    currentX = 0;
  });

  lightboxImg.addEventListener('dragstart', e => e.preventDefault());
}
