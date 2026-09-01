const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const page = ({
  id,
  path,
  output,
  title,
  description,
  navLabel,
  parentId = 'home',
  activeNavId = id,
  navOrder,
  sections = [],
  submenu = [],
  footer = [],
  sitemap = {},
}) => ({
  id,
  path,
  output,
  kind: 'page',
  page: id,
  title,
  description,
  navLabel,
  parentId,
  activeNavId,
  published: true,
  navigation: {
    primary: Number.isFinite(navOrder),
    order: navOrder ?? null,
    submenu,
    footer,
  },
  sections,
  sitemap: {
    include: true,
    changefreq: 'monthly',
    priority: 0.7,
    ...sitemap,
  },
});

const routeDefinitions = [
  page({
    id: 'home',
    path: '/',
    output: 'index.html',
    title: 'Inicio | SIPA UTMACH',
    description: 'SIPA UTMACH conecta investigación, formación y divulgación científica para una producción animal responsable.',
    navLabel: 'Inicio',
    parentId: null,
    navOrder: 10,
    sitemap: { changefreq: 'weekly', priority: 1 },
  }),
  page({
    id: 'sipa',
    path: '/sipa/',
    output: 'sipa/index.html',
    title: 'SIPA | Semillero de Investigación en Producción Animal',
    description: 'Conoce el propósito, los objetivos y la forma de trabajo del Semillero de Investigación en Producción Animal de UTMACH.',
    navLabel: 'SIPA',
    navOrder: 20,
    sections: [
      { id: 'quienes-somos', label: 'Quiénes somos' },
      { id: 'proposito', label: 'Nuestro propósito' },
      { id: 'como-trabajamos', label: 'Cómo trabajamos' },
      { id: 'objetivos', label: 'Objetivos' },
      { id: 'historia', label: 'Historia' },
      { id: 'utmach', label: 'Vinculación con UTMACH' },
    ],
    submenu: [
      { sectionId: 'quienes-somos' },
      { sectionId: 'proposito' },
      { sectionId: 'objetivos' },
      { sectionId: 'historia' },
    ],
    footer: [
      { group: 'sipa', sectionId: 'quienes-somos', order: 10 },
      { group: 'sipa', sectionId: 'proposito', order: 20 },
    ],
    sitemap: { priority: 0.9 },
  }),
  page({
    id: 'research',
    path: '/investigacion/',
    output: 'investigacion/index.html',
    title: 'Investigación | SIPA UTMACH',
    description: 'Áreas actuales de trabajo, proceso de investigación, proyectos y producción científica de SIPA UTMACH.',
    navLabel: 'Investigación',
    navOrder: 30,
    sections: [
      { id: 'lineas', label: 'Áreas de trabajo' },
      { id: 'proceso', label: 'Proceso de investigación' },
      { id: 'proyectos', label: 'Proyectos' },
      { id: 'publicaciones', label: 'Publicaciones' },
      { id: 'produccion-cientifica', label: 'Producción científica' },
    ],
    submenu: [
      { sectionId: 'lineas' },
      { sectionId: 'proyectos' },
      { sectionId: 'publicaciones' },
    ],
    footer: [
      { group: 'research', sectionId: 'lineas', order: 10 },
      { group: 'research', sectionId: 'proyectos', order: 20 },
      { group: 'research', sectionId: 'publicaciones', order: 30 },
      { group: 'research', sectionId: 'produccion-cientifica', order: 40 },
    ],
    sitemap: { priority: 0.9 },
  }),
  page({
    id: 'outreach',
    path: '/divulgacion/',
    output: 'divulgacion/index.html',
    title: 'Divulgación científica | SIPA UTMACH',
    description: 'Centro de divulgación científica de SIPA con webinars, artículos, noticias y recursos educativos.',
    navLabel: 'Divulgación',
    navOrder: 40,
    sections: [
      { id: 'articulos', label: 'Artículos' },
      { id: 'recursos', label: 'Recursos educativos' },
      { id: 'noticias', label: 'Noticias' },
      { id: 'galeria', label: 'Galería multimedia' },
    ],
    submenu: [
      { routeId: 'webinars' },
      { sectionId: 'articulos' },
      { sectionId: 'recursos' },
      { sectionId: 'noticias' },
    ],
    footer: [
      { group: 'outreach', sectionId: 'articulos', order: 20 },
      { group: 'outreach', sectionId: 'recursos', order: 30 },
      { group: 'outreach', sectionId: 'noticias', order: 40 },
    ],
    sitemap: { priority: 0.9 },
  }),
  page({
    id: 'webinars',
    path: '/divulgacion/webinars/',
    output: 'divulgacion/webinars/index.html',
    title: 'Webinars | SIPA UTMACH',
    description: 'Biblioteca de webinars de SIPA sobre investigación, formación veterinaria y producción animal.',
    navLabel: 'Webinars',
    parentId: 'outreach',
    activeNavId: 'outreach',
    footer: [{ group: 'outreach', order: 10 }],
    sitemap: { priority: 0.8 },
  }),
  page({
    id: 'events',
    path: '/eventos/',
    output: 'eventos/index.html',
    title: 'Eventos | SIPA UTMACH',
    description: 'Próximos eventos, actividades realizadas y archivo histórico de experiencias educativas de SIPA UTMACH.',
    navLabel: 'Eventos',
    navOrder: 50,
    sections: [
      { id: 'proximos', label: 'Próximos eventos' },
      { id: 'realizados', label: 'Eventos realizados' },
      { id: 'archivo', label: 'Archivo histórico' },
    ],
    footer: [{ group: 'outreach', order: 50 }],
    sitemap: { priority: 0.9 },
  }),
  {
    id: 'expoferia',
    path: '/eventos/expoferia-nutricion-animal-2026/',
    output: 'eventos/expoferia-nutricion-animal-2026/index.html',
    kind: 'artifact',
    page: null,
    title: 'Expoferia de Nutrición Animal 2026 | SIPA UTMACH',
    description: 'Experiencia educativa histórica de SIPA sobre elaboración de alimentos balanceados para pollos de engorde.',
    navLabel: 'Expoferia 2026',
    parentId: 'events',
    activeNavId: 'events',
    published: true,
    navigation: { primary: false, order: null, submenu: [], footer: [] },
    sections: [],
    sitemap: { include: true, changefreq: 'yearly', priority: 0.6 },
  },
  page({
    id: 'team',
    path: '/equipo/',
    output: 'equipo/index.html',
    title: 'Equipo | SIPA UTMACH',
    description: 'Estructura del equipo de coordinación, docentes, estudiantes y colaboradores del semillero SIPA UTMACH.',
    navLabel: 'Equipo',
    navOrder: 60,
    sections: [
      { id: 'coordinacion', label: 'Coordinación' },
      { id: 'coordinacion-adjunta', label: 'Coordinación adjunta' },
      { id: 'docentes', label: 'Docentes investigadores' },
      { id: 'estudiantes', label: 'Estudiantes investigadores' },
      { id: 'colaboradores', label: 'Colaboradores' },
    ],
    footer: [{ group: 'sipa', order: 30 }],
    sitemap: { priority: 0.8 },
  }),
  page({
    id: 'contact',
    path: '/contacto/',
    output: 'contacto/index.html',
    title: 'Contacto | SIPA UTMACH',
    description: 'Canales e información institucional para contactar al Semillero de Investigación en Producción Animal de UTMACH.',
    navLabel: 'Contacto',
    navOrder: 70,
    sections: [
      { id: 'canales', label: 'Canales institucionales' },
      { id: 'ubicacion', label: 'Ubicación' },
    ],
    footer: [{ group: 'sipa', order: 40 }],
    sitemap: { priority: 0.8 },
  }),
];

const validateRouteDefinitions = routes => {
  const ids = new Set();
  const paths = new Set();
  const outputs = new Set();

  for (const route of routes) {
    if (!/^[a-z][a-z0-9-]*$/.test(route.id)) throw new Error(`Identificador de ruta inválido: ${route.id}`);
    if (ids.has(route.id)) throw new Error(`Identificador de ruta duplicado: ${route.id}`);
    if (!route.path.startsWith('/') || !route.path.endsWith('/') || route.path !== route.path.toLowerCase()) {
      throw new Error(`Ruta pública inválida: ${route.path}`);
    }
    if (paths.has(route.path)) throw new Error(`Ruta pública duplicada: ${route.path}`);
    if (!/(^|\/)index\.html$/.test(route.output) || route.output.startsWith('/') || route.output.includes('..')) {
      throw new Error(`Archivo de salida inválido para ${route.id}: ${route.output}`);
    }
    if (outputs.has(route.output)) throw new Error(`Archivo de salida duplicado: ${route.output}`);

    ids.add(route.id);
    paths.add(route.path);
    outputs.add(route.output);
  }

  for (const route of routes) {
    if (route.parentId && !ids.has(route.parentId)) throw new Error(`Ruta padre inexistente para ${route.id}: ${route.parentId}`);
    if (route.activeNavId && !ids.has(route.activeNavId)) throw new Error(`Ruta activa inexistente para ${route.id}: ${route.activeNavId}`);
    const sectionIds = new Set(route.sections.map(section => section.id));
    if (sectionIds.size !== route.sections.length) throw new Error(`Secciones duplicadas en la ruta ${route.id}`);

    for (const item of route.navigation.submenu) {
      if (item.sectionId && !sectionIds.has(item.sectionId)) throw new Error(`Sección de submenú inexistente en ${route.id}: ${item.sectionId}`);
      if (item.routeId && !ids.has(item.routeId)) throw new Error(`Ruta de submenú inexistente en ${route.id}: ${item.routeId}`);
    }
    for (const item of route.navigation.footer) {
      if (item.sectionId && !sectionIds.has(item.sectionId)) throw new Error(`Sección de footer inexistente en ${route.id}: ${item.sectionId}`);
    }
  }
};

validateRouteDefinitions(routeDefinitions);

export const ROUTES = deepFreeze(routeDefinitions);
export const routes = ROUTES;
export const routeById = new Map(ROUTES.map(route => [route.id, route]));
export const routeByPath = new Map(ROUTES.map(route => [route.path, route]));

export const getRouteById = id => routeById.get(id) ?? null;
export const getRouteByPath = path => routeByPath.get(path) ?? null;
export const getPublishedRoutes = () => ROUTES.filter(route => route.published);

export default ROUTES;
