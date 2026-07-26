/**
 * molique - widget pochylenia (tilt)
 */

function initTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  if (tiltCards.length === 0 || !window.matchMedia("(pointer: fine)").matches) return;

  tiltCards.forEach(card => {
    let ticking = false; // Flaga blokująca nadmiarowe obliczenia

    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -10; 
          const rotateY = ((x - centerX) / centerX) * 10;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          ticking = false;
        });
        ticking = true;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      window.requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  });
}

window.initTilt = initTilt;