import { assertValidPersonRelations, draftPeople, getPerson } from '../../shared/people.mjs';

export const teamCategories = [
  {
    id: 'docentes',
    label: 'Docentes y dirección académica',
    order: 1,
    layout: 'featured',
    legacyAnchors: ['coordinacion', 'coordinacion-adjunta'],
  },
  {
    id: 'ayudantias',
    label: 'Ayudantías académicas y de campo',
    order: 2,
    layout: 'cards',
    legacyAnchors: ['estudiantes'],
  },
  {
    id: 'comunicacion-digital',
    label: 'Comunicación y desarrollo digital',
    order: 3,
    layout: 'cards',
    legacyAnchors: [],
  },
  {
    id: 'otros',
    label: 'Otros integrantes',
    order: 4,
    layout: 'cards',
    legacyAnchors: ['colaboradores'],
  },
];

const confirmedBadge = label => Object.freeze({ label, published: true, status: 'confirmed' });
const draftBadge = label => Object.freeze({ label, published: false, status: 'draft' });

export const sipaMemberships = Object.freeze([
  Object.freeze({
    personId: 'angel-sanchez',
    category: 'docentes',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([confirmedBadge('Docente')]),
    featured: true,
    order: 10,
    published: true,
    status: 'confirmed',
  }),
  Object.freeze({
    personId: 'robinson-macas',
    category: 'ayudantias',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([confirmedBadge('Ayudante de cátedra')]),
    career: 'Medicina Veterinaria',
    order: 10,
    published: true,
    status: 'confirmed',
  }),
  Object.freeze({
    personId: 'allison-machuca',
    category: 'ayudantias',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([confirmedBadge('Ayudante de campo')]),
    order: 20,
    published: true,
    status: 'confirmed',
  }),
  Object.freeze({
    personId: 'juan-bajana',
    category: 'comunicacion-digital',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([
      confirmedBadge('Desarrollo web'),
      confirmedBadge('Administración de redes'),
    ]),
    career: 'Medicina Veterinaria',
    order: 10,
    published: true,
    status: 'confirmed',
  }),
]);

// Relaciones editoriales incompletas. No forman parte de `teamMembers` ni de
// ningún artefacto público hasta que la identidad sea promovida a `people`.
export const sipaDraftMemberships = Object.freeze([
  Object.freeze({
    personId: 'jimmy',
    category: 'ayudantias',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([draftBadge('Ayudante de cátedra')]),
    order: 30,
    published: false,
    status: 'draft',
  }),
  Object.freeze({
    personId: 'abigail',
    category: 'comunicacion-digital',
    institutionalRole: 'Miembro de SIPA',
    officialPosition: '',
    badges: Object.freeze([]),
    order: 20,
    published: false,
    status: 'draft',
  }),
]);

assertValidPersonRelations(sipaMemberships, { label: 'Membresías SIPA' });

const draftPersonIds = new Set(draftPeople.map(person => person.id));
const draftMembershipIds = new Set();
for (const membership of sipaDraftMemberships) {
  if (!draftPersonIds.has(membership.personId)) throw new Error(`Borrador SIPA sin identidad editorial: ${membership.personId}.`);
  if (draftMembershipIds.has(membership.personId)) throw new Error(`Membresía SIPA borrador duplicada: ${membership.personId}.`);
  if (membership.published !== false || membership.status !== 'draft') throw new Error(`La membresía borrador ${membership.personId} no puede publicarse.`);
  draftMembershipIds.add(membership.personId);
}

export const teamMembers = Object.freeze(sipaMemberships.map(membership => {
  const person = getPerson(membership.personId);
  const credentials = person.academicProfile?.credentials || [];
  const contacts = (person.contacts || []).filter(contact => (
    contact.published === true && contact.status === 'confirmed'
  ));
  return Object.freeze({
    id: person.id,
    name: person.name,
    photo: person.portrait,
    personStatus: person.status,
    professionalTitle: credentials.map(credential => credential.degree).join(' · '),
    academicProfile: person.academicProfile || null,
    role: membership.institutionalRole,
    officialPosition: membership.officialPosition,
    badges: membership.badges,
    featured: membership.featured === true,
    category: membership.category,
    career: membership.career || '',
    specialty: '',
    bio: '',
    researchInterests: [],
    contacts: Object.freeze(contacts),
    order: membership.order,
    published: membership.published,
    status: membership.status,
  });
}));

export const teamContent = {
  introduction: 'SIPA integra a docentes, estudiantes y colaboradores alrededor de la formación y la investigación en producción animal.',
  emptyTitle: 'Perfiles en actualización',
  emptyMessage: 'Los perfiles del equipo se publicarán cuando sus nombres, cargos, fotografías y datos académicos hayan sido confirmados.'
};
