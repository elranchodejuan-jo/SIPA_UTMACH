/**
 * Biblioteca central de webinars.
 *
 * Una ficha alimenta la biblioteca, Inicio, Eventos y su ruta individual.
 * Los estados editoriales no se infieren a partir del reloj: `upcoming`
 * describe una invitación confirmada, `available` una grabación publicada,
 * `archived` una ficha conservada y `draft` contenido no público.
 *
 * No se incluyen videos de demostración. Consulta docs/CONTENT_GUIDE.md.
 */
export const webinars = Object.freeze([
  Object.freeze({
    id: 'ganaderia-4-0-2026',
    slug: 'ganaderia-4-0-2026',
    title: 'GANADERÍA 4.0: ¿Estamos tomando decisiones o solo reaccionando?',
    headline: '¡EL FUTURO DE LA GANADERÍA YA ESTÁ AQUÍ!',
    speaker: 'Pablo Roberto Marini',
    speakerRole: 'Médico Veterinario | Doctor en Ciencias Veterinarias',
    date: '2026-09-16',
    startDate: '2026-09-16T18:00:00-05:00',
    endDate: null,
    timeZone: 'America/Guayaquil',
    secondaryTimeZones: Object.freeze([
      Object.freeze({
        label: 'Argentina',
        timeZone: 'America/Argentina/Buenos_Aires',
      }),
    ]),
    duration: null,
    platform: 'Zoom',
    joinUrl: 'https://cedia.zoom.us/j/89751728629',
    meetingId: '897 5172 8629',
    registrationUrl: 'https://forms.gle/4iFLS8PSa4wsgHFa6',
    isAccessibleForFree: true,
    organizer: 'SIPA — Semillero de Investigación en Producción Animal',
    sponsor: 'Maestría en Producción Animal',
    summary: 'La tecnología, los datos y el bienestar animal como herramientas para una producción más eficiente, rentable y sostenible.',
    invitation: 'SIPA te invita a ser parte de este WEBINAR GRATUITO, donde conocerás cómo la tecnología, la innovación y el uso de nuevas herramientas están cambiando la manera de tomar decisiones en la ganadería.',
    description: 'Un espacio para reflexionar sobre los desafíos de la ganadería moderna y conocer cómo la innovación y las nuevas tecnologías pueden contribuir a una producción animal más eficiente y a una mejor toma de decisiones.',
    tagline: 'SIPA | Conocimiento que impulsa la producción animal.',
    thumbnail: 'assets/images/webinars/ganaderia-4-0-2026.jpg',
    thumbnailAlt: 'Afiche del webinar Ganadería 4.0 con Pablo Roberto Marini, el 16 de septiembre de 2026 a las 18:00 de Ecuador y 20:00 de Argentina, vía Zoom; con el auspicio de la Maestría en Producción Animal.',
    thumbnailWidth: 1254,
    thumbnailHeight: 1254,
    topics: Object.freeze([
      'Tecnología',
      'Innovación',
      'Toma de decisiones',
      'Producción animal',
      'Bienestar animal',
    ]),
    species: Object.freeze(['Bovinos', 'Porcinos', 'Aves']),
    youtubeUrl: null,
    youtubeId: null,
    recordingPublishedAt: null,
    resources: Object.freeze([]),
    featured: true,
    published: true,
    status: 'upcoming',
  }),
]);

export const webinarStatuses = Object.freeze(['upcoming', 'available', 'archived', 'draft']);

export const webinarLibraryContent = {
  title: 'Biblioteca de webinars',
  description: 'Conversaciones y encuentros de divulgación sobre producción animal, investigación y formación veterinaria.',
  emptyTitle: 'La biblioteca está lista para crecer',
  emptyMessage: 'Los webinars aparecerán aquí cuando sus enlaces, ponentes y datos de publicación hayan sido confirmados.'
};
