import { escapeHtml } from '../../lib/html.mjs';
import { renderIcon } from './icons.mjs';

export function renderPageHero({ eyebrow, title, description, aside = '', icon = '', helpers = null }) {
  const resolvedAside = aside || (icon && helpers ? renderIcon(icon, helpers) : '');
  const eyebrowIcon = icon && helpers ? renderIcon(icon, helpers) : '';
  return `<section class="page-hero" aria-labelledby="page-title">
    <div class="container page-hero__grid">
      <div class="page-hero__copy">
        ${eyebrow ? `<p class="eyebrow">${eyebrowIcon}<span>${escapeHtml(eyebrow)}</span></p>` : ''}
        <h1 id="page-title">${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      ${resolvedAside ? `<div class="page-hero__aside" aria-hidden="true">${resolvedAside}</div>` : ''}
    </div>
  </section>`;
}
