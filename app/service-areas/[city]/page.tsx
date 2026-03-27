import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import { ALL_CITIES, CITY_SERVICES, getCityBySlug, DETAILED_CITY_CONTENT } from '@/lib/city-data'

// ISR: regenerate every 7 days
export const revalidate = 604800

// Generate all 25 city pages at build time
export async function generateStaticParams() {
  return ALL_CITIES.map((city) => ({
    city: city.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)

  if (!city) return {}

  return {
    title: `Pest Control in ${city.name}, ${city.state} | Absolute Pest Services`,
    description: `Professional pest control in ${city.name}, ${city.state}. ${city.county ? `Serving all of ${city.county}. ` : ''}Wildlife removal, bed bug treatment, termite control & more. Same-day service available. Call 484-643-2225.`,
    alternates: {
      canonical: `https://absolutepestservices.com/service-areas/${citySlug}`,
    },
    openGraph: {
      url: `https://absolutepestservices.com/service-areas/${citySlug}`,
      title: `Pest Control in ${city.name}, ${city.state} | Absolute Pest Services`,
    },
  }
}

export default async function CityServiceAreaPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)

  if (!city) notFound()

  // JSON-LD Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://absolutepestservices.com/service-areas/${citySlug}`,
    name: 'Absolute Pest Services',
    telephone: '484-643-2225',
    areaServed: {
      '@type': 'City',
      name: city.name,
      addressRegion: city.state,
      addressCountry: 'US',
    },
    url: `https://absolutepestservices.com/service-areas/${citySlug}`,
  }

  // Check if we have Lando's detailed content for this city
  const detailedContent = DETAILED_CITY_CONTENT[city.slug] ?? {}
  const hasPestControlContent = !!detailedContent['pest-control']

  // Nearby city suggestions (pick 4 other cities from same state)
  const nearbyCities = ALL_CITIES.filter(
    (c) => c.state === city.state && c.slug !== city.slug
  ).slice(0, 4)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/service-areas" className="hover:text-white">Service Areas</Link>
            <span className="mx-2">/</span>
            <span>{city.name}, {city.state}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pest Control in {city.name}, {city.state}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Absolute Pest Services provides professional pest control to {city.name}
            {city.county ? ` and all of ${city.county}` : ''}.{' '}
            Wildlife removal, bed bug treatment, termite control, and comprehensive pest services —
            all licensed and insured. Call us for same-day service.
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

      {/* Local Content (from Lando's research) or Generated Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {hasPestControlContent ? (
                /* Use Lando's detailed content */
                <div className="prose max-w-none text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Pest Control in {city.name}, {city.state}
                  </h2>
                  {detailedContent['pest-control']?.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('**')) {
                      const title = paragraph.replace(/\*\*/g, '').replace(/^### /, '')
                      return <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{title}</h3>
                    }
                    return (
                      <p key={i} className="mb-4 leading-relaxed">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    )
                  })}
                </div>
              ) : (
                /* Generated content for cities without Lando's research */
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Professional Pest Control in {city.name}, {city.state}
                  </h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Absolute Pest Services is proud to serve {city.name}
                    {city.county ? ` and all of ${city.county}` : ` in ${city.state}`}.
                    Our licensed and insured technicians provide comprehensive pest control,
                    wildlife removal, termite treatment, and bed bug services for homes and
                    businesses throughout the area.
                  </p>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    We understand the specific pest pressures that affect {city.name} properties.
                    Our treatments are customized to your property&rsquo;s layout, your specific
                    pest problem, and your family&rsquo;s needs — including households with
                    children and pets.
                  </p>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Whether you&rsquo;re dealing with a wildlife intrusion, a bed bug infestation,
                    termite damage, or a routine pest problem, we&rsquo;re here to help.
                    Call <a href="tel:484-643-2225" className="text-green-700 font-semibold">484-643-2225</a> for
                    a free estimate or same-day service when available.
                  </p>
                </div>
              )}

              {/* Services offered in this city */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                Pest Control Services in {city.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { href: '/wildlife-control', title: 'Wildlife Control', desc: 'Raccoon, squirrel, groundhog, opossum & skunk removal. Humane live trapping and exclusion.' },
                  { href: '/bat-removal', title: 'Bat Removal', desc: 'Licensed bat exclusion following PA & DE seasonal regulations.' },
                  { href: '/bed-bug-treatment', title: 'Bed Bug Treatment', desc: 'Heat and chemical treatment options. Free inspection. All life stages eliminated.' },
                  { href: '/termite-treatment', title: 'Termite Treatment', desc: 'Termidor® liquid treatment and bait station monitoring. Free termite inspection.' },
                  { href: '/rodents', title: 'Rodent Control', desc: 'Mice and rat elimination with exclusion. Seal entry points permanently.' },
                ].map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="p-5 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl transition-all group"
                  >
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600">{service.desc}</p>
                  </Link>
                ))}
              </div>

              {/* City×service cross-links if available */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
                Specific Services in {city.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CITY_SERVICES.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/city-services/${service.slug}-${city.cityServiceSlug}`}
                    className="p-3 bg-green-50 border border-green-100 rounded-lg text-center text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100 sticky top-20">
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                  Get Service in {city.name}
                </h3>
                <div className="space-y-3 mb-6">
                  {[
                    'Licensed & insured in PA & DE',
                    'Same-day service available',
                    'Free estimates',
                    '24/7 emergency response',
                    'Family & pet safe treatments',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <a
                  href="tel:484-643-2225"
                  className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-4 rounded-xl w-full justify-center mb-3"
                >
                  <Phone size={18} />
                  484-643-2225
                </a>
                <Link
                  href="/request-service"
                  className="flex items-center gap-2 justify-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-3 rounded-xl w-full"
                >
                  Request Service Online
                </Link>
              </div>

              {/* Nearby cities */}
              {nearbyCities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 mb-3">Nearby Service Areas</h3>
                  <div className="space-y-2">
                    {nearbyCities.map((nearbyCity) => (
                      <Link
                        key={nearbyCity.slug}
                        href={`/service-areas/${nearbyCity.slug}`}
                        className="block text-sm text-green-700 hover:text-green-800 hover:underline"
                      >
                        Pest Control in {nearbyCity.name}, {nearbyCity.state}
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
