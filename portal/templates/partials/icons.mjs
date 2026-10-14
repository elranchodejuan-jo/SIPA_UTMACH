import { escapeAttribute } from '../../lib/html.mjs';

export function renderIcon(name, helpers, { className = 'icon', label = '' } = {}) {
  const title = label ? `<title>${escapeAttribute(label)}</title>` : '';
  const accessibility = label
    ? `role="img" aria-label="${escapeAttribute(label)}"`
    : 'aria-hidden="true"';

  return `<svg class="${escapeAttribute(className)}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${accessibility}>${title}<use href="${escapeAttribute(helpers.assetHref('assets/icons/sipa-icons.svg'))}#${escapeAttribute(name)}"></use></svg>`;
}
