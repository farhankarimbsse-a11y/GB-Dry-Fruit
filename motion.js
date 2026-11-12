/* GB Dry Fruit — lightweight scroll reveal and dynamic card observer */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  root.classList.add('motion-ready');

  const selectors = ['.trust-strip','.sidebar','.section-heading','.story-inner','.newsletter','.site-footer','.product-card'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  function attach(scope) {
    selectors.forEach((selector) => {
      scope.querySelectorAll(selector).forEach((element, index) => {
        if (element.dataset.revealAttached) return;
        element.dataset.revealAttached = 'true';
        element.classList.add('reveal-on-scroll');
        if (selector === '.product-card') element.style.setProperty('--reveal-delay', (index % 3) * 75 + 'ms');
        observer.observe(element);
      });
    });
  }

  attach(document);
  const grid = document.querySelector('#product-grid');
  if (grid) new MutationObserver(() => attach(grid)).observe(grid, { childList: true });
})();