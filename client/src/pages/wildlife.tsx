import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Heart, CheckCircle, AlertTriangle } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import ContactForm from "@/components/contact-form";
import { trackPhoneClick, trackCtaClick } from "@/lib/analytics";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";

export default function Wildlife() {
  useEffect(() => {
    const schemas = ['service-wildlife-lp', 'faq-wildlife-lp', 'breadcrumb-wildlife-lp'];
    schemas.forEach(s => document.querySelector(`script[data-schema="${s}"]`)?.remove());

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Wildlife Removal Chester County PA",
      "description": "Professional wildlife removal and exclusion services in Chester County, PA. Humane raccoon removal, squirrel removal, groundhog control, and more. Free inspection available.",
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
        "telephone": "+1-484-643-2225",
        "url": "https://absolutepestservices.com"
      },
      "areaServed": [
        { "@type": "AdministrativeArea", "name": "Chester County", "containedInPlace": { "@type": "State", "name": "Pennsylvania" } },
        { "@type": "AdministrativeArea", "name": "Delaware County", "containedInPlace": { "@type": "State", "name": "Pennsylvania" } },
        { "@type": "AdministrativeArea", "name": "Montgomery County", "containedInPlace": { "@type": "State", "name": "Pennsylvania" } },
        { "@type": "AdministrativeArea", "name": "New Castle County", "containedInPlace": { "@type": "State", "name": "Delaware" } }
      ],
      "serviceType": "Wildlife Removal",
      "offers": {
        "@type": "Offer",
        "description": "Free wildlife inspection for Chester County homeowners",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service-wildlife-lp');
    serviceScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(serviceScript);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do you remove raccoons from my Chester County home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We use humane live traps to safely capture raccoons, then relocate them to appropriate habitat away from your property. After removal, we identify and seal all entry points to prevent raccoons from returning. Call us for a free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "Is wildlife removal in Chester County PA legal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Absolute Pest Services is fully licensed by the Pennsylvania Game Commission for wildlife control operations. All our methods comply with state and federal wildlife regulations. We use humane, legal removal methods only."
          }
        },
        {
          "@type": "Question",
          "name": "How much does wildlife removal cost in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Wildlife removal costs in Chester County typically range from $200–$1,000+ depending on the species, severity, and exclusion work needed. We provide free inspections with upfront, transparent pricing."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer raccoon removal in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We provide professional raccoon removal throughout Chester County, PA including West Chester, Kennett Square, Malvern, and surrounding areas. We also remove squirrels, groundhogs, opossums, skunks, and other nuisance wildlife."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-wildlife-lp');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Wildlife Removal Chester County PA", "item": "https://absolutepestservices.com/wildlife" }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-wildlife-lp');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      ['service-wildlife-lp', 'faq-wildlife-lp', 'breadcrumb-wildlife-lp'].forEach(s =>
        document.querySelector(`script[data-schema="${s}"]`)?.remove()
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Wildlife Removal Chester County PA | Raccoon Removal | Absolute Pest Services</title>
        <meta name="description" content="Professional wildlife removal in Chester County, PA. Humane raccoon removal, squirrel removal, groundhog control &amp; more. Licensed PA wildlife control. Free inspection. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/wildlife" />
        <meta property="og:title" content="Wildlife Removal Chester County PA | Raccoon Removal | Absolute Pest Services" />
        <meta property="og:description" content="Humane wildlife removal in Chester County, PA. Raccoon removal, squirrel control, groundhog removal. Licensed & insured. Free inspection." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/wildlife" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,20%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Heart className="h-4 w-4" /> Humane Methods Only · Free Inspection
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Wildlife Removal Chester County PA
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Licensed, humane wildlife removal services for Chester County, PA homeowners and businesses.
            We safely remove raccoons, squirrels, groundhogs, opossums, skunks, and more — then seal entry
            points to keep them out for good.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={PHONE_HREF}
              onClick={() => { trackPhoneClick(PHONE_NUMBER); trackCtaClick('hero-phone', 'wildlife-hero'); }}
              className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-4 text-lg font-bold rounded-lg hover:bg-green-50 transition-colors shadow-lg"
            >
              <Phone className="h-5 w-5" /> Call {PHONE_NUMBER}
            </a>
            <ScheduleInspectionModal>
              <Button
                className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]"
                onClick={() => trackCtaClick('schedule-inspection', 'wildlife-hero')}
              >
                <Calendar className="mr-2 h-5 w-5" /> Free Wildlife Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
            {["PA Game Commission Licensed", "Humane Methods Only", "Free Inspection", "24/7 Emergency Service", "Exclusion Work Guaranteed"].map(badge => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[hsl(132,48%,35%)]" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Description */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-6">
                Humane Wildlife Removal in Chester County, PA
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Chester County's diverse landscape — from agricultural fields to suburban neighborhoods — provides
                habitat for a wide variety of wildlife. When animals invade your attic, crawl space, chimney, or
                yard, professional removal is the safest and most effective solution.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Absolute Pest Services is licensed by the Pennsylvania Game Commission for wildlife control.
                We use exclusively humane, non-lethal methods — live trapping and relocation — to safely
                remove nuisance wildlife while protecting both your property and the animals. After removal,
                we identify and seal all entry points to prevent future intrusions.
              </p>
              <div className="space-y-3">
                {[
                  "Raccoon removal & exclusion",
                  "Squirrel removal from attics & walls",
                  "Groundhog / woodchuck removal",
                  "Opossum removal",
                  "Skunk removal (odor-free methods)",
                  "Attic restoration & cleanup",
                  "24/7 emergency wildlife service"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(132,48%,35%)] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Signs of Wildlife in Your Home
                  </h3>
                  <ul className="space-y-2 text-green-800 text-sm">
                    {[
                      "Scratching, thumping, or chittering sounds in attic/walls",
                      "Visible damage to soffits, fascia, or roof edges",
                      "Droppings or urine odors in attic or crawl space",
                      "Holes or gnaw marks around eaves or foundation",
                      "Disturbed insulation in attic",
                      "Chimney sounds or blocked flue"
                    ].map(sign => (
                      <li key={sign} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">⚠</span> {sign}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-green-900 font-semibold text-sm mb-3">Wildlife causes serious damage — act fast:</p>
                    <a
                      href={PHONE_HREF}
                      onClick={() => trackPhoneClick(PHONE_NUMBER)}
                      className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-800 transition-colors text-sm w-full justify-center"
                    >
                      <Phone className="h-4 w-4" /> {PHONE_NUMBER}
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[hsl(210,13%,28%)] mb-3">Chester County Service Areas</h3>
                  <div className="grid grid-cols-2 gap-1.5 text-sm text-gray-600">
                    {["West Chester", "Kennett Square", "Malvern", "Coatesville", "Downingtown", "Phoenixville",
                      "Oxford", "Avondale", "Chadds Ford", "Exton", "Paoli", "Unionville"].map(city => (
                      <div key={city} className="flex items-center gap-1.5">
                        <span className="text-[hsl(132,48%,35%)]">✓</span> {city}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Also serving Delaware, Montgomery &amp; New Castle counties</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Wildlife We Remove */}
      <section className="py-16 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-4">Wildlife We Remove in Chester County</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We handle all common nuisance wildlife species in Chester County, PA using humane, state-licensed methods.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Raccoons", description: "Attic, chimney & crawl space invasions. Carry rabies & roundworm." },
              { name: "Squirrels", description: "Attic & wall nesting. Chew wiring — serious fire hazard." },
              { name: "Groundhogs", description: "Burrow under foundations, decks & sheds. Structural damage." },
              { name: "Opossums", description: "Under porches & sheds. Contaminate with droppings." },
              { name: "Skunks", description: "Burrowing & spray risk. Carriers of rabies." },
              { name: "Birds & Bats", description: "Attic roosting, chimney nesting. Health & damage concerns." }
            ].map((animal, i) => (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(210,13%,28%)] mb-1">{animal.name}</h3>
                      <p className="text-gray-600 text-sm">{animal.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-8 text-center">Wildlife Removal FAQ — Chester County, PA</h2>
          <div className="space-y-4">
            {[
              { q: "Is wildlife removal humane?", a: "Yes. We exclusively use live trapping and humane relocation. We never use lethal methods. Animals are safely captured and relocated to appropriate habitat away from your property." },
              { q: "How much does wildlife removal cost in Chester County?", a: "Costs range from $200–$1,000+ depending on species, severity, and exclusion work needed. We provide free inspections with transparent, no-obligation quotes." },
              { q: "Do you offer raccoon removal in Chester County?", a: "Yes — raccoon removal is one of our most common services throughout Chester County, PA. We trap, remove, and seal entry points to prevent raccoons from returning." },
              { q: "What is exclusion work?", a: "Exclusion is the process of sealing all potential entry points (gaps in soffits, vents, fascia, etc.) so wildlife cannot re-enter your home after removal. This is essential for a long-term solution and is included in our service." }
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[hsl(210,13%,28%)] mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-12 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[hsl(210,13%,28%)] mb-6 text-center">Related Pest Control Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Bat Removal", href: "/bat-removal" },
              { label: "Rodent Control", href: "/rodents" },
              { label: "Termite Treatment", href: "/termites" },
              { label: "Bed Bug Exterminator", href: "/bed-bugs" }
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-center bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-[hsl(210,13%,28%)] hover:border-[hsl(132,48%,35%)] hover:text-[hsl(132,48%,35%)] transition-colors text-center"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Schedule Your Free Wildlife Inspection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Chester County's licensed, humane wildlife removal experts. Fast response. Guaranteed results.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Call for Emergency Service</div>
                  <a href={PHONE_HREF} onClick={() => trackPhoneClick(PHONE_NUMBER)} className="text-green-300 hover:text-green-200 text-xl font-bold">
                    {PHONE_NUMBER}
                  </a>
                </div>
              </div>
              <QuoteRequestModal>
                <Button
                  className="w-full bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]"
                  onClick={() => trackCtaClick('get-quote', 'wildlife-footer')}
                >
                  Get a Free Quote
                </Button>
              </QuoteRequestModal>
              <ScheduleInspectionModal>
                <Button
                  variant="outline"
                  className="w-full border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white/10"
                  onClick={() => trackCtaClick('schedule-inspection', 'wildlife-footer')}
                >
                  <Calendar className="mr-2 h-5 w-5" /> Schedule Free Inspection
                </Button>
              </ScheduleInspectionModal>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
