export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const serviceWorkerUrl = new URL('./sw.js', document.baseURI);
      navigator.serviceWorker.register(serviceWorkerUrl).catch((err) => {
        console.warn('Error al registrar SW:', err);
      });
    });
  }
}
