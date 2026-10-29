import { renderIcon } from './icons.mjs';

// Red decorativa original: no representa resultados del semillero.
export function renderScienceBackground() {
  return `<div class="bg-ambient science-background" data-science-background aria-hidden="true">
    <div class="science-background__wash"></div>
    <svg class="science-network-fallback" viewBox="0 0 1000 800" fill="none" stroke="currentColor" stroke-width="1" focusable="false">
      <path d="m410 110 150-45 170 85 140 170-20 210-130 150-180 50-160-80-110-180 25-200Zm0 0 100 170 50-215 80 270 90-185-90 185 230-15-180 180 160 30-160-30 30 180-170-120-10 170-30-450-130 370 310-150-395-30 345-135-320-65 165 230 150-165 50 165-180-220"/>
      <g fill="currentColor" stroke="none"><circle cx="410" cy="110" r="3"/><circle cx="560" cy="65" r="3"/><circle cx="730" cy="150" r="3"/><circle cx="870" cy="320" r="3"/><circle cx="850" cy="530" r="3"/><circle cx="720" cy="680" r="3"/><circle cx="540" cy="730" r="3"/><circle cx="380" cy="650" r="3"/><circle cx="270" cy="470" r="3"/><circle cx="295" cy="270" r="3"/><circle cx="510" cy="280" r="3"/><circle cx="640" cy="335" r="3"/><circle cx="690" cy="500" r="3"/><circle cx="550" cy="560" r="3"/></g>
    </svg>
    <canvas class="science-network" data-science-network></canvas>
    <div class="science-background__halo"></div>
  </div>`;
}

export function renderScienceToggle(helpers) {
  return `<button type="button" class="science-toggle" data-science-toggle aria-label="Pausar fondo interactivo" aria-pressed="true" hidden>${renderIcon('sparkles', helpers)}<span data-science-label>Pausar fondo</span></button>`;
}
