/* ============================================================
   NARKE BYGG - script.js
   Sticky header, mobile menu, theme toggle, scroll reveal, form.
   ============================================================ */

(function () {
  'use strict';

  const doc = document.documentElement;
  const updateHeaderHeight = () => {
    if (!header) return;
    doc.style.setProperty('--header-height', header.offsetHeight + 'px');
  };

  // ---------- Sticky header
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
    updateHeaderHeight();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateHeaderHeight);
  onScroll();

  // ---------- Mobile menu
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const getMenuFocusables = () => {
    const focusables = [];
    if (burger) focusables.push(burger);
    if (mobileMenu) {
      focusables.push(
        ...mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
      );
    }
    return focusables.filter(
      (element) =>
        element &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true'
    );
  };
  const setMenuState = (open, options = {}) => {
    if (!burger || !mobileMenu) return;
    const { restoreFocus = true } = options;

    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
    burger.setAttribute('title', open ? 'Stäng meny' : 'Öppna meny');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      requestAnimationFrame(() => {
        const focusables = getMenuFocusables();
        const firstMenuLink = focusables.find((element) => element !== burger);
        (firstMenuLink || burger).focus();
      });
    } else if (restoreFocus) {
      burger.focus();
    }
  };
  const closeMenu = () => {
    setMenuState(false);
  };

  if (burger && mobileMenu) {
    updateHeaderHeight();
    setMenuState(false, { restoreFocus: false });

    burger.addEventListener('click', () => {
      const open = !document.body.classList.contains('menu-open');
      setMenuState(open);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();

    if (event.key !== 'Tab' || !document.body.classList.contains('menu-open')) return;

    const focusables = getMenuFocusables();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (!mobileMenu || !burger) return;
    if (mobileMenu.contains(event.target) || burger.contains(event.target)) return;
    closeMenu();
  });

  // ---------- Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = null;
  const applyTheme = (theme) => {
    doc.setAttribute('data-theme', theme);
  };

  localStorage.removeItem('nb-theme');
  applyTheme(systemTheme.matches ? 'dark' : 'light');

  const syncThemeWithSystem = (event) => {
    if (manualTheme) return;
    applyTheme(event.matches ? 'dark' : 'light');
  };

  if (typeof systemTheme.addEventListener === 'function') {
    systemTheme.addEventListener('change', syncThemeWithSystem);
  } else if (typeof systemTheme.addListener === 'function') {
    systemTheme.addListener(syncThemeWithSystem);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      manualTheme = nextTheme;
      applyTheme(nextTheme);
    });
  }

  // ---------- Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;

          const delay = Math.min(index * 60, 240);
          entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((element) => io.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  // ---------- Smooth-scroll offset for sticky header on hash links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      const headerOffset = header ? header.offsetHeight - 8 : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Contact form status
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    const params = new URLSearchParams(window.location.search);
    const formState = params.get('form');

    if (formState === 'success') {
      status.textContent = 'Tack! Din förfrågan har skickats.';
      form.reset();
    } else if (formState === 'invalid') {
      status.textContent = 'Vänligen fyll i namn, e-post och meddelande korrekt.';
    } else if (formState === 'error') {
      status.textContent = 'Något gick fel när formuläret skulle skickas. Försök igen eller mejla ida@narkebygg.se.';
    }

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        status.textContent = '';
      });
    });
  }

  // ---------- Year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
