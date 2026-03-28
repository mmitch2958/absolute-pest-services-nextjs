import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Phone } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Humane Wildlife Control & Removal Services | Absolute Pest Services PA, DE, MD',
    description:
      'Professional humane wildlife removal in PA, DE & MD. Non-kill extraction for raccoons, squirrels, opossums, skunks & more. Licensed wildlife control specialists. Call 484-643-2225.',
    keywords: [
      'wildlife control',
      'wildlife removal',
      'humane wildlife removal',
      'raccoon removal',
      'squirrel removal',
      'opossum removal',
      'skunk removal',
      'groundhog removal',
      'fox removal',
      'wildlife exclusion',
      'nuisance wildlife',
      'Chester County wildlife control',
      'pest control',
    ],
    alternates: {
      canonical: 'https://absolutepestservices.com/wildlife-control',
    },
    openGraph: {
      title: 'Humane Wildlife Control & Removal Services | Absolute Pest Services',
      description:
        'Professional humane wildlife removal in PA, DE & MD. Non-kill extraction for raccoons, squirrels, opossums, skunks & more. Licensed wildlife control specialists.',
      url: 'https://absolutepestservices.com/wildlife-control',
      type: 'website',
      images: [
        {
          url: 'https://absolutepestservices.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Absolute Pest Services - Wildlife Control',
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
      name: 'What wildlife species do you remove?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We handle raccoons, squirrels, groundhogs, opossums, skunks, foxes, deer, and more. We are also licensed for bat exclusion under Pennsylvania and Delaware wildlife regulations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you use humane wildlife removal methods?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We prioritize live trapping and exclusion over extermination wherever possible and legally permitted. All methods comply with PA and DE wildlife regulations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you seal entry points after removing wildlife?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Exclusion and repair is a core part of our wildlife control service. We seal all entry points to prevent animals from returning.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can you respond to a wildlife emergency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer 24/7 emergency response. Call 484-643-2225 and we will dispatch a technician as quickly as possible.',
      },
    },
  ],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  url: 'https://absolutepestservices.com/wildlife-control',
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
    { '@type': 'State', name: 'Maryland' },
  ],
  priceRange: '$$',
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Wildlife Control',
  provider: { '@type': 'LocalBusiness', name: 'Absolute Pest Services' },
  areaServed: 'Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE',
  serviceType: 'Pest Control',
  url: 'https://absolutepestservices.com/wildlife-control',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Wildlife Control', item: 'https://absolutepestservices.com/wildlife-control' },
  ],
}

const wildlifeSpecies = [
  { name: 'Raccoons', desc: 'Attic invasions, chimney dens, garbage raiding. Licensed removal & exclusion.' },
  { name: 'Squirrels', desc: 'Chewing through soffits, nesting in attics. Exclusion and entry point sealing.' },
  { name: 'Groundhogs', desc: 'Foundation burrowing, garden destruction. Live trapping and relocation.' },
  { name: 'Opossums', desc: 'Deck and crawl space invasions. Humane live trapping.' },
  { name: 'Skunks', desc: 'Burrowing under porches, odor issues. Careful removal to avoid spraying.' },
  { name: 'Foxes', desc: 'Den removal, yard safety concerns. Exclusion-focused solutions.' },
  { name: 'Deer', desc: 'Garden protection, repellent programs.' },
  { name: 'Bats', desc: 'Licensed bat exclusion following PA & DE regulations. See Bat Removal page.' },
]

export default function WildlifeControlPage() {
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Wildlife Control</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Wildlife Control Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Humane, effective wildlife removal and exclusion for homes and businesses in
            southeastern Pennsylvania and Delaware. We safely remove wildlife and seal entry points
            to keep them out for good.
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

      {/* Raccoon Trap Photo */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 shadow-lg">
            <Image
              src="/images/racoonTrap.jpg"
              alt="APS technician performing humane raccoon trap removal"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent flex items-center">
              <div className="px-8 text-white max-w-lg">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Humane. Effective. Guaranteed.</h2>
                <p className="text-gray-200 text-sm md:text-base">Our technicians use live traps and exclusion to safely remove wildlife and keep them from returning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wildlife Species Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Wildlife We Remove</h2>
          <p className="text-lg text-gray-600 mb-10">
            We handle all common wildlife species found in southeastern PA and Delaware. Each
            animal requires a different approach — we have the training and equipment for all of
            them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wildlifeSpecies.map((species) => (
              <div
                key={species.name}
                className="p-5 bg-gray-50 rounded-xl border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 mb-2">{species.name}</h3>
                <p className="text-sm text-gray-600">{species.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Our Wildlife Control Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Free Inspection', desc: 'We inspect your property to identify the species, entry points, and extent of the problem.' },
              { step: '2', title: 'Custom Plan', desc: 'We develop a removal plan that\'s humane, effective, and compliant with PA/DE wildlife regulations.' },
              { step: '3', title: 'Removal', desc: 'We use live trapping, exclusion devices, and other methods to safely remove the wildlife.' },
              { step: '4', title: 'Exclusion & Repair', desc: 'We seal all entry points and remove nesting materials to prevent future intrusions.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Absolute Pest Services for Wildlife Control?
              </h2>
              <div className="space-y-3">
                {[
                  'Licensed wildlife removal in PA & DE',
                  'Humane methods — live trapping and exclusion preferred',
                  '24/7 emergency wildlife response',
                  'Full exclusion and repair service',
                  'Free property inspections',
                  'Satisfaction guarantee — if wildlife returns, we do too',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="font-bold text-gray-900 text-xl mb-4">
                Wildlife Emergency? Call Now.
              </h3>
              <p className="text-gray-600 mb-6">
                Wildlife intrusions can cause significant damage quickly. Don&rsquo;t wait —
                call us for a free inspection and same-day service when available.
              </p>
              <a
                href="tel:484-643-2225"
                className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center"
              >
                <Phone size={20} />
                484-643-2225 (24/7)
              </a>
              <Link
                href="/request-service"
                className="flex items-center gap-2 justify-center mt-3 text-green-700 hover:text-green-800 font-medium"
              >
                Or request service online →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{faq.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
