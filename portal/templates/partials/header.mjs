import { SITE_CONFIG } from '../../config/site.mjs';
import { getActiveNavigationId, getPrimaryNavigation } from '../../config/navigation.mjs';
import { escapeAttribute, escapeHtml } from '../../lib/html.mjs';
import { renderIcon } from './icons.mjs';

export function renderHeader({ route, helpers, activeRouteId = route.id }) {
  const navigation = getPrimaryNavigation(route.id);
  const activeNavigationId = activeRouteId === route.id ? getActiveNavigationId(route) : null;

  const navigationItems = navigation.map(item => {
    const isActiveBranch = activeNavigationId === item.routeId;
    const submenuId = `submenu-${item.id}`;
    const submenu = item.items.length
      ? `<button class="submenu-toggle" type="button" aria-expanded="false" aria-controls="${escapeAttribute(submenuId)}" aria-label="Mostrar opciones de ${escapeAttribute(item.label)}" data-submenu-toggle>${renderIcon('chevron-down', helpers)}</button>
         <ul class="submenu" id="${escapeAttribute(submenuId)}" data-submenu hidden>${item.items.map(child => `<li><a href="${escapeAttribute(child.href)}">${escapeHtml(child.label)}</a></li>`).join('')}</ul>`
      : '';
    return `<li class="nav-item${isActiveBranch ? ' is-active' : ''}"><div class="nav-item__row"><a class="nav-link" href="${escapeAttribute(item.href)}"${isActiveBranch ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>${submenu}</div></li>`;
  }).join('');

  return `<div class="institution-bar"><div class="container institution-bar__inner"><span>${escapeHtml(SITE_CONFIG.organization.name)} · ${escapeHtml(SITE_CONFIG.organization.career)}</span><a href="${escapeAttribute(SITE_CONFIG.organization.url)}" target="_blank" rel="noopener noreferrer">Portal UTMACH<span class="visually-hidden"> (se abre en una pestaña nueva)</span></a></div></div>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="${escapeAttribute(helpers.routeHref('home'))}" aria-label="Ir al inicio de SIPA">
        <img class="brand__mark" src="${escapeAttribute(helpers.assetHref('assets/logo-sipa.svg'))}" alt="" width="56" height="56">
        <span class="brand__copy"><strong>${escapeHtml(SITE_CONFIG.name)}</strong><small>${escapeHtml(SITE_CONFIG.fullName)}</small><span class="brand__domain">${escapeHtml(SITE_CONFIG.visualDomain)}</span></span>
      </a>
      <nav class="primary-nav" aria-label="Navegación principal">
        <div class="primary-nav__panel" id="primary-nav-panel" data-mobile-panel>
          <ul class="primary-nav__list">${navigationItems}</ul>
        </div>
      </nav>
      <div class="site-header__actions">
        <button class="theme-toggle" type="button" aria-label="Activar modo oscuro" title="Activar modo oscuro" data-theme-toggle>
          ${renderIcon('sun', helpers, { className: 'theme-toggle__sun' })}${renderIcon('moon', helpers, { className: 'theme-toggle__moon' })}<span class="visually-hidden" data-theme-label>Activar modo oscuro</span>
        </button>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav-panel" aria-label="Abrir menú" data-menu-toggle>${renderIcon('menu', helpers, { className: 'nav-toggle__menu' })}${renderIcon('close', helpers, { className: 'nav-toggle__close' })}</button>
      </div>
    </div>
  </header>
  <button class="nav-backdrop" type="button" aria-label="Cerrar menú" data-menu-backdrop hidden></button>`;
}
