(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const selector = 'main h1, main h2, main h3, main .kicker, main p, main .hero-badge, main .hero-actions, main .hero-note, main .number, main .flow-card strong, main .flow-card span, main .plan-label, main .plan-cost, main .plan-card li, main .plan-card > a, footer .footer-grid > div';
  const elements = [...document.querySelectorAll(selector)].filter(el => !el.closest('details'));
  let observer;
  const reveal = el => {
    el.classList.remove('reveal-pending');
    observer?.unobserve(el);
  };
  try {
    observer = new IntersectionObserver(entries => {
      const arriving = entries.filter(entry => entry.isIntersecting);
      arriving.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      arriving.forEach((entry,index) => {
        entry.target.style.setProperty('--reveal-delay', `${Math.min(index * 55, 220)}ms`);
        reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    elements.forEach(el => {
      if (el.getBoundingClientRect().bottom < 0) return;
      el.classList.add('scroll-reveal','reveal-pending');
      observer.observe(el);
    });
    // Keyboard navigation and browser search must never land on hidden text.
    document.addEventListener('focusin', event => {
      elements.forEach(el => { if (el.contains(event.target)) reveal(el); });
    });
    motion.addEventListener('change', event => {
      if (event.matches) { observer.disconnect(); elements.forEach(reveal); }
    });
    window.addEventListener('beforeprint', () => elements.forEach(reveal));
  } catch {
    observer?.disconnect();
    elements.forEach(reveal);
  }
})();
