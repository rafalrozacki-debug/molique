/**
 * molify - widżet przed/po (before/after)
 */

function initBeforeAfter() {
  const setup = () => {
    const sliders = document.querySelectorAll('.before-after-slider');
    sliders.forEach(slider => {
      const control = slider.querySelector('.slider-control');
      if (!control) return;
      control.addEventListener('input', (e) => {
        slider.style.setProperty('--position', `${e.target.value}%`);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}

window.initBeforeAfter = initBeforeAfter;