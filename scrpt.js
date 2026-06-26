/* =========================================================
   Acharya Coding School — landing page interactions
   FIX: null-safe guards added so nav toggle never crashes
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (header)    header.classList.toggle('is-scrolled', window.scrollY > 10);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
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
  primaryNav?.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeNav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav?.classList.contains('is-open')) closeNav();
  });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = [...document.querySelectorAll('.nav__link')];
  const sections = navLinks
    .map(l => {
      const href = l.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ---------- Hero "offer letter" card stack auto-cycle ---------- */
  const cardStack = document.getElementById('cardStack');
  if (cardStack) {
    const cards = [...cardStack.querySelectorAll('.offer-card')];
    const total = cards.length;
    let front = 0;
    const layout = () => {
      cards.forEach((card, i) => {
        const pos = (i - front + total) % total;
        card.dataset.index = pos;
      });
    };
    layout();
    setInterval(() => { front = (front + 1) % total; layout(); }, 3200);
  }

  /* ---------- Stats counter animation ---------- */
  const stats = document.querySelectorAll('.stat');
  const animateStat = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const numEl = el.querySelector('.stat__num');
    if (!numEl) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      numEl.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else numEl.textContent = prefix + target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateStat(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  stats.forEach(s => statsObserver.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.journey__step, .edge-card, .t-card'
  );
  revealTargets.forEach(el => el.setAttribute('data-reveal', ''));
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Register / Demo modal ---------- */
  const modal = document.getElementById('registerModal');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const closeTriggers = document.querySelectorAll('[data-close-modal]');
  const formView = document.getElementById('modalFormView');
  const successView = document.getElementById('modalSuccessView');
  const form = document.getElementById('registerForm');
  let lastFocused = null;

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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (formView) formView.hidden = true;
    if (successView) successView.hidden = false;
  });

  /* ---------- Back to top ---------- */
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});