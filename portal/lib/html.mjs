const HTML_ENTITIES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => HTML_ENTITIES[character]);
export const escapeText = escapeHtml;
export const escapeAttribute = escapeHtml;
export const escapeAttr = escapeAttribute;

export const safeJson = (value, space = 0) => {
  const json = JSON.stringify(value, null, space);
  if (json === undefined) return 'null';
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};

export const renderJsonLd = value => `<script type="application/ld+json">${safeJson(value)}</script>`;

export const compactHtml = chunks => chunks.flat(Infinity).filter(Boolean).join('');
