import { siteData } from '../data/site';

let currentIdx = 0;
let triggerElement: HTMLElement | null = null;
let lightboxEl: HTMLElement | null = null;

function getVisibleItems() {
  return siteData.gallery.filter((item) => item.visible);
}

export function initLightbox(): void {
  lightboxEl = document.getElementById('lightbox');
  if (!lightboxEl) return;

  const closeBtn = lightboxEl.querySelector('.lightbox__close') as HTMLButtonElement;
  const prevBtn = lightboxEl.querySelector('.lightbox__prev') as HTMLButtonElement;
  const nextBtn = lightboxEl.querySelector('.lightbox__next') as HTMLButtonElement;
  const overlay = lightboxEl.querySelector('.lightbox__overlay') as HTMLElement;

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => navigate(-1));
  nextBtn?.addEventListener('click', () => navigate(1));
  overlay?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!lightboxEl || lightboxEl.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);

    // Focus trap
    if (e.key === 'Tab') {
      const focusable = lightboxEl.querySelectorAll<HTMLElement>('button:not([hidden])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Touch swipe
  let touchStartX = 0;
  lightboxEl.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxEl.addEventListener('touchend', (e: TouchEvent) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {
      navigate(diff < 0 ? 1 : -1);
    }
  }, { passive: true });
}

function updateDisplay(): void {
  if (!lightboxEl) return;
  const items = getVisibleItems();
  if (items.length === 0) return;

  const item = items[currentIdx];
  const img = document.getElementById('lightbox-image') as HTMLImageElement;
  const caption = document.getElementById('lightbox-caption');
  const counter = document.getElementById('lightbox-counter');

  if (img) {
    img.src = item.src;
    img.alt = item.alt;
  }
  if (caption) caption.textContent = item.caption;
  if (counter) counter.textContent = `${currentIdx + 1} / ${items.length}`;
}

function navigate(direction: number): void {
  const items = getVisibleItems();
  if (items.length === 0) return;
  currentIdx = (currentIdx + direction + items.length) % items.length;
  updateDisplay();
}

export function openLightbox(index: number): void {
  if (!lightboxEl) return;
  currentIdx = index;
  triggerElement = document.activeElement as HTMLElement;
  lightboxEl.hidden = false;
  document.body.classList.add('lightbox-open');
  updateDisplay();
  const closeBtn = lightboxEl.querySelector('.lightbox__close') as HTMLElement;
  closeBtn?.focus();
}

export function closeLightbox(): void {
  if (!lightboxEl) return;
  lightboxEl.hidden = true;
  document.body.classList.remove('lightbox-open');
  triggerElement?.focus();
}
