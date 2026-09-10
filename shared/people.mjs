const PEOPLE_ASSET_ROOT = 'assets/images/people/';

const personRecords = [
  {
    id: 'angel-sanchez',
    name: 'Angel Roberto Sánchez Quinche',
    portrait: `${PEOPLE_ASSET_ROOT}angel-sanchez.png`,
  },
  {
    id: 'carolina-cajamarca',
    name: 'Carolina Cajamarca',
    portrait: `${PEOPLE_ASSET_ROOT}carolina-cajamarca.png`,
  },
  {
    id: 'juan-bajana',
    name: 'Juan José Bajaña',
    portrait: `${PEOPLE_ASSET_ROOT}juan-bajana.jpg`,
  },
  {
    id: 'robinson-macas',
    name: 'Robinson Macas',
    portrait: `${PEOPLE_ASSET_ROOT}robinson-macas.jpeg`,
  },
];

const peopleById = new Map();
for (const person of personRecords) {
  if (!person.id || !person.name || !person.portrait) {
    throw new Error('Cada persona compartida requiere id, nombre y retrato.');
  }
  if (peopleById.has(person.id)) throw new Error(`ID de persona duplicado: ${person.id}.`);
  peopleById.set(person.id, Object.freeze(person));
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
