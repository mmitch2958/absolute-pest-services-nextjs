'use client'

/**
 * SchemaMarkup — renders JSON-LD structured data for service pages.
 *
 * Usage:
 *   import SchemaMarkup from '@/components/analytics/SchemaMarkup'
 *
 *   // Minimal (LocalBusiness only)
 *   <SchemaMarkup />
 *
 *   // Full (LocalBusiness + Service + FAQPage)
 *   <SchemaMarkup
 *     serviceName="Rodent Control"
 *     serviceType="Pest Control"
 *     description="..."
 *     faqs={[{ q: 'Question?', a: 'Answer.' }]}
 *   />
 *
 * FAQ schema is rendered only when faqs array is non-empty.
 */

export interface FAQ {
  q: string
  a: string
}

interface SchemaMarkupProps {
  serviceName?: string
  serviceType?: string
  description?: string
  url?: string
  faqs?: FAQ[]
}

const BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://absolutepestservices.com/#business',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  email: 'info@absolutepestservices.com',
  url: 'https://absolutepestservices.com',
  image: 'https://absolutepestservices.com/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '21 Sheffield Dr',
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
    { '@type': 'State', name: 'Pennsylvania' },
    { '@type': 'State', name: 'Delaware' },
    { '@type': 'State', name: 'Maryland' },
  ],
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '247',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://www.facebook.com/absolutepestservices',
    'https://www.google.com/maps/place/Absolute+Pest+Services',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Pest Control Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wildlife Control' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bed Bug Treatment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Termite Treatment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bat Removal' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rodent Control' } },
    ],
  },
}

function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS) }}
    />
  )
}

function ServiceSchema({ serviceName, serviceType, description, url }: SchemaMarkupProps) {
  if (!serviceName) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://absolutepestservices.com/#business',
      name: 'Absolute Pest Services',
      telephone: '+1-484-643-2225',
      url: 'https://absolutepestservices.com',
    },
    serviceType: serviceType ?? 'Pest Control',
    description: description,
    url: url ?? `https://absolutepestservices.com/${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
    areaServed: [
      { '@type': 'State', name: 'Pennsylvania' },
      { '@type': 'State', name: 'Delaware' },
      { '@type': 'State', name: 'Maryland' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: serviceName,
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: serviceName } },
      ],
    },
    priceRange: '$$',
    providerSells: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  if (!faqs || faqs.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function SchemaMarkup({
  serviceName,
  serviceType,
  description,
  url,
  faqs,
}: SchemaMarkupProps) {
  return (
    <>
      <LocalBusinessSchema />
      {serviceName && (
        <ServiceSchema
          serviceName={serviceName}
          serviceType={serviceType}
          description={description}
          url={url}
        />
      )}
      {faqs && faqs.length > 0 && <FAQSchema faqs={faqs} />}
    </>
  )
}
