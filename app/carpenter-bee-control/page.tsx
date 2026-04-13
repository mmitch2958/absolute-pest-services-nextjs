import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Carpenter Bee Control & Identification Guide | Absolute Pest Services',
  description:
    'Learn to identify carpenter bees, spot the signs of infestation, and understand the damage they cause. Expert carpenter bee info for PA & DE homeowners from Absolute Pest Services.',
  alternates: { canonical: 'https://absolutepestservices.com/carpenter-bee-control' },
  openGraph: {
    title: 'Carpenter Bee Control & Identification Guide | Absolute Pest Services',
    description: 'Learn to identify carpenter bees, spot the signs of infestation, and understand the damage they cause.',
    url: 'https://absolutepestservices.com/carpenter-bee-control',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Carpenter Bee Control & Information',
  description: 'Learn how to identify carpenter bees, spot damage early, and protect your PA & DE home from wood-boring damage.',
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
    { '@type': 'State', name: 'Pennsylvania' },
    { '@type': 'State', name: 'Delaware' },
  ],
  serviceType: 'Carpenter Bee Control',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between a carpenter bee and a bumblebee?',
      acceptedAnswer: { '@type': 'Answer', text: 'Look at the abdomen. A carpenter bee has a shiny, black, hairless abdomen. A bumblebee is fuzzy all over, including the abdomen. This is the fastest way to tell them apart.' },
    },
    {
      '@type': 'Question',
      name: 'Do carpenter bees sting?',
      acceptedAnswer: { '@type': 'Answer', text: 'Male carpenter bees cannot sting. The females can sting but rarely do — you\'d have to handle one directly to provoke it. The real danger from carpenter bees is structural damage, not stings.' },
    },
    {
      '@type': 'Question',
      name: 'What does carpenter bee damage look like?',
      acceptedAnswer: { '@type': 'Answer', text: 'The signature sign is perfectly round holes about 1/2 inch in diameter in exterior wood. You may also see sawdust-like frass beneath holes, fan-shaped yellow stains (bee waste), and bees hovering near wood surfaces.' },
    },
    {
      '@type': 'Question',
      name: 'Do carpenter bees eat wood?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Carpenter bees do not eat wood. They excavate tunnels purely for nesting. The galleries can run 6–12 inches long and are expanded year after year by successive generations.' },
    },
    {
      '@type': 'Question',
      name: 'When is carpenter bee season in PA and DE?',
      acceptedAnswer: { '@type': 'Answer', text: 'Carpenter bee season in southeastern Pennsylvania and Delaware runs from mid-April through August. Adults emerge in April/May, females lay eggs May–July, and new adults emerge in late July–September.' },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://absolutepestservices.com/' },
    { '@type': 'ListItem', position: 2, name: 'Carpenter Bee Control', item: 'https://absolutepestservices.com/carpenter-bee-control' },
  ],
}

export default function CarpenterBeeControlPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Carpenter Bee Control</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Carpenter Bees Are Drilling Into PA &amp; DE Homes Right Now
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Spring has arrived, and so have the carpenter bees. Learn how to identify them,
            spot the damage early, and protect your home before the holes multiply.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/carpenter-bee-treatment"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <Calendar className="h-5 w-5" />
              Schedule Free Inspection
            </Link>
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-xl transition-colors"
            >
              <Phone className="h-5 w-5" />
              484-643-2225
            </a>
          </div>
        </div>
      </section>

      {/* What Are Carpenter Bees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">What Are Carpenter Bees?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-600 mb-4">
                Carpenter bees are large, solitary bees common throughout southeastern Pennsylvania and
                northeastern Delaware. Unlike bumblebees, they don&apos;t live in colonies — each female
                bores into wood to create a nest gallery where she lays her eggs.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                They&apos;re often mistaken for bumblebees, but there&apos;s one easy way to tell them apart:{' '}
                <strong>look at the abdomen</strong>. A carpenter bee&apos;s abdomen is shiny, black, and
                hairless on top. A bumblebee&apos;s abdomen is fully covered in fuzzy hair.
              </p>
              <p className="text-lg text-gray-600">
                Despite their intimidating size (¾ to 1 inch long), carpenter bees are generally
                docile. The males — the ones that hover near your face and buzz aggressively — can&apos;t
                sting at all. The females rarely sting unless directly handled.
              </p>
            </div>
            <div className="relative h-64 lg:h-auto rounded-2xl overflow-hidden">
              <Image
                src="/images/carpenter-bee/carpenter-bee-hero.jpg"
                alt="Carpenter bee on wood surface"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Carpenter Bee vs. Bumblebee vs. Honeybee
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-left font-semibold">Carpenter Bee</th>
                  <th className="px-6 py-4 text-left font-semibold">Bumblebee</th>
                  <th className="px-6 py-4 text-left font-semibold">Honeybee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Size', '¾–1 inch', '½–1 inch', '~½ inch'],
                  ['Abdomen', 'Shiny, bare, black', 'Fully fuzzy, yellow/black', 'Fuzzy, golden-brown striped'],
                  ['Thorax', 'Yellow fuzz', 'Yellow/black fuzz', 'Golden-brown fuzz'],
                  ['Nesting', 'Drills into wood', 'Underground colonies', 'Hive (wax comb)'],
                  ['Behavior', 'Solitary', 'Social (colony)', 'Social (colony)'],
                ].map(([feature, cb, bb, hb], i) => (
                  <tr key={feature} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-gray-800">{feature}</td>
                    <td className="px-6 py-4 text-gray-600">{cb}</td>
                    <td className="px-6 py-4 text-gray-600">{bb}</td>
                    <td className="px-6 py-4 text-gray-600">{hb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            The species found in the PA/DE region is the{' '}
            <strong>Eastern carpenter bee (<em>Xylocopa virginica</em>)</strong>, the only
            species commonly encountered in this area.
          </p>
        </div>
      </section>

      {/* Where They Bore */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Where Do Carpenter Bees Bore?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Carpenter bees target <strong>unpainted, unfinished, or weathered wood</strong>.
            Painted wood is rarely attacked. They prefer softwoods like pine, cedar, and redwood.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              'Roof eaves and soffits', 'Fascia boards', 'Deck railings, posts, and framing',
              'Porch columns and overhead overhangs', 'Wooden siding and shingles',
              'Window and door frames', 'Fence posts', 'Outdoor furniture', 'Shed walls and outbuildings',
            ].map((location) => (
              <div key={location} className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
                {location}
              </div>
            ))}
          </div>
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-lg text-amber-800">
              <strong>Important:</strong> Carpenter bees do NOT eat wood. The tunnels — called galleries — start
              as a perfectly round ½-inch entry hole, go in about 1–2 inches, then turn 90° to follow the wood grain.
              A single gallery can run 6–12 inches long.
            </p>
          </div>
        </div>
      </section>

      {/* Signs of Infestation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Signs You Have Carpenter Bees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { title: 'Perfectly round holes (~½ inch diameter)', desc: 'The signature mark of carpenter bees in exterior wood surfaces.' },
              { title: 'Sawdust-like frass beneath holes', desc: 'Pushed out during boring — looks like coarse sawdust.' },
              { title: 'Buzzing or droning sounds from within wood', desc: 'Especially near eaves and overhangs.' },
              { title: 'Fan-shaped yellow stains below holes', desc: 'Sticky waste that eventually turns dark with mold.' },
              { title: 'Large bees hovering near wood', desc: 'Males patrolling territory, females entering and exiting holes.' },
              { title: 'Woodpecker damage nearby', desc: 'Woodpeckers hammer into galleries to eat larvae, creating additional destruction.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Damage image */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/carpenter-bee/carpenter-bee-damage-closeup.jpg"
              alt="Close-up of carpenter bee holes and wood damage"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Dangerous */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Carpenter Bees Are Dangerous</h2>
          <p className="text-lg text-gray-600 mb-8">One hole in your fascia board might seem like a minor cosmetic issue. It&apos;s not.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              'Moisture intrusion — open tunnels let water in, accelerating rot',
              'Mold growth — from accumulated waste inside galleries',
              'Woodpecker damage — dramatically worsens the situation',
              'Secondary pest infestations — mites, beetles, other wood-destroying insects',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-700">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">The Cost Reality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-4">If Treated Early</h4>
                <p className="text-3xl font-bold text-green-700">Hundreds of dollars</p>
                <p className="text-gray-600 mt-2">Professional carpenter bee treatment</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-red-200">
                <h4 className="font-semibold text-red-600 mb-4">If Left Untreated for Years</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>Single fascia board replacement: $500–$1,500+</li>
                  <li>Deck post or structural beam repair: $1,000–$5,000+</li>
                  <li>Extensive multi-year damage: $3,000–$10,000+</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Carpenter Bee Season in PA &amp; DE</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Timeframe</th>
                  <th className="px-6 py-4 text-left font-semibold">What&apos;s Happening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Mid-April – Early May', 'Adults emerge from overwintering tunnels as temperatures reach 65–70°F.'],
                  ['Late April – May', 'Mating occurs. Females search for nest sites and begin boring new tunnels.'],
                  ['May – July', 'Peak boring and egg-laying season. Females create 6–8 brood cells per gallery.'],
                  ['July – August', 'Larvae develop and pupate inside sealed cells.'],
                  ['Late July – September', 'New adult bees emerge from tunnels and begin feeding on nectar.'],
                  ['October – March', 'Adults overwinter inside existing galleries. No activity during cold months.'],
                ].map(([time, event], i) => (
                  <tr key={time} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">{time}</td>
                    <td className="px-6 py-4 text-gray-600">{event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-xl font-bold text-green-700 mb-3">Why Spring Is the Critical Treatment Window</h3>
            <p className="text-gray-700 mb-3">
              <strong>April and May are the ideal months for treatment.</strong> At this point,
              overwintered adults are concentrated in known galleries — before they mate and start new tunnels.
            </p>
            <ul className="space-y-2 text-gray-700">
              {[
                'Killing one female in spring prevents 6–8 new bees from that gallery this summer.',
                'Treating early means fewer galleries to address and a smaller overall infestation.',
                'Every week of delay means more eggs laid in more holes.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DIY vs Pro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">DIY vs. Professional Treatment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-red-700 mb-4">Why DIY Often Falls Short</h3>
              <ul className="space-y-3">
                {[
                  'Misidentification — treating bumblebees or honeybees by mistake',
                  'Sealing holes too early traps bees inside without contacting the treatment',
                  'Incomplete treatment of branched gallery systems',
                  'Insecticidal dust requires proper application and safety equipment',
                  'Can\'t safely reach second-story eaves and soffits',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">The APS Approach</h3>
              <ul className="space-y-3">
                {[
                  'Correct species identification before any treatment begins',
                  'Properly timed applications — bees contact treatment before sealing',
                  'Complete gallery system treatment, not just visible holes',
                  'Licensed technicians with proper safety equipment',
                  'Return to seal 1–2 weeks post-treatment for best results',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
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
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Protect Your Home?</h2>
          <p className="text-xl text-green-100 mb-8">
            Don&apos;t wait for the damage to get worse. Carpenter bees are active right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/carpenter-bee-treatment"
              className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-xl text-lg"
            >
              <Calendar className="h-5 w-5" />
              Get Free Estimate
            </Link>
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg"
            >
              <Phone className="h-5 w-5" />
              484-643-2225
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
