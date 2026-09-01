# Guía de contenido del portal SIPA V2

El portal se genera a partir de módulos ESM ubicados en `portal/content/`. Las plantillas no deben editarse para añadir webinars, integrantes, eventos, redes o proyectos.

Todo contenido institucional debe estar confirmado antes de publicarse. No se deben usar datos de demostración, perfiles personales, fotografías descargadas de internet, correos inventados ni enlaces `#`.

## Reglas de publicación

- `published: true` permite que un elemento confirmado aparezca en el sitio.
- `published: false` conserva un registro editorial fuera del HTML público.
- `featured: true` destaca un elemento publicado; no sustituye a `published`.
- `status` describe el estado del contenido. Los estados `draft` y `hidden` nunca deben publicarse.
- Los campos vacíos no se renderizan.
- Las URL externas deben ser completas y usar `https://`.
- Las imágenes deben estar autorizadas para publicación y guardarse en `portal/assets/images/`.

Después de cualquier cambio de contenido, ejecutar:

```powershell
npm.cmd run build
npm.cmd run check:site
npm.cmd run test:e2e
```

Antes de confirmar cambios, revisar el HTML generado, los enlaces, el modo oscuro y los viewports móviles.

## Añadir un webinar

Editar `portal/content/webinars.mjs` y añadir un objeto a `webinars`:

```js
{
  id: 'identificador-estable',
  slug: 'titulo-del-webinar',
  title: 'Título confirmado',
  speaker: 'Nombre confirmado',
  speakerRole: 'Cargo o afiliación confirmada',
  date: '2026-09-01',
  dateLabel: '1 de septiembre de 2026',
  duration: '58 min',
  summary: 'Resumen breve y verificable.',
  description: 'Descripción ampliada y verificable.',
  youtubeUrl: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
  youtubeId: 'XXXXXXXXXXX',
  thumbnail: '',
  topics: ['Nutrición animal'],
  species: ['Aves'],
  featured: true,
  published: true,
  status: 'available',
  resources: []
}
```

Formatos admitidos para YouTube:

- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/embed/...`
- `youtube.com/shorts/...`

El ID debe tener 11 caracteres válidos. El build detiene la publicación si un webinar marcado como publicado no tiene un video válido o si `youtubeId` y `youtubeUrl` no coinciden. Si no se especifica miniatura, se utiliza la miniatura pública del video.

Estados disponibles: `upcoming`, `available`, `archived` y `draft`. Un borrador debe mantener `published: false`.

## Añadir un integrante

Editar `portal/content/team.mjs` y añadir un objeto a `teamMembers`:

```js
{
  id: 'nombre-apellido',
  name: 'Nombre completo confirmado',
  professionalTitle: 'Título confirmado',
  role: 'Función confirmada en SIPA',
  category: 'docentes',
  career: 'Medicina Veterinaria',
  specialty: '',
  bio: '',
  researchInterests: [],
  photo: 'assets/images/equipo/nombre-apellido.webp',
  email: '',
  orcid: '',
  googleScholar: '',
  linkedin: '',
  instagram: '',
  order: 10,
  published: true,
  status: 'confirmed'
}
```

Categorías válidas:

- `coordinacion`
- `coordinacion-adjunta`
- `docentes`
- `estudiantes`
- `colaboradores`

No inferir cargos a partir de la participación en la Expoferia. Antes de publicar al Dr. Ángel, la Dra. Pimboza, Juan José Bajaña Chuno u otra persona, confirmar nombre completo, grado, función, categoría, fotografía y autorización de publicación.

Si no existe fotografía, omitir `photo`: la plantilla genera un avatar institucional con iniciales.

## Añadir un evento

Editar `portal/content/events.mjs` y añadir un objeto a `events`:

```js
{
  id: 'evento-2027',
  slug: 'evento-2027',
  title: 'Nombre confirmado del evento',
  summary: 'Resumen breve.',
  description: 'Descripción confirmada.',
  type: 'Taller',
  archiveYear: 2027,
  date: '2027-05-20',
  dateLabel: '20 de mayo de 2027',
  topics: ['Producción animal'],
  status: 'upcoming',
  routeId: '',
  externalUrl: 'https://...',
  featured: false,
  published: true
}
```

Usar `status: 'upcoming'` para próximos eventos y `status: 'completed'` para el archivo. Un evento necesita un destino real antes de mostrar una llamada a la acción. La Expoferia 2026 conserva su `routeId: 'expoferia'` y no debe reclasificarse como proyecto científico.

## Añadir una red o canal

Editar `portal/content/socials.mjs`.

Las redes oficiales se añaden a `socialLinks`; correo y WhatsApp confirmados se añaden a `contactChannels`; enlaces universitarios se mantienen en `institutionalLinks`.

```js
{
  id: 'youtube',
  label: 'YouTube',
  url: 'https://www.youtube.com/@cuenta-confirmada',
  username: '@cuenta-confirmada',
  icon: 'external',
  published: true
}
```

- No publicar cuentas personales como redes SIPA.
- No inventar nombres de usuario.
- WhatsApp debe confirmarse en formato internacional.
- El correo solo debe publicarse cuando sea un canal autorizado.
- Los elementos sin URL no deben marcarse como publicados.

## Habilitar el formulario de contacto

El formulario permanece oculto mientras `contactContent.form.published` sea `false`.

Para habilitarlo se requiere un endpoint HTTPS funcional, política clara de tratamiento de datos, validación accesible y pruebas reales de éxito y error. Nunca guardar claves o tokens en el repositorio.

## Añadir un proyecto

Editar `portal/content/research.mjs` y añadir un objeto a `researchProjects`:

```js
{
  id: 'proyecto-confirmado',
  slug: 'proyecto-confirmado',
  title: 'Título confirmado',
  summary: 'Resumen verificable.',
  species: ['Bovinos'],
  topics: ['Nutrición'],
  status: 'active',
  startDate: '2026-01-01',
  endDate: '',
  team: [],
  featured: false,
  published: true,
  externalUrl: '',
  resources: []
}
```

No publicar como proyecto una actividad, una idea futura o una experiencia educativa. Las publicaciones y resultados se incorporan únicamente cuando existan referencias confirmadas.

## Misión, visión e historia

Los campos de misión y visión están preparados en `portal/content/sipa.mjs`, pero permanecen ocultos. Solo deben cambiar a `status: 'confirmed'` después de recibir el texto institucional aprobado.

La cronología histórica requiere fechas e hitos verificados. No convertir recuerdos o borradores en afirmaciones oficiales.

## Imágenes sin deformación

- Preferir WebP, AVIF, PNG o SVG optimizados según el tipo de imagen.
- Conservar una copia de origen fuera de `dist/`; el build publica únicamente assets seleccionados.
- Declarar dimensiones `width` y `height` en la plantilla o el modelo.
- Para retratos, usar encuadre cuadrado o vertical consistente; el CSS aplica `aspect-ratio` y `object-fit: cover`.
- Redimensionar antes de publicar; no almacenar fotografías enormes para mostrarlas como miniaturas.
- Escribir texto alternativo que describa la función de la imagen.
- No usar material sin licencia o autorización.

## Contenido que requiere validación institucional

Requieren confirmación expresa:

- misión, visión e historia oficial;
- nombres completos, títulos, cargos y categorías del equipo;
- fotografías y perfiles académicos;
- proyectos, publicaciones, resultados y producción científica;
- correo, WhatsApp y redes oficiales;
- enlaces y metadatos del primer webinar;
- fechas, responsables y destinos de nuevos eventos;
- endpoint y tratamiento de datos del formulario.
