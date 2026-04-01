import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone, AlertTriangle, ShieldCheck, Home, Star } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Wasp & Hornet Removal Services | Absolute Pest Services PA & DE',
    description:
      'Professional wasp and hornet nest removal in Chester County, Delaware County, Montgomery County PA and New Castle County DE. Safe same-day service. Call 484-643-2225.',
    keywords: [
      'wasp removal',
      'hornet removal',
      'wasp nest removal',
      'hornet nest removal',
      'yellow jacket removal',
      'stinging insect control',
      'wasp control Chester County',
      'wasp removal Delaware County',
      'hornet control PA',
      'wasp nest removal near me',
      'same day wasp removal',
      'pest control',
    ],
    alternates: {
      canonical: 'https://absolutepestservices.com/wasp-removal',
    },
    openGraph: {
      title: 'Wasp & Hornet Removal Services | Absolute Pest Services',
      description:
        'Professional wasp and hornet nest removal in southeastern PA and Delaware. Safe, same-day emergency service available. Call 484-643-2225.',
      url: 'https://absolutepestservices.com/wasp-removal',
      type: 'website',
      images: [
        {
          url: 'https://absolutepestservices.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Absolute Pest Services - Wasp & Hornet Removal',
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
      name: 'What types of stinging insects do you remove?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We remove all common stinging insects found in southeastern PA and Delaware including paper wasps, bald-faced hornets, European hornets, yellow jackets, and mud daubers. Each species requires a different approach for safe, effective removal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it dangerous to remove a wasp or hornet nest yourself?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — DIY wasp and hornet removal is one of the most dangerous pest control tasks a homeowner can attempt. Disturbing a nest without proper equipment can trigger an aggressive mass sting response. Bald-faced hornets and yellow jackets are especially aggressive. Our technicians have protective gear, the right treatments, and the experience to remove nests safely.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer same-day wasp and hornet removal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We offer same-day emergency wasp and hornet removal throughout Chester County, Delaware County, Montgomery County PA, and New Castle County DE. Call 484-643-2225 and we will dispatch a technician as quickly as possible.',
      },
    },
    {
      '@type': 'Question',
      name: 'When is wasp and hornet season in Pennsylvania and Delaware?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wasp and hornet activity peaks between July and October in our region. Colonies reach their largest size in late summer, making nests most dangerous from August through the first hard frost. Spring is a good time for preventive treatments before queens establish new colonies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will the wasps come back after you remove the nest?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Returning foragers may briefly hover at the removal site, but without a nest and queen they will disperse within a few days. We treat the removal site to discourage rebuilding and can apply preventive residual treatments to eaves, soffits, and other common nesting sites.',
      },
    },
  ],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Absolute Pest Services',
  telephone: '+1-484-643-2225',
  url: 'https://absolutepestservices.com/wasp-removal',
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
  name: 'Wasp & Hornet Removal',
  provider: { '@type': 'LocalBusiness', name: 'Absolute Pest Services' },
  areaServed: 'Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE',
  serviceType: 'Pest Control',
  url: 'https://absolutepestservices.com/wasp-removal',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Wasp & Hornet Removal', item: 'https://absolutepestservices.com/wasp-removal' },
  ],
}

const stingingPests = [
  {
    name: 'Paper Wasps',
    desc: 'Umbrella-shaped nests under eaves, decks, and overhangs. Painful sting but generally not aggressive unless the nest is threatened.',
  },
  {
    name: 'Bald-Faced Hornets',
    desc: 'Large gray paper nests in trees and shrubs. Extremely aggressive defenders — professional removal is essential.',
  },
  {
    name: 'European Hornets',
    desc: 'Large hornets that nest in wall voids, hollow trees, and attics. Active at night and can damage wood structures.',
  },
  {
    name: 'Yellow Jackets',
    desc: 'Ground nests and wall voids. Swarm aggressively when disturbed. Responsible for the majority of stinging-insect emergency room visits.',
  },
  {
    name: 'Mud Daubers',
    desc: 'Solitary wasps building mud tubes on walls and ceilings. Less aggressive but nests can be unsightly and attract other insects.',
  },
  {
    name: 'Cicada Killers',
    desc: 'Large ground-nesting wasps that look alarming but are rarely aggressive. Effective removal and turf treatment available.',
  },
]

const serviceAreas = [
  {
    county: 'Chester County, PA',
    cities: ['West Chester', 'Kennett Square', 'Exton', 'West Grove', 'Avondale', 'Coatesville', 'Oxford', 'Phoenixville'],
  },
  {
    county: 'Delaware County, PA',
    cities: ['Media', 'Newtown Square', 'Chadds Ford', 'Glen Mills', 'Springfield', 'Haverford', 'Upper Darby'],
  },
  {
    county: 'Montgomery County, PA',
    cities: ['King of Prussia', 'Malvern', 'Norristown', 'Collegeville', 'Pottstown', 'Blue Bell'],
  },
  {
    county: 'New Castle County, DE',
    cities: ['Wilmington', 'Newark', 'Hockessin', 'Middletown', 'Bear', 'Glasgow'],
  },
]

const trustBadges = [
  { icon: ShieldCheck, label: 'Licensed & Insured', sub: 'PA & DE Certified' },
  { icon: Home, label: 'Family Owned', sub: 'Serving the area since 2009' },
  { icon: Star, label: 'Satisfaction Guarantee', sub: 'We make it right' },
  { icon: CheckCircle, label: 'Pet-Safe Methods', sub: 'Safe for your family' },
]

export default function WaspRemovalPage() {
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
            <span>Wasp &amp; Hornet Removal</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
            <AlertTriangle size={12} />
            Same-Day Emergency Service Available
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Wasp &amp; Hornet Removal Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Safe, professional nest removal for wasps, hornets, and yellow jackets throughout
            Chester &amp; Delaware Counties PA and New Castle County DE. Don&rsquo;t risk a
            dangerous DIY attempt — we handle it safely.
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

      {/* Trust Badges */}
      <section className="bg-green-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 text-white">
                <badge.icon size={24} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{badge.label}</p>
                  <p className="text-xs text-green-200">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Professional Wasp Removal Matters
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Wasp and hornet stings are painful — and for people with allergies, they can be
                  life-threatening. A single nest can house hundreds to thousands of stinging
                  insects that will defend their colony aggressively when threatened.
                </p>
                <p>
                  DIY wasp removal with store-bought sprays is one of the most common causes of
                  stinging-insect injuries. Without proper protective equipment and training,
                  approaching an active nest can trigger a coordinated attack in seconds.
                </p>
                <p>
                  Our technicians are equipped with commercial-grade protective gear and
                  professional-strength treatments that eliminate nests quickly and safely — often
                  in a single visit.
                </p>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 font-medium">
                    If you or someone nearby is allergic to stings, treat any active wasp or
                    hornet nest as an emergency. Call us immediately at{' '}
                    <a href="tel:484-643-2225" className="underline font-bold">484-643-2225</a>.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl mb-6">
                Wasp &amp; Hornet Emergency? Call Now.
              </h3>
              <div className="space-y-3 mb-6">
                {[
                  'Same-day emergency nest removal',
                  'Licensed & insured technicians',
                  'Commercial-grade treatments',
                  'Preventive treatment available',
                  'Safe for children & pets when dry',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="tel:484-643-2225"
                className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center"
              >
                <Phone size={20} />
                484-643-2225
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

      {/* Stinging Pests Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stinging Insects We Remove
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Different stinging insects require different treatment approaches. We correctly
            identify the species before treatment to ensure safe, effective removal every time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stingingPests.map((pest) => (
              <div
                key={pest.name}
                className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <h3 className="font-bold text-gray-900 mb-2">{pest.name}</h3>
                <p className="text-sm text-gray-600">{pest.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Our Wasp Removal Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Assessment',
                desc: 'We locate all active nests, identify the species, and assess nest size and access — all before approaching.',
              },
              {
                step: '2',
                title: 'Safe Treatment',
                desc: 'Using professional-grade insecticides and full protective gear, we treat the nest directly to eliminate the colony quickly.',
              },
              {
                step: '3',
                title: 'Nest Removal',
                desc: 'Once the colony is eliminated, we safely remove the nest structure to prevent recolonization by other insects.',
              },
              {
                step: '4',
                title: 'Prevention',
                desc: 'We apply residual treatments to eaves, soffits, and other nesting sites to deter new colonies from establishing.',
              },
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

      {/* Service Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Wasp Removal Service Areas
          </h2>
          <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            We provide same-day wasp and hornet removal throughout southeastern Pennsylvania
            and Delaware.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceAreas.map((area) => (
              <div key={area.county} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">
                  {area.county}
                </h3>
                <ul className="space-y-1">
                  {area.cities.map((city) => (
                    <li key={city} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-gray-500">
            Don&rsquo;t see your city?{' '}
            <Link href="/service-areas" className="text-green-700 hover:text-green-800 font-medium">
              View all service areas →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{faq.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Same-Day Emergency Wasp Removal Available
          </h2>
          <p className="text-lg text-green-200 mb-8 max-w-xl mx-auto">
            Don&rsquo;t wait until someone gets stung. Our technicians serve Chester County,
            Delaware County, Montgomery County PA, and New Castle County DE — often with
            same-day availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg"
            >
              <Phone size={22} />
              Call 484-643-2225
            </a>
            <Link
              href="/request-service"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-green-900 font-bold px-8 py-4 rounded-xl text-lg"
            >
              Request Service Online
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
