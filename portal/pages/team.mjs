import { teamCategories, teamContent, teamMembers } from '../content/team.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderTeamCard } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderTeamPage({ helpers, route }) {
  const published = teamMembers.filter(member => member.published).sort((a, b) => (a.order || 999) - (b.order || 999));
  const groups = teamCategories.map(category => ({ ...category, members: published.filter(member => member.category === category.id) }));
  const html = `${renderPageHero({ eyebrow: 'Comunidad SIPA', title: 'Equipo', description: route.description || teamContent.introduction })}
  <section class="section team-section" aria-labelledby="team-directory"><div class="container"><div class="section-heading"><p class="eyebrow">Directorio</p><h2 id="team-directory">Personas que integran SIPA</h2><p>${escapeHtml(teamContent.introduction)}</p></div>${published.length
    ? groups.filter(group => group.members.length).map(group => `<section class="team-group" id="${escapeAttribute(group.id)}" aria-labelledby="team-${escapeAttribute(group.id)}"><h3 id="team-${escapeAttribute(group.id)}">${escapeHtml(group.label)}</h3><div class="team-grid">${group.members.map(member => renderTeamCard(member, helpers)).join('')}</div></section>`).join('')
    : `${renderEmptyState({ title: teamContent.emptyTitle, message: teamContent.emptyMessage, icon: 'people' }, helpers)}<ul class="team-categories" aria-label="Categorías preparadas">${teamCategories.map(category => `<li id="${escapeAttribute(category.id)}">${escapeHtml(category.label)}</li>`).join('')}</ul>`}</div></section>`;
  return { html, structuredData: [] };
}
