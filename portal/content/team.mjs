import { assertValidPersonRelations, getPerson } from '../../shared/people.mjs';

export const teamCategories = [
  { id: 'coordinacion', label: 'Dirección o coordinación', order: 1 },
  { id: 'coordinacion-adjunta', label: 'Subdirección o coordinación adjunta', order: 2 },
  { id: 'docentes', label: 'Docentes investigadores', order: 3 },
  { id: 'estudiantes', label: 'Estudiantes investigadores', order: 4 },
  { id: 'colaboradores', label: 'Colaboradores', order: 5 }
];

export const sipaMemberships = Object.freeze([
  Object.freeze({
    personId: 'angel-sanchez',
    category: 'docentes',
    institutionalRole: 'Miembro de SIPA',
    professionalTitle: 'Doctor en Medicina Veterinaria y Zootecnia · Máster Universitario en Producción Animal · Doctor en Ciencias Veterinarias',
    order: 10,
    published: true,
    status: 'confirmed',
  }),
  Object.freeze({
    personId: 'juan-bajana',
    category: 'estudiantes',
    institutionalRole: 'Miembro de SIPA',
    career: 'Medicina Veterinaria',
    order: 20,
    published: true,
    status: 'confirmed',
  }),
  Object.freeze({
    personId: 'robinson-macas',
    category: 'estudiantes',
    institutionalRole: 'Miembro de SIPA',
    career: 'Medicina Veterinaria',
    order: 30,
    published: true,
    status: 'confirmed',
  }),
]);

assertValidPersonRelations(sipaMemberships, { label: 'Membresías SIPA' });

export const teamMembers = Object.freeze(sipaMemberships.map(membership => {
  const person = getPerson(membership.personId);
  return Object.freeze({
    id: person.id,
    name: person.name,
    photo: person.portrait,
    professionalTitle: membership.professionalTitle || '',
    role: membership.institutionalRole,
    category: membership.category,
    career: membership.career || '',
    specialty: '',
    bio: '',
    researchInterests: [],
    email: '',
    orcid: '',
    googleScholar: '',
    linkedin: '',
    instagram: '',
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
