(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('[data-nav]')];

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const isDark = theme === 'dark';
    themeToggle?.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#071c2c' : '#005b9f');
    if (persist) {
      try { localStorage.setItem('sipa-theme', theme); } catch { /* almacenamiento no disponible */ }
    }
  };

  themeToggle?.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Abrir menú');
    body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav?.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -42px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id], header[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === id));
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.15, 0.4] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const yearElement = document.querySelector('#current-year');
  const updatedElement = document.querySelector('#last-updated');
  const versionElement = document.querySelector('#site-version');
  const buildDate = document.querySelector('meta[name="sipa-build-date"]')?.content;
  const version = document.querySelector('meta[name="sipa-version"]')?.content;

  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
  if (versionElement && version && !version.includes('__')) versionElement.textContent = version;
  if (updatedElement && buildDate && !buildDate.includes('__')) {
    const date = new Date(buildDate);
    if (!Number.isNaN(date.getTime())) {
      updatedElement.textContent = new Intl.DateTimeFormat('es-EC', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(date);
    }
  }

  const heroVisual = document.querySelector('.hero__visual');
  if (heroVisual && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVisual.addEventListener('pointermove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      heroVisual.querySelector('img')?.style.setProperty('translate', `${x * .4}px ${y * .4}px`);
    });
    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.querySelector('img')?.style.removeProperty('translate');
    });
  }
})();
