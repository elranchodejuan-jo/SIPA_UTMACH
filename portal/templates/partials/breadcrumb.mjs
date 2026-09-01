import { escapeAttribute, escapeHtml } from '../../lib/html.mjs';

export function renderBreadcrumb(items = []) {
  if (!items.length) return '';
  const links = items.map((item, index) => {
    const isLast = index === items.length - 1 || item.current;
    return `<li>${isLast
      ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
      : `<a href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a>`}</li>`;
  }).join('');

  return `<nav class="breadcrumbs container" aria-label="Ruta de navegación"><ol>${links}</ol></nav>`;
}
