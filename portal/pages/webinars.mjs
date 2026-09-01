import { webinarLibraryContent, webinars } from '../content/webinars.mjs';
import { normalizeWebinar } from '../lib/youtube.mjs';
import { renderWebinarCard } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

export function renderWebinarsPage({ helpers, route }) {
  const published = webinars
    .filter(webinar => webinar.published)
    .map(webinar => normalizeWebinar(webinar))
    .filter(Boolean);
  const featured = published.find(webinar => webinar.featured);
  const remaining = published.filter(webinar => webinar !== featured);
  const videoObjects = published.map(webinar => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: webinar.title,
    description: webinar.description || webinar.summary,
    thumbnailUrl: webinar.thumbnail || `https://i.ytimg.com/vi/${webinar.youtubeId}/hqdefault.jpg`,
    uploadDate: webinar.date,
    contentUrl: webinar.youtubeUrl,
    embedUrl: `https://www.youtube-nocookie.com/embed/${webinar.youtubeId}`
  }));
  const html = `${renderPageHero({ eyebrow: 'Divulgación audiovisual', title: webinarLibraryContent.title, description: route.description || webinarLibraryContent.description })}
  <section class="section" aria-labelledby="library-title" data-webinar-library><div class="container"><div class="section-heading"><p class="eyebrow">Colección</p><h2 id="library-title">Webinars publicados</h2></div>${published.length
    ? `${featured ? `<div class="webinar-grid webinar-grid--featured">${renderWebinarCard(featured, helpers)}</div>` : ''}${remaining.length ? `<div class="webinar-grid">${remaining.map(webinar => renderWebinarCard(webinar, helpers)).join('')}</div>` : ''}`
    : renderEmptyState({ title: webinarLibraryContent.emptyTitle, message: webinarLibraryContent.emptyMessage, icon: 'play' }, helpers)}</div></section>`;
  return { html, structuredData: videoObjects };
}
