/**
 * lenis-init.js
 * - Hero reveal fires on DOMContentLoaded (no waiting for images)
 * - Lenis + ScrollTrigger refresh fire on window load (needs stable layout)
 * Depends on: GSAP + ScrollTrigger, Lenis.
 */

// ── Hero reveal — fires as soon as HTML is parsed ──────────────────────────
// This means the hero animates in immediately, not after all images load.
document.addEventListener('DOMContentLoaded', () => {
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
    return;
  }

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
});

// ── Lenis + ScrollTrigger refresh — waits for full load ───────────────────
// Lenis needs the final layout (all images sized) to scroll correctly.
window.addEventListener('load', () => {
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

  // Refresh ScrollTrigger now that all images are loaded and layout is final
  setTimeout(() => ScrollTrigger.refresh(), 100);
});
