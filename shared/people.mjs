const PEOPLE_ASSET_ROOT = 'assets/images/people/';

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const personRecords = [
  {
    id: 'angel-sanchez',
    name: 'Angel Roberto Sánchez Quinche',
    portrait: `${PEOPLE_ASSET_ROOT}angel-sanchez.png`,
    status: 'confirmed',
    academicProfile: {
      credentials: [
        {
          degree: 'Doctor en Medicina Veterinaria y Zootecnia',
          institution: 'Universidad Técnica de Machala',
          country: 'Ecuador',
        },
        {
          degree: 'Máster Universitario en Producción Animal',
          institution: 'Universitat Politècnica de València',
          country: 'España',
        },
        {
          degree: 'Doctor en Ciencias Veterinarias',
          institution: 'Universidad del Zulia',
          country: 'Venezuela',
        },
      ],
      trajectory: [
        'Desarrolla actividades de docencia e investigación en la Universidad Técnica de Machala.',
        'Cuenta con experiencia en el sector privado como veterinario de campo y administrador de granjas.',
        'Ha participado en proyectos académicos y conferencias nacionales e internacionales.',
        'Ha realizado actividades de revisión y contribuido con artículos en revistas regionales y de alto impacto.',
      ],
      areas: ['Producción Animal', 'Nutrición Animal', 'Ciencia de los Alimentos'],
    },
    contacts: [],
  },
  {
    id: 'carolina-cajamarca',
    name: 'Carolina Cajamarca',
    portrait: `${PEOPLE_ASSET_ROOT}carolina-cajamarca.png`,
    status: 'confirmed',
    contacts: [
      {
        type: 'instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/carolina.skl',
        published: true,
        status: 'confirmed',
      },
    ],
  },
  {
    id: 'juan-bajana',
    name: 'Juan José Bajaña',
    portrait: `${PEOPLE_ASSET_ROOT}juan-bajana.jpg`,
    status: 'confirmed',
    contacts: [
      {
        type: 'instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/elranchodejuan_jo',
        published: true,
        status: 'confirmed',
      },
    ],
  },
  {
    id: 'robinson-macas',
    name: 'Robinson Macas',
    portrait: `${PEOPLE_ASSET_ROOT}robinson-macas.jpeg`,
    status: 'confirmed',
    contacts: [
      {
        type: 'instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/macasrobin?igsh=MXJpMGo4OXVvcWFrNQ==',
        published: true,
        status: 'confirmed',
      },
    ],
  },
];

// Identidades incompletas reservadas para edición del portal. Este export no es
// consumido por Expoferia y debe promoverse a `people` únicamente al confirmar
// nombre completo, retrato y datos publicables.
export const draftPeople = /* @__PURE__ */ deepFreeze([
  {
    id: 'allison-machuca',
    name: 'Allison Machuca',
    portrait: '',
    status: 'draft',
    contacts: [],
  },
  {
    id: 'jimmy',
    name: 'Jimmy',
    portrait: '',
    status: 'draft',
    contacts: [],
  },
  {
    id: 'abigail',
    name: 'Abigail',
    portrait: '',
    status: 'draft',
    contacts: [],
  },
]);

const peopleById = new Map();
for (const person of personRecords) {
  if (!person.id || !person.name || !['confirmed', 'draft'].includes(person.status)) {
    throw new Error('Cada persona compartida requiere id, nombre y estado editorial.');
  }
  if (person.status === 'confirmed' && !person.portrait) throw new Error(`La persona confirmada ${person.id} requiere retrato.`);
  if (peopleById.has(person.id)) throw new Error(`ID de persona duplicado: ${person.id}.`);
  peopleById.set(person.id, deepFreeze(person));
}

export const people = Object.freeze([...peopleById.values()]);

export const getPerson = personId => {
  const person = peopleById.get(personId);
  if (!person) throw new Error(`No existe la persona compartida ${personId || '(sin personId)'}.`);
  return person;
};

export const assertValidPersonRelations = (relations, options = {}) => {
  const { label = 'Relaciones de personas', scopeField = '' } = options;
  const seen = new Set();

  for (const relation of relations) {
    const person = getPerson(relation?.personId);
    const scope = scopeField ? relation?.[scopeField] : '';
    if (scopeField && (typeof scope !== 'string' || !scope.trim())) {
      throw new Error(`${label}: ${person.id} no declara ${scopeField}.`);
    }
    const relationKey = scopeField ? `${scope}:${person.id}` : person.id;
    if (seen.has(relationKey)) throw new Error(`${label}: relación duplicada ${relationKey}.`);
    seen.add(relationKey);
  }

  return relations;
};
