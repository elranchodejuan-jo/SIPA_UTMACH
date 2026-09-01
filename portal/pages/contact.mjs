import { contactChannels, contactContent, institutionalLinks, socialLinks } from '../content/socials.mjs';
import { escapeAttribute, escapeHtml } from '../lib/html.mjs';
import { renderButtonLink } from '../templates/components.mjs';
import { renderEmptyState } from '../templates/partials/empty-state.mjs';
import { renderIcon } from '../templates/partials/icons.mjs';
import { renderPageHero } from '../templates/partials/page-hero.mjs';

function renderContactLink(item, helpers) {
  const external = /^https?:/i.test(item.url);
  return `<li><a class="contact-card" href="${escapeAttribute(item.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${renderIcon(item.icon || 'external', helpers, { className: 'card__icon' })}<span><strong>${escapeHtml(item.label)}</strong>${item.username ? `<small>${escapeHtml(item.username)}</small>` : ''}</span></a></li>`;
}

function renderContactForm(form) {
  const method = form.method === 'GET' ? 'GET' : 'POST';
  return `<section class="section" aria-labelledby="form-title"><div class="container contact-form-wrap"><div class="section-heading"><p class="eyebrow">Escríbenos</p><h2 id="form-title">Formulario de contacto</h2><p>Los campos marcados como obligatorios deben completarse antes de enviar.</p></div>
    <form class="contact-form" action="${escapeAttribute(form.endpoint)}" method="${method}" data-contact-form>
      <div class="form-field"><label for="contact-name">Nombre <span aria-hidden="true">*</span></label><input id="contact-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
      <div class="form-field"><label for="contact-email">Correo electrónico <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254"></div>
      <div class="form-field"><label for="contact-subject">Asunto <span aria-hidden="true">*</span></label><input id="contact-subject" name="subject" type="text" required maxlength="160"></div>
      <div class="form-field form-field--wide"><label for="contact-message">Mensaje <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows="7" required minlength="10" maxlength="3000"></textarea></div>
      <div class="form-actions"><button class="button button--primary" type="submit" data-contact-submit>Enviar mensaje</button><p class="form-status" role="status" aria-live="polite" data-contact-status></p></div>
    </form>
  </div></section>`;
}

export function renderContactPage({ helpers, route }) {
  const publishedSocials = socialLinks.filter(item => item.published && item.url);
  const publishedChannels = contactChannels.filter(item => item.published && item.url);
  const publishedInstitutions = institutionalLinks.filter(item => item.published && item.url);
  const availableLinks = [...publishedChannels, ...publishedSocials, ...publishedInstitutions];
  const html = `${renderPageHero({ eyebrow: 'Información institucional', title: 'Contacto', description: route.description })}
  <section class="section" id="canales" aria-labelledby="channels-title"><div class="container"><div class="section-heading"><p class="eyebrow">Canales disponibles</p><h2 id="channels-title">Contacto y redes</h2></div>${availableLinks.length ? `<ul class="contact-grid">${availableLinks.map(item => renderContactLink(item, helpers)).join('')}</ul>` : renderEmptyState({ title: 'Canales en actualización', message: contactContent.note, icon: 'outreach' }, helpers)}${(!publishedChannels.length || !publishedSocials.length) ? `<p class="editorial-note">${escapeHtml(contactContent.note)}</p>` : ''}</div></section>
  <section class="section section--soft" id="ubicacion" aria-labelledby="location-title"><div class="container content-grid"><div>${renderIcon('location', helpers, { className: 'section-icon' })}<p class="eyebrow">Ubicación</p><h2 id="location-title">${escapeHtml(contactContent.institution)}</h2></div><div><p><strong>${escapeHtml(contactContent.academicUnit)}</strong></p><p>${escapeHtml(contactContent.location)}</p>${publishedInstitutions.map(item => renderButtonLink({ href: item.url, label: 'Visitar UTMACH', variant: 'secondary', external: true })).join('')}</div></div></section>
  ${contactContent.form.published && contactContent.form.endpoint ? renderContactForm(contactContent.form) : ''}`;
  return { html, structuredData: [] };
}
