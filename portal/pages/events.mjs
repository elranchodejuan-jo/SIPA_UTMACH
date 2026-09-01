import { eventEmptyMessages, events, eventTypes } from '../content/events.mjs';
import { escapeHtml } from '../lib/html.mjs';
import { renderEventCard, renderTags } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderEventsPage({ helpers, route }) {
  const published = events.filter(event => event.published);
  const upcoming = published.filter(event => event.status === 'upcoming');
  const completed = published.filter(event => event.status === 'completed');
  const years = [...new Set(completed.map(event => event.archiveYear))].sort((a, b) => b - a);
  const html = `${renderPageHero({ eyebrow: 'Agenda y memoria', title: 'Eventos', description: route.description })}
  <section class="section" id="proximos" aria-labelledby="upcoming-title"><div class="container"><div class="section-heading"><p class="eyebrow">Agenda</p><h2 id="upcoming-title">Próximos eventos</h2></div>${upcoming.length ? `<div class="card-grid">${upcoming.map(event => renderEventCard(event, helpers)).join('')}</div>` : renderEmptyState({ title: 'Agenda por confirmar', message: eventEmptyMessages.upcoming, icon: 'calendar', compact: true }, helpers)}</div></section>
  <section class="section section--soft" id="realizados" aria-labelledby="completed-title"><div class="container"><div class="section-heading"><p class="eyebrow">Memoria digital</p><h2 id="completed-title">Eventos realizados</h2></div><div class="card-grid">${completed.map(event => renderEventCard(event, helpers)).join('')}</div></div></section>
  <section class="section" id="archivo" aria-labelledby="archive-title"><div class="container content-grid"><div><p class="eyebrow">Archivo</p><h2 id="archive-title">Eventos por año</h2><div class="archive-years">${years.map(year => `<span>${year}</span>`).join('')}</div></div><div><h3>Tipos de actividades</h3>${renderTags(eventTypes)}<p>La Expoferia se conserva como evento y experiencia educativa histórica, no como proyecto científico.</p></div></div></section>`;
  return { html, structuredData: [] };
}
