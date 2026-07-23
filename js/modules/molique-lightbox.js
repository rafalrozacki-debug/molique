/**
 * molique - Moduł Lightbox (Galeria)
 */
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
if (lightboxTriggers.length > 0) {
  let lightboxOverlay = document.querySelector('.lightbox-overlay');
  if (!lightboxOverlay) {
    lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'lightbox-overlay';
    lightboxOverlay.innerHTML = `
      <div class="lightbox-top-bar" style="position:absolute; top:20px; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:2010;">
        <span class="lightbox-counter text-white fw-bold"></span>
        <button class="lightbox-close" aria-label="Zamknij" style="background:none; border:none; color:#fff; font-size:2rem; cursor:pointer;">&times;</button>
      </div>
      <button class="lightbox-nav lightbox-prev" aria-label="Poprzednie zdjęcie" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#fff; font-size:3rem; cursor:pointer; z-index:2010;">&#10094;</button>
      <div class="lightbox-content" style="position:relative; max-width:90%; max-height:85vh; display:flex; align-items:center; justify-content:center; overflow:visible;">
        <img src="" alt="Powiększenie" style="max-width:100%; max-height:85vh; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); user-select:none; will-change: transform, opacity;">
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Następne zdjęcie" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#fff; font-size:3rem; cursor:pointer; z-index:2010;">&#10095;</button>
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
  let isAnimating = false;
  let lastTrigger = null;

  lightboxTriggers.forEach(trigger => {
    const galleryName = trigger.getAttribute('data-gallery') || 'default';
    if (!galleries[galleryName]) galleries[galleryName] = [];
    galleries[galleryName].push(trigger);

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      currentGallery = galleries[galleryName];
      currentIndex = currentGallery.indexOf(trigger);
      lastTrigger = trigger;
      updateLightbox();
      lightboxImg.style.transition = 'none';
      lightboxImg.style.transform = 'translateX(0)';
      lightboxImg.style.opacity = '1';
      lightboxOverlay.style.display = 'flex';
      setTimeout(() => {
        lightboxOverlay.classList.add('is-active');
        // Przenosimy focus do modala - bez tego uzytkownik klawiatury
        // zostaje "uwieziony" na wyzwalajacym linku pod spodem.
        lightboxClose.focus();
      }, 10);
    });
  });

  function updateLightbox() {
    const trigger = currentGallery[currentIndex];
    lightboxImg.src = trigger.getAttribute('href') || trigger.getAttribute('data-lightbox');
    if (currentGallery.length > 1) {
      counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
      btnPrev.style.display = 'block';
      btnNext.style.display = 'block';
      counter.style.display = 'block';
    } else {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
      counter.style.display = 'none';
    }
  }

  function changeSlideAnimated(direction) {
    if (isAnimating || currentGallery.length <= 1) return;
    isAnimating = true;
    const windowWidth = window.innerWidth;
    lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
    lightboxImg.style.transform = `translateX(${-direction * windowWidth}px)`;
    lightboxImg.style.opacity = '0';

    setTimeout(() => {
      currentIndex = direction === 1 ? (currentIndex + 1) % currentGallery.length : (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightbox();
      lightboxImg.style.transition = 'none';
      lightboxImg.style.transform = `translateX(${direction * windowWidth}px)`;
      void lightboxImg.offsetWidth;
      lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease';
      lightboxImg.style.transform = 'translateX(0)';
      lightboxImg.style.opacity = '1';
      setTimeout(() => { isAnimating = false; }, 400);
    }, 300);
  }

  btnNext.addEventListener('click', (e) => { e.stopPropagation(); changeSlideAnimated(1); });
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); changeSlideAnimated(-1); });

  const closeLightbox = () => {
    lightboxOverlay.classList.remove('is-active');
    setTimeout(() => lightboxOverlay.style.display = 'none', 300);
    // Focus wraca tam, skad przyszedl - standardowe zachowanie modali.
    if (lastTrigger) lastTrigger.focus();
  };
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay || e.target.classList.contains('lightbox-content')) closeLightbox();
  });

  // Nawigacja klawiaturą: Esc zamyka, strzałki przełączają zdjęcie -
  // jedyny sposób obsługi lightboksa bez myszy/dotyku.
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('is-active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') changeSlideAnimated(1);
    else if (e.key === 'ArrowLeft') changeSlideAnimated(-1);
  });

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  lightboxOverlay.addEventListener('pointerdown', e => {
    if (e.target !== lightboxImg && e.target !== lightboxOverlay) return;
    if (isAnimating || currentGallery.length <= 1) return;
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

  lightboxOverlay.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    lightboxOverlay.style.cursor = '';
    if (currentX < -50) changeSlideAnimated(1);
    else if (currentX > 50) changeSlideAnimated(-1);
    else {
      lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      lightboxImg.style.transform = 'translateX(0)';
    }
    currentX = 0;
  });

  lightboxImg.addEventListener('dragstart', e => e.preventDefault());
}