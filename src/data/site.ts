export interface SiteIdentity {
  university: string;
  faculty: string;
  career: string;
  subject: string;
  semester: string;
  title: string;
  subtitle: string;
  phrase: string;
  activityType: string;
  academicAxis: string;
  siteUrl: string;
  instagramUrl: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon: string; // SVG path data or icon name
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  type: 'macro' | 'micro';
  description: string;
  phases: string[];
  note?: string;
  internalNote?: string; // NOT visible publicly
  icon: string;
}

export interface FeedingPhase {
  id: string;
  name: string;
  crudeProtein: string;
  apparentMetabolizableEnergy: string;
  objective: string;
  description: string;
  maintained: string[];
  incorporated?: string[];
  adjusted?: string[];
  removed?: string[];
  clarification?: string;
  icon: string;
}

export interface Treatment {
  id: string;
  name: string;
  energySource: string;
  description: string;
  internalNote?: string;
}

export interface EvaluationParameter {
  name: string;
  description: string;
}

export interface ResponsiblePractice {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  thumbnail: string;
  alt: string;
  caption: string;
  category: string;
  visible: boolean;
}

export interface GalleryCategory {
  id: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  photo: string;
  career: string;
  semester: string;
  topic: string;
  role?: string;
  instagram?: string;
  altText: string;
  visible: boolean;
}

export interface Teacher {
  name: string;
  professionalTitle: string;
  role: string;
  subjects?: string[];
  description: string;
  biography?: string;
  image: string;
  institutionalLink?: string;
  visible: boolean;
}

export interface ApprovedComment {
  id: string;
  name: string;
  institution?: string;
  rating: number;
  message: string;
  date: string;
  visible: boolean;
}

export interface CommentsConfiguration {
  provider: 'googleForms';
  embedUrl: string;
  publicUrl: string;
  lazyLoad: boolean;
  showApprovedComments: boolean;
}

export interface ReferenceSource {
  id: string;
  institution: string;
  title: string;
  description: string;
  url: string;
}

export interface SiteData {
  identity: SiteIdentity;
  navigation: NavigationItem[];
  processSteps: ProcessStep[];
  ingredients: Ingredient[];
  feedingPhases: FeedingPhase[];
  treatments: Treatment[];
  sharedIngredients: string[];
  evaluationParameters: EvaluationParameter[];
  responsiblePractices: ResponsiblePractice[];
  gallery: GalleryItem[];
  openHouseGallery: GalleryItem[];
  galleryCategories: GalleryCategory[];
  teacher: Teacher;
  team: TeamMember[];
  comments: CommentsConfiguration;
  approvedComments: ApprovedComment[];
  references: ReferenceSource[];
  phaseBenefits: string[];
}

export const siteData: SiteData = {
  identity: {
    university: 'Universidad Técnica de Machala',
    faculty: 'Facultad de Ciencias Agropecuarias',
    career: 'Carrera de Medicina Veterinaria',
    subject: 'Nutrición Animal',
    semester: 'Cuarto semestre',
    title: 'NUTRICIÓN ANIMAL RESPONSABLE',
    subtitle: 'Elaboración de alimentos balanceados por fases para pollos de engorde',
    phrase: 'Cada etapa tiene necesidades diferentes. Cada ingrediente cumple una función.',
    activityType: 'Expoferia universitaria',
    academicAxis: 'Nutrición y alimentación de aves',
    siteUrl: '',
    instagramUrl: ''
  },
  navigation: [
    { id: 'inicio', label: 'Inicio', href: '#inicio' },
    { id: 'nuestro-trabajo', label: 'Nuestro trabajo', href: '#nuestro-trabajo' },
    { id: 'ingredientes', label: 'Ingredientes', href: '#ingredientes' },
    { id: 'etapas', label: 'Etapas', href: '#etapas' },
    { id: 'tratamientos', label: 'Tratamientos', href: '#tratamientos' },
    { id: 'enfoque-responsable', label: 'Enfoque responsable', href: '#enfoque-responsable' },
    { id: 'galeria', label: 'Galería', href: '#galeria' },
    { id: 'equipo', label: 'Equipo', href: '#equipo' },
    { id: 'comentarios', label: 'Comentarios', href: '#comentarios' },
    { id: 'fuentes', label: 'Fuentes', href: '#fuentes' }
  ],
  processSteps: [
    {
      number: 1,
      title: 'Selección de materias primas',
      description: 'Se eligen materias primas de calidad según los requerimientos nutricionales de la formulación.',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z'
    },
    {
      number: 2,
      title: 'Pesaje correcto de ingredientes',
      description: 'Cada ingrediente se pesa con precisión para cumplir con la formulación establecida.',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z'
    },
    {
      number: 3,
      title: 'Preparación de la macro mezcla',
      description: 'Se combinan los ingredientes de mayor volumen: maíz, harina de soya, cono de arroz y aminoácidos.',
      icon: 'M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z'
    },
    {
      number: 4,
      title: 'Preparación de la micro mezcla',
      description: 'Se mezclan vitaminas, minerales, aditivos y correctores en pequeñas cantidades.',
      icon: 'M7 19c-1.1 0-2 .9-2 2h14c0-1.1-.9-2-2-2h-2c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2H7zm5-18C6.48 1 2 5.48 2 11h2c0-4.42 3.58-8 8-8s8 3.58 8 8h2c0-5.52-4.48-10-10-10z'
    },
    {
      number: 5,
      title: 'Homogeneización del alimento',
      description: 'La macro y micro mezcla se integran hasta obtener un alimento uniforme.',
      icon: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z'
    },
    {
      number: 6,
      title: 'Formulación según la edad del ave',
      description: 'La fórmula se ajusta a los requerimientos de cada etapa productiva.',
      icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z'
    },
    {
      number: 7,
      title: 'Evaluación productiva',
      description: 'Se registran parámetros de consumo, peso y conversión para comparar los tratamientos.',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
    }
  ],
  ingredients: [
    {
      id: 'harina-soya',
      name: 'Harina de soya',
      category: 'Fuente de proteína',
      type: 'macro',
      description: 'Aporta proteína y aminoácidos necesarios para la formación y mantenimiento de los tejidos.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'grain'
    },
    {
      id: 'maiz',
      name: 'Maíz',
      category: 'Fuente de carbohidratos no estructurales y energía',
      type: 'macro',
      description: 'Aporta principalmente almidón y constituye una de las principales fuentes energéticas de la dieta.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'corn'
    },
    {
      id: 'cono-arroz',
      name: 'Cono de arroz',
      category: 'Fuente de carbohidratos estructurales',
      type: 'macro',
      description: 'Aporta fibra y nutrientes complementarios a la formulación.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'fiber'
    },
    {
      id: 'lisina',
      name: 'Lisina',
      category: 'Aminoácido sintético de precisión',
      type: 'macro',
      description: 'Ayuda a ajustar el perfil de aminoácidos de la dieta en las fases de mayor requerimiento.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde'],
      icon: 'amino'
    },
    {
      id: 'metionina',
      name: 'Metionina',
      category: 'Aminoácido sintético de precisión',
      type: 'macro',
      description: 'Contribuye al ajuste nutricional relacionado con crecimiento, formación de tejidos y plumaje.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde'],
      icon: 'amino'
    },
    {
      id: 'treonina',
      name: 'Treonina',
      category: 'Aminoácido sintético de precisión',
      type: 'macro',
      description: 'Ayuda a equilibrar el perfil de aminoácidos y participa en funciones relacionadas con mantenimiento y crecimiento.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde'],
      icon: 'amino'
    },
    {
      id: 'aceite-palma',
      name: 'Aceite de palma',
      category: 'Fuente de energía',
      type: 'macro',
      description: 'Aumenta la concentración energética del alimento y contribuye al aprovechamiento de nutrientes liposolubles.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'oil'
    },
    {
      id: 'grasa-amarilla',
      name: 'Grasa amarilla',
      category: 'Fuente de energía',
      type: 'macro',
      description: 'Se utiliza como parte de la fuente energética del Tratamiento B.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      note: 'Exclusiva del Tratamiento B',
      icon: 'fat'
    },
    {
      id: 'premezcla-vitaminica',
      name: 'Premezcla vitamínico-mineral',
      category: 'Micronutrientes',
      type: 'micro',
      description: 'Complementa vitaminas y minerales esenciales que se incorporan en pequeñas cantidades.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'vitamin'
    },
    {
      id: 'colina',
      name: 'Colina',
      category: 'Micronutrientes',
      type: 'micro',
      description: 'Interviene en el metabolismo de las grasas y apoya la función hepática.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'molecule'
    },
    {
      id: 'sal-yodada',
      name: 'Sal yodada',
      category: 'Minerales',
      type: 'micro',
      description: 'Aporta sodio, cloro y yodo.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'salt'
    },
    {
      id: 'carbonato-calcio',
      name: 'Carbonato de calcio',
      category: 'Minerales',
      type: 'micro',
      description: 'Contribuye al aporte de calcio de la dieta.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'calcium'
    },
    {
      id: 'fosfato-calcio',
      name: 'Fosfato de calcio',
      category: 'Minerales',
      type: 'micro',
      description: 'Contribuye al aporte de fósforo y calcio.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      internalNote: 'Confirmar antes de publicar si el producto utilizado es fosfato monocálcico, bicálcico o monobicálcico.',
      icon: 'phosphorus'
    },
    {
      id: 'bicarbonato-sodio',
      name: 'Bicarbonato de sodio',
      category: 'Correctores',
      type: 'micro',
      description: 'Contribuye al equilibrio electrolítico y ácido-base.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'balance'
    },
    {
      id: 'coyden',
      name: 'Coyden',
      category: 'Coccidiostato',
      type: 'micro',
      description: 'Se utiliza en las fases programadas como parte de la estrategia de control de la coccidiosis.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2'],
      note: 'No se indica un número de días de retiro. Ese dato deberá comprobarse en la etiqueta y el registro del producto utilizado.',
      icon: 'shield'
    },
    {
      id: 'fitobioticos',
      name: 'Orégano deshidratado / Mix-Oil',
      category: 'Fitobióticos',
      type: 'micro',
      description: 'Se evalúan como estrategia de apoyo a la salud intestinal y como alternativa a los promotores antibióticos de crecimiento.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      icon: 'leaf'
    },
    {
      id: 'rovabio',
      name: 'Rovabio',
      category: 'Complejo enzimático',
      type: 'micro',
      description: 'Ayuda al aprovechamiento de nutrientes presentes en materias primas vegetales.',
      phases: ['Inicial 1', 'Inicial 2', 'Crecimiento 1', 'Crecimiento 2', 'Engorde', 'Finalizador'],
      internalNote: 'Confirmar la presentación comercial exacta de Rovabio utilizada en el ensayo.',
      icon: 'enzyme'
    }
  ],
  feedingPhases: [
    {
      id: 'inicial-i',
      name: 'Inicial I',
      crudeProtein: '21 %',
      apparentMetabolizableEnergy: '2800 kcal EMa/kg',
      objective: 'Aportar una dieta completa y precisa para la primera etapa de crecimiento del ave.',
      description: 'Es la etapa con la mayor concentración de proteína bruta dentro del programa de alimentación, diseñada para responder a las altas exigencias nutricionales del ave joven.',
      maintained: ['Harina de soya', 'Maíz', 'Cono de arroz', 'Vitaminas', 'Minerales', 'Fitobióticos', 'Complejo enzimático', 'Fuente energética'],
      incorporated: ['Lisina sintética', 'Metionina sintética', 'Treonina sintética', 'Coccidiostato'],
      icon: 'chick'
    },
    {
      id: 'inicial-ii',
      name: 'Inicial II',
      crudeProtein: '20,5 %',
      apparentMetabolizableEnergy: '2800 kcal EMa/kg',
      objective: 'Continuar el desarrollo inicial ajustando progresivamente la concentración de proteína.',
      description: 'Se mantiene la base nutricional de la fase inicial, con una ligera reducción de proteína bruta y el mismo nivel de energía metabolizable aparente.',
      maintained: ['Harina de soya', 'Maíz', 'Cono de arroz', 'Vitaminas', 'Minerales', 'Fitobióticos', 'Complejo enzimático', 'Fuente energética', 'Lisina sintética', 'Metionina sintética', 'Treonina sintética', 'Coccidiostato'],
      adjusted: ['Cantidades según el avance del ave'],
      icon: 'chick'
    },
    {
      id: 'crecimiento-i',
      name: 'Crecimiento I',
      crudeProtein: '20 %',
      apparentMetabolizableEnergy: '2900 kcal EMa/kg',
      objective: 'Adaptar la dieta al aumento del peso corporal y a una mayor demanda energética.',
      description: 'Durante esta etapa se conserva la base de ingredientes y se incrementa la energía metabolizable aparente para acompañar el crecimiento del ave.',
      maintained: ['Harina de soya', 'Maíz', 'Cono de arroz', 'Vitaminas', 'Minerales', 'Fitobióticos', 'Complejo enzimático', 'Fuente energética', 'Aminoácidos sintéticos', 'Coccidiostato'],
      adjusted: ['Cantidades según edad, peso y consumo'],
      icon: 'growing-chicken'
    },
    {
      id: 'crecimiento-ii',
      name: 'Crecimiento II',
      crudeProtein: '19,5 %',
      apparentMetabolizableEnergy: '3000 kcal EMa/kg',
      objective: 'Favorecer el crecimiento corporal con una mayor densidad energética y un ajuste gradual de la proteína.',
      description: 'La energía metabolizable aparente continúa aumentando, mientras la concentración de proteína bruta se reduce de forma progresiva.',
      maintained: ['Harina de soya', 'Maíz', 'Cono de arroz', 'Vitaminas', 'Minerales', 'Fitobióticos', 'Complejo enzimático', 'Fuente energética', 'Aminoácidos sintéticos', 'Coccidiostato'],
      adjusted: ['Cantidades según edad, peso y consumo'],
      icon: 'growing-chicken'
    },
    {
      id: 'ceba',
      name: 'Ceba',
      crudeProtein: '18,5 %',
      apparentMetabolizableEnergy: '3040 kcal EMa/kg',
      objective: 'Mantener la ganancia de peso con una dieta de mayor densidad energética.',
      description: 'En la etapa de ceba se mantiene la suplementación nutricional y se alcanza el nivel energético más alto del programa. El retiro del coccidiostato depende de la planificación del ensayo, el producto empleado y las indicaciones aplicables.',
      maintained: ['Base proteica', 'Fuentes de carbohidratos', 'Fuente energética', 'Suplementación de aminoácidos sintéticos', 'Vitaminas y minerales', 'Fitobióticos', 'Enzimas'],
      removed: ['Coccidiostato'],
      icon: 'chicken'
    },
    {
      id: 'finalizador',
      name: 'Finalizador',
      crudeProtein: '17,5 %',
      apparentMetabolizableEnergy: '3040 kcal EMa/kg',
      objective: 'Evaluar una formulación final con menor dependencia de insumos sintéticos.',
      description: 'En esta etapa se mantiene el nivel energético de la ceba y se reduce nuevamente la concentración de proteína bruta.',
      maintained: ['Harina de soya', 'Maíz', 'Cono de arroz', 'Fuente energética', 'Vitaminas', 'Minerales', 'Fitobióticos', 'Enzimas'],
      removed: ['Coccidiostato', 'Suplementación con lisina sintética', 'Suplementación con metionina sintética', 'Suplementación con treonina sintética'],
      clarification: 'La retirada de la suplementación sintética no significa que el alimento quede sin aminoácidos. El maíz y la harina de soya continúan aportando aminoácidos de forma natural.',
      icon: 'mature-chicken'
    }
  ],
  treatments: [
    {
      id: 'tratamiento-a',
      name: 'Tratamiento A',
      energySource: 'Aceite de palma crudo como principal fuente de energía.',
      description: 'Utiliza aceite de palma crudo como fuente energética principal en todas las fases.'
    },
    {
      id: 'tratamiento-b',
      name: 'Tratamiento B',
      energySource: '50 % aceite de palma + 50 % grasa amarilla.',
      description: 'Combina aceite de palma con grasa amarilla como fuente energética en todas las fases.',
      internalNote: 'Confirmar si el aceite de palma del Tratamiento B fue crudo o refinado en cada fase, porque la información original presenta diferencias.'
    }
  ],
  sharedIngredients: [
    'Harina de soya', 
    'Maíz', 
    'Cono de arroz', 
    'Vitaminas', 
    'Minerales', 
    'Fitobióticos', 
    'Enzimas', 
    'Plan de alimentación por fases'
  ],
  evaluationParameters: [
    {
      name: 'Consumo de alimento',
      description: 'Cantidad total de alimento consumido por las aves durante el período de evaluación.'
    },
    {
      name: 'Ganancia de peso',
      description: 'Incremento de peso corporal durante el período de evaluación.'
    },
    {
      name: 'Conversión alimenticia',
      description: 'Relación entre el alimento consumido y el peso ganado.'
    },
    {
      name: 'Viabilidad',
      description: 'Porcentaje de aves que completan el ciclo productivo.'
    },
    {
      name: 'Uniformidad',
      description: 'Grado de homogeneidad en los pesos del lote.'
    },
    {
      name: 'Costo de alimentación',
      description: 'Costo total del alimento por ave o por kilogramo de peso producido.'
    }
  ],
  responsiblePractices: [
    {
      id: 'sin-antibioticos',
      title: 'Sin antibióticos como promotores de crecimiento',
      description: 'Se evalúan fitobióticos como estrategia de apoyo intestinal y como alternativa a los promotores antibióticos de crecimiento.',
      icon: 'no-antibiotic'
    },
    {
      id: 'sin-hormonas',
      title: 'Sin hormonas añadidas',
      description: 'No se incorporan hormonas al alimento. El crecimiento del ave depende de la genética, la nutrición, la sanidad, el ambiente y el manejo.',
      icon: 'no-hormone'
    },
    {
      id: 'coccidiostato-programado',
      title: 'Uso programado del coccidiostato',
      description: 'El coccidiostato se utiliza en las fases programadas y se retira en las etapas finales según la planificación y las indicaciones correspondientes al producto.',
      icon: 'calendar'
    },
    {
      id: 'mejor-aprovechamiento',
      title: 'Mejor aprovechamiento de nutrientes',
      description: 'Las enzimas contribuyen a mejorar el aprovechamiento de componentes presentes en las materias primas vegetales.',
      icon: 'recycle'
    }
  ],
  gallery: [
    { id: 'galeria-proceso-01', src: 'images/galeria/galeria-proceso-01.jpeg', thumbnail: '', alt: 'Grupo de estudiantes durante una actividad de campo de Nutrición Animal', caption: 'Actividad de campo del grupo de Nutrición Animal', category: 'equipo', visible: true },
    { id: 'galeria-proceso-02', src: 'images/galeria/galeria-proceso-02.jpeg', thumbnail: '', alt: 'Manejo de aves en el galpón experimental', caption: 'Manejo de aves en el galpón experimental', category: 'manejo-aves', visible: true },
    { id: 'galeria-proceso-03', src: 'images/galeria/galeria-proceso-03.jpeg', thumbnail: '', alt: 'Estudiantes preparando materiales durante la actividad de campo', caption: 'Preparación de materiales en la actividad de campo', category: 'equipo', visible: true },
    { id: 'galeria-proceso-04', src: 'images/galeria/galeria-proceso-04.jpeg', thumbnail: '', alt: 'Revisión de comederos y aves en el galpón', caption: 'Revisión de comederos y aves', category: 'manejo-aves', visible: true },
    { id: 'galeria-proceso-05', src: 'images/galeria/galeria-proceso-05.jpeg', thumbnail: '', alt: 'Registro de la visita al galpón avícola', caption: 'Visita al galpón avícola', category: 'manejo-aves', visible: true },
    { id: 'galeria-proceso-06', src: 'images/galeria/galeria-proceso-06.jpeg', thumbnail: '', alt: 'Estudiante verificando la mezcla para la alimentación', caption: 'Verificación de la mezcla para la alimentación', category: 'mezclado', visible: true },
    { id: 'galeria-proceso-07', src: 'images/galeria/galeria-proceso-07.jpeg', thumbnail: '', alt: 'Grupo de estudiantes durante la visita al galpón', caption: 'Grupo de estudiantes en la visita al galpón', category: 'equipo', visible: true },
    { id: 'galeria-proceso-08', src: 'images/galeria/galeria-proceso-08.jpeg', thumbnail: '', alt: 'Docente y estudiantes de Nutrición Animal durante una actividad de campo', caption: 'Docente y estudiantes en la actividad de campo', category: 'equipo', visible: true },
    { id: 'galeria-proceso-09', src: 'images/galeria/galeria-proceso-09.jpeg', thumbnail: '', alt: 'Grupo de estudiantes durante una visita al galpón avícola', caption: 'Grupo de estudiantes en el galpón avícola', category: 'manejo-aves', visible: true },
    { id: 'galeria-proceso-10', src: 'images/galeria/galeria-proceso-10.jpeg?v=20260730', thumbnail: '', alt: 'Estudiantes junto a sacos de materias primas para alimentación animal', caption: 'Equipo junto a las materias primas para alimentación animal', category: 'ingredientes', visible: true },
    { id: 'ingredientes-01', src: '', thumbnail: '', alt: 'Ingredientes usados', caption: '', category: 'ingredientes', visible: false },
    { id: 'pesaje-01', src: '', thumbnail: '', alt: 'Pesaje de ingredientes', caption: '', category: 'pesaje', visible: false },
    { id: 'macro-mezcla-01', src: '', thumbnail: '', alt: 'Proceso de macro mezcla', caption: '', category: 'macro-mezcla', visible: false },
    { id: 'micro-mezcla-01', src: '', thumbnail: '', alt: 'Proceso de micro mezcla', caption: '', category: 'micro-mezcla', visible: false },
    { id: 'mezclado-01', src: '', thumbnail: '', alt: 'Mezclado del alimento', caption: '', category: 'mezclado', visible: false },
    { id: 'aves-01', src: '', thumbnail: '', alt: 'Manejo de aves etapa 1', caption: '', category: 'manejo-aves', visible: false },
    { id: 'aves-02', src: '', thumbnail: '', alt: 'Manejo de aves etapa 2', caption: '', category: 'manejo-aves', visible: false },
    { id: 'evaluacion-01', src: '', thumbnail: '', alt: 'Evaluación productiva', caption: '', category: 'evaluacion', visible: false },
    { id: 'expoferia-01', src: '', thumbnail: '', alt: 'Participación en expoferia', caption: '', category: 'expoferia', visible: false },
    { id: 'equipo-01', src: '', thumbnail: '', alt: 'Equipo de trabajo', caption: '', category: 'equipo', visible: false }
  ],
  openHouseGallery: [
    { id: 'casa-abierta-01', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 9.02.19 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 1', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-02', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 9.27.33 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 2', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-03', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 9.50.33 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 3', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-04', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 9.50.34 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 4', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-05', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 9.50.35 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 5', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-06', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.07.32 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 6', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-07', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.24.45 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 7', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-08', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.29.40 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 8', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-09', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.29.41 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 9', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-10', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.39.59 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 10', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-11', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.51.24 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 11', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-12', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.51.34 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 12', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-13', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 10.51.36 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 13', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-14', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 11.06.27 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 14', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-15', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 11.58.29 AM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 15', caption: '', category: 'casa-abierta', visible: true },
    { id: 'casa-abierta-16', src: 'images/galeria-2/WhatsApp Image 2026-07-29 at 12.38.27 PM.jpeg', thumbnail: '', alt: 'Casa Abierta 2026, fotografía 16', caption: '', category: 'casa-abierta', visible: true }
  ],
  galleryCategories: [
    { id: 'todas', label: 'Todas' },
    { id: 'ingredientes', label: 'Ingredientes' },
    { id: 'pesaje', label: 'Pesaje' },
    { id: 'macro-mezcla', label: 'Macro mezcla' },
    { id: 'micro-mezcla', label: 'Micro mezcla' },
    { id: 'mezclado', label: 'Mezclado' },
    { id: 'manejo-aves', label: 'Manejo de aves' },
    { id: 'evaluacion', label: 'Evaluación' },
    { id: 'equipo', label: 'Equipo' },
    { id: 'expoferia', label: 'Expoferia' }
  ],
  teacher: {
    name: 'Angel Roberto Sánchez Quinche',
    professionalTitle: 'Doctor en Medicina Veterinaria y Zootecnia · Máster Universitario en Producción Animal · Doctor en Ciencias Veterinarias',
    role: 'Docente-Investigador de la UTMACH',
    subjects: ['Nutrición Animal', 'Salud en la Producción Porcina'],
    description: '',
    biography: 'Angel Roberto Sánchez Quinche, Doctor en Medicina Veterinaria y Zootecnia (Universidad Técnica de Machala, Ecuador), Máster Universitario en Producción Animal (Universitat Politècnica de València, España), Doctor en Ciencias Veterinarias (Universidad del Zulia, Venezuela). Desde 2013, combina su labor docente e investigadora en la Universidad Técnica de Machala, con más de 8 años de experiencia en el sector privado, donde ha trabajado como veterinario de campo y administrador de granjas, y hasta la presente fecha con más de 12 años de experiencia en la docencia de pregrado. En la UTMach, destaca como miembro de GIPASA-UTMACH y asesor de SIPA-UTMACH, activo en la investigación y la divulgación científica, ha participado en proyectos académicos, conferencias nacionales e internacionales, es revisor y ha contribuido con artículos en revistas regionales y de alto impacto, enfocándose en Producción Animal, Nutrición Animal y Ciencia de los Alimentos.',
    image: 'images/angel-sanchez.png',
    visible: true
  },
  team: [
    {
      id: "carolina-cajamarca",
      name: "Carolina Cajamarca",
      photo: "images/carolina-cajamarca.png?v=2",
      career: "Medicina Veterinaria",
      semester: "Cuarto semestre",
      topic: "Nutrición Animal",
      role: "Exponente",
      instagram: "https://www.instagram.com/carolina.skl",
      altText: "Carolina Cajamarca - Integrante del equipo expositor",
      visible: true
    },
    {
      id: "juan-bajana",
      name: "Juan José Bajaña",
      photo: "images/juan-bajana.jpg?v=2",
      career: "Medicina Veterinaria",
      semester: "Cuarto semestre",
      topic: "Nutrición Animal",
      role: "Desarrollador Web",
      instagram: "https://www.instagram.com/elranchodejuan_jo",
      altText: "Juan José Bajaña - Integrante del equipo expositor",
      visible: true
    },
    {
      id: "robinson-macas",
      name: "Robinson Macas",
      photo: "images/robinson-macas.jpeg?v=2",
      career: "Medicina Veterinaria",
      semester: "Cuarto semestre",
      topic: "Nutrición Animal",
      role: "Master Solver",
      instagram: "https://www.instagram.com/macasrobin?igsh=MXJpMGo4OXVvcWFrNQ==",
      altText: "Robinson Macas - Integrante del equipo expositor",
      visible: true
    }
  ],
  comments: {
    provider: 'googleForms',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd8w3eNooySoeQjn7OEQEVFdbQmyPePeK_ij_RRTan5-Ootcw/viewform?embedded=true',
    publicUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd8w3eNooySoeQjn7OEQEVFdbQmyPePeK_ij_RRTan5-Ootcw/viewform',
    lazyLoad: true,
    showApprovedComments: true
  },
  approvedComments: [],
  references: [
    {
      id: 'ref-1',
      institution: 'Universidad Técnica de Machala',
      title: 'Medicina Veterinaria',
      description: 'Portal académico de la Carrera de Medicina Veterinaria.',
      url: 'https://portal.utmachala.edu.ec/portalwp/carrera/medicina-veterinaria/'
    },
    {
      id: 'ref-2',
      institution: 'Aviagen',
      title: 'Pollo de engorde Ross: Especificaciones de Nutrición 2022',
      description: 'Guía de especificaciones nutricionales para pollos de engorde de la línea Ross.',
      url: 'https://aviagen.com/assets/Tech_Center/BB_Foreign_Language_Docs/Spanish_TechDocs/Ross-BroilerNutritionSpecifications2022-ES.pdf'
    },
    {
      id: 'ref-3',
      institution: 'FAO',
      title: 'Good Practices for the Feed Industry',
      description: 'Guía de buenas prácticas para la industria de alimentos balanceados.',
      url: 'https://www.fao.org/4/i1379e/i1379e.pdf'
    },
    {
      id: 'ref-4',
      institution: 'Organización Mundial de la Salud',
      title: 'Directrices sobre el uso de antimicrobianos de importancia médica en animales destinados a la producción de alimentos',
      description: 'Directrices internacionales sobre uso responsable de antimicrobianos.',
      url: 'https://www.who.int/publications/i/item/9789241550130'
    },
    {
      id: 'ref-5',
      institution: 'Agrocalidad',
      title: 'Instructivo para el registro de alimentos, suplementos alimenticios y aditivos nutricionales',
      description: 'Normativa ecuatoriana para el registro de alimentos de uso animal.',
      url: 'https://www.agrocalidad.gob.ec/wp-content/uploads/2025/01/Anexo-D_Alimentos-suplementos-alimenticios-y-aditivos-nutricionales.pdf'
    }
  ],
  phaseBenefits: [
    'Cubrir las necesidades reales de cada etapa.',
    'Evitar deficiencias y excesos.',
    'Mejorar el aprovechamiento de los nutrientes.',
    'Reducir desperdicios.',
    'Comparar estrategias de alimentación.',
    'Evaluar la respuesta productiva.'
  ]
};
