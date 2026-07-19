# Plik zrodlowy: `molique-script.js`

```js
/**
 * molique - Główny plik skryptów (Core & Autoloader)
 * Zawiera niezbędne fundamenty oraz dynamicznie ładuje opcjonalne moduły.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================
  // 1. SYSTEM MOTYWÓW (DARK MODE)
  // =========================================
  const themeToggle = document.getElementById('theme-toggle');
  const rootEl = document.documentElement;
  const savedTheme = localStorage.getItem('molique-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');

  rootEl.setAttribute('data-theme', currentTheme);

  if (themeToggle) {
    if (currentTheme === 'dark' && themeToggle.type === 'checkbox') {
      themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
      let newTheme;
      if (e.target.type === 'checkbox') {
        newTheme = e.target.checked ? 'dark' : 'light';
      } else {
        let theme = rootEl.getAttribute('data-theme');
        newTheme = theme === 'dark' ? 'light' : 'dark';
      }

      const applyTheme = () => rootEl.setAttribute('data-theme', newTheme);

      // Płynna zmiana motywu: View Transitions API robi cross-fade dwóch
      // migawek całej strony na GPU (czysta opacity) - zero animowania
      // kolorów per element, więc koszt jest pomijalny. Czas trwania
      // steruje CSS (::view-transition-old/new w _animations.scss).
      // Fallback: starsze przeglądarki oraz prefers-reduced-motion
      // przełączają natychmiast, jak dotychczas.
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !prefersReducedMotion) {
        document.startViewTransition(applyTheme);
      } else {
        applyTheme();
      }

      localStorage.setItem('molique-theme', newTheme);
    });
  }

  // =========================================
  // 2. TOAST NOTIFICATIONS (Globalny Obiekt)
  // =========================================
  window.MoliqueToast = {
    show(options) {
      const { message = 'Powiadomienie', type = 'info', position = 'top-right', duration = 4000 } = options;
      
      let container = document.querySelector(`.toast-container.toast-${position}`);
      if (!container) {
        container = document.createElement('div');
        container.className = `toast-container toast-${position}`;
        container.setAttribute('popover', 'manual');
        document.body.appendChild(container);
        container.showPopover();
      }
      
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <span>${message}</span>
          <button class="toast-close" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.5; padding: 0; color: inherit;">&times;</button>
        </div>
        <div class="toast-progress" style="animation: toastProgressAnim ${duration}ms linear forwards;"></div>
      `;
      position.includes('bottom') ? container.appendChild(toast) : container.prepend(toast);
      
      let timeout;
      const removeToast = () => {
        toast.classList.add('is-closing');
        toast.addEventListener('animationend', (e) => {
          if (e.animationName === 'toastExit') {
            toast.remove();
            if (container.childNodes.length === 0) container.remove();
          }
        });
      };
      toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timeout); removeToast(); });
      timeout = setTimeout(removeToast, duration);
    }
  };

  // =========================================
  // 3. ZAMYKANIE MODALI W TŁO
  // =========================================
  document.querySelectorAll('dialog.modal-dialog').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  });

  // =========================================
  // 4. ANIMACJE WEJŚCIA (Intersection Observer)
  // =========================================
  const animatedElements = document.querySelectorAll('.animate, .reveal-blur, .reveal-scale');
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
  }

  // =========================================
  // 5. STICKY NAVBAR & READING PROGRESS
  // =========================================
  const stickyNavbar = document.querySelector('.navbar-sticky');
  const progressBar = document.querySelector('.progress-bar-reading');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  
  if (stickyNavbar || progressBar) {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (stickyNavbar) {
            if (currentScrollY > 50) stickyNavbar.classList.add('is-scrolled');
            else stickyNavbar.classList.remove('is-scrolled');

            const isMenuOpen = mobileNavToggle && mobileNavToggle.checked;
            if (currentScrollY > lastScrollY && currentScrollY > 100 && !isMenuOpen) {
              stickyNavbar.classList.add('is-hidden');
            } else {
              stickyNavbar.classList.remove('is-hidden');
            }
          }

          if (progressBar) {
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (currentScrollY / height) * 100;
            progressBar.style.width = scrolled + '%';
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // =========================================
  // 6. SCROLL TO TOP
  // =========================================
  const scrollTopBtn = document.querySelector('.scroll-to-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) scrollTopBtn.classList.add('is-visible');
      else scrollTopBtn.classList.remove('is-visible');
    }, { passive: true });

    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================
  // 7. KULOODPORNE KOPIOWANIE KODU
  // =========================================
  document.querySelectorAll('.btn-copy').forEach(button => {
    button.addEventListener('click', () => {
      const codeContainer = button.closest('.component-code');
      const preBlock = codeContainer ? codeContainer.querySelector('pre') : button.nextElementSibling;
      
      if (!preBlock) return;

      const codeText = preBlock.innerText;
      const showSuccess = () => {
        const originalText = button.innerText;
        button.innerText = 'Skopiowano!';
        button.classList.add('is-copied');
        setTimeout(() => {
          button.innerText = originalText;
          button.classList.remove('is-copied');
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeText).then(showSuccess).catch(() => fallbackCopy(codeText));
      } else {
        fallbackCopy(codeText);
      }

      function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); showSuccess(); } catch (err) { button.innerText = 'Błąd!'; }
        textArea.remove();
      }
    });
  });

  // =========================================
  // 8. ADMIN SIDEBAR TOGGLE
  // =========================================
  const layout = document.querySelector('.admin-layout');
  const toggleBtn = document.querySelector('#molique-sidebar-toggle');

  if (layout) {
    const savedState = localStorage.getItem('molique-sidebar-state');
    if (savedState === 'sidebar-md' || savedState === 'sidebar-sm') {
      layout.classList.add(savedState);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (layout.classList.contains('sidebar-sm')) {
          layout.classList.remove('sidebar-sm');
          localStorage.removeItem('molique-sidebar-state');
        } 
        else if (layout.classList.contains('sidebar-md')) {
          layout.classList.remove('sidebar-md');
          layout.classList.add('sidebar-sm');
          localStorage.setItem('molique-sidebar-state', 'sidebar-sm');
        } 
        else {
          layout.classList.add('sidebar-md');
          localStorage.setItem('molique-sidebar-state', 'sidebar-md');
        }
      });
    }
  }

  // =========================================
  // 9. INTELIGENTNY AUTO-LOADER MODUŁÓW
  // =========================================
  const dynamicModules = [
    { selectors: '.carousel', file: 'js/modules/carousel.js' },
    { selectors: '[data-lightbox]', file: 'js/modules/lightbox.js' },
    { selectors: '.select-search', file: 'js/modules/select.js' },
    { selectors: '.parallax-container', file: 'js/modules/parallax.js' },
    { selectors: '.nav-filters', file: 'js/modules/filters.js' },
    { selectors: '.counter-value', file: 'js/modules/counters.js' },
    { selectors: '.word-rotator, .typewriter', file: 'js/modules/text-effects.js' },
    { selectors: '.product-gallery, .qty-input', file: 'js/modules/shop.js' },
    { selectors: '.tilt-card', file: 'js/modules/tilt.js', init: 'initTilt' },
    { selectors: '.btn-magnetic', file: 'js/modules/magnetic.js', init: 'initMagneticButtons' },
    { selectors: '.share-btn', file: 'js/modules/share.js', init: 'initShare' },
    { selectors: '.before-after-slider', file: 'js/modules/before-after.js', init: 'initBeforeAfter' },
    { selectors: 'input[data-search-target]', file: 'js/modules/table-search.js', init: 'initTableSearch' },
    { selectors: '.popover-context', file: 'js/modules/context-menu.js', init: 'initContextMenu' }
  ];

  dynamicModules.forEach(module => {
    if (document.querySelector(module.selectors)) {
      const script = document.createElement('script');
      script.src = module.file;
      script.defer = true;
      
      if (module.init) {
        script.onload = () => {
          if (typeof window[module.init] === 'function') {
            window[module.init]();
          }
        };
      }
      
      document.body.appendChild(script);
    }
  });

});
```
