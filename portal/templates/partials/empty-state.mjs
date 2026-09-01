import { escapeHtml } from '../../lib/html.mjs';
import { renderIcon } from './icons.mjs';

export function renderEmptyState({ title, message, icon = 'resource', compact = false }, helpers) {
  return `<div class="empty-state${compact ? ' empty-state--compact' : ''}" role="status">
    ${renderIcon(icon, helpers, { className: 'empty-state__icon' })}
    <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>
  </div>`;
}
