import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import {
  CITY_SERVICES,
  CITY_SERVICE_CITIES,
  parseCityServiceSlug,
  generateAllCityServiceSlugs,
  DETAILED_CITY_CONTENT,
} from '@/lib/city-data'

// ISR: regenerate every 7 days
export const revalidate = 604800

// Generate all 60 slugs at build time (4 services × 15 cities)
export async function generateStaticParams() {
  return generateAllCityServiceSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { service, city } = parseCityServiceSlug(slug)

  if (!service || !city) return {}

  return {
    title: `${service.title} in ${city.name}, ${city.state} | Absolute Pest Services`,
    description: `${service.shortDesc} Serving ${city.name}${city.county ? `, ${city.county}` : ''}, ${city.state}. Same-day service available. Call 484-643-2225.`,
    alternates: {
      canonical: `https://absolutepestservices.com/city-services/${slug}`,
    },
    openGraph: {
      url: `https://absolutepestservices.com/city-services/${slug}`,
      title: `${service.title} in ${city.name}, ${city.state} | Absolute Pest Services`,
    },
  }
}

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { service, city } = parseCityServiceSlug(slug)

  if (!service || !city) notFound()

  // JSON-LD Service Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${city.name}, ${city.state}`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Absolute Pest Services',
      telephone: '484-643-2225',
      url: 'https://absolutepestservices.com',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      addressRegion: city.state,
      addressCountry: 'US',
    },
    url: `https://absolutepestservices.com/city-services/${slug}`,
  }

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  // Check for Lando's detailed content
  const cityContent = DETAILED_CITY_CONTENT[city.slug] ?? {}
  const detailedContent = cityContent[service.slug]

  // Other services to cross-link
  const otherServices = CITY_SERVICES.filter((s) => s.slug !== service.slug)

  // Nearby cities
  const nearbyCities = CITY_SERVICE_CITIES.filter(
    (c) => c.state === city.state && c.slug !== city.slug
  ).slice(0, 4)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/service-areas" className="hover:text-white">Service Areas</Link>
            <span className="mx-2">/</span>
            <Link href={`/service-areas/${city.slug}`} className="hover:text-white">
              {city.name}, {city.state}
            </Link>
            <span className="mx-2">/</span>
            <span>{service.name}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {service.h1Template.replace('{city}', city.name).replace('{state}', city.state)}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            {service.longDesc} Serving {city.name}
            {city.county ? `, ${city.county}` : ''}, {city.state}.
            Licensed and insured. Same-day service available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg"
            >
              <Phone size={18} />
              Call 484-643-2225
            </a>
            <Link
              href="/request-service"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg"
            >
              Request Service Online
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {detailedContent ? (
                /* Lando's detailed city content */
                <div className="prose max-w-none text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.name} in {city.name}, {city.state}
                  </h2>
                  {detailedContent.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('###') || paragraph.startsWith('**')) {
                      const title = paragraph.replace(/^###\s*/, '').replace(/\*\*/g, '')
                      return (
                        <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                          {title}
                        </h3>
                      )
                    }
                    return (
                      <p key={i} className="mb-4 leading-relaxed">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    )
                  })}
                </div>
              ) : (
                /* Generated content */
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title} in {city.name}, {city.state}
                  </h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Absolute Pest Services provides professional {service.name.toLowerCase()} for
                    homes and businesses in {city.name}
                    {city.county ? `, ${city.county}` : ''}, {city.state}.
                    Our licensed technicians are fully equipped to handle {service.name.toLowerCase()}
                    throughout the area.
                  </p>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {service.longDesc}
                  </p>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We offer free estimates and same-day service when available. Call{' '}
                    <a href="tel:484-643-2225" className="text-green-700 font-semibold">
                      484-643-2225
                    </a>{' '}
                    or request service online to get started.
                  </p>
                </div>
              )}

              {/* Why choose us */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                Why Choose Absolute Pest Services in {city.name}?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Licensed & insured in PA & DE',
                  'Free estimates — no obligation',
                  'Same-day service available',
                  '24/7 emergency response',
                  'Family & pet safe methods',
                  'Satisfaction guarantee',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {service.faqs.map((faq) => (
                  <div
                    key={faq.q}
                    className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* CTA Card */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100 sticky top-20">
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                  Get {service.name} in {city.name}
                </h3>
                <a
                  href="tel:484-643-2225"
                  className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-4 rounded-xl w-full justify-center mb-3"
                >
                  <Phone size={18} />
                  484-643-2225
                </a>
                <Link
                  href="/request-service"
                  className="flex items-center gap-2 justify-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-3 rounded-xl w-full mb-4"
                >
                  Request Service Online
                </Link>
                <Link
                  href="/cost-calculator"
                  className="flex items-center gap-2 justify-center border border-green-300 text-green-700 hover:bg-green-100 font-medium px-4 py-2 rounded-lg w-full text-sm"
                >
                  Estimate Your Cost
                </Link>
              </div>

              {/* Other services */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  More Services in {city.name}
                </h3>
                <div className="space-y-2">
                  {otherServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/city-services/${s.slug}-${city.cityServiceSlug}`}
                      className="block text-sm text-green-700 hover:text-green-800 hover:underline"
                    >
                      {s.name} in {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Nearby cities */}
              {nearbyCities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 mb-3">Nearby Areas</h3>
                  <div className="space-y-2">
                    {nearbyCities.map((nearbyCity) => (
                      <Link
                        key={nearbyCity.slug}
                        href={`/city-services/${service.slug}-${nearbyCity.cityServiceSlug}`}
                        className="block text-sm text-gray-600 hover:text-green-700 hover:underline"
                      >
                        {service.name} in {nearbyCity.name}, {nearbyCity.state}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
