import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone } from 'lucide-react'
import SchemaMarkup from '@/components/analytics/SchemaMarkup'
import ConversionCard from '@/components/forms/ConversionCard'

const faqs = [
  {
    q: 'How do I know if I have mice or rats?',
    a: 'Signs include droppings near food and along walls, gnaw marks on packaging or wiring, scratching sounds in walls at night, nesting materials, and grease marks along baseboards. A mouse can fit through a gap the size of a dime; a rat needs only a quarter-inch gap.',
  },
  {
    q: 'Will one treatment eliminate my rodent problem?',
    a: 'Rarely. Effective rodent control requires a 3-step process: elimination of the existing population (trapping and baiting), exclusion to seal all entry points, and sanitation to remove food sources. We typically complete this over 2–4 visits and guarantee our exclusion work.',
  },
  {
    q: 'Is rodent bait safe around children and pets?',
    a: 'We use bait stations that are locked and secured inside tamper-resistant enclosures. These are placed in areas inaccessible to children and pets. We also offer trap-only programs for clients who prefer no rodenticides. We discuss all options and safety measures before treatment.',
  },
  {
    q: 'What is the cost of rodent control?',
    a: 'A typical rodent control program ranges from $200–$500 for initial treatment and exclusion, depending on the size of the home and the severity of the infestation. We provide a free quote and written estimate before any work begins.',
  },
  {
    q: 'How do you seal my home against rodents?',
    a: 'We inspect and seal every potential entry point using a combination of steel wool, caulk, hardware cloth, and expanding foam. We focus on the foundation, gaps around pipes and vents, soffit vents, and any gaps where utility lines enter the building.',
  },
]

export const metadata: Metadata = {
  title: 'Rodent Control | Absolute Pest Services',
  description:
    'Mice, rats & rodent removal in PA & DE. Fast, effective rodent control and exclusion for homes and businesses. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/rodents' },
}

export default function RodentsPage() {
  return (
    <>
      <SchemaMarkup
        serviceName="Rodent Control"
        serviceType="Pest Control"
        description="Mice, rats & rodent removal in PA & DE. Fast, effective rodent control and exclusion for homes and businesses."
        url="https://absolutepestservices.com/rodents"
        faqs={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a332b] to-[#203d34] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-[#8b978f] mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Rodent Control</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Rodent Control</h1>
          <p className="text-xl text-[#c7d0cb] max-w-2xl mb-8">
            Mice and rats pose serious health and property risks. Our rodent control program
            eliminates active infestations and seals entry points to keep rodents out permanently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-[#58665e] hover:bg-[#6b7b72] text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-white hover:bg-[#f7f6f0] text-[#173f35] border-2 border-[#173f35] font-bold px-6 py-3 rounded-lg">
              Request Service ↓
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#203d34] mb-10">Our Rodent Control Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Inspection & Assessment', desc: 'We locate entry points, nesting sites, and runways. Understanding how rodents are entering is essential to eliminating them.' },
              { title: 'Treatment & Elimination', desc: 'We use a combination of trapping and rodenticide bait stations to quickly reduce the active population.' },
              { title: 'Exclusion & Prevention', desc: 'We seal all entry points with steel wool, hardware cloth, and caulk. A rat can enter through a gap the size of a quarter.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-[#f7f6f0] rounded-xl border border-[#e9eddf]">
                <h3 className="font-bold text-[#203d34] mb-3">{item.title}</h3>
                <p className="text-[#58665e] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f7f6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#203d34] mb-6">Signs of a Rodent Infestation</h2>
              <div className="space-y-3">
                {[
                  'Droppings near food, in drawers, or along walls',
                  'Gnaw marks on food packaging, wires, or wood',
                  'Nesting materials (shredded paper, fabric, plant matter)',
                  'Scratching sounds in walls or ceiling at night',
                  'Grease marks or rub marks along baseboards',
                  'Tracks or footprints in dusty areas',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#66845d] mt-0.5 flex-shrink-0" />
                    <span className="text-[#3f5049] text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e9eddf]">
              <h3 className="font-bold text-[#203d34] text-xl mb-4">Why Rodent Control Matters</h3>
              <p className="text-[#58665e] mb-4 text-sm">Rodents are not just a nuisance — they&rsquo;re a health risk and a property risk:</p>
              <ul className="space-y-2 text-sm text-[#3f5049] mb-6">
                {[
                  'Carry diseases including hantavirus, salmonella, and leptospirosis',
                  'Chew electrical wiring, causing fire hazards',
                  'Contaminate food and food prep surfaces',
                  'Reproduce rapidly — one pair becomes 1,000+ in a year',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#contact-form" className="flex items-center gap-3 bg-[#1a332b] hover:bg-[#203d34] text-white font-bold px-6 py-4 rounded-xl w-full justify-center">
                <Phone size={20} />
                Request Free Quote ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-[#eef1e7] border-b border-[#e9eddf] py-12 sm:py-16"
        aria-labelledby="rodents-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <h2
                id="rodents-form-heading"
                className="text-3xl sm:text-4xl font-bold text-[#203d34] mb-4 leading-tight"
              >
                Get a Free Rodent Quote<br />
                <span className="text-[#173f35]">Same-Day Service Available</span>
              </h2>
              <p className="text-[#58665e] text-lg mb-6 leading-relaxed">
                Rodents reproduce fast — one pair can become 1,000+ in a year. Act now before
                your problem gets worse.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Response within 1–2 business hours',
                  'Licensed & insured in PA & DE',
                  'Free estimate, no commitment required',
                  'Same-day service available',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[#3f5049]">
                    <span className="w-5 h-5 bg-[#66845d] rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ConversionCard
                heading="Get a Free Rodent Quote"
                defaultService="rodent-control"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-[#e9eddf]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#203d34] mb-8 text-center">
            Frequently Asked Questions — Rodent Control
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#f7f6f0] border border-[#e1e5dc] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-[#203d34] text-base hover:bg-[#e9eddf] transition-colors">
                  <span>{faq.q}</span>
                  <span className="flex-shrink-0 text-[#173f35] group-open:rotate-180 transition-transform">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-[#3f5049] text-sm leading-relaxed border-t border-[#e9eddf] pt-4">
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
