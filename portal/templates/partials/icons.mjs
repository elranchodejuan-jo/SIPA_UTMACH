import { escapeAttribute } from '../../lib/html.mjs';

export function renderIcon(name, helpers, { className = 'icon', label = '' } = {}) {
  const title = label ? `<title>${escapeAttribute(label)}</title>` : '';
  const accessibility = label
    ? `role="img" aria-label="${escapeAttribute(label)}"`
    : 'aria-hidden="true" focusable="false"';

  return `<svg class="${escapeAttribute(className)}" ${accessibility}>${title}<use href="${escapeAttribute(helpers.assetHref('assets/icons/sipa-icons.svg'))}#${escapeAttribute(name)}"></use></svg>`;
}
