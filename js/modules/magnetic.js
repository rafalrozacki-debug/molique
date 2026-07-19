/**
 * molify - widżet magnetycznych przycisków
 */

function initMagneticButtons() {
  const magnetBtns = document.querySelectorAll('.btn-magnetic');
  if (magnetBtns.length === 0 || !window.matchMedia("(pointer: fine)").matches) return;

  magnetBtns.forEach(btn => {
    let ticking = false;

    btn.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    btn.addEventListener('mouseleave', () => {
      window.requestAnimationFrame(() => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  });
}

window.initMagneticButtons = initMagneticButtons;