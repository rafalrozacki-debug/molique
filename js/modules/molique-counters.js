/**
 * molique - Counters module
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

        // .chart-radial fills itself in on page load (CSS
        // @starting-style) - if the section is below the fold, the
        // animation finishes while permanently invisible. When a counter
        // sits inside a ring, we reset --val to 0% (without a transition,
        // hence the js-resetting class) and immediately go back to the
        // target value, so the fill replays together with the number.
        const chart = counter.closest('.chart-radial');
        if (chart) {
          const chartTarget = chart.style.getPropertyValue('--val') || getComputedStyle(chart).getPropertyValue('--val');
          chart.classList.add('js-resetting');
          chart.style.setProperty('--val', '0%');
          chart.offsetHeight; // force reflow - commits the 0% before re-enabling the transition
          chart.classList.remove('js-resetting');
          requestAnimationFrame(() => chart.style.setProperty('--val', chartTarget));
        }

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