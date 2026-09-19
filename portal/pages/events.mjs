import { eventEmptyMessages, events, eventTypes } from '../content/events.mjs';
import { webinars } from '../content/webinars.mjs';
import { escapeHtml } from '../lib/html.mjs';
import { getPublishedWebinars, normalizeWebinarRecord } from '../lib/webinars.mjs';
import { renderEventCard, renderTags, renderWebinarCard } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderEventsPage({ helpers, route }) {
  const published = events.filter(event => event.published);
  const upcoming = published.filter(event => event.status === 'upcoming');
  const completed = published.filter(event => event.status === 'completed');
  const webinarEntries = getPublishedWebinars(webinars)
    .filter(webinar => webinar.startDate)
    .map(webinar => normalizeWebinarRecord(webinar));
  const webinarAgenda = webinarEntries
    .filter(webinar => webinar.status === 'upcoming')
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const webinarArchive = webinarEntries
    .filter(webinar => webinar.status !== 'upcoming')
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));
  const years = [...new Set(completed.map(event => event.archiveYear))].sort((a, b) => b - a);
  const agendaCards = [
    ...upcoming.map(event => renderEventCard(event, helpers)),
    ...webinarAgenda.map(webinar => renderWebinarCard(webinar, helpers, { projection: 'agenda' })),
  ];
  const webinarArchiveCards = webinarArchive.map(webinar => renderWebinarCard(webinar, helpers, { projection: 'archive' }));
  const html = `${renderPageHero({ eyebrow: 'Agenda y memoria', title: 'Eventos', description: route.description })}
  <section class="section" id="proximos" aria-labelledby="upcoming-title"><div class="container"><div class="section-heading"><p class="eyebrow">Agenda</p><h2 id="upcoming-title">Agenda publicada</h2><p>Actividades con fecha confirmada y acceso a su ficha estable.</p></div>${agendaCards.length ? `<div class="card-grid" data-webinar-agenda-list>${agendaCards.join('')}</div><p class="editorial-note" data-webinar-agenda-empty hidden>No hay actividades con fecha futura en la agenda publicada.</p>` : renderEmptyState({ title: 'Agenda por confirmar', message: eventEmptyMessages.upcoming, icon: 'calendar', compact: true }, helpers)}</div></section>
  <section class="section section--soft" id="realizados" aria-labelledby="completed-title"><div class="container"><div class="section-heading"><p class="eyebrow">Memoria digital</p><h2 id="completed-title">Eventos realizados</h2></div><div class="card-grid">${completed.map(event => renderEventCard(event, helpers)).join('')}</div></div></section>
  <section class="section webinar-event-archive" aria-labelledby="webinar-archive-title" data-webinar-past-section${webinarArchiveCards.length ? '' : ' hidden'}><div class="container"><div class="section-heading"><p class="eyebrow">Webinars</p><h2 id="webinar-archive-title">Archivo de webinars</h2><p>Fichas con fecha transcurrida o grabación disponible, sin inferir resultados del encuentro.</p></div><div class="card-grid" data-webinar-past-list>${webinarArchiveCards.join('')}</div></div></section>
  <section class="section" id="archivo" aria-labelledby="archive-title"><div class="container content-grid"><div><p class="eyebrow">Archivo</p><h2 id="archive-title">Eventos por año</h2><div class="archive-years">${years.map(year => `<span>${year}</span>`).join('')}</div></div><div><h3>Tipos de actividades</h3>${renderTags(eventTypes)}<p>La Expoferia se conserva como evento y experiencia educativa histórica, no como proyecto científico.</p></div></div></section>`;
  return { html, structuredData: [] };
}
