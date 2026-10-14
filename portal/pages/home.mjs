import { homeContent } from '../content/home.mjs';
import { researchAreas } from '../content/research.mjs';
import { events } from '../content/events.mjs';
import { webinars } from '../content/webinars.mjs';
import { renderEventCard, renderResearchArea, renderButtonLink, renderWebinarCard } from '../templates/components.mjs';
import { renderIcon } from '../templates/partials/icons.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { getPublishedWebinars, normalizeWebinarRecord } from '../lib/webinars.mjs';

export function renderHomePage({ helpers }) {
  const featuredEvent = events.find(event => event.published && event.featured);
  const publishedWebinars = getPublishedWebinars(webinars).map(webinar => normalizeWebinarRecord(webinar));
  const featuredWebinar = publishedWebinars.find(webinar => webinar.featured);
  const recentWebinars = publishedWebinars
    .filter(webinar => webinar.status === 'archived' || webinar.status === 'available')
    .sort((a, b) => String(b.startDate || b.date).localeCompare(String(a.startDate || a.date)))
    .slice(0, 2);

  const html = `<section class="home-hero" aria-labelledby="home-title">
    <div class="container home-hero__grid">
      <div class="home-hero__copy reveal">
        <p class="eyebrow">${escapeHtml(homeContent.hero.eyebrow)}</p>
        <h1 id="home-title">${escapeHtml(homeContent.hero.title)}</h1>
        <p class="home-hero__lead">${escapeHtml(homeContent.hero.description)}</p>
        <div class="home-hero__actions">
          ${renderButtonLink({ helpers, href: helpers.routeHref(homeContent.hero.primaryAction.routeId), label: homeContent.hero.primaryAction.label })}
          ${renderButtonLink({ helpers, href: helpers.routeHref(homeContent.hero.secondaryAction.routeId), label: homeContent.hero.secondaryAction.label, variant: 'secondary' })}
        </div>
        <a class="text-link" href="${escapeAttribute(helpers.routeHref(homeContent.hero.supportingAction.routeId))}">${escapeHtml(homeContent.hero.supportingAction.label)} ${renderIcon('arrow-right', helpers)}</a>
      </div>
      <div class="hero-visual reveal">
        <img src="${escapeAttribute(helpers.assetHref('assets/images/hero-sipa.svg'))}" alt="Composición institucional de producción animal e investigación científica" width="800" height="640" decoding="async">
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="home-introduction">
    <div class="container content-grid content-grid--intro">
      <div>
        <p class="eyebrow">${escapeHtml(homeContent.introduction.eyebrow)}</p>
        <h2 id="home-introduction">${escapeHtml(homeContent.introduction.title)}</h2>
      </div>
      <div><p>${escapeHtml(homeContent.introduction.description)}</p><a class="text-link" href="${escapeAttribute(helpers.routeHref('sipa'))}">Descubrir quiénes somos ${renderIcon('arrow-right', helpers)}</a></div>
    </div>
  </section>

  <section class="section section--soft" aria-labelledby="home-areas">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">Áreas de trabajo</p><h2 id="home-areas">Producción animal multiespecie</h2><p>Estos campos organizan el contenido actual del portal sin presentarse como líneas oficiales no confirmadas.</p></div>
      <div class="card-grid card-grid--three">${researchAreas.filter(area => area.published).map(area => renderResearchArea(area, helpers)).join('')}</div>
      <div class="section-action"><a class="text-link" href="${escapeAttribute(helpers.routeHref('research', 'lineas'))}">Explorar investigación ${renderIcon('arrow-right', helpers)}</a></div>
    </div>
  </section>

  <section class="section section--ink" aria-labelledby="home-research">
    <div class="container content-grid">
      <div><p class="eyebrow">${escapeHtml(homeContent.researchHighlight.eyebrow)}</p><h2 id="home-research">${escapeHtml(homeContent.researchHighlight.title)}</h2></div>
      <div><p>${escapeHtml(homeContent.researchHighlight.description)}</p>${renderButtonLink({ helpers, href: helpers.routeHref('research'), label: 'Ir a Investigación', variant: 'light' })}</div>
    </div>
  </section>

  <section class="section" aria-labelledby="home-webinar">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">Divulgación prioritaria</p><h2 id="home-webinar" data-home-webinar-heading>${featuredWebinar ? 'Webinar destacado' : publishedWebinars.length ? 'Biblioteca de webinars' : 'Webinar destacado'}</h2></div>
      ${featuredWebinar
        ? `<div data-home-webinar-featured><div class="webinar-grid">${renderWebinarCard(featuredWebinar, helpers)}</div></div>
          <div data-home-webinar-past hidden>${renderEmptyState({ title: 'Biblioteca de webinars', message: 'La fecha de la invitación destacada ya transcurrió. Consulta su ficha y futuras actividades en la biblioteca.', icon: 'play', compact: true }, helpers)}</div>`
        : recentWebinars.length
          ? `<div class="webinar-grid">${recentWebinars.map(webinar => renderWebinarCard(webinar, helpers)).join('')}</div>`
          : renderEmptyState({ title: 'Biblioteca preparada', message: 'Los webinars aparecerán aquí cuando sus datos hayan sido confirmados.', icon: 'play', compact: true }, helpers)}
      <div class="section-action"><a class="text-link" href="${escapeAttribute(helpers.routeHref('webinars'))}">Abrir biblioteca de webinars ${renderIcon('arrow-right', helpers)}</a></div>
    </div>
  </section>

  <section class="section section--soft" aria-labelledby="home-event">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">Eventos</p><h2 id="home-event">Experiencia destacada</h2></div>
      ${featuredEvent ? `<div class="card-grid">${renderEventCard(featuredEvent, helpers)}</div>` : ''}
    </div>
  </section>

  <section class="section" aria-labelledby="home-team">
    <div class="container content-grid">
      <div><p class="eyebrow">${escapeHtml(homeContent.teamSummary.eyebrow)}</p><h2 id="home-team">${escapeHtml(homeContent.teamSummary.title)}</h2><p>${escapeHtml(homeContent.teamSummary.description)}</p></div>
      <div class="cta-panel">${renderButtonLink({ helpers, href: helpers.routeHref('team'), label: 'Conocer el equipo', variant: 'secondary' })}</div>
    </div>
  </section>

  <section class="section section--cta" aria-labelledby="home-contact">
    <div class="container cta-panel cta-panel--wide">
      <div><p class="eyebrow">${escapeHtml(homeContent.contactCta.eyebrow)}</p><h2 id="home-contact">${escapeHtml(homeContent.contactCta.title)}</h2><p>${escapeHtml(homeContent.contactCta.description)}</p></div>
      ${renderButtonLink({ helpers, href: helpers.routeHref('contact'), label: 'Ver contacto', variant: 'light' })}
    </div>
  </section>`;

  return { html, structuredData: [] };
}
