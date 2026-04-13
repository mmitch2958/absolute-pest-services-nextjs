import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, CheckCircle, Bug, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import SpringCarpenterBeeBanner from "@/components/spring-carpenter-bee-banner";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";

export default function CarpenterBeeControl() {
  useEffect(() => {
    const removeSchema = (key: string) => {
      document.querySelector(`script[data-schema="${key}"]`)?.remove();
    };
    removeSchema("service-cb-info");
    removeSchema("faq-cb-info");
    removeSchema("breadcrumb-cb-info");

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Carpenter Bee Control & Information",
      "description": "Learn how to identify carpenter bees, spot damage early, and protect your PA & DE home from wood-boring damage. Expert guidance from Absolute Pest Services.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Absolute Pest Services",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "21 Sheffield Dr",
          "addressLocality": "West Grove",
          "addressRegion": "PA",
          "postalCode": "19390",
          "addressCountry": "US"
        },
        "telephone": PHONE_NUMBER
      },
      "areaServed": [
        { "@type": "State", "name": "Pennsylvania" },
        { "@type": "State", "name": "Delaware" }
      ],
      "serviceType": "Carpenter Bee Control"
    };
    const svcScript = document.createElement("script");
    svcScript.type = "application/ld+json";
    svcScript.setAttribute("data-schema", "service-cb-info");
    svcScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(svcScript);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the difference between a carpenter bee and a bumblebee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Look at the abdomen. A carpenter bee has a shiny, black, hairless abdomen. A bumblebee is fuzzy all over, including the abdomen. This is the fastest way to tell them apart."
          }
        },
        {
          "@type": "Question",
          "name": "Do carpenter bees sting?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Male carpenter bees cannot sting. The females can sting but rarely do — you'd have to handle one directly to provoke it. The real danger from carpenter bees is structural damage, not stings."
          }
        },
        {
          "@type": "Question",
          "name": "What does carpenter bee damage look like?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The signature sign is perfectly round holes about 1/2 inch in diameter in exterior wood. You may also see sawdust-like frass beneath holes, fan-shaped yellow stains (bee waste), and bees hovering near wood surfaces."
          }
        },
        {
          "@type": "Question",
          "name": "Do carpenter bees eat wood?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Carpenter bees do not eat wood. They excavate tunnels purely for nesting. The galleries can run 6–12 inches long and are expanded year after year by successive generations."
          }
        },
        {
          "@type": "Question",
          "name": "When is carpenter bee season in PA and DE?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Carpenter bee season in southeastern Pennsylvania and Delaware runs from mid-April through August. Adults emerge in April/May, females lay eggs May–July, and new adults emerge in late July–September."
          }
        }
      ]
    };
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-schema", "faq-cb-info");
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Carpenter Bee Control", "item": "https://absolutepestservices.com/carpenter-bee-control" }
      ]
    };
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.setAttribute("data-schema", "breadcrumb-cb-info");
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      removeSchema("service-cb-info");
      removeSchema("faq-cb-info");
      removeSchema("breadcrumb-cb-info");
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Carpenter Bee Control &amp; Identification Guide | Absolute Pest Services</title>
        <meta name="description" content="Learn to identify carpenter bees, spot the signs of infestation, and understand the damage they cause. Expert carpenter bee info for PA & DE homeowners from Absolute Pest Services." />
        <link rel="canonical" href="https://absolutepestservices.com/carpenter-bee-control" />
      </Helmet>

      <Header />
      <SpringCarpenterBeeBanner />

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
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
            <a href={PHONE_HREF}>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold">
                <Phone className="mr-2 h-5 w-5" />
                {PHONE_NUMBER}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What Are Carpenter Bees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">What Are Carpenter Bees?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-600 mb-4">
                Carpenter bees are large, solitary bees common throughout southeastern Pennsylvania and
                northeastern Delaware. Unlike bumblebees, they don't live in colonies — each female
                bores into wood to create a nest gallery where she lays her eggs.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                They're often mistaken for bumblebees, but there's one easy way to tell them apart:{" "}
                <strong>look at the abdomen</strong>. A carpenter bee's abdomen is shiny, black, and
                hairless on top. A bumblebee's abdomen is fully covered in fuzzy hair.
              </p>
              <p className="text-lg text-gray-600">
                Despite their intimidating size (¾ to 1 inch long), carpenter bees are generally
                docile. The males — the ones that hover near your face and buzz aggressively — can't
                sting at all. The females rarely sting unless directly handled.
              </p>
            </div>
            <div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* TODO: Replace with actual image after Leia generates images/carpenter-bee-hero.png */}
                  <div className="bg-gradient-to-br from-green-800 to-gray-700 h-64 flex items-center justify-center">
                    <Bug className="w-16 h-16 text-white/30" />
                    <span className="sr-only">Carpenter bee on wood surface</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-8 text-center">
            Carpenter Bee vs. Bumblebee vs. Honeybee
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-[hsl(132,48%,35%)] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-left font-semibold">Carpenter Bee</th>
                  <th className="px-6 py-4 text-left font-semibold">Bumblebee</th>
                  <th className="px-6 py-4 text-left font-semibold">Honeybee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Size", "¾–1 inch", "½–1 inch", "~½ inch"],
                  ["Abdomen", "Shiny, bare, black", "Fully fuzzy, yellow/black", "Fuzzy, golden-brown striped"],
                  ["Thorax", "Yellow fuzz", "Yellow/black fuzz", "Golden-brown fuzz"],
                  ["Nesting", "Drills into wood", "Underground colonies", "Hive (wax comb)"],
                  ["Behavior", "Solitary", "Social (colony)", "Social (colony)"]
                ].map(([feature, cb, bb, hb], i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 font-semibold text-[hsl(210,13%,28%)]">{feature}</td>
                    <td className="px-6 py-4 text-gray-600">{cb}</td>
                    <td className="px-6 py-4 text-gray-600">{bb}</td>
                    <td className="px-6 py-4 text-gray-600">{hb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            The species found in the PA/DE region is the{" "}
            <strong>Eastern carpenter bee (<em>Xylocopa virginica</em>)</strong> — the only
            species commonly encountered in this area, according to Penn State Extension.
          </p>
        </div>
      </section>

      {/* Where Carpenter Bees Bore */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
            Where Do Carpenter Bees Bore?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Carpenter bees target <strong>unpainted, unfinished, or weathered wood</strong>.
            Painted wood is rarely attacked — the paint seals the surface they need to grip.
            They prefer softwoods like pine, cedar, and redwood, and wood at least 2 inches thick.
          </p>
          <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-4">
            Common nesting locations around your home:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Roof eaves and soffits",
              "Fascia boards",
              "Deck railings, posts, and framing",
              "Porch columns and overhead overhangs",
              "Wooden siding and shingles",
              "Window and door frames",
              "Fence posts",
              "Outdoor furniture",
              "Shed walls and outbuildings"
            ].map((location) => (
              <div key={location} className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-[hsl(132,48%,35%)] flex-shrink-0" />
                {location}
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-lg text-amber-800">
              <strong>Important:</strong> Carpenter bees do NOT eat wood. They excavate tunnels
              purely for shelter and nesting. The tunnels — called galleries — start as a perfectly
              round ½-inch entry hole, go in about 1–2 inches, then turn 90° to follow the wood
              grain. A single gallery can run 6–12 inches long. Over multiple years, successive
              generations can expand galleries up to 10 feet.
            </p>
          </div>
        </div>
      </section>

      {/* Signs of Infestation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
            Signs You Have Carpenter Bees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Perfectly round holes (~½ inch diameter)",
                desc: "The signature mark of carpenter bees in exterior wood surfaces."
              },
              {
                title: "Sawdust-like frass beneath holes",
                desc: "Pushed out during boring — looks like coarse sawdust."
              },
              {
                title: "Buzzing or droning sounds from within wood",
                desc: "Especially near eaves and overhangs."
              },
              {
                title: "Fan-shaped yellow stains below holes",
                desc: "Sticky waste that eventually turns dark with mold."
              },
              {
                title: "Large bees hovering near wood",
                desc: "Males patrolling territory, females entering and exiting holes."
              },
              {
                title: "Woodpecker damage nearby",
                desc: "Woodpeckers hammer into galleries to eat larvae, creating additional destruction."
              }
            ].map(({ title, desc }) => (
              <Card key={title} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(210,13%,28%)] mb-1">{title}</h3>
                      <p className="text-gray-600 text-sm">{desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Damage close-up image placeholder */}
          <div className="mt-8 bg-gradient-to-br from-gray-700 to-gray-900 h-64 rounded-xl flex items-center justify-center">
            <Bug className="w-16 h-16 text-white/20 mr-4" />
            <span className="text-white/40">Carpenter bee damage close-up image</span>
            <span className="sr-only">Close-up of carpenter bee holes and wood damage</span>
          </div>
        </div>
      </section>

      {/* Why Carpenter Bees Are Dangerous */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
            Why Carpenter Bees Are Dangerous
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            One hole in your fascia board might seem like a minor cosmetic issue. It's not.
          </p>

          <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-4">The Compounding Problem</h3>
          <p className="text-lg text-gray-600 mb-6">
            Carpenter bees return to the same wood year after year. Each generation expands
            and branches the existing gallery system. One untreated female this spring means
            6–8 new bees this summer, each boring additional tunnels.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Over 3–5 years, this compounds into significant hollowing of{" "}
            <strong>structural beams, fascia boards, deck posts, and roof overhangs</strong>.
          </p>

          <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-4">Secondary Damage Adds Up</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              "Moisture intrusion — open tunnels let water in, accelerating rot",
              "Mold growth — from accumulated waste inside galleries",
              "Woodpecker damage — dramatically worsens the situation",
              "Secondary pest infestations — mites, beetles, other wood-destroying insects"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-700">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* Cost Comparison */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[hsl(210,13%,28%)] mb-6 text-center">
                The Cost Reality
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-[hsl(132,48%,35%)] mb-4">If Treated Early</h4>
                  <p className="text-3xl font-bold text-[hsl(132,48%,35%)]">
                    Hundreds of dollars
                  </p>
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Season Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
            Carpenter Bee Season in PA &amp; DE
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-[hsl(132,48%,35%)] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Timeframe</th>
                  <th className="px-6 py-4 text-left font-semibold">What's Happening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Mid-April – Early May", "Adults emerge from overwintering tunnels as temperatures reach 65–70°F. Start of carpenter bee season."],
                  ["Late April – May", "Mating occurs. Females search for nest sites and begin boring new tunnels or cleaning out old ones."],
                  ["May – July", "Peak boring and egg-laying season. Females create 6–8 brood cells per gallery. Most structural damage occurs."],
                  ["July – August", "Larvae develop and pupate inside sealed cells."],
                  ["Late July – September", "New adult bees emerge from tunnels and begin feeding on nectar."],
                  ["October – March", "Adults overwinter inside existing galleries. No activity during cold months."]
                ].map(([time, event], i) => (
                  <tr key={time} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 font-semibold text-[hsl(210,13%,28%)] whitespace-nowrap">{time}</td>
                    <td className="px-6 py-4 text-gray-600">{event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-xl font-bold text-[hsl(132,48%,35%)] mb-3">
              Why Spring Is the Critical Treatment Window
            </h3>
            <p className="text-gray-700 mb-3">
              <strong>April and May are the ideal months for treatment.</strong> At this point,
              overwintered adults are concentrated in known galleries — before they mate and
              start new tunnels.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(132,48%,35%)] flex-shrink-0 mt-0.5" />
                Killing one female in spring prevents 6–8 new bees from that gallery this summer.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(132,48%,35%)] flex-shrink-0 mt-0.5" />
                Treating early means fewer galleries to address and a smaller overall infestation.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(132,48%,35%)] flex-shrink-0 mt-0.5" />
                Every week of delay means more eggs laid in more holes.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DIY vs Professional */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
            DIY vs. Professional Treatment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-red-700 mb-4">Why DIY Often Falls Short</h3>
                <ul className="space-y-3">
                  {[
                    "Misidentification — not every large bee is a carpenter bee",
                    "Timing mistakes — sealing holes too early traps bees inside without treatment",
                    "Incomplete treatment — branched tunnels and secondary holes are easy to miss",
                    "Safety concerns — insecticidal dust becomes airborne; ladders needed for eaves",
                    "Product selection — not all insecticides are formulated for tunnel application"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-700">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[hsl(132,48%,35%)] mb-4">Why Professional Treatment Matters</h3>
                <ul className="space-y-3">
                  {[
                    "Correct identification — know what you're dealing with before treatment begins",
                    "Proper product and technique — insecticidal dust applied directly into galleries at the right time of day",
                    "Full gallery treatment — professionals treat the complete tunnel system, not just visible holes",
                    "Safe application at height — eaves, soffits, and second-story locations",
                    "Correct sealing protocol — holes sealed 1–2 weeks after treatment with proper materials",
                    "Follow-up inspection — re-treatment as needed through the season"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-[hsl(132,48%,35%)] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(132,48%,35%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Protect Your Home?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Carpenter bees are active right now in the PA/DE area. Every day you wait is another
            day of boring, another egg laid, another year of compounding damage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ScheduleInspectionModal>
              <Button className="bg-white text-[hsl(132,48%,35%)] hover:bg-green-50 px-8 py-4 text-lg font-bold">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
            <a href={PHONE_HREF}>
              <Button className="bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] px-8 py-4 text-lg font-bold">
                <Phone className="mr-2 h-5 w-5" />
                {PHONE_NUMBER}
              </Button>
            </a>
          </div>
          <p className="mt-6 text-green-200 text-sm">
            Also serving:{" "}
            <Link href="/carpenter-bee-treatment" className="underline hover:text-white">
              View our professional treatment service →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}