import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone } from 'lucide-react'
import ConversionCard from '@/components/forms/ConversionCard'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Termite Inspection & Treatment Services | Absolute Pest Services PA & DE',
    description:
      'Licensed termite inspection, treatment & prevention in PA & DE. Termidor liquid barriers, baiting systems & ongoing monitoring. Protect your home from costly termite damage. Call 484-643-2225.',
    keywords: [
      'termite treatment',
      'termite control',
      'termite inspection',
      'Termidor treatment',
      'termite bait stations',
      'termite prevention',
      'subterranean termites',
      'termite damage',
      'termite extermination',
      'Chester County termite treatment',
      'pest control',
    ],
    alternates: {
      canonical: 'https://absolutepestservices.com/termite-treatment',
    },
    openGraph: {
      title: 'Termite Inspection & Treatment Services | Absolute Pest Services',
      description:
        'Licensed termite inspection, treatment & prevention in PA & DE. Termidor liquid barriers, baiting systems & ongoing monitoring to protect your home.',
      url: 'https://absolutepestservices.com/termite-treatment',
      type: 'website',
      images: [
        {
          url: 'https://absolutepestservices.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Absolute Pest Services - Termite Treatment',
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
      name: 'How do I know if I have termites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Signs include mud tubes on foundation walls, hollow-sounding wood, discarded wings near windows and doors, and visible damage to wood structures. Schedule a free quote if you suspect termites — early detection saves thousands in repairs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What termite treatment methods do you use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer Termidor liquid barrier treatments, bait station monitoring systems, and wood treatments. Our technicians recommend the best approach based on your property type and infestation level.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does termite treatment last?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Termidor liquid treatments typically protect your home for 5-10 years. Bait station systems provide ongoing monitoring and control with annual service visits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do termites come back after treatment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Re-infestation is rare after a properly applied liquid barrier treatment. We provide a warranty and annual inspection program to ensure your home stays protected.',
      },
    },
  ],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  url: 'https://absolutepestservices.com/termite-treatment',
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
  name: 'Termite Treatment',
  provider: { '@type': 'LocalBusiness', name: 'Absolute Pest Services' },
  areaServed: 'Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE',
  serviceType: 'Pest Control',
  url: 'https://absolutepestservices.com/termite-treatment',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Termite Treatment', item: 'https://absolutepestservices.com/termite-treatment' },
  ],
}

export default function TermiteTreatmentPage() {
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

      <section className="bg-gradient-to-br from-amber-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-amber-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Termite Treatment</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Termite Treatment</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Protect your home from the most destructive pest in America. Termites cause $5 billion
            in property damage annually in the US — and homeowners insurance typically does not
            cover it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />
              Call 484-643-2225
            </a>
            <a href="#contact-form" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Free Termite Inspection ↓
            </a>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-green-50 border-b border-green-100 py-12 sm:py-16"
        aria-labelledby="termite-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🚨 Every day termites stay is more damage
              </div>
              <h2
                id="termite-form-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Get a Free Termite Inspection<br />
                <span className="text-green-700">Today — No Commitment</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Termites silently destroy your home from the inside. A free quote by our
                licensed specialists will tell you exactly what you’re dealing with — and what
                it costs to fix it.
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
                heading="Get a Free Termite Inspection"
                defaultService="termite-treatment"
                trustItems={[
                  'Response within 1–2 hours',
                  'Licensed & insured in PA & DE',
                  'No commitment required',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Termite Treatment Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Termidor® Liquid Barrier',
                color: 'bg-amber-50 border-amber-100',
                badge: 'Most Popular',
                desc: 'We create a continuous chemical barrier around your home\'s foundation. Subterranean termites contact the Termidor zone and carry it back to the colony, eliminating it from within.',
                benefits: ['5-10 year protection', 'Undetectable to termites', 'Eliminates entire colony', 'Gold standard treatment'],
              },
              {
                title: 'Bait Station System',
                color: 'bg-gray-50 border-gray-100',
                badge: 'Ongoing Monitoring',
                desc: 'Bait stations are installed around your home\'s perimeter. Termites feed on the bait and carry it back to the colony. Stations are monitored quarterly for ongoing protection.',
                benefits: ['Quarterly monitoring', 'Minimal chemical use', 'Ideal for prevention', 'Annual service plan'],
              },
              {
                title: 'Wood Treatment',
                color: 'bg-green-50 border-green-100',
                badge: 'Supplemental',
                desc: 'Direct application to infested or vulnerable wood with borate-based treatments. Penetrates and protects wood from both termites and wood-decay fungi.',
                benefits: ['Protects exposed wood', 'Long-lasting formula', 'Crawl space treatment', 'New construction'],
              },
            ].map(item => (
              <div key={item.title} className={`p-6 rounded-2xl border ${item.color}`}>
                <span className="text-xs font-semibold bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-600 mb-3 inline-block">{item.badge}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{item.desc}</p>
                <ul className="space-y-1">
                  {item.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Warning Signs of Termites</h2>
              <div className="space-y-4">
                {[
                  { title: 'Mud tubes', desc: 'Pencil-width tubes on foundation walls — termite highways from soil to wood.' },
                  { title: 'Hollow-sounding wood', desc: 'Tap on suspected areas. Hollow sounds indicate termites have eaten through from inside.' },
                  { title: 'Discarded wings', desc: 'Piles of wings near windows, doors, and foundation cracks — left by swarming termites.' },
                  { title: 'Buckling paint or floors', desc: 'Moisture from termite activity causes paint to bubble and floors to warp.' },
                  { title: 'Frass (termite droppings)', desc: 'Dry wood termites leave tiny wood-colored pellet piles near infested wood.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-gray-700"><span className="font-semibold">{item.title}</span> — {item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <a href="#contact-form" className="flex items-center gap-3 bg-amber-700 hover:bg-amber-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center mb-3">
                <Phone size={20} />
                Schedule Free Quote ↓
              </a>
              <a href="tel:484-643-2225" className="flex items-center gap-2 justify-center text-amber-700 hover:text-amber-800 font-medium text-sm">
                Or call 484-643-2225
              </a>
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
