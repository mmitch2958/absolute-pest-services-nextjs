import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Phone, Calendar, ArrowLeft, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import QuoteRequestModal from '@/components/quote-request-modal'

const PHONE = '484-643-2225'

const tableOfContents = [
  { id: 'what-are-carpenter-bees', label: 'What Are Carpenter Bees?' },
  { id: 'signs-of-infestation', label: 'Signs of Carpenter Bee Infestation' },
  { id: 'season-timeline', label: 'Season Timeline in PA & DE' },
  { id: 'why-spring', label: 'Why Spring Is the Time to Act' },
  { id: 'protect-your-home', label: 'How to Protect Your Home' },
  { id: 'cta', label: 'Schedule Your Inspection' },
]

const signsList = [
  { label: 'Perfectly round holes (~½ inch diameter) in exterior wood', detail: 'The telltale signature of carpenter bee activity' },
  { label: 'Sawdust-like frass piled beneath entry holes', detail: 'Pushed out during the boring process' },
  { label: 'Buzzing sounds from inside the wood, especially near eaves', detail: '' },
  { label: 'Fan-shaped yellow stains below holes', detail: 'Carpenter bee waste that darkens with mold over time' },
  { label: 'Bees hovering near wood surfaces', detail: 'Males patrolling, females entering and exiting' },
  { label: 'Woodpecker activity nearby', detail: 'They peck into galleries to eat the larvae inside' },
]

const timelineData = [
  { period: 'Mid-April to Early May', event: 'Adults emerge from overwintering tunnels as temperatures warm past 65°F' },
  { period: 'Late April to May', event: 'Mating occurs; females search for nest sites and begin boring — new tunnels or cleaned-out old ones' },
  { period: 'May through July', event: 'Females lay 6–8 eggs per gallery. This is when the most structural damage happens' },
  { period: 'Late July through September', event: 'New adult bees emerge and feed on nectar before returning to overwinter in the tunnels' },
  { period: 'October through March', event: 'Adults overwinter inside the galleries. No activity — but the damage accumulates year after year' },
]

const protectionTips = [
  {
    title: 'Paint or seal all exposed exterior wood',
    detail: 'Painted surfaces are rarely attacked. Paint seals the surface carpenter bees need to grip and bore into.',
  },
  {
    title: 'Repair cracks, nail holes, and splinters',
    detail: 'These give bees a head start — tiny entry points make boring easier.',
  },
  {
    title: 'Inspect annually',
    detail: 'Check eaves, fascia boards, decks, and siding for new holes each spring as temperatures rise.',
  },
]

export default function CarpenterBeeSeasonBlogPost() {
  useEffect(() => {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Carpenter Bee Season in PA & DE — How to Protect Your Home This Spring',
      description:
        'Carpenter bees are drilling into PA & DE homes right now. Learn the signs, seasonal timeline, and how professional treatment prevents costly structural damage.',
      author: { '@type': 'Organization', name: 'Absolute Pest Services' },
      publisher: {
        '@type': 'LocalBusiness',
        name: 'Absolute Pest Services',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '21 Sheffield Dr',
          addressLocality: 'West Grove',
          addressRegion: 'PA',
          postalCode: '19390',
        },
      },
      datePublished: '2026-04-13',
      dateModified: '2026-04-13',
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-schema', 'article-carpenter-bee-season')
    script.textContent = JSON.stringify(articleSchema)
    document.head.appendChild(script)
    return () => script.remove()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Carpenter Bee Season in PA & DE | Protect Your Home | APS</title>
        <meta
          name="description"
          content="Carpenter bees are drilling into PA & DE homes right now. Learn the signs, seasonal timeline, and how professional treatment prevents costly structural damage."
        />
        <link rel="canonical" href="https://absolutepestservices.com/blog/carpenter-bee-season-pa-de" />
        <meta property="og:title" content="Carpenter Bee Season in PA & DE — How to Protect Your Home This Spring" />
        <meta
          property="og:description"
          content="Carpenter bees are already drilling into PA & DE homes. Learn the signs, timeline, and why spring treatment prevents thousands in structural repairs."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://absolutepestservices.com/blog/carpenter-bee-season-pa-de" />
        <meta name="author" content="Absolute Pest Services" />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-green-700">Home</a></li>
              <li>/</li>
              <li><a href="/blog" className="hover:text-green-700">Blog</a></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Carpenter Bee Season in PA & DE</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              Seasonal Pest Control
            </span>
            <span className="text-xs text-gray-400">April 13, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Carpenter Bee Season in PA &amp; DE — How to Protect Your Home This Spring
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Carpenter bees are emerging across southeastern Pennsylvania and northeastern Delaware
            right now — and they&apos;re already looking for wood to bore into. Here&apos;s what you
            need to know before the damage compounds.
          </p>
          <p className="text-sm text-gray-400">
            By <span className="text-white font-medium">Absolute Pest Services</span>
          </p>
        </div>
      </section>

      {/* Featured image placeholder */}
      <div className="w-full bg-gradient-to-br from-green-800 to-gray-700 h-64 sm:h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐝</div>
          <p className="text-green-200 text-sm">Carpenter bee season — spring in PA & DE</p>
        </div>
      </div>

      {/* Article Body */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            If you heard buzzing near your eaves last weekend, you&apos;re not alone. Carpenter bees
            are emerging across southeastern Pennsylvania and northeastern Delaware right now —
            right on schedule — and they&apos;re already looking for wood to bore into.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            For homeowners in the PA/DE corridor, April marks the start of carpenter bee season.
            And if you&apos;ve had them before, you know those perfectly round holes in your fascia
            boards and deck posts aren&apos;t just ugly. They&apos;re the entrance to a tunnel system
            that gets worse every single year.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Here&apos;s what you need to know about carpenter bees in Pennsylvania — and what to do
            about them before the damage compounds.
          </p>

          {/* Section 1 */}
          <div id="what-are-carpenter-bees" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              What Are Carpenter Bees?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Carpenter bees are large, solitary bees that bore into wood to create nesting galleries.
              The species found throughout Pennsylvania and Delaware is the Eastern carpenter bee
              (<em>Xylocopa virginica</em>) — a ¾- to 1-inch bee with a distinctive shiny, hairless
              black abdomen and a fuzzy yellow thorax.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              They&apos;re often confused with bumblebees, but the difference is easy to spot:
              bumblebees are fuzzy all over, including the abdomen. Carpenter bees have that
              glossy black rear end — it&apos;s the fastest way to tell them apart.
            </p>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
              <p className="text-gray-700 font-medium mb-2">
                <strong>A common misconception:</strong> Carpenter bees don&apos;t eat wood. They
                excavate tunnels purely for nesting. The tunnels — called galleries — start as a
                ½-inch round entry hole, go in about 1–2 inches perpendicular to the grain, then
                turn 90° to follow the wood fibers. A single gallery can run 6–12 inches long.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-gray-700 font-medium mb-2">
                <strong>Another misconception about danger:</strong> The large male carpenter bees
                that hover near your head and buzz aggressively? They can&apos;t sting. The females
                can sting but almost never do — you&apos;d have to handle one to provoke it.
              </p>
              <p className="text-gray-700 font-medium">
                The real danger isn&apos;t the sting. It&apos;s the damage.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div id="signs-of-infestation" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Signs of Carpenter Bee Infestation
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Look for these signs around your home:
            </p>
            <div className="space-y-4 mb-6">
              {signsList.map((sign) => (
                <div key={sign.label} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                  <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-2" />
                  <div>
                    <p className="text-gray-800 font-semibold">{sign.label}</p>
                    {sign.detail && (
                      <p className="text-gray-500 text-sm mt-1">{sign.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm font-medium">
              If you see round holes in unpainted or weathered wood, that&apos;s almost certainly
              carpenter bee activity. The damage is real and it&apos;s getting worse while you&apos;re
              reading this.
            </p>
          </div>

          {/* Section 3 */}
          <div id="season-timeline" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Carpenter Bee Season Timeline in PA &amp; DE
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Here&apos;s how the carpenter bee season plays out in southeastern Pennsylvania and
              northeastern Delaware:
            </p>
            <div className="space-y-4 mb-8">
              {timelineData.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 border-l-2 border-green-200 pl-4 pb-6 last:border-transparent last:pb-0">
                    <p className="font-bold text-gray-900 mb-1">{item.period}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div id="why-spring" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Why Spring Is the Time to Act
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              The math on untreated carpenter bees is brutal. One female bee this spring produces
              6–8 offspring this summer. Each of those offspring expands the gallery system and
              potentially branches new tunnels. Over 3–5 years, what started as a single hole
              becomes a hollowed-out fascia board, a weakened deck post, or a compromised roof
              overhang.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              And once woodpeckers find the larvae inside those galleries, the damage accelerates
              dramatically. Woodpeckers don&apos;t peck politely — they tear open wood to get to the
              food inside.
            </p>

            {/* Cost callout */}
            <Card className="bg-gray-50 border-gray-200 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">The Cost Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="font-bold text-green-700 mb-1">Professional treatment</p>
                    <p className="text-gray-700 text-2xl font-extrabold">$200–$500</p>
                    <p className="text-gray-500 text-sm">A modest investment that works</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="font-bold text-amber-700 mb-1">Untreated over years</p>
                    <p className="text-gray-700 text-2xl font-extrabold">$1,000–$10,000+</p>
                    <p className="text-gray-500 text-sm">Structural repairs add up fast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-xl font-bold text-gray-900">
              The earlier you treat, the smaller the problem stays.
            </p>
          </div>

          {/* Section 5 */}
          <div id="protect-your-home" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              How to Protect Your Home
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              There are a few things homeowners can do on their own:
            </p>
            <div className="space-y-4 mb-8">
              {protectionTips.map((tip) => (
                <div key={tip.title} className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
                  <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-2" />
                  <div>
                    <p className="font-bold text-gray-900">{tip.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{tip.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              But when it comes to treatment, professional help makes a real difference. DIY
              carpenter bee treatment has common pitfalls:
            </p>
            <ul className="space-y-2 text-gray-700 mb-8">
              {[
                'Sealing holes too early traps bees inside without contacting treatment',
                'You can only see and treat the visible holes — not the full branched gallery system',
                'Insecticidal dust requires proper application technique and safety precautions',
                'Timing matters: treat in spring, again in mid-summer, and a third time in fall',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed">
              A professional treatment done correctly — dust application into galleries, proper
              waiting period before sealing, follow-up inspection — eliminates the infestation
              and sets you up for prevention.
            </p>
          </div>

          {/* Tags */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            {['carpenter bee', 'PA pest control', 'DE pest control', 'seasonal pest control', 'spring pests', 'wood damage'].map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-8">
            <a href="/blog" className="text-green-700 font-medium hover:text-green-800 text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to all posts
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-12 bg-green-50 border-t border-green-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Protect Your PA or DE Home This Spring
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Carpenter bee season in Pennsylvania is here. The bees are emerging, the females are
            boring, and the galleries are growing. Don&apos;t wait for the holes to multiply — act now
            before the damage compounds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-xl"
            >
              <Phone size={20} />
              {PHONE}
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 border border-green-700 text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-xl"
            >
              <Calendar size={20} />
              Schedule Online
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Free estimates. Same-day and next-day appointments available during peak season.
          </p>
        </div>
      </section>
    </div>
  )
}