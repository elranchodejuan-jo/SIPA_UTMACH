import { ROUTES, getRouteById, getPublishedRoutes } from './routes.mjs';
import { canonicalHref, routeHref } from '../lib/urls.mjs';

export const FOOTER_GROUPS = Object.freeze([
  Object.freeze({ id: 'sipa', label: 'SIPA', order: 10 }),
  Object.freeze({ id: 'research', label: 'Investigación', order: 20 }),
  Object.freeze({ id: 'outreach', label: 'Divulgación', order: 30 }),
]);

const resolveSection = (route, sectionId) => route.sections.find(section => section.id === sectionId) ?? null;

const navigationItem = (fromRouteId, ownerRoute, item = {}) => {
  const targetRoute = item.routeId ? getRouteById(item.routeId) : ownerRoute;
  if (!targetRoute?.published) return null;
  const section = item.sectionId ? resolveSection(ownerRoute, item.sectionId) : null;
  if (item.sectionId && !section) throw new Error(`Sección no registrada en ${ownerRoute.id}: ${item.sectionId}`);
  const fragment = item.sectionId ?? null;

  return Object.freeze({
    id: fragment ? `${ownerRoute.id}-${fragment}` : targetRoute.id,
    routeId: targetRoute.id,
    label: item.label ?? section?.label ?? targetRoute.navLabel,
    fragment,
    path: targetRoute.path,
    href: fromRouteId ? routeHref(fromRouteId, targetRoute.id, fragment) : targetRoute.path,
  });
};

export const getPrimaryNavigation = fromRouteId => getPublishedRoutes()
  .filter(route => route.navigation.primary)
  .sort((a, b) => a.navigation.order - b.navigation.order)
  .map(route => Object.freeze({
    ...navigationItem(fromRouteId, route),
    activeNavId: route.activeNavId,
    items: route.navigation.submenu
      .map(item => navigationItem(fromRouteId, route, item))
      .filter(Boolean),
  }));

export const getFooterNavigation = fromRouteId => FOOTER_GROUPS.map(group => {
  const items = [];
  for (const route of getPublishedRoutes()) {
    for (const footerItem of route.navigation.footer.filter(item => item.group === group.id)) {
      const item = navigationItem(fromRouteId, route, footerItem);
      if (item) items.push({ ...item, order: footerItem.order ?? 100 });
    }
  }
  items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'es'));
  return Object.freeze({
    ...group,
    items: Object.freeze(items.map(({ order: _order, ...item }) => Object.freeze(item))),
  });
}).filter(group => group.items.length > 0);

export const getBreadcrumbs = (routeOrId, fromRouteId = typeof routeOrId === 'string' ? routeOrId : routeOrId.id) => {
  const route = typeof routeOrId === 'string' ? getRouteById(routeOrId) : routeOrId;
  if (!route) throw new Error(`Ruta no registrada: ${String(routeOrId)}`);
  if (route.id === 'home') return [];

  const ancestry = [];
  const visited = new Set();
  let current = route;
  while (current) {
    if (visited.has(current.id)) throw new Error(`Ciclo detectado en breadcrumbs: ${current.id}`);
    visited.add(current.id);
    ancestry.unshift(current);
    current = current.parentId ? getRouteById(current.parentId) : null;
  }
  if (ancestry[0]?.id !== 'home') ancestry.unshift(getRouteById('home'));

  return ancestry.map((item, index) => Object.freeze({
    id: item.id,
    label: item.navLabel,
    path: item.path,
    href: routeHref(fromRouteId, item.id),
    current: index === ancestry.length - 1,
  }));
};

export const getSitemapRoutes = () => getPublishedRoutes()
  .filter(route => route.sitemap?.include !== false)
  .map(route => Object.freeze({
    id: route.id,
    path: route.path,
    output: route.output,
    loc: canonicalHref(route.id),
    changefreq: route.sitemap.changefreq,
    priority: route.sitemap.priority,
  }));

export const getActiveNavigationId = routeOrId => {
  const route = typeof routeOrId === 'string' ? getRouteById(routeOrId) : routeOrId;
  if (!route) throw new Error(`Ruta no registrada: ${String(routeOrId)}`);
  return route.activeNavId;
};

// Alias explícitos para consumidores que prefieran semántica de derivación.
export const derivePrimaryNavigation = getPrimaryNavigation;
export const deriveFooterNavigation = getFooterNavigation;
export const deriveBreadcrumbs = getBreadcrumbs;
export const deriveSitemapRoutes = getSitemapRoutes;

export { ROUTES };
