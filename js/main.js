/* ============================================================
   BioChem Technology, Inc. — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* --- Mobile Navigation --- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav   = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Dropdown toggles on mobile
    document.querySelectorAll('.main-nav > li').forEach(li => {
      const dropdown = li.querySelector('.dropdown-menu');
      const link     = li.querySelector(':scope > a');
      if (dropdown && link) {
        link.addEventListener('click', e => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            const alreadyOpen = li.classList.contains('dropdown-open');
            // close all
            document.querySelectorAll('.main-nav > li').forEach(x => x.classList.remove('dropdown-open'));
            if (!alreadyOpen) li.classList.add('dropdown-open');
          }
        });
      }
    });

    // Close nav when clicking outside
    document.addEventListener('click', e => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close nav on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
        document.querySelectorAll('.main-nav > li').forEach(li => li.classList.remove('dropdown-open'));
      }
    });
  }

  /* --- Active Nav Link --- */
  const path = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  document.querySelectorAll('.main-nav > li > a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --- Scroll Animations --- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate').forEach(el => observer.observe(el));

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 16, behavior: 'smooth' });
        // Close mobile nav
        mainNav && mainNav.classList.remove('open');
        navToggle && navToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  /* --- Contact Form --- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Keep _replyto in sync with the email field
    const emailInput = document.getElementById('email');
    const replyto    = document.getElementById('replyto');
    if (emailInput && replyto) {
      emailInput.addEventListener('input', () => { replyto.value = emailInput.value; });
    }

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const formSuccess = document.getElementById('formSuccess');
      const formError   = document.getElementById('formError');
      formSuccess.style.display = 'none';
      formError.style.display   = 'none';

      // Required-field validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#e53e3e';
          valid = false;
        }
      });
      if (!valid) return;

      const btn = document.getElementById('submitBtn');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const payload = {};
        formData.forEach((value, key) => { payload[key] = value; });

        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });

        const data = await res.json();
        if (res.ok && data.success) {
          contactForm.reset();
          formSuccess.style.display = 'block';
        } else {
          formError.style.display = 'block';
        }
      } catch (err) {
        formError.style.display = 'block';
      } finally {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }
    });

    // Clear red borders on input
    contactForm.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => { field.style.borderColor = ''; });
    });
  }

})();
