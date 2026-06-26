/* =========================================================
   Acharya Coding School — about.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navBackdrop = document.getElementById('navBackdrop');

  const openNav = () => {
    primaryNav.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', true);
    document.body.classList.add('nav-open');
  };
  const closeNav = () => {
    primaryNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.classList.remove('nav-open');
  };
  if (navToggle) navToggle.addEventListener('click', () =>
    primaryNav.classList.contains('is-open') ? closeNav() : openNav()
  );
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  primaryNav?.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && primaryNav?.classList.contains('is-open')) closeNav();
  });

  /* ---------- Stats counter animation ---------- */
  const astats = document.querySelectorAll('.astat');
  const animateAstat = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const numEl = el.querySelector('.astat__num');
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else numEl.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const statObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateAstat(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  astats.forEach(s => statObs.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));

  /* ---------- Modal ---------- */
  const modal = document.getElementById('registerModal');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const closeTriggers = document.querySelectorAll('[data-close-modal]');
  const formView = document.getElementById('modalFormView');
  const successView = document.getElementById('modalSuccessView');
  const form = document.getElementById('registerForm');
  let lastFocused = null;

  const openModal = () => {
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