const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const SITE_CONFIG = deepFreeze({
  name: 'SIPA',
  shortName: 'SIPA UTMACH',
  fullName: 'Semillero de Investigación en Producción Animal',
  description: 'Portal institucional del Semillero de Investigación en Producción Animal de la Universidad Técnica de Machala.',
  locale: 'es-EC',
  openGraphLocale: 'es_EC',
  canonicalOrigin: 'https://sipautmach.com',
  technicalDomain: 'sipautmach.com',
  visualDomain: 'SIPAUTMACH.COM',
  socialImage: 'assets/images/og-sipa.png',
  socialImageAlt: 'SIPA, Semillero de Investigación en Producción Animal de la Universidad Técnica de Machala',
  organization: {
    name: 'Universidad Técnica de Machala',
    shortName: 'UTMACH',
    career: 'Medicina Veterinaria',
    url: 'https://www.utmachala.edu.ec/',
    location: {
      locality: 'Machala',
      region: 'El Oro',
      country: 'Ecuador',
      countryCode: 'EC',
    },
  },
  themeColors: {
    light: '#F3FAF5',
    dark: '#09110C',
    primary: '#158144',
  },
  storageKeys: {
    theme: 'sipa-theme',
  },
});

// Alias breve para consumidores que prefieran imports con nombre semántico.
export const site = SITE_CONFIG;

export default SITE_CONFIG;
