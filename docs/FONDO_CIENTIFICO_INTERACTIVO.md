# Fondo científico interactivo · SIPA 2.3.1

## Propuesta implementada

Una red de partículas conectadas con profundidad y giro suave, inspirada visualmente en el fondo de [AMC VetAtlas](https://andreerogel1997-bit.github.io/amc-vetatlas/). La implementación es original, mediante proyección 3D en Canvas 2D, sin incorporar código, recursos ni dependencias de la referencia. El fondo contiene únicamente la red y su iluminación; se retiraron la doble hélice, las fórmulas, la molécula, la gráfica de crecimiento y la cuadrícula anteriores. La red es decorativa; no representa datos ni resultados de SIPA. Se conservan los colores institucionales, las páginas, los afiches y la Expoferia histórica.

La nube gira lentamente mientras la página está activa. El mouse orienta la escena, guía un halo y conecta hasta siete partículas cercanas al puntero. El seguimiento del puntero conserva su respuesta amortiguada.

## Accesibilidad y rendimiento

- El fondo usa `aria-hidden` y `pointer-events: none`; no captura clics ni foco.
- «Pausar fondo» permite detenerlo y recordar la elección en `sipa-science-motion`. El control sigue funcionando si localStorage está bloqueado.
- `prefers-reduced-motion`, punteros táctiles y ventanas menores de 48 rem muestran una composición estática. Los cambios de preferencia se atienden en vivo.
- El dibujo se limita a 30 FPS, 78 nodos y una densidad de píxeles máxima de 1,5. Las conexiones se calculan al cambiar tamaño, no en cada frame.
- Se cancela el bucle al pausar, ocultar la pestaña o perder foco, y se reanuda sin saltos de tiempo. Salir con el puntero o usar Tab elimina el halo y el desplazamiento del mouse.
- Sin JavaScript o sin contexto Canvas 2D se conserva una red SVG estática; sin JavaScript el control queda oculto. La impresión omite la decoración.
- SVG, CSS y JavaScript locales, sin paquetes nuevos, red adicional de terceros ni seguimiento de visitantes.

## Archivos

- `portal/templates/partials/science-background.mjs`: red de respaldo, lienzo y control.
- `portal/assets/css/science-background.css`: capas, temas y adaptación móvil.
- `portal/assets/js/science-background.js`: red proyectada, seguimiento, pausa, ciclo de vida y preferencias.
- `tests/e2e/science-background.spec.mjs`: cambios reales de píxeles durante la animación, detención con pausa y movimiento reducido, respuesta del mouse, paleta en ambos temas y navegación táctil.

## Validación

El flujo del repositorio ejecuta sintaxis JavaScript, build, auditoría estática, pruebas unitarias y pruebas E2E en Chromium. Los nuevos casos se integran en la misma matriz de escritorio y móvil, junto con las auditorías de accesibilidad y navegación existentes.
