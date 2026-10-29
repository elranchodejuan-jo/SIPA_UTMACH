(() => {
  'use strict';

  const background = document.querySelector('[data-science-background]');
  const toggle = document.querySelector('[data-science-toggle]');
  if (!background || !toggle) return;

  const label = toggle.querySelector('[data-science-label]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 48rem)');
  const storageKey = 'sipa-science-motion';
  let paused = false;
  let listening = false;
  let frame = 0;
  let previousTime = 0;
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

  const reset = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    x = y = targetX = targetY = 0;
    pointerX = targetPointerX = window.innerWidth / 2;
    pointerY = targetPointerY = window.innerHeight * 0.4;
    background.dataset.pointerActive = 'false';
    for (const property of ['--science-x', '--science-y', '--science-pointer-x', '--science-pointer-y']) {
      background.style.removeProperty(property);
    }
  };

  const renderFrame = time => {
    // Amortiguación independiente de la frecuencia de la pantalla.
    const delta = previousTime ? Math.min(time - previousTime, 48) : 16;
    previousTime = time;
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
    background.style.setProperty('--science-x', `${x.toFixed(2)}px`);
    background.style.setProperty('--science-y', `${y.toFixed(2)}px`);
    background.style.setProperty('--science-pointer-x', `${pointerX.toFixed(2)}px`);
    background.style.setProperty('--science-pointer-y', `${pointerY.toFixed(2)}px`);
    // Ningún bucle permanente: al asentarse el puntero dejamos de solicitar frames.
    frame = settled ? 0 : window.requestAnimationFrame(renderFrame);
    if (settled) previousTime = 0;
  };

  const onPointerMove = event => {
    if (event.pointerType !== 'mouse' || document.hidden) return;
    targetPointerX = event.clientX;
    targetPointerY = event.clientY;
    targetX = ((event.clientX / window.innerWidth) - 0.5) * 44;
    targetY = ((event.clientY / window.innerHeight) - 0.5) * 32;
    background.dataset.pointerActive = 'true';
    if (!frame) frame = window.requestAnimationFrame(renderFrame);
  };

  const synchronize = () => {
    const eligible = finePointer.matches && !reducedMotion.matches;
    const enabled = eligible && !paused && !document.hidden;
    toggle.hidden = !eligible;
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.setAttribute('aria-label', paused ? 'Activar fondo interactivo' : 'Pausar fondo interactivo');
    if (label) label.textContent = paused ? 'Activar fondo' : 'Pausar fondo';
    background.dataset.interactive = String(enabled);
    if (enabled !== listening) {
      if (enabled) window.addEventListener('pointermove', onPointerMove, { passive: true });
      else window.removeEventListener('pointermove', onPointerMove);
      listening = enabled;
    }
    if (!enabled) reset();
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { window.localStorage.setItem(storageKey, paused ? 'paused' : 'enabled'); }
    catch { /* El control funciona también sin almacenamiento. */ }
    synchronize();
  });
  reducedMotion.addEventListener('change', synchronize);
  finePointer.addEventListener('change', synchronize);
  document.addEventListener('visibilitychange', synchronize);
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('keydown', event => { if (event.key === 'Tab') reset(); });
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', () => { paused = readPreference(); synchronize(); });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      paused = readPreference();
      synchronize();
    }
  });
  paused = readPreference();
  synchronize();
})();
