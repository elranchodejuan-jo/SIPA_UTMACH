(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  const primaryNav = document.querySelector('.primary-nav');
  const menuBackdrop = document.querySelector('[data-menu-backdrop]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const pageTop = document.querySelector('#page-top');
  const desktopQuery = window.matchMedia('(min-width: 64rem)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeStorageKey = 'sipa-theme';
  let focusBeforeMenu = null;

  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const menuIsOpen = () => menuToggle?.getAttribute('aria-expanded') === 'true';

  const closeSubmenus = exception => {
    document.querySelectorAll('[data-submenu-toggle]').forEach(toggle => {
      if (toggle === exception) return;
      toggle.setAttribute('aria-expanded', 'false');
      const submenu = document.getElementById(toggle.getAttribute('aria-controls'));
      if (submenu) submenu.hidden = true;
    });
  };

  const setMenu = (open, { restoreFocus = false } = {}) => {
    if (!menuToggle || !mobilePanel || !primaryNav || !menuBackdrop) return;
    const shouldOpen = Boolean(open) && !desktopQuery.matches;
    if (shouldOpen) focusBeforeMenu = document.activeElement;
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.setAttribute('aria-label', shouldOpen ? 'Cerrar menú' : 'Abrir menú');
    mobilePanel.classList.toggle('is-open', shouldOpen);
    primaryNav.classList.toggle('is-open', shouldOpen);
    menuBackdrop.hidden = !shouldOpen;
    menuBackdrop.classList.toggle('is-open', shouldOpen);
    body.classList.toggle('menu-open', shouldOpen);

    if (shouldOpen) {
      const firstFocusable = mobilePanel.querySelector(focusableSelector);
      window.requestAnimationFrame(() => firstFocusable?.focus());
    } else {
      closeSubmenus();
      if (restoreFocus && focusBeforeMenu instanceof HTMLElement) focusBeforeMenu.focus();
      focusBeforeMenu = null;
    }
  };

  menuToggle?.addEventListener('click', () => setMenu(!menuIsOpen(), { restoreFocus: menuIsOpen() }));
  menuBackdrop?.addEventListener('click', () => setMenu(false, { restoreFocus: true }));
  mobilePanel?.addEventListener('click', event => {
    if (event.target.closest('a[href]') && !desktopQuery.matches) setMenu(false);
  });

  document.querySelectorAll('[data-submenu-toggle]').forEach(toggle => {
    const submenu = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!submenu) return;
    submenu.hidden = true;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      closeSubmenus(open ? toggle : null);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', `${open ? 'Ocultar' : 'Mostrar'} opciones de ${toggle.closest('.nav-item')?.querySelector('.nav-link')?.textContent.trim() || 'navegación'}`);
      submenu.hidden = !open;
    });
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const openSubmenu = [...document.querySelectorAll('[data-submenu-toggle][aria-expanded="true"]')].at(-1);
      if (openSubmenu) {
        closeSubmenus();
        openSubmenu.focus();
        return;
      }
      if (menuIsOpen()) setMenu(false, { restoreFocus: true });
      return;
    }
    if (event.key !== 'Tab' || !menuIsOpen() || !mobilePanel) return;
    const panelFocusable = [...mobilePanel.querySelectorAll(focusableSelector)].filter(element => !element.closest('[hidden]'));
    const focusable = [...panelFocusable, themeToggle, menuToggle].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const handleDesktopChange = event => {
    if (event.matches) setMenu(false);
  };
  desktopQuery.addEventListener?.('change', handleDesktopChange);

  const setTheme = (theme, persist = true) => {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
    const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
    themeToggle?.setAttribute('aria-label', label);
    themeToggle?.setAttribute('title', label);
    const labelNode = themeToggle?.querySelector('[data-theme-label]');
    if (labelNode) labelNode.textContent = label;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b1b27' : '#075d91');
    if (persist) {
      try { window.localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light'); } catch { /* El almacenamiento puede estar deshabilitado. */ }
    }
  };

  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
  themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  document.querySelectorAll('[data-back-to-top]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      const settle = () => {
        if (window.scrollY > 4) window.scrollTo(0, 0);
        pageTop?.focus({ preventScroll: true });
        if (window.history?.replaceState) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#page-top`);
      };
      if (reducedMotion.matches) window.requestAnimationFrame(settle);
      else window.setTimeout(settle, 550);
    });
  });

  document.addEventListener('click', event => {
    const playButton = event.target.closest('[data-webinar-play]');
    if (!playButton) return;
    const player = playButton.closest('[data-webinar-player]');
    const youtubeId = player?.dataset.youtubeId || '';
    if (!player || !/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
      playButton.disabled = true;
      playButton.setAttribute('aria-label', 'Video no disponible');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.dataset.youtubeEmbed = '';
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0`;
    iframe.title = `Webinar: ${player.dataset.youtubeTitle || 'SIPA'}`;
    iframe.width = '560';
    iframe.height = '315';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    window.requestAnimationFrame(() => iframe.focus());
  });

  document.querySelectorAll('[data-contact-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }
      event.preventDefault();
      const submit = form.querySelector('[data-contact-submit]');
      const status = form.querySelector('[data-contact-status]');
      if (submit) submit.disabled = true;
      if (status) status.textContent = 'Enviando mensaje…';
      try {
        const response = await window.fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        if (status) status.textContent = 'Mensaje enviado correctamente.';
      } catch {
        if (status) status.textContent = 'No fue posible enviar el mensaje. Inténtalo nuevamente o utiliza otro canal institucional.';
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('reveal-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px' });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }

  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach(element => { element.textContent = currentYear; });
  const buildDate = document.querySelector('meta[name="sipa-build-date"]')?.content;
  if (buildDate && !buildDate.includes('__')) {
    const date = new Date(buildDate);
    if (!Number.isNaN(date.getTime())) {
      const formatted = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
      document.querySelectorAll('[data-build-date]').forEach(element => { element.textContent = formatted; });
    }
  }
})();
