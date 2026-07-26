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

        // .chart-radial wypelnia sie sam przy wczytaniu strony (CSS
        // @starting-style) - jesli sekcja jest poza pierwszym ekranem,
        // animacja konczy sie na zawsze niewidoczna. Gdy licznik siedzi
        // w pierscieniu, resetujemy --val do 0% (bez transition, stad
        // klasa js-resetting) i od razu wracamy do docelowej wartosci,
        // zeby wypelnienie odtworzylo sie razem z liczba.
        const chart = counter.closest('.chart-radial');
        if (chart) {
          const chartTarget = chart.style.getPropertyValue('--val') || getComputedStyle(chart).getPropertyValue('--val');
          chart.classList.add('js-resetting');
          chart.style.setProperty('--val', '0%');
          chart.offsetHeight; // force reflow - commituje 0% przed odblokowaniem transition
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