import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Home, CheckCircle, AlertTriangle } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import ContactForm from "@/components/contact-form";
import { trackPhoneClick, trackCtaClick } from "@/lib/analytics";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";

export default function Rodents() {
  useEffect(() => {
    const schemas = ['service-rodents', 'faq-rodents', 'breadcrumb-rodents'];
    schemas.forEach(s => document.querySelector(`script[data-schema="${s}"]`)?.remove());

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Mouse & Rat Exterminator Chester County PA",
      "description": "Professional rodent control and extermination in Chester County, PA. Mouse exterminator, rat control, and exclusion services. Protect your home from rodents.",
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
      "serviceType": "Rodent Control",
      "offers": {
        "@type": "Offer",
        "description": "Free rodent inspection for Chester County homeowners",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service-rodents');
    serviceScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(serviceScript);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I get rid of mice in my Chester County home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Getting rid of mice requires a three-step approach: elimination (traps or rodenticide), sanitation (removing food sources and nesting material), and exclusion (sealing entry points). Professional rodent control is most effective because technicians identify all entry points and use placement strategies that DIY methods miss. Call Absolute Pest Services for a free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "How much does rodent control cost in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Rodent control costs in Chester County typically range from $150–$600+ depending on the severity of infestation, property size, and whether exclusion work is needed. We offer free inspections with transparent pricing."
          }
        },
        {
          "@type": "Question",
          "name": "Are rats dangerous?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Rats and mice can carry diseases like hantavirus, salmonella, and leptospirosis. They also chew through electrical wires (creating fire hazards), contaminate food, and can cause significant structural damage. Address rodent infestations promptly."
          }
        },
        {
          "@type": "Question",
          "name": "How do rodents get into my home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mice can squeeze through gaps as small as 1/4 inch. Common entry points include gaps around pipes, utility lines, vents, foundation cracks, and spaces around doors and windows. Our exclusion service identifies and seals all entry points to prevent re-infestation."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-rodents');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Mouse & Rat Exterminator Chester County PA", "item": "https://absolutepestservices.com/rodents" }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-rodents');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      ['service-rodents', 'faq-rodents', 'breadcrumb-rodents'].forEach(s =>
        document.querySelector(`script[data-schema="${s}"]`)?.remove()
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Mouse Exterminator Chester County PA | Rat Control | Absolute Pest Services</title>
        <meta name="description" content="Professional mouse &amp; rat exterminator in Chester County, PA. Rodent control, exclusion &amp; prevention. Free inspection. Serving West Chester, Kennett Square, Malvern &amp; all Chester County. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/rodents" />
        <meta property="og:title" content="Mouse Exterminator Chester County PA | Rat Control | Absolute Pest Services" />
        <meta property="og:description" content="Expert rodent control in Chester County, PA. Mouse exterminator, rat control, exclusion services. Free inspection. Same-day service available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/rodents" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Shield className="h-4 w-4" /> Free Inspection · Same-Day Service Available
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Mouse Exterminator Chester County PA
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional rodent control for Chester County, PA homeowners and businesses. We eliminate mice and rats,
            then seal entry points to prevent them from returning. Serving West Chester, Kennett Square, Malvern,
            Coatesville, and all of Chester County.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={PHONE_HREF}
              onClick={() => { trackPhoneClick(PHONE_NUMBER); trackCtaClick('hero-phone', 'rodents-hero'); }}
              className="inline-flex items-center justify-center gap-2 bg-[hsl(132,48%,35%)] text-white px-8 py-4 text-lg font-bold rounded-lg hover:bg-[hsl(132,48%,25%)] transition-colors shadow-lg"
            >
              <Phone className="h-5 w-5" /> Call {PHONE_NUMBER}
            </a>
            <ScheduleInspectionModal>
              <Button
                className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]"
                onClick={() => trackCtaClick('schedule-inspection', 'rodents-hero')}
              >
                <Calendar className="mr-2 h-5 w-5" /> Free Rodent Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
            {["Licensed & Insured in PA", "Free Inspection", "Exclusion Work Included", "Same-Day Service", "Satisfaction Guaranteed"].map(badge => (
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
                Rodent Control in Chester County, PA
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Mice and rats are more than just a nuisance — they chew electrical wires, contaminate food,
                and spread diseases. Chester County's mix of rural and suburban areas provides ideal habitat
                for rodents, especially as temperatures drop in fall and winter.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Absolute Pest Services uses an integrated rodent management approach: we eliminate active
                infestations, identify and seal all entry points, and provide recommendations to prevent
                future invasions. Our comprehensive exclusion work is what separates professional rodent
                control from temporary fixes.
              </p>
              <div className="space-y-3">
                {[
                  "Free rodent inspection & assessment",
                  "Mouse extermination — trapping & baiting",
                  "Rat control & elimination",
                  "Exclusion work — sealing all entry points",
                  "Attic & crawl space rodent cleanup",
                  "Ongoing rodent prevention programs",
                  "Commercial & residential Chester County service"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(132,48%,35%)] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Signs of Rodents in Your Home
                  </h3>
                  <ul className="space-y-2 text-red-800 text-sm">
                    {[
                      "Droppings along walls, in cabinets or pantry",
                      "Gnaw marks on food packaging, wires, or wood",
                      "Scratching sounds in walls or ceiling at night",
                      "Grease marks along baseboards or walls",
                      "Nesting material (shredded paper, insulation)",
                      "Tracks or footprints in dusty areas"
                    ].map(sign => (
                      <li key={sign} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">⚠</span> {sign}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <p className="text-red-900 font-semibold text-sm mb-3">Act fast — rodents multiply quickly:</p>
                    <a
                      href={PHONE_HREF}
                      onClick={() => trackPhoneClick(PHONE_NUMBER)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm w-full justify-center"
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
                      "Oxford", "Avondale", "Chadds Ford", "Exton", "Paoli", "Honey Brook"].map(city => (
                      <div key={city} className="flex items-center gap-1.5">
                        <span className="text-[hsl(132,48%,35%)]">✓</span> {city}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our 3-Step Process */}
      <section className="py-16 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-4">Our Rodent Control Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A comprehensive approach that eliminates rodents and keeps them out for good.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <Shield className="h-8 w-8 text-white" />,
                color: "bg-gray-700",
                title: "Inspect & Identify",
                description: "Our licensed technician performs a thorough inspection of your property — inside and out — identifying all signs of rodent activity, potential entry points, and contributing conditions."
              },
              {
                step: "2",
                icon: <AlertTriangle className="h-8 w-8 text-white" />,
                color: "bg-red-600",
                title: "Eliminate & Trap",
                description: "We place strategically positioned snap traps, electronic traps, and tamper-resistant rodenticide bait stations (exterior only) to eliminate the active population quickly and safely."
              },
              {
                step: "3",
                icon: <Home className="h-8 w-8 text-white" />,
                color: "bg-[hsl(132,48%,35%)]",
                title: "Exclude & Prevent",
                description: "We seal gaps, cracks, and openings rodents use to enter your home using steel wool, hardware cloth, caulk, and other materials. This is the critical step that prevents re-infestation."
              }
            ].map((step, i) => (
              <Card key={i} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">Step {step.step}</div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-8 text-center">Rodent Control FAQ — Chester County, PA</h2>
          <div className="space-y-4">
            {[
              { q: "How much does rodent control cost in Chester County?", a: "Costs typically range from $150–$600+ for a standard residential treatment. Exclusion work (sealing entry points) may cost additional depending on the scope. We provide free inspections with upfront, transparent pricing." },
              { q: "How long does rodent extermination take?", a: "Initial treatment takes 1–2 hours. Most infestations are controlled within 1–2 weeks. We follow up to verify elimination and adjust traps/bait as needed." },
              { q: "Are rodenticide bait stations safe for pets and children?", a: "We use tamper-resistant bait stations placed only in exterior locations where children and pets cannot access them. We discuss all safety considerations with you before treatment." },
              { q: "What is the difference between mouse and rat control?", a: "While similar, mice and rats have different behaviors, preferred foods, and harborage areas. Our technicians are trained to identify the species correctly and apply the most effective control method for each." }
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
              { label: "Termite Treatment", href: "/termites" },
              { label: "Bed Bug Exterminator", href: "/bed-bugs" },
              { label: "Wildlife Removal", href: "/wildlife" },
              { label: "General Pest Control", href: "/#services" }
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
            <h2 className="text-3xl font-bold text-white mb-4">Schedule Your Free Rodent Inspection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Chester County's trusted mouse &amp; rat exterminators. Fast, effective, guaranteed.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Call for Same-Day Service</div>
                  <a href={PHONE_HREF} onClick={() => trackPhoneClick(PHONE_NUMBER)} className="text-green-300 hover:text-green-200 text-xl font-bold">
                    {PHONE_NUMBER}
                  </a>
                </div>
              </div>
              <QuoteRequestModal>
                <Button
                  className="w-full bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]"
                  onClick={() => trackCtaClick('get-quote', 'rodents-footer')}
                >
                  Get a Free Quote
                </Button>
              </QuoteRequestModal>
              <ScheduleInspectionModal>
                <Button
                  variant="outline"
                  className="w-full border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white/10"
                  onClick={() => trackCtaClick('schedule-inspection', 'rodents-footer')}
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
