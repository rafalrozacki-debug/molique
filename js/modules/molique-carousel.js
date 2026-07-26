/**
 * molique - Moduł Karuzeli (Slider)
 */
// Kropki nawigacji dostaja aria-label z numerem slajdu - ten sam plik JS
// laduje na stronie PL/EN/DE, wiec tekst nie moze byc zaszyty na sztywno
// (ten sam wzorzec co molique-lang-suggest.js/molique-theme-editor.js).
const CAROUSEL_LANG = document.documentElement.lang;
const carouselDotLabel = (index) => {
  const n = index + 1;
  if (CAROUSEL_LANG === 'pl') return `Przejdź do slajdu ${n}`;
  if (CAROUSEL_LANG === 'de') return `Zu Folie ${n} wechseln`;
  return `Go to slide ${n}`;
};

document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const btnPrev = carousel.querySelector('.carousel-prev');
  const btnNext = carousel.querySelector('.carousel-next');
  const isBgSync = carousel.classList.contains('carousel-bg-sync');

  // Tlo pierwszego slajdu ustawiamy od razu - inaczej pierwsza klatka
  // jest pusta, zanim IntersectionObserver zdazy cokolwiek zaobserwowac.
  if (isBgSync && slides[0]) {
    const firstBg = slides[0].getAttribute('data-bg');
    if (firstBg) carousel.style.backgroundImage = `url("${firstBg}")`;
  }

  let dotsContainer = carousel.querySelector('.carousel-dots');
  if (!dotsContainer && slides.length > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    carousel.appendChild(dotsContainer);
    
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', carouselDotLabel(index));
      dot.addEventListener('click', () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carousel-dot')) : [];

  if (btnNext) btnNext.addEventListener('click', () => track.scrollBy({ left: slides[0].clientWidth, behavior: 'smooth' }));
  if (btnPrev) btnPrev.addEventListener('click', () => track.scrollBy({ left: -slides[0].clientWidth, behavior: 'smooth' }));

  if (dots.length > 0 || isBgSync) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slideIndex = slides.indexOf(entry.target);

          if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('is-active'));
            if (dots[slideIndex]) dots[slideIndex].classList.add('is-active');
          }

          if (isBgSync) {
            const bg = entry.target.getAttribute('data-bg');
            if (bg) carousel.style.backgroundImage = `url("${bg}")`;
          }
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach(slide => observer.observe(slide));
  }
});