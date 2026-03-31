import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Phone, MapPin, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {
  SERVICE_AREA_DATA,
  ALL_SERVICE_AREA_SLUGS,
} from '@/lib/service-areas-data'
import ServiceAreaForm from './ServiceAreaForm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = SERVICE_AREA_DATA[slug]
  if (!data) return {}

  const title = `${data.name} Pest Control Services | Absolute Pest Services`
  const description = data.metaDescription

  return {
    title,
    description,
    keywords: [
      `pest control ${data.name}`,
      `pest control ${data.county}`,
      `wildlife removal ${data.name}`,
      `termite treatment ${data.name}`,
      `bed bug treatment ${data.name}`,
      `rodent control ${data.name}`,
      ` Absolute Pest Services ${data.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://absolutepestservices.com/service-areas/${slug}`,
      siteName: 'Absolute Pest Services',
      images: [
        {
          url: '/images/logolong.jpg',
          width: 1200,
          height: 630,
          alt: `Pest Control Services in ${data.name}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://absolutepestservices.com/service-areas/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'geo.region': data.geoRegion,
      'geo.placename': data.geoPlacename,
    },
  }
}

export function generateStaticParams() {
  return ALL_SERVICE_AREA_SLUGS.map((slug) => ({ slug }))
}

const SERVICES = [
  'Wildlife Control & Removal',
  'Bed Bug Treatment',
  'Termite Inspection & Treatment',
  'Bat Removal Services',
  'Rodent Control',
  'Ant & Insect Control',
]

const SERVICE_LINKS = [
  { href: '/wildlife-control', label: 'Wildlife Control' },
  { href: '/bed-bugs', label: 'Bed Bug Treatment' },
  { href: '/termites', label: 'Termite Treatment' },
  { href: '/bat-removal', label: 'Bat Removal' },
]

// Color map for different regions
const regionColor = (slug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(slug)) {
    return 'hsl(207,73%,44%)'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(slug)) {
    return 'hsl(36,100%,47%)'
  }
  if (slug === 'wilmington-de') return 'red-600'
  return 'hsl(132,48%,35%)'
}

const bgCardColor = (slug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(slug)) {
    return 'bg-blue-50'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(slug)) {
    return 'bg-orange-50'
  }
  if (slug === 'wilmington-de') return 'bg-orange-50'
  return 'bg-emerald-50'
}

const heroGradient = (slug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(slug)) {
    return 'from-[hsl(207,73%,44%)] to-[hsl(207,73%,34%)]'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(slug)) {
    return 'from-[hsl(36,100%,47%)] to-[hsl(36,100%,37%)]'
  }
  if (slug === 'wilmington-de') return 'from-red-600 to-red-700'
  return 'from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]'
}

const heroAccent = (slug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(slug)) {
    return 'text-blue-100'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(slug)) {
    return 'text-orange-100'
  }
  if (slug === 'wilmington-de') return 'text-red-100'
  return 'text-green-100'
}

const nearbyBgCard = (areaSlug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(areaSlug)) {
    return 'bg-blue-50'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(areaSlug)) {
    return 'bg-orange-50'
  }
  if (areaSlug === 'wilmington-de') return 'bg-orange-50'
  return 'bg-emerald-50'
}

const nearbyAccentColor = (areaSlug: string): string => {
  if (['delaware-county-pa', 'chadds-ford-pa', 'glen-mills-pa'].includes(areaSlug)) {
    return 'bg-[hsl(207,73%,44%)]'
  }
  if (['montgomery-county-pa', 'king-of-prussia-pa', 'collegeville-pa', 'pottstown-pa', 'norristown-pa', 'malvern-pa'].includes(areaSlug)) {
    return 'bg-[hsl(36,100%,47%)]'
  }
  if (areaSlug === 'wilmington-de') return 'bg-red-600'
  return 'bg-[hsl(132,48%,35%)]'
}

export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params
  const data = SERVICE_AREA_DATA[slug]

  if (!data) {
    notFound()
  }

  const color = regionColor(slug)
  const bgCard = bgCardColor(slug)
  const gradient = heroGradient(slug)
  const accent = heroAccent(slug)
  const colorStyle = { color }

  // Build FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  // Build LocalBusiness schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Absolute Pest Services',
    telephone: data.phoneNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '21 Sheffield Dr',
      addressLocality: 'West Grove',
      addressRegion: data.state,
      postalCode: data.state === 'DE' ? '19711' : '19390',
      addressCountry: 'US',
    },
    url: `https://absolutepestservices.com/service-areas/${slug}`,
    areaServed: {
      '@type': 'Place',
      name: data.name,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, faqSchema]) }}
      />


      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${gradient} py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {data.h1}
          </h1>
          <p className={`text-xl ${accent} mb-8 max-w-3xl mx-auto`}>
            {data.heroSubtext}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:+1${data.phoneNumber.replace(/-/g, '')}`}
              className="inline-flex items-center bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
              style={{ color }}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {data.phoneDisplay}
            </a>
            <Link
              href="#request-service"
              className="inline-flex items-center bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)] rounded-md transition-colors"
            >
              Schedule Free Inspection
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Licensed & Insured</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 30+ Years Experience</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 5.0 Star Rated</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Same-Day Service</span>
          </div>
        </div>
      </section>

      {/* Cities Served */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cities We Serve in {data.name}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control services for homeowners and businesses{' '}
              across {data.name} and surrounding communities.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {data.cities.map((city, index) => (
              <div key={index} className={`${bgCard} rounded-lg border border-gray-100 hover:shadow-lg transition-shadow p-6 text-center`}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white"
                  style={{ backgroundColor: color }}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{city}</h3>
                <p className="text-sm text-gray-600 mt-1">{data.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pest Control Services in {data.name}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for your {data.name} property.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {SERVICES.map((service, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow p-6 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: color }}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {SERVICE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions About Pest Control in {data.name}
            </h2>
          </div>

          <div className="space-y-4">
            {data.faqs.map((faq, index) => (
              <div key={index} className="bg-[hsl(0,0%,98%)] rounded-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Service Areas */}
      {data.nearbyAreas.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nearby Service Areas — Pest Control Near {data.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We serve {data.name} and surrounding communities throughout the region.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.nearbyAreas.slice(0, 4).map((areaSlug) => {
                const areaData = SERVICE_AREA_DATA[areaSlug]
                if (!areaData) return null
                return (
                  <Link key={areaSlug} href={`/service-areas/${areaSlug}`}>
                    <div className={`${nearbyBgCard(areaSlug)} rounded-lg border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer p-5 flex items-center gap-3`}>
                      <div className={`w-9 h-9 ${nearbyAccentColor(areaSlug)} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{areaData.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/service-areas"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                View All Service Areas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Request Service */}
      <section id="request-service" className="py-16 bg-gradient-to-br from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Schedule Your Free Inspection in {data.name}
            </h2>
            <p className="text-green-100">
              Fill out the form below and we&apos;ll be in touch within 24 hours.
            </p>
          </div>
          <ServiceAreaForm phoneNumber={data.phoneNumber} />
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: color }}>
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-2xl font-bold" style={colorStyle}>
                <a href={`tel:+1${data.phoneNumber.replace(/-/g, '')}`}>{data.phoneDisplay}</a>
              </p>
              <p className="text-gray-600 mt-2">24/7 Emergency Service</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
              <p className="text-gray-600">Sat: 8:00 AM - 12:00 PM</p>
              <p className="text-gray-600">Sun: Emergency Only</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Main Office</h3>
              <p className="text-gray-600">21 Sheffield Dr</p>
              <p className="text-gray-600">West Grove, PA 19390</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
