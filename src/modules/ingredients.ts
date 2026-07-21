import { siteData } from '../data/site';

function createIconSVG(iconName: string): string {
  const icons: Record<string, string> = {
    grain: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="10"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
    corn: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="12" rx="5" ry="9"/><path d="M9 5c0 3 6 3 6 0"/><path d="M9 9c0 3 6 3 6 0"/><path d="M9 13c0 3 6 3 6 0"/></svg>',
    fiber: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="3"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="16" x2="18" y2="16"/></svg>',
    amino: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><circle cx="8" cy="16" r="3"/><circle cx="16" cy="16" r="3"/><line x1="10" y1="11" x2="8" y2="13"/><line x1="14" y1="11" x2="16" y2="13"/></svg>',
    oil: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z"/></svg>',
    fat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z"/><path d="M9 15a3 3 0 0 0 6 0" opacity="0.5"/></svg>',
    vitamin: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="2" width="8" height="20" rx="4"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>',
    molecule: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><line x1="10" y1="10" x2="7" y2="7"/><line x1="14" y1="10" x2="17" y2="7"/><line x1="10" y1="14" x2="7" y2="17"/><line x1="14" y1="14" x2="17" y2="17"/></svg>',
    salt: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="10" cy="16" r="0.8" fill="currentColor"/><circle cx="14" cy="17" r="0.8" fill="currentColor"/></svg>',
    calcium: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 4h8l2 4-2 4h-2l-2 4-2-4H8l-2-4z"/><text x="12" y="20" text-anchor="middle" font-size="6" fill="currentColor" stroke="none">Ca</text></svg>',
    phosphorus: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="10" r="6"/><text x="12" y="13" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">P</text><line x1="12" y1="16" x2="12" y2="22"/></svg>',
    balance: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><line x1="12" y1="3" x2="12" y2="21"/><line x1="4" y1="8" x2="20" y2="8"/><path d="M4 8l2 6h4l2-6"/><path d="M14 8l2 6h4l-2-6"/></svg>',
    shield: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2l8 4v6c0 5.5-3.5 8.5-8 10-4.5-1.5-8-4.5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    leaf: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M17 3c-4 0-8 2-10 6s-2 10 2 12c2-4 4-6 8-8s6-6 6-10c-2 0-4 0-6 0z"/><path d="M6 21c2-4 5-7 9-9"/></svg>',
    enzyme: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2a6 6 0 0 1 6 6c0 3-2 5-3 7s-1 4-1 7h-4c0-3 0-5-1-7s-3-4-3-7a6 6 0 0 1 6-6z"/><line x1="10" y1="22" x2="14" y2="22"/></svg>',
  };
  return icons[iconName] || `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`;
}

export function initIngredients(): void {
  const panelMacro = document.getElementById('panel-macro');
  const panelMicro = document.getElementById('panel-micro');
  const tabs = document.querySelectorAll<HTMLButtonElement>('.ingredient-tab');

  if (!panelMacro || !panelMicro) return;

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const type = tab.getAttribute('data-type');
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (type === 'macro') {
        panelMacro.classList.add('active');
        panelMacro.removeAttribute('hidden');
        panelMicro.classList.remove('active');
        panelMicro.setAttribute('hidden', '');
      } else {
        panelMicro.classList.add('active');
        panelMicro.removeAttribute('hidden');
        panelMacro.classList.remove('active');
        panelMacro.setAttribute('hidden', '');
      }
    });

    tab.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentIndex = Array.from(tabs).indexOf(tab);
        const nextIndex = e.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length : (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      }
    });
  });

  // Render ingredients
  const macroIngredients = siteData.ingredients.filter((i) => i.type === 'macro');
  const microIngredients = siteData.ingredients.filter((i) => i.type === 'micro');

  renderIngredientList(panelMacro, macroIngredients);
  renderIngredientList(panelMicro, microIngredients);
}

function renderIngredientList(container: HTMLElement, ingredients: typeof siteData.ingredients): void {
  const grid = document.createElement('div');
  grid.className = 'ingredient-grid';

  ingredients.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'ingredient-card reveal';

    const buttonId = `ingredient-btn-${item.id}`;
    const panelId = `ingredient-detail-${item.id}`;

    // Header button (accordion trigger)
    const btn = document.createElement('button');
    btn.className = 'ingredient-card__header';
    btn.id = buttonId;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.type = 'button';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'ingredient-card__icon';
    iconSpan.innerHTML = createIconSVG(item.icon);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'ingredient-card__name';
    nameSpan.textContent = item.name;

    const categorySpan = document.createElement('span');
    categorySpan.className = 'ingredient-card__category badge';
    categorySpan.textContent = item.category;

    const chevron = document.createElement('span');
    chevron.className = 'ingredient-card__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

    btn.appendChild(iconSpan);
    const textWrapper = document.createElement('div');
    textWrapper.className = 'ingredient-card__text';
    textWrapper.appendChild(nameSpan);
    textWrapper.appendChild(categorySpan);
    btn.appendChild(textWrapper);
    btn.appendChild(chevron);

    // Detail panel
    const panel = document.createElement('div');
    panel.className = 'ingredient-card__detail';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;

    const desc = document.createElement('p');
    desc.className = 'ingredient-card__description';
    desc.textContent = item.description;
    panel.appendChild(desc);

    // Phases badges
    const phasesDiv = document.createElement('div');
    phasesDiv.className = 'ingredient-card__phases';
    const phasesLabel = document.createElement('span');
    phasesLabel.className = 'ingredient-card__phases-label';
    phasesLabel.textContent = 'Etapas: ';
    phasesDiv.appendChild(phasesLabel);
    item.phases.forEach((phase) => {
      const badge = document.createElement('span');
      badge.className = 'badge badge--phase';
      badge.textContent = phase;
      phasesDiv.appendChild(badge);
    });
    panel.appendChild(phasesDiv);

    if (item.note) {
      const note = document.createElement('p');
      note.className = 'ingredient-card__note';
      note.textContent = item.note;
      panel.appendChild(note);
    }

    // Accordion toggle
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        card.classList.remove('ingredient-card--open');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        card.classList.add('ingredient-card--open');
      }
    });

    btn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });

    card.appendChild(btn);
    card.appendChild(panel);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}
