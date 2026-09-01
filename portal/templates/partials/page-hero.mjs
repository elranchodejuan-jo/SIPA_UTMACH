import { escapeHtml } from '../../lib/html.mjs';

export function renderPageHero({ eyebrow, title, description, aside = '' }) {
  return `<section class="page-hero" aria-labelledby="page-title">
    <div class="container page-hero__grid">
      <div class="page-hero__copy">
        ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
        <h1 id="page-title">${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      ${aside ? `<div class="page-hero__aside" aria-hidden="true">${aside}</div>` : ''}
    </div>
  </section>`;
}
