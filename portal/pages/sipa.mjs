import { sipaContent } from '../content/sipa.mjs';
import { escapeHtml } from '../lib/html.mjs';
import { renderButtonLink } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderIcon } from '../templates/partials/icons.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderSipaPage({ helpers, route }) {
  const html = `${renderPageHero({ eyebrow: 'Identidad SIPA', title: 'SIPA: identidad y propósito', description: route.description })}
  <section class="section" id="quienes-somos" aria-labelledby="about-title"><div class="container content-grid"><div><p class="eyebrow">SIPA UTMACH</p><h2 id="about-title">${escapeHtml(sipaContent.introduction.title)}</h2></div><p>${escapeHtml(sipaContent.introduction.description)}</p></div></section>
  <section class="section section--soft" id="proposito" aria-labelledby="purpose-title"><div class="container content-grid"><div><p class="eyebrow">Identidad</p><h2 id="purpose-title">${escapeHtml(sipaContent.purpose.title)}</h2></div><p class="lead">${escapeHtml(sipaContent.purpose.description)}</p></div></section>
  <section class="section" id="como-trabajamos" aria-labelledby="work-title"><div class="container"><div class="section-heading"><p class="eyebrow">Principios de trabajo</p><h2 id="work-title">Cómo trabajamos</h2></div><div class="card-grid card-grid--four">${sipaContent.workPrinciples.map(principle => `<article class="card principle-card">${renderIcon(principle.icon, helpers, { className: 'card__icon' })}<h3>${escapeHtml(principle.title)}</h3><p>${escapeHtml(principle.description)}</p></article>`).join('')}</div><ol class="process-steps">${sipaContent.workflow.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></div></li>`).join('')}</ol></div></section>
  <section class="section section--ink" id="objetivos" aria-labelledby="objectives-title"><div class="container content-grid"><div><p class="eyebrow">Orientación</p><h2 id="objectives-title">Objetivos de trabajo</h2></div><ul class="check-list">${sipaContent.objectives.map(objective => `<li>${escapeHtml(objective)}</li>`).join('')}</ul></div></section>
  <section class="section" id="historia" aria-labelledby="history-title"><div class="container"><div class="section-heading"><p class="eyebrow">Evolución</p><h2 id="history-title">${escapeHtml(sipaContent.history.title)}</h2></div>${renderEmptyState({ title: 'Cronología en revisión', message: sipaContent.history.emptyMessage, icon: 'calendar', compact: true }, helpers)}</div></section>
  <section class="section section--soft" id="utmach" aria-labelledby="utmach-title"><div class="container content-grid"><div><p class="eyebrow">Universidad Técnica de Machala</p><h2 id="utmach-title">${escapeHtml(sipaContent.utmach.title)}</h2></div><div><p>${escapeHtml(sipaContent.utmach.description)}</p><div class="button-row">${renderButtonLink({ href: helpers.routeHref('team'), label: 'Conocer el equipo', variant: 'secondary' })}${renderButtonLink({ href: helpers.routeHref('research'), label: 'Explorar investigación' })}</div></div></div></section>`;
  return { html, structuredData: [] };
}
