# Constitución técnica de SIPA

Estas reglas aplican a todo el repositorio y deben cumplirse antes, durante y después de cualquier modificación.

## Identidad institucional

- **Proyecto:** SIPA — Semillero de Investigación en Producción Animal.
- **Institución:** Universidad Técnica de Machala (UTMACH).
- **Idioma principal:** español.
- **Enfoque:** investigación, formación y producción animal multiespecie, con presentación institucional y científica.
- **Dominio técnico canónico:** `sipautmach.com`.
- **Marca visual del dominio:** `SIPAUTMACH.COM`, siempre en mayúsculas en textos visibles, material gráfico y branding. No se debe alterar DNS ni forzar el hostname del navegador a mayúsculas.

## Alcance y protección del trabajo existente

- El proyecto ya está operativo: conservar todo trabajo válido existente.
- Limitar los cambios al alcance solicitado y preferir evolución incremental sobre reescrituras o refactorizaciones innecesarias.
- Antes de modificar un archivo, inspeccionar su uso y contexto. No descartar ni sobrescribir trabajo del usuario.
- La Fase 0 prepara autonomía, agentes y documentación; no rediseña el portal, no cambia DNS ni inventa contenido institucional.

## Protección de ramas

- Nunca trabajar directamente sobre `main`.
- Crear una rama específica para cada tarea.
- Subir únicamente la rama de trabajo.
- Abrir un pull request hacia `main`.
- No fusionar el pull request automáticamente.
- No usar `git reset --hard`, `git clean -fd`, force push, reescritura de historia ni eliminación masiva sin una razón extraordinaria y autorización explícita.

## Preparación antes de modificar código

- Antes de modificar código, ejecutar `git status`.
- Actualizar las referencias remotas antes de comenzar.
- Confirmar la rama actual y el estado del repositorio.
- Inspeccionar los commits recientes, la estructura relevante, `package.json`, `AGENTS.md` y los workflows afectados.
- Detenerse si existen cambios locales no relacionados con la tarea.

## Protección de información, datos y secretos

- No borrar datos, migraciones ni archivos sin verificar previamente su uso.
- No ejecutar migraciones destructivas sin autorización explícita.
- No modificar archivos `.env`.
- No publicar claves, contraseñas, tokens ni otros secretos.
- No sobrescribir información existente de usuarios, pacientes, animales, granjas, historiales o registros.
- Las credenciales de GitHub, Cloudflare u otros proveedores deben permanecer fuera del repositorio y nunca imprimirse en comandos, logs, documentación ni commits.

## Autonomía operativa de Codex

Dentro de este repositorio Codex está autorizado a inspeccionar, leer, crear, editar, refactorizar dentro del alcance, ejecutar comandos del proyecto, instalar dependencias justificadas, ejecutar builds, pruebas y lint, diagnosticar y corregir errores, usar agentes, crear documentación y trabajar con Git. Puede crear commits cuando el objetivo lo requiera.

No debe pedir confirmación para decisiones rutinarias que formen parte del objetivo, por ejemplo: ejecutar validaciones, revisar resultados, corregir un error derivado de su cambio, volver a validar o preparar un commit coherente.

## Condiciones que requieren intervención humana

Detener el flujo autónomo únicamente ante gasto económico, compra, una credencial indispensable inexistente, eliminación irreversible de datos externos, cambio destructivo de producción, modificación de infraestructura externa sensible, o una decisión institucional o de producto con consecuencias sustanciales que no pueda inferirse de forma segura.

Una decisión técnica normal no es motivo para detenerse. Si existe un bloqueo, documentar la causa raíz, el impacto y el siguiente paso exacto.

## Arquitectura multiagente

- **architect:** comprende el proyecto antes de cambiar arquitectura, analiza dependencias e integraciones, divide objetivos, delega sin duplicar trabajo, detecta riesgos y realiza la revisión arquitectónica final.
- **developer:** implementa HTML, CSS, JavaScript, TypeScript, Vite, componentes, scripts e integraciones; reutiliza lo existente y valida cada cambio.
- **ui-brand:** protege la identidad SIPA/UTMACH, UX, responsive, tipografía, jerarquía, accesibilidad y la representación visual `SIPAUTMACH.COM`.
- **qa-security:** verifica build, tipos, rutas, HTML, assets, responsive, accesibilidad, secretos, dependencias, vulnerabilidades y regresiones. Ante una falla dentro del alcance: diagnostica, corrige, prueba y reevalúa; nunca ejecuta `npm audit fix` a ciegas.
- **devops-release:** gestiona ramas, commits, CI/CD, build, GitHub Pages y futuras consideraciones de dominio/HTTPS/canonical. Nunca fuerza pushes, escribe secretos ni destruye producción.

Los agentes inspeccionan primero, comparten evidencia y trabajan en subtareas independientes. `architect` revisa la coherencia entre frontend, despliegue y dominio antes del cierre de una iniciativa amplia.

## Desarrollo y estándares técnicos

- Priorizar mobile-first, responsive, accesibilidad, rendimiento, SEO, mantenibilidad, diseño institucional y progressive enhancement cuando corresponda.
- Reutilizar componentes y patrones existentes; mantener compatibilidad hacia atrás cuando sea necesaria.
- Nunca declarar terminada una tarea de implementación sin validarla.
- Ejecutar las pruebas, build, lint, chequeos de tipo y revisiones proporcionales al cambio. Si una validación falla, diagnosticar la causa raíz, corregir y repetir.

## Diseño, UX y marca

- Mantener una identidad universitaria sobria, científica y coherente con producción animal multiespecie.
- Cuidar jerarquía visual, legibilidad, espaciado, navegación, estados de foco, contraste y diseño responsive.
- Usar `SIPAUTMACH.COM` para toda representación visual del dominio; usar `sipautmach.com` sólo cuando sea necesario como URL técnica.

## Dominio, SEO y despliegue

- Tratar `sipautmach.com` como URL canónica técnica futura, sin modificar DNS, certificados, redirects o producción salvo autorización explícita.
- Revisar integraciones de frontend, build, CI/CD y dominio antes de cambios de arquitectura o de publicación.
- No introducir tokens, secretos ni configuraciones externas sensibles en archivos versionados.

## Windows, UTF-8 y compatibilidad CI/Linux

- El desarrollo local se realiza en Windows con Node.js v24.x; el CI se ejecuta en Linux. Preservar ambas compatibilidades.
- Usar `npm.cmd`/`npx.cmd` cuando PowerShell bloquee scripts `.ps1`.
- No revertir la compatibilidad de `spawnSync` con `npm.cmd` ya resuelta en `scripts/build-sipa.mjs`.
- Evitar `shell: true` innecesario al usar `child_process`.
- Todos los archivos de texto deben conservar UTF-8. No introducir mojibake; preservar correctamente `histórica`, `versión`, `←`, `…` y `—`.

## Desarrollo y validación

- Limitar los cambios exclusivamente al alcance solicitado.
- Evitar refactorizaciones innecesarias.
- Ejecutar todas las pruebas disponibles relacionadas con los cambios.
- Revisar `git diff` antes de confirmar cambios.
- Verificar que no existan archivos o cambios accidentales.
- Detenerse si existen pruebas fallidas o cambios no relacionados.

## Commits y pull requests

- Crear commits claros, pequeños y relacionados con una sola tarea.
- No incluir cambios ajenos al objetivo del commit.
- Subir únicamente la rama de trabajo.
- Abrir un pull request hacia `main`.
- No fusionar el pull request automáticamente.
- Explicar en el pull request qué se modificó, por qué, qué pruebas se ejecutaron y qué riesgos o pendientes existen.
