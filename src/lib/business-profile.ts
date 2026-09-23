export const SITE_URL = 'https://absolutepestservices.com'

export const BUSINESS_NAME = 'Absolute Pest Services'
export const PRIMARY_PHONE = '+1-484-643-2225'
export const PRIMARY_PHONE_DISPLAY = '484-643-2225'
export const BUSINESS_EMAIL = 'info@absolutepestservices.com'

export const PRIMARY_SERVICE_AREAS = [
  'Chester County, Pennsylvania',
  'New Castle County, Delaware',
] as const

export const SERVICE_NAMES = [
  'General pest control',
  'Ant control',
  'Cockroach control',
  'Spider control',
  'Wasp and stinging insect removal',
  'Termite inspection and treatment',
  'Bed bug treatment',
  'Rodent control',
  'Carpenter bee treatment',
  'Bat exclusion',
  'Humane wildlife removal and exclusion',
] as const

export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps?cid=6448368082287234615'

export const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: BUSINESS_NAME,
  description:
    'Local pest control and humane wildlife removal serving Chester County, Pennsylvania and northern Delaware, with additional coverage in nearby southeastern Pennsylvania communities.',
  url: SITE_URL,
  logo: `${SITE_URL}/images/absolute-wordmark.svg`,
  image: `${SITE_URL}/images/Hero1.jpg`,
  telephone: PRIMARY_PHONE,
  email: BUSINESS_EMAIL,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'West Grove',
    addressRegion: 'PA',
    postalCode: '19390',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.8221,
    longitude: -75.8274,
  },
  areaServed: [
    {
      '@type': 'AdministrativeArea',
      name: 'Chester County, Pennsylvania',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'New Castle County, Delaware',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Delaware County, Pennsylvania',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Montgomery County, Pennsylvania',
    },
  ],
  sameAs: [
    'https://www.facebook.com/absolutepestservices',
    GOOGLE_MAPS_URL,
  ],
  knowsAbout: SERVICE_NAMES,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Pest and wildlife control services',
    itemListElement: SERVICE_NAMES.map((name) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name,
        provider: { '@id': `${SITE_URL}/#business` },
      },
    })),
  },
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BUSINESS_NAME,
  publisher: { '@id': `${SITE_URL}/#business` },
  inLanguage: 'en-US',
}

export const homePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#homepage`,
  url: `${SITE_URL}/`,
  name: 'Pest Control in Chester County, PA & Northern Delaware',
  description:
    'Local extermination, pest control, termite treatment, bed bug treatment, rodent control, and humane wildlife removal in Chester County, PA and northern Delaware.',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#business` },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/images/Hero1.jpg`,
  },
  dateModified: '2026-09-23',
}
