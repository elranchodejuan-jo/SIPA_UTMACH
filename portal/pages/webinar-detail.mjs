import { SITE_CONFIG } from '../config/site.mjs';
import { webinars } from '../content/webinars.mjs';
import {
  createWebinarStructuredData,
  getWebinarBySlug,
  normalizeWebinarRecord,
} from '../lib/webinars.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderButtonLink, renderTags, renderWebinarPlayer } from '../templates/components.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

const dateFormatter = timeZone => new Intl.DateTimeFormat('es-EC', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone,
});

const timeFormatter = timeZone => new Intl.DateTimeFormat('es-EC', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone,
});

const formatSchedule = webinar => {
  const start = new Date(webinar.startDate);
  const primaryTimeZone = webinar.timeZone || 'America/Guayaquil';
  const primaryLabel = primaryTimeZone === 'America/Guayaquil' ? 'Ecuador' : primaryTimeZone;
  const secondaryTimes = (webinar.secondaryTimeZones || []).map(zone => (
    `${timeFormatter(zone.timeZone).format(start)} ${zone.label}`
  ));
  return Object.freeze({
    date: dateFormatter(primaryTimeZone).format(start),
    times: [`${timeFormatter(primaryTimeZone).format(start)} ${primaryLabel}`, ...secondaryTimes],
  });
};

const resolveWebinar = (route, suppliedWebinar) => {
  const source = suppliedWebinar
    || webinars.find(item => item.id === route.webinarId)
    || getWebinarBySlug(webinars, route.webinarSlug);
  if (!source || source.published !== true || source.status === 'draft') {
    throw new Error(`No existe un webinar público para la ruta ${route.id}.`);
  }
  return normalizeWebinarRecord(source);
};

const absoluteAssetUrl = assetPath => new URL(assetPath, `${SITE_CONFIG.canonicalOrigin}/`).href;

export function renderWebinarDetailPage({ route, helpers, webinar: suppliedWebinar }) {
  const webinar = resolveWebinar(route, suppliedWebinar);
  const posterHref = helpers.assetHref(webinar.thumbnail);
  const canonicalUrl = helpers.canonicalHref();
  const posterUrl = absoluteAssetUrl(webinar.thumbnail);
  const schedule = formatSchedule(webinar);
  const isUpcoming = webinar.status === 'upcoming';
  const explicitTemporalLabel = webinar.status === 'archived'
    ? 'Archivo'
    : webinar.status === 'available'
      ? 'Grabación disponible'
      : null;
  const temporalLabel = explicitTemporalLabel
    ? `<span class="webinar-detail__temporal">${escapeHtml(explicitTemporalLabel)}</span>`
    : `<span class="webinar-detail__temporal" data-webinar-temporal data-webinar-date="${escapeAttribute(webinar.date)}" data-webinar-start="${escapeAttribute(webinar.startDate)}" data-webinar-time-zone="${escapeAttribute(webinar.timeZone)}">Fecha programada</span>`;
  const actions = [
    webinar.registrationUrl ? renderButtonLink({ href: webinar.registrationUrl, label: 'Inscripción gratuita', external: true }) : '',
    webinar.joinUrl ? renderButtonLink({ href: webinar.joinUrl, label: 'Unirse por Zoom', variant: 'secondary', external: true }) : '',
  ].filter(Boolean).join('');
  const actionBlock = actions
    ? `<div class="webinar-detail__actions" data-webinar-actions>${actions}</div>`
    : '';
  const accessNote = actions
    ? '<p class="webinar-detail__access-note">Puedes completar la inscripción o utilizar el acceso directo a Zoom.</p>'
    : '';
  const recording = webinar.hasRecording
    ? `<section class="section section--soft" aria-labelledby="webinar-recording-title"><div class="container webinar-detail__recording"><div class="section-heading"><p class="eyebrow">Grabación</p><h2 id="webinar-recording-title">Ver webinar</h2></div>${renderWebinarPlayer(webinar, helpers)}<div class="section-action">${renderButtonLink({ href: webinar.youtubeUrl, label: 'Ver en YouTube', variant: 'text', external: true })}</div></div></section>`
    : '';

  const html = `${renderPageHero({
    eyebrow: webinar.isAccessibleForFree ? 'Webinar gratuito' : 'Webinar',
    title: webinar.title,
    description: webinar.description,
  })}
  <section class="section" aria-labelledby="webinar-invitation-title" data-webinar-detail data-webinar-slug="${escapeAttribute(webinar.slug)}">
    <div class="container webinar-detail">
      <figure class="webinar-detail__poster-frame">
        <a href="${escapeAttribute(posterHref)}" aria-label="Abrir el afiche de ${escapeAttribute(webinar.title)} en tamaño completo">
          <img class="webinar-detail__poster" data-webinar-poster src="${escapeAttribute(posterHref)}" alt="${escapeAttribute(webinar.thumbnailAlt)}" width="${webinar.thumbnailWidth}" height="${webinar.thumbnailHeight}" decoding="async" fetchpriority="high">
        </a>
        <figcaption>Afiche oficial del webinar.</figcaption>
      </figure>
      <div class="webinar-detail__content">
        <div class="webinar-detail__status"><span>${escapeHtml(webinar.isAccessibleForFree ? 'Webinar gratuito' : 'Webinar')}</span>${temporalLabel}</div>
        <p class="eyebrow">${escapeHtml(webinar.headline || 'Invitación SIPA')}</p>
        <h2 id="webinar-invitation-title">${isUpcoming ? 'Participa en este encuentro' : 'Información del encuentro'}</h2>
        ${isUpcoming && webinar.invitation ? `<p class="webinar-detail__lead">${escapeHtml(webinar.invitation)}</p>` : ''}
        <dl class="webinar-detail__facts">
          <div><dt>Expositor</dt><dd><strong>${escapeHtml(webinar.speaker)}</strong>${webinar.speakerRole ? `<span class="webinar-detail__speaker-role">${escapeHtml(webinar.speakerRole)}</span>` : ''}</dd></div>
          <div><dt>Fecha</dt><dd><time datetime="${escapeAttribute(webinar.startDate)}">${escapeHtml(schedule.date)}</time></dd></div>
          <div><dt>Hora</dt><dd>${schedule.times.map(escapeHtml).join(' <span aria-hidden="true">·</span> ')}</dd></div>
          <div><dt>Plataforma</dt><dd>${escapeHtml(webinar.platform)}</dd></div>
          ${webinar.sponsor ? `<div><dt>Auspicio</dt><dd>${escapeHtml(webinar.sponsor)}</dd></div>` : ''}
        </dl>
        <p>${escapeHtml(webinar.summary)}</p>
        ${renderTags([...(webinar.topics || []), ...(webinar.species || [])])}
        ${actionBlock}
        ${webinar.meetingId ? `<p class="webinar-detail__meeting"><span>ID de reunión de Zoom</span><code data-webinar-meeting-id>${escapeHtml(webinar.meetingId)}</code></p>` : ''}
        ${accessNote}
        ${webinar.tagline ? `<p class="webinar-detail__tagline">${escapeHtml(webinar.tagline)}</p>` : ''}
      </div>
    </div>
  </section>
  ${recording}`;

  return {
    html,
    structuredData: createWebinarStructuredData(webinar, { url: canonicalUrl, imageUrl: posterUrl }),
    socialImage: webinar.thumbnail,
    socialImageAlt: webinar.thumbnailAlt,
    socialImageWidth: webinar.thumbnailWidth,
    socialImageHeight: webinar.thumbnailHeight,
  };
}
