import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Bug } from "lucide-react";
import Header from "@/components/Header";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import SpringCarpenterBeeBanner from "@/components/spring-carpenter-bee-banner";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";
const PUBLISHED_DATE = "April 13, 2026";
const AUTHOR = "Absolute Pest Services";

export default function CarpenterBeeSeasonPost() {
  useEffect(() => {
    const removeSchema = (key: string) => {
      document.querySelector(`script[data-schema="${key}"]`)?.remove();
    };
    removeSchema("article-cb-season");
    removeSchema("breadcrumb-cb-season");

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Carpenter Bee Season in PA & DE — How to Protect Your Home This Spring",
      "description": "Carpenter bees are emerging across southeastern Pennsylvania and Delaware. Learn the signs, seasonal timeline, and how professional treatment prevents costly structural damage.",
      "author": { "@type": "Organization", "name": "Absolute Pest Services" },
      "publisher": {
        "@type": "Organization",
        "name": "Absolute Pest Services",
        "logo": { "@type": "ImageObject", "url": "https://absolutepestservices.com/logo.png" }
      },
      "datePublished": PUBLISHED_DATE,
      "dateModified": PUBLISHED_DATE,
      "mainEntityOfPage": "https://absolutepestservices.com/blog/carpenter-bee-season-pade"
    };
    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.setAttribute("data-schema", "article-cb-season");
    articleScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://absolutepestservices.com/blog" },
        { "@type": "ListItem", "position": 3, "name": "Carpenter Bee Season in PA & DE", "item": "https://absolutepestservices.com/blog/carpenter-bee-season-pade" }
      ]
    };
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.setAttribute("data-schema", "breadcrumb-cb-season");
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      removeSchema("article-cb-season");
      removeSchema("breadcrumb-cb-season");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Carpenter Bee Season in PA &amp; DE — Protect Your Home | APS</title>
        <meta name="description" content="Carpenter bees are drilling into PA & DE homes right now. Learn the signs, seasonal timeline, and how professional treatment prevents costly structural damage." />
        <link rel="canonical" href="https://absolutepestservices.com/blog/carpenter-bee-season-pade" />
        <meta property="og:title" content="Carpenter Bee Season in PA & DE — How to Protect Your Home This Spring" />
        <meta property="og:description" content="Carpenter bees are emerging across southeastern Pennsylvania and Delaware. Learn the signs, seasonal timeline, and how professional treatment prevents costly structural damage." />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={PUBLISHED_DATE} />
        <meta property="article:section" content="Seasonal Pest Control" />
      </Helmet>

      <Header />
      <SpringCarpenterBeeBanner />

      {/* Article Hero */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-white truncate">Carpenter Bee Season in PA & DE</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              Seasonal Pest Control
            </span>
            <span className="text-sm text-gray-400">{PUBLISHED_DATE}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Carpenter Bee Season in PA &amp; DE — How to Protect Your Home This Spring
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            If you heard buzzing near your eaves last weekend, you're not alone. Carpenter bees
            are emerging across southeastern Pennsylvania and northeastern Delaware right now —
            right on schedule.
          </p>
          <p className="text-sm text-gray-400">
            By <span className="text-white font-medium">{AUTHOR}</span>
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured image placeholder */}
          <div className="bg-gradient-to-br from-green-800 to-gray-700 h-64 rounded-xl mb-10 flex items-center justify-center">
            <Bug className="w-16 h-16 text-white/20 mr-4" />
            <span className="text-white/40">Carpenter bee on round hole in wood</span>
            <span className="sr-only">Carpenter bee at entry hole in wood surface</span>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              If you heard buzzing near your eaves last weekend, you're not alone. Carpenter bees
              are emerging across southeastern Pennsylvania and northeastern Delaware right now —
              right on schedule — and they're already looking for wood to bore into.
            </p>
            <p>
              For homeowners in the PA/DE corridor, April marks the start of carpenter bee season.
              And if you've had them before, you know those perfectly round holes in your fascia
              boards and deck posts aren't just ugly. They're the entrance to a tunnel system that
              gets worse every single year.
            </p>
            <p>
              Here's what you need to know about carpenter bees in Pennsylvania — and what to do
              about them before the damage compounds.
            </p>

            <h2>What Are Carpenter Bees?</h2>
            <p>
              Carpenter bees are large, solitary bees that bore into wood to create nesting galleries.
              The species found throughout Pennsylvania and Delaware is the Eastern carpenter bee
              (<em>Xylocopa virginica</em>) — a ¾- to 1-inch bee with a distinctive shiny,
              hairless black abdomen and a fuzzy yellow thorax.
            </p>
            <p>
              They're often confused with bumblebees, but the difference is easy to spot: bumblebees
              are fuzzy all over, including the abdomen. Carpenter bees have that glossy black rear
              end — it's the fastest way to tell them apart.
            </p>
            <p>
              <strong>A common misconception:</strong> Carpenter bees don't eat wood. They excavate
              tunnels purely for nesting. The tunnels — called galleries — start as a ½-inch round
              entry hole, go in about 1–2 inches perpendicular to the grain, then turn 90° to follow
              the wood fibers. A single gallery can run 6–12 inches long.
            </p>
            <p>
              <strong>Another misconception about danger:</strong> The large male carpenter bees that
              hover near your head and buzz aggressively? They can't sting. The females can sting
              but almost never do — you'd have to handle one to provoke it.
            </p>
            <p>The real danger isn't the sting. It's the damage.</p>

            <h2>Signs of Carpenter Bee Infestation</h2>
            <p>Look for these signs around your home:</p>
            <ul>
              <li><strong>Perfectly round holes</strong> (~½ inch diameter) in exterior wood — the telltale signature</li>
              <li><strong>Sawdust-like frass</strong> piled beneath entry holes</li>
              <li><strong>Buzzing sounds</strong> from inside the wood, especially near eaves</li>
              <li><strong>Fan-shaped yellow stains</strong> below holes — carpenter bee waste that eventually turns dark with mold</li>
              <li><strong>Bees hovering near wood surfaces</strong> — males patrolling, females entering and exiting</li>
              <li><strong>Woodpecker activity</strong> — woodpeckers hammer into galleries to eat larvae, creating massive secondary damage</li>
            </ul>
            <p>
              If you see round holes in unpainted or weathered wood, that's almost certainly carpenter
              bee activity. The damage is real and it's getting worse while you're reading this.
            </p>

            <h2>Carpenter Bee Season Timeline in PA &amp; DE</h2>
            <p>Here's how the carpenter bee season plays out in southeastern Pennsylvania and northeastern Delaware:</p>
            <ul>
              <li><strong>Mid-April to Early May:</strong> Adults emerge from overwintering tunnels as temperatures warm past 65°F. This is when you'll start seeing them.</li>
              <li><strong>Late April to May:</strong> Mating occurs. Females search for nest sites and begin boring — either new tunnels or cleaning out old ones for reuse.</li>
              <li><strong>May through July:</strong> This is the critical window. Females lay 6–8 eggs per gallery, each in its own sealed cell provisioned with pollen and nectar. This is when the most structural damage happens.</li>
              <li><strong>Late July through September:</strong> New adult bees emerge from the galleries and begin feeding on nectar before returning to overwinter in the tunnels.</li>
              <li><strong>October through March:</strong> Adults overwinter inside the galleries. No activity — but the damage is already done for the year.</li>
            </ul>

            <h2>Why Spring Is the Time to Act</h2>
            <p>
              The math on untreated carpenter bees is brutal. One female bee this spring produces 6–8
              offspring this summer. Each of those offspring expands the gallery system and potentially
              branches new tunnels. Over 3–5 years, what started as a single hole becomes a hollowed-out
              fascia board, a weakened deck post, or a compromised roof overhang.
            </p>
            <p>
              And once woodpeckers find the larvae inside those galleries, the damage accelerates
              dramatically. Woodpeckers don't peck politely — they tear open wood to get to the food inside.
            </p>
            <p>
              The cost comparison is stark: professional carpenter bee treatment is a modest investment.
              Replacing a damaged fascia board can run $500 to $1,500. A structural beam or deck post
              replacement? $1,000 to $5,000. Extensive multi-year damage across multiple locations?
              $3,000 to $10,000 or more.
            </p>
            <p>
              <strong>The earlier you treat, the smaller the problem stays.</strong>
            </p>

            <h2>How to Protect Your Home</h2>
            <p>There are a few things homeowners can do on their own:</p>
            <ul>
              <li><strong>Paint or seal all exposed exterior wood</strong> — painted surfaces are rarely attacked</li>
              <li><strong>Repair cracks, nail holes, and splinters</strong> — these give bees a head start</li>
              <li><strong>Inspect annually</strong> — check eaves, fascia, decks, and siding for new holes each spring</li>
            </ul>
            <p>
              But when it comes to treatment, professional help makes a real difference. DIY carpenter
              bee treatment has common pitfalls:
            </p>
            <ul>
              <li>Sealing holes too early traps bees inside without contacting treatment</li>
              <li>You can only see and treat the visible holes — not the full branched gallery system</li>
              <li>Insecticidal dust requires proper application technique and safety precautions</li>
              <li>Timing matters: there's a reason to treat in spring, again in mid-summer, and a third time in fall</li>
            </ul>
            <p>
              A professional treatment done correctly — dust application into galleries, proper waiting
              period before sealing, follow-up inspection — eliminates the infestation and sets you up
              for prevention.
            </p>

            <h2>Protect Your PA or DE Home This Spring</h2>
            <p>
              Carpenter bee season in Pennsylvania is here. The bees are emerging, the females are
              boring, and the galleries are growing.
            </p>
            <p>
              <strong>Absolute Pest Services</strong> provides professional carpenter bee inspection and
              treatment throughout southeastern Pennsylvania and northeastern Delaware. We follow the
              right protocol — inspect, treat the full gallery, seal properly, and monitor through the
              season — so you don't have to deal with this again next year.
            </p>
            <p>
              <strong>Call {PHONE_NUMBER}</strong> or{" "}
              <Link href="/contact" className="text-[hsl(132,48%,35%)] underline">contact us online</Link>{" "}
              to schedule your carpenter bee inspection. Free estimates. Same-day and next-day
              appointments available during peak season.
            </p>
            <p>
              Don't wait for the holes to multiply. Act now — before the damage compounds.
            </p>
            {/* CBT26 Coupon Mention */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 my-8">
              <p className="text-lg font-semibold text-[hsl(132,48%,35%)] mb-2">
                🌸 Spring Special: 20% OFF Carpenter Bee Treatment
              </p>
              <p className="text-gray-700">
                Use coupon code{" "}
                <span className="font-mono font-bold text-[hsl(132,48%,35%)]">CBT26</span>{" "}
                when booking your carpenter bee treatment this spring. Valid for new customers in PA &amp; DE.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link href="/blog" className="text-[hsl(132,48%,35%)] font-medium hover:text-[hsl(132,48%,25%)] text-sm">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-green-50 border-t border-green-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Have Carpenter Bees? Act Now.
          </h2>
          <p className="text-gray-600 mb-6">
            Spring treatment is the most effective. Don't let the damage compound.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(132,48%,35%)] hover:bg-[hsl(132,48%,25%)] text-white font-bold px-8 py-4">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Inspection
              </Button>
            </ScheduleInspectionModal>
            <a href={PHONE_HREF}>
              <Button variant="outline" className="border-[hsl(132,48%,35%)] text-[hsl(132,48%,35%)] hover:bg-green-50 font-bold px-8 py-4">
                <Phone className="mr-2 h-5 w-5" />
                {PHONE_NUMBER}
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Use code <span className="font-mono font-semibold">CBT26</span> for 20% off your treatment.
          </p>
        </div>
      </section>
    </div>
  );
}
