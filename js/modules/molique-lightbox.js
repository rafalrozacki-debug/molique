/**
 * molique - Moduł Lightbox (Galeria)
 *
 * Natywny <dialog> (showModal/close) zamiast recznie sterowanego <div>:
 * pulapka fokusa, przywracanie fokusa elementowi wyzwalajacemu i zamykanie
 * Escape sa wbudowane w przegladarke, wiec ten kod ich juz nie implementuje.
 *
 * UWAGA: zmiana zdjecia w galerii swiadomie NIE korzysta z View Transitions
 * API. Proba pokazala, ze document.startViewTransition()'s .finished
 * potrafi nigdy sie nie rozstrzygnac (mimo ze sama tresc juz sie zmienila),
 * a KOLEJNE wywolanie startViewTransition() po takim przypadku przestawalo
 * w ogole odpalac swoj callback - realne ryzyko trwalego zaciecia strzalek
 * w galerii. Zamiast tego: reczna animacja transform/opacity, dokladnie
 * tak jak reszta frameworka (patrz molique.md: animacje wylacznie na
 * transform/opacity), z throttlem czasowym (zawsze sam sie zwalnia) zamiast
 * blokady sprzezonej z jakakolwiek obietnica.
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
  // Throttle czasowy - zawsze sam sie zwalnia po SLIDE_MS, wiec (w
  // odroznieniu od blokady sprzezonej z animacja/obietnica) nie moze sie
  // zaciac na trwale.
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

  // Sasiednie zdjecia w tle, zeby strzalki/swipe czuly sie natychmiastowe
  // zamiast czekac na siec przy kazdej zmianie.
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
      void lightboxImg.offsetWidth; // wymus reflow, zeby kolejny transition faktycznie zadzialal
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

  // Nawigacja strzalkami - Escape zamyka natywnie (<dialog>), wiec nie ma go
  // tutaj. Dziala tylko gdy dialog jest faktycznie otwarty.
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
