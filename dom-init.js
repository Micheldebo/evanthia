/**
* dom-init.js
* All DOM-ready features. No mobile menu.
* Depends on: utils.js, GSAP + ScrollTrigger, dayjs + nl locale, Swiper.
*/
document.addEventListener('DOMContentLoaded', () => {
const { debounce, lockScroll, unlockScroll } = window.SiteUtils;

// ── GSAP plugin ──────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── Current year ─────────────────────────────────────────────────────────
const year = new Date().getFullYear();
document.querySelectorAll('[data-current-year]')
  .forEach(el => el.textContent = year);

// ── Section background colors ────────────────────────────────────────────
document.querySelectorAll('.section-bg[data-bg-color]').forEach(el => {
  if (el.dataset.bgColor) el.style.backgroundColor = el.dataset.bgColor;
});

// ── Date translate (EN → NL, only runs if elements exist) ────────────────
const dateEls = document.querySelectorAll('[data-date-translate]');
if (dateEls.length) {
  dateEls.forEach(el => {
    const parsed = dayjs(el.innerText.trim(), 'MMMM D, YYYY', 'en');
    if (parsed.isValid()) el.innerText = parsed.locale('nl').format('D MMMM YYYY');
  });
}

// ── Accordion (CSS-driven) ────────────────────────────────────────────────
document.querySelectorAll('[data-accordion-css-init]').forEach(accordion => {
  const closeSiblings = accordion.dataset.accordionCloseSiblings === 'true';
  accordion.addEventListener('click', e => {
    const toggle = e.target.closest('[data-accordion-toggle]');
    if (!toggle) return;
    const single = toggle.closest('[data-accordion-status]');
    if (!single) return;
    const isActive = single.dataset.accordionStatus === 'active';
    single.dataset.accordionStatus = isActive ? 'not-active' : 'active';
    if (closeSiblings && !isActive) {
      accordion.querySelectorAll('[data-accordion-status="active"]').forEach(sib => {
        if (sib !== single) sib.dataset.accordionStatus = 'not-active';
      });
    }
  });
});

 // ── Dropdown toggles (mobile) ─────────────────────────────────────────────
  // Closes all other open dropdowns when one is opened.
  // No width check — works on all screen sizes.
  function initDropdownToggles() {
    document.querySelectorAll('[data-dropdown-toggle]').forEach(t => {
      t.addEventListener('click', () => {
        const isOpen = t.dataset.dropdownToggle === 'open';
        document.querySelectorAll('[data-dropdown-toggle]').forEach(other => {
          if (other !== t) other.dataset.dropdownToggle = 'closed';
        });
        t.dataset.dropdownToggle = isOpen ? 'closed' : 'open';
      });
    });
  }
  initDropdownToggles();

// ── Modal ─────────────────────────────────────────────────────────────────
const modalGroup   = document.querySelector('[data-modal-group-status]');
const modals       = document.querySelectorAll('[data-modal-name]');
const modalTargets = document.querySelectorAll('[data-modal-target]');

function closeAllModals() {
  modalTargets.forEach(t => t.setAttribute('data-modal-status', 'not-active'));
  modalGroup?.setAttribute('data-modal-group-status', 'not-active');
  modals.forEach(m => m.setAttribute('data-modal-status', 'not-active'));
  unlockScroll();
}

modalTargets.forEach(target => {
  target.addEventListener('click', function () {
    const name = this.dataset.modalTarget;
    closeAllModals();
    document.querySelector(`[data-modal-target="${name}"]`)?.setAttribute('data-modal-status', 'active');
    document.querySelector(`[data-modal-name="${name}"]`)?.setAttribute('data-modal-status', 'active');
    modalGroup?.setAttribute('data-modal-group-status', 'active');
    lockScroll();
  });
});

document.querySelectorAll('[data-modal-close]')
  .forEach(btn => btn.addEventListener('click', closeAllModals));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

// ── Filter panel ──────────────────────────────────────────────────────────
function getFilterContainer(el) {
  return el.closest('[data-filter-status]')
    || el.closest('section')?.querySelector('[data-filter-status]')
    || document.querySelector('[data-filter-status]');
}

document.querySelectorAll('[data-filter-open]').forEach(btn => {
  btn.addEventListener('click', () =>
    getFilterContainer(btn)?.setAttribute('data-filter-status', 'active'));
});

document.querySelectorAll('[data-filter-close]').forEach(btn => {
  btn.addEventListener('click', () =>
    getFilterContainer(btn)?.setAttribute('data-filter-status', 'not-active'));
});

document.querySelectorAll('[data-filter-status] .filter__dark').forEach(backdrop => {
  backdrop.addEventListener('click', () =>
    backdrop.closest('[data-filter-status]')?.setAttribute('data-filter-status', 'not-active'));
});

// Escape key also closes filters (separate from modal Escape above)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('[data-filter-status="active"]').forEach(c =>
    c.setAttribute('data-filter-status', 'not-active'));
});

// ── Custom submit button ──────────────────────────────────────────────────
document.querySelectorAll('[data-form-validate]').forEach(form => {
  const submitDiv   = form.querySelector('[data-submit]');
  const submitInput = submitDiv?.querySelector('input[type="submit"]');
  if (!submitDiv || !submitInput) return;
  submitDiv.addEventListener('click', () => submitInput.click());
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      submitInput.click();
    }
  });
});

// ── Swiper (only initialised if a slider exists on this page) ────────────
const swiperRoot = document.querySelector('.swiper.is--gallery') || document.querySelector('.swiper');
if (swiperRoot && window.Swiper) {
  const count  = swiperRoot.querySelectorAll('.swiper-slide').length;
  const swiper = new Swiper(swiperRoot, {
    loop: count > 1,
    slidesPerView: 1,
    allowTouchMove: false,
    navigation: { nextEl: '.swiper-btn-next', prevEl: '.swiper-btn-prev' },
    pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
    observer: true, observeParents: true, observeSlideChildren: true
  });
  setTimeout(() => swiper.update(), 0);
  window.addEventListener('resize', debounce(() => swiper.update(), 150));
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
  if (prefersReduced) { gsap.set(groupEl, { clearProps: 'all' }); return; }

  const stagger  = (parseFloat(groupEl.dataset.stagger) || 100) / 1000;
  const distance = groupEl.dataset.distance || '2em';
  const start    = groupEl.dataset.start    || 'top 80%';
  const dur      = 0.8;
  const ease     = 'power4.inOut';

  const children = Array.from(groupEl.children).filter(el => el.nodeType === 1);

  // No children — animate the group itself
  if (!children.length) {
    gsap.set(groupEl, { y: distance, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: groupEl, start, once: true,
      onEnter: () => gsap.to(groupEl, {
        y: 0, autoAlpha: 1, duration: dur, ease,
        onComplete: () => gsap.set(groupEl, { clearProps: 'all' })
      })
    });
    return;
  }

  // Build slots (handles nested groups)
  const slots = children.map(child => {
    const nested = child.matches('[data-reveal-group-nested]')
      ? child
      : child.querySelector(':scope [data-reveal-group-nested]');
    if (nested) {
      const includeParent =
        child.dataset.ignore === 'false' || nested.dataset.ignore === 'false';
      return { type: 'nested', parentEl: child, nestedEl: nested, includeParent };
    }
    return { type: 'item', el: child };
  });

  // Set initial hidden state
  slots.forEach(slot => {
    if (slot.type === 'item') {
      gsap.set(slot.el, { y: slot.el.dataset.distance || distance, autoAlpha: 0 });
    } else {
      if (slot.includeParent) gsap.set(slot.parentEl, { y: distance, autoAlpha: 0 });
      const nd = slot.nestedEl.dataset.distance || distance;
      Array.from(slot.nestedEl.children).forEach(c => gsap.set(c, { y: nd, autoAlpha: 0 }));
    }
  });

  ScrollTrigger.create({
    trigger: groupEl, start, once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      slots.forEach((slot, i) => {
        const t = i * stagger;
        if (slot.type === 'item') {
          tl.to(slot.el, {
            y: 0, autoAlpha: 1, duration: dur, ease,
            onComplete: () => gsap.set(slot.el, { clearProps: 'all' })
          }, t);
        } else {
          if (slot.includeParent) {
            tl.to(slot.parentEl, {
              y: 0, autoAlpha: 1, duration: dur, ease,
              onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
            }, t);
          }
          const rawNs  = parseFloat(slot.nestedEl.dataset.stagger);
          const ns     = isNaN(rawNs) ? stagger : rawNs / 1000;
          Array.from(slot.nestedEl.children).forEach((child, j) => {
            tl.to(child, {
              y: 0, autoAlpha: 1, duration: dur, ease,
              onComplete: () => gsap.set(child, { clearProps: 'all' })
            }, t + j * ns);
          });
        }
      });
    }
  });
});
});
