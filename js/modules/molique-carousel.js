/**
 * molique - Moduł Karuzeli (Slider)
 */
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  if (!track) return;
  
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const btnPrev = carousel.querySelector('.carousel-prev');
  const btnNext = carousel.querySelector('.carousel-next');
  
  let dotsContainer = carousel.querySelector('.carousel-dots');
  if (!dotsContainer && slides.length > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    carousel.appendChild(dotsContainer);
    
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
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

  if (dots.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slideIndex = slides.indexOf(entry.target);
          dots.forEach(dot => dot.classList.remove('is-active'));
          if (dots[slideIndex]) dots[slideIndex].classList.add('is-active');
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach(slide => observer.observe(slide));
  }
});