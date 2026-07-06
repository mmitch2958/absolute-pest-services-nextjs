import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone } from 'lucide-react'
import ConversionCard from '@/components/forms/ConversionCard'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Professional Bat Removal & Exclusion Services | Absolute Pest Services PA & DE',
    description:
      'Safe, humane bat removal in PA & DE. One-way exclusion devices, guano cleanup & permanent sealing. Licensed bat exclusion specialists. Call 484-643-2225 for inspection.',
    keywords: [
      'bat removal',
      'bat exclusion',
      'bat control',
      'humane bat removal',
      'bat guano cleanup',
      'bat removal PA',
      'bat removal Delaware',
      'Chester County bat removal',
      'wildlife control',
      'pest control',
    ],
    alternates: {
      canonical: 'https://absolutepestservices.com/bat-removal',
    },
    openGraph: {
      title: 'Professional Bat Removal & Exclusion Services | Absolute Pest Services',
      description:
        'Safe, humane bat removal in PA & DE. One-way exclusion devices, guano cleanup & permanent sealing. Licensed specialists.',
      url: 'https://absolutepestservices.com/bat-removal',
      type: 'website',
      images: [
        {
          url: 'https://absolutepestservices.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Absolute Pest Services - Bat Removal',
        },
      ],
    },
    other: {
      'geo.region': 'US-PA',
      'geo.placename': 'Southeastern Pennsylvania',
    },
  }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can you just kill the bats?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — killing bats is illegal in Pennsylvania and Delaware. Bats are protected under state and federal law. The correct method is exclusion: we install one-way devices that allow bats to exit but not re-enter, then seal the entry points once all bats have left.',
      },
    },
    {
      '@type': 'Question',
      name: 'When is the best time for bat exclusion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bat exclusion should only be performed during two windows: August 1 – October 31, or April 1 – May 14. During summer (mid-May through July), flightless pups are present and exclusion would trap them inside. We will not perform exclusion during the off-limits season.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do bats get into my house?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bats can squeeze through gaps as small as 3/8 inch. Common entry points include gaps where the chimney meets siding, loose flashing, open ridge vents, deteriorated soffits, and gaps around utility pipes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is bat guano dangerous?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Bat guano can harbor Histoplasma capsulatum fungus spores, which cause histoplasmosis when inhaled. Large guano accumulations should be remediated by professionals wearing proper respiratory protection. We offer guano clean-up as part of our bat removal service.',
      },
    },
  ],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  url: 'https://absolutepestservices.com/bat-removal',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '21 Sheffield Dr',
    addressLocality: 'West Grove',
    addressRegion: 'PA',
    postalCode: '19390',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'State', name: 'Pennsylvania' },
    { '@type': 'State', name: 'Delaware' },
  ],
  priceRange: '$$',
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Bat Removal',
  provider: { '@type': 'LocalBusiness', name: 'Absolute Pest Services' },
  areaServed: 'Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE',
  serviceType: 'Pest Control',
  url: 'https://absolutepestservices.com/bat-removal',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Bat Removal', item: 'https://absolutepestservices.com/bat-removal' },
  ],
}

export default function BatRemovalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="bg-gradient-to-br from-purple-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-purple-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Bat Removal</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Bat Removal Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Licensed bat exclusion for homes and businesses in PA & DE. We follow all state
            wildlife regulations, using only humane exclusion methods to safely remove bat colonies
            from your property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />
              Call 484-643-2225
            </a>
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Get Free Estimate ↓
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-purple-50 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 border border-purple-200 flex gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="font-bold text-gray-900 mb-2">Important: Bat Exclusion Seasons</h2>
              <p className="text-gray-700">
                Bat exclusion is ONLY legal during specific windows in PA & DE: <strong>August 1 – October 31</strong> and{' '}
                <strong>April 1 – May 14</strong>. Performing exclusion during summer (when pups cannot fly) traps
                babies inside and is illegal. We strictly follow these regulations and will schedule your exclusion
                during the appropriate window.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Bat Exclusion Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Inspection', desc: 'We identify all bat entry points, assess colony size, and check for guano accumulation.' },
              { step: '2', title: 'Schedule', desc: 'We schedule exclusion during the appropriate legal window for your area.' },
              { step: '3', title: 'Exclusion Devices', desc: 'One-way exclusion tubes and netting are installed at all entry points.' },
              { step: '4', title: 'Monitoring', desc: 'We monitor to confirm all bats have exited (typically 3-7 days).' },
              { step: '5', title: 'Seal & Clean', desc: 'All entry points are permanently sealed and guano is safely remediated.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-purple-700 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Signs of Bats in Your Home</h2>
              <div className="space-y-4">
                {[
                  { title: 'Scratching sounds at night', desc: 'Especially around dusk and dawn when bats are most active.' },
                  { title: 'Guano accumulation', desc: 'Dark, pellet-like droppings that crumble to powder. Often found in attics, on sills, or near entry points.' },
                  { title: 'Ammonia smell', desc: 'A strong odor from accumulated guano and urine in enclosed spaces.' },
                  { title: 'Visible bats at dusk', desc: 'Watch your roofline at dusk — bats emerge to feed and you may see them exiting.' },
                  { title: 'Brown staining at entry points', desc: 'Bats leave oily brown staining at gaps they regularly use.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-700"><span className="font-semibold">{item.title}</span> — {item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id="contact-form">
              <ConversionCard
                heading="Schedule a Free Bat Quote"
                defaultService="bat-removal"
                trustItems={[
                  'Response within 1–2 hours',
                  'Licensed & insured in PA & DE',
                  'Exclusion season scheduling handled',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

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
