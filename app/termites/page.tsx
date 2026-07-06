import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import SchemaMarkup from '@/components/analytics/SchemaMarkup'
import ConversionCard from '@/components/forms/ConversionCard'

const faqs = [
  {
    q: 'How do I know if I have termites?',
    a: 'Termites are rarely seen — the damage is hidden inside wood. Signs include mud tubes on foundation walls, wood that sounds hollow when tapped, discarded wings near windowsills, and small holes in drywall. If you have any of these signs, schedule a free quote immediately.',
  },
  {
    q: 'Does homeowners insurance cover termite damage?',
    a: 'Almost never. Standard homeowners policies exclude termite damage. This is why prevention and early detection through annual inspections are so valuable — the cost of treatment is a fraction of what repairs can cost.',
  },
  {
    q: 'What is Termidor and how does it work?',
    a: 'Termidor is the gold standard for subterranean termite control. It\'s a non-repellent liquid insecticide that termites cannot detect, so they pass through it unknowingly and carry the active ingredient back to the colony, eventually eliminating the entire population. It has an efficacy rate of 100% when properly applied.',
  },
  {
    q: 'How long does a termite treatment take?',
    a: 'A typical liquid barrier treatment for a single-family home takes 2–4 hours. The trenching and drilling around the foundation perimeter is completed in one day. The treatment cures within 24–48 hours and provides immediate protection.',
  },
  {
    q: 'Do you offer termite warranty or protection plans?',
    a: 'Yes. We offer annual termite monitoring plans that include bait station servicing, annual inspections, and re-treatment guarantees if activity recurs. For real estate transactions, we provide Wood Infestation Reports (WDI) and documentation accepted by most lenders.',
  },
]

export const metadata: Metadata = {
  title: 'Termite Control | Absolute Pest Services',
  description:
    'Protect your home from termites in PA & DE. Expert termite inspection, treatment & prevention. Free estimates. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/termites' },
}

export default function TermitesPage() {
  return (
    <>
      <SchemaMarkup
        serviceName="Termite Control"
        serviceType="Pest Control"
        description="Expert termite inspection, treatment & prevention in PA & DE. Termidor liquid barriers and bait station monitoring."
        url="https://absolutepestservices.com/termites"
        faqs={faqs}
      />

      {/* Hero */}
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
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Free Termite Quote ↓
            </a>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-green-50 border-b border-green-100 py-12 sm:py-16"
        aria-labelledby="termites-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🚨 Every day termites stay is more damage
              </div>
              <h2
                id="termites-form-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Get a Free Termite Quote<br />
                <span className="text-green-700">Today — No Commitment</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Termites silently destroy your home from the inside. A free quote tells you
                exactly what you’re dealing with — and what it costs to fix it.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Response within 1–2 business hours',
                  'Licensed & insured in PA & DE',
                  'Free estimate, no commitment required',
                  'Same-day service available',
                  '5.0 ⭐ rated by 40+ customers',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Prefer to call?</p>
                <a
                  href="tel:484-643-2225"
                  className="text-2xl font-bold text-green-700 hover:text-green-800 flex items-center gap-2"
                >
                  <Phone size={22} />
                  484-643-2225
                </a>
                <p className="text-xs text-gray-400 mt-1">Mon–Fri 7am–6pm · Sat 8am–4pm · 24/7 emergency</p>
              </div>
            </div>
            <div>
              <ConversionCard
                heading="Free Termite Quote"
                defaultService="termite-treatment"
              />
            </div>
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
                  { title: 'Free Termite Quote', desc: 'Comprehensive inspection of your home\'s foundation, crawl space, attic, and all wood-to-soil contact areas.' },
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

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions — Termite Control
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-gray-900 text-base hover:bg-gray-100 transition-colors">
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
        </div>
      </section>
    </>
  )
}
