import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, Shield, Bug, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function TermiteControlCoatesvillePa() {
  const neighborhoods = ["Coatesville City","Valley Township","Caln Township","South Coatesville","Modena"];

  const bulletPoints = ["Free termite inspections for Coatesville homeowners","Sentricon® Colony Elimination System","Liquid barrier treatment (Termidor®)","Wood treatment & localized borate applications","Pre-construction soil treatment","Annual inspection & warranty programs","Termite damage assessment","Real estate inspection letters (WDO)"];

  const faqs = [{"q":"How do I know if my Coatesville home has termites?","a":"Common signs include mud tubes along foundation walls, hollow-sounding wood, discarded wings near windows, and frass (termite droppings). Our inspection will confirm whether termites are present."},{"q":"What termite treatment method works best for Coatesville properties?","a":"We typically recommend the Sentricon® bait system for long-term colony elimination, or Termidor® liquid barrier for active infestations requiring faster knockdown. We'll recommend the right solution after inspection."},{"q":"How long does termite treatment take in Coatesville?","a":"Liquid barrier treatments are completed in a few hours. Sentricon® bait station installation takes 2–4 hours. Colony elimination typically occurs within 3 months of Sentricon® activation."},{"q":"Do you provide termite letters for real estate sales in Coatesville, PA?","a":"Yes. We perform Wood Destroying Organism (WDO) inspections and issue official inspection reports needed for Coatesville real estate transactions. Call to schedule promptly as closings often have tight timelines."}];

  const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "Absolute Pest Services",
      "telephone": "484-643-2225",
      "url": "https://absolutepestservices.com",
      "image": "https://absolutepestservices.com/og-image.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "PO Box 8059",
        "addressLocality": "West Grove",
        "addressRegion": "PA",
        "postalCode": "19390",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "39.9834",
        "longitude": "-75.8238"
      },
      "areaServed": {
        "@type": "City",
        "name": "Coatesville",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Chester County",
          "containedInPlace": {
            "@type": "State",
            "name": "Pennsylvania"
          }
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Termite Control",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Termite Control in Coatesville, PA",
              "description": "Subterranean termites cause billions in property damage annually — and Coatesville, PA properties are not immune. With aging housing stock and proximity to the Brandywine Creek watershed, the soil con"
            }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I know if my Coatesville home has termites?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Common signs include mud tubes along foundation walls, hollow-sounding wood, discarded wings near windows, and frass (termite droppings). Our inspection will confirm whether termites are present."
          }
        },
        {
          "@type": "Question",
          "name": "What termite treatment method works best for Coatesville properties?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We typically recommend the Sentricon® bait system for long-term colony elimination, or Termidor® liquid barrier for active infestations requiring faster knockdown. We'll recommend the right solution after inspection."
          }
        },
        {
          "@type": "Question",
          "name": "How long does termite treatment take in Coatesville?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Liquid barrier treatments are completed in a few hours. Sentricon® bait station installation takes 2–4 hours. Colony elimination typically occurs within 3 months of Sentricon® activation."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide termite letters for real estate sales in Coatesville, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We perform Wood Destroying Organism (WDO) inspections and issue official inspection reports needed for Coatesville real estate transactions. Call to schedule promptly as closings often have tight timelines."
          }
        }
      ]
    }
  ]
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Termite Control in Coatesville, PA | Absolute Pest Services</title>
        <meta name="description" content="Expert termite control in Coatesville, PA. Licensed & insured. Serving Chester County. Inspection available. Call 484-643-2225 for fast service." />
        <link rel="canonical" href="https://absolutepestservices.com/termite-control-coatesville-pa/" />
        <meta property="og:title" content="Termite Control in Coatesville, PA | Absolute Pest Services" />
        <meta property="og:description" content="Expert termite control in Coatesville, PA. Licensed & insured. Serving Chester County. Inspection available. Call 484-643-2225 for fast service." />
        <meta property="og:url" content="https://absolutepestservices.com/termite-control-coatesville-pa/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4 mr-2" />
            Coatesville, PA · Chester County
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Termite Control & Treatment in Coatesville, PA
          </h1>
          <p className="text-xl text-green-100 mb-4 max-w-3xl mx-auto">
            Protect Your Investment from Silent Wood Destroyers
          </p>
          <p className="text-green-200 mb-8 max-w-2xl mx-auto">
            Coatesville's historic neighborhoods and industrial heritage mean older building stock that is particularly vulnerable to rodent infiltration, termite damage, and wildlife intrusion.
          </p>
          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-green-100">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Licensed &amp; Insured</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> PA &amp; DE Certified</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Inspection</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 5.0★ Rated</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 24/7 Emergency</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+14846432225"
              className="inline-flex items-center justify-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 484-643-2225
            </a>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                Schedule Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Termite Control in Coatesville, PA</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Subterranean termites cause billions in property damage annually — and Coatesville, PA properties are not immune. With aging housing stock and proximity to the Brandywine Creek watershed, the soil conditions and moisture levels in Coatesville create ideal termite habitat. Our termite inspections and Sentricon® Colony Elimination treatments stop termite colonies at the source before they compromise your home's structural integrity.
              </p>
              <Link href="/termites">
                <Button variant="outline" className="px-6 py-3">Termite Treatment Info →</Button>
              </Link>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="space-y-3">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Serving Coatesville &amp; Surrounding Neighborhoods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our technicians know every neighborhood in and around Coatesville, PA.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {neighborhoods.map((area, i) => (
              <Card key={i} className="bg-emerald-50 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{area}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Don't see your neighborhood? We likely serve it — call to confirm.
          </p>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Why Coatesville Trusts Absolute Pest Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Licensed & Certified', body: 'Fully licensed in Pennsylvania and Delaware. All technicians are state-certified pest control applicators.', color: 'bg-[hsl(132,48%,35%)]' },
              { title: 'Locally Owned', body: 'Based in West Grove, PA — your neighbors in pest control. Chester County and New Castle County specialists.', color: 'bg-[hsl(36,100%,47%)]' },
              { title: '5.0 Star Rated', body: 'Consistent 5-star Google reviews from homeowners throughout Coatesville and surrounding communities.', color: 'bg-[hsl(207,73%,44%)]' },
              { title: '24/7 Emergency', body: 'Pest emergencies do not keep business hours. Our team is available around the clock for urgent situations.', color: 'bg-[hsl(132,48%,25%)]' },
            ].map((card, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Frequently Asked Questions — Termite Control in Coatesville
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg p-6 bg-emerald-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Protect Your Coatesville Home from Termites</h2>
          <p className="text-xl text-green-100 mb-8">Termite damage is rarely covered by homeowners insurance. Don't wait for signs — proactive termite protection for your Coatesville, PA property starts with a inspection.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+14846432225"
              className="inline-flex items-center justify-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 484-643-2225
            </a>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                Schedule Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Service Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Other Services We Offer in Coatesville, PA
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/termites"><Button variant="outline">Termite Treatment</Button></Link>
            <Link href="/wildlife-control"><Button variant="outline">Wildlife Control</Button></Link>
            <Link href="/pest-control"><Button variant="outline">Ant &amp; Wasp Control</Button></Link>
            <Link href="/rodents"><Button variant="outline">Rodent Control</Button></Link>
            <Link href="/bat-removal"><Button variant="outline">Bat Removal</Button></Link>
            <Link href="/service-areas"><Button variant="outline">All Service Areas</Button></Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-2xl font-bold text-[hsl(132,48%,35%)]">484-643-2225</p>
                <p className="text-gray-600 mt-2">24/7 Emergency Service</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hours</h3>
                <p className="text-gray-600">Mon–Fri: 8:00 AM – 5:00 PM</p>
                <p className="text-gray-600">Sat: 8:00 AM – 12:00 PM</p>
                <p className="text-gray-600">Sun: Emergency Only</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Main Office</h3>
                <p className="text-gray-600">PO Box 8059</p>
                <p className="text-gray-600">West Grove, PA 19390</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
