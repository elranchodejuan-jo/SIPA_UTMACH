import { siteData } from '../data/site';
import { openLightbox } from './lightbox';

let visibleItems: typeof siteData.gallery = [];

export function initGallery(): void {
  const carousel = document.getElementById('gallery-grid');
  if (!carousel) return;

  carousel.className = 'gallery-carousel reveal';
  carousel.setAttribute('aria-label', 'Galería de actividades del proceso');
  document.getElementById('gallery-filters')?.remove();

  visibleItems = siteData.gallery.filter((item) => item.visible);

  if (visibleItems.length === 0) {
    const message = document.createElement('div');
    message.className = 'gallery-empty';
    const text = document.createElement('p');
    text.textContent = 'Las fotografías estarán disponibles próximamente.';
    message.appendChild(text);
    carousel.appendChild(message);
    return;
  }

  const viewport = document.createElement('div');
  viewport.className = 'gallery-carousel__viewport';
  const track = document.createElement('div');
  track.className = 'gallery-carousel__track';

  // A duplicated group lets the ribbon loop without a visible jump.
  [false, true].forEach((isDuplicate) => {
    const group = document.createElement('div');
    group.className = 'gallery-carousel__group';
    if (isDuplicate) group.setAttribute('aria-hidden', 'true');

    visibleItems.forEach((item, index) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-carousel__item';

      const image = document.createElement('img');
      image.src = item.thumbnail || item.src;
      image.alt = isDuplicate ? '' : item.alt;
      image.loading = 'lazy';
      image.width = 1600;
      image.height = 900;
      image.className = 'gallery-carousel__image';

      const caption = document.createElement('figcaption');
      caption.className = 'gallery-carousel__caption';
      caption.textContent = item.caption;

      figure.appendChild(image);
      figure.appendChild(caption);

      if (!isDuplicate) {
        figure.tabIndex = 0;
        figure.setAttribute('role', 'button');
        figure.setAttribute('aria-label', `Ver imagen: ${item.alt}`);
        const openHandler = () => openLightbox(index);
        figure.addEventListener('click', openHandler);
        figure.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openHandler();
          }
        });
      }

      group.appendChild(figure);
    });

    track.appendChild(group);
  });

  viewport.appendChild(track);
  carousel.appendChild(viewport);
}

export function getVisibleGalleryItems() {
  return visibleItems;
}
