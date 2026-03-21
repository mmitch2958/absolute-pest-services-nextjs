import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, Shield, Bug, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function AntWaspControlAvondalePa() {
  const neighborhoods = ["Avondale Borough", "New Garden Township", "London Grove Township", "Penn Township", "Landenberg"];

  const bulletPoints = ["Ant control (carpenter ants, pavement ants, fire ants)","Wasp & hornet nest removal & prevention","Carpenter bee treatment & wood protection","Boxelder bug seasonal treatments","Stink bug prevention & exclusion","Exterior perimeter barrier program","Interior crack & crevice treatment","Seasonal pest prevention plans"];

  const faqs = [{"q":"What ants, wasps, and stinging insects are common in Avondale?","a":"In Avondale, we frequently treat carpenter ants, pavement ants, and odorous house ants. Stinging insects like yellow jackets, paper wasps, and bald-faced hornets are common in summer. Boxelder bugs and carpenter bees are also prevalent seasonal pests. Call us for a free inspection."},{"q":"When should I call for wasp and hornet nest removal in Avondale?","a":"Call as soon as you spot a nest. Wasp and hornet colonies grow rapidly through summer. Early removal is safer and less expensive. We provide same-day or next-day service throughout Avondale and surrounding areas."},{"q":"Do carpenter bees damage homes in Avondale?","a":"Yes. Carpenter bees drill into wood siding, decks, fascia boards, and railings. Over time this causes structural damage and attracts woodpeckers. We treat existing galleries and apply preventive wood treatments to stop re-infestation."},{"q":"How much does ant and wasp control cost in Avondale, PA?","a":"Cost depends on property size, infestation type, and treatment approach. We provide free inspections and transparent quotes before any work begins. Call 484-643-2225 to schedule your inspection."}];

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
        "streetAddress": "21 Sheffield Dr",
        "addressLocality": "West Grove",
        "addressRegion": "PA",
        "postalCode": "19390",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "39.8273",
        "longitude": "-75.7807"
      },
      "areaServed": {
        "@type": "City",
        "name": "Avondale",
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
        "name": "Ant & Wasp Control",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Ant & Wasp Control in Avondale, PA",
              "description": "Comprehensive ant, wasp, hornet, carpenter bee, and boxelder bug control for Avondale, PA homes and businesses."
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
          "name": "What ants, wasps, and stinging insects are common in Avondale?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In Avondale, we frequently treat carpenter ants, pavement ants, and odorous house ants. Stinging insects like yellow jackets, paper wasps, and bald-faced hornets are common in summer. Boxelder bugs and carpenter bees are also prevalent seasonal pests. Call us for a free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "When should I call for wasp and hornet nest removal in Avondale?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Call as soon as you spot a nest. Wasp and hornet colonies grow rapidly through summer. Early removal is safer and less expensive. We provide same-day or next-day service throughout Avondale and surrounding areas."
          }
        },
        {
          "@type": "Question",
          "name": "Do carpenter bees damage homes in Avondale?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Carpenter bees drill into wood siding, decks, fascia boards, and railings. Over time this causes structural damage and attracts woodpeckers. We treat existing galleries and apply preventive wood treatments to stop re-infestation."
          }
        },
        {
          "@type": "Question",
          "name": "How much does ant and wasp control cost in Avondale, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cost depends on property size, infestation type, and treatment approach. We provide free inspections and transparent quotes before any work begins. Call 484-643-2225 to schedule your inspection."
          }
        }
      ]
    }
  ]
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Ant & Wasp Control in Avondale, PA | Absolute Pest Services</title>
        <meta name="description" content="Expert ant, wasp, hornet & carpenter bee control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/ant-wasp-control-avondale-pa/" />
        <meta property="og:title" content="Ant & Wasp Control in Avondale, PA | Absolute Pest Services" />
        <meta property="og:description" content="Expert ant, wasp, hornet & carpenter bee control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225." />
        <meta property="og:url" content="https://absolutepestservices.com/ant-wasp-control-avondale-pa/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4 mr-2" />
            Avondale, PA · Chester County
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ant & Wasp Control in Avondale, PA
          </h1>
          <p className="text-xl text-green-100 mb-4 max-w-3xl mx-auto">
            Ants, Wasps, Hornets, Carpenter Bees & Boxelder Bugs — Eliminated
          </p>
          <p className="text-green-200 mb-8 max-w-2xl mx-auto">
            Avondale's proximity to Brandywine Creek State Park and the agricultural zones of southern Chester County make it a hot zone for boxelder bugs, carpenter bees, wasps, hornets, and stinging insects.
          </p>
          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-green-100">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Licensed &amp; Insured</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> PA &amp; DE Certified</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Free Inspection</span>
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
                Schedule Free Inspection
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ant & Wasp Control in Avondale, PA</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                From carpenter ants tunneling through structural wood to yellow jackets nesting in wall voids, stinging insects and invasive ants cause real damage to Avondale homes and businesses. Boxelder bugs and carpenter bees are equally persistent seasonal invaders. Our technicians use targeted treatments to eliminate active infestations and establish protective barriers — keeping your property pest-free through every season.
              </p>
              <Link href="/pest-control">
                <Button variant="outline" className="px-6 py-3">Pest Control Info →</Button>
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
              Serving Avondale &amp; Surrounding Neighborhoods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our technicians know every neighborhood in and around Avondale, PA.
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
            Why Avondale Trusts Absolute Pest Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Licensed & Certified', body: 'Fully licensed in Pennsylvania and Delaware. All technicians are state-certified pest control applicators.', color: 'bg-[hsl(132,48%,35%)]' },
              { title: 'Locally Owned', body: 'Based in West Grove, PA — your neighbors in pest control. Chester County and New Castle County specialists.', color: 'bg-[hsl(36,100%,47%)]' },
              { title: '5.0 Star Rated', body: 'Consistent 5-star Google reviews from homeowners throughout Avondale and surrounding communities.', color: 'bg-[hsl(207,73%,44%)]' },
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
            Frequently Asked Questions — Ant & Wasp Control in Avondale
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
          <h2 className="text-3xl font-bold text-white mb-4">Wasps, Ants, or Carpenter Bees in Avondale? Act Fast.</h2>
          <p className="text-xl text-green-100 mb-8">Stinging insect colonies and carpenter ant infestations grow quickly. Our Avondale, PA team offers fast scheduling and guaranteed results.</p>
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
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Service Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Other Services We Offer in Avondale, PA
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/termites"><Button variant="outline">Termite Treatment</Button></Link>
            <Link href="/wildlife-control"><Button variant="outline">Wildlife Control</Button></Link>
            <Link href="/pest-control"><Button variant="outline">General Pest Control</Button></Link>
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
                <p className="text-gray-600">21 Sheffield Dr</p>
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
