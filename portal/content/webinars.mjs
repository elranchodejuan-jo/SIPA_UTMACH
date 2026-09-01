/**
 * Biblioteca central de webinars.
 *
 * Campos: id, slug, title, speaker, speakerRole, date, duration, summary,
 * description, youtubeUrl, youtubeId, thumbnail, topics, species, featured,
 * published, status y resources.
 *
 * No se incluyen videos de demostración. Consulta docs/CONTENT_GUIDE.md.
 */
export const webinars = [];

export const webinarStatuses = ['upcoming', 'available', 'archived', 'draft'];

export const webinarLibraryContent = {
  title: 'Biblioteca de webinars',
  description: 'Conversaciones y encuentros de divulgación sobre producción animal, investigación y formación veterinaria.',
  emptyTitle: 'La biblioteca está lista para crecer',
  emptyMessage: 'Los webinars aparecerán aquí cuando sus enlaces, ponentes y datos de publicación hayan sido confirmados.'
};
