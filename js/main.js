(function () {
  'use strict';

  /* Enable JS-powered reveal animations */
  document.body.classList.add('js-ready');

  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ── 1. NAV SCROLL EFFECT ─────────────────────────────── */
  const header = qs('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. ACTIVE NAV LINK (highlight current section) ──── */
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-links a, .nav-mobile a');

  const setActive = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ── 3. MOBILE HAMBURGER ──────────────────────────────── */
  const checkMobile = () => {
    const isMobile = window.innerWidth < 720;
    document.body.classList.toggle('mobile-nav-mode', isMobile);
    if (!isMobile) {
      qs('.nav-mobile')?.classList.remove('open');
      const b = qs('.nav-hamburger');
      if (b) { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    }
  };
  checkMobile();
  window.addEventListener('resize', checkMobile, { passive: true });

  const burger = qs('.nav-hamburger');
  const drawer = qs('.nav-mobile');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    qsa('a', drawer).forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ── 4. BADGE SPIN (rAF — no @keyframes) ─────────────── */
  const ring = qs('.hero__badge-ring');
  if (ring) {
    let angle = 0, last = null;
    const spin = ts => {
      if (last !== null) angle = (angle + (ts - last) * 0.018) % 360;
      last = ts;
      ring.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(spin);
    };
    requestAnimationFrame(spin);

    qs('.hero__badge')?.addEventListener('click', () => {
      qs('#menu')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── 5. SCROLL REVEAL ─────────────────────────────────── */
  const reveals = qsa('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ── 6. MENU TABS ─────────────────────────────────────── */
  const tabBtns = qsa('.tab-btn');
  const cards   = qsa('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const cat = btn.dataset.cat;
      cards.forEach(c => { c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none'; });
    });
  });

  /* ── 7. FORM VALIDATION ───────────────────────────────── */
  const form    = qs('#reserve-form');
  const success = qs('.form-success');
  const reset   = qs('.form-reset');

  if (form && success) {
    const showErr = (el, msg) => {
      const err = el.parentElement.querySelector('.form-error');
      if (err) { err.textContent = msg; err.classList.add('show'); }
      el.style.borderColor = '#e87b7b';
    };
    const clearErr = el => {
      const err = el.parentElement.querySelector('.form-error');
      if (err) err.classList.remove('show');
      el.style.borderColor = '';
    };

    qsa('input, select, textarea', form).forEach(f => {
      f.addEventListener('input',  () => clearErr(f));
      f.addEventListener('change', () => clearErr(f));
    });

    /* Set today as min date */
    const di = qs('#r-date');
    if (di) {
      const d = new Date();
      di.min = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;

      const name   = qs('#r-name',   form);
      const phone  = qs('#r-phone',  form);
      const date   = qs('#r-date',   form);
      const time   = qs('#r-time',   form);
      const guests = qs('#r-guests', form);
      const branch = qs('#r-branch', form);

      if (name?.value.trim().length < 2)               { showErr(name,   'Please enter your full name.');      ok = false; }
      if (!/^[\d\s+\-()]{7,}$/.test(phone?.value.trim())) { showErr(phone, 'Please enter a valid phone number.'); ok = false; }
      if (!date?.value || new Date(date.value) < new Date(new Date().toDateString())) { showErr(date, 'Please pick a future date.'); ok = false; }
      if (!time?.value)                                 { showErr(time,   'Please select a time.');              ok = false; }
      if (!guests?.value)                               { showErr(guests, 'Please select number of guests.');   ok = false; }
      if (!branch?.value)                               { showErr(branch, 'Please select a branch.');           ok = false; }

      if (ok) {
        form.style.display = 'none';
        success.classList.add('show');
        qs('.reserve-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    reset?.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      success.classList.remove('show');
    });
  }

  /* ── 8. LANG TOGGLE ───────────────────────────────────── */
  qsa('.nav-lang button').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.nav-lang button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

})();
