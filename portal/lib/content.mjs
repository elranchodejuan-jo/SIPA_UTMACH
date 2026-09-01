export const INSTITUTIONAL_CONTENT_STATUSES = Object.freeze(['confirmed', 'draft', 'hidden']);
export const HIDDEN_CONTENT_STATUSES = Object.freeze(['draft', 'hidden']);

export const normalizeContentStatus = (value, { fallback = 'draft', allowed = null } = {}) => {
  const status = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (allowed && !allowed.includes(status)) return fallback;
  return status || fallback;
};

export const isPublished = item => Boolean(
  item
  && item.published === true
  && !HIDDEN_CONTENT_STATUSES.includes(normalizeContentStatus(item.status, { fallback: 'confirmed' })),
);

export const filterPublished = items => {
  if (!Array.isArray(items)) return [];
  return items.filter(isPublished);
};

export const sortByOrder = items => [...items].sort((a, b) => {
  const orderA = Number.isFinite(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
  const orderB = Number.isFinite(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;
  return orderA - orderB;
});

export const publishedInOrder = items => sortByOrder(filterPublished(items));

export const hasText = value => typeof value === 'string' && value.trim().length > 0;

export const presentEntries = record => Object.entries(record ?? {}).filter(([, value]) => {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
});
