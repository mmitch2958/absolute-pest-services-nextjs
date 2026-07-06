import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, Bug, TreePine, Zap, CheckCircle, Phone, AlertTriangle, Calendar } from 'lucide-react'
import GoogleReviews from '@/components/reviews/GoogleReviews'
import SpringCarpenterBeeBanner from '@/components/spring-carpenter-bee-banner'
import ConversionCard from '@/components/forms/ConversionCard'

export const metadata: Metadata = {
  title: 'Absolute Pest Services - Professional Pest Control in PA & DE',
  description:
    'Expert pest control in PA & DE. Humane wildlife control, bed bug treatment, termite protection & bat removal. Licensed, insured & available 24/7. Call 484-643-2225.',
  alternates: {
    canonical: 'https://absolutepestservices.com/',
  },
  openGraph: {
    url: 'https://absolutepestservices.com/',
    title: 'Absolute Pest Services - Professional Pest Control in PA & DE',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://absolutepestservices.com/#business',
  name: 'Absolute Pest Services',
  telephone: '484-643-2225',
  email: 'info@absolutepestservices.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'West Grove',
    addressRegion: 'PA',
    postalCode: '19390',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.8221,
    longitude: -75.8274,
  },
  url: 'https://absolutepestservices.com',
  sameAs: [],
  areaServed: [
    { '@type': 'State', name: 'Pennsylvania' },
    { '@type': 'State', name: 'Delaware' },
  ],
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '47',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Pest Control Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wildlife Control' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bed Bug Treatment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Termite Treatment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bat Removal' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rodent Control' } },
    ],
  },
}

const homePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://absolutepestservices.com/#homepage',
  url: 'https://absolutepestservices.com/',
  name: 'Absolute Pest Services - Professional Pest Control in PA & DE',
  isPartOf: {
    '@id': 'https://absolutepestservices.com/#website',
  },
  about: {
    '@id': 'https://absolutepestservices.com/#business',
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://absolutepestservices.com/images/Hero1.jpg',
  },
  dateModified: '2026-05-27',
}

const services = [
  {
    icon: TreePine,
    title: 'Wildlife Control',
    description:
      'Humane removal of raccoons, squirrels, opossums, groundhogs & more. We humanely remove and seal entry points.',
    href: '/wildlife-control',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: Bug,
    title: 'Bed Bug Treatment',
    description:
      'Complete bed bug elimination using proven heat and chemical treatments. We eliminate all life stages — eggs, nymphs, adults.',
    href: '/bed-bug-treatment',
    color: 'bg-red-50 text-red-700',
  },
  {
    icon: Shield,
    title: 'Termite Treatment',
    description:
      'Protect your home from costly termite damage. Expert inspection, liquid barrier treatment, and bait station systems.',
    href: '/termite-treatment',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Zap,
    title: 'Bat Removal',
    description:
      'Licensed bat exclusion following PA & DE wildlife regulations. We seal entry points after all bats have safely exited.',
    href: '/bat-removal',
    color: 'bg-purple-50 text-purple-700',
  },
]

const trustSignals = [
  'Licensed & Insured in PA & DE',
  '24/7 Emergency Response',
  'Free Estimates',
  'Humane Methods',
  'Satisfaction Guaranteed',
  'Family & Pet Safe Treatments',
]

const serviceAreas = [
  'West Chester, PA',
  'Kennett Square, PA',
  'West Grove, PA',
  'Exton, PA',
  'Avondale, PA',
  'Oxford, PA',
  'Wilmington, DE',
  'Newark, DE',
  'Landenberg, PA',
  'Coatesville, PA',
]

export default function HomePage() {
  return (
    <>
      {/* LocalBusiness JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, homePageSchema]) }}
      />

      {/* Carpenter Bee Spring Banner — dismissable, shown above the fold */}
      <SpringCarpenterBeeBanner />

      {/* Hero Section — text on left, constrained image on right */}
      <section className="relative bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text content — left side */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-700/30 border border-green-600/30 rounded-full px-4 py-1 text-sm text-green-300 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Available 24/7 for Emergencies
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Professional Pest Control
                <span className="text-green-400"> in PA & DE</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Expert wildlife removal, bed bug treatment, termite protection, and comprehensive pest
                control for homes and businesses throughout southeastern Pennsylvania and Delaware.
                Licensed, insured, and trusted by thousands of families.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:484-643-2225"
                  className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
                >
                  <Phone size={22} />
                  Call 484-643-2225
                </a>
                <Link
                  href="/request-service"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
                >
                  Request Service Online
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {trustSignals.slice(0, 4).map((signal) => (
                  <div
                    key={signal}
                    className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-full px-3 py-1"
                  >
                    <CheckCircle size={14} className="text-green-400" />
                    {signal}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-gray-400">
                Reviewed by Absolute Pest Services. Updated May 27, 2026.
              </p>
            </div>

            {/* Constrained hero image — right side */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <Image
                  src="/images/Hero1.jpg"
                  alt="APS technician performing humane wildlife removal"
                  width={600}
                  height={420}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Who should call Absolute Pest Services?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Absolute Pest Services helps homeowners and businesses in southeastern Pennsylvania
            and Delaware with wildlife removal, termite treatment, bed bug treatment, bat
            exclusion, wasp removal, rodent control, and general pest problems. Customers usually
            call when they hear animals in the attic, see termite swarmers, find wasp nests near
            doors, notice mice activity, or need fast help with an active infestation. We inspect
            the problem, explain what is happening, recommend a treatment plan, and help prevent
            the issue from coming back. If you need a licensed local pest control company serving
            Chester County, surrounding PA communities, or northern Delaware, call 484-643-2225
            or request service online to check same-day or next-day availability.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pest Control Services We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From wildlife intrusions to bed bugs and termites — we handle every pest problem
              with professional expertise and proven methods.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group p-6 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  <div className="mt-4 text-green-700 text-sm font-medium flex items-center gap-1">
                    Learn more →
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/request-service"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Schedule Service Now
            </Link>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section
        id="contact-form"
        className="bg-gray-900 py-16 sm:py-20"
        aria-labelledby="homepage-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-green-700/30 border border-green-600/30 text-green-300 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🚨 Act Fast — Pests multiply quickly
              </div>
              <h2
                id="homepage-form-heading"
                className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight"
              >
                Get a Free Pest Quote<br />
                <span className="text-green-400">Today — No Commitment</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Tell us what you’re dealing with and we’ll send a licensed technician
                to assess your situation — free, with no pressure.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Response within 1–2 business hours',
                  'Licensed & insured in PA & DE',
                  'Free estimate, no commitment required',
                  'Same-day service available',
                  '5.0 ⭐ rated by 40+ customers',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Prefer to call?</p>
                <a
                  href="tel:484-643-2225"
                  className="text-2xl font-bold text-green-400 hover:text-green-300 flex items-center gap-2"
                >
                  <Phone size={22} />
                  484-643-2225
                </a>
                <p className="text-xs text-gray-500 mt-1">Mon–Fri 7am–6pm · Sat 8am–4pm · 24/7 emergency</p>
              </div>
            </div>
            <div>
              <ConversionCard heading="Request a Free Quote" />
            </div>
          </div>
        </div>
      </section>

      {/* Carpenter Bee Season Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-green-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <AlertTriangle size={16} />
                Spring 2026 — Active Now
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Carpenter Bees Are Drilling Into PA &amp; DE Homes Right Now
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every spring, carpenter bees return to bore into decks, fascia boards, eaves, and
                porches across southeastern Pennsylvania and Delaware. One untreated female this spring
                means 6&ndash;8 new bees this summer &mdash; each boring additional tunnels into your wood.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Perfectly round holes (~1/2 inch) in exterior wood',
                  'Sawdust piles beneath entry holes',
                  'Large bees hovering near your deck or eaves',
                  'Woodpecker damage from birds hunting larvae',
                ].map((sign) => (
                  <div key={sign} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    {sign}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/carpenter-bee-control"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <Bug size={18} />
                  Learn About Carpenter Bees
                </Link>
                <Link
                  href="/carpenter-bee-treatment"
                  className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <Calendar size={18} />
                  Schedule Treatment
                </Link>
              </div>
            </div>

            {/* Discount Banner Card */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-400 overflow-hidden">
                <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
                  <p className="text-green-100 text-sm font-semibold uppercase tracking-wider">Spring Carpenter Bee Special</p>
                </div>
                <div className="p-8 text-center">
                  <p className="text-5xl font-extrabold text-green-700 mb-2">10% OFF</p>
                  <p className="text-lg text-gray-600 mb-4">Professional Carpenter Bee Treatment</p>
                  <div className="inline-block bg-gray-100 rounded-lg px-6 py-3 mb-6">
                    <p className="text-sm text-gray-500 mb-1">Use coupon code</p>
                    <p className="text-2xl font-mono font-bold text-green-700 tracking-wider">CBT26</p>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/carpenter-bee-treatment"
                      className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-4 rounded-xl text-lg transition-colors"
                    >
                      <Calendar size={20} />
                      Get Free Estimate
                    </Link>
                    <a
                      href="tel:484-643-2225"
                      className="flex items-center justify-center gap-2 w-full border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold px-6 py-4 rounded-xl text-lg transition-colors"
                    >
                      <Phone size={20} />
                      Call 484-643-2225
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Valid for new customers in PA &amp; DE during spring 2026.</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-amber-800 font-medium text-sm">
                  <strong>Act now:</strong> Every week of delay means more eggs laid in more holes.
                  Spring is the critical treatment window.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Southeastern PA & DE Homeowners Choose Absolute Pest Services
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Licensed & Insured',
                    desc: 'Fully licensed in both Pennsylvania and Delaware. Insured for your protection.',
                  },
                  {
                    title: 'Humane Wildlife Methods',
                    desc: 'We use live trapping and exclusion — no unnecessary harm to animals.',
                  },
                  {
                    title: 'Same-Day Service Available',
                    desc: "Pest emergencies can't wait. We offer same-day appointments in most cases.",
                  },
                  {
                    title: 'Family & Pet Safe Treatments',
                    desc: 'Our treatments are targeted and safe for your family and pets.',
                  },
                  {
                    title: 'Satisfaction Guarantee',
                    desc: 'If pests return between scheduled visits, we come back at no charge.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">{item.title}</span>
                      <span className="text-gray-600"> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className="w-6 h-6 text-yellow-400 fill-yellow-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-2xl text-gray-900">5.0 on Google</p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  'Prompt, same-day response',
                  'Technicians explain every step',
                  'Effective on the first visit',
                  'Fair pricing, no surprises',
                  'They stand behind their work',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <a
                href="tel:484-643-2225"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-lg transition-colors w-full justify-center"
              >
                <Phone size={18} />
                Call Now: 484-643-2225
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviews />

      {/* Service Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Serving Southeastern PA & Delaware
            </h2>
            <p className="text-lg text-gray-600">
              We provide pest control throughout Chester County, Delaware County, Montgomery County,
              and New Castle County, DE.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {serviceAreas.map((area) => {
              const slug = area
                .toLowerCase()
                .replace(/, /g, '-')
                .replace(/ /g, '-')
              return (
                <Link
                  key={area}
                  href={`/service-areas/${slug}`}
                  className="text-center py-3 px-2 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-100 hover:border-green-200"
                >
                  {area}
                </Link>
              )
            })}
          </div>
          <div className="text-center">
            <Link
              href="/service-areas"
              className="text-green-700 hover:text-green-800 font-semibold"
            >
              View all 25+ service areas →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pest Problem? We&rsquo;re Ready to Help Now.
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Call for a free estimate or request service online. Same-day appointments available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center justify-center gap-3 bg-white text-green-700 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              <Phone size={22} />
              484-643-2225
            </a>
            <Link
              href="/request-service"
              className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Request Service Online
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
