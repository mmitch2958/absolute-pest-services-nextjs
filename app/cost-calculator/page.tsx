import type { Metadata } from 'next'
import Link from 'next/link'
import CostCalculator from '@/components/calculator/CostCalculator'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Pest Control Cost Calculator - Free Estimate | Absolute Pest Services',
    description:
      'Calculate pest control costs instantly. Get free estimates for termite treatment, bed bug removal, wildlife control, bat removal, and more. Serving PA, DE, and MD.',
    keywords: [
      'pest control cost',
      'pest control estimate',
      'termite treatment cost',
      'bed bug treatment cost',
      'wildlife removal cost',
      'bat removal cost',
      'pest control prices',
      'pest control quote',
      'pest control calculator',
    ],
    alternates: {
      canonical: 'https://absolutepestservices.com/cost-calculator',
    },
    openGraph: {
      title: 'Pest Control Cost Calculator - Free Estimate | Absolute Pest Services',
      description:
        'Calculate pest control costs instantly. Get free estimates for various pest control services.',
      url: 'https://absolutepestservices.com/cost-calculator',
      type: 'website',
      images: [
        {
          url: 'https://absolutepestservices.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Absolute Pest Services - Cost Calculator',
        },
      ],
    },
    other: {
      'geo.region': 'US-PA',
      'geo.placename': 'Southeastern Pennsylvania',
    },
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  url: 'https://absolutepestservices.com/cost-calculator',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '21 Sheffield Dr',
    addressLocality: 'West Grove',
    addressRegion: 'PA',
    postalCode: '19390',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'State', name: 'Pennsylvania' },
    { '@type': 'State', name: 'Delaware' },
    { '@type': 'State', name: 'Maryland' },
  ],
  priceRange: '$$',
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Pest Control Cost Calculator',
  provider: { '@type': 'LocalBusiness', name: 'Absolute Pest Services' },
  areaServed: 'Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE',
  serviceType: 'Pest Control',
  url: 'https://absolutepestservices.com/cost-calculator',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Cost Calculator', item: 'https://absolutepestservices.com/cost-calculator' },
  ],
}

export default function CostCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Cost Calculator</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pest Control Cost Calculator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Get an instant cost estimate for pest control, bed bug treatment, termite control,
            or wildlife removal. Free exact quotes when you call.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <CostCalculator />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Factors That Affect Price</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  {[
                    { title: 'Infestation severity', desc: 'Light vs. heavy infestations require different amounts of treatment.' },
                    { title: 'Property size', desc: 'Larger homes require more materials and time.' },
                    { title: 'Treatment type', desc: 'Heat treatment costs more upfront but typically requires fewer visits.' },
                    { title: 'Accessibility', desc: 'Crawl spaces, attics, and tight areas may require more labor.' },
                    { title: 'Return visits', desc: 'Some infestations require follow-up treatments.' },
                  ].map(item => (
                    <div key={item.title}>
                      <span className="font-medium">{item.title}</span> — {item.desc}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-bold text-gray-900 mb-3">Want an Exact Quote?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our technicians provide free, no-obligation estimates. We&rsquo;ll inspect your
                  property and give you an exact price before any work begins.
                </p>
                <a
                  href="tel:484-643-2225"
                  className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-3 rounded-xl w-full text-sm"
                >
                  Call 484-643-2225
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
