import { renderIcon } from './icons.mjs';

// Ilustraciones decorativas originales: no representan resultados del semillero.
export function renderScienceBackground() {
  return `<div class="bg-ambient science-background" data-science-background aria-hidden="true">
    <div class="science-background__wash"></div>
    <div class="science-background__grid"></div>
    <div class="science-background__halo"></div>
    <div class="science-background__layer science-background__layer--back">
      <div class="science-formula science-formula--genetics"><span>GENÉTICA</span>p² + 2pq + q² = 1</div>
      <div class="science-formula science-formula--heritability"><span>VARIACIÓN GENÉTICA</span>h² = V<sub>A</sub> / V<sub>P</sub></div>
      <div class="science-formula science-formula--growth"><span>CRECIMIENTO</span>GMD = Δpeso / Δtiempo</div>
      <svg class="science-molecule" viewBox="0 0 180 150" fill="none" stroke="currentColor" stroke-width="1.2" focusable="false">
        <path d="m55 40 35-20 35 20v40l-35 20-35-20Zm70 40 30 18M55 40 25 23M55 80l-30 18M90 100v30M64 46l26-15 26 15M64 75l26 15"/>
        <g fill="currentColor" stroke="none"><circle cx="25" cy="23" r="4"/><circle cx="155" cy="98" r="4"/><circle cx="25" cy="98" r="4"/><circle cx="90" cy="130" r="4"/></g>
      </svg>
    </div>
    <div class="science-background__layer science-background__layer--front">
      <svg class="science-dna" viewBox="0 0 140 400" fill="none" stroke="currentColor" stroke-linecap="round" focusable="false">
        <path class="science-dna__strand" d="M30 14C30 76 110 76 110 138S30 200 30 262s80 62 80 124M110 14C110 76 30 76 30 138s80 62 80 124-80 62-80 124"/>
        <g class="science-dna__rungs"><path d="M32 30h76M40 50h60M60 70h20M52 90h36M36 110h68M30 130h80M32 150h76M42 170h56M64 190h12M50 210h40M35 230h70M30 250h80M34 270h72M44 290h52M64 310h12M48 330h44M34 350h72M30 370h80"/></g>
        <g class="science-dna__bases" fill="currentColor" stroke="none"><text x="118" y="34">A</text><text x="12" y="114">T</text><text x="118" y="234">G</text><text x="12" y="354">C</text></g>
      </svg>
      <svg class="science-chart" viewBox="0 0 330 220" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" focusable="false">
        <g class="science-chart__grid"><path d="M55 30v155M100 30v155M145 30v155M190 30v155M235 30v155M280 30v155M40 55h255M40 95h255M40 135h255"/></g>
        <path class="science-chart__axes" d="M40 22v163h265M34 31l6-9 6 9M296 179l9 6-9 6"/>
        <path class="science-chart__curve" d="M54 164C88 164 111 150 135 129S178 98 204 79s52-31 82-42m-16 1 16-1-4 15"/>
        <path class="science-chart__guide" d="M135 129v56M40 129h95M204 79v106M40 79h164"/>
        <g class="science-chart__points" fill="currentColor" stroke="none"><circle cx="54" cy="164" r="3"/><circle cx="135" cy="129" r="4"/><circle cx="204" cy="79" r="4"/></g>
        <g class="science-chart__labels" fill="currentColor" stroke="none"><text x="15" y="25">y</text><text x="309" y="203">x</text><text x="18" y="201">0</text><text x="124" y="212">CRECIMIENTO</text></g>
      </svg>
    </div>
  </div>`;
}

export function renderScienceToggle(helpers) {
  return `<button type="button" class="science-toggle" data-science-toggle aria-label="Pausar fondo interactivo" aria-pressed="true" hidden>${renderIcon('sparkles', helpers)}<span data-science-label>Pausar fondo</span></button>`;
}
