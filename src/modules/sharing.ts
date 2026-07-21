export function initSharing(): void {
  const shareData = {
    title: 'Nutrición Animal Responsable',
    text: 'Conoce nuestro proyecto de elaboración de alimentos balanceados para pollos de engorde.',
    url: window.location.href,
  };

  const showToast = (message: string): void => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.hidden = false;
    toast.classList.add('toast--visible');

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 3000);
  };

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Enlace copiado');
      } catch {
        // Clipboard not available
        showToast('No se pudo copiar el enlace');
      }
    }
  };

  // Header share button
  const shareHeaderBtn = document.getElementById('btn-share-header');
  shareHeaderBtn?.addEventListener('click', handleShare);

  // Footer share button
  const shareFooterBtn = document.getElementById('btn-share-footer');
  shareFooterBtn?.addEventListener('click', handleShare);
}
