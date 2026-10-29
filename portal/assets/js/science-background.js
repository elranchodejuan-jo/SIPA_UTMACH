(() => {
  'use strict';

  const background = document.querySelector('[data-science-background]');
  const toggle = document.querySelector('[data-science-toggle]');
  if (!background || !toggle) return;
  const lightMotion = window.matchMedia('(max-width: 47.999rem), (hover: none), (pointer: coarse)');

  // Implementación original con proyección 3D en Canvas 2D: no necesita WebGL ni CDN.
  const createNetwork = () => {
    const canvas = background.querySelector('[data-science-network]');
    let context;
    try { context = canvas?.getContext('2d'); } catch { return null; }
    if (!context) return null;
    let width = 1;
    let height = 1;
    let points = [];
    let edges = [];
    let colors = [];
    let edgeColor = '';
    const phi = (1 + Math.sqrt(5)) / 2;
    const core = [];
    for (const a of [-1, 1]) for (const b of [-phi, phi]) {
      core.push([0, a, b], [a, b, 0], [b, 0, a]);
    }
    const coreEdges = [];
    for (let i = 0; i < core.length; i++) for (let j = i + 1; j < core.length; j++) {
      if (Math.hypot(...core[i].map((value, axis) => value - core[j][axis])) < 2.01) coreEdges.push([i, j]);
    }

    const palette = () => {
      const style = getComputedStyle(background);
      edgeColor = style.color;
      colors = ['--color-brand-600', '--color-science-600', '--color-brand-400'].map(name => style.getPropertyValue(name).trim());
    };

    const resize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, lightMotion.matches ? 1 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = lightMotion.matches ? 32 : width < 1100 ? 56 : 78;
      points = Array.from({ length: count }, (_, i) => {
        const y = 1 - 2 * (i + 0.5) / count;
        const ring = Math.sqrt(1 - y * y);
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        const spread = 1 + 0.13 * Math.sin(i * 7.3);
        return [Math.cos(angle) * ring * spread, y * 0.92, Math.sin(angle) * ring * spread];
      });
      edges = [];
      // Vecindad calculada sólo al cambiar tamaño, nunca en cada frame.
      const reach = count < 40 ? 0.85 : 0.61;
      for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
        if (Math.hypot(...points[i].map((value, axis) => value - points[j][axis])) < reach) edges.push([i, j]);
      }
    };

    const draw = (time, pointer) => {
      context.clearRect(0, 0, width, height);
      const radius = Math.min(width * 0.51, height * 0.64);
      const centerX = width * (width < 768 ? 0.76 : 0.62);
      const centerY = height * 0.49;
      const yaw = 0.35 + time * 0.075 + pointer.x * 0.012;
      const pitch = 0.16 + Math.sin(time * 0.14) * 0.12 + pointer.y * 0.009;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
      const project = (point, size = 1) => {
        const xx = point[0] * cy - point[2] * sy;
        const zz = point[0] * sy + point[2] * cy;
        const yy = point[1] * cx - zz * sx;
        const depth = point[1] * sx + zz * cx;
        const perspective = 3.8 / (3.8 - depth * size);
        return { x: centerX + xx * radius * size * perspective, y: centerY + yy * radius * size * perspective, depth };
      };
      const projected = points.map(point => project(point));
      context.strokeStyle = edgeColor;
      context.lineWidth = 0.8;
      for (const [a, b] of edges) {
        const from = projected[a], to = projected[b];
        context.globalAlpha = 0.16 + ((from.depth + to.depth + 2) / 4) * 0.2;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }

      // Núcleo geométrico dentro de la nube de conexiones.
      const inner = core.map(point => project(point, 0.15));
      context.globalAlpha = 0.21;
      context.lineWidth = 1;
      context.beginPath();
      for (const [a, b] of coreEdges) {
        context.moveTo(inner[a].x, inner[a].y);
        context.lineTo(inner[b].x, inner[b].y);
      }
      context.stroke();

      projected.forEach((point, i) => {
        const depth = (point.depth + 1.2) / 2.4;
        const size = 1.3 + depth * 1.5;
        context.fillStyle = colors[i % colors.length];
        context.globalAlpha = 0.07 + depth * 0.09;
        context.beginPath();
        context.arc(point.x, point.y, size * 3.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 0.48 + depth * 0.4;
        context.beginPath();
        context.arc(point.x, point.y, size, 0, Math.PI * 2);
        context.fill();
      });

      // Partículas libres dan continuidad al fondo fuera del núcleo.
      const dustCount = lightMotion.matches ? 8 : 20;
      const dust = Array.from({ length: dustCount }, (_, i) => ({
        x: ((i * 0.618034 + 0.08) % 1) * width + Math.sin(time * 0.14 + i) * 16,
        y: ((i * 0.381966 + 0.16) % 1) * height + Math.cos(time * 0.11 + i * 2) * 18,
      }));
      context.fillStyle = colors[0];
      dust.forEach(point => {
        context.globalAlpha = 0.32;
        context.fillRect(point.x, point.y, 2.3, 2.3);
      });

      if (pointer.active) {
        const nearby = [...projected, ...dust].map(point => ({ ...point, distance: Math.hypot(point.x - pointer.px, point.y - pointer.py) }))
          .filter(point => point.distance < 190).sort((a, b) => a.distance - b.distance).slice(0, 7);
        context.strokeStyle = colors[0];
        context.lineWidth = 0.9;
        for (const point of nearby) {
          context.globalAlpha = (1 - point.distance / 190) * 0.36;
          context.beginPath();
          context.moveTo(pointer.px, pointer.py);
          context.lineTo(point.x, point.y);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
      if (background.dataset.renderer !== 'canvas') background.dataset.renderer = 'canvas';
    };

    palette();
    resize();
    return { draw, resize, palette };
  };
  const network = createNetwork();

  const label = toggle.querySelector('[data-science-label]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 48rem)');
  const storageKey = 'sipa-science-motion';
  let paused = false;
  let listening = false;
  let running = false;
  let suspended = false;
  let frame = 0;
  let previousTime = 0;
  let lastPaint = 0;
  let elapsed = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight * 0.4;
  let targetPointerX = pointerX;
  let targetPointerY = pointerY;

  const readPreference = () => {
    try { return window.localStorage.getItem(storageKey) === 'paused'; }
    catch { return false; }
  };

  const drawNetwork = () => network?.draw(elapsed, { x, y, px: pointerX, py: pointerY, active: background.dataset.pointerActive === 'true' });

  const resetPointer = () => {
    x = y = targetX = targetY = 0;
    pointerX = targetPointerX = window.innerWidth / 2;
    pointerY = targetPointerY = window.innerHeight * 0.4;
    background.dataset.pointerActive = 'false';
    for (const property of ['--science-x', '--science-y', '--science-pointer-x', '--science-pointer-y']) {
      background.style.removeProperty(property);
    }
  };

  const renderFrame = time => {
    if (!running) return;
    frame = window.requestAnimationFrame(renderFrame);
    // Móvil: hasta 20 dibujos por segundo; escritorio: hasta 30. Sin trabajo en pestañas ocultas.
    if (lastPaint && time - lastPaint < 1000 / (lightMotion.matches ? 20 : 30)) return;
    lastPaint = time;
    const delta = previousTime ? Math.min(time - previousTime, 80) : 33;
    previousTime = time;
    elapsed += delta / 1000;
    const ease = 1 - Math.exp(-delta / 85);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    pointerX += (targetPointerX - pointerX) * ease;
    pointerY += (targetPointerY - pointerY) * ease;
    const settled = Math.max(Math.abs(targetX - x), Math.abs(targetY - y), Math.abs(targetPointerX - pointerX), Math.abs(targetPointerY - pointerY)) < 0.1;
    if (settled) {
      x = targetX;
      y = targetY;
      pointerX = targetPointerX;
      pointerY = targetPointerY;
    }
    for (const [name, value] of [['--science-x', x], ['--science-y', y], ['--science-pointer-x', pointerX], ['--science-pointer-y', pointerY]]) {
      const next = `${value.toFixed(2)}px`;
      if (background.style.getPropertyValue(name) !== next) background.style.setProperty(name, next);
    }
    drawNetwork();
    if (!network && settled) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = lastPaint = 0;
    }
  };

  const onPointerMove = event => {
    if (event.pointerType !== 'mouse' || document.hidden) return;
    targetPointerX = event.clientX;
    targetPointerY = event.clientY;
    targetX = ((event.clientX / window.innerWidth) - 0.5) * 44;
    targetY = ((event.clientY / window.innerHeight) - 0.5) * 32;
    background.dataset.pointerActive = 'true';
    if (running && !frame) frame = window.requestAnimationFrame(renderFrame);
  };

  const synchronize = () => {
    const eligible = !reducedMotion.matches;
    const enabled = eligible && !paused && !document.hidden && !suspended;
    const trackPointer = enabled && finePointer.matches;
    toggle.hidden = !eligible;
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.setAttribute('aria-label', paused ? 'Activar fondo interactivo' : 'Pausar fondo interactivo');
    if (label) label.textContent = paused ? 'Activar fondo' : 'Pausar fondo';
    background.dataset.interactive = String(enabled);
    running = enabled;
    if (trackPointer !== listening) {
      if (trackPointer) window.addEventListener('pointermove', onPointerMove, { passive: true });
      else window.removeEventListener('pointermove', onPointerMove);
      listening = trackPointer;
    }
    if (!trackPointer) resetPointer();
    if (enabled && !frame) frame = window.requestAnimationFrame(renderFrame);
    if (!enabled) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = lastPaint = 0;
      resetPointer();
      if (!document.hidden) drawNetwork();
    }
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { window.localStorage.setItem(storageKey, paused ? 'paused' : 'enabled'); }
    catch { /* El control funciona también sin almacenamiento. */ }
    synchronize();
  });
  reducedMotion.addEventListener('change', synchronize);
  finePointer.addEventListener('change', synchronize);
  lightMotion.addEventListener('change', () => { network?.resize(); synchronize(); drawNetwork(); });
  document.addEventListener('visibilitychange', synchronize);
  document.documentElement.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', () => { suspended = true; synchronize(); });
  window.addEventListener('focus', () => { suspended = false; synchronize(); });
  window.addEventListener('resize', () => { resetPointer(); network?.resize(); drawNetwork(); }, { passive: true });
  window.addEventListener('keydown', event => { if (event.key === 'Tab') resetPointer(); });
  window.addEventListener('pagehide', () => { suspended = true; synchronize(); });
  window.addEventListener('pageshow', () => { suspended = false; paused = readPreference(); synchronize(); });
  new MutationObserver(() => { network?.palette(); drawNetwork(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      paused = readPreference();
      synchronize();
    }
  });
  paused = readPreference();
  drawNetwork();
  synchronize();
})();
