import { SITE_CONFIG } from '../config/site.mjs';
import { getBreadcrumbs } from '../config/navigation.mjs';
import { createRouteHelpers } from '../lib/urls.mjs';
import { escapeAttribute, escapeHtml, renderJsonLd } from '../lib/html.mjs';
import { renderBreadcrumb } from './partials/breadcrumb.mjs';
import { renderFooter } from './partials/footer.mjs';
import { renderHeader } from './partials/header.mjs';

const cssFiles = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'pages.css', 'responsive.css'];

function baseStructuredData(route, helpers, breadcrumbs) {
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${helpers.canonicalHref()}#webpage`,
      url: helpers.canonicalHref(),
      name: route.title,
      description: route.description,
      inLanguage: SITE_CONFIG.locale,
      isPartOf: { '@id': `${SITE_CONFIG.canonicalOrigin}/#website` }
    }
  ];
  if (route.id === 'home') {
    graph.unshift({
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.canonicalOrigin}/#website`,
      url: `${SITE_CONFIG.canonicalOrigin}/`,
      name: SITE_CONFIG.name,
      alternateName: SITE_CONFIG.fullName,
      description: SITE_CONFIG.description,
      inLanguage: SITE_CONFIG.locale,
      publisher: { '@id': `${SITE_CONFIG.canonicalOrigin}/#organization` }
    }, {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_CONFIG.canonicalOrigin}/#organization`,
      name: SITE_CONFIG.organization.name,
      url: SITE_CONFIG.organization.url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE_CONFIG.organization.location.locality,
        addressRegion: SITE_CONFIG.organization.location.region,
        addressCountry: SITE_CONFIG.organization.location.countryCode
      }
    });
  }
  if (breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, item: helpers.canonicalHref(item.id) }))
    });
  }
  return graph;
}

export function renderLayout({ route, page, metadata }) {
  const helpers = createRouteHelpers(route.id);
  const breadcrumbs = getBreadcrumbs(route.id);
  const socialImage = new URL(SITE_CONFIG.socialImage, `${SITE_CONFIG.canonicalOrigin}/`).href;
  const graph = [...baseStructuredData(route, helpers, breadcrumbs), ...(page.structuredData || []).map(item => {
    const { '@context': _context, ...entry } = item;
    return entry;
  })];
  const styles = cssFiles.map(file => `<link rel="stylesheet" href="${escapeAttribute(helpers.assetHref(`assets/css/${file}`))}?v=${escapeAttribute(metadata.cacheKey)}">`).join('\n  ');

  return `<!doctype html>
<html lang="${escapeAttribute(SITE_CONFIG.locale)}" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="${escapeAttribute(SITE_CONFIG.themeColors.primary)}">
  <meta name="description" content="${escapeAttribute(route.description)}">
  <meta name="author" content="SIPA · ${escapeAttribute(SITE_CONFIG.organization.name)}">
  <meta name="sipa-build-date" content="${escapeAttribute(metadata.buildDate)}">
  <meta name="sipa-build-sha" content="${escapeAttribute(metadata.buildSha)}">
  <meta name="sipa-version" content="${escapeAttribute(metadata.version)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttribute(route.title)}">
  <meta property="og:description" content="${escapeAttribute(route.description)}">
  <meta property="og:url" content="${escapeAttribute(helpers.canonicalHref())}">
  <meta property="og:image" content="${escapeAttribute(socialImage)}">
  <meta property="og:image:alt" content="${escapeAttribute(SITE_CONFIG.socialImageAlt)}">
  <meta property="og:locale" content="${escapeAttribute(SITE_CONFIG.openGraphLocale)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(route.title)}">
  <meta name="twitter:description" content="${escapeAttribute(route.description)}">
  <meta name="twitter:image" content="${escapeAttribute(socialImage)}">
  <title>${escapeHtml(route.title)}</title>
  <link rel="canonical" href="${escapeAttribute(helpers.canonicalHref())}">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon/favicon-64x64.png'))}?v=${escapeAttribute(metadata.cacheKey)}" type="image/png" sizes="64x64">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon/favicon-48x48.png'))}?v=${escapeAttribute(metadata.cacheKey)}" type="image/png" sizes="48x48">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon/favicon-32x32.png'))}?v=${escapeAttribute(metadata.cacheKey)}" type="image/png" sizes="32x32">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon/favicon-24x24.png'))}?v=${escapeAttribute(metadata.cacheKey)}" type="image/png" sizes="24x24">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon/favicon-16x16.png'))}?v=${escapeAttribute(metadata.cacheKey)}" type="image/png" sizes="16x16">
  <link rel="icon" href="${escapeAttribute(helpers.assetHref('favicon.ico'))}?v=${escapeAttribute(metadata.cacheKey)}" sizes="16x16 24x24 32x32 48x48 64x64">
  <link rel="apple-touch-icon" href="${escapeAttribute(helpers.assetHref('favicon/apple-touch-icon.png'))}?v=${escapeAttribute(metadata.cacheKey)}" sizes="180x180">
  <link rel="manifest" href="${escapeAttribute(helpers.assetHref('manifest.webmanifest'))}?v=${escapeAttribute(metadata.cacheKey)}">
  <script>(()=>{const d=document.documentElement;d.classList.add('js');try{const k='${escapeAttribute(SITE_CONFIG.storageKeys.theme)}';const s=localStorage.getItem(k);const t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.dataset.theme=t;d.style.colorScheme=t}catch{}})();</script>
  ${styles}
  ${renderJsonLd({ '@context': 'https://schema.org', '@graph': graph })}
</head>
<body data-route-id="${escapeAttribute(route.id)}">
  <span class="page-top" id="page-top" tabindex="-1"></span>
  <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
  ${renderHeader({ route, helpers })}
  ${renderBreadcrumb(breadcrumbs)}
  <main id="main-content" tabindex="-1">${page.html}</main>
  ${renderFooter({ route, helpers, metadata })}
  <noscript><p class="noscript">Los enlaces y el contenido principal permanecen disponibles sin JavaScript.</p></noscript>
  <script src="${escapeAttribute(helpers.assetHref('assets/js/site.js'))}?v=${escapeAttribute(metadata.cacheKey)}" defer></script>
</body>
</html>`;
}
