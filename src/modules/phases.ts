import { siteData } from '../data/site';

const labelMap: Record<string, string> = {
  maintained: 'Se mantiene',
  incorporated: 'Se incorpora',
  adjusted: 'Se ajusta',
  removed: 'Se retira',
};

const colorMap: Record<string, string> = {
  maintained: 'badge--green',
  incorporated: 'badge--blue',
  adjusted: 'badge--yellow',
  removed: 'badge--red',
};

export function initPhases(): void {
  const container = document.getElementById('phases-timeline');
  if (!container) return;

  const phases = siteData.feedingPhases;

  phases.forEach((phase, index) => {
    const card = document.createElement('div');
    card.className = 'timeline__item reveal';

    const marker = document.createElement('div');
    marker.className = 'timeline__marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = String(index + 1);
    card.appendChild(marker);

    const content = document.createElement('div');
    content.className = 'timeline__content';

    const title = document.createElement('h3');
    title.className = 'timeline__title';
    title.textContent = phase.name;
    content.appendChild(title);

    const objective = document.createElement('p');
    objective.className = 'timeline__objective';
    objective.textContent = phase.objective;
    content.appendChild(objective);

    const desc = document.createElement('p');
    desc.className = 'timeline__description';
    desc.textContent = phase.description;
    content.appendChild(desc);

    // Lists
    const listTypes = ['maintained', 'incorporated', 'adjusted', 'removed'] as const;
    listTypes.forEach((listType) => {
      const items = phase[listType];
      if (items && items.length > 0) {
        const listBlock = document.createElement('div');
        listBlock.className = `timeline__list timeline__list--${listType}`;

        const listLabel = document.createElement('h4');
        listLabel.className = 'timeline__list-label';
        listLabel.textContent = labelMap[listType];
        listBlock.appendChild(listLabel);

        const badges = document.createElement('div');
        badges.className = 'timeline__badges';
        items.forEach((item) => {
          const badge = document.createElement('span');
          badge.className = `badge ${colorMap[listType]}`;
          badge.textContent = item;
          badges.appendChild(badge);
        });
        listBlock.appendChild(badges);
        content.appendChild(listBlock);
      }
    });

    if (phase.clarification) {
      const clarification = document.createElement('div');
      clarification.className = 'timeline__clarification';
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      clarification.appendChild(icon);
      const text = document.createElement('span');
      text.textContent = phase.clarification;
      clarification.appendChild(text);
      content.appendChild(clarification);
    }

    card.appendChild(content);
    container.appendChild(card);
  });
}

export function initPhaseBenefits(): void {
  const container = document.getElementById('phase-benefits');
  if (!container) return;

  siteData.phaseBenefits.forEach((benefit) => {
    const card = document.createElement('div');
    card.className = 'benefit-card';

    const icon = document.createElement('span');
    icon.className = 'benefit-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';

    const text = document.createElement('span');
    text.className = 'benefit-card__text';
    text.textContent = benefit;

    card.appendChild(icon);
    card.appendChild(text);
    container.appendChild(card);
  });
}
