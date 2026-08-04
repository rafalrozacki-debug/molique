/**
 * molique - Główny plik skryptów (Core & Autoloader)
 * Zawiera niezbędne fundamenty oraz dynamicznie ładuje opcjonalne moduły.
 */

// Katalog, w którym leży ten plik (js/) - autoloader niżej buduje z niego
// ABSOLUTNE adresy modułów. document.currentScript działa tylko podczas
// synchronicznego wykonania TEGO pliku, dlatego stała jest na najwyższym
// poziomie, a nie w handlerze DOMContentLoaded (tam byłby już null).
// Bez tego script.src = 'modules/x.js' rozwiązywałby się względem adresu
// BIEŻĄCEJ STRONY (np. /clock/), a nie lokalizacji tego skryptu - moduł
// 404-owałby na każdej podstronie poza katalogiem, w którym akurat
// przypadkiem zgadzała się głębokość ścieżki.
const MOLIQUE_JS_BASE = document.currentScript
  ? document.currentScript.src.replace(/[^/]*$/, '')
  : '';

// Ten sam ?v=... z <script src="js/molique-script.js?v=..."> doklejamy do
// KAŻDEGO modułu ładowanego przez autoloader niżej (sekcja 9) - inaczej
// cache-busting działałby tylko na tym pliku, a moduły (np.
// molique-theme-editor.js) i tak zostałyby na rok w cache przeglądarki po
// każdym kolejnym wydaniu, mimo że sam rdzeń by się odświeżył. Jedno
// źródło prawdy: wersja w URL-u TEGO tagu, nic nie trzeba synchronizować
// osobno w tym pliku JS.
const MOLIQUE_JS_VERSION_QS = document.currentScript && document.currentScript.src.includes('?')
  ? '?' + document.currentScript.src.split('?')[1]
  : '';

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
  // Mapy literałów zamiast sklejania nazw klas z szablonu. Dzięki temu nazwy
  // istnieją w źródle jako pełne literały, więc widzą je PurgeCSS, generator
  // safelisty i wyszukiwarka IDE. Nieznany klucz => bezpieczny fallback.
  const TOAST_TYPE = {
    success: 'toast-success',
    danger: 'toast-danger',
    warning: 'toast-warning',
    info: 'toast-info'
  };
  const TOAST_POSITION = {
    'top-left': 'toast-top-left',
    'top-center': 'toast-top-center',
    'top-right': 'toast-top-right',
    'bottom-left': 'toast-bottom-left',
    'bottom-center': 'toast-bottom-center',
    'bottom-right': 'toast-bottom-right'
  };

  window.MoliqueToast = {
    show(options) {
      const { message = 'Powiadomienie', type = 'info', position = 'top-right', duration = 4000 } = options;
      
      const typeClass = TOAST_TYPE[type] || TOAST_TYPE.info;
      const positionClass = TOAST_POSITION[position] || TOAST_POSITION['top-right'];

      let container = document.querySelector('.toast-container.' + positionClass);
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container ' + positionClass;
        container.setAttribute('popover', 'manual');
        document.body.appendChild(container);
        container.showPopover();
      }
      
      const toast = document.createElement('div');
      toast.className = 'toast ' + typeClass;
      toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <span>${message}</span>
          <button class="toast-close" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.5; padding: 0; color: inherit;">&times;</button>
        </div>
        <div class="toast-progress" style="animation: toastProgressAnim ${duration}ms linear forwards;"></div>
      `;
      positionClass.includes('bottom') ? container.appendChild(toast) : container.prepend(toast);
      
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
  // .navbar-transparent też ma dostawać .is-scrolled (tło + kolory po scrollu),
  // nie tylko .navbar-sticky. is-hidden (auto-hide) ma CSS tylko dla sticky,
  // więc na transparent jest bez efektu.
  const stickyNavbar = document.querySelector('.navbar-sticky, .navbar-transparent, .navbar-pill');
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
    { selectors: '.carousel', file: 'modules/molique-carousel.js' },
    { selectors: '[data-lightbox]', file: 'modules/molique-lightbox.js' },
    { selectors: '[data-onboarding]', file: 'modules/molique-onboarding.js' },
    { selectors: '[data-tour]', file: 'modules/molique-tour.js' },
    { selectors: '[data-sortable]', file: 'modules/molique-sortable.js' },
    { selectors: '.select-search', file: 'modules/molique-select.js' },
    { selectors: '.parallax-container', file: 'modules/molique-parallax.js' },
    { selectors: '.nav-filters', file: 'modules/molique-filters.js' },
    { selectors: '.counter-value', file: 'modules/molique-counters.js' },
    { selectors: '.word-rotator, .typewriter', file: 'modules/molique-text-effects.js' },
    { selectors: '.product-gallery, .qty-input', file: 'modules/molique-shop.js' },
    { selectors: '.tilt-card', file: 'modules/molique-tilt.js', init: 'initTilt' },
    { selectors: '.btn-magnetic', file: 'modules/molique-magnetic.js', init: 'initMagneticButtons' },
    { selectors: '.share-btn', file: 'modules/molique-share.js', init: 'initShare' },
    { selectors: '.before-after-slider', file: 'modules/molique-before-after.js', init: 'initBeforeAfter' },
    { selectors: '.file-upload', file: 'modules/molique-file-upload.js', init: 'initFileUpload' },
    { selectors: 'input[data-search-target]', file: 'modules/molique-table-search.js', init: 'initTableSearch' },
    { selectors: '.popover-context', file: 'modules/molique-context-menu.js', init: 'initContextMenu' },
    { selectors: '.admin-nav-submenu', file: 'modules/molique-admin-nav.js', init: 'initAdminNav' },
    { selectors: '.admin-nav', file: 'modules/molique-admin-nav-active.js', init: 'initAdminNavActive' },
    { selectors: '.theme-editor', file: 'modules/molique-theme-editor.js', init: 'initThemeEditor' },
    { selectors: '.navbar-menu', file: 'modules/molique-navbar-active.js', init: 'initNavbarActive' },
    { selectors: '.language-switch-menu', file: 'modules/molique-lang-suggest.js', init: 'initLangSuggest' },
    { selectors: '[data-obfuscate-mail]', file: 'modules/molique-mail-obfuscate.js', init: 'initMailObfuscate' }
  ];

  dynamicModules.forEach(module => {
    if (document.querySelector(module.selectors)) {
      const script = document.createElement('script');
      // Bezwzględny adres: katalog tego pliku + względna ścieżka modułu.
      script.src = MOLIQUE_JS_BASE + module.file + MOLIQUE_JS_VERSION_QS;
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