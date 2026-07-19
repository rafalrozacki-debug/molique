/**
 * molique - Moduł Parallax (GPU)
 */
const parallaxes = document.querySelectorAll('.parallax-container');
if (parallaxes.length > 0) {
  const updateParallax = () => {
    parallaxes.forEach(p => {
      const rect = p.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const bg = p.querySelector('.parallax-bg');
        if (bg) {
          const totalScroll = window.innerHeight + rect.height;
          const currentScroll = window.innerHeight - rect.top;
          const progress = currentScroll / totalScroll;
          const yPos = (progress * 30) - 15; 
          bg.style.transform = `translate3d(0, ${yPos}%, 0)`;
        }
      }
    });
  };
  window.addEventListener('scroll', () => window.requestAnimationFrame(updateParallax), { passive: true, capture: true });
  window.requestAnimationFrame(updateParallax);
}