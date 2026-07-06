import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import SchemaMarkup from '@/components/analytics/SchemaMarkup'
import ConversionCard from '@/components/forms/ConversionCard'

const faqs = [
  {
    q: 'How do I know if I have bed bugs?',
    a: 'Signs include small rusty-red blood stains on sheets, dark fecal spots on mattress seams, shed skins, a musty odor in severe cases, and of course visible bugs (about the size of an apple seed). Bites alone are not reliable — they can look like mosquito bites. If you travel frequently or recently moved into a new home, get a professional inspection.',
  },
  {
    q: 'Do I need to throw away my mattress if I have bed bugs?',
    a: 'No. Professional heat or chemical treatment eliminates bed bugs from mattresses and box springs without disposal. Throwing away furniture can actually spread the infestation. We treat and encase mattresses in bed bug-proof covers as part of our protocol.',
  },
  {
    q: 'Heat treatment vs. chemical treatment — which is better?',
    a: 'Heat treatment is faster (one day) and kills all life stages in a single visit. Chemical treatment costs less but requires 2–3 follow-up visits over 4–6 weeks to break the egg cycle. We recommend heat treatment for severe infestations or when fast results are needed.',
  },
  {
    q: 'How do I prepare for bed bug treatment?',
    a: 'We provide a detailed preparation checklist after booking. General steps include: wash and bag all bedding and clothing in hot water, declutter floors and under beds, disassemble beds, and vacuum thoroughly. You\'ll need to vacate the property during treatment (typically 4–8 hours for heat, 1–2 hours for chemical).',
  },
  {
    q: 'Can I treat bed bugs myself with over-the-counter products?',
    a: 'DIY bed bug treatment rarely works and often makes the problem worse by spreading bugs to additional rooms. Over-the-counter sprays do not kill bed bug eggs and can cause bugs to scatter and hide deeper in walls. Professional treatment is the only reliable solution.',
  },
]

export const metadata: Metadata = {
  title: 'Bed Bug Control | Absolute Pest Services',
  description:
    'Identify & eliminate bed bugs in PA & DE. Expert heat and chemical treatment. Free quotes. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/bed-bugs' },
}

export default function BedBugsPage() {
  return (
    <>
      <SchemaMarkup
        serviceName="Bed Bug Treatment"
        serviceType="Pest Control"
        description="Professional bed bug elimination in PA & DE. Heat treatment and chemical treatment for homes and businesses."
        url="https://absolutepestservices.com/bed-bugs"
        faqs={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-red-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Bed Bugs</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Bed Bug Control</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Bed bug infestations are stressful and fast-growing. Our licensed technicians eliminate
            bed bugs completely using proven heat and chemical treatment methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Get Free Quote ↓
            </a>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-green-50 border-b border-green-100 py-12 sm:py-16"
        aria-labelledby="bed-bugs-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🚨 Bed bugs spread to every room — don’t wait
              </div>
              <h2
                id="bed-bugs-form-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Get a Free Bed Bug Quote<br />
                <span className="text-green-700">Today — No Commitment</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Bed bugs double in population every 16 days. Act now — the sooner we treat,
                the easier and more affordable it is.
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
                heading="Free Bed Bug Quote"
                defaultService="bed-bug-treatment"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Bed Bugs</h2>
              <p className="text-gray-700 mb-4">
                Bed bugs (<em>Cimex lectularius</em>) are small, oval, reddish-brown insects that
                feed exclusively on blood. They don&rsquo;t fly, but move quickly across floors,
                walls, and ceilings. Females deposit up to 5 eggs per day in tight cracks and
                crevices — making early treatment critical.
              </p>
              <p className="text-gray-700 mb-4">
                Despite their name, bed bugs are found in more than just beds. They hide in sofas,
                luggage, clothing, electrical outlets, and behind baseboards. They spread easily
                between hotel rooms, apartments, and homes.
              </p>
              <p className="text-gray-700">
                The population in the US has resurged dramatically since the 1990s. Pennsylvania
                cities including Philadelphia, Pittsburgh, and surrounding suburbs consistently
                rank among the most affected in national surveys.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Bed Bug Services</h2>
              <div className="space-y-4">
                {[
                  { title: 'Free Quote', desc: 'We thoroughly inspect mattresses, furniture, walls, and all harboring areas.' },
                  { title: 'Heat Treatment', desc: 'Most effective option. Kills all life stages in a single treatment. No chemical residue.' },
                  { title: 'Chemical Treatment', desc: '2-3 visit program using EPA-registered insecticides with residual protection.' },
                  { title: 'Follow-Up Monitoring', desc: 'We schedule follow-up visits to ensure complete elimination.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{item.title}</span>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/bed-bug-treatment" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-lg">
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
            Frequently Asked Questions — Bed Bug Treatment
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
