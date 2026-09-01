import path from 'node:path';
import { SITE_CONFIG } from '../config/site.mjs';
import { getRouteById } from '../config/routes.mjs';

const asRoute = routeOrId => {
  if (typeof routeOrId === 'object' && routeOrId?.id) return routeOrId;
  const route = getRouteById(routeOrId);
  if (!route) throw new Error(`Ruta no registrada: ${String(routeOrId)}`);
  return route;
};

const normalizeFragment = fragment => {
  if (fragment == null || fragment === '') return '';
  const value = String(fragment).replace(/^#/, '');
  if (!/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(value)) throw new Error(`Fragmento de URL inválido: ${fragment}`);
  return `#${value}`;
};

const withDirectorySlash = relativePath => {
  if (relativePath === '') return './';
  if (relativePath === '..') return '../';
  const prefixed = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
};

export const outputPath = routeOrId => asRoute(routeOrId).output;

export const routeHref = (fromRouteOrId, toRouteOrId, fragment) => {
  const fromRoute = asRoute(fromRouteOrId);
  const toRoute = asRoute(toRouteOrId);
  const hash = normalizeFragment(fragment);
  if (fromRoute.id === toRoute.id && hash) return hash;

  const fromDirectory = path.posix.dirname(fromRoute.output);
  const toDirectory = path.posix.dirname(toRoute.output);
  return `${withDirectorySlash(path.posix.relative(fromDirectory, toDirectory))}${hash}`;
};

export const assetHref = (fromRouteOrId, assetPath) => {
  const fromRoute = asRoute(fromRouteOrId);
  const normalized = String(assetPath ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || normalized.split('/').includes('..') || /^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    throw new Error(`Ruta de asset inválida: ${assetPath}`);
  }

  const fromDirectory = path.posix.dirname(fromRoute.output);
  const relative = path.posix.relative(fromDirectory, normalized);
  return relative.startsWith('.') ? relative : `./${relative}`;
};

export const canonicalHref = (routeOrId, fragment) => {
  const route = asRoute(routeOrId);
  const canonical = new URL(route.path, `${SITE_CONFIG.canonicalOrigin}/`);
  canonical.hash = normalizeFragment(fragment).replace(/^#/, '');
  return canonical.href;
};

export const createRouteHelpers = fromRouteOrId => {
  const route = asRoute(fromRouteOrId);
  return Object.freeze({
    route,
    routeHref: (targetRouteOrId, fragment) => routeHref(route, targetRouteOrId, fragment),
    assetHref: assetPath => assetHref(route, assetPath),
    canonicalHref: (targetRouteOrId = route, fragment) => canonicalHref(targetRouteOrId, fragment),
    outputPath: (targetRouteOrId = route) => outputPath(targetRouteOrId),
  });
};

export const normalizeExternalUrl = (value, { allowedProtocols = ['https:', 'http:'] } = {}) => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    const url = new URL(value.trim());
    if (!allowedProtocols.includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
};

export const isValidExternalUrl = (value, options) => normalizeExternalUrl(value, options) !== null;

export const normalizeEmailHref = value => {
  if (typeof value !== 'string') return null;
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return `mailto:${email}`;
};

export const normalizeWhatsAppHref = value => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const digits = String(value).replace(/[\s()+.-]/g, '');
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}`;
};

export const isSafePublicHref = value => {
  if (typeof value !== 'string' || value.trim() === '' || value.trim() === '#') return false;
  const href = value.trim();
  if (/^(?:javascript|data|vbscript):/i.test(href)) return false;
  return href.startsWith('#') || href.startsWith('./') || href.startsWith('../') || isValidExternalUrl(href) || normalizeEmailHref(href.replace(/^mailto:/i, '')) === href;
};
