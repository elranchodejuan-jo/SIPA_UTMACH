import { siteData } from '../data/site';
import { openLightbox } from './lightbox';

let visibleItems: typeof siteData.gallery = [];

interface CarouselOptions {
  elementId: string;
  items: typeof siteData.gallery;
  ariaLabel: string;
  showCaptions: boolean;
  enableLightbox: boolean;
  durationSeconds: number;
}

function renderCarousel({
  elementId,
  items,
  ariaLabel,
  showCaptions,
  enableLightbox,
  durationSeconds,
}: CarouselOptions): void {
  const carousel = document.getElementById(elementId);
  if (!carousel) return;

  carousel.className = 'gallery-carousel reveal';
  if (!showCaptions) carousel.classList.add('gallery-carousel--captionless');
  carousel.setAttribute('aria-label', ariaLabel);

  const carouselItems = items.filter((item) => item.visible);

  if (carouselItems.length === 0) {
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
  viewport.tabIndex = 0;
  const track = document.createElement('div');
  track.className = 'gallery-carousel__track';
  track.style.setProperty('--gallery-scroll-duration', `${durationSeconds}s`);

  // A duplicated group lets the ribbon loop without a visible jump.
  [false, true].forEach((isDuplicate) => {
    const group = document.createElement('div');
    group.className = 'gallery-carousel__group';
    if (isDuplicate) group.setAttribute('aria-hidden', 'true');

    carouselItems.forEach((item, index) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-carousel__item';

      const image = document.createElement('img');
      image.src = item.thumbnail || item.src;
      image.alt = isDuplicate ? '' : item.alt;
      image.loading = 'lazy';
      image.width = 1600;
      image.height = 900;
      image.className = 'gallery-carousel__image';

      figure.appendChild(image);

      if (showCaptions) {
        const caption = document.createElement('figcaption');
        caption.className = 'gallery-carousel__caption';
        caption.textContent = item.caption;
        figure.appendChild(caption);
      }

      if (!isDuplicate && enableLightbox) {
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

export function initGallery(): void {
  document.getElementById('gallery-filters')?.remove();
  visibleItems = siteData.gallery.filter((item) => item.visible);

  renderCarousel({
    elementId: 'gallery-grid',
    items: siteData.gallery,
    ariaLabel: 'Galería de actividades del proceso',
    showCaptions: true,
    enableLightbox: true,
    durationSeconds: 36,
  });

  renderCarousel({
    elementId: 'open-house-gallery',
    items: siteData.openHouseGallery,
    ariaLabel: 'Galería de Casa Abierta 2026 de Medicina Veterinaria',
    showCaptions: false,
    enableLightbox: false,
    durationSeconds: 58,
  });
}

export function getVisibleGalleryItems() {
  return visibleItems;
}
