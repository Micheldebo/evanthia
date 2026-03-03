/**
 * lenis-init.js
 * Lenis smooth scroll + hero reveal + ScrollTrigger refresh.
 * Runs on window load (after all resources ready).
 * Depends on: GSAP + ScrollTrigger, Lenis.
 */
window.addEventListener('load', () => {

  // ── Lenis smooth scroll ────────────────────────────────────────────────
  const lenis = new window.Lenis({ lerp: 0.12 });
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;

  // Scroll direction + started tracking
  let lastScroll = 0;
  lenis.on('scroll', e => {
    const now = e.targetScroll;
    if (Math.abs(now - lastScroll) > 50) {
      document.body.dataset.scrollingDirection = now > lastScroll ? 'down' : 'up';
      document.body.dataset.scrollingStarted   = now > 50 ? 'true' : 'false';
      lastScroll = now;
    }
  });

  // ── Hero reveal ────────────────────────────────────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const items = gsap.utils.toArray('[data-hero-reveal]')
    .filter(el => !el.matches('.hero-bg__svg'));

  const shapes = gsap.utils.toArray([
    '.hero-bg__svg path',
    '.hero-bg__svg rect',
    '.hero-bg__svg circle',
    '.hero-bg__svg ellipse',
    '.hero-bg__svg polygon',
    '.hero-bg__svg polyline',
  ].join(','));

  if (prefersReduced) {
    gsap.set(items, { opacity: 1 });
  } else {
    gsap.set(shapes, { transformBox: 'fill-box', transformOrigin: '50% 50%' });
    gsap.set(items,  { opacity: 0, y: 24 });

    requestAnimationFrame(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.to(items, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.1, overwrite: 'auto',
        onComplete: () => gsap.set(items, { clearProps: 'y' })
      });

      // SVG shape oscillation — only when shapes exist on this page
      if (shapes.length) {
        tl.add(() => {
          gsap.set(shapes, { transformBox: 'fill-box', transformOrigin: '50% 50%', y: 0 });
          gsap.fromTo(
            shapes,
            { rotation: () => gsap.utils.random(-10, 10, 1, true) },
            {
              rotation(i, target) {
                const start = gsap.getProperty(target, 'rotation');
                const amp   = gsap.utils.random(6, 12, 1, true);
                return start >= 0 ? -amp : amp;
              },
              immediateRender: false,
              duration: () => gsap.utils.random(4, 8),
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              stagger: { each: 0.02, from: 'random' },
              force3D: true
            }
          );
        }, '>-0.2');
      }
    });
  }

  // ── ScrollTrigger refresh after full paint ─────────────────────────────
  setTimeout(() => ScrollTrigger.refresh(), 100);
});
