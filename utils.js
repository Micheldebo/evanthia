/**
 * utils.js
 * Shared helpers — no dependencies.
 * Must load before dom-init.js and lenis-init.js.
 */
(() => {
  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function lockScroll() {
    if (window.lenis?.stop) window.lenis.stop();
    document.documentElement.classList.add('is-modal-open');
  }

  function unlockScroll() {
    document.documentElement.classList.remove('is-modal-open');
    if (window.lenis?.start) window.lenis.start();
  }

  window.SiteUtils = { debounce, lockScroll, unlockScroll };
})();
