import { siteData } from '../data/site';
import { openLightbox } from './lightbox';

let visibleItems: typeof siteData.gallery = [];

export function initGallery(): void {
  const grid = document.getElementById('gallery-grid');
  const filtersContainer = document.getElementById('gallery-filters');
  if (!grid) return;

  visibleItems = siteData.gallery.filter((item) => item.visible);

  if (visibleItems.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'gallery-empty';
    const text = document.createElement('p');
    text.textContent = 'Las fotografías estarán disponibles próximamente.';
    const icon = document.createElement('div');
    icon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-soft)" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    msg.appendChild(icon);
    msg.appendChild(text);
    grid.appendChild(msg);
    return;
  }

  // Render filter buttons
  if (filtersContainer) {
    siteData.galleryCategories.forEach((cat, index) => {
      const btn = document.createElement('button');
      btn.className = `gallery-filter${index === 0 ? ' gallery-filter--active' : ''}`;
      btn.type = 'button';
      btn.textContent = cat.label;
      btn.setAttribute('data-category', cat.id);
      btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.gallery-filter').forEach((b) => {
          b.classList.remove('gallery-filter--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('gallery-filter--active');
        btn.setAttribute('aria-pressed', 'true');
        renderGrid(cat.id, grid);
      });

      filtersContainer.appendChild(btn);
    });
  }

  renderGrid('todas', grid);
}

function renderGrid(categoryId: string, container: HTMLElement): void {
  container.innerHTML = '';
  const filtered = categoryId === 'todas' ? visibleItems : visibleItems.filter((item) => item.category === categoryId);

  if (filtered.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'gallery-empty__text';
    msg.textContent = 'No hay fotografías en esta categoría todavía.';
    container.appendChild(msg);
    return;
  }

  filtered.forEach((item) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `Ver imagen: ${item.alt}`);

    const img = document.createElement('img');
    img.src = item.thumbnail || item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.width = 800;
    img.height = 600;
    img.className = 'gallery-item__image';

    const caption = document.createElement('figcaption');
    caption.className = 'gallery-item__caption';
    caption.textContent = item.caption;

    figure.appendChild(img);
    figure.appendChild(caption);

    const openHandler = () => {
      const globalIndex = visibleItems.indexOf(item);
      openLightbox(globalIndex);
    };

    figure.addEventListener('click', openHandler);
    figure.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHandler();
      }
    });

    container.appendChild(figure);
  });
}

export function getVisibleGalleryItems() {
  return visibleItems;
}
