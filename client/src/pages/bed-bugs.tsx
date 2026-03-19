import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, ThermometerSun, CheckCircle, AlertTriangle } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import ContactForm from "@/components/contact-form";
import { trackPhoneClick, trackCtaClick } from "@/lib/analytics";

const PHONE_NUMBER = "484-643-2225";
const PHONE_HREF = "tel:+14846432225";

export default function BedBugs() {
  useEffect(() => {
    const serviceSchemaEl = document.querySelector('script[data-schema="service-bedbugs"]');
    const faqSchemaEl = document.querySelector('script[data-schema="faq-bedbugs"]');
    const breadcrumbSchemaEl = document.querySelector('script[data-schema="breadcrumb-bedbugs"]');
    [serviceSchemaEl, faqSchemaEl, breadcrumbSchemaEl].forEach(el => el?.remove());

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Bed Bug Exterminator Chester County PA",
      "description": "Professional bed bug extermination and treatment services in Chester County, PA. Heat treatment and chemical treatment options. Free inspection available.",
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
      "serviceType": "Bed Bug Extermination",
      "offers": {
        "@type": "Offer",
        "description": "Free bed bug inspection for Chester County residents",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.setAttribute('data-schema', 'service-bedbugs');
    serviceScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(serviceScript);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does bed bug treatment cost in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bed bug treatment costs in Chester County typically range from $300–$1,500+ per room depending on the treatment method (heat vs. chemical) and severity of infestation. We offer free inspections and transparent, upfront pricing."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best bed bug treatment method?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Heat treatment is considered the gold standard for bed bug elimination because it kills bed bugs at all life stages in a single treatment without chemicals. Chemical treatments are also effective and may be recommended for certain situations. We assess your home and recommend the best approach during your free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "How long does bed bug treatment take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Heat treatments typically take 6–8 hours to treat an entire home. Chemical treatments may require 2–4 hours per room. Most homeowners can return home the same day after treatment."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer bed bug extermination in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Absolute Pest Services provides bed bug extermination throughout Chester County, PA including West Chester, Kennett Square, Malvern, Downingtown, and all surrounding communities."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-bedbugs');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://absolutepestservices.com/" },
        { "@type": "ListItem", "position": 2, "name": "Bed Bug Exterminator Chester County PA", "item": "https://absolutepestservices.com/bed-bugs" }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-bedbugs');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelector('script[data-schema="service-bedbugs"]')?.remove();
      document.querySelector('script[data-schema="faq-bedbugs"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb-bedbugs"]')?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Bed Bug Exterminator Chester County PA | Heat Treatment | Absolute Pest Services</title>
        <meta name="description" content="Professional bed bug exterminator in Chester County, PA. Heat &amp; chemical treatment options. Free bed bug inspection. Same-day service. Serving West Chester, Kennett Square, Malvern &amp; all Chester County. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/bed-bugs" />
        <meta property="og:title" content="Bed Bug Exterminator Chester County PA | Absolute Pest Services" />
        <meta property="og:description" content="Professional bed bug extermination in Chester County, PA. Free inspection. Heat &amp; chemical treatments. Same-day service available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/bed-bugs" />
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
                className="flex items-center gap-2 bg-[hsl(207,73%,44%)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[hsl(207,73%,34%)] transition-colors"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(207,73%,44%)] to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Shield className="h-4 w-4" /> Free Inspection · Same-Day Service Available
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Bed Bug Exterminator Chester County PA
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Eliminate bed bugs completely with professional heat and chemical treatments.
            Serving Chester County, PA — West Chester, Kennett Square, Malvern, Downingtown, and surrounding areas.
            Don't lose another night of sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={PHONE_HREF}
              onClick={() => { trackPhoneClick(PHONE_NUMBER); trackCtaClick('hero-phone', 'bed-bugs-hero'); }}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 text-lg font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Phone className="h-5 w-5" /> Call {PHONE_NUMBER}
            </a>
            <ScheduleInspectionModal>
              <Button
                className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]"
                onClick={() => trackCtaClick('schedule-inspection', 'bed-bugs-hero')}
              >
                <Calendar className="mr-2 h-5 w-5" /> Free Bed Bug Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
            {["Licensed & Insured in PA", "Free Inspection", "Heat Treatment Available", "Same-Day Service", "100% Satisfaction Guarantee"].map(badge => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[hsl(207,73%,44%)]" />
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
                Professional Bed Bug Treatment in Chester County, PA
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Bed bugs are resilient, elusive, and multiply quickly — making DIY treatment rarely effective.
                Chester County residents trust Absolute Pest Services for comprehensive bed bug extermination
                that eliminates infestations at every life stage, from eggs to adults.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our licensed exterminators assess your specific situation and recommend the most effective
                treatment: thermal (heat) treatment for single-treatment elimination, or targeted chemical
                treatment for ongoing protection. We serve all of Chester County, PA and surrounding counties.
              </p>
              <div className="space-y-3">
                {[
                  "Free bed bug inspection & assessment",
                  "Thermal (heat) treatment — kills all life stages",
                  "Chemical treatment programs",
                  "Mattress & furniture treatment",
                  "Follow-up inspections included",
                  "Chester County same-day service available",
                  "Hotel, apartment & multi-unit treatment"
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(207,73%,44%)] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Signs You Have Bed Bugs
                  </h3>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    {[
                      "Itchy, red welts in clusters or lines on skin",
                      "Small blood stains on sheets or pillowcases",
                      "Dark/rusty spots (fecal matter) on bedding",
                      "Musty, sweet odor in bedroom",
                      "Tiny pale yellow eggs or shed skins",
                      "Visible bugs in mattress seams or furniture crevices"
                    ].map(sign => (
                      <li key={sign} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span> {sign}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-blue-900 font-semibold text-sm mb-3">Don't wait — bed bugs multiply fast:</p>
                    <a
                      href={PHONE_HREF}
                      onClick={() => trackPhoneClick(PHONE_NUMBER)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm w-full justify-center"
                    >
                      <Phone className="h-4 w-4" /> {PHONE_NUMBER}
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[hsl(210,13%,28%)] mb-3">
                    Chester County Service Areas
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-sm text-gray-600">
                    {["West Chester", "Kennett Square", "Malvern", "Downingtown", "Coatesville", "Phoenixville",
                      "Exton", "Paoli", "Oxford", "Avondale", "Wayne", "Berwyn"].map(city => (
                      <div key={city} className="flex items-center gap-1.5">
                        <span className="text-[hsl(207,73%,44%)]">✓</span> {city}
                      </div>
                    ))}
                  </div>
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
            <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-4">Bed Bug Treatment Methods</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <ThermometerSun className="h-8 w-8 text-white" />,
                color: "bg-red-500",
                title: "Heat Treatment (Preferred)",
                description: "Thermal treatment raises the entire room temperature to 120°F+ for several hours, killing bed bugs at all life stages — including eggs — in a single treatment. No chemicals, no multiple visits. Most effective option for complete elimination.",
                badges: ["Single Treatment", "No Chemicals", "Kills Eggs"]
              },
              {
                icon: <Shield className="h-8 w-8 text-white" />,
                color: "bg-[hsl(207,73%,44%)]",
                title: "Chemical Treatment",
                description: "Our licensed technicians apply EPA-registered residual insecticides and contact sprays to all harborage areas. Typically requires 2–3 visits spaced 2 weeks apart for complete elimination. More affordable than heat treatment.",
                badges: ["Multi-Visit", "Residual Protection", "Cost-Effective"]
              }
            ].map((method, i) => (
              <Card key={i} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${method.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-2">{method.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {method.badges.map(badge => (
                          <span key={badge} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{badge}</span>
                        ))}
                      </div>
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
          <h2 className="text-3xl font-bold text-[hsl(210,13%,28%)] mb-8 text-center">
            Bed Bug FAQ — Chester County, PA
          </h2>
          <div className="space-y-4">
            {[
              { q: "How much does bed bug treatment cost in Chester County?", a: "Costs range from $300–$1,500+ per room depending on treatment method and severity. Heat treatment for a whole home typically runs $1,200–$3,000. We provide free inspections with transparent, upfront quotes — no surprises." },
              { q: "Will I have to leave my home during treatment?", a: "Yes. Heat treatments require you to leave for 6–8 hours. Chemical treatments require 4 hours minimum. We'll give you detailed preparation instructions and can accommodate your schedule." },
              { q: "How long until bed bugs are completely gone?", a: "Heat treatment typically eliminates bed bugs in a single visit. Chemical treatment usually requires 2–3 treatments over 4–6 weeks. We follow up after treatment to confirm complete elimination." },
              { q: "Can I get rid of bed bugs myself?", a: "DIY bed bug treatment is rarely effective. Bed bugs hide in hard-to-reach places, resist many over-the-counter sprays, and eggs are especially resilient. Professional treatment is the most reliable way to achieve complete elimination." }
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
              { label: "Rodent Control", href: "/rodents" },
              { label: "Wildlife Removal", href: "/wildlife" },
              { label: "Bat Removal", href: "/bat-removal" }
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-[hsl(210,13%,28%)] hover:border-[hsl(207,73%,44%)] hover:text-[hsl(207,73%,44%)] transition-colors text-center"
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
            <h2 className="text-3xl font-bold text-white mb-4">Get Your Free Bed Bug Inspection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Sleep better tonight. Contact Chester County's trusted bed bug exterminators.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center flex-shrink-0">
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
                  onClick={() => trackCtaClick('get-quote', 'bed-bugs-footer')}
                >
                  Get a Free Quote
                </Button>
              </QuoteRequestModal>
              <ScheduleInspectionModal>
                <Button
                  variant="outline"
                  className="w-full border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white/10"
                  onClick={() => trackCtaClick('schedule-inspection', 'bed-bugs-footer')}
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
