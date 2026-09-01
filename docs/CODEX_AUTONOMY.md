# Autonomía de Codex en SIPA

## Propósito

Esta guía prepara el repositorio de SIPA — Semillero de Investigación en Producción Animal de UTMACH — para trabajo autónomo, controlado y de larga duración con Codex CLI y agentes especializados. El idioma operativo es español. El dominio técnico canónico es `sipautmach.com`; en toda interfaz, material gráfico y comunicación institucional debe mostrarse `SIPAUTMACH.COM`.

Esta infraestructura no cambia DNS, HTTPS, contenido institucional, datos externos ni el diseño del portal por sí misma.

## Versión y arranque

La configuración de proyecto está validada para **Codex CLI 0.151.0**.

En Windows, el arranque recomendado es:

```powershell
cd C:\Dev\SIPA_UTMACH
codex --approve-for-me
```

`--approve-for-me` usa el sandbox de escritura del espacio de trabajo y enruta las solicitudes de aprobación por revisión automática. Conserva controles de sandbox y no equivale a `danger-full-access` ni a `--dangerously-bypass-approvals-and-sandbox`; esos modos no deben usarse para SIPA.

Antes de iniciar cambios, Codex debe seguir `AGENTS.md`: registrar el baseline con `git status`, actualizar referencias remotas, confirmar rama, inspeccionar el alcance y detenerse ante cambios locales ajenos.

## Estructura multiagente

La configuración se encuentra en [`.codex/config.toml`](../.codex/config.toml). Habilita cinco hilos concurrentes por sesión y registra perfiles relativos a ese archivo:

| Agente | Perfil | Responsabilidad principal |
| --- | --- | --- |
| `architect` | `.codex/agents/architect.toml` | Arquitectura, planificación, riesgos e integración final. |
| `developer` | `.codex/agents/developer.toml` | Implementación, compatibilidad y validación técnica. |
| `ui-brand` | `.codex/agents/ui-brand.toml` | UX, responsive, accesibilidad e identidad SIPA/UTMACH. |
| `qa-security` | `.codex/agents/qa-security.toml` | Calidad, dependencias, vulnerabilidades y regresiones. |
| `devops-release` | `.codex/agents/devops-release.toml` | Git, CI/CD, build, release y preparación de dominio. |

Los perfiles no fijan un modelo ni un nivel de razonamiento: heredan los de la sesión principal. Cada agente debe respetar `AGENTS.md` y compartir evidencia; `architect` coordina objetivos grandes y realiza la revisión de coherencia al final.

## Flujo autónomo

Para tareas dentro del repositorio se sigue este ciclo:

1. Inspeccionar el baseline, el código y la configuración afectada.
2. Planificar las subtareas y delegar trabajo independiente cuando aporte valor.
3. Implementar cambios acotados, sin rediseños o refactors no solicitados.
4. Validar con build, tipos, lint, pruebas y chequeos de seguridad disponibles.
5. Si algo falla, diagnosticar la causa raíz, corregir y volver a validar.
6. Revisar el diff, comprobar secretos y estado Git, documentar el resultado y crear commits coherentes cuando el objetivo lo requiera.

No se deben pedir confirmaciones para acciones rutinarias de este flujo. Los límites que sí requieren intervención humana son: gasto económico, una credencial indispensable inexistente, eliminación irreversible de datos externos, un cambio destructivo de producción, infraestructura externa sensible o una decisión institucional/material ambigua.

## Validación recomendada

Como mínimo, antes de cerrar un cambio relevante:

```powershell
git status --short --branch
git diff --check
npm.cmd run build
```

El repositorio no define scripts independientes de pruebas ni lint actualmente. Cuando una tarea los introduzca o afecte herramientas equivalentes, deben ejecutarse también. Para validar la configuración de Codex 0.151.0 sin iniciar una sesión interactiva:

```powershell
codex --strict-config doctor --summary
```

El flag `--strict-config` convierte campos no reconocidos de TOML en un error. Debe ejecutarse desde la raíz del proyecto, que ya está marcada como confiable en la instalación local de Codex.

Para vulnerabilidades, usar primero:

```powershell
npm.cmd audit --json
```

Analizar paquetes directos y transitivos, alcance de ejecución e incompatibilidades antes de cualquier actualización. No ejecutar `npm audit fix` de manera ciega.

## Git, CI/CD y liberación

- Nunca modificar `main` directamente. Crear una rama por tarea, revisar el diff, hacer commits pequeños y abrir un pull request hacia `main`.
- Subir sólo la rama de trabajo, sin force push, y no fusionar automáticamente el pull request.
- Separar evidencia de validación local, CI remoto, PR y producción: un build local exitoso no prueba despliegue ni dominio.
- `devops-release` puede diagnosticar GitHub Actions y GitHub Pages, pero no debe cambiar DNS, TLS, redirects o producción sin autorización explícita.
- Las credenciales permanecen fuera del repositorio; nunca se guardan en archivos versionados ni se imprimen.

## Windows y UTF-8

El desarrollo local usa Windows y Node.js v24.x, mientras que GitHub Actions se ejecuta en Linux. Usar `npm.cmd`/`npx.cmd` si PowerShell bloquea scripts `.ps1`. Conservar la solución existente de `scripts/build-sipa.mjs` para `npm.cmd` en Windows y evitar `shell: true` innecesario en `child_process`.

Mantener todos los archivos de texto en UTF-8. No introducir mojibake: conservar caracteres como `histórica`, `versión`, `←`, `…` y `—`.

## Troubleshooting básico

| Situación | Acción segura |
| --- | --- |
| `codex` no se reconoce en PowerShell | Verificar la instalación y el `PATH` de Codex; no copiar binarios ni modificar el repositorio para ocultar el problema. |
| TOML rechazado | Ejecutar `codex --strict-config doctor --summary`, corregir sólo los campos reportados y repetir. |
| Build falla en Windows | Ejecutar `npm.cmd run build`, conservar la ruta `npm.cmd` de `scripts/build-sipa.mjs` y comparar con la salida del CI Linux. |
| `npm audit` informa vulnerabilidades | Identificar la cadena de dependencias y el impacto; no aplicar arreglos masivos. |
| Cambios locales no relacionados | Detenerse, reportar el estado y no usar limpieza destructiva ni sobrescrituras. |
| Se necesita DNS, HTTPS o un secreto | Detenerse y solicitar la intervención o autorización específica adecuada. |
