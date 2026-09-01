(function () {
  // Theme Management
  var themeToggleBtn = document.getElementById('theme-toggle-btn');
  var rootHtml = document.documentElement;

  function getPreferredTheme() {
    var storedTheme = localStorage.getItem('ln-theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      rootHtml.setAttribute('data-theme', 'dark');
    } else {
      rootHtml.removeAttribute('data-theme');
    }
    localStorage.setItem('ln-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'dark') {
      themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg> <span>Light</span>';
      themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg> <span>Dark</span>';
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Initialize theme
  var currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      var activeTheme = rootHtml.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  // Highlight active link for current page
  var links = document.querySelectorAll('.primary-nav a.nav-link');
  var path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === '' || path === '/') path = 'index.html';

  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      link.classList.add('nav-link-active');
    } else {
      link.classList.remove('nav-link-active');
    }
  });

  // Seamless Continuous Scroll Transitions Between Dedicated Pages
  var PAGE_SEQUENCE = [
    'index.html',
    'speakers.html',
    'programme.html',
    'logistics.html'
  ];

  var currentIndex = PAGE_SEQUENCE.indexOf(path);
  if (currentIndex !== -1) {
    var isTransitioning = false;
    var accumulatedDelta = 0;
    var deltaThreshold = 75;
    var resetTimer = null;

    function navigateSmoothly(targetUrl, direction) {
      if (isTransitioning) return;
      isTransitioning = true;
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(function () {
        window.location.href = targetUrl;
      }, 250);
    }

    // Wheel listener for natural overscroll transition
    window.addEventListener('wheel', function (e) {
      if (isTransitioning) return;

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight;
      var docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      var atBottom = (scrollTop + windowHeight) >= (docHeight - 10);
      var atTop = scrollTop <= 5;

      if (atBottom && e.deltaY > 0 && currentIndex < PAGE_SEQUENCE.length - 1) {
        accumulatedDelta += e.deltaY;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () { accumulatedDelta = 0; }, 350);

        if (accumulatedDelta >= deltaThreshold) {
          navigateSmoothly(PAGE_SEQUENCE[currentIndex + 1], 'next');
        }
      } else if (atTop && e.deltaY < 0 && currentIndex > 0) {
        accumulatedDelta += Math.abs(e.deltaY);
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () { accumulatedDelta = 0; }, 350);

        if (accumulatedDelta >= deltaThreshold) {
          navigateSmoothly(PAGE_SEQUENCE[currentIndex - 1], 'prev');
        }
      } else {
        accumulatedDelta = 0;
      }
    }, { passive: true });

    // Touch listener for mobile gesture transitions
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (isTransitioning || e.changedTouches.length === 0) return;
      var touchEndY = e.changedTouches[0].clientY;
      var deltaY = touchStartY - touchEndY;

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight;
      var docHeight = document.documentElement.scrollHeight;
      var atBottom = (scrollTop + windowHeight) >= (docHeight - 15);
      var atTop = scrollTop <= 5;

      if (atBottom && deltaY > 60 && currentIndex < PAGE_SEQUENCE.length - 1) {
        navigateSmoothly(PAGE_SEQUENCE[currentIndex + 1], 'next');
      } else if (atTop && deltaY < -60 && currentIndex > 0) {
        navigateSmoothly(PAGE_SEQUENCE[currentIndex - 1], 'prev');
      }
    }, { passive: true });
  }
})();



