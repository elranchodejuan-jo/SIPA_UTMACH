const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

export const isValidYouTubeId = value => typeof value === 'string' && YOUTUBE_ID_PATTERN.test(value.trim());

export const parseYouTubeId = value => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const candidate = value.trim();
  if (isValidYouTubeId(candidate)) return candidate;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  let id = null;
  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const [kind, pathId] = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(kind)) id = pathId ?? null;
    }
  }

  return isValidYouTubeId(id) ? id : null;
};

export const youtubeWatchUrl = value => {
  const id = parseYouTubeId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
};

export const youtubeEmbedUrl = value => {
  const id = parseYouTubeId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
};

export const youtubeThumbnailUrl = value => {
  const id = parseYouTubeId(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

export const validateWebinarVideo = webinar => {
  const errors = [];
  const idFromField = parseYouTubeId(webinar?.youtubeId ?? '');
  const idFromUrl = parseYouTubeId(webinar?.youtubeUrl ?? '');

  if (webinar?.youtubeId && !idFromField) errors.push('youtubeId inválido');
  if (webinar?.youtubeUrl && !idFromUrl) errors.push('youtubeUrl inválida');
  if (idFromField && idFromUrl && idFromField !== idFromUrl) errors.push('youtubeId y youtubeUrl no coinciden');
  if (webinar?.published === true && !(idFromField || idFromUrl)) errors.push('un webinar publicado requiere un video de YouTube válido');

  return Object.freeze({
    valid: errors.length === 0,
    youtubeId: idFromField || idFromUrl,
    errors: Object.freeze(errors),
  });
};

export const normalizeWebinar = webinar => {
  const validation = validateWebinarVideo(webinar);
  const youtubeId = validation.youtubeId;
  return Object.freeze({
    ...webinar,
    youtubeId,
    youtubeUrl: youtubeId ? youtubeWatchUrl(youtubeId) : null,
    embedUrl: youtubeId ? youtubeEmbedUrl(youtubeId) : null,
    thumbnail: webinar?.thumbnail || (youtubeId ? youtubeThumbnailUrl(youtubeId) : null),
    videoValid: validation.valid,
    videoErrors: validation.errors,
  });
};

export const assertValidPublishedWebinars = webinars => {
  for (const webinar of webinars ?? []) {
    if (webinar?.published !== true) continue;
    const validation = validateWebinarVideo(webinar);
    if (!validation.valid) {
      throw new Error(`Webinar publicado inválido (${webinar.id ?? webinar.slug ?? 'sin identificador'}): ${validation.errors.join('; ')}`);
    }
  }
};
