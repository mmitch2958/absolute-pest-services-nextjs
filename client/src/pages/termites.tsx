import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Search, AlertTriangle, CheckCircle, Bug } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import ContactForm from "@/components/contact-form";
import { trackPhoneClick, trackCtaClick } from "@/lib/analytics";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";

export default function Termites() {
  useEffect(() => {
    // Remove existing schemas on unmount to avoid duplicates
    const serviceSchemaEl = document.querySelector('script[data-schema="service-termites"]');
    const faqSchemaEl = document.querySelector('script[data-schema="faq-termites"]');
    const breadcrumbSchemaEl = document.querySelector('script[data-schema="breadcrumb-termites"]');
    [serviceSchemaEl, faqSchemaEl, breadcrumbSchemaEl].forEach(el => el?.remove());

    // Service schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Termite Treatment Chester County PA",
      "description": "Professional termite inspection, treatment, and prevention services in Chester County, PA. Subterranean and drywood termite control using proven methods.",
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
      "serviceType": "Termite Treatment",
      "offers": {
        "@type": "Offer",
        "description": "Free termite inspection for Chester County homeowners",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service-termites');
    serviceScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(serviceScript);

    // FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does termite treatment cost in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Termite treatment costs in Chester County typically range from $500–$3,000+ depending on the severity of the infestation, treatment method (liquid barrier, baiting system, fumigation), and the size of your home. We offer free inspections to provide an accurate quote."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know if I have termites?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Common signs of termites include mud tubes along your foundation, hollow-sounding wood, discarded wings near windows/doors, frass (termite droppings), and visibly damaged wood. If you see any of these signs in Chester County, PA, call Absolute Pest Services immediately."
          }
        },
        {
          "@type": "Question",
          "name": "What termite treatment methods do you use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We use a combination of liquid termiticide barriers (Termidor®), termite baiting systems (Sentricon®), and wood treatments. The best method depends on your specific situation, which we assess during your free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer termite inspections in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Absolute Pest Services provides free termite inspections throughout Chester County, PA, including West Chester, Kennett Square, Malvern, Coatesville, and surrounding areas."
          }
        },
        {
          "@type": "Question",
          "name": "How long does termite treatment take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A standard liquid termiticide treatment typically takes 1–3 hours depending on home size. Baiting system installation takes about 1–2 hours. Results can be seen within days, with full colony elimination typically taking a few months for bait systems."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-termites');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    // Breadcrumb schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Termite Treatment Chester County PA", "item": "https://absolutepestservices.com/termites" }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-termites');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelector('script[data-schema="service-termites"]')?.remove();
      document.querySelector('script[data-schema="faq-termites"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb-termites"]')?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Termite Treatment Chester County PA | Free Inspection | Absolute Pest Services</title>
        <meta name="description" content="Expert termite treatment in Chester County, PA. Free termite inspection. Licensed termite exterminators serving West Chester, Kennett Square, Malvern &amp; all of Chester County. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/termites" />
        <meta property="og:title" content="Termite Treatment Chester County PA | Free Inspection | Absolute Pest Services" />
        <meta property="og:description" content="Expert termite treatment in Chester County, PA. Free termite inspection. Licensed exterminators. Same-day service available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/termites" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <AbsoluteLogoSimple />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'} className="hidden sm:flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Home
              </Button>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm text-gray-500">Same-Day Service Available</span>
                <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">{PHONE_NUMBER}</span>
              </div>
              <a
                href={PHONE_HREF}
                onClick={() => trackPhoneClick(PHONE_NUMBER)}
                className="flex items-center gap-2 bg-[hsl(132,48%,35%)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[hsl(132,48%,25%)] transition-colors"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(36,100%,47%)] to-orange-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <AlertTriangle className="h-4 w-4" /> Free Inspection — No Obligation
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Termite Treatment Chester County PA
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Professional termite inspection and treatment serving Chester County, PA. Licensed termite
            exterminators protecting West Chester, Kennett Square, Malvern, Coatesville, and all of Chester County.
            Same-day service available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={PHONE_HREF}
              onClick={() => { trackPhoneClick(PHONE_NUMBER); trackCtaClick('hero-phone', 'termites-hero'); }}
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 px-8 py-4 text-lg font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              <Phone className="h-5 w-5" /> Call {PHONE_NUMBER}
            </a>
            <ScheduleInspectionModal>
              <Button
                className="bg-[hsl(210,13%,28%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(210,13%,18%)]"
                onClick={() => trackCtaClick('schedule-inspection', 'termites-hero')}
              >
                <Calendar className="mr-2 h-5 w-5" /> Free Termite Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
            {["Licensed & Insured in PA", "Free Termite Inspection", "Same-Day Service", "Satisfaction Guaranteed", "20+ Years Experience"].map(badge => (
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
                Expert Termite Treatment in Chester County, PA
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Termites cause more than $5 billion in property damage across the U.S. every year — and Chester
                County, PA homeowners are not immune. Subterranean termites thrive in Pennsylvania's soil and can
                silently destroy the structural integrity of your home for years before you notice.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Absolute Pest Services provides comprehensive termite inspection, treatment, and prevention
                throughout Chester County, PA. Our state-licensed technicians use proven methods including liquid
                termiticide barriers (Termidor®) and monitoring/baiting systems (Sentricon®) to eliminate
                termite colonies and protect your investment.
              </p>
              <div className="space-y-3">
                {[
                  "Free termite inspection for Chester County homeowners",
                  "Subterranean & drywood termite treatment",
                  "Liquid termiticide barrier applications",
                  "Termite baiting & monitoring systems",
                  "Pre-construction termite treatments",
                  "Real estate WDI (Wood Destroying Insect) reports",
                  "Annual termite inspection programs"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(132,48%,35%)] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Warning signs card */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Warning Signs of Termites
                  </h3>
                  <ul className="space-y-2 text-orange-800 text-sm">
                    {[
                      "Mud tubes along foundation walls or pipes",
                      "Hollow-sounding or damaged wood",
                      "Discarded wings near doors or windows",
                      "Small pellets or frass (termite droppings)",
                      "Bubbling or uneven paint on walls",
                      "Doors/windows that suddenly don't close properly"
                    ].map(sign => (
                      <li key={sign} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">⚠</span> {sign}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-orange-900 font-semibold text-sm mb-3">Seeing these signs? Call us now:</p>
                    <a
                      href={PHONE_HREF}
                      onClick={() => trackPhoneClick(PHONE_NUMBER)}
                      className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm w-full justify-center"
                    >
                      <Phone className="h-4 w-4" /> {PHONE_NUMBER}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Service area card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[hsl(210,13%,28%)] mb-3">
                    Chester County Termite Service Areas
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-sm text-gray-600">
                    {["West Chester", "Kennett Square", "Malvern", "Coatesville", "Downingtown", "Phoenixville",
                      "Oxford", "Avondale", "Chadds Ford", "Exton", "Paoli", "Wayne"].map(city => (
                      <div key={city} className="flex items-center gap-1.5">
                        <span className="text-[hsl(132,48%,35%)]">✓</span> {city}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">And all surrounding Chester County communities</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-16 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-4">Our Termite Treatment Methods</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We tailor our approach to your specific situation — whether you have an active infestation
              or want to protect against future termite damage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-white" />,
                color: "bg-orange-500",
                title: "Liquid Termiticide Barrier",
                description: "Termidor® liquid treatments create a continuous barrier in the soil around your home's foundation. Termites pass through the treated zone and unknowingly spread the treatment to the colony."
              },
              {
                icon: <Search className="h-8 w-8 text-white" />,
                color: "bg-[hsl(132,48%,35%)]",
                title: "Baiting & Monitoring System",
                description: "Sentricon® stations are installed around your property, attracting termites to slow-acting bait that's shared throughout the colony, eliminating the queen and workers over time."
              },
              {
                icon: <Bug className="h-8 w-8 text-white" />,
                color: "bg-[hsl(207,73%,44%)]",
                title: "Wood Treatment & Repair",
                description: "For accessible infested wood, we apply targeted termiticides and can advise on structural repairs. We also offer pre-construction soil treatments to protect new builds."
              }
            ].map((method, i) => (
              <Card key={i} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">{method.title}</h3>
                  <p className="text-gray-600 text-sm">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-8 text-center">
            Termite Treatment FAQ — Chester County, PA
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How much does termite treatment cost in Chester County, PA?",
                a: "Termite treatment costs in Chester County typically range from $500–$3,000+ depending on the severity of the infestation, treatment method, and home size. We offer free inspections to provide an accurate, no-obligation quote."
              },
              {
                q: "How do I know if I have termites?",
                a: "Common signs include mud tubes along your foundation, hollow-sounding wood, discarded wings near windows/doors, frass (termite droppings), and visibly damaged wood. If you spot any of these, call us immediately for a free inspection."
              },
              {
                q: "How long does termite treatment take?",
                a: "A standard liquid termiticide treatment takes 1–3 hours. Baiting system installation takes about 1–2 hours. Results begin within days, with full colony elimination typically taking a few months for bait systems."
              },
              {
                q: "Do you offer termite warranties?",
                a: "Yes. We offer renewable annual termite warranties with regular inspections to ensure your home stays protected. Contact us for details on our warranty programs."
              }
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

      {/* Internal links to related pages */}
      <section className="py-12 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[hsl(210,13%,28%)] mb-6 text-center">Related Pest Control Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Bed Bug Treatment", href: "/bed-bugs" },
              { label: "Rodent Control", href: "/rodents" },
              { label: "Wildlife Removal", href: "/wildlife" },
              { label: "Bat Removal", href: "/bat-removal" }
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-[hsl(210,13%,28%)] hover:border-[hsl(132,48%,35%)] hover:text-[hsl(132,48%,35%)] transition-colors text-center"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + CTA */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get Your Free Termite Inspection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Protecting Chester County, PA homes from termites for over 20 years. Schedule your free inspection today.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                  onClick={() => trackCtaClick('get-quote', 'termites-footer')}
                >
                  Get a Free Quote
                </Button>
              </QuoteRequestModal>
              <ScheduleInspectionModal>
                <Button
                  variant="outline"
                  className="w-full border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white/10"
                  onClick={() => trackCtaClick('schedule-inspection', 'termites-footer')}
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
