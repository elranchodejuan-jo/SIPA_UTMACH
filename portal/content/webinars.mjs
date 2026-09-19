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
    joinUrl: null,
    meetingId: null,
    registrationUrl: null,
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
    featured: false,
    published: true,
    status: 'archived',
  }),
  Object.freeze({
    id: 'innovacion-tecnologica-produccion-animal-europea-2026',
    slug: 'innovacion-tecnologica-produccion-animal-europea-2026',
    title: 'Innovación Tecnológica actual en la Producción Animal Europea',
    headline: '¡LA INNOVACIÓN ESTÁ TRANSFORMANDO LA PRODUCCIÓN ANIMAL!',
    speaker: 'Ion Pérez Baena',
    speakerRole: 'Ingeniero Agrónomo | Máster en Producción Animal',
    date: '2026-08-29',
    startDate: '2026-08-29T19:00:00-05:00',
    endDate: null,
    timeZone: 'America/Guayaquil',
    secondaryTimeZones: Object.freeze([]),
    duration: null,
    platform: 'Zoom',
    joinUrl: null,
    meetingId: null,
    registrationUrl: null,
    isAccessibleForFree: true,
    organizer: 'SIPA — Semillero de Investigación en Producción Animal',
    sponsor: 'Maestría en Producción Animal de la UTMACH',
    summary: 'Nuevas tendencias, herramientas y tecnologías que están revolucionando la producción animal en Europa.',
    invitation: 'SIPA te invita a ser parte de este webinar gratuito para conocer nuevas tendencias, herramientas y tecnologías aplicadas a la producción animal en Europa.',
    description: 'Un espacio para aprender, actualizar conocimientos y conocer las innovaciones que están marcando el futuro de la producción animal.',
    tagline: 'SIPA | Conocimiento que impulsa la producción animal.',
    thumbnail: 'assets/images/webinars/innovacion-tecnologica-produccion-animal-europea-2026.jpeg',
    thumbnailAlt: 'Afiche del webinar Innovación tecnológica actual en la producción animal europea, con Ion Pérez Baena, el 29 de agosto de 2026 a las 19:00 de Ecuador, vía Zoom.',
    thumbnailWidth: 1080,
    thumbnailHeight: 1080,
    topics: Object.freeze([
      'Innovación tecnológica',
      'Producción animal',
      'Europa',
    ]),
    species: Object.freeze([]),
    youtubeUrl: null,
    youtubeId: null,
    recordingPublishedAt: null,
    resources: Object.freeze([]),
    featured: false,
    published: true,
    status: 'archived',
  }),
]);

export const webinarStatuses = Object.freeze(['upcoming', 'available', 'archived', 'draft']);

export const webinarLibraryContent = {
  title: 'Biblioteca de webinars',
  description: 'Conversaciones y encuentros de divulgación sobre producción animal, investigación y formación veterinaria.',
  emptyTitle: 'La biblioteca está lista para crecer',
  emptyMessage: 'Los webinars aparecerán aquí cuando sus enlaces, ponentes y datos de publicación hayan sido confirmados.'
};
