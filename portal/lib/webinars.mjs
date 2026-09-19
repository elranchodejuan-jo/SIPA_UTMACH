import { normalizeWebinar, validateWebinarVideo } from './youtube.mjs';

export const WEBINAR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WEBINAR_STATUSES = Object.freeze(['upcoming', 'available', 'archived', 'draft']);
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ZONED_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
const LOCAL_ASSET_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

const text = value => typeof value === 'string' && value.trim().length > 0;

const asSlug = value => typeof value === 'string' ? value : value?.slug;

const isHttpsUrl = value => {
  if (!text(value)) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
};

const isValidDateOnly = value => {
  const match = typeof value === 'string' ? value.match(DATE_PATTERN) : null;
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);
};

const isValidTimeZone = value => {
  if (!text(value)) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
};

const zonedParts = (date, timeZone) => Object.fromEntries(
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
    .filter(part => part.type !== 'literal')
    .map(part => [part.type, part.value]),
);

const validateZonedStart = webinar => {
  const errors = [];
  const match = typeof webinar?.startDate === 'string'
    ? webinar.startDate.match(ZONED_DATE_TIME_PATTERN)
    : null;
  const timeZoneValid = isValidTimeZone(webinar?.timeZone);

  if (!match || Number.isNaN(Date.parse(webinar.startDate))) {
    errors.push('startDate debe ser una fecha ISO válida con desplazamiento horario');
    return errors;
  }
  if (!timeZoneValid) {
    errors.push('timeZone no es una zona IANA válida');
    return errors;
  }

  const start = new Date(webinar.startDate);
  const parts = zonedParts(start, webinar.timeZone);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const declaredOffset = match[7] === 'Z'
    ? 0
    : (match[7].startsWith('-') ? -1 : 1)
      * (Number(match[7].slice(1, 3)) * 60 + Number(match[7].slice(4, 6)));
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const startWithoutMilliseconds = start.getTime() - start.getUTCMilliseconds();
  const expectedOffset = (zonedAsUtc - startWithoutMilliseconds) / 60_000;

  if (webinar.date !== localDate) {
    errors.push('date y startDate no coinciden en timeZone');
  }
  if (declaredOffset !== expectedOffset) {
    errors.push('el desplazamiento horario de startDate no coincide con timeZone');
  }
  return errors;
};

const validateEnd = webinar => {
  if (webinar?.endDate == null || webinar.endDate === '') return [];
  if (typeof webinar.endDate !== 'string'
    || !ZONED_DATE_TIME_PATTERN.test(webinar.endDate)
    || Number.isNaN(Date.parse(webinar.endDate))) {
    return ['endDate debe ser una fecha ISO válida con desplazamiento horario'];
  }
  if (!text(webinar.startDate) || Number.isNaN(Date.parse(webinar.startDate))) return [];
  return Date.parse(webinar.endDate) > Date.parse(webinar.startDate)
    ? []
    : ['endDate debe ser posterior a startDate'];
};

const validateLocalAsset = value => text(value)
  && LOCAL_ASSET_PATTERN.test(value)
  && !value.startsWith('/')
  && !value.split('/').includes('..')
  && !value.includes('\\');

const validateSecondaryTimeZones = webinar => {
  const errors = [];
  if (webinar?.secondaryTimeZones == null) return errors;
  if (!Array.isArray(webinar.secondaryTimeZones)) return ['secondaryTimeZones debe ser un arreglo'];
  for (const [index, zone] of webinar.secondaryTimeZones.entries()) {
    if (!text(zone?.label)) errors.push(`secondaryTimeZones[${index}] requiere label`);
    if (!isValidTimeZone(zone?.timeZone)) errors.push(`secondaryTimeZones[${index}] contiene una zona IANA inválida`);
  }
  return errors;
};

const validateResources = webinar => {
  const errors = [];
  if (webinar?.resources == null) return errors;
  if (!Array.isArray(webinar.resources)) return ['resources debe ser un arreglo'];
  for (const [index, resource] of webinar.resources.entries()) {
    if (!resource || typeof resource !== 'object') {
      errors.push(`resources[${index}] debe ser un objeto`);
      continue;
    }
    const url = resource.url ?? resource.href ?? resource.externalUrl;
    if (url != null && !isHttpsUrl(url)) errors.push(`resources[${index}] requiere una URL HTTPS segura`);
  }
  return errors;
};

export const getWebinarRouteId = value => {
  const slug = asSlug(value);
  if (!WEBINAR_SLUG_PATTERN.test(slug ?? '')) throw new Error(`Slug de webinar inválido: ${String(slug)}`);
  return `webinar-${slug}`;
};

export const getWebinarRoutePath = value => {
  const slug = asSlug(value);
  if (!WEBINAR_SLUG_PATTERN.test(slug ?? '')) throw new Error(`Slug de webinar inválido: ${String(slug)}`);
  return `/divulgacion/webinars/${slug}/`;
};

export const isPublishedWebinar = webinar => Boolean(
  webinar?.published === true && webinar?.status !== 'draft',
);

export const getPublishedWebinars = webinars => Object.freeze(
  (Array.isArray(webinars) ? webinars : []).filter(isPublishedWebinar),
);

export const getWebinarBySlug = (webinars, slug) => (
  (Array.isArray(webinars) ? webinars : []).find(webinar => webinar?.slug === slug) ?? null
);

export const getWebinarById = (webinars, id) => (
  (Array.isArray(webinars) ? webinars : []).find(webinar => webinar?.id === id) ?? null
);

export const getWebinarTemporalState = (webinar, now = new Date()) => {
  if (!isPublishedWebinar(webinar)) return 'hidden';
  if (webinar.status === 'available') return 'available';
  if (webinar.status === 'archived') return 'archived';
  const instant = now instanceof Date ? now : new Date(now);
  if (!isValidDateOnly(webinar.date) || !isValidTimeZone(webinar.timeZone) || Number.isNaN(instant.getTime())) {
    return 'unknown';
  }
  const parts = zonedParts(instant, webinar.timeZone);
  const currentLocalDate = `${parts.year}-${parts.month}-${parts.day}`;
  return currentLocalDate > webinar.date ? 'past-date' : 'scheduled';
};

export const validateWebinarRecord = webinar => {
  const errors = [];
  const id = webinar?.id;
  const slug = webinar?.slug;
  const published = webinar?.published === true;
  const status = webinar?.status;

  if (!WEBINAR_SLUG_PATTERN.test(id ?? '')) errors.push('id debe usar minúsculas, números y guiones simples');
  if (!WEBINAR_SLUG_PATTERN.test(slug ?? '')) errors.push('slug debe usar minúsculas, números y guiones simples');
  if (!WEBINAR_STATUSES.includes(status)) errors.push(`status no permitido: ${String(status)}`);
  if (status === 'draft' && published) errors.push('un webinar draft no puede publicarse');
  if (!published && webinar?.featured === true) errors.push('un webinar no publicado no puede destacarse');

  if (published) {
    for (const field of ['title', 'speaker', 'summary', 'description', 'date', 'startDate', 'timeZone']) {
      if (!text(webinar?.[field])) errors.push(`un webinar publicado requiere ${field}`);
    }
    if (!validateLocalAsset(webinar.thumbnail)) errors.push('un webinar publicado requiere un afiche local válido');
    if (!text(webinar.thumbnailAlt)) errors.push('un webinar publicado requiere thumbnailAlt');
    if (!Number.isInteger(webinar.thumbnailWidth) || webinar.thumbnailWidth <= 0
      || !Number.isInteger(webinar.thumbnailHeight) || webinar.thumbnailHeight <= 0) {
      errors.push('un webinar publicado requiere dimensiones positivas del afiche');
    }
  }

  if (webinar?.date != null && webinar.date !== '' && !isValidDateOnly(webinar.date)) {
    errors.push('date debe ser una fecha real en formato YYYY-MM-DD');
  }
  if (webinar?.startDate || published) errors.push(...validateZonedStart(webinar));
  errors.push(...validateEnd(webinar));
  errors.push(...validateSecondaryTimeZones(webinar));
  errors.push(...validateResources(webinar));

  for (const field of ['joinUrl', 'registrationUrl']) {
    if (webinar?.[field] != null && webinar[field] !== '' && !isHttpsUrl(webinar[field])) {
      errors.push(`${field} debe usar HTTPS sin credenciales`);
    }
  }

  if (status === 'upcoming' && published) {
    if (!isHttpsUrl(webinar.joinUrl) && !isHttpsUrl(webinar.registrationUrl)) {
      errors.push('una invitación publicada requiere al menos un destino HTTPS de inscripción o acceso');
    }
  }

  const video = validateWebinarVideo(webinar);
  errors.push(...video.errors);
  const hasRecording = Boolean(video.youtubeId);
  if (status === 'upcoming' && hasRecording) errors.push('una invitación upcoming no puede declarar una grabación');

  if (hasRecording) {
    if (!isValidDateOnly(webinar?.recordingPublishedAt)) {
      errors.push('una grabación requiere recordingPublishedAt real en formato YYYY-MM-DD');
    } else if (isValidDateOnly(webinar?.date) && webinar.recordingPublishedAt < webinar.date) {
      errors.push('recordingPublishedAt no puede ser anterior a la fecha del webinar');
    }
  } else if (webinar?.recordingPublishedAt != null && webinar.recordingPublishedAt !== '') {
    errors.push('recordingPublishedAt requiere una grabación');
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
};

export const validateWebinarCollection = webinars => {
  const errors = [];
  if (!Array.isArray(webinars)) {
    return Object.freeze({ valid: false, errors: Object.freeze(['El catálogo de webinars debe ser un arreglo']) });
  }

  const ids = new Set();
  const slugs = new Set();
  for (const [index, webinar] of webinars.entries()) {
    const label = webinar?.id || webinar?.slug || `posición ${index}`;
    const validation = validateWebinarRecord(webinar);
    errors.push(...validation.errors.map(error => `Webinar ${label}: ${error}`));
    if (text(webinar?.id)) {
      if (ids.has(webinar.id)) errors.push(`Webinars: id duplicado ${webinar.id}`);
      ids.add(webinar.id);
    }
    if (text(webinar?.slug)) {
      if (slugs.has(webinar.slug)) errors.push(`Webinars: slug duplicado ${webinar.slug}`);
      slugs.add(webinar.slug);
    }
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
};

export const assertValidWebinarCollection = webinars => {
  const validation = validateWebinarCollection(webinars);
  if (!validation.valid) {
    throw new AggregateError(
      validation.errors.map(message => new Error(message)),
      `Catálogo de webinars inválido: ${validation.errors.length} problema(s)`,
    );
  }
  return webinars;
};

export const normalizeWebinarRecord = webinar => {
  const normalizedVideo = normalizeWebinar(webinar);
  const routeSlug = WEBINAR_SLUG_PATTERN.test(webinar?.slug ?? '') ? webinar.slug : null;
  return Object.freeze({
    ...normalizedVideo,
    routeId: routeSlug ? getWebinarRouteId(routeSlug) : null,
    routePath: routeSlug ? getWebinarRoutePath(routeSlug) : null,
    hasRecording: Boolean(normalizedVideo.youtubeId && normalizedVideo.videoValid),
  });
};

const compactObject = value => Object.fromEntries(
  Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined && entry !== ''),
);

export const createWebinarStructuredData = (webinar, { url, imageUrl } = {}) => {
  const normalized = normalizeWebinarRecord(webinar);
  const event = compactObject({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: normalized.title,
    description: normalized.description || normalized.summary,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: normalized.status === 'upcoming'
      ? 'https://schema.org/EventScheduled'
      : undefined,
    url,
    image: imageUrl ? [imageUrl] : undefined,
    isAccessibleForFree: typeof normalized.isAccessibleForFree === 'boolean'
      ? normalized.isAccessibleForFree
      : undefined,
    location: normalized.joinUrl || normalized.registrationUrl
      ? compactObject({
        '@type': 'VirtualLocation',
        url: normalized.joinUrl || normalized.registrationUrl,
      })
      : undefined,
    organizer: text(normalized.organizer)
      ? { '@type': 'Organization', name: normalized.organizer }
      : undefined,
    sponsor: text(normalized.sponsor)
      ? { '@type': 'Organization', name: normalized.sponsor }
      : undefined,
    performer: text(normalized.speaker)
      ? compactObject({ '@type': 'Person', name: normalized.speaker, description: normalized.speakerRole })
      : undefined,
  });

  const entries = [Object.freeze(event)];
  if (normalized.hasRecording) {
    entries.push(Object.freeze(compactObject({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: normalized.title,
      description: normalized.description || normalized.summary,
      thumbnailUrl: imageUrl || normalized.thumbnail,
      uploadDate: normalized.recordingPublishedAt,
      embedUrl: normalized.embedUrl,
      url: normalized.youtubeUrl,
    })));
  }
  return Object.freeze(entries);
};
