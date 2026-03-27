import type { Metadata } from 'next'
import Link from 'next/link'
import { PA_CITIES, DE_CITIES } from '@/lib/city-data'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pest Control Service Areas — PA & DE | Absolute Pest Services',
  description:
    'Absolute Pest Services serves 25+ cities in Pennsylvania and Delaware. Find pest control, wildlife removal, termite treatment & bed bug services near you.',
  alternates: {
    canonical: 'https://absolutepestservices.com/service-areas',
  },
  openGraph: {
    url: 'https://absolutepestservices.com/service-areas',
    title: 'Pest Control Service Areas — PA & DE | Absolute Pest Services',
  },
}

export default function ServiceAreasPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Service Areas</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pest Control Service Areas
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Absolute Pest Services provides pest control, wildlife removal, termite treatment, and
            bed bug services throughout southeastern Pennsylvania and Delaware. Find your city below.
          </p>
          <a
            href="tel:484-643-2225"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg"
          >
            <Phone size={18} />
            Call 484-643-2225
          </a>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pennsylvania */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pennsylvania Service Areas
            </h2>
            <p className="text-gray-600 mb-6">
              Serving Chester County, Delaware County, and Montgomery County, PA.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {PA_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/service-areas/${city.slug}`}
                  className="group p-4 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl text-center transition-all"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 text-sm">
                    {city.name}
                  </div>
                  {city.county && (
                    <div className="text-xs text-gray-500 mt-1">{city.county}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Delaware */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Delaware Service Areas
            </h2>
            <p className="text-gray-600 mb-6">
              Serving New Castle County and surrounding areas in Delaware.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {DE_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/service-areas/${city.slug}`}
                  className="group p-4 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl text-center transition-all"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 text-sm">
                    {city.name}
                  </div>
                  {city.county && (
                    <div className="text-xs text-gray-500 mt-1">{city.county}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Services offered */}
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Services Available Throughout Our Area
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: '/wildlife-control', label: 'Wildlife Control' },
                { href: '/bed-bug-treatment', label: 'Bed Bug Treatment' },
                { href: '/termite-treatment', label: 'Termite Treatment' },
                { href: '/bat-removal', label: 'Bat Removal' },
                { href: '/rodents', label: 'Rodent Control' },
                { href: '/termites', label: 'Termite Inspection' },
                { href: '/cost-calculator', label: 'Cost Estimator' },
                { href: '/request-service', label: 'Request Service' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3 bg-white rounded-lg border border-green-200 text-center text-sm font-medium text-gray-700 hover:text-green-700 hover:border-green-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Don&rsquo;t See Your City?</h2>
          <p className="text-gray-300 mb-6">
            We may still serve your area. Call us to confirm — our service territory is expanding.
          </p>
          <a
            href="tel:484-643-2225"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-xl"
          >
            <Phone size={20} />
            484-643-2225
          </a>
        </div>
      </section>
    </>
  )
}
