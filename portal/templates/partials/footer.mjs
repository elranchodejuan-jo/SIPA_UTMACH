import { SITE_CONFIG } from '../../config/site.mjs';
import { getFooterNavigation } from '../../config/navigation.mjs';
import { escapeAttribute, escapeHtml } from '../../lib/html.mjs';
import { contactChannels, socialLinks } from '../../content/socials.mjs';
import { renderIcon } from './icons.mjs';

export function renderFooter({ route, helpers, metadata }) {
  const groups = getFooterNavigation(route.id);
  const connected = [...socialLinks, ...contactChannels].filter(item => item.published && item.url);
  const buildYear = Number.parseInt(String(metadata.buildDate).slice(0, 4), 10) || new Date().getFullYear();
  const buildDate = new Date(metadata.buildDate);
  const formattedDate = Number.isNaN(buildDate.getTime()) ? '' : new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(buildDate);

  return `<footer class="site-footer">
    <div class="container site-footer__grid">
      <div class="footer-brand">
        <a class="brand brand--footer" href="${escapeAttribute(helpers.routeHref('home'))}"><img class="brand__mark brand__mark--original" src="${escapeAttribute(helpers.assetHref('assets/images/logo-sipa-original.png'))}" alt="" width="502" height="282"><span class="brand__copy"><strong>${escapeHtml(SITE_CONFIG.name)}</strong><small>${escapeHtml(SITE_CONFIG.fullName)}</small></span></a>
        <p>${escapeHtml(SITE_CONFIG.description)}</p><p class="footer-domain">${escapeHtml(SITE_CONFIG.visualDomain)}</p>
      </div>
      ${groups.map(group => `<nav class="footer-column" aria-labelledby="footer-${escapeAttribute(group.id)}"><h2 id="footer-${escapeAttribute(group.id)}">${escapeHtml(group.label)}</h2><ul>${group.items.map(item => `<li><a href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a></li>`).join('')}</ul></nav>`).join('')}
      <div class="footer-column footer-connect"><h2>Conéctate</h2>${connected.length ? `<ul class="social-list" aria-label="Redes y contacto de SIPA">${connected.map(item => { const external = /^https?:/i.test(item.url); const accessibleLabel = `${item.label} de SIPA`; return `<li><a class="social-icon-link" href="${escapeAttribute(item.url)}" aria-label="${escapeAttribute(accessibleLabel)}" title="${escapeAttribute(accessibleLabel)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${renderIcon(item.icon || 'external', helpers)}<span class="visually-hidden">${escapeHtml(accessibleLabel)}${external ? ' (se abre en una pestaña nueva)' : ''}</span></a></li>`; }).join('')}</ul>` : '<p>Canales institucionales en actualización.</p>'}</div>
    </div>
    <div class="container footer-bottom">
      <p>© <span data-current-year>${buildYear}</span> SIPA · ${escapeHtml(SITE_CONFIG.organization.name)}</p>
      <p class="footer-build">Actualizado <time datetime="${escapeAttribute(metadata.buildDate)}" data-build-date>${escapeHtml(formattedDate)}</time> · v${escapeHtml(metadata.version)} · ${escapeHtml(metadata.buildSha)}</p>
      <a class="back-to-top" href="#page-top" data-back-to-top>${renderIcon('arrow-up', helpers)}<span>Volver arriba</span></a>
    </div>
  </footer>`;
}
