import { outreachContent } from '../content/outreach.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderButtonLink, renderResourceCard, renderTags } from '../templates/components.mjs';
import { renderIcon } from '../templates/partials/icons.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderOutreachPage({ helpers, route }) {
  const html = `${renderPageHero({ eyebrow: 'Divulgación científica', title: 'Divulgación científica', description: route.description })}
  <section class="section" id="webinars" aria-labelledby="webinars-title"><div class="container cta-panel cta-panel--wide"><div><p class="eyebrow">Contenido prioritario</p><h2 id="webinars-title">Webinars SIPA</h2><p>La biblioteca está preparada para integrar encuentros de YouTube con carga diferida y reproducción dentro del portal.</p></div>${renderButtonLink({ href: helpers.routeHref('webinars'), label: 'Abrir biblioteca', variant: 'light' })}</div></section>
  <section class="section section--soft" aria-labelledby="collections-title"><div class="container"><div class="section-heading"><p class="eyebrow">Colecciones</p><h2 id="collections-title">Conocimiento para consultar y compartir</h2><p>${escapeHtml(outreachContent.introduction)}</p></div><div class="card-grid card-grid--four">${outreachContent.collections.map(collection => `<section class="card resource-card" id="${escapeAttribute(collection.id)}" aria-labelledby="collection-${escapeAttribute(collection.id)}">${renderIcon(collection.icon, helpers, { className: 'card__icon' })}<h3 id="collection-${escapeAttribute(collection.id)}">${escapeHtml(collection.title)}</h3><p>${escapeHtml(collection.description)}</p>${collection.items.filter(item => item.published).length ? `<div class="resource-card__items">${collection.items.filter(item => item.published).map(item => renderResourceCard(item, helpers)).join('')}</div>` : `<p class="card__status">${escapeHtml(collection.emptyMessage)}</p>`}</section>`).join('')}</div></div></section>
  <section class="section" aria-labelledby="topics-title"><div class="container content-grid"><div><p class="eyebrow">Clasificación</p><h2 id="topics-title">Especies y temáticas</h2></div><div><p>Los contenidos publicados podrán recorrerse por especie o campo temático cuando el volumen de la colección lo justifique.</p>${renderTags(outreachContent.topics)}</div></div></section>`;
  return { html, structuredData: [] };
}
