import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
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
import { webinars } from '../../portal/content/webinars.mjs';
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
  createWebinarStructuredData,
  getPublishedWebinars,
  getWebinarBySlug,
  getWebinarRouteId,
  getWebinarRoutePath,
  getWebinarTemporalState,
  normalizeWebinarRecord,
  validateWebinarCollection,
  validateWebinarRecord,
} from '../../portal/lib/webinars.mjs';
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
  '/divulgacion/webinars/ganaderia-4-0-2026/',
  '/eventos/',
  '/eventos/expoferia-nutricion-animal-2026/',
  '/equipo/',
  '/contacto/',
];

const WEBINAR_SLUG = 'ganaderia-4-0-2026';
const WEBINAR_PATH = `/divulgacion/webinars/${WEBINAR_SLUG}/`;
const webinarGanaderia4 = webinars.find(webinar => webinar.slug === WEBINAR_SLUG);
const webinarFixture = overrides => ({ ...webinarGanaderia4, ...overrides });

const expectInvalidWebinar = (record, pattern) => {
  const result = validateWebinarRecord(record);
  assert.equal(result.valid, false, `Se esperaba un webinar inválido: ${JSON.stringify(record)}`);
  assert.match(result.errors.join(' | '), pattern);
};

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

test('la ficha de Ganadería 4.0 conserva ruta, canonical, sitemap y breadcrumb jerárquico', () => {
  const routeId = getWebinarRouteId(WEBINAR_SLUG);
  const route = getPublishedRoutes().find(item => item.id === routeId);

  assert.ok(route);
  assert.equal(route.path, WEBINAR_PATH);
  assert.equal(route.output, `divulgacion/webinars/${WEBINAR_SLUG}/index.html`);
  assert.equal(route.page, 'webinar-detail');
  assert.equal(route.webinarSlug, WEBINAR_SLUG);
  assert.equal(route.parentId, 'webinars');
  assert.equal(route.activeNavId, 'outreach');
  assert.equal(canonicalHref(route), `https://sipautmach.com${WEBINAR_PATH}`);
  assert.ok(getSitemapRoutes().some(item => item.path === WEBINAR_PATH));

  const breadcrumbs = getBreadcrumbs(routeId);
  assert.deepEqual(breadcrumbs.slice(0, 3).map(item => item.label), ['Inicio', 'Divulgación', 'Webinars']);
  assert.equal(breadcrumbs.at(-1).current, true);
  assert.match(breadcrumbs.at(-1).label, /Ganadería 4\.0/i);
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

test('Ganadería 4.0 conserva la ficha confirmada, sus destinos y el afiche íntegro', async () => {
  assert.ok(webinarGanaderia4);
  assert.equal(webinarGanaderia4.id, WEBINAR_SLUG);
  assert.equal(webinarGanaderia4.title, 'GANADERÍA 4.0: ¿Estamos tomando decisiones o solo reaccionando?');
  assert.equal(webinarGanaderia4.speaker, 'Pablo Roberto Marini');
  assert.equal(webinarGanaderia4.speakerRole, 'Médico Veterinario | Doctor en Ciencias Veterinarias');
  assert.equal(webinarGanaderia4.startDate, '2026-09-16T18:00:00-05:00');
  assert.equal(webinarGanaderia4.timeZone, 'America/Guayaquil');
  assert.equal(webinarGanaderia4.endDate, null);
  assert.equal(webinarGanaderia4.duration, null);
  assert.equal(webinarGanaderia4.joinUrl, 'https://cedia.zoom.us/j/89751728629');
  assert.equal(webinarGanaderia4.meetingId, '897 5172 8629');
  assert.equal(webinarGanaderia4.registrationUrl, 'https://forms.gle/4iFLS8PSa4wsgHFa6');
  assert.equal(webinarGanaderia4.sponsor, 'Maestría en Producción Animal');
  assert.equal(webinarGanaderia4.youtubeId, null);
  assert.equal(webinarGanaderia4.youtubeUrl, null);
  assert.equal(webinarGanaderia4.recordingPublishedAt, null);
  assert.equal(webinarGanaderia4.status, 'upcoming');
  assert.equal(webinarGanaderia4.published, true);
  assert.equal(webinarGanaderia4.featured, true);
  assert.doesNotThrow(() => validateWebinarRecord(webinarGanaderia4));
  assert.equal(validateWebinarRecord(webinarGanaderia4).valid, true);

  const poster = await readFile(new URL('../../portal/assets/images/webinars/ganaderia-4-0-2026.jpg', import.meta.url));
  assert.equal(poster.length, 316493);
  assert.equal(createHash('sha256').update(poster).digest('hex'), '444d1cf314dd600316d09e3573e57224bf17236ab8bb466792011be745ff7292');
  assert.equal(webinarGanaderia4.thumbnailWidth, 1254);
  assert.equal(webinarGanaderia4.thumbnailHeight, 1254);
  assert.match(webinarGanaderia4.thumbnailAlt, /Pablo Roberto Marini/);
});

test('los helpers de webinar publican sólo registros visibles y generan rutas estables', () => {
  const draft = webinarFixture({
    id: 'borrador-futuro',
    slug: 'borrador-futuro',
    status: 'draft',
    published: false,
    featured: false,
  });

  assert.equal(getWebinarRouteId(WEBINAR_SLUG), `webinar-${WEBINAR_SLUG}`);
  assert.equal(getWebinarRoutePath(WEBINAR_SLUG), WEBINAR_PATH);
  assert.equal(getWebinarBySlug([draft, webinarGanaderia4], WEBINAR_SLUG), webinarGanaderia4);
  assert.deepEqual(getPublishedWebinars([draft, webinarGanaderia4]), [webinarGanaderia4]);

  const normalized = normalizeWebinarRecord(webinarGanaderia4);
  assert.equal(normalized.routeId, `webinar-${WEBINAR_SLUG}`);
  assert.equal(normalized.routePath, WEBINAR_PATH);
  assert.equal(normalized.hasRecording, false);

  const detailRoute = getPublishedRoutes().find(route => route.webinarSlug === WEBINAR_SLUG);
  const href = routeHref('webinars', detailRoute);
  assert.equal(new URL(href, 'https://example.test/divulgacion/webinars/').pathname, WEBINAR_PATH);
  assert.equal(
    new URL(href, 'https://example.test/SIPA_UTMACH/divulgacion/webinars/').pathname,
    `/SIPA_UTMACH${WEBINAR_PATH}`,
  );
  const posterHref = assetHref(detailRoute, webinarGanaderia4.thumbnail);
  assert.equal(new URL(posterHref, `https://example.test${WEBINAR_PATH}`).pathname, `/${webinarGanaderia4.thumbnail}`);
  assert.equal(
    new URL(posterHref, `https://example.test/SIPA_UTMACH${WEBINAR_PATH}`).pathname,
    `/SIPA_UTMACH/${webinarGanaderia4.thumbnail}`,
  );
});

test('upcoming admite invitación sin YouTube y exige acceso confirmado, fecha y zona coherentes', () => {
  assert.equal(validateWebinarRecord(webinarGanaderia4).valid, true);

  expectInvalidWebinar(
    webinarFixture({ joinUrl: null, registrationUrl: null }),
    /acceso|destino|inscripci|joinUrl|registrationUrl/i,
  );
  expectInvalidWebinar(
    webinarFixture({ joinUrl: 'http://cedia.zoom.us/j/89751728629', registrationUrl: null }),
    /HTTPS|joinUrl|segura/i,
  );
  expectInvalidWebinar(
    webinarFixture({ joinUrl: null, registrationUrl: 'https://usuario:secreto@example.com/registro' }),
    /credenciales|HTTPS|registrationUrl|segura/i,
  );
  expectInvalidWebinar(webinarFixture({ date: '2026-02-30' }), /date|fecha/i);
  expectInvalidWebinar(webinarFixture({ timeZone: 'America/Zona_Inexistente' }), /timeZone|zona/i);
  expectInvalidWebinar(webinarFixture({ date: '2026-09-17' }), /date|startDate|coincid/i);
  expectInvalidWebinar(
    webinarFixture({ startDate: '2026-09-16T18:00:00-04:00' }),
    /desplazamiento|startDate|timeZone/i,
  );
  expectInvalidWebinar(
    webinarFixture({ secondaryTimeZones: [{ label: 'Otra zona', timeZone: 'Zona/Inexistente' }] }),
    /secondaryTimeZones|timeZone|zona/i,
  );
});

test('la fecha local exige un desplazamiento coherente y endDate sólo cuando es posterior al inicio', () => {
  const coherentStart = webinarFixture({
    date: '2026-09-16',
    startDate: '2026-09-16T19:30:00-05:00',
    endDate: '2026-09-16T20:30:00-05:00',
  });
  assert.equal(validateWebinarRecord(coherentStart).valid, true);
  assert.equal(validateWebinarRecord(webinarFixture({ endDate: null })).valid, true);
  assert.equal(
    validateWebinarRecord(webinarFixture({ endDate: '2026-09-16T19:00:00-05:00' })).valid,
    true,
  );
  expectInvalidWebinar(
    webinarFixture({ endDate: '2026-09-16T18:00:00-05:00' }),
    /endDate|posterior|fin/i,
  );
  expectInvalidWebinar(
    webinarFixture({ endDate: '2026-09-16T17:59:59-05:00' }),
    /endDate|posterior|fin/i,
  );
});

test('el estado temporal no inventa directo o cierre y cambia al día siguiente local', () => {
  assert.equal(getWebinarTemporalState(webinarGanaderia4, new Date('2026-09-16T22:30:00.000Z')), 'scheduled');
  assert.equal(getWebinarTemporalState(webinarGanaderia4, new Date('2026-09-16T23:30:00.000Z')), 'scheduled');
  assert.equal(getWebinarTemporalState(webinarGanaderia4, new Date('2026-09-17T05:01:00.000Z')), 'past-date');
  assert.equal(getWebinarTemporalState(webinarFixture({ status: 'available' }), new Date()), 'available');
  assert.equal(getWebinarTemporalState(webinarFixture({ status: 'archived' }), new Date()), 'archived');
  assert.equal(
    getWebinarTemporalState(webinarFixture({ status: 'draft', published: false, featured: false }), new Date()),
    'hidden',
  );
});

test('available exige grabación válida y fecha real de publicación', () => {
  const id = 'AbCdEf123_4';
  const available = webinarFixture({
    status: 'available',
    youtubeId: id,
    youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
    recordingPublishedAt: '2026-09-17',
  });
  const normalized = normalizeWebinarRecord(available);

  assert.equal(validateWebinarRecord(available).valid, true);
  assert.equal(normalized.hasRecording, true);
  assert.equal(normalized.youtubeId, id);
  expectInvalidWebinar(
    webinarFixture({ status: 'available', youtubeId: null, youtubeUrl: null, recordingPublishedAt: null }),
    /grabación|video|YouTube|youtube/i,
  );
  expectInvalidWebinar(
    webinarFixture({ status: 'available', youtubeId: id, youtubeUrl: `https://youtu.be/${id}`, recordingPublishedAt: null }),
    /recordingPublishedAt|publicación|fecha/i,
  );
  expectInvalidWebinar(
    webinarFixture({
      status: 'available',
      youtubeId: id,
      youtubeUrl: 'https://www.youtube.com/watch?v=ZyXwVu987_6',
      recordingPublishedAt: '2026-09-17',
    }),
    /coinciden|youtubeId|youtubeUrl/i,
  );
  expectInvalidWebinar(
    webinarFixture({ status: 'available', youtubeId: null, youtubeUrl: 'https://example.com/video', recordingPublishedAt: '2026-09-17' }),
    /YouTube|youtubeUrl|video/i,
  );
});

test('archived conserva una ficha sin grabación y draft permanece oculto', () => {
  const archived = webinarFixture({
    status: 'archived',
    featured: false,
    joinUrl: null,
    registrationUrl: null,
    youtubeId: null,
    youtubeUrl: null,
    recordingPublishedAt: null,
  });
  const draft = webinarFixture({
    id: 'invitacion-borrador',
    slug: 'invitacion-borrador',
    status: 'draft',
    published: false,
    featured: false,
    joinUrl: null,
    registrationUrl: null,
  });

  assert.equal(validateWebinarRecord(archived).valid, true);
  assert.equal(normalizeWebinarRecord(archived).hasRecording, false);
  assert.equal(validateWebinarRecord(draft).valid, true);
  assert.deepEqual(getPublishedWebinars([archived, draft]), [archived]);
  expectInvalidWebinar(webinarFixture({ status: 'draft', published: true, featured: false }), /draft|publicad|published/i);
  expectInvalidWebinar(webinarFixture({ status: 'draft', published: false, featured: true }), /destacad|featured|publicad/i);
});

test('el catálogo rechaza slugs inválidos y colisiones de id o slug', () => {
  expectInvalidWebinar(webinarFixture({ slug: 'Ganadería 4.0' }), /slug/i);

  const duplicateId = webinarFixture({ slug: 'otro-webinar' });
  const duplicateSlug = webinarFixture({ id: 'otro-webinar' });
  for (const collection of [
    [webinarGanaderia4, duplicateId],
    [webinarGanaderia4, duplicateSlug],
  ]) {
    const result = validateWebinarCollection(collection);
    assert.equal(result.valid, false);
    assert.match(result.errors.join(' | '), /duplicad|únic|unique/i);
  }
});

test('la invitación genera Event JSON-LD sin VideoObject ni datos temporales inventados', () => {
  const url = `https://sipautmach.com${WEBINAR_PATH}`;
  const imageUrl = `https://sipautmach.com/${webinarGanaderia4.thumbnail}`;
  const structuredData = createWebinarStructuredData(webinarGanaderia4, { url, imageUrl });
  const [event] = structuredData;

  assert.equal(structuredData.length, 1);
  assert.equal(event['@context'], 'https://schema.org');
  assert.equal(event['@type'], 'Event');
  assert.equal(event.name, webinarGanaderia4.title);
  assert.equal(event.url, url);
  assert.deepEqual(event.image, [imageUrl]);
  assert.equal(event.startDate, webinarGanaderia4.startDate);
  assert.equal(event.endDate, undefined);
  assert.equal(event.eventAttendanceMode, 'https://schema.org/OnlineEventAttendanceMode');
  assert.equal(event.location['@type'], 'VirtualLocation');
  assert.equal(event.location.url, webinarGanaderia4.joinUrl);
  assert.equal(event.isAccessibleForFree, true);
  assert.equal(event.organizer.name, webinarGanaderia4.organizer);
  assert.equal(event.sponsor.name, webinarGanaderia4.sponsor);
  assert.equal(event.uploadDate, undefined);
  assert.equal(event.contentUrl, undefined);
  assert.doesNotMatch(JSON.stringify(structuredData), /VideoObject|En vivo|Finalizado|Realizado/);
});

test('una grabación disponible añade VideoObject con fecha real y embed, nunca contentUrl ficticio', () => {
  const youtubeId = 'AbCdEf123_4';
  const available = webinarFixture({
    status: 'available',
    youtubeId,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    recordingPublishedAt: '2026-09-17',
  });
  const entries = createWebinarStructuredData(available, {
    url: `https://sipautmach.com${WEBINAR_PATH}`,
    imageUrl: `https://sipautmach.com/${available.thumbnail}`,
  });
  const video = entries.find(item => item['@type'] === 'VideoObject');

  assert.ok(video);
  assert.equal(video.uploadDate, '2026-09-17');
  assert.equal(video.embedUrl, `https://www.youtube-nocookie.com/embed/${youtubeId}`);
  assert.equal(video.url, `https://www.youtube.com/watch?v=${youtubeId}`);
  assert.equal(video.contentUrl, undefined);
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
