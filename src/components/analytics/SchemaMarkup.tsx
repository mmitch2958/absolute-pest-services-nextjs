import { businessSchema, SITE_URL } from '@/lib/business-profile'

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

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

function ServiceSchema({
  serviceName,
  serviceType,
  description,
  url,
}: Required<Pick<SchemaMarkupProps, 'serviceName'>> & SchemaMarkupProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    serviceType: serviceType ?? 'Pest Control',
    ...(description ? { description } : {}),
    url: url ?? `${SITE_URL}/${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
    provider: { '@id': `${SITE_URL}/#business` },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Chester County, Pennsylvania' },
      { '@type': 'AdministrativeArea', name: 'New Castle County, Delaware' },
    ],
  }

  return <JsonLd data={schema} />
}

function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return <JsonLd data={schema} />
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
      <JsonLd data={businessSchema} />
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
