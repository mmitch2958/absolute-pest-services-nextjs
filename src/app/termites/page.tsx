import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termite Control | Absolute Pest Services',
  description:
    'Protect your home from termites in PA & DE. Expert termite inspection, treatment & prevention. Free estimates. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/termites' },
}

export default function TermitesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-amber-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-amber-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Termites</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Termite Control</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Termites are the most destructive insect pest in the United States, causing an
            estimated $5 billion in property damage annually — damage that homeowners insurance
            typically doesn&rsquo;t cover.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <Link href="/termite-treatment" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg">
              View Treatment Options
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Termites in Pennsylvania & Delaware</h2>
              <p className="text-gray-700 mb-4">
                The Eastern subterranean termite (<em>Reticulitermes flavipes</em>) is the dominant
                species in PA and DE. These termites live in underground colonies, sometimes
                containing millions of individuals, and travel through mud tubes to reach the wood
                in your home.
              </p>
              <p className="text-gray-700 mb-4">
                Termites are active year-round in our area, though swarms (reproductive termites
                emerging to start new colonies) are most visible in spring. The damage they cause
                is entirely hidden inside wood — making professional inspection essential, since
                most homeowners never see active termites until damage is severe.
              </p>
              <p className="text-gray-700">
                The moist soils, mature trees, and older housing stock throughout Chester County,
                Delaware County, and northern Delaware make this region particularly susceptible to
                termite pressure.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Termite Control Services</h2>
              <div className="space-y-4">
                {[
                  { title: 'Free Termite Inspection', desc: 'Comprehensive inspection of your home\'s foundation, crawl space, attic, and all wood-to-soil contact areas.' },
                  { title: 'Termidor® Liquid Barrier Treatment', desc: 'Gold standard for active infestations. Creates a non-repellent barrier termites pass through, eliminating the colony.' },
                  { title: 'Bait Station Monitoring', desc: 'Sentricon or similar systems for ongoing protection and early detection.' },
                  { title: 'Treatment Documentation', desc: 'We provide full documentation for real estate transactions and warranty purposes.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{item.title}</span>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/termite-treatment" className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold px-6 py-3 rounded-lg">
                  View Full Treatment Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
