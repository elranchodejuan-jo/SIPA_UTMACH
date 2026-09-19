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
- Las imágenes generales del portal deben estar autorizadas para publicación y guardarse en `portal/assets/images/`.
- Los retratos reutilizados por el portal y los eventos tienen una única fuente en `assets/images/people/`.

Después de cualquier cambio de contenido, ejecutar:

```powershell
npm.cmd run build
npm.cmd run check:site
npm.cmd run test:e2e
```

Antes de confirmar cambios, revisar el HTML generado, los enlaces, el modo oscuro y los viewports móviles.

## Añadir un webinar

Las invitaciones, grabaciones y fichas archivadas comparten un único catálogo en
`portal/content/webinars.mjs`. Las rutas individuales, la aparición en Inicio y
Eventos, la biblioteca, el sitemap y los metadatos se derivan de ese catálogo: no
se debe crear HTML, CSS ni una ruta manual por encuentro.

1. Copiar `portal/content/templates/webinar-invitacion.mjs` como referencia
   editorial. La plantilla es código fuente no público y nunca se importa como
   un evento real.
2. Guardar el afiche autorizado en
   `portal/assets/images/webinars/<slug>.<ext>` sin modificar el original.
3. Añadir la ficha confirmada al array `webinars` de
   `portal/content/webinars.mjs`.
4. Mantener `published: false`, `featured: false` y `status: 'draft'` mientras
   falte cualquier dato obligatorio o no se haya confirmado su publicación.

Ejemplo resumido de una invitación:

```js
{
  id: 'identificador-estable',
  slug: 'titulo-del-webinar-2027',
  title: 'Título confirmado',
  speaker: 'Nombre confirmado',
  speakerRole: 'Credenciales confirmadas',
  date: '2027-09-01',
  startDate: '2027-09-01T18:00:00-05:00',
  endDate: null,
  timeZone: 'America/Guayaquil',
  secondaryTimeZones: [],
  duration: null,
  platform: 'Zoom',
  registrationUrl: 'https://...',
  joinUrl: 'https://...',
  meetingId: '',
  isAccessibleForFree: true,
  organizer: 'SIPA — Semillero de Investigación en Producción Animal',
  sponsor: '',
  summary: 'Resumen breve y verificable.',
  description: 'Descripción ampliada y verificable.',
  invitation: 'Invitación confirmada.',
  thumbnail: 'assets/images/webinars/titulo-del-webinar-2027.jpg',
  thumbnailAlt: 'Descripción funcional del afiche.',
  thumbnailWidth: 1200,
  thumbnailHeight: 1200,
  topics: ['Nutrición animal'],
  species: ['Aves'],
  youtubeUrl: null,
  youtubeId: null,
  recordingPublishedAt: null,
  featured: true,
  published: true,
  status: 'upcoming',
  resources: []
}
```

### Campos y estados

- Son obligatorios en todo registro: `id`, `slug`, `title`, `summary`,
  `description`, `speaker`, `date`, `startDate`, `timeZone`, `status`,
  `published` y `featured`.
- Una invitación publicada (`upcoming`) requiere afiche con texto alternativo y
  dimensiones, además de al menos un destino HTTPS confirmado en
  `registrationUrl` o `joinUrl`. No requiere YouTube.
- Una grabación disponible (`available`) requiere un video válido y
  `recordingPublishedAt`, que es la fecha real de publicación del video, no la
  fecha del encuentro.
- Una ficha archivada (`archived`) conserva su URL estable y puede no tener
  grabación. En ese caso no muestra reproductor ni botón de video.
- Un borrador (`draft`) exige `published: false` y no genera tarjeta, ficha,
  sitemap ni datos estructurados.
- `endDate`, `duration`, `meetingId`, `sponsor`, `resources`, zonas secundarias
  y grabación son opcionales. Deben permanecer en `null`, cadena vacía o array
  vacío cuando no estén confirmados; nunca se completan por inferencia.
- `date` debe coincidir con el día local de `startDate` en `timeZone`. Si existe
  `endDate`, debe ser posterior al inicio.
- Los destinos externos deben usar HTTPS, no incluir credenciales y corresponder
  exactamente a la fuente confirmada.

Formatos admitidos para una grabación de YouTube:

- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/embed/...`
- `youtube.com/shorts/...`

El ID debe tener 11 caracteres válidos. El build detiene la publicación de una
grabación si el video es inválido o si `youtubeId` y `youtubeUrl` no coinciden.
No se debe inventar una grabación para publicar una invitación.

### Destacar, archivar y añadir una grabación

- `featured: true` permite destacar una ficha publicada. La etiqueta temporal
  visible se deriva de la fecha; no escribir «hoy», «mañana», «en vivo» o
  «realizado» en el catálogo.
- Después del encuentro, conservar el mismo `id`, `slug` y URL. Cambiar a
  `archived` cuando corresponda editorialmente; no crear otro evento.
- Cuando exista una grabación confirmada, actualizar esa misma ficha a
  `available` y completar `youtubeUrl`, `youtubeId` y
  `recordingPublishedAt`.
- No mantener indefinidamente una invitación vencida como próximo evento. La
  interfaz aplica una etiqueta temporal neutral, pero el estado editorial sigue
  requiriendo revisión humana.

Tras cualquier cambio, ejecutar `npm.cmd run check:js`, `npm.cmd run build`,
`npm.cmd run check:site`, `npm.cmd run test:unit` y `npm.cmd run test:e2e`.

## Registrar una persona compartida

Añadir una entrada neutral en `shared/people.mjs` y guardar su único retrato fuente en `assets/images/people/`:

```js
{
  id: 'nombre-apellido',
  name: 'Nombre completo confirmado',
  portrait: 'assets/images/people/nombre-apellido.webp',
  status: 'confirmed',
  contacts: []
}
```

El registro compartido identifica a la persona, no afirma que pertenezca a SIPA ni que participe en un evento. El `id` es estable: los cambios editoriales del nombre no deben crear otra persona. No se debe mantener una segunda copia editable del retrato en `public/` o `portal/`.

Si la persona está identificada pero faltan apellido, retrato u otros datos indispensables, se registra temporalmente en `draftPeople` con `status: 'draft'`, `portrait: ''` y `contacts: []`. Su relación se prepara en `sipaDraftMemberships`; estos exports editoriales no llegan a los artefactos públicos. Un borrador nunca se publica y no se crea un registro para una persona todavía sin nombre.

Los contactos personales autorizados se registran una sola vez en `contacts` con `type`, `label`, `url`, `published` y `status`. Solo se publican contactos `confirmed` con URL segura; no se copian teléfonos o correos encontrados incidentalmente.

La formación académica reutilizable se añade a `academicProfile`:

```js
academicProfile: {
  credentials: [
    { degree: 'Título confirmado', institution: 'Universidad confirmada', country: 'País' }
  ],
  trajectory: ['Trayectoria respaldada sin antigüedad dinámica'],
  areas: ['Área confirmada']
}
```

No trasladar cargos de eventos, funciones temporales, años de experiencia que queden obsoletos ni afiliaciones cuya vigencia no esté confirmada.

## Incorporar una persona a SIPA

Editar `sipaMemberships` en `portal/content/team.mjs` y referenciar el `personId` existente:

```js
{
  personId: 'nombre-apellido',
  category: 'ayudantias',
  institutionalRole: 'Miembro de SIPA',
  officialPosition: '',
  badges: [
    { label: 'Función confirmada', published: true, status: 'confirmed' }
  ],
  career: 'Medicina Veterinaria',
  order: 10,
  published: true,
  status: 'confirmed'
}
```

`teamMembers` se deriva automáticamente de las personas y las membresías; no se edita directamente. `badges` permite varias funciones en una sola tarjeta. Usar `Miembro de SIPA` cuando la pertenencia esté confirmada pero no exista un cargo institucional confirmado y dejar `officialPosition: ''` hasta conocer la denominación exacta. No copiar roles, semestres ni temas de un evento.

Categorías válidas:

- `docentes`
- `ayudantias`
- `comunicacion-digital`
- `otros`

No inferir cargos a partir de la participación en la Expoferia. Antes de publicar a otra persona, confirmar nombre publicado, pertenencia, función, categoría, fotografía y autorización de publicación.

Si una persona todavía no tiene un retrato autorizado, no se debe inventar ni reutilizar una imagen ajena; su publicación queda pendiente hasta completar el registro compartido.

Para preparar una incorporación incompleta, crear la persona en `draftPeople` y la membresía en `sipaDraftMemberships` con `status: 'draft'` y `published: false`. La función también puede permanecer como insignia `draft`. Antes de publicar, confirmar nombre, retrato, pertenencia, grupo, insignias, orden y contactos; después mover el registro a `people`, mover su relación a `sipaMemberships`, cambiar ambos a `confirmed` y activar `published: true`. Los validadores impiden publicar o incluir en el bundle un borrador y también rechazan una persona confirmada sin retrato.

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

## Vincular una persona a Expoferia

Editar `expoferiaParticipants` en `src/data/site.ts` y añadir una relación con el `personId` existente. La relación conserva el rol, orden, visibilidad y datos históricos propios del evento:

```ts
{
  eventId: EXPOFERIA_EVENT_ID,
  personId: 'nombre-apellido',
  eventRole: 'Rol confirmado en el evento',
  order: 40,
  presentation: 'member',
  career: 'Dato respaldado para el evento',
  semester: 'Dato histórico del evento',
  topic: 'Tema del evento',
  altText: 'Texto alternativo confirmado',
  portraitQuery: '',
  visible: true
}
```

Una persona puede vincularse a varios eventos, pero no repetirse dentro del mismo `eventId`. El adaptador mantiene `siteData.teacher` y `siteData.team`; no se duplican identidad, retrato, formación ni contactos personales y no es necesario cambiar el renderer.

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
- WhatsApp institucional no se añade manualmente a `contactChannels`: configurar `SITE_CONFIG.contact.whatsappNumber` en `portal/config/site.mjs` con formato E.164 y prefijo `+`. El canal aparecerá automáticamente en Contacto, footer y Equipo.
- Mientras `whatsappNumber` esté vacío, no se genera ningún enlace de WhatsApp.
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
