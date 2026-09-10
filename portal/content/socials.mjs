import { SITE_CONFIG } from '../config/site.mjs';
import { normalizeWhatsAppHref } from '../lib/urls.mjs';

const configuredWhatsAppNumber = SITE_CONFIG.contact.whatsappNumber;
const configuredWhatsAppHref = configuredWhatsAppNumber
  ? normalizeWhatsAppHref(configuredWhatsAppNumber)
  : null;

if (configuredWhatsAppNumber && !configuredWhatsAppHref) {
  throw new Error('El WhatsApp institucional debe usar formato internacional E.164 con prefijo +.');
}

/** Redes oficiales de SIPA. No publicar cuentas personales. */
export const socialLinks = [
  {
    id: 'instagram',
    label: 'Instagram',
    username: '@sipa_utmach',
    url: 'https://www.instagram.com/sipa_utmach/',
    icon: 'instagram',
    published: true
  },
  {
    id: 'facebook',
    label: 'Facebook',
    username: 'sipa.utmach',
    url: 'https://www.facebook.com/sipa.utmach',
    icon: 'facebook',
    published: true
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    username: '@sipa_utmach',
    url: 'https://www.tiktok.com/@sipa_utmach',
    icon: 'tiktok',
    published: true
  },
  {
    id: 'youtube',
    label: 'YouTube',
    username: '@SIPA_UTMACH',
    url: 'https://www.youtube.com/@SIPA_UTMACH',
    icon: 'youtube',
    published: true
  }
];

export const institutionalLinks = [
  {
    id: 'utmach',
    label: 'Universidad Técnica de Machala',
    username: 'UTMACH',
    url: 'https://www.utmachala.edu.ec/',
    icon: 'external',
    published: true
  }
];

export const contactChannels = [
  {
    id: 'email',
    label: 'Correo',
    username: 'sipautmach@gmail.com',
    url: 'mailto:sipautmach@gmail.com',
    icon: 'mail',
    order: 10,
    published: true,
    status: 'confirmed',
  },
  ...(configuredWhatsAppHref ? [{
    id: 'whatsapp',
    label: 'WhatsApp',
    username: configuredWhatsAppNumber,
    url: configuredWhatsAppHref,
    icon: 'whatsapp',
    order: 20,
    published: true,
    status: 'confirmed',
  }] : []),
];

export const contactContent = {
  institution: 'Universidad Técnica de Machala',
  academicUnit: 'Carrera de Medicina Veterinaria',
  location: 'Machala, El Oro, Ecuador',
  note: 'El canal oficial de WhatsApp se incorporará cuando sea confirmado.',
  form: {
    published: false,
    endpoint: '',
    method: 'POST'
  }
};
