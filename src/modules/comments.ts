import { siteData } from '../data/site';

export function initComments(): void {
  const container = document.getElementById('comments-container');
  if (!container) return;

  const { embedUrl, publicUrl } = siteData.comments;
  const approvedComments = siteData.approvedComments.filter((c) => c.visible).slice(0, 6);

  // Form section
  const formSection = document.createElement('div');
  formSection.className = 'comments-form';

  if (!embedUrl) {
    const msg = document.createElement('div');
    msg.className = 'comments-placeholder';
    msg.innerHTML = '';
    const icon = document.createElement('div');
    icon.className = 'comments-placeholder__icon';
    icon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    msg.appendChild(icon);
    const text = document.createElement('p');
    text.textContent = 'El formulario de comentarios estará disponible durante la expoferia.';
    msg.appendChild(text);
    formSection.appendChild(msg);
  } else {
    const introCard = document.createElement('div');
    introCard.className = 'comments-intro card';

    const introText = document.createElement('p');
    introText.textContent = 'Completa el formulario para compartir tu opinión sobre la expoferia.';
    introCard.appendChild(introText);

    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn--primary';
    openBtn.type = 'button';
    openBtn.textContent = 'Abrir formulario de comentarios';
    introCard.appendChild(openBtn);

    const iframeWrapper = document.createElement('div');
    iframeWrapper.className = 'comments-iframe-wrapper';
    iframeWrapper.hidden = true;

    const loadingEl = document.createElement('div');
    loadingEl.className = 'comments-loading';
    loadingEl.textContent = 'Cargando formulario…';
    iframeWrapper.appendChild(loadingEl);

    openBtn.addEventListener('click', () => {
      openBtn.hidden = true;
      iframeWrapper.hidden = false;

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.className = 'comments-iframe';
      iframe.title = 'Formulario de comentarios — Google Forms';
      iframe.setAttribute('loading', 'lazy');

      iframe.addEventListener('load', () => {
        loadingEl.hidden = true;
      });
      iframe.addEventListener('error', () => {
        loadingEl.textContent = 'No se pudo cargar el formulario. Intenta abrirlo en una pestaña nueva.';
      });

      iframeWrapper.appendChild(iframe);
    });

    const externalLink = document.createElement('a');
    externalLink.href = publicUrl || embedUrl;
    externalLink.target = '_blank';
    externalLink.rel = 'noopener noreferrer';
    externalLink.className = 'comments-external-link';
    externalLink.textContent = 'Abrir en una pestaña nueva';
    externalLink.innerHTML += ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

    introCard.appendChild(iframeWrapper);
    introCard.appendChild(externalLink);
    formSection.appendChild(introCard);
  }

  container.appendChild(formSection);

  // Approved comments
  if (approvedComments.length > 0) {
    const commentsSection = document.createElement('div');
    commentsSection.className = 'approved-comments';

    const commentsTitle = document.createElement('h3');
    commentsTitle.className = 'approved-comments__title';
    commentsTitle.textContent = 'Lo que dicen los visitantes';
    commentsSection.appendChild(commentsTitle);

    const commentsList = document.createElement('div');
    commentsList.className = 'approved-comments__grid';

    approvedComments.forEach((comment) => {
      const card = document.createElement('div');
      card.className = 'comment-card card';

      const header = document.createElement('div');
      header.className = 'comment-card__header';

      const name = document.createElement('strong');
      name.className = 'comment-card__name';
      name.textContent = comment.name || 'Visitante anónimo';
      header.appendChild(name);

      if (comment.institution) {
        const inst = document.createElement('span');
        inst.className = 'comment-card__institution';
        inst.textContent = comment.institution;
        header.appendChild(inst);
      }

      card.appendChild(header);

      // Star rating
      const rating = document.createElement('div');
      rating.className = 'comment-card__rating';
      rating.setAttribute('aria-label', `Calificación: ${comment.rating} de 5`);
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = i <= comment.rating ? 'star star--filled' : 'star';
        star.textContent = '★';
        star.setAttribute('aria-hidden', 'true');
        rating.appendChild(star);
      }
      card.appendChild(rating);

      const msg = document.createElement('p');
      msg.className = 'comment-card__message';
      msg.textContent = comment.message;
      card.appendChild(msg);

      const date = document.createElement('time');
      date.className = 'comment-card__date';
      date.textContent = comment.date;
      card.appendChild(date);

      commentsList.appendChild(card);
    });

    commentsSection.appendChild(commentsList);

    const note = document.createElement('p');
    note.className = 'approved-comments__note';
    note.textContent = 'Los comentarios visibles han sido revisados previamente por el equipo expositor.';
    commentsSection.appendChild(note);

    container.appendChild(commentsSection);
  }
}
