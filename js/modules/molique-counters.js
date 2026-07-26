/**
 * molique - Moduł Liczników (Counters)
 */
const counters = document.querySelectorAll('.counter-value');
if (counters.length > 0) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseFloat(counter.textContent);
        const duration = 2000;
        const startTime = performance.now();
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';

        const updateCounter = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = target * easeProgress;
          const formattedVal = Number.isInteger(target) ? Math.ceil(currentVal) : currentVal.toFixed(1);
          
          counter.innerText = prefix + formattedVal + suffix;
          if (progress < 1) requestAnimationFrame(updateCounter);
          else counter.innerText = prefix + target + suffix;
        };
        requestAnimationFrame(updateCounter);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => counterObserver.observe(counter));
}