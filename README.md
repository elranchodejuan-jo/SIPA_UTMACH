# Expo Nutrición Animal

Página web para expoferia universitaria sobre nutrición animal — Universidad Técnica de Machala.

## Tecnologías
- Vite
- TypeScript
- CSS propio (sin frameworks de UI)

## Modo claro y oscuro

NutriWeb incluye temas claro y oscuro. En la primera visita respeta la preferencia
del sistema; una selección manual se conserva en `localStorage` con la clave
`nutriweb-theme`. La lógica vive en `src/modules/theme.ts` y los colores de ambos
temas se centralizan como tokens semánticos en `src/styles/tokens.css`.

## Instalación

Para instalar las dependencias del proyecto:

```bash
npm install
npm run dev
```

## Compilación

Para generar una versión optimizada para producción y previsualizarla:

```bash
npm run build
npm run preview
```

## Edición de contenido

Todo el contenido del sitio se gestiona desde el archivo `src/data/site.ts`.
Este archivo exporta objetos que contienen los textos, enlaces y configuraciones de cada sección.
Puedes editar los campos de texto y URLs directamente en las interfaces principales definidas allí.

## Reemplazo de fotografías

Las imágenes se encuentran en la carpeta `public/images/`. Para reemplazarlas, debes sustituir los archivos respetando el nombre, formato (WebP) y proporciones sugeridas:

- **Hero escritorio:** `public/images/hero-desktop.webp` (1920×900 px)
- **Hero móvil:** `public/images/hero-mobile.webp` (1080×1350 px)
- **Docente:** `public/images/docente.webp` (400×400 px)
- **Equipo:** `public/images/team/nombre-apellido.webp` (320×400 px, ratio 4:5)
- **Galería:** `public/images/gallery/*.webp` (800×600 px)

**Recomendaciones:**
- Formato preferido: WebP
- Peso: < 150 KB para miniaturas, < 500 KB para imágenes grandes
- Usar [Squoosh](https://squoosh.app/) para optimizar imágenes.

## Configuración de Google Forms

1. Crear formulario en Google Forms
2. Añadir los campos: Nombre (opcional), Colegio/institución (opcional), Calificación 1-5, ¿Qué te llamó la atención?, Comentario, Autorización para publicar
3. **NO** solicitar correo obligatoriamente
4. Conectar con Google Sheets
5. Obtener enlace público (publicUrl)
6. En Forms > tres puntos > Insertar > copiar URL del `src` del iframe (embedUrl)
7. Pegar ambas URLs en `src/data/site.ts` en `comments.embedUrl` y `comments.publicUrl`
8. Verificar que funciona correctamente desde un dispositivo móvil

## Comentarios aprobados

Para mostrar comentarios en la página, debes copiarlos manualmente desde Google Sheets al array `approvedComments` en `site.ts` con el siguiente formato:
```typescript
{
  id: "1",
  name: "Nombre del visitante",
  institution: "Colegio",
  rating: 5,
  message: "Comentario...",
  date: "YYYY-MM-DD",
  visible: true
}
```

## Despliegue en Vercel

1. Subir el repositorio a GitHub
2. Ir a [vercel.com](https://vercel.com/) > Import
3. Seleccionar el repositorio
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click en Deploy
8. Configurar el dominio si existe

## GitHub Pages (alternativa)

1. En el archivo `vite.config.ts`, cambiar `base` a `'/nombre-repo/'`
2. Ejecutar `npm run build`
3. Usar `gh-pages` o GitHub Actions para publicar la carpeta `dist`
4. Ir a Settings > Pages > Deploy from branch (seleccionar la rama generada)

## Código QR

Para generar el código QR con el enlace de la expo, ejecuta:

```bash
npm run qr -- https://URL-FINAL.com
```

Esto generará los archivos `public/qr-expo.svg` y `public/qr-expo.png`.

## NFC

- Programar la etiqueta NFC con la URL HTTPS final de la página.
- Activar el bloqueo de escritura **solo tras verificar** que funciona.
- Probar la lectura en dispositivos Android y iPhone.
- Mantener siempre el código QR visible como respaldo.
- **NUNCA** usar `localhost` para la URL de la etiqueta.

## Uso sin conexión

- El service worker cachea los recursos para permitir la consulta offline tras la primera carga completa del sitio.
- El formulario de Google **necesita internet** para poder enviar datos.
- NFC y QR necesitan conectividad para la primera apertura.
- No se garantiza el funcionamiento offline absoluto en todos los navegadores/dispositivos.
