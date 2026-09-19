import { SITE_CONFIG } from '../config/site.mjs';
import { webinarLibraryContent, webinars } from '../content/webinars.mjs';
import {
  createWebinarStructuredData,
  getPublishedWebinars,
  normalizeWebinarRecord,
} from '../lib/webinars.mjs';
import { renderWebinarCard } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderWebinarsPage({ helpers, route }) {
  const published = getPublishedWebinars(webinars).map(webinar => normalizeWebinarRecord(webinar));
  const featured = published.find(webinar => webinar.featured);
  const remaining = published.filter(webinar => webinar !== featured);
  const structuredData = published.flatMap(webinar => {
    const thumbnail = webinar.thumbnail || `https://i.ytimg.com/vi/${webinar.youtubeId}/hqdefault.jpg`;
    const imageUrl = /^https:\/\//i.test(thumbnail)
      ? thumbnail
      : new URL(thumbnail, `${SITE_CONFIG.canonicalOrigin}/`).href;
    return createWebinarStructuredData(webinar, {
      url: helpers.canonicalHref(webinar.routeId),
      imageUrl,
    });
  });
  const html = `${renderPageHero({ eyebrow: 'Divulgación audiovisual', title: webinarLibraryContent.title, description: route.description || webinarLibraryContent.description })}
  <section class="section" aria-labelledby="library-title" data-webinar-library><div class="container"><div class="section-heading"><p class="eyebrow">Colección</p><h2 id="library-title">Webinars e invitaciones</h2><p>Encuentra la información confirmada de cada encuentro y, cuando esté disponible, su grabación.</p></div>${published.length
    ? `${featured ? `<div class="webinar-grid webinar-grid--featured">${renderWebinarCard(featured, helpers)}</div>` : ''}${remaining.length ? `<div class="webinar-grid">${remaining.map(webinar => renderWebinarCard(webinar, helpers)).join('')}</div>` : ''}`
    : renderEmptyState({ title: webinarLibraryContent.emptyTitle, message: webinarLibraryContent.emptyMessage, icon: 'play' }, helpers)}</div></section>`;
  return { html, structuredData };
}
