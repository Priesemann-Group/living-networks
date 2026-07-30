(function () {
  // Simple enhancement: highlight current nav link based on pathname
  var links = document.querySelectorAll('.primary-nav a.nav-link');
  var path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path && !link.classList.contains('nav-link-active')) {
      link.classList.add('nav-link-active');
    }
  });
})();
