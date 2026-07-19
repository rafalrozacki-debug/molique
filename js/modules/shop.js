/**
 * molique - Moduł E-commerce (Galeria i Koszyk)
 */

// 1. Galeria Produktu
document.querySelectorAll('.product-gallery').forEach(gallery => {
  const mainImg = gallery.querySelector('.product-gallery-main img');
  const thumbs = gallery.querySelectorAll('.gallery-thumb');
  if (!mainImg || thumbs.length === 0) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      const newSrc = this.querySelector('img').getAttribute('data-large');
      if (newSrc) {
        mainImg.src = newSrc;
        thumbs.forEach(t => { t.classList.remove('is-active'); t.classList.add('opacity-50'); });
        this.classList.add('is-active');
        this.classList.remove('opacity-50');
      }
    });
  });
});

// 2. Kontroler Ilości (Qty Input)
document.querySelectorAll('.qty-input').forEach(group => {
  const btnMinus = group.querySelector('.qty-btn:first-child');
  const btnPlus = group.querySelector('.qty-btn:last-child');
  const input = group.querySelector('.qty-val');

  if (btnMinus && btnPlus && input) {
    btnMinus.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(input.value) || 1;
      const min = parseInt(input.getAttribute('min')) || 1;
      if (val > min) input.value = val - 1;
    });
    btnPlus.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(input.value) || 1;
      const max = parseInt(input.getAttribute('max')) || 999;
      if (val < max) input.value = val + 1;
    });
  }
});