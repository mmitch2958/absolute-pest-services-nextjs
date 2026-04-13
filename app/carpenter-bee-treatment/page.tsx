import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Calendar, CheckCircle, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Professional Carpenter Bee Treatment Service | Absolute Pest Services',
  description:
    'Expert carpenter bee treatment for PA & DE homes. Inspect and treat with EPA approved products. Free estimates. Call 484-643-2225. Spring special: 20% off with code CBT26.',
  alternates: { canonical: 'https://absolutepestservices.com/carpenter-bee-treatment' },
  openGraph: {
    title: 'Professional Carpenter Bee Treatment | Absolute Pest Services',
    description: 'Expert carpenter bee treatment for PA & DE homes. Spring special: 20% off with code CBT26.',
    url: 'https://absolutepestservices.com/carpenter-bee-treatment',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Professional Carpenter Bee Treatment',
  description: 'Expert carpenter bee inspection, treatment, and prevention for PA & DE homes. Four-step process: inspect, treat, seal, and monitor.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Absolute Pest Services',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '21 Sheffield Dr',
      addressLocality: 'West Grove',
      addressRegion: 'PA',
      postalCode: '19390',
      addressCountry: 'US',
    },
    telephone: '484-643-2225',
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Chester County' },
    { '@type': 'AdministrativeArea', name: 'Delaware County' },
    { '@type': 'AdministrativeArea', name: 'Montgomery County' },
    { '@type': 'AdministrativeArea', name: 'New Castle County' },
  ],
  serviceType: 'Carpenter Bee Treatment',
  offers: {
    '@type': 'Offer',
    description: 'Free carpenter bee inspection. Spring special: 20% off with coupon CBT26.',
    price: '0',
    priceCurrency: 'USD',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the carpenter bee treatment process?',
      acceptedAnswer: { '@type': 'Answer', text: 'APS treats carpenter bees in two steps: (1) Inspect — identify all galleries and assess damage; (2) Treat — using professional-grade products, we treat the exterior of the infected area as well as deep into the galleries for maximum effectiveness.' },
    },
    {
      '@type': 'Question',
      name: 'Why do you wait before sealing the holes?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sealing too early traps bees inside without them contacting the treatment. Bees need to pass through treated entry points to contact and distribute the insecticide through the gallery. We wait 1–2 weeks before sealing.' },
    },
    {
      '@type': 'Question',
      name: 'How much does carpenter bee treatment cost?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cost depends on the number of gallery locations, severity and duration of infestation, accessibility, and wood condition. We provide free estimates — call 484-643-2225 or contact us online.' },
    },
    {
      '@type': 'Question',
      name: 'What areas do you serve for carpenter bee treatment?',
      acceptedAnswer: { '@type': 'Answer', text: 'We serve all of Chester County, Delaware County, and Montgomery County in Pennsylvania, plus New Castle County and Kent County in Delaware.' },
    },
    {
      '@type': 'Question',
      name: 'Is the treatment safe for my family and pets?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. We use EPA-registered insecticidal dust applied by licensed technicians. We discuss any precautions needed and use the least toxic effective methods available.' },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Carpenter Bee Treatment', item: 'https://absolutepestservices.com/carpenter-bee-treatment' },
  ],
}

const steps = [
  {
    step: 1,
    title: 'Inspect',
    desc: "We start with a thorough inspection of your home's exterior. Our technicians identify active galleries, assess the extent of existing damage, and map out every boring location — including the ones you can't see from the ground. We check eaves, fascia boards, deck structures, siding, and all other high-risk areas.",
    warning: undefined,
  },
  {
    step: 2,
    title: 'Treat',
    desc: 'We use EPA approved products to treat the exterior surfaces and galleries where bees are active. Our treatments have been applied effectively for over 20 years, helping homeowners prevent damage to their homes.',
    warning: 'Important: We do NOT plug the holes immediately. Bees need to pass through the treated entry points to contact and distribute the insecticide through the gallery.',
  },
]

const serviceAreas = [
  {
    region: 'Pennsylvania',
    areas: [
      { county: 'Chester County', towns: 'West Grove, Kennett Square, West Chester, Exton, Downingtown, Oxford, Coatesville, Phoenixville, Malvern' },
      { county: 'Delaware County', towns: 'Media, Havertown, Springfield, Radnor, Wayne, Bryn Mawr, Haverford' },
      { county: 'Montgomery County', towns: 'Collegeville, King of Prussia, Norristown, Lansdale, Willow Grove' },
    ],
  },
  {
    region: 'Delaware',
    areas: [
      { county: 'New Castle County', towns: 'Wilmington, Newark, Middletown, New Castle, Bear' },
      { county: 'Kent County', towns: 'Dover, Camden, Smyrna' },
    ],
  },
]

export default function CarpenterBeeTreatmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Carpenter Bee Treatment</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                🌸 Spring 2026 Service
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Professional Carpenter Bee Treatment for PA &amp; DE Homes
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Expert inspection, treatment, and prevention — protecting your home from carpenter
                bee damage, season after season.
              </p>
              {/* Coupon */}
              <div className="bg-white text-gray-900 rounded-xl p-6 mb-8 border-2 border-amber-400">
                <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">🌸 Spring Special</p>
                <p className="text-3xl font-bold text-green-700 mb-1">20% OFF Carpenter Bee Treatment</p>
                <p className="text-lg text-gray-600">
                  Use coupon code:{' '}
                  <span className="font-mono font-bold text-green-700 text-xl">CBT26</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Valid for new customers booking treatment in PA & DE.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/request-service"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  <Calendar className="h-5 w-5" />
                  Get Free Estimate
                </Link>
                <a
                  href="tel:484-643-2225"
                  className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-green-900 px-8 py-4 text-lg font-semibold rounded-xl transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  484-643-2225
                </a>
              </div>
            </div>
            <div className="relative h-72 rounded-2xl overflow-hidden">
              <Image
                src="/images/carpenter-bee/carpenter-bee-treatment-service.jpg"
                alt="Professional applying carpenter bee treatment to wood surface"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">How APS Treats Carpenter Bees</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Our carpenter bee treatment is designed to eliminate the current infestation and prevent future damage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {steps.map(({ step, title, desc, warning }) => (
              <div key={step} className="bg-gray-50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm mb-3">{desc}</p>
                {warning && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    {warning}
                  </p>
                )}
              </div>
            ))}
            <div className="relative rounded-2xl overflow-hidden min-h-64">
              <Image
                src="/images/carpenter-bee/carpenter-bee-damage-closeup.jpg"
                alt="Close-up of carpenter bee damage — round bore holes in exterior wood"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes APS Different */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">What Makes APS Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Local Expertise for the PA & DE Region',
                desc: "We're based in West Grove, PA — right in the heart of the carpenter bee corridor. We know the Eastern carpenter bee, the local climate patterns that drive their emergence, and the homes in this area.",
              },
              {
                title: 'Proper Treatment, Not a Quick Fix',
                desc: 'Many treatments fail because holes are sealed too early or only the visible holes are treated. APS follows the correct protocol: treat galleries first, allow time for contact, then seal.',
              },
              {
                title: 'Damage Assessment Included',
                desc: "Every carpenter bee inspection includes an assessment of existing structural damage. We'll let you know what's been compromised and what needs repair.",
              },
              {
                title: 'Season-Long Protection',
                desc: 'Our treatment plans span the full carpenter bee season (spring through late summer), not just a single visit. We treat overwintered adults in April/May and newly emerged adults in July/August.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Service Areas</h2>
          <p className="text-lg text-gray-600 mb-8">
            APS provides carpenter bee treatment throughout southeastern Pennsylvania and northeastern Delaware.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceAreas.map(({ region, areas }) => (
              <div key={region}>
                <h3 className="text-xl font-bold text-green-700 mb-4">{region}</h3>
                {areas.map(({ county, towns }) => (
                  <div key={county} className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-1">{county}</h4>
                    <p className="text-gray-600 text-sm">{towns}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-500 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Don&apos;t see your town listed? We likely still serve your area. Call us to confirm.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Pricing &amp; Estimates</h2>
          <p className="text-lg text-gray-600 mb-6">Every carpenter bee infestation is different. The cost of treatment depends on:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Number of gallery locations', desc: 'How many boring sites need treatment' },
              { label: 'Severity and duration', desc: 'Longer-standing infestations mean more extensive gallery systems' },
              { label: 'Accessibility', desc: 'Ground-level decks vs. second-story eaves' },
              { label: 'Wood condition', desc: 'Whether damage requires repair or just treatment' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-800">{label}</strong>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">We provide free estimates.</h3>
            <p className="text-gray-600 mb-6">
              Call us or contact us online to schedule an inspection. We&apos;ll assess your situation,
              explain our recommended treatment plan, and provide a clear estimate before any work begins.
            </p>
            <p className="text-lg text-gray-700 font-medium">
              <strong>The bottom line:</strong> Professional carpenter bee treatment is a fraction of the
              cost of repairing structural damage from years of untreated infestation. Acting now saves money later.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl p-6 mb-8 inline-block border-2 border-amber-400">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">Spring Special</p>
            <p className="text-2xl font-bold text-green-700">20% OFF with code CBT26</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8">
            Don&apos;t wait for the damage to get worse. Carpenter bees are active right now in PA &amp; DE,
            and every day counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/request-service"
              className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 text-lg rounded-xl"
            >
              <Calendar className="h-5 w-5" />
              Get Free Estimate
            </Link>
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 text-lg rounded-xl"
            >
              <Phone className="h-5 w-5" />
              484-643-2225
            </a>
          </div>
          <p className="mt-6 text-green-200 text-sm">Same-day and next-day appointments available during peak season.</p>
          <p className="mt-2 text-green-200 text-sm">
            Also see:{' '}
            <Link href="/carpenter-bee-control" className="underline hover:text-white">
              Carpenter Bee Identification &amp; Info →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
