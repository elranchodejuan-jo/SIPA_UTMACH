import assert from 'node:assert/strict';
import test from 'node:test';

import { SITE_CONFIG } from '../../portal/config/site.mjs';
import {
  getBreadcrumbs,
  getFooterNavigation,
  getPrimaryNavigation,
  getSitemapRoutes,
} from '../../portal/config/navigation.mjs';
import { getPublishedRoutes } from '../../portal/config/routes.mjs';
import { contactChannels, socialLinks } from '../../portal/content/socials.mjs';
import { sipaDraftMemberships, sipaMemberships, teamMembers } from '../../portal/content/team.mjs';
import { escapeAttribute, escapeHtml, safeJson } from '../../portal/lib/html.mjs';
import {
  assetHref,
  canonicalHref,
  isSafePublicHref,
  normalizeEmailHref,
  normalizeExternalUrl,
  normalizeWhatsAppHref,
  routeHref,
} from '../../portal/lib/urls.mjs';
import {
  assertValidPublishedWebinars,
  normalizeWebinar,
  parseYouTubeId,
  youtubeEmbedUrl,
} from '../../portal/lib/youtube.mjs';
import {
  createExpoferiaRoster,
  expoferiaParticipants,
  sharedPersonPortraitHref,
} from '../../src/data/site.ts';
import { assertValidPersonRelations, draftPeople, people } from '../../shared/people.mjs';

import './color-contracts.test.mjs';
import './favicon-contracts.test.mjs';

const EXPECTED_PATHS = [
  '/',
  '/sipa/',
  '/investigacion/',
  '/divulgacion/',
  '/divulgacion/webinars/',
  '/eventos/',
  '/eventos/expoferia-nutricion-animal-2026/',
  '/equipo/',
  '/contacto/',
];

test('el registro publica exactamente las rutas aprobadas con salidas index.html únicas', () => {
  const routes = getPublishedRoutes();
  assert.deepEqual(routes.map(route => route.path), EXPECTED_PATHS);
  assert.equal(new Set(routes.map(route => route.id)).size, routes.length);
  assert.equal(new Set(routes.map(route => route.output)).size, routes.length);
  for (const route of routes) assert.match(route.output, /(?:^|\/)index\.html$/);
});

test('la navegación primaria y el sitemap se derivan del registro', () => {
  assert.deepEqual(
    getPrimaryNavigation('home').map(item => item.label),
    ['Inicio', 'SIPA', 'Investigación', 'Divulgación', 'Eventos', 'Equipo', 'Contacto'],
  );
  assert.deepEqual(getSitemapRoutes().map(item => item.path), EXPECTED_PATHS);
  assert.ok(getFooterNavigation('home').every(group => group.items.length > 0));
});

test('breadcrumbs conserva la jerarquía Inicio > Divulgación > Webinars', () => {
  const breadcrumbs = getBreadcrumbs('webinars');
  assert.deepEqual(breadcrumbs.map(item => item.label), ['Inicio', 'Divulgación', 'Webinars']);
  assert.equal(breadcrumbs.at(-1).current, true);
});

test('redes oficiales de SIPA publican Instagram, Facebook, TikTok y YouTube confirmados', () => {
  assert.deepEqual(
    socialLinks.map(({ id, label, username, url, icon, published }) => ({ id, label, username, url, icon, published })),
    [
      {
        id: 'instagram',
        label: 'Instagram',
        username: '@sipa_utmach',
        url: 'https://www.instagram.com/sipa_utmach/',
        icon: 'instagram',
        published: true,
      },
      {
        id: 'facebook',
        label: 'Facebook',
        username: 'sipa.utmach',
        url: 'https://www.facebook.com/sipa.utmach',
        icon: 'facebook',
        published: true,
      },
      {
        id: 'tiktok',
        label: 'TikTok',
        username: '@sipa_utmach',
        url: 'https://www.tiktok.com/@sipa_utmach',
        icon: 'tiktok',
        published: true,
      },
      {
        id: 'youtube',
        label: 'YouTube',
        username: '@SIPA_UTMACH',
        url: 'https://www.youtube.com/@SIPA_UTMACH',
        icon: 'youtube',
        published: true,
      },
    ],
  );
});

test('correo oficial de SIPA se publica como canal mailto válido', () => {
  assert.deepEqual(contactChannels, [
    {
      id: 'email',
      label: 'Correo',
      username: 'sipautmach@gmail.com',
      url: 'mailto:sipautmach@gmail.com',
      icon: 'mail',
      order: 10,
      published: true,
      status: 'confirmed',
    },
  ]);
  assert.equal(normalizeEmailHref('sipautmach@gmail.com'), 'mailto:sipautmach@gmail.com');
});

test('todos los enlaces relativos resuelven en dominio raíz y GitHub Pages', () => {
  const routes = getPublishedRoutes();
  for (const from of routes) {
    for (const to of routes) {
      const href = routeHref(from, to);
      assert.equal(new URL(href, `https://example.test${from.path}`).pathname, to.path);
      assert.equal(new URL(href, `https://example.test/SIPA_UTMACH${from.path}`).pathname, `/SIPA_UTMACH${to.path}`);
    }

    const asset = assetHref(from, 'assets/css/tokens.css');
    assert.equal(new URL(asset, `https://example.test${from.path}`).pathname, '/assets/css/tokens.css');
    assert.equal(new URL(asset, `https://example.test/SIPA_UTMACH${from.path}`).pathname, '/SIPA_UTMACH/assets/css/tokens.css');
  }

  const teamRoute = getPublishedRoutes().find(route => route.id === 'team');
  const portrait = assetHref(teamRoute, people[0].portrait);
  assert.equal(new URL(portrait, 'https://example.test/equipo/').pathname, '/assets/images/people/angel-sanchez.png');
  assert.equal(
    new URL(portrait, 'https://example.test/SIPA_UTMACH/equipo/').pathname,
    '/SIPA_UTMACH/assets/images/people/angel-sanchez.png',
  );
});

test('personas compartidas tienen IDs únicos y relaciones válidas por contexto', () => {
  assert.deepEqual(
    people.map(({ id, name, portrait, status }) => ({ id, name, portrait, status })),
    [
      { id: 'angel-sanchez', name: 'Angel Roberto Sánchez Quinche', portrait: 'assets/images/people/angel-sanchez.png', status: 'confirmed' },
      { id: 'carolina-cajamarca', name: 'Carolina Cajamarca', portrait: 'assets/images/people/carolina-cajamarca.png', status: 'confirmed' },
      { id: 'juan-bajana', name: 'Juan José Bajaña', portrait: 'assets/images/people/juan-bajana.jpg', status: 'confirmed' },
      { id: 'robinson-macas', name: 'Robinson Macas', portrait: 'assets/images/people/robinson-macas.jpeg', status: 'confirmed' },
      { id: 'allison-machuca', name: 'Alison Machuca', portrait: 'assets/images/people/alison-machuca.jpeg', status: 'confirmed' },
    ],
  );
  assert.deepEqual(draftPeople.map(({ id, name, portrait, status }) => ({ id, name, portrait, status })), [
    { id: 'jimmy', name: 'Jimmy', portrait: '', status: 'draft' },
    { id: 'abigail', name: 'Abigail', portrait: '', status: 'draft' },
  ]);
  const allPersonIds = [...people, ...draftPeople].map(person => person.id);
  assert.equal(new Set(allPersonIds).size, allPersonIds.length);
  const angel = people.find(person => person.id === 'angel-sanchez');
  assert.deepEqual(angel.academicProfile.credentials.map(({ degree, institution, country }) => ({ degree, institution, country })), [
    { degree: 'Doctor en Medicina Veterinaria y Zootecnia', institution: 'Universidad Técnica de Machala', country: 'Ecuador' },
    { degree: 'Máster Universitario en Producción Animal', institution: 'Universitat Politècnica de València', country: 'España' },
    { degree: 'Doctor en Ciencias Veterinarias', institution: 'Universidad del Zulia', country: 'Venezuela' },
  ]);
  assert.equal(angel.academicProfile.trajectory.some(item => /Desde 2013|más de \d+ años|asesor de SIPA/i.test(item)), false);
  assert.equal(draftPeople.every(person => person.status === 'draft' && !person.portrait), true);
  assert.doesNotThrow(() => assertValidPersonRelations([
    { eventId: 'evento-a', personId: 'juan-bajana' },
    { eventId: 'evento-b', personId: 'juan-bajana' },
  ], { scopeField: 'eventId' }));
  assert.throws(() => assertValidPersonRelations([
    { eventId: 'evento-a', personId: 'juan-bajana' },
    { eventId: 'evento-a', personId: 'juan-bajana' },
  ], { scopeField: 'eventId' }), /relación duplicada/i);
  assert.throws(() => assertValidPersonRelations([
    { personId: 'persona-inexistente' },
  ]), /no existe la persona compartida/i);
});

test('Equipo organiza perfiles confirmados y conserva borradores fuera de publicación', () => {
  assert.deepEqual(
    sipaMemberships.map(({ personId, category, institutionalRole, badges, order, published, status }) => (
      { personId, category, institutionalRole, badges: badges.map(badge => badge.label), order, published, status }
    )),
    [
      { personId: 'angel-sanchez', category: 'docentes', institutionalRole: 'Miembro de SIPA', badges: ['Docente'], order: 10, published: true, status: 'confirmed' },
      { personId: 'robinson-macas', category: 'ayudantias', institutionalRole: 'Miembro de SIPA', badges: ['Ayudante de cátedra'], order: 10, published: true, status: 'confirmed' },
      { personId: 'allison-machuca', category: 'ayudantias', institutionalRole: 'Miembro de SIPA', badges: ['Ayudante de campo'], order: 20, published: true, status: 'confirmed' },
      { personId: 'juan-bajana', category: 'comunicacion-digital', institutionalRole: 'Miembro de SIPA', badges: ['Desarrollo web', 'Administración de redes'], order: 10, published: true, status: 'confirmed' },
    ],
  );
  assert.deepEqual(sipaDraftMemberships.map(({ personId, category, badges, order, published, status }) => ({
    personId,
    category,
    badges: badges.map(badge => badge.label),
    order,
    published,
    status,
  })), [
    { personId: 'jimmy', category: 'ayudantias', badges: ['Ayudante de cátedra'], order: 30, published: false, status: 'draft' },
    { personId: 'abigail', category: 'comunicacion-digital', badges: [], order: 20, published: false, status: 'draft' },
  ]);
  const membershipIds = [...sipaMemberships, ...sipaDraftMemberships].map(membership => membership.personId);
  assert.equal(new Set(membershipIds).size, membershipIds.length);
  const published = teamMembers.filter(member => member.published && member.status === 'confirmed');
  assert.deepEqual(published.map(member => member.name), [
    'Angel Roberto Sánchez Quinche',
    'Robinson Macas',
    'Alison Machuca',
    'Juan José Bajaña',
  ]);
  assert.ok(published.every(member => member.role === 'Miembro de SIPA'));
  assert.ok(published.every(member => !member.semester));
  assert.ok(published.every(member => !['Exponente', 'Desarrollador Web', 'Master Solver'].includes(member.role)));
  assert.equal(published.find(member => member.id === 'allison-machuca').career, 'Medicina Veterinaria');
  assert.deepEqual(published.find(member => member.id === 'juan-bajana').badges.map(badge => badge.label), [
    'Desarrollo web',
    'Administración de redes',
  ]);
  assert.equal(teamMembers.some(member => member.status === 'draft'), false);
  assert.equal(teamMembers.some(member => member.id === 'carolina-cajamarca'), false);
});

test('Expoferia conserva cuatro perfiles y todo su contexto histórico', () => {
  assert.deepEqual(
    expoferiaParticipants.map(({ personId, eventRole, order, presentation, visible }) => (
      { personId, eventRole, order, presentation, visible }
    )),
    [
      { personId: 'angel-sanchez', eventRole: 'Docente-Investigador de la UTMACH', order: 0, presentation: 'teacher', visible: true },
      { personId: 'carolina-cajamarca', eventRole: 'Exponente', order: 10, presentation: 'member', visible: true },
      { personId: 'juan-bajana', eventRole: 'Desarrollador Web', order: 20, presentation: 'member', visible: true },
      { personId: 'robinson-macas', eventRole: 'Master Solver', order: 30, presentation: 'member', visible: true },
    ],
  );

  const roster = createExpoferiaRoster(false);
  assert.deepEqual(roster.teacher, {
    name: 'Angel Roberto Sánchez Quinche',
    professionalTitle: 'Doctor en Medicina Veterinaria y Zootecnia · Máster Universitario en Producción Animal · Doctor en Ciencias Veterinarias',
    role: 'Docente-Investigador de la UTMACH',
    subjects: ['Nutrición Animal', 'Salud en la Producción Porcina'],
    description: '',
    biography: 'Angel Roberto Sánchez Quinche, Doctor en Medicina Veterinaria y Zootecnia (Universidad Técnica de Machala, Ecuador), Máster Universitario en Producción Animal (Universitat Politècnica de València, España), Doctor en Ciencias Veterinarias (Universidad del Zulia, Venezuela). Desde 2013, combina su labor docente e investigadora en la Universidad Técnica de Machala, con más de 8 años de experiencia en el sector privado, donde ha trabajado como veterinario de campo y administrador de granjas, y hasta la presente fecha con más de 12 años de experiencia en la docencia de pregrado. En la UTMach, destaca como miembro de GIPASA-UTMACH y asesor de SIPA-UTMACH, activo en la investigación y la divulgación científica, ha participado en proyectos académicos, conferencias nacionales e internacionales, es revisor y ha contribuido con artículos en revistas regionales y de alto impacto, enfocándose en Producción Animal, Nutrición Animal y Ciencia de los Alimentos.',
    image: '../../assets/images/people/angel-sanchez.png',
    visible: true,
  });
  assert.deepEqual(roster.team, [
    {
      id: 'carolina-cajamarca',
      name: 'Carolina Cajamarca',
      photo: '../../assets/images/people/carolina-cajamarca.png?v=2',
      career: 'Medicina Veterinaria',
      semester: 'Cuarto semestre',
      topic: 'Nutrición Animal',
      role: 'Exponente',
      instagram: 'https://www.instagram.com/carolina.skl',
      altText: 'Carolina Cajamarca - Integrante del equipo expositor',
      visible: true,
    },
    {
      id: 'juan-bajana',
      name: 'Juan José Bajaña',
      photo: '../../assets/images/people/juan-bajana.jpg?v=2',
      career: 'Medicina Veterinaria',
      semester: 'Cuarto semestre',
      topic: 'Nutrición Animal',
      role: 'Desarrollador Web',
      instagram: 'https://www.instagram.com/elranchodejuan_jo',
      altText: 'Juan José Bajaña - Integrante del equipo expositor',
      visible: true,
    },
    {
      id: 'robinson-macas',
      name: 'Robinson Macas',
      photo: '../../assets/images/people/robinson-macas.jpeg?v=2',
      career: 'Medicina Veterinaria',
      semester: 'Cuarto semestre',
      topic: 'Nutrición Animal',
      role: 'Master Solver',
      instagram: 'https://www.instagram.com/macasrobin?igsh=MXJpMGo4OXVvcWFrNQ==',
      altText: 'Robinson Macas - Integrante del equipo expositor',
      visible: true,
    },
  ]);
});

test('retratos de Expoferia resuelven en desarrollo, dominio raíz y Pages con prefijo', () => {
  const portrait = 'assets/images/people/juan-bajana.jpg';
  const developmentHref = sharedPersonPortraitHref(portrait, true);
  const integratedHref = sharedPersonPortraitHref(portrait, false);

  assert.equal(developmentHref, './assets/images/people/juan-bajana.jpg');
  assert.equal(new URL(developmentHref, 'https://example.test/').pathname, '/assets/images/people/juan-bajana.jpg');
  assert.equal(
    new URL(developmentHref, 'https://example.test/SIPA_UTMACH/').pathname,
    '/SIPA_UTMACH/assets/images/people/juan-bajana.jpg',
  );
  assert.equal(
    new URL(integratedHref, 'https://example.test/eventos/expoferia-nutricion-animal-2026/').pathname,
    '/assets/images/people/juan-bajana.jpg',
  );
  assert.equal(
    new URL(integratedHref, 'https://example.test/SIPA_UTMACH/eventos/expoferia-nutricion-animal-2026/').pathname,
    '/SIPA_UTMACH/assets/images/people/juan-bajana.jpg',
  );
});

test('canonicales son absolutas, técnicas y en minúsculas', () => {
  for (const route of getPublishedRoutes()) {
    assert.equal(canonicalHref(route), new URL(route.path, `${SITE_CONFIG.canonicalOrigin}/`).href);
    assert.equal(canonicalHref(route), canonicalHref(route).toLowerCase());
  }
});

test('helpers de URL rechazan protocolos, credenciales y rutas peligrosas', () => {
  assert.equal(normalizeExternalUrl('https://www.utmachala.edu.ec/'), 'https://www.utmachala.edu.ec/');
  assert.equal(normalizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(normalizeExternalUrl('https://user:secret@example.com/'), null);
  assert.equal(normalizeEmailHref('contacto@example.edu.ec'), 'mailto:contacto@example.edu.ec');
  assert.equal(normalizeEmailHref('correo inválido'), null);
  assert.equal(normalizeWhatsAppHref('+593 99 123 4567'), 'https://wa.me/593991234567');
  assert.equal(normalizeWhatsAppHref('593991234567'), null);
  assert.equal(SITE_CONFIG.contact.whatsappNumber, '');
  assert.equal(contactChannels.some(channel => channel.id === 'whatsapp'), false);
  assert.equal(isSafePublicHref('#'), false);
  assert.equal(isSafePublicHref('javascript:alert(1)'), false);
  assert.throws(() => assetHref('home', '../secreto.txt'), /asset inválida/i);
});

test('YouTube normaliza watch, youtu.be, embed y shorts sin cargar videos ficticios', () => {
  const id = 'AbCdEf123_4';
  for (const value of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
  ]) assert.equal(parseYouTubeId(value), id);

  assert.equal(parseYouTubeId('https://example.com/watch?v=AbCdEf123_4'), null);
  assert.equal(youtubeEmbedUrl(id), `https://www.youtube-nocookie.com/embed/${id}`);
  const webinar = normalizeWebinar({ id: 'prueba-unitaria', youtubeUrl: `https://youtu.be/${id}`, published: true });
  assert.equal(webinar.youtubeId, id);
  assert.equal(webinar.videoValid, true);
  assert.throws(
    () => assertValidPublishedWebinars([{ id: 'invalido', published: true, youtubeUrl: 'https://example.com/video' }]),
    /Webinar publicado inválido/,
  );
});

test('escape HTML y JSON neutraliza contenido editable', () => {
  assert.equal(escapeHtml('<script>"x" & y</script>'), '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
  assert.equal(escapeAttribute("' onfocus='alert(1)"), '&#39; onfocus=&#39;alert(1)');
  assert.doesNotMatch(safeJson({ value: '</script>&' }), /<\/script>/);
});
