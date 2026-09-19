/**
 * Plantilla editorial reutilizable. No importar al catálogo público.
 *
 * Copiar y completar únicamente datos confirmados. El estado inicial es
 * `draft`; los valores desconocidos permanecen vacíos o en `null`.
 * `America/Guayaquil` es un valor inicial editable, no una zona universal.
 */
export const webinarTemplate = Object.freeze({
  id: '',
  slug: '',
  title: '',
  headline: '',
  speaker: '',
  speakerRole: '',
  date: '',
  startDate: '',
  endDate: null,
  timeZone: 'America/Guayaquil',
  secondaryTimeZones: Object.freeze([]),
  duration: null,
  platform: '',
  joinUrl: null,
  meetingId: null,
  registrationUrl: null,
  isAccessibleForFree: null,
  organizer: '',
  sponsor: '',
  summary: '',
  invitation: '',
  description: '',
  tagline: '',
  thumbnail: '',
  thumbnailAlt: '',
  thumbnailWidth: null,
  thumbnailHeight: null,
  topics: Object.freeze([]),
  species: Object.freeze([]),
  youtubeUrl: null,
  youtubeId: null,
  recordingPublishedAt: null,
  resources: Object.freeze([]),
  featured: false,
  published: false,
  status: 'draft',
});

export default webinarTemplate;
