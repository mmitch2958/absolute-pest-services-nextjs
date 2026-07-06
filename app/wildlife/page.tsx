import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import SchemaMarkup from '@/components/analytics/SchemaMarkup'
import ConversionCard from '@/components/forms/ConversionCard'

const faqs = [
  {
    q: 'What wildlife species do you remove in PA and DE?',
    a: 'We handle raccoons, squirrels, groundhogs, opossums, skunks, foxes, and bats. Each species requires a different approach — our licensed technicians assess the animal and use the most effective, humane method for your situation.',
  },
  {
    q: 'Do you kill the animals or relocate them?',
    a: 'We prioritize live trapping and relocation wherever safe and legal. For some species, relocation is not permitted or is ecologically irresponsible (e.g., pregnant raccoons). We always follow PA and DE wildlife regulations and explain our approach before any work begins.',
  },
  {
    q: 'How much does wildlife removal cost?',
    a: 'Costs vary based on species, location of the animal (attic, chimney, under deck), and the extent of exclusion needed. Initial inspection is free. A typical wildlife exclusion job runs $250–$600 depending on complexity. We provide a written estimate before any work begins.',
  },
  {
    q: 'Will wildlife come back after you remove them?',
    a: 'Without exclusion, yes — other animals will find the same entry points. We don\'t just remove the animal; we identify and seal all entry points to prevent future wildlife intrusions. That\'s what makes our service a permanent solution.',
  },
  {
    q: 'Are you licensed for bat exclusion?',
    a: 'Yes. Bat exclusion requires a special license in both Pennsylvania and Delaware due to bat protection laws. We are fully licensed for bat work and strictly follow the seasonal windows (August–October and April–May) required by law.',
  },
]

export const metadata: Metadata = {
  title: 'Wildlife Services | Absolute Pest Services',
  description:
    'Full-service wildlife management in PA & DE. Removal, exclusion & prevention for raccoons, squirrels, bats, groundhogs & more. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/wildlife' },
}

export default function WildlifePage() {
  return (
    <>
      <SchemaMarkup
        serviceName="Wildlife Control"
        serviceType="Wildlife Management"
        description="Full-service wildlife management in PA & DE. Humane removal, exclusion & prevention for raccoons, squirrels, bats, groundhogs & more."
        url="https://absolutepestservices.com/wildlife"
        faqs={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Wildlife Services</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Wildlife Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Southeastern Pennsylvania and Delaware sit at the intersection of suburban development
            and rich natural habitat. When wildlife and homeowners collide, we provide effective,
            humane solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Get Free Estimate ���
            </a>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-green-50 border-b border-green-100 py-12 sm:py-16"
        aria-labelledby="wildlife-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🚨 Wildlife in your home reproduces fast — act now
              </div>
              <h2
                id="wildlife-form-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Get a Free Wildlife Inspection<br />
                <span className="text-green-700">Today — No Commitment</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Tell us what you’re dealing with and we’ll send a licensed technician
                to assess your situation — free, with no pressure.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Response within 1–2 business hours',
                  'Licensed & insured in PA & DE',
                  'Free estimate, no commitment required',
                  'Same-day service available',
                  '5.0 ⭐ rated by 500+ customers',
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
                heading="Get a Free Wildlife Inspection"
                defaultService="wildlife-control"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Our Wildlife Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Raccoon Removal', desc: 'Raccoons are the #1 wildlife call we receive. Attic invasions, chimney dens, garbage raiding. We provide live trapping and exclusion.' },
              { title: 'Squirrel Exclusion', desc: 'Squirrels are persistent and can cause serious damage chewing through soffits and wiring. Exclusion with entry-point sealing is the permanent solution.' },
              { title: 'Groundhog Trapping', desc: 'Foundation burrowing, garden destruction, and structural damage. We live-trap and relocate groundhogs away from your property.' },
              { title: 'Bat Exclusion', desc: 'Licensed bat exclusion following strict PA & DE seasonal regulations. We never kill bats — only humane exclusion.' },
              { title: 'Skunk Removal', desc: 'Skunks den under porches, decks, and sheds. We carefully trap and relocate them without triggering a spray.' },
              { title: 'Opossum Control', desc: 'Opossums in crawl spaces, under decks, and in garages. Live trapping and exclusion.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/wildlife-control" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-lg">
              Full Wildlife Control Service Details →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Southeastern PA &amp; DE Homeowners Call Us for Wildlife
              </h2>
              <p className="text-gray-700 mb-4">
                Suburban sprawl in Chester County, Delaware County, and northern Delaware pushes
                wildlife into closer contact with homes than ever before. A raccoon family in your
                attic can cause thousands of dollars in damage — chewed wiring, torn insulation,
                and contaminated areas with urine and droppings.
              </p>
              <p className="text-gray-700 mb-4">
                We combine live trapping (where appropriate), licensed bat exclusion, and
                professional-grade exclusion to give homeowners permanent solutions. We never use
                poisons for wildlife, and we always clean and sanitize contaminated areas.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                {[
                  'Free wildlife inspection and written estimate',
                  'Licensed wildlife control operators (PA & DE)',
                  'Full exclusion — we seal entry points permanently',
                  'Guano and contamination cleanup included',
                  'Follow-up inspection after exclusion',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <a
                href="#contact-form"
                className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center mb-4"
              >
                <Phone size={20} />
                Get Free Quote ↓
              </a>
              <p className="text-center text-xs text-gray-500">
                Free quote · Same-day available in most areas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions — Wildlife Control
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
