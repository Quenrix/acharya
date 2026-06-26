/* =========================================================
   Acharya Coding School — placement.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header + Back-to-top ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle  = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navBackdrop = document.getElementById('navBackdrop');

  const openNav = () => {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };
  const closeNav = () => {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      primaryNav.classList.contains('is-open') ? closeNav() : openNav();
    });
  }
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  primaryNav?.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && primaryNav?.classList.contains('is-open')) closeNav();
  });

  /* ---------- Graduate cards reveal ---------- */
  const gradCards = document.querySelectorAll('.grad-card');
  const cardObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  gradCards.forEach(card => cardObs.observe(card));

  /* ---------- Stats counter ---------- */
  const plstats = document.querySelectorAll('.plstat');
  const animatePlstat = (el) => {
    const target  = parseFloat(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal || '0', 10);
    const numEl   = el.querySelector('.plstat__num');
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = (target * eased).toFixed(decimal) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else numEl.textContent = target.toFixed(decimal) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const statObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animatePlstat(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  plstats.forEach(s => statObs.observe(s));

  /* ---------- Modal ---------- */
  const modal        = document.getElementById('registerModal');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const closeTriggers = document.querySelectorAll('[data-close-modal]');
  const formView     = document.getElementById('modalFormView');
  const successView  = document.getElementById('modalSuccessView');
  const form         = document.getElementById('registerForm');
  let lastFocused    = null;

  const openModal = () => {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (formView) formView.hidden = false;
    if (successView) successView.hidden = true;
    form?.reset();
    setTimeout(() => modal.querySelector('input,button')?.focus(), 50);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  openTriggers.forEach(btn => btn.addEventListener('click', openModal));
  closeTriggers.forEach(btn => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (formView) formView.hidden = true;
    if (successView) successView.hidden = false;
  });

  /* ---------- Back to top ---------- */
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});