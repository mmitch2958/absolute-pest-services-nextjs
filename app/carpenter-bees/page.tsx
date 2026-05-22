import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle, AlertTriangle, Calendar, DollarSign, Shield } from 'lucide-react'
import ConversionCard from '@/components/forms/ConversionCard'

export const metadata: Metadata = {
  title: 'Carpenter Bees in PA & DE — Complete Homeowner Guide | Absolute Pest Services',
  description:
    'Learn to identify carpenter bees, spot the damage early, and protect your PA or DE home before the holes multiply. Expert guide from Absolute Pest Services.',
  alternates: { canonical: 'https://absolutepestservices.com/carpenter-bees' },
  openGraph: {
    title: 'Carpenter Bees in PA & DE — Complete Homeowner Guide',
    description:
      'Learn to identify carpenter bees, spot the damage early, and protect your PA or DE home before the holes multiply.',
    url: 'https://absolutepestservices.com/carpenter-bees',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Carpenter Bee Information & Control',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Absolute Pest Services',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '21 Sheffield Dr',
      addressLocality: 'West Grove',
      addressRegion: 'PA',
      postalCode: '19390',
    },
    telephone: '+1-484-643-2225',
  },
  areaServed: 'Chester County PA, Delaware County PA, New Castle County DE',
  serviceType: 'Carpenter Bee Control',
}

const beeComparison = [
  {
    name: 'Carpenter Bee',
    color: 'bg-gray-900',
    features: [
      '¾–1 inch long',
      'Shiny, bare, black abdomen',
      'Yellow fuzz on thorax only',
      'Bores into wood — solitary',
      'Males cannot sting',
    ],
  },
  {
    name: 'Bumblebee',
    color: 'bg-yellow-400',
    features: [
      '½–1 inch long',
      'Fully fuzzy abdomen (yellow/black)',
      'Fuzzy all over — social colony',
      'Nests underground',
      'Can sting if threatened',
    ],
  },
  {
    name: 'Honeybee',
    color: 'bg-amber-500',
    features: [
      '~½ inch long',
      'Fuzzy, golden-brown striped',
      'Social — large colonies in wax hives',
      'Managed commercially for pollination',
      'Can sting; colony defensive',
    ],
  },
]

const signChecklist = [
  { icon: '🔍', text: 'Perfectly round holes (~½ inch diameter) in exterior wood' },
  { icon: '🪵', text: 'Piles of coarse sawdust (frass) beneath entry holes' },
  { icon: '📢', text: 'Buzzing or droning sounds from within the wood' },
  { icon: '💛', text: 'Fan-shaped yellow stains below holes — waste that darkens with mold' },
  { icon: '🐝', text: 'Large bees hovering near wood surfaces' },
  { icon: '🪶', text: 'Woodpecker damage nearby — they hunt carpenter bee larvae' },
]

const nestingLocations = [
  'Roof eaves and soffits',
  'Fascia boards',
  'Deck railings, posts, and framing',
  'Porch columns and overhead overhangs',
  'Wooden siding and shingles',
  'Window and door frames',
  'Fence posts and outdoor furniture',
  'Shed walls and outbuildings',
]

const seasonTimeline = [
  { period: 'Mid-April – Early May', event: 'Adults emerge from overwintering tunnels when temperatures reach 65–70°F', isNow: true },
  { period: 'Late April – May', event: 'Mating occurs; females search for nest sites and begin boring', isNow: false },
  { period: 'May – July', event: 'Peak boring and egg-laying — females create 6–8 brood cells per gallery', isNow: false },
  { period: 'July – August', event: 'Larvae develop and pupate inside sealed gallery cells', isNow: false },
  { period: 'Late July – September', event: 'New adult bees emerge and feed on nectar before returning to overwinter', isNow: false },
  { period: 'October – March', event: 'Adults overwinter inside existing galleries; no activity during cold months', isNow: false },
]

const diyVsPro = [
  { title: 'Misidentification risk', diy: "Not every large bee is a carpenter bee — you don't want to treat beneficial bumblebees or honeybees", pro: 'We correctly identify the species before treatment begins' },
  { title: 'Timing mistakes', diy: 'Sealing holes too early traps bees inside without contacting the treatment', pro: 'We time applications so bees contact the treatment before any sealing occurs' },
  { title: 'Incomplete treatment', diy: "You can't see the full gallery system; branched tunnels and secondary holes are easy to miss", pro: 'We treat the complete tunnel system, not just visible entry holes' },
  { title: 'Safety concerns', diy: 'Insecticidal dust becomes airborne; ladders needed for eave treatment', pro: 'Licensed technicians handle all products safely at any height' },
  { title: 'Product selection', diy: 'Not all insecticides are formulated for tunnel application into wood', pro: 'We use professional-grade products formulated for carpenter bee galleries' },
  { title: 'Sealing protocol', diy: 'Plugging holes immediately defeats the treatment', pro: 'We seal 1–2 weeks after treatment, using proper materials for long-term prevention' },
]

export default function CarpenterBeesPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-green-700">Home</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Carpenter Bee Guide</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
              Spring 2026 — Active Now
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Carpenter Bees Are Drilling Into PA &amp; DE Homes{' '}
              <span className="text-green-400">Right Now</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Spring has arrived, and so have the carpenter bees. Learn how to identify them,
              spot the damage early, and protect your home before the holes multiply.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:484-643-2225"
                className="inline-flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-xl text-lg"
              >
                <Phone size={20} />
                484-643-2225
              </a>
              <Link
                href="/carpenter-bee-treatment"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                <Calendar size={20} />
                Get Free Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="w-full h-72 sm:h-96 relative">
        <Image
          src="/images/carpenter-bee/carpenter-bee-hero.jpg"
          alt="Carpenter bee on wood surface in PA"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Urgency Banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 font-semibold text-base">
            <strong>They&apos;re already drilling.</strong> Spring is the critical treatment window.
            One untreated female this spring means 6–8 new bees this summer — each boring additional tunnels.
          </p>
        </div>
      </section>

      {/* What Are Carpenter Bees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">What Are Carpenter Bees?</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Carpenter bees are large, solitary bees common throughout southeastern Pennsylvania and
              northeastern Delaware. Unlike bumblebees, they don&apos;t live in colonies — each female
              bores into wood to create a nest gallery where she lays her eggs.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              They&apos;re often mistaken for bumblebees, but there&apos;s one easy way to tell them apart:{' '}
              <strong>look at the abdomen</strong>. A carpenter bee&apos;s abdomen is shiny, black, and
              hairless on top. A bumblebee&apos;s abdomen is fully covered in fuzzy hair.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Despite their intimidating size (¾ to 1 inch long), carpenter bees are generally docile.
              The males — the ones that hover near your face and buzz aggressively — can&apos;t sting at all.
              The females rarely sting unless directly handled.
            </p>
          </div>
        </div>
      </section>

      {/* Bee Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Carpenter Bee vs. Bumblebee vs. Honeybee
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The species in PA &amp; DE is the <strong>Eastern carpenter bee</strong> — here&apos;s how to tell them apart.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {beeComparison.map((bee) => (
              <div key={bee.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className={`h-2 ${bee.color}`} />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{bee.name}</h3>
                  <ul className="space-y-2">
                    {bee.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where They Bore */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Where Do Carpenter Bees Bore?</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Carpenter bees target <strong>unpainted, unfinished, or weathered wood</strong>.
                Painted wood is rarely attacked — the paint seals the surface they need to grip.
                They prefer softwoods like pine, cedar, and redwood, and they like wood at least 2 inches thick.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                <strong>Important:</strong> Carpenter bees do NOT eat wood. They excavate tunnels
                purely for shelter and nesting. The tunnels — called galleries — start as a perfectly
                round ½-inch entry hole, go in about 1–2 inches, then turn 90° to follow the wood grain.
                A single gallery can run 6–12 inches long. Over multiple years, successive generations
                can expand galleries up to 10 feet.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Common nesting locations:</h3>
              <ul className="space-y-3">
                {nestingLocations.map((loc) => (
                  <li key={loc} className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Damage Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-0">
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden">
          <Image
            src="/images/carpenter-bee/carpenter-bee-damage-closeup.jpg"
            alt="Close-up of carpenter bee holes and wood damage"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Signs Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Signs You Have Carpenter Bees</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Check your home for these telltale signs:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {signChecklist.map((item) => (
              <div key={item.text} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="text-gray-700 font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 inline-block font-medium">
              💡 <strong>Pro tip:</strong> If you see a yellowish, fan-shaped stain pattern below a
              round hole in your wood, that&apos;s almost certainly a carpenter bee gallery above.
            </p>
          </div>
        </div>
      </section>

      {/* Why Dangerous */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Carpenter Bees Are Dangerous</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Compounding Problem</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                One hole in your fascia board might seem like a minor cosmetic issue. It&apos;s not.
                Carpenter bees return to the same wood year after year. Each generation expands and branches the existing gallery system.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                One untreated female this spring means 6–8 new bees this summer, each boring additional tunnels.
                Over 3–5 years, this compounds into significant hollowing of structural beams, fascia boards, deck posts, and roof overhangs.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secondary Damage Adds Up</h3>
              <ul className="space-y-3">
                {[
                  'Moisture intrusion — open tunnels let water in, accelerating rot',
                  'Mold growth — from accumulated waste inside galleries',
                  'Woodpecker damage — woodpeckers are attracted to larvae and will hammer open your wood',
                  'Secondary pest infestations — galleries attract mites, beetles, and other insects',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Cost Reality</h3>
              <div className="space-y-4">
                <div className="border border-green-200 bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">If Treated Early</h4>
                  </div>
                  <p className="text-gray-700 font-medium">
                    Professional treatment: <span className="text-green-700 font-bold text-xl">hundreds</span> of dollars
                  </p>
                </div>
                <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">If Left Untreated for Years</h4>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>Replace a single fascia board: <strong className="text-amber-700">$500–$1,500+</strong></li>
                    <li>Deck post or structural beam repair: <strong className="text-amber-700">$1,000–$5,000+</strong></li>
                    <li>Extensive multi-year damage: <strong className="text-amber-700">$3,000–$10,000+</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Carpenter Bee Season in PA &amp; DE
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If you&apos;re seeing carpenter bees right now, you&apos;re right on schedule.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {seasonTimeline.map((item, index) => (
                <div key={index} className="relative flex items-start gap-6 pl-12">
                  <div
                    className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                      item.isNow
                        ? 'bg-green-600 border-green-600 ring-4 ring-green-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <div className={`flex-1 rounded-xl p-5 ${item.isNow ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className={`w-4 h-4 ${item.isNow ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold ${item.isNow ? 'text-green-700' : 'text-gray-500'}`}>
                        {item.period}
                      </span>
                      {item.isNow && (
                        <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-bold">NOW</span>
                      )}
                    </div>
                    <p className="text-gray-700">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 bg-green-700 text-white rounded-2xl p-8 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">Why Spring Is the Critical Treatment Window</h3>
            <p className="text-green-100 text-lg leading-relaxed mb-6">
              <strong>April and May are the ideal months for treatment.</strong> At this point,
              overwintered adults are concentrated in known galleries — before they mate and start new tunnels.
            </p>
            <Link
              href="/carpenter-bee-treatment"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors"
            >
              Schedule Spring Treatment
            </Link>
          </div>
        </div>
      </section>

      {/* DIY vs Pro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">DIY vs. Professional Treatment</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Issue</th>
                  <th className="px-6 py-4 text-left font-semibold">DIY Risk</th>
                  <th className="px-6 py-4 text-left font-semibold">APS Approach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {diyVsPro.map((row, i) => (
                  <tr key={row.title} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{row.title}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{row.diy}</td>
                    <td className="px-6 py-4 text-green-700 text-sm font-medium">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        id="contact-form"
        className="bg-green-50 border-y border-green-100 py-12 sm:py-16"
        aria-labelledby="cb-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:pt-4">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                🌸 Spring Treatment Window — Act Now
              </div>
              <h2
                id="cb-form-heading"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Claim 20% Off + Free Estimate<br />
                <span className="text-green-700">Use code CBT26</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                April and May are the ideal treatment months. Book your free inspection now before
                carpenter bees start new tunnels this season.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Response within 1–2 business hours',
                  'Licensed & insured in PA & DE',
                  'Free estimate, no commitment required',
                  '5.0 ⭐ rated by 500+ customers',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ConversionCard
                heading="Claim Your 20% Off + Free Estimate"
                defaultService="ant-wasp"
                trustItems={[
                  'Use code CBT26 at checkout',
                  'Licensed & insured in PA & DE',
                  'Response within 1–2 hours',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl p-4 mb-6 inline-block border-2 border-amber-400">
            <p className="text-sm font-bold text-amber-500 uppercase tracking-wide mb-0.5">Spring Special</p>
            <p className="text-2xl font-bold text-green-700">20% OFF with code CBT26</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Protect Your Home This Spring</h2>
          <p className="text-xl text-green-100 mb-8">
            Don&apos;t wait for the damage to get worse. Carpenter bees are active right now in PA &amp; DE,
            and every day counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-xl text-lg"
            >
              <Calendar size={20} />
              Get Free Estimate ↓
            </a>
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg"
            >
              <Phone size={20} />
              484-643-2225
            </a>
          </div>
          <p className="mt-6 text-green-200 text-sm">
            Also see: <Link href="/carpenter-bee-control" className="underline hover:text-white">Identification Guide →</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
