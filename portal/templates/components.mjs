import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderIcon } from './partials/icons.mjs';

export function renderTags(items = []) {
  if (!items.length) return '';
  return `<ul class="tag-list" aria-label="Temas">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export function renderButtonLink({ href, label, variant = 'primary', external = false, className = '' }) {
  const externalAttributes = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const externalText = external ? '<span class="visually-hidden"> (se abre en una pestaña nueva)</span>' : '';
  return `<a class="button button--${escapeAttribute(variant)}${className ? ` ${escapeAttribute(className)}` : ''}" href="${escapeAttribute(href)}"${externalAttributes}>${escapeHtml(label)}${externalText}</a>`;
}

export function renderResearchArea(area, helpers) {
  return `<article class="card area-card area-card--${escapeAttribute(area.id)}">
    ${renderIcon(area.icon, helpers, { className: 'card__icon' })}
    <h3>${escapeHtml(area.name)}</h3>
    <p>${escapeHtml(area.description)}</p>
    ${renderTags(area.topics)}
  </article>`;
}

export function renderProjectCard(project, helpers) {
  const href = project.externalUrl || (project.routeId ? helpers.routeHref(project.routeId) : '');
  return `<article class="card project-card">
    <p class="card__meta">${escapeHtml(project.status || 'En desarrollo')}</p>
    <h3>${escapeHtml(project.title)}</h3>
    <p>${escapeHtml(project.summary)}</p>
    ${renderTags([...(project.species || []), ...(project.topics || [])])}
    ${href ? renderButtonLink({ href, label: 'Conocer proyecto', variant: 'secondary', external: Boolean(project.externalUrl) }) : ''}
  </article>`;
}

export function renderResourceCard(resource, helpers) {
  const href = resource.routeId ? helpers.routeHref(resource.routeId) : resource.externalUrl;
  return `<article class="card resource-card">
    ${resource.icon ? renderIcon(resource.icon, helpers, { className: 'card__icon' }) : ''}
    ${resource.type || resource.dateLabel ? `<p class="card__meta">${[resource.type, resource.dateLabel].filter(Boolean).map(escapeHtml).join(' · ')}</p>` : ''}
    <h3>${escapeHtml(resource.title)}</h3>
    ${resource.summary || resource.description ? `<p>${escapeHtml(resource.summary || resource.description)}</p>` : ''}
    ${renderTags(resource.topics || [])}
    ${href ? renderButtonLink({ href, label: resource.linkLabel || 'Consultar recurso', variant: 'text', external: !resource.routeId }) : ''}
  </article>`;
}

export function renderEventCard(event, helpers) {
  const href = event.routeId ? helpers.routeHref(event.routeId) : event.externalUrl;
  return `<article class="card event-card">
    <div class="event-card__meta"><span>${escapeHtml(event.dateLabel)}</span><span>${escapeHtml(event.type)}</span></div>
    <h3>${escapeHtml(event.title)}</h3>
    <p>${escapeHtml(event.summary)}</p>
    ${renderTags(event.topics)}
    ${href ? renderButtonLink({ href, label: event.routeId ? 'Abrir experiencia' : 'Más información', variant: 'secondary', external: !event.routeId }) : ''}
  </article>`;
}

export function renderWebinarCard(webinar, helpers) {
  const directUrl = webinar.youtubeUrl;
  const thumbnail = webinar.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(webinar.youtubeId)}/hqdefault.jpg`;
  return `<article class="card webinar-card" data-webinar-card>
    <div class="webinar-player" data-webinar-player data-youtube-id="${escapeAttribute(webinar.youtubeId)}" data-youtube-title="${escapeAttribute(webinar.title)}">
      <img src="${escapeAttribute(thumbnail)}" alt="Miniatura del webinar ${escapeAttribute(webinar.title)}" width="480" height="360" loading="lazy" decoding="async">
      <button class="webinar-player__button" type="button" data-webinar-play aria-label="Reproducir ${escapeAttribute(webinar.title)}">
        ${renderIcon('play', helpers, { className: 'icon' })}<span>Ver webinar</span>
      </button>
    </div>
    <div class="webinar-card__body">
      <p class="card__meta">${escapeHtml(webinar.dateLabel || webinar.date)}${webinar.duration ? ` · ${escapeHtml(webinar.duration)}` : ''}</p>
      <h3>${escapeHtml(webinar.title)}</h3>
      ${webinar.speaker ? `<p class="webinar-card__speaker"><strong>${escapeHtml(webinar.speaker)}</strong>${webinar.speakerRole ? `<span>${escapeHtml(webinar.speakerRole)}</span>` : ''}</p>` : ''}
      <p>${escapeHtml(webinar.summary)}</p>
      ${renderTags([...(webinar.topics || []), ...(webinar.species || [])])}
      ${renderButtonLink({ href: directUrl, label: 'Ver en YouTube', variant: 'text', external: true })}
    </div>
  </article>`;
}

export function renderTeamCard(member, helpers) {
  const initials = member.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const portrait = member.photo
    ? `<img src="${escapeAttribute(helpers.assetHref(member.photo))}" alt="Fotografía de ${escapeAttribute(member.name)}" width="360" height="360" loading="lazy" decoding="async">`
    : `<span class="avatar-initials" aria-hidden="true">${escapeHtml(initials)}</span>`;
  const profileLinks = [
    { label: 'Correo', url: member.email ? `mailto:${member.email}` : '', external: false },
    { label: 'ORCID', url: member.orcid, external: true },
    { label: 'Google Scholar', url: member.googleScholar, external: true },
    { label: 'LinkedIn', url: member.linkedin, external: true },
    { label: 'Instagram', url: member.instagram, external: true }
  ].filter(item => item.url);

  return `<article class="card team-card">
    <div class="team-card__portrait">${portrait}</div>
    <div class="team-card__body">
      <h3>${escapeHtml(member.name)}</h3>
      ${member.professionalTitle ? `<p>${escapeHtml(member.professionalTitle)}</p>` : ''}
      ${member.role ? `<p class="card__meta">${escapeHtml(member.role)}</p>` : ''}
      ${member.career || member.specialty ? `<p>${[member.career, member.specialty].filter(Boolean).map(escapeHtml).join(' · ')}</p>` : ''}
      ${member.bio ? `<p>${escapeHtml(member.bio)}</p>` : ''}
      ${renderTags(member.researchInterests || [])}
      ${profileLinks.length ? `<ul class="team-card__links">${profileLinks.map(item => `<li><a href="${escapeAttribute(item.url)}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(item.label)}</a></li>`).join('')}</ul>` : ''}
    </div>
  </article>`;
}
