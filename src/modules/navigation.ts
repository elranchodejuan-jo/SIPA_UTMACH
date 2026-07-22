export function initNavigation(): void {
  const toggleBtn = document.getElementById('nav-toggle') as HTMLButtonElement | null;
  const navList = document.getElementById('nav-list') as HTMLElement | null;
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav__link');
  const sections = document.querySelectorAll<HTMLElement>('section[id]');

  if (!toggleBtn || !navList) return;

  const closeMenu = (): void => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    navList.classList.remove('nav__list--open');
    document.body.classList.remove('menu-open');
  };

  const openMenu = (): void => {
    toggleBtn.setAttribute('aria-expanded', 'true');
    navList.classList.add('nav__list--open');
    document.body.classList.add('menu-open');
    const firstLink = navList.querySelector('.nav__link') as HTMLElement | null;
    firstLink?.focus();
  };

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    isExpanded ? closeMenu() : openMenu();
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggleBtn.focus();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (toggleBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  });

  // Active section highlighting
  const observerOptions: IntersectionObserverInit = {
    rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '64px'} 0px -60% 0px`,
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        navLinks.forEach((link) => {
          const linkSection = link.getAttribute('data-section');
          if (linkSection === sectionId) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('nav__link--active');
          } else {
            link.removeAttribute('aria-current');
            link.classList.remove('nav__link--active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));

  // Skip link
  const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement | null;
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('contenido-principal');
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
