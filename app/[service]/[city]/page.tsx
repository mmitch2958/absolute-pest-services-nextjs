import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, CheckCircle, MapPin, Shield, Clock, Star, ArrowRight } from 'lucide-react'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'
import {
  CITY_SERVICE_CITIES,
  CITY_SERVICES,
  DETAILED_CITY_CONTENT,
} from '@/lib/city-data'
import { CITY_SERVICE_CONTENT } from '@/lib/city-service-content'

export const revalidate = 604800 // ISR: regenerate every 7 days

const PA_PHONE = '484-643-2225'
const DE_PHONE = '302-235-1975'
const PA_CITY_SLUGS = [
  'avondale-pa', 'chadds-ford-pa', 'coatesville-pa', 'cochranville-pa',
  'downingtown-pa', 'exton-pa', 'glen-mills-pa', 'kennett-square-pa',
  'landenberg-pa', 'lincoln-university-pa', 'oxford-pa', 'west-grove-pa',
]
const DE_CITY_SLUGS = ['hockessin-de', 'newark-de', 'wilmington-de']

function getPhone(citySlug: string): string {
  return DE_CITY_SLUGS.includes(citySlug) ? DE_PHONE : PA_PHONE
}

function getTelLink(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

function getGeoRegion(citySlug: string): string {
  return citySlug.endsWith('-pa') ? 'US-PA' : 'US-DE'
}

// All 60 static params
export async function generateStaticParams() {
  const params: { service: string; city: string }[] = []
  for (const service of CITY_SERVICES) {
    for (const city of CITY_SERVICE_CITIES) {
      params.push({ service: service.slug, city: city.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; city: string }>
}): Promise<Metadata> {
  const { service: serviceSlug, city: citySlug } = await params
  const service = CITY_SERVICES.find((s) => s.slug === serviceSlug)
  const city = CITY_SERVICE_CITIES.find((c) => c.slug === citySlug)

  if (!service || !city) return {}

  const canonicalPath = `/${service.slug}/${city.slug}`
  const geoRegion = getGeoRegion(citySlug)
  const phone = getPhone(citySlug)

  return {
    title: `${service.title} in ${city.name}, ${city.state} | Absolute Pest Services`,
    description: `${service.shortDesc} Serving ${city.name}${city.county ? `, ${city.county}` : ''}, ${city.state}. Same-day service available. Call ${phone}.`,
    alternates: { canonical: `https://absolutepestservices.com${canonicalPath}` },
    openGraph: {
      url: `https://absolutepestservices.com${canonicalPath}`,
      title: `${service.title} in ${city.name}, ${city.state} | Absolute Pest Services`,
      description: `${service.shortDesc} Serving ${city.name}, ${city.state}. Licensed & insured. Call ${phone}.`,
      type: 'website',
    },
    other: {
      'geo.region': geoRegion,
      'geo.placename': `${city.name}, ${city.state}`,
    },
  }
}

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ service: string; city: string }>
}) {
  const { service: serviceSlug, city: citySlug } = await params
  const service = CITY_SERVICES.find((s) => s.slug === serviceSlug)
  const city = CITY_SERVICE_CITIES.find((c) => c.slug === citySlug)

  if (!service || !city) notFound()

  const phone = getPhone(citySlug)
  const telLink = getTelLink(phone)
  const content = CITY_SERVICE_CONTENT[`${serviceSlug}-${citySlug}`]
  const bulletPoints = content?.bulletPoints ?? []
  const faqs = content?.faqs ?? []
  const neighborhoods = content?.neighborhoods ?? []
  const detailedContent = DETAILED_CITY_CONTENT[citySlug]?.[serviceSlug]
  const geoRegion = getGeoRegion(citySlug)

  // Nearby cities in same state
  const nearbyCities = CITY_SERVICE_CITIES
    .filter((c) => c.state === city.state && c.slug !== city.slug)
    .slice(0, 4)

  // Other services in same city
  const otherServices = CITY_SERVICES.filter((s) => s.slug !== serviceSlug)

  // JSON-LD Schemas
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://absolutepestservices.com',
    name: 'Absolute Pest Services',
    telephone: phone,
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
      latitude: '39.8221',
      longitude: '-75.8274',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': city.county ? 'AdministrativeArea' : 'State',
        name: city.county ?? city.state,
        ...(city.county
          ? {
              containedInPlace: {
                '@type': 'State',
                name: city.state,
              },
            }
          : {}),
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: service.name,
      itemListElement: bulletPoints.slice(0, 3).map((bp) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: bp },
      })),
    },
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${city.name}, ${city.state}`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://absolutepestservices.com',
      name: 'Absolute Pest Services',
      telephone: phone,
      url: 'https://absolutepestservices.com',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      addressRegion: city.state,
      addressCountry: 'US',
    },
    description: `${service.shortDesc} Serving ${city.name}, ${city.state}.`,
    url: `https://absolutepestservices.com/${service.slug}/${city.slug}`,
    serviceType: service.name,
  }

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero — above fold, mobile-first */}
      <section
        className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-900 text-white"
        aria-label="Hero"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="text-sm text-green-300 mb-5" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><span aria-hidden>/</span></li>
              <li>
                <Link href="/service-areas" className="hover:text-white transition-colors">
                  Service Areas
                </Link>
              </li>
              <li><span aria-hidden>/</span></li>
              <li>
                <Link href={`/service-areas/${citySlug}`} className="hover:text-white transition-colors">
                  {city.name}, {city.state}
                </Link>
              </li>
              <li><span aria-hidden>/</span></li>
              <li className="text-white" aria-current="page">{service.name}</li>
            </ol>
          </nav>

          {/* Location badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            <span>{city.name}{city.county ? ` · ${city.county}` : ''}, {city.state}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            {service.h1Template
              .replace('{city}', city.name)
              .replace('{state}', city.state)}
          </h1>

          <p className="text-green-100 text-base sm:text-lg max-w-2xl mb-6">
            {service.longDesc} Serving {city.name}
            {city.county ? `, ${city.county}` : ''}, {city.state}.
            Licensed and insured. Same-day service available.
          </p>

          {/* Trust signals bar */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-green-200 mb-7" aria-label="Trust signals">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-300" />Licensed &amp; Insured</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-300" />PA &amp; DE Certified</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-300" />Free Inspection</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />5.0★ Rated</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-300" />24/7 Emergency</span>
          </div>

          {/* CTAs above fold */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:+1${telLink}`}
              className="flex items-center justify-center gap-2 bg-white text-green-800 font-bold px-6 py-3.5 rounded-lg hover:bg-green-50 transition-colors text-base sm:text-lg shadow-lg"
            >
              <Phone className="w-5 h-5" aria-hidden />
              Call {phone}
            </a>
            <Link
              href="#contact-form"
              className="flex items-center justify-center gap-2 bg-amber-500 text-gray-900 font-bold px-6 py-3.5 rounded-lg hover:bg-amber-400 transition-colors text-base sm:text-lg shadow-lg"
            >
              Get Free Estimate
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left column: service content */}
            <div className="lg:col-span-2 space-y-10">

              {/* Detailed content from source or generated */}
              <section aria-labelledby="service-content-heading">
                <h2 id="service-content-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
                  {service.name} in {city.name}, {city.state}
                </h2>

                {detailedContent ? (
                  <div className="prose prose-gray max-w-none text-gray-700">
                    {detailedContent.split('\n\n').map((para, i) => {
                      if (para.startsWith('###')) {
                        return (
                          <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                            {para.replace(/^###\s*/, '').replace(/\*\*/g, '')}
                          </h3>
                        )
                      }
                      return (
                        <p key={i} className="mb-4 leading-relaxed">
                          {para.replace(/\*\*/g, '')}
                        </p>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Absolute Pest Services provides professional {service.name.toLowerCase()} for
                      homes and businesses in {city.name}
                      {city.county ? `, ${city.county}` : ''}, {city.state}.
                      Our licensed technicians are fully equipped to handle {service.name.toLowerCase()}
                      throughout the area.
                    </p>
                    <p>{service.longDesc}</p>
                    <p>
                      We offer free estimates and same-day service when available. Call{' '}
                      <a
                        href={`tel:+1${telLink}`}
                        className="text-green-700 font-semibold hover:underline"
                      >
                        {phone}
                      </a>{' '}
                      or use the form below to get started.
                    </p>
                  </div>
                )}
              </section>

              {/* What's Included */}
              {bulletPoints.length > 0 && (
                <section aria-labelledby="services-included-heading">
                  <h2 id="services-included-heading" className="text-2xl font-bold text-gray-900 mb-5">
                    What&apos;s Included — {service.name} in {city.name}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
                    {bulletPoints.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                      >
                        <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-white" aria-hidden />
                        </div>
                        <span className="text-gray-700 text-sm leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Areas / Neighborhoods Served */}
              {neighborhoods.length > 0 && (
                <section aria-labelledby="areas-served-heading">
                  <h2 id="areas-served-heading" className="text-2xl font-bold text-gray-900 mb-5">
                    {city.name} &amp; Surrounding Neighborhoods
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {neighborhoods.map((area) => (
                      <div
                        key={area}
                        className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-lg px-4 py-3"
                      >
                        <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" aria-hidden />
                        <span className="text-sm font-medium text-gray-800">{area}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    Don&apos;t see your neighborhood? We likely serve it — call to confirm.
                  </p>
                </section>
              )}

              {/* Why choose us */}
              <section aria-labelledby="why-choose-heading">
                <h2 id="why-choose-heading" className="text-2xl font-bold text-gray-900 mb-5">
                  Why {city.name} Trusts Absolute Pest Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Shield,
                      title: 'Licensed & Certified',
                      body: `Fully licensed in ${city.state === 'PA' ? 'Pennsylvania and Delaware' : 'Delaware and Pennsylvania'}. All technicians are state-certified applicators.`,
                      color: 'bg-green-700',
                    },
                    {
                      icon: MapPin,
                      title: 'Locally Owned',
                      body: `Based in West Grove, PA — your neighbors in pest control. ${city.county ? city.county + ' and ' : ''}${city.state === 'PA' ? 'Chester County' : 'New Castle County'} specialists.`,
                      color: 'bg-amber-500',
                    },
                    {
                      icon: Star,
                      title: '5.0 Star Rated',
                      body: `Consistent 5-star Google reviews from homeowners throughout ${city.name} and surrounding communities.`,
                      color: 'bg-blue-600',
                    },
                    {
                      icon: Clock,
                      title: '24/7 Emergency',
                      body: `Pest emergencies do not keep business hours. Our team is available around the clock for urgent ${service.name.toLowerCase()} situations in ${city.name}.`,
                      color: 'bg-green-800',
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`w-10 h-10 ${card.color} rounded-full flex items-center justify-center mb-3`}>
                        <card.icon className="w-5 h-5 text-white" aria-hidden />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{card.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{card.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Accordion */}
              {faqs.length > 0 && (
                <section aria-labelledby="faq-heading">
                  <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-5">
                    Frequently Asked Questions — {service.name} in {city.name}
                  </h2>
                  <div className="space-y-4" role="list">
                    {faqs.map((faq) => (
                      <details
                        key={faq.q}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-gray-900 text-base hover:bg-gray-50 transition-colors">
                          <span>{faq.q}</span>
                          <span className="flex-shrink-0 text-green-700 group-open:rotate-180 transition-transform">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </summary>
                        <div className="px-5 pb-5 text-gray-700 text-sm leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="space-y-6" aria-label="Contact and service links">

              {/* CTA Card */}
              <div
                id="contact-form"
                className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm sticky top-24"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Get {service.name} in {city.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">Free inspection · Same-day available</p>

                <a
                  href={`tel:+1${telLink}`}
                  className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-4 rounded-xl w-full mb-3 transition-colors text-lg shadow"
                >
                  <Phone className="w-5 h-5" aria-hidden />
                  {phone}
                </a>
                <p className="text-center text-xs text-gray-500 mb-4">or fill out the form below</p>

                <ServiceRequestForm defaultService={serviceSlug} />
              </div>

              {/* Other services in this city */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                  More Services in {city.name}
                </h3>
                <ul className="space-y-2" role="list">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${s.slug}/${citySlug}`}
                        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline"
                      >
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                        {s.name} in {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nearby cities */}
              {nearbyCities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Nearby Areas
                  </h3>
                  <ul className="space-y-2" role="list">
                    {nearbyCities.map((nearbyCity) => (
                      <li key={nearbyCity.slug}>
                        <Link
                          href={`/${serviceSlug}/${nearbyCity.slug}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 hover:underline"
                        >
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden />
                          {nearbyCity.name}, {nearbyCity.state}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick service links */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                  Quick Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { href: '/termite-treatment', label: 'Termite Treatment' },
                    { href: '/wildlife-control', label: 'Wildlife Control' },
                    { href: '/bed-bug-treatment', label: 'Bed Bug Treatment' },
                    { href: '/service-areas', label: 'All Areas' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Final CTA Banner */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 py-12" aria-label="Final call to action">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {service.name} Problem in {city.name}? We Can Help.
          </h2>
          <p className="text-green-100 text-base sm:text-lg mb-7 max-w-2xl mx-auto">
            From initial inspection to complete treatment, our licensed technicians deliver
            lasting {service.name.toLowerCase()} solutions for {city.name}, {city.state} homeowners and businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`tel:+1${telLink}`}
              className="flex items-center justify-center gap-2 bg-white text-green-800 font-bold px-8 py-4 rounded-lg hover:bg-green-50 transition-colors text-lg shadow"
            >
              <Phone className="w-5 h-5" aria-hidden />
              Call {phone}
            </a>
            <Link
              href="#contact-form"
              className="flex items-center justify-center gap-2 bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-amber-400 transition-colors text-lg shadow"
            >
              Get Free Inspection
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
