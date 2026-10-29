# Fondo científico interactivo · SIPA 2.2

## Propuesta implementada

Un cuaderno científico de producción animal: retícula cartesiana, doble hélice con bases A/T/G/C, fórmulas de genética y ganancia media diaria, y una gráfica ilustrativa con flecha ascendente. Las ilustraciones son decorativas; no representan datos ni resultados de SIPA. Se conservan los colores institucionales, las páginas, los afiches y la Expoferia histórica.

El mouse desplaza dos capas a distinta profundidad (hasta 22 px en horizontal y 16 px en vertical) y guía un halo verde. La respuesta se amortigua y se detiene al alcanzar el destino. No hay movimiento automático continuo.

## Accesibilidad y rendimiento

- El fondo usa `aria-hidden` y `pointer-events: none`; no captura clics ni foco.
- «Pausar fondo» permite detenerlo y recordar la elección en `sipa-science-motion`. El control sigue funcionando si localStorage está bloqueado.
- `prefers-reduced-motion`, punteros táctiles y ventanas menores de 48 rem muestran una composición estática. Los cambios de preferencia se atienden en vivo.
- Se cancela el frame pendiente al ocultar la pestaña, salir con el puntero, perder foco, cambiar tamaño o usar Tab.
- Sin JavaScript se conserva la ilustración; el control queda oculto. La impresión omite la decoración.
- SVG, CSS y JavaScript locales, sin paquetes nuevos, red adicional de terceros ni seguimiento de visitantes.

## Archivos

- `portal/templates/partials/science-background.mjs`: ilustraciones y control.
- `portal/assets/css/science-background.css`: capas, temas y adaptación móvil.
- `portal/assets/js/science-background.js`: seguimiento, pausa y preferencias.
- `tests/e2e/science-background.spec.mjs`: interacción real, pausa persistente, movimiento reducido y navegación táctil.

## Validación

El flujo del repositorio ejecuta sintaxis JavaScript, build, auditoría estática, pruebas unitarias y pruebas E2E en Chromium. Los nuevos casos se integran en la misma matriz de escritorio y móvil, junto con las auditorías de accesibilidad y navegación existentes.
