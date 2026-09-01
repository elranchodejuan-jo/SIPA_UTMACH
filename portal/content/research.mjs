export const researchAreas = [
  {
    id: 'bovinos',
    name: 'Bovinos',
    icon: 'bovine',
    description: 'Producción, nutrición, manejo, bienestar y aprovechamiento eficiente de recursos.',
    topics: ['Nutrición', 'Manejo', 'Bienestar'],
    status: 'active',
    published: true
  },
  {
    id: 'porcinos',
    name: 'Porcinos',
    icon: 'swine',
    description: 'Sanidad, reproducción, alimentación y gestión de sistemas productivos.',
    topics: ['Sanidad', 'Reproducción', 'Eficiencia'],
    status: 'active',
    published: true
  },
  {
    id: 'aves',
    name: 'Aves',
    icon: 'poultry',
    description: 'Formulación, alimentación por fases, salud intestinal y evaluación productiva.',
    topics: ['Formulación', 'Desempeño', 'Nutrición'],
    status: 'active',
    published: true
  }
];

export const researchProcess = [
  { id: 'pregunta', number: '01', title: 'Plantear', description: 'Delimitar una pregunta relevante y un objetivo verificable.' },
  { id: 'metodo', number: '02', title: 'Diseñar', description: 'Seleccionar métodos, variables y criterios adecuados.' },
  { id: 'evidencia', number: '03', title: 'Analizar', description: 'Registrar, organizar y contrastar la evidencia obtenida.' },
  { id: 'comunicar', number: '04', title: 'Comunicar', description: 'Compartir únicamente resultados revisados y contextualizados.' }
];

/**
 * Proyectos confirmados. Añadir objetos siguiendo docs/CONTENT_GUIDE.md.
 * No publicar borradores ni proyectos de demostración.
 */
export const researchProjects = [];

export const publications = [];
export const scientificOutputs = [];

export const researchEmptyMessages = {
  projects: 'Los proyectos confirmados se incorporarán progresivamente a este registro.',
  publications: 'Las publicaciones y productos científicos confirmados se incorporarán progresivamente a esta biblioteca.',
  outputs: 'Los resultados y productos científicos se publicarán después de su validación institucional.'
};
