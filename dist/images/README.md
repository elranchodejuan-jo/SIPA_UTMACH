# Imágenes del proyecto

Este directorio contiene todas las imágenes utilizadas en la página web de la expoferia.

## Estructura

```
images/
├── hero-desktop.webp      → Portada de escritorio (1920 × 900 px)
├── hero-mobile.webp       → Portada móvil (1080 × 1350 px)
├── docente.webp           → Fotografía del docente (400 × 400 px)
├── hero-placeholder.svg   → Placeholder mientras no exista la foto real
├── docente-placeholder.svg
├── integrante-placeholder.svg
├── gallery-placeholder.svg
├── logo-placeholder.svg
├── team/                  → Fotografías de los estudiantes
│   ├── nombre-apellido.webp  (320 × 400 px, ratio 4:5)
│   └── ...
└── gallery/               → Fotografías de la galería
    ├── ingredientes-01.webp
    ├── pesaje-01.webp
    ├── macro-mezcla-01.webp
    ├── micro-mezcla-01.webp
    ├── mezclado-01.webp
    ├── aves-01.webp
    ├── evaluacion-01.webp
    ├── expoferia-01.webp
    └── ...
```

## Formato recomendado

- **Formato preferido:** WebP
- **Alternativa:** JPEG con calidad 80-85%

## Tamaños recomendados

| Imagen | Ancho (px) | Alto (px) | Peso máximo |
|--------|-----------|----------|-------------|
| Portada escritorio | 1920 | 900 | 500 KB |
| Portada móvil | 1080 | 1350 | 400 KB |
| Docente | 400 | 400 | 100 KB |
| Integrante | 320 | 400 | 100 KB |
| Galería miniatura | 800 | 600 | 150 KB |
| Galería ampliada | 1600 | max | 500 KB |

## Optimización

### Con herramientas en línea
1. [Squoosh](https://squoosh.app/) — Herramienta de Google para optimizar imágenes.
2. Selecciona formato WebP.
3. Ajusta la calidad a 80-85%.
4. Descarga y reemplaza el archivo.

### Con línea de comandos (si tienes cwebp instalado)
```bash
cwebp -q 82 imagen-original.jpg -o imagen-optimizada.webp
```

## Texto alternativo

Cada imagen debe tener un texto alternativo descriptivo en `src/data/site.ts`.

Ejemplo:
```
alt: 'Estudiantes pesando ingredientes para la macro mezcla en el laboratorio'
```

## Notas importantes

- No uses imágenes en base64.
- No uses imágenes de más de 1 MB.
- Recorta las imágenes al tamaño recomendado antes de subirlas.
- Para la portada móvil, asegúrate de que el contenido principal esté centrado verticalmente.
- Verifica que las fotos tengan buena iluminación y enfoque.
- Obtén autorización de las personas que aparecen en las fotografías.
