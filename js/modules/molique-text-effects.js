/**
 * molique - Moduł Efektów Tekstowych (Word Rotator & Typewriter)
 */

// 1. Word Rotator
document.querySelectorAll('.word-rotator').forEach(rotator => {
  const itemsContainer = rotator.querySelector('.word-rotator-items');
  if (!itemsContainer) return;
  const items = itemsContainer.querySelectorAll('span');
  if (items.length <= 1) return;

  rotator.style.height = `${items[0].offsetHeight}px`;
  let currentIndex = 0;

  setInterval(() => {
    currentIndex++;
    if (currentIndex >= items.length) currentIndex = 0;
    itemsContainer.style.transform = `translateY(-${currentIndex * 100}%)`;
  }, 2500);
});

// 2. Typewriter
document.querySelectorAll('.typewriter').forEach(el => {
  const text = el.getAttribute('data-text') || el.innerText;
  el.innerText = ''; 
  const speed = parseInt(el.getAttribute('data-speed')) || 30;
  let i = 0;
  
  const typeWriter = () => {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  };
  
  const observer = new IntersectionObserver(entries => {
    if(entries[0].isIntersecting) {
      typeWriter();
      observer.unobserve(el);
    }
  }, { threshold: 0.5 });
  
  observer.observe(el);
});