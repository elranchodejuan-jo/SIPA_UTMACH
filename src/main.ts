// ═══════════════════════════════════════════════════════════
// Expoferia de Nutrición Animal 2026 — Main Entry Point
// Universidad Técnica de Machala
// ═══════════════════════════════════════════════════════════

import './styles/reset.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/animations.css';
import './styles/responsive.css';

import { siteData } from './data/site';
import { initNavigation } from './modules/navigation';
import { initIngredients } from './modules/ingredients';
import { initPhases, initPhaseBenefits } from './modules/phases';
import { initGallery } from './modules/gallery';
import { initLightbox } from './modules/lightbox';
import { initComments } from './modules/comments';
import { initSharing } from './modules/sharing';
import { initReveal } from './modules/reveal';
import { registerServiceWorker } from './modules/serviceWorker';
import { initTheme } from './modules/theme';

initTheme();

// ─── Render dynamic content ────────────────────────────────

function renderProcessSteps(): void {
  const container = document.getElementById('process-steps');
  if (!container) return;

  const stepsGrid = document.createElement('div');
  stepsGrid.className = 'process-grid';

  siteData.processSteps.forEach((step, index) => {
    const card = document.createElement('div');
    card.className = 'process-card';

    const number = document.createElement('div');
    number.className = 'process-card__number';
    number.textContent = String(step.number);
    number.setAttribute('aria-hidden', 'true');

    const icon = document.createElement('div');
    icon.className = 'process-card__icon';
    icon.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true"><path d="${step.icon}"/></svg>`;

    const content = document.createElement('div');
    content.className = 'process-card__content';

    const title = document.createElement('h3');
    title.className = 'process-card__title';
    title.textContent = step.title;

    const desc = document.createElement('p');
    desc.className = 'process-card__desc';
    desc.textContent = step.description;

    content.appendChild(title);
    content.appendChild(desc);

    card.appendChild(number);
    card.appendChild(icon);
    card.appendChild(content);

    // Connector arrow (except last)
    if (index < siteData.processSteps.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'process-card__connector';
      connector.setAttribute('aria-hidden', 'true');
      connector.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
      card.appendChild(connector);
    }

    stepsGrid.appendChild(card);
  });

  container.appendChild(stepsGrid);
}

function renderTreatments(): void {
  const comparison = document.getElementById('treatments-comparison');
  const shared = document.getElementById('treatments-shared');
  const evaluation = document.getElementById('treatments-evaluation');

  if (comparison) {
    const grid = document.createElement('div');
    grid.className = 'treatments-grid';

    siteData.treatments.forEach((treatment) => {
      const card = document.createElement('div');
      card.className = `card treatment-card treatment-card--${treatment.id}`;

      const title = document.createElement('h3');
      title.className = 'treatment-card__title';
      title.textContent = treatment.name;
      card.appendChild(title);

      const label = document.createElement('p');
      label.className = 'treatment-card__label';
      label.textContent = 'Fuente energética:';
      card.appendChild(label);

      const source = document.createElement('p');
      source.className = 'treatment-card__source';
      source.textContent = treatment.energySource;
      card.appendChild(source);

      const desc = document.createElement('p');
      desc.className = 'treatment-card__desc';
      desc.textContent = treatment.description;
      card.appendChild(desc);

      grid.appendChild(card);
    });

    comparison.appendChild(grid);
  }

  if (shared) {
    const sharedCard = document.createElement('div');
    sharedCard.className = 'card treatments-shared-card';

    const sharedTitle = document.createElement('h3');
    sharedTitle.textContent = 'Ingredientes compartidos';
    sharedCard.appendChild(sharedTitle);

    const sharedDesc = document.createElement('p');
    sharedDesc.textContent = 'Ambos tratamientos comparten la misma base nutricional. La diferencia principal es la fuente energética utilizada.';
    sharedCard.appendChild(sharedDesc);

    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'treatments-shared__badges';
    siteData.sharedIngredients.forEach((ingredient) => {
      const badge = document.createElement('span');
      badge.className = 'badge badge--green';
      badge.textContent = ingredient;
      badgesDiv.appendChild(badge);
    });
    sharedCard.appendChild(badgesDiv);

    shared.appendChild(sharedCard);
  }

  if (evaluation) {
    const evalCard = document.createElement('div');
    evalCard.className = 'card treatments-eval-card';

    const evalTitle = document.createElement('h3');
    evalTitle.textContent = 'Parámetros de evaluación';
    evalCard.appendChild(evalTitle);

    const evalGrid = document.createElement('div');
    evalGrid.className = 'eval-grid';

    siteData.evaluationParameters.forEach((param) => {
      const item = document.createElement('div');
      item.className = 'eval-item';

      const name = document.createElement('strong');
      name.textContent = param.name;
      item.appendChild(name);

      const desc = document.createElement('p');
      desc.textContent = param.description;
      item.appendChild(desc);

      evalGrid.appendChild(item);
    });

    evalCard.appendChild(evalGrid);
    evaluation.appendChild(evalCard);
  }
}

function renderResponsiblePractices(): void {
  const container = document.getElementById('responsible-grid');
  if (!container) return;

  const responsibleIcons: Record<string, string> = {
    'no-antibiotic': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4" y1="4" x2="20" y2="20"/><rect x="9" y="6" width="6" height="12" rx="3"/></svg>',
    'no-hormone': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4" y1="4" x2="20" y2="20"/><path d="M8 12h8M12 8v8"/></svg>',
    'calendar': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    'recycle': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 19H4.815a2 2 0 0 1-1.732-3l3.495-6.043"/><path d="M11 19h6.038a2 2 0 0 0 1.732-3L14.57 8.5"/><path d="M12 5L8.5 11h7L12 5z"/></svg>',
  };

  siteData.responsiblePractices.forEach((practice) => {
    const card = document.createElement('div');
    card.className = 'responsible-card card reveal';

    const icon = document.createElement('div');
    icon.className = 'responsible-card__icon';
    icon.innerHTML = responsibleIcons[practice.icon] || '';

    const title = document.createElement('h3');
    title.className = 'responsible-card__title';
    title.textContent = practice.title;

    const desc = document.createElement('p');
    desc.className = 'responsible-card__desc';
    desc.textContent = practice.description;

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    container.appendChild(card);
  });
}

function renderTeam(): void {
  const container = document.getElementById('team-container');
  if (!container) return;

  const teacher = siteData.teacher;
  const members = siteData.team.filter((m) => m.visible);
  const hasContent = teacher.visible || members.length > 0;

  if (!hasContent) {
    const msg = document.createElement('div');
    msg.className = 'team-placeholder';
    const text = document.createElement('p');
    text.textContent = 'Próximamente conocerás a nuestro equipo expositor.';
    msg.appendChild(text);
    container.appendChild(msg);
    return;
  }

  if (teacher.visible) {
    const card = document.createElement('div');
    card.className = 'team-card team-card--teacher card';

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'team-card__image-wrapper';
    const img = document.createElement('img');
    img.src = teacher.image;
    img.alt = teacher.name ? `Fotografía de ${teacher.name}` : 'Fotografía del docente';
    img.width = 400;
    img.height = 400;
    img.className = 'team-card__image';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    const info = document.createElement('div');
    info.className = 'team-card__info';

    // Academic icon
    const iconLabel = document.createElement('div');
    iconLabel.className = 'team-card__academic-icon';
    iconLabel.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 10l-10-6L2 10l10 6 10-6z"/><path d="M6 12v5c0 2 3 4 6 4s6-2 6-4v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg> Docente';
    info.appendChild(iconLabel);

    const name = document.createElement('h3');
    name.className = 'team-card__name';
    name.textContent = teacher.name;
    info.appendChild(name);

    if (teacher.professionalTitle) {
      const title = document.createElement('p');
      title.className = 'team-card__professional-title';
      title.textContent = teacher.professionalTitle;
      info.appendChild(title);
    }

    const role = document.createElement('p');
    role.className = 'team-card__role badge badge--blue';
    role.textContent = teacher.role;
    info.appendChild(role);

    // Subjects
    if (teacher.subjects && teacher.subjects.length > 0) {
      const subjectsWrap = document.createElement('div');
      subjectsWrap.className = 'team-card__subjects';
      const subLabel = document.createElement('span');
      subLabel.className = 'team-card__subjects-label';
      subLabel.textContent = 'Asignaturas:';
      subjectsWrap.appendChild(subLabel);
      teacher.subjects.forEach((sub) => {
        const badge = document.createElement('span');
        badge.className = 'badge badge--green';
        badge.textContent = sub;
        subjectsWrap.appendChild(badge);
      });
      info.appendChild(subjectsWrap);
    }

    // Collapsible biography
    if (teacher.biography) {
      const bioWrapper = document.createElement('div');
      bioWrapper.className = 'teacher-bio';

      const bioToggle = document.createElement('button');
      bioToggle.className = 'teacher-bio__toggle';
      bioToggle.type = 'button';
      bioToggle.setAttribute('aria-expanded', 'false');
      bioToggle.innerHTML = '<svg class="teacher-bio__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg> Biografía del docente';

      const bioContent = document.createElement('div');
      bioContent.className = 'teacher-bio__content';
      bioContent.hidden = true;

      const bioText = document.createElement('p');
      bioText.className = 'teacher-bio__text';
      bioText.textContent = teacher.biography;
      bioContent.appendChild(bioText);

      bioToggle.addEventListener('click', () => {
        const expanded = bioToggle.getAttribute('aria-expanded') === 'true';
        bioToggle.setAttribute('aria-expanded', String(!expanded));
        bioContent.hidden = expanded;
        bioWrapper.classList.toggle('teacher-bio--open', !expanded);
      });

      bioWrapper.appendChild(bioToggle);
      bioWrapper.appendChild(bioContent);
      info.appendChild(bioWrapper);
    }

    card.appendChild(imgWrapper);
    card.appendChild(info);
    container.appendChild(card);
  }

  if (members.length > 0) {
    const membersGrid = document.createElement('div');
    membersGrid.className = 'team-grid';

    members.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'team-card card';

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'team-card__image-wrapper';
      const img = document.createElement('img');
      img.src = member.photo;
      img.alt = member.altText;
      img.width = 320;
      img.height = 320;
      img.className = 'team-card__image';
      img.loading = 'lazy';
      imgWrapper.appendChild(img);

      const info = document.createElement('div');
      info.className = 'team-card__info';

      const name = document.createElement('h3');
      name.className = 'team-card__name';
      name.textContent = member.name;
      info.appendChild(name);

      const career = document.createElement('p');
      career.className = 'team-card__career';
      career.textContent = `${member.career} · ${member.semester}`;
      info.appendChild(career);

      if (member.topic) {
        const topic = document.createElement('p');
        topic.className = 'team-card__topic badge';
        topic.textContent = member.topic;
        info.appendChild(topic);
      }

      if (member.role) {
        const role = document.createElement('span');
        role.className = 'team-card__role badge badge--blue';
        role.textContent = member.role;
        info.appendChild(role);
      }

      if (member.instagram) {
        const igLink = document.createElement('a');
        igLink.href = member.instagram;
        igLink.target = '_blank';
        igLink.rel = 'noopener noreferrer';
        igLink.className = 'team-card__instagram';
        igLink.setAttribute('aria-label', `Instagram de ${member.name}`);
        igLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> Instagram';
        info.appendChild(igLink);
      }

      card.appendChild(imgWrapper);
      card.appendChild(info);
      membersGrid.appendChild(card);
    });

    container.appendChild(membersGrid);
  }
}

function renderReferences(): void {
  const container = document.getElementById('references-grid');
  if (!container) return;

  const grid = document.createElement('div');
  grid.className = 'references-list';

  siteData.references.forEach((ref) => {
    const card = document.createElement('div');
    card.className = 'reference-card card reveal';

    const institution = document.createElement('p');
    institution.className = 'reference-card__institution';
    institution.textContent = ref.institution;

    const title = document.createElement('h3');
    title.className = 'reference-card__title';

    const link = document.createElement('a');
    link.href = ref.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = ref.title;
    title.appendChild(link);

    const externalIcon = document.createElement('span');
    externalIcon.className = 'reference-card__external';
    externalIcon.setAttribute('aria-hidden', 'true');
    externalIcon.innerHTML = ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    title.appendChild(externalIcon);

    const desc = document.createElement('p');
    desc.className = 'reference-card__desc';
    desc.textContent = ref.description;

    card.appendChild(institution);
    card.appendChild(title);
    card.appendChild(desc);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function setFooterYear(): void {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

// ─── Initialize ────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Render content from data
  renderProcessSteps();
  initPhaseBenefits();
  initIngredients();
  initPhases();
  renderTreatments();
  renderResponsiblePractices();
  initGallery();
  renderTeam();
  initComments();
  renderReferences();
  setFooterYear();

  // Initialize interactions
  initNavigation();
  initLightbox();
  initSharing();
  initReveal();
  registerServiceWorker();
});
