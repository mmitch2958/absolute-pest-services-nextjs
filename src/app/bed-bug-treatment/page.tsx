import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bed Bug Treatment | Absolute Pest Services',
  description:
    'Professional bed bug extermination in PA & DE. Heat treatment and chemical treatment options. We eliminate all life stages. Licensed & insured. Call 484-643-2225.',
  alternates: {
    canonical: 'https://absolutepestservices.com/bed-bug-treatment',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do you treat bed bugs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use both heat treatment and chemical treatment approaches depending on the infestation level and property type. Heat treatment is the most thorough — it kills all life stages including eggs in a single treatment.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many treatments are needed to eliminate bed bugs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Heat treatment typically eliminates bed bugs in a single treatment. Chemical treatment programs usually require 2-3 visits spaced 2 weeks apart to break the egg cycle.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I prepare for bed bug treatment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide a detailed preparation checklist after booking. Generally, you\'ll need to wash and bag bedding and clothing, clear clutter from floors, and vacate the property for several hours during treatment.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I know if I have bed bugs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Signs include small rusty-red blood stains on sheets, dark fecal spots on mattress seams, shed skins, a musty odor, and of course visible bugs (about the size of an apple seed). Bites alone are not a reliable indicator.',
      },
    },
  ],
}

export default function BedBugTreatmentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-red-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Bed Bug Treatment</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Bed Bug Treatment</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Complete bed bug elimination for homes and apartments in PA & DE. We use proven heat
            and chemical treatment methods to eliminate all life stages — eggs, nymphs, and adults.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />
              Call 484-643-2225
            </a>
            <Link href="/request-service" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Request Service Online
            </Link>
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Bed Bug Treatment Methods</h2>
          <p className="text-lg text-gray-600 mb-10">
            We offer two proven treatment approaches. Our technicians will recommend the right method
            based on your infestation level, property type, and budget.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-700 text-white rounded-xl flex items-center justify-center text-2xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Heat Treatment</h3>
              <p className="text-gray-700 mb-4">
                We raise the temperature throughout the treatment area to 120°F+, which kills all
                bed bug life stages — including eggs — in a single treatment. Most effective for
                heavily infested homes.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Kills 100% of all life stages', 'No chemical residue', 'Single treatment in most cases', 'No need to discard furniture'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-700 text-white rounded-xl flex items-center justify-center text-2xl mb-4">🧪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chemical Treatment</h3>
              <p className="text-gray-700 mb-4">
                We apply EPA-registered insecticides to all harboring areas with a residual effect
                that continues working for weeks. Best for lower-level infestations or as a
                follow-up to heat treatment.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Lower cost than heat treatment', '2-3 visit program', 'Targeted application', 'Residual protection'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Signs of Bed Bugs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Signs You Have Bed Bugs</h2>
              <div className="space-y-4 text-gray-700">
                {[
                  { title: 'Blood stains on sheets', desc: 'Small rusty-red spots from crushed bugs or feeding.' },
                  { title: 'Dark fecal spots', desc: 'Tiny dark dots on mattress seams, headboards, and baseboards.' },
                  { title: 'Shed skins', desc: 'Translucent shells from molting nymphs.' },
                  { title: 'Musty odor', desc: 'Heavy infestations produce a characteristic sweet-musty smell.' },
                  { title: 'Visible bugs', desc: 'Apple-seed sized, reddish-brown insects in seams and crevices.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div><span className="font-semibold">{item.title}</span> — {item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Suspect Bed Bugs? Act Fast.</h3>
              <p className="text-gray-600 mb-6">
                Bed bug populations double every 16 days. A small problem becomes a severe infestation
                quickly. Call us for a free inspection — the sooner we treat, the easier and more
                affordable it is.
              </p>
              <a href="tel:484-643-2225" className="flex items-center gap-3 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center mb-3">
                <Phone size={20} />
                484-643-2225
              </a>
              <Link href="/cost-calculator" className="flex justify-center text-gray-600 hover:text-gray-900 text-sm">
                Estimate your treatment cost →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{faq.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
