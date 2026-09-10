import { teamCategories, teamContent, teamMembers } from '../content/team.mjs';
import { contactChannels } from '../content/socials.mjs';
import { publishedInOrder, sortByOrder } from '../lib/content.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderButtonLink, renderContactIconLinks, renderTeamCard } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderTeamPage({ helpers, route }) {
  const published = publishedInOrder(teamMembers).filter(member => member.personStatus === 'confirmed');
  const groups = sortByOrder(teamCategories).map(category => ({
    ...category,
    members: published.filter(member => member.category === category.id),
  }));
  const publishedChannels = publishedInOrder(contactChannels);
  const html = `${renderPageHero({ eyebrow: 'Comunidad SIPA', title: 'Equipo', description: route.description || teamContent.introduction })}
  <section class="section team-section" aria-labelledby="team-directory"><div class="container"><div class="section-heading"><p class="eyebrow">Directorio</p><h2 id="team-directory">Personas que integran SIPA</h2><p>${escapeHtml(teamContent.introduction)}</p></div>${published.length
    ? groups.filter(group => group.members.length).map(group => {
      const gridModifiers = [
        group.layout === 'featured' ? 'team-grid--featured' : '',
        group.members.length === 1 ? 'team-grid--single' : '',
      ].filter(Boolean).join(' ');
      const aliases = (group.legacyAnchors || []).map(anchor => `<span class="team-group__anchor-alias" id="${escapeAttribute(anchor)}" aria-hidden="true"></span>`).join('');
      return `<section class="team-group team-group--${escapeAttribute(group.layout)}" id="${escapeAttribute(group.id)}" aria-labelledby="team-${escapeAttribute(group.id)}">${aliases}<h3 id="team-${escapeAttribute(group.id)}">${escapeHtml(group.label)}</h3><div class="team-grid${gridModifiers ? ` ${gridModifiers}` : ''}">${group.members.map(member => renderTeamCard(member, helpers)).join('')}</div></section>`;
    }).join('')
    : `${renderEmptyState({ title: teamContent.emptyTitle, message: teamContent.emptyMessage, icon: 'people' }, helpers)}<ul class="team-categories" aria-label="Categorías preparadas">${sortByOrder(teamCategories).map(category => `<li id="${escapeAttribute(category.id)}">${escapeHtml(category.label)}</li>`).join('')}</ul>`}</div></section>
  <section class="section section--soft team-contact-section" aria-labelledby="team-contact-title"><div class="container team-contact-panel"><div><p class="eyebrow">Canales institucionales</p><h2 id="team-contact-title">Contactar con SIPA</h2><p>Consulta los canales institucionales confirmados para comunicarte con el semillero.</p></div><div class="team-contact-panel__actions">${renderContactIconLinks(publishedChannels, helpers, { ownerName: 'SIPA' })}${renderButtonLink({ href: helpers.routeHref('contact'), label: 'Ver todos los canales', variant: 'secondary' })}</div></div></section>`;
  return { html, structuredData: [] };
}
